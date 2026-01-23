<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
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
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
