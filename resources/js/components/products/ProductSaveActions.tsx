import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package, PackagePlus, Plus, Save } from 'lucide-react';

interface ProductSaveActionsProps {
    processing: boolean;
    isEdit: boolean;
    hasVariants: boolean;
    productId?: number;
    onSave: (e: React.FormEvent) => void;
    onSaveAndInputVariants: (e: React.FormEvent) => void;
    onSaveAndAddAnother: (e: React.FormEvent) => void;
    onManageVariants: () => void;
}

export default function ProductSaveActions({
    processing,
    isEdit,
    hasVariants,
    productId,
    onSave,
    onSaveAndInputVariants,
    onSaveAndAddAnother,
    onManageVariants,
}: ProductSaveActionsProps) {
    return (
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Save className="h-5 w-5" />
                    Simpan Produk
                </CardTitle>
                <CardDescription>Pilih aksi yang ingin Anda lakukan dengan produk ini</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button type="submit" disabled={processing} className="w-full" onClick={onSave}>
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Simpan Produk
                        </>
                    )}
                </Button>

                {hasVariants && !isEdit && (
                    <Button
                        type="button"
                        variant="outline"
                        disabled={processing}
                        className="w-full"
                        onClick={onSaveAndInputVariants}
                    >
                        <PackagePlus className="mr-2 h-4 w-4" />
                        Simpan dan Input Varian
                    </Button>
                )}

                {hasVariants && isEdit && (
                    <Button
                        type="button"
                        variant="outline"
                        disabled={processing}
                        className="w-full"
                        onClick={onManageVariants}
                    >
                        <Package className="mr-2 h-4 w-4" />
                        Kelola Varian
                    </Button>
                )}

                {!isEdit && (
                    <Button
                        type="button"
                        variant="outline"
                        disabled={processing}
                        className="w-full"
                        onClick={onSaveAndAddAnother}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Simpan & Tambah Lagi
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
