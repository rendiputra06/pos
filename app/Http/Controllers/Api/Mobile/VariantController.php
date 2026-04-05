<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Resources\Mobile\ProductVariantResource;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VariantController extends Controller
{
    /**
     * List all variants for a product.
     *
     * GET /api/mobile/v1/products/{product}/variants
     */
    public function index(Product $product)
    {
        $product->load(['variants.media', 'variantGroups.options']);

        return response()->json([
            'success' => true,
            'data'    => ProductVariantResource::collection($product->variants),
        ]);
    }

    /**
     * Create a new variant for a product.
     *
     * POST /api/mobile/v1/products/{product}/variants
     */
    public function store(Request $request, Product $product)
    {
        $request->validate([
            'sku'         => 'nullable|string|max:50|unique:product_variants,sku',
            'barcode'     => 'nullable|string|max:50',
            'price'       => 'required|numeric|min:0',
            'cost_price'  => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'unit'        => 'nullable|string|max:20',
            'combination' => 'nullable|array',
            'is_active'   => 'boolean',
        ]);

        $variant = $product->variants()->create([
            'sku'         => $request->sku ?? ('VAR-' . strtoupper(Str::random(6))),
            'barcode'     => $request->barcode,
            'price'       => $request->price,
            'cost_price'  => $request->cost_price,
            'stock'       => $request->stock,
            'unit'        => $request->unit ?? $product->unit,
            'combination' => $request->combination ?? [],
            'combination_hash' => $request->combination
                ? ProductVariant::generateCombinationHash($request->combination)
                : md5((string) now()->timestamp),
            'display_order' => $product->variants()->count(),
            'is_active'     => $request->boolean('is_active', true),
        ]);

        $variant->load('media');

        return response()->json([
            'success' => true,
            'message' => 'Variant created successfully.',
            'data'    => new ProductVariantResource($variant),
        ], 201);
    }

    /**
     * Update a variant.
     *
     * PUT /api/mobile/v1/products/{product}/variants/{variant}
     */
    public function update(Request $request, Product $product, ProductVariant $variant)
    {
        abort_if($variant->product_id !== $product->id, 404, 'Variant not found for this product.');

        $request->validate([
            'sku'        => 'nullable|string|max:50|unique:product_variants,sku,' . $variant->id,
            'barcode'    => 'nullable|string|max:50',
            'price'      => 'required|numeric|min:0',
            'cost_price' => 'required|numeric|min:0',
            'stock'      => 'required|integer|min:0',
            'unit'       => 'nullable|string|max:20',
            'is_active'  => 'boolean',
        ]);

        $variant->update($request->only([
            'sku', 'barcode', 'price', 'cost_price', 'stock', 'unit', 'is_active',
        ]));

        $variant->load('media');

        return response()->json([
            'success' => true,
            'message' => 'Variant updated successfully.',
            'data'    => new ProductVariantResource($variant),
        ]);
    }

    /**
     * Delete a variant.
     *
     * DELETE /api/mobile/v1/products/{product}/variants/{variant}
     */
    public function destroy(Product $product, ProductVariant $variant)
    {
        abort_if($variant->product_id !== $product->id, 404, 'Variant not found for this product.');

        $variant->delete();

        return response()->json([
            'success' => true,
            'message' => 'Variant deleted successfully.',
        ]);
    }
}
