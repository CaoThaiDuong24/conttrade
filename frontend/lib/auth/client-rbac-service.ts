// Client-side RBAC Service for permission checking
// 10 roles from database (matching seed-complete-rbac.mjs)
export type Role = 
  | 'admin'           // Level 100 - Full system admin
  | 'config_manager'  // Level 80  - Configuration management
  | 'finance'         // Level 70  - Finance & accounting
  | 'price_manager'   // Level 60  - Price management
  | 'customer_support'// Level 50  - Customer support
  | 'depot_manager'   // Level 30  - Depot management
  | 'inspector'       // Level 25  - Inspector
  | 'depot_staff'     // Level 20  - Depot staff
  | 'seller'          // Level 10  - Seller
  | 'buyer';          // Level 10  - Buyer

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
  admin: [ // RL-ADMIN - full system admin (all 53 permissions)
    'VIEW_PUBLIC_LISTINGS', 'SEARCH_LISTINGS', 'VIEW_SELLER_PROFILE', 'CREATE_LISTING', 'EDIT_LISTING', 'PUBLISH_LISTING', 'ARCHIVE_LISTING', 'DELETE_LISTING', 'CREATE_RFQ', 'ISSUE_QUOTE', 'VIEW_QUOTES', 'MANAGE_QA', 'REDACTION_ENFORCE', 'REQUEST_INSPECTION', 'VIEW_INSPECTION_REPORT', 'CREATE_ORDER', 'PAY_ESCROW', 'REQUEST_DELIVERY', 'CONFIRM_RECEIPT', 'RATE_AND_REVIEW', 'FILE_DISPUTE', 'RESOLVE_DISPUTE', 'ADMIN_REVIEW_LISTING', 'ADMIN_MANAGE_USERS', 'ADMIN_VIEW_DASHBOARD', 'ADMIN_CONFIG_PRICING', 'MANAGE_PRICE_RULES', 'DEPOT_CREATE_JOB', 'DEPOT_UPDATE_JOB', 'DEPOT_ISSUE_EIR', 'DEPOT_VIEW_STOCK', 'DEPOT_VIEW_MOVEMENTS', 'DEPOT_ADJUST_STOCK', 'DEPOT_TRANSFER_STOCK', 'FINANCE_RECONCILE', 'FINANCE_INVOICE', 'CS_MANAGE_TICKETS', 'CONFIG_NAMESPACE_RW', 'CONFIG_ENTRY_RW', 'CONFIG_PUBLISH', 'FEATURE_FLAG_RW', 'TAX_RATE_RW', 'FEE_SCHEDULE_RW', 'COMMISSION_RULE_RW', 'TEMPLATE_RW', 'I18N_RW', 'FORM_SCHEMA_RW', 'SLA_RW', 'BUSINESS_HOURS_RW', 'DEPOT_CALENDAR_RW', 'INTEGRATION_CONFIG_RW', 'PAYMENT_METHOD_RW', 'PARTNER_RW'
  ],
  
  config_manager: [ // RL-CONFIG
    'CONFIG_NAMESPACE_RW', 'CONFIG_ENTRY_RW', 'CONFIG_PUBLISH', 'FEATURE_FLAG_RW', 'TAX_RATE_RW', 'FEE_SCHEDULE_RW', 'COMMISSION_RULE_RW', 
    'TEMPLATE_RW', 'I18N_RW', 'FORM_SCHEMA_RW', 'SLA_RW', 'BUSINESS_HOURS_RW', 'DEPOT_CALENDAR_RW', 'INTEGRATION_CONFIG_RW', 
    'PAYMENT_METHOD_RW', 'PARTNER_RW', 'ADMIN_VIEW_DASHBOARD'
  ],
  
  finance: [ // RL-FIN
    'FINANCE_RECONCILE', 'FINANCE_INVOICE', 'ADMIN_VIEW_DASHBOARD', 'VIEW_PUBLIC_LISTINGS', 'SEARCH_LISTINGS', 'CREATE_ORDER', 'CONFIRM_RECEIPT'
  ],
  
  price_manager: [ // RL-PRICE
    'MANAGE_PRICE_RULES', 'ADMIN_CONFIG_PRICING', 'ADMIN_VIEW_DASHBOARD', 'VIEW_PUBLIC_LISTINGS', 'SEARCH_LISTINGS'
  ],
  
  customer_support: [ // RL-CS
    'CS_MANAGE_TICKETS', 'FILE_DISPUTE', 'RESOLVE_DISPUTE', 'ADMIN_VIEW_DASHBOARD', 'VIEW_PUBLIC_LISTINGS', 'SEARCH_LISTINGS'
  ],
  
  depot_manager: [ // RL-DEPOT-MANAGER
    'DEPOT_CREATE_JOB', 'DEPOT_UPDATE_JOB', 'DEPOT_ISSUE_EIR', 'DEPOT_VIEW_STOCK', 'DEPOT_VIEW_MOVEMENTS', 'DEPOT_ADJUST_STOCK', 'DEPOT_TRANSFER_STOCK', 'VIEW_PUBLIC_LISTINGS', 'SEARCH_LISTINGS'
  ],
  
  inspector: [ // RL-INSPECTOR
    'REQUEST_INSPECTION', 'VIEW_INSPECTION_REPORT', 'VIEW_PUBLIC_LISTINGS', 'SEARCH_LISTINGS'
  ],
  
  depot_staff: [ // RL-DEPOT-STAFF
    'DEPOT_VIEW_STOCK', 'DEPOT_VIEW_MOVEMENTS', 'VIEW_PUBLIC_LISTINGS', 'SEARCH_LISTINGS'
  ],
  
  seller: [ // RL-SELLER
    'VIEW_PUBLIC_LISTINGS', 'SEARCH_LISTINGS', 'VIEW_SELLER_PROFILE', 'CREATE_LISTING', 'EDIT_LISTING', 'PUBLISH_LISTING', 'ARCHIVE_LISTING', 
    'DELETE_LISTING', 'ISSUE_QUOTE', 'VIEW_QUOTES', 'CREATE_ORDER', 'RATE_AND_REVIEW'
  ],
  
  buyer: [ // RL-BUYER
    'VIEW_PUBLIC_LISTINGS', 'SEARCH_LISTINGS', 'VIEW_SELLER_PROFILE', 'CREATE_RFQ', 'VIEW_QUOTES', 'REQUEST_INSPECTION', 'VIEW_INSPECTION_REPORT', 
    'CREATE_ORDER', 'PAY_ESCROW', 'REQUEST_DELIVERY', 'CONFIRM_RECEIPT', 'RATE_AND_REVIEW', 'FILE_DISPUTE'
  ],
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
      'admin': 'Quản trị viên',
      'config_manager': 'Quản lý cấu hình',
      'finance': 'Kế toán',
      'price_manager': 'Quản lý giá',
      'customer_support': 'Hỗ trợ khách hàng',
      'depot_manager': 'Quản lý kho bãi',
      'inspector': 'Giám định viên',
      'depot_staff': 'Nhân viên kho',
      'seller': 'Người bán',
      'buyer': 'Người mua',
    };
    return roleMap[roleCode] || roleCode;
  }

  /**
   * Get primary role (highest level)
   */
  static getPrimaryRole(roles: Role[]): Role | null {
    const hierarchy: Record<Role, number> = {
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

    if (!roles.length) return null;
    
    const userLevel = Math.max(...roles.map(role => hierarchy[role] || 0));
    return roles.find(role => hierarchy[role] === userLevel) || null;
  }
}

export default ClientRBACService;