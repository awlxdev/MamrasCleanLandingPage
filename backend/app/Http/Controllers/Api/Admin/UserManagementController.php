<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $query = User::query()
            ->where('role', 'user')
            ->select([
                'id',
                'name',
                'email',
                'whatsapp',
                'address',
                'created_at',
            ])
            ->latest();

        if (!empty($validated['search'])) {
            $search = $validated['search'];

            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('whatsapp', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'success' => true,
            'message' => 'Daftar pelanggan berhasil diambil.',
            'data' => $query->paginate(15)->withQueryString(),
            'summary' => [
                'total' => User::where('role', 'user')->count(),
            ],
        ]);
    }

    public function show(string $id)
    {
        $user = User::query()
            ->where('role', 'user')
            ->select([
                'id',
                'name',
                'email',
                'whatsapp',
                'address',
                'created_at',
            ])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $user = User::query()
            ->where('role', 'user')
            ->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'whatsapp' => ['required', 'string', 'max:20'],
            'address' => ['required', 'string', 'max:1000'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['nullable', 'string', 'required_with:password'],
        ]);

        $profileData = collect($validated)->only([
            'name',
            'email',
            'whatsapp',
            'address',
        ])->all();

        if (!empty($validated['password'])) {
            $profileData['password'] = $validated['password'];
        }

        $user->update($profileData);

        return response()->json([
            'success' => true,
            'message' => 'Data pelanggan berhasil diperbarui.',
            'data' => $user->only([
                'id',
                'name',
                'email',
                'whatsapp',
                'address',
                'created_at',
            ]),
        ]);
    }
}