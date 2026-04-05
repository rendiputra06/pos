import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { Camera, Image as ImageIcon, Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface ProductVariant {
    id: number;
    sku: string;
    combination: Record<string, string>;
    formatted_combination: string;
    thumbnail_url?: string | null;
    medium_url?: string | null;
    original_url?: string | null;
}

interface Product {
    id: number;
    name: string;
}

interface VariantImageUploadProps {
    product: Product;
    variant: ProductVariant;
    onUpdate: () => void;
}

export default function VariantImageUpload({ product, variant, onUpdate }: VariantImageUploadProps) {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(variant.thumbnail_url || null);
    const [isDragging, setIsDragging] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setErrorMessage(null);

            if (!file.type.startsWith('image/')) {
                setErrorMessage('File harus berupa gambar (JPEG, PNG, WebP)');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                setErrorMessage('Ukuran file maksimal 2MB');
                return;
            }

            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            setErrorMessage(null);
            if (!file.type.startsWith('image/')) {
                setErrorMessage('File harus berupa gambar (JPEG, PNG, WebP)');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                setErrorMessage('Ukuran file maksimal 2MB');
                return;
            }

            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleUpload = () => {
        if (!imageFile) return;

        setIsUploading(true);
        setErrorMessage(null);

        const formData = new FormData();
        formData.append('image', imageFile);

        router.post(`/products/${product.id}/variants/${variant.id}/image`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setImageFile(null);
                setPreview(null);
                router.reload({ preserveScroll: true });
            },
            onError: (errors: any) => {
                console.error('Upload error:', errors);
                setErrorMessage('Gagal mengupload gambar. Pastikan file sesuai format dan ukuran.');
            },
            onFinish: () => {
                setIsUploading(false);
            },
        });
    };

    const handleRemove = () => {
        if (variant.thumbnail_url) {
            router.delete(`/products/${product.id}/variants/${variant.id}/image`, {
                preserveScroll: true,
                onSuccess: () => {
                    setPreview(null);
                    setImageFile(null);
                    router.reload({ preserveScroll: true });
                },
            });
        } else {
            setPreview(null);
            setImageFile(null);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Camera className="h-4 w-4" />
                    Gambar Variant
                </CardTitle>
                <CardDescription className="text-xs">{variant.formatted_combination}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Image Preview */}
                <div className="relative">
                    {preview ? (
                        <div className="group relative">
                            <img src={preview} alt={`${variant.sku} preview`} className="h-48 w-full rounded-lg border object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                <Button variant="destructive" size="sm" onClick={handleRemove} className="gap-2">
                                    <X className="h-4 w-4" />
                                    Hapus
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={`flex h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                                isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'
                            }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <ImageIcon className="text-muted-foreground mb-2 h-8 w-8" />
                            <p className="text-muted-foreground px-4 text-center text-sm">Drag & drop gambar atau klik untuk memilih</p>
                            <p className="text-muted-foreground mt-1 text-xs">JPEG, PNG, WebP (max 2MB)</p>
                        </div>
                    )}

                    {/* Hidden File Input */}
                    <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
                </div>
                {errorMessage && (
                    <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">{errorMessage}</div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {imageFile ? (
                        <>
                            <Button onClick={handleUpload} disabled={isUploading} className="flex-1 gap-2">
                                <Upload className="h-4 w-4" />
                                {isUploading ? 'Mengupload...' : 'Upload'}
                            </Button>
                            <Button variant="outline" onClick={handleRemove} className="gap-2">
                                <X className="h-4 w-4" />
                                Batal
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full gap-2">
                            <Upload className="h-4 w-4" />
                            Pilih Gambar
                        </Button>
                    )}
                </div>

                {/* Info */}
                <div className="text-muted-foreground space-y-1 text-xs">
                    <p>• Format: JPEG, PNG, WebP</p>
                    <p>• Ukuran maksimal: 2MB</p>
                    <p>• Resolusi optimal: 800x800px</p>
                </div>
            </CardContent>
        </Card>
    );
}
