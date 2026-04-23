<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, fix any existing products that have multiple base units
        // Use a subquery approach that works with both SQLite and MySQL
        DB::statement("
            UPDATE product_units
            SET is_base_unit = 0
            WHERE id NOT IN (
                SELECT id FROM (
                    SELECT MIN(id) as id
                    FROM product_units
                    WHERE is_base_unit = 1
                    GROUP BY product_id
                ) as temp
            )
            AND is_base_unit = 1
        ");

        // Note: We're NOT adding a database constraint because it causes issues
        // with update operations in SQLite. Instead, we rely on the ProductUnitService
        // to ensure only one base unit exists per product at the application level.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No constraint to remove
    }
};
