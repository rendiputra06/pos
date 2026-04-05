<?php

namespace Tests\Feature\Api\Mobile;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\VariantGroup;
use App\Models\VariantOption;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductAdvApiTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_user_can_list_low_stock_products()
    {
        // Simple product with low stock
        Product::factory()->create(['stock' => 2, 'has_variants' => false]);
        // Simple product with high stock
        Product::factory()->create(['stock' => 10, 'has_variants' => false]);
        // Variant product with one low stock variant
        $variantProduct = Product::factory()->create(['has_variants' => true]);
        ProductVariant::factory()->create(['product_id' => $variantProduct->id, 'stock' => 1]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/mobile/v1/products/low-stock?threshold=5');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_user_can_manage_variant_groups()
    {
        $product = Product::factory()->create();

        // Create Group
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/mobile/v1/products/{$product->id}/variant-groups", [
                'name' => 'Ukuran',
                'type' => 'size',
                'is_required' => true,
            ]);

        $response->assertStatus(201);
        $groupId = $response->json('data.id');

        // Update Group
        $this->actingAs($this->user, 'sanctum')
            ->putJson("/api/mobile/v1/products/{$product->id}/variant-groups/{$groupId}", [
                'name' => 'Ukuran Baju',
                'is_required' => false,
            ])
            ->assertStatus(200);

        $this->assertDatabaseHas('variant_groups', ['name' => 'Ukuran Baju']);

        // Delete Group
        $this->actingAs($this->user, 'sanctum')
            ->deleteJson("/api/mobile/v1/products/{$product->id}/variant-groups/{$groupId}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('variant_groups', ['id' => $groupId]);
    }

    public function test_user_can_manage_variant_options()
    {
        $product = Product::factory()->create();
        $group = VariantGroup::factory()->create(['product_id' => $product->id]);

        // Create Option
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/mobile/v1/products/{$product->id}/variant-groups/{$group->id}/options", [
                'value' => 'XL',
                'display_value' => 'Extra Large',
            ]);

        $response->assertStatus(201);
        $optionId = $response->json('data.options.0.id');

        // Update Option
        $this->actingAs($this->user, 'sanctum')
            ->putJson("/api/mobile/v1/products/{$product->id}/variant-groups/{$group->id}/options/{$optionId}", [
                'value' => 'XXL',
                'display_value' => 'Double XL',
                'is_active' => true,
            ])
            ->assertStatus(200);

        $this->assertDatabaseHas('variant_options', ['value' => 'XXL']);

        // Delete Option
        $this->actingAs($this->user, 'sanctum')
            ->deleteJson("/api/mobile/v1/products/{$product->id}/variant-groups/{$group->id}/options/{$optionId}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('variant_options', ['id' => $optionId]);
    }

    public function test_user_can_auto_generate_variants()
    {
        $product = Product::factory()->create();
        $group = VariantGroup::factory()->create(['product_id' => $product->id, 'type' => 'size']);
        $group->options()->create(['value' => 'S', 'display_value' => 'Small', 'display_order' => 0]);
        $group->options()->create(['value' => 'M', 'display_value' => 'Medium', 'display_order' => 1]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/mobile/v1/products/{$product->id}/generate-variants");

        $response->assertStatus(200);
        $this->assertDatabaseCount('product_variants', 2);
        
        $product->refresh();
        $this->assertTrue($product->has_variants);
    }
}
