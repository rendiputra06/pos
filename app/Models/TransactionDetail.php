<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class TransactionDetail extends Model
{
    protected $fillable = [
        'transaction_id',
        'item_type',
        'item_id',
        'qty',
        'price',
        'subtotal',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Get the parent item model (Product or Service).
     */
    public function item(): MorphTo
    {
        return $this->morphTo();
    }
}
