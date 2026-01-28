import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { type BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { 
  Database, 
  Trash2, 
  Download, 
  Plus, 
  FileArchive, 
  Clock, 
  HardDrive,
  RefreshCcw,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface Backup {
  name: string;
  size: number;
  last_modified: number;
  download_url: string;
}

interface Props {
  backups: Backup[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Backup', href: '/backup' },
];

export default function BackupIndex({ backups }: Props) {
  const handleBackup = () => {
    router.post('/backup/run', {}, {
      onSuccess: () => toast.success('Backup basis data berhasil dibuat.'),
      onError: () => toast.error('Gagal membuat backup. Pastikan konfigurasi database sudah benar.'),
      preserveScroll: true,
    });
  };

  const handleDelete = (filename: string) => {
    router.delete(`/backup/delete/${filename}`, {
      onSuccess: () => toast.success('File backup dihapus.'),
      onError: () => toast.error('Gagal menghapus file.'),
      preserveScroll: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Pusat Pencadangan" />

      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Database Backup</h1>
            <p className="text-muted-foreground mt-1">Kelola pencadangan basis data sistem secara berkala.</p>
          </div>
          <Button onClick={handleBackup} className="gap-2" size="lg">
            <RefreshCcw className="size-4" /> Jalankan Backup Sekarang
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="size-5 text-primary" />
                    <CardTitle>Daftar Riwayat Backup</CardTitle>
                  </div>
                  <Badge variant="secondary" className="font-bold">{backups.length} File</Badge>
                </div>
                <CardDescription>File backup disimpan di folder storage aplikasi.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {backups.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl bg-muted/30">
                     <Database className="size-12 text-muted-foreground/30 mb-4" />
                     <p className="text-muted-foreground">Belum ada file backup tersedia.</p>
                     <p className="text-xs text-muted-foreground/60 mt-1">Klik tombol 'Jalankan Backup' untuk memulai.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {backups.map((backup, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border rounded-xl p-4 bg-card hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileArchive className="size-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{backup.name}</div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-3 mt-1 uppercase tracking-wider">
                              <span className="flex items-center gap-1 font-bold">
                                <HardDrive className="size-3" /> {formatSize(backup.size)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="size-3" /> {new Date(backup.last_modified * 1000).toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={backup.download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="gap-2">
                              <Download className="size-3.5" /> Download
                            </Button>
                          </a>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8 text-destructive hover:bg-destructive/10">
                                <Trash2 className="size-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus File Backup?</AlertDialogTitle>
                                <CardDescription>
                                  Tindakan ini akan menghapus file <strong>{backup.name}</strong> dari server.
                                </CardDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90 text-white"
                                  onClick={() => handleDelete(backup.name)}
                                >
                                  Ya, Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="size-5" /> Keamanan Data
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Backup sangat penting untuk menjaga integritas data Anda. Disarankan untuk melakukan pencadangan setiap hari sebelum melalukan penutupan kasir.
                </p>
                <div className="p-3 bg-white/50 rounded-lg border border-primary/10">
                   <p className="flex items-start gap-2 text-xs font-semibold uppercase text-primary mb-2">
                     <AlertCircle className="size-4" /> Info Penting
                   </p>
                   <ul className="text-xs space-y-2 list-disc pl-4 text-muted-foreground">
                      <li>File backup berekstensi .zip berisi snapshot database saat ini.</li>
                      <li>Simpan file hasil download di media penyimpanan lain (Flashdisk/Cloud).</li>
                      <li>Hapus file lama secara berkala untuk melegakan penyimpanan server.</li>
                   </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function formatSize(bytes: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}
