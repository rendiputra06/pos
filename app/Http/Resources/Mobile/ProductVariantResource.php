<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'product_id'          => $this->product_id,
            'sku'                 => $this->sku,
            'barcode'             => $this->barcode,
            'price'               => (float) $this->price,
            'cost_price'          => (float) $this->cost_price,
            'stock'               => (int) $this->stock,
            'unit'                => $this->unit,
            'combination'         => $this->combination,
            'formatted_combination' => $this->formatted_combination,
            'is_active'           => (bool) $this->is_active,
            'display_order'       => $this->display_order,
            'thumbnail_url'       => $this->thumbnail_url,
            'medium_url'          => $this->medium_url,
            'original_url'        => $this->original_url,
            'created_at'          => $this->created_at?->toISOString(),
            'updated_at'          => $this->updated_at?->toISOString(),
        ];
    }
}
