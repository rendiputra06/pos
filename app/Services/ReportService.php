<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Service;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportService
{
    /**
     * Get dashboard summary statistics
     */
    public function getDashboardSummary()
    {
        $today = Carbon::today();
        
        return [
            'today_sales' => Transaction::whereDate('created_at', $today)
                ->where('status', 'success')
                ->sum('grand_total'),
            
            'today_transactions' => Transaction::whereDate('created_at', $today)
                ->where('status', 'success')
                ->count(),
            
            'top_products' => $this->getTopProducts(5),
            'top_services' => $this->getTopServices(3),
            'low_stock_products' => Product::where('stock', '<', 5)->get(['id', 'name', 'stock', 'sku']),
        ];
    }

    /**
     * Get sales trend for the last N days
     */
    public function getSalesTrend(int $days = 7)
    {
        $startDate = Carbon::now()->subDays($days - 1)->startOfDay();
        
        $sales = Transaction::where('status', 'success')
            ->where('created_at', '>=', $startDate)
            ->select(
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
    public function getCategoryBreakdown($startDate = null, $endDate = null)
    {
        $query = TransactionDetail::query()
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', 'success');

        if ($startDate) {
            $query->where('transactions.created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('transactions.created_at', '<=', $endDate);
        }

        // Get product sales by category
        $productSales = $query->clone()
            ->where('transaction_details.item_type', Product::class)
            ->join('products', 'transaction_details.item_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
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
    private function getTopProducts(int $limit = 5)
    {
        return TransactionDetail::where('item_type', Product::class)
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', 'success')
            ->select('item_id', DB::raw('SUM(qty) as total_qty'), DB::raw('SUM(subtotal) as total_sales'))
            ->groupBy('item_id')
            ->orderByDesc('total_qty')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                $product = Product::find($item->item_id);
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'total_qty' => $item->total_qty,
                    'total_sales' => $item->total_sales,
                ];
            });
    }

    /**
     * Get top services
     */
    private function getTopServices(int $limit = 3)
    {
        return TransactionDetail::where('item_type', Service::class)
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', 'success')
            ->select('item_id', DB::raw('SUM(qty) as total_qty'), DB::raw('SUM(subtotal) as total_sales'))
            ->groupBy('item_id')
            ->orderByDesc('total_qty')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                $service = Service::find($item->item_id);
                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'total_qty' => $item->total_qty,
                    'total_sales' => $item->total_sales,
                ];
            });
    }

    /**
     * Calculate profit/loss
     */
    public function getProfitLoss($startDate = null, $endDate = null)
    {
        $query = Transaction::where('status', 'success');

        if ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('created_at', '<=', $endDate);
        }

        $revenue = $query->sum('grand_total');

        // Calculate COGS (only for products, services have no cost)
        $detailsQuery = TransactionDetail::query()
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', 'success')
            ->where('transaction_details.item_type', Product::class);

        if ($startDate) {
            $detailsQuery->where('transactions.created_at', '>=', $startDate);
        }
        if ($endDate) {
            $detailsQuery->where('transactions.created_at', '<=', $endDate);
        }

        $cogs = $detailsQuery->get()->sum(function ($detail) {
            $product = Product::find($detail->item_id);
            return $product ? ($product->cost_price * $detail->qty) : 0;
        });

        // Calculate Operational Expenses
        $expenseQuery = Expense::query(); // Used Expense model
        if ($startDate) {
            $expenseQuery->whereDate('expense_date', '>=', $startDate);
        }
        if ($endDate) {
            $expenseQuery->whereDate('expense_date', '<=', $endDate);
        }
        $expenses = $expenseQuery->sum('amount');

        $grossProfit = $revenue - $cogs;
        $netProfit = $grossProfit - $expenses; // Calculated net profit
        $profitMargin = $revenue > 0 ? ($netProfit / $revenue) * 100 : 0; // Profit margin based on net profit

        return [
            'revenue' => $revenue,
            'cogs' => $cogs,
            'expenses' => $expenses, // Added expenses
            'gross_profit' => $grossProfit,
            'net_profit' => $netProfit, // Changed to net_profit
            'profit_margin' => round($profitMargin, 2),
        ];
    }
}
