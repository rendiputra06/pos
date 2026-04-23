<?php

namespace Tests\Unit;

use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductUnitTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->product = Product::factory()->create([
            'has_variants' => false,
            'has_multiple_units' => true,
            'stock' => 100,
            'unit' => 'pcs',
        ]);
    }

    public function test_product_can_have_multiple_units()
    {
        $baseUnit = ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'pcs',
            'sku' => $this->product->sku . '-PCS',
            'barcode' => '1234567890123',
            'price' => 1000,
            'cost_price' => 800,
            'stock' => 100,
            'conversion_factor' => 1,
            'is_base_unit' => true,
            'is_active' => true,
        ]);

        $boxUnit = ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'box',
            'sku' => $this->product->sku . '-BOX',
            'barcode' => '1234567890124',
            'price' => 9500,
            'cost_price' => 7600,
            'stock' => 0,
            'conversion_factor' => 10,
            'is_base_unit' => false,
            'is_active' => true,
        ]);

        $this->assertCount(2, $this->product->units);
        $this->assertTrue($this->product->units->contains('is_base_unit', true));
        $this->assertTrue($this->product->units->contains('name', 'box'));
    }

    public function test_base_unit_relationship_returns_correct_unit()
    {
        ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'pcs',
            'sku' => 'PCS-001',
            'price' => 1000,
            'cost_price' => 800,
            'stock' => 100,
            'conversion_factor' => 1,
            'is_base_unit' => true,
            'is_active' => true,
        ]);

        ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'box',
            'sku' => 'BOX-001',
            'price' => 9500,
            'cost_price' => 7600,
            'stock' => 0,
            'conversion_factor' => 10,
            'is_base_unit' => false,
            'is_active' => true,
        ]);

        $baseUnit = $this->product->baseUnit;
        $this->assertNotNull($baseUnit);
        $this->assertEquals('pcs', $baseUnit->name);
        $this->assertTrue($baseUnit->is_base_unit);
    }

    public function test_active_units_scope_returns_only_active_units()
    {
        ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'pcs',
            'sku' => 'PCS-001',
            'price' => 1000,
            'cost_price' => 800,
            'stock' => 100,
            'conversion_factor' => 1,
            'is_base_unit' => true,
            'is_active' => true,
        ]);

        ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'dus',
            'sku' => 'DUS-001',
            'price' => 45000,
            'cost_price' => 36000,
            'stock' => 0,
            'conversion_factor' => 50,
            'is_base_unit' => false,
            'is_active' => false, // inactive
        ]);

        $activeUnits = $this->product->activeUnits;
        $this->assertCount(1, $activeUnits);
        $this->assertEquals('pcs', $activeUnits->first()->name);
    }

    public function test_unit_calculates_converted_stock_correctly()
    {
        $baseUnit = ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'pcs',
            'sku' => 'PCS-001',
            'price' => 1000,
            'cost_price' => 800,
            'stock' => 100,
            'conversion_factor' => 1,
            'is_base_unit' => true,
            'is_active' => true,
        ]);

        $boxUnit = ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'box',
            'sku' => 'BOX-001',
            'price' => 9500,
            'cost_price' => 7600,
            'stock' => 0,
            'conversion_factor' => 10,
            'is_base_unit' => false,
            'is_active' => true,
        ]);

        // Box unit stock should be calculated from base unit
        $this->assertEquals(10, $boxUnit->converted_stock); // 100 / 10 = 10
        $this->assertEquals(100, $baseUnit->converted_stock); // Base unit returns actual stock
    }

    public function test_get_display_stock_method_returns_correct_value()
    {
        $baseUnit = ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'pcs',
            'sku' => 'PCS-001',
            'price' => 1000,
            'cost_price' => 800,
            'stock' => 100,
            'conversion_factor' => 1,
            'is_base_unit' => true,
            'is_active' => true,
        ]);

        $this->assertEquals(100, $baseUnit->getDisplayStock());
    }

    public function test_base_unit_attributes_accessor()
    {
        ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'pcs',
            'sku' => 'PCS-001',
            'price' => 1000,
            'cost_price' => 800,
            'stock' => 100,
            'conversion_factor' => 1,
            'is_base_unit' => true,
            'is_active' => true,
        ]);

        $unit = ProductUnit::first();
        $this->assertEquals('pcs', $unit->base_unit_name);
        $this->assertEquals(1, $unit->base_conversion_factor);
    }
}
