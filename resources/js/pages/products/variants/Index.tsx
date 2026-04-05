import EditVariantDialog from '@/components/EditVariantDialog';
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
import { Skeleton } from '@/components/ui/skeleton';
import VariantCard from '@/components/VariantCard';
import VariantImageUpload from '@/components/VariantImageUpload';
import VariantImportExport from '@/components/VariantImportExport';
import VariantManager from '@/components/VariantManager';
import VariantMatrix from '@/components/VariantMatrix';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, Package, QrCode } from 'lucide-react';
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
        title: 'Data Produk',
        href: '/products',
    },
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
                        <Badge variant={product.has_variants ? 'default' : 'secondary'}>
                            {product.has_variants ? 'Has Variants' : 'No Variants'}
                        </Badge>
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
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Generated Variants ({variants.length})
                            </CardTitle>
                            <CardDescription>Kombinasi variant yang telah dibuat dari groups di atas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {variants.map((variant) => (
                                    <VariantCard
                                        key={variant.id}
                                        variant={variant}
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

                {/* Variant Image Upload Section */}
                {variants && variants.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Upload Gambar Variant
                            </CardTitle>
                            <CardDescription>Upload gambar untuk setiap variant produk</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {variants.map((variant) => (
                                    <VariantImageUpload
                                        key={variant.id}
                                        product={product}
                                        variant={variant}
                                        onUpdate={() => router.reload({ preserveScroll: true })}
                                    />
                                ))}
                            </div>
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
