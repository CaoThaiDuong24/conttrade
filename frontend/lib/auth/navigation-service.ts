// Navigation Service
// @ts-nocheck
import type { Role } from './client-rbac-service';

export interface NavigationItem {
  title: string;
  url: string;
  icon: string;
  badge?: string;
  subItems?: NavigationItem[];
  permissions?: Permission[];
  roles?: Role[];
}

export interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

export class NavigationService {
  // Role hierarchy for determining primary role
  private static ROLE_HIERARCHY: Record<Role, number> = {
    'admin': 100,
    'config_manager': 90,
    'finance': 80,
    'price_manager': 70,
    'inspector': 60,
    'org_owner': 50,
    'depot_manager': 40,
    'depot_staff': 30,
    'customer_support': 25,
    'seller': 20,
    'buyer': 10,
    'guest': 0
  };

  static getPrimaryRole(userRoles: Role[]): Role {
    if (!userRoles.length) return 'guest';
    
    // Get the role with highest hierarchy level
    const userLevel = Math.max(...userRoles.map(role => this.ROLE_HIERARCHY[role] || 0));
    return userRoles.find(role => this.ROLE_HIERARCHY[role] === userLevel) || 'buyer';
  }

  static getNavigationMenu(
    userRoles: Role[],
    userPermissions: Permission[]
  ): NavigationGroup[] {
    const items: NavigationItem[] = [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: 'BarChart3',
        permissions: ['VIEW_PUBLIC_LISTINGS'],
      },
      {
        title: 'Container',
        url: '/listings',
        icon: 'Package',
        permissions: ['VIEW_PUBLIC_LISTINGS'],
      },
    ];

    if (userRoles.includes('admin')) {
      items.push(
        {
          title: 'Admin Panel',
          url: '/admin',
          icon: 'Settings',
          permissions: ['ADMIN_VIEW_DASHBOARD'],
        },
        {
          title: 'User Management',
          url: '/admin/users',
          icon: 'Users',
          permissions: ['ADMIN_MANAGE_USERS'],
        },
        {
          title: 'Listing Management',
          url: '/admin/listings',
          icon: 'ClipboardList',
          permissions: ['ADMIN_REVIEW_LISTING'],
        },
        {
          title: 'Price Management',
          url: '/admin/pricing',
          icon: 'DollarSign',
          permissions: ['ADMIN_CONFIG_PRICING'],
        },
        {
          title: 'System Config',
          url: '/admin/config',
          icon: 'Wrench',
          permissions: ['CONFIG_NAMESPACE_RW'],
        }
      );
    }

    if (userRoles.includes('seller')) {
      items.push(
        {
          title: 'Create Listing',
          url: '/listings/create',
          icon: 'Plus',
          permissions: ['CREATE_LISTING'],
        },
        {
          title: 'My Orders',
          url: '/orders',
          icon: 'ShoppingCart',
          permissions: ['orders.read'],
        }
      );
    }

    if (userRoles.includes('buyer')) {
      items.push(
        {
          title: 'My Orders',
          url: '/orders',
          icon: 'ShoppingCart',
          permissions: ['CREATE_ORDER'],
        },
        {
          title: 'My RFQs',
          url: '/rfqs',
          icon: 'FileText',
          permissions: ['CREATE_RFQ'],
        }
      );
    }

    if (userRoles.includes('depot_staff') || userRoles.includes('depot_manager')) {
      items.push(
        {
          title: 'Depot Operations',
          url: '/depot',
          icon: 'Warehouse',
          permissions: ['DEPOT_VIEW_STOCK'],
        },
        {
          title: 'Stock Management',
          url: '/depot/stock',
          icon: 'Package',
          permissions: ['DEPOT_ADJUST_STOCK'],
        }
      );
    }

    if (userRoles.includes('finance')) {
      items.push(
        {
          title: 'Finance',
          url: '/finance',
          icon: 'CreditCard',
          permissions: ['FINANCE_RECONCILE'],
        },
        {
          title: 'Invoicing',
          url: '/finance/invoices',
          icon: 'Receipt',
          permissions: ['FINANCE_INVOICE'],
        }
      );
    }

    return [
      {
        title: 'Main',
        items: items.filter(item => 
          !item.permissions || 
          item.permissions.some(permission => userPermissions.includes(permission))
        ),
      },
    ];
  }

  static getRoleDisplayName(roleCode: Role): string {
    const roleNames: Record<Role, string> = {
      admin: 'Administrator',
      buyer: 'Buyer',
      seller: 'Seller',
      org_owner: 'Organization Owner',
      depot_staff: 'Depot Staff',
      depot_manager: 'Depot Manager',
      inspector: 'Inspector',
      finance: 'Finance',
      customer_support: 'Customer Support',
      price_manager: 'Price Manager',
      config_manager: 'Config Manager',
      guest: 'Guest',
    };
    
    return roleNames[roleCode] || roleCode;
  }

  static addLocalePrefix(url: string, locale: string = 'vi'): string {
    if (url.startsWith('/')) {
      return `/${locale}${url}`;
    }
    return url;
  }
}

export default NavigationService;
