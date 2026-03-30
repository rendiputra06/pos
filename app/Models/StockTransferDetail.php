<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockTransferDetail extends Model
{
    protected $fillable = [
        'stock_transfer_id',
        'product_bank_id',
        'qty',
    ];

    public function stockTransfer()
    {
        return $this->belongsTo(StockTransfer::class);
    }

    public function productBank()
    {
        return $this->belongsTo(ProductBank::class);
    }
}
