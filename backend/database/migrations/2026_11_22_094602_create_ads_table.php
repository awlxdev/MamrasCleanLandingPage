<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ads', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('slot')->index();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('image_path')->nullable();

            $table->decimal('normal_price', 12, 2)->nullable();
            $table->decimal('promo_price', 12, 2)->nullable();
            $table->string('discount_type', 20)->nullable();
            $table->decimal('discount_value', 12, 2)->nullable();

            $table->string('button_text', 100)->nullable();
            $table->text('button_url')->nullable();

            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // Pindahkan dua iklan lama tanpa menghapus data site_contents.
        if (Schema::hasTable('site_contents')) {
            foreach ([1, 2] as $slot) {
                $keys = [
                    "ad_{$slot}_enabled",
                    "ad_{$slot}_title",
                    "ad_{$slot}_description",
                    "ad_{$slot}_image_path",
                    "ad_{$slot}_button_text",
                    "ad_{$slot}_button_url",
                ];

                $contents = DB::table('site_contents')
                    ->whereIn('key', $keys)
                    ->pluck('content', 'key');

                $title = $contents->get("ad_{$slot}_title");

                if (!$title) {
                    continue;
                }

                $now = now();

                DB::table('ads')->insert([
                    'slot' => $slot,
                    'title' => $title,
                    'description' => $contents->get("ad_{$slot}_description"),
                    'image_path' => $contents->get("ad_{$slot}_image_path"),
                    'normal_price' => null,
                    'promo_price' => null,
                    'discount_type' => null,
                    'discount_value' => null,
                    'button_text' => $contents->get("ad_{$slot}_button_text"),
                    'button_url' => $contents->get("ad_{$slot}_button_url"),
                    'is_active' => $contents->get("ad_{$slot}_enabled") === '1',
                    'sort_order' => 0,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ads');
    }
};
