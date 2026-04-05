<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('variant_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('variant_group_id')->constrained()->onDelete('cascade');
            $table->string('value'); // 'S', 'M', 'L', 'Merah', 'Biru'
            $table->string('display_value'); // 'Small', 'Medium', 'Red', 'Blue'
            $table->string('color_code')->nullable(); // '#FF0000' for color variants
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['variant_group_id', 'display_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('variant_options');
    }
};
