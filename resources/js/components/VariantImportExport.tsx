import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { router, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Download, FileSpreadsheet, Upload } from 'lucide-react';
import React, { useState } from 'react';

interface Product {
    id: number;
    name: string;
    sku: string;
    has_variants: boolean;
}

interface VariantImportExportProps {
    product: Product;
    variantCount: number;
}

export default function VariantImportExport({ product, variantCount }: VariantImportExportProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [validationMessage, setValidationMessage] = useState<string | null>(null);

    const { post, processing } = useForm();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setValidationMessage(null);
            const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
            if (!validTypes.includes(selectedFile.type)) {
                setValidationMessage('File harus berupa Excel (.xlsx, .xls) atau CSV (.csv)');
                return;
            }

            if (selectedFile.size > 10 * 1024 * 1024) {
                setValidationMessage('Ukuran file maksimal 10MB');
                return;
            }

            setFile(selectedFile);
            setImportStatus('idle');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setValidationMessage(null);
            const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
            if (!validTypes.includes(droppedFile.type)) {
                setValidationMessage('File harus berupa Excel (.xlsx, .xls) atau CSV (.csv)');
                return;
            }

            if (droppedFile.size > 10 * 1024 * 1024) {
                setValidationMessage('Ukuran file maksimal 10MB');
                return;
            }

            setFile(droppedFile);
            setImportStatus('idle');
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

    const handleImport = () => {
        if (!file) return;

        setImportStatus('processing');

        const formData = new FormData();
        formData.append('file', file);

        post(`/products/${product.id}/variants/import`, formData, {
            onSuccess: () => {
                setImportStatus('success');
                setFile(null);
                setTimeout(() => {
                    setImportStatus('idle');
                    router.reload();
                }, 2000);
            },
            onError: (errors: any) => {
                setImportStatus('error');
                console.error('Import error:', errors);
                setTimeout(() => {
                    setImportStatus('idle');
                }, 3000);
            },
            forceFormData: true,
        });
    };

    const handleExport = () => {
        window.open(`/products/${product.id}/variants/export`, '_blank');
    };

    const handleDownloadTemplate = () => {
        window.open(`/products/${product.id}/variants/template`, '_blank');
    };

    const removeFile = () => {
        setFile(null);
        setImportStatus('idle');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5" />
                    Import/Export Variants
                </CardTitle>
                <CardDescription>Kelola variants dalam batch menggunakan Excel files</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Export Section */}
                <div className="space-y-4">
                    <h4 className="font-medium">Export Variants</h4>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExport} disabled={variantCount === 0} className="gap-2">
                            <Download className="h-4 w-4" />
                            Export {variantCount} Variants
                        </Button>
                        <Button variant="outline" onClick={handleDownloadTemplate} className="gap-2">
                            <Download className="h-4 w-4" />
                            Download Template
                        </Button>
                    </div>
                    {variantCount === 0 && (
                        <p className="text-muted-foreground text-sm">Tidak ada variants untuk diexport. Buat variants terlebih dahulu.</p>
                    )}
                </div>

                {/* Import Section */}
                <div className="space-y-4">
                    <h4 className="font-medium">Import Variants</h4>

                    {/* File Upload Area */}
                    <div
                        className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />

                        <div className="space-y-2">
                            <Upload className="text-muted-foreground mx-auto h-8 w-8" />
                            <div>
                                <p className="text-sm font-medium">{file ? file.name : 'Drag & drop file Excel atau klik untuk memilih'}</p>
                                <p className="text-muted-foreground text-xs">.xlsx, .xls, .csv (max 10MB)</p>
                            </div>
                        </div>
                    </div>

                    {validationMessage && (
                        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {validationMessage}
                        </div>
                    )}

                    {/* File Info & Actions */}
                    {file && (
                        <div className="bg-muted flex items-center justify-between rounded-lg p-3">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="text-muted-foreground h-4 w-4" />
                                <span className="text-sm font-medium">{file.name}</span>
                                <span className="text-muted-foreground text-xs">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={removeFile}>
                                    Hapus
                                </Button>
                                <Button onClick={handleImport} disabled={processing || importStatus === 'processing'} className="gap-2">
                                    <Upload className="h-4 w-4" />
                                    {processing || importStatus === 'processing' ? 'Importing...' : 'Import'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Status Messages */}
                    {importStatus === 'success' && (
                        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-800">Import berhasil! Data sedang di-refresh...</span>
                        </div>
                    )}

                    {importStatus === 'error' && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-red-800">Import gagal. Periksa format file dan data Anda.</span>
                        </div>
                    )}
                </div>

                {/* Import Instructions */}
                <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h5 className="font-medium text-blue-800">Petunjuk Import:</h5>
                    <ul className="space-y-1 text-sm text-blue-700">
                        <li>• Download template untuk format yang benar</li>
                        <li>• variant_sku harus unik untuk setiap variant</li>
                        <li>• combination format: "Size / Color / Material" (pisahkan dengan /)</li>
                        <li>• Atau gunakan kolom size, color, material terpisah</li>
                        <li>• is_active: YES/NO, TRUE/FALSE, 1/0</li>
                        <li>• Barcode akan auto-generate jika kosong</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
