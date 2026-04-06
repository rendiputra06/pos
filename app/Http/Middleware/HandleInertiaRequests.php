<?php

namespace App\Http\Middleware;

use App\Models\SettingApp;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        $stores = [];
        $storeAssignments = [];

        if ($user) {
            if ($user->isSuperAdmin()) {
                // Super Admin gets all stores
                $stores = \App\Models\Store::where('is_active', true)->get(['id', 'name', 'slug']);
            } else {
                // Non-super admin gets their assigned stores
                $storeAssignments = $user->storeAssignments()
                    ->where('is_active', true)
                    ->with('store')
                    ->get()
                    ->map(function ($assignment) {
                        return [
                            'store' => [
                                'id' => $assignment->store->id,
                                'name' => $assignment->store->name,
                                'slug' => $assignment->store->slug,
                                'address' => $assignment->store->address,
                                'phone' => $assignment->store->phone,
                                'is_active' => $assignment->store->is_active,
                            ],
                            'role' => $assignment->role,
                            'assigned_at' => $assignment->assigned_at,
                            'can_manage' => in_array($assignment->role, ['store-owner', 'store-manager']),
                            'can_assign_users' => $assignment->role === 'store-owner',
                        ];
                    });
                
                // Also provide simple stores array for compatibility
                $stores = $storeAssignments->pluck('store');
            }
        }

        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user,
                'store' => $user ? $user->store : null,
                'storeAssignments' => $storeAssignments,
            ],
            'stores' => $stores,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'setting' => fn() => SettingApp::first(),
        ]);
    }
}
