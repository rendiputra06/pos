<?php

namespace App\Http\Controllers;

use App\Models\StockTransfer;
use App\Models\StockTransferDetail;
use App\Models\Store;
use App\Models\StoreProduct;
use App\Models\ProductBank;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class StockTransferController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $query = StockTransfer::with(['fromStore', 'toStore', 'user']);

        // Store Admins only see transfers related to their store
        if (!$user->isSuperAdmin()) {
            $query->where(function($q) use ($user) {
                $q->where('from_store_id', $user->store_id)
                  ->orWhere('to_store_id', $user->store_id);
            });
        }

        return Inertia::render('stock-transfers/Index', [
            'transfers' => $query->latest()->paginate(10),
        ]);
    }

    public function create()
    {
        return Inertia::render('stock-transfers/Form', [
            'stores' => Store::where('is_active', true)->get(),
            'products' => ProductBank::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'from_store_id' => 'required|exists:stores,id',
            'to_store_id' => 'required|exists:stores,id|different:from_store_id',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_bank_id' => 'required|exists:product_bank,id',
            'items.*.qty' => 'required|numeric|min:0.01',
        ]);

        return DB::transaction(function() use ($validated) {
            $transfer = StockTransfer::create([
                'from_store_id' => $validated['from_store_id'],
                'to_store_id' => $validated['to_store_id'],
                'reference_number' => 'TRF-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'status' => 'pending',
                'notes' => $validated['notes'],
                'user_id' => auth()->id(),
            ]);

            foreach ($validated['items'] as $item) {
                StockTransferDetail::create([
                    'stock_transfer_id' => $transfer->id,
                    'product_bank_id' => $item['product_bank_id'],
                    'qty' => $item['qty'],
                ]);
            }

            return redirect()->route('stock-transfers.index')->with('success', 'Mutasi stok berhasil dibuat.');
        });
    }

    public function show(StockTransfer $stockTransfer)
    {
        $stockTransfer->load(['fromStore', 'toStore', 'user', 'details.productBank']);
        return Inertia::render('stock-transfers/Show', [
            'transfer' => $stockTransfer,
        ]);
    }

    public function updateStatus(Request $request, StockTransfer $stockTransfer)
    {
        $validated = $request->validate([
            'status' => 'required|in:shipped,received,cancelled',
        ]);

        $oldStatus = $stockTransfer->status;
        $newStatus = $validated['status'];

        // Logic check: only pending can go to shipped/cancelled
        if ($oldStatus === 'pending' && !in_array($newStatus, ['shipped', 'cancelled'])) {
            return back()->with('error', 'Status tidak valid.');
        }

        // Only shipped can go to received
        if ($oldStatus === 'shipped' && $newStatus !== 'received') {
            return back()->with('error', 'Status tidak valid.');
        }

        return DB::transaction(function() use ($stockTransfer, $newStatus) {
            $stockTransfer->status = $newStatus;
            
            if ($newStatus === 'shipped') {
                $stockTransfer->shipped_at = now();
                
                // Decrement stock from source store
                foreach ($stockTransfer->details as $detail) {
                    $storeProduct = StoreProduct::where('store_id', $stockTransfer->from_store_id)
                        ->where('product_bank_id', $detail->product_bank_id)
                        ->first();
                    
                    if (!$storeProduct || $storeProduct->stock < $detail->qty) {
                        throw new \Exception("Stok tidak mencukupi untuk produk: " . ($storeProduct ? $storeProduct->productBank->name : $detail->product_bank_id));
                    }
                    
                    $storeProduct->decrement('stock', $detail->qty);
                }
            }

            if ($newStatus === 'received') {
                $stockTransfer->received_at = now();
                
                // Increment stock in destination store
                foreach ($stockTransfer->details as $detail) {
                    $storeProduct = StoreProduct::firstOrCreate(
                        ['store_id' => $stockTransfer->to_store_id, 'product_bank_id' => $detail->product_bank_id],
                        [
                            'price' => 0, // Should be set later or taken from source? 
                            'cost_price' => 0,
                            'stock' => 0,
                            'is_active' => true
                        ]
                    );
                    
                    // If newly created, maybe copy info from source store?
                    $sourceProduct = StoreProduct::where('store_id', $stockTransfer->from_store_id)
                        ->where('product_bank_id', $detail->product_bank_id)
                        ->first();
                        
                    if ($sourceProduct && $storeProduct->wasRecentlyCreated) {
                        $storeProduct->update([
                            'price' => $sourceProduct->price,
                            'cost_price' => $sourceProduct->cost_price,
                        ]);
                    }

                    $storeProduct->increment('stock', $detail->qty);
                }
            }

            $stockTransfer->save();
            return back()->with('success', 'Status mutasi berhasil diperbarui.');
        });
    }
}
