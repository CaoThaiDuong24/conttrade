# 🔒 REAL-TIME PERMISSION ENFORCEMENT SYSTEM

**Ngày triển khai:** 24/01/2025  
**Phiên bản:** 1.0  
**Trạng thái:** ✅ HOÀN THÀNH

---

## 📋 TỔNG QUAN

Hệ thống **Real-time Permission Enforcement** đảm bảo rằng khi Admin thay đổi quyền của bất kỳ role nào, tất cả users đang online với role đó sẽ **TỰ ĐỘNG** mất quyền truy cập và phải đăng nhập lại trong vòng **60 giây**.

### 🎯 Mục tiêu
- ✅ Users không thể sử dụng quyền cũ sau khi Admin thay đổi
- ✅ Không cần sửa code để áp dụng thay đổi quyền
- ✅ Bảo mật 3 tầng: Backend + Token Version + Client Auto-check
- ✅ Admin chỉ cần sửa permissions trong UI, hệ thống tự xử lý

---

## 🏗️ KIẾN TRÚC 3 TẦNG BẢO MẬT

```
┌─────────────────────────────────────────────────────────────┐
│  ADMIN thay đổi permissions của role "seller"               │
│  ↓ Database trigger tự động tăng role_version: 1 → 2        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  TẦNG 1: Backend Validation (Mọi API request)               │
│  ✓ Middleware validatePermissions() query DB real-time      │
│  ✓ Kiểm tra role_version trong token vs database            │
│  ✓ Nếu version cũ → Response 403 + requireReauth: true      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  TẦNG 2: Token Versioning System                            │
│  ✓ JWT token chứa { roleVersions: { "seller": 1 } }         │
│  ✓ Mỗi request so sánh token.roleVersions vs DB             │
│  ✓ Mismatch → Force logout                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  TẦNG 3: Client Auto-Watcher (Every 60s)                    │
│  ✓ usePermissionWatcher hook gọi /auth/check-version        │
│  ✓ Phát hiện thay đổi → Alert + Clear localStorage          │
│  ✓ Redirect to /login → Reload page                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ CÁC THÀNH PHẦN ĐÃ TRIỂN KHAI

### 1️⃣ Database Migration
**File:** `backend/migrations/20250124_add_role_version.sql`

```sql
-- Thêm cột role_version
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "role_version" INTEGER NOT NULL DEFAULT 1;

-- Trigger tự động tăng version khi role_permissions thay đổi
CREATE OR REPLACE FUNCTION increment_role_version() RETURNS TRIGGER AS $$
BEGIN
    UPDATE roles SET role_version = role_version + 1, updated_at = NOW()
    WHERE role_id = NEW.role_id OR role_id = OLD.role_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Áp dụng trigger cho INSERT, UPDATE, DELETE
CREATE TRIGGER trigger_increment_version_on_insert
AFTER INSERT ON "role_permissions"
FOR EACH ROW EXECUTE FUNCTION increment_role_version();

CREATE TRIGGER trigger_increment_version_on_update
AFTER UPDATE ON "role_permissions"
FOR EACH ROW EXECUTE FUNCTION increment_role_version();

CREATE TRIGGER trigger_increment_version_on_delete
AFTER DELETE ON "role_permissions"
FOR EACH ROW EXECUTE FUNCTION increment_role_version();
```

**Trạng thái:** ✅ Đã chạy migration thành công

---

### 2️⃣ Backend Middleware
**File:** `backend/src/middleware/permission-validator.ts`

**Chức năng:**
- Validate permissions từ database trên **mỗi API request**
- Kiểm tra `roleVersion` trong JWT vs database
- Trả về `403 PERMISSION_VERSION_MISMATCH` nếu phát hiện thay đổi

**Usage Example:**
```typescript
import { validatePermissions } from '@/middleware/permission-validator';

