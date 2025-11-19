# Navigation Active State & Routing - Hướng dẫn

## 📋 Tổng quan

Navigation của dự án i-ContExchange đã được cấu hình để:
- ✅ Tự động hiển thị trạng thái **active** khi người dùng truy cập vào một trang
- ✅ Active state sử dụng màu **primary** của dự án
- ✅ **Routing đúng** với locale handling (vi/en)
- ✅ **Links tự động** thêm locale prefix

## 🔗 Routing Configuration

Dự án sử dụng **next-intl** để quản lý routing với đa ngôn ngữ. Tất cả navigation links phải sử dụng `Link` và `useRouter` từ `@/i18n/routing` thay vì từ `next/link` hoặc `next/navigation`.

### Cách hoạt động:
```typescript
// ✅ ĐÚNG - Tự động thêm locale prefix
import { Link, usePathname, useRouter } from '@/i18n/routing';

<Link href="/dashboard">Dashboard</Link>
// Tự động chuyển thành: /vi/dashboard hoặc /en/dashboard

// ❌ SAI - Không xử lý locale
import Link from 'next/link';
<Link href="/dashboard">Dashboard</Link>
// Sẽ dẫn đến: /dashboard (thiếu locale, 404 error)
```

## 🎨 Thiết kế Active State

### Main Menu (Menu chính)
Khi một menu item đang active:
- **Background**: Màu primary với opacity 10% (`bg-primary/10`)
- **Text**: Màu primary (`text-primary`)
- **Border**: Border trái 4px màu primary (`border-l-4 border-primary`)
- **Font Weight**: Semibold để nổi bật (`font-semibold`)
- **Shadow**: Shadow nhẹ để tạo chiều sâu (`shadow-sm`)

### Sub-menu (Menu con)
Khi một sub-menu item đang active:
- **Background**: Màu primary với opacity 15% (`bg-primary/15`)
- **Text**: Màu primary (`text-primary`)
- **Border**: Border trái 2px màu primary (`border-l-2 border-primary`)
- **Font Weight**: Medium (`font-medium`)
- **Shadow**: Shadow nhẹ (`shadow-sm`)

### Parent Highlighting
Khi một sub-menu đang active, parent menu cũng sẽ được highlight để người dùng biết họ đang ở section nào.

## 🔧 Cách hoạt động

### 1. Active Detection Logic

```typescript
// Clean pathname - xóa locale prefix
const cleanPathname = pathname.replace(/^\/(en|vi)/, '');

// Check exact match
const isExactMatch = cleanPathname === item.url || pathname === item.url;

// Check sub-path
const isSubPath = cleanPathname.startsWith(item.url + '/');

// Determine if active
const isActive = isExactMatch || isSubPath;
```

### 2. Locale Handling

Navigation tự động xử lý locale prefix (`/en`, `/vi`) để đảm bảo active state hoạt động đúng bất kể ngôn ngữ nào đang được sử dụng.

### 3. Responsive với pathname changes

Navigation sử dụng Next.js `usePathname()` hook để theo dõi URL changes và tự động cập nhật active state khi người dùng chuyển trang.

## 🗺️ Navigation URL Mapping

Tất cả URLs trong navigation đã được verified và match với folder structure:

### Guest Role
- `/` - Home page
- `/listings` - Container listings  
- `/help` - Help center

### Buyer Role
- `/dashboard` - Dashboard
- `/listings` - Container listings
- `/rfq`, `/rfq/create`, `/rfq/sent` - RFQ management
- `/orders`, `/orders/checkout`, `/orders/tracking` - Order management
- `/payments`, `/payments/escrow`, `/payments/methods`, `/payments/history` - Payments
- `/inspection/new` - Request inspection
- `/delivery` - Delivery tracking
- `/reviews`, `/reviews/new` - Reviews
- `/disputes`, `/disputes/new` - Disputes
- `/account/profile`, `/account/settings` - Account settings

### Seller Role  
- `/dashboard` - Dashboard
- `/listings` - Container listings
- `/sell`, `/sell/new`, `/sell/my-listings` - Selling management
- `/rfq/received`, `/quotes/create`, `/quotes/management` - RFQ & Quotes
- `/orders` - Order management
- `/delivery` - Delivery
- `/reviews`, `/reviews/new` - Reviews
- `/billing` - Billing
- `/account/profile`, `/account/settings` - Account

### Admin Role
- `/dashboard` - Dashboard
- `/admin`, `/admin/users`, `/admin/users/kyc` - User management
- `/admin/listings`, `/admin/disputes` - Content moderation
- `/admin/config`, `/admin/templates` - System configuration
- `/admin/audit`, `/admin/analytics`, `/admin/reports` - Monitoring
- `/listings` - Container listings
- `/orders` - Orders
- `/account/profile` - Account

