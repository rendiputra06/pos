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
        return response()->json($this->reportService->getDashboardSummary());
    }

    public function salesTrend(Request $request)
    {
        $days = $request->input('days', 7);
        return response()->json($this->reportService->getSalesTrend($days));
    }

    public function categoryBreakdown(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        
        return response()->json($this->reportService->getCategoryBreakdown($startDate, $endDate));
    }

    public function profitLoss(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        
        return response()->json($this->reportService->getProfitLoss($startDate, $endDate));
    }
}
