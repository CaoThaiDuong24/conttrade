'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
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
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, LogOut, User } from 'lucide-react';
import {
  BarChart3,
  Package,
  FileText,
  ShoppingCart,
  Truck,
  Search,
  Star,
  AlertTriangle,
  DollarSign,
  Users,
  Settings,
  HelpCircle,
  Mail,
  Home,
  Store,
  Warehouse,
  Calendar,
  CheckCircle,
  CreditCard,
  History,
  Shield,
  List,
  Plus,
  Edit,
  TrendingUp,
  Inbox,
  Send,
  ArrowRightLeft,
  Wrench,
  Receipt,
} from 'lucide-react';

interface RBACDashboardSidebarProps {
  isAuthenticated?: boolean;
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    roles?: string[];
    permissions?: string[];
  };
}

// Icon mapping
const ICON_MAP = {
  Home,
  Package,
  BarChart3,
  FileText,
  ShoppingCart,
  Truck,
  Search,
  Star,
  AlertTriangle,
  DollarSign,
  Users,
  Settings,
  HelpCircle,
  Mail,
  Store,
  Warehouse,
  Calendar,
  CheckCircle,
  CreditCard,
  History,
  Shield,
  List,
  Plus,
  Edit,
  TrendingUp,
  Inbox,
  Send,
  ArrowRightLeft,
  Wrench,
  Receipt,
  User,
} as const;

