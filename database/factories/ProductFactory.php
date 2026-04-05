<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'category_id' => Category::factory(),
            'name' => fake()->word(),
            'sku' => 'PROD-' . fake()->unique()->lexify('????????'),
            'barcode' => fake()->unique()->ean13(),
            'cost_price' => fake()->randomFloat(2, 1000, 5000),
            'price' => fake()->randomFloat(2, 6000, 10000),
            'stock' => fake()->numberBetween(10, 100),
            'unit' => 'pcs',
            'has_variants' => false,
        ];
    }
}
