<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('name', 30); // pcs, box, dus, rim, pack
            $table->string('sku', 50)->unique();
            $table->string('barcode', 50)->unique()->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('cost_price', 12, 2);
            $table->integer('stock')->default(0);
            $table->decimal('conversion_factor', 10, 2)->default(1); // 1 box = 12 pcs → factor=12
            $table->boolean('is_base_unit')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->index(['product_id', 'display_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_units');
    }
};
