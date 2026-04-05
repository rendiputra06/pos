<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Purchase;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Return summary statistics for the mobile dashboard.
     *
     * GET /api/mobile/v1/dashboard
     */
    public function index(Request $request)
    {
        $totalProducts   = Product::count();
        $lowStockCount   = Product::where(function ($q) {
            $q->where('has_variants', false)->where('stock', '<=', 5)->where('stock', '>', 0);
        })->orWhereHas('variants', function ($q) {
            $q->where('stock', '<=', 5)->where('stock', '>', 0);
        })->count();

        $outOfStockCount = Product::where(function ($q) {
            $q->where('has_variants', false)->where('stock', 0);
        })->orWhere(function ($q) {
            $q->where('has_variants', true)->whereDoesntHave('variants', function ($sub) {
                $sub->where('stock', '>', 0);
            });
        })->count();

        $todayPurchases = Purchase::whereDate('purchase_date', today())->count();
        $todayPurchaseValue = Purchase::whereDate('purchase_date', today())
            ->where('status', 'received')
            ->sum('total_amount');

        $monthPurchaseValue = Purchase::whereMonth('purchase_date', now()->month)
            ->whereYear('purchase_date', now()->year)
            ->where('status', 'received')
            ->sum('total_amount');

        return response()->json([
            'success' => true,
            'data'    => [
                'total_products'      => $totalProducts,
                'low_stock_count'     => $lowStockCount,
                'out_of_stock_count'  => $outOfStockCount,
                'today_purchases'     => $todayPurchases,
                'today_purchase_value'   => (float) $todayPurchaseValue,
                'month_purchase_value'   => (float) $monthPurchaseValue,
            ],
        ]);
    }
}
