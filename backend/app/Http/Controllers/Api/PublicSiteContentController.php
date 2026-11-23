<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;

class PublicSiteContentController extends Controller
{
    public function index()
    {
        $contents = SiteContent::query()
            ->pluck('content', 'key');

        $imagePath = $contents->get('hero_image_path', 'assets/banner.png');

        $imageUrl = str_starts_with($imagePath ?? '', 'assets/')
            ? asset($imagePath)
            : asset('storage/' . $imagePath);

        $adImageUrls = [];

        foreach (['1', '2'] as $slot) {
            $path = $contents->get("ad_{$slot}_image_path");

            $adImageUrls[$slot] = $path
                ? (
                    str_starts_with($path, 'assets/')
                        ? asset($path)
                        : asset('storage/' . $path)
                )
                : null;
        }

        return response()->json([
            'success' => true,
            'message' => 'Konten website berhasil diambil.',
            'data' => $contents,
            'hero_image_url' => $imageUrl,
            'ad_image_urls' => $adImageUrls,
        ]);
    }
}