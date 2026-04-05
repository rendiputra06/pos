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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { router, useForm } from '@inertiajs/react';
import { Package, Plus, Trash2, Zap } from 'lucide-react';
import { useState } from 'react';

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

interface Product {
    id: number;
    name: string;
    has_variants: boolean;
}

interface VariantManagerProps {
    product: Product;
    variantGroups: VariantGroup[];
}

const STANDARD_VARIANT_TYPES = [
    { value: 'size', label: 'Ukuran' },
    { value: 'color', label: 'Warna' },
    { value: 'material', label: 'Material' },
];

export default function VariantManager({ product, variantGroups }: VariantManagerProps) {
    const [showAddGroupDialog, setShowAddGroupDialog] = useState(false);
    const [showAddOptionDialog, setShowAddOptionDialog] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<VariantGroup | null>(null);

    const {
        data: groupData,
        setData: setGroupData,
        post: postGroup,
        processing: groupProcessing,
    } = useForm({
        name: '',
        type: '',
        is_required: false,
    });

    const {
        data: optionData,
        setData: setOptionData,
        post: postOption,
        processing: optionProcessing,
    } = useForm({
        value: '',
        display_value: '',
        color_code: '',
    });

    const handleAddGroup = () => {
        postGroup(`/products/${product.id}/variants/groups`, {
            onSuccess: () => {
                setShowAddGroupDialog(false);
                setGroupData({ name: '', type: '', is_required: false });
            },
        });
    };

    const handleAddOption = () => {
        if (!selectedGroup) return;

        postOption(`/products/${product.id}/variants/groups/${selectedGroup.id}/options`, {
            onSuccess: () => {
                setShowAddOptionDialog(false);
                setOptionData({ value: '', display_value: '', color_code: '' });
                setSelectedGroup(null);
            },
        });
    };

    const handleGenerateVariants = () => {
        router.post(
            `/products/${product.id}/variants/generate`,
            {},
            {
                onSuccess: () => {
                    router.reload();
                },
            },
        );
    };

    const [deleteGroupId, setDeleteGroupId] = useState<number | null>(null);
    const [deleteOptionTarget, setDeleteOptionTarget] = useState<{ groupId: number; optionId: number; label: string } | null>(null);

    const handleDeleteGroup = (groupId: number) => {
        setDeleteGroupId(groupId);
    };

    const handleConfirmDeleteGroup = () => {
        if (deleteGroupId !== null) {
            router.delete(`/products/${product.id}/variants/groups/${deleteGroupId}`);
            setDeleteGroupId(null);
        }
    };

    const handleDeleteOption = (groupId: number, optionId: number, label: string) => {
        setDeleteOptionTarget({ groupId, optionId, label });
    };

    const handleConfirmDeleteOption = () => {
        if (deleteOptionTarget) {
            router.delete(`/products/${product.id}/variants/groups/${deleteOptionTarget.groupId}/options/${deleteOptionTarget.optionId}`);
            setDeleteOptionTarget(null);
        }
    };

    const toggleOption = (groupId: number, optionId: number, isActive: boolean): void => {
        router.put(`/products/${product.id}/variants/groups/${groupId}/options/${optionId}`, {
            is_active: isActive,
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Variant Management</h3>
                    <p className="text-muted-foreground text-sm">Kelola variant groups dan options untuk produk "{product.name}"</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={showAddGroupDialog} onOpenChange={setShowAddGroupDialog}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Tambah Group
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Variant Group</DialogTitle>
                                <DialogDescription>Tambah group variant baru untuk produk ini</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Group</Label>
                                    <Input
                                        id="name"
                                        placeholder="Contoh: Ukuran, Warna, Material"
                                        value={groupData.name}
                                        onChange={(e) => setGroupData('name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Tipe Variant</Label>
                                    <Select value={groupData.type} onValueChange={(value) => setGroupData('type', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih tipe variant" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STANDARD_VARIANT_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_required"
                                        checked={groupData.is_required}
                                        onCheckedChange={(checked: boolean) => setGroupData('is_required', checked)}
                                    />
                                    <Label htmlFor="is_required">Wajib diisi</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowAddGroupDialog(false)}>
                                    Batal
                                </Button>
                                <Button onClick={handleAddGroup} disabled={groupProcessing || !groupData.name || !groupData.type}>
                                    {groupProcessing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button onClick={handleGenerateVariants} disabled={variantGroups.length === 0} className="gap-2">
                        <Zap className="h-4 w-4" />
                        Generate Variants
                    </Button>
                </div>
            </div>

            {/* Variant Groups */}
            {variantGroups.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="text-muted-foreground mb-4 h-12 w-12" />
                        <h3 className="mb-2 text-lg font-semibold">Belum Ada Variant Groups</h3>
                        <p className="text-muted-foreground mb-4 text-center">Tambahkan variant groups untuk mulai membuat kombinasi produk</p>
                        <Button onClick={() => setShowAddGroupDialog(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Tambah Group Pertama
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {variantGroups.map((group) => (
                        <Card key={group.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {group.name}
                                            {group.is_required && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Wajib
                                                </Badge>
                                            )}
                                        </CardTitle>
                                        <CardDescription>Tipe: {STANDARD_VARIANT_TYPES.find((t) => t.value === group.type)?.label}</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedGroup(group);
                                                setShowAddOptionDialog(true);
                                            }}
                                            className="gap-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Tambah Option
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteGroup(group.id)}
                                            className="text-destructive hover:text-destructive gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {group.options.length === 0 ? (
                                        <p className="text-muted-foreground py-4 text-center">Belum ada options untuk group ini</p>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                            {group.options.map((option) => (
                                                <div
                                                    key={option.id}
                                                    className={`flex items-center justify-between rounded-lg border p-3 ${
                                                        !option.is_active ? 'opacity-50' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {option.color_code && (
                                                            <div
                                                                className="h-4 w-4 rounded-full border"
                                                                style={{ backgroundColor: option.color_code }}
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="font-medium">{option.display_value}</div>
                                                            <div className="text-muted-foreground text-sm">{option.value}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Switch
                                                            checked={option.is_active}
                                                            onCheckedChange={(checked: boolean) => toggleOption(group.id, option.id, checked)}
                                                            size="sm"
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteOption(group.id, option.id, option.display_value)}
                                                            className="text-destructive hover:text-destructive h-8 w-8"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <AlertDialog
                open={deleteGroupId !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteGroupId(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Variant Group?</AlertDialogTitle>
                        <AlertDialogDescription>Variant group akan dihapus beserta konfigurasi group-nya.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDeleteGroup} className="bg-destructive hover:bg-destructive/90 text-white">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={deleteOptionTarget !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteOptionTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Option?</AlertDialogTitle>
                        <AlertDialogDescription>Option "{deleteOptionTarget?.label}" akan dihapus dari group.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDeleteOption} className="bg-destructive hover:bg-destructive/90 text-white">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Add Option Dialog */}
            <Dialog open={showAddOptionDialog} onOpenChange={setShowAddOptionDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Option</DialogTitle>
                        <DialogDescription>Tambah option baru untuk "{selectedGroup?.name}"</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="option_value">Value</Label>
                            <Input
                                id="option_value"
                                placeholder="Contoh: S, M, L"
                                value={optionData.value}
                                onChange={(e) => setOptionData('value', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="option_display_value">Display Value</Label>
                            <Input
                                id="option_display_value"
                                placeholder="Contoh: Small, Medium, Large"
                                value={optionData.display_value}
                                onChange={(e) => setOptionData('display_value', e.target.value)}
                            />
                        </div>
                        {selectedGroup?.type === 'color' && (
                            <div className="space-y-2">
                                <Label htmlFor="color_code">Color Code</Label>
                                <Input
                                    id="color_code"
                                    type="color"
                                    value={optionData.color_code}
                                    onChange={(e) => setOptionData('color_code', e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddOptionDialog(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleAddOption} disabled={optionProcessing || !optionData.value || !optionData.display_value}>
                            {optionProcessing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
