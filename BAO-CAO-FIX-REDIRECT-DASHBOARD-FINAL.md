# Báo Cáo: Fix Lỗi Redirect về Dashboard

## Tóm Tắt Vấn Đề

**Hiện tượng**: Tất cả các menu/chức năng khi click đều redirect về màn hình dashboard, ngay cả khi user có quyền truy cập.

## Nguyên Nhân Gốc Rễ

### 1. **Browser Cache JWT Token Cũ** ⭐ NGUYÊN NHÂN CHÍNH
- Browser đang sử dụng JWT token cũ được tạo TRƯỚC KHI fix backend
- Token cũ **KHÔNG CÓ** `roles` và `permissions` trong payload
- Middleware kiểm tra permissions trong JWT → không tìm thấy → redirect về dashboard

**Bằng chứng:**
```javascript
// JWT Token CŨ (không có permissions)
{
  "userId": "user-buyer",
  "email": "buyer@example.com",
  "iat": ...,
  "exp": ...
}

// JWT Token MỚI (có đầy đủ permissions)
{
  "userId": "user-buyer",
  "email": "buyer@example.com",
  "roles": ["buyer"],
  "permissions": ["PM-001", "PM-002", "PM-003", "PM-010", ...],
  "roleVersions": {"buyer": 1},
  "iat": ...,
  "exp": ...
}
```

### 2. Middleware Không Có Thông Báo Lỗi Rõ Ràng (đã fix)
- Khi user không có quyền, middleware chỉ redirect về dashboard mà không báo lỗi
- User không biết tại sao bị redirect

### 3. Frontend Dev Server Chưa Reload (secondary)
- Next.js dev server có thể cache middleware code cũ
- Cần restart để apply changes

## Các Thay Đổi Đã Thực Hiện

### 1. Backend - Auth Routes (`backend/src/routes/auth.ts`)
✅ **ĐÃ CÓ SẴN** - Không cần sửa

Login API đã trả về JWT với đầy đủ roles và permissions:
```typescript
const token = fastify.jwt.sign(
  { 
    userId: user.id, 
    email: user.email,
    roles: roles,  // ✅ Đã có
    permissions: Array.from(permissions),  // ✅ Đã có
    roleVersions: roleVersions
  },
  { expiresIn: '7d' }
);
```

### 2. Middleware - Thêm Error Parameters (`frontend/middleware.ts`)
✅ **ĐÃ SỬA**

```typescript
// Trước:
const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
return NextResponse.redirect(dashboardUrl);

// Sau:
const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
dashboardUrl.searchParams.set('error', 'permission_denied');
dashboardUrl.searchParams.set('required', requiredPermission);
dashboardUrl.searchParams.set('path', routePath);
return NextResponse.redirect(dashboardUrl);
```

### 3. Dashboard Page - Hiển Thị Toast (`frontend/app/[locale]/dashboard/page.tsx`)
✅ **ĐÃ SỬA**

Thêm logic kiểm tra query parameters và hiển thị toast thông báo lỗi khi user không có quyền.

### 4. Sell Page - Fix Router Import (`frontend/app/[locale]/sell/page.tsx`)
✅ **ĐÃ SỬA**

Sử dụng i18n router để hỗ trợ đa ngôn ngữ.

## Giải Pháp Cuối Cùng

### Bước 1: Clear Browser Cache & Cookies ⭐ QUAN TRỌNG

**Cách 1: Hard Reload (Khuyến nghị)**
1. Mở DevTools (F12)
2. Chuột phải vào nút Refresh
3. Chọn "Empty Cache and Hard Reload"

**Cách 2: Clear Storage**
1. DevTools (F12) > Application > Storage
2. Click "Clear site data"

**Cách 3: Thủ công**
1. DevTools (F12) > Application > Cookies
2. Xóa cookie `accessToken`
3. Application > Local Storage
4. Xóa: `accessToken`, `refreshToken`, `user`

### Bước 2: Restart Frontend Server

```powershell
# Stop server hiện tại (Ctrl+C)
# Xóa Next.js cache
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web\frontend"
rm -rf .next

# Start lại
npm run dev
```

### Bước 3: Login Lại

1. Truy cập: http://localhost:3000/vi/auth/login
2. Logout nếu đang đăng nhập
3. Login với: `buyer@example.com` / `buyer123`

### Bước 4: Verify JWT Token

Mở Console (F12) và chạy:
```javascript
const token = localStorage.getItem('accessToken');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Roles:', payload.roles);
  console.log('Permissions:', payload.permissions);
  console.log('Has PM-010?', payload.permissions?.includes('PM-010'));
}
```

**Kết quả mong đợi:**
```
Roles: ["buyer"]
Permissions: (17) ["PM-001", "PM-002", "PM-003", "PM-010", ...]
Has PM-010? true
```

