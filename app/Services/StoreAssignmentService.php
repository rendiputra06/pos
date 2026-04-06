<?php

namespace App\Services;

use App\Models\User;
use App\Models\Store;
use App\Models\StoreUserAssignment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StoreAssignmentService
{
    /**
     * Assign user to store dengan role tertentu.
     */
    public function assignUserToStore(User $user, Store $store, string $role, ?User $assignedBy = null): StoreUserAssignment
    {
        $this->validateAssignment($assignedBy, $store, $role);

        return DB::transaction(function () use ($user, $store, $role, $assignedBy) {
            $assignment = $user->assignToStore($store->id, $role, $assignedBy);

            // Update user's primary store jika belum ada
            if (!$user->store_id && $role !== 'store-owner') {
                $user->update(['store_id' => $store->id]);
            }

            // Update managed_store_ids untuk store managers
            if ($role === 'store-manager') {
                $this->updateManagedStoreIds($user);
            }

            Log::info('User assigned to store', [
                'user_id' => $user->id,
                'store_id' => $store->id,
                'role' => $role,
                'assigned_by' => $assignedBy?->id,
            ]);

            return $assignment;
        });
    }

    /**
     * Remove user dari store.
     */
    public function removeUserFromStore(User $user, Store $store, ?User $removedBy = null): bool
    {
        $this->validateRemoval($removedBy, $store, $user);

        return DB::transaction(function () use ($user, $store, $removedBy) {
            $result = $user->removeFromStore($store->id);

            // Update user's primary store jika removed dari primary store
            if ($user->store_id === $store->id) {
                $newPrimaryStore = $user->accessibleStores()->first();
                $user->update(['store_id' => $newPrimaryStore?->id]);
            }

            // Update managed_store_ids
            $this->updateManagedStoreIds($user);

            Log::info('User removed from store', [
                'user_id' => $user->id,
                'store_id' => $store->id,
                'removed_by' => $removedBy?->id,
            ]);

            return $result;
        });
    }

    /**
     * Update user role dalam store.
     */
    public function updateUserRoleInStore(User $user, Store $store, string $newRole, ?User $updatedBy = null): StoreUserAssignment
    {
        $this->validateAssignment($updatedBy, $store, $newRole);

        return DB::transaction(function () use ($user, $store, $newRole, $updatedBy) {
            $assignment = StoreUserAssignment::where('user_id', $user->id)
                ->where('store_id', $store->id)
                ->where('is_active', true)
                ->firstOrFail();

            $assignment->update([
                'role' => $newRole,
                'assigned_at' => now(),
                'assigned_by' => $updatedBy?->id,
            ]);

            // Update managed_store_ids
            $this->updateManagedStoreIds($user);

            Log::info('User role updated in store', [
                'user_id' => $user->id,
                'store_id' => $store->id,
                'new_role' => $newRole,
                'updated_by' => $updatedBy?->id,
            ]);

            return $assignment;
        });
    }

    /**
     * Get users yang bisa diassign ke store.
     */
    public function getAvailableUsersForStore(Store $store, User $requester): \Illuminate\Database\Eloquent\Collection
    {
        if (!$requester->canAssignUsersToStore($store->id)) {
            return collect();
        }

        return User::whereDoesntHave('storeAssignments', function ($query) use ($store) {
            $query->where('store_id', $store->id)
                ->where('is_active', true);
        })
        ->where(function ($query) use ($requester) {
            // Super admin bisa assign semua user
            if ($requester->isSuperAdmin()) {
                return $query;
            }
            
            // Store owner hanya bisa assign user tanpa store assignment
            return $query->whereNull('store_id');
        })
        ->get();
    }

    /**
     * Get current users di store.
     */
    public function getStoreUsers(Store $store, User $requester): \Illuminate\Database\Eloquent\Collection
    {
        if (!$requester->canManageStore($store->id)) {
            return collect();
        }

        return StoreUserAssignment::with(['user', 'assignedBy'])
            ->where('store_id', $store->id)
            ->where('is_active', true)
            ->orderBy('role')
            ->orderBy('assigned_at', 'desc')
            ->get();
    }

    /**
     * Validate assignment permission.
     */
    private function validateAssignment(?User $assignedBy, Store $store, string $role): void
    {
        if (!$assignedBy) {
            return; // System assignment
        }

        if (!$assignedBy->canAssignUsersToStore($store->id)) {
            throw new \InvalidArgumentException('User does not have permission to assign users to this store.');
        }

        // Store owner tidak bisa assign store owner role
        if ($assignedBy->isStoreOwner() && $role === 'store-owner') {
            throw new \InvalidArgumentException('Store owners can only be assigned by super admins.');
        }
    }

    /**
     * Validate removal permission.
     */
    private function validateRemoval(?User $removedBy, Store $store, User $user): void
    {
        if (!$removedBy) {
            return; // System removal
        }

        if (!$removedBy->canAssignUsersToStore($store->id)) {
            throw new \InvalidArgumentException('User does not have permission to remove users from this store.');
        }

        // Store owner tidak bisa remove store owner
        if ($user->isStoreOwner() && !$removedBy->isSuperAdmin()) {
            throw new \InvalidArgumentException('Only super admins can remove store owners.');
        }

        // User tidak bisa remove dirinya sendiri
        if ($removedBy->id === $user->id) {
            throw new \InvalidArgumentException('Users cannot remove themselves from stores.');
        }
    }

    /**
     * Update managed_store_ids untuk user.
     */
    private function updateManagedStoreIds(User $user): void
    {
        $managedStoreIds = $user->storeAssignments()
            ->where('is_active', true)
            ->where('role', 'store-manager')
            ->pluck('store_id')
            ->toArray();

        $user->update(['managed_store_ids' => $managedStoreIds]);
    }

    /**
     * Bulk assign users ke store.
     */
    public function bulkAssignUsersToStore(array $userIds, Store $store, string $role, User $assignedBy): array
    {
        $results = [];
        $errors = [];

        foreach ($userIds as $userId) {
            try {
                $user = User::findOrFail($userId);
                $assignment = $this->assignUserToStore($user, $store, $role, $assignedBy);
                $results[] = ['user_id' => $userId, 'success' => true, 'assignment' => $assignment];
            } catch (\Exception $e) {
                $errors[] = ['user_id' => $userId, 'error' => $e->getMessage()];
            }
        }

        return [
            'successful' => $results,
            'errors' => $errors,
            'total_processed' => count($userIds),
            'success_count' => count($results),
            'error_count' => count($errors),
        ];
    }

    /**
     * Get user store assignments dengan permissions.
     */
    public function getUserStoreAssignments(User $user): array
    {
        return $user->storeAssignments()
            ->with(['store'])
            ->where('is_active', true)
            ->get()
            ->map(function ($assignment) use ($user) {
                return [
                    'store' => $assignment->store,
                    'role' => $assignment->role,
                    'assigned_at' => $assignment->assigned_at,
                    'assigned_by' => $assignment->assignedBy,
                    'can_manage' => $user->canManageStore($assignment->store_id),
                    'can_assign_users' => $user->canAssignUsersToStore($assignment->store_id),
                ];
            })
            ->toArray();
    }
}
