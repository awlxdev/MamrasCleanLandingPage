<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;

class PublicGalleryController extends Controller
{
    /**
     * Menampilkan galeri yang aktif untuk landing page.
     */
    public function index()
    {
        $galleries = Gallery::where('is_active', true)
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get()
            ->map(function ($gallery) {
                return [
                    'id' => $gallery->id,
                    'title' => $gallery->title,
                    'description' => $gallery->description,
                    'image_url' => asset(
                        'storage/' . $gallery->image_path
                    ),
                    'sort_order' => $gallery->sort_order,
                ];
            });

        return response()->json([
            'success' => true,
            'message' => 'Galeri berhasil diambil.',
            'data' => $galleries,
        ]);
    }
}
