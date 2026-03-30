<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\ProductBank;
use App\Models\StoreProduct;
use App\Models\Service;
use App\Models\ServicePriceLevel;
use App\Models\Store;
use Illuminate\Support\Str;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil toko pertama untuk data awal
        $store = Store::first();
        if (!$store) {
            $store = Store::create([
                'name' => 'Toko Default',
                'slug' => 'toko-default',
                'is_active' => true,
            ]);
        }

        // Bersihkan data lama untuk konsistensi
        Category::query()->delete();
        ProductBank::query()->delete();
        StoreProduct::query()->delete();
        Service::query()->delete();
        ServicePriceLevel::query()->delete();

        // 1. Categories
        $atkCat = Category::create([
            'name' => 'Alat Tulis Kantor',
            'slug' => 'alat-tulis-kantor',
            'type' => 'product',
        ]);

        $kertasCat = Category::create([
            'name' => 'Kertas & Rim',
            'slug' => 'kertas-dan-rim',
            'type' => 'product',
        ]);

        $fcCat = Category::create([
            'name' => 'Jasa Fotocopy',
            'slug' => 'jasa-fotocopy',
            'type' => 'service',
        ]);

        $printCat = Category::create([
            'name' => 'Jasa Printing',
            'slug' => 'jasa-printing',
            'type' => 'service',
        ]);

        // 2. Product Bank (Global Catalog)
        $sidu = ProductBank::create([
            'category_id' => $atkCat->id,
            'name' => 'Buku Tulis Sidu 38 Lembar',
            'sku' => 'SIDU-38',
            'unit' => 'pcs',
        ]);

        $hitech = ProductBank::create([
            'category_id' => $atkCat->id,
            'name' => 'Pulpen Hi-Tech 0.3 Black',
            'sku' => 'HITECH-03-B',
            'unit' => 'pcs',
        ]);

        $hvs = ProductBank::create([
            'category_id' => $kertasCat->id,
            'name' => 'Kertas HVS A4 70gr PaperOne',
            'sku' => 'HVS-A4-70-P1',
            'unit' => 'rim',
        ]);

        // 3. Store Products (Store Specific)
        StoreProduct::create([
            'store_id' => $store->id,
            'product_bank_id' => $sidu->id,
            'cost_price' => 3000,
            'price' => 5000,
            'stock' => 100,
            'is_active' => true,
        ]);

        StoreProduct::create([
            'store_id' => $store->id,
            'product_bank_id' => $hitech->id,
            'cost_price' => 12000,
            'price' => 15000,
            'stock' => 50,
            'is_active' => true,
        ]);

        StoreProduct::create([
            'store_id' => $store->id,
            'product_bank_id' => $hvs->id,
            'cost_price' => 45000,
            'price' => 55000,
            'stock' => 20,
            'is_active' => true,
        ]);

        // 4. Services (Store Specific)
        $fcA4 = Service::create([
            'store_id' => $store->id,
            'category_id' => $fcCat->id,
            'name' => 'Fotocopy A4 H/P',
            'base_price' => 500,
        ]);

        $fcF4 = Service::create([
            'store_id' => $store->id,
            'category_id' => $fcCat->id,
            'name' => 'Fotocopy F4 H/P',
            'base_price' => 600,
        ]);

        $printWarna = Service::create([
            'store_id' => $store->id,
            'category_id' => $printCat->id,
            'name' => 'Print Warna A4',
            'base_price' => 2000,
        ]);

        // 5. Price Levels for Fotocopy A4
        ServicePriceLevel::create([
            'service_id' => $fcA4->id,
            'min_qty' => 101,
            'max_qty' => 500,
            'price' => 250,
        ]);

        ServicePriceLevel::create([
            'service_id' => $fcA4->id,
            'min_qty' => 501,
            'max_qty' => null,
            'price' => 200,
        ]);
    }
}
