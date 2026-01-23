<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\Service;
use App\Models\ServicePriceLevel;
use Illuminate\Support\Str;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        // Bersihkan data lama untuk konsistensi (Delete first as requested)
        Category::query()->delete();
        Product::query()->delete();
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

        // 2. Products
        Product::create([
            'category_id' => $atkCat->id,
            'name' => 'Buku Tulis Sidu 38 Lembar',
            'sku' => 'SIDU-38',
            'cost_price' => 3000,
            'price' => 5000,
            'stock' => 100,
            'unit' => 'pcs',
        ]);

        Product::create([
            'category_id' => $atkCat->id,
            'name' => 'Pulpen Hi-Tech 0.3 Black',
            'sku' => 'HITECH-03-B',
            'cost_price' => 12000,
            'price' => 15000,
            'stock' => 50,
            'unit' => 'pcs',
        ]);

        Product::create([
            'category_id' => $kertasCat->id,
            'name' => 'Kertas HVS A4 70gr PaperOne',
            'sku' => 'HVS-A4-70-P1',
            'cost_price' => 45000,
            'price' => 55000,
            'stock' => 20,
            'unit' => 'rim',
        ]);

        // 3. Services
        $fcA4 = Service::create([
            'category_id' => $fcCat->id,
            'name' => 'Fotocopy A4 H/P',
            'base_price' => 500,
        ]);

        $fcF4 = Service::create([
            'category_id' => $fcCat->id,
            'name' => 'Fotocopy F4 H/P',
            'base_price' => 600,
        ]);

        $printWarna = Service::create([
            'category_id' => $printCat->id,
            'name' => 'Print Warna A4',
            'base_price' => 2000,
        ]);

        // 4. Price Levels for Fotocopy A4
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
