import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CategoryBreakdownChartProps {
    data: Array<{
        name: string;
        total: number;
    }>;
}

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Penjualan per Kategori</CardTitle>
                <CardDescription>Breakdown penjualan berdasarkan kategori produk/jasa</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="name" 
                            style={{ fontSize: '12px' }}
                            angle={-15}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis 
                            tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}k`}
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
