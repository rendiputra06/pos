import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type BreadcrumbItem } from '@/types';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Search, UserPlus, RotateCcw, Trash2, Edit2, Filter, ChevronLeft, ChevronRight, Store, Shield } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';
import { debounce } from 'lodash';

dayjs.extend(relativeTime);
dayjs.locale('id');

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Manajemen Pengguna',
    href: '/users',
  },
];

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  roles: {
    id: number;
    name: string;
  }[];
  store?: {
    id: number;
    name: string;
    slug: string;
  };
  storeAssignments?: {
    store: {
      id: number;
      name: string;
      slug: string;
    };
    role: string;
    assigned_at: string;
    can_manage: boolean;
    can_assign_users: boolean;
  }[];
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Props {
  users: {
    data: User[];
    current_page: number;
    last_page: number;
    links: PaginationLink[];
    total: number;
    from: number;
    to: number;
  };
  filters: {
    search?: string;
    role?: string;
  };
  roles: {
    id: number;
    name: string;
  }[];
  canManageStores?: boolean;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getRoleBadgeColor(role: string) {
  switch (role) {
    case 'super-admin': return 'bg-red-100 text-red-800 border-red-200';
    case 'admin': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'store-owner': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'store-manager': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getRoleIcon(role: string) {
  switch (role) {
    case 'super-admin': return '👑';
    case 'admin': return '🎯';
    case 'store-owner': return '🏪';
    case 'store-manager': return '👔';
    default: return '👤';
  }
}

export default function UserIndex({ users, filters, roles, canManageStores = false }: Props) {
  const [search, setSearch] = useState(filters.search || '');

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      router.get('/users', { ...filters, search: value, page: 1 }, {
        preserveState: true,
        replace: true,
      });
    }, 500),
    [filters]
  );

  useEffect(() => {
    if (search !== (filters.search || '')) {
      debouncedSearch(search);
    }
  }, [search]);

  const handleRoleChange = (value: string) => {
    const roleValue = value === 'all' ? undefined : value;
    router.get('/users', { ...filters, role: roleValue, page: 1 }, {
      preserveState: true,
    });
  };

  const handleDelete = (id: number) => {
    router.delete(`/users/${id}`, {
      preserveScroll: true,
    });
  };

  const handleResetPassword = (id: number) => {
    router.put(`/users/${id}/reset-password`, {}, { preserveScroll: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manajemen Pengguna" />
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
            <p className="text-muted-foreground mt-1">Kelola data pengguna sistem dan hak akses mereka.</p>
          </div>
          <Link href="/users/create">
            <Button className="w-full md:w-auto gap-2" size="lg">
              <UserPlus className="size-4" /> Tambah Pengguna
            </Button>
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-[200px]">
              <Select value={filters.role || 'all'} onValueChange={handleRoleChange}>
                <SelectTrigger className="h-10">
                  <div className="flex items-center gap-2">
                    <Filter className="size-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Semua Role" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(filters.search || filters.role) && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 shrink-0"
                onClick={() => {
                  setSearch('');
                  router.get('/users', {}, { preserveState: true });
                }}
              >
                <RotateCcw className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {/* User List */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Pengguna</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  {canManageStores && <th className="px-6 py-4 font-semibold">Store Assignments</th>}
                  <th className="px-6 py-4 font-semibold hidden md:table-cell">Terdaftar</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.data.length === 0 ? (
                  <tr>
                    <td colSpan={canManageStores ? 5 : 4} className="px-6 py-12 text-center text-muted-foreground italic">
                      Tidak ada data pengguna ditemukan.
                    </td>
                  </tr>
                ) : (
                  users.data.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                            {getInitials(user.name)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold truncate max-w-[200px]">{user.name}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge key={role.id} variant="secondary" className={`px-2 py-0 text-[10px] uppercase tracking-wider font-bold ${getRoleBadgeColor(role.name)}`}>
                              {getRoleIcon(role.name)} {role.name}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      {canManageStores && (
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {user.storeAssignments && user.storeAssignments.length > 0 ? (
                              user.storeAssignments.map((assignment, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-2">
                                  <Store className="w-3 h-3 mr-1" />
                                  {assignment.store.name}
                                </Badge>
                              ))
                            ) : user.store ? (
                              <Badge variant="outline" className="text-xs border-2">
                                <Store className="w-3 h-3 mr-1" />
                                {user.store.name}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">No store</span>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 hidden md:table-cell text-muted-foreground text-xs uppercase">
                        {dayjs(user.created_at).format('DD MMM YYYY')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/users/${user.id}/edit`}>
                            <Button size="icon" variant="ghost" className="size-8">
                              <Edit2 className="size-3.5" />
                            </Button>
                          </Link>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="size-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50">
                                <RotateCcw className="size-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reset Password?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Password untuk <strong>{user.name}</strong> akan direset ke:
                                  <br />
                                  <code className="bg-muted rounded px-2 py-1 text-sm font-mono mt-2 inline-block">ResetPasswordNya</code>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleResetPassword(user.id)}>
                                  Ya, Reset
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="size-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Data <strong>{user.name}</strong> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-destructive hover:bg-destructive/90 text-white">
                                  Hapus Sekarang
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t bg-muted/30">
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              Menampilkan <span className="font-bold text-foreground">{users.from || 0}</span> - <span className="font-bold text-foreground">{users.to || 0}</span> dari <span className="font-bold text-foreground">{users.total}</span> data
            </div>
            <div className="flex items-center gap-1">
              {users.links.map((link, i) => {
                const isPrev = link.label.includes('Previous');
                const isNext = link.label.includes('Next');
                
                if (isPrev || isNext) {
                  return (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="size-9 p-0"
                      disabled={!link.url}
                      onClick={() => link.url && router.get(link.url)}
                    >
                      {isPrev ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
                    </Button>
                  );
                }

                if (link.label === '...') {
                  return <span key={i} className="px-2 text-muted-foreground">...</span>;
                }

                return (
                  <Button
                    key={i}
                    variant={link.active ? "default" : "outline"}
                    size="sm"
                    className="size-9 p-0"
                    disabled={!link.url}
                    onClick={() => link.url && router.get(link.url)}
                  >
                    {link.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
