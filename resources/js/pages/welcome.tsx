import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Heart, 
  Menu, 
  X, 
  ArrowRight, 
  Star, 
  Truck, 
  ShieldCheck, 
  Zap,
  ShoppingBag,
  Facebook,
  Instagram,
  Twitter,
  Package,
  BarChart3
} from 'lucide-react';

export default function Welcome({ products: initialProducts, services: initialServices }: { products: any[], services: any[] }) {
  const { auth, setting } = usePage<SharedData>().props;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const primaryColor = setting?.warna || '#0ea5e9';

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [primaryColor]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 overflow-x-hidden">
      <Head title="Solusi POS & Layanan ATK Modern" />

      {/* Modern Navbar */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md h-16' : 'bg-transparent h-20'}`}>
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-[var(--primary)] p-1.5 rounded-lg text-white">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">
              KASIR<span className="text-[var(--primary)]">KU</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#products" className="hover:text-[var(--primary)] transition-colors">Produk ATK</a>
            <a href="#services" className="hover:text-[var(--primary)] transition-colors">Layanan Jasa</a>
            <a href="#features" className="hover:text-[var(--primary)] transition-colors">Keunggulan</a>
          </nav>

          <div className="flex items-center gap-4">
            {auth.user ? (
              <Link href="/dashboard">
                <Button variant="default" className="rounded-full px-6 font-bold shadow-lg shadow-[var(--primary)]/20">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="default" className="rounded-full px-6 font-bold shadow-lg shadow-[var(--primary)]/20">
                  Masuk Sistem
                </Button>
              </Link>
            )}
            <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[var(--primary)]/5 skew-x-12 translate-x-1/4"></div>
        <div className="container mx-auto px-4 relative flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-black uppercase tracking-widest mb-8">
                <Zap className="w-4 h-4 fill-current" /> All-in-One Solution
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[0.95] mb-8 tracking-tighter max-w-4xl">
                KELOLA TOKO & <span className="text-[var(--primary)]">LAYANAN JASA</span> DALAM SATU TEMPAT.
            </h1>
            <p className="text-xl text-slate-500 mb-12 max-w-2xl leading-relaxed font-medium">
                Sistem POS modern yang dirancang khusus untuk toko alat tulis yang juga menyediakan layanan fotocopy, cetak, dan penjilidan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="h-16 px-10 text-lg rounded-full shadow-2xl shadow-[var(--primary)]/30">
                    Mulai Sekarang
                </Button>
                <Button size="lg" variant="outline" className="h-16 px-10 text-lg rounded-full border-2 bg-white">
                    Lihat Fitur
                </Button>
            </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 bg-slate-900 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                    { icon: <Package className="w-8 h-8"/>, title: 'Manajemen Stok', desc: 'Pantau stok ATK Anda secara real-time dengan sistem inventory cerdas.' },
                    { icon: <Zap className="w-8 h-8"/>, title: 'Layanan Jasa', desc: 'Hitung otomatis biaya fotocopy, cetak, dan jilid dengan berbagai level harga.' },
                    { icon: <BarChart3 className="w-8 h-8"/>, title: 'Laporan Detail', desc: 'Analisis laba rugi per hari dan tren penjualan produk terlaris Anda.' },
                ].map((f, i) => (
                    <div key={i} className="space-y-4">
                        <div className="text-[var(--primary)]">{f.icon}</div>
                        <h3 className="text-xl font-black">{f.title}</h3>
                        <p className="text-slate-400 font-medium leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </div>
          </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex justify-between items-end">
            <div>
                <h2 className="text-4xl font-black tracking-tighter">KOLEKSI PRODUK ATK</h2>
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-2">Ketersediaan Barang Terkini</p>
            </div>
            <Link href="/login" className="text-[var(--primary)] font-bold border-b-2 border-[var(--primary)] pb-1 hover:opacity-80 transition-opacity">
                LIHAT SEMUA
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {initialProducts.length > 0 ? initialProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-3xl p-6 shadow-sm border hover:shadow-xl transition-all duration-300 group">
                <div className="aspect-square bg-slate-100 rounded-2xl mb-6 overflow-hidden relative">
                    {p.image ? (
                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 italic font-medium">No Image</div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-500">
                        {p.category?.name || 'Umum'}
                    </div>
                </div>
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{p.name}</h3>
                <div className="flex justify-between items-center">
                    <span className="text-[var(--primary)] font-black text-xl">{formatPrice(p.price)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {p.stock > 0 ? `Stok: ${p.stock}` : 'Habis'}
                    </span>
                </div>
              </div>
            )) : Array.from({length: 4}).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border animate-pulse">
                    <div className="aspect-square bg-slate-200 rounded-2xl mb-6"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                    <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-slate-100 border-y">
          <div className="container mx-auto px-4">
              <div className="text-center mb-16 space-y-4">
                  <h2 className="text-5xl font-black tracking-tighter">LAYANAN JASA DOKUMEN</h2>
                  <p className="text-slate-500 max-w-2xl mx-auto font-medium">Solusi cetak dan photocopy profesional dengan skema harga grosir untuk jumlah besar.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {initialServices.length > 0 ? initialServices.map((s) => (
                      <div key={s.id} className="bg-white rounded-[40px] p-10 border shadow-sm relative overflow-hidden group">
                          <div className="absolute -top-12 -right-12 w-24 h-24 bg-[var(--primary)]/10 rounded-full group-hover:scale-[3] transition-transform duration-700"></div>
                          <h3 className="text-2xl font-black mb-6 relative">{s.name}</h3>
                          <div className="space-y-4 mb-8 relative">
                              <div className="flex justify-between items-center border-b border-dashed pb-2">
                                  <span className="text-slate-500 text-sm font-bold uppercase">Harga Dasar</span>
                                  <span className="font-black text-lg">{formatPrice(s.base_price)}</span>
                              </div>
                              {s.price_levels?.map((l: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center bg-slate-50 rounded-xl p-3">
                                      <span className="text-xs font-bold text-slate-500 uppercase italic">
                                          {l.min_qty} - {l.max_qty || '+'} item
                                      </span>
                                      <span className="font-black text-[var(--primary)]">{formatPrice(l.price)}</span>
                                  </div>
                              ))}
                          </div>
                          <Button className="w-full h-14 rounded-2xl font-black italic uppercase tracking-widest text-xs relative">
                              Konsultasi Jasa
                          </Button>
                      </div>
                  )) : (
                    <div className="col-span-full py-20 text-center text-slate-400 italic">Data layanan belum tersedia.</div>
                  )}
              </div>
          </div>
      </section>

      {/* CTA section */}
      <section className="container mx-auto px-4 py-32 text-center">
          <div className="bg-slate-900 rounded-[50px] p-20 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/20 to-transparent"></div>
                <h2 className="text-5xl font-black mb-8 relative tracking-tighter">SIAP MODERNISASI TOKO ANDA?</h2>
                <p className="text-slate-400 mb-12 max-w-xl mx-auto relative font-medium text-lg">
                    Gabung dengan ratusan pemilik toko yang telah menggunakan KasirKu untuk mempermudah operasional harian.
                </p>
                <Link href="/login" className="relative">
                    <Button size="lg" className="h-16 px-16 text-lg rounded-full font-black uppercase italic tracking-widest bg-[var(--primary)] text-white border-0 hover:scale-105 transition-transform shadow-2xl shadow-[var(--primary)]/40">
                        Login Ke Sistem
                    </Button>
                </Link>
          </div>
      </section>

      <footer className="bg-white py-12 border-t">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
                <div className="bg-[var(--primary)] p-1.5 rounded-lg text-white">
                    <ShoppingBag className="w-6 h-6" />
                </div>
                <span className="text-xl font-black tracking-tighter uppercase italic">
                    KASIR<span className="text-[var(--primary)]">KU</span>
                </span>
            </Link>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">© 2026 PT KASIRKU MODERN SOLUSI INDONESIA.</p>
            <div className="flex gap-6">
                <a href="#" className="w-10 h-10 border rounded-full flex items-center justify-center text-slate-400 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 border rounded-full flex items-center justify-center text-slate-400 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 border rounded-full flex items-center justify-center text-slate-400 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all"><Twitter className="w-5 h-5" /></a>
            </div>
        </div>
      </footer>
    </div>
  );
}