import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { normalizePermission } from './lib/auth/permission-mapper';

// Define route permissions mapping
const ROUTE_PERMISSIONS = {
  // Public routes (no auth required)
  '/': null,
  '/auth/login': null,
  '/auth/login/enhanced': null,
  '/auth/register': null,
  '/auth/forgot': null,
  '/auth/reset': null,
  '/help': null,
  '/legal': null,
  '/legal/terms': null,
  '/legal/privacy': null,
  '/listings': 'PM-001', // VIEW_PUBLIC_LISTINGS - Can be accessed by guests
  
  // Dashboard routes  
  '/dashboard': 'dashboard.view',
  '/dashboard/test': 'dashboard.view',
  
  // Account routes
  '/account/profile': 'account.read',
  '/account/verify': 'account.verify',
  
  // Buyer routes
  '/rfq': 'rfq.read',
  '/rfq/create': 'rfq.write',
  '/rfq/sent': 'rfq.read',
  '/rfq/received': 'rfq.read',
  '/orders': 'orders.read',
  '/orders/checkout': 'orders.write',
  '/orders/tracking': 'orders.read',
  '/payments': 'payments.view',
  '/payments/escrow': 'payments.escrow',
  '/payments/methods': 'payments.view',
  '/payments/history': 'payments.view',
  '/reviews': 'reviews.read',
  '/reviews/new': 'reviews.write',
  '/disputes': 'disputes.read',
  '/disputes/new': 'disputes.write',
  
  // Account routes
  '/account/settings': 'account.read',
  
  // Seller routes
  '/sell': 'PM-010', // CREATE_LISTING
  '/sell/new': 'PM-010', // CREATE_LISTING
  '/sell/my-listings': 'PM-011', // EDIT_LISTING (view/edit own listings)
  '/quotes/create': 'rfq.respond',
  '/quotes/management': 'rfq.respond',
  
  // Depot routes
  '/depot': 'depot.read',
  '/depot/stock': 'depot.inventory',
  '/depot/inspections': 'depot.inspect',
  '/depot/repairs': 'depot.repair',
  '/depot/movements': 'depot.inventory',
  '/depot/transfers': 'depot.inventory',
  '/depot/adjustments': 'depot.inventory',
  
  // Inspection routes
  '/inspection/new': 'inspection.schedule',
  '/inspection/reports': 'inspection.write',
  '/inspection/quality': 'inspection.write',
  
  // Delivery routes
  '/delivery': 'delivery.read',
  '/delivery/track': 'delivery.track',
  '/delivery/request': 'delivery.write',
  
  // Quotes compare
  '/quotes/compare': 'rfq.read',
  
  // Billing routes
  '/billing': 'billing.read',
  '/subscriptions': 'billing.read',
  
  // Finance routes
  '/finance/reconcile': 'billing.read',
  
  // Admin routes
  '/admin': 'admin.access',
  '/admin/users': 'admin.users',
  '/admin/users/kyc': 'admin.users',
  '/admin/listings': 'PM-070', // ADMIN_REVIEW_LISTING
  '/admin/disputes': 'admin.moderate',
  '/admin/config': 'admin.settings',
  '/admin/templates': 'admin.settings',
  '/admin/audit': 'admin.audit',
  '/admin/analytics': 'admin.analytics',
  '/admin/reports': 'admin.access',
  '/admin/rbac': 'admin.access',
  '/admin/rbac/roles': 'admin.access',
  '/admin/rbac/permissions': 'admin.access',
  '/admin/rbac/matrix': 'admin.access',
  '/admin/rbac/users': 'admin.access',
  
  // Dynamic routes (with [id] parameters)
  '/listings/[id]': 'PM-001', // VIEW_PUBLIC_LISTINGS
  '/orders/[id]': 'orders.read',
  '/rfq/[id]': 'rfq.read',
  '/rfq/[id]/qa': 'rfq.read',
  '/inspection/[id]': 'inspection.read',
  '/delivery/track/[id]': 'delivery.track',
  '/admin/users/[id]': 'admin.users',
  '/admin/disputes/[id]': 'admin.moderate',

} as const;

