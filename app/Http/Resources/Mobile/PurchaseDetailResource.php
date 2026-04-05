<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'product_id' => $this->product_id,
            'product'    => $this->whenLoaded('product', fn () => [
                'id'   => $this->product->id,
                'name' => $this->product->name,
                'sku'  => $this->product->sku,
                'unit' => $this->product->unit,
            ]),
            'variant_id' => $this->variant_id ?? null,
            'variant'    => $this->whenLoaded('variant', fn () => $this->variant ? [
                'id'          => $this->variant->id,
                'sku'         => $this->variant->sku,
                'combination' => $this->variant->combination,
                'formatted_combination' => $this->variant->formatted_combination,
            ] : null),
            'qty'        => (float) $this->qty,
            'cost_price' => (float) $this->cost_price,
            'subtotal'   => (float) $this->subtotal,
        ];
    }
}
