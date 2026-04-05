import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Download, FileSpreadsheet, Upload } from 'lucide-react';
import React, { useState } from 'react';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete?: () => void;
}

interface ImportError {
    row: number;
    error: string;
    data: any;
}

interface ImportStats {
    total: number;
    processed: number;
    success: number;
    errors: number;
}

export default function ImportModal({ isOpen, onClose, onImportComplete }: ImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [errors, setErrors] = useState<ImportError[]>([]);
    const [importStats, setImportStats] = useState<ImportStats | null>(null);
    const [validationMessage, setValidationMessage] = useState<string | null>(null);

    const { data, setData, post, processing } = useForm({
        file: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Validate file type
            const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];

            if (!validTypes.includes(selectedFile.type)) {
                setValidationMessage('File harus berupa Excel (.xlsx, .xls) atau CSV');
                return;
            }

            // Validate file size (10MB max)
            if (selectedFile.size > 10 * 1024 * 1024) {
                setValidationMessage('Ukuran file maksimal 10MB');
                return;
            }

            setFile(selectedFile);
            setData('file', selectedFile);
            setErrors([]);
            setValidationMessage(null);
        }
    };

    const handleImport = () => {
        if (!file) return;

        setImporting(true);
        setProgress(0);
        setErrors([]);
        setImportStats(null);

        // Simulate progress
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 200);

        setData('file', file);
        post('/products/import', {
            onSuccess: (page: any) => {
                clearInterval(progressInterval);
                setProgress(100);

                // Extract errors and stats from session
                const importErrors = page.props.import_errors || [];
                const stats = page.props.import_stats || null;

                setErrors(importErrors);
                setImportStats(stats);

                setTimeout(() => {
                    setImporting(false);
                    setProgress(0);
                    setFile(null);
                    setData('file', null);
                    onImportComplete?.();

                    // Only close if no errors
                    if (importErrors.length === 0) {
                        onClose();
                    }
                }, 2000);
            },
            onError: (errors: any) => {
                clearInterval(progressInterval);
                setImporting(false);
                setProgress(0);
                console.error('Import error:', errors);
            },
        });
    };

    const downloadTemplate = () => {
        window.open('/products/import/template', '_blank');
    };

    const resetForm = () => {
        setFile(null);
        setData('file', null);
        setErrors([]);
        setProgress(0);
        setImportStats(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Import Produk dari Excel
                    </DialogTitle>
                    <DialogDescription>
                        Upload file Excel untuk menambahkan produk secara批量. Pastikan format sesuai dengan template.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Template Download */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-blue-900">Download Template</h4>
                                <p className="mt-1 text-sm text-blue-700">Download template untuk format import yang benar</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
                                <Download className="h-4 w-4" />
                                Template
                            </Button>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="file">Pilih File Excel</Label>
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                            <input
                                id="file"
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileChange}
                                className="hidden"
                                disabled={importing}
                            />
                            <label
                                htmlFor="file"
                                className={`flex cursor-pointer flex-col items-center gap-2 ${importing ? 'cursor-not-allowed opacity-50' : ''}`}
                            >
                                <Upload className="h-8 w-8 text-gray-400" />
                                <span className="text-sm text-gray-600">{file ? file.name : 'Klik untuk memilih file atau drag & drop'}</span>
                                <span className="text-xs text-gray-500">Format: .xlsx, .xls, .csv (Max: 10MB)</span>
                            </label>
                        </div>
                        {validationMessage && (
                            <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                {validationMessage}
                            </div>
                        )}
                    </div>

                    {/* Progress */}
                    {importing && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Mengimport data...</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="w-full" />
                        </div>
                    )}

                    {/* Import Stats */}
                    {importStats && (
                        <Alert className="border-blue-200 bg-blue-50">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="space-y-2">
                                <div className="font-medium text-blue-800">Import Selesai!</div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                                    <div>
                                        <span className="font-medium">Total Baris:</span> {importStats.total}
                                    </div>
                                    <div>
                                        <span className="font-medium">Diproses:</span> {importStats.processed}
                                    </div>
                                    <div>
                                        <span className="font-medium">Berhasil:</span> {importStats.success}
                                    </div>
                                    <div>
                                        <span className="font-medium">Gagal:</span> {importStats.errors}
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Import Errors */}
                    {errors.length > 0 && (
                        <Alert className="border-orange-200 bg-orange-50">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="space-y-2">
                                <div className="font-medium text-orange-800">{errors.length} produk gagal diimport:</div>
                                <div className="max-h-40 space-y-1 overflow-y-auto">
                                    {errors.slice(0, 10).map((error, index) => (
                                        <div key={index} className="border-b border-orange-200 pb-1 text-sm text-orange-700">
                                            <div className="font-medium">Baris {error.row}:</div>
                                            <div>{error.error}</div>
                                            <div className="mt-1 text-xs text-orange-600">Data: {JSON.stringify(error.data, null, 2)}</div>
                                        </div>
                                    ))}
                                    {errors.length > 10 && (
                                        <div className="text-sm font-medium text-orange-600">... dan {errors.length - 10} error lainnya</div>
                                    )}
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={importing}>
                        Batal
                    </Button>
                    <Button onClick={handleImport} disabled={!file || importing} className="gap-2">
                        {importing ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Mengimport...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4" />
                                Import Sekarang
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
