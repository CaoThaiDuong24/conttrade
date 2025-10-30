# Fix: Middleware Redirect Issue - Permission Denied

## Vấn đề (Problem)

Tất cả các menu/chức năng/tính năng khi click đều redirect về màn hình dashboard mà không có thông báo lỗi rõ ràng.

### Nguyên nhân (Root Cause)

1. **Middleware kiểm tra quyền truy cập (Permission Check)**:
   - Middleware (`frontend/middleware.ts`) kiểm tra quyền của user trước khi cho phép truy cập vào mỗi route
   - Nếu user không có quyền cần thiết, middleware sẽ redirect về dashboard

2. **Không có thông báo lỗi**:
   - User không biết tại sao họ bị redirect về dashboard
   - Không có feedback rõ ràng về quyền truy cập bị từ chối

### Ví dụ cụ thể

- **Buyer** cố gắng truy cập `/sell/new` (yêu cầu quyền `PM-010` - CREATE_LISTING)
- Buyer chỉ có quyền: `dashboard.view`, `PM-001`, `PM-002`, `rfq.read`, `rfq.write`, etc.
- Middleware phát hiện thiếu quyền → Redirect về `/dashboard` **KHÔNG CÓ THÔNG BÁO**

## Giải pháp (Solution)

### 1. Thêm query parameters khi redirect

**File**: `frontend/middleware.ts`

```typescript
// Trước đây (Before):
const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
return NextResponse.redirect(dashboardUrl);

// Sau khi fix (After):
const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
dashboardUrl.searchParams.set('error', 'permission_denied');
dashboardUrl.searchParams.set('required', requiredPermission);
dashboardUrl.searchParams.set('path', routePath);
return NextResponse.redirect(dashboardUrl);
```

### 2. Hiển thị toast notification trên dashboard

**File**: `frontend/app/[locale]/dashboard/page.tsx`

Thêm logic kiểm tra query parameters và hiển thị toast thông báo lỗi:

```typescript
useEffect(() => {
  const error = searchParams.get('error');
  const required = searchParams.get('required');
  const path = searchParams.get('path');

  if (error === 'permission_denied') {
    const permissionNames: Record<string, string> = {
      'PM-010': 'Tạo tin đăng bán',
      'PM-011': 'Sửa tin đăng',
      'PM-070': 'Duyệt tin đăng (Admin)',
      'admin.access': 'Truy cập trang quản trị',
      // ... more permission names
    };

    const permissionName = required ? permissionNames[required] || required : 'không xác định';
    const pathName = path || 'trang này';

    toast({
      title: "Không có quyền truy cập",
      description: `Bạn không có quyền "${permissionName}" để truy cập ${pathName}. Vui lòng liên hệ quản trị viên để được cấp quyền.`,
      variant: "destructive",
      duration: 8000,
    });

    // Clean URL to remove error parameters
    window.history.replaceState({}, '', cleanUrl.toString());
  }
}, [searchParams, toast]);
```

### 3. Cải thiện logging trong middleware

Thêm log chi tiết hơn để debug:

```typescript
if (requiredPermission && !hasPermission(...)) {
  console.log('❌ PERMISSION DENIED:', requiredPermission);
  console.log('📍 User tried to access:', routePath);
  console.log('🔑 User has permissions:', normalizedUserPermissions);
  console.log('👤 User roles:', userRoles);
  // ... redirect
}
```

### 4. Fix router import trong /sell/page.tsx

Sử dụng i18n router thay vì next/navigation router để hỗ trợ đa ngôn ngữ:

```typescript
// Trước đây:
import { useRouter } from 'next/navigation';

// Sau khi fix:
import { useRouter } from '@/i18n/routing';
```

## Các file đã thay đổi (Changed Files)

1. ✅ `frontend/middleware.ts`
   - Thêm query parameters khi redirect vì thiếu quyền
   - Thêm log chi tiết hơn

2. ✅ `frontend/app/[locale]/dashboard/page.tsx`
   - Import `useSearchParams`, `useToast`, `XCircle` icon
   - Thêm logic hiển thị toast khi có lỗi permission denied
   - Mapping tên các permissions sang tiếng Việt

3. ✅ `frontend/app/[locale]/sell/page.tsx`
   - Fix router import để sử dụng i18n routing

## Cách test (How to Test)

### Test Case 1: Buyer cố truy cập trang Seller

```powershell
# 1. Login as buyer
$login = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/login' `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{"email":"buyer@example.com","password":"buyer123"}' `
  -UseBasicParsing

$loginData = $login.Content | ConvertFrom-Json
$token = $loginData.data.token

# 2. Try to access /sell/new (should redirect to dashboard with error)
Invoke-WebRequest -Uri 'http://127.0.0.1:3001/vi/sell/new' `
  -Method GET `
  -Headers @{'Cookie'="accessToken=$token"} `
  -MaximumRedirection 0 `
  -UseBasicParsing
