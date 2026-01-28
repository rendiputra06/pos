# Point of Sales (POS) System

Sistem manajemen penjualan digital yang dirancang untuk mempercepat proses transaksi, mengelola inventaris secara real-time, dan menyediakan laporan analitik bisnis yang akurat.

## Fitur Utama

- **Manajemen Produk & Stok**: Pelacakan inventaris otomatis, kategori produk, dan notifikasi stok menipis.
- **Sistem Kasir (Checkout)**: Antarmuka transaksi yang responsif dengan dukungan barcode scanner dan pencetakan struk.
- **Manajemen Pelanggan**: Database pelanggan untuk program loyalitas dan riwayat pembelian.
- **Laporan Penjualan**: Laporan harian, mingguan, dan bulanan yang dapat diekspor ke format PDF atau Excel.
- **Manajemen Pengguna**: Pengaturan hak akses (RBAC) untuk Admin, Manager, dan Kasir.
- **Multi-Metode Pembayaran**: Mendukung tunai, kartu debit/kredit, dan e-wallet (QRIS).

## Teknologi yang Digunakan

- **Frontend**: Inertia.js (React), Tailwind CSS, Shadcn/UI
- **Backend**: Laravel 12
- **Database**: MySQL/MariaDB
- **State Management**: Ziggy (Routing), Inertia Form Helper
- **Fitur Tambahan**: Spatie Permission (RBAC), Spatie Backup, Lucide Icons

## Instalasi

1. Clone repositori:
   ```bash
   git clone https://github.com/yogijowo/laravel12-react-starterkit.git
   ```
2. Instal dependensi PHP:
   ```bash
   composer install
   ```
3. Instal dependensi Node.js:
   ```bash
   npm install
   ```
4. Konfigurasi Environment:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
5. Jalankan Migrasi & Seeder:
   ```bash
   php artisan migrate:fresh --seed
   ```
6. Jalankan Aplikasi:
   ```bash
   npm run dev
   ```

## Perintah Penting

### 🛡️ Izin & Hak Akses
Jika Anda menambahkan menu baru atau mengubah permission di `RolePermissionSeeder.php`, jalankan:
```bash
php artisan db:seed --class=RolePermissionSeeder
```

### 💾 Backup Database
Untuk melakukan pencadangan manual basis data:
```bash
php artisan backup:run --only-db
```
*Pastikan path `DB_DUMP_COMMAND_PATH` di `.env` sudah benar jika menggunakan Linux/Mac.*

### 🛠️ Development
Menjalankan server development secara sinkron (Laravel + Vite):
```bash
composer dev
```
atau
```bash
npm run dev
```

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