// Navigation menu structure based on roles
const NAVIGATION_MENU: Record<string, any[]> = {
  guest: [
    { title: 'Trang chủ', url: '/', icon: 'Home' },
    { title: 'Container', url: '/listings', icon: 'Package' },
    { title: 'Trợ giúp', url: '/help', icon: 'HelpCircle' },
  ],
  
  buyer: [
    { title: 'Dashboard', url: '/dashboard', icon: 'BarChart3' },
    { title: 'Container', url: '/listings', icon: 'Package' },
    { 
      title: 'RFQ', 
      url: '/rfq', 
      icon: 'FileText',
      subItems: [
        { title: 'Tạo RFQ', url: '/rfq/create', icon: 'Plus' },
        { title: 'RFQ đã gửi', url: '/rfq/sent', icon: 'Send' },
      ]
    },
    { 
      title: 'Đơn hàng', 
      url: '/orders', 
      icon: 'ShoppingCart',
      subItems: [
        { title: 'Tất cả đơn hàng', url: '/orders', icon: 'List' },
        { title: 'Thanh toán', url: '/orders/checkout', icon: 'CreditCard' },
        { title: 'Theo dõi', url: '/orders/tracking', icon: 'Truck' },
      ]
    },
    { 
      title: 'Thanh toán', 
      url: '/payments/escrow', 
      icon: 'DollarSign',
      subItems: [
        { title: 'Ví escrow', url: '/payments/escrow', icon: 'Shield' },
        { title: 'Phương thức', url: '/payments/methods', icon: 'CreditCard' },
        { title: 'Lịch sử', url: '/payments/history', icon: 'History' },
      ]
    },
    { title: 'Giám định', url: '/inspection/new', icon: 'Search' },
    { title: 'Vận chuyển', url: '/delivery', icon: 'Truck' },
    { 
      title: 'Đánh giá', 
      url: '/reviews', 
      icon: 'Star',
      subItems: [
        { title: 'Tạo đánh giá', url: '/reviews/new', icon: 'Plus' },
      ]
    },
    { 
      title: 'Khiếu nại', 
      url: '/disputes', 
      icon: 'AlertTriangle',
      subItems: [
        { title: 'Tạo khiếu nại', url: '/disputes/new', icon: 'Plus' },
      ]
    },
    { 
      title: 'Tài khoản', 
      url: '/account/profile', 
      icon: 'User',
      subItems: [
        { title: 'Hồ sơ', url: '/account/profile', icon: 'User' },
        { title: 'Cài đặt', url: '/account/settings', icon: 'Settings' },
      ]
    },
  ],
  
  seller: [
    { title: 'Dashboard', url: '/dashboard', icon: 'BarChart3' },
    { title: 'Container', url: '/listings', icon: 'Package' },
    { 
      title: 'Bán hàng', 
      url: '/sell/new', 
      icon: 'Store',
      subItems: [
        { title: 'Đăng tin mới', url: '/sell/new', icon: 'Plus' },
        { title: 'Tin đăng của tôi', url: '/sell/my-listings', icon: 'List' },
      ]
    },
    { 
      title: 'RFQ & Báo giá', 
      url: '/rfq', 
      icon: 'FileText',
      subItems: [
        { title: 'RFQ nhận được', url: '/rfq/received', icon: 'Inbox' },
        { title: 'Tạo báo giá', url: '/quotes/create', icon: 'Plus' },
        { title: 'Quản lý báo giá', url: '/quotes/management', icon: 'List' },
      ]
    },
    { title: 'Đơn hàng', url: '/orders', icon: 'ShoppingCart' },
    { title: 'Vận chuyển', url: '/delivery', icon: 'Truck' },
    { 
      title: 'Đánh giá', 
      url: '/reviews', 
      icon: 'Star',
      subItems: [
        { title: 'Tạo đánh giá', url: '/reviews/new', icon: 'Plus' },
      ]
    },
    { title: 'Hóa đơn', url: '/billing', icon: 'Receipt' },
    { 
      title: 'Tài khoản', 
      url: '/account/profile', 
      icon: 'User',
      subItems: [
        { title: 'Hồ sơ', url: '/account/profile', icon: 'User' },
        { title: 'Cài đặt', url: '/account/settings', icon: 'Settings' },
      ]
    },
  ],
  
  depot_staff: [
    { title: 'Dashboard', url: '/dashboard', icon: 'BarChart3' },
    { 
      title: 'Kho bãi', 
      url: '/depot/stock', 
      icon: 'Warehouse',
      subItems: [
        { title: 'Tồn kho', url: '/depot/stock', icon: 'Package' },
        { title: 'Di chuyển', url: '/depot/movements', icon: 'ArrowRightLeft' },
        { title: 'Chuyển kho', url: '/depot/transfers', icon: 'Truck' },
        { title: 'Điều chỉnh', url: '/depot/adjustments', icon: 'Edit' },
      ]
    },
    { title: 'Giám định', url: '/depot/inspections', icon: 'Search' },
    { title: 'Sửa chữa', url: '/depot/repairs', icon: 'Wrench' },
    { title: 'Vận chuyển', url: '/delivery', icon: 'Truck' },
    { title: 'Tài khoản', url: '/account/profile', icon: 'User' },
  ],
  
  depot_manager: [
    { title: 'Dashboard', url: '/dashboard', icon: 'BarChart3' },
    { 
      title: 'Kho bãi', 
      url: '/depot/stock', 
      icon: 'Warehouse',
      subItems: [
        { title: 'Tồn kho', url: '/depot/stock', icon: 'Package' },
        { title: 'Di chuyển', url: '/depot/movements', icon: 'ArrowRightLeft' },
        { title: 'Chuyển kho', url: '/depot/transfers', icon: 'Truck' },
        { title: 'Điều chỉnh', url: '/depot/adjustments', icon: 'Edit' },
        { title: 'Sửa chữa', url: '/depot/repairs', icon: 'Wrench' },
      ]
    },
    { title: 'Giám định', url: '/depot/inspections', icon: 'Search' },
    { title: 'Đơn hàng', url: '/orders', icon: 'ShoppingCart' },
    { title: 'Vận chuyển', url: '/delivery', icon: 'Truck' },
    { title: 'Hóa đơn', url: '/billing', icon: 'Receipt' },
    { 
      title: 'Đánh giá', 
      url: '/reviews', 
      icon: 'Star',
      subItems: [
        { title: 'Tạo đánh giá', url: '/reviews/new', icon: 'Plus' },
      ]
    },
    { title: 'Tài khoản', url: '/account/profile', icon: 'User' },
  ],
  
  inspector: [
    { title: 'Dashboard', url: '/dashboard', icon: 'BarChart3' },
    { title: 'Giám định', url: '/inspection/new', icon: 'Search' },
    { title: 'Lịch giám định', url: '/depot/inspections', icon: 'Calendar' },
    { title: 'Tài khoản', url: '/account/profile', icon: 'User' },
  ],

  
  admin: [
    { title: 'Dashboard', url: '/dashboard', icon: 'BarChart3' },
    { 
      title: 'Quản trị', 
      url: '/admin', 
      icon: 'Settings',
      subItems: [
        { title: 'Tổng quan', url: '/admin', icon: 'BarChart3' },
        { title: 'Người dùng', url: '/admin/users', icon: 'Users' },
        { title: 'Xét duyệt KYC', url: '/admin/users/kyc', icon: 'Shield' },
        { title: 'Duyệt tin đăng', url: '/admin/listings', icon: 'Package' },
        { title: 'Tranh chấp', url: '/admin/disputes', icon: 'AlertTriangle' },
        { title: 'Cấu hình', url: '/admin/config', icon: 'Settings' },
        { title: 'Mẫu thông báo', url: '/admin/templates', icon: 'FileText' },
        { title: 'Nhật ký', url: '/admin/audit', icon: 'Shield' },
        { title: 'Thống kê', url: '/admin/analytics', icon: 'TrendingUp' },
        { title: 'Báo cáo', url: '/admin/reports', icon: 'FileText' },
      ]
    },
    { 
      title: 'Phân quyền RBAC', 
      url: '/admin/rbac', 
      icon: 'Shield',
      subItems: [
        { title: 'Tổng quan', url: '/admin/rbac', icon: 'BarChart3' },
        { title: 'Quản lý Role', url: '/admin/rbac/roles', icon: 'Shield' },
        { title: 'Ma trận phân quyền', url: '/admin/rbac/matrix', icon: 'List' },
        { title: 'Gán Role cho User', url: '/admin/rbac/users', icon: 'Users' },
      ]
    },
    { title: 'Container', url: '/listings', icon: 'Package' },
    { title: 'Đơn hàng', url: '/orders', icon: 'ShoppingCart' },
    { title: 'Tài khoản', url: '/account/profile', icon: 'User' },
  ],

  config_manager: [
    { title: 'Dashboard', url: '/dashboard', icon: 'BarChart3' },
    { title: 'Cấu hình', url: '/admin/config', icon: 'Settings' },
    { title: 'Mẫu thông báo', url: '/admin/templates', icon: 'FileText' },
    { title: 'Tài khoản', url: '/account/profile', icon: 'User' },
  ],

  finance: [
    { title: 'Dashboard', url: '/dashboard', icon: 'BarChart3' },
    { title: 'Đối soát', url: '/finance/reconcile', icon: 'Receipt' },
    { title: 'Hóa đơn', url: '/billing', icon: 'FileText' },
    { title: 'Thanh toán', url: '/payments/escrow', icon: 'CreditCard' },
    { title: 'Tài khoản', url: '/account/profile', icon: 'User' },
  ],

  price_manager: [
    { title: 'Dashboard', url: '/dashboard', icon: 'BarChart3' },
    { title: 'Cấu hình', url: '/admin/config', icon: 'Settings' },
    { title: 'Tài khoản', url: '/account/profile', icon: 'User' },
  ],

  customer_support: [
    { title: 'Dashboard', url: '/dashboard', icon: 'BarChart3' },
    { title: 'Tranh chấp', url: '/disputes', icon: 'AlertTriangle' },
    { title: 'Trợ giúp', url: '/help', icon: 'HelpCircle' },
    { title: 'Tài khoản', url: '/account/profile', icon: 'User' },
  ],
};

