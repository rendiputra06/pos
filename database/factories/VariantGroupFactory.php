<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\VariantGroup;
use Illuminate\Database\Eloquent\Factories\Factory;

class VariantGroupFactory extends Factory
{
    protected $model = VariantGroup::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'name' => fake()->word(),
            'type' => fake()->randomElement(['size', 'color', 'material']),
            'display_order' => 0,
            'is_required' => false,
        ];
    }
}
