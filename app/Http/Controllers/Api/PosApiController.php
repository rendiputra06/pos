<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
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

        $products = Product::where('name', 'like', "%{$query}%")
            ->orWhere('sku', 'like', "%{$query}%")
            ->limit(10)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'price' => $p->price,
                    'type' => 'product',
                    'sku' => $p->sku,
                    'stock' => $p->stock,
                    'unit' => $p->unit,
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
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'item_type' => $item['type'] === 'product' ? Product::class : Service::class,
                    'item_id' => $item['id'],
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                    'subtotal' => $item['qty'] * $item['price'],
                ]);

                // Reduce stock if it's a product
                if ($item['type'] === 'product') {
                    $product = Product::find($item['id']);
                    if ($product) {
                        $product->decrement('stock', $item['qty']);
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil disimpan',
                'data' => $transaction->load('details'),
            ]);
        });
    }
}
