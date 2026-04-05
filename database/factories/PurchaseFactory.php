<?php

namespace Database\Factories;

use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PurchaseFactory extends Factory
{
    protected $model = Purchase::class;

    public function definition(): array
    {
        return [
            'supplier_id' => Supplier::factory(),
            'invoice_number' => 'INV-' . fake()->unique()->lexify('????????'),
            'purchase_date' => now(),
            'total_amount' => fake()->randomFloat(2, 50000, 100000),
            'status' => 'pending',
            'notes' => fake()->sentence(),
            'created_by' => User::factory(),
        ];
    }
}
