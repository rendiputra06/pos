<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\ProductBank;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ProductBankController extends Controller
{
    /**
     * Display a listing of the global product bank.
     * Accessible by Super Admin and possibly Store Admin for browsing.
     */
    public function index(Request $request)
    {
        $products = ProductBank::with('category')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($request->category_id, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('product-bank/Index', [
            'products' => $products,
            'categories' => Category::where('type', 'product')->get(),
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    /**
     * Show the form for creating a new global product.
     */
    public function create()
    {
        return Inertia::render('product-bank/Form', [
            'categories' => Category::where('type', 'product')->get(),
        ]);
    }

    /**
     * Store a newly created product in the bank.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:50|unique:product_bank,sku',
            'barcode' => 'nullable|string|max:50',
            'unit' => 'required|string|max:20',
        ]);

        if (empty($validated['sku'])) {
            $validated['sku'] = 'PROD-' . strtoupper(Str::random(8));
        }

        ProductBank::create($validated);

        return redirect()->route('product-bank.index')->with('success', 'Katalog produk berhasil dibuat.');
    }

    /**
     * Show the form for editing a global product.
     */
    public function edit(ProductBank $productBank)
    {
        return Inertia::render('product-bank/Form', [
            'product' => $productBank,
            'categories' => Category::where('type', 'product')->get(),
        ]);
    }

    /**
     * Update a global product.
     */
    public function update(Request $request, ProductBank $productBank)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:50|unique:product_bank,sku,' . $productBank->id,
            'barcode' => 'nullable|string|max:50',
            'unit' => 'required|string|max:20',
        ]);

        $productBank->update($validated);

        return redirect()->route('product-bank.index')->with('success', 'Katalog produk berhasil diperbarui.');
    }

    /**
     * Remove a global product.
     */
    public function destroy(ProductBank $productBank)
    {
        $productBank->delete();

        return redirect()->route('product-bank.index')->with('success', 'Produk bank berhasil dihapus.');
    }
}
