<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PurchaseController extends Controller
{
    public function index(Request $request)
    {
        $purchases = Purchase::with(['supplier', 'creator'])
            ->when($request->search, function ($query, $search) {
                $query->where('invoice_number', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('purchases/Index', [
            'purchases' => $purchases,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('purchases/Form', [
            'suppliers' => Supplier::all(['id', 'name']),
            'products' => Product::all(['id', 'name', 'sku', 'cost_price', 'unit']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'invoice_number' => 'required|string|unique:purchases,invoice_number',
            'purchase_date' => 'required|date',
            'status' => 'required|in:pending,received',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|numeric|min:0.01',
            'items.*.cost_price' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request) {
            $totalAmount = collect($request->items)->sum(fn($item) => $item['qty'] * $item['cost_price']);

            $purchase = Purchase::create([
                'supplier_id' => $request->supplier_id,
                'invoice_number' => $request->invoice_number,
                'purchase_date' => $request->purchase_date,
                'total_amount' => $totalAmount,
                'status' => $request->status,
                'notes' => $request->notes,
                'created_by' => $request->user()->id,
            ]);

            foreach ($request->items as $item) {
                $purchase->details()->create([
                    'product_id' => $item['product_id'],
                    'qty' => $item['qty'],
                    'cost_price' => $item['cost_price'],
                    'subtotal' => $item['qty'] * $item['cost_price'],
                ]);

                if ($request->status === 'received') {
                    $product = Product::find($item['product_id']);
                    $product->increment('stock', $item['qty']);
                    $product->update(['cost_price' => $item['cost_price']]);
                }
            }

            return redirect()->route('purchases.index')->with('success', 'Pembelian stok berhasil dicatat.');
        });
    }

    public function show(Purchase $purchase)
    {
        return Inertia::render('purchases/Show', [
            'purchase' => $purchase->load(['supplier', 'details.product', 'creator']),
        ]);
    }

    public function updateStatus(Request $request, Purchase $purchase)
    {
        $request->validate([
            'status' => 'required|in:received,canceled',
        ]);

        if ($purchase->status !== 'pending') {
            return back()->with('error', 'Status pembelian ini tidak dapat diubah lagi.');
        }

        return DB::transaction(function () use ($request, $purchase) {
            $purchase->update(['status' => $request->status]);

            if ($request->status === 'received') {
                foreach ($purchase->details as $detail) {
                    $product = Product::find($detail->product_id);
                    $product->increment('stock', $detail->qty);
                    $product->update(['cost_price' => $detail->cost_price]);
                }
            }

            return redirect()->route('purchases.index')->with('success', 'Status pembelian diperbarui.');
        });
    }

    public function destroy(Purchase $purchase)
    {
        if ($purchase->status === 'received') {
            return back()->with('error', 'Pembelian yang sudah diterima tidak dapat dihapus.');
        }

        $purchase->delete();

        return redirect()->route('purchases.index')->with('success', 'Data pembelian dihapus.');
    }
}
