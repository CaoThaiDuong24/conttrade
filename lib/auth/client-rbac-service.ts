// Client-side RBAC Service for permission checking
export type Role = 'admin' | 'buyer' | 'seller' | 'org_owner' | 'depot_staff' | 'depot_manager' | 'moderator' | 'inspector' | 'finance' | 'customer_support' | 'price_manager' | 'config_manager' | 'guest';

export type Permission = 
  | 'VIEW_PUBLIC_LISTINGS'
  | 'SEARCH_LISTINGS'
  | 'VIEW_SELLER_PROFILE'
  | 'CREATE_LISTING'
  | 'EDIT_LISTING'
  | 'PUBLISH_LISTING'
  | 'ARCHIVE_LISTING'
  | 'DELETE_LISTING'
  | 'CREATE_RFQ'
  | 'ISSUE_QUOTE'
  | 'VIEW_QUOTES'
  | 'MANAGE_QA'
  | 'REDACTION_ENFORCE'
  | 'REQUEST_INSPECTION'
  | 'VIEW_INSPECTION_REPORT'
  | 'CREATE_ORDER'
  | 'PAY_ESCROW'
  | 'REQUEST_DELIVERY'
  | 'CONFIRM_RECEIPT'
  | 'RATE_AND_REVIEW'
  | 'FILE_DISPUTE'
  | 'RESOLVE_DISPUTE'
  | 'ADMIN_REVIEW_LISTING'
  | 'ADMIN_MANAGE_USERS'
  | 'ADMIN_VIEW_DASHBOARD'
  | 'ADMIN_CONFIG_PRICING'
  | 'MANAGE_PRICE_RULES'
  | 'DEPOT_CREATE_JOB'
  | 'DEPOT_UPDATE_JOB'
  | 'DEPOT_ISSUE_EIR'
  | 'DEPOT_VIEW_STOCK'
  | 'DEPOT_VIEW_MOVEMENTS'
  | 'DEPOT_ADJUST_STOCK'
  | 'DEPOT_TRANSFER_STOCK'
  | 'FINANCE_RECONCILE'
  | 'FINANCE_INVOICE'
  | 'CS_MANAGE_TICKETS'
  | 'CONFIG_NAMESPACE_RW'
  | 'CONFIG_ENTRY_RW'
  | 'CONFIG_PUBLISH'
  | 'FEATURE_FLAG_RW'
  | 'TAX_RATE_RW'
  | 'FEE_SCHEDULE_RW'
  | 'COMMISSION_RULE_RW'
  | 'TEMPLATE_RW'
  | 'I18N_RW'
  | 'FORM_SCHEMA_RW'
  | 'SLA_RW'
  | 'BUSINESS_HOURS_RW'
  | 'DEPOT_CALENDAR_RW'
  | 'INTEGRATION_CONFIG_RW'
  | 'PAYMENT_METHOD_RW'
  | 'PARTNER_RW';

