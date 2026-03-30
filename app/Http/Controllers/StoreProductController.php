<?php

namespace App\Http\Controllers;

use App\Models\ProductBank;
use App\Models\StoreProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoreProductController extends Controller
{
    /**
     * Display a listing of products in the current store.
     */
    public function index(Request $request)
    {
        $products = StoreProduct::with('productBank.category')
            ->when($request->search, function ($query, $search) {
                $query->whereHas('productBank', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('store-products/Index', [
            'products' => $products,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show form to activate a product from the bank to the current store.
     */
    public function create()
    {
        // Get products from the bank that are not yet in this store
        $storeId = auth()->user()->store_id;
        
        $availableProducts = ProductBank::whereDoesntHave('storeProducts', function ($query) use ($storeId) {
            $query->where('store_id', $storeId);
        })->get();

        return Inertia::render('store-products/Form', [
            'availableProducts' => $availableProducts,
        ]);
    }

    /**
     * Create/Activate a product in the current store.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_bank_id' => 'required|exists:product_bank,id',
            'cost_price' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'is_active' => 'required|boolean',
        ]);

        $validated['store_id'] = auth()->user()->store_id;

        StoreProduct::create($validated);

        return redirect()->route('store-products.index')->with('success', 'Produk berhasil diaktifkan di toko ini.');
    }

    /**
     * Show form to edit store-specific product details.
     */
    public function edit(StoreProduct $storeProduct)
    {
        return Inertia::render('store-products/Form', [
            'storeProduct' => $storeProduct->load('productBank'),
        ]);
    }

    /**
     * Update store-specific product details.
     */
    public function update(Request $request, StoreProduct $storeProduct)
    {
        $validated = $request->validate([
            'cost_price' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'is_active' => 'required|boolean',
        ]);

        $storeProduct->update($validated);

        return redirect()->route('store-products.index')->with('success', 'Detail produk toko berhasil diperbarui.');
    }

    /**
     * Remove the product from the current store.
     */
    public function destroy(StoreProduct $storeProduct)
    {
        $storeProduct->delete();

        return redirect()->route('store-products.index')->with('success', 'Produk berhasil dinonaktifkan dari toko ini.');
    }
}
