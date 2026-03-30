<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Service;
use App\Models\Transaction;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PosController extends Controller
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function index()
    {
        // Get service categories for the shortcut panel
        $categories = Category::where('type', 'service')
            ->with(['services.priceLevels'])
            ->get();

        $recentTransactions = Transaction::with('user')
            ->where('status', 'success')
            ->latest()
            ->limit(5)
            ->get();

        $topProducts = $this->reportService->getTopProducts(6);

        return Inertia::render('pos/Index', [
            'serviceCategories' => $categories,
            'recentTransactions' => $recentTransactions,
            'topProducts' => $topProducts,
        ]);
    }

    public function receipt(Transaction $transaction)
    {
        $transaction->load(['user', 'details', 'store']);
        return Inertia::render('pos/Receipt', [
            'transaction' => $transaction,
        ]);
    }
}
