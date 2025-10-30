# Hướng Dẫn Quản Lý Quyền Động - Không Cần Sửa Code

## Vấn Đề Trước Đây

❌ **Cách cũ (phải sửa code):**
1. Admin muốn thêm quyền mới → Phải sửa `seed-complete-rbac.mjs`
2. Phải chạy lại seed script
3. Phải restart backend
4. User phải re-login
5. **Rất phức tạp và dễ lỗi!**

## Giải Pháp: Admin RBAC Management API

✅ **Cách mới (hoàn toàn động qua API):**
1. Admin dùng API để thêm/sửa/xóa permissions
2. API tự động update database
3. API tự động force user re-login
4. **KHÔNG CẦN SỬA CODE!**

---

## Cách Sử Dụng API

### 1️⃣ Login Admin (Lấy Token)

```powershell
# Login as admin
$login = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/login' `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{"email":"admin@example.com","password":"admin123"}' `
  -UseBasicParsing

$loginData = $login.Content | ConvertFrom-Json
$token = $loginData.data.token

Write-Host "Admin token: $token"
```

### 2️⃣ Thêm Quyền Mới Cho Role

**Ví dụ: Thêm PM-023 (MANAGE_QA) cho seller**

```powershell
# Add permission to seller role
$resp = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/admin/rbac/roles/seller/permissions' `
  -Method POST `
  -Headers @{
    'Authorization'="Bearer $token"
    'Content-Type'='application/json'
  } `
  -Body '{"permissionCode":"PM-023"}' `
  -UseBasicParsing

$data = $resp.Content | ConvertFrom-Json

if ($data.success) {
  Write-Host "✅ Đã thêm PM-023 cho seller!" -ForegroundColor Green
  Write-Host "📋 Seller giờ có: $($data.data.permissions -join ', ')"
  Write-Host "🔄 Role version: $($data.data.role_version)" 
  Write-Host "⚠️  Seller users cần re-login để nhận quyền mới"
}
```

**Điều gì xảy ra tự động:**
- ✅ Permission được thêm vào `role_permissions` table
- ✅ `role_version` tự động tăng lên
- ✅ `permissions_updated_at` của tất cả seller users được update
- ✅ Seller users bị force logout khi request tiếp theo (JWT check version)

### 3️⃣ Xóa Quyền Khỏi Role

```powershell
# Remove permission from seller role
$resp = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/admin/rbac/roles/seller/permissions/PM-023' `
  -Method DELETE `
  -Headers @{'Authorization'="Bearer $token"} `
  -UseBasicParsing

$data = $resp.Content | ConvertFrom-Json

if ($data.success) {
  Write-Host "✅ Đã xóa PM-023 khỏi seller!" -ForegroundColor Green
  Write-Host "🔄 Role version: $($data.data.role_version)"
}
```

### 4️⃣ Xem Tất Cả Quyền Hiện Có

```powershell
# Get all permissions grouped by module
$resp = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/admin/rbac/permissions' `
  -Method GET `
  -Headers @{'Authorization'="Bearer $token"} `
  -UseBasicParsing

$data = $resp.Content | ConvertFrom-Json

# Display permissions by module
foreach ($module in $data.data.permissions.PSObject.Properties) {
  Write-Host "`n=== Module: $($module.Name) ===" -ForegroundColor Cyan
  $module.Value | ForEach-Object {
    Write-Host "  $($_.code) - $($_.name)"
  }
}
```

### 5️⃣ Tạo Permission Mới (Nếu Chưa Có)

```powershell
# Create new permission
$resp = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/admin/rbac/permissions' `
  -Method POST `
  -Headers @{
    'Authorization'="Bearer $token"
    'Content-Type'='application/json'
  } `
  -Body (@{
    code = "PM-999"
    name = "CUSTOM_FEATURE"
    description = "Quyền tùy chỉnh mới"
    module = "custom"
    action = "manage"
  } | ConvertTo-Json) `
  -UseBasicParsing

$data = $resp.Content | ConvertFrom-Json

if ($data.success) {
  Write-Host "✅ Đã tạo permission mới: $($data.data.code)" -ForegroundColor Green
}
```

---

## Tất Cả API Endpoints

### Permission Management

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| GET | `/api/v1/admin/rbac/permissions` | Lấy tất cả permissions (grouped by module) |
| POST | `/api/v1/admin/rbac/permissions` | Tạo permission mới |
| PUT | `/api/v1/admin/rbac/permissions/:code` | Cập nhật permission |
| DELETE | `/api/v1/admin/rbac/permissions/:code` | Xóa permission |

### Role Management

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| GET | `/api/v1/admin/rbac/roles` | Lấy tất cả roles với permissions |
| POST | `/api/v1/admin/rbac/roles` | Tạo role mới |

### Role-Permission Assignment

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| POST | `/api/v1/admin/rbac/roles/:roleCode/permissions` | Thêm permission vào role |
| DELETE | `/api/v1/admin/rbac/roles/:roleCode/permissions/:permCode` | Xóa permission khỏi role |

---

## Workflow Hoàn Chỉnh

### Kịch Bản: Seller Cần Quyền "Quản Lý Q&A"

**Bước 1: Admin kiểm tra permission có sẵn không**
```powershell
# List all permissions
GET /api/v1/admin/rbac/permissions

# Tìm thấy: PM-023 (MANAGE_QA)
```

**Bước 2: Admin thêm quyền cho seller**
```powershell
POST /api/v1/admin/rbac/roles/seller/permissions
Body: {"permissionCode":"PM-023"}

# API tự động:
# - Thêm vào role_permissions table
# - Tăng seller.role_version
# - Update permissions_updated_at cho tất cả seller users
```