// Role-based default permissions according to documentation
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  guest: ['VIEW_PUBLIC_LISTINGS', 'SEARCH_LISTINGS'], // RL-ANON
  
  buyer: [ // RL-BUYER
    'VIEW_PUBLIC_LISTINGS', 'SEARCH_LISTINGS', 'VIEW_SELLER_PROFILE', 'CREATE_RFQ', 'VIEW_QUOTES', 'REQUEST_INSPECTION', 'VIEW_INSPECTION_REPORT', 
    'CREATE_ORDER', 'PAY_ESCROW', 'REQUEST_DELIVERY', 'CONFIRM_RECEIPT', 'RATE_AND_REVIEW', 'FILE_DISPUTE'
  ],
  
  seller: [ // RL-SELLER
    'VIEW_PUBLIC_LISTINGS', 'SEARCH_LISTINGS', 'VIEW_SELLER_PROFILE', 'CREATE_LISTING', 'EDIT_LISTING', 'PUBLISH_LISTING', 'ARCHIVE_LISTING', 
    'DELETE_LISTING', 'ISSUE_QUOTE', 'VIEW_INSPECTION_REPORT'
  ],
  
  org_owner: [ // RL-ORG-OWNER (all seller permissions + org management)
    'VIEW_PUBLIC_LISTINGS', 'SEARCH_LISTINGS', 'VIEW_SELLER_PROFILE', 'CREATE_LISTING', 'EDIT_LISTING', 'PUBLISH_LISTING', 'ARCHIVE_LISTING', 
    'DELETE_LISTING', 'ISSUE_QUOTE', 'VIEW_INSPECTION_REPORT', 'ADMIN_MANAGE_USERS' // + limited user management in org scope
  ],
  
  depot_staff: [ // RL-DEPOT-STAFF
    'DEPOT_CREATE_JOB', 'DEPOT_UPDATE_JOB', 'DEPOT_ISSUE_EIR', 'DEPOT_VIEW_STOCK', 'DEPOT_VIEW_MOVEMENTS'
  ],
  
  depot_manager: [ // RL-DEPOT-MANAGER
    'DEPOT_CREATE_JOB', 'DEPOT_UPDATE_JOB', 'DEPOT_ISSUE_EIR', 'DEPOT_VIEW_STOCK', 'DEPOT_VIEW_MOVEMENTS', 'DEPOT_ADJUST_STOCK', 'DEPOT_TRANSFER_STOCK'
  ],
  
  inspector: [ // RL-INSPECTOR (was RL-MOD)
    'ADMIN_REVIEW_LISTING', 'RESOLVE_DISPUTE', 'ADMIN_VIEW_DASHBOARD' // review listings, resolve disputes, view dashboard
  ],
  
  moderator: [ // RL-MODERATOR
    'ADMIN_REVIEW_LISTING', 'RESOLVE_DISPUTE', 'ADMIN_VIEW_DASHBOARD' // same as inspector
  ],
  
  admin: [ // RL-ADMIN - full system admin (all 53 permissions)
    'VIEW_PUBLIC_LISTINGS', 'SEARCH_LISTINGS', 'VIEW_SELLER_PROFILE', 'CREATE_LISTING', 'EDIT_LISTING', 'PUBLISH_LISTING', 'ARCHIVE_LISTING', 'DELETE_LISTING', 'CREATE_RFQ', 'ISSUE_QUOTE', 'VIEW_QUOTES', 'MANAGE_QA', 'REDACTION_ENFORCE', 'REQUEST_INSPECTION', 'VIEW_INSPECTION_REPORT', 'CREATE_ORDER', 'PAY_ESCROW', 'REQUEST_DELIVERY', 'CONFIRM_RECEIPT', 'RATE_AND_REVIEW', 'FILE_DISPUTE', 'RESOLVE_DISPUTE', 'ADMIN_REVIEW_LISTING', 'ADMIN_MANAGE_USERS', 'ADMIN_VIEW_DASHBOARD', 'ADMIN_CONFIG_PRICING', 'MANAGE_PRICE_RULES', 'DEPOT_CREATE_JOB', 'DEPOT_UPDATE_JOB', 'DEPOT_ISSUE_EIR', 'DEPOT_VIEW_STOCK', 'DEPOT_VIEW_MOVEMENTS', 'DEPOT_ADJUST_STOCK', 'DEPOT_TRANSFER_STOCK', 'FINANCE_RECONCILE', 'FINANCE_INVOICE', 'CS_MANAGE_TICKETS', 'CONFIG_NAMESPACE_RW', 'CONFIG_ENTRY_RW', 'CONFIG_PUBLISH', 'FEATURE_FLAG_RW', 'TAX_RATE_RW', 'FEE_SCHEDULE_RW', 'COMMISSION_RULE_RW', 'TEMPLATE_RW', 'I18N_RW', 'FORM_SCHEMA_RW', 'SLA_RW', 'BUSINESS_HOURS_RW', 'DEPOT_CALENDAR_RW', 'INTEGRATION_CONFIG_RW', 'PAYMENT_METHOD_RW', 'PARTNER_RW'
  ],
  
  finance: [ // RL-FIN
    'FINANCE_RECONCILE', 'FINANCE_INVOICE', 'ADMIN_VIEW_DASHBOARD' // reconcile, invoice, view dashboard
  ],
  
  customer_support: [ // RL-CS
    'CS_MANAGE_TICKETS', 'ADMIN_VIEW_DASHBOARD' // manage tickets, view dashboard
  ],
  
  price_manager: [ // RL-PRICE
    'MANAGE_PRICE_RULES', 'ADMIN_VIEW_DASHBOARD' // manage price rules, view dashboard
  ],
  
  config_manager: [ // RL-CONFIG
    'CONFIG_NAMESPACE_RW', 'CONFIG_ENTRY_RW', 'CONFIG_PUBLISH', 'FEATURE_FLAG_RW', 'TAX_RATE_RW', 'FEE_SCHEDULE_RW', 'COMMISSION_RULE_RW', 
    'TEMPLATE_RW', 'I18N_RW', 'FORM_SCHEMA_RW', 'SLA_RW', 'BUSINESS_HOURS_RW', 'DEPOT_CALENDAR_RW', 'INTEGRATION_CONFIG_RW', 
    'PAYMENT_METHOD_RW', 'PARTNER_RW', 'ADMIN_VIEW_DASHBOARD' // all config permissions + dashboard view
  ]
};

