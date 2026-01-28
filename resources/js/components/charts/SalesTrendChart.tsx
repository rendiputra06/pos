import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesTrendChartProps {
    data: Array<{
        date: string;
        total: number;
        count: number;
    }>;
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tren Penjualan 7 Hari Terakhir</CardTitle>
                <CardDescription>Grafik penjualan harian</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={formatDate}
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                            tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}k`}
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip 
                            formatter={(value: number) => formatCurrency(value)}
                            labelFormatter={formatDate}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="total" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--primary))' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
