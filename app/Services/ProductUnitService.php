<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductUnit;
use Illuminate\Support\Facades\DB;

class ProductUnitService
{
    /**
     * Sync product units during update
     * Handles creating, updating, and deleting units while ensuring exactly one base unit exists
     *
     * @param Product $product
     * @param array $units
     * @return void
     */
    public function syncUnits(Product $product, array $units): void
    {
        DB::beginTransaction();

        try {
            $existingUnitIds = $product->units()->pluck('id')->toArray();
            $processedIds = [];

            foreach ($units as $index => $unitData) {
                $unitId = $unitData['id'] ?? null;

                if ($unitId && in_array($unitId, $existingUnitIds)) {
                    // Update existing unit
                    $this->updateExistingUnit($product, $unitId, $unitData, $index, $processedIds);
                    $processedIds[] = $unitId;
                } else {
                    // Create new unit
                    $newUnit = $this->createNewUnit($product, $unitData, $index);
                    $processedIds[] = $newUnit->id;
                }
            }

            // Delete units that are not in the new list
            $this->deleteRemovedUnits($product, $existingUnitIds, $processedIds);

            // Ensure there's always at least one base unit
            $this->ensureBaseUnitExists($product);

            // Sync base unit stock to product stock
            $this->syncBaseUnitStockToProduct($product);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update an existing unit
     *
     * @param Product $product
     * @param int $unitId
     * @param array $unitData
     * @param int $index
     * @param array $processedIds
     * @return void
     */
    private function updateExistingUnit(Product $product, int $unitId, array $unitData, int $index, array $processedIds): void
    {
        $unit = $product->units()->find($unitId);
        if (!$unit) {
            return;
        }

        // If this unit was base unit and is being changed to non-base
        if ($unit->is_base_unit && !($unitData['is_base_unit'] ?? false)) {
            $this->handleBaseUnitChange($product, $unitId, $unitData, $index, $processedIds);
        }

        $unit->update([
            'name' => $unitData['name'],
            'sku' => $unitData['sku'],
            'barcode' => $unitData['barcode'] ?? null,
            'price' => $unitData['price'],
            'cost_price' => $unitData['cost_price'],
            'stock' => $unitData['stock'] ?? $unit->stock,
            'conversion_factor' => $unitData['conversion_factor'],
            'is_base_unit' => $unitData['is_base_unit'] ?? false,
            'display_order' => $index,
        ]);
    }

    /**
     * Handle the case when a base unit is being changed to non-base
     *
     * @param Product $product
     * @param int $unitId
     * @param array $unitData
     * @param int $index
     * @param array $processedIds
     * @return void
     */
    private function handleBaseUnitChange(Product $product, int $unitId, array $unitData, int $index, array $processedIds): void
    {
        // First, unset this unit as base
        $product->units()->where('id', $unitId)->update(['is_base_unit' => false]);

        // Find another unit to be base unit
        $otherUnit = $product->units()
            ->where('id', '!=', $unitId)
            ->where('id', '!=', ($processedIds[0] ?? null))
            ->first();

        if ($otherUnit) {
            $otherUnit->update(['is_base_unit' => true]);
        } elseif ($index === 0 || count($processedIds) === 0) {
            // Force this to remain base unit if it's the only one
            $product->units()->where('id', $unitId)->update(['is_base_unit' => true]);
        }
    }

    /**
     * Create a new unit
     *
     * @param Product $product
     * @param array $unitData
     * @param int $index
     * @return ProductUnit
     */
    private function createNewUnit(Product $product, array $unitData, int $index): ProductUnit
    {
        $isBaseUnit = $unitData['is_base_unit'] ?? false;

        // If this is being set as base unit, unset existing
        if ($isBaseUnit) {
            $product->units()->where('is_base_unit', true)->update(['is_base_unit' => false]);
        }

        // If no base unit exists yet and this is first unit, make it base
        if ($index === 0 && !$product->baseUnit) {
            $isBaseUnit = true;
        }

        return $product->units()->create([
            'name' => $unitData['name'],
            'sku' => $unitData['sku'],
            'barcode' => $unitData['barcode'] ?? null,
            'price' => $unitData['price'],
            'cost_price' => $unitData['cost_price'],
            'stock' => $isBaseUnit ? ($unitData['stock'] ?? 0) : 0,
            'conversion_factor' => $unitData['conversion_factor'],
            'is_base_unit' => $isBaseUnit,
            'is_active' => true,
            'display_order' => $index,
        ]);
    }

    /**
     * Delete units that are not in the new list
     *
     * @param Product $product
     * @param array $existingUnitIds
     * @param array $processedIds
     * @return void
     */
    private function deleteRemovedUnits(Product $product, array $existingUnitIds, array $processedIds): void
    {
        $unitsToDelete = array_diff($existingUnitIds, $processedIds);
        if (empty($unitsToDelete)) {
            return;
        }

        // Check if we're deleting the base unit
        $baseUnitToDelete = $product->units()
            ->whereIn('id', $unitsToDelete)
            ->where('is_base_unit', true)
            ->first();

        if ($baseUnitToDelete) {
            // First, unset the base unit
            $baseUnitToDelete->update(['is_base_unit' => false]);

            // Find a remaining unit to set as base
            $remainingUnit = $product->units()
                ->whereNotIn('id', $unitsToDelete)
                ->first();
            if ($remainingUnit) {
                $remainingUnit->update(['is_base_unit' => true]);
            }
        }

        $product->units()->whereIn('id', $unitsToDelete)->delete();
    }

    /**
     * Ensure there's always at least one base unit
     *
     * @param Product $product
     * @return void
     */
    private function ensureBaseUnitExists(Product $product): void
    {
        if (!$product->baseUnit) {
            $firstUnit = $product->units()->first();
            if ($firstUnit) {
                $firstUnit->update(['is_base_unit' => true]);
            }
        }
    }

    /**
     * Sync base unit stock to product stock
     *
     * @param Product $product
     * @return void
     */
    private function syncBaseUnitStockToProduct(Product $product): void
    {
        $product->refresh();
        if ($product->baseUnit) {
            $product->update(['stock' => $product->baseUnit->stock]);
        }
    }

    /**
     * Create initial units for a new product with multiple units
     * First unit automatically becomes base unit
     *
     * @param Product $product
     * @param array $units
     * @return void
     */
    public function createInitialUnits(Product $product, array $units): void
    {
        foreach ($units as $index => $unitData) {
            // First unit becomes base unit automatically
            $isBaseUnit = $index === 0;

            $product->units()->create([
                'name' => $unitData['name'],
                'sku' => $unitData['sku'],
                'barcode' => $unitData['barcode'] ?? null,
                'price' => $unitData['price'],
                'cost_price' => $unitData['cost_price'],
                'stock' => $isBaseUnit ? ($unitData['stock'] ?? 0) : 0,
                'conversion_factor' => $unitData['conversion_factor'],
                'is_base_unit' => $isBaseUnit,
                'is_active' => true,
                'display_order' => $index,
            ]);
        }

        // Sync base unit stock to product
        $this->syncBaseUnitStockToProduct($product);
    }

    /**
     * Validate that a product has exactly one base unit
     *
     * @param Product $product
     * @return bool
     */
    public function validateSingleBaseUnit(Product $product): bool
    {
        $baseUnitCount = $product->units()->where('is_base_unit', true)->count();
        return $baseUnitCount === 1;
    }

    /**
     * Get the base unit for a product, or create one if none exists
     *
     * @param Product $product
     * @return ProductUnit|null
     */
    public function getOrCreateBaseUnit(Product $product): ?ProductUnit
    {
        $baseUnit = $product->baseUnit;

        if (!$baseUnit) {
            $firstUnit = $product->units()->first();
            if ($firstUnit) {
                $firstUnit->update(['is_base_unit' => true]);
                $baseUnit = $firstUnit->fresh();
            }
        }

        return $baseUnit;
    }
}
