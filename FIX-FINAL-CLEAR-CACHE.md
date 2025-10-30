# Fix Cuối Cùng: Redirect Issue - Clear Cache & Restart

## Vấn đề đã kiểm tra

✅ **JWT có đầy đủ roles và permissions**
```json
{
  "userId": "user-buyer",
  "email": "buyer@example.com",
  "roles": ["buyer"],
  "permissions": ["PM-001", "PM-002", "PM-003", "PM-010", "PM-011", ...],
  "roleVersions": {"buyer": 1}
}
```

✅ **Database buyer có đầy đủ 17 permissions** bao gồm PM-010 (CREATE_LISTING)

✅ **Middleware code đúng** - đọc permissions từ JWT payload

✅ **Backend `/auth/login` đúng** - trả về JWT với permissions

## Nguyên nhân cuối cùng

Vấn đề là **BROWSER CACHE hoặc MIDDLEWARE CHƯA ĐƯỢC RESTART**:

1. Browser đang sử dụng **old JWT token** (không có permissions)
2. Middleware code đã được update nhưng **Next.js dev server chưa reload**
3. Cookie `accessToken` cũ vẫn còn trong browser

## Giải pháp - THỰC HIỆN THEO THỨ TỰ

### Bước 1: Restart Frontend Server

```powershell
# Trong terminal đang chạy frontend
# Nhấn Ctrl+C để stop
# Sau đó chạy lại:
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web\frontend"
npm run dev
```

### Bước 2: Clear Browser Cache & Cookies

**Chrome/Edge:**
1. Mở DevTools (F12)
2. Chuột phải vào nút Refresh
3. Chọn "Empty Cache and Hard Reload"
4. Hoặc: DevTools > Application > Storage > Clear site data

**Hoặc xóa cookies thủ công:**
1. DevTools (F12) > Application > Cookies
2. Xóa cookie `accessToken`
3. Xóa localStorage items: `accessToken`, `refreshToken`, `user`

### Bước 3: Login lại

1. Mở: http://localhost:3000/vi/auth/login
2. Logout nếu đang đăng nhập
3. Login lại với: `buyer@example.com` / `buyer123`

### Bước 4: Kiểm tra JWT Token mới

Mở DevTools Console (F12) và chạy:

```javascript
// 1. Kiểm tra token trong cookie
document.cookie.split(';').find(c => c.includes('accessToken'))

// 2. Decode JWT để xem payload
const token = localStorage.getItem('accessToken');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('🔑 JWT Payload:', payload);
  console.log('📋 Roles:', payload.roles);
  console.log('🔐 Permissions:', payload.permissions);
  console.log('✅ Has PM-010?', payload.permissions.includes('PM-010'));
}
```

**Kết quả mong đợi:**
```
✅ Has PM-010? true
```

### Bước 5: Test truy cập /sell/new

1. Truy cập: http://localhost:3000/vi/sell/new
2. Mở DevTools Console
3. Xem middleware logs:

**Logs mong đợi:**
```
🚪 MIDDLEWARE: /vi/sell/new
🔐 TOKEN CHECK: { path: '/sell/new', permission: 'PM-010', hasToken: true }
🔐 VERIFYING JWT...
✅ JWT VALID for user: user-buyer Role: buyer
🔑 USER ROLES: ['buyer']
🔑 USER PERMISSIONS (raw): ['PM-001', 'PM-002', 'PM-003', 'PM-010', ...]
🔑 USER PERMISSIONS (normalized): ['PM-001', 'PM-002', 'PM-003', 'PM-010', ...]
✅ ACCESS GRANTED: /vi/sell/new
```

**Nếu vẫn thấy redirect:**
```
❌ PERMISSION DENIED: PM-010
📍 User tried to access: /sell/new
🔑 User has permissions: [...]  ← KIỂM TRA DANH SÁCH NÀY
```

### Bước 6: Nếu vẫn bị redirect

Kiểm tra lại permissions trong JWT:

```powershell
# Check JWT token from API
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web"

$login = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/login' `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{"email":"buyer@example.com","password":"buyer123"}' `
  -UseBasicParsing

$loginData = $login.Content | ConvertFrom-Json
$token = $loginData.data.token

# Decode JWT
$parts = $token.Split('.')
$payload = $parts[1]
$padding = (4 - ($payload.Length % 4)) % 4
$payload += '=' * $padding
$bytes = [Convert]::FromBase64String($payload)
$json = [System.Text.Encoding]::UTF8.GetString($bytes)
Write-Host $json | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

## Kiểm tra các trang khác

Sau khi fix, test các trang này:

### Buyer có thể truy cập:
- ✅ `/vi/dashboard` - Dashboard
- ✅ `/vi/listings` - Xem danh sách tin đăng
- ✅ `/vi/rfq/create` - Tạo yêu cầu báo giá
- ✅ `/vi/orders` - Xem đơn hàng
- ✅ `/vi/account/profile` - Trang cá nhân
- ✅ `/vi/sell/new` - **Tạo tin đăng** (có PM-010)
- ✅ `/vi/sell/my-listings` - **Tin đăng của tôi** (có PM-011)

### Buyer KHÔNG thể truy cập:
- ❌ `/vi/admin` - Trang admin (cần admin.access)
- ❌ `/vi/admin/users` - Quản lý user (cần admin.users)
- ❌ `/vi/depot` - Quản lý depot (cần depot.read)

## Debug Commands

### Check frontend đang chạy ở port nào
```powershell
netstat -ano | findstr ":3000"
netstat -ano | findstr ":3001"
```

### Check backend đang chạy
```powershell
netstat -ano | findstr ":3006"
```

### Check buyer permissions trong database
```powershell
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web\backend"
node check-buyer-perms.js
```

## Nếu vẫn không fix được

Thực hiện **FULL RESET**:

```powershell
# 1. Stop tất cả servers (Ctrl+C)

# 2. Clear browser data hoàn toàn
# Chrome: Settings > Privacy > Clear browsing data > All time

# 3. Restart backend
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web\backend"
npm run dev

# 4. Restart frontend (terminal MỚI)
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web\frontend"
rm -rf .next  # Xóa Next.js cache
npm run dev

# 5. Login lại trong browser
```

## Tóm tắt

Vấn đề chính là **browser cache JWT token cũ** không có permissions. Sau khi:
1. ✅ Clear cache/cookies
2. ✅ Restart frontend server
3. ✅ Login lại

Tất cả menu sẽ hoạt động đúng theo permissions của user!

---
**Updated**: 2025-10-27
**Status**: 🔧 READY TO TEST
