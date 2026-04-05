<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('variant_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('name'); // 'Ukuran', 'Warna', 'Material'
            $table->string('type'); // 'size', 'color', 'material'
            $table->integer('display_order')->default(0);
            $table->boolean('is_required')->default(false);
            $table->timestamps();

            $table->index(['product_id', 'display_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('variant_groups');
    }
};
