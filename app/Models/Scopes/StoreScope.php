<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * StoreScope — Global Scope untuk isolasi data per toko.
 *
 * Diterapkan ke model: StoreProduct, Transaction, Supplier, Purchase, Expense, Service.
 *
 * Cara kerja:
 * - Jika user yang login memiliki store_id (Store Admin / Kasir):
 *   query otomatis difilter ke store_id user tersebut.
 * - Jika user adalah Super Admin (store_id = null):
 *   query TIDAK difilter — bisa melihat semua toko.
 * - Jika tidak ada session login (guest):
 *   query tidak difilter (misal untuk command artisan dll).
 *
 * Untuk Super Admin yang ingin melihat toko tertentu, bisa set session 'active_store_id'.
 */
class StoreScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        if (!auth()->check()) {
            return; // Tidak ada user login (misal artisan command) — tidak filter
        }

        $user = auth()->user();

        // Super Admin (store_id = null) — bisa lihat semua toko
        if ($user->isSuperAdmin()) {
            // Jika super admin memilih toko tertentu via session "active_store_id"
            $activeStoreId = session('active_store_id');
            if ($activeStoreId) {
                $builder->where($model->getTable() . '.store_id', $activeStoreId);
            }
            // Jika tidak ada active_store_id, super admin lihat semua data tanpa filter
            return;
        }

        // Store Admin / Kasir — hanya lihat data tokonya sendiri
        $builder->where($model->getTable() . '.store_id', $user->store_id);
    }
}
