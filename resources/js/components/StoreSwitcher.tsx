import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Store, ChevronDown, Check } from 'lucide-react';

interface Store {
  id: number;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  is_active: boolean;
}

interface StoreAssignment {
  store: Store;
  role: string;
  assigned_at: string;
  can_manage: boolean;
  can_assign_users: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  store_id?: number;
  isSuperAdmin: () => boolean;
  accessibleStores: () => Promise<StoreAssignment[]>;
}

export function StoreSwitcher() {
  const page = usePage();
  const auth = (page.props as any).auth;
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userStores, setUserStores] = useState<StoreAssignment[]>([]);

  const currentUser = auth?.user;
  const currentStoreId = currentUser?.store_id;

  useEffect(() => {
    if (currentUser) {
      // Use storeAssignments from auth props if available
      const storeAssignments = auth?.storeAssignments || [];
      if (storeAssignments.length > 0) {
        setUserStores(storeAssignments);
      } else if (currentUser.isSuperAdmin && typeof currentUser.isSuperAdmin === 'function' && !currentUser.isSuperAdmin()) {
        // For non-super admin without assignments, try to load from stores prop
        const stores = auth?.stores || [];
        const assignments = stores.map((store: any) => ({
          store: store,
          role: 'user',
          assigned_at: new Date().toISOString(),
          can_manage: false,
          can_assign_users: false,
        }));
        setUserStores(assignments);
      }
    }
  }, [currentUser, auth]);

  const loadUserStores = async () => {
    try {
      // In a real app, this would be an API call
      // For now, we'll use the stores from the page props if available
      const stores = auth?.stores || [];
      setUserStores(stores);
    } catch (error) {
      console.error('Failed to load user stores:', error);
    }
  };

  const handleStoreSwitch = async (storeId: number) => {
    if (storeId === currentStoreId) return;

    setIsLoading(true);
    try {
      await router.post(
        '/users/switch-store',
        { store_id: storeId },
        {
          preserveScroll: true,
          onSuccess: () => {
            setIsLoading(false);
            setIsOpen(false);
            // Reload page to reflect the store change
            window.location.reload();
          },
          onError: (errors) => {
            setIsLoading(false);
            console.error('Failed to switch store:', errors);
          },
        }
      );
    } catch (error) {
      setIsLoading(false);
      console.error('Failed to switch store:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'store-owner': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'store-manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'store-owner': return '👑';
      case 'store-manager': return '👔';
      default: return '👤';
    }
  };

  // Show current store if user has one but no switchable stores
  if (!currentUser || (userStores.length <= 1 && currentStoreId)) {
    const currentStore = userStores.find(s => s.store.id === currentStoreId);
    const storeName = currentStore?.store.name || auth?.store?.name || 'Unknown Store';
    const currentRole = currentStore?.role || 'user';

    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
        <Store className="size-4" />
        <span>{storeName}</span>
        {currentStore && (
          <Badge className={`text-xs ${getRoleBadgeColor(currentRole)}`}>
            {getRoleIcon(currentRole)} {currentRole.replace('-', ' ')}
          </Badge>
        )}
      </div>
    );
  }

  // Don't show switcher if no stores available
  if (!currentUser || userStores.length === 0) {
    return null;
  }

  const currentStore = userStores.find(s => s.store.id === currentStoreId);
  const currentStoreName = currentStore?.store.name || 'Unknown Store';
  const currentRole = currentStore?.role || 'user';

  return (
    <div className="relative">
      <Select
        value={currentStoreId?.toString()}
        onValueChange={(value) => handleStoreSwitch(parseInt(value))}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full min-w-[200px]">
          <Store className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Select store">
            <div className="flex items-center justify-between w-full">
              <span className="truncate">{currentStoreName}</span>
              <Badge className={`ml-2 text-xs ${getRoleBadgeColor(currentRole)}`}>
                {getRoleIcon(currentRole)} {currentRole.replace('-', ' ')}
              </Badge>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {userStores.map((assignment) => (
            <SelectItem
              key={assignment.store.id}
              value={assignment.store.id.toString()}
              className="cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Store className="w-4 h-4 mr-2 text-gray-500" />
                  <div>
                    <div className="font-medium">{assignment.store.name}</div>
                    {assignment.store.address && (
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">
                        {assignment.store.address}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getRoleBadgeColor(assignment.role)}`}>
                    {getRoleIcon(assignment.role)} {assignment.role.replace('-', ' ')}
                  </Badge>
                  {assignment.store.id === currentStoreId && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-md">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}

