<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'sku'           => $this->sku,
            'barcode'       => $this->barcode,
            'cost_price'    => (float) $this->cost_price,
            'price'         => (float) $this->price,
            'stock'         => (int) $this->stock,
            'total_stock'   => (int) $this->total_stock,
            'unit'          => $this->unit,
            'has_variants'  => (bool) $this->has_variants,
            'min_price'     => $this->min_price !== null ? (float) $this->min_price : null,
            'max_price'     => $this->max_price !== null ? (float) $this->max_price : null,
            // Images
            'thumbnail_url'     => $this->thumbnail_url,
            'medium_url'        => $this->medium_url,
            'original_url'      => $this->original_url,
            'primary_image_url' => $this->primary_image_url,
            // Relations
            'category'    => $this->whenLoaded('category', fn () => new CategoryResource($this->category)),
            'variants'    => $this->whenLoaded('variants', fn () => ProductVariantResource::collection($this->variants)),
            'variant_groups' => $this->whenLoaded('variantGroups', fn () => $this->variantGroups->map(fn ($g) => [
                'id'      => $g->id,
                'name'    => $g->name,
                'options' => $g->options->map(fn ($o) => [
                    'id'    => $o->id,
                    'value' => $o->value,
                ]),
            ])),
            // Counts (when available via withCount)
            'variants_count'        => $this->whenNotNull($this->variants_count ?? null),
            'active_variants_count' => $this->whenNotNull($this->active_variants_count ?? null),
            'created_at'  => $this->created_at?->toISOString(),
            'updated_at'  => $this->updated_at?->toISOString(),
        ];
    }
}
