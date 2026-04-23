<?php

namespace Tests\Unit;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductUnit;
use App\Services\ProductUnitService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductUnitServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ProductUnitService $service;
    protected Product $product;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ProductUnitService();
        $this->category = Category::factory()->create(['type' => 'product']);
        $this->product = Product::factory()->create([
            'category_id' => $this->category->id,
            'has_multiple_units' => true,
        ]);
    }

    public function test_create_initial_units_sets_first_as_base_unit()
    {
        $units = [
            [
                'name' => 'pcs',
                'sku' => 'UNIT-PCS',
                'price' => 1000,
                'cost_price' => 800,
                'stock' => 100,
                'conversion_factor' => 1,
            ],
            [
                'name' => 'box',
                'sku' => 'UNIT-BOX',
                'price' => 9500,
                'cost_price' => 7600,
                'stock' => 0,
                'conversion_factor' => 10,
            ],
        ];

        $this->service->createInitialUnits($this->product, $units);

        $this->assertCount(2, $this->product->units);
        $this->assertTrue($this->product->units->first()->is_base_unit);
        $this->assertFalse($this->product->units->last()->is_base_unit);
        $this->assertEquals(100, $this->product->stock); // Synced from base unit
    }

    public function test_sync_units_updates_existing_unit()
    {
        $baseUnit = ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'pcs',
            'sku' => 'OLD-PCS',
            'price' => 1000,
            'cost_price' => 800,
            'stock' => 100,
            'conversion_factor' => 1,
            'is_base_unit' => true,
            'is_active' => true,
        ]);

        $units = [
            [
                'id' => $baseUnit->id,
                'name' => 'pcs',
                'sku' => 'UPDATED-PCS',
                'price' => 1200,
                'cost_price' => 900,
                'stock' => 50,
                'conversion_factor' => 1,
                'is_base_unit' => true,
            ],
        ];

        $this->service->syncUnits($this->product, $units);

        $baseUnit->refresh();
        $this->assertEquals('UPDATED-PCS', $baseUnit->sku);
        $this->assertEquals(1200, $baseUnit->price);
        $this->assertEquals(50, $baseUnit->stock);
        $this->assertEquals(50, $this->product->fresh()->stock);
    }

    public function test_sync_units_creates_new_unit()
    {
        $baseUnit = ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'pcs',
            'sku' => 'UNIT-PCS',
            'price' => 1000,
            'cost_price' => 800,
            'stock' => 100,
            'conversion_factor' => 1,
            'is_base_unit' => true,
            'is_active' => true,
        ]);

        $units = [
            [
                'id' => $baseUnit->id,
                'name' => 'pcs',
                'sku' => 'UNIT-PCS',
                'price' => 1000,
                'cost_price' => 800,
                'stock' => 100,
                'conversion_factor' => 1,
                'is_base_unit' => true,
            ],
            [
                'name' => 'box',
                'sku' => 'NEW-BOX',
                'price' => 9500,
                'cost_price' => 7600,
                'stock' => 0,
                'conversion_factor' => 10,
                'is_base_unit' => false,
            ],
        ];

        $this->service->syncUnits($this->product, $units);

        $this->assertCount(2, $this->product->fresh()->units);
        $this->assertTrue($this->product->units()->where('sku', 'NEW-BOX')->exists());
    }

    public function test_sync_units_deletes_removed_units()
    {
        $baseUnit = ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'pcs',
            'sku' => 'UNIT-PCS',
            'price' => 1000,
            'cost_price' => 800,
            'stock' => 100,
            'conversion_factor' => 1,
            'is_base_unit' => true,
            'is_active' => true,
        ]);

        $extraUnit = ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'box',
            'sku' => 'UNIT-BOX',
            'price' => 9500,
            'cost_price' => 7600,
            'stock' => 0,
            'conversion_factor' => 10,
            'is_base_unit' => false,
            'is_active' => true,
        ]);

        $units = [
            [
                'id' => $baseUnit->id,
                'name' => 'pcs',
                'sku' => 'UNIT-PCS',
                'price' => 1000,
                'cost_price' => 800,
                'stock' => 100,
                'conversion_factor' => 1,
                'is_base_unit' => true,
            ],
        ];

        $this->service->syncUnits($this->product, $units);

        $this->assertCount(1, $this->product->fresh()->units);
        $this->assertFalse(ProductUnit::where('id', $extraUnit->id)->exists());
    }

    public function test_sync_units_handles_base_unit_change()
    {
        $baseUnit = ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'pcs',
            'sku' => 'UNIT-PCS',
            'price' => 1000,
            'cost_price' => 800,
            'stock' => 100,
            'conversion_factor' => 1,
            'is_base_unit' => true,
            'is_active' => true,
        ]);

        $otherUnit = ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'box',
            'sku' => 'UNIT-BOX',
            'price' => 9500,
            'cost_price' => 7600,
            'stock' => 0,
            'conversion_factor' => 10,
            'is_base_unit' => false,
            'is_active' => true,
        ]);

        $units = [
            [
                'id' => $baseUnit->id,
                'name' => 'pcs',
                'sku' => 'UNIT-PCS',
                'price' => 1000,
                'cost_price' => 800,
                'stock' => 100,
                'conversion_factor' => 1,
                'is_base_unit' => false, // Change from base to non-base
            ],
            [
                'id' => $otherUnit->id,
                'name' => 'box',
                'sku' => 'UNIT-BOX',
                'price' => 9500,
                'cost_price' => 7600,
                'stock' => 10,
                'conversion_factor' => 10,
                'is_base_unit' => true, // Change from non-base to base
            ],
        ];

        $this->service->syncUnits($this->product, $units);

        $baseUnit->refresh();
        $otherUnit->refresh();

        $this->assertFalse($baseUnit->is_base_unit);
        $this->assertTrue($otherUnit->is_base_unit);
        $this->assertEquals(10, $this->product->fresh()->stock); // Synced from new base unit
    }

    public function test_sync_units_ensures_one_base_unit_when_deleting_base()
    {
        $baseUnit = ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'pcs',
            'sku' => 'UNIT-PCS',
            'price' => 1000,
            'cost_price' => 800,
            'stock' => 100,
            'conversion_factor' => 1,
            'is_base_unit' => true,
            'is_active' => true,
        ]);

        $otherUnit = ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'box',
            'sku' => 'UNIT-BOX',
            'price' => 9500,
            'cost_price' => 7600,
            'stock' => 0,
            'conversion_factor' => 10,
            'is_base_unit' => false,
            'is_active' => true,
        ]);

        // Only keep the non-base unit
        $units = [
            [
                'id' => $otherUnit->id,
                'name' => 'box',
                'sku' => 'UNIT-BOX',
                'price' => 9500,
                'cost_price' => 7600,
                'stock' => 10,
                'conversion_factor' => 10,
                'is_base_unit' => false,
            ],
        ];

        $this->service->syncUnits($this->product, $units);

        $otherUnit->refresh();
        $this->assertTrue($otherUnit->is_base_unit); // Should become base unit
        $this->assertFalse(ProductUnit::where('id', $baseUnit->id)->exists());
    }

    public function test_sync_units_ensures_base_unit_exists_when_none_set()
    {
        $unit1 = ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'pcs',
            'sku' => 'UNIT-PCS',
            'price' => 1000,
            'cost_price' => 800,
            'stock' => 100,
            'conversion_factor' => 1,
            'is_base_unit' => false,
            'is_active' => true,
        ]);

        $units = [
            [
                'id' => $unit1->id,
                'name' => 'pcs',
                'sku' => 'UNIT-PCS',
                'price' => 1000,
                'cost_price' => 800,
                'stock' => 100,
                'conversion_factor' => 1,
                'is_base_unit' => false,
            ],
        ];

        $this->service->syncUnits($this->product, $units);

        $unit1->refresh();
        $this->assertTrue($unit1->is_base_unit); // Should be set as base unit
    }

    public function test_validate_single_base_unit_returns_true_for_valid_product()
    {
        ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'pcs',
            'sku' => 'UNIT-PCS',
            'price' => 1000,
            'cost_price' => 800,
            'stock' => 100,
            'conversion_factor' => 1,
            'is_base_unit' => true,
            'is_active' => true,
        ]);

        $this->assertTrue($this->service->validateSingleBaseUnit($this->product));
    }

    public function test_service_prevents_multiple_base_units()
    {
        ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'pcs',
            'sku' => 'UNIT-PCS',
            'price' => 1000,
            'cost_price' => 800,
            'stock' => 100,
            'conversion_factor' => 1,
            'is_base_unit' => true,
            'is_active' => true,
        ]);

        // Create second base unit (database allows this, but service should prevent it)
        ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'box',
            'sku' => 'UNIT-BOX',
            'price' => 9500,
            'cost_price' => 7600,
            'stock' => 0,
            'conversion_factor' => 10,
            'is_base_unit' => true,
            'is_active' => true,
        ]);

        // Service validation should detect this
        $this->assertFalse($this->service->validateSingleBaseUnit($this->product));
    }

    public function test_get_or_create_base_unit_creates_if_none_exists()
    {
        $unit = ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'pcs',
            'sku' => 'UNIT-PCS',
            'price' => 1000,
            'cost_price' => 800,
            'stock' => 100,
            'conversion_factor' => 1,
            'is_base_unit' => false,
            'is_active' => true,
        ]);

        $baseUnit = $this->service->getOrCreateBaseUnit($this->product);

        $this->assertNotNull($baseUnit);
        $this->assertTrue($baseUnit->is_base_unit);
    }

    public function test_get_or_create_base_unit_returns_existing()
    {
        $baseUnit = ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'pcs',
            'sku' => 'UNIT-PCS',
            'price' => 1000,
            'cost_price' => 800,
            'stock' => 100,
            'conversion_factor' => 1,
            'is_base_unit' => true,
            'is_active' => true,
        ]);

        $result = $this->service->getOrCreateBaseUnit($this->product);

        $this->assertEquals($baseUnit->id, $result->id);
    }

    public function test_sync_units_rolls_back_on_error()
    {
        $baseUnit = ProductUnit::create([
            'product_id' => $this->product->id,
            'name' => 'pcs',
            'sku' => 'UNIT-PCS',
            'price' => 1000,
            'cost_price' => 800,
            'stock' => 100,
            'conversion_factor' => 1,
            'is_base_unit' => true,
            'is_active' => true,
        ]);

        // Invalid SKU (should cause database error due to unique constraint)
        $units = [
            [
                'id' => $baseUnit->id,
                'name' => 'pcs',
                'sku' => 'UNIT-PCS', // Same SKU as another unit
                'price' => 1000,
                'cost_price' => 800,
                'stock' => 100,
                'conversion_factor' => 1,
                'is_base_unit' => true,
            ],
            [
                'name' => 'box',
                'sku' => 'UNIT-PCS', // Duplicate SKU
                'price' => 9500,
                'cost_price' => 7600,
                'stock' => 0,
                'conversion_factor' => 10,
                'is_base_unit' => false,
            ],
        ];

        $this->expectException(\Exception::class);
        $this->service->syncUnits($this->product, $units);

        // Verify rollback - new unit should not exist
        $this->assertFalse($this->product->units()->where('name', 'box')->exists());
    }
}
