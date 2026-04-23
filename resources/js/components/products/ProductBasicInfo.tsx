import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Category {
    id: number;
    name: string;
}

interface ProductBasicInfoProps {
    name: string;
    sku: string;
    barcode: string;
    categoryId: string;
    unit: string;
    hasMultipleUnits: boolean;
    hasVariants: boolean;
    categories: Category[];
    skuValidation: { valid: boolean; message?: string };
    barcodeValidation: { valid: boolean; message?: string };
    customUnit: string;
    commonUnits: string[];
    errors: Record<string, string>;
    onNameChange: (value: string) => void;
    onSkuChange: (value: string) => void;
    onBarcodeChange: (value: string) => void;
    onCategoryIdChange: (value: string) => void;
    onUnitChange: (value: string) => void;
    onCustomUnitChange: (value: string) => void;
    onGenerateSku: () => void;
}

export default function ProductBasicInfo({
    name,
    sku,
    barcode,
    categoryId,
    unit,
    hasMultipleUnits,
    hasVariants,
    categories,
    skuValidation,
    barcodeValidation,
    customUnit,
    commonUnits,
    errors,
    onNameChange,
    onSkuChange,
    onBarcodeChange,
    onCategoryIdChange,
    onUnitChange,
    onCustomUnitChange,
    onGenerateSku,
}: ProductBasicInfoProps) {
    return (
        <TooltipProvider>
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Nama Produk</Label>
                    <Input
                        id="name"
                        placeholder="Contoh: Buku Sidu 38 Lembar"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={onGenerateSku}
                                    >
                                        <RefreshCw className="h-3 w-3" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Generate SKU otomatis</TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="relative">
                            <Input
                                id="sku"
                                placeholder="Dikosongkan untuk auto-gen"
                                value={sku}
                                onChange={(e) => onSkuChange(e.target.value)}
                                className={!skuValidation.valid ? 'border-destructive' : ''}
                            />
                            {!skuValidation.valid && (
                                <div className="mt-1 text-xs text-destructive">{skuValidation.message}</div>
                            )}
                        </div>
                        <InputError message={errors.sku} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="barcode">Barcode (Opsional)</Label>
                        <div className="relative">
                            <Input
                                id="barcode"
                                placeholder="Scan atau ketik barcode"
                                value={barcode}
                                onChange={(e) => onBarcodeChange(e.target.value)}
                                className={!barcodeValidation.valid ? 'border-destructive' : ''}
                            />
                            {!barcodeValidation.valid && (
                                <div className="mt-1 text-xs text-destructive">{barcodeValidation.message}</div>
                            )}
                        </div>
                        <InputError message={errors.barcode} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="category_id">Kategori</Label>
                        <Select value={categoryId} onValueChange={onCategoryIdChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.category_id} />
                    </div>
                    {!hasMultipleUnits && !hasVariants && (
                        <div className="grid gap-2">
                            <Label htmlFor="unit">Satuan Jual</Label>
                            <Select
                                value={unit}
                                onValueChange={onUnitChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih satuan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {commonUnits.map((u) => (
                                        <SelectItem key={u} value={u}>
                                            {u}
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="custom">Custom...</SelectItem>
                                </SelectContent>
                            </Select>
                            {unit === 'custom' || !commonUnits.includes(unit) ? (
                                <Input
                                    placeholder="Satuan custom"
                                    value={customUnit || unit}
                                    onChange={(e) => onCustomUnitChange(e.target.value)}
                                    className="mt-2"
                                />
                            ) : null}
                            <InputError message={errors.unit} />
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}
