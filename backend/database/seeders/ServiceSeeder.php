<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'title' => 'Kebersihan Hunian',
                'slug' => 'kebersihan-hunian',
                'description' => 'Solusi untuk membantu menjaga kebersihan dan kenyamanan area tempat tinggal.',
                'icon' => 'Home',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Kebersihan Ruangan',
                'slug' => 'kebersihan-ruangan',
                'description' => 'Dukungan kebersihan untuk ruang kerja maupun lingkungan usaha.',
                'icon' => 'Building2',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'Perawatan Kebersihan',
                'slug' => 'perawatan-kebersihan',
                'description' => 'Bantu wujudkan area yang lebih rapi, segar, dan menyenangkan.',
                'icon' => 'Sparkles',
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'title' => 'Kebutuhan Cleaning',
                'slug' => 'kebutuhan-cleaning',
                'description' => 'Diskusikan kebutuhan kebersihan Anda bersama tim Mamras Clean.',
                'icon' => 'SprayCan',
                'sort_order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($services as $service) {
            Service::updateOrCreate(
                ['slug' => $service['slug']],
                $service
            );
        }
    }
}
