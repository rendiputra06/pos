<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel pivot produk per toko.
     * Menyimpan modal, harga jual, dan stok yang berbeda untuk setiap toko.
     * Satu produk dari product_bank bisa aktif di banyak toko sekaligus.
     */
    public function up(): void
    {
        Schema::create('store_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_bank_id')->constrained('product_bank')->onDelete('cascade');
            $table->decimal('cost_price', 15, 2)->default(0);  // modal (berbeda per toko)
            $table->decimal('price', 15, 2)->default(0);        // harga jual (berbeda per toko)
            $table->integer('stock')->default(0);               // stok (berbeda per toko)
            $table->boolean('is_active')->default(true);
            $table->unique(['store_id', 'product_bank_id']); // satu produk hanya muncul sekali per toko
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_products');
    }
};
