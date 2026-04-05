<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('sku')->unique();
            $table->string('barcode')->unique()->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('cost_price', 12, 2);
            $table->integer('stock')->default(0);
            $table->string('unit')->default('pcs');
            $table->json('combination'); // {"size": "M", "color": "Merah", "material": "Katun"}
            $table->string('combination_hash')->unique(); // MD5 hash of combination
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['product_id', 'display_order']);
            $table->index(['combination_hash']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
