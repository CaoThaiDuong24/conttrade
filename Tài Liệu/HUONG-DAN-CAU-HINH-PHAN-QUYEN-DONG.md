# 🔧 HỆ THỐNG CẤU HÌNH PHÂN QUYỀN ĐỘNG - USER GUIDE

**Ngày tạo:** 24/10/2025  
**Phiên bản:** 1.0  
**Tác giả:** GitHub Copilot AI  

---

## 📋 MỤC LỤC

1. [Tổng Quan](#1-tổng-quan)
2. [Cấu Trúc Hệ Thống](#2-cấu-trúc-hệ-thống)
3. [Hướng Dẫn Sử Dụng](#3-hướng-dẫn-sử-dụng)
4. [API Reference](#4-api-reference)
5. [Use Cases](#5-use-cases)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. TỔNG QUAN

### 🎯 Mục đích

Hệ thống cấu hình phân quyền động cho phép Admin quản lý roles, permissions, và user assignments một cách linh hoạt qua giao diện web, không cần code hay restart server.

### ✨ Tính năng chính

- ✅ **Quản lý Roles:** CRUD roles với level hierarchy
- ✅ **Quản lý Permissions:** Tạo, sửa, xóa permissions theo module
- ✅ **Ma Trận Phân Quyền:** Gán permissions cho roles trực quan
- ✅ **Gán Roles cho Users:** Search và bulk assignment
- ✅ **Real-time Update:** Thay đổi có hiệu lực ngay lập tức
- ✅ **Audit Trail:** Lưu vết tất cả thay đổi

### 🔐 Yêu cầu truy cập

- **Role:** Admin (level 100)
- **Permission:** PM-071 (ADMIN_MANAGE_USERS)
- **Route:** `/admin/rbac/*`

---

## 2. CẤU TRÚC HỆ THỐNG

### 📂 File Structure

```
backend/src/routes/admin/
└── rbac.ts                    # API endpoints

app/[locale]/admin/rbac/
├── page.tsx                   # Dashboard/Overview
├── roles/
│   └── page.tsx              # Role management
├── matrix/
│   └── page.tsx              # Permission matrix
├── users/
│   └── page.tsx              # User-role assignment
└── permissions/
    └── page.tsx              # Permission management
```

### 🔌 API Endpoints

#### Roles Management
```
GET    /api/v1/admin/rbac/roles          # Lấy danh sách roles
GET    /api/v1/admin/rbac/roles/:id      # Chi tiết role
POST   /api/v1/admin/rbac/roles          # Tạo role mới
PUT    /api/v1/admin/rbac/roles/:id      # Cập nhật role
DELETE /api/v1/admin/rbac/roles/:id      # Xóa role
```

#### Permissions Management
```
GET    /api/v1/admin/rbac/permissions           # Lấy danh sách permissions
POST   /api/v1/admin/rbac/permissions           # Tạo permission mới
PUT    /api/v1/admin/rbac/permissions/:id       # Cập nhật permission
DELETE /api/v1/admin/rbac/permissions/:id       # Xóa permission
```

#### Role-Permission Assignment
```
POST   /api/v1/admin/rbac/role-permissions/assign     # Gán permissions cho role
GET    /api/v1/admin/rbac/permission-matrix            # Lấy ma trận phân quyền
```

#### User-Role Assignment
```
POST   /api/v1/admin/rbac/user-roles/assign            # Gán roles cho user
GET    /api/v1/admin/rbac/users/:userId/roles          # Lấy roles của user
```

#### Statistics
```
GET    /api/v1/admin/rbac/stats                        # Thống kê RBAC
```

---

## 3. HƯỚNG DẪN SỬ DỤNG

### 📊 Dashboard RBAC

**URL:** `/admin/rbac`

#### Màn hình Overview
- Xem tổng quan: số roles, permissions, users
- Quick actions: truy cập nhanh các chức năng
- Phân bố roles: xem số lượng users theo role
- Thống kê assignments

![Dashboard Screenshot]

---

### 🛡️ Quản Lý Roles

**URL:** `/admin/rbac/roles`

#### Tạo Role Mới

1. Click button **"Tạo Role Mới"**
2. Điền thông tin:
   - **Mã Role:** code định danh (vd: `custom_moderator`)
   - **Tên Role:** tên hiển thị (vd: `Kiểm duyệt viên`)
   - **Mô tả:** mô tả chức năng
   - **Level:** mức độ quyền hạn (0-100)
3. Click **"Tạo Role"**

#### Chỉnh Sửa Role

1. Click icon **Edit** ở role muốn sửa
2. Chỉnh sửa: tên, mô tả, level
3. Click **"Cập nhật"**

**⚠️ Lưu ý:**
- Không thể sửa `code` của role đã tạo
- Không thể sửa/xóa system roles
- Không thể xóa role đang có users

#### Level Hierarchy

```
100: Admin (Toàn quyền)
80:  Config Manager
70:  Finance
60:  Price Manager
50:  Customer Support
30:  Depot Manager
25:  Inspector
20:  Depot Staff
10:  Seller, Buyer
0:   Guest
```

**Quy tắc:** Level cao hơn có nhiều quyền hạn hơn level thấp

---

### 🔑 Quản Lý Permissions

**URL:** `/admin/rbac/permissions`

#### Tạo Permission Mới

1. Click **"Tạo Permission Mới"**
2. Điền thông tin:
   - **Code:** mã định danh (vd: `PM-200`)
   - **Name:** tên permission (vd: `CUSTOM_ACTION`)
   - **Description:** mô tả chức năng
   - **Category:** module (vd: `custom`)
3. Click **"Tạo Permission"**

#### Module Categories

```
listings       : Quản lý tin đăng
rfq            : RFQ & Quotes
orders         : Đơn hàng
depot          : Kho bãi
admin          : Admin core
config         : Cấu hình
finance        : Tài chính
support        : Hỗ trợ
inspection     : Giám định
moderation     : Kiểm duyệt
users          : Người dùng
```

#### Permission Naming Convention

```
Format: PM-XXX (XXX là số thứ tự)

Examples:
PM-001: VIEW_PUBLIC_LISTINGS
PM-070: ADMIN_REVIEW_LISTING
PM-110: CONFIG_NAMESPACE_RW

Pattern: [MODULE]_[ACTION]_[RESOURCE]
```

---

### 📋 Ma Trận Phân Quyền

**URL:** `/admin/rbac/matrix`

#### Giao Diện Matrix

- **Hàng:** Permissions (53 permissions)
- **Cột:** Roles (10 roles)
- **Cell:** Checkbox để bật/tắt permission cho role

#### Sử Dụng Matrix

1. **Tìm kiếm:** Gõ tên/code permission vào ô search
2. **Lọc:** Chọn category để lọc theo module
3. **Toggle:** Click checkbox để bật/tắt permission
4. **Lưu:** Click **"Lưu Thay Đổi"** (chỉ hiện khi có thay đổi)

**✨ Tips:**
- Thay đổi sẽ highlight màu cam
- Badge "X thay đổi chưa lưu" ở góc phải
- Admin role disable (luôn có tất cả permissions)
- Có thể undo bằng cách refresh page

#### Example Workflow

```
Scenario: Tạo role "Content Moderator" với quyền duyệt nội dung

1. Tạo role "content_moderator" (level 40)
2. Vào Permission Matrix
3. Lọc category = "listings"
4. Bật permissions:
   - PM-001: VIEW_PUBLIC_LISTINGS ✅
   - PM-002: SEARCH_LISTINGS ✅
   - PM-070: ADMIN_REVIEW_LISTING ✅
5. Lọc category = "qa"
6. Bật permission:
   - PM-023: MANAGE_QA ✅
7. Click "Lưu Thay Đổi"
8. Done! Role mới có 4 permissions
```

---

### 👥 Gán Roles cho Users

**URL:** `/admin/rbac/users`

#### Tìm Kiếm User

- Gõ email hoặc tên vào ô search
- Kết quả hiện ngay lập tức (real-time filter)

#### Gán Roles

1. Click **"Gán Roles"** ở user muốn gán
2. Dialog hiện lên với:
   - Danh sách tất cả roles
   - Checkbox roles hiện tại của user
3. Toggle roles muốn gán/bỏ
4. Click **"Lưu Thay Đổi"**

**📊 Thông tin hiển thị:**
- Badge level của role
- Số lượng permissions của role
- Roles hiện tại của user

#### Bulk Assignment

**Tính năng:** Gán một role cho nhiều users cùng lúc

```
Coming Soon:
- Select multiple users
- Assign role to all selected
- Progress indicator
- Rollback on error
```

---

## 4. API REFERENCE

### 🔌 Authentication

Tất cả API yêu cầu JWT token trong header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

### 📝 Request/Response Examples

#### Create Role

**Request:**
```bash
POST /api/v1/admin/rbac/roles
Content-Type: application/json
Authorization: Bearer xxx

{
  "code": "custom_moderator",
  "name": "Kiểm duyệt viên",
  "description": "Duyệt nội dung và quản lý Q&A",
  "level": 40
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo role thành công",
  "data": {
    "id": "role-custom_moderator",
    "code": "custom_moderator",
    "name": "Kiểm duyệt viên",
    "description": "Duyệt nội dung và quản lý Q&A",
    "level": 40,
    "is_system_role": false,
    "created_at": "2025-10-24T...",
    "updated_at": "2025-10-24T..."
  }
}
```

#### Assign Permissions to Role

**Request:**
```bash
POST /api/v1/admin/rbac/role-permissions/assign
Content-Type: application/json
Authorization: Bearer xxx

{
  "roleId": "role-custom_moderator",
  "permissionIds": [
    "perm-pm-001",
    "perm-pm-002",
    "perm-pm-070",
    "perm-pm-023"
  ],
  "scope": "GLOBAL"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã gán 4 permissions cho role",
  "data": [...]
}
```

#### Get Permission Matrix

**Request:**
```bash
GET /api/v1/admin/rbac/permission-matrix
Authorization: Bearer xxx
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "id": "role-admin",
        "code": "admin",
        "name": "Quản trị viên",
        "level": 100
      },
      ...
    ],
    "permissions": [
      {
        "id": "perm-pm-001",
        "code": "PM-001",
        "name": "VIEW_PUBLIC_LISTINGS",
        "category": "listings"
      },
      ...
    ],
    "matrix": [
      {
        "permissionId": "perm-pm-001",
        "code": "PM-001",
        "name": "VIEW_PUBLIC_LISTINGS",
        "category": "listings",
        "admin": true,
        "buyer": true,
        "seller": true,
        "custom_moderator": true,
        ...
      },
      ...
    ]
  }
}
```

#### Assign Roles to User

**Request:**
```bash
POST /api/v1/admin/rbac/user-roles/assign
Content-Type: application/json
Authorization: Bearer xxx

{
  "userId": "user-123",
  "roleIds": [
    "role-custom_moderator",
    "role-seller"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã gán 2 roles cho người dùng",
  "data": [...]
}
```

---

## 5. USE CASES

### Use Case 1: Tạo Role "Content Moderator"

**Requirement:** Cần role để duyệt nội dung, không có quyền admin khác

**Steps:**

```bash
# 1. Tạo role
POST /api/v1/admin/rbac/roles
{
  "code": "content_moderator",
  "name": "Kiểm duyệt nội dung",
  "level": 40
}

# 2. Gán permissions
POST /api/v1/admin/rbac/role-permissions/assign
{
  "roleId": "role-content_moderator",
  "permissionIds": [
    "perm-pm-001",  # VIEW_PUBLIC_LISTINGS
    "perm-pm-002",  # SEARCH_LISTINGS
    "perm-pm-070",  # ADMIN_REVIEW_LISTING
    "perm-pm-023"   # MANAGE_QA
  ]
}

# 3. Gán cho user
POST /api/v1/admin/rbac/user-roles/assign
{
  "userId": "user-moderator1",
  "roleIds": ["role-content_moderator"]
}
```

**Result:** User có thể:
- Xem tin đăng
- Duyệt/từ chối tin đăng
- Quản lý Q&A
- KHÔNG thể: quản lý users, config, finance

---

### Use Case 2: Tạo Role "Regional Manager"

**Requirement:** Quản lý depot ở một khu vực cụ thể

**Steps:**

1. Tạo role `regional_manager` (level 35)
2. Gán permissions:
   - Depot operations (PM-080..086)
   - View orders (PM-040)
   - View delivery (PM-042)
3. Gán scope = `REGION_X` (nếu cần)

---

### Use Case 3: Temporary Admin Role

**Requirement:** Gán quyền admin tạm thời cho user

**Steps:**

```bash
# 1. Gán role admin
POST /api/v1/admin/rbac/user-roles/assign
{
  "userId": "user-temp-admin",
  "roleIds": ["role-admin", "role-seller"]
}

# 2. Sau khi xong việc, remove admin
POST /api/v1/admin/rbac/user-roles/assign
{
  "userId": "user-temp-admin",
  "roleIds": ["role-seller"]  # Chỉ giữ seller
}
```

---

### Use Case 4: Create Custom Permission

**Requirement:** Tạo permission mới cho feature mới

**Steps:**

```bash
# 1. Tạo permission
POST /api/v1/admin/rbac/permissions
{
  "code": "PM-200",
  "name": "MANAGE_ANALYTICS",
  "description": "Xem và xuất báo cáo analytics",
  "category": "analytics"
}

# 2. Gán cho roles cần thiết
# (Sử dụng Permission Matrix UI)
```

---

## 6. TROUBLESHOOTING

### Lỗi thường gặp

#### 1. "Access denied - Admin role required"

**Nguyên nhân:** User không có role admin

**Giải pháp:**
```sql
-- Check role của user
SELECT u.email, r.name 
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'your-email@example.com';

-- Gán role admin nếu cần
```

#### 2. "Không thể xóa role đang có users"

**Nguyên nhân:** Role đang được gán cho users

**Giải pháp:**
1. Vào `/admin/rbac/users`
2. Tìm users có role đó
3. Gán role khác cho users
4. Sau đó mới xóa role

#### 3. "Mã role đã tồn tại"

**Nguyên nhân:** Code đã được sử dụng

**Giải pháp:**
- Đổi code khác
- Hoặc edit role cũ thay vì tạo mới

#### 4. "Permission đang được sử dụng"

**Nguyên nhân:** Permission đang được gán cho roles

**Giải pháp:**
1. Vào Permission Matrix
2. Bỏ check permission ở tất cả roles
3. Lưu thay đổi
4. Sau đó mới xóa permission

---

### Debug Tips

#### Kiểm tra permissions của user

```bash
GET /api/v1/auth/me
Authorization: Bearer xxx

Response:
{
  "user": {
    "email": "...",
    "roles": ["admin"],
    "permissions": ["PM-001", "PM-002", ...]
  }
}
```

#### Kiểm tra role permissions

```bash
GET /api/v1/admin/rbac/roles/{roleId}
Authorization: Bearer xxx
```

#### Kiểm tra database

```sql
-- Xem role của user
SELECT * FROM user_roles WHERE user_id = 'user-xxx';

-- Xem permissions của role
SELECT * FROM role_permissions WHERE role_id = 'role-xxx';

-- Xem ma trận đầy đủ
SELECT 
  p.code as permission,
  r.code as role,
  CASE WHEN rp.id IS NOT NULL THEN 'YES' ELSE 'NO' END as assigned
FROM permissions p
CROSS JOIN roles r
LEFT JOIN role_permissions rp ON p.id = rp.permission_id AND r.id = rp.role_id
ORDER BY p.code, r.level DESC;
```

---

### Performance Tips

1. **Cache permissions:** Frontend cache permissions trong localStorage
2. **Batch operations:** Gán nhiều roles cùng lúc
3. **Lazy load:** Chỉ load permissions khi cần
4. **Debounce search:** Tránh query liên tục khi search

---

## 📚 Related Documents

- [MA-TRAN-PHAN-QUYEN-HE-THONG-RBAC.md](./MA-TRAN-PHAN-QUYEN-HE-THONG-RBAC.md) - Ma trận đầy đủ 53×10
- [ADMIN-PERMISSIONS-SUMMARY.md](./ADMIN-PERMISSIONS-SUMMARY.md) - Tóm tắt quyền Admin
- [Quick-Start-RBAC.md](./Quick-Start-RBAC.md) - Quick start guide

---

## 📞 Support

**Technical Support:** support@i-contexchange.vn  
**Documentation:** https://docs.i-contexchange.vn/rbac  
**GitHub Issues:** https://github.com/CaoThaiDuong24/conttrade/issues

---

**© 2025 i-ContExchange Vietnam**

**Document Version:** 1.0  
**Last Updated:** 24/10/2025