// Role hierarchy (matching database levels from seed-complete-rbac.mjs)
const ROLE_HIERARCHY: Record<string, number> = {
  'admin': 100,
  'config_manager': 80,
  'finance': 70,
  'price_manager': 60,
  'customer_support': 50,
  'depot_manager': 30,
  'inspector': 25,
  'depot_staff': 20,
  'seller': 10,
  'buyer': 10,
};

export function RBACDashboardSidebar({ isAuthenticated = false, userInfo }: RBACDashboardSidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  
  // Fix hydration error: only determine menu items on client-side after mount
  const [isMounted, setIsMounted] = React.useState(false);
  
  // State để quản lý menu nào đang mở (chỉ cho phép 1 menu mở tại 1 thời điểm)
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  
  // Ref để track xem có đang trong quá trình user click hay không
  const isUserInteractionRef = React.useRef(false);
  
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Determine user's primary role and navigation menu
  const getUserNavigationMenu = () => {
    if (!isAuthenticated || !userInfo?.roles?.length) {
      console.log('⚠️ Not authenticated or no roles - showing guest menu');
      return NAVIGATION_MENU.guest;
    }

    // Debug: Log ALL data received by sidebar
    console.log('🔍 Sidebar - Full userInfo:', userInfo);
    console.log('🔍 Sidebar - User permissions:', userInfo.permissions?.length || 0);
    console.log('📋 Sidebar - Permission codes:', userInfo.permissions);
    console.log('👤 Sidebar - User roles:', userInfo.roles);
    console.log('👤 Sidebar - Roles type:', Array.isArray(userInfo.roles) ? 'Array' : typeof userInfo.roles);
    console.log('👤 Sidebar - First role:', userInfo.roles[0], 'type:', typeof userInfo.roles[0]);

    // Check admin in MULTIPLE ways to debug
    const rolesArray = Array.isArray(userInfo.roles) ? userInfo.roles : [userInfo.roles];
    const rolesString = JSON.stringify(userInfo.roles);
    const hasAdminIncludes = userInfo.roles.includes('admin');
    const hasAdminFind = userInfo.roles.find((r: any) => r === 'admin' || r.code === 'admin');
    const hasAdminString = rolesString.includes('admin');
    const permCount = userInfo.permissions?.length || 0;
    
    console.log('🔍 Admin check - MULTIPLE METHODS:', {
      hasAdminIncludes,
      hasAdminFind,
      hasAdminString,
      rolesArray,
      permissionsCount: permCount
    });

    // Try MULTIPLE conditions - REMOVED hasEnoughPermissions check (BUG FIX)
    const isAdmin = hasAdminIncludes || hasAdminFind || hasAdminString;
    
    if (isAdmin) {
      console.log('✅✅✅ ADMIN DETECTED - showing ALL menu items!');
      
      // Combine all menu items from all roles (deduplicate by URL)
      const allItems: any[] = [];
      const seenUrls = new Set<string>();
      
      Object.values(NAVIGATION_MENU).forEach(roleMenu => {
        roleMenu.forEach((item: any) => {
          if (!seenUrls.has(item.url)) {
            seenUrls.add(item.url);
            allItems.push(item);
          }
        });
      });
      
      console.log('📋 Total menu items for admin:', allItems.length);
      console.log('📋 Menu items:', allItems.map(i => i.title));
      return allItems;
    } else {
      console.log('❌ NOT ADMIN - User is not admin role');
      console.log('  isAdmin:', isAdmin);
    }

    // Get highest priority role for non-admin users
    const userLevel = Math.max(...userInfo.roles.map(role => ROLE_HIERARCHY[role] || 0));
    const primaryRole = userInfo.roles.find(role => ROLE_HIERARCHY[role] === userLevel) || 'buyer';
    
    console.log(`📋 Primary role detected: ${primaryRole} (level: ${userLevel})`);
    
    // Get base menu for primary role
    let baseMenu = NAVIGATION_MENU[primaryRole] || NAVIGATION_MENU.buyer;
    
    // ✅ FIX: Seller role luôn có menu "Đăng tin mới" (không cần permission)
    // Buyer chỉ có menu này nếu được gán CREATE_LISTING permission (PM-010)
    const isSeller = userInfo.roles.includes('seller');
    const userPermissions = userInfo.permissions || [];
    const hasCreateListingPermission = userPermissions.includes('PM-010'); // ✅ FIX: Check by code PM-010
    
    console.log('🔍 Access check:', {
      primaryRole,
      isSeller,
      userPermissions, // Show all permissions for debugging
      hasCreateListingPermission,
      totalPermissions: userPermissions.length
    });
    
    // If user is seller OR has CREATE_LISTING permission, ensure menu exists
    if (isSeller || hasCreateListingPermission) {
      const hasSellingMenu = baseMenu.some((item: any) => 
        item.url === '/sell/new' || 
        item.subItems?.some((sub: any) => sub.url === '/sell/new')
      );
      
      console.log('🔍 Has selling menu:', hasSellingMenu);
      
      if (!hasSellingMenu) {
        console.log('✅ Adding "Đăng tin mới" menu (seller role or has permission)');
        
        // Add selling menu after Dashboard and Container
        baseMenu = [
          ...baseMenu.slice(0, 2), // Keep Dashboard and Container
          { 
            title: 'Bán hàng', 
            url: '/sell/new', 
            icon: 'Store',
            subItems: [
              { title: 'Đăng tin mới', url: '/sell/new', icon: 'Plus' },
              { title: 'Tin đăng của tôi', url: '/sell/my-listings', icon: 'List' },
            ]
          },
          ...baseMenu.slice(2) // Keep rest of menu
        ];
      } else {
        console.log('✅ Selling menu already exists');
      }
    } else {
      console.log('❌ User cannot create listings (not seller and no CREATE_LISTING permission)');
    }
    
    return baseMenu;
  };

  // Only get navigation items after component is mounted (client-side only)
  const navigationItems = isMounted ? getUserNavigationMenu() : [];

  // Tự động mở menu nếu có submenu active (chỉ khi không có user interaction)
  React.useEffect(() => {
    if (!isMounted || isUserInteractionRef.current) return;
    
    // Tìm menu có submenu đang active
    const cleanPathname = pathname.replace(/^\/(en|vi)/, '').replace(/\/$/, '');
    
    const activeMenuItem = navigationItems.find(item => {
      if (!item.subItems || item.subItems.length === 0) return false;
      
      return item.subItems.some((subItem: any) => {
        const normalizedSubUrl = subItem.url.replace(/\/$/, '');
        // Exact match
        return cleanPathname === normalizedSubUrl;
      });
    });
    
    if (activeMenuItem && openMenu !== activeMenuItem.url) {
      setOpenMenu(activeMenuItem.url);
    }
  }, [pathname, isMounted, navigationItems, openMenu]);

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout on error
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/auth/login');
    }
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName as keyof typeof ICON_MAP] || Package;
    return <IconComponent className="h-4 w-4" />;
  };

  const renderMenuItem = (item: any, level = 0) => {
    // Clean pathname - remove locale prefix for comparison
    const cleanPathname = pathname.replace(/^\/(en|vi)/, '');
    const cleanItemUrl = item.url;
    
    // Check if any sub-item is active
    const hasSubItems = item.subItems && item.subItems.length > 0;
    
    // Normalize: remove trailing slash
    const normalizedPathname = cleanPathname.replace(/\/$/, '');
    const normalizedItemUrl = cleanItemUrl.replace(/\/$/, '');
    
    // Kiểm tra xem có submenu nào đang active không
    const hasActiveSubItem = hasSubItems && item.subItems?.some((subItem: any) => {
      const normalizedSubUrl = subItem.url.replace(/\/$/, '');
      // Exact match cho submenu
      const isMatch = normalizedPathname === normalizedSubUrl;
      
      // Debug log
      if (item.title.includes('RBAC') || item.title.includes('Quản trị')) {
        console.log(`🔍 Checking submenu: ${subItem.title}`);
        console.log(`  Current: "${normalizedPathname}"`);
        console.log(`  SubURL:  "${normalizedSubUrl}"`);
        console.log(`  Match: ${isMatch}`);
      }
      
      return isMatch;
    });
    
    // Logic đơn giản cho isMenuActive:
    let isMenuActive = false;
    
    if (hasSubItems) {
      // Menu có submenu: active khi có submenu đang active
      isMenuActive = hasActiveSubItem;
      
      // Debug log
      if (item.title.includes('RBAC') || item.title.includes('Quản trị')) {
        console.log(`\n🎯 Menu "${item.title}":`);
        console.log(`  Has submenu: true`);
        console.log(`  Has active sub: ${hasActiveSubItem}`);
        console.log(`  Is menu active: ${isMenuActive}\n`);
      }
    } else {
      // Menu không có submenu: exact match
      isMenuActive = normalizedPathname === normalizedItemUrl;
    }

    if (hasSubItems) {
      const isOpen = openMenu === item.url || hasActiveSubItem;
      
      return (
        <Collapsible 
          key={item.url} 
          open={isOpen}
          onOpenChange={(open) => {
            // Đánh dấu là user đang tương tác
            isUserInteractionRef.current = true;
            
            if (open) {
              // Mở menu này và đóng tất cả menu khác
              setOpenMenu(item.url);
            } else {
              // Đóng menu này
              setOpenMenu(null);
            }
            
            // Reset flag sau một khoảng ngắn
            setTimeout(() => {
              isUserInteractionRef.current = false;
            }, 100);
          }}
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton 
                tooltip={item.title}
                className={cn(
                  "w-full justify-between transition-colors duration-200 rounded-lg px-3 py-2.5 group/menu",
                  !isMenuActive && "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                  isMenuActive && "bg-primary/8 text-primary/90"
                )}
              >
                <div className="flex items-center gap-3">
                  {renderIcon(item.icon)}
                  <span className={cn("text-[14px] leading-5", isMenuActive ? "font-medium" : "font-normal")}>
                    {item.title}
                  </span>
                </div>
                <ChevronRight className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-90"
                )} />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub className="ml-9 mt-1 space-y-0.5">
                {item.subItems.map((subItem: any) => {
                  // Submenu CHỈ active khi EXACT MATCH pathname với URL
                  // Normalize: remove trailing slash and locale prefix
                  const normalizedPathname = cleanPathname.replace(/\/$/, '');
                  const normalizedSubUrl = subItem.url.replace(/\/$/, '');
                  
                  // EXACT MATCH ONLY - không dùng startsWith
                  const isSubActive = normalizedPathname === normalizedSubUrl;
                  
                  return (
                    <SidebarMenuSubItem key={subItem.url}>
                      <SidebarMenuSubButton
                        asChild
                        className={cn(
                          "transition-colors duration-200 rounded-md px-3 py-2 group/submenu",
                          !isSubActive && "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                          isSubActive && "bg-primary/5 text-primary/70"
                        )}
                      >
                        <Link href={subItem.url} className="flex items-center">
                          <span className={cn("text-[13px] leading-5", isSubActive ? "font-medium" : "font-normal")}>
                            {subItem.title}
                          </span>
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
      <SidebarMenuItem key={item.url}>
        <SidebarMenuButton
          asChild
          tooltip={item.title}
          className={cn(
            "transition-colors duration-200 rounded-lg px-3 py-2.5 group/menu",
            !isMenuActive && "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
            isMenuActive && "bg-primary/8 text-primary/90"
          )}
        >
          <Link 
            href={item.url} 
            className="flex items-center gap-3"
            onClick={() => {
              // Đánh dấu user interaction và đóng tất cả menu khi click vào menu không có submenu
              isUserInteractionRef.current = true;
              setOpenMenu(null);
              setTimeout(() => {
                isUserInteractionRef.current = false;
              }, 100);
            }}
          >
            {renderIcon(item.icon)}
            <span className={cn("text-[14px] leading-5", isMenuActive ? "font-medium" : "font-normal")}>
              {item.title}
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'config_manager': return 'bg-purple-500';
      case 'finance': return 'bg-blue-500';
      case 'price_manager': return 'bg-indigo-500';
      case 'customer_support': return 'bg-pink-500';
      case 'depot_manager': return 'bg-yellow-500';
      case 'inspector': return 'bg-teal-500';
      case 'depot_staff': return 'bg-green-500';
      case 'seller': return 'bg-orange-500';
      case 'buyer': return 'bg-cyan-500';
      default: return 'bg-gray-500';
    }
  };

  const getPrimaryRoleName = () => {
    if (!userInfo?.roles?.length) return 'User';
    
    const userLevel = Math.max(...userInfo.roles.map(role => ROLE_HIERARCHY[role] || 0));
    const primaryRole = userInfo.roles.find(role => ROLE_HIERARCHY[role] === userLevel) || 'buyer';
    
    const roleNames: Record<string, string> = {
      admin: 'Quản trị viên',
      config_manager: 'Quản lý cấu hình',
      finance: 'Kế toán',
      price_manager: 'Quản lý giá',
      customer_support: 'Hỗ trợ KH',
      depot_manager: 'Quản lý kho',
      inspector: 'Giám định viên',
      depot_staff: 'Nhân viên kho',
      seller: 'Người bán',
      buyer: 'Người mua',
    };
    
    return roleNames[primaryRole] || 'User';
  };

  // Group navigation items by category
  const groupNavigationItems = () => {
    const mainItems: any[] = [];
    const agentsItems: any[] = [];
    const appearanceItems: any[] = [];
    
    navigationItems.forEach((item) => {
      // Categorize based on icon/title keywords
      if (item.title.includes('User') || item.title.includes('Người dùng') || 
          item.title.includes('Agent') || item.title.includes('Quản lý')) {
        agentsItems.push(item);
      } else if (item.title.includes('Appearance') || item.title.includes('Knowledge') || 
                 item.title.includes('Article') || item.title.includes('Marketing') || 
                 item.title.includes('Cài đặt')) {
        appearanceItems.push(item);
      } else {
        mainItems.push(item);
      }
    });
    
    return { mainItems, agentsItems, appearanceItems };
  };

  const { mainItems, agentsItems, appearanceItems } = groupNavigationItems();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-5">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 transition-all">
            <Package className="h-4 w-4 text-primary-foreground group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-[15px] font-semibold leading-tight">
              i-ContExchange
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        {/* MENU Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 mb-2">
            MENU
          </SidebarGroupLabel>
          <SidebarGroupContent suppressHydrationWarning>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => renderMenuItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AGENTS & USERS Section */}
        {agentsItems.length > 0 && (
          <SidebarGroup className="mt-5">
            <SidebarGroupLabel className="text-[11px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 mb-2">
              AGENTS & USERS
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {agentsItems.map((item) => renderMenuItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* APPEARANCE & OTHERS Section */}
        {appearanceItems.length > 0 && (
          <SidebarGroup className="mt-5">
            <SidebarGroupLabel className="text-[11px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 mb-2">
              APPEARANCE & OTHERS
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {appearanceItems.map((item) => renderMenuItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-3 py-4">
        {isAuthenticated && userInfo ? (
          <div className="space-y-2">
            {/* User Info */}
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors cursor-pointer">
              <Avatar className="h-8 w-8 ring-1 ring-sidebar-border">
                <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                  {userInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="group-data-[collapsible=icon]:hidden flex-1 min-w-0">
                <p className="text-[13px] font-medium text-sidebar-foreground truncate leading-tight">{userInfo.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-[10px] text-white font-medium px-1.5 py-0 h-4",
                      getRoleBadgeColor(userInfo.roles?.[0] || 'guest')
                    )}
                  >
                    {getPrimaryRoleName()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="group-data-[collapsible=icon]:hidden">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors rounded-lg h-9"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="text-[13px]">Đăng xuất</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="group-data-[collapsible=icon]:hidden space-y-2">
            <Button asChild className="w-full rounded-lg h-9 text-[13px]">
              <Link href="/auth/login">Đăng nhập</Link>
            </Button>
            <Button asChild variant="outline" className="w-full rounded-lg h-9 text-[13px]">
              <Link href="/auth/register">Đăng ký</Link>
            </Button>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}