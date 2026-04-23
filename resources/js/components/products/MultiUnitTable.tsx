import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';

interface ProductUnit {
    id?: number;
    name: string;
    sku: string;
    barcode: string | null;
    price: number;
    cost_price: number;
    stock: number;
    conversion_factor: number;
    is_base_unit: boolean;
    is_active?: boolean;
}

interface MultiUnitTableProps {
    units: ProductUnit[];
    isExpanded: boolean;
    onToggleExpanded: () => void;
    onAddUnit: () => void;
    onRemoveUnit: (index: number) => void;
    onUpdateUnit: (index: number, field: keyof ProductUnit, value: string | number | boolean) => void;
    customUnit: string;
    commonUnits: string[];
    onCustomUnitChange: (value: string) => void;
}

export default function MultiUnitTable({
    units,
    isExpanded,
    onToggleExpanded,
    onAddUnit,
    onRemoveUnit,
    onUpdateUnit,
    customUnit,
    commonUnits,
    onCustomUnitChange,
}: MultiUnitTableProps) {
    return (
        <TooltipProvider>
            <Collapsible open={isExpanded} onOpenChange={onToggleExpanded} className="mt-6">
                <div className="flex items-center justify-between">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between px-0 hover:bg-transparent">
                            <Label className="text-base font-medium cursor-pointer">Satuan Jual</Label>
                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </Button>
                    </CollapsibleTrigger>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onAddUnit}
                        className="gap-1"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Satuan
                    </Button>
                </div>
                <CollapsibleContent className="space-y-3 mt-4">
                    {units.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8 border rounded-lg bg-muted/50">
                            Belum ada satuan. Klik "Tambah Satuan" untuk membuat.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {units.map((unit, index) => (
                                <div
                                    key={index}
                                    className={`flex flex-wrap items-end gap-3 p-4 rounded-lg border transition-all ${
                                        unit.is_base_unit ? 'border-primary/50 bg-primary/5' : 'bg-card'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 min-w-[80px]">
                                        {unit.is_base_unit ? (
                                            <Badge variant="default" className="text-xs">Base</Badge>
                                        ) : (
                                            <input
                                                type="radio"
                                                name="base_unit"
                                                checked={unit.is_base_unit}
                                                onChange={() => onUpdateUnit(index, 'is_base_unit', true)}
                                                className="h-4 w-4"
                                                title="Jadikan sebagai satuan dasar"
                                            />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-[140px]">
                                        <Label className="text-xs text-muted-foreground mb-1 block">Nama Satuan</Label>
                                        <Select
                                            value={unit.name}
                                            onValueChange={(value) => {
                                                if (value === 'custom') {
                                                    onUpdateUnit(index, 'name', customUnit);
                                                } else {
                                                    onUpdateUnit(index, 'name', value);
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Satuan" />
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
                                        {unit.name === 'custom' || !commonUnits.includes(unit.name) ? (
                                            <Input
                                                value={unit.name}
                                                onChange={(e) => onUpdateUnit(index, 'name', e.target.value)}
                                                placeholder="Satuan custom"
                                                className="mt-1"
                                            />
                                        ) : null}
                                    </div>

                                    <div className="min-w-[100px]">
                                        <Label className="text-xs text-muted-foreground mb-1 block">Konversi</Label>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Input
                                                    type="number"
                                                    value={unit.conversion_factor}
                                                    onChange={(e) => onUpdateUnit(index, 'conversion_factor', Number(e.target.value))}
                                                    placeholder="1"
                                                    disabled={unit.is_base_unit}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {unit.is_base_unit ? 'Satuan dasar selalu 1' : 'Jumlah dalam satuan dasar'}
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>

                                    <div className="min-w-[80px]">
                                        <Label className="text-xs text-muted-foreground mb-1 block">Stok</Label>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Input
                                                    type="number"
                                                    value={unit.stock}
                                                    onChange={(e) => onUpdateUnit(index, 'stock', Number(e.target.value))}
                                                    placeholder="0"
                                                    disabled={!unit.is_base_unit}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {unit.is_base_unit ? 'Stok disimpan di satuan dasar' : 'Stok dihitung otomatis'}
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>

                                    <div className="min-w-[140px]">
                                        <Label className="text-xs text-muted-foreground mb-1 block">Harga Modal</Label>
                                        <div className="relative">
                                            <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-xs">Rp</span>
                                            <Input
                                                type="number"
                                                value={unit.cost_price}
                                                onChange={(e) => onUpdateUnit(index, 'cost_price', Number(e.target.value))}
                                                placeholder="Modal"
                                                className="pl-8"
                                            />
                                        </div>
                                    </div>

                                    <div className="min-w-[140px]">
                                        <Label className="text-xs text-muted-foreground mb-1 block">Harga Jual</Label>
                                        <div className="relative">
                                            <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold">Rp</span>
                                            <Input
                                                type="number"
                                                value={unit.price}
                                                onChange={(e) => onUpdateUnit(index, 'price', Number(e.target.value))}
                                                placeholder="Jual"
                                                className="pl-8 font-medium text-emerald-600"
                                            />
                                        </div>
                                    </div>

                                    <div className="min-w-[40px]">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onRemoveUnit(index)}
                                            disabled={units.length === 1}
                                            className="h-10 w-10 p-0 text-red-500 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-lg">
                        <p>• Satuan dasar (Base) menyimpan stok aktual. Satuan lain dihitung otomatis berdasarkan faktor konversi.</p>
                        <p>• Contoh: 1 Box = 12 Pcs → Satuan Box punya konversi 12, Pcs (base) punya konversi 1.</p>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </TooltipProvider>
    );
}
