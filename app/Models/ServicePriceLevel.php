<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServicePriceLevel extends Model
{
    protected $fillable = ['service_id', 'min_qty', 'max_qty', 'price'];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