// Protect route with specific permissions
router.get('/api/v1/listings', 
  validatePermissions(['PM-010', 'PM-011']), 
  async (req, res) => {
    // req.user chứa fresh permissions from DB
  }
);
```

**Trạng thái:** ✅ Đã tạo và sẵn sàng sử dụng

---

### 3️⃣ JWT Token với Role Versions
**File:** `backend/src/routes/auth.ts`

**Thay đổi:**
```typescript
// Login endpoint - Thêm roleVersions vào token
const token = fastify.jwt.sign({
  userId: user.id,
  email: user.email,
  roles: roles,
  roleVersions: { "admin": 5, "seller": 2 } // ← Tracking version
}, { expiresIn: '7d' });
```

**Refresh endpoint - Cập nhật roleVersions từ DB:**
```typescript
// Lấy version mới nhất từ database
const roleVersions: Record<string, number> = {};
tokenRecord.users.user_roles.forEach(ur => {
  roleVersions[ur.roles.code] = ur.roles.role_version;
});
```

**Trạng thái:** ✅ Đã cập nhật

---

### 4️⃣ API Check Version Endpoint
**File:** `backend/src/routes/auth.ts`

**Endpoint:** `GET /api/v1/auth/check-version`

**Response:**
```json
{
  "success": true,
  "data": {
    "hasChanges": true,
    "changedRoles": ["seller", "buyer"],
    "currentVersions": { "seller": 3, "buyer": 2 },
    "tokenVersions": { "seller": 2, "buyer": 1 },
    "requireReauth": true  // ← Client phải logout
  }
}
```

**Trạng thái:** ✅ Đã tạo

---

### 5️⃣ Client Permission Watcher Hook
**File:** `hooks/use-permission-watcher.ts`

**Chức năng:**
- Tự động kiểm tra permission version mỗi 60 giây
- Gọi `/api/v1/auth/check-version`
- Nếu `requireReauth: true` → Alert + Logout + Redirect

**Auto-integrated in:** `app/layout.tsx`

```tsx
import { PermissionWatcher } from '@/hooks/use-permission-watcher';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PermissionWatcher />  {/* ← Tự động chạy background */}
        {children}
      </body>
    </html>
  );
}
```

**Trạng thái:** ✅ Đã tích hợp vào layout chính

---

### 6️⃣ Admin RBAC Interface Warning
**File:** `app/[locale]/admin/rbac/roles/page.tsx`

**Warning Banner:**
```tsx
⚠️ Cơ chế Phân quyền Real-time
- Backend Validation: Mọi API request kiểm tra quyền từ database
- Token Versioning: Tự động tăng version khi sửa permissions
- Auto Logout: Users logout trong 60s khi quyền thay đổi

💡 Khi bạn chỉnh sửa permissions, users sẽ TỰ ĐỘNG logout
```

**Trạng thái:** ✅ Đã thêm warning box

---

## 🧪 KỊCH BẢN TEST

### Test Case 1: Admin sửa permissions của role "seller"

**Bước 1:** User A đăng nhập với role `seller`
```bash
POST /api/v1/auth/login
{
  "email": "seller@example.com",
  "password": "seller123"
}

Response:
{
  "token": "eyJhbGc...",  # Contains roleVersions: { "seller": 1 }
}
```

**Bước 2:** Admin vào `/admin/rbac/roles/{seller_id}` và thêm permission mới

```bash
POST /api/v1/admin/rbac/roles/{seller_id}/permissions
{
  "permissionCode": "PM-999"
}

→ Database trigger tự động tăng role_version: 1 → 2
```

**Bước 3:** User A đợi tối đa 60 giây

```bash
# usePermissionWatcher hook tự động gọi:
GET /api/v1/auth/check-version
Authorization: Bearer eyJhbGc...

Response:
{
  "hasChanges": true,
  "changedRoles": ["seller"],
  "requireReauth": true
}

→ Client tự động:
  1. Alert: "Quyền hạn của bạn đã được cập nhật"
  2. localStorage.clear()
  3. router.push('/vi/auth/login')
  4. window.location.reload()
```

**Kết quả mong đợi:** ✅ User A bị logout và phải login lại

---

### Test Case 2: User cố truy cập API với token cũ

**Bước 1:** User B có token với `roleVersions: { "buyer": 1 }`

**Bước 2:** Admin sửa permissions của role `buyer` → version tăng lên 2

**Bước 3:** User B gọi API

```bash
GET /api/v1/listings
Authorization: Bearer <token_version_1>

