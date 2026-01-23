import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MoveRight, Store, FileText, BarChart3, Package, CheckCircle2 } from 'lucide-react';

export default function Welcome() {
  const { auth, setting } = usePage<SharedData>().props;

  const primaryColor = setting?.warna || '#0ea5e9';
  const primaryForeground = '#ffffff';

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--primary-foreground', primaryForeground);
    document.documentElement.style.setProperty('--color-primary-foreground', primaryForeground);
  }, [primaryColor, primaryForeground]);

  const features = [
    {
      title: 'Manajemen Inventori ATK',
      description: 'Pantau stok alat tulis, buku, dan perlengkapan sekolah secara real-time dengan notifikasi stok rendah.',
      icon: <Package className="w-6 h-6" />,
    },
    {
      title: 'Layanan Jasa Dokumen',
      description: 'Sistem khusus untuk menghitung biaya fotocopy, cetak dokumen, dan penjilidan secara akurat.',
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: 'Kasir Cepat & Mudah',
      description: 'Antarmuka POS intuitif yang mendukung pembayaran tunai maupun non-tunai (QRIS).',
      icon: <Store className="w-6 h-6" />,
    },
    {
      title: 'Analitik Penjualan',
      description: 'Laporan laba rugi dan tren produk terlaris untuk membantu pengambilan keputusan bisnis.',
      icon: <BarChart3 className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground">
      <Head title="Solusi POS Modern untuk Toko ATK & Fotocopy" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[var(--primary)] p-1.5 rounded-lg text-white">
              <Store className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">KASIR<span className="text-[var(--primary)]">KU</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-[var(--primary)] transition-colors">Fitur</a>
            <a href="#about" className="hover:text-[var(--primary)] transition-colors">Tentang</a>
            <a href="#price" className="hover:text-[var(--primary)] transition-colors">Harga</a>
          </div>

          <div className="flex items-center gap-3">
            {auth.user ? (
              <Link href="/dashboard">
                <Button variant="default">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="default">Masuk</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
              </span>
              Solusi POS #1 untuk Toko ATK di Indonesia
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Kelola Toko ATK & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-indigo-500">Fotocopy</span> Lebih Profesional
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              Tingkatkan efisiensi layanan fotocopy dan penjualan alat tulis Anda dengan sistem kasir yang dirancang khusus untuk kebutuhan toko ATK di Indonesia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={auth.user ? "/dashboard" : "/login"}>
                <Button size="lg" className="h-14 px-8 text-lg gap-2">
                  Mulai Sekarang <MoveRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                Lihat Demo
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Mudah Digunakan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Mendukung QRIS</span>
              </div>
            </div>
          </div>

          <div className="relative lg:block animate-in fade-in slide-in-from-right duration-700 delay-200">
            <div className="absolute -inset-4 bg-gradient-to-tr from-[var(--primary)]/20 to-indigo-500/20 blur-3xl opacity-50 rounded-full" />
            <img 
              src="/home/xymine/.gemini/antigravity/brain/783ba4a4-9f4c-461b-8d58-bf4198ec26ef/pos_hero_atk_photocopy_1769187829591.png" 
              alt="KasirKu POS Dashboard" 
              className="relative w-full h-auto rounded-2xl shadow-2xl border bg-card"
            />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-24 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Semua yang Anda Butuhkan dalam Satu Sistem</h2>
            <p className="text-muted-foreground">Fitur lengkap yang dirancang untuk mempermudah operasional harian toko ATK dan layanan fotocopy Anda.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-8 rounded-2xl border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA section removed */}
      </main>

      <footer className="border-t py-12 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-[var(--primary)] p-1.5 rounded-lg text-white">
              <Store className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">KASIR<span className="text-[var(--primary)]">KU</span></span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 KasirKu POS. Dibuat dengan ❤ untuk UMKM Indonesia.</p>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-[var(--primary)]">Kebijakan Privasi</a>
            <a href="#" className="hover:text-[var(--primary)]">Syarat & Ketentuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}