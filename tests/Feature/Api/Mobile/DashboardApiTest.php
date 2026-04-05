<?php

namespace Tests\Feature\Api\Mobile;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardApiTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_dashboard_returns_summary_data()
    {
        Product::factory()->create(['stock' => 0]); // Out of stock
        Product::factory()->create(['stock' => 3]); // Low stock
        Product::factory()->create(['stock' => 20]); // Normal stock
        
        Purchase::factory()->create([
            'purchase_date' => now(), 
            'status' => 'received', 
            'total_amount' => 100000
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/mobile/v1/dashboard');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_products' => 3,
                    'low_stock_count' => 1,
                    'out_of_stock_count' => 1,
                    'today_purchases' => 1,
                    'today_purchase_value' => 100000,
                ],
            ]);
    }
}
