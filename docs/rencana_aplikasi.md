# Rencana Pengembangan Aplikasi POS (Point of Sales) - Toko ATK & Fotocopy

## Deskripsi Proyek
Aplikasi POS yang dirancang khusus untuk kebutuhan toko Alat Tulis Kantor (ATK), sekolah, dan jasa cetak/fotocopy di Indonesia. Aplikasi ini tidak hanya menangani penjualan barang fisik tetapi juga jasa layanan dokumen.

## Analisis Produk & Layanan (Khas Indonesia)

### 1. Kategori Toko ATK & Sekolah
- **Alat Tulis & Kantor:** Pulpen, pensil, buku tulis (Sidu, Big Boss), kertas HVS (A4, F4, 70gr, 80gr), amplop, map, ordner, lakban, steples, dll.
- **Perlengkapan Sekolah:** Seragam sekolah (SD, SMP, SMA), tas sekolah, sepatu sekolah, kaos kaki, dasi, ikat pinggang.
- **Buku:** Buku pelajaran kurikulum terbaru, buku tulis, buku gambar, novel, alat mewarnai (Crayola, Faber Castell).

### 2. Layanan Jasa (Hectic Services)
- **Fotocopy:** Hitam putih & warna, ukuran A4/F4/A3, per lembar atau paketan.
- **Cetak Dokumen (Printing):** Print tugas sekolah, skripsi, foto (4R, 3x4, 2x3), sertifikat.
- **Penjilidan (Binding):** Jilid mika, jilid spiral, jilid hard cover (skripsi/laporan), jilid lakban.
- **Finishing:** Laminating (KTP, Ijazah), Press (Passo), Scanning dokumen.

---

## Rencana Fitur Aplikasi

### 1. Manajemen Inventori (Produk & Stok)
- Multi-kategori produk.
- Satuan produk fleksibel (pcs, pack, lusin, rim, lembar).
- Notifikasi stok rendah untuk barang ATK.
- Manajemen stok jasa (misal: sisa kertas HVS, toner printer).

### 2. Sistem Kasir (Point of Sale)
- **Input Jasa Cepat:** Tombol shortcut untuk fotocopy dan print.
- **Harga Grosir/Bertingkat:** Harga fotocopy otomatis turun jika jumlah lembar banyak.
- **Input Manual Jasa:** Jika ada jasa custom (misal: bantu setting dokumen).
- **Metode Pembayaran:** Tunai, QRIS (Sangat penting di Indonesia), Transfer Bank.
- **Struk Penjualan:** Cetak via thermal printer 58mm/80mm.

### 3. Manajemen Pelanggan (CRM)
- Member untuk sekolah atau kantor (sistem deposit atau tagihan bulanan/piutang).
- Riwayat transaksi pelanggan.

### 4. Laporan & Keuangan
- Laporan penjualan harian/bulanan.
- Laporan laba rugi.
- Grafik produk terlaris (misal: Buku tulis menjelang tahun ajaran baru).
- Laporan jasa paling sering digunakan.

### 5. Manajemen Karyawan
- Role-based access (Owner, Admin, Kasir).
- Tracking aktivitas kasir (Audit Logs).

---

## Arsitektur Teknikal
- **Framework:** Laravel 12 (Backend) + React (Frontend).
- **State Management:** Inertia.js (Seamless integration).
- **UI Components:** Tailwind CSS + Shadcn/UI (Premium look).
- **Database:** MySQL / PostgreSQL.

---

## Rincian Pengembangan Fase 2: Master Data (SELESAI)

Fase ini telah diimplementasikan sepenuhnya mencakup:
1.  **Database Migration & Models:** Kategori, Produk, Jasa, dan Harga Bertingkat.
2.  **Manajemen Kategori:** Pemisahan tipe Produk dan Jasa.
3.  **Manajemen Produk (ATK):** CRUD lengkap dengan pelacakan stok.
4.  **Manajemen Jasa:** CRUD dengan skema harga wholesale (bertingkat) yang fleksibel.