→ Middleware validatePermissions() kiểm tra:
  - Token roleVersion: 1
  - Database version: 2
  - Mismatch detected!

Response 403:
{
  "error": "Permissions Changed",
  "message": "Your permissions have been updated. Please login again.",
  "code": "PERMISSION_VERSION_MISMATCH",
  "requireReauth": true
}
```

**Kết quả mong đợi:** ✅ API reject request + yêu cầu re-login

---

## 📊 THỐNG KÊ THAY ĐỔI

| Thành phần | File | Trạng thái | Ghi chú |
|-----------|------|-----------|---------|
| Database Migration | `backend/migrations/20250124_add_role_version.sql` | ✅ | Đã chạy |
| Backend Middleware | `backend/src/middleware/permission-validator.ts` | ✅ | Đã tạo |
| Auth Routes | `backend/src/routes/auth.ts` | ✅ | Đã cập nhật login/refresh/check-version |
| Client Watcher Hook | `hooks/use-permission-watcher.ts` | ✅ | Tích hợp layout |
| App Layout | `app/layout.tsx` | ✅ | Thêm PermissionWatcher |
| Admin RBAC UI | `app/[locale]/admin/rbac/roles/page.tsx` | ✅ | Thêm warning banner |

**Tổng:** 6/6 thành phần đã hoàn thành ✅

---

## 🚀 HƯỚNG DẪN SỬ DỤNG

### Cho Admin:
1. Vào `/admin/rbac/roles`
2. Click vào role cần sửa
3. Thêm/xóa permissions
4. **Không cần làm gì thêm** - Hệ thống tự động:
   - Tăng role_version trong DB
   - Validate mọi API request
   - Force logout users trong 60s

### Cho Developer:
1. **Protect API routes** với middleware:
   ```typescript
   import { validatePermissions } from '@/middleware/permission-validator';
   
   router.post('/api/orders', 
     validatePermissions(['PM-050', 'PM-051']),
     orderHandler
   );
   ```

2. **Không cần** manually check permissions trong handler code

3. **Middleware tự động** query DB và validate

---

## ⚡ HIỆU NĂNG

- **Database queries:** 1 query extra per API request (acceptable for security)
- **Check interval:** 60 seconds (configurable in `use-permission-watcher.ts`)
- **Token size:** +50 bytes for roleVersions (negligible)
- **User experience:** Logout trong vòng 60s (có thể giảm xuống 30s nếu cần)

---

## 🔧 TÙY CHỈNH

### Thay đổi check interval:
```typescript
// hooks/use-permission-watcher.ts
const CHECK_INTERVAL = 30000; // 30 seconds thay vì 60
```

### Disable real-time check cho specific routes:
```typescript
// Không dùng middleware cho public routes
router.get('/api/public/listings', publicListingHandler);
```

---

## ✅ CHECKLIST TRIỂN KHAI

- [x] Migration database với role_version column
- [x] Database triggers tự động tăng version
- [x] Backend middleware validatePermissions
- [x] JWT token chứa roleVersions
- [x] API endpoint /auth/check-version
- [x] Client hook usePermissionWatcher
- [x] Tích hợp vào app layout
- [x] Warning banner trong admin UI
- [ ] **Testing với 10 demo accounts** ← CẦN TEST

---

## 🎯 TESTING PLAN

### Test với demo accounts:

1. **Login với seller@example.com** (password: seller123)
2. **Admin sửa permissions của role "seller"**
3. **Đợi 60 giây** và quan sát seller tự động logout
4. **Login lại** → Seller có permissions mới

Lặp lại với 9 roles còn lại.

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Check console logs: `🔐 User roles on login:` và `❌ Permission check error:`
2. Kiểm tra database: `SELECT role_code, role_version FROM roles;`
3. Test API trực tiếp: `GET http://localhost:3006/api/v1/auth/check-version`

---

**Kết luận:** Hệ thống Real-time Permission Enforcement đã sẵn sàng. Admin **KHÔNG CẦN SỬA CODE**, chỉ cần thay đổi permissions trong UI và hệ thống tự động enforce trong 60 giây. 🚀
