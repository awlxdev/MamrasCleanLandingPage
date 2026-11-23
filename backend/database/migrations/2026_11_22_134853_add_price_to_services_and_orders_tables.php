<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->decimal('price', 12, 2)
                ->nullable()
                ->after('description');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('service_price', 12, 2)
                ->nullable()
                ->after('service_title');
        });

        // Pertahankan harga dari pesanan lama jika sebelumnya sudah ada.
        DB::table('orders')
            ->whereNotNull('quoted_price')
            ->update([
                'service_price' => DB::raw('quoted_price'),
            ]);
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('service_price');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('price');
        });
    }
};
