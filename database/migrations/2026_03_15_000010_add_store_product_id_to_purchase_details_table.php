<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah kolom store_product_id ke purchase_details.
     * Data lama akan dimapping oleh DefaultStoreSeeder.
     * Kolom product_id dipertahankan sementara (nullable) dan dihapus setelah seeder berjalan.
     */
    public function up(): void
    {
        Schema::table('purchase_details', function (Blueprint $table) {
            $table->foreignId('store_product_id')
                ->nullable()
                ->after('purchase_id')
                ->constrained('store_products')
                ->onDelete('cascade');

            // Nullable-kan product_id lama agar tidak konflik saat seeder remapping
            $table->unsignedBigInteger('product_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('purchase_details', function (Blueprint $table) {
            $table->dropForeign(['store_product_id']);
            $table->dropColumn('store_product_id');
            $table->unsignedBigInteger('product_id')->nullable(false)->change();
        });
    }
};
