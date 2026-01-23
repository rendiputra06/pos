<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = ['category_id', 'name', 'base_price'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function priceLevels()
    {
        return $this->hasMany(ServicePriceLevel::class);
    }
}
