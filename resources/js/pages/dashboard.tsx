import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShoppingCart, 
  ClipboardList, 
  AlertTriangle,
  Printer,
  TrendingUp,
  ArrowUpRight,
  Package,
  CreditCard
} from 'lucide-react';
import { SalesTrendChart } from '@/components/charts/SalesTrendChart';
import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart';
import axios from 'axios';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
];

interface DashboardData {
  today_sales: number;
  today_transactions: number;
  today_expenses: number;
  top_products: Array<{ id: number; name: string; total_qty: number; total_sales: number }>;
  top_services: Array<{ id: number; name: string; total_qty: number; total_sales: number }>;
  low_stock_products: Array<{ id: number; name: string; stock: number; sku: string }>;
}

interface SalesTrend {
  date: string;
  total: number;
  count: number;
}

interface CategoryBreakdown {
  name: string;
  total: number;
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [salesTrend, setSalesTrend] = useState<SalesTrend[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, trendRes, catRes] = await Promise.all([
          axios.get(route('api.analytics.dashboard')),
          axios.get(route('api.analytics.sales-trend')),
          axios.get(route('api.analytics.category-breakdown')),
        ]);

        setDashboardData(dashRes.data);
        setSalesTrend(trendRes.data);
        setCategoryData(catRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Dashboard Analitik" />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard Analitik" />
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Overview Bisnis</h1>
          <p className="text-muted-foreground">Resume performa toko Anda untuk hari ini.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Penjualan Hari Ini</CardTitle>
              <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboardData?.today_sales || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                Total penjualan hari ini
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Transaksi</CardTitle>
              <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                <ClipboardList className="w-5 h-5 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.today_transactions || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Transaksi hari ini</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Stok Menipis</CardTitle>
              <div className="p-2 bg-muted rounded-lg group-hover:bg-amber-100 transition-colors">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.low_stock_products.length || 0} Item</div>
              <p className="text-xs text-muted-foreground mt-1">Perlu restock segera</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pengeluaran Hari Ini</CardTitle>
              <div className="p-2 bg-muted rounded-lg group-hover:bg-destructive/10 transition-colors">
                <CreditCard className="w-5 h-5 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboardData?.today_expenses || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total pengeluaran hari ini</p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {dashboardData && dashboardData.low_stock_products.length > 0 && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <span className="font-semibold">Peringatan Stok Rendah:</span>{' '}
              {dashboardData.low_stock_products.map(p => `${p.name} (${p.stock} unit)`).join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* Charts Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesTrendChart data={salesTrend} />
          <CategoryBreakdownChart data={categoryData} />
        </div>

        {/* Top Products & Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Produk Terlaris</CardTitle>
                <CardDescription>Top 5 produk paling laku</CardDescription>
              </div>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.top_products.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.total_qty} unit terjual</p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600">{formatCurrency(product.total_sales)}</span>
                  </div>
                ))}
                {(!dashboardData?.top_products || dashboardData.top_products.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">Belum ada data penjualan produk</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Jasa Terpopuler</CardTitle>
                <CardDescription>Layanan yang paling sering digunakan</CardDescription>
              </div>
              <Printer className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.top_services.map((service, index) => (
                  <div key={service.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{service.name}</p>
                        <p className="text-xs text-muted-foreground">{service.total_qty} kali digunakan</p>
                      </div>
                    </div>
                    <span className="font-bold text-purple-600">{formatCurrency(service.total_sales)}</span>
                  </div>
                ))}
                {(!dashboardData?.top_services || dashboardData.top_services.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">Belum ada data penjualan jasa</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
