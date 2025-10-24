'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Home,
  Package,
  FileText,
  ShoppingCart,
  Truck,
  Star,
  AlertTriangle,
  Settings,
  HelpCircle,
  Shield,
  BarChart3,
  Users,
  ClipboardList,
  MessageSquare,
  CreditCard,
  Building,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Archive,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  MapPin,
  Calendar,
  User,
  LogOut,
  Bell,
  Globe,
  Sun,
  Moon,
  Store,
  List,
  History,
  ArrowRightLeft,
  Wrench,
  Warehouse,
  Send,
  Inbox,
  GitCompare,
  Receipt
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import NavigationService from '@/lib/auth/navigation-service';
import { Role, Permission } from '@/lib/auth/client-rbac-service';
import { RoleTestPanel } from '@/components/dev/role-test-panel';

// Import test helper for development
if (process.env.NODE_ENV === 'development') {
  try {
    require('@/lib/auth/test-roles');
  } catch (error) {
    console.log('Test roles not available');
  }
}

interface DashboardSidebarProps {
  isAuthenticated?: boolean;
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    roles?: Role[];
    permissions?: Permission[];
  };
}

export function DashboardSidebar({ isAuthenticated = false, userInfo }: DashboardSidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();

  // Get navigation groups based on user roles and permissions
  const userRoles = userInfo?.roles || [];
  const userPermissions = userInfo?.permissions || [];
  const navigationGroups = NavigationService.getNavigationMenu(userRoles, userPermissions);
  
  // Get primary role for display
  const primaryRole = NavigationService.getPrimaryRole(userRoles);
  const roleDisplayName = NavigationService.getRoleDisplayName(primaryRole);

  // Helper function to get icon component
  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Home, Package, FileText, ShoppingCart, Truck, Star, AlertTriangle, Settings, HelpCircle,
      Shield, BarChart3, Users, ClipboardList, MessageSquare, CreditCard, Building, Search,
      Plus, Eye, Edit, Trash2, Archive, CheckCircle, Clock, XCircle, AlertCircle, TrendingUp,
      DollarSign, MapPin, Calendar, User, LogOut, Bell, Globe, Sun, Moon, Store, List, History,
      ArrowRightLeft, Wrench, Warehouse, Send, Inbox, GitCompare, Receipt
    };
    return icons[iconName] || Package;
  };

  const isActive = (url: string) => {
    if (url === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(url);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">i</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg">ContExchange</span>
            <span className="text-xs text-muted-foreground">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Role Test Panel - Development Only */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-2">
            <RoleTestPanel />
          </div>
        )}
        
        {/* Dynamic Navigation Groups */}
        {navigationGroups.map((group, groupIndex) => (
          <div key={group.title}>
            {groupIndex > 0 && <SidebarSeparator />}
            <SidebarGroup>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const IconComponent = getIconComponent(item.icon);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.url)}
                          tooltip={item.title}
                        >
                          <Link href={NavigationService.addLocalePrefix(item.url)}>
                            <IconComponent />
                            <span>{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="ml-auto">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </SidebarMenuButton>
                        {item.subItems && item.subItems.length > 0 && (
                          <SidebarMenuSub>
                            {item.subItems.map((subItem) => {
                              const SubIconComponent = getIconComponent(subItem.icon);
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isActive(subItem.url)}
                                  >
                                    <Link href={NavigationService.addLocalePrefix(subItem.url)}>
                                      <SubIconComponent />
                                      <span>{subItem.title}</span>
                                      {subItem.badge && (
                                        <Badge variant="outline" className="ml-auto text-xs">
                                          {subItem.badge}
                                        </Badge>
                                      )}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex flex-col gap-2 p-2">
          {/* User Info */}
          {isAuthenticated && userInfo && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{userInfo.name}</p>
                <p className="text-xs text-muted-foreground truncate">{userInfo.email}</p>
                <Badge variant="outline" className="text-xs w-fit">
                  {roleDisplayName}
                </Badge>
              </div>
            </div>
          )}

          {/* Theme and Language Toggles */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}