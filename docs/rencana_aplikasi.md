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

## Rincian Pengembangan Fase 2: Master Data

Fase ini bertujuan untuk membangun fondasi data produk dan jasa yang akan dikelola oleh sistem POS.

### 1. Desain Database (Skema)

#### Tabel `categories`
- `id`: Primary Key
- `name`: Nama kategori (Contoh: Alat Tulis, Jasa Fotocopy, Seragam)
- `slug`: URL friendly name
- `type`: Enum (`product`, `service`) - Untuk membedakan input data.

#### Tabel `products` (Untuk ATK & Barang Fisik)
- `id`: Primary Key
- `category_id`: Foreign Key ke `categories`
- `name`: Nama barang (Contoh: Buku Sidu 38 Lembar)
- `sku`: Kode stok unik
- `barcode`: Scan code (opsional)
- `cost_price`: Harga modal (untuk hitung laba)
- `price`: Harga jual retail
- `stock`: Jumlah ketersediaan
- `unit`: Satuan (pcs, rim, lusin, pack)
- `image`: Foto produk

#### Tabel `services` (Untuk Fotocopy, Print, Jilid)
- `id`: Primary Key
- `category_id`: Foreign Key ke `categories`
- `name`: Nama jasa (Contoh: Fotocopy A4 H/P)
- `base_price`: Harga dasar per lembar

#### Tabel `service_price_levels` (Harga Bertingkat)
- `id`: Primary Key
- `service_id`: Foreign Key ke `services`
- `min_qty`: Jumlah minimal (Contoh: 101)
- `max_qty`: Jumlah maksimal (Contoh: 500)
- `price`: Harga khusus (Contoh: Rp 200/lembar, jika normalnya Rp 500)

### 2. Fitur Antarmuka (UI)

- **Kategori:** List kategori dengan ikon lucide-react untuk visualisasi cepat.
- **Produk:** Grid/Table view dengan filter stok rendah (highlight warna merah jika stok < 5).
- **Jasa:** Form khusus yang memungkinkan penambahan baris "Harga Bertingkat" secara dinamis.

### 3. Logika Bisnis (Business Logic)

- **Auto-Calculated Pricing:** Di kasir nanti, harga jasa akan otomatis berubah jika jumlah lembar melewati threshold `service_price_levels`.
- **Stock Management:** Pengurangan stok otomatis saat transaksi (Barang Fisik), dan sistem peringatan jika sisa kertas HVS atau toner menipis (Jasa).

