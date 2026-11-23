<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_contents', function (Blueprint $table) {
            $table->id();
            $table->string('key', 120)->unique();
            $table->longText('content')->nullable();
            $table->string('type', 30)->default('text');
            $table->timestamps();
        });

        $now = now();

        $defaults = [
            ['key' => 'brand_name', 'content' => 'MAMRAS CLEAN', 'type' => 'text'],
            ['key' => 'brand_tagline', 'content' => 'YOUR CLEANING SOLUTION', 'type' => 'text'],
            ['key' => 'business_description', 'content' => 'Membantu menciptakan lingkungan yang lebih bersih, rapi, dan nyaman untuk Anda.', 'type' => 'textarea'],

            ['key' => 'hero_label', 'content' => 'YOUR CLEANING SOLUTION', 'type' => 'text'],
            ['key' => 'hero_title', 'content' => 'Wujudkan Ruangan Bersih dan Nyaman', 'type' => 'text'],
            ['key' => 'hero_description', 'content' => 'Solusi kebersihan untuk rumah, kantor, dan berbagai kebutuhan Anda di Kaimana.', 'type' => 'textarea'],
            ['key' => 'hero_button_text', 'content' => 'Konsultasi Sekarang', 'type' => 'text'],
            ['key' => 'hero_button_url', 'content' => 'https://wa.me/6282188558026', 'type' => 'url'],
            ['key' => 'hero_image_path', 'content' => 'assets/banner.png', 'type' => 'image'],

            ['key' => 'how_title', 'content' => 'Bagaimana Cara Memesan?', 'type' => 'text'],
            ['key' => 'how_step_1_title', 'content' => 'Hubungi Kami', 'type' => 'text'],
            ['key' => 'how_step_1_description', 'content' => 'Mulai percakapan dengan Mamras Clean melalui WhatsApp.', 'type' => 'textarea'],
            ['key' => 'how_step_2_title', 'content' => 'Ceritakan Kebutuhan', 'type' => 'text'],
            ['key' => 'how_step_2_description', 'content' => 'Sampaikan jenis pekerjaan dan area yang ingin dibersihkan.', 'type' => 'textarea'],
            ['key' => 'how_step_3_title', 'content' => 'Atur Jadwal', 'type' => 'text'],
            ['key' => 'how_step_3_description', 'content' => 'Diskusikan lokasi, waktu, dan detail pemesanan.', 'type' => 'textarea'],
            ['key' => 'how_step_4_title', 'content' => 'Konfirmasi Pesanan', 'type' => 'text'],
            ['key' => 'how_step_4_description', 'content' => 'Pastikan detail layanan bersama Mamras Clean.', 'type' => 'textarea'],

            ['key' => 'cta_label', 'content' => 'MULAI DARI SEKARANG', 'type' => 'text'],
            ['key' => 'cta_title', 'content' => 'Ingin Ruangan Lebih Bersih dan Nyaman?', 'type' => 'text'],
            ['key' => 'cta_description', 'content' => 'Ceritakan kebutuhan kebersihan Anda. Hubungi Mamras Clean untuk mendapatkan informasi lebih lanjut.', 'type' => 'textarea'],
            ['key' => 'cta_button_text', 'content' => 'Konsultasi via WhatsApp', 'type' => 'text'],
            ['key' => 'contact_whatsapp', 'content' => '082188558026', 'type' => 'text'],

            ['key' => 'footer_description', 'content' => 'Membantu menciptakan lingkungan yang lebih bersih, rapi, dan nyaman untuk Anda.', 'type' => 'textarea'],
            ['key' => 'contact_email', 'content' => 'mamrasclean@gmail.com', 'type' => 'text'],
            ['key' => 'contact_address', 'content' => 'Kabupaten Kaimana, Papua Barat, Indonesia', 'type' => 'textarea'],
        ];

        foreach ($defaults as &$item) {
            $item['created_at'] = $now;
            $item['updated_at'] = $now;
        }
        unset($item);

        DB::table('site_contents')->insert($defaults);
    }

    public function down(): void
    {
        Schema::dropIfExists('site_contents');
    }
};
