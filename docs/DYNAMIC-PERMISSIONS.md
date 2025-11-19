# Hệ Thống Permission Động (Dynamic Permissions)

## Tổng Quan

Hệ thống permissions hiện đã được cập nhật để hỗ trợ **quản lý quyền động**. Khi admin thay đổi quyền của user trong database, user có thể nhận quyền mới **ngay lập tức** mà không cần logout/login lại.

## Cách Hoạt Động

### 1. Permissions được lưu trong JWT Token

- Khi user login, backend query database lấy tất cả permissions của user
- Permissions được lưu vào JWT payload: `{ permissions: ['PM-001', 'PM-020', ...] }`
- JWT có thời hạn 7 ngày

### 2. Middleware kiểm tra permissions từ JWT

- Frontend middleware **CHỈ dùng permissions từ JWT**, không hardcode
- File: `frontend/middleware.ts`
- Code đã bỏ hàm mock `getUserPermissions()`, chỉ dùng `payload.permissions`

### 3. Refresh Permissions API

Endpoint mới: `POST /api/v1/auth/refresh-permissions`

**Request:**
```bash
curl -X POST http://localhost:3006/api/v1/auth/refresh-permissions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Quyền đã được cập nhật",
  "data": {
    "token": "NEW_JWT_TOKEN_WITH_UPDATED_PERMISSIONS",
    "roles": ["buyer"],
    "permissions": ["PM-001", "PM-020", "PM-030", ...]
  }
}
```

## Sử Dụng Trong Code

### 1. Thêm Button Refresh Permissions vào Dashboard

```tsx
import { RefreshPermissionsButton } from '@/components/RefreshPermissionsButton';

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <RefreshPermissionsButton />
    </div>
  );
}
```

### 2. Sử dụng Hook trong Component

```tsx
'use client';

import { usePermissionRefresh } from '@/hooks/usePermissionRefresh';

export function MyComponent() {
  const { refreshPermissions, isRefreshing, error } = usePermissionRefresh();

  const handleRefresh = async () => {
    const success = await refreshPermissions();
    if (success) {
      console.log('Permissions updated!');
    }
  };

  return (
    <button onClick={handleRefresh} disabled={isRefreshing}>
      {isRefreshing ? 'Refreshing...' : 'Refresh Permissions'}
    </button>
  );
}
```

## Workflow Khi Admin Thay Đổi Quyền

### Cách 1: User tự refresh (Manual)

1. Admin vào trang quản lý user
2. Admin gán thêm quyền mới cho user (ví dụ: thêm `PM-040` - PAYMENTS)
3. User click nút "Làm mới quyền" ở dashboard
4. Frontend gọi API `/auth/refresh-permissions`
5. Backend query database lấy permissions mới nhất
6. Backend tạo JWT mới với permissions cập nhật
7. Frontend lưu JWT mới vào cookie
8. Page reload → User có quyền mới ngay lập tức ✅

### Cách 2: Auto-refresh (Tùy chọn)

Thêm auto-refresh mỗi 5 phút:

```tsx
'use client';

import { useEffect } from 'react';
import { usePermissionRefresh } from '@/hooks/usePermissionRefresh';

export function PermissionAutoRefresh() {
  const { refreshPermissions } = usePermissionRefresh();

  useEffect(() => {
    // Refresh every 5 minutes
    const interval = setInterval(() => {
      refreshPermissions();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshPermissions]);

  return null;
}
```

Thêm vào layout:

```tsx
// app/[locale]/layout.tsx
import { PermissionAutoRefresh } from '@/components/PermissionAutoRefresh';

export default function LocaleLayout({ children }) {
  return (
    <html>
      <body>
        <PermissionAutoRefresh />
        {children}
      </body>
    </html>
  );
}
```

### Cách 3: Server-Sent Events (SSE) - Advanced

Để real-time 100%, có thể dùng SSE:

1. Backend emit event khi admin thay đổi quyền
2. Frontend listen event và auto refresh
3. User nhận quyền mới **ngay lập tức** không cần reload

(Chưa implement - có thể làm sau nếu cần)

## Migration từ Hardcoded Permissions

### ❌ Cách cũ (Hardcoded)

```typescript
// middleware.ts - CŨ
async function getUserPermissions(roles: string[]): Promise<string[]> {
  if (roles.includes('buyer')) {
    return ['PM-001', 'PM-020', 'PM-030']; // ❌ Hardcode
  }
  // ...
}
```

