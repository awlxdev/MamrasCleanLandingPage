<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PublicAdController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'slot' => ['nullable', 'integer', Rule::in([1, 2])],
        ]);

        $ads = Ad::query()
            ->with('service:id,title,price')
            ->where('is_active', true)
            ->when(
                isset($validated['slot']),
                fn ($query) => $query->where('slot', $validated['slot'])
            )
            ->orderBy('slot')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $data = $ads->map(function (Ad $ad) {
            $item = $ad->toArray();

            $normalPrice = $ad->service?->price;
            $promoPrice = $ad->promo_price;

            $normal = (float) ($normalPrice ?? 0);
            $promo = (float) ($promoPrice ?? 0);

            $item['normal_price'] = $normalPrice;
            $item['service_name'] = $ad->service?->title;
            $item['service_price'] = $normalPrice;

            $item['image_url'] = $ad->image_path
                ? '/storage/' . ltrim($ad->image_path, '/')
                : null;

            $item['discount_amount'] = (
                $normal > 0 && $promo > 0 && $promo < $normal
            ) ? round($normal - $promo, 2) : 0;

            $item['discount_percentage'] = (
                $normal > 0 && $promo > 0 && $promo < $normal
            ) ? round((($normal - $promo) / $normal) * 100, 2) : 0;

            return $item;
        });

        return response()->json([
            'success' => true,
            'message' => 'Daftar iklan aktif berhasil diambil.',
            'data' => $data,
        ]);
    }
}