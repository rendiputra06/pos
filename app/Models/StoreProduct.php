<?php

namespace App\Models;

use App\Models\Scopes\StoreScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class StoreProduct extends Model
{
    protected $fillable = [
        'store_id',
        'product_bank_id',
        'cost_price',
        'price',
        'stock',
        'is_active',
    ];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'price'      => 'decimal:2',
        'is_active'  => 'boolean',
    ];

    /**
     * Terapkan StoreScope agar query otomatis difilter per toko yang login.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new StoreScope());
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function productBank(): BelongsTo
    {
        return $this->belongsTo(ProductBank::class);
    }

    public function purchaseDetails(): MorphMany
    {
        return $this->morphMany(PurchaseDetail::class, 'item');
    }

    /**
     * Akses cepat ke nama produk dari product bank.
     */
    public function getNameAttribute(): string
    {
        return $this->productBank?->name ?? '';
    }

    /**
     * Akses cepat ke SKU produk dari product bank.
     */
    public function getSkuAttribute(): string
    {
        return $this->productBank?->sku ?? '';
    }

    /**
     * Akses cepat ke barcode produk dari product bank.
     */
    public function getBarcodeAttribute(): ?string
    {
        return $this->productBank?->barcode;
    }

    /**
     * Akses cepat ke unit produk dari product bank.
     */
    public function getUnitAttribute(): string
    {
        return $this->productBank?->unit ?? 'pcs';
    }
}
