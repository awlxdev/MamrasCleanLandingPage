<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class GalleryController extends Controller
{
    /**
     * Menampilkan semua foto untuk administrator.
     */
    public function index()
    {
        $galleries = Gallery::orderBy('sort_order')
            ->orderByDesc('id')
            ->get()
            ->map(function ($gallery) {
                $gallery->image_url = asset(
                    'storage/' . $gallery->image_path
                );

                return $gallery;
            });

        return response()->json([
            'success' => true,
            'message' => 'Data galeri berhasil diambil.',
            'data' => $galleries,
        ]);
    }

    /**
     * Menyimpan foto galeri baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $imagePath = Storage::disk('public')->putFile(
            'galleries',
            $request->file('image')
        );

        if (!$imagePath) {
            return response()->json([
                'success' => false,
                'message' => 'Foto gagal disimpan.',
            ], 500);
        }

        $gallery = Gallery::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'image_path' => $imagePath,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $gallery->image_url = asset('storage/' . $gallery->image_path);

        return response()->json([
            'success' => true,
            'message' => 'Foto galeri berhasil ditambahkan.',
            'data' => $gallery,
        ], 201);
    }

    /**
     * Menampilkan satu foto.
     */
    public function show(string $id)
    {
        $gallery = Gallery::findOrFail($id);

        $gallery->image_url = asset(
            'storage/' . $gallery->image_path
        );

        return response()->json([
            'success' => true,
            'data' => $gallery,
        ]);
    }

    /**
     * Memperbarui data dan foto galeri.
     */
    public function update(Request $request, string $id)
    {
        $gallery = Gallery::findOrFail($id);

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $data = [];

        foreach (['title', 'description', 'sort_order', 'is_active'] as $field) {
            if (array_key_exists($field, $validated)) {
                $data[$field] = $validated[$field];
            }
        }

        if ($request->hasFile('image')) {
            $newImagePath = Storage::disk('public')->putFile(
                'galleries',
                $request->file('image')
            );

            if (!$newImagePath) {
                return response()->json([
                    'success' => false,
                    'message' => 'Foto baru gagal disimpan.',
                ], 500);
            }

            if ($gallery->image_path) {
                Storage::disk('public')->delete($gallery->image_path);
            }

            $data['image_path'] = $newImagePath;
        }

        $gallery->update($data);
        $gallery->refresh();

        $gallery->image_url = asset(
            'storage/' . $gallery->image_path
        );

        return response()->json([
            'success' => true,
            'message' => 'Data galeri berhasil diperbarui.',
            'data' => $gallery,
        ]);
    }

    /**
     * Menghapus foto galeri.
     */
    public function destroy(string $id)
    {
        $gallery = Gallery::findOrFail($id);

        if ($gallery->image_path) {
            Storage::disk('public')->delete($gallery->image_path);
        }

        $gallery->delete();

        return response()->json([
            'success' => true,
            'message' => 'Foto galeri berhasil dihapus.',
        ]);
    }
}
