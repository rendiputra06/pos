<?php

namespace Database\Factories;

use App\Models\VariantGroup;
use App\Models\VariantOption;
use Illuminate\Database\Eloquent\Factories\Factory;

class VariantOptionFactory extends Factory
{
    protected $model = VariantOption::class;

    public function definition(): array
    {
        return [
            'variant_group_id' => VariantGroup::factory(),
            'value' => fake()->word(),
            'display_value' => fake()->word(),
            'color_code' => fake()->safeHexColor(),
            'display_order' => 0,
            'is_active' => true,
        ];
    }
}
