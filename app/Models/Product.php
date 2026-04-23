<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Product extends Model implements HasMedia
{
    use InteractsWithMedia, HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'sku',
        'barcode',
        'cost_price',
        'price',
        'stock',
        'unit',
        'image',
        'has_variants',
        'has_multiple_units',
    ];

    protected $appends = [
        'thumbnail_url',
        'medium_url',
        'original_url',
        'primary_image_url',
        'total_stock',
        'min_price',
        'max_price',
        'average_price',
        'has_multiple_units',
        'unit_price_range',
    ];

    protected $casts = [
        'has_variants' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function variantGroups()
    {
        return $this->hasMany(VariantGroup::class)->orderBy('display_order');
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class)->orderBy('display_order');
    }

    public function variantsWithImages()
    {
        return $this->hasMany(ProductVariant::class)
            ->whereHas('media', function ($query) {
                $query->where('collection_name', 'variant_images');
            })
            ->orderBy('display_order');
    }

    public function primaryVariant()
    {
        return $this->hasOne(ProductVariant::class)->orderBy('display_order');
    }

    public function activeVariants()
    {
        return $this->hasMany(ProductVariant::class)
            ->where('is_active', true)
            ->orderBy('display_order');
    }

    /**
     * Get product units (multiple units: pcs, box, dus, etc.)
     */
    public function units()
    {
        return $this->hasMany(ProductUnit::class)->orderBy('display_order');
    }

    /**
     * Get active units only
     */
    public function activeUnits()
    {
        return $this->hasMany(ProductUnit::class)
            ->where('is_active', true)
            ->orderBy('display_order');
    }

    /**
     * Get the base unit (smallest unit, stock holder)
     */
    public function baseUnit()
    {
        return $this->hasOne(ProductUnit::class)->where('is_base_unit', true);
    }

    /**
     * Check if product has multiple units
     */
    public function getHasMultipleUnitsAttribute()
    {
        if (array_key_exists('has_multiple_units', $this->attributes)) {
            return (bool) $this->attributes['has_multiple_units'];
        }

        if ($this->relationLoaded('units')) {
            return $this->units->count() > 1;
        }

        return $this->units()->count() > 1;
    }

    /**
     * Get total stock (base unit stock for multi-unit, variant sum for variants, or product stock)
     */
    public function getTotalStockAttribute()
    {
        // If has variants, use variant stock sum
        if ($this->has_variants) {
            if (array_key_exists('total_stock', $this->attributes)) {
                return $this->attributes['total_stock'];
            }

            if ($this->relationLoaded('variants')) {
                return $this->variants->sum('stock');
            }

            return $this->variants()->sum('stock');
        }

        // If has multiple units, get base unit stock
        if ($this->has_multiple_units) {
            if ($this->relationLoaded('baseUnit')) {
                return $this->baseUnit?->stock ?? 0;
            }

            return $this->baseUnit()?->stock ?? 0;
        }

        // Simple product
        return $this->stock;
    }

    /**
     * Get price range string for units (e.g. "Rp 1.000 - Rp 12.000")
     */
    public function getUnitPriceRangeAttribute()
    {
        if (!$this->has_multiple_units) {
            return null;
        }

        if (array_key_exists('unit_price_range', $this->attributes)) {
            return $this->attributes['unit_price_range'];
        }

        $units = $this->relationLoaded('activeUnits') 
            ? $this->activeUnits 
            : $this->activeUnits()->get();

        if ($units->isEmpty()) {
            return null;
        }

        $minPrice = $units->min('price');
        $maxPrice = $units->max('price');

        if ($minPrice == $maxPrice) {
            return 'Rp ' . number_format($minPrice, 0, ',', '.');
        }

        return 'Rp ' . number_format($minPrice, 0, ',', '.') . ' - Rp ' . number_format($maxPrice, 0, ',', '.');
    }

    /**
     * Get low stock variants count
     */
    public function getLowStockVariantsCountAttribute()
    {
        if ($this->has_variants) {
            return $this->variants()->where('stock', '<=', 5)->count();
        }

        return $this->stock <= 5 ? 1 : 0;
    }

    /**
     * Check if any variant is out of stock
     */
    public function getHasOutOfStockVariantsAttribute()
    {
        if ($this->has_variants) {
            return $this->variants()->where('stock', '=', 0)->exists();
        }

        return $this->stock == 0;
    }

    /**
     * Get available variants (in stock)
     */
    public function getAvailableVariantsAttribute()
    {
        if ($this->has_variants) {
            return $this->variants()->where('stock', '>', 0)->where('is_active', true)->get();
        }

        return $this->stock > 0 ? collect([$this]) : collect([]);
    }

    /**
     * Update variant stock
     */
    public function updateVariantStock($variantId, $quantity, $operation = 'set')
    {
        $variant = $this->variants()->findOrFail($variantId);

        switch ($operation) {
            case 'add':
                $variant->increment('stock', $quantity);
                break;
            case 'subtract':
                $newStock = $variant->stock - $quantity;
                if ($newStock < 0) {
                    throw new \Exception('Insufficient stock');
                }
                $variant->update(['stock' => $newStock]);
                break;
            case 'set':
            default:
                $variant->update(['stock' => max(0, $quantity)]);
                break;
        }

        return $variant->fresh();
    }

    /**
     * Get min price (variants or units, whichever is applicable)
     */
    public function getMinPriceAttribute()
    {
        // If has variants, use variant prices
        if ($this->has_variants) {
            if (array_key_exists('min_price', $this->attributes)) {
                return $this->attributes['min_price'];
            }

            if ($this->relationLoaded('variants')) {
                return $this->variants->where('price', '>', 0)->min('price');
            }

            return $this->variants()->where('price', '>', 0)->min('price');
        }

        // If has multiple units, use unit prices
        if ($this->has_multiple_units) {
            if ($this->relationLoaded('activeUnits')) {
                return $this->activeUnits->where('price', '>', 0)->min('price');
            }

            return $this->activeUnits()->where('price', '>', 0)->min('price');
        }

        // Simple product
        return $this->price;
    }

    /**
     * Get max price (variants or units, whichever is applicable)
     */
    public function getMaxPriceAttribute()
    {
        // If has variants, use variant prices
        if ($this->has_variants) {
            if (array_key_exists('max_price', $this->attributes)) {
                return $this->attributes['max_price'];
            }

            if ($this->relationLoaded('variants')) {
                return $this->variants->where('price', '>', 0)->max('price');
            }

            return $this->variants()->where('price', '>', 0)->max('price');
        }

        // If has multiple units, use unit prices
        if ($this->has_multiple_units) {
            if ($this->relationLoaded('activeUnits')) {
                return $this->activeUnits->where('price', '>', 0)->max('price');
            }

            return $this->activeUnits()->where('price', '>', 0)->max('price');
        }

        // Simple product
        return $this->price;
    }

    /**
     * Get average price (variants or units, whichever is applicable)
     */
    public function getAveragePriceAttribute()
    {
        // If has variants, use variant prices
        if ($this->has_variants) {
            if (array_key_exists('average_price', $this->attributes)) {
                return $this->attributes['average_price'];
            }

            if ($this->relationLoaded('variants')) {
                return $this->variants->where('price', '>', 0)->avg('price');
            }

            return $this->variants()->where('price', '>', 0)->avg('price');
        }

        // If has multiple units, use unit prices
        if ($this->has_multiple_units) {
            if ($this->relationLoaded('activeUnits')) {
                return $this->activeUnits->where('price', '>', 0)->avg('price');
            }

            return $this->activeUnits()->where('price', '>', 0)->avg('price');
        }

        // Simple product
        return $this->price;
    }

    /**
     * Update variant prices with rules
     */
    public function updateVariantPrices($rules = [])
    {
        if (!$this->has_variants) {
            return;
        }

        $variants = $this->variants()->get();

        foreach ($variants as $variant) {
            $newPrice = $variant->price;

            // Apply size-based pricing rules
            if (isset($rules['size']) && isset($variant->combination['size'])) {
                $size = $variant->combination['size'];
                if (isset($rules['size'][$size])) {
                    $newPrice = $rules['size'][$size];
                }
            }

            // Apply percentage increase/decrease
            if (isset($rules['percentage'])) {
                $newPrice = $newPrice * (1 + ($rules['percentage'] / 100));
            }

            // Apply fixed amount increase/decrease
            if (isset($rules['fixed'])) {
                $newPrice = $newPrice + $rules['fixed'];
            }

            // Ensure price doesn't go below cost price
            $newPrice = max($newPrice, $variant->cost_price);

            $variant->update(['price' => round($newPrice, 2)]);
        }
    }

    /**
     * Get profit margin for variant or product
     */
    public function getProfitMargin($variantId = null)
    {
        if ($variantId) {
            $variant = $this->variants()->find($variantId);
            if (!$variant) return 0;

            return (($variant->price - $variant->cost_price) / $variant->price) * 100;
        }

        if ($this->has_variants) {
            $avgPrice = $this->variants()->avg('price');
            $avgCost = $this->variants()->avg('cost_price');
            return (($avgPrice - $avgCost) / $avgPrice) * 100;
        }

        return (($this->price - $this->cost_price) / $this->price) * 100;
    }

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
        $this->addMediaCollection('product_images')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp'])
            ->singleFile()
            ->withResponsiveImages();
    }

    public function getThumbnailUrlAttribute()
    {
        return $this->getFirstMediaUrl('product_images', 'thumbnail') ?: null;
    }

    public function getMediumUrlAttribute()
    {
        return $this->getFirstMediaUrl('product_images', 'medium') ?: null;
    }

    public function getOriginalUrlAttribute()
    {
        return $this->getFirstMediaUrl('product_images') ?: null;
    }

    public function getSingleVariantImageUrlAttribute()
    {
        $variantImageCount = $this->attributes['variant_images_count'] ?? null;

        if ($variantImageCount !== null && (int) $variantImageCount !== 1) {
            return null;
        }

        if ($this->relationLoaded('variantsWithImages')) {
            return $this->variantsWithImages->first()?->thumbnail_url;
        }

        $variant = $this->variantsWithImages()->with('media')->first();
        return $variant?->thumbnail_url;
    }

    public function getPrimaryImageUrlAttribute()
    {
        if ($this->thumbnail_url) {
            return $this->thumbnail_url;
        }

        if ($this->single_variant_image_url) {
            return $this->single_variant_image_url;
        }

        if ($this->relationLoaded('primaryVariant')) {
            return $this->primaryVariant?->thumbnail_url;
        }

        return $this->primaryVariant?->thumbnail_url;
    }
}
