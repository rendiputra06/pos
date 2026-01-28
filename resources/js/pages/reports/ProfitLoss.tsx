import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Percent, Calendar, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface ProfitLossData {
    revenue: number;
    cogs: number;
    expenses: number;
    gross_profit: number;
    net_profit: number;
    profit_margin: number;
}

export default function ProfitLoss() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [data, setData] = useState<ProfitLossData | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(route('api.analytics.profit-loss'), {
                params: {
                    start_date: startDate || undefined,
                    end_date: endDate || undefined,
                }
            });
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch profit/loss data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const pieData = data ? [
        { name: 'COGS', value: data.cogs, color: '#ef4444' },
        { name: 'Operasional', value: data.expenses, color: '#f59e0b' },
        { name: 'Laba Bersih', value: data.net_profit, color: '#10b981' },
    ] : [];

    return (
        <AppLayout breadcrumbs={[
            { title: 'Reports', href: '#' },
            { title: 'Profit & Loss', href: '/reports/profit-loss' },
        ]}>
            <Head title="Laporan Laba Rugi" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Laporan Laba Rugi</h1>
                    <p className="text-muted-foreground">Analisis revenue, biaya, dan profit margin</p>
                </div>

                {/* Filter Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Periode Laporan
                        </CardTitle>
                        <CardDescription>Pilih rentang tanggal untuk analisis</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Tanggal Mulai</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">Tanggal Akhir</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={fetchData} className="w-full" disabled={loading}>
                                    {loading ? 'Memuat...' : 'Terapkan Filter'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 text-muted-foreground">Memuat data...</p>
                        </div>
                    </div>
                ) : data ? (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Total Revenue
                                    </CardTitle>
                                    <DollarSign className="w-4 h-4 text-blue-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold">{formatCurrency(data.revenue)}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Total penjualan</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        COGS
                                    </CardTitle>
                                    <ShoppingBag className="w-4 h-4 text-red-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold text-red-600">{formatCurrency(data.cogs)}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Biaya pokok</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Expenses
                                    </CardTitle>
                                    <CreditCard className="w-4 h-4 text-amber-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold text-amber-600">{formatCurrency(data.expenses)}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Biaya operasional</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Net Profit
                                    </CardTitle>
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold text-emerald-600">
                                        {formatCurrency(data.net_profit)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Laba bersih</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Margin
                                    </CardTitle>
                                    <Percent className="w-4 h-4 text-purple-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold text-purple-600">{data.profit_margin}%</div>
                                    <p className="text-xs text-muted-foreground mt-1">Persentase laba</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts & Analysis */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Pie Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Breakdown Revenue</CardTitle>
                                    <CardDescription>Distribusi COGS vs Laba Kotor</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Profit Margin Progress */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Analisis Profit Margin</CardTitle>
                                    <CardDescription>Persentase keuntungan dari total penjualan</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Profit Margin</span>
                                            <span className="font-bold">{data.profit_margin}%</span>
                                        </div>
                                        <Progress value={data.profit_margin} className="h-3" />
                                    </div>

                                    <div className="space-y-3 pt-4 border-t">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Revenue</span>
                                            <span className="font-bold">{formatCurrency(data.revenue)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">COGS (Produk)</span>
                                            <span className="font-bold text-red-600">- {formatCurrency(data.cogs)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Operasional</span>
                                            <span className="font-bold text-amber-600">- {formatCurrency(data.expenses)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t">
                                            <span className="font-semibold">Net Profit (Laba Bersih)</span>
                                            <span className="font-bold text-emerald-600 text-lg">
                                                {formatCurrency(data.net_profit)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-muted p-4 rounded-lg mt-4">
                                        <p className="text-sm text-muted-foreground">
                                            <strong>Catatan:</strong> Penghitungan laba bersih mencakup total penjualan dikurangi biaya pokok produk (COGS) dan seluruh pengeluaran operasional yang dicatat.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                ) : (
                    <Card>
                        <CardContent className="flex items-center justify-center h-64">
                            <p className="text-muted-foreground">Pilih periode untuk melihat laporan</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
