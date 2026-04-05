<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Resources\Mobile\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class ProductController extends Controller
{
    /**
     * List products with optional search, category filter, and barcode filter.
     *
     * GET /api/mobile/v1/products
     *   ?search=keyword
     *   ?category_id=1
     *   ?has_variants=1|0
     *   ?per_page=15
     */
    public function index(Request $request)
    {
        $products = Product::with(['category', 'media', 'primaryVariant.media'])
            ->withCount('variants')
            ->withSum('variants as total_stock', 'stock')
            ->withMin('variants as min_price', 'price')
            ->withMax('variants as max_price', 'price')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%")
                      ->orWhere('barcode', 'like', "%{$search}%");
                });
            })
            ->when($request->category_id, fn ($q, $id) => $q->where('category_id', $id))
            ->when($request->has_variants !== null && $request->has_variants !== '', function ($q) use ($request) {
                $q->where('has_variants', filter_var($request->has_variants, FILTER_VALIDATE_BOOLEAN));
            })
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data'    => ProductResource::collection($products),
            'meta'    => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
            ],
        ]);
    }

    /**
     * Show a single product with variants.
     *
     * GET /api/mobile/v1/products/{id}
     */
    public function show(Product $product)
    {
        $product->load(['category', 'media', 'variants.media', 'variantGroups.options']);

        return response()->json([
            'success' => true,
            'data'    => new ProductResource($product),
        ]);
    }

    /**
     * Find product by barcode (product or variant barcode).
     *
     * GET /api/mobile/v1/products/barcode/{code}
     */
    public function findByBarcode(string $code)
    {
        // Check product barcode first
        $product = Product::with(['category', 'media', 'variants.media', 'variantGroups.options'])
            ->where('barcode', $code)
            ->first();

        if ($product) {
            return response()->json([
                'success' => true,
                'type'    => 'product',
                'data'    => new ProductResource($product),
            ]);
        }

        // Check variant barcode
        $variant = \App\Models\ProductVariant::with(['product.category', 'product.media', 'media'])
            ->where('barcode', $code)
            ->first();

        if ($variant) {
            $variant->product->load(['variants.media', 'variantGroups.options']);
            return response()->json([
                'success'    => true,
                'type'       => 'variant',
                'variant_id' => $variant->id,
                'data'       => new ProductResource($variant->product),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Product or variant with that barcode was not found.',
        ], 404);
    }

    /**
     * Create a new product.
     *
     * POST /api/mobile/v1/products
     */
    public function store(Request $request)
    {
        $rules = [
            'category_id'  => 'required|exists:categories,id',
            'name'         => 'required|string|max:255',
            'sku'          => 'nullable|string|max:50|unique:products,sku',
            'barcode'      => 'nullable|string|max:50',
            'unit'         => 'required|string|max:20',
            'has_variants' => 'boolean',
            'image'        => 'nullable|image|mimes:jpeg,png,webp|max:2048',
        ];

        if (! $request->boolean('has_variants')) {
            $rules['cost_price'] = 'required|numeric|min:0';
            $rules['price']      = 'required|numeric|min:0';
            $rules['stock']      = 'required|integer|min:0';
        }

        $validated = $request->validate($rules);

        if (empty($validated['sku'])) {
            $validated['sku'] = 'PROD-' . strtoupper(Str::random(8));
        }

        $product = Product::create($validated);

        if ($request->hasFile('image')) {
            $product->addMediaFromRequest('image')
                ->toMediaCollection('product_images');
        }

        $product->load(['category', 'media']);

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully.',
            'data'    => new ProductResource($product),
        ], 201);
    }

    /**
     * Update an existing product.
     *
     * PUT /api/mobile/v1/products/{id}
     */
    public function update(Request $request, Product $product)
    {
        $rules = [
            'category_id'  => 'required|exists:categories,id',
            'name'         => 'required|string|max:255',
            'sku'          => 'nullable|string|max:50|unique:products,sku,' . $product->id,
            'barcode'      => 'nullable|string|max:50',
            'unit'         => 'required|string|max:20',
            'has_variants' => 'boolean',
            'image'        => 'nullable|image|mimes:jpeg,png,webp|max:2048',
        ];

        if (! $request->boolean('has_variants')) {
            $rules['cost_price'] = 'required|numeric|min:0';
            $rules['price']      = 'required|numeric|min:0';
            $rules['stock']      = 'required|integer|min:0';
        }

        $validated = $request->validate($rules);

        if ($request->boolean('has_variants')) {
            $validated['stock'] = 0;
        }

        $product->update($validated);

        if ($request->hasFile('image')) {
            $product->clearMediaCollection('product_images');
            $product->addMediaFromRequest('image')
                ->toMediaCollection('product_images');
        }

        $product->load(['category', 'media']);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully.',
            'data'    => new ProductResource($product),
        ]);
    }

    /**
     * Delete a product.
     *
     * DELETE /api/mobile/v1/products/{id}
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully.',
        ]);
    }

    /**
     * Get products with low stock.
     *
     * GET /api/mobile/v1/products/low-stock
     */
    public function lowStock(Request $request)
    {
        $threshold = $request->threshold ?? 5;
        
        $products = Product::with(['category', 'media', 'primaryVariant.media'])
            ->withCount('variants')
            ->withSum('variants as total_stock', 'stock')
            ->where(function ($query) use ($threshold) {
                $query->where(function ($q) use ($threshold) {
                    $q->where('has_variants', false)
                      ->where('stock', '<=', $threshold);
                })->orWhere(function ($q) use ($threshold) {
                    $q->where('has_variants', true)
                      ->whereHas('variants', function ($v) use ($threshold) {
                          $v->where('stock', '<=', $threshold);
                      });
                });
            })
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data'    => ProductResource::collection($products),
            'meta'    => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
            ],
        ]);
    }

    /**
     * Upload an image to product gallery.
     *
     * POST /api/mobile/v1/products/{product}/images
     */
    public function uploadImage(Request $request, Product $product)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,webp|max:2048',
        ]);

        $product->addMediaFromRequest('image')
            ->toMediaCollection('product_images');

        return response()->json([
            'success' => true,
            'message' => 'Image uploaded successfully.',
            'data'    => new ProductResource($product->fresh(['media'])),
        ]);
    }

    /**
     * Remove an image from product gallery.
     *
     * DELETE /api/mobile/v1/products/{product}/images/{media}
     */
    public function removeImage(Product $product, Media $media)
    {
        // Security check: ensure media belongs to product
        if ($media->model_id !== $product->id || $media->model_type !== get_class($product)) {
            return response()->json([
                'success' => false,
                'message' => 'Image not found for this product.',
            ], 404);
        }

        $media->delete();

        return response()->json([
            'success' => true,
            'message' => 'Image removed successfully.',
        ]);
    }
}
