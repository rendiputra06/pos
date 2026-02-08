<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $expenses = Expense::with('creator')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('description', 'like', "%{$search}%")
                      ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->when($request->category, function ($query, $category) {
                $query->where('category', $category);
            })
            ->when($request->payment_method, function ($query, $method) {
                $query->where('payment_method', $method);
            })
            ->when($request->date_from, function ($query, $date) {
                $query->whereDate('expense_date', '>=', $date);
            })
            ->when($request->date_to, function ($query, $date) {
                $query->whereDate('expense_date', '<=', $date);
            })
            ->latest('expense_date')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('expenses/Index', [
            'expenses' => $expenses,
            'filters' => $request->only(['search', 'category', 'payment_method', 'date_from', 'date_to']),
            'categories' => ['Salary', 'Rent', 'Utilities', 'Supplies', 'Maintenance', 'Marketing', 'Other'],
            'paymentMethods' => ['Cash', 'Bank Transfer'],
        ]);
    }

    public function create()
    {
        return Inertia::render('expenses/Create', [
            'categories' => ['Salary', 'Rent', 'Utilities', 'Supplies', 'Maintenance', 'Marketing', 'Other'],
            'paymentMethods' => ['Cash', 'Bank Transfer'],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'payment_method' => 'required|string',
            'receipt_image' => 'nullable|image|max:2048',
            'notes' => 'nullable|string',
        ]);

        if ($request->hasFile('receipt_image')) {
            $path = $request->file('receipt_image')->store('receipts', 'public');
            $validated['receipt_image'] = $path;
        }

        $validated['created_by'] = $request->user()->id;

        Expense::create($validated);

        return redirect()->route('expenses.index')->with('success', 'Biaya operasional berhasil dicatat.');
    }

    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'category' => 'required|string',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'payment_method' => 'required|string',
            'receipt_image' => 'nullable|image|max:2048',
            'notes' => 'nullable|string',
        ]);

        if ($request->hasFile('receipt_image')) {
            if ($expense->receipt_image) {
                Storage::disk('public')->delete($expense->receipt_image);
            }
            $path = $request->file('receipt_image')->store('receipts', 'public');
            $validated['receipt_image'] = $path;
        }

        $expense->update($validated);

        return redirect()->route('expenses.index')->with('success', 'Biaya operasional berhasil diperbarui.');
    }

    public function edit(Expense $expense)
    {
        return Inertia::render('expenses/Edit', [
            'expense' => $expense,
            'categories' => ['Salary', 'Rent', 'Utilities', 'Supplies', 'Maintenance', 'Marketing', 'Other'],
            'paymentMethods' => ['Cash', 'Bank Transfer'],
        ]);
    }

    public function destroy(Expense $expense)
    {
        if ($expense->receipt_image) {
            Storage::disk('public')->delete($expense->receipt_image);
        }
        
        $expense->delete();

        return redirect()->route('expenses.index')->with('success', 'Biaya operasional berhasil dihapus.');
    }
}
