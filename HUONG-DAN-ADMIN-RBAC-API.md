# 🔐 ADMIN RBAC MANAGEMENT API

**Ngày:** 28/10/2025  
**Mục đích:** Cho phép admin quản lý roles, permissions và role_permissions qua API - KHÔNG CẦN THAY ĐỔI CODE!

---

## 🎯 GIẢI QUYẾT VẤN ĐỀ

### Trước đây ❌:
- Admin phải thêm permissions vào **seed script** (code)
- Phải **reseed database** (xóa data)
- Không dynamic, không flexible

### Bây giờ ✅:
- Admin thêm permissions qua **API**
- **Real-time** - không cần reseed
- **Dynamic** - permissions tự động áp dụng
- Users **auto re-login** khi permissions thay đổi

---

## 📋 API ENDPOINTS

### Base URL: `/api/v1/admin/rbac`

| Method | Endpoint | Description | Admin Only |
|--------|----------|-------------|-----------|
| GET | `/permissions` | Lấy tất cả permissions | ✅ |
| POST | `/permissions` | Tạo permission mới | ✅ |
| PUT | `/permissions/:code` | Cập nhật permission | ✅ |
| DELETE | `/permissions/:code` | Xóa permission | ✅ |
| GET | `/roles` | Lấy tất cả roles + permissions | ✅ |
| POST | `/roles` | Tạo role mới | ✅ |
| POST | `/roles/:roleCode/permissions` | Gán permissions cho role | ✅ |
| DELETE | `/roles/:roleCode/permissions/:permissionCode` | Xóa permission khỏi role | ✅ |

---

## 🔧 HƯỚNG DẪN SỬ DỤNG

### 1. Login as Admin

```powershell
$login = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/login' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{"email":"admin@example.com","password":"admin123"}' -UseBasicParsing

$adminData = $login.Content | ConvertFrom-Json
$adminToken = $adminData.data.token

Write-Host "Admin Token: $adminToken"
```

---

### 2. Tạo Permission Mới (PM-042B, PM-091B)

#### Tạo PM-042B (VIEW_DELIVERY):

```powershell
$pm042b = @{
    code = "PM-042B"
    name = "VIEW_DELIVERY"
    description = "Xem thông tin vận chuyển"
    module = "delivery"
    action = "view"
} | ConvertTo-Json

$result = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/admin/rbac/permissions' -Method POST -Headers @{
    'Content-Type' = 'application/json'
    'Authorization' = "Bearer $adminToken"
} -Body $pm042b -UseBasicParsing

$result.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

#### Tạo PM-091B (VIEW_SELLER_INVOICES):

```powershell
$pm091b = @{
    code = "PM-091B"
    name = "VIEW_SELLER_INVOICES"
    description = "Xem hóa đơn/doanh thu seller"
    module = "billing"
    action = "view"
} | ConvertTo-Json

$result = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/admin/rbac/permissions' -Method POST -Headers @{
    'Content-Type' = 'application/json'
    'Authorization' = "Bearer $adminToken"
} -Body $pm091b -UseBasicParsing

$result.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "message": "Permission created successfully",
  "data": {
    "permission": {
      "id": "perm-pm-042b",
      "code": "PM-042B",
      "name": "VIEW_DELIVERY",
      "description": "Xem thông tin vận chuyển",
      "module": "delivery",
      "action": "view"
    }
  }
}
```

---

### 3. Xem Tất Cả Permissions

```powershell
$perms = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/admin/rbac/permissions' -Method GET -Headers @{
    'Authorization' = "Bearer $adminToken"
} -UseBasicParsing

$permsData = $perms.Content | ConvertFrom-Json
Write-Host "Total Permissions: $($permsData.data.total)"

# Hiển thị grouped by module
$permsData.data.grouped | ConvertTo-Json -Depth 3
```

---

### 4. Xem Tất Cả Roles + Permissions

```powershell
$roles = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/admin/rbac/roles' -Method GET -Headers @{
    'Authorization' = "Bearer $adminToken"
} -UseBasicParsing

$rolesData = $roles.Content | ConvertFrom-Json

# Hiển thị seller role
$sellerRole = $rolesData.data.roles | Where-Object { $_.code -eq 'seller' }
Write-Host "Seller Role:"
Write-Host "- Name: $($sellerRole.name)"
Write-Host "- Total Permissions: $($sellerRole.permissions_count)"
Write-Host "- Permissions:"
$sellerRole.permissions | Format-Table code, name, module
```

---

### 5. Gán Permissions Mới Cho Seller Role

```powershell
# Lấy tất cả permissions hiện tại của seller
$sellerPerms = @(
    'PM-001', 'PM-002', 'PM-003',
    'PM-010', 'PM-011', 'PM-012', 'PM-013', 'PM-014',
    'PM-021', 'PM-022',
    'PM-040', 'PM-042B',  # + VIEW_DELIVERY mới
    'PM-050', 'PM-091B'   # + VIEW_SELLER_INVOICES mới
)

$body = @{
    permissionCodes = $sellerPerms
} | ConvertTo-Json

$result = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/admin/rbac/roles/seller/permissions' -Method POST -Headers @{
    'Content-Type' = 'application/json'
    'Authorization' = "Bearer $adminToken"
} -Body $body -UseBasicParsing

$result.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "message": "Successfully assigned 14 permissions to role seller. Users need to re-login.",
  "data": {
    "role": "seller",
    "permissions_count": 14,
    "new_role_version": 2
  }
}
```

**Lưu ý quan trọng:**
- ✅ `role_version` tự động tăng (1 → 2)
- ✅ `permissions_updated_at` tự động cập nhật cho tất cả seller users
- ✅ Seller users phải **logout/login** để nhận permissions mới

---

### 6. Verify Seller Users Cần Re-login

```powershell
# Check permissions_updated_at của seller users
$sellers = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/admin/users?role=seller' -Method GET -Headers @{
    'Authorization' = "Bearer $adminToken"
} -UseBasicParsing

