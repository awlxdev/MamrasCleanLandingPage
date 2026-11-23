<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class CustomerOrderController extends Controller
{
    private function ensureCustomer(Request $request)
    {
        if ($request->user()->role !== 'user') {
            return response()->json([
                'success' => false,
                'message' => 'Akses hanya untuk pelanggan.',
            ], 403);
        }

        return null;
    }

    public function index(Request $request)
    {
        if ($response = $this->ensureCustomer($request)) {
            return $response;
        }

        $query = $request->user()
            ->orders()
            ->with('service:id,title,price');

        if ($request->query('view') === 'history') {
            $query->whereIn('status', [
                Order::STATUS_COMPLETED,
                Order::STATUS_CANCELLED,
            ]);
        } else {
            $query->whereNotIn('status', [
                Order::STATUS_COMPLETED,
                Order::STATUS_CANCELLED,
            ]);
        }

        $orders = $query->latest()->paginate(10);

        $orders->getCollection()->each(function ($order) {
            $order->makeHidden('admin_notes');
        });

        return response()->json([
            'success' => true,
            'message' => 'Daftar pesanan berhasil diambil.',
            'data' => $orders,
        ]);
    }

    public function store(Request $request)
    {
        if ($response = $this->ensureCustomer($request)) {
            return $response;
        }

        $validated = $request->validate([
            'service_id' => [
                'required',
                'integer',
                Rule::exists('services', 'id')
                    ->where(fn ($query) => $query->where('is_active', true)),
            ],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_whatsapp' => ['required', 'string', 'max:20'],
            'address' => ['required', 'string', 'max:1000'],
            'requested_date' => ['required', 'date', 'after_or_equal:today'],
            'requested_time' => ['required', 'date_format:H:i'],
            'details' => ['nullable', 'string', 'max:3000'],
        ]);

        $service = Service::where('is_active', true)
            ->findOrFail($validated['service_id']);

        if ($service->price === null) {
            return response()->json([
                'success' => false,
                'message' => 'Harga layanan belum tersedia. Silakan hubungi admin.',
            ], 422);
        }

        do {
            $orderNumber = 'MC-' . strtoupper(Str::random(12));
        } while (Order::where('order_number', $orderNumber)->exists());

        $order = $request->user()->orders()->create([
            'order_number' => $orderNumber,
            'service_id' => $service->id,
            'service_title' => $service->title,
            'service_price' => $service->price,
            'customer_name' => $validated['customer_name'],
            'customer_whatsapp' => $validated['customer_whatsapp'],
            'address' => $validated['address'],
            'requested_date' => $validated['requested_date'],
            'requested_time' => $validated['requested_time'],
            'details' => $validated['details'] ?? null,
            'status' => Order::STATUS_PENDING,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibuat dengan harga layanan yang berlaku.',
            'data' => $order->load('service:id,title,price')
                ->makeHidden('admin_notes'),
        ], 201);
    }

    public function show(Request $request, int $id)
    {
        if ($response = $this->ensureCustomer($request)) {
            return $response;
        }

        $order = $request->user()
            ->orders()
            ->with('service:id,title,price')
            ->findOrFail($id);

        $order->makeHidden('admin_notes');

        return response()->json([
            'success' => true,
            'message' => 'Detail pesanan berhasil diambil.',
            'data' => $order,
        ]);
    }

    public function cancel(Request $request, int $id)
    {
        if ($response = $this->ensureCustomer($request)) {
            return $response;
        }

        $order = $request->user()
            ->orders()
            ->findOrFail($id);

        if (!in_array($order->status, [
            Order::STATUS_PENDING,
            Order::STATUS_CONFIRMED,
        ], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak dapat dibatalkan karena sudah diproses atau telah selesai.',
            ], 422);
        }

        $order->update([
            'status' => Order::STATUS_CANCELLED,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibatalkan.',
            'data' => $order->fresh()->makeHidden('admin_notes'),
        ]);
    }
}