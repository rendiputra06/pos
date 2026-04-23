<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductUnitControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->category = Category::factory()->create();
    }

    public function test_can_create_product_with_multiple_units()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/products', [
                'category_id' => $this->category->id,
                'name' => 'Test Multi Unit Product',
                'sku' => 'MULTI-001',
                'barcode' => '1234567890123',
                'cost_price' => 5000,
                'price' => 6000,
                'stock' => 100,
                'unit' => 'pcs',
                'has_variants' => false,
                'has_multiple_units' => true,
                'units' => [
                    [
                        'name' => 'pcs',
                        'sku' => 'MULTI-001-PCS',
                        'barcode' => '1234567890123',
                        'price' => 1000,
                        'cost_price' => 800,
                        'stock' => 100,
                        'conversion_factor' => 1,
                        'is_base_unit' => true,
                        'is_active' => true,
                    ],
                    [
                        'name' => 'box',
                        'sku' => 'MULTI-001-BOX',
                        'barcode' => '1234567890124',
                        'price' => 9500,
                        'cost_price' => 7600,
                        'stock' => 0,
                        'conversion_factor' => 10,
                        'is_base_unit' => false,
                        'is_active' => true,
                    ],
                ],
            ]);

        $response->assertRedirect();

        $product = Product::where('sku', 'MULTI-001')->first();
        $this->assertNotNull($product);
        $this->assertTrue($product->has_multiple_units);
        $this->assertCount(2, $product->units);
        $this->assertTrue($product->units->contains('is_base_unit', true));
    }

    public function test_can_update_product_units()
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'has_multiple_units' => true,
            'stock' => 50,
        ]);

        // Create initial units
        $baseUnit = ProductUnit::create([
            'product_id' => $product->id,
            'name' => 'pcs',
            'sku' => 'OLD-PCS',
            'price' => 1000,
            'cost_price' => 800,
            'stock' => 100,
            'conversion_factor' => 1,
            'is_base_unit' => true,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/products/{$product->id}", [
                'category_id' => $this->category->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'cost_price' => $product->cost_price,
                'price' => $product->price,
                'stock' => 50,
                'unit' => 'pcs',
                'has_variants' => false,
                'has_multiple_units' => true,
                'units' => [
                    [
                        'id' => $baseUnit->id,
                        'name' => 'pcs',
                        'sku' => 'UPDATED-PCS',
                        'price' => 1200,
                        'cost_price' => 900,
                        'stock' => 50,
                        'conversion_factor' => 1,
                        'is_base_unit' => true,
                        'is_active' => true,
                    ],
                    [
                        'name' => 'dus',
                        'sku' => 'NEW-DUS',
                        'price' => 55000,
                        'cost_price' => 45000,
                        'stock' => 0,
                        'conversion_factor' => 50,
                        'is_base_unit' => false,
                        'is_active' => true,
                    ],
                ],
            ]);

        $response->assertRedirect();

        $product->refresh();
        $this->assertCount(2, $product->units);
        $this->assertTrue($product->units->contains('sku', 'UPDATED-PCS'));
        $this->assertTrue($product->units->contains('sku', 'NEW-DUS'));
        $this->assertEquals(50, $product->stock); // Base unit stock synced to product
    }

    public function test_cannot_create_units_without_base_unit()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/products', [
                'category_id' => $this->category->id,
                'name' => 'Invalid Product',
                'sku' => 'INVALID-001',
                'barcode' => '1234567890123',
                'cost_price' => 5000,
                'price' => 6000,
                'stock' => 100,
                'unit' => 'pcs',
                'has_variants' => false,
                'has_multiple_units' => true,
                'units' => json_encode([
                    [
                        'name' => 'box',
                        'sku' => 'INVALID-BOX',
                        'price' => 9500,
                        'stock' => 10,
                        'conversion_factor' => 10,
                        'is_base_unit' => false,
                        'is_active' => true,
                    ],
                ]),
            ]);

        $response->assertStatus(422);
    }

    public function test_mutual_exclusivity_between_variants_and_multiple_units()
    {
        // Test cannot enable both variants and multiple units on create
        $response = $this->actingAs($this->user)
            ->postJson('/products', [
                'category_id' => $this->category->id,
                'name' => 'Invalid Product',
                'sku' => 'INVALID-001',
                'cost_price' => 5000,
                'price' => 6000,
                'stock' => 100,
                'unit' => 'pcs',
                'has_variants' => true,
                'has_multiple_units' => true,
            ]);

        $response->assertStatus(422);
    }

    public function test_product_index_includes_units()
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'has_multiple_units' => true,
        ]);

        ProductUnit::create([
            'product_id' => $product->id,
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
            'product_id' => $product->id,
            'name' => 'box',
            'sku' => 'BOX-001',
            'price' => 9500,
            'cost_price' => 7600,
            'stock' => 0,
            'conversion_factor' => 10,
            'is_base_unit' => false,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->get('/products');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('products.data')
            ->where('products.data.0.has_multiple_units', true)
        );
    }
}
