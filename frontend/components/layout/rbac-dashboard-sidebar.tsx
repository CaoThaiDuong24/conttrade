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

// ✅ PERMISSION-BASED MENU ITEMS
// Mỗi menu item có requiredPermission để tự động hiển thị dựa trên quyền
const ALL_MENU_ITEMS = [
  // Common items (no permission required or minimal permission)
  { 
    title: 'Dashboard', 
    url: '/dashboard', 
    icon: 'BarChart3',
    requiredPermission: 'PM-001', // VIEW_PUBLIC_LISTINGS
    order: 1
  },
  { 
    title: 'Container', 
    url: '/listings', 
    icon: 'Package',
    requiredPermission: 'PM-001', // VIEW_PUBLIC_LISTINGS
    order: 2
  },
  
  // Seller - Listing Management
  { 
    title: 'Bán hàng', 
    url: '/sell/new', 
    icon: 'Store',
    requiredPermission: 'PM-010', // CREATE_LISTING
    order: 3,
    subItems: [
      { title: 'Đăng tin mới', url: '/sell/new', icon: 'Plus' },
      { title: 'Tin đăng của tôi', url: '/sell/my-listings', icon: 'List' },
    ]
  },
  
  // Buyer - RFQ (Tạo yêu cầu báo giá)
  { 
    title: 'Yêu cầu báo giá', 
    url: '/rfq/buyer', 
    icon: 'FileText',
    requiredPermission: 'PM-020', // CREATE_RFQ
    order: 4,
    subItems: [
      { title: 'Tạo RFQ', url: '/rfq/create', icon: 'Plus' },
      { title: 'RFQ đã gửi', url: '/rfq/sent', icon: 'Send' },
    ]
  },
  
  // Seller - RFQ & Quotes (Trả lời RFQ và tạo báo giá)
  { 
    title: 'RFQ & Báo giá', 
    url: '/rfq/seller', 
    icon: 'Receipt',
    requiredPermission: 'PM-021', // ISSUE_QUOTE
    order: 5,
    subItems: [
      { title: 'RFQ nhận được', url: '/rfq/received', icon: 'Inbox' },
      { title: 'Tạo báo giá', url: '/quotes/create', icon: 'Plus' },
      { title: 'Quản lý báo giá', url: '/quotes/management', icon: 'List' },
    ]
  },
  
  // Orders (both buyer and seller)
  { 
    title: 'Đơn hàng', 
    url: '/orders', 
    icon: 'ShoppingCart',
    requiredPermission: 'PM-040', // CREATE_ORDER
    order: 6,
    subItems: [
      { title: 'Tất cả đơn hàng', url: '/orders', icon: 'List' },
      { title: 'Thanh toán', url: '/orders/checkout', icon: 'CreditCard' },
      { title: 'Theo dõi', url: '/orders/tracking', icon: 'Truck' },
    ]
  },
  
  // Payments (requires PAY_ESCROW permission)
  { 
    title: 'Thanh toán', 
    url: '/payments/escrow', 
    icon: 'DollarSign',
    requiredPermission: 'PM-041', // PAY_ESCROW
    order: 7,
    subItems: [
      { title: 'Ví escrow', url: '/payments/escrow', icon: 'Shield' },
      { title: 'Phương thức', url: '/payments/methods', icon: 'CreditCard' },
      { title: 'Lịch sử', url: '/payments/history', icon: 'History' },
    ]
  },
  
  // Inspection (buyer)
  { 
    title: 'Giám định', 
    url: '/inspection/new', 
    icon: 'Search',
    requiredPermission: 'PM-030', // REQUEST_INSPECTION
    order: 8
  },
  
  // Delivery
  { 
    title: 'Vận chuyển', 
    url: '/delivery', 
    icon: 'Truck',
    requiredPermission: 'PM-042', // REQUEST_DELIVERY
    order: 8
  },
  
  // Reviews
  { 
    title: 'Đánh giá', 
    url: '/reviews', 
    icon: 'Star',
    requiredPermission: 'PM-050', // RATE_AND_REVIEW
    order: 9,
    subItems: [
      { title: 'Tạo đánh giá', url: '/reviews/new', icon: 'Plus' },
    ]
  },
  
  // Disputes
  { 
    title: 'Khiếu nại', 
    url: '/disputes', 
    icon: 'AlertTriangle',
    requiredPermission: 'PM-060', // FILE_DISPUTE
    order: 10,
    subItems: [
      { title: 'Tạo khiếu nại', url: '/disputes/new', icon: 'Plus' },
    ]
  },
  
  // Depot Management
  { 
    title: 'Kho bãi', 
    url: '/depot/stock', 
    icon: 'Warehouse',
    requiredPermission: 'PM-083', // DEPOT_VIEW_STOCK
    order: 11,
    subItems: [
      { title: 'Tồn kho', url: '/depot/stock', icon: 'Package' },
      { title: 'Di chuyển', url: '/depot/movements', icon: 'ArrowRightLeft' },
      { title: 'Chuyển kho', url: '/depot/transfers', icon: 'Truck' },
      { title: 'Điều chỉnh', url: '/depot/adjustments', icon: 'Edit' },
      { title: 'Sửa chữa', url: '/depot/repairs', icon: 'Wrench' },
    ]
  },
  
  // Billing & Finance
  { 
    title: 'Hóa đơn', 
    url: '/billing', 
    icon: 'Receipt',
    requiredPermission: 'PM-090', // FINANCE_RECONCILE
    order: 12
  },
  
  // Finance Reconcile
  { 
    title: 'Đối soát', 
    url: '/finance/reconcile', 
    icon: 'Receipt',
    requiredPermission: 'PM-090', // FINANCE_RECONCILE
    order: 13
  },
  
  // Admin Section
  { 
    title: 'Quản trị', 
    url: '/admin', 
    icon: 'Settings',
    requiredPermission: 'PM-072', // ADMIN_VIEW_DASHBOARD
    order: 90,
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
  
  // RBAC Management
  { 
    title: 'Phân quyền RBAC', 
    url: '/admin/rbac', 
    icon: 'Shield',
    requiredPermission: 'PM-072', // ADMIN_VIEW_DASHBOARD
    order: 91,
    subItems: [
      { title: 'Tổng quan', url: '/admin/rbac', icon: 'BarChart3' },
      { title: 'Quản lý Role', url: '/admin/rbac/roles', icon: 'Shield' },
      { title: 'Ma trận phân quyền', url: '/admin/rbac/matrix', icon: 'List' },
      { title: 'Gán Role cho User', url: '/admin/rbac/users', icon: 'Users' },
    ]
  },
  
  // Account (all authenticated users)
  { 
    title: 'Tài khoản', 
    url: '/account/profile', 
    icon: 'User',
    requiredPermission: 'PM-001', // Basic permission
    order: 100,
    subItems: [
      { title: 'Hồ sơ', url: '/account/profile', icon: 'User' },
      { title: 'Cài đặt', url: '/account/settings', icon: 'Settings' },
    ]
  },
];

// Legacy: Navigation menu structure based on roles (for fallback)
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

  // ✅ PERMISSION-BASED MENU - Auto-generate menu based on user's actual permissions
  const getUserNavigationMenu = () => {
    if (!isAuthenticated || !userInfo?.roles?.length) {
      console.log('⚠️ Not authenticated or no roles - showing guest menu');
      return NAVIGATION_MENU.guest;
    }

    // Debug logs
    console.log('🔍 Sidebar - User roles:', userInfo.roles);
    console.log('🔍 Sidebar - User permissions:', userInfo.permissions?.length || 0, 'total');
    console.log('📋 Sidebar - Permission codes:', userInfo.permissions);

    const userPermissions = userInfo.permissions || [];
    const userRoles = userInfo.roles || [];
    const isAdmin = userRoles.includes('admin');

    // ✅ ALWAYS USE PERMISSION-BASED MENU - even for admin
    // This ensures menu only shows items user has permissions for
    console.log('🎯 Using PERMISSION-BASED MENU system for ALL users');
    
    const menuItems = ALL_MENU_ITEMS.filter(item => {
      // ✅ PURE PERMISSION-BASED FILTERING
      // Menu CHỈ hiển thị nếu user CÓ permission
      const hasPermission = !item.requiredPermission || 
                           userPermissions.includes(item.requiredPermission);
      
      if (hasPermission) {
        console.log(`✅ Menu "${item.title}": permission ${item.requiredPermission || 'none'} granted`);
      } else {
        console.log(`❌ Menu "${item.title}": missing permission ${item.requiredPermission}`);
      }
      
      return hasPermission;
    }).sort((a, b) => a.order - b.order); // Sort by order

    console.log(`📋 Final menu items count: ${menuItems.length}`);
    console.log(`📋 Menu items:`, menuItems.map(i => i.title));
    
    return menuItems;
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
      // ✅ FIX: Only access localStorage on client-side to prevent hydration error
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
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
    <Sidebar collapsible="icon" className="flex flex-col h-screen">
      <SidebarHeader className="flex-shrink-0">
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

      <SidebarContent className="px-3 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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

      <SidebarFooter className="flex-shrink-0 border-t border-sidebar-border px-3 py-4">
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