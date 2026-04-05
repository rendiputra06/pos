<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Resources\Mobile\PurchaseResource;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Purchase;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    /**
     * List all purchases (stock-in records) with pagination.
     *
     * GET /api/mobile/v1/purchases
     *   ?search=invoice_number
     *   ?status=pending|received|canceled
     *   ?per_page=15
     */
    public function index(Request $request)
    {
        $purchases = Purchase::with(['supplier', 'creator'])
            ->when($request->search, fn ($q, $search) =>
                $q->where('invoice_number', 'like', "%{$search}%")
            )
            ->when($request->status, fn ($q, $status) =>
                $q->where('status', $status)
            )
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data'    => PurchaseResource::collection($purchases),
            'meta'    => [
                'current_page' => $purchases->currentPage(),
                'last_page'    => $purchases->lastPage(),
                'per_page'     => $purchases->perPage(),
                'total'        => $purchases->total(),
            ],
        ]);
    }

    /**
     * Show a single purchase with all its items.
     *
     * GET /api/mobile/v1/purchases/{id}
     */
    public function show(Purchase $purchase)
    {
        $purchase->load(['supplier', 'creator', 'details.product', 'details.variant']);

        return response()->json([
            'success' => true,
            'data'    => new PurchaseResource($purchase),
        ]);
    }

    /**
     * Create a new purchase (stock in).
     *
     * POST /api/mobile/v1/purchases
     *
     * Body:
     * {
     *   "supplier_id": 1,
     *   "invoice_number": "INV-001",
     *   "purchase_date": "2026-04-05",
     *   "status": "received",   // pending | received
     *   "notes": "optional",
     *   "items": [
     *     { "product_id": 1, "variant_id": null, "qty": 10, "cost_price": 5000 },
     *     { "product_id": 2, "variant_id": 3,    "qty": 5,  "cost_price": 8000 }
     *   ]
     * }
     */
    public function store(Request $request)
    {
        $request->validate([
            'supplier_id'            => 'required|exists:suppliers,id',
            'invoice_number'         => 'required|string|unique:purchases,invoice_number',
            'purchase_date'          => 'required|date',
            'status'                 => 'required|in:pending,received',
            'notes'                  => 'nullable|string',
            'items'                  => 'required|array|min:1',
            'items.*.product_id'     => 'required|exists:products,id',
            'items.*.variant_id'     => 'nullable|exists:product_variants,id',
            'items.*.qty'            => 'required|numeric|min:0.01',
            'items.*.cost_price'     => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request) {
            $totalAmount = collect($request->items)
                ->sum(fn ($item) => $item['qty'] * $item['cost_price']);

            $purchase = Purchase::create([
                'supplier_id'    => $request->supplier_id,
                'invoice_number' => $request->invoice_number,
                'purchase_date'  => $request->purchase_date,
                'total_amount'   => $totalAmount,
                'status'         => $request->status,
                'notes'          => $request->notes,
                'created_by'     => $request->user()->id,
            ]);

            foreach ($request->items as $item) {
                $purchase->details()->create([
                    'product_id' => $item['product_id'],
                    'qty'        => $item['qty'],
                    'cost_price' => $item['cost_price'],
                    'subtotal'   => $item['qty'] * $item['cost_price'],
                ]);

                // If status is received, increment stock immediately
                if ($request->status === 'received') {
                    $variantId = $item['variant_id'] ?? null;

                    if ($variantId) {
                        $variant = ProductVariant::find($variantId);
                        if ($variant) {
                            $variant->increment('stock', $item['qty']);
                            $variant->update(['cost_price' => $item['cost_price']]);
                        }
                    } else {
                        $product = Product::find($item['product_id']);
                        if ($product && ! $product->has_variants) {
                            $product->increment('stock', $item['qty']);
                            $product->update(['cost_price' => $item['cost_price']]);
                        }
                    }
                }
            }

            $purchase->load(['supplier', 'creator', 'details.product']);

            return response()->json([
                'success' => true,
                'message' => 'Purchase created successfully.',
                'data'    => new PurchaseResource($purchase),
            ], 201);
        });
    }

    /**
     * Update purchase status (pending → received | canceled).
     *
     * PATCH /api/mobile/v1/purchases/{id}/status
     * Body: { "status": "received" }
     */
    public function updateStatus(Request $request, Purchase $purchase)
    {
        $request->validate([
            'status' => 'required|in:received,canceled',
        ]);

        if ($purchase->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending purchases can be updated.',
            ], 422);
        }

        return DB::transaction(function () use ($request, $purchase) {
            $purchase->update(['status' => $request->status]);

            if ($request->status === 'received') {
                foreach ($purchase->details as $detail) {
                    $product = Product::find($detail->product_id);
                    if ($product && ! $product->has_variants) {
                        $product->increment('stock', $detail->qty);
                        $product->update(['cost_price' => $detail->cost_price]);
                    }
                }
            }

            $purchase->load(['supplier', 'creator', 'details.product']);

            return response()->json([
                'success' => true,
                'message' => 'Purchase status updated.',
                'data'    => new PurchaseResource($purchase),
            ]);
        });
    }
}