---

## Rincian Pengembangan Fase 3: Transaksi & POS (Point of Sale)

Fase ini adalah inti dari aplikasi, tempat terjadinya proses jual beli barang dan jasa.

### 1. Desain Database (Lanjutan)

#### Tabel `transactions` (Header Transaksi)
- `id`: Primary Key
- `invoice_number`: Nomor struk unik (Contoh: INV-20240124-0001)
- `user_id`: Kasir yang melayani
- `customer_id`: Relasi ke pelanggan (opsional)
- `total_amount`: Total belanja sebelum diskon
- `discount`: Diskon transaksi (persen atau nominal)
- `grand_total`: Total akhir yang dibayar
- `payment_method`: Enum (`cash`, `qris`, `bank_transfer`)
- `status`: Enum (`success`, `pending`, `canceled`)
- `created_at`: Waktu transaksi

#### Tabel `transaction_details` (Item Belanja)
- `id`: Primary Key
- `transaction_id`: Foreign Key ke `transactions`
- `item_type`: Polymorphic relation (Product atau Service)
- `item_id`: Target ID
- `qty`: Jumlah beli
- `price`: Harga satuan saat transaksi dilakukan (snapshot)
- `subtotal`: `qty * price`

### 2. Fitur Antarmuka POS (UI)

- **Search & Scan:** Cari produk lewat nama atau SKU/Barcode.
- **Service Shortcuts:** Panel tombol cepat untuk jasa populer (Fotocopy, Print).
- **Cart Management:** Menambah/mengurang Qty, menghapus item, dan diskon item.
- **Dynamic Pricing Display:** Notifikasi visual saat harga jasa turun (wholesale) karena jumlah lembar mencapai target.
- **Payment Modal:** Pilihan metode pembayaran yang responsif dengan input uang kembalian (untuk tunai).

### 3. Logika Bisnis (Business Logic)

- **Inventory Sync:** Stok barang ATK berkurang otomatis setiap transaksi berhasil.
- **Price Level Logic:** Sistem secara otomatis lookup ke tabel `service_price_levels` saat jasa ditambahkan ke keranjang menyesuaikan kuantitas.
- **Struk Generation:** Render halaman struk yang optimal untuk printer thermal (58mm/80mm).

---

## Rincian Pengembangan Fase 4: Laporan & Analytics Dashboard

Fase ini fokus pada memberikan insight bisnis yang actionable untuk pemilik toko ATK.

### 1. Desain Database (Lanjutan)

Tidak ada tabel baru, tetapi akan memanfaatkan data dari:
- `transactions` & `transaction_details` (untuk laporan penjualan)
- `products` (untuk analisis stok & produk terlaris)
- `services` (untuk analisis jasa paling populer)

### 2. Fitur Laporan

#### Dashboard Analytics (Enhanced)
- **Card Summary:**
    - Total Penjualan Hari Ini (Rupiah)
    - Jumlah Transaksi Hari Ini
    - Produk Terlaris (Top 5)
    - Jasa Paling Sering Digunakan (Top 3)
- **Chart Penjualan:**
    - Line Chart: Tren penjualan 7 hari terakhir
    - Bar Chart: Perbandingan penjualan per kategori
- **Alert Stok Rendah:**
    - Notifikasi visual untuk produk dengan stok < 5

#### Laporan Penjualan
- **Filter:**
    - Rentang tanggal (Hari ini, Minggu ini, Bulan ini, Custom)
    - Per kategori produk/jasa
    - Per kasir
- **Data yang Ditampilkan:**
    - Nomor Invoice
    - Tanggal & Waktu
    - Total Transaksi
    - Metode Pembayaran
    - Kasir
- **Export:** PDF & Excel

