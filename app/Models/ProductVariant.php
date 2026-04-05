<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class ProductVariant extends Model implements HasMedia
{
    use InteractsWithMedia, HasFactory;

    protected $fillable = [
        'product_id',
        'sku',
        'barcode',
        'price',
        'cost_price',
        'stock',
        'unit',
        'combination',
        'combination_hash',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'stock' => 'integer',
        'combination' => 'array',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    protected $appends = [
        'thumbnail_url',
        'medium_url',
        'original_url',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function options(): BelongsToMany
    {
        return $this->belongsToMany(VariantOption::class, 'variant_combinations');
    }

    // Media Library methods
    public function registerMediaConversions(?Media $media = null): void
    {
        $this
            ->addMediaConversion('thumbnail')
            ->width(150)
            ->height(150)
            ->sharpen(10);

        $this
            ->addMediaConversion('medium')
            ->width(400)
            ->height(400)
            ->sharpen(10);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('variant_images')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp'])
            ->singleFile()
            ->withResponsiveImages();
    }

    public function getThumbnailUrlAttribute()
    {
        return $this->getFirstMediaUrl('variant_images', 'thumbnail') ?: null;
    }

    public function getMediumUrlAttribute()
    {
        return $this->getFirstMediaUrl('variant_images', 'medium') ?: null;
    }

    public function getOriginalUrlAttribute()
    {
        return $this->getFirstMediaUrl('variant_images') ?: null;
    }

    /**
     * Generate combination hash for uniqueness
     */
    public static function generateCombinationHash(array $combination): string
    {
        ksort($combination); // Sort keys for consistency
        return md5(json_encode($combination));
    }

    /**
     * Generate SKU based on product name and combination
     */
    public static function generateSKU(string $productName, array $combination): string
    {
        $productCode = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $productName));
        $productCode = substr($productCode, 0, 8); // Limit to 8 chars
        
        $variantCode = '';
        foreach ($combination as $key => $value) {
            $variantCode .= '-' . strtoupper(substr($value, 0, 3));
        }
        
        return $productCode . $variantCode . '-' . strtoupper(substr(uniqid(), -4));
    }

    /**
     * Get formatted combination string
     */
    public function getFormattedCombinationAttribute(): string
    {
        $combination = $this->combination;
        $parts = [];
        
        foreach ($combination as $key => $value) {
            $parts[] = $value;
        }
        
        return implode(' / ', $parts);
    }
}
