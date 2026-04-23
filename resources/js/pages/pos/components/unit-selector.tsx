import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/currency';
import { Package } from 'lucide-react';

interface ProductUnit {
    id: number;
    name: string;
    price: number;
    stock: number;
    sku: string;
    barcode?: string;
    conversion_factor: number;
}

interface UnitSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: number;
        name: string;
        units: ProductUnit[];
    } | null;
    onSelect: (unit: ProductUnit) => void;
}

export function UnitSelector({ isOpen, onClose, product, onSelect }: UnitSelectorProps) {
    if (!product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Pilih Satuan
                    </DialogTitle>
                    <DialogDescription>
                        {product.name} tersedia dalam beberapa satuan jual
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-2 py-4">
                    {product.units.map((unit) => (
                        <Button
                            key={unit.id}
                            variant="outline"
                            onClick={() => onSelect(unit)}
                            className="justify-start h-auto py-3 px-4"
                        >
                            <div className="flex flex-col items-start w-full">
                                <div className="flex justify-between w-full items-center">
                                    <span className="font-semibold text-base">{unit.name}</span>
                                    <span className="font-bold text-emerald-600">
                                        {formatCurrency(unit.price)}
                                    </span>
                                </div>
                                <div className="flex justify-between w-full text-sm text-muted-foreground mt-1">
                                    <span>SKU: {unit.sku}</span>
                                    <span className={unit.stock <= 5 ? 'text-red-500 font-medium' : 'text-green-600'}>
                                        Stok: {unit.stock}
                                    </span>
                                </div>
                                {unit.barcode && (
                                    <span className="text-xs text-muted-foreground mt-0.5">
                                        Barcode: {unit.barcode}
                                    </span>
                                )}
                            </div>
                        </Button>
                    ))}
                </div>

                <div className="text-xs text-muted-foreground text-center">
                    Klik satuan untuk menambahkan ke keranjang
                </div>
            </DialogContent>
        </Dialog>
    );
}
