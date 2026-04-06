<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StoreContext
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if ($user && !$user->isSuperAdmin()) {
            // Ensure user has an active store
            if (!$user->store_id) {
                // Try to set first available store as active
                $firstStore = $user->accessibleStores()->first();
                if ($firstStore) {
                    $user->update(['store_id' => $firstStore->id]);
                }
            }
            
            // Share user's accessible stores with all views
            $accessibleStores = $user->accessibleStores()->get()->map(function ($store) use ($user) {
                return [
                    'store' => $store,
                    'role' => $store->pivot->role,
                    'assigned_at' => $store->pivot->assigned_at,
                    'can_manage' => $user->canManageStore($store->id),
                    'can_assign_users' => $user->canAssignUsersToStore($store->id),
                ];
            });
            
            view()->share('userStores', $accessibleStores);
        }
        
        return $next($request);
    }
}
