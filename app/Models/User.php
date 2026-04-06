<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\HasMedia;

class User extends Authenticatable implements HasMedia
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, InteractsWithMedia;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'store_id',
        'store_owner_id',
        'managed_store_ids',
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'managed_store_ids' => 'array',
        ];
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function storeOwner()
    {
        return $this->belongsTo(Store::class, 'store_owner_id');
    }

    public function storeAssignments()
    {
        return $this->hasMany(StoreUserAssignment::class);
    }

    public function managedStores()
    {
        return $this->belongsToMany(Store::class, 'store_user_assignments')
            ->withPivot(['role', 'is_active', 'assigned_at'])
            ->wherePivot('is_active', true)
            ->wherePivotIn('role', ['store-owner', 'store-manager']);
    }

    public function accessibleStores()
    {
        return $this->belongsToMany(Store::class, 'store_user_assignments')
            ->withPivot(['role', 'is_active', 'assigned_at'])
            ->wherePivot('is_active', true);
    }

    /**
     * Cek apakah user adalah Super Admin.
     * Super Admin memiliki role 'super-admin' dan bisa lintas toko.
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super-admin');
    }
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }


    public function mediaFolders()
    {
        return $this->hasMany(MediaFolder::class);
    }

    /**
     * Cek apakah user adalah Store Owner.
     */
    public function isStoreOwner(): bool
    {
        return $this->hasRole('store-owner');
    }

    /**
     * Cek apakah user adalah Store Manager.
     */
    public function isStoreManager(): bool
    {
        return $this->hasRole('store-manager');
    }

    /**
     * Cek apakah user bisa manage store tertentu.
     */
    public function canManageStore(int $storeId): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->accessibleStores()
            ->where('stores.id', $storeId)
            ->wherePivotIn('role', ['store-owner', 'store-manager'])
            ->exists();
    }

    /**
     * Cek apakah user bisa assign users ke store tertentu.
     */
    public function canAssignUsersToStore(int $storeId): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->accessibleStores()
            ->where('stores.id', $storeId)
            ->wherePivot('role', 'store-owner')
            ->exists();
    }

    /**
     * Get user role untuk store tertentu.
     */
    public function getRoleInStore(int $storeId): ?string
    {
        $assignment = $this->storeAssignments()
            ->where('store_id', $storeId)
            ->where('is_active', true)
            ->first();

        return $assignment?->role;
    }

    /**
     * Assign user ke store dengan role tertentu.
     */
    public function assignToStore(int $storeId, string $role, ?User $assignedBy = null): StoreUserAssignment
    {
        $assignment = $this->storeAssignments()
            ->where('store_id', $storeId)
            ->firstOrCreate([
                'store_id' => $storeId,
                'user_id' => $this->id,
            ], [
                'role' => $role,
                'is_active' => true,
                'assigned_at' => now(),
                'assigned_by' => $assignedBy?->id,
            ]);

        if (!$assignment->wasRecentlyCreated) {
            $assignment->update([
                'role' => $role,
                'is_active' => true,
                'assigned_at' => now(),
                'assigned_by' => $assignedBy?->id,
            ]);
        }

        return $assignment;
    }

    /**
     * Remove user dari store.
     */
    public function removeFromStore(int $storeId): bool
    {
        return $this->storeAssignments()
            ->where('store_id', $storeId)
            ->update(['is_active' => false]);
    }
}
