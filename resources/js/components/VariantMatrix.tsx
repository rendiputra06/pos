import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { Edit, Package, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface VariantGroup {
    id: number;
    name: string;
    type: string;
    options: VariantOption[];
}

interface VariantOption {
    id: number;
    value: string;
    display_value: string;
    color_code?: string;
    is_active: boolean;
}

interface ProductVariant {
    id: number;
    sku: string;
    barcode?: string;
    price: number;
    cost_price: number;
    stock: number;
    unit: string;
    combination: Record<string, string>;
    formatted_combination: string;
    is_active: boolean;
    thumbnail_url?: string;
}

interface Product {
    id: number;
    name: string;
    price: number;
    cost_price: number;
    stock: number;
    unit: string;
}

interface VariantMatrixProps {
    product: Product;
    variantGroups: VariantGroup[];
    variants: ProductVariant[];
    onUpdate: () => void;
}

export default function VariantMatrix({ product, variantGroups, variants, onUpdate }: VariantMatrixProps) {
    const [matrixData, setMatrixData] = useState<any[]>([]);
    const [editingVariant, setEditingVariant] = useState<number | null>(null);
    const [bulkEditData, setBulkEditData] = useState({
        price: product.price,
        cost_price: product.cost_price,
        stock: product.stock,
    });
    const [deleteVariantTarget, setDeleteVariantTarget] = useState<{ id: number; index: number } | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [statusType, setStatusType] = useState<'success' | 'info' | 'error'>('info');

    // Generate matrix based on variant groups
    useEffect(() => {
        if (variantGroups.length === 0) {
            setMatrixData([]);
            return;
        }

        // Generate all combinations
        const combinations = generateCombinations(variantGroups);
        const matrix = combinations.map((combination: any, index: number) => {
            const existingVariant = variants.find((v) => JSON.stringify(v.combination) === JSON.stringify(combination));

            return {
                index,
                combination,
                formatted_combination: Object.values(combination).join(' / '),
                sku: existingVariant?.sku || generateSKU(product.name, combination),
                barcode: existingVariant?.barcode || '',
                price: existingVariant?.price || product.price,
                cost_price: existingVariant?.cost_price || product.cost_price,
                stock: existingVariant?.stock || product.stock,
                unit: existingVariant?.unit || product.unit,
                is_active: existingVariant?.is_active !== false,
                exists: !!existingVariant,
                id: existingVariant?.id,
            };
        });

        setMatrixData(matrix);
    }, [variantGroups, variants, product]);

    const generateCombinations = (groups: VariantGroup[]): any[] => {
        let combinations: any[] = [{}];

        groups.forEach((group: any) => {
            const activeOptions = group.options.filter((opt: any) => opt.is_active);
            let temp: any[] = [];

            combinations.forEach((combination: any) => {
                activeOptions.forEach((option: any) => {
                    const newCombination = { ...combination };
                    newCombination[group.type] = option.value;
                    temp.push(newCombination);
                });
            });

            if (temp.length === 0) {
                activeOptions.forEach((option: any) => {
                    const newCombination: any = {};
                    newCombination[group.type] = option.value;
                    temp.push(newCombination);
                });
            }

            combinations.splice(0, combinations.length);
            combinations.push(...temp);
        });

        return combinations;
    };

    const generateSKU = (productName: string, combination: any) => {
        const productCode = productName
            .replace(/[^a-zA-Z0-9]/g, '')
            .substring(0, 8)
            .toUpperCase();
        const variantCode = Object.values(combination)
            .map((v: any) => v.substring(0, 3).toUpperCase())
            .join('-');
        return `${productCode}-${variantCode}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    };

    const handleBulkUpdate = (field: string, value: any) => {
        setBulkEditData((prev: any) => ({ ...prev, [field]: value }));

        // Update all new variants in matrix
        const updatedMatrix = matrixData.map((item: any) => {
            if (!item.exists) {
                return { ...item, [field]: value };
            }
            return item;
        });
        setMatrixData(updatedMatrix);
    };

    const handleCellUpdate = (index: number, field: string, value: any) => {
        const updatedMatrix = [...matrixData];
        updatedMatrix[index] = { ...updatedMatrix[index], [field]: value };
        setMatrixData(updatedMatrix);
    };

    const handleSaveVariant = (index: number) => {
        const variant = matrixData[index];

        if (variant.exists) {
            // Update existing variant
            router.put(
                `/products/${product.id}/variants/${variant.id}`,
                {
                    sku: variant.sku,
                    barcode: variant.barcode,
                    price: variant.price,
                    cost_price: variant.cost_price,
                    stock: variant.stock,
                    unit: variant.unit,
                    is_active: variant.is_active,
                },
                {
                    onSuccess: () => {
                        setEditingVariant(null);
                        onUpdate();
                    },
                },
            );
        } else {
            // Create new variant
            router.post(
                `/products/${product.id}/variants`,
                {
                    sku: variant.sku,
                    barcode: variant.barcode,
                    price: variant.price,
                    cost_price: variant.cost_price,
                    stock: variant.stock,
                    unit: variant.unit,
                    combination: variant.combination,
                    combination_hash: btoa(JSON.stringify(variant.combination)),
                },
                {
                    onSuccess: () => {
                        setEditingVariant(null);
                        onUpdate();
                    },
                },
            );
        }
    };

    const handleDeleteVariant = (index: number) => {
        const variant = matrixData[index];

        if (variant.exists && variant.id) {
            setDeleteVariantTarget({ id: variant.id, index });
            return;
        }

        // Remove from matrix
        const updatedMatrix = matrixData.filter((_: any, i: number) => i !== index);
        setMatrixData(updatedMatrix);
    };

    const handleConfirmDeleteVariant = () => {
        if (!deleteVariantTarget) {
            return;
        }

        const { id } = deleteVariantTarget;
        router.delete(`/products/${product.id}/variants/${id}`, {
            onSuccess: () => {
                onUpdate();
            },
        });
        setDeleteVariantTarget(null);
    };

    const handleSaveAll = () => {
        const variantsToSave = matrixData.filter((v: any) => !v.exists);

        if (variantsToSave.length === 0) {
            setStatusType('info');
            setStatusMessage('Tidak ada variant baru untuk disimpan');
            return;
        }

        // Save all new variants
        variantsToSave.forEach((variant: any, index: number) => {
            setTimeout(() => {
                router.post(`/products/${product.id}/variants`, {
                    sku: variant.sku,
                    barcode: variant.barcode,
                    price: variant.price,
                    cost_price: variant.cost_price,
                    stock: variant.stock,
                    unit: variant.unit,
                    combination: variant.combination,
                    combination_hash: btoa(JSON.stringify(variant.combination)),
                });
            }, index * 100);
        });

        setTimeout(
            () => {
                onUpdate();
                setStatusType('success');
                setStatusMessage(`${variantsToSave.length} variant berhasil disimpan`);
            },
            variantsToSave.length * 100 + 500,
        );
    };

    if (variantGroups.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="text-muted-foreground mb-4 h-12 w-12" />
                    <h3 className="mb-2 text-lg font-semibold">Belum Ada Variant Groups</h3>
                    <p className="text-muted-foreground text-center">Tambahkan variant groups terlebih dahulu untuk membuat matrix</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Variant Matrix ({matrixData.length} combinations)
                        </CardTitle>
                        <CardDescription>Kelola semua kombinasi variant dalam bentuk matrix</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSaveAll}
                            disabled={matrixData.filter((v: any) => !v.exists).length === 0}
                            className="gap-2"
                        >
                            <Save className="h-4 w-4" />
                            Save All New
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Bulk Edit Controls */}
                <div className="bg-muted/50 mb-4 rounded-lg p-4">
                    <h4 className="mb-3 font-medium">Bulk Edit (New Variants Only)</h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="bulk_price">Harga Jual</Label>
                            <Input
                                id="bulk_price"
                                type="number"
                                value={bulkEditData.price}
                                onChange={(e) => handleBulkUpdate('price', Number(e.target.value))}
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bulk_cost">Harga Modal</Label>
                            <Input
                                id="bulk_cost"
                                type="number"
                                value={bulkEditData.cost_price}
                                onChange={(e) => handleBulkUpdate('cost_price', Number(e.target.value))}
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bulk_stock">Stok</Label>
                            <Input
                                id="bulk_stock"
                                type="number"
                                value={bulkEditData.stock}
                                onChange={(e) => handleBulkUpdate('stock', Number(e.target.value))}
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                {statusMessage && (
                    <div
                        className={`mb-4 rounded-lg border p-4 text-sm ${
                            statusType === 'success'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : statusType === 'error'
                                  ? 'border-destructive/30 bg-destructive/10 text-destructive'
                                  : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                    >
                        {statusMessage}
                    </div>
                )}

                {/* Matrix Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-muted-foreground bg-muted/50 border-b text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Kombinasi</th>
                                <th className="px-6 py-4 font-semibold">SKU</th>
                                <th className="px-6 py-4 font-semibold">Barcode</th>
                                <th className="px-6 py-4 font-semibold">Harga Jual</th>
                                <th className="px-6 py-4 font-semibold">Harga Modal</th>
                                <th className="px-6 py-4 font-semibold">Stok</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {matrixData.map((variant: any, index: number) => (
                                <tr key={index} className={variant.exists ? 'bg-green-50' : ''}>
                                    <td className="px-6 py-4 font-medium">
                                        <div className="flex items-center gap-2">
                                            {Object.entries(variant.combination).map(([key, value]) => {
                                                const group = variantGroups.find((g: any) => g.type === key);
                                                const option = group?.options.find((o: any) => o.value === value);

                                                return (
                                                    <Badge
                                                        key={key}
                                                        variant="outline"
                                                        className="text-xs"
                                                        style={
                                                            option?.color_code
                                                                ? {
                                                                      backgroundColor: option.color_code + '20',
                                                                      borderColor: option.color_code,
                                                                      color: option.color_code,
                                                                  }
                                                                : {}
                                                        }
                                                    >
                                                        {value}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Input
                                            value={variant.sku}
                                            onChange={(e) => handleCellUpdate(index, 'sku', e.target.value)}
                                            disabled={variant.exists}
                                            className="text-xs"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Input
                                            value={variant.barcode}
                                            onChange={(e) => handleCellUpdate(index, 'barcode', e.target.value)}
                                            disabled={variant.exists}
                                            className="text-xs"
                                            placeholder="Auto-generate"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Input
                                            type="number"
                                            value={variant.price}
                                            onChange={(e) => handleCellUpdate(index, 'price', Number(e.target.value))}
                                            disabled={variant.exists}
                                            className="text-xs"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Input
                                            type="number"
                                            value={variant.cost_price}
                                            onChange={(e) => handleCellUpdate(index, 'cost_price', Number(e.target.value))}
                                            disabled={variant.exists}
                                            className="text-xs"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Input
                                            type="number"
                                            value={variant.stock}
                                            onChange={(e) => handleCellUpdate(index, 'stock', Number(e.target.value))}
                                            disabled={variant.exists}
                                            className="text-xs"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        {variant.exists ? (
                                            <Badge variant="default" className="text-xs">
                                                Exists
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="text-xs">
                                                vs
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1">
                                            {variant.exists ? (
                                                <Button variant="outline" size="sm" onClick={() => setEditingVariant(index)} className="gap-1">
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                            ) : (
                                                <Button variant="outline" size="sm" onClick={() => handleSaveVariant(index)} className="gap-1">
                                                    <Save className="h-3 w-3" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteVariant(index)}
                                                className="text-destructive hover:text-destructive gap-1"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <AlertDialog
                    open={deleteVariantTarget !== null}
                    onOpenChange={(open) => {
                        if (!open) setDeleteVariantTarget(null);
                    }}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Variant?</AlertDialogTitle>
                            <AlertDialogDescription>Variant ini akan dihapus secara permanen. Apakah Anda yakin?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmDeleteVariant} className="bg-destructive hover:bg-destructive/90 text-white">
                                Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}
