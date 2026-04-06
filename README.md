# Point of Sales (POS) Multi-Feature System

Sistem Point of Sales (POS) yang komprehensif dengan fitur manajemen bisnis lengkap, dirancang untuk mempercepat proses transaksi, mengelola inventaris secara real-time, dan menyediakan laporan analitik bisnis yang akurat.

## 🌟 Fitur Utama

### 💰 **Sistem Kasir & Transaksi**
- **Antarmuka POS Modern**: Desain responsif dengan React + Inertia.js
- **Pencarian Produk Real-time**: API endpoint untuk pencarian cepat produk dan jasa
- **Pembayaran Multi-Metode**: Dukungan tunai, kartu debit/kredit, dan e-wallet (QRIS)
- **Cetak Struk**: Generate dan cetak struk transaksi otomatis
- **Manajemen Layanan**: Katalog layanan dengan tingkat harga berbeda

### 📦 **Manajemen Inventaris**
- **Manajemen Produk**: CRUD produk dengan kategori, barcode, dan stok tracking
- **Manajemen Kategori**: Organisasi produk dan layanan per kategori
- **Tracking Stok**: Monitoring stok real-time dengan notifikasi
- **Barcode Generator**: Generate barcode untuk setiap produk
- **Media Management**: Upload dan kelola gambar produk dengan Spatie Media Library

### 🛒 **Manajemen Pembelian & Supplier**
- **Manajemen Supplier**: Database supplier lengkap
- **Purchase Orders**: Sistem pembelian dengan status tracking
- **Purchase Details**: Detail item pembelian dengan harga dan quantity
- **Update Status**: Tracking status pembelian (pending, received, cancelled)

### 📊 **Laporan & Analytics**
- **Dashboard Analytics**: Grafik penjualan, trend, dan breakdown kategori
- **Laporan Penjualan**: Harian, mingguan, dan bulanan
- **Laporan Profit & Loss**: Analisis keuntungan dan kerugian
- **Export Reports**: Export laporan ke format Excel (Maatwebsite Excel)
- **API Analytics**: Endpoint untuk data analitik real-time

### 👥 **Manajemen Pengguna & Keamanan**
- **Role-Based Access Control (RBAC)**: Spatie Permission untuk hak akses
- **Manajemen User**: CRUD pengguna dengan role assignment
- **Permission Management**: Kontrol akses granular per fitur
- **Audit Logs**: Tracking aktivitas pengguna (Spatie Activity Log)
- **Menu Management**: Dinamis menu dengan permission checking

### 💸 **Manajemen Keuangan**
- **Expense Tracking**: Record dan kategorisasi pengeluaran
- **Profit Loss Analysis**: Analisis keuangan otomatis
- **Financial Reports**: Laporan keuangan terintegrasi

### 🛠️ **Sistem Administrasi**
- **App Settings**: Konfigurasi aplikasi terpusat
- **Backup System**: Backup database otomatis dan manual (Spatie Backup)
- **File Management**: Upload dan kelola file sistem
- **User Profiles**: Manajemen profil pengguna
- **Appearance Settings**: Personalisasi tampilan (dark/light mode)

### 🎨 **UI/UX Modern**
- **Responsive Design**: Tailwind CSS + Shadcn/UI components
- **Dark Mode Support**: Tema terang/gelap dengan next-themes
- **Interactive Tables**: TanStack Table untuk data tables
- **Charts & Visualizations**: Recharts untuk grafik interaktif
- **Drag & Drop**: DnD Kit untuk sortable elements
- **Toast Notifications**: Sonner untuk notifikasi user-friendly

## 🛠️ Teknologi Stack

### Backend
- **Framework**: Laravel 12 (PHP 8.2+)
- **Database**: MySQL/MariaDB
- **Authentication**: Laravel Breeze + Inertia.js
- **Queue System**: Laravel Queues
- **File Storage**: Laravel Storage + Spatie Media Library

### Frontend
- **Framework**: React 19 + Inertia.js 2.0
- **Styling**: Tailwind CSS 4.1 + Shadcn/UI
- **State Management**: React Hooks + Inertia Form Helper
- **Routing**: Ziggy (Laravel routing di frontend)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Tables**: TanStack Table
- **Date Handling**: date-fns + dayjs + react-day-picker

### UI Components & Libraries
- **Headless UI**: @headlessui/react
- **Radix UI**: Complete component suite ( dialogs, selects, etc. )
- **Drag & Drop**: @dnd-kit/core + sortable
- **Notifications**: Sonner (toast notifications)
- **Theme**: next-themes (dark/light mode)
- **Barcode**: react-barcode
- **File Icons**: react-file-icon

### Laravel Packages
- **Spatie Permission**: Role-based access control (RBAC)
- **Spatie Activity Log**: Audit trail dan activity tracking
- **Spatie Backup**: Database dan file backup system
- **Spatie Media Library**: File dan media management
- **Maatwebsite Excel**: Excel export functionality

### Development Tools
- **TypeScript**: Full TypeScript support
- **Vite**: Build tool dan development server
- **ESLint + Prettier**: Code formatting dan linting
- **PHPUnit**: Unit testing
- **Laravel Pint**: PHP code formatting

## 🚀 Instalasi & Setup

