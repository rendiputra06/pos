<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductBank extends Model
{
    protected $table = 'product_bank';

    protected $fillable = [
        'category_id',
        'name',
        'sku',
        'barcode',
        'unit',
        'image',
    ];

    /**
     * Kategori produk (shared/global).
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Daftar toko yang mengaktifkan produk ini beserta stok & harganya masing-masing.
     */
    public function storeProducts(): HasMany
    {
        return $this->hasMany(StoreProduct::class);
    }

    /**
     * Cek apakah produk sudah aktif di toko tertentu.
     */
    public function isActiveInStore(int $storeId): bool
    {
        return $this->storeProducts()
            ->where('store_id', $storeId)
            ->where('is_active', true)
            ->exists();
    }
}
