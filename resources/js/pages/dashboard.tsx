import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Package, 
  ClipboardList, 
  Printer, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
];

const summaryStats = [
  { 
    label: 'Penjualan Hari Ini', 
    value: 'Rp 1.250.000', 
    description: '+12% dari kemarin',
    icon: <ShoppingCart className="w-5 h-5 text-blue-500" />,
    trend: 'up'
  },
  { 
    label: 'Total Transaksi', 
    value: '48', 
    description: '+5 dari periode sebelumnya',
    icon: <ClipboardList className="w-5 h-5 text-emerald-500" />,
    trend: 'up'
  },
  { 
    label: 'Stok Menipis', 
    value: '12 Item', 
    description: 'Buku Sidu Pcs, Pulpen Hi-Tech',
    icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    trend: 'neutral'
  },
  { 
    label: 'Layanan Jasa', 
    value: 'Rp 450.000', 
    description: 'Fotocopy & Printing',
    icon: <Printer className="w-5 h-5 text-purple-500" />,
    trend: 'up'
  },
];

const salesTrendData = [
  { day: 'Sen', sales: 850000 },
  { day: 'Sel', sales: 920000 },
  { day: 'Rab', sales: 1100000 },
  { day: 'Kam', sales: 950000 },
  { day: 'Jum', sales: 1400000 },
  { day: 'Sab', sales: 2100000 },
  { day: 'Min', sales: 1800000 },
];

const categoryData = [
  { name: 'Alat Tulis (ATK)', value: 45, color: '#3b82f6' },
  { name: 'Fotocopy', value: 30, color: '#8b5cf6' },
  { name: 'Printing/Cetak', value: 15, color: '#ec4899' },
  { name: 'Lain-lain', value: 10, color: '#f59e0b' },
];

const topProducts = [
  { name: 'Buku Tulis Sidu 38', sales: 120, revenue: 'Rp 600.000' },
  { name: 'Kertas HVS A4 70gr', sales: 85, revenue: 'Rp 4.250.000' },
  { name: 'Pulpen Snowman Black', sales: 76, revenue: 'Rp 152.000' },
  { name: 'Map Diamond Biru', sales: 45, revenue: 'Rp 135.000' },
];

export default function Dashboard() {
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
          {summaryStats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  {stat.trend === 'up' && <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
                  {stat.trend === 'down' && <ArrowDownRight className="w-3 h-3 text-rose-500" />}
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Sales Trend Chart */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Tren Penjualan Mingguan</CardTitle>
              <CardDescription>Visualisasi pendapatan dalam 7 hari terakhir.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] pl-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} width={80} tickFormatter={(value) => `Rp ${value/1000}k`} tick={{fontSize: 12}} />
                  <Tooltip 
                    formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Penjualan']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution Chart */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Distribusi Produk & Jasa</CardTitle>
              <CardDescription>Persentase kontribusi per kategori.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4 w-full px-4">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products Table-like List */}
          <Card className="lg:col-span-7">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Produk Terlaris</CardTitle>
                <CardDescription>Item yang paling sering terjual bulan ini.</CardDescription>
              </div>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase border-b">
                    <tr>
                      <th className="py-3 font-semibold">Nama Produk</th>
                      <th className="py-3 font-semibold text-center">Jumlah Terjual</th>
                      <th className="py-3 font-semibold text-right">Total Pendapatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {topProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-muted/50 transition-colors">
                        <td className="py-4 font-medium">{product.name}</td>
                        <td className="py-4 text-center">{product.sales} unit</td>
                        <td className="py-4 text-right font-bold text-emerald-600">{product.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
