<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', Rule::in([
                Order::STATUS_PENDING,
                Order::STATUS_CONFIRMED,
                Order::STATUS_PROCESSING,
                Order::STATUS_COMPLETED,
                Order::STATUS_CANCELLED,
            ])],
            'search' => ['nullable', 'string', 'max:100'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $query = Order::with([
            'service',
            'user:id,name,email,whatsapp',
        ])->latest();

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (!empty($validated['search'])) {
            $search = $validated['search'];

            $query->where(function ($builder) use ($search) {
                $builder->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_whatsapp', 'like', "%{$search}%")
                    ->orWhere('service_title', 'like', "%{$search}%");
            });
        }

        if (!empty($validated['date_from'])) {
            $query->whereDate('requested_date', '>=', $validated['date_from']);
        }

        if (!empty($validated['date_to'])) {
            $query->whereDate('requested_date', '<=', $validated['date_to']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Daftar pesanan berhasil diambil.',
            'data' => $query->paginate(15)->withQueryString(),
            'summary' => [
                'total' => Order::count(),
                'pending' => Order::where('status', Order::STATUS_PENDING)->count(),
                'confirmed' => Order::where('status', Order::STATUS_CONFIRMED)->count(),
                'processing' => Order::where('status', Order::STATUS_PROCESSING)->count(),
                'completed' => Order::where('status', Order::STATUS_COMPLETED)->count(),
                'cancelled' => Order::where('status', Order::STATUS_CANCELLED)->count(),
            ],
        ]);
    }

    public function show(string $id)
    {
        $order = Order::with([
            'service',
            'user:id,name,email,whatsapp',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => [
                'sometimes',
                'required',
                'string',
                Rule::in([
                    Order::STATUS_PENDING,
                    Order::STATUS_CONFIRMED,
                    Order::STATUS_PROCESSING,
                    Order::STATUS_COMPLETED,
                    Order::STATUS_CANCELLED,
                ]),
            ],
            'admin_notes' => [
                'sometimes',
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        if (empty($validated)) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada data yang diperbarui.',
            ], 422);
        }

        $order->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil diperbarui.',
            'data' => $order->fresh([
                'service',
                'user:id,name,email,whatsapp',
            ]),
        ]);
    }
}