import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

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
  
  // Dashboard routes - Allow all authenticated users
  '/dashboard': 'PM-001', // Basic authenticated access - all users can view dashboard
  '/dashboard/test': 'PM-001', // Basic authenticated access
  
  // Account routes
  '/account/profile': 'PM-001', // Basic authenticated access
  '/account/verify': 'PM-001', // Basic authenticated access
  
  // Buyer routes - RFQ
  '/rfq': ['PM-020', 'PM-021'], // CREATE_RFQ (buyer) or ISSUE_QUOTE (seller) - both can access
  '/rfq/create': 'PM-020', // CREATE_RFQ
  '/rfq/sent': 'PM-020', // CREATE_RFQ
  '/rfq/received': 'PM-021', // ISSUE_QUOTE

  // Buyer routes - Orders
  '/orders': 'PM-040', // CREATE_ORDER
  '/orders/checkout': 'PM-040', // CREATE_ORDER
  '/orders/tracking': 'PM-040', // CREATE_ORDER

  // Buyer routes - Payments
  '/payments': 'PM-041', // PAY_ESCROW
  '/payments/escrow': 'PM-041', // PAY_ESCROW
  '/payments/methods': 'PM-041', // PAY_ESCROW
  '/payments/history': 'PM-041', // PAY_ESCROW

  // Reviews
  '/reviews': 'PM-050', // RATE_AND_REVIEW
  '/reviews/new': 'PM-050', // RATE_AND_REVIEW

  // Disputes
  '/disputes': 'PM-060', // FILE_DISPUTE
  '/disputes/new': 'PM-060', // FILE_DISPUTE

  // Account routes
  '/account/settings': 'PM-001', // Basic authenticated access

  // Seller routes
  '/sell': 'PM-010', // CREATE_LISTING
  '/sell/new': 'PM-010', // CREATE_LISTING
  '/sell/my-listings': 'PM-011', // EDIT_LISTING (view/edit own listings)
  '/quotes/create': 'PM-021', // ISSUE_QUOTE
  '/quotes/management': 'PM-022', // VIEW_QUOTES

  // Depot routes
  '/depot': 'PM-083', // DEPOT_VIEW_STOCK
  '/depot/stock': 'PM-083', // DEPOT_VIEW_STOCK
  '/depot/inspections': 'PM-082', // DEPOT_ISSUE_EIR
  '/depot/repairs': 'PM-081', // DEPOT_UPDATE_JOB
  '/depot/movements': 'PM-084', // DEPOT_VIEW_MOVEMENTS
  '/depot/transfers': 'PM-086', // DEPOT_TRANSFER_STOCK
  '/depot/adjustments': 'PM-085', // DEPOT_ADJUST_STOCK

  // Inspection routes
  '/inspection/new': 'PM-030', // REQUEST_INSPECTION
  '/inspection/reports': 'PM-031', // VIEW_INSPECTION_REPORT
  '/inspection/quality': 'PM-031', // VIEW_INSPECTION_REPORT

  // Delivery routes
  '/delivery': ['PM-042', 'PM-042B'], // REQUEST_DELIVERY or VIEW_DELIVERY (seller)
  '/delivery/track': ['PM-042', 'PM-042B'], // REQUEST_DELIVERY or VIEW_DELIVERY (seller)
  '/delivery/request': 'PM-042', // REQUEST_DELIVERY (buyer only)

  // Quotes compare
  '/quotes/compare': 'PM-022', // VIEW_QUOTES

  // Billing routes
  '/billing': ['PM-090', 'PM-091B'], // FINANCE_RECONCILE or VIEW_SELLER_INVOICES (seller)
  '/subscriptions': 'PM-090', // FINANCE_RECONCILE

  // Finance routes
  '/finance/reconcile': 'PM-090', // FINANCE_RECONCILE

  // Admin routes
  '/admin': 'PM-072', // ADMIN_VIEW_DASHBOARD
  '/admin/users': 'PM-071', // ADMIN_MANAGE_USERS
  '/admin/users/kyc': 'PM-071', // ADMIN_MANAGE_USERS
  '/admin/listings': 'PM-070', // ADMIN_REVIEW_LISTING
  '/admin/disputes': 'PM-061', // RESOLVE_DISPUTE
  '/admin/config': 'PM-073', // ADMIN_CONFIG_PRICING
  '/admin/templates': 'PM-117', // TEMPLATE_RW
  '/admin/audit': 'PM-072', // ADMIN_VIEW_DASHBOARD
  '/admin/analytics': 'PM-072', // ADMIN_VIEW_DASHBOARD
  '/admin/reports': 'PM-072', // ADMIN_VIEW_DASHBOARD
  '/admin/rbac': 'PM-072', // ADMIN_VIEW_DASHBOARD
  '/admin/rbac/roles': 'PM-072', // ADMIN_VIEW_DASHBOARD
  '/admin/rbac/permissions': 'PM-072', // ADMIN_VIEW_DASHBOARD
  '/admin/rbac/matrix': 'PM-072', // ADMIN_VIEW_DASHBOARD
  '/admin/rbac/users': 'PM-071', // ADMIN_MANAGE_USERS

  // Dynamic routes (with [id] parameters)
  '/listings/[id]': 'PM-001', // VIEW_PUBLIC_LISTINGS
  '/orders/[id]': 'PM-040', // CREATE_ORDER
  '/rfq/[id]': 'PM-020', // CREATE_RFQ
  '/rfq/[id]/qa': 'PM-023', // MANAGE_QA
  '/inspection/[id]': 'PM-031', // VIEW_INSPECTION_REPORT
  '/delivery/track/[id]': 'PM-042', // REQUEST_DELIVERY
  '/admin/users/[id]': 'PM-071', // ADMIN_MANAGE_USERS
  '/admin/disputes/[id]': 'PM-061', // RESOLVE_DISPUTE

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
    
    // ✅ REALTIME PERMISSIONS: Always query from database to get latest permissions
    // This ensures admin can grant/revoke permissions and they take effect immediately
    let userRoles: string[] = [];
    let userPermissions: string[] = [];
    
    try {
      // Call backend API to get fresh user data with latest permissions
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
      const meResponse = await fetch(`${backendUrl}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (meResponse.ok) {
        const meData = await meResponse.json();
        if (meData.success && meData.data?.user) {
          const userData = meData.data.user;
          
          // Extract roles (can be array of strings OR array of objects with code)
          if (Array.isArray(userData.roles)) {
            userRoles = userData.roles.map((r: any) => 
              typeof r === 'string' ? r : r.code
            );
          }
          
          // Extract permissions - flatten from all roles if permissions are nested in roles
          const permissionSet = new Set<string>();
          
          // Case 1: permissions is a direct array of strings
          if (Array.isArray(userData.permissions) && userData.permissions.length > 0) {
            userData.permissions.forEach((p: any) => {
              const permCode = typeof p === 'string' ? p : p.code;
              if (permCode) permissionSet.add(permCode);
            });
          }
          
          // Case 2: permissions are nested in roles array
          if (Array.isArray(userData.roles)) {
            userData.roles.forEach((role: any) => {
              if (role.permissions && Array.isArray(role.permissions)) {
                role.permissions.forEach((p: any) => {
                  const permCode = typeof p === 'string' ? p : p.code;
                  if (permCode) permissionSet.add(permCode);
                });
              }
            });
          }
          
          userPermissions = Array.from(permissionSet);
          
          console.log('✅ Got REALTIME permissions from database via /auth/me');
          console.log('🔑 USER ROLES:', userRoles);
          console.log('🔑 USER PERMISSIONS:', userPermissions.length, 'permissions');
          console.log('🔑 Sample permissions:', userPermissions.slice(0, 5).join(', '));
        } else {
          throw new Error('Invalid response from /auth/me');
        }
      } else {
        throw new Error(`Failed to fetch user data: ${meResponse.status}`);
      }
    } catch (error) {
      // Fallback to JWT-based permissions if API call fails
      console.warn('⚠️ Failed to fetch realtime permissions, using JWT fallback:', error);
      
      userRoles = await getUserRoles(
        payload.userId as string, 
        payload.role as string | undefined, 
        payload.roles as string[] | undefined,
        payload.email as string | undefined
      );
      
      userPermissions = (payload.permissions && Array.isArray(payload.permissions) && payload.permissions.length > 0)
        ? payload.permissions as string[]
        : await getUserPermissions(userRoles);
        
      console.log('🔑 USER ROLES (fallback):', userRoles);
      console.log('🔑 USER PERMISSIONS (fallback):', userPermissions);
    }
    
    // Check if user has required permission
    const hasRequiredPermission = requiredPermission ? hasPermission(userPermissions, userRoles, requiredPermission) : true;
    
    if (requiredPermission && !hasRequiredPermission) {
      console.log('⚠️ PERMISSION MISSING:', requiredPermission, '- But allowing access to show "Under Development" page');
    }

    // Add user info to headers for server components
    const response = intlResponse instanceof Response ? intlResponse : NextResponse.next();
    
    // Add permission check result to headers so pages can show appropriate content
    response.headers.set('x-has-permission', hasRequiredPermission.toString());
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
    console.log('→ Defaulting to PM-072 (ADMIN_VIEW_DASHBOARD) for admin route');
    return 'PM-072';
  }
  if (routePath.startsWith('/depot')) {
    console.log('→ Defaulting to PM-083 (DEPOT_VIEW_STOCK) for depot route');
    return 'PM-083';
  }
  if (routePath.startsWith('/account')) {
    console.log('→ Defaulting to PM-001 (basic authenticated access) for account route');
    return 'PM-001';
  }
  
  // ⚠️ DEFAULT: Allow authenticated users for undefined routes
  // This prevents redirect loops when users access valid routes not in the permissions map
  console.log('→ Defaulting to PM-001 (basic authenticated access) for undefined route');
  return 'PM-001';
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
      'PM-001', 'PM-002', 'PM-003', // View, search listings, view seller profile
      'PM-010', 'PM-011', 'PM-012', 'PM-013', 'PM-014', // All listing permissions
      'PM-020', 'PM-021', 'PM-022', 'PM-023', 'PM-024', // RFQ permissions
      'PM-030', 'PM-031', // Inspection permissions
      'PM-040', 'PM-041', 'PM-042', 'PM-043', // Order permissions
      'PM-050', // Reviews
      'PM-060', 'PM-061', // Dispute permissions
      'PM-070', 'PM-071', 'PM-072', 'PM-073', 'PM-074', // Admin permissions
      'PM-080', 'PM-081', 'PM-082', 'PM-083', 'PM-084', 'PM-085', 'PM-086', // Depot permissions
      'PM-090', 'PM-091', // Finance permissions
      'PM-100', // Customer support
      'PM-110', 'PM-111', 'PM-112', 'PM-113', 'PM-114', 'PM-115', 'PM-116', 'PM-117', 'PM-118', 'PM-119', 'PM-120', 'PM-121', 'PM-122', 'PM-123', 'PM-124', 'PM-125' // Config permissions
    ];
  }

  if (roles.includes('depot_manager')) {
    return [
      'PM-001', 'PM-002', // View listings
      'PM-030', 'PM-031', // Inspection permissions
      'PM-040', 'PM-042', 'PM-043', // Order and delivery
      'PM-050', // Reviews
      'PM-080', 'PM-081', 'PM-082', 'PM-083', 'PM-084', 'PM-085', 'PM-086', // All depot permissions
      'PM-090' // Finance reconcile
    ];
  }

  if (roles.includes('depot_staff')) {
    return [
      'PM-001', // View listings
      'PM-042', // Delivery
      'PM-080', 'PM-081', 'PM-082', 'PM-083', 'PM-084', 'PM-085', 'PM-086' // Depot permissions
    ];
  }

  if (roles.includes('inspector')) {
    return [
      'PM-001', // View listings
      'PM-030', 'PM-031', // Inspection permissions
      'PM-083' // View depot stock
    ];
  }

  if (roles.includes('config_manager')) {
    return [
      'PM-001', // View listings
      'PM-072', // Admin dashboard
      'PM-110', 'PM-111', 'PM-112', 'PM-113', 'PM-114', 'PM-115', 'PM-116', 'PM-117', 'PM-118', 'PM-119', 'PM-120', 'PM-121', 'PM-122', 'PM-123', 'PM-124', 'PM-125' // All config permissions
    ];
  }

  if (roles.includes('finance')) {
    return [
      'PM-001', // View listings
      'PM-040', 'PM-041', // Order and payment
      'PM-072', // Admin dashboard
      'PM-090', 'PM-091' // Finance permissions
    ];
  }

  if (roles.includes('price_manager')) {
    return [
      'PM-001', 'PM-002', // View and search listings
      'PM-072', 'PM-073', 'PM-074' // Admin dashboard and pricing
    ];
  }

  if (roles.includes('customer_support')) {
    return [
      'PM-001', 'PM-002', // View listings
      'PM-040', // View orders
      'PM-050', // Reviews
      'PM-060', 'PM-061', // Dispute permissions
      'PM-100' // CS manage tickets
    ];
  }

  if (roles.includes('seller')) {
    return [
      'PM-001', 'PM-002', 'PM-003', // View, search listings, view seller profile
      'PM-010', 'PM-011', 'PM-012', 'PM-013', 'PM-014', // Seller listing permissions
      'PM-020', 'PM-021', 'PM-022', 'PM-023', // RFQ, quotes, and Q&A management
      'PM-040', 'PM-042', // Orders and delivery
      'PM-050', // Reviews
      'PM-060', // Disputes
      'PM-090' // Billing
    ];
  }

  // Default buyer permissions
  return [
    'PM-001', 'PM-002', 'PM-003', // View and search listings
    'PM-020', 'PM-022', // RFQ
    'PM-030', // Request inspection
    'PM-040', 'PM-041', 'PM-042', 'PM-043', // Orders, payment, delivery, receipt
    'PM-050', // Reviews
    'PM-060' // Disputes
  ];
}

// Helper function to check if user has permission
function hasPermission(userPermissions: string[], userRoles: string[], requiredPermission: string | readonly string[]): boolean {
  // Handle array of permissions (OR logic - user needs at least ONE)
  if (Array.isArray(requiredPermission)) {
    return requiredPermission.some(perm => hasPermission(userPermissions, userRoles, perm));
  }

  // Check direct permission (requiredPermission is string here)
  if (userPermissions.includes(requiredPermission as string)) {
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