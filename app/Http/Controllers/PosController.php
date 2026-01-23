<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Service;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PosController extends Controller
{
    public function index()
    {
        // Get service categories for the shortcut panel
        $categories = Category::where('type', 'service')
            ->with(['services.priceLevels'])
            ->get();

        return Inertia::render('pos/Index', [
            'serviceCategories' => $categories,
        ]);
    }

    public function receipt(Transaction $transaction)
    {
        $transaction->load(['user', 'details']);
        return Inertia::render('pos/Receipt', [
            'transaction' => $transaction,
        ]);
    }
}
