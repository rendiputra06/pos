import EditVariantDialog from '@/components/EditVariantDialog';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import VariantCard from '@/components/VariantCard';
import VariantImportExport from '@/components/VariantImportExport';
import VariantManager from '@/components/VariantManager';
import VariantMatrix from '@/components/VariantMatrix';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, Package, QrCode, Power, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface Product {
    id: number;
    name: string;
    sku: string;
    has_variants: boolean;
    price: number;
    cost_price: number;
    stock: number;
    unit: string;
}

interface VariantGroup {
    id: number;
    name: string;
    type: string;
    is_required: boolean;
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

interface Props {
    product: Product;
    variantGroups?: VariantGroup[];
    variants?: ProductVariant[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Produk (ATK)',
        href: '/products',
    },
    {
        title: 'Variants',
        href: '#',
    },
];

export default function VariantIndex({ product, variantGroups = [], variants = [] }: Props) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        description: string;
        confirmLabel: string;
        onConfirm: (() => void) | null;
    }>({
        open: false,
        title: '',
        description: '',
        confirmLabel: 'Ya',
        onConfirm: null,
    });

    const [selectedVariants, setSelectedVariants] = useState<number[]>([]);

    const openConfirmDialog = (title: string, description: string, onConfirm: () => void, confirmLabel = 'Ya') => {
        setConfirmDialog({
            open: true,
            title,
            description,
            confirmLabel,
            onConfirm,
        });
    };

    const handleConfirmDialog = () => {
        setConfirmDialog((current) => {
            current.onConfirm?.();
            return { ...current, open: false, onConfirm: null };
        });
    };

    const handleDeleteVariant = (variantId: number) => {
        openConfirmDialog(
            'Hapus Variant?',
            'Variant ini akan dihapus secara permanen.',
            () => {
                setIsLoading(true);
                router.delete(`/products/${product.id}/variants/${variantId}`, {
                    onFinish: () => setIsLoading(false),
                });
            },
            'Hapus',
        );
    };

    const handleEditVariant = (variantId: number) => {
        const variant = variants?.find((v) => v.id === variantId);
        if (variant) {
            setEditingVariant(variant);
            setIsEditDialogOpen(true);
        }
    };

    const handleSaveVariant = (variantId: number, data: any) => {
        setIsLoading(true);
        router.put(
            `/products/${product.id}/variants/${variantId}`,
            {
                price: data.price,
                stock: data.stock,
                cost_price: data.cost_price,
            },
            {
                onSuccess: () => {
                    setIsEditDialogOpen(false);
                    setEditingVariant(null);
                    router.reload({ preserveScroll: true });
                },
                onError: (errors) => {
                    console.error('Error updating variant:', errors);
                    // You can show an alert or set error state here
                },
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleToggleVariantStatus = (variantId: number) => {
        const variant = variants?.find((v) => v.id === variantId);
        if (variant) {
            const newStatus = !variant.is_active;
            const action = newStatus ? 'mengaktifkan' : 'menonaktifkan';
            openConfirmDialog(
                `${action.charAt(0).toUpperCase() + action.slice(1)} Variant?`,
                `Apakah Anda yakin ingin ${action} variant ini?`,
                () => {
                    setIsLoading(true);
                    router.put(
                        `/products/${product.id}/variants/${variantId}`,
                        {
                            is_active: newStatus,
                        },
                        {
                            onSuccess: () => router.reload({ preserveScroll: true }),
                            onFinish: () => setIsLoading(false),
                        },
                    );
                },
                action === 'mengaktifkan' ? 'Aktifkan' : 'Nonaktifkan',
            );
        }
    };

    const handleGenerateBarcode = (variantId: number) => {
        router.post(
            `/products/${product.id}/variants/${variantId}/barcode`,
            {},
            {
                onSuccess: () => {
                    router.reload({ preserveScroll: true });
                },
            },
        );
    };

    const handleGenerateAllBarcodes = () => {
        router.post(
            `/products/${product.id}/variants/barcodes`,
            {},
            {
                onSuccess: () => {
                    router.reload({ preserveScroll: true });
                },
            },
        );
    };

    // Bulk operations
    const toggleVariantSelection = (variantId: number) => {
        setSelectedVariants((prev) =>
            prev.includes(variantId)
                ? prev.filter((id) => id !== variantId)
                : [...prev, variantId]
        );
    };

    const selectAllVariants = () => {
        if (selectedVariants.length === variants.length) {
            setSelectedVariants([]);
        } else {
            setSelectedVariants(variants.map((v) => v.id));
        }
    };

    const clearSelection = () => {
        setSelectedVariants([]);
    };

    const handleBulkDelete = () => {
        if (selectedVariants.length === 0) return;

        openConfirmDialog(
            'Hapus Variant Terpilih?',
            `${selectedVariants.length} variant akan dihapus secara permanen.`,
            () => {
                setIsLoading(true);
                router.post(
                    `/products/${product.id}/variants/bulk-delete`,
                    { variant_ids: selectedVariants },
                    {
                        onSuccess: () => {
                            setSelectedVariants([]);
                            router.reload({ preserveScroll: true });
                        },
                        onFinish: () => setIsLoading(false),
                    }
                );
            },
            'Hapus'
        );
    };

    const handleBulkActivate = () => {
        if (selectedVariants.length === 0) return;

        setIsLoading(true);
        router.post(
            `/products/${product.id}/variants/bulk-toggle`,
            { variant_ids: selectedVariants, is_active: true },
            {
                onSuccess: () => {
                    setSelectedVariants([]);
                    router.reload({ preserveScroll: true });
                },
                onFinish: () => setIsLoading(false),
            }
        );
    };

    const handleBulkDeactivate = () => {
        if (selectedVariants.length === 0) return;

        setIsLoading(true);
        router.post(
            `/products/${product.id}/variants/bulk-toggle`,
            { variant_ids: selectedVariants, is_active: false },
            {
                onSuccess: () => {
                    setSelectedVariants([]);
                    router.reload({ preserveScroll: true });
                },
                onFinish: () => setIsLoading(false),
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Variants - ${product.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <Link href="/products">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <ChevronLeft className="h-4 w-4" />
                                    Kembali
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold tracking-tight">Variants: {product.name}</h1>
                        </div>
                        <p className="text-muted-foreground">Kelola variant groups dan kombinasi untuk produk ini</p>
                    </div>
                    <div className="flex gap-2">
                        {variants && variants.length > 0 && (
                            <Button variant="outline" size="sm" onClick={handleGenerateAllBarcodes} className="gap-2">
                                <QrCode className="h-4 w-4" />
                                Generate All Barcodes
                            </Button>
                        )}
                    </div>
                </div>

                {/* Variant Groups Management */}
                <VariantManager product={product} variantGroups={variantGroups || []} />

                {/* Variant Matrix */}
                {variantGroups && variantGroups.length > 0 && (
                    <VariantMatrix
                        product={product}
                        variantGroups={variantGroups}
                        variants={variants}
                        onUpdate={() => router.reload({ preserveScroll: true })}
                    />
                )}

                {/* Generated Variants */}
                {variants && variants.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Generated Variants ({variants.length})
                                    </CardTitle>
                                    {/* Bulk Selection Controls */}
                                    <div className="flex items-center gap-2 border-l pl-3">
                                        <Checkbox
                                            id="select-all"
                                            checked={selectedVariants.length === variants.length && variants.length > 0}
                                            onCheckedChange={selectAllVariants}
                                        />
                                        <label htmlFor="select-all" className="text-sm cursor-pointer">
                                            {selectedVariants.length > 0
                                                ? `${selectedVariants.length} selected`
                                                : 'Select All'}
                                        </label>
                                    </div>
                                </div>
                                <CardDescription>Kombinasi variant yang telah dibuat</CardDescription>
                            </div>

                            {/* Bulk Actions Toolbar */}
                            {selectedVariants.length > 0 && (
                                <div className="mt-4 flex items-center gap-2 rounded-lg border bg-muted/50 p-2">
                                    <span className="text-sm font-medium px-2">{selectedVariants.length} dipilih:</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleBulkActivate}
                                        className="gap-2"
                                    >
                                        <Power className="h-4 w-4 text-green-500" />
                                        Aktifkan
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleBulkDeactivate}
                                        className="gap-2"
                                    >
                                        <Power className="h-4 w-4 text-gray-500" />
                                        Nonaktifkan
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleBulkDelete}
                                        className="gap-2 text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Hapus
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearSelection}
                                        className="ml-auto gap-2"
                                    >
                                        <X className="h-4 w-4" />
                                        Batal
                                    </Button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {variants.map((variant) => (
                                    <VariantCard
                                        key={variant.id}
                                        variant={variant}
                                        productId={product.id}
                                        isSelected={selectedVariants.includes(variant.id)}
                                        onToggleSelection={() => toggleVariantSelection(variant.id)}
                                        onEdit={handleEditVariant}
                                        onToggleStatus={handleToggleVariantStatus}
                                        onDelete={handleDeleteVariant}
                                        onGenerateBarcode={handleGenerateBarcode}
                                        onViewBarcode={(variantId) => {
                                            window.open(`/products/${product.id}/barcode?variant=${variantId}`, '_blank');
                                        }}
                                        isLoading={isLoading}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Loading State */}
                {isLoading && (
                    <Card>
                        <CardContent className="p-6">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="space-y-4">
                                        <Skeleton className="mx-auto h-32 w-32 rounded-lg" />
                                        <Skeleton className="mx-auto h-4 w-3/4" />
                                        <Skeleton className="mx-auto h-4 w-1/2" />
                                        <div className="flex justify-center gap-2">
                                            <Skeleton className="h-8 w-8" />
                                            <Skeleton className="h-8 w-8" />
                                            <Skeleton className="h-8 w-8" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State for Variants */}
                {variantGroups && variantGroups.length > 0 && variants.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Package className="text-muted-foreground mb-4 h-12 w-12" />
                            <h3 className="mb-2 text-lg font-semibold">Belum Ada Variants</h3>
                            <p className="text-muted-foreground mb-4 text-center">Generate variants dari groups yang telah dibuat</p>
                            <Button onClick={() => router.post(`/products/${product.id}/variants/generate`)} className="gap-2">
                                Generate Variants Sekarang
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Import/Export Section */}
                <VariantImportExport product={product} variantCount={variants?.length || 0} />

                {/* Edit Variant Dialog */}
                <EditVariantDialog
                    variant={editingVariant}
                    isOpen={isEditDialogOpen}
                    onClose={() => {
                        setIsEditDialogOpen(false);
                        setEditingVariant(null);
                    }}
                    onSave={handleSaveVariant}
                    isLoading={isLoading}
                />

                <AlertDialog
                    open={confirmDialog.open}
                    onOpenChange={(open) => {
                        if (!open) {
                            setConfirmDialog((current) => ({ ...current, open: false, onConfirm: null }));
                        }
                    }}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
                            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmDialog} className="bg-destructive hover:bg-destructive/90 text-white">
                                {confirmDialog.confirmLabel}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
