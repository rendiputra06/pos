<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Resources\Mobile\VariantGroupResource;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\VariantGroup;
use App\Models\VariantOption;
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

    /**
     * List all variant groups for a product.
     */
    public function indexGroups(Product $product)
    {
        $product->load('variantGroups.options');

        return response()->json([
            'success' => true,
            'data'    => VariantGroupResource::collection($product->variantGroups),
        ]);
    }

    /**
     * Create variant group.
     */
    public function storeGroup(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:size,color,material',
            'is_required' => 'boolean',
        ]);

        $group = $product->variantGroups()->create([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'display_order' => $product->variantGroups()->count(),
            'is_required' => $validated['is_required'] ?? false,
        ]);

        // Add standard options like web version
        $standardOptions = VariantGroup::getStandardOptions($validated['type']);
        foreach ($standardOptions as $index => $option) {
            $group->options()->create([
                'value' => $option['value'],
                'display_value' => $option['display_value'],
                'color_code' => $option['color_code'] ?? null,
                'display_order' => $index,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Variant group created with standard options.',
            'data'    => new VariantGroupResource($group->load('options')),
        ], 201);
    }

    /**
     * Update variant group.
     */
    public function updateGroup(Request $request, Product $product, VariantGroup $group)
    {
        abort_if($group->product_id !== $product->id, 404);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_required' => 'boolean',
        ]);

        $group->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Variant group updated successfully.',
            'data'    => new VariantGroupResource($group),
        ]);
    }

    /**
     * Delete variant group.
     */
    public function destroyGroup(Product $product, VariantGroup $group)
    {
        abort_if($group->product_id !== $product->id, 404);

        $group->delete();

        return response()->json([
            'success' => true,
            'message' => 'Variant group deleted successfully.',
        ]);
    }

    /**
     * Create variant option.
     */
    public function storeOption(Request $request, Product $product, VariantGroup $group)
    {
        abort_if($group->product_id !== $product->id, 404);

        $validated = $request->validate([
            'value' => 'required|string|max:255',
            'display_value' => 'required|string|max:255',
            'color_code' => 'nullable|string|max:7',
        ]);

        $option = $group->options()->create([
            'value' => $validated['value'],
            'display_value' => $validated['display_value'],
            'color_code' => $validated['color_code'] ?? null,
            'display_order' => $group->options()->count(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Option added successfully.',
            'data'    => new VariantGroupResource($group->load('options')),
        ], 201);
    }

    /**
     * Update variant option.
     */
    public function updateOption(Request $request, Product $product, VariantGroup $group, VariantOption $option)
    {
        abort_if($group->product_id !== $product->id || $option->variant_group_id !== $group->id, 404);

        $validated = $request->validate([
            'value' => 'required|string|max:255',
            'display_value' => 'required|string|max:255',
            'color_code' => 'nullable|string|max:7',
            'is_active' => 'boolean',
        ]);

        $option->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Option updated successfully.',
        ]);
    }

    /**
     * Delete variant option.
     */
    public function destroyOption(Product $product, VariantGroup $group, VariantOption $option)
    {
        abort_if($group->product_id !== $product->id || $option->variant_group_id !== $group->id, 404);

        $option->delete();

        return response()->json([
            'success' => true,
            'message' => 'Option deleted successfully.',
        ]);
    }

    /**
     * Auto-generate all variant combinations.
     */
    public function generateVariants(Product $product)
    {
        $variantGroups = $product->variantGroups()->with('activeOptions')->get();

        if ($variantGroups->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No variant groups available for this product.',
            ], 400);
        }

        $combinations = $this->_generateCombinations($variantGroups);
        $createdCount = 0;

        foreach ($combinations as $combination) {
            $hash = ProductVariant::generateCombinationHash($combination);
            
            if (!ProductVariant::where('combination_hash', $hash)->exists()) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => ProductVariant::generateSKU($product->name, $combination),
                    'barcode' => 'VAR' . str_pad(mt_rand(1, 999999999), 9, '0', STR_PAD_LEFT),
                    'price' => $product->price,
                    'cost_price' => $product->cost_price,
                    'stock' => 0,
                    'unit' => $product->unit,
                    'combination' => $combination,
                    'combination_hash' => $hash,
                    'display_order' => $product->variants()->count(),
                ]);
                $createdCount++;
            }
        }

        $product->update(['has_variants' => true]);

        return response()->json([
            'success' => true,
            'message' => "Generated {$createdCount} new variants.",
        ]);
    }

    /**
     * Helper to generate combinations (same logic as web controller).
     */
    private function _generateCombinations($variantGroups)
    {
        $combinations = [[]];
        foreach ($variantGroups as $group) {
            $temp = [];
            foreach ($combinations as $combination) {
                foreach ($group->activeOptions as $option) {
                    $newCombination = $combination;
                    $newCombination[$group->type] = $option->value;
                    $temp[] = $newCombination;
                }
            }
            $combinations = $temp;
        }
        return $combinations;
    }

    /**
     * Upload variant image.
     */
    public function uploadVariantImage(Request $request, Product $product, ProductVariant $variant)
    {
        abort_if($variant->product_id !== $product->id, 404);

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,webp|max:2048',
        ]);

        $variant->clearMediaCollection('variant_images');
        $variant->addMediaFromRequest('image')
            ->toMediaCollection('variant_images');

        return response()->json([
            'success' => true,
            'message' => 'Variant image uploaded.',
            'data'    => new \App\Http\Resources\Mobile\ProductVariantResource($variant->fresh('media')),
        ]);
    }

    /**
     * Remove variant image.
     */
    public function removeVariantImage(Product $product, ProductVariant $variant)
    {
        abort_if($variant->product_id !== $product->id, 404);

        $variant->clearMediaCollection('variant_images');

        return response()->json([
            'success' => true,
            'message' => 'Variant image removed.',
        ]);
    }
}