```

**Kết quả mong đợi**:
- ✅ Redirect về `/vi/dashboard?error=permission_denied&required=PM-010&path=/sell/new`
- ✅ Toast hiển thị: "Không có quyền truy cập - Bạn không có quyền 'Tạo tin đăng bán' để truy cập /sell/new..."

### Test Case 2: Buyer cố truy cập trang Admin

```powershell
# Try to access admin page
Invoke-WebRequest -Uri 'http://127.0.0.1:3001/vi/admin/users' `
  -Method GET `
  -Headers @{'Cookie'="accessToken=$token"} `
  -MaximumRedirection 0 `
  -UseBasicParsing
```

**Kết quả mong đợi**:
- ✅ Redirect về dashboard với thông báo thiếu quyền `admin.users`

### Test Case 3: Seller truy cập trang cho phép

```powershell
# Login as seller
$login = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/login' `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{"email":"seller@example.com","password":"seller123"}' `
  -UseBasicParsing

$loginData = $login.Content | ConvertFrom-Json
$token = $loginData.data.token

# Access /sell/new (should work)
Invoke-WebRequest -Uri 'http://127.0.0.1:3001/vi/sell/new' `
  -Method GET `
  -Headers @{'Cookie'="accessToken=$token"} `
  -UseBasicParsing
```

**Kết quả mong đợi**:
- ✅ Truy cập thành công, không redirect
- ✅ Hiển thị form tạo tin đăng

## Browser Testing (Manual)

### Bước 1: Đăng nhập với Buyer
1. Mở trình duyệt: http://localhost:3001/vi/auth/login
2. Login: `buyer@example.com` / `buyer123`
3. Sau khi login → Dashboard

### Bước 2: Thử truy cập trang không có quyền
1. Click vào menu "Bán hàng" → "Tạo tin đăng mới"
2. Hoặc truy cập trực tiếp: http://localhost:3001/vi/sell/new

### Bước 3: Kiểm tra kết quả
- ✅ URL thay đổi thành: `http://localhost:3001/vi/dashboard?error=permission_denied&required=PM-010&path=/sell/new`
- ✅ Toast thông báo xuất hiện ở góc màn hình (màu đỏ):
  ```
  Không có quyền truy cập
  Bạn không có quyền "Tạo tin đăng bán" để truy cập /sell/new.
  Vui lòng liên hệ quản trị viên để được cấp quyền.
  ```
- ✅ URL sẽ được làm sạch sau vài giây (remove query params)

### Bước 4: Kiểm tra console logs
Mở DevTools Console (F12) và xem logs:
```
🚪 MIDDLEWARE: /vi/sell/new
🔐 TOKEN CHECK: { path: '/sell/new', permission: 'PM-010', hasToken: true, tokenSource: 'cookie' }
🔐 VERIFYING JWT...
✅ JWT VALID for user: <userId> Role: buyer
🔑 USER ROLES: ['buyer']
🔑 USER PERMISSIONS (normalized): ['dashboard.view', 'account.read', 'PM-001', 'PM-002', ...]
❌ PERMISSION DENIED: PM-010
📍 User tried to access: /sell/new
🔑 User has permissions: ['dashboard.view', 'account.read', ...]
👤 User roles: ['buyer']
```

## Permission Matrix (Reference)

### Buyer Permissions
- ✅ `dashboard.view` - Xem dashboard
- ✅ `account.read`, `account.write` - Quản lý tài khoản
- ✅ `PM-001`, `PM-002` - Xem và tìm kiếm tin đăng
- ✅ `rfq.read`, `rfq.write` - Tạo/xem yêu cầu báo giá
- ✅ `orders.read`, `orders.write` - Tạo/xem đơn hàng
- ❌ `PM-010` - **KHÔNG CÓ** quyền tạo tin đăng
- ❌ `admin.access` - **KHÔNG CÓ** quyền admin

### Seller Permissions
- ✅ Tất cả quyền của Buyer
- ✅ `PM-010`, `PM-011`, `PM-012`, `PM-013`, `PM-014` - Quản lý tin đăng
- ✅ `rfq.respond` - Phản hồi yêu cầu báo giá

### Admin Permissions
- ✅ Tất cả quyền

## Next Steps (Cải tiến tiếp theo)

1. **Tạo trang 403 Forbidden riêng** thay vì redirect về dashboard
2. **Thêm button "Yêu cầu quyền truy cập"** trong toast
3. **Hiển thị danh sách quyền của user** trong trang Account Settings
4. **Log lịch sử access denied** để admin có thể review

## Liên hệ

Nếu có vấn đề, kiểm tra:
1. Backend server đang chạy: `http://localhost:3006`
2. Frontend server đang chạy: `http://localhost:3001`
3. JWT token hợp lệ (check cookie `accessToken` trong DevTools)
4. Middleware logs trong terminal

---
**Date**: 2025-10-27
**Status**: ✅ FIXED
