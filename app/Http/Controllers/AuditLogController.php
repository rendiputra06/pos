<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = \App\Models\Activity::with(['causer', 'store'])
            ->orderByDesc('created_at');

        if (!$user->isSuperAdmin()) {
            $query->where('store_id', $user->store_id);
        } elseif ($request->filled('store_id') && $request->store_id !== 'all') {
            $query->where('store_id', $request->store_id);
        }

        $logs = $query->paginate(20)->withQueryString();

        return Inertia::render('auditlogs/Index', [
            'logs' => $logs,
            'stores' => $user->isSuperAdmin() ? \App\Models\Store::all(['id', 'name']) : [],
            'filters' => $request->only(['store_id']),
        ]);
    }
}