### Depot Staff/Manager
- `/dashboard` - Dashboard
- `/depot`, `/depot/stock`, `/depot/movements` - Inventory
- `/depot/transfers`, `/depot/adjustments`, `/depot/repairs` - Operations
- `/depot/inspections` - Inspections
- `/delivery` - Delivery
- `/account/profile` - Account

### Inspector
- `/dashboard` - Dashboard
- `/inspection/new` - New inspection
- `/depot/inspections` - Inspection schedule
- `/account/profile` - Account

### Finance/Config Manager/Support
- `/dashboard` - Dashboard
- Role-specific screens
- `/account/profile` - Account

## 📁 Files liên quan

### 1. `components/layout/rbac-dashboard-sidebar.tsx`
File chính chứa logic navigation và active state detection. **ĐÃ SỬA** để sử dụng `Link` từ `@/i18n/routing`.

### 2. `i18n/routing.ts`
Configuration cho next-intl routing. Export `Link`, `useRouter`, `usePathname` với locale handling tự động.

### 3. `styles/navigation.css`
CSS bổ sung để đảm bảo màu sắc và styling được áp dụng đúng.

### 4. `app/layout.tsx`
Import navigation CSS để apply globally.

## 🎯 Các trường hợp sử dụng

### Case 1: Simple Menu Item
```typescript
// URL: /dashboard
// Active: Dashboard menu item
```

### Case 2: Menu with Sub-items
```typescript
// URL: /admin/users
// Active: 
//   - "Quản trị" parent menu (highlighted)
//   - "Người dùng" sub-menu (active)
```

### Case 3: Deep Path
```typescript
// URL: /admin/users/123
// Active:
//   - "Quản trị" parent menu (highlighted)
//   - "Người dùng" sub-menu (active)
```

## 🎨 Customization

### Thay đổi màu sắc

Để thay đổi màu active state, chỉ cần update CSS variable `--primary` trong theme configuration:

```css
:root {
  --primary: 210 100% 50%; /* HSL values */
}
```

### Thay đổi opacity

Trong `rbac-dashboard-sidebar.tsx`, adjust opacity values:
```typescript
// Main menu: bg-primary/10 -> bg-primary/20
// Sub-menu: bg-primary/15 -> bg-primary/25
```

### Thay đổi border thickness

```typescript
// Main menu: border-l-4 -> border-l-[6px]
// Sub-menu: border-l-2 -> border-l-[3px]
```

## 🐛 Troubleshooting

### Links không hoạt động / 404 Error?

1. **Kiểm tra import Link**:
   ```typescript
   // ✅ ĐÚNG
   import { Link, useRouter } from '@/i18n/routing';
   
   // ❌ SAI
   import Link from 'next/link';
   import { useRouter } from 'next/navigation';
   ```

2. **Kiểm tra URL format**:
   - URLs không cần locale prefix: `/dashboard` (không phải `/vi/dashboard`)
   - next-intl sẽ tự động thêm locale

3. **Kiểm tra page tồn tại**:
   - Verify file page.tsx exists trong `app/[locale]/path/`
   - Example: `/dashboard` → `app/[locale]/dashboard/page.tsx`

### Active state không hiển thị?

1. **Kiểm tra pathname**: Console log `pathname` để xem giá trị đúng
2. **Kiểm tra menu URL**: Đảm bảo menu URL match với pathname
3. **Kiểm tra CSS**: Xem CSS có được load không trong DevTools
4. **Kiểm tra locale**: URL có đúng format không (`/vi/dashboard` vs `/dashboard`)

### Màu sắc không đúng?

1. **Kiểm tra CSS variables**: Xem `--primary` có được định nghĩa không
2. **Kiểm tra import**: `navigation.css` có được import trong `layout.tsx` không
3. **Clear cache**: Xóa `.next` folder và build lại

### Parent menu không highlight khi sub-menu active?

Kiểm tra logic `hasActiveSubItem` trong `renderMenuItem` function.

### Redirect sau logout không đúng?

Đảm bảo sử dụng `router.push()` từ `@/i18n/routing` thay vì `window.location.href`:
```typescript
// ✅ ĐÚNG
const router = useRouter();
router.push('/auth/login'); // Tự động thêm locale

// ❌ SAI
window.location.href = '/vi/auth/login'; // Hardcode locale
```

## 📝 Best Practices

1. **Giữ URL structure nhất quán**: `/parent/child` format
2. **Sử dụng semantic URLs**: `/admin/users` thay vì `/page1`
3. **Test với cả locale**: Test cả `/en` và `/vi` routes
4. **Maintain contrast ratio**: Đảm bảo text readable trên background

## 🚀 Performance

- Active state detection: **O(n)** với n là số menu items
- Re-renders: Chỉ khi pathname changes (via usePathname)
- CSS: Compiled at build time, minimal runtime overhead

## 📚 References

- Next.js usePathname: https://nextjs.org/docs/app/api-reference/functions/use-pathname
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui Sidebar: https://ui.shadcn.com/docs/components/sidebar

