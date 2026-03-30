<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Default Store Seeder
 *
 * Seeder ini memigrasikan semua data existing (single-tenant) ke sistem multi-toko.
 * Buat satu "Toko Default" dan memetakan semua data lama ke toko tersebut.
 *
 * Urutan eksekusi:
 * 1. Buat Toko Default
 * 2. Migrasikan products → product_bank + store_products
 * 3. Migrasikan services → tambah store_id
 * 4. Migrasikan transactions, suppliers, purchases, expenses → tambah store_id
 * 5. Remap purchase_details.product_id → store_product_id
 * 6. Remap transaction_details item_type Product → StoreProduct
 */
class DefaultStoreSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('=== Migrasi Data ke Sistem Multi-Toko ===');

        DB::transaction(function () {

            // -----------------------------------------------------------------
            // 1. Buat Toko Default
            // -----------------------------------------------------------------
            $this->command->info('[1/6] Membuat Toko Default...');

            $storeId = DB::table('stores')->insertGetId([
                'name'       => 'Toko Default',
                'slug'       => 'toko-default',
                'address'    => null,
                'phone'      => null,
                'logo'       => null,
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->command->info("   ✓ Toko Default dibuat (ID: {$storeId})");

            // -----------------------------------------------------------------
            // 2. Migrasikan products → product_bank + store_products
            // -----------------------------------------------------------------
            $this->command->info('[2/6] Memigrasikan produk ke product_bank & store_products...');

            $products = DB::table('products')->get();
            $productIdMap = []; // [product.id => store_products.id]

            foreach ($products as $product) {
                // Insert ke product_bank
                $productBankId = DB::table('product_bank')->insertGetId([
                    'category_id' => $product->category_id,
                    'name'        => $product->name,
                    'sku'         => $product->sku,
                    'barcode'     => $product->barcode,
                    'unit'        => $product->unit,
                    'image'       => $product->image,
                    'created_at'  => $product->created_at,
                    'updated_at'  => $product->updated_at,
                ]);

                // Insert ke store_products (dengan harga & stok dari produk lama)
                $storeProductId = DB::table('store_products')->insertGetId([
                    'store_id'        => $storeId,
                    'product_bank_id' => $productBankId,
                    'cost_price'      => $product->cost_price,
                    'price'           => $product->price,
                    'stock'           => $product->stock,
                    'is_active'       => true,
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ]);

                $productIdMap[$product->id] = $storeProductId;
            }

            $this->command->info("   ✓ {$products->count()} produk dimigrasikan.");

            // -----------------------------------------------------------------
            // 3. Migrasikan services → tambah store_id
            // -----------------------------------------------------------------
            $this->command->info('[3/6] Memigrasikan layanan (services) ke Toko Default...');

            $serviceCount = DB::table('services')->whereNull('store_id')->update([
                'store_id'   => $storeId,
                'updated_at' => now(),
            ]);

            $this->command->info("   ✓ {$serviceCount} layanan dimigrasikan.");

            // -----------------------------------------------------------------
            // 4. Migrasikan transactions, suppliers, purchases, expenses
            // -----------------------------------------------------------------
            $this->command->info('[4/6] Memigrasikan transaksi, supplier, pembelian, pengeluaran...');

            $txCount = DB::table('transactions')->whereNull('store_id')
                ->update(['store_id' => $storeId, 'updated_at' => now()]);

            $supCount = DB::table('suppliers')->whereNull('store_id')
                ->update(['store_id' => $storeId, 'updated_at' => now()]);

            $purCount = DB::table('purchases')->whereNull('store_id')
                ->update(['store_id' => $storeId, 'updated_at' => now()]);

            $expCount = DB::table('expenses')->whereNull('store_id')
                ->update(['store_id' => $storeId, 'updated_at' => now()]);

            $this->command->info("   ✓ {$txCount} transaksi, {$supCount} supplier, {$purCount} pembelian, {$expCount} pengeluaran dimigrasikan.");

            // -----------------------------------------------------------------
            // 5. Remap purchase_details.product_id → store_product_id
            // -----------------------------------------------------------------
            $this->command->info('[5/6] Remapping purchase_details ke store_products...');

            $purchaseDetails = DB::table('purchase_details')
                ->whereNull('store_product_id')
                ->whereNotNull('product_id')
                ->get();

            $remapCount = 0;
            foreach ($purchaseDetails as $detail) {
                if (isset($productIdMap[$detail->product_id])) {
                    DB::table('purchase_details')
                        ->where('id', $detail->id)
                        ->update([
                            'store_product_id' => $productIdMap[$detail->product_id],
                            'updated_at'       => now(),
                        ]);
                    $remapCount++;
                }
            }

            $this->command->info("   ✓ {$remapCount} purchase_details diremapping.");

            // -----------------------------------------------------------------
            // 6. Remap transaction_details: item_type App\Models\Product → App\Models\StoreProduct
            //    dan update item_id dari products.id → store_products.id
            // -----------------------------------------------------------------
            $this->command->info('[6/6] Remapping transaction_details ke StoreProduct...');

            $txDetails = DB::table('transaction_details')
                ->where('item_type', 'App\\Models\\Product')
                ->get();

            $txRemapCount = 0;
            foreach ($txDetails as $detail) {
                if (isset($productIdMap[$detail->item_id])) {
                    DB::table('transaction_details')
                        ->where('id', $detail->id)
                        ->update([
                            'item_type'  => 'App\\Models\\StoreProduct',
                            'item_id'    => $productIdMap[$detail->item_id],
                            'updated_at' => now(),
                        ]);
                    $txRemapCount++;
                }
            }

            $this->command->info("   ✓ {$txRemapCount} transaction_details diremapping.");
        });

        $this->command->info('');
        $this->command->info('=== Migrasi Selesai! Semua data sudah pindah ke Toko Default ===');
        $this->command->info('Sekarang Anda bisa menambah toko baru via halaman /stores');
    }
}
