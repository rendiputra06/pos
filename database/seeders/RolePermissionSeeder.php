<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Bersihkan data lama untuk konsistensi
        Permission::query()->delete();

        // Buat role admin dan user jika belum ada
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin']);
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $storeOwner = Role::firstOrCreate(['name' => 'store-owner']);
        $storeManager = Role::firstOrCreate(['name' => 'store-manager']);
        $user = Role::firstOrCreate(['name' => 'user']);

        // Daftar permission berdasarkan menu structure
        $permissions = [
            'Dashboard' => [
                'dashboard-view',
            ],
            'Access' => [
                'access-view',
                'permission-view',
                'users-view',
                'roles-view',
            ],
            'Settings' => [
                'settings-view',
                'menu-view',
                'app-settings-view',
                'backup-view',
                'backup-run',
                'backup-delete',
            ],
            'Master Data' => [
                'master-data-view',
                'categories-view',
                'products-view',
                'services-view',
                'suppliers-view',
                'suppliers-create',
                'suppliers-edit',
                'suppliers-delete',
            ],
            'Inventory' => [
                'inventory-view',
                'purchases-view',
                'purchases-create',
                'purchases-edit',
                'purchases-delete',
                'stock-in-view',
            ],
            'Utilities' => [
                'utilities-view',
                'log-view',
                'filemanager-view',
            ],
            'POS' => [
                'pos-view',
            ],
            'Reports' => [
                'reports-view',
                'sales-report-view',
                'profit-loss-view',
                'expenses-view',
                'expenses-create',
                'expenses-edit',
                'expenses-delete',
            ],
            'Multi-Store' => [
                'multi-store-view',
                'stores-view',
                'stores-create',
                'stores-edit',
                'stores-delete',
                'product-bank-view',
                'product-bank-create',
                'product-bank-edit',
                'product-bank-delete',
                'store-products-view',
                'store-products-edit',
                'store-assignments-view',
                'store-assignments-create',
                'store-assignments-edit',
                'store-assignments-delete',
            ],
            'Store Management' => [
                'store-users-view',
                'store-users-create',
                'store-users-edit',
                'store-users-delete',
                'store-user-assign',
                'store-user-unassign',
            ],
        ];

        foreach ($permissions as $group => $perms) {
            foreach ($perms as $name) {
                $permission = Permission::firstOrCreate([
                    'name' => $name,
                ]);
                $permission->update(['group' => $group]);

                // Assign ke super-admin & admin
                if (!$superAdmin->hasPermissionTo($permission)) {
                    $superAdmin->givePermissionTo($permission);
                }
                if (!$admin->hasPermissionTo($permission)) {
                    $admin->givePermissionTo($permission);
                }
                
                // Assign store management permissions ke store-owner
                if (in_array($group, ['Store Management', 'Multi-Store'])) {
                    if (!$storeOwner->hasPermissionTo($permission)) {
                        $storeOwner->givePermissionTo($permission);
                    }
                }
                
                // Assign basic store management ke store-manager
                if (in_array($group, ['Store Management']) && !in_array($name, ['store-user-unassign'])) {
                    if (!$storeManager->hasPermissionTo($permission)) {
                        $storeManager->givePermissionTo($permission);
                    }
                }
            }
        }
    }
}
