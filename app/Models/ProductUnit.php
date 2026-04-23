<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductUnit extends Model
{
    protected $fillable = [
        'product_id',
        'name',
        'sku',
        'barcode',
        'price',
        'cost_price',
        'stock',
        'conversion_factor',
        'is_base_unit',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'stock' => 'integer',
        'conversion_factor' => 'decimal:2',
        'is_base_unit' => 'boolean',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Convert quantity in this unit to base unit quantity
     * e.g. 2 box (factor=12) → 24 pcs
     */
    public function toBaseUnitQty($qty): float
    {
        return $qty * $this->conversion_factor;
    }

    /**
     * Get effective stock available in this unit
     * For base unit: returns own stock
     * For non-base unit: returns base_unit_stock / conversion_factor
     */
    public function getEffectiveStock(): float
    {
        if ($this->is_base_unit) {
            return $this->stock;
        }

        $baseUnit = $this->product->baseUnit;
        if (!$baseUnit) {
            return 0;
        }

        return floor($baseUnit->stock / $this->conversion_factor);
    }

    /**
     * Get formatted name with product name
     */
    public function getFormattedNameAttribute(): string
    {
        return $this->product->name . ' (' . $this->name . ')';
    }

    /**
     * Get display info for POS
     */
    public function getDisplayInfoAttribute(): string
    {
        $stock = $this->getEffectiveStock();
        return "SKU: {$this->sku} | Stok: {$stock} {$this->name}";
    }

    /**
     * Get converted stock attribute
     * For base unit: returns actual stock
     * For non-base unit: returns base_unit_stock / conversion_factor
     */
    public function getConvertedStockAttribute(): ?float
    {
        if ($this->is_base_unit) {
            return $this->stock;
        }

        $baseUnit = $this->product->baseUnit;
        if (!$baseUnit) {
            return null;
        }

        return $baseUnit->stock / $this->conversion_factor;
    }

    /**
     * Get base unit name attribute
     */
    public function getBaseUnitNameAttribute(): ?string
    {
        if ($this->is_base_unit) {
            return $this->name;
        }

        $baseUnit = $this->product->baseUnit;
        return $baseUnit ? $baseUnit->name : null;
    }

    /**
     * Get base conversion factor attribute
     */
    public function getBaseConversionFactorAttribute(): ?float
    {
        if ($this->is_base_unit) {
            return $this->conversion_factor;
        }

        $baseUnit = $this->product->baseUnit;
        return $baseUnit ? $baseUnit->conversion_factor : null;
    }

    /**
     * Get display stock method
     */
    public function getDisplayStock(): int
    {
        return (int) $this->getEffectiveStock();
    }
}
