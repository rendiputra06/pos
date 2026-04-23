<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\ProductVariant;

class ProductVariantService
{
    /**
     * Search products/variants/units for POS
     */
    public function searchForPOS($query)
    {
        $results = [];

        // Search products with multiple units first
        $multiUnitProducts = Product::where('stock', '>', 0)
            ->whereHas('units', function ($q) {
                $q->where('is_active', true);
            })
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('sku', 'like', "%{$query}%")
                  ->orWhere('barcode', 'like', "%{$query}%");
            })
            ->with(['category', 'activeUnits'])
            ->get();

        foreach ($multiUnitProducts as $product) {
            foreach ($product->activeUnits as $unit) {
                $results[] = [
                    'id' => $product->id,
                    'unit_id' => $unit->id,
                    'type' => 'product',
                    'name' => $product->name,
                    'sku' => $unit->sku,
                    'barcode' => $unit->barcode,
                    'price' => $unit->price,
                    'stock' => $unit->getEffectiveStock(),
                    'unit' => $unit->name,
                    'conversion_factor' => $unit->conversion_factor,
                    'category' => $product->category->name,
                    'display_name' => $product->name . ' (' . $unit->name . ')',
                    'display_info' => "SKU: {$unit->sku} | Stock: " . $unit->getEffectiveStock() . " {$unit->name}",
                    'has_multiple_units' => true,
                ];
            }
        }

        // Search regular products (without variants and without multiple units)
        $products = Product::where('has_variants', false)
            ->where(function ($q) {
                $q->whereDoesntHave('units')->orWhereHas('units', function ($uq) {
                    $uq->where('is_active', false);
                });
            })
            ->where('stock', '>', 0)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('sku', 'like', "%{$query}%")
                  ->orWhere('barcode', 'like', "%{$query}%");
            })
            ->with('category')
            ->get();

        foreach ($products as $product) {
            $results[] = [
                'id' => $product->id,
                'type' => 'product',
                'name' => $product->name,
                'sku' => $product->sku,
                'barcode' => $product->barcode,
                'price' => $product->price,
                'stock' => $product->stock,
                'unit' => $product->unit,
                'category' => $product->category->name,
                'display_name' => $product->name,
                'display_info' => "SKU: {$product->sku} | Stock: {$product->stock}",
                'has_multiple_units' => false,
            ];
        }

        // Search variants
        $variants = ProductVariant::where('stock', '>', 0)
            ->where('is_active', true)
            ->whereHas('product', function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%");
            })
            ->orWhere(function ($q) use ($query) {
                $q->where('sku', 'like', "%{$query}%")
                  ->orWhere('barcode', 'like', "%{$query}%");
            })
            ->with('product.category')
            ->get();

        foreach ($variants as $variant) {
            $results[] = [
                'id' => $variant->id,
                'type' => 'variant',
                'name' => $variant->product->name,
                'sku' => $variant->sku,
                'barcode' => $variant->barcode,
                'price' => $variant->price,
                'stock' => $variant->stock,
                'category' => $variant->product->category->name,
                'display_name' => $variant->product->name . ' - ' . $variant->formatted_combination,
                'display_info' => "SKU: {$variant->sku} | Stock: {$variant->stock} | {$variant->formatted_combination}",
                'product_id' => $variant->product_id,
                'combination' => $variant->formatted_combination,
                'has_multiple_units' => false,
            ];
        }

        return collect($results)->sortBy('name')->values();
    }
    
    /**
     * Get product/variant/unit by barcode for POS
     */
    public function getByBarcode($barcode)
    {
        // Try to find product unit first (most specific)
        $unit = ProductUnit::where('barcode', $barcode)
            ->where('is_active', true)
            ->with('product.category')
            ->first();

        if ($unit) {
            $product = $unit->product;
            return [
                'id' => $product->id,
                'unit_id' => $unit->id,
                'type' => 'product',
                'name' => $product->name,
                'sku' => $unit->sku,
                'barcode' => $unit->barcode,
                'price' => $unit->price,
                'stock' => $unit->getEffectiveStock(),
                'unit' => $unit->name,
                'conversion_factor' => $unit->conversion_factor,
                'category' => $product->category->name,
                'display_name' => $product->name . ' (' . $unit->name . ')',
                'display_info' => "SKU: {$unit->sku} | Stock: " . $unit->getEffectiveStock() . " {$unit->name}",
                'has_multiple_units' => true,
            ];
        }

        // Try to find product (simple product without variants)
        $product = Product::where('barcode', $barcode)
            ->where('has_variants', false)
            ->where('stock', '>', 0)
            ->with('category')
            ->first();

        if ($product) {
            return [
                'id' => $product->id,
                'type' => 'product',
                'name' => $product->name,
                'sku' => $product->sku,
                'barcode' => $product->barcode,
                'price' => $product->price,
                'stock' => $product->stock,
                'unit' => $product->unit,
                'category' => $product->category->name,
                'display_name' => $product->name,
                'display_info' => "SKU: {$product->sku} | Stock: {$product->stock}",
                'has_multiple_units' => false,
            ];
        }

        // Try to find variant
        $variant = ProductVariant::where('barcode', $barcode)
            ->where('stock', '>', 0)
            ->where('is_active', true)
            ->with('product.category')
            ->first();

        if ($variant) {
            return [
                'id' => $variant->id,
                'type' => 'variant',
                'name' => $variant->product->name,
                'sku' => $variant->sku,
                'barcode' => $variant->barcode,
                'price' => $variant->price,
                'stock' => $variant->stock,
                'category' => $variant->product->category->name,
                'display_name' => $variant->product->name . ' - ' . $variant->formatted_combination,
                'display_info' => "SKU: {$variant->sku} | Stock: {$variant->stock} | {$variant->formatted_combination}",
                'product_id' => $variant->product_id,
                'combination' => $variant->formatted_combination,
                'has_multiple_units' => false,
            ];
        }

        return null;
    }
    
    /**
     * Check stock availability
     * For multi-unit products, $id is product_id and $unitId should be provided
     */
    public function checkStock($type, $id, $quantity, $unitId = null)
    {
        if ($type === 'product') {
            $product = Product::find($id);
            if (!$product) {
                return false;
            }

            // If unit_id is provided, check unit's effective stock
            if ($unitId) {
                $unit = ProductUnit::where('id', $unitId)
                    ->where('product_id', $id)
                    ->first();
                if ($unit) {
                    return $unit->getEffectiveStock() >= $quantity;
                }
            }

            // Standard product stock check
            return $product->stock >= $quantity;
        } else {
            $variant = ProductVariant::find($id);
            return $variant && $variant->stock >= $quantity;
        }
    }

    /**
     * Reduce stock after sale
     * For multi-unit products, deduct from base unit using conversion factor
     */
    public function reduceStock($type, $id, $quantity, $unitId = null)
    {
        if ($type === 'product') {
            $product = Product::find($id);
            if (!$product) {
                return false;
            }

            // If unit_id is provided, calculate base quantity and deduct from base unit
            if ($unitId) {
                $unit = ProductUnit::where('id', $unitId)
                    ->where('product_id', $id)
                    ->first();

                if ($unit) {
                    $baseUnit = $product->baseUnit;
                    if ($baseUnit) {
                        $baseQty = $quantity * $unit->conversion_factor;
                        if ($baseUnit->stock >= $baseQty) {
                            $baseUnit->decrement('stock', $baseQty);
                            return true;
                        }
                    }
                    return false;
                }
            }

            // Standard product stock reduction
            if ($product->stock >= $quantity) {
                $product->decrement('stock', $quantity);
                return true;
            }

            return false;
        } else {
            $variant = ProductVariant::find($id);
            if ($variant && $variant->stock >= $quantity) {
                $variant->decrement('stock', $quantity);
                return true;
            }
            return false;
        }
    }

    /**
     * Restore stock after void/refund
     * For multi-unit products, restore to base unit using conversion factor
     */
    public function restoreStock($type, $id, $quantity, $unitId = null)
    {
        if ($type === 'product') {
            $product = Product::find($id);
            if (!$product) {
                return false;
            }

            // If unit_id is provided, restore to base unit
            if ($unitId) {
                $unit = ProductUnit::where('id', $unitId)
                    ->where('product_id', $id)
                    ->first();

                if ($unit) {
                    $baseUnit = $product->baseUnit;
                    if ($baseUnit) {
                        $baseQty = $quantity * $unit->conversion_factor;
                        $baseUnit->increment('stock', $baseQty);
                        return true;
                    }
                }
                return false;
            }

            // Standard product stock restoration
            $product->increment('stock', $quantity);
            return true;
        } else {
            $variant = ProductVariant::find($id);
            if ($variant) {
                $variant->increment('stock', $quantity);
                return true;
            }
            return false;
        }
    }
}
