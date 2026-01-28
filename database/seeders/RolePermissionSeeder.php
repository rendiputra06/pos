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
        $admin = Role::firstOrCreate(['name' => 'admin']);
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
        ];

        foreach ($permissions as $group => $perms) {
            foreach ($perms as $name) {
                $permission = Permission::firstOrCreate([
                    'name' => $name,
                ]);
                $permission->update(['group' => $group]);

                // Assign ke admin
                if (!$admin->hasPermissionTo($permission)) {
                    $admin->givePermissionTo($permission);
                }
            }
        }
    }
}