#### Laporan Laba Rugi (Profit/Loss)
- **Perhitungan:**
    - Revenue: Total penjualan
    - COGS (Cost of Goods Sold): Berdasarkan `cost_price` produk
    - Gross Profit: Revenue - COGS
    - Net Profit: Gross Profit (untuk fase ini, belum ada operational expenses)
- **Visualisasi:**
    - Pie Chart: Breakdown revenue per kategori
    - Progress Bar: Profit margin percentage

### 3. Teknologi & Library

- **Backend:** Laravel Excel untuk export
- **Frontend Charts:** Recharts (React charting library)
- **Date Picker:** React Day Picker untuk filter tanggal

---

---

## Rincian Pengembangan Fase 6: Pengeluaran Operasional & Sistem Backup

Fase ini fokus pada manajemen keuangan operasional dan keamanan data.

### 1. Desain Database

#### Tabel `expenses` (Pengeluaran Operasional)
- `id`: Primary Key
- `category`: Enum (`salary`, `rent`, `utilities`, `supplies`, `maintenance`, `other`)
- `description`: Deskripsi pengeluaran
- `amount`: Jumlah (Rp)
- `expense_date`: Tanggal pengeluaran
- `payment_method`: Enum (`cash`, `bank_transfer`)
- `receipt_image`: Path ke foto bukti (opsional)
- `notes`: Catatan tambahan
- `created_by`: User ID yang mencatat
- `created_at`, `updated_at`

### 2. Fitur Pengeluaran Operasional

#### Manajemen Pengeluaran
- **Form Input Pengeluaran:**
    - Pilih kategori (Gaji, Sewa, Listrik, ATK Kantor, dll)
    - Input jumlah dan tanggal
    - Upload foto bukti pembayaran
- **List Pengeluaran:**
    - Tabel dengan filter berdasarkan kategori dan rentang tanggal
    - Total pengeluaran per kategori
    - Export ke Excel
- **Dashboard Pengeluaran:**
    - Card summary: Total pengeluaran bulan ini per kategori
    - Chart breakdown pengeluaran (Pie Chart)
    - Perbandingan bulan ini vs bulan lalu

#### Laporan Keuangan Lengkap
- **Profit/Loss (Enhanced):**
    - Revenue (dari penjualan)
    - COGS (dari produk)
    - Gross Profit
    - **Operating Expenses** (dari tabel expenses)
    - **Net Profit** = Gross Profit - Operating Expenses
- **Cash Flow Report:**
    - Cash In: Penjualan tunai + pembayaran piutang
    - Cash Out: Pembelian stok + pengeluaran operasional
    - Net Cash Flow

### 3. Sistem Backup Database

#### Auto Backup
- **Scheduled Backup:**
    - Daily backup otomatis (via Laravel scheduler)
    - Simpan ke storage lokal dan cloud (Google Drive/Dropbox)
    - Retention policy: 7 daily, 4 weekly, 12 monthly
- **Manual Backup:**
    - Tombol "Backup Now" di halaman settings
    - Download backup file (.sql atau .zip)
- **Restore:**
    - Upload backup file untuk restore
    - Preview backup info (tanggal, ukuran) sebelum restore

#### Backup Management UI
- **List Backups:**
    - Tabel dengan kolom: Tanggal, Ukuran, Status, Actions
    - Download dan Delete backup
- **Backup Settings:**
    - Enable/disable auto backup
    - Set backup schedule (daily/weekly)
    - Configure cloud storage credentials

---

## Fitur Tambahan yang Direkomendasikan

### 1. **Barcode Scanner Integration**
- Scan barcode produk untuk input cepat di POS
- Generate barcode untuk produk baru
- Print barcode label

### 2. **Shift Management (Kasir Bergantian)**
- **Open Shift:**
    - Kasir input modal awal (uang di laci)
    - Catat waktu mulai shift