### Prerequisites
- PHP 8.2+
- Node.js 18+
- MySQL/MariaDB
- Composer
- Git

### Langkah Instalasi

1. **Clone Repositori**
   ```bash
   git clone https://github.com/yogijowo/laravel12-react-starterkit.git
   cd posmulti
   ```

2. **Instal Dependensi PHP**
   ```bash
   composer install
   ```

3. **Instal Dependensi Node.js**
   ```bash
   npm install
   ```

4. **Konfigurasi Environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Setup Database**
   - Buat database baru di MySQL/MariaDB
   - Konfigurasi database di `.env` file:
     ```env
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=posmulti
     DB_USERNAME=root
     DB_PASSWORD=
     ```

6. **Jalankan Migrasi & Seeder**
   ```bash
   php artisan migrate:fresh --seed
   ```

7. **Link Storage**
   ```bash
   php artisan storage:link
   ```

8. **Jalankan Aplikasi**
   ```bash
   # Development mode (Laravel + Vite + Queue + Logs)
   composer dev
   
   # Atau jalankan secara terpisah:
   npm run dev
   php artisan serve
   ```

## 📋 Default Login Credentials

Setelah seeder dijalankan, Anda dapat login dengan:

- **Admin**: `admin@example.com` / `password`
- **Manager**: `manager@example.com` / `password`
- **Cashier**: `cashier@example.com` / `password`

## 🎯 Fitur Modul

### 🏠 **Dashboard**
- Overview penjualan harian/mingguan/bulanan
- Grafik trend penjualan
- Produk terlaris
- Notifikasi stok menipis
- Quick access ke fitur utama

### 💻 **Point of Sales (POS)**
- Interface kasir modern
- Pencarian produk barcode/nama
- Keranjang belanja real-time
- Multiple payment methods
- Print receipt otomatis
- Transaction history

### 📦 **Inventory Management**
- Master data produk
- Kategori produk
- Stock management
- Barcode generation
- Product images
- Service management dengan price levels

### 🛒 **Purchase Management**
- Supplier management
- Purchase order creation
- Status tracking (pending/received/cancelled)
- Purchase detail records
- Cost tracking

### 📊 **Reports & Analytics**
- Sales reports (daily/weekly/monthly)
- Profit & loss statements
- Category performance
- Product performance
- Export ke Excel
- Interactive charts

### 👥 **User Management**
- User CRUD operations
- Role assignment
- Permission management
- Activity logs
- Profile management

### ⚙️ **Settings & Configuration**
- Application settings
- Backup management
- File management
- Menu customization
- Appearance settings (dark/light mode)
- Audit trail

## 🔧 Perintah Penting

### 🛡️ Permission Management
```bash
# Refresh permissions dan roles
php artisan db:seed --class=RolePermissionSeeder

# Clear cache permissions
php artisan cache:clear
php artisan config:clear
```

### 💾 Backup & Restore
```bash
# Backup database
php artisan backup:run --only-db

# Backup full (database + files)
php artisan backup:run

# List backups
php artisan backup:list
```

### 🛠️ Development
```bash
# Development server (all services)
composer dev

# Build untuk production
npm run build

# Code formatting
npm run format
npm run lint

# PHP formatting
./vendor/bin/pint
```

### 🧪 Testing
```bash
# Run tests
php artisan test

# Run specific test
php artisan test --filter UserTest
```

## 📁 Struktur Proyek

```
├── app/
│   ├── Http/Controllers/     # Logic aplikasi
│   ├── Models/              # Eloquent models
│   ├── Services/            # Business logic
│   └── Observers/           # Model observers
├── database/
│   ├── migrations/          # Database schema
│   ├── seeders/             # Initial data
│   └── factories/           # Test data
├── resources/js/
│   ├── components/          # React components
│   ├── pages/               # Inertia pages
│   ├── layouts/             # Page layouts
│   └── hooks/               # Custom React hooks
├── routes/
│   ├── web.php              # Web routes
│   ├── auth.php             # Authentication routes
│   └── settings.php         # Settings routes
└── storage/                 # File storage
```

## � Keamanan

- **CSRF Protection**: Laravel built-in CSRF protection
- **XSS Protection**: Input sanitization dan escaping
- **SQL Injection Prevention**: Eloquent ORM
- **Authentication**: Laravel Breeze + Inertia.js
- **Authorization**: Spatie Permission (RBAC)
- **Activity Logging**: Spatie Activity Log
- **Input Validation**: Laravel Form Request Validation

## 📱 Responsive Design

Aplikasi fully responsive dan optimal di:
- Desktop (1920x1080+)
- Tablet (768px-1024px)
- Mobile (320px-768px)

## 🔄 Update & Maintenance

### Update Dependencies
```bash
# Update PHP dependencies
composer update

# Update Node dependencies
npm update
```

### Cache Management
```bash
# Clear all caches
php artisan optimize:clear

# Optimize untuk production
php artisan optimize
```

## 🤝 Kontribusi

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

## 🆘 Support

Jika mengalami masalah:
1. Check [documentation](docs/)
2. Search [issues](https://github.com/yogijowo/laravel12-react-starterkit/issues)
3. Create new issue dengan detail error

---

**Built with ❤️ menggunakan Laravel 12 + React 19 + TypeScript**
