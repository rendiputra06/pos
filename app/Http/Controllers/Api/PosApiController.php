<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StoreProduct;
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

        // In multi-store, we search in StoreProduct (which uses StoreScope)
        $exactMatch = StoreProduct::whereHas('productBank', function($q) use ($query) {
            $q->where('sku', $query)
              ->orWhere('barcode', $query);
        })->first();

        if ($exactMatch) {
            return response()->json([[
                'id' => $exactMatch->id,
                'name' => $exactMatch->productBank->name,
                'price' => $exactMatch->price,
                'type' => 'product',
                'sku' => $exactMatch->productBank->sku,
                'barcode' => $exactMatch->productBank->barcode,
                'stock' => $exactMatch->stock,
                'unit' => $exactMatch->productBank->unit,
                'is_exact' => true
            ]]);
        }

        $products = StoreProduct::with('productBank')
            ->whereHas('productBank', function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('sku', 'like', "%{$query}%")
                  ->orWhere('barcode', 'like', "%{$query}%");
            })
            ->limit(10)
            ->get()
            ->map(function ($sp) {
                return [
                    'id' => $sp->id,
                    'name' => $sp->productBank->name,
                    'price' => $sp->price,
                    'type' => 'product',
                    'sku' => $sp->productBank->sku,
                    'barcode' => $sp->productBank->barcode,
                    'stock' => $sp->stock,
                    'unit' => $sp->productBank->unit,
                ];
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
            'payment_method' => 'required|in:cash,qris,bank_transfer',
            'total_amount' => 'required|numeric',
            'discount' => 'numeric',
            'grand_total' => 'required|numeric',
        ]);

        return DB::transaction(function () use ($request) {
            $user = $request->user();
            
            $transaction = Transaction::create([
                'store_id' => $user->store_id, // Explicitly set store_id
                'invoice_number' => 'INV-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'user_id' => $user->id,
                'total_amount' => $request->total_amount,
                'discount' => $request->discount ?? 0,
                'grand_total' => $request->grand_total,
                'payment_method' => $request->payment_method,
                'status' => 'success',
            ]);

            foreach ($request->items as $item) {
                $costPrice = 0;
                
                if ($item['type'] === 'product') {
                    $product = StoreProduct::find($item['id']);
                    if ($product) {
                        $costPrice = $product->cost_price;
                        $product->decrement('stock', $item['qty']);
                    }
                }

                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'item_type' => $item['type'] === 'product' ? StoreProduct::class : Service::class,
                    'item_id' => $item['id'],
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                    'cost_price' => $costPrice,
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

