# 🔧 HƯỚNG DẪN BỔ SUNG PERMISSIONS CHO SELLER

**Ngày:** 28/10/2025  
**Mục đích:** Thêm 2 permissions mới để seller có thể truy cập menu "Vận chuyển" và "Hóa đơn"

---

## ✅ THAY ĐỔI ĐÃ THỰC HIỆN

### 1. Permissions mới (2 items):

| Code | Name | Description | Module | Action |
|------|------|-------------|--------|--------|
| PM-042B | VIEW_DELIVERY | Xem thông tin vận chuyển | delivery | view |
| PM-091B | VIEW_SELLER_INVOICES | Xem hóa đơn/doanh thu seller | billing | view |

### 2. Updated Seller Permissions:

**Trước:**
```javascript
seller: [
  'PM-001', 'PM-002', 'PM-003',
  'PM-010', 'PM-011', 'PM-012', 'PM-013', 'PM-014',
  'PM-021', 'PM-022',
  'PM-040',
  'PM-050'
] // 12 permissions
```

**Sau:**
```javascript
seller: [
  'PM-001', 'PM-002', 'PM-003',
  'PM-010', 'PM-011', 'PM-012', 'PM-013', 'PM-014',
  'PM-021', 'PM-022',
  'PM-040', 'PM-042B',  // + VIEW_DELIVERY
  'PM-050', 'PM-091B'   // + VIEW_SELLER_INVOICES
] // 14 permissions
```

### 3. Files đã sửa:

- ✅ `backend/scripts/seed/seed-complete-rbac.mjs` - Thêm 2 permissions mới
- ✅ `backend/scripts/seed/seed-complete-rbac.mjs` - Update seller permissions array
- ✅ `middleware.ts` - Update routes `/delivery` và `/billing` để accept array permissions
- ✅ `middleware.ts` - Update hàm `hasPermission()` để xử lý array (OR logic)

---

## 🚀 CÁCH RESEED DATABASE

### Option 1: Reseed toàn bộ (Khuyến nghị ⭐)

```bash
# Di chuyển vào thư mục backend
cd backend

# Xóa tất cả data RBAC hiện tại và reseed
node scripts/seed/seed-complete-rbac.mjs
```

**Lưu ý:** Script này sẽ:
- Xóa tất cả roles, permissions, role_permissions hiện tại
- Tạo lại 11 roles
- Tạo lại 55 permissions (53 cũ + 2 mới)
- Assign permissions cho từng role
- Tạo 11 demo users

### Option 2: Chỉ thêm 2 permissions mới (Thủ công)

```sql
-- 1. Thêm 2 permissions mới vào bảng permissions
INSERT INTO permissions (id, code, name, description, module, action, created_at, updated_at)
VALUES 
  ('perm-pm-042b', 'PM-042B', 'VIEW_DELIVERY', 'Xem thông tin vận chuyển', 'delivery', 'view', NOW(), NOW()),
  ('perm-pm-091b', 'PM-091B', 'VIEW_SELLER_INVOICES', 'Xem hóa đơn/doanh thu seller', 'billing', 'view', NOW(), NOW());

-- 2. Lấy role_id của seller
SELECT id FROM role WHERE code = 'seller';
-- Giả sử kết quả là: role-seller-xxxx

-- 3. Assign 2 permissions mới cho seller role
INSERT INTO role_permissions (id, role_id, permission_id, scope, created_at, updated_at)
VALUES
  (UUID(), 'role-seller-xxxx', 'perm-pm-042b', 'GLOBAL', NOW(), NOW()),
  (UUID(), 'role-seller-xxxx', 'perm-pm-091b', 'GLOBAL', NOW(), NOW());

-- 4. Update permissions_updated_at cho tất cả seller users (bắt buộc re-login)
UPDATE users
SET permissions_updated_at = NOW()
WHERE JSON_CONTAINS(roles, '"seller"');
```

---

## 🧪 TEST

### 1. Verify permissions đã được tạo:

```bash
cd backend
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPermissions() {
  const pm042b = await prisma.permissions.findUnique({ where: { code: 'PM-042B' } });
  const pm091b = await prisma.permissions.findUnique({ where: { code: 'PM-091B' } });
  
  console.log('PM-042B:', pm042b ? '✅ Exists' : '❌ Not found');
  console.log('PM-091B:', pm091b ? '✅ Exists' : '❌ Not found');
  
  const sellerRole = await prisma.role.findUnique({
    where: { code: 'seller' },
    include: {
      permissions: {
        include: { permission: true }
      }
    }
  });
  
  const hasViewDelivery = sellerRole.permissions.some(rp => rp.permission.code === 'PM-042B');
  const hasViewInvoices = sellerRole.permissions.some(rp => rp.permission.code === 'PM-091B');
  
  console.log('\nSeller permissions:');
  console.log('- PM-042B (VIEW_DELIVERY):', hasViewDelivery ? '✅' : '❌');
  console.log('- PM-091B (VIEW_SELLER_INVOICES):', hasViewInvoices ? '✅' : '❌');
  console.log('Total permissions:', sellerRole.permissions.length, '(should be 14)');
  
  await prisma.\$disconnect();
}

checkPermissions();
"
```

### 2. Test login và kiểm tra token:

```powershell
# Login as seller
$login = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/login' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{"email":"seller@example.com","password":"seller123"}' -UseBasicParsing

$loginData = $login.Content | ConvertFrom-Json
$token = $loginData.data.token

Write-Host "Token: $token"

# Decode JWT to check permissions
# (Cần cài jwt-cli hoặc dùng jwt.io)
```

### 3. Test truy cập menu:

```powershell
# Test /delivery route
$delivery = Invoke-WebRequest -Uri 'http://localhost:3000/vi/delivery' -Method GET -Headers @{'Authorization'="Bearer $token"} -UseBasicParsing

if ($delivery.StatusCode -eq 200) {
    Write-Host "✅ /delivery - OK" -ForegroundColor Green
} else {
    Write-Host "❌ /delivery - FAILED: $($delivery.StatusCode)" -ForegroundColor Red
}

# Test /billing route
$billing = Invoke-WebRequest -Uri 'http://localhost:3000/vi/billing' -Method GET -Headers @{'Authorization'="Bearer $token"} -UseBasicParsing

if ($billing.StatusCode -eq 200) {
    Write-Host "✅ /billing - OK" -ForegroundColor Green
} else {
    Write-Host "❌ /billing - FAILED: $($billing.StatusCode)" -ForegroundColor Red
}
```

---

## 📝 CHECKLIST

### Trước khi reseed:
- [ ] Backup database (nếu có data quan trọng)
- [ ] Stop backend server
- [ ] Stop frontend server

### Sau khi reseed:
- [ ] Verify 2 permissions mới đã được tạo
- [ ] Verify seller role có 14 permissions
- [ ] Test login seller
- [ ] Test truy cập /delivery
- [ ] Test truy cập /billing
- [ ] Kiểm tra UI hiển thị menu đầy đủ

---

## 🎯 KẾT QUẢ MONG ĐỢI

Sau khi hoàn thành:

1. ✅ Seller có 14 permissions (tăng từ 12)
2. ✅ Seller có thể truy cập menu "Vận chuyển"
3. ✅ Seller có thể truy cập menu "Hóa đơn"
4. ✅ Middleware chặn đúng với permissions mới
5. ✅ UI hiển thị đầy đủ 9 menu items cho seller

---

## 🐛 TROUBLESHOOTING

### Vấn đề 1: "Cannot access /delivery - 403"

**Nguyên nhân:** Seller chưa có permission PM-042B

**Giải pháp:**
```bash
# Reseed lại
cd backend
node scripts/seed/seed-complete-rbac.mjs

# Hoặc assign manually qua SQL
```

### Vấn đề 2: "Token không có permission mới"

**Nguyên nhân:** Seller chưa logout/login lại sau khi reseed

**Giải pháp:**
```bash
# Update permissions_updated_at để force re-login
UPDATE users
SET permissions_updated_at = NOW()
WHERE JSON_CONTAINS(roles, '"seller"');
```

### Vấn đề 3: "Menu vẫn không hiển thị"

**Nguyên nhân:** Frontend cache hoặc token cũ

**Giải pháp:**
```bash
# Xóa .next cache
cd frontend
Remove-Item -Recurse -Force .next

# Logout and login lại
```

---

**Ngày hoàn thành:** 28/10/2025  
**Trạng thái:** ✅ **READY TO TEST**
