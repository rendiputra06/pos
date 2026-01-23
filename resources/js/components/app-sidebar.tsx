import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { usePage, Link } from '@inertiajs/react';
import AppLogo from './app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import { iconMapper } from '@/lib/iconMapper';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight, Star, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: number;
  title: string;
  route: string | null;
  icon: string;
  children?: MenuItem[];
}

function RenderMenu({ items }: { items: MenuItem[] }) {
  const { url: currentUrl } = usePage();

  if (!Array.isArray(items)) return null;

  return (
    <SidebarMenu>
      {items.map((menu) => {
        if (!menu) return null;
        const Icon = iconMapper(menu.icon || 'Folder') as LucideIcon;
        const children = Array.isArray(menu.children) ? menu.children.filter(Boolean) : [];
        const hasChildren = children.length > 0;
        
        const isActive = menu.route && (currentUrl === menu.route || currentUrl.startsWith(menu.route + '/'));
        const isChildActive = children.some(child => child.route && (currentUrl === child.route || currentUrl.startsWith(child.route + '/')));

        if (!menu.route && !hasChildren) return null;

        if (hasChildren) {
          return (
            <Collapsible key={menu.id} asChild defaultOpen={isActive || isChildActive} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={menu.title} isActive={!!(isActive || isChildActive)}>
                    <Icon />
                    <span>{menu.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {children.map((child) => {
                      const isSubActive = child.route && (currentUrl === child.route || currentUrl.startsWith(child.route + '/'));
                      
                      return (
                        <SidebarMenuSubItem key={child.id}>
                          <SidebarMenuSubButton asChild isActive={!!isSubActive}>
                            <Link href={child.route || '#'}>
                              <span>{child.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        }

        return (
          <SidebarMenuItem key={menu.id}>
            <SidebarMenuButton asChild isActive={!!isActive} tooltip={menu.title}>
              <Link href={menu.route || '#'}>
                <Icon />
                <span>{menu.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function AppSidebar() {
  const { menus = [] } = usePage().props as { menus?: MenuItem[] };

  const footerNavItems = [
    {
      title: 'Star this Repo',
      url: 'https://github.com/yogijowo/laravel12-react-starterkit',
      icon: Star,
    },
    {
      title: 'Donate via Saweria',
      url: 'https://saweria.co/yogijowo',
      icon: Heart,
    },
  ];

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent focus-visible:ring-0">
              <Link href="/dashboard" prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <RenderMenu items={menus} />
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
        <NavFooter items={footerNavItems} />
      </SidebarFooter>
    </Sidebar>
  );
}