'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Search, User, LogOut, Settings, CreditCard, Plus, Star, FileText, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { NotificationBell } from '@/components/notifications/notification-bell';
// import { SimpleNotificationBell } from '@/components/notifications/simple-notification-bell';
import { authUtils } from '@/components/layout/auth-wrapper';

interface DashboardHeaderProps {
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    roles?: string[];
    permissions?: string[];
  };
}

export function DashboardHeader({ userInfo }: DashboardHeaderProps) {
  const t = useTranslations();
  const [searchFocused, setSearchFocused] = useState(false);

  // Quick actions - filter based on user permissions
  const allQuickActions = [
    { name: 'Tin đăng mới', href: '/vi/listings/create', icon: Plus, permission: 'PM-010' },
    { name: 'RFQ mới', href: '/vi/rfq/create', icon: FileText, permission: 'rfq.write' },
    { name: 'Container', href: '/vi/listings', icon: Package, permission: 'PM-001' },
  ];
  
  const quickActions = userInfo 
    ? allQuickActions.filter(action => userInfo.permissions?.includes(action.permission))
    : [];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Mobile sidebar trigger + Brand */}
        <div className="flex items-center gap-3 lg:hidden">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-bold text-sm">i</span>
            </div>
            <span className="font-bold text-sm bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              ContExchange
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md lg:max-w-lg">
          <div className={`relative group transition-all duration-200 ${searchFocused ? 'scale-[1.02]' : ''}`}>
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${
              searchFocused ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <Input
              placeholder={t('home.searchPlaceholder') || 'Tìm kiếm container...'}
              className="pl-10 pr-4 h-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 bg-muted/30 hover:bg-muted/50 focus:bg-background"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 hidden lg:block" />

        {/* Right Side Actions */}
        <div className="flex items-center gap-1.5 ml-auto lg:ml-0">
          {/* Language Toggle */}
          <LanguageToggle />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative">
            <NotificationBell />
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full ring-2 ring-primary/10 hover:ring-primary/30 transition-all duration-200 hover:scale-105"
              >
                <Avatar className="h-10 w-10 transition-transform duration-200 group-hover:scale-105">
                  <AvatarImage src={userInfo?.avatar || "/placeholder-user.jpg"} alt={userInfo?.name || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground text-xs font-semibold">
                    {userInfo?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-0">
                <div className="flex flex-col space-y-3 p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-t-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14 ring-2 ring-primary/20 shadow-md">
                      <AvatarImage src={userInfo?.avatar || "/placeholder-user.jpg"} alt={userInfo?.name || "User"} />
                      <AvatarFallback className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground text-sm font-bold">
                        {userInfo?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="text-base font-bold leading-none truncate">{userInfo?.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground mt-1.5 truncate">
                        {userInfo?.email || "user@example.com"}
                      </p>
                      {userInfo?.role && (
                        <Badge 
                          variant="outline" 
                          className="text-xs w-fit mt-2 bg-primary/10 text-primary border-primary/20 font-medium"
                        >
                          {userInfo.role}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-0" />
              
              {/* Quick Actions */}
              {quickActions.length > 0 && (
                <>
                  <div className="px-3 py-3">
                    <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      Hành động nhanh
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {quickActions.map((action) => (
                        <DropdownMenuItem key={action.name} asChild className="p-0">
                          <Link 
                            href={action.href} 
                            className="flex flex-col items-center gap-2 text-xs p-3 rounded-xl hover:bg-primary/5 transition-all duration-200 hover:scale-105 group"
                          >
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <action.icon className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-center leading-tight font-medium">{action.name}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              
              {/* Menu Items */}
              <div className="py-1.5">
                <DropdownMenuItem asChild>
                  <Link href="/vi/account/profile" className="flex items-center gap-3 px-3 py-2.5 cursor-pointer group">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-200 group-hover:scale-105">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">{t('navigation.profile') || 'Hồ sơ'}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/vi/account/settings" className="flex items-center gap-3 px-3 py-2.5 cursor-pointer group">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-200 group-hover:scale-105">
                      <Settings className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">{t('navigation.settings') || 'Cài đặt'}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/vi/billing" className="flex items-center gap-3 px-3 py-2.5 cursor-pointer group">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-200 group-hover:scale-105">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">Thanh toán</span>
                  </Link>
                </DropdownMenuItem>
              </div>
              
              <DropdownMenuSeparator />
              
              {/* Logout */}
              <div className="p-1.5">
                <DropdownMenuItem 
                  onClick={() => {
                    authUtils.logout();
                    window.location.href = '/vi';
                  }}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 px-2 py-2 w-full">
                    <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-all duration-200 group-hover:scale-105">
                      <LogOut className="h-4 w-4 text-destructive" />
                    </div>
                    <span className="font-medium">{t('auth.logout') || 'Đăng xuất'}</span>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

