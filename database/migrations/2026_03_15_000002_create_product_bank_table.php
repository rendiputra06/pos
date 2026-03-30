<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Katalog produk global (shared antar toko).
     * Menyimpan identitas produk: nama, SKU, barcode, satuan, gambar.
     * Harga, modal, dan stok tersimpan di store_products (per toko).
     */
    public function up(): void
    {
        Schema::create('product_bank', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('sku')->unique();
            $table->string('barcode')->nullable();
            $table->string('unit')->default('pcs');
            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_bank');
    }
};
