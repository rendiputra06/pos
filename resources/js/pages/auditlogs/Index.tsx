import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Activity {
  id: number;
  description: string;
  created_at: string;
  causer: { name: string } | null;
  properties: Record<string, any>;
  subject_type: string | null;
  store: { name: string } | null;
}

interface Props {
  logs: {
    data: Activity[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  stores: { id: number; name: string }[];
  filters: { store_id?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Audit Log',
    href: '/audit-logs',
  },
];

export default function AuditLogIndex({ logs, stores, filters }: Props) {
    const handleStoreChange = (storeId: string) => {
        router.get('/audit-logs', { store_id: storeId }, { 
            preserveState: true,
            preserveScroll: true
        });
    };
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Audit Log" />
      <div className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-2xl font-bold">Audit Log</CardTitle>
                    <p className="text-muted-foreground text-sm">
                    Riwayat aktivitas pengguna di dalam sistem
                    </p>
                </div>
                {stores.length > 0 && (
                    <div className="w-full md:w-64">
                        <Select value={filters.store_id || 'all'} onValueChange={handleStoreChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Toko" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Toko</SelectItem>
                                {stores.map(store => (
                                    <SelectItem key={store.id} value={store.id.toString()}>{store.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6 space-y-4">
            {/* List Logs */}
            {logs.data.length === 0 ? (
              <p className="text-muted-foreground text-center py-10">Tidak ada log aktivitas.</p>
            ) : (
              logs.data.map((log) => (
                <div
                  key={log.id}
                  className="border px-4 py-3 rounded-md bg-muted/50 hover:bg-muted/70 transition"
                >
                  <div className="font-medium text-sm text-foreground">
                    {log.description}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {log.causer?.name ?? 'System'} • {new Date(log.created_at).toLocaleString('id-ID')}
                    {log.store && <span className="text-primary font-semibold"> • {log.store.name}</span>}
                    {log.subject_type ? ` • ${log.subject_type.split('\\').pop()}` : ''}
                  </div>
                  {log.properties && Object.keys(log.properties).length > 0 && (
                    <pre className="mt-2 rounded bg-muted p-2 text-xs overflow-auto max-h-48">
                      {JSON.stringify(log.properties, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}

            {/* Pagination */}
            {logs.links.length > 1 && (
              <div className="flex justify-center pt-6 flex-wrap gap-2">
                {logs.links.map((link, i) => (
                  <Button
                    key={i}
                    disabled={!link.url}
                    variant={link.active ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => router.visit(link.url || '', { preserveScroll: true })}
                  >
                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
