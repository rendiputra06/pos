<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VariantGroup extends Model
{
    use HasFactory;
    protected $fillable = [
        'product_id',
        'name',
        'type',
        'display_order',
        'is_required',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'display_order' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(VariantOption::class)->orderBy('display_order');
    }

    public function activeOptions(): HasMany
    {
        return $this->hasMany(VariantOption::class)
            ->where('is_active', true)
            ->orderBy('display_order');
    }

    /**
     * Get predefined options for standard variant types
     */
    public static function getStandardOptions(string $type): array
    {
        $standardOptions = [
            'size' => [
                ['value' => 'XS', 'display_value' => 'Extra Small'],
                ['value' => 'S', 'display_value' => 'Small'],
                ['value' => 'M', 'display_value' => 'Medium'],
                ['value' => 'L', 'display_value' => 'Large'],
                ['value' => 'XL', 'display_value' => 'Extra Large'],
                ['value' => 'XXL', 'display_value' => '2X Large'],
                ['value' => '3XL', 'display_value' => '3X Large'],
            ],
            'color' => [
                ['value' => 'Merah', 'display_value' => 'Merah', 'color_code' => '#FF0000'],
                ['value' => 'Biru', 'display_value' => 'Biru', 'color_code' => '#0000FF'],
                ['value' => 'Hijau', 'display_value' => 'Hijau', 'color_code' => '#00FF00'],
                ['value' => 'Kuning', 'display_value' => 'Kuning', 'color_code' => '#FFFF00'],
                ['value' => 'Hitam', 'display_value' => 'Hitam', 'color_code' => '#000000'],
                ['value' => 'Putih', 'display_value' => 'Putih', 'color_code' => '#FFFFFF'],
                ['value' => 'Abu-abu', 'display_value' => 'Abu-abu', 'color_code' => '#808080'],
                ['value' => 'Coklat', 'display_value' => 'Coklat', 'color_code' => '#8B4513'],
                ['value' => 'Pink', 'display_value' => 'Pink', 'color_code' => '#FFC0CB'],
                ['value' => 'Ungu', 'display_value' => 'Ungu', 'color_code' => '#800080'],
            ],
            'material' => [
                ['value' => 'Katun', 'display_value' => 'Katun'],
                ['value' => 'Polyester', 'display_value' => 'Polyester'],
                ['value' => 'Wool', 'display_value' => 'Wool'],
                ['value' => 'Denim', 'display_value' => 'Denim'],
                ['value' => 'Sutra', 'display_value' => 'Sutra'],
                ['value' => 'Linen', 'display_value' => 'Linen'],
                ['value' => 'Spandex', 'display_value' => 'Spandex'],
                ['value' => 'Nylon', 'display_value' => 'Nylon'],
            ],
        ];

        return $standardOptions[$type] ?? [];
    }
}
