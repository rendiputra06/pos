<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\ProductVariant;
use App\Models\VariantGroup;
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
        ProductUnit::query()->delete();
        ProductVariant::query()->delete();
        VariantGroup::query()->delete();
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
            'barcode' => '8991234567890',
            'cost_price' => 45000,
            'price' => 55000,
            'stock' => 20,
            'unit' => 'rim',
        ]);

        // 2b. Multi-Unit Product (Contoh: Kertas dengan satuan berbeda)
        $kertasDus = Product::create([
            'category_id' => $kertasCat->id,
            'name' => 'Kertas HVS A4 70gr PaperOne (Multi-Unit)',
            'sku' => 'HVS-A4-70-P1-MU',
            'barcode' => '8991234567891',
            'cost_price' => 45000,
            'price' => 55000,
            'stock' => 0,
            'unit' => 'rim',
            'has_multiple_units' => true,
        ]);

        ProductUnit::create([
            'product_id' => $kertasDus->id,
            'name' => 'lembar',
            'sku' => 'HVS-A4-70-P1-LBR',
            'barcode' => '8991234567892',
            'price' => 100,
            'cost_price' => 90,
            'stock' => 1000,
            'conversion_factor' => 1,
            'is_base_unit' => true,
            'is_active' => true,
            'display_order' => 1,
        ]);

        ProductUnit::create([
            'product_id' => $kertasDus->id,
            'name' => 'rim',
            'sku' => 'HVS-A4-70-P1-RIM',
            'barcode' => '8991234567893',
            'price' => 55000,
            'cost_price' => 45000,
            'stock' => 10,
            'conversion_factor' => 500,
            'is_base_unit' => false,
            'is_active' => true,
            'display_order' => 2,
        ]);

        ProductUnit::create([
            'product_id' => $kertasDus->id,
            'name' => 'dus',
            'sku' => 'HVS-A4-70-P1-DUS',
            'barcode' => '8991234567894',
            'price' => 540000,
            'cost_price' => 450000,
            'stock' => 2,
            'conversion_factor' => 5000,
            'is_base_unit' => false,
            'is_active' => true,
            'display_order' => 3,
        ]);

        // 2c. Variant Product (Contoh: Buku dengan varian ukuran dan warna)
        $bukuVariant = Product::create([
            'category_id' => $atkCat->id,
            'name' => 'Buku Tulis Sidu (Variant)',
            'sku' => 'SIDU-VAR',
            'barcode' => '8991234567895',
            'cost_price' => 3000,
            'price' => 5000,
            'stock' => 0,
            'unit' => 'pcs',
            'has_variants' => true,
        ]);

        // Variant Group: Ukuran
        $vgSize = VariantGroup::create([
            'product_id' => $bukuVariant->id,
            'name' => 'Ukuran',
            'type' => 'size',
            'display_order' => 1,
            'is_required' => true,
        ]);

        // Variant Group: Warna
        $vgColor = VariantGroup::create([
            'product_id' => $bukuVariant->id,
            'name' => 'Warna',
            'type' => 'color',
            'display_order' => 2,
            'is_required' => true,
        ]);

        // Variants
        ProductVariant::create([
            'product_id' => $bukuVariant->id,
            'sku' => 'SIDU-A4-MERAH',
            'barcode' => '8991234567896',
            'price' => 6000,
            'cost_price' => 3500,
            'stock' => 50,
            'unit' => 'pcs',
            'combination' => ['size' => 'A4', 'color' => 'Merah'],
            'combination_hash' => md5(json_encode(['size' => 'A4', 'color' => 'Merah'])),
            'display_order' => 1,
            'is_active' => true,
        ]);

        ProductVariant::create([
            'product_id' => $bukuVariant->id,
            'sku' => 'SIDU-A4-BIRU',
            'barcode' => '8991234567897',
            'price' => 6000,
            'cost_price' => 3500,
            'stock' => 30,
            'unit' => 'pcs',
            'combination' => ['size' => 'A4', 'color' => 'Biru'],
            'combination_hash' => md5(json_encode(['size' => 'A4', 'color' => 'Biru'])),
            'display_order' => 2,
            'is_active' => true,
        ]);

        ProductVariant::create([
            'product_id' => $bukuVariant->id,
            'sku' => 'SIDU-A5-MERAH',
            'barcode' => '8991234567898',
            'price' => 5000,
            'cost_price' => 3000,
            'stock' => 40,
            'unit' => 'pcs',
            'combination' => ['size' => 'A5', 'color' => 'Merah'],
            'combination_hash' => md5(json_encode(['size' => 'A5', 'color' => 'Merah'])),
            'display_order' => 3,
            'is_active' => true,
        ]);

        ProductVariant::create([
            'product_id' => $bukuVariant->id,
            'sku' => 'SIDU-A5-BIRU',
            'barcode' => '8991234567899',
            'price' => 5000,
            'cost_price' => 3000,
            'stock' => 25,
            'unit' => 'pcs',
            'combination' => ['size' => 'A5', 'color' => 'Biru'],
            'combination_hash' => md5(json_encode(['size' => 'A5', 'color' => 'Biru'])),
            'display_order' => 4,
            'is_active' => true,
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
