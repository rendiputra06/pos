import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface ProductPreviewProps {
    name: string;
    sku: string;
    hasVariants: boolean;
    hasMultipleUnits: boolean;
    price: number;
    stock: number;
}

export default function ProductPreview({
    name,
    sku,
    hasVariants,
    hasMultipleUnits,
    price,
    stock,
}: ProductPreviewProps) {
    return (
        <Card className="bg-muted/50">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Info className="h-5 w-5" />
                    Preview Produk
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="space-y-1">
                    <div className="text-muted-foreground">Nama</div>
                    <div className="font-medium">{name || '-'}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-muted-foreground">SKU</div>
                    <div className="font-medium">{sku || '-'}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-muted-foreground">Tipe</div>
                    <div className="font-medium">
                        {hasVariants ? 'Variant Product' : hasMultipleUnits ? 'Multi-Unit' : 'Simple Product'}
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="text-muted-foreground">Harga Jual</div>
                    <div className="font-medium text-emerald-600">
                        {price ? `Rp ${price.toLocaleString()}` : '-'}
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="text-muted-foreground">Stok</div>
                    <div className="font-medium">{stock || 0}</div>
                </div>
            </CardContent>
        </Card>
    );
}
