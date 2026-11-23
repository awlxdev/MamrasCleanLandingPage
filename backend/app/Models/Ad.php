<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ad extends Model
{
    protected $fillable = [
        'service_id',
        'slot',
        'title',
        'description',
        'image_path',
        'normal_price',
        'promo_price',
        'discount_type',
        'discount_value',
        'button_text',
        'button_url',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'service_id' => 'integer',
            'slot' => 'integer',
            'normal_price' => 'decimal:2',
            'promo_price' => 'decimal:2',
            'discount_value' => 'decimal:2',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}