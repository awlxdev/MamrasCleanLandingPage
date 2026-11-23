<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ContactMessageController extends Controller
{
    public function index(Request $request)
    {
        $query = ContactMessage::query()->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $messages = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $messages,
            'unread_count' => ContactMessage::where('status', 'unread')->count(),
        ]);
    }

    public function show(string $id)
    {
        $contactMessage = ContactMessage::findOrFail($id);

        if ($contactMessage->status === 'unread') {
            $contactMessage->update([
                'status' => 'read',
                'read_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $contactMessage->fresh(),
        ]);
    }

    public function update(Request $request, string $id)
    {
        $contactMessage = ContactMessage::findOrFail($id);

        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                Rule::in(['unread', 'read', 'replied']),
            ],
        ]);

        $status = $validated['status'];

        $data = ['status' => $status];

        if ($status === 'unread') {
            $data['read_at'] = null;
            $data['replied_at'] = null;
        } elseif ($status === 'read') {
            $data['read_at'] = $contactMessage->read_at ?? now();
            $data['replied_at'] = null;
        } else {
            $data['read_at'] = $contactMessage->read_at ?? now();
            $data['replied_at'] = now();
        }

        $contactMessage->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Status pesan berhasil diperbarui.',
            'data' => $contactMessage->fresh(),
        ]);
    }

    public function destroy(string $id)
    {
        $contactMessage = ContactMessage::findOrFail($id);
        $contactMessage->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pesan berhasil dihapus.',
        ]);
    }
}