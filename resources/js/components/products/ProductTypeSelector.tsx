import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

interface ProductTypeSelectorProps {
    hasVariants: boolean;
    hasMultipleUnits: boolean;
    onSimpleSelect: () => void;
    onMultiUnitSelect: () => void;
    onVariantSelect: () => void;
}

export default function ProductTypeSelector({
    hasVariants,
    hasMultipleUnits,
    onSimpleSelect,
    onMultiUnitSelect,
    onVariantSelect,
}: ProductTypeSelectorProps) {
    return (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Tipe Produk
                </CardTitle>
                <CardDescription>Pilih tipe produk untuk menentukan cara pengelolaan harga dan stok</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div
                        className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                            !hasVariants && !hasMultipleUnits
                                ? 'border-primary bg-primary/10'
                                : 'border-muted bg-muted/50 hover:border-primary/50'
                        }`}
                        onClick={onSimpleSelect}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold">Simple Product</div>
                                <div className="text-sm text-muted-foreground">Harga & stok tunggal</div>
                            </div>
                            {!hasVariants && !hasMultipleUnits && (
                                <Badge className="bg-primary">Aktif</Badge>
                            )}
                        </div>
                    </div>

                    <div
                        className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                            hasMultipleUnits
                                ? 'border-primary bg-primary/10'
                                : 'border-muted bg-muted/50 hover:border-primary/50'
                        }`}
                        onClick={onMultiUnitSelect}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold">Multi-Unit</div>
                                <div className="text-sm text-muted-foreground">Beberapa satuan jual</div>
                            </div>
                            {hasMultipleUnits && <Badge className="bg-primary">Aktif</Badge>}
                        </div>
                        {hasVariants && (
                            <div className="mt-2 text-xs text-destructive">Tidak kompatibel dengan variants</div>
                        )}
                    </div>

                    <div
                        className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                            hasVariants
                                ? 'border-primary bg-primary/10'
                                : 'border-muted bg-muted/50 hover:border-primary/50'
                        }`}
                        onClick={onVariantSelect}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold">Variant Product</div>
                                <div className="text-sm text-muted-foreground">Varian ukuran/warna</div>
                            </div>
                            {hasVariants && <Badge className="bg-primary">Aktif</Badge>}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
