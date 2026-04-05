<?php

namespace Tests\Feature\Api\Mobile;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurchaseApiTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_user_can_list_purchases()
    {
        Purchase::factory()->count(3)->create(['created_by' => $this->user->id]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/mobile/v1/purchases');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_user_can_create_a_purchase_with_received_status()
    {
        $supplier = Supplier::factory()->create();
        $product = Product::factory()->create(['has_variants' => false, 'stock' => 10]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/mobile/v1/purchases', [
                'supplier_id' => $supplier->id,
                'invoice_number' => 'INV-TEST-999',
                'purchase_date' => now()->toDateString(),
                'status' => 'received',
                'items' => [
                    [
                        'product_id' => $product->id,
                        'qty' => 5,
                        'cost_price' => 1000,
                    ],
                ],
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('purchases', ['invoice_number' => 'INV-TEST-999']);
        $this->assertEquals(15, $product->fresh()->stock);
    }

    public function test_user_can_update_a_pending_purchase_to_received()
    {
        $product = Product::factory()->create(['has_variants' => false, 'stock' => 10]);
        $purchase = Purchase::factory()->create(['status' => 'pending']);
        $purchase->details()->create([
            'product_id' => $product->id,
            'qty' => 10,
            'cost_price' => 1000,
            'subtotal' => 10000,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->patchJson("/api/mobile/v1/purchases/{$purchase->id}/status", [
                'status' => 'received',
            ]);

        $response->assertStatus(200);
        $this->assertEquals('received', $purchase->fresh()->status);
        $this->assertEquals(20, $product->fresh()->stock);
    }
}
