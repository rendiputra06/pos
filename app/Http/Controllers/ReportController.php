<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\SalesReportExport;

class ReportController extends Controller
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function sales(Request $request)
    {
        $query = Transaction::with(['user', 'details'])
            ->where('status', 'success')
            ->orderByDesc('created_at');

        // Apply filters
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $transactions = $query->paginate(20);

        return Inertia::render('reports/Sales', [
            'transactions' => $transactions,
            'filters' => $request->only(['start_date', 'end_date', 'user_id']),
        ]);
    }

    public function profitLoss()
    {
        return Inertia::render('reports/ProfitLoss');
    }

    public function exportSales(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        
        $filename = 'sales_report_' . date('Y-m-d_His') . '.xlsx';
        
        return Excel::download(
            new \App\Exports\SalesReportExport($startDate, $endDate),
            $filename
        );
    }
}
