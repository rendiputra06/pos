<?php

namespace App\Models;

use App\Models\Scopes\StoreScope;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'store_id',
        'category_id',
        'name',
        'base_price',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new StoreScope());
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function priceLevels()
    {
        return $this->hasMany(ServicePriceLevel::class);
    }
}
