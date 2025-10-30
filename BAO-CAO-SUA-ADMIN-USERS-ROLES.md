# BÁO CÁO: SỬA API ADMIN USERS ĐỂ TRẢ VỀ ROLES ĐÚNG

## 📋 VẤN ĐỀ

Menu `/admin/rbac/users` (Gán Roles cho Users) đang hiển thị **permissions** thay vì **roles** do API `/api/v1/admin/users` trả về sai dữ liệu.

### Lỗi phát hiện:
```typescript
// ❌ SAI - Đang lấy từ user_permissions
roles: user.user_permissions.map(up => up.permissions.name)
```

API đang lấy từ bảng `user_permissions` (permissions được gán trực tiếp cho user) thay vì `user_roles` (roles của user).

---

## ✅ GIẢI PHÁP ĐÃ THỰC HIỆN

### 1. **Sửa GET `/api/v1/admin/users` - Danh sách users**

**File:** `backend/src/routes/admin/users.ts`

#### Thay đổi:
- ✅ Thay `user_permissions` bằng `user_roles_user_roles_user_idTousers`
- ✅ Trả về đầy đủ thông tin role: `id`, `code`, `name`, `level`
- ✅ Đổi field từ `fullName` sang `display_name` để đồng bộ với frontend

**Trước:**
```typescript
select: {
  user_permissions: {
    include: {
      permissions: {
        select: { code: true, name: true }
      }
    }
  }
}

// Transform
roles: user.user_permissions.map(up => up.permissions.name)
```

**Sau:**
```typescript
select: {
  user_roles_user_roles_user_idTousers: {
    include: {
      roles: {
        select: {
          id: true,
          code: true,
          name: true,
          level: true
        }
      }
    }
  }
}

// Transform
roles: user.user_roles_user_roles_user_idTousers.map(ur => ({
  id: ur.roles.id,
  code: ur.roles.code,
  name: ur.roles.name,
  level: ur.roles.level
}))
```

---

### 2. **Sửa GET `/api/v1/admin/users/:id` - Chi tiết user**

#### Thay đổi:
- ✅ Thêm `user_roles` với đầy đủ thông tin roles và permissions
- ✅ Giữ lại `user_permissions` (direct permissions)  
- ✅ Phân biệt rõ **roles** vs **directPermissions**

**Response mới:**
```typescript
{
  roles: [
    {
      id: "role-id",
      code: "ROLE-ADMIN",
      name: "Administrator",
      level: 100,
      assignedAt: "2025-10-28T...",
      permissions: [...]  // Permissions từ role
    }
  ],
  directPermissions: [...]  // Permissions gán trực tiếp
}
```

---

### 3. **Sửa POST `/api/v1/admin/users` - Tạo user mới**

#### Thay đổi:
- ✅ Gán **roles** thay vì permissions
- ✅ Sử dụng bảng `user_roles`
- ✅ Field names: `user_id`, `role_id`, `assigned_by`, `assigned_at`, `created_at`

**Trước:**
```typescript
// Tạo user_permissions
const userPermissions = permissions.map(perm => ({
  userId: newUser.id,
  permissionId: perm.id
}))
await prisma.user_permissions.createMany({ data: userPermissions })
```

**Sau:**
```typescript
// Tạo user_roles
const userRoles = roleRecords.map(role => ({
  id: `ur_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  user_id: newUser.id,
  role_id: role.id,
  assigned_by: (request.user as any)?.userId,
  assigned_at: new Date(),
  created_at: new Date()
}))
await prisma.user_roles.createMany({ data: userRoles })
```

---

### 4. **Sửa PUT `/api/v1/admin/users/:id` - Cập nhật user**

#### Thay đổi:
- ✅ Cập nhật **roles** trong bảng `user_roles`
- ✅ Xóa roles cũ trước khi gán mới
- ✅ Thêm `updatedAt` field

**Trước:**
```typescript
await prisma.user_permissions.deleteMany({ where: { userId: id } })
await prisma.user_permissions.createMany({ data: userPermissions })
```

**Sau:**
```typescript
await prisma.user_roles.deleteMany({ where: { user_id: id } })
await prisma.user_roles.createMany({ data: userRoles })
```

---

## 📊 BẢNG ROLES TRONG DATABASE

### Cấu trúc bảng `user_roles`:
```sql
model user_roles {
  id          String
  user_id     String   -- FK to users
  role_id     String   -- FK to roles
  assigned_by String?  -- FK to users (admin who assigned)
  assigned_at DateTime
  expires_at  DateTime?
  created_at  DateTime
  
  @@unique([user_id, role_id])
}
```

### Cấu trúc bảng `roles`:
```sql
model roles {
  id             String
  code           String @unique
  name           String
  description    String?
  level          Int @default(0)
  is_system_role Boolean @default(false)
  role_version   Int @default(1)
  created_at     DateTime
  updated_at     DateTime
}
```

---

## 🔗 INTEGRATION VỚI FRONTEND

### Page: `/admin/rbac/users`
**File:** `frontend/app/[locale]/admin/rbac/users/page.tsx`

API calls:
1. ✅ `GET /api/v1/admin/users` - Lấy danh sách users với roles
2. ✅ `GET /api/v1/admin/rbac/roles` - Lấy danh sách tất cả roles
3. ✅ `GET /api/v1/admin/rbac/users/:userId/roles` - Lấy roles của user khi mở dialog
4. ✅ `POST /api/v1/admin/rbac/user-roles/assign` - Gán roles cho user

### Hiển thị trên UI:
```tsx
<TableCell>
  <div className="flex flex-wrap gap-1">
    {user.roles && user.roles.length > 0 ? (
      user.roles.map((role) => (
        <Badge key={role.id} variant="outline">
          {role.name}
        </Badge>
      ))
    ) : (
      <span className="text-muted-foreground text-sm">
        Chưa có role
      </span>
    )}
  </div>
