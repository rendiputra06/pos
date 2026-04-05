<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'invoice_number' => $this->invoice_number,
            'purchase_date'  => $this->purchase_date?->toDateString(),
            'total_amount'   => (float) $this->total_amount,
            'status'         => $this->status,
            'notes'          => $this->notes,
            'supplier'       => $this->whenLoaded('supplier', fn () => new SupplierResource($this->supplier)),
            'creator'        => $this->whenLoaded('creator', fn () => [
                'id'   => $this->creator->id,
                'name' => $this->creator->name,
            ]),
            'details'        => $this->whenLoaded('details', fn () =>
                PurchaseDetailResource::collection($this->details)
            ),
            'created_at'     => $this->created_at?->toISOString(),
            'updated_at'     => $this->updated_at?->toISOString(),
        ];
    }
}
