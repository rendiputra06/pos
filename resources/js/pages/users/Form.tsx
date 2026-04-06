import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BreadcrumbItem } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Store, User, Shield, Settings, AlertTriangle } from 'lucide-react';

interface Role {
  id: number;
  name: string;
}

interface Store {
  id: number;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  is_active: boolean;
}

interface StoreAssignment {
  store_id: number;
  role: string;
  store: Store;
}

interface User {
  id?: number;
  name: string;
  email: string;
  roles?: string[];
}

interface Props {
  user?: User;
  roles: Role[];
  currentRoles?: string[];
  stores?: Store[];
  canAssignStores?: boolean;
  currentAssignments?: any[]; // Using any for now to avoid type conflicts
}

export default function UserForm({ 
  user, 
  roles, 
  currentRoles, 
  stores = [], 
  canAssignStores = false, 
  currentAssignments = [] 
}: Props) {
  const isEdit = !!user;
  const [storeAssignments, setStoreAssignments] = useState(
    currentAssignments.map((assignment: any) => ({
      store_id: assignment.store?.id || assignment.store_id,
      role: assignment.role,
      store: assignment.store || { id: assignment.store_id, name: 'Unknown Store' }
    }))
  );

  const { data, setData, post, put, processing, errors } = useForm({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    roles: currentRoles || [],
    store_assignments: storeAssignments,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setData('store_assignments', canAssignStores ? storeAssignments : []);
    isEdit ? put(`/users/${user?.id}`) : post('/users');
  };

  const addStoreAssignment = () => {
    if (stores.length > 0) {
      const availableStores = stores.filter(store => 
        !storeAssignments.find(assignment => assignment.store_id === store.id)
      );
      if (availableStores.length > 0) {
        setStoreAssignments([...storeAssignments, {
          store_id: availableStores[0].id,
          role: 'user',
          store: availableStores[0]
        }]);
      }
    }
  };

  const removeStoreAssignment = (index: number) => {
    setStoreAssignments(storeAssignments.filter((_, i) => i !== index));
  };

  const updateStoreAssignment = (index: number, field: 'store_id' | 'role', value: any) => {
    const updated = [...storeAssignments];
    if (field === 'store_id') {
      const store = stores.find(s => s.id === value);
      if (store) {
        updated[index] = { ...updated[index], [field]: value, store };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setStoreAssignments(updated);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'store-owner': return 'bg-purple-100 text-purple-800';
      case 'store-manager': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'User Management', href: '/users' },
    { title: isEdit ? 'Edit User' : 'Create User', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEdit ? 'Edit User' : 'Create User'} />
      <div className="flex-1 p-4 md:p-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isEdit ? 'Edit User' : 'Create New User'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isEdit ? 'Update user data and roles' : 'Enter user data and set roles'}
            </p>
          </CardHeader>

          <Separator />

          <CardContent className="pt-5">
            {/* Error Alert */}
            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Validation Errors:</div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>
                        <strong>{field}:</strong> {error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <Label htmlFor="name" className="mb-2 block">Name</Label>
                  <Input
                    id="name"
                    placeholder="Full name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-2">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="mb-2 block">Email</Label>
                  <Input
                    id="email"
                    placeholder="Email address"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-2">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password" className="mb-2 block">Password {isEdit ? '(Optional)' : ''}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && <p className="text-sm text-red-500 mt-2">{errors.password}</p>}
                </div>

                {/* Roles */}
                <div>
                  <Label className="mb-3 block">Roles</Label>
                  <div className="space-y-3 border rounded-lg p-4">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={data.roles.includes(role.name)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setData('roles', [...data.roles, role.name]);
                            } else {
                              setData('roles', data.roles.filter(r => r !== role.name));
                            }
                          }}
                        />
                        <Label htmlFor={`role-${role.id}`} className="text-sm font-normal cursor-pointer">
                          {role.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.roles && <p className="text-sm text-red-500 mt-2">{errors.roles}</p>}
                </div>

                {/* Store Assignments */}
                {canAssignStores && (
                  <div>
                    <Label className="mb-3 block">Store Assignments</Label>
                    <div className="space-y-3">
                      {storeAssignments.map((assignment, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
                          <Store className="w-5 h-5 text-gray-500" />
                          
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">Store</Label>
                              <Select 
                                value={assignment.store_id} 
                                onValueChange={(value) => updateStoreAssignment(index, 'store_id', parseInt(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select store" />
                                </SelectTrigger>
                                <SelectContent>
                                  {stores.filter(store => 
                                    !storeAssignments.find(a => a.store_id === store.id && a.store_id !== assignment.store_id)
                                  ).map(store => (
                                    <SelectItem key={store.id} value={store.id.toString()}>
                                      {store.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label className="text-sm">Role</Label>
                              <Select 
                                value={assignment.role} 
                                onValueChange={(value) => updateStoreAssignment(index, 'role', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="store-manager">Store Manager</SelectItem>
                                  <SelectItem value="store-owner">Store Owner</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={getRoleBadgeColor(assignment.role)}>
                              {assignment.role.replace('-', ' ')}
                            </Badge>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeStoreAssignment(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {storeAssignments.length === 0 && (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                          <Store className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No store assignments yet</p>
                          <p className="text-sm">Add a store assignment to give this user access to specific stores</p>
                        </div>
                      )}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addStoreAssignment}
                        disabled={storeAssignments.length >= stores.length}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Store Assignment
                      </Button>
                    </div>
                    {errors['store_assignments'] && <p className="text-sm text-red-500 mt-2">{errors['store_assignments']}</p>}
                  </div>
                )}

                {/* Info for users without store access */}
                {!canAssignStores && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Store className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Store Access</h4>
                    </div>
                    <p className="text-sm text-blue-800">
                      You don't have permission to assign users to stores. This user will be created without store assignments.
                      A Super Admin or Store Owner can assign stores to this user later.
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                <Link href="/users" className="w-full sm:w-auto">
                  <Button type="button" variant="secondary" className="w-full">
                    Back
                  </Button>
                </Link>
                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                  {processing
                    ? <span className="animate-pulse">Saving...</span>
                    : isEdit
                      ? 'Save Changes'
                      : 'Create User'
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
