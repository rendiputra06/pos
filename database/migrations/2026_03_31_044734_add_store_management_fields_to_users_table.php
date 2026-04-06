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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('store_owner_id')->nullable()->after('store_id');
            $table->json('managed_store_ids')->nullable()->after('store_owner_id');
            
            $table->foreign('store_owner_id')->references('id')->on('stores')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['store_owner_id']);
            $table->dropColumn(['store_owner_id', 'managed_store_ids']);
        });
    }
};