**Vấn đề:** Admin gán thêm quyền `PM-040` cho buyer trong database → User vẫn KHÔNG có quyền vì code hardcode!

### ✅ Cách mới (Dynamic)

```typescript
// middleware.ts - MỚI
const userPermissionsRaw = payload.permissions && Array.isArray(payload.permissions)
  ? (payload.permissions as string[]) // ✅ Lấy từ JWT (database)
  : [];
```

**Lợi ích:** Admin gán quyền mới → User gọi refresh → Có quyền ngay lập tức!

## Kiểm Tra Permissions

### 1. Xem permissions trong JWT

```javascript
// Browser Console
const token = document.cookie.split('accessToken=')[1].split(';')[0];
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Permissions:', payload.permissions);
```

### 2. Test refresh API

```bash
# Login
curl -X POST http://localhost:3006/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"buyer123"}'

# Lấy token từ response
TOKEN="eyJhbGciOiJS..."

# Refresh permissions
curl -X POST http://localhost:3006/api/v1/auth/refresh-permissions \
  -H "Authorization: Bearer $TOKEN"
```

## Lưu Ý Quan Trọng

### 1. JWT Expiry
- JWT có thời hạn 7 ngày
- Sau 7 ngày user PHẢI login lại
- Refresh permissions chỉ tạo JWT mới với cùng expiry time

### 2. Cookie Security
- Production: Bật `secure` flag (chỉ HTTPS)
- SameSite: `strict` để chống CSRF
- HttpOnly: Không set vì frontend cần đọc token

### 3. Performance
- Mỗi lần refresh = 1 database query
- Không nên auto-refresh quá thường xuyên (khuyến nghị: 5-10 phút)
- Chỉ refresh khi cần thiết (sau khi admin thay đổi)

## Troubleshooting

### User không nhận được quyền mới

1. Kiểm tra JWT có permissions không:
   ```javascript
   console.log(JSON.parse(atob(token.split('.')[1])));
   ```

2. Kiểm tra backend có query đúng permissions không:
   ```bash
   # Check logs
   # Should see: "🔐 User permissions: ['PM-001', ...]"
   ```

3. Kiểm tra middleware có dùng JWT permissions không:
   ```typescript
   // middleware.ts
   // Phải thấy: payload.permissions (không phải getUserPermissions)
   ```

### Refresh không hoạt động

1. Check API response:
   ```bash
   curl -X POST http://localhost:3006/api/v1/auth/refresh-permissions \
     -H "Authorization: Bearer $TOKEN" \
     -v
   ```

2. Check browser console for errors

3. Verify cookie được update:
   ```javascript
   console.log(document.cookie);
   ```

## Best Practices

1. **Thêm refresh button ở Dashboard** - User dễ dàng cập nhật quyền
2. **Hiển thị thông báo** - "Quyền của bạn đã được cập nhật, vui lòng làm mới"
3. **Auto-refresh hợp lý** - 5-10 phút là đủ, không spam API
4. **Log permissions** - Giúp debug dễ dàng
5. **Test trước khi deploy** - Đảm bảo admin panel hoạt động đúng

## Ví Dụ Hoàn Chỉnh

### Admin Panel - Gán quyền mới

```typescript
// app/admin/users/[id]/page.tsx
'use client';

async function assignPermission(userId: string, permissionCode: string) {
  // 1. Gán quyền trong database
  await fetch(`/api/admin/users/${userId}/permissions`, {
    method: 'POST',
    body: JSON.stringify({ permissionCode })
  });

  // 2. Thông báo cho user
  await fetch(`/api/notifications`, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      message: 'Quyền của bạn đã được cập nhật. Vui lòng làm mới quyền để sử dụng.'
    })
  });

  alert('Đã gán quyền thành công!');
}
```

### User Dashboard - Nhận thông báo và refresh

```typescript
// app/[locale]/dashboard/page.tsx
'use client';

import { RefreshPermissionsButton } from '@/components/RefreshPermissionsButton';

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Notification banner */}
      <div className="bg-blue-100 p-4 rounded mb-4">
        <p>Quyền của bạn đã được cập nhật!</p>
        <RefreshPermissionsButton />
      </div>
      
      {/* Dashboard content */}
    </div>
  );
}
```

---

**Tóm lại:** Hệ thống giờ đã hỗ trợ dynamic permissions! Admin gán quyền → User refresh → Có quyền ngay! 🎉
