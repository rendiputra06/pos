<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        // Bersihkan data lama untuk menghindari duplikasi
        Menu::query()->delete();

        // MENU: Dashboard
        Menu::create([
            'title' => 'Dashboard',
            'icon' => 'Home',
            'route' => '/dashboard',
            'order' => 1,
            'permission_name' => 'dashboard-view',
        ]);

        // GROUP: Access
        $access = Menu::create([
            'title' => 'Access',
            'icon' => 'Contact',
            'route' => '#',
            'order' => 2,
            'permission_name' => 'access-view',
        ]);

        Menu::create([
            'title' => 'Permissions',
            'icon' => 'AlertOctagon',
            'route' => '/permissions',
            'order' => 2,
            'permission_name' => 'permission-view',
            'parent_id' => $access->id,
        ]);

        Menu::create([
            'title' => 'Users',
            'icon' => 'Users',
            'route' => '/users',
            'order' => 3,
            'permission_name' => 'users-view',
            'parent_id' => $access->id,
        ]);

        Menu::create([
            'title' => 'Roles',
            'icon' => 'AlertTriangle',
            'route' => '/roles',
            'order' => 4,
            'permission_name' => 'roles-view',
            'parent_id' => $access->id,
        ]);

        // GROUP: Settings
        $settings = Menu::create([
            'title' => 'Settings',
            'icon' => 'Settings',
            'route' => '#',
            'order' => 3,
            'permission_name' => 'settings-view',
        ]);

        Menu::create([
            'title' => 'Menu Manager',
            'icon' => 'Menu',
            'route' => '/menus',
            'order' => 1,
            'permission_name' => 'menu-view',
            'parent_id' => $settings->id,
        ]);

        Menu::create([
            'title' => 'App Settings',
            'icon' => 'AtSign',
            'route' => '/settingsapp',
            'order' => 2,
            'permission_name' => 'app-settings-view',
            'parent_id' => $settings->id,
        ]);

        Menu::create([
            'title' => 'Backup',
            'icon' => 'Inbox',
            'route' => '/backup',
            'order' => 3,
            'permission_name' => 'backup-view',
            'parent_id' => $settings->id,
        ]);

        // GROUP: Master Data
        $masterData = Menu::create([
            'title' => 'Master Data',
            'icon' => 'Box',
            'route' => '#',
            'order' => 4,
            'permission_name' => 'master-data-view', // Need to add this too?
        ]);

        Menu::create([
            'title' => 'Categories',
            'icon' => 'Folder',
            'route' => '/categories',
            'order' => 1,
            'permission_name' => 'categories-view',
            'parent_id' => $masterData->id,
        ]);

        Menu::create([
            'title' => 'Products (ATK)',
            'icon' => 'Package',
            'route' => '/products',
            'order' => 2,
            'permission_name' => 'products-view',
            'parent_id' => $masterData->id,
        ]);

        Menu::create([
            'title' => 'Services (Jasa)',
            'icon' => 'Printer',
            'route' => '/services',
            'order' => 3,
            'permission_name' => 'services-view',
            'parent_id' => $masterData->id,
        ]);

        Menu::create([
            'title' => 'Suppliers',
            'icon' => 'Users',
            'route' => '/suppliers',
            'order' => 4,
            'permission_name' => 'suppliers-view',
            'parent_id' => $masterData->id,
        ]);

        // GROUP: Inventory
        $inventory = Menu::create([
            'title' => 'Inventory',
            'icon' => 'Warehouse',
            'route' => '#',
            'order' => 5,
            'permission_name' => 'inventory-view',
        ]);

        Menu::create([
            'title' => 'Stok Masuk',
            'icon' => 'Truck',
            'route' => '/purchases',
            'order' => 1,
            'permission_name' => 'purchases-view',
            'parent_id' => $inventory->id,
        ]);

        // Create POS Menu
        Menu::create([
            'title' => 'POS Terminal',
            'icon' => 'Monitor',
            'route' => '/pos',
            'order' => 6,
            'permission_name' => 'pos-view',
        ]);

        // GROUP: Reports
        $reports = Menu::create([
            'title' => 'Reports',
            'icon' => 'BarChart3',
            'route' => '#',
            'order' => 7,
            'permission_name' => 'reports-view',
        ]);

        Menu::create([
            'title' => 'Sales Report',
            'icon' => 'Receipt',
            'route' => '/reports/sales',
            'order' => 1,
            'permission_name' => 'sales-report-view',
            'parent_id' => $reports->id,
        ]);

        Menu::create([
            'title' => 'Profit & Loss',
            'icon' => 'TrendingUp',
            'route' => '/reports/profit-loss',
            'order' => 2,
            'permission_name' => 'profit-loss-view',
            'parent_id' => $reports->id,
        ]);

        Menu::create([
            'title' => 'Operational Expenses',
            'icon' => 'CreditCard',
            'route' => '/expenses',
            'order' => 3,
            'permission_name' => 'expenses-view',
            'parent_id' => $reports->id,
        ]);

        // GROUP: Utilities
        $utilities = Menu::create([
            'title' => 'Utilities',
            'icon' => 'CreditCard',
            'route' => '#',
            'order' => 7,
            'permission_name' => 'utilities-view',
        ]);

        Menu::create([
            'title' => 'Audit Logs',
            'icon' => 'Activity',
            'route' => '/audit-logs',
            'order' => 2,
            'permission_name' => 'log-view',
            'parent_id' => $utilities->id,
        ]);

        Menu::create([
            'title' => 'File Manager',
            'icon' => 'Folder',
            'route' => '/files',
            'order' => 3,
            'permission_name' => 'filemanager-view',
            'parent_id' => $utilities->id,
        ]);

        $permissions = Menu::pluck('permission_name')->unique()->filter();

        foreach ($permissions as $permName) {
            Permission::firstOrCreate(['name' => $permName]);
        }

        $role = Role::firstOrCreate(['name' => 'user']);
        $role->givePermissionTo('dashboard-view');
    }
}
