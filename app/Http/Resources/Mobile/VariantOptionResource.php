<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VariantOptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'variant_group_id' => $this->variant_group_id,
            'value' => $this->value,
            'display_value' => $this->display_value,
            'color_code' => $this->color_code,
            'display_order' => $this->display_order,
            'is_active' => $this->is_active,
        ];
    }
}
