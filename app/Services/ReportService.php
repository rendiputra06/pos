<?php

namespace App\Services;

use App\Models\ProductBank;
use App\Models\StoreProduct;
use App\Models\Service;
use App\Models\Expense;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportService
{
    /**
     * Get dashboard summary statistics
     */
    public function getDashboardSummary($storeId = null)
    {
        $today = Carbon::today();
        
        $salesQuery = Transaction::whereDate('created_at', $today)
            ->where('status', 'success');
        
        if ($storeId) {
            $salesQuery->where('store_id', $storeId);
        }

        $lowStockQuery = StoreProduct::with('productBank')
            ->where('stock', '<', 5);
        
        if ($storeId) {
            $lowStockQuery->where('store_id', $storeId);
        }
        
        return [
            'today_sales' => $salesQuery->sum('grand_total'),
            'today_transactions' => $salesQuery->count(),
            'top_products' => $this->getTopProducts(5, $storeId),
            'top_services' => $this->getTopServices(3, $storeId),
            'low_stock_products' => $lowStockQuery->get()
                ->map(fn($sp) => [
                    'id' => $sp->id,
                    'name' => $sp->productBank->name,
                    'stock' => $sp->stock,
                    'sku' => $sp->productBank->sku
                ]),
        ];
    }

    /**
     * Get sales trend for the last N days
     */
    public function getSalesTrend(int $days = 7, $storeId = null)
    {
        $startDate = Carbon::now()->subDays($days - 1)->startOfDay();
        
        $query = Transaction::where('status', 'success')
            ->where('created_at', '>=', $startDate);

        if ($storeId) {
            $query->where('store_id', $storeId);
        }

        $sales = $query->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(grand_total) as total'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Fill missing dates with zero
        $result = [];
        for ($i = 0; $i < $days; $i++) {
            $date = Carbon::now()->subDays($days - 1 - $i)->format('Y-m-d');
            $dayData = $sales->firstWhere('date', $date);
            
            $result[] = [
                'date' => $date,
                'total' => $dayData ? (float) $dayData->total : 0,
                'count' => $dayData ? $dayData->count : 0,
            ];
        }

        return $result;
    }

    /**
     * Get category breakdown
     */
    public function getCategoryBreakdown($startDate = null, $endDate = null, $storeId = null)
    {
        $query = TransactionDetail::query()
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', 'success');

        if ($storeId) {
            $query->where('transactions.store_id', $storeId);
        }

        if ($startDate) {
            $query->where('transactions.created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('transactions.created_at', '<=', $endDate);
        }

        // Get product sales by category via StoreProduct -> ProductBank
        $productSales = $query->clone()
            ->where('transaction_details.item_type', StoreProduct::class)
            ->join('store_products', 'transaction_details.item_id', '=', 'store_products.id')
            ->join('product_bank', 'store_products.product_bank_id', '=', 'product_bank.id')
            ->join('categories', 'product_bank.category_id', '=', 'categories.id')
            ->select('categories.name', DB::raw('SUM(transaction_details.subtotal) as total'))
            ->groupBy('categories.id', 'categories.name')
            ->get();

        // Get service sales by category
        $serviceSales = $query->clone()
            ->where('transaction_details.item_type', Service::class)
            ->join('services', 'transaction_details.item_id', '=', 'services.id')
            ->join('categories', 'services.category_id', '=', 'categories.id')
            ->select('categories.name', DB::raw('SUM(transaction_details.subtotal) as total'))
            ->groupBy('categories.id', 'categories.name')
            ->get();

        return $productSales->concat($serviceSales)->groupBy('name')->map(function ($items) {
            return [
                'name' => $items->first()->name,
                'total' => $items->sum('total'),
            ];
        })->values();
    }

    /**
     * Get top selling products
     */
    public function getTopProducts(int $limit = 5, $storeId = null)
    {
        $topOrderQuery = TransactionDetail::where('item_type', StoreProduct::class)
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', 'success');

        if ($storeId) {
            $topOrderQuery->where('transactions.store_id', $storeId);
        }

        $topOrder = $topOrderQuery->select('item_id', DB::raw('SUM(qty) as total_qty'), DB::raw('SUM(transaction_details.subtotal) as total_sales'))
            ->groupBy('item_id')
            ->orderByDesc('total_qty')
            ->limit($limit)
            ->get();

        $products = $topOrder->map(function ($item) {
            $sp = StoreProduct::with('productBank')->find($item->item_id);
            if (!$sp) return null;
            return [
                'id' => $sp->id,
                'name' => $sp->productBank->name,
                'sku' => $sp->productBank->sku,
                'stock' => $sp->stock,
                'total_qty' => $item->total_qty,
                'total_sales' => $item->total_sales,
                'type' => 'product',
                'is_top' => true
            ];
        })->filter();

        // Fallback to latest products if not enough top products
        if ($products->count() < $limit) {
            $excludeIds = $products->pluck('id')->toArray();
            $latestQuery = StoreProduct::with('productBank')
                ->whereNotIn('id', $excludeIds);
            
            if ($storeId) {
                $latestQuery->where('store_id', $storeId);
            }

            $latest = $latestQuery->latest()
                ->limit($limit - $products->count())
                ->get()
                ->map(function ($sp) {
                    return [
                        'id' => $sp->id,
                        'name' => $sp->productBank->name,
                        'sku' => $sp->productBank->sku,
                        'stock' => $sp->stock,
                        'type' => 'product',
                        'is_top' => false
                    ];
                });
            $products = $products->concat($latest);
        }

        return $products->values();
    }

    /**
     * Get top services
     */
    private function getTopServices(int $limit = 3, $storeId = null)
    {
        $query = TransactionDetail::where('item_type', Service::class)
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', 'success');

        if ($storeId) {
            $query->where('transactions.store_id', $storeId);
        }

        return $query->select('item_id', DB::raw('SUM(qty) as total_qty'), DB::raw('SUM(subtotal) as total_sales'))
            ->groupBy('item_id')
            ->orderByDesc('total_qty')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                $service = Service::find($item->item_id);
                if (!$service) return null;
                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'total_qty' => $item->total_qty,
                    'total_sales' => $item->total_sales,
                ];
            })->filter();
    }

    /**
     * Calculate profit/loss
     */
    public function getProfitLoss($startDate = null, $endDate = null, $storeId = null)
    {
        $query = Transaction::where('status', 'success');

        if ($storeId) {
            $query->where('store_id', $storeId);
        }

        if ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('created_at', '<=', $endDate);
        }

        $revenue = $query->sum('grand_total');

        // Calculate COGS
        $detailsQuery = TransactionDetail::query()
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', 'success')
            ->where('transaction_details.item_type', StoreProduct::class);

        if ($storeId) {
            $detailsQuery->where('transactions.store_id', $storeId);
        }

        if ($startDate) {
            $detailsQuery->where('transactions.created_at', '>=', $startDate);
        }
        if ($endDate) {
            $detailsQuery->where('transactions.created_at', '<=', $endDate);
        }

        $cogs = $detailsQuery->sum(DB::raw('transaction_details.cost_price * transaction_details.qty'));

        // Calculate Operational Expenses
        $expenseQuery = Expense::query();
        if ($storeId) {
            $expenseQuery->where('store_id', $storeId);
        }
        if ($startDate) {
            $expenseQuery->whereDate('expense_date', '>=', $startDate);
        }
        if ($endDate) {
            $expenseQuery->whereDate('expense_date', '<=', $endDate);
        }
        $expenses = $expenseQuery->sum('amount');

        $grossProfit = $revenue - $cogs;
        $netProfit = $grossProfit - $expenses;
        $profitMargin = $revenue > 0 ? ($netProfit / $revenue) * 100 : 0;

        return [
            'revenue' => $revenue,
            'cogs' => $cogs,
            'expenses' => $expenses,
            'gross_profit' => $grossProfit,
            'net_profit' => $netProfit,
            'profit_margin' => round($profitMargin, 2),
        ];
    }
}

