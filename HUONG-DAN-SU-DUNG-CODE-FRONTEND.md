# 📚 HƯỚNG DẪN SỬ DỤNG CODE FRONTEND CÓ SẴN

> **Mục đích**: Hướng dẫn developers cách sử dụng code, components và utilities đã có sẵn trong dự án i-ContExchange

---

## 📋 Mục Lục

1. [Khởi động dự án](#1-khởi-động-dự-án)
2. [Authentication - Đăng nhập và quản lý user](#2-authentication)
3. [Sử dụng Components có sẵn](#3-sử-dụng-components-có-sẵn)
4. [API Client - Call backend](#4-api-client)
5. [Navigation - Menu động theo role](#5-navigation)
6. [Permissions - Kiểm tra quyền](#6-permissions)
7. [Hooks có sẵn](#7-hooks-có-sẵn)
8. [Tạo page mới sử dụng code có sẵn](#8-tạo-page-mới)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Khởi động dự án

### Bước 1: Setup và chạy

```bash
# Clone repo (nếu chưa có)
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web"

# Install dependencies
npm install

# Chạy backend (terminal 1)
cd backend
npm run dev
# ✅ Backend chạy tại: http://localhost:3005

# Chạy frontend (terminal 2)
cd frontend
npm run dev
# ✅ Frontend chạy tại: http://localhost:3000
```

### Bước 2: Truy cập và đăng nhập

```
URL: http://localhost:3000/vi/auth/login

Tài khoản demo có sẵn:
┌─────────────┬────────────────────────────┬────────────┬──────────────┐
│ Role        │ Email                      │ Password   │ Access       │
├─────────────┼────────────────────────────┼────────────┼──────────────┤
│ Admin       │ admin@i-contexchange.vn    │ admin123   │ Full system  │
│ Seller      │ seller@example.com         │ seller123  │ Seller pages │
│ Buyer       │ buyer@example.com          │ buyer123   │ Buyer pages  │
│ Depot       │ depot@example.com          │ depot123   │ Depot pages  │
│ Inspector   │ inspector@example.com      │ inspect123 │ Inspection   │
└─────────────┴────────────────────────────┴────────────┴──────────────┘
```

---

## 2. Authentication

### 🔑 Sử dụng AuthContext có sẵn

Dự án đã có **AuthContext** để quản lý user authentication.

#### File: `frontend/components/providers/auth-context.tsx`

**Cách sử dụng trong component:**

```typescript
'use client';

import { useAuth } from '@/components/providers/auth-context';

export default function MyComponent() {
  // Lấy thông tin user và các functions
  const { 
    user,           // Thông tin user hiện tại
    loading,        // Đang load user info
    login,          // Function login
    logout,         // Function logout
    updateUser      // Update user info
  } = useAuth();
  
  // Check user đã login chưa
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Vui lòng đăng nhập</div>;
  
  return (
    <div>
      <h1>Xin chào, {user.name}!</h1>
      <p>Email: {user.email}</p>
      <p>Roles: {user.roles.join(', ')}</p>
      
      <button onClick={() => logout()}>
        Đăng xuất
      </button>
    </div>
  );
}
```

#### User object structure:

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roles: string[];              // ['admin', 'seller', etc.]
  permissions: string[];        // ['admin.users.read', 'listings.write', etc.]
}
```

### 🛡️ Protect pages với AuthGuard có sẵn

**File:** `frontend/components/guards/auth-guard.tsx`

```typescript
import { AuthGuard } from '@/components/guards/auth-guard';

export default function ProtectedPage() {
  return (
    <AuthGuard>
      {/* Nội dung page - chỉ hiện khi đã login */}
      <div>Protected content here</div>
    </AuthGuard>
  );
}
```

**Nếu chưa login:**
- ✅ Tự động redirect về `/auth/login`
- ✅ Save current URL để redirect lại sau khi login

---

## 3. Sử dụng Components có sẵn

### 📦 UI Components (Shadcn/ui)

Dự án đã cài sẵn **Shadcn/ui components** trong `frontend/components/ui/`

#### Button

```typescript
import { Button } from '@/components/ui/button';

// Các variants có sẵn
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

#### Card

```typescript
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent,
  CardFooter 
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title here</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Footer actions */}
  </CardFooter>
</Card>
```

#### Dialog (Modal)

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
      <DialogDescription>Description here</DialogDescription>
    </DialogHeader>
    {/* Modal content */}
  </DialogContent>
</Dialog>
```

#### Table

```typescript
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

<Table>
  <TableCaption>List of items</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### Input

```typescript
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div>
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email"
    type="email" 
    placeholder="your@email.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>
```

#### Badge

```typescript
import { Badge } from '@/components/ui/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

### 🎨 Feature Components có sẵn

#### Sidebar Navigation (Dynamic Menu)

**File:** `frontend/components/layout/rbac-dashboard-sidebar.tsx`

```typescript
import { RBACDashboardSidebar } from '@/components/layout/rbac-dashboard-sidebar';

// Sidebar tự động hiển thị menu theo:
// - Role của user
// - Permissions của user
// - Locale hiện tại (vi/en)

<RBACDashboardSidebar 
  isAuthenticated={true}
  userInfo={{
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    roles: user.roles,
    permissions: user.permissions
  }}
/>
```

**Features:**
- ✅ Menu động theo role (admin thấy admin menu, seller thấy seller menu, etc.)
- ✅ Tự động ẩn items không có permission
- ✅ Hỗ trợ multi-level menu (có submenu)
- ✅ Active state tự động theo current route
- ✅ Icons đẹp với Lucide React

---

## 4. API Client

### 📡 Sử dụng API Client có sẵn

**File:** `frontend/lib/api/client.ts`

Dự án đã có **ApiClient class** để call backend APIs.

#### Setup:

```typescript
import { ApiClient } from '@/lib/api/client';

// ApiClient tự động:
// - Thêm Bearer token vào headers
// - Handle errors
// - Parse JSON response
// - Log requests (debug mode)

const client = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL // http://localhost:3005
});
```

#### Các API functions có sẵn:

##### Listings API

**File:** `frontend/lib/api/listings.ts`

```typescript
import { fetchListings, fetchListingById } from '@/lib/api/listings';

// 1. Get all listings với filters
const listings = await fetchListings({
  q: 'search term',      // Search query
  page: 1,               // Page number
  limit: 20,             // Items per page
  dealType: 'buy',       // 'buy' | 'sell' | 'rent'
  condition: 'new',      // 'new' | 'used'
  size: '20',            // '20' | '40' | '45'
  minPrice: 1000,
  maxPrice: 50000,
  location: 'Ho Chi Minh'
});

// Response:
// {
//   data: {
//     listings: [...],
//     pagination: { total, page, limit }
//   }
// }

// 2. Get single listing by ID
const listing = await fetchListingById('listing-id-here');
```

##### Orders API

**File:** `frontend/lib/api/orders.ts`

```typescript
import { fetchOrders, createOrder, updateOrderStatus } from '@/lib/api/orders';

// Get orders
const orders = await fetchOrders({ page: 1, limit: 20 });

// Create order
const newOrder = await createOrder({
  listingId: 'listing-id',
  quantity: 1,
  // ... other fields
});

// Update status
await updateOrderStatus('order-id', 'confirmed');
```

##### Users API (Admin only)

```typescript
import { fetchUsers, createUser, updateUser } from '@/lib/api/users';

// Admin functions
const users = await fetchUsers();
const newUser = await createUser({ email, name, password, roles });
await updateUser(userId, { name, roles });
```

#### Tạo API call mới:

```typescript
// frontend/lib/api/my-feature.ts

import { ApiClient } from './client';

const client = new ApiClient();

export async function fetchMyData() {
  return client.request({
    method: 'GET',
    path: '/api/v1/my-endpoint',
  });
}

export async function createMyData(data: any) {
  return client.request({
    method: 'POST',
    path: '/api/v1/my-endpoint',
    body: data,
  });
}
```

### 🔄 Sử dụng với React trong component:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { fetchListings } from '@/lib/api/listings';

export default function MyListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadListings();
  }, []);
  
  const loadListings = async () => {
    try {
      setLoading(true);
      const response = await fetchListings({ page: 1, limit: 20 });
      setListings(response.data.listings);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {listings.map(listing => (
        <div key={listing.id}>{listing.title}</div>
      ))}
    </div>
  );
}
```

---

## 5. Navigation

### 🗺️ Routing với i18n support

Dự án sử dụng **next-intl** cho multi-language.

#### Import đúng cách:

```typescript
// ❌ KHÔNG dùng (không support i18n)
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ✅ PHẢI dùng (có i18n support)
import { Link, useRouter, usePathname } from '@/i18n/routing';
```

#### Link navigation:

```typescript
import { Link } from '@/i18n/routing';

// Tự động thêm locale prefix (/vi/ hoặc /en/)
<Link href="/dashboard">Dashboard</Link>
<Link href="/listings">Listings</Link>
<Link href="/orders/123">Order Detail</Link>

// Result:
// /vi/dashboard
// /vi/listings  
// /vi/orders/123
```

#### Programmatic navigation:

```typescript
import { useRouter } from '@/i18n/routing';

export default function MyComponent() {
  const router = useRouter();
  
  const handleNavigate = () => {
    router.push('/dashboard');        // Navigate
    router.replace('/home');          // Replace (no history)
    router.back();                    // Go back
  };
}
```

#### Get current path:

```typescript
import { usePathname } from '@/i18n/routing';

const pathname = usePathname();
// /dashboard (không có locale prefix)

const isActive = pathname === '/dashboard';
```

### 🌍 Language toggle:

**Component có sẵn:** `frontend/components/language-toggle.tsx`

```typescript
import { LanguageToggle } from '@/components/language-toggle';

// Dropdown để switch giữa vi/en
<LanguageToggle />
```

---

## 6. Permissions

### 🔐 Check permissions trong code

Dự án có **ClientRBACService** để check permissions.

**File:** `frontend/lib/auth/client-rbac-service.ts`

#### Cách 1: Sử dụng trong component

```typescript
'use client';

import { useAuth } from '@/components/providers/auth-context';

export default function MyComponent() {
  const { user } = useAuth();
  
  // Check single permission
  const canViewUsers = user?.permissions?.includes('admin.users.read');
  const canEditUsers = user?.permissions?.includes('admin.users.write');
  const canDeleteUsers = user?.permissions?.includes('admin.users.delete');
  
  // Check role
  const isAdmin = user?.roles?.includes('admin');
  const isSeller = user?.roles?.includes('seller');
  
  return (
    <div>
      {/* Conditional rendering */}
      {canViewUsers && <UsersTable />}
      
      {canEditUsers && (
        <Button>Edit User</Button>
      )}
      
      {canDeleteUsers && (
        <Button variant="destructive">Delete</Button>
      )}
      
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

#### Cách 2: Sử dụng PermissionGuard

**File:** `frontend/components/guards/permission-guard.tsx`

```typescript
import { PermissionGuard } from '@/components/guards/permission-guard';

<PermissionGuard permission="admin.users.write">
  {/* Chỉ hiện khi có permission */}
  <Button>Edit User</Button>
</PermissionGuard>

<PermissionGuard 
  permissions={['listings.write', 'listings.delete']}
  requireAll={false}  // Chỉ cần 1 trong các permissions
>
  <Button>Manage Listing</Button>
</PermissionGuard>
```

#### Permission format:

```typescript
// Admin permissions
'admin.*'                    // All admin permissions
'admin.users.read'
'admin.users.write'
'admin.users.delete'
'admin.roles.manage'
'admin.settings.manage'

// Listings permissions
'listings.read'
'listings.write'
'listings.edit'
'listings.delete'
'listings.publish'

// Orders permissions
'orders.read'
'orders.write'
'orders.manage'

// Seller permissions
'seller.listings.manage'
'seller.orders.view'

// Buyer permissions
'buyer.orders.create'
'buyer.rfq.create'
```

---

## 7. Hooks có sẵn

### 🪝 Custom hooks trong dự án

#### useAuth

```typescript
import { useAuth } from '@/components/providers/auth-context';

const { 
  user,           // Current user
  loading,        // Loading state
  login,          // Login function
  logout,         // Logout function
  updateUser,     // Update user data
} = useAuth();
```

#### useNotification

**File:** `frontend/hooks/use-notification.ts`

```typescript
import { useNotification } from '@/hooks/use-notification';

const { 
  notifications,     // List of notifications
  unreadCount,       // Number of unread
  markAsRead,        // Mark notification as read
  markAllAsRead,     // Mark all as read
  deleteNotification // Delete a notification
} = useNotification();
```

#### useToast

```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// Show success toast
toast({
  title: "Success",
  description: "Action completed successfully",
});

// Show error toast
toast({
  title: "Error",
  description: "Something went wrong",
  variant: "destructive",
});
```

#### useMasterData

**File:** `frontend/hooks/useMasterData.ts`

```typescript
import { useMasterData } from '@/hooks/useMasterData';

// Lấy master data (container sizes, types, conditions, etc.)
const { 
  sizes,          // Container sizes
  types,          // Container types
  conditions,     // Conditions (new, used, etc.)
  locations,      // Locations
  loading,
  error
} = useMasterData();
```

---

## 8. Tạo Page Mới

### 📄 Ví dụ: Tạo page "My Orders"

#### Bước 1: Tạo file page

**File:** `frontend/app/[locale]/my-orders/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-context';
import { AuthGuard } from '@/components/guards/auth-guard';
import { fetchOrders } from '@/lib/api/orders';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

function MyOrdersContent() {
  const t = useTranslations();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadOrders();
  }, []);
  
  const loadOrders = async () => {
    try {
      const response = await fetchOrders({ page: 1, limit: 20 });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  
  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('orders.myOrders')}</h1>
        <p className="text-gray-600">Total: {orders.length} orders</p>
      </div>
      
      <div className="space-y-4">
        {orders.map(order => (
          <Card key={order.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order #{order.id}</span>
                <Badge>{order.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Listing: {order.listingTitle}</p>
              <p>Price: ${order.totalPrice}</p>
              <Button 
                className="mt-3"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <AuthGuard>
      <MyOrdersContent />
    </AuthGuard>
  );
}
```

#### Bước 2: Thêm vào navigation (nếu cần)

**File:** `frontend/components/layout/rbac-dashboard-sidebar.tsx`

Tìm phần menu config và thêm:

```typescript
{
  title: 'My Orders',
  href: '/my-orders',
  icon: 'ShoppingCart',
  permission: 'orders.read',
  roles: ['buyer', 'seller', 'admin'],
},
```

#### Bước 3: Thêm translations

**File:** `frontend/messages/vi.json`

```json
{
  "orders": {
    "myOrders": "Đơn hàng của tôi",
    "viewDetails": "Xem chi tiết",
    "status": "Trạng thái"
  }
}
```

**File:** `frontend/messages/en.json`

```json
{
  "orders": {
    "myOrders": "My Orders",
    "viewDetails": "View Details",
    "status": "Status"
  }
}
```

---

## 9. Troubleshooting

### 🐛 Các lỗi thường gặp

#### 1. "Cannot find module '@/...'"

**Nguyên nhân:** TypeScript path alias chưa config đúng

**Fix:** Check `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./frontend/*"]
    }
  }
}
```

#### 2. "User is undefined" / Auth context không hoạt động

**Nguyên nhân:** Component không được wrap trong AuthProvider

**Fix:** Check `frontend/app/layout.tsx`:

```typescript
import { Providers } from '@/components/providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>  {/* ← Phải có */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

#### 3. API calls return 401 Unauthorized

**Nguyên nhân:** Token expired hoặc không gửi token

**Debug:**

```typescript
// Check token
const token = localStorage.getItem('token');
console.log('Token:', token);

// Check token có gửi trong request không
// Mở DevTools → Network tab → Click request → Headers
// Phải thấy: Authorization: Bearer <token>
```

**Fix:** Đăng nhập lại

#### 4. Navigation không hoạt động / 404 errors

**Nguyên nhân:** Dùng sai import

**Fix:**

```typescript
// ❌ Wrong
import Link from 'next/link';

// ✅ Correct
import { Link } from '@/i18n/routing';
```

#### 5. Permissions không hoạt động

**Debug:**

```typescript
import { useAuth } from '@/components/providers/auth-context';

const { user } = useAuth();
console.log('User roles:', user?.roles);
console.log('User permissions:', user?.permissions);
```

**Check:** User có permission cần thiết không?

#### 6. Styling không hiển thị

**Nguyên nhân:** Tailwind classes không được compile

**Fix:**

```bash
# Restart dev server
npm run dev

# Clear .next cache
rm -rf .next
npm run dev
```

#### 7. Build errors

```bash
# Clear all caches
rm -rf .next
rm -rf node_modules/.cache

# Reinstall
npm install

# Build again
npm run build
```

---

## 📚 Cheat Sheet

### Quick Reference

```typescript
// ===== IMPORTS =====
import { useAuth } from '@/components/providers/auth-context';
import { Link, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { AuthGuard } from '@/components/guards/auth-guard';
import { fetchListings } from '@/lib/api/listings';

// ===== AUTH =====
const { user, loading, logout } = useAuth();
if (!user) return <div>Please login</div>;

// ===== PERMISSIONS =====
const canEdit = user?.permissions?.includes('listings.write');
const isAdmin = user?.roles?.includes('admin');

// ===== NAVIGATION =====
<Link href="/dashboard">Dashboard</Link>
const router = useRouter();
router.push('/page');

// ===== TRANSLATIONS =====
const t = useTranslations('namespace');
<h1>{t('key')}</h1>

// ===== API =====
const data = await fetchListings({ page: 1, limit: 20 });

// ===== COMPONENTS =====
<Button variant="default">Click</Button>
<Card><CardContent>Content</CardContent></Card>
<Badge>Status</Badge>

// ===== PROTECT PAGE =====
export default function Page() {
  return (
    <AuthGuard>
      <Content />
    </AuthGuard>
  );
}
```

---

## 🎯 Best Practices

### 1. Luôn check authentication

```typescript
const { user, loading } = useAuth();
if (loading) return <Loading />;
if (!user) return <LoginPrompt />;
```

### 2. Dùng TypeScript types

```typescript
interface Listing {
  id: string;
  title: string;
  price: number;
}

const [listings, setListings] = useState<Listing[]>([]);
```

### 3. Handle errors

```typescript
try {
  const data = await fetchData();
} catch (error: any) {
  console.error('Error:', error);
  toast({ title: 'Error', description: error.message });
}
```

### 4. Loading states

```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await submitData();
  } finally {
    setLoading(false);
  }
};
```

### 5. Clean up useEffect

```typescript
useEffect(() => {
  let ignore = false;
  
  fetchData().then(data => {
    if (!ignore) {
      setData(data);
    }
  });
  
  return () => {
    ignore = true;  // Cleanup
  };
}, []);
```

---

## 📞 Hỗ Trợ

### Cần giúp đỡ?

1. **Check documentation**: Đọc các file `.md` trong repo
2. **Check examples**: Xem các page có sẵn như `listings`, `orders`
3. **Console logs**: Sử dụng `console.log()` để debug
4. **Network tab**: Check API calls trong DevTools
5. **React DevTools**: Install extension để inspect components

### Tài liệu liên quan:

- `README.md` - Overview dự án
- `PROJECT-STRUCTURE.md` - Cấu trúc chi tiết
- `FRONTEND-QUICK-REFERENCE.md` - Code snippets nhanh

---

**🎉 Chúc bạn code vui vẻ!**

*Cập nhật: October 29, 2025*
