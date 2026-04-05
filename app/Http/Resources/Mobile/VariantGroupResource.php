<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VariantGroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'name' => $this->name,
            'type' => $this->type,
            'display_order' => $this->display_order,
            'is_required' => $this->is_required,
            'options' => VariantOptionResource::collection($this->whenLoaded('options')),
        ];
    }
}
