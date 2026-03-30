<?php

namespace App\Models;

use App\Models\Scopes\StoreScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'name',
        'contact_person',
        'phone',
        'address',
        'email',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new StoreScope());
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }
}
