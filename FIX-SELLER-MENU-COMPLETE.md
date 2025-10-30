# CÁC THAY ĐỔI ĐÃ FIX - SELLER MENU REDIRECT

## Vấn đề
Nhiều menu của seller khi bấm vào bị redirect về dashboard, sau đó lại bị redirect tiếp tục vì dashboard cũng yêu cầu quyền admin.

## Nguyên nhân phân tích

### 1. Dashboard yêu cầu quyền ADMIN (`PM-072`)
**File:** `middleware.ts` dòng 20
```typescript
'/dashboard': 'PM-072', // ADMIN_VIEW_DASHBOARD ❌ SAI!
```
- Seller không có `PM-072`
- Khi bị redirect về `/dashboard`, seller lại bị redirect tiếp

### 2. Routes không có trong ROUTE_PERMISSIONS mặc định về `PM-072`
**File:** `middleware.ts` dòng 293
```typescript
return 'PM-072'; // ❌ SAI! Tất cả routes không xác định yêu cầu quyền admin
```

### 3. Route `/rfq` chỉ cho phép buyer (`PM-020`)
**File:** `middleware.ts` dòng 28
```typescript
'/rfq': 'PM-020', // ❌ SAI! Seller có PM-021 nhưng không có PM-020
```

## Các sửa đổi đã thực hiện

### ✅ Fix 1: Dashboard cho phép tất cả user authenticated
```typescript
// middleware.ts
'/dashboard': 'PM-001', // ✅ Basic authenticated access - all users
'/dashboard/test': 'PM-001',
```

### ✅ Fix 2: Route không xác định mặc định về `PM-001`
```typescript
// middleware.ts - function getRequiredPermission()
// ⚠️ DEFAULT: Allow authenticated users for undefined routes
console.log('→ Defaulting to PM-001 (basic authenticated access) for undefined route');
return 'PM-001'; // ✅ Thay vì PM-072
```

### ✅ Fix 3: Route `/rfq` cho phép cả buyer VÀ seller
```typescript
// middleware.ts
'/rfq': ['PM-020', 'PM-021'], // ✅ CREATE_RFQ (buyer) or ISSUE_QUOTE (seller)
```

### ✅ Fix 4: Middleware ưu tiên đọc permissions từ JWT
```typescript
// middleware.ts
const userPermissions = (payload.permissions && Array.isArray(payload.permissions) && payload.permissions.length > 0)
  ? payload.permissions as string[]
  : await getUserPermissions(userRoles);
```

### ✅ Fix 5: Thêm PM-023 vào seller fallback permissions
```typescript
// middleware.ts - getUserPermissions()
if (roles.includes('seller')) {
  return [
    'PM-001', 'PM-002', 'PM-003',
    'PM-010', 'PM-011', 'PM-012', 'PM-013', 'PM-014',
    'PM-020', 'PM-021', 'PM-022', 'PM-023', // ✅ Thêm PM-023
    'PM-040', 'PM-042',
    'PM-050',
    'PM-060',
    'PM-090'
  ];
}
```

## Test

Chạy script test toàn bộ routes:
```powershell
.\test-all-seller-routes.ps1
```

Routes được test (15 routes):
- ✅ Dashboard (PM-001)
- ✅ Container (PM-001)
- ✅ Đăng tin mới (PM-010)
- ✅ Tin đăng của tôi (PM-011)
- ✅ RFQ (PM-020 or PM-021)
- ✅ RFQ nhận được (PM-021)
- ✅ Tạo báo giá (PM-021)
- ✅ Quản lý báo giá (PM-022)
- ✅ Đơn hàng (PM-040)
- ✅ Vận chuyển (PM-042)
- ✅ Đánh giá (PM-050)
- ✅ Tạo đánh giá (PM-050)
- ✅ Hóa đơn (PM-090)
- ✅ Hồ sơ (PM-001)
- ✅ Cài đặt (PM-001)

## Yêu cầu từ User

### 1. ⚠️ Xóa cache frontend
```powershell
cd frontend
Remove-Item -Recurse -Force .next
```

### 2. ⚠️ Restart servers
```powershell
# Kill all node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start backend
cd backend
npm run dev

# Start frontend (new terminal)
cd frontend
npm run dev
```

### 3. ⚠️ Clear browser cache & cookies
- Ctrl + Shift + Delete
- Clear cookies và cached files
- Hoặc dùng Incognito mode

### 4. ⚠️ Login lại
- Logout khỏi hệ thống
- Login với seller@example.com
- Token mới sẽ có đầy đủ permissions

## Kết quả mong đợi

Sau khi apply tất cả các fix:
- ✅ Tất cả 15 menu items của seller đều accessible
- ✅ Không còn redirect về dashboard
- ✅ Dashboard accessible cho tất cả users
- ✅ Middleware đọc permissions từ JWT thay vì hard-code
