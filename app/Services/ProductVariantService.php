<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;

class ProductVariantService
{
    /**
     * Search products/variants for POS
     */
    public function searchForPOS($query)
    {
        $results = [];
        
        // Search regular products (without variants)
        $products = Product::where('has_variants', false)
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
                'category' => $product->category->name,
                'display_name' => $product->name,
                'display_info' => "SKU: {$product->sku} | Stock: {$product->stock}",
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
            ];
        }
        
        return collect($results)->sortBy('name')->values();
    }
    
    /**
     * Get product/variant by barcode for POS
     */
    public function getByBarcode($barcode)
    {
        // Try to find product first
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
                'category' => $product->category->name,
                'display_name' => $product->name,
                'display_info' => "SKU: {$product->sku} | Stock: {$product->stock}",
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
            ];
        }
        
        return null;
    }
    
    /**
     * Check stock availability
     */
    public function checkStock($type, $id, $quantity)
    {
        if ($type === 'product') {
            $product = Product::find($id);
            return $product && $product->stock >= $quantity;
        } else {
            $variant = ProductVariant::find($id);
            return $variant && $variant->stock >= $quantity;
        }
    }
    
    /**
     * Reduce stock after sale
     */
    public function reduceStock($type, $id, $quantity)
    {
        if ($type === 'product') {
            $product = Product::find($id);
            if ($product && $product->stock >= $quantity) {
                $product->decrement('stock', $quantity);
                return true;
            }
        } else {
            $variant = ProductVariant::find($id);
            if ($variant && $variant->stock >= $quantity) {
                $variant->decrement('stock', $quantity);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Restore stock after void/refund
     */
    public function restoreStock($type, $id, $quantity)
    {
        if ($type === 'product') {
            $product = Product::find($id);
            if ($product) {
                $product->increment('stock', $quantity);
                return true;
            }
        } else {
            $variant = ProductVariant::find($id);
            if ($variant) {
                $variant->increment('stock', $quantity);
                return true;
            }
        }
        
        return false;
    }
}
