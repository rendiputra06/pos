<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\Service;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PosApiController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('q');

        if (empty($query)) {
            return response()->json([]);
        }

        // Check for exact SKU or Barcode match first - can match product or unit
        $exactProductMatch = Product::where('sku', $query)
            ->orWhere('barcode', $query)
            ->first();

        if ($exactProductMatch) {
            $result = [
                'id' => $exactProductMatch->id,
                'name' => $exactProductMatch->name,
                'price' => $exactProductMatch->price,
                'type' => 'product',
                'sku' => $exactProductMatch->sku,
                'barcode' => $exactProductMatch->barcode,
                'stock' => $exactProductMatch->stock,
                'unit' => $exactProductMatch->unit,
                'has_multiple_units' => false,
                'is_exact' => true
            ];

            // Load and attach units if product has multiple units
            $exactProductMatch->load('activeUnits');
            if ($exactProductMatch->has_multiple_units) {
                $result['has_multiple_units'] = true;
                $result['units'] = $exactProductMatch->activeUnits->map(function ($u) {
                    return [
                        'id' => $u->id,
                        'name' => $u->name,
                        'price' => $u->price,
                        'stock' => $u->getEffectiveStock(),
                        'sku' => $u->sku,
                        'barcode' => $u->barcode,
                        'conversion_factor' => $u->conversion_factor,
                    ];
                });
                // Use base unit price for default
                $baseUnit = $exactProductMatch->activeUnits->firstWhere('is_base_unit', true);
                if ($baseUnit) {
                    $result['price'] = $baseUnit->price;
                    $result['stock'] = $baseUnit->stock;
                    $result['unit'] = $baseUnit->name;
                }
            }

            return response()->json([$result]);
        }

        // Check for exact unit SKU/barcode match
        $exactUnitMatch = ProductUnit::where('sku', $query)
            ->orWhere('barcode', $query)
            ->where('is_active', true)
            ->first();

        if ($exactUnitMatch) {
            $product = $exactUnitMatch->product;
            return response()->json([[
                'id' => $product->id,
                'unit_id' => $exactUnitMatch->id,
                'name' => $product->name . ' (' . $exactUnitMatch->name . ')',
                'price' => $exactUnitMatch->price,
                'type' => 'product',
                'sku' => $exactUnitMatch->sku,
                'barcode' => $exactUnitMatch->barcode,
                'stock' => $exactUnitMatch->getEffectiveStock(),
                'unit' => $exactUnitMatch->name,
                'conversion_factor' => $exactUnitMatch->conversion_factor,
                'has_multiple_units' => true,
                'selected_unit_id' => $exactUnitMatch->id,
                'is_exact' => true
            ]]);
        }

        $products = Product::where('name', 'like', "%{$query}%")
            ->orWhere('sku', 'like', "%{$query}%")
            ->orWhere('barcode', 'like', "%{$query}%")
            ->limit(10)
            ->get()
            ->map(function ($p) {
                $data = [
                    'id' => $p->id,
                    'name' => $p->name,
                    'price' => $p->price,
                    'type' => 'product',
                    'sku' => $p->sku,
                    'barcode' => $p->barcode,
                    'stock' => $p->stock,
                    'unit' => $p->unit,
                    'has_multiple_units' => false,
                ];

                // Load units if product has multiple units
                if ($p->has_multiple_units) {
                    $p->load('activeUnits');
                    $data['has_multiple_units'] = true;
                    $data['units'] = $p->activeUnits->map(function ($u) {
                        return [
                            'id' => $u->id,
                            'name' => $u->name,
                            'price' => $u->price,
                            'stock' => $u->getEffectiveStock(),
                            'sku' => $u->sku,
                            'barcode' => $u->barcode,
                            'conversion_factor' => $u->conversion_factor,
                        ];
                    });
                    // Use base unit for default display
                    $baseUnit = $p->activeUnits->firstWhere('is_base_unit', true);
                    if ($baseUnit) {
                        $data['price'] = $baseUnit->price;
                        $data['stock'] = $baseUnit->stock;
                        $data['unit'] = $baseUnit->name;
                    }
                }

                return $data;
            });

        $services = Service::where('name', 'like', "%{$query}%")
            ->with('priceLevels')
            ->limit(5)
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'name' => $s->name,
                    'price' => $s->base_price,
                    'type' => 'service',
                    'price_levels' => $s->priceLevels,
                ];
            });

        return response()->json($products->concat($services)->values());
    }

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required',
            'items.*.type' => 'required|in:product,service',
            'items.*.qty' => 'required|numeric|min:0.01',
            'items.*.unit_id' => 'nullable|integer|exists:product_units,id',
            'payment_method' => 'required|in:cash,qris,bank_transfer',
            'total_amount' => 'required|numeric',
            'discount' => 'numeric',
            'grand_total' => 'required|numeric',
        ]);

        return DB::transaction(function () use ($request) {
            $transaction = Transaction::create([
                'invoice_number' => 'INV-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'user_id' => $request->user()->id,
                'total_amount' => $request->total_amount,
                'discount' => $request->discount ?? 0,
                'grand_total' => $request->grand_total,
                'payment_method' => $request->payment_method,
                'status' => 'success',
            ]);

            foreach ($request->items as $item) {
                $costPrice = 0;
                $unitName = null;
                $conversionFactor = 1;
                $baseQty = null;

                if ($item['type'] === 'product') {
                    $product = Product::find($item['id']);
                    if ($product) {
                        // Check if unit_id is provided (multi-unit product)
                        if (!empty($item['unit_id'])) {
                            $unit = ProductUnit::where('id', $item['unit_id'])
                                ->where('product_id', $product->id)
                                ->first();

                            if ($unit) {
                                $costPrice = $unit->cost_price;
                                $unitName = $unit->name;
                                $conversionFactor = $unit->conversion_factor;
                                $baseQty = $item['qty'] * $conversionFactor;

                                // Deduct stock from base unit
                                $baseUnit = $product->baseUnit;
                                if ($baseUnit) {
                                    $baseUnit->decrement('stock', $baseQty);
                                }
                            } else {
                                // Fallback to product defaults
                                $costPrice = $product->cost_price;
                                $product->decrement('stock', $item['qty']);
                            }
                        } else {
                            // Standard product stock deduction
                            $costPrice = $product->cost_price;
                            $unitName = $product->unit;

                            // Check if product has multiple units (use base unit)
                            if ($product->has_multiple_units) {
                                $baseUnit = $product->baseUnit;
                                if ($baseUnit) {
                                    $baseUnit->decrement('stock', $item['qty']);
                                    $costPrice = $baseUnit->cost_price;
                                    $unitName = $baseUnit->name;
                                }
                            } else {
                                $product->decrement('stock', $item['qty']);
                            }
                        }
                    }
                }

                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'item_type' => $item['type'] === 'product' ? Product::class : Service::class,
                    'item_id' => $item['id'],
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                    'cost_price' => $costPrice,
                    'unit_name' => $unitName,
                    'conversion_factor' => $conversionFactor,
                    'base_qty' => $baseQty,
                    'subtotal' => $item['qty'] * $item['price'],
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil disimpan',
                'data' => $transaction->load('details'),
            ]);
        });
    }
}
