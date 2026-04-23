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
        Schema::table('transaction_details', function (Blueprint $table) {
            $table->string('unit_name', 30)->nullable()->after('cost_price');
            $table->decimal('conversion_factor', 10, 2)->default(1)->after('unit_name');
            $table->decimal('base_qty', 15, 2)->nullable()->after('conversion_factor');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaction_details', function (Blueprint $table) {
            $table->dropColumn(['unit_name', 'conversion_factor', 'base_qty']);
        });
    }
};
