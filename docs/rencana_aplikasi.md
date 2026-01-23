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

## Rencana Fase Selanjutnya (Masa Depan)
- **Fase 4:** Laporan Penjualan, Laba Rugi, & Dashboard Analytics Lanjutan.
- **Fase 5:** Manajemen Pelanggan (Member) & Piutang (Khas toko kelontong/ATK Indonesia).
- **Fase 6:** Pengeluaran Operasional (Gaji, Listrik, Sewa) & Backup Database Otomatis.

