<?php

namespace Tests\Feature\Api\Mobile;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_user_can_list_products()
    {
        Product::factory()->count(5)->create();

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/mobile/v1/products');

        $response->assertStatus(200)
            ->assertJsonCount(5, 'data');
    }

    public function test_user_can_search_products_by_name()
    {
        Product::factory()->create(['name' => 'Matching Product']);
        Product::factory()->create(['name' => 'Other Product']);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/mobile/v1/products?search=Matching');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment(['name' => 'Matching Product']);
    }

    public function test_user_can_find_product_by_barcode()
    {
        $product = Product::factory()->create(['barcode' => '1234567890123']);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/mobile/v1/products/barcode/1234567890123');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'type' => 'product',
                'data' => [
                    'id' => $product->id,
                    'barcode' => '1234567890123',
                ],
            ]);
    }

    public function test_user_can_find_variant_by_barcode()
    {
        $variant = ProductVariant::factory()->create(['barcode' => '9876543210987']);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/mobile/v1/products/barcode/9876543210987');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'type' => 'variant',
                'variant_id' => $variant->id,
            ]);
    }

    public function test_user_can_create_a_simple_product()
    {
        $category = Category::factory()->create();

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/mobile/v1/products', [
                'category_id' => $category->id,
                'name' => 'New Product',
                'sku' => 'NP-001',
                'barcode' => '1111111111111',
                'unit' => 'pcs',
                'has_variants' => false,
                'cost_price' => 1000,
                'price' => 2000,
                'stock' => 50,
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('products', ['name' => 'New Product']);
    }

    public function test_user_can_update_a_product()
    {
        $product = Product::factory()->create();

        $response = $this->actingAs($this->user, 'sanctum')
            ->putJson("/api/mobile/v1/products/{$product->id}", [
                'category_id' => $product->category_id,
                'name' => 'Updated Name',
                'unit' => 'box',
                'cost_price' => 1500,
                'price' => 2500,
                'stock' => 60,
                'has_variants' => false,
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('products', ['id' => $product->id, 'name' => 'Updated Name']);
    }

    public function test_user_can_delete_a_product()
    {
        $product = Product::factory()->create();

        $response = $this->actingAs($this->user, 'sanctum')
            ->deleteJson("/api/mobile/v1/products/{$product->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }
}
