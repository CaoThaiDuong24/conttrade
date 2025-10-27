'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, Globe, Sun, Moon, User, LogOut, Bell, Settings, CreditCard, Package, FileText, ShoppingCart, Truck, Star, AlertTriangle, HelpCircle, Shield, BarChart3, Users, ClipboardList, MessageSquare, Building, Plus, Eye, Edit, Trash2, Archive, CheckCircle, Clock, XCircle, AlertCircle, TrendingUp, DollarSign, MapPin, Calendar, Home } from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { authUtils } from '@/components/layout/auth-wrapper';

interface AppHeaderProps {
  isAuthenticated?: boolean;
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    roles?: string[];
    permissions?: string[];
  };
  showSidebarTrigger?: boolean;
}

export function AppHeader({ 
  isAuthenticated = false, 
  userInfo,
  showSidebarTrigger = false 
}: AppHeaderProps) {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: t('navigation.home'), href: '/vi', icon: Home },
    { name: t('navigation.listings'), href: '/vi/listings', icon: Package },
    { name: t('navigation.rfq'), href: '/vi/rfq', icon: FileText },
    { name: t('navigation.orders'), href: '/vi/orders', icon: ShoppingCart },
    { name: t('navigation.delivery'), href: '/vi/delivery', icon: Truck },
    { name: t('navigation.help'), href: '/vi/help', icon: HelpCircle },
  ];

  // Check if a navigation item is active
  const isActiveNav = (href: string) => {
    if (href === '/vi') {
      return pathname === '/vi' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Quick actions - filter based on user permissions
  const allQuickActions = [
    { name: 'Tin đăng mới', href: '/vi/listings/create', icon: Plus, permission: 'PM-010' },
    { name: 'RFQ mới', href: '/vi/rfq/create', icon: FileText, permission: 'rfq.write' },
    { name: 'Yêu cầu vận chuyển', href: '/vi/delivery/request', icon: Truck, permission: 'delivery.read' },
    { name: 'Đánh giá', href: '/vi/reviews', icon: Star, permission: 'reviews.read' },
  ];
  
  const quickActions = isAuthenticated && userInfo 
    ? allQuickActions.filter(action => userInfo.permissions?.includes(action.permission))
    : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Logo and Sidebar Trigger */}
          <div className="flex items-center space-x-4">
            {showSidebarTrigger && (
              <SidebarTrigger className="md:hidden" />
            )}
            <Link href="/vi" className="flex items-center space-x-2 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center shadow-lg transition-all group-hover:shadow-xl group-hover:scale-105">
                <span className="text-primary-foreground font-bold text-lg">i</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                ContExchange
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveNav(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    flex items-center gap-2
                    ${isActive 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-6">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-colors group-focus-within:text-primary" />
              <Input
                placeholder={t('home.searchPlaceholder')}
                className="pl-10 pr-4 transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Language Toggle */}
            <LanguageToggle />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative">
                <NotificationBell />
              </div>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/10 hover:ring-primary/30 transition-all">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userInfo?.avatar || "/placeholder-user.jpg"} alt={userInfo?.name || "User"} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2 p-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                          <AvatarImage src={userInfo?.avatar || "/placeholder-user.jpg"} alt={userInfo?.name || "User"} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1 min-w-0">
                          <p className="text-sm font-semibold leading-none truncate">{userInfo?.name || "User"}</p>
                          <p className="text-xs leading-none text-muted-foreground mt-1 truncate">
                            {userInfo?.email || "user@example.com"}
                          </p>
                          {userInfo?.role && (
                            <Badge variant="outline" className="text-xs w-fit mt-2 bg-primary/5">
                              {userInfo.role}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Quick Actions */}
                  <div className="px-2 py-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Hành động nhanh</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {quickActions.map((action) => (
                        <DropdownMenuItem key={action.name} asChild>
                          <Link 
                            href={action.href} 
                            className="flex flex-col items-center gap-1.5 text-xs p-3 rounded-lg hover:bg-primary/5 transition-colors"
                          >
                            <action.icon className="h-4 w-4 text-primary" />
                            <span className="text-center leading-tight">{action.name}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/vi/account/profile" className="flex items-center gap-3 py-2.5">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{t('navigation.profile')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/vi/account/settings" className="flex items-center gap-3 py-2.5">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Settings className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{t('navigation.settings')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/vi/billing" className="flex items-center gap-3 py-2.5">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">Thanh toán</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      authUtils.logout();
                      window.location.href = '/vi';
                    }}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <div className="flex items-center gap-3 py-1">
                      <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                        <LogOut className="h-4 w-4 text-destructive" />
                      </div>
                      <span className="font-medium">{t('auth.logout')}</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild className="font-medium">
                  <Link href="/vi/auth/login">{t('auth.login')}</Link>
                </Button>
                <Button asChild className="font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  <Link href="/vi/auth/register">{t('auth.register')}</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-10 w-10">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">i</span>
                    </div>
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {/* Mobile Search */}
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-colors group-focus-within:text-primary" />
                    <Input
                      placeholder={t('home.searchPlaceholder')}
                      className="pl-10 pr-4"
                    />
                  </div>
                  
                  {/* Mobile Navigation */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider px-3">Điều hướng</p>
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = isActiveNav(item.href);
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`
                            flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all
                            ${isActive 
                              ? 'bg-primary/10 text-primary' 
                              : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                            }
                          `}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
