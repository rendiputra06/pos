<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(['has_variants' => true]),
            'sku' => 'VAR-' . fake()->unique()->lexify('??????'),
            'barcode' => fake()->unique()->ean13(),
            'price' => fake()->randomFloat(2, 6000, 10000),
            'cost_price' => fake()->randomFloat(2, 1000, 5000),
            'stock' => fake()->numberBetween(10, 100),
            'unit' => 'pcs',
            'combination' => ['color' => fake()->colorName()],
            'combination_hash' => md5(fake()->word()),
            'display_order' => 0,
            'is_active' => true,
        ];
    }
}
