import InputError from '@/components/input-error';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, Lock } from 'lucide-react';

interface ProductFinanceStockProps {
    costPrice: number;
    price: number;
    stock: number;
    hasVariants: boolean;
    hasMultipleUnits: boolean;
    isExpanded: boolean;
    onToggleExpanded: () => void;
    onCostPriceChange: (value: number) => void;
    onPriceChange: (value: number) => void;
    onStockChange: (value: number) => void;
    errors: Record<string, string>;
}

export default function ProductFinanceStock({
    costPrice,
    price,
    stock,
    hasVariants,
    hasMultipleUnits,
    isExpanded,
    onToggleExpanded,
    onCostPriceChange,
    onPriceChange,
    onStockChange,
    errors,
}: ProductFinanceStockProps) {
    return (
        <TooltipProvider>
            <Card className="shadow-sm">
                <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
                    <CardHeader>
                        <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between cursor-pointer">
                                <CardTitle>Keuangan & Stok</CardTitle>
                                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                        </CollapsibleTrigger>
                        <CardDescription>
                            {hasVariants
                                ? 'Harga dan stok diatur per variant di halaman variants'
                                : hasMultipleUnits
                                    ? 'Harga dan stok diatur per satuan di tabel di atas'
                                    : 'Atur harga beli, harga jual, dan jumlah stok saat ini.'}
                        </CardDescription>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className={`grid grid-cols-2 gap-4 md:grid-cols-3 ${hasVariants || hasMultipleUnits ? 'pointer-events-none opacity-50' : ''}`}>
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="cost_price">Harga Modal</Label>
                                    {(hasVariants || hasMultipleUnits) && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Lock className="h-3 w-3 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {hasVariants ? 'Diatur per variant' : 'Diatur per satuan'}
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                                <div className="relative">
                                    <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-xs">Rp</span>
                                    <Input
                                        id="cost_price"
                                        type="number"
                                        className="pl-8"
                                        value={costPrice}
                                        onChange={(e) => onCostPriceChange(Number(e.target.value))}
                                        disabled={hasVariants}
                                    />
                                </div>
                                <InputError message={errors.cost_price} />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="price">Harga Jual</Label>
                                    {(hasVariants || hasMultipleUnits) && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Lock className="h-3 w-3 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {hasVariants ? 'Diatur per variant' : 'Diatur per satuan'}
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                                <div className="relative">
                                    <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold">Rp</span>
                                    <Input
                                        id="price"
                                        type="number"
                                        className="pl-8 font-bold text-emerald-600"
                                        value={price}
                                        onChange={(e) => onPriceChange(Number(e.target.value))}
                                        disabled={hasVariants}
                                    />
                                </div>
                                <InputError message={errors.price} />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="stock">Stok Awal</Label>
                                    {(hasVariants || hasMultipleUnits) && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Lock className="h-3 w-3 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {hasVariants ? 'Diatur per variant' : 'Diatur per satuan'}
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                                <Input
                                    id="stock"
                                    type="number"
                                    value={stock}
                                    onChange={(e) => onStockChange(Number(e.target.value))}
                                    disabled={hasVariants}
                                />
                                <InputError message={errors.stock} />
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
        </TooltipProvider>
    );
}