</TableCell>
```

---

## 🎯 KẾT QUẢ

### ✅ API trả về đúng:
```json
{
  "success": true,
  "data": [
    {
      "id": "user-id",
      "email": "user@example.com",
      "display_name": "User Name",
      "status": "ACTIVE",
      "roles": [
        {
          "id": "role-id",
          "code": "ROLE-SELLER",
          "name": "Seller",
          "level": 40
        }
      ]
    }
  ]
}
```

### ✅ Frontend hiển thị:
- Danh sách users với roles hiện tại
- Badge cho mỗi role với tên và code
- Level và số permissions của role
- Dialog gán roles với checkbox

---

## 🧪 CÁCH TEST

### 1. Khởi động backend:
```bash
cd backend
npm run dev
```

### 2. Test API trực tiếp:
```powershell
# Login
$login = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/login' `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{"email":"admin@example.com","password":"admin123"}' `
  -UseBasicParsing

$token = ($login.Content | ConvertFrom-Json).data.token

# Get users with roles
$users = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/admin/users' `
  -Method GET `
  -Headers @{'Authorization'="Bearer $token"} `
  -UseBasicParsing

($users.Content | ConvertFrom-Json).data | Select email, roles
```

### 3. Test trên UI:
```
1. Đăng nhập: http://localhost:3000/vi/login (admin account)
2. Vào: http://localhost:3000/vi/admin/rbac/users
3. Kiểm tra cột "Roles hiện tại" có hiển thị roles không
4. Click "Gán Roles" để test gán roles
```

---

## 📝 NOTES

### Sự khác biệt giữa `user_roles` và `user_permissions`:

**`user_roles`:**
- User được gán **roles**
- Mỗi role chứa nhiều permissions
- Dễ quản lý và maintain
- Thay đổi permissions của role → tất cả users có role đó được cập nhật

**`user_permissions`:**
- Permissions được gán **trực tiếp** cho user
- Override permissions từ roles
- Dùng cho trường hợp đặc biệt
- Ví dụ: Tạm thời cấp thêm quyền cho 1 user mà không ảnh hưởng role

### Permissions tổng hợp:
```
User effective permissions = 
  Permissions from roles + Direct permissions (user_permissions)
```

---

## 🔄 CẬP NHẬT DATABASE

Nếu cần migrate data từ `user_permissions` sang `user_roles`:

```sql
-- Check users có permissions nhưng chưa có roles
SELECT u.email, up.permission_id, p.name
FROM users u
JOIN user_permissions up ON u.id = up.user_id
JOIN permissions p ON up.permission_id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.id IS NULL;

-- Gán default role cho users chưa có role
INSERT INTO user_roles (id, user_id, role_id, assigned_at, created_at)
SELECT 
  'ur_' || gen_random_uuid()::text,
  u.id,
  'default-role-id',
  NOW(),
  NOW()
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.id IS NULL;
```

---

## ✨ TÓM TẮT

### Đã sửa:
1. ✅ GET `/api/v1/admin/users` - Trả về roles thay vì permissions
2. ✅ GET `/api/v1/admin/users/:id` - Bao gồm roles + direct permissions
3. ✅ POST `/api/v1/admin/users` - Tạo user với roles
4. ✅ PUT `/api/v1/admin/users/:id` - Cập nhật roles của user
5. ✅ Response format đồng bộ với frontend expectations

### API không thay đổi:
- ✅ GET `/api/v1/admin/rbac/users/:userId/roles` - Vẫn hoạt động tốt
- ✅ POST `/api/v1/admin/rbac/user-roles/assign` - Không cần sửa

### Lợi ích:
- 🎯 Frontend hiển thị đúng roles của users
- 🔄 Đồng bộ giữa danh sách và chi tiết
- 📊 Phân biệt rõ roles vs direct permissions
- 🚀 Dễ dàng quản lý và maintain

---

**Ngày hoàn thành:** 28/10/2025  
**File thay đổi:** `backend/src/routes/admin/users.ts`  
**Test script:** `test-admin-users-roles.ps1`
