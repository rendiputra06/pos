<?php

namespace App\Http\Controllers;

use App\Models\Store;
use App\Models\Transaction;
use App\Models\StoreProduct;
use App\Models\ProductBank;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StoreComparisonController extends Controller
{
    /**
     * Display store performance comparison dashboard.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        // Check permissions
        if (!$user->isSuperAdmin() && !$user->canManageStore($request->input('store_id', 0))) {
            abort(403, 'You do not have permission to view store comparisons.');
        }

        // Get stores for comparison
        $storeIds = $request->input('stores', []);
        $dateRange = $request->input('date_range', '30_days');
        $metric = $request->input('metric', 'revenue');

        // Parse date range
        [$startDate, $endDate, $label] = $this->parseDateRange($dateRange);

        // Get available stores for user
        $availableStores = $user->isSuperAdmin() 
            ? Store::where('is_active', true)->get()
            : $user->accessibleStores()->get();

        // If no stores selected, use all available stores
        if (empty($storeIds)) {
            $storeIds = $availableStores->pluck('id')->toArray();
        }

        // Get comparison data
        $comparisonData = $this->getComparisonData($storeIds, $startDate, $endDate, $metric);

        // Get benchmarks
        $benchmarks = $this->getBenchmarks($storeIds, $startDate, $endDate);

        // Get trends
        $trends = $this->getTrends($storeIds, $startDate, $endDate);

        return Inertia::render('reports/store-comparison', [
            'stores' => $availableStores,
            'comparisonData' => $comparisonData,
            'benchmarks' => $benchmarks,
            'trends' => $trends,
            'filters' => [
                'stores' => $storeIds,
                'date_range' => $dateRange,
                'metric' => $metric,
                'date_range_label' => $label,
            ],
            'dateRanges' => [
                '7_days' => 'Last 7 Days',
                '30_days' => 'Last 30 Days',
                '90_days' => 'Last 90 Days',
                '6_months' => 'Last 6 Months',
                '1_year' => 'Last Year',
            ],
            'metrics' => [
                'revenue' => 'Revenue',
                'transactions' => 'Transactions',
                'products' => 'Products',
                'customers' => 'Customers',
                'avg_transaction' => 'Avg Transaction',
                'conversion_rate' => 'Conversion Rate',
            ],
        ]);
    }

    /**
     * Get comparison data for stores.
     */
    private function getComparisonData(array $storeIds, Carbon $startDate, Carbon $endDate, string $metric)
    {
        $stores = Store::whereIn('id', $storeIds)
            ->with(['transactions' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->with(['storeProducts' => function ($query) {
                $query->where('is_active', true);
            }])
            ->get();

        $comparisonData = [];

        foreach ($stores as $store) {
            $transactions = $store->transactions;
            $products = $store->storeProducts;

            $data = [
                'store' => $store,
                'revenue' => $transactions->sum('total'),
                'transactions' => $transactions->count(),
                'products' => $products->where('is_active', true)->count(),
                'avg_transaction' => $transactions->count() > 0 ? $transactions->sum('total') / $transactions->count() : 0,
                'unique_customers' => $transactions->pluck('customer_id')->unique()->count(),
            ];

            // Calculate conversion rate (mock calculation)
            $data['conversion_rate'] = $data['transactions'] > 0 ? ($data['unique_customers'] / $data['transactions']) * 100 : 0;

            // Calculate growth
            $previousPeriodTransactions = $store->transactions()
                ->whereBetween('created_at', [
                    $startDate->copy()->subDays($startDate->diffInDays($endDate)),
                    $startDate->copy()->subDays($startDate->diffInDays($endDate))
                ])
                ->get();

            $previousRevenue = $previousPeriodTransactions->sum('total');
            $currentRevenue = $data['revenue'];
            
            $data['revenue_growth'] = $previousRevenue > 0 ? (($currentRevenue - $previousRevenue) / $previousRevenue) * 100 : 0;
            $data['transaction_growth'] = $previousPeriodTransactions->count() > 0 
                ? (($data['transactions'] - $previousPeriodTransactions->count()) / $previousPeriodTransactions->count()) * 100 
                : 0;

            $comparisonData[] = $data;
        }

        // Sort by selected metric
        usort($comparisonData, function ($a, $b) use ($metric) {
            return $b[$metric] <=> $a[$metric];
        });

        return $comparisonData;
    }

    /**
     * Get benchmark data.
     */
    private function getBenchmarks(array $storeIds, Carbon $startDate, Carbon $endDate)
    {
        $comparisonData = $this->getComparisonData($storeIds, $startDate, $endDate, 'revenue');

        if (empty($comparisonData)) {
            return [];
        }

        $revenues = array_column($comparisonData, 'revenue');
        $transactions = array_column($comparisonData, 'transactions');
        $products = array_column($comparisonData, 'products');

        return [
            'revenue' => [
                'highest' => max($revenues),
                'lowest' => min($revenues),
                'average' => array_sum($revenues) / count($revenues),
                'median' => $this->calculateMedian($revenues),
            ],
            'transactions' => [
                'highest' => max($transactions),
                'lowest' => min($transactions),
                'average' => array_sum($transactions) / count($transactions),
                'median' => $this->calculateMedian($transactions),
            ],
            'products' => [
                'highest' => max($products),
                'lowest' => min($products),
                'average' => array_sum($products) / count($products),
                'median' => $this->calculateMedian($products),
            ],
        ];
    }

    /**
     * Get trend data for charts.
     */
    private function getTrends(array $storeIds, Carbon $startDate, Carbon $endDate)
    {
        $trends = [];
        $days = $startDate->diffInDays($endDate);

        for ($i = 0; $i <= $days; $i += 7) {
            $periodStart = $startDate->copy()->addDays($i);
            $periodEnd = $periodStart->copy()->addDays(6)->min($endDate);

            $periodData = Store::whereIn('id', $storeIds)
                ->with(['transactions' => function ($query) use ($periodStart, $periodEnd) {
                    $query->whereBetween('created_at', [$periodStart, $periodEnd]);
                }])
                ->get()
                ->map(function ($store) {
                    return [
                        'store_id' => $store->id,
                        'store_name' => $store->name,
                        'revenue' => $store->transactions->sum('total'),
                        'transactions' => $store->transactions->count(),
                    ];
                });

            $trends[] = [
                'period' => $periodStart->format('M d'),
                'data' => $periodData,
            ];
        }

        return $trends;
    }

    /**
     * Parse date range into Carbon instances.
     */
    private function parseDateRange(string $range): array
    {
        $now = now();
        
        switch ($range) {
            case '7_days':
                return [$now->copy()->subDays(7), $now, 'Last 7 Days'];
            case '30_days':
                return [$now->copy()->subDays(30), $now, 'Last 30 Days'];
            case '90_days':
                return [$now->copy()->subDays(90), $now, 'Last 90 Days'];
            case '6_months':
                return [$now->copy()->subMonths(6), $now, 'Last 6 Months'];
            case '1_year':
                return [$now->copy()->subYear(), $now, 'Last Year'];
            default:
                return [$now->copy()->subDays(30), $now, 'Last 30 Days'];
        }
    }

    /**
     * Calculate median value.
     */
    private function calculateMedian(array $values): float
    {
        sort($values);
        $count = count($values);
        $middle = floor($count / 2);

        if ($count % 2 == 0) {
            return ($values[$middle - 1] + $values[$middle]) / 2;
        }

        return $values[$middle];
    }

    /**
     * Export comparison data.
     */
    public function export(Request $request)
    {
        $user = auth()->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403, 'You do not have permission to export comparisons.');
        }

        $storeIds = $request->input('stores', []);
        $dateRange = $request->input('date_range', '30_days');
        $metric = $request->input('metric', 'revenue');
        $format = $request->input('format', 'csv');

        [$startDate, $endDate] = $this->parseDateRange($dateRange);
        $comparisonData = $this->getComparisonData($storeIds, $startDate, $endDate, $metric);

        if ($format === 'csv') {
            return $this->exportCsv($comparisonData, $metric);
        }

        return response()->json(['error' => 'Invalid format'], 400);
    }

    /**
     * Export data to CSV.
     */
    private function exportCsv(array $data, string $metric)
    {
        $filename = "store_comparison_{$metric}_" . now()->format('Y-m-d') . ".csv";
        
        $headers = [
            'Store Name',
            'Revenue',
            'Transactions',
            'Products',
            'Avg Transaction',
            'Unique Customers',
            'Conversion Rate (%)',
            'Revenue Growth (%)',
            'Transaction Growth (%)',
        ];

        $csv = implode(',', $headers) . "\n";
        
        foreach ($data as $row) {
            $csv .= sprintf(
                "%s,%s,%d,%d,%s,%d,%.2f,%.2f,%.2f\n",
                $row['store']->name,
                number_format($row['revenue'], 2),
                $row['transactions'],
                $row['products'],
                number_format($row['avg_transaction'], 2),
                $row['unique_customers'],
                $row['conversion_rate'],
                $row['revenue_growth'],
                $row['transaction_growth']
            );
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }
}
