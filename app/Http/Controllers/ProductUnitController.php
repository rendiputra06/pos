<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductUnit;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductUnitController extends Controller
{
    /**
     * Store a new unit for a product
     */
    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:30',
            'sku' => 'required|string|max:50|unique:product_units,sku',
            'barcode' => 'nullable|string|max:50|unique:product_units,barcode',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'conversion_factor' => 'required|numeric|min:0.01',
            'is_base_unit' => 'boolean',
            'is_active' => 'boolean',
        ]);

        // If setting as base unit, check if one already exists
        if ($validated['is_base_unit'] ?? false) {
            $existingBase = $product->baseUnit;
            if ($existingBase) {
                $existingBase->update(['is_base_unit' => false]);
            }
        }

        // If first unit for product, make it base unit automatically
        if ($product->units()->count() === 0) {
            $validated['is_base_unit'] = true;
        }

        $validated['product_id'] = $product->id;
        $validated['display_order'] = $product->units()->count();

        ProductUnit::create($validated);

        return back()->with('success', 'Satuan berhasil ditambahkan.');
    }

    /**
     * Update a unit
     */
    public function update(Request $request, Product $product, ProductUnit $unit)
    {
        // Ensure unit belongs to product
        if ($unit->product_id !== $product->id) {
            return back()->with('error', 'Satuan tidak ditemukan untuk produk ini.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:30',
            'sku' => 'required|string|max:50|unique:product_units,sku,' . $unit->id,
            'barcode' => 'nullable|string|max:50|unique:product_units,barcode,' . $unit->id,
            'price' => 'required|numeric|min:0',
            'cost_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'conversion_factor' => 'required|numeric|min:0.01',
            'is_base_unit' => 'boolean',
            'is_active' => 'boolean',
        ]);

        // If setting as base unit
        if ($validated['is_base_unit'] ?? false) {
            $existingBase = $product->baseUnit()->where('id', '!=', $unit->id)->first();
            if ($existingBase) {
                $existingBase->update(['is_base_unit' => false]);
            }
        } else {
            // Ensure we always have at least one base unit
            if ($unit->is_base_unit) {
                return back()->with('error', 'Tidak dapat menghapus status base unit. Set unit lain sebagai base unit terlebih dahulu.');
            }
        }

        $unit->update($validated);

        return back()->with('success', 'Satuan berhasil diperbarui.');
    }

    /**
     * Delete a unit
     */
    public function destroy(Product $product, ProductUnit $unit)
    {
        // Ensure unit belongs to product
        if ($unit->product_id !== $product->id) {
            return back()->with('error', 'Satuan tidak ditemukan untuk produk ini.');
        }

        // Cannot delete base unit if it's the only one
        if ($unit->is_base_unit && $product->units()->count() === 1) {
            return back()->with('error', 'Tidak dapat menghapus base unit terakhir. Tambahkan unit lain terlebih dahulu.');
        }

        $unit->delete();

        return back()->with('success', 'Satuan berhasil dihapus.');
    }

    /**
     * Set a unit as the default base unit
     */
    public function setAsBaseUnit(Product $product, ProductUnit $unit)
    {
        // Ensure unit belongs to product
        if ($unit->product_id !== $product->id) {
            return back()->with('error', 'Satuan tidak ditemukan untuk produk ini.');
        }

        // Unset current base unit
        $product->units()->where('is_base_unit', true)->update(['is_base_unit' => false]);

        // Set new base unit
        $unit->update(['is_base_unit' => true]);

        return back()->with('success', "'{$unit->name}' sekarang menjadi satuan dasar.");
    }

    /**
     * Get all units for a product (API endpoint)
     */
    public function index(Product $product)
    {
        $units = $product->units()->orderBy('display_order')->get();

        return response()->json([
            'success' => true,
            'data' => $units,
        ]);
    }

    /**
     * Bulk create units for a product
     */
    public function bulkStore(Request $request, Product $product)
    {
        $validated = $request->validate([
            'units' => 'required|array|min:1',
            'units.*.name' => 'required|string|max:30',
            'units.*.sku' => 'required|string|max:50|unique:product_units,sku',
            'units.*.barcode' => 'nullable|string|max:50|unique:product_units,barcode',
            'units.*.price' => 'required|numeric|min:0',
            'units.*.cost_price' => 'required|numeric|min:0',
            'units.*.conversion_factor' => 'required|numeric|min:0.01',
        ]);

        $createdCount = 0;
        $baseUnitSet = false;

        foreach ($validated['units'] as $index => $unitData) {
            // First unit becomes base unit automatically
            if ($index === 0 && $product->units()->count() === 0) {
                $unitData['is_base_unit'] = true;
                $unitData['stock'] = $unitData['stock'] ?? 0;
                $baseUnitSet = true;
            } else {
                $unitData['is_base_unit'] = false;
                $unitData['stock'] = 0; // Non-base units don't hold stock
            }

            $unitData['product_id'] = $product->id;
            $unitData['display_order'] = $index;
            $unitData['is_active'] = true;

            ProductUnit::create($unitData);
            $createdCount++;
        }

        return back()->with('success', "{$createdCount} satuan berhasil ditambahkan.");
    }

    /**
     * Update display order for units
     */
    public function updateOrder(Request $request, Product $product)
    {
        $validated = $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|integer|exists:product_units,id',
            'orders.*.display_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['orders'] as $orderData) {
            $unit = ProductUnit::where('id', $orderData['id'])
                ->where('product_id', $product->id)
                ->first();

            if ($unit) {
                $unit->update(['display_order' => $orderData['display_order']]);
            }
        }

        return back()->with('success', 'Urutan satuan diperbarui.');
    }
}
