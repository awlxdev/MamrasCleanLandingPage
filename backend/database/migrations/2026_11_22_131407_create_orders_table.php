<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->string('order_number', 40)->unique();

            $table->foreignId('user_id')
                ->constrained()
                ->restrictOnDelete();

            $table->foreignId('service_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Snapshot layanan saat pesanan dibuat.
            $table->string('service_title');

            // Snapshot identitas dan alamat pelanggan.
            $table->string('customer_name');
            $table->string('customer_whatsapp', 20);
            $table->text('address');

            // Jadwal yang diminta pelanggan.
            $table->date('requested_date');
            $table->time('requested_time');

            // Detail tambahan kebutuhan pelanggan.
            $table->text('details')->nullable();

            // Diisi admin setelah biaya layanan dikonfirmasi.
            $table->decimal('quoted_price', 12, 2)->nullable();

            $table->string('status', 40)
                ->default('pending_confirmation')
                ->index();

            $table->text('admin_notes')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('requested_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