// Role hierarchy for fallback access (matching database levels)
const ROLE_HIERARCHY = {
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
} as const;

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['vi', 'en'],
  // Used when no locale matches
  defaultLocale: 'vi'
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🚪 MIDDLEWARE:', pathname);
  
  // Skip middleware for static files, API routes, and auth pages during login flow
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('/auth/login') ||
    pathname.includes('/auth/register') ||
    pathname.includes('/auth/forgot')
  ) {
    console.log('✅ SKIPPING middleware for:', pathname);
    return NextResponse.next();
  }

  // First, handle internationalization
  const intlResponse = intlMiddleware(request);
  
  // Extract locale from pathname
  const localeMatch = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  const locale = localeMatch ? localeMatch[1] : 'vi';
  const routePath = localeMatch ? (localeMatch[2] || '/') : pathname;

  // Check if route requires authentication
  const requiredPermission = getRequiredPermission(routePath);
  
  // Public routes - no auth required
  if (requiredPermission === null) {
    console.log('✅ Public route, allowing access to:', pathname);
    return intlResponse;
  }

  // Get auth token with better cookie handling
  const cookieToken = request.cookies.get('accessToken')?.value;
  const headerToken = request.headers.get('Authorization')?.replace('Bearer ', '');
  const token = cookieToken || headerToken;

  console.log('🔐 TOKEN CHECK:', {
    path: routePath,
    permission: requiredPermission,
    hasToken: !!token,
    tokenSource: cookieToken ? 'cookie' : headerToken ? 'header' : 'none'
  });

  if (!token) {
    console.log('❌ NO TOKEN - REDIRECT TO LOGIN');
    
    // Only redirect if not already on login page to prevent loops
    if (!pathname.includes('/auth/login')) {
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  try {
    // Verify JWT token using jose (Edge Runtime compatible)
    console.log('🔐 VERIFYING JWT...');
    
    const secret = new TextEncoder().encode('your-super-secret-jwt-key-change-in-production');
    const { payload } = await jwtVerify(token, secret);
    
    console.log('✅ JWT VALID for user:', payload.userId, 'Role:', payload.role || payload.roles);
    console.log('🔍 JWT PAYLOAD:', JSON.stringify(payload, null, 2));
    
    // Get roles from JWT payload first, fallback to email/userId-based detection
    const userRoles = await getUserRoles(
      payload.userId as string, 
      payload.role as string | undefined, 
      payload.roles as string[] | undefined,
      payload.email as string | undefined
    );
    const userPermissions = await getUserPermissions(userRoles);
    
    console.log('🔑 USER ROLES:', userRoles);
    console.log('🔑 USER PERMISSIONS:', userPermissions);
    
    // Check if user has required permission
    if (requiredPermission && !hasPermission(userPermissions, userRoles, requiredPermission)) {
      console.log('❌ PERMISSION DENIED:', requiredPermission);
      
      // Redirect to dashboard instead of login for authenticated users
      const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // Add user info to headers for server components
    const response = intlResponse instanceof Response ? intlResponse : NextResponse.next();
    response.headers.set('x-user-id', payload.userId as string);
    response.headers.set('x-user-roles', JSON.stringify(userRoles));
    response.headers.set('x-user-permissions', JSON.stringify(userPermissions));
    
    console.log('✅ ACCESS GRANTED:', pathname);
    return response;

  } catch (error) {
    console.error('❌ JWT INVALID:', error instanceof Error ? error.message : 'Unknown error');
    console.error('🔍 Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown',
      routePath: routePath,
      pathname: pathname
    });
    
    // Invalid token - redirect to login
    console.log('🔀 REDIRECTING TO LOGIN from:', pathname);
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

// Helper function to get required permission for a route
function getRequiredPermission(routePath: string) {
  // Check exact match first
  if (routePath in ROUTE_PERMISSIONS) {
    return ROUTE_PERMISSIONS[routePath as keyof typeof ROUTE_PERMISSIONS];
  }
  
  // Check if it's a sub-route of a defined route
  for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (routePath.startsWith(route + '/')) {
      return permission;
    }
  }
  
  // Log warning for undefined routes
  console.log('⚠️ Route not in ROUTE_PERMISSIONS:', routePath);
  
  // Smart defaults based on route patterns
  if (routePath.startsWith('/admin')) {
    console.log('→ Defaulting to admin.access for admin route');
    return 'admin.access';
  }
  if (routePath.startsWith('/depot')) {
    console.log('→ Defaulting to depot.read for depot route');
    return 'depot.read';
  }
  if (routePath.startsWith('/account')) {
    console.log('→ Defaulting to account.read for account route');
    return 'account.read';
  }
  
  // Default to requiring authentication for unlisted routes
  console.log('→ Defaulting to dashboard.view');
  return 'dashboard.view';
}

// Mock functions for user roles and permissions - replace with actual database calls
async function getUserRoles(userId: string, jwtRole?: string, jwtRoles?: string[], email?: string): Promise<string[]> {
  // Priority 1: Use roles from JWT payload (array)
  if (jwtRoles && Array.isArray(jwtRoles) && jwtRoles.length > 0) {
    console.log('📋 Using roles from JWT array:', jwtRoles);
    return jwtRoles;
  }
  
  // Priority 2: Use single role from JWT payload
  if (jwtRole) {
    console.log('📋 Using role from JWT:', jwtRole);
    return [jwtRole];
  }
  
  // Priority 3: Check email patterns (fallback for old tokens without roles)
  if (email) {
    // Admin role
    if (email.includes('admin@')) {
      console.log('📋 Detected admin from email pattern');
      return ['admin'];
    }
    
    // Depot roles
    if (email.includes('depot-manager@') || email.includes('manager@depot')) {
      console.log('📋 Detected depot_manager from email');
      return ['depot_manager'];
    }
    if (email.includes('depot@') || email.includes('depot-staff@') || email.includes('staff@depot')) {
      console.log('📋 Detected depot_staff from email');
      return ['depot_staff'];
    }
    
    // Inspector role
    if (email.includes('inspector@') || email.includes('inspect@')) {
      console.log('📋 Detected inspector from email');
      return ['inspector'];
    }
    
    // Finance role
    if (email.includes('finance@') || email.includes('financial@')) {
      console.log('📋 Detected finance from email');
      return ['finance'];
    }
    
    // Config Manager role
    if (email.includes('config@') || email.includes('config-manager@') || email.includes('configuration@')) {
      console.log('📋 Detected config_manager from email');
      return ['config_manager'];
    }
    
    // Price Manager role
    if (email.includes('price@') || email.includes('price-manager@') || email.includes('pricing@')) {
      console.log('📋 Detected price_manager from email');
      return ['price_manager'];
    }
    
    // Customer Support role
    if (email.includes('support@') || email.includes('cs@') || email.includes('customer-support@')) {
      console.log('📋 Detected customer_support from email');
      return ['customer_support'];
    }
    
    // Seller role
    if (email.includes('seller@') || email.includes('vendor@')) {
      console.log('📋 Detected seller from email');
      return ['seller'];
    }
    
    // Buyer role (explicit)
    if (email.includes('buyer@') || email.includes('purchase@')) {
      console.log('📋 Detected buyer from email');
      return ['buyer'];
    }
  }
  
  // Priority 4: Check userId patterns (fallback for old tokens)
  if (userId.includes('admin')) {
    console.log('📋 Detected admin from userId');
    return ['admin'];
  }
  if (userId.includes('depot_manager') || userId.includes('manager')) {
    console.log('📋 Detected depot_manager from userId');
    return ['depot_manager'];
  }
  if (userId.includes('depot_staff') || userId.includes('depot')) {
    console.log('📋 Detected depot_staff from userId');
    return ['depot_staff'];
  }
  if (userId.includes('inspector')) {
    console.log('📋 Detected inspector from userId');
    return ['inspector'];
  }
  if (userId.includes('seller')) {
    console.log('📋 Detected seller from userId');
    return ['seller'];
  }
  
  console.log('📋 Defaulting to buyer role');
  return ['buyer']; // Default to buyer
}

async function getUserPermissions(roles: string[]): Promise<string[]> {
  // This would typically be a database call to get user permissions
  // Mock permissions based on role
  console.log('🔑 Getting permissions for roles:', roles);
  
  if (roles.includes('admin')) {
    return [
      'dashboard.view',
      'account.read', 'account.write', 'account.verify',
      'admin.access', 'admin.users', 'admin.moderate', 'admin.settings', 'admin.audit', 'admin.analytics',
      'PM-001', 'PM-002', 'PM-010', 'PM-011', 'PM-012', 'PM-013', 'PM-014', 'PM-070', // All listing permissions
      'orders.read', 'orders.write', 'orders.process',
      'payments.view', 'payments.process', 'payments.escrow',
      'delivery.read', 'delivery.write', 'delivery.schedule',
      'depot.read', 'depot.write', 'depot.inventory', 'depot.inspect', 'depot.repair',
      'inspection.read', 'inspection.write', 'inspection.schedule',
      'reviews.read', 'reviews.write', 'reviews.moderate',
      'disputes.read', 'disputes.write', 'disputes.resolve',
      'billing.read', 'billing.write'
    ];
  }
  
  if (roles.includes('depot_manager')) {
    return [
      'dashboard.view',
      'account.read', 'account.write',
      'depot.read', 'depot.write', 'depot.inventory', 'depot.inspect', 'depot.repair',
      'inspection.read', 'inspection.write',
      'orders.read', 'delivery.read',
      'billing.read', 'reviews.read', 'reviews.write'
    ];
  }
  
  if (roles.includes('depot_staff')) {
    return [
      'dashboard.view',
      'account.read', 'account.write',
      'depot.read', 'depot.inventory', 'depot.inspect', 'depot.repair',
      'delivery.read'
    ];
  }
  
  if (roles.includes('inspector')) {
    return [
      'dashboard.view',
      'account.read', 'account.write',
      'inspection.read', 'inspection.write', 'inspection.schedule',
      'depot.read'
    ];
  }
  
  if (roles.includes('config_manager')) {
    return [
      'dashboard.view',
      'account.read', 'account.write',
      'admin.settings'
    ];
  }
  
  if (roles.includes('finance')) {
    return [
      'dashboard.view',
      'account.read', 'account.write',
      'billing.read', 'billing.write',
      'payments.view', 'payments.process', 'payments.escrow'
    ];
  }
  
  if (roles.includes('price_manager')) {
    return [
      'dashboard.view',
      'account.read', 'account.write',
      'admin.settings',
      'PM-001' // VIEW_PUBLIC_LISTINGS
    ];
  }
  
  if (roles.includes('customer_support')) {
    return [
      'dashboard.view',
      'account.read', 'account.write',
      'disputes.read', 'disputes.resolve',
      'orders.read', 'reviews.read'
    ];
  }
  
  if (roles.includes('seller')) {
    return [
      'dashboard.view',
      'account.read', 'account.write',
      'PM-001', 'PM-002', 'PM-010', 'PM-011', 'PM-012', 'PM-013', 'PM-014', // Seller listing permissions
      'rfq.read', 'rfq.respond',
      'orders.read',
      'delivery.read',
      'reviews.read', 'reviews.write',
      'disputes.read',
      'billing.read'
    ];
  }
  
  // Default buyer permissions
  return [
    'dashboard.view',
    'account.read', 'account.write',
    'PM-001', 'PM-002', // VIEW and SEARCH listings
    'rfq.read', 'rfq.write',
    'orders.read', 'orders.write',
    'payments.view', 'payments.escrow',
    'delivery.read',
    'inspection.schedule',
    'reviews.read', 'reviews.write',
    'disputes.read', 'disputes.write'
  ];
}

// Helper function to check if user has permission
function hasPermission(userPermissions: string[], userRoles: string[], requiredPermission: string): boolean {
  // Check direct permission
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }
  
  // Check role-based fallback
  const userLevel = Math.max(...userRoles.map(role => ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY] || 0));
  
  // Admin can access everything
  if (userLevel >= ROLE_HIERARCHY.admin) {
    return true;
  }
  
  // Special case: Allow buyers and above to view public listings
  if (requiredPermission === 'PM-001' && userLevel >= ROLE_HIERARCHY.buyer) {
    console.log('✅ Allowing PM-001 (VIEW_PUBLIC_LISTINGS) for authenticated user');
    return true;
  }
  
  return false;
}

export const config = {
  // Match all routes except API routes and static files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};