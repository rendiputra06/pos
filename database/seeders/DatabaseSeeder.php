<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Store;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles & Permissions must come first
        $this->call([
            RolePermissionSeeder::class,
        ]);

        // 2. Create Default Store
        $store = Store::firstOrCreate(
            ['slug' => 'toko-default'],
            [
                'name' => 'Toko Default',
                'is_active' => true,
            ]
        );

        // 3. Create Super Admin (Managing Multi-Store)
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@admin.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'store_id' => null, // Super Admin has no store_id
            ]
        );
        $superAdmin->assignRole('super-admin');

        // 4. Create Regular Admin (Managing specific store)
        $admin = User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Admin Toko',
                'password' => Hash::make('admin123'),
                'store_id' => $store->id,
            ]
        );
        $admin->assignRole('admin');

        // 5. Run other seeders
        $this->call([
            MenuSeeder::class,
            MasterDataSeeder::class,
        ]);
    }
}