/**
 * Client-side RBAC Service
 */
export class ClientRBACService {
  /**
   * Check if user has specific permission
   */
  static hasPermission(userRoles: Role[], userPermissions: Permission[], permission: Permission): boolean {
    // Check explicit permissions first
    if (userPermissions.includes(permission)) {
      return true;
    }

    // Check role-based permissions
    return userRoles.some(role => {
      const rolePermissions = ROLE_PERMISSIONS[role] || [];
      return rolePermissions.includes(permission);
    });
  }

  /**
   * Check if user has any of the specified permissions
   */
  static hasAnyPermission(userRoles: Role[], userPermissions: Permission[], permissions: Permission[]): boolean {
    return permissions.some(permission => 
      this.hasPermission(userRoles, userPermissions, permission)
    );
  }

  /**
   * Check if user has all specified permissions
   */
  static hasAllPermissions(userRoles: Role[], userPermissions: Permission[], permissions: Permission[]): boolean {
    return permissions.every(permission => 
      this.hasPermission(userRoles, userPermissions, permission)
    );
  }

  /**
   * Get all permissions for user roles
   */
  static getUserPermissions(userRoles: Role[]): Permission[] {
    const permissions = new Set<Permission>();
    
    userRoles.forEach(role => {
      const rolePermissions = ROLE_PERMISSIONS[role] || [];
      rolePermissions.forEach(permission => permissions.add(permission));
    });

    return Array.from(permissions);
  }

  /**
   * Check if user has specific role
   */
  static hasRole(userRoles: Role[], role: Role): boolean {
    return userRoles.includes(role);
  }

  /**
   * Check if user has any of the specified roles
   */
  static hasAnyRole(userRoles: Role[], roles: Role[]): boolean {
    return roles.some(role => userRoles.includes(role));
  }

  /**
   * Get role display name
   */
  static getRoleDisplayName(roleCode: Role): string {
    const roleMap: Record<Role, string> = {
      'admin': 'Quản trị hệ thống',
      'buyer': 'Người mua/thuê',
      'seller': 'Người bán/cho thuê',
      'org_owner': 'Chủ tổ chức',
      'depot_staff': 'Nhân viên Depot',
      'depot_manager': 'Quản lý Depot',
      'inspector': 'Kiểm duyệt viên',
      'moderator': 'Kiểm duyệt viên',
      'finance': 'Kế toán/Đối soát',
      'customer_support': 'Hỗ trợ khách hàng',
      'price_manager': 'Quản lý giá',
      'config_manager': 'Quản lý cấu hình',
      'guest': 'Khách vãng lai',
    };
    return roleMap[roleCode] || roleCode;
  }

  /**
   * Get primary role (highest level)
   */
  static getPrimaryRole(roles: Role[]): Role {
    const hierarchy: Record<Role, number> = {
      'admin': 100,
      'config_manager': 90,
      'finance': 80,
      'price_manager': 70,
      'inspector': 60,
      'moderator': 59,
      'org_owner': 50,
      'depot_manager': 40,
      'depot_staff': 30,
      'customer_support': 25,
      'seller': 20,
      'buyer': 10,
      'guest': 0
    };

    if (!roles.length) return 'guest';
    
    const userLevel = Math.max(...roles.map(role => hierarchy[role] || 0));
    return roles.find(role => hierarchy[role] === userLevel) || 'guest';
  }
}

export default ClientRBACService;