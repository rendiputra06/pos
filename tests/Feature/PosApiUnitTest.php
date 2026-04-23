<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosApiUnitTest extends TestCase
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

    public function test_search_returns_multi_unit_products_with_units()
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'name' => 'Multi Unit Product',
            'sku' => 'MULTI-001',
            'barcode' => '1234567890123',
            'has_multiple_units' => true,
            'stock' => 100,
            'unit' => 'pcs',
        ]);

        ProductUnit::create([
            'product_id' => $product->id,
            'name' => 'pcs',
            'sku' => 'MULTI-001-PCS',
            'barcode' => '1234567890123',
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
            'sku' => 'MULTI-001-BOX',
            'barcode' => '1234567890124',
            'price' => 9500,
            'cost_price' => 7600,
            'stock' => 0,
            'conversion_factor' => 10,
            'is_base_unit' => false,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/pos/search?q=MULTI');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'name' => 'Multi Unit Product',
            'has_multiple_units' => true,
        ]);
        
        $data = $response->json();
        $productData = collect($data)->first(fn($item) => $item['name'] === 'Multi Unit Product');
        $this->assertNotNull($productData);
        $this->assertArrayHasKey('units', $productData);
        $this->assertCount(2, $productData['units']);
    }

    public function test_can_search_product_by_unit_barcode()
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'name' => 'Multi Unit Product',
            'sku' => 'MULTI-001',
            'barcode' => 'BASE-BARCODE',
            'has_multiple_units' => true,
        ]);

        ProductUnit::create([
            'product_id' => $product->id,
            'name' => 'pcs',
            'sku' => 'MULTI-001-PCS',
            'barcode' => 'UNIT-BARCODE-123',
            'price' => 1000,
            'stock' => 100,
            'conversion_factor' => 1,
            'is_base_unit' => true,
            'is_active' => true,
        ]);

        // Search by unit barcode
        $response = $this->actingAs($this->user)
            ->getJson('/api/pos/search?q=UNIT-BARCODE-123');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'name' => 'Multi Unit Product',
            'is_exact' => true,
        ]);
    }

    public function test_transaction_with_multi_unit_deducts_base_unit_stock()
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'name' => 'Multi Unit Product',
            'sku' => 'MULTI-001',
            'barcode' => '1234567890123',
            'has_multiple_units' => true,
            'stock' => 100,
            'unit' => 'pcs',
        ]);

        $baseUnit = ProductUnit::create([
            'product_id' => $product->id,
            'name' => 'pcs',
            'sku' => 'MULTI-001-PCS',
            'barcode' => '1234567890123',
            'price' => 1000,
            'cost_price' => 800,
            'stock' => 100,
            'conversion_factor' => 1,
            'is_base_unit' => true,
            'is_active' => true,
        ]);

        $boxUnit = ProductUnit::create([
            'product_id' => $product->id,
            'name' => 'box',
            'sku' => 'MULTI-001-BOX',
            'barcode' => '1234567890124',
            'price' => 9500,
            'cost_price' => 7600,
            'stock' => 0,
            'conversion_factor' => 10,
            'is_base_unit' => false,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/pos/transactions', [
                'items' => [
                    [
                        'id' => $product->id,
                        'type' => 'product',
                        'qty' => 2,
                        'price' => 9500,
                        'unit_id' => $boxUnit->id,
                    ],
                ],
                'total_amount' => 19000,
                'grand_total' => 19000,
                'payment_method' => 'cash',
                'discount' => 0,
            ]);

        $response->assertStatus(200);

        // Base unit stock should be reduced by 20 (2 boxes × 10 conversion factor)
        $baseUnit->refresh();
        $this->assertEquals(80, $baseUnit->stock); // 100 - 20 = 80

        // Product stock should also be updated
        $product->refresh();
        $this->assertEquals(80, $product->stock);
    }

    public function test_transaction_detail_includes_unit_information()
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'name' => 'Multi Unit Product',
            'sku' => 'MULTI-001',
            'has_multiple_units' => true,
            'stock' => 100,
        ]);

        $boxUnit = ProductUnit::create([
            'product_id' => $product->id,
            'name' => 'box',
            'sku' => 'MULTI-001-BOX',
            'price' => 9500,
            'stock' => 0,
            'conversion_factor' => 10,
            'is_base_unit' => false,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/pos/transactions', [
                'items' => [
                    [
                        'id' => $product->id,
                        'type' => 'product',
                        'qty' => 1,
                        'price' => 9500,
                        'unit_id' => $boxUnit->id,
                    ],
                ],
                'total_amount' => 9500,
                'grand_total' => 9500,
                'payment_method' => 'cash',
                'discount' => 0,
            ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'transaction' => [
                'id',
                'invoice_number',
            ],
        ]);

        // Verify transaction detail was created with unit_id
        $transaction = Transaction::first();
        $detail = TransactionDetail::where('transaction_id', $transaction->id)->first();
        $this->assertNotNull($detail);
        $this->assertEquals($boxUnit->id, $detail->unit_id);
        $this->assertEquals('box', $detail->unit_name);
        $this->assertEquals(10, $detail->conversion_factor);
        $this->assertEquals(10, $detail->qty_in_base_unit);
    }

    public function test_insufficient_stock_error_for_multi_unit_product()
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'name' => 'Low Stock Product',
            'sku' => 'LOW-001',
            'has_multiple_units' => true,
            'stock' => 5, // Only 5 pcs available
        ]);

        $baseUnit = ProductUnit::create([
            'product_id' => $product->id,
            'name' => 'pcs',
            'sku' => 'LOW-001-PCS',
            'price' => 1000,
            'stock' => 5,
            'conversion_factor' => 1,
            'is_base_unit' => true,
            'is_active' => true,
        ]);

        $boxUnit = ProductUnit::create([
            'product_id' => $product->id,
            'name' => 'box',
            'sku' => 'LOW-001-BOX',
            'price' => 9500,
            'stock' => 0,
            'conversion_factor' => 10,
            'is_base_unit' => false,
            'is_active' => true,
        ]);

        // Try to buy 1 box (needs 10 pcs, but only 5 available)
        $response = $this->actingAs($this->user)
            ->postJson('/api/pos/transactions', [
                'items' => [
                    [
                        'id' => $product->id,
                        'type' => 'product',
                        'qty' => 1,
                        'price' => 9500,
                        'unit_id' => $boxUnit->id,
                    ],
                ],
                'total_amount' => 9500,
                'grand_total' => 9500,
                'payment_method' => 'cash',
                'discount' => 0,
            ]);

        $response->assertStatus(422);
        $response->assertJson([
            'message' => 'Stok tidak cukup untuk produk: Low Stock Product',
        ]);
    }
}
