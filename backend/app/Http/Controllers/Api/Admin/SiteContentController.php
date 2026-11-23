<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SiteContentController extends Controller
{
    private array $allowedKeys = [
        'brand_name',
        'brand_tagline',
        'business_description',
        'hero_label',
        'hero_title',
        'hero_description',
        'hero_button_text',
        'hero_button_url',
        'how_title',
        'how_step_1_title',
        'how_step_1_description',
        'how_step_2_title',
        'how_step_2_description',
        'how_step_3_title',
        'how_step_3_description',
        'how_step_4_title',
        'how_step_4_description',
        'cta_label',
        'cta_title',
        'cta_description',
        'cta_button_text',
        'contact_whatsapp',
        'footer_description',
        'contact_email',
        'contact_address',

        'ad_1_enabled',
        'ad_1_title',
        'ad_1_description',
        'ad_1_button_text',
        'ad_1_button_url',

        'ad_2_enabled',
        'ad_2_title',
        'ad_2_description',
        'ad_2_button_text',
        'ad_2_button_url',
    ];

    private function imageUrl(?string $imagePath): ?string
    {
        if (!$imagePath) {
            return null;
        }

        return str_starts_with($imagePath, 'assets/')
            ? asset($imagePath)
            : asset('storage/' . $imagePath);
    }

    public function index()
    {
        $contents = SiteContent::query()->pluck('content', 'key');

        $imagePath = $contents->get('hero_image_path', 'assets/banner.png');

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan konten website berhasil diambil.',
            'data' => $contents,
            'hero_image_url' => $this->imageUrl($imagePath),
            'ad_image_urls' => [
                '1' => $this->imageUrl($contents->get('ad_1_image_path')),
                '2' => $this->imageUrl($contents->get('ad_2_image_path')),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'contents' => ['required', 'array', 'min:1'],
            'contents.*' => ['nullable', 'string', 'max:10000'],
        ]);

        $contents = $validated['contents'];

        $unknownKeys = array_diff(
            array_keys($contents),
            $this->allowedKeys
        );

        if (count($unknownKeys) > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Terdapat kunci konten yang tidak diizinkan.',
                'errors' => [
                    'contents' => [
                        'Kunci tidak dikenal: ' . implode(', ', $unknownKeys),
                    ],
                ],
            ], 422);
        }

        DB::transaction(function () use ($contents) {
            foreach ($contents as $key => $value) {
                SiteContent::updateOrCreate(
                    ['key' => $key],
                    ['content' => $value]
                );
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Konten website berhasil diperbarui.',
            'data' => SiteContent::query()->pluck('content', 'key'),
        ]);
    }

    public function uploadHeroImage(Request $request)
    {
        $validated = $request->validate([
            'image' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        $newPath = Storage::disk('public')->putFile(
            'site-content',
            $validated['image']
        );

        if (!$newPath) {
            return response()->json([
                'success' => false,
                'message' => 'Gambar Hero gagal disimpan.',
            ], 500);
        }

        $oldPath = SiteContent::where('key', 'hero_image_path')->value('content');

        SiteContent::updateOrCreate(
            ['key' => 'hero_image_path'],
            [
                'content' => $newPath,
                'type' => 'image',
            ]
        );

        if (
            $oldPath &&
            !str_starts_with($oldPath, 'assets/') &&
            $oldPath !== $newPath
        ) {
            Storage::disk('public')->delete($oldPath);
        }

        return response()->json([
            'success' => true,
            'message' => 'Gambar Hero berhasil diperbarui.',
            'hero_image_url' => asset('storage/' . $newPath),
            'image_path' => $newPath,
        ]);
    }

    public function uploadAdImage(Request $request, string $slot)
    {
        if (!in_array($slot, ['1', '2'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Slot iklan tidak valid.',
            ], 422);
        }

        $validated = $request->validate([
            'image' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        $newPath = Storage::disk('public')->putFile(
            'site-content/ads',
            $validated['image']
        );

        if (!$newPath) {
            return response()->json([
                'success' => false,
                'message' => 'Gambar iklan gagal disimpan.',
            ], 500);
        }

        $key = "ad_{$slot}_image_path";
        $oldPath = SiteContent::where('key', $key)->value('content');

        SiteContent::updateOrCreate(
            ['key' => $key],
            [
                'content' => $newPath,
                'type' => 'image',
            ]
        );

        if (
            $oldPath &&
            !str_starts_with($oldPath, 'assets/') &&
            $oldPath !== $newPath
        ) {
            Storage::disk('public')->delete($oldPath);
        }

        return response()->json([
            'success' => true,
            'message' => "Gambar iklan slot {$slot} berhasil diperbarui.",
            'ad_image_url' => asset('storage/' . $newPath),
            'image_path' => $newPath,
            'slot' => $slot,
        ]);
    }
}