<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdController extends Controller
{
    private function formatAd(Ad $ad): array
    {
        $ad->loadMissing('service');

        $data = $ad->toArray();

        $normalPrice = $ad->service?->price;
        $promoPrice = $ad->promo_price;

        $data['normal_price'] = $normalPrice;
        $data['service_name'] = $ad->service?->title;
        $data['service_price'] = $normalPrice;

        $normal = (float) ($normalPrice ?? 0);
        $promo = (float) ($promoPrice ?? 0);

        $data['image_url'] = $ad->image_path
            ? '/storage/' . ltrim($ad->image_path, '/')
            : null;

        $data['discount_amount'] = (
            $normal > 0 && $promo > 0 && $promo < $normal
        ) ? round($normal - $promo, 2) : 0;

        $data['discount_percentage'] = (
            $normal > 0 && $promo > 0 && $promo < $normal
        ) ? round((($normal - $promo) / $normal) * 100, 2) : 0;

        return $data;
    }

    private function validatePromoPrice(?float $promoPrice, ?float $normalPrice): void
    {
        if (
            $promoPrice !== null &&
            $promoPrice > 0 &&
            $normalPrice !== null &&
            $promoPrice > $normalPrice
        ) {
            throw ValidationException::withMessages([
                'promo_price' => 'Harga promo tidak boleh lebih besar dari harga tetap layanan.',
            ]);
        }
    }

    private function deleteImageIfUnused(?string $path): void
    {
        if (!$path) {
            return;
        }

        $adReferenceExists = Ad::where('image_path', $path)->exists();

        $legacyReferenceExists = DB::table('site_contents')
            ->whereIn('key', ['ad_1_image_path', 'ad_2_image_path'])
            ->where('content', $path)
            ->exists();

        if (!$adReferenceExists && !$legacyReferenceExists) {
            Storage::disk('public')->delete($path);
        }
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'slot' => ['nullable', 'integer', Rule::in([1, 2])],
        ]);

        $ads = Ad::query()
            ->with('service:id,title,price')
            ->when(
                isset($validated['slot']),
                fn ($query) => $query->where('slot', $validated['slot'])
            )
            ->orderBy('slot')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar iklan berhasil diambil.',
            'data' => $ads->map(fn (Ad $ad) => $this->formatAd($ad)),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'slot' => ['required', 'integer', Rule::in([1, 2])],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'promo_price' => ['nullable', 'numeric', 'min:0'],
            'discount_type' => ['nullable', Rule::in(['percent', 'amount'])],
            'discount_value' => ['nullable', 'numeric', 'min:0'],
            'button_text' => ['nullable', 'string', 'max:100'],
            'button_url' => ['nullable', 'url', 'max:2048'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $service = Service::query()
            ->where('is_active', true)
            ->findOrFail($validated['service_id']);

        if ($service->price === null) {
            throw ValidationException::withMessages([
                'service_id' => 'Layanan yang dipilih belum memiliki harga tetap.',
            ]);
        }

        $this->validatePromoPrice(
            isset($validated['promo_price']) ? (float) $validated['promo_price'] : null,
            (float) $service->price
        );

        $imagePath = $request->file('image')->store('ads', 'public');

        if (!$imagePath) {
            return response()->json([
                'success' => false,
                'message' => 'Gambar iklan gagal disimpan.',
            ], 500);
        }

        unset($validated['image']);

        $validated['normal_price'] = $service->price;
        $validated['image_path'] = $imagePath;

        $ad = Ad::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Iklan berhasil ditambahkan.',
            'data' => $this->formatAd($ad),
        ], 201);
    }

    public function show(Ad $ad)
    {
        return response()->json([
            'success' => true,
            'data' => $this->formatAd($ad),
        ]);
    }

    public function update(Request $request, Ad $ad)
    {
        $validated = $request->validate([
            'service_id' => ['sometimes', 'required', 'integer', 'exists:services,id'],
            'slot' => ['sometimes', 'required', 'integer', Rule::in([1, 2])],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'promo_price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'discount_type' => ['nullable', Rule::in(['percent', 'amount'])],
            'discount_value' => ['nullable', 'numeric', 'min:0'],
            'button_text' => ['nullable', 'string', 'max:100'],
            'button_url' => ['nullable', 'url', 'max:2048'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $serviceId = $validated['service_id'] ?? $ad->service_id;

        $service = Service::query()
            ->where('is_active', true)
            ->find($serviceId);

        if (!$service) {
            throw ValidationException::withMessages([
                'service_id' => 'Layanan terkait tidak ditemukan atau tidak aktif.',
            ]);
        }

        if ($service->price === null) {
            throw ValidationException::withMessages([
                'service_id' => 'Layanan yang dipilih belum memiliki harga tetap.',
            ]);
        }

        $promoPrice = array_key_exists('promo_price', $validated)
            ? ($validated['promo_price'] !== null ? (float) $validated['promo_price'] : null)
            : ($ad->promo_price !== null ? (float) $ad->promo_price : null);

        $this->validatePromoPrice($promoPrice, (float) $service->price);

        $oldImagePath = $ad->image_path;

        if ($request->hasFile('image')) {
            $newImagePath = $request->file('image')->store('ads', 'public');

            if (!$newImagePath) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gambar iklan gagal disimpan.',
                ], 500);
            }

            $validated['image_path'] = $newImagePath;
        }

        unset($validated['image']);

        $validated['service_id'] = $service->id;
        $validated['normal_price'] = $service->price;

        $ad->update($validated);

        if ($request->hasFile('image') && $oldImagePath !== $ad->image_path) {
            $this->deleteImageIfUnused($oldImagePath);
        }

        return response()->json([
            'success' => true,
            'message' => 'Iklan berhasil diperbarui.',
            'data' => $this->formatAd($ad->fresh()),
        ]);
    }

    public function destroy(Ad $ad)
    {
        $imagePath = $ad->image_path;

        $ad->delete();

        $this->deleteImageIfUnused($imagePath);

        return response()->json([
            'success' => true,
            'message' => 'Iklan berhasil dihapus.',
        ]);
    }
}