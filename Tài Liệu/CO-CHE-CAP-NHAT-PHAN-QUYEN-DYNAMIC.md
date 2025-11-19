# 🔄 CƠ CHẾ CẬP NHẬT PHÂN QUYỀN ĐỘNG (DYNAMIC PERMISSIONS)

## ❓ CÂU HỎI

> **"Khi thay đổi permissions trong menu RBAC, tất cả tài khoản và dữ liệu có tự động cập nhật không?"**

## ✅ TRẢ LỜI NGẮN GỌN

**CÓ! Tất cả tài khoản TỰ ĐỘNG được cập nhật permissions theo role của họ.**

---

## 📊 CƠ CHẾ HOẠT ĐỘNG

### 1. Cấu trúc Database (Quan hệ)

```
┌─────────┐         ┌────────────┐         ┌────────┐         ┌──────────────────┐         ┌─────────────┐
│  users  │────────>│ user_roles │────────>│  roles │────────>│ role_permissions │────────>│ permissions │
└─────────┘         └────────────┘         └────────┘         └──────────────────┘         └─────────────┘
   (user)              (gán role)           (vai trò)            (gán quyền)                  (quyền hạn)
```

**Giải thích:**
- Bảng `users`: Lưu thông tin người dùng
- Bảng `user_roles`: Gán role cho user (many-to-many)
- Bảng `roles`: Định nghĩa các vai trò (admin, buyer, seller...)
- Bảng `role_permissions`: Gán permissions cho role (many-to-many)
- Bảng `permissions`: Định nghĩa các quyền hạn chi tiết

### 2. Dữ liệu KHÔNG lưu trực tiếp

❌ **Sai lầm thường nghĩ:**
```
users
├── id
├── email
├── password
└── permissions: ["PM-001", "PM-002", ...]  ❌ KHÔNG LƯU NHƯ VẬY
```

✅ **Cách lưu thực tế:**
```
users
├── id
├── email
└── password

user_roles
├── user_id → users.id
└── role_id → roles.id

roles
├── id
├── code: "buyer"
└── name: "Người mua"

role_permissions
├── role_id → roles.id
└── permission_id → permissions.id

permissions
├── id
└── code: "PM-001"
```

### 3. Permissions được tính ĐỘNG

**Khi user đăng nhập:**

```typescript
// Pseudocode
async function login(email, password) {
  // 1. Tìm user
  const user = await db.users.findOne({ email });
  
  // 2. Lấy roles của user
  const userRoles = await db.user_roles.find({ user_id: user.id });
  
  // 3. Với mỗi role, lấy permissions
  const permissions = [];
  for (const userRole of userRoles) {
    const rolePermissions = await db.role_permissions.find({
      role_id: userRole.role_id
    });
    
    for (const rp of rolePermissions) {
      const permission = await db.permissions.findOne({
        id: rp.permission_id
      });
      permissions.push(permission.code);
    }
  }
  
  // 4. Tạo JWT token với permissions
  const token = jwt.sign({
    userId: user.id,
    email: user.email,
    permissions: permissions  // Tính từ database real-time
  }, SECRET, { expiresIn: '24h' });
  
  return token;
}
```

---

## 🔄 CÁCH THAY ĐỔI PHÂN QUYỀN

### Scenario 1: Thêm Permission cho Role "Buyer"

**Trước khi thay đổi:**
```sql
-- Role "buyer" có 12 permissions
SELECT COUNT(*) FROM role_permissions 
WHERE role_id = 'buyer_role_id';
-- Kết quả: 12

-- User buyer@example.com có 12 permissions
SELECT * FROM users WHERE email = 'buyer@example.com';
-- → user_roles → roles (buyer) → role_permissions (12 items)
```

**Admin thực hiện:**
1. Vào http://localhost:3000/vi/admin/rbac/roles
2. Click "Permissions" ở role "Buyer"
3. Chọn thêm 3 permissions mới
4. Click "Lưu thay đổi"

**Sau khi thay đổi:**
```sql
-- Role "buyer" có 15 permissions
SELECT COUNT(*) FROM role_permissions 
WHERE role_id = 'buyer_role_id';
-- Kết quả: 15

-- User buyer@example.com NGAY LẬP TỨC có 15 permissions
-- (Không cần làm gì thêm)
```

**Minh chứng:**
```bash
# Chạy script kiểm tra
node backend/scripts/check-user-permissions.mjs

# Kết quả:
# 👤 USER: Buyer
# 🔑 TOTAL PERMISSIONS: 15  ← Đã tự động tăng từ 12 lên 15!
```

### Scenario 2: Xóa Permission khỏi Role "Seller"

**Trước:**
- Role "Seller" có quyền "PM-050" (Xóa listing)
- 5 users có role "Seller"
- Cả 5 users đều có quyền "PM-050"

**Admin xóa:**
1. Vào role "Seller" → Permissions
2. Bỏ check "PM-050"
3. Lưu

**Sau:**
- Role "Seller" KHÔNG còn quyền "PM-050"
- Cả 5 users TỰ ĐỘNG KHÔNG còn quyền "PM-050"
- KHÔNG cần cập nhật từng user

---

## ⏱️ THỜI GIAN CẬP NHẬT

### Cập nhật Database: NGAY LẬP TỨC ⚡

Khi admin click "Lưu thay đổi":

```typescript
// API: POST /api/v1/admin/rbac/role-permissions/assign
async function assignPermissions(roleId, permissionIds) {
  // 1. Xóa tất cả permissions cũ của role
  await db.role_permissions.deleteMany({ role_id: roleId });
  
  // 2. Thêm permissions mới
  for (const permissionId of permissionIds) {
    await db.role_permissions.create({
      role_id: roleId,
      permission_id: permissionId
    });
  }
  
  // ✅ Database đã cập nhật NGAY!
}
```

### Cập nhật cho Users: Phụ thuộc vào Token 🕐

**Timeline:**

| Thời điểm | Trạng thái | Giải thích |
|-----------|------------|------------|
| 0s | Admin lưu thay đổi | Database cập nhật ngay |
| 0s-24h | Users đang login | Vẫn dùng token cũ (permissions cũ) |
| Khi logout/login | Users mới | Lấy permissions mới từ database |
| 24h | Token hết hạn | Tự động refresh, lấy permissions mới |

**Ví dụ:**
- **10:00 AM**: Admin thêm permission "PM-999" cho role "Buyer"
- **10:01 AM**: Database đã có "PM-999"
- **10:01 AM**: User `buyer@example.com` đang online
  - Token của họ được tạo lúc 9:00 AM (còn 23h)
  - Token CHƯA có "PM-999"
  - Nếu gọi API cần "PM-999" → ❌ 403 Forbidden
- **10:05 AM**: User logout và login lại
  - Token mới được tạo
  - Token MỚI có "PM-999"
  - Gọi API cần "PM-999" → ✅ 200 OK

---

## 🎯 CÁCH ÁP DỤNG NGAY LẬP TỨC

### Phương án 1: Yêu cầu Logout/Login lại (Khuyến nghị)

**Backend:**
```typescript
// Sau khi cập nhật permissions
await updateRolePermissions(roleId, permissionIds);

// Lấy danh sách users có role này
const usersWithRole = await db.user_roles.find({
  role_id: roleId,
  include: { user: true }
});

// Gửi thông báo
for (const userRole of usersWithRole) {
  await sendNotification(userRole.user.id, {
    type: 'PERMISSION_CHANGED',
    message: 'Quyền hạn của bạn đã được cập nhật. Vui lòng đăng xuất và đăng nhập lại.'
  });
}
```

**Frontend:**
```typescript
// Hiển thị banner
if (notification.type === 'PERMISSION_CHANGED') {
  showBanner({
    message: 'Quyền hạn đã thay đổi. Nhấn đây để đăng xuất.',
    action: () => logout()
  });
}
```

### Phương án 2: Invalidate Token (Tự động logout)

**Backend:**
```typescript
// Thêm version vào role
roles
├── id
├── code
├── permission_version  ← Số version

// Khi cập nhật permissions
await db.roles.update({
  where: { id: roleId },
  data: { 
    permission_version: { increment: 1 }
  }
});

// Middleware kiểm tra version
async function checkTokenVersion(token) {
  const decoded = jwt.verify(token);
  const user = await db.users.findOne({ id: decoded.userId });
  
  for (const userRole of user.userRoles) {
    const currentVersion = userRole.role.permission_version;
    const tokenVersion = decoded.versions[userRole.role_id];
    
    if (currentVersion > tokenVersion) {
      throw new Error('TOKEN_EXPIRED'); // Force logout
    }
  }
}
```

### Phương án 3: Short-lived Token (TTL ngắn)

```typescript
// Token hết hạn sau 15 phút thay vì 24h
const token = jwt.sign({ ... }, SECRET, { expiresIn: '15m' });

// Refresh token mỗi 15 phút
// → Permissions được cập nhật nhanh hơn
```

---

## 📋 VÍ DỤ THỰC TẾ

### Test Case 1: Thêm permission

```bash
# 1. Kiểm tra trước
node backend/scripts/check-user-permissions.mjs
# Output:
# 👤 USER: Buyer
# 🔑 TOTAL PERMISSIONS: 12

# 2. Admin thay đổi trong UI
# - Vào /admin/rbac/roles
# - Click "Permissions" của role "Buyer"
# - Chọn thêm "PM-999" (Test Permission)
# - Click "Lưu thay đổi"

# 3. Kiểm tra sau
node backend/scripts/check-user-permissions.mjs
# Output:
# 👤 USER: Buyer
# 🔑 TOTAL PERMISSIONS: 13  ← Đã tăng lên!
# Permissions: PM-001, PM-002, PM-003, ..., PM-999

# 4. Kiểm tra API
curl -H "Authorization: Bearer OLD_TOKEN" \
  http://localhost:3006/api/v1/test-permission
# → 403 Forbidden (token cũ chưa có PM-999)

# Logout và login lại
curl -X POST http://localhost:3006/api/v1/auth/login \
  -d '{"email":"buyer@example.com","password":"buyer123"}'
# → Nhận token mới

curl -H "Authorization: Bearer NEW_TOKEN" \
  http://localhost:3006/api/v1/test-permission
# → 200 OK (token mới có PM-999)
```

### Test Case 2: Xóa permission

```bash
# 1. User đang có quyền "PM-010"
# 2. Admin xóa "PM-010" khỏi role "Buyer"
# 3. Database cập nhật ngay
# 4. User đang login vẫn có quyền (dùng token cũ)
# 5. User logout/login → Không còn quyền "PM-010"
```

---

## 🔍 KIỂM TRA CƠ CHẾ

### Script 1: Kiểm tra permissions của user

```javascript
// backend/scripts/check-user-permissions.mjs
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const user = await prisma.users.findFirst({
  where: { email: 'buyer@example.com' },
  include: {
    user_roles_user_roles_user_idTousers: {
      include: {
        roles: {
          include: {
            role_permissions: {
              include: { permissions: true }
            }
          }
        }
      }
    }
  }
});

console.log('User:', user.email);
console.log('Roles:', user.user_roles_user_roles_user_idTousers.map(ur => ur.roles.name));
console.log('Total Permissions:', 
  user.user_roles_user_roles_user_idTousers.reduce((acc, ur) => 
    acc + ur.roles.role_permissions.length, 0
  )
);
```

### Script 2: So sánh permissions trước/sau

```javascript
// Test workflow
async function testPermissionUpdate() {
  // 1. Lấy permissions trước
  const before = await getUserPermissions('buyer@example.com');
  console.log('Before:', before.length, 'permissions');
  
  // 2. Admin thay đổi (thủ công trong UI)
  console.log('→ Đợi admin thay đổi trong UI...');
  await sleep(30000); // 30 giây
  
  // 3. Lấy permissions sau
  const after = await getUserPermissions('buyer@example.com');
  console.log('After:', after.length, 'permissions');
  
  // 4. So sánh
  const added = after.filter(p => !before.includes(p));
  const removed = before.filter(p => !after.includes(p));
  
  console.log('Added:', added);
  console.log('Removed:', removed);
}
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Token Lifetime

❌ **Vấn đề:**
```
Admin thay đổi permissions lúc 10:00 AM
User đăng nhập lúc 9:00 AM (token hết hạn 9:00 AM ngày mai)
→ User sẽ có permissions CŨ đến 9:00 AM ngày mai!
```

✅ **Giải pháp:**
- Giảm token TTL từ 24h xuống 15m
- Implement token versioning
- Force logout users khi thay đổi critical permissions
- Hiển thị warning banner cho users online

### 2. Caching

❌ **Vấn đề:**
```
Frontend cache permissions trong localStorage
→ Không refresh khi permissions thay đổi
```

✅ **Giải pháp:**
```typescript
// Không cache permissions
// Luôn lấy từ token mới nhất

// Hoặc cache với version
localStorage.setItem('permissions', JSON.stringify({
  data: permissions,
  version: rolePermissionVersion,
  timestamp: Date.now()
}));
```

### 3. Race Condition

❌ **Vấn đề:**
```
1. Admin bắt đầu sửa permissions lúc 10:00:00
2. Admin khác cũng sửa lúc 10:00:01
3. Admin 1 lưu lúc 10:00:05 → Ghi đè thay đổi của Admin 2
```

✅ **Giải pháp:**
```typescript
// Thêm optimistic locking
roles
├── id
└── updated_at

// Khi update
await db.roles.update({
  where: { 
    id: roleId,
    updated_at: lastUpdatedAt  // Must match
  },
  data: { ... }
});
// → Nếu updated_at đã thay đổi → Conflict error
```

---

## 📊 TÓM TẮT

| Câu hỏi | Trả lời |
|---------|---------|
| Tài khoản có tự động cập nhật? | ✅ CÓ, tự động qua quan hệ `user → role → permissions` |
| Cần cập nhật từng user không? | ❌ KHÔNG, chỉ cần sửa role |
| Thời gian cập nhật database? | ⚡ Ngay lập tức |
| Thời gian user thấy thay đổi? | 🕐 Khi logout/login hoặc token hết hạn |
| Cách áp dụng ngay? | 🔄 Force logout hoặc giảm token TTL |

---

## 🎯 KẾT LUẬN

**Hệ thống phân quyền của i-ContExchange là DYNAMIC PERMISSIONS:**

✅ **Ưu điểm:**
- Quản lý tập trung, chỉ sửa 1 chỗ (role)
- Tất cả users với role đó tự động được cập nhật
- Không cần script migration cho từng user
- Dễ bảo trì và mở rộng

⚠️ **Lưu ý:**
- Users đang online sẽ có delay (do JWT token)
- Nên implement force logout cho critical changes
- Hoặc giảm token TTL để cập nhật nhanh hơn

**Tóm lại: TẤT CẢ TÀI KHOẢN TỰ ĐỘNG THAY ĐỔI THEO ROLE, KHÔNG CẦN CHỈNH SỬA TỪNG TÀI KHOẢN!**