$sellersData = $sellers.Content | ConvertFrom-Json
$sellersData.data.users | Select-Object email, permissions_updated_at | Format-Table
```

Nếu `permissions_updated_at` không null → User cần re-login

---

### 7. Test Seller Login Mới

```powershell
# Seller re-login
$sellerLogin = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/login' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{"email":"seller@example.com","password":"seller123"}' -UseBasicParsing

$sellerData = $sellerLogin.Content | ConvertFrom-Json
$sellerToken = $sellerData.data.token

Write-Host "Seller Token: $sellerToken"

# Decode token để xem permissions (cần jwt-cli hoặc jwt.io)
# Token sẽ chứa: permissions: ['PM-001', ..., 'PM-042B', 'PM-091B']
```

---

### 8. Test Seller Truy Cập /delivery và /billing

```powershell
# Test /delivery
try {
    $delivery = Invoke-WebRequest -Uri 'http://localhost:3000/vi/delivery' -Method GET -Headers @{
        'Authorization' = "Bearer $sellerToken"
    } -UseBasicParsing -ErrorAction Stop
    
    Write-Host "✅ /delivery - OK (Status: $($delivery.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ /delivery - FAILED: $_" -ForegroundColor Red
}

# Test /billing
try {
    $billing = Invoke-WebRequest -Uri 'http://localhost:3000/vi/billing' -Method GET -Headers @{
        'Authorization' = "Bearer $sellerToken"
    } -UseBasicParsing -ErrorAction Stop
    
    Write-Host "✅ /billing - OK (Status: $($billing.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ /billing - FAILED: $_" -ForegroundColor Red
}
```

---

## 🔄 LUỒNG HOẠT ĐỘNG

```
1. Admin tạo permission mới qua API
   POST /api/v1/admin/rbac/permissions
   ↓
2. Permission được lưu vào database
   ✅ Table: permissions
   ↓
3. Admin gán permission cho role
   POST /api/v1/admin/rbac/roles/seller/permissions
   ↓
4. Hệ thống tự động:
   ✅ Xóa role_permissions cũ
   ✅ Tạo role_permissions mới
   ✅ Tăng role_version
   ✅ Update permissions_updated_at cho users
   ↓
5. Seller user login lại
   POST /api/v1/auth/login
   ↓
6. JWT token mới chứa permissions đầy đủ
   { permissions: ['PM-001', ..., 'PM-042B', 'PM-091B'] }
   ↓
7. Middleware kiểm tra permissions trong token
   ✅ Cho phép truy cập /delivery (PM-042B)
   ✅ Cho phép truy cập /billing (PM-091B)
```

---

## ✅ ƯU ĐIỂM

| Trước (Seed Script) | Sau (API) |
|-------------------|-----------|
| ❌ Phải sửa code | ✅ Dùng API |
| ❌ Phải reseed database | ✅ Real-time update |
| ❌ Mất data cũ | ✅ Giữ nguyên data |
| ❌ Không dynamic | ✅ Hoàn toàn dynamic |
| ❌ Developer only | ✅ Admin có thể tự quản lý |

---

## 🎯 USE CASES

### Case 1: Thêm quyền mới cho role hiện tại
```bash
# Admin thêm PM-042B, PM-091B cho seller
POST /admin/rbac/roles/seller/permissions
Body: { permissionCodes: [...existing, 'PM-042B', 'PM-091B'] }
```

### Case 2: Tạo role mới với permissions
```bash
# Tạo role "warehouse_manager"
POST /admin/rbac/roles
Body: { code: 'warehouse_manager', name: 'Warehouse Manager', level: 8 }

# Gán permissions
POST /admin/rbac/roles/warehouse_manager/permissions
Body: { permissionCodes: ['PM-083', 'PM-084', 'PM-085', 'PM-086'] }
```

### Case 3: Revoke permission từ role
```bash
# Xóa PM-010 khỏi buyer (buyer không được tạo listing)
DELETE /admin/rbac/roles/buyer/permissions/PM-010
```

---

## 🚀 DEPLOYMENT

### Production:
```bash
# API đã được register tự động trong server.ts
# Chỉ cần start backend là có

cd backend
npm run dev
# hoặc
npm start
```

### Testing:
```bash
# Import Postman collection (tạo file riêng)
# Hoặc dùng PowerShell scripts ở trên
```

---

## 📊 MONITORING

```sql
-- Xem permissions_updated_at của users
SELECT 
    email, 
    roles, 
    permissions_updated_at,
    last_login_at
FROM users
WHERE permissions_updated_at IS NOT NULL;

-- Xem role_version history
SELECT 
    code, 
    name, 
    role_version, 
    updated_at
FROM role
ORDER BY updated_at DESC;

-- Xem permissions của 1 role
SELECT 
    r.code AS role_code,
    p.code AS permission_code,
    p.name AS permission_name,
    rp.scope
FROM role r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.code = 'seller'
ORDER BY p.module, p.code;
```

---

## ✅ KẾT LUẬN

**Đã giải quyết vấn đề:**
- ✅ Admin có thể quản lý permissions qua API
- ✅ Không cần thay đổi code
- ✅ Real-time, dynamic
- ✅ Auto force user re-login khi permissions thay đổi
- ✅ Scalable cho tương lai

**Ngày hoàn thành:** 28/10/2025
