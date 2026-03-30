<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\ProductBank;
use App\Models\StoreProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display a listing of products for the CURRENT STORE.
     */
    public function index(Request $request)
    {
        $products = StoreProduct::with(['productBank.category'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('productBank', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($request->category_id, function ($query, $categoryId) {
                $query->whereHas('productBank', function ($q) use ($categoryId) {
                    $q->where('category_id', $categoryId);
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // Map results to match original frontend expectations if necessary
        $products->getCollection()->transform(function ($sp) {
            return [
                'id' => $sp->id,
                'product_bank_id' => $sp->product_bank_id,
                'name' => $sp->productBank->name,
                'sku' => $sp->productBank->sku,
                'barcode' => $sp->productBank->barcode,
                'unit' => $sp->productBank->unit,
                'category' => $sp->productBank->category,
                'cost_price' => $sp->cost_price,
                'price' => $sp->price,
                'stock' => $sp->stock,
                'image' => $sp->productBank->image,
            ];
        });

        return Inertia::render('products/Index', [
            'products' => $products,
            'categories' => Category::where('type', 'product')->get(),
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    public function create()
    {
        return Inertia::render('products/Form', [
            'categories' => Category::where('type', 'product')->get(),
            'productBank' => ProductBank::all(), // To allow choosing from bank
        ]);
    }

    /**
     * In the multi-store logic, "creating" a product in a store 
     * usually means either adding to bank AND store, or just activating from bank.
     * For simplicity in the existing UI, we'll implement it as adding both.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:50|unique:product_bank,sku',
            'barcode' => 'nullable|string|max:50',
            'cost_price' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'unit' => 'required|string|max:20',
        ]);

        if (empty($validated['sku'])) {
            $validated['sku'] = 'PROD-' . strtoupper(Str::random(8));
        }

        // 1. Create in Product Bank
        $productBank = ProductBank::create([
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'sku' => $validated['sku'],
            'barcode' => $validated['barcode'],
            'unit' => $validated['unit'],
        ]);

        // 2. Create in Store Product
        StoreProduct::create([
            'store_id' => auth()->user()->store_id,
            'product_bank_id' => $productBank->id,
            'cost_price' => $validated['cost_price'],
            'price' => $validated['price'],
            'stock' => $validated['stock'],
        ]);

        return redirect()->route('products.index')->with('success', 'Produk berhasil dibuat.');
    }

    public function edit(StoreProduct $product)
    {
        return Inertia::render('products/Form', [
            'product' => [
                'id' => $product->id,
                'category_id' => $product->productBank->category_id,
                'name' => $product->productBank->name,
                'sku' => $product->productBank->sku,
                'barcode' => $product->productBank->barcode,
                'cost_price' => $product->cost_price,
                'price' => $product->price,
                'stock' => $product->stock,
                'unit' => $product->productBank->unit,
            ],
            'categories' => Category::where('type', 'product')->get(),
        ]);
    }

    public function update(Request $request, StoreProduct $product)
    {
        $validated = $request->validate([
            'cost_price' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            // Note: Global attributes like name/sku updated via ProductBankController or here if allowed
        ]);

        $product->update($validated);

        return redirect()->route('products.index')->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(StoreProduct $product)
    {
        $product->delete();

        return redirect()->route('products.index')->with('success', 'Produk berhasil dihapus dari toko ini.');
    }

    public function barcode(StoreProduct $product)
    {
        return Inertia::render('products/Barcode', [
            'product' => [
                'name' => $product->productBank->name,
                'barcode' => $product->productBank->barcode,
                'sku' => $product->productBank->sku,
            ],
        ]);
    }
}