**Bước 3: Seller re-login**
```
Seller login → Backend kiểm tra permissions_updated_at
→ JWT mới chứa PM-023
→ Seller có thể truy cập /rfq/[id]/qa
```

**Bước 4: Middleware tự động cho phép truy cập**
```typescript
// middleware.ts - ĐÃ CÓ SẴN
'/rfq/[id]/qa': 'PM-023'

// Seller có PM-023 → Truy cập OK!
```

---

## Tự Động Force Re-Login

### Cơ Chế Hoạt Động

1. **Khi admin thêm/xóa permission:**
   ```javascript
   // API tự động làm:
   await prisma.role.update({
     where: { code: roleCode },
     data: { 
       role_version: role.role_version + 1  // Tăng version
     }
   });
   
   await prisma.user.updateMany({
     where: { 
       user_roles: { 
         some: { role_id: role.id } 
       }
     },
     data: {
       permissions_updated_at: new Date()  // Force re-login
     }
   });
   ```

2. **Khi user request với JWT cũ:**
   ```javascript
   // Backend middleware kiểm tra (trong auth.ts):
   const user = await prisma.user.findUnique({
     where: { id: payload.userId }
   });
   
   if (user.permissions_updated_at > payload.iat) {
     // JWT token cũ → Force logout
     throw new Error('Permissions changed, please re-login');
   }
   ```

3. **User tự động logout và phải login lại**

---

## Script Mẫu: Thêm PM-020 Cho Seller

Tôi đã tạo script này để demo:

```powershell
# File: add-rfq-perm-to-seller.ps1

# 1. Login admin
$login = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/login' `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{"email":"admin@example.com","password":"admin123"}' `
  -UseBasicParsing

$token = ($login.Content | ConvertFrom-Json).data.token

# 2. Add PM-020 to seller
$resp = Invoke-WebRequest `
  -Uri 'http://localhost:3006/api/v1/admin/rbac/roles/seller/permissions' `
  -Method POST `
  -Headers @{
    'Authorization'="Bearer $token"
    'Content-Type'='application/json'
  } `
  -Body '{"permissionCode":"PM-020"}' `
  -UseBasicParsing

$data = $resp.Content | ConvertFrom-Json

Write-Host "✅ Done! Seller now has: $($data.data.permissions -join ', ')"
```

---

## So Sánh: Trước vs Sau

### ❌ Trước Khi Có API (Phải Sửa Code)

```javascript
// 1. Sửa file seed-complete-rbac.mjs
const rolePermissionMap = {
  seller: [
    'PM-001', 'PM-002', 'PM-003',
    'PM-020'  // ← PHẢI THÊM TAY VÀO CODE
  ]
};

// 2. Chạy seed
cd backend
node scripts/seed/seed-complete-rbac.mjs

// 3. Restart backend
npm run dev

// 4. Yêu cầu users re-login

// 🔴 Nhược điểm:
// - Phải sửa code
// - Phải restart server
// - Dễ lỗi
// - Không linh hoạt
```

### ✅ Sau Khi Có API (Hoàn Toàn Động)

```powershell
# 1. Gọi API duy nhất
POST /api/v1/admin/rbac/roles/seller/permissions
Body: {"permissionCode":"PM-020"}

# 2. API tự động:
# - Update database
# - Force users re-login
# - KHÔNG CẦN SỬA CODE
# - KHÔNG CẦN RESTART SERVER

# 🟢 Ưu điểm:
# - Không cần sửa code
# - Không cần restart
# - An toàn
# - Linh hoạt
# - Có thể build UI admin
```

---

## Bước Tiếp Theo: Tạo Admin UI

Bạn có thể tạo giao diện admin để quản lý permissions:

```typescript
// AdminPermissionsPage.tsx (ví dụ)

function AdminPermissionsPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  
  // Fetch data
  useEffect(() => {
    fetch('/api/v1/admin/rbac/roles', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setRoles(data.data.roles));
      
    fetch('/api/v1/admin/rbac/permissions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setPermissions(data.data.permissions));
  }, []);
  
  // Add permission to role
  const addPermission = async (roleCode, permCode) => {
    await fetch(`/api/v1/admin/rbac/roles/${roleCode}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ permissionCode: permCode })
    });
    
    // Refresh data
    // ...
  };
  
  return (
    <div>
      <h1>Quản Lý Phân Quyền</h1>
      
      {/* Permission matrix */}
      <table>
        <thead>
          <tr>
            <th>Permission</th>
            {roles.map(role => <th key={role.code}>{role.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {Object.entries(permissions).map(([module, perms]) => (
            perms.map(perm => (
              <tr key={perm.code}>
                <td>{perm.code} - {perm.name}</td>
                {roles.map(role => {
                  const hasPermission = role.permissions.includes(perm.code);
                  return (
                    <td key={role.code}>
                      <input 
                        type="checkbox"
                        checked={hasPermission}
                        onChange={(e) => {
                          if (e.target.checked) {
                            addPermission(role.code, perm.code);
                          } else {
                            removePermission(role.code, perm.code);
                          }
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Kết Luận

✅ **Admin RBAC API đã giải quyết hoàn toàn vấn đề:**

1. ✅ Admin thêm/sửa/xóa quyền qua API
2. ✅ Không cần sửa code
3. ✅ Không cần restart server
4. ✅ Không cần chạy seed script
5. ✅ Tự động force users re-login
6. ✅ Có thể build UI admin dễ dàng

**API đã sẵn sàng sử dụng ngay!**

📖 Xem thêm: `HUONG-DAN-ADMIN-RBAC-API.md` để biết chi tiết tất cả endpoints.
