<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Store;
use App\Services\StoreAssignmentService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    protected StoreAssignmentService $storeAssignmentService;

    public function __construct(StoreAssignmentService $storeAssignmentService)
    {
        $this->storeAssignmentService = $storeAssignmentService;
    }
    public function index(Request $request)
    {
        $currentUser = auth()->user();
        
        $users = User::with(['roles', 'store', 'storeAssignments.store'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->role, function ($query, $role) {
                $query->role($role);
            })
            ->when(!$currentUser->isSuperAdmin(), function ($query) use ($currentUser) {
                // Filter users yang accessible oleh current user
                $accessibleStoreIds = $currentUser->managedStores()->pluck('stores.id')->toArray();
                $query->whereHas('storeAssignments', function ($q) use ($accessibleStoreIds) {
                    $q->whereIn('store_id', $accessibleStoreIds)
                      ->where('is_active', true);
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role']),
            'roles' => Role::all(['id', 'name']),
            'canManageStores' => $currentUser->managedStores()->count() > 0,
        ]);
    }

    public function create()
    {
        $currentUser = auth()->user();
        $roles = Role::all();
        
        // Get stores yang bisa user assign
        $stores = $currentUser->isSuperAdmin() 
            ? Store::where('is_active', true)->get()
            : $currentUser->managedStores()->get();

        return Inertia::render('users/Form', [
            'roles' => $roles,
            'stores' => $stores,
            'canAssignStores' => $stores->count() > 0,
        ]);
    }

    public function store(Request $request)
    {
        $currentUser = auth()->user();
        
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'roles'    => ['required', 'array', 'min:1'],
            'roles.*'  => ['required', Rule::exists('roles', 'name')],
            'store_assignments' => ['sometimes', 'required_if:canAssignStores,true', 'array'],
            'store_assignments.*.store_id' => ['required_if:canAssignStores,true', 'exists:stores,id'],
            'store_assignments.*.role' => ['required_if:canAssignStores,true', 'in:store-owner,store-manager,user'],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole($validated['roles']);

        // Assign user ke stores
        if (isset($validated['store_assignments'])) {
            foreach ($validated['store_assignments'] as $assignment) {
                $store = Store::findOrFail($assignment['store_id']);
                $this->storeAssignmentService->assignUserToStore(
                    $user, 
                    $store, 
                    $assignment['role'], 
                    $currentUser
                );
            }
        }

        return redirect()->route('users.index')->with('success', 'User berhasil dibuat.');
    }

    public function edit(User $user)
    {
        $currentUser = auth()->user();
        $roles = Role::all();
        
        // Get stores yang bisa user assign
        $stores = $currentUser->isSuperAdmin() 
            ? Store::where('is_active', true)->get()
            : $currentUser->managedStores()->get();

        // Get current user store assignments
        $currentAssignments = $this->storeAssignmentService->getUserStoreAssignments($user);

        return Inertia::render('users/Form', [
            'user' => $user->only(['id', 'name', 'email']),
            'roles' => $roles,
            'currentRoles' => $user->roles->pluck('name')->toArray(),
            'stores' => $stores,
            'canAssignStores' => $stores->count() > 0,
            'currentAssignments' => $currentAssignments,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $currentUser = auth()->user();
        
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:6'],
            'roles'    => ['required', 'array', 'min:1'],
            'roles.*'  => ['required', Rule::exists('roles', 'name')],
            'store_assignments' => ['sometimes', 'required_if:canAssignStores,true', 'array'],
            'store_assignments.*.store_id' => ['required_if:canAssignStores,true', 'exists:stores,id'],
            'store_assignments.*.role' => ['required_if:canAssignStores,true', 'in:store-owner,store-manager,user'],
        ]);

        $user->update([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => $validated['password']
                ? Hash::make($validated['password'])
                : $user->password,
        ]);

        $user->syncRoles($validated['roles']);

        // Update store assignments
        $currentAssignments = $user->storeAssignments()->where('is_active', true)->get();
        $newAssignments = isset($validated['store_assignments']) 
            ? collect($validated['store_assignments']) 
            : collect([]);

        // Remove assignments yang tidak ada di new assignments
        foreach ($currentAssignments as $currentAssignment) {
            $exists = $newAssignments->firstWhere('store_id', $currentAssignment->store_id);
            if (!$exists || $exists['role'] !== $currentAssignment->role) {
                $store = Store::findOrFail($currentAssignment->store_id);
                $this->storeAssignmentService->removeUserFromStore($user, $store, $currentUser);
            }
        }

        // Add/update new assignments
        if (isset($validated['store_assignments'])) {
            foreach ($validated['store_assignments'] as $assignment) {
                $store = Store::findOrFail($assignment['store_id']);
                $this->storeAssignmentService->assignUserToStore(
                    $user, 
                    $store, 
                    $assignment['role'], 
                    $currentUser
                );
            }
        }

        return redirect()->route('users.index')->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        $currentUser = auth()->user();
        
        // Prevent deletion jika user masih memiliki active store assignments
        if ($user->storeAssignments()->where('is_active', true)->exists()) {
            return redirect()->back()->with('error', 'Tidak bisa menghapus user yang masih memiliki assignment toko. Hapus assignment terlebih dahulu.');
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'User berhasil dihapus.');
    }

    public function resetPassword(User $user)
    {
        $user->update([
            'password' => Hash::make('ResetPasswordNya'),
        ]);

        return redirect()->back()->with('success', 'Password berhasil direset ke default.');
    }

    /**
     * Get users untuk store assignment dropdown.
     */
    public function getAvailableUsersForStore(Request $request, Store $store)
    {
        $currentUser = auth()->user();
        
        if (!$currentUser->canAssignUsersToStore($store->id)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $users = $this->storeAssignmentService->getAvailableUsersForStore($store, $currentUser);
        
        return response()->json($users);
    }

    /**
     * Get store users untuk management.
     */
    public function getStoreUsers(Request $request, Store $store)
    {
        $currentUser = auth()->user();
        
        if (!$currentUser->canManageStore($store->id)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $users = $this->storeAssignmentService->getStoreUsers($store, $currentUser);
        
        return response()->json($users);
    }

    /**
     * Switch active store untuk user.
     */
    public function switchActiveStore(Request $request)
    {
        $currentUser = auth()->user();
        
        $validated = $request->validate([
            'store_id' => ['required', 'exists:stores,id'],
        ]);

        // Check if user has access to the store
        if (!$currentUser->accessibleStores()->where('stores.id', $validated['store_id'])->exists()) {
            return response()->json(['error' => 'Unauthorized access to store'], 403);
        }

        $currentUser->update(['store_id' => $validated['store_id']]);

        return response()->json(['success' => true, 'message' => 'Store switched successfully']);
    }
}
