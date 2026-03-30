<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function dashboard()
    {
        $storeId = auth()->user()->store_id;
        return response()->json($this->reportService->getDashboardSummary($storeId));
    }

    public function salesTrend(Request $request)
    {
        $storeId = auth()->user()->store_id;
        $days = $request->input('days', 7);
        return response()->json($this->reportService->getSalesTrend($days, $storeId));
    }

    public function categoryBreakdown(Request $request)
    {
        $storeId = auth()->user()->store_id;
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        
        return response()->json($this->reportService->getCategoryBreakdown($startDate, $endDate, $storeId));
    }

    public function profitLoss(Request $request)
    {
        $storeId = auth()->user()->store_id;
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        
        return response()->json($this->reportService->getProfitLoss($startDate, $endDate, $storeId));
    }
}