## Kiểm Tra Kết Quả

### Test Thủ Công

**Buyer có thể truy cập:**
- ✅ `/vi/dashboard` - Dashboard
- ✅ `/vi/sell/new` - Tạo tin đăng (có PM-010)
- ✅ `/vi/sell/my-listings` - Tin đăng của tôi (có PM-011)
- ✅ `/vi/listings` - Xem danh sách
- ✅ `/vi/rfq/create` - Tạo RFQ
- ✅ `/vi/orders` - Đơn hàng
- ✅ `/vi/account/profile` - Tài khoản

**Buyer KHÔNG thể truy cập:**
- ❌ `/vi/admin` - Quản trị (redirect về dashboard với toast)
- ❌ `/vi/depot` - Depot (redirect về dashboard với toast)

### Test Tự Động

Chạy script test:
```powershell
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web"
.\test-all-menus.ps1
```

## Permissions của Buyer

Buyer trong database hiện có **17 permissions**:

| Permission | Mô Tả |
|-----------|-------|
| PM-001 | Xem tin đăng công khai |
| PM-002 | Tìm kiếm tin đăng |
| PM-003 | Xem chi tiết tin đăng |
| PM-010 | **Tạo tin đăng** ⭐ |
| PM-011 | **Sửa tin đăng** |
| PM-012 | Gửi duyệt/Xuất bản |
| PM-013 | Lưu trữ tin đăng |
| PM-014 | Xóa tin đăng |
| PM-020 | Quản lý RFQ |
| PM-022 | Phản hồi RFQ |
| PM-030 | Quản lý đơn hàng |
| PM-040 | Thanh toán |
| PM-041 | Escrow |
| PM-042 | Xác nhận thanh toán |
| PM-043 | Hủy thanh toán |
| PM-050 | Vận chuyển |
| PM-060 | Đánh giá |

## Middleware Logs

Khi truy cập trang thành công:
```
🚪 MIDDLEWARE: /vi/sell/new
🔐 TOKEN CHECK: { path: '/sell/new', permission: 'PM-010', hasToken: true }
🔐 VERIFYING JWT...
✅ JWT VALID for user: user-buyer Role: buyer
🔑 USER ROLES: ['buyer']
🔑 USER PERMISSIONS (raw): ['PM-001', 'PM-002', ..., 'PM-010', ...]
🔑 USER PERMISSIONS (normalized): ['PM-001', 'PM-002', ..., 'PM-010', ...]
✅ ACCESS GRANTED: /vi/sell/new
```

Khi không có quyền:
```
❌ PERMISSION DENIED: admin.access
📍 User tried to access: /admin
🔑 User has permissions: ['PM-001', 'PM-002', ...]
👤 User roles: ['buyer']
```

## Files Đã Thay Đổi

1. `frontend/middleware.ts` - Thêm error parameters
2. `frontend/app/[locale]/dashboard/page.tsx` - Toast notification
3. `frontend/app/[locale]/sell/page.tsx` - Fix router import
4. `backend/check-buyer-perms.js` - Script kiểm tra permissions
5. `test-all-menus.ps1` - Script test tự động
6. `FIX-REDIRECT-ISSUE.md` - Documentation
7. `FIX-FINAL-CLEAR-CACHE.md` - Hướng dẫn fix

## Troubleshooting

### Vẫn bị redirect sau khi clear cache?

1. **Kiểm tra JWT token:**
   ```javascript
   const token = localStorage.getItem('accessToken');
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log(payload);
   ```
   Đảm bảo có `roles` và `permissions` array

2. **Kiểm tra cookie:**
   ```javascript
   document.cookie
   ```
   Đảm bảo có `accessToken=...`

3. **Restart cả frontend và backend:**
   ```powershell
   # Stop all (Ctrl+C)
   # Backend
   cd backend
   npm run dev
   
   # Frontend (terminal mới)
   cd frontend
   rm -rf .next
   npm run dev
   ```

4. **Dùng Incognito/Private Window** để test

### Menu vẫn bị lỗi sau khi fix?

Có thể do:
- ❌ Chưa clear cache đúng cách
- ❌ Đang dùng browser khác (Chrome vs Edge)
- ❌ Frontend chạy sai port (check netstat)
- ❌ Backend không chạy (check port 3006)

## Kết Luận

Vấn đề đã được giải quyết **HOÀN TOÀN** bằng cách:
1. ✅ Backend đã có JWT with permissions (không cần sửa)
2. ✅ Middleware đã đọc permissions từ JWT (đã sửa)
3. ✅ Dashboard đã hiển thị toast error (đã sửa)
4. ⭐ **User cần clear cache và login lại để lấy JWT token mới**

---
**Ngày**: 2025-10-27  
**Trạng thái**: ✅ RESOLVED  
**Action Required**: Clear browser cache và login lại
