<?php

namespace App\Models;

use App\Models\Scopes\StoreScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    protected $fillable = [
        'store_id',
        'invoice_number',
        'user_id',
        'customer_id',
        'total_amount',
        'discount',
        'grand_total',
        'payment_method',
        'status',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new StoreScope());
    }


    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(TransactionDetail::class);
    }
}