- **Close Shift:**
    - Hitung total penjualan shift
    - Bandingkan dengan uang fisik di laci
    - Catat selisih (shortage/overage)
    - Print shift report
- **Shift History:**
    - Riwayat semua shift per kasir
    - Analisis performa kasir

### 3. **Discount & Promotion System**
- **Discount Types:**
    - Percentage discount (misal: 10% off)
    - Fixed amount discount (misal: Rp 5.000 off)
    - Buy X Get Y (misal: Beli 2 gratis 1)
- **Promotion Rules:**
    - Berlaku untuk produk/kategori tertentu
    - Periode aktif (start date - end date)
    - Minimum purchase requirement
- **Coupon Codes:**
    - Generate kode kupon unik
    - Track penggunaan kupon

### 4. **Multi-Store Support (Future)**
- Manage multiple toko dari 1 dashboard
- Inventory sync antar cabang
- Consolidated reporting
- Transfer stock antar cabang

### 5. **Mobile App (Future)**
- Mobile POS untuk kasir (Android/iOS)
- Owner dashboard untuk monitoring real-time
- Push notification untuk alert stok rendah

### 6. **Supplier Management**
- Database supplier (nama, kontak, produk yang disupply)
- Purchase Order (PO) system
- Track pembelian stok dari supplier
- Supplier payment tracking

### 7. **Employee Management**
- Database karyawan (nama, posisi, gaji)
- Attendance tracking (absensi)
- Payroll calculation
- Commission tracking untuk sales

### 8. **Loyalty Program**
- Point system: Rp 10.000 = 1 point
- Redeem points untuk diskon
- Member tier (Silver, Gold, Platinum)
- Birthday discount otomatis

---

---

## Rincian Pengembangan Fase 7: Inventory In-Flow & Barcode Integration

Fase ini bertujuan untuk melengkapi siklus stok (barang masuk) dan mempercepat proses transaksi di kasir.

### 1. Manajemen Supplier & Stok Masuk (Stock In)
- **Tabel `suppliers`**:
    - `name`, `contact_person`, `phone`, `address`, `email`.
- **Tabel `purchases` (Pembelian Stok)**:
    - `supplier_id`, `purchase_date`, `invoice_number`, `total_amount`, `status` (`pending`, `received`).
- **Tabel `purchase_details`**:
    - `product_id`, `qty`, `cost_price` (harga modal saat ini), `subtotal`.
- **Logika Bisnis**:
    - Saat status pembelian diubah menjadi `received`, stok produk otomatis bertambah.
    - Update `cost_price` di tabel `products` berdasarkan pembelian terbaru (untuk akurasi HPP).

### 2. Barcode Integration (POS Optimization)
- **Auto-Focus Logic**: Implementasi listener global pada halaman POS untuk menangkap input scanner tanpa harus klik field pencarian.
- **SKU Search API**: Optimasi pencarian cepat berdasarkan barcode/SKU yang langsung memasukkan item ke keranjang jika ditemukan kecocokan 100%.
- **Barcode Generator**: Fitur mencetak label barcode untuk produk yang belum memiliki barcode dari pabrik.

---

## Prioritas Implementasi

**Fase Berikutnya (Fase 7):**
1. Manajemen Supplier & Transaksi Pembelian Stok (Integrasi Stok Masuk).
2. Barcode Scanner Integration di Halaman POS.
3. Cetak Label Barcode.
Berdasarkan kebutuhan mendesak untuk toko ATK:

**High Priority:**
1. Pengeluaran Operasional (SELESAI)
2. Auto Backup Database (SELESAI)
3. Inventory In-flow & Supplier Management (Fase 7)

**Medium Priority:**
4. Barcode Scanner Integration (Fase 7)
5. Shift Management (untuk toko dengan multiple kasir)
6. Discount & Promotion System (untuk marketing)

**Low Priority (Future Enhancement):**
7. Multi-Store Support
8. Mobile App
9. Loyalty Program

