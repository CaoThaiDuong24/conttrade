# 🔐 MA TRẬN PHÂN QUYỀN HỆ THỐNG RBAC - i-ContExchange

**Ngày tạo:** 24/10/2025  
**Phiên bản:** 1.0  
**Tác giả:** GitHub Copilot AI  
**Mục đích:** Báo cáo chi tiết về hệ thống phân quyền dựa trên vai trò (RBAC)

---

## 📋 MỤC LỤC

1. [Tổng Quan Hệ Thống](#1-tổng-quan-hệ-thống)
2. [Kiến Trúc Database RBAC](#2-kiến-trúc-database-rbac)
3. [Danh Sách 53 Permissions](#3-danh-sách-53-permissions)
4. [Danh Sách 10 Roles](#4-danh-sách-10-roles)
5. [Ma Trận Phân Quyền Chi Tiết](#5-ma-trận-phân-quyền-chi-tiết)
6. [Phân Tích Theo Module](#6-phân-tích-theo-module)
7. [Demo Accounts](#7-demo-accounts)
8. [Validation & Testing](#8-validation--testing)
9. [Kết Luận & Khuyến Nghị](#9-kết-luận--khuyến-nghị)

---

## 1. TỔNG QUAN HỆ THỐNG

### 📊 Thống kê tổng quan

```
┌─────────────────────────────────────────────────────┐
│  🔐 HỆ THỐNG PHÂN QUYỀN RBAC                        │
├─────────────────────────────────────────────────────┤
│  ✅ Permissions: 53 phân quyền                       │
│  ✅ Roles: 10 vai trò + 1 Guest                      │
│  ✅ Demo Users: 10 tài khoản                         │
│  ✅ Database: PostgreSQL với Prisma ORM              │
│  ✅ Backend: Fastify + JWT Authentication            │
│  ✅ Frontend: Next.js 14 + Client RBAC Service       │
└─────────────────────────────────────────────────────┘
```

### 🎯 Mục tiêu thiết kế

- **Granular Permissions**: Phân quyền chi tiết đến từng chức năng
- **Role-Based Access**: Quản lý dễ dàng qua vai trò
- **Hierarchical Levels**: Phân cấp quyền hạn rõ ràng (0-100)
- **Flexible Assignment**: Hỗ trợ gán quyền trực tiếp cho user
- **Audit Trail**: Lưu vết tất cả thao tác quan trọng

### 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                 │
│  ┌────────────────────────────────────────────┐     │
│  │  ClientRBACService                         │     │
│  │  - hasPermission()                          │     │
│  │  - hasRole()                                │     │
│  │  - getNavigationMenu()                      │     │
│  └────────────────────────────────────────────┘     │
└─────────────────┬───────────────────────────────────┘
                  │ JWT Token (roles + permissions)
                  ▼
┌─────────────────────────────────────────────────────┐
│              BACKEND (Fastify + Prisma)              │
│  ┌────────────────────────────────────────────┐     │
│  │  RBACService                               │     │
│  │  - getUserWithPermissions()                 │     │
│  │  - hasPermission()                          │     │
│  │  - assignRole()                             │     │
│  │  - grantPermission()                        │     │
│  └────────────────────────────────────────────┘     │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL)                   │
│  ┌──────────┐  ┌──────────┐  ┌─────────────┐       │
│  │  users   │  │  roles   │  │ permissions │       │
│  └────┬─────┘  └────┬─────┘  └──────┬──────┘       │
│       │             │               │               │
│  ┌────▼─────┐  ┌───▼──────┐        │               │
│  │user_roles│  │role_perms├────────┘               │
│  └──────────┘  └──────────┘                         │
└─────────────────────────────────────────────────────┘
```

---

## 2. KIẾN TRÚC DATABASE RBAC

### 📦 Database Schema

#### Table: `permissions`
```sql
CREATE TABLE permissions (
  id               VARCHAR PRIMARY KEY,
  code             VARCHAR UNIQUE NOT NULL,    -- PM-001, PM-002, ...
  name             VARCHAR NOT NULL,           -- VIEW_PUBLIC_LISTINGS, ...
  description      TEXT,
  category         VARCHAR,                    -- Module: listings, admin, ...
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP
);
```

#### Table: `roles`
```sql
CREATE TABLE roles (
  id               VARCHAR PRIMARY KEY,
  code             VARCHAR UNIQUE NOT NULL,    -- admin, buyer, seller, ...
  name             VARCHAR NOT NULL,           -- Quản trị viên, Người mua, ...
  description      TEXT,
  level            INTEGER DEFAULT 0,          -- 0-100 (hierarchy)
  is_system_role   BOOLEAN DEFAULT false,
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP
);
```

#### Table: `role_permissions`
```sql
CREATE TABLE role_permissions (
  id               VARCHAR PRIMARY KEY,
  role_id          VARCHAR REFERENCES roles(id) ON DELETE CASCADE,
  permission_id    VARCHAR REFERENCES permissions(id) ON DELETE CASCADE,
  scope            VARCHAR DEFAULT 'GLOBAL',   -- GLOBAL, ORG, DEPT, ...
  created_at       TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(role_id, permission_id, scope)
);
```

#### Table: `user_roles`
```sql
CREATE TABLE user_roles (
  id               VARCHAR PRIMARY KEY,
  user_id          VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  role_id          VARCHAR REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at      TIMESTAMP DEFAULT NOW(),
  assigned_by      VARCHAR,
  
  UNIQUE(user_id, role_id)
);
```

### 🔄 Data Flow

```
1. User Login
   ↓
2. Backend validates credentials
   ↓
3. Query user_roles → roles → role_permissions → permissions
   ↓
4. Collect all permissions (role-based + direct)
   ↓
5. Generate JWT with {userId, email, roles[], permissions[]}
   ↓
6. Frontend stores token & permissions
   ↓
7. ClientRBACService checks permissions for UI/Routes
```

---

## 3. DANH SÁCH 53 PERMISSIONS

### 📦 Nhóm 1: Public & Viewing (3 permissions)

| Code | Name | Description | Module | Action |
|------|------|-------------|--------|--------|
| PM-001 | VIEW_PUBLIC_LISTINGS | Xem tin công khai | listings | view |
| PM-002 | SEARCH_LISTINGS | Tìm kiếm, lọc tin | listings | search |
| PM-003 | VIEW_SELLER_PROFILE | Xem hồ sơ người bán | users | view |

**Áp dụng cho:** Tất cả user (bao gồm Guest)

---

### 📝 Nhóm 2: Listing Management (5 permissions)

| Code | Name | Description | Module | Action |
|------|------|-------------|--------|--------|
| PM-010 | CREATE_LISTING | Tạo tin đăng | listings | create |
| PM-011 | EDIT_LISTING | Sửa tin đăng | listings | edit |
| PM-012 | PUBLISH_LISTING | Gửi duyệt/Xuất bản tin | listings | publish |
| PM-013 | ARCHIVE_LISTING | Ẩn/Lưu trữ tin | listings | archive |
| PM-014 | DELETE_LISTING | Xóa tin đăng | listings | delete |

**Áp dụng cho:** Admin, Seller

---

### 💼 Nhóm 3: RFQ & Quote (5 permissions)

| Code | Name | Description | Module | Action |
|------|------|-------------|--------|--------|
| PM-020 | CREATE_RFQ | Tạo RFQ (yêu cầu báo giá) | rfq | create |
| PM-021 | ISSUE_QUOTE | Phát hành báo giá | quotes | issue |
| PM-022 | VIEW_QUOTES | Xem/so sánh báo giá | quotes | view |
| PM-023 | MANAGE_QA | Quản lý Q&A có kiểm duyệt | qa | manage |
| PM-024 | REDACTION_ENFORCE | Thực thi che thông tin liên hệ | moderation | redact |

**Áp dụng cho:** Admin, Buyer (create RFQ), Seller (issue quote)

---

### 🔍 Nhóm 4: Inspection (2 permissions)

| Code | Name | Description | Module | Action |
|------|------|-------------|--------|--------|
| PM-030 | REQUEST_INSPECTION | Yêu cầu giám định | inspection | request |
| PM-031 | VIEW_INSPECTION_REPORT | Xem báo cáo giám định | inspection | view |

**Áp dụng cho:** Admin, Buyer, Inspector

---

### 📦 Nhóm 5: Orders (4 permissions)

| Code | Name | Description | Module | Action |
|------|------|-------------|--------|--------|
| PM-040 | CREATE_ORDER | Tạo đơn hàng | orders | create |
| PM-041 | PAY_ESCROW | Thanh toán ký quỹ | payments | escrow |
| PM-042 | REQUEST_DELIVERY | Yêu cầu vận chuyển | delivery | request |
| PM-043 | CONFIRM_RECEIPT | Xác nhận nhận hàng | orders | confirm |

**Áp dụng cho:** Admin, Buyer

---

### ⭐ Nhóm 6: Reviews & Disputes (3 permissions)

| Code | Name | Description | Module | Action |
|------|------|-------------|--------|--------|
| PM-050 | RATE_AND_REVIEW | Đánh giá sau giao dịch | reviews | write |
| PM-060 | FILE_DISPUTE | Khiếu nại | disputes | file |
| PM-061 | RESOLVE_DISPUTE | Xử lý tranh chấp | disputes | resolve |

**Áp dụng cho:** Admin (resolve), Buyer/Seller (rate & file dispute)

---

### 👑 Nhóm 7: Admin Core (5 permissions)

| Code | Name | Description | Module | Action |
|------|------|-------------|--------|--------|
| PM-070 | ADMIN_REVIEW_LISTING | **Duyệt tin đăng** ⭐ | admin | review |
| PM-071 | ADMIN_MANAGE_USERS | **Quản lý người dùng/vai trò** ⭐ | admin | users |
| PM-072 | ADMIN_VIEW_DASHBOARD | Xem KPI dashboard | admin | dashboard |
| PM-073 | ADMIN_CONFIG_PRICING | Cấu hình phí, gói | admin | pricing |
| PM-074 | MANAGE_PRICE_RULES | Quản lý Pricing Rules | pricing | manage |

**Áp dụng cho:** Admin (tất cả), Price Manager (PM-074)

**🔥 Quan trọng nhất:** PM-070 (Duyệt tin đăng) - Chức năng cốt lõi của Admin

---

### 🏭 Nhóm 8: Depot Inventory (7 permissions)

| Code | Name | Description | Module | Action |
|------|------|-------------|--------|--------|
| PM-080 | DEPOT_CREATE_JOB | Tạo lệnh việc depot | depot | create_job |
| PM-081 | DEPOT_UPDATE_JOB | Cập nhật công việc depot | depot | update_job |
| PM-082 | DEPOT_ISSUE_EIR | Lập EIR | depot | issue_eir |
| PM-083 | DEPOT_VIEW_STOCK | Xem tồn kho depot | depot | view_stock |
| PM-084 | DEPOT_VIEW_MOVEMENTS | Xem nhật ký nhập-xuất-chuyển | depot | view_movements |
| PM-085 | DEPOT_ADJUST_STOCK | Điều chỉnh tồn (manual IN/OUT) | depot | adjust_stock |
| PM-086 | DEPOT_TRANSFER_STOCK | Chuyển giữa các Depot | depot | transfer_stock |

**Áp dụng cho:** Admin, Depot Manager (tất cả), Depot Staff (PM-083, PM-084)

---

### 💰 Nhóm 9: Finance (2 permissions)

| Code | Name | Description | Module | Action |
|------|------|-------------|--------|--------|
| PM-090 | FINANCE_RECONCILE | Đối soát/giải ngân | finance | reconcile |
| PM-091 | FINANCE_INVOICE | Xuất hóa đơn | finance | invoice |

**Áp dụng cho:** Admin, Finance

---

### 🎧 Nhóm 10: Customer Support (1 permission)

| Code | Name | Description | Module | Action |
|------|------|-------------|--------|--------|
| PM-100 | CS_MANAGE_TICKETS | Xử lý yêu cầu hỗ trợ | support | manage |

**Áp dụng cho:** Admin, Customer Support

---

### ⚙️ Nhóm 11: Configuration Management (16 permissions) ⭐

| Code | Name | Description | Module | Action |
|------|------|-------------|--------|--------|
| PM-110 | CONFIG_NAMESPACE_RW | Tạo/sửa namespace cấu hình | config | namespace |
| PM-111 | CONFIG_ENTRY_RW | Tạo/sửa entry cấu hình | config | entry |
| PM-112 | CONFIG_PUBLISH | Phát hành cấu hình, rollback | config | publish |
| PM-113 | FEATURE_FLAG_RW | Quản lý feature flags/rollout | config | feature_flag |
| PM-114 | TAX_RATE_RW | Quản lý thuế | config | tax |
| PM-115 | FEE_SCHEDULE_RW | Quản lý biểu phí | config | fee |
| PM-116 | COMMISSION_RULE_RW | Quản lý hoa hồng | config | commission |
| PM-117 | TEMPLATE_RW | Quản lý template thông báo | config | template |
| PM-118 | I18N_RW | Quản lý từ điển i18n | config | i18n |
| PM-119 | FORM_SCHEMA_RW | Quản lý biểu mẫu (JSON Schema) | config | form_schema |
| PM-120 | SLA_RW | Quản lý SLA | config | sla |
| PM-121 | BUSINESS_HOURS_RW | Quản lý lịch làm việc | config | business_hours |
| PM-122 | DEPOT_CALENDAR_RW | Quản lý lịch đóng Depot | config | depot_calendar |
| PM-123 | INTEGRATION_CONFIG_RW | Quản lý cấu hình tích hợp | config | integration |
| PM-124 | PAYMENT_METHOD_RW | Quản lý phương thức thanh toán | config | payment_method |
| PM-125 | PARTNER_RW | Quản lý đối tác | config | partner |

**Áp dụng cho:** Admin (tất cả), Config Manager (tất cả 16 permissions)

**💎 Nhóm lớn nhất:** 16 permissions - chiếm 30% tổng số permissions

---

### 📊 Phân bố Permissions theo Module

```
Configuration (PM-110..125)  ████████████████  16 (30%)
Depot (PM-080..086)          ███████           7  (13%)
Admin Core (PM-070..074)     █████             5  (9%)
Listing (PM-010..014)        █████             5  (9%)
RFQ/Quote (PM-020..024)      █████             5  (9%)
Orders (PM-040..043)         ████              4  (8%)
Review/Dispute (PM-050..061) ███               3  (6%)
Public (PM-001..003)         ███               3  (6%)
Finance (PM-090..091)        ██                2  (4%)
Inspection (PM-030..031)     ██                2  (4%)
Support (PM-100)             █                 1  (2%)
──────────────────────────────────────────────────────
TOTAL                                         53 (100%)
```

---

## 4. DANH SÁCH 10 ROLES

### 👑 Admin (Level 100)
```yaml
Code: admin
Name: Quản trị viên hệ thống
Level: 100 (Cao nhất)
Permissions: 53/53 (100%)
Description: Toàn quyền hệ thống
Key Features:
  - Duyệt tin đăng (PM-070) ⭐
  - Quản lý users (PM-071)
  - Xem dashboard (PM-072)
  - Cấu hình pricing (PM-073)
  - Giải quyết tranh chấp (PM-061)
  - Toàn quyền config (PM-110..125)
```

### ⚙️ Config Manager (Level 80)
```yaml
Code: config_manager
Name: Quản lý cấu hình
Level: 80
Permissions: 16/53 (30%)
Description: Quản lý cấu hình hệ thống
Key Permissions:
  - PM-110..125: Toàn quyền config (16 permissions)
  - PM-072: View dashboard
Main Function:
  - Quản lý biểu phí, thuế, SLA
  - Quản lý template thông báo
  - Quản lý i18n, form schema
  - Quản lý đối tác, tích hợp
```

### 💰 Finance (Level 70)
```yaml
Code: finance
Name: Kế toán
Level: 70
Permissions: 3/53 (6%)
Description: Quản lý tài chính
Key Permissions:
  - PM-090: FINANCE_RECONCILE
  - PM-091: FINANCE_INVOICE
  - PM-072: View dashboard
Main Function:
  - Đối soát giao dịch
  - Xuất hóa đơn
  - Giải ngân
```

### 💲 Price Manager (Level 60)
```yaml
Code: price_manager
Name: Quản lý giá
Level: 60
Permissions: 2/53 (4%)
Description: Quản lý giá cả
Key Permissions:
  - PM-074: MANAGE_PRICE_RULES
  - PM-072: View dashboard
Main Function:
  - Quản lý pricing rules
  - Quản lý price bands
  - Dynamic pricing
```

### 🎧 Customer Support (Level 50)
```yaml
Code: customer_support
Name: Hỗ trợ khách hàng
Level: 50
Permissions: 2/53 (4%)
Description: Hỗ trợ khách hàng
Key Permissions:
  - PM-100: CS_MANAGE_TICKETS
  - PM-072: View dashboard
Main Function:
  - Xử lý yêu cầu hỗ trợ
  - Quản lý tickets
  - Tư vấn khách hàng
```

### 🏭 Depot Manager (Level 30)
```yaml
Code: depot_manager
Name: Quản lý kho bãi
Level: 30
Permissions: 9/53 (17%)
Description: Quản lý depot
Key Permissions:
  - PM-080..086: Toàn quyền depot (7 permissions)
  - PM-001, PM-002: View listings
Main Function:
  - Quản lý tồn kho
  - Tạo/cập nhật jobs
  - Lập EIR
  - Điều chỉnh & chuyển kho
```

### 🔍 Inspector (Level 25)
```yaml
Code: inspector
Name: Giám định viên
Level: 25
Permissions: 4/53 (8%)
Description: Giám định container
Key Permissions:
  - PM-030: REQUEST_INSPECTION
  - PM-031: VIEW_INSPECTION_REPORT
  - PM-001, PM-002: View listings
Main Function:
  - Giám định container
  - Lập báo cáo giám định
  - Đánh giá chất lượng
```

### 👷 Depot Staff (Level 20)
```yaml
Code: depot_staff
Name: Nhân viên kho
Level: 20
Permissions: 4/53 (8%)
Description: Nhân viên depot
Key Permissions:
  - PM-083: DEPOT_VIEW_STOCK
  - PM-084: DEPOT_VIEW_MOVEMENTS
  - PM-001, PM-002: View listings
Main Function:
  - Xem tồn kho
  - Xem nhật ký di chuyển
  - Hỗ trợ depot manager
```

### 🏪 Seller (Level 10)
```yaml
Code: seller
Name: Người bán
Level: 10
Permissions: 12/53 (23%)
Description: Bán container
Key Permissions:
  - PM-010..014: Quản lý listings (5 permissions)
  - PM-021, PM-022: Phát hành & xem quotes
  - PM-040, PM-050: Orders & reviews
  - PM-001, PM-002: View public
Main Function:
  - Đăng tin bán/cho thuê
  - Phản hồi RFQ
  - Quản lý đơn hàng
```

### 🛒 Buyer (Level 10)
```yaml
Code: buyer
Name: Người mua
Level: 10
Permissions: 12/53 (23%)
Description: Mua container
Key Permissions:
  - PM-020, PM-022: Tạo RFQ & xem quotes
  - PM-030, PM-031: Giám định
  - PM-040..043: Orders (4 permissions)
  - PM-050, PM-060: Reviews & disputes
  - PM-001, PM-002, PM-003: View
Main Function:
  - Tìm & mua container
  - Tạo RFQ
  - Đặt hàng & thanh toán
  - Yêu cầu giám định
```

### 👤 Guest (Level 0)
```yaml
Code: guest (implicit)
Name: Khách
Level: 0
Permissions: 2/53 (4%)
Description: Chưa đăng nhập
Key Permissions:
  - PM-001: VIEW_PUBLIC_LISTINGS
  - PM-002: SEARCH_LISTINGS
Main Function:
  - Browse marketplace
  - Xem thông tin công khai
```

---

## 5. MA TRẬN PHÂN QUYỀN CHI TIẾT

### 🔐 Permission Matrix (53 × 10)

| Permission Code | Admin | Config Mgr | Finance | Price Mgr | Support | Depot Mgr | Inspector | Depot Staff | Seller | Buyer |
|-----------------|-------|------------|---------|-----------|---------|-----------|-----------|-------------|--------|-------|
| **PM-001** VIEW_PUBLIC_LISTINGS | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **PM-002** SEARCH_LISTINGS | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **PM-003** VIEW_SELLER_PROFILE | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **PM-010** CREATE_LISTING | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **PM-011** EDIT_LISTING | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **PM-012** PUBLISH_LISTING | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **PM-013** ARCHIVE_LISTING | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **PM-014** DELETE_LISTING | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **PM-020** CREATE_RFQ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **PM-021** ISSUE_QUOTE | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **PM-022** VIEW_QUOTES | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **PM-023** MANAGE_QA | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-024** REDACTION_ENFORCE | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-030** REQUEST_INSPECTION | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **PM-031** VIEW_INSPECTION_REPORT | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **PM-040** CREATE_ORDER | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **PM-041** PAY_ESCROW | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **PM-042** REQUEST_DELIVERY | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **PM-043** CONFIRM_RECEIPT | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **PM-050** RATE_AND_REVIEW | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **PM-060** FILE_DISPUTE | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **PM-061** RESOLVE_DISPUTE | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-070** ADMIN_REVIEW_LISTING ⭐ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-071** ADMIN_MANAGE_USERS | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-072** ADMIN_VIEW_DASHBOARD | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-073** ADMIN_CONFIG_PRICING | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-074** MANAGE_PRICE_RULES | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-080** DEPOT_CREATE_JOB | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **PM-081** DEPOT_UPDATE_JOB | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **PM-082** DEPOT_ISSUE_EIR | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **PM-083** DEPOT_VIEW_STOCK | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **PM-084** DEPOT_VIEW_MOVEMENTS | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **PM-085** DEPOT_ADJUST_STOCK | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **PM-086** DEPOT_TRANSFER_STOCK | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **PM-090** FINANCE_RECONCILE | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-091** FINANCE_INVOICE | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-100** CS_MANAGE_TICKETS | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-110** CONFIG_NAMESPACE_RW | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-111** CONFIG_ENTRY_RW | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-112** CONFIG_PUBLISH | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-113** FEATURE_FLAG_RW | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-114** TAX_RATE_RW | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-115** FEE_SCHEDULE_RW | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-116** COMMISSION_RULE_RW | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-117** TEMPLATE_RW | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-118** I18N_RW | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-119** FORM_SCHEMA_RW | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-120** SLA_RW | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-121** BUSINESS_HOURS_RW | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-122** DEPOT_CALENDAR_RW | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-123** INTEGRATION_CONFIG_RW | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-124** PAYMENT_METHOD_RW | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PM-125** PARTNER_RW | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Tổng Permissions:** | 53 | 16 | 3 | 2 | 2 | 9 | 4 | 4 | 12 | 12 |

---

### 📊 Phân tích Permissions theo Role

```
┌──────────────────┬───────────┬──────────┬─────────┐
│ Role             │ Perms     │ % Total  │ Level   │
├──────────────────┼───────────┼──────────┼─────────┤
│ Admin            │ 53/53     │ 100%     │ 100     │
│ Config Manager   │ 16/53     │ 30%      │ 80      │
│ Depot Manager    │ 9/53      │ 17%      │ 30      │
│ Seller           │ 12/53     │ 23%      │ 10      │
│ Buyer            │ 12/53     │ 23%      │ 10      │
│ Inspector        │ 4/53      │ 8%       │ 25      │
│ Depot Staff      │ 4/53      │ 8%       │ 20      │
│ Finance          │ 3/53      │ 6%       │ 70      │
│ Price Manager    │ 2/53      │ 4%       │ 60      │
│ Customer Support │ 2/53      │ 4%       │ 50      │
│ Guest            │ 2/53      │ 4%       │ 0       │
└──────────────────┴───────────┴──────────┴─────────┘
```

---

## 6. PHÂN TÍCH THEO MODULE

### 📦 Module: Listings (5 permissions)

**Permissions:** PM-010, PM-011, PM-012, PM-013, PM-014

**Access:**
- ✅ **Admin:** Toàn quyền (5/5)
- ✅ **Seller:** Toàn quyền (5/5)
- ❌ **Others:** Không có quyền

**Use Cases:**
1. Seller tạo tin đăng mới
2. Seller chỉnh sửa tin đăng
3. Seller gửi duyệt tin đăng
4. Admin duyệt tin đăng (PM-070)
5. Seller lưu trữ/xóa tin cũ

---

### 💼 Module: RFQ & Quotes (5 permissions)

**Permissions:** PM-020, PM-021, PM-022, PM-023, PM-024

**Access:**
- ✅ **Admin:** Toàn quyền (5/5)
- ✅ **Buyer:** Tạo RFQ, xem quotes (2/5)
- ✅ **Seller:** Phát hành quotes, xem (2/5)

**Workflow:**
```
Buyer creates RFQ (PM-020)
    ↓
Multiple Sellers view & respond
    ↓
Seller issues Quote (PM-021)
    ↓
Buyer views & compares Quotes (PM-022)
    ↓
Admin moderates Q&A (PM-023)
```

---

### 🏭 Module: Depot Operations (7 permissions)

**Permissions:** PM-080, PM-081, PM-082, PM-083, PM-084, PM-085, PM-086

**Access:**
- ✅ **Admin:** Toàn quyền (7/7)
- ✅ **Depot Manager:** Toàn quyền (7/7)
- ✅ **Depot Staff:** Xem only (2/7)

**Hierarchy:**
```
Depot Manager:
  - Create/Update Jobs
  - Issue EIR
  - Adjust Stock
  - Transfer Stock
  ↓
Depot Staff:
  - View Stock
  - View Movements
```

---

### ⚙️ Module: Configuration (16 permissions)

**Permissions:** PM-110 đến PM-125

**Access:**
- ✅ **Admin:** Toàn quyền (16/16)
- ✅ **Config Manager:** Toàn quyền (16/16)
- ❌ **Others:** Không có quyền

**Subcategories:**
- System Config: PM-110, PM-111, PM-112
- Feature Flags: PM-113
- Financial Config: PM-114, PM-115, PM-116
- Content Config: PM-117, PM-118, PM-119
- Business Rules: PM-120, PM-121, PM-122
- Integrations: PM-123, PM-124, PM-125

---

### 👑 Module: Admin (5 permissions)

**Permissions:** PM-070, PM-071, PM-072, PM-073, PM-074

**Access:**
- ✅ **Admin:** Toàn quyền (5/5)
- ✅ **Config Manager, Finance, Price Manager, Support:** Dashboard only (1/5)

**Critical Functions:**
- **PM-070: ADMIN_REVIEW_LISTING** ⭐ - Duyệt tin đăng
- **PM-071: ADMIN_MANAGE_USERS** ⭐ - Quản lý users
- **PM-072: ADMIN_VIEW_DASHBOARD** - Analytics
- **PM-073: ADMIN_CONFIG_PRICING** - Pricing config
- **PM-074: MANAGE_PRICE_RULES** - Dynamic pricing

---

## 7. DEMO ACCOUNTS

### 🔑 Demo Credentials

| Role | Email | Password | Permissions | Level |
|------|-------|----------|-------------|-------|
| 👑 Admin | admin@i-contexchange.vn | admin123 | 53/53 | 100 |
| ⚙️ Config Manager | config@example.com | config123 | 16/53 | 80 |
| 💰 Finance | finance@example.com | finance123 | 3/53 | 70 |
| 💲 Price Manager | price@example.com | price123 | 2/53 | 60 |
| 🎧 Support | support@example.com | support123 | 2/53 | 50 |
| 🏭 Depot Manager | manager@example.com | depot123 | 9/53 | 30 |
| 🔍 Inspector | inspector@example.com | inspector123 | 4/53 | 25 |
| 👷 Depot Staff | depot@example.com | depot123 | 4/53 | 20 |
| 🏪 Seller | seller@example.com | seller123 | 12/53 | 10 |
| 🛒 Buyer | buyer@example.com | buyer123 | 12/53 | 10 |

**⚠️ Production Note:** Đổi password trước khi deploy production!

---

### 🧪 Test Scenarios

#### Test 1: Admin Duyệt Tin Đăng
```bash
1. Login: admin@i-contexchange.vn / admin123
2. Navigate: /admin/listings
3. Action: Click "Duyệt" on pending listing
4. Expected: Success ✅ (has PM-070)
```

#### Test 2: Seller Không Thể Duyệt Tin
```bash
1. Login: seller@example.com / seller123
2. Navigate: /admin/listings
3. Expected: Access Denied ❌ (no PM-070)
```

#### Test 3: Config Manager Quản Lý Cấu Hình
```bash
1. Login: config@example.com / config123
2. Navigate: /admin/config
3. Action: Edit fee schedule
4. Expected: Success ✅ (has PM-115)
```

#### Test 4: Buyer Tạo RFQ
```bash
1. Login: buyer@example.com / buyer123
2. Navigate: /rfq/new
3. Action: Create RFQ
4. Expected: Success ✅ (has PM-020)
```

#### Test 5: Depot Manager Quản Lý Tồn Kho
```bash
1. Login: manager@example.com / depot123
2. Navigate: /depot/stock
3. Action: Adjust stock
4. Expected: Success ✅ (has PM-085)
```

---

## 8. VALIDATION & TESTING

### ✅ Database Validation

#### Query 1: Kiểm tra tổng permissions
```sql
SELECT COUNT(*) as total_permissions 
FROM permissions;
-- Expected: 53
```

#### Query 2: Kiểm tra Admin có đủ permissions
```sql
SELECT COUNT(rp.id) as admin_perms
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.code = 'admin';
-- Expected: 53
```

#### Query 3: Liệt kê permissions của từng role
```sql
SELECT 
  r.code as role_code,
  r.name as role_name,
  COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.code, r.name
ORDER BY permission_count DESC;
```

#### Query 4: Kiểm tra user có role nào
```sql
SELECT 
  u.email,
  r.code as role_code,
  r.name as role_name,
  COUNT(rp.permission_id) as permissions
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE u.email = 'admin@i-contexchange.vn'
GROUP BY u.email, r.code, r.name;
```

---

### 🧪 Backend API Testing

#### Test API: Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@i-contexchange.vn",
    "password": "admin123"
  }'

# Expected Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user-admin",
      "email": "admin@i-contexchange.vn",
      "roles": ["admin"],
      "permissions": ["PM-001", "PM-002", ..., "PM-125"]
    }
  }
}
```

#### Test API: Check Permission
```bash
curl -X POST http://localhost:3001/api/auth/check-permission \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permission": "PM-070"
  }'

# Expected for Admin:
{
  "success": true,
  "hasPermission": true
}

# Expected for Seller:
{
  "success": true,
  "hasPermission": false
}
```

#### Test API: Get User with Permissions
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected:
{
  "success": true,
  "data": {
    "user": {
      "id": "user-admin",
      "email": "admin@i-contexchange.vn",
      "roles": [
        {
          "code": "admin",
          "name": "Quản trị viên",
          "level": 100,
          "permissions": [...]
        }
      ],
      "permissions": ["PM-001", ..., "PM-125"]
    }
  }
}
```

---

### 🎨 Frontend Testing

#### Test 1: Check ClientRBACService
```typescript
// File: test-rbac-client.ts
import { ClientRBACService } from '@/lib/auth/client-rbac-service';

// Test admin
const adminRoles = ['admin'];
const adminPerms = ['PM-070', 'PM-071'];

console.log(
  'Admin has PM-070:',
  ClientRBACService.hasPermission(adminRoles, adminPerms, 'PM-070')
); // true

// Test seller
const sellerRoles = ['seller'];
const sellerPerms = ['PM-010', 'PM-011'];

console.log(
  'Seller has PM-070:',
  ClientRBACService.hasPermission(sellerRoles, sellerPerms, 'PM-070')
); // false
```

#### Test 2: PermissionGuard Component
```tsx
// Test permission guard
<PermissionGuard permission="PM-070" fallback={<AccessDenied />}>
  <AdminListingsPage />
</PermissionGuard>

// Admin: Sees page ✅
// Seller: Sees AccessDenied ❌
```

#### Test 3: RoleGuard Component
```tsx
// Test role guard
<RoleGuard role="admin" fallback={<Redirect to="/dashboard" />}>
  <AdminPanel />
</RoleGuard>

// Admin: Sees panel ✅
// Others: Redirected ❌
```

---

## 9. KẾT LUẬN & KHUYẾN NGHỊ

### ✅ Điểm mạnh hệ thống

1. **Phân quyền chi tiết**
   - 53 permissions cover tất cả chức năng
   - Granular control từng action
   - Dễ mở rộng thêm permissions mới

2. **Hierarchy rõ ràng**
   - Level 0-100 phân cấp quyền hạn
   - Admin (100) > Config Manager (80) > ... > Guest (0)
   - Inheritance logic đơn giản

3. **Flexible assignment**
   - Role-based: Gán permissions qua role
   - Direct: Gán permission trực tiếp cho user
   - Scope: GLOBAL, ORG, DEPT, SELF

4. **Database-driven**
   - Không hard-code permissions
   - Dễ thêm/sửa/xóa qua seed scripts
   - Migration-friendly

5. **Full-stack implementation**
   - Backend: RBACService + JWT
   - Frontend: ClientRBACService + Guards
   - Consistent logic cả 2 phía

---

### ⚠️ Khuyến nghị cải thiện

#### 1. Security Enhancements
```yaml
Priority: HIGH
Tasks:
  - Implement 2FA cho Admin
  - IP whitelist cho admin access
  - Session timeout (15 phút idle)
  - Brute-force protection
  - Rate limiting API calls
```

#### 2. Audit Logging
```yaml
Priority: HIGH
Tasks:
  - Log tất cả admin actions
  - Log permission changes
  - Log login/logout
  - Retention: 1 năm
  - Dashboard để xem audit logs
```

#### 3. Advanced RBAC
```yaml
Priority: MEDIUM
Tasks:
  - Time-based permissions (expiry)
  - Context-based access (IP, device)
  - Permission inheritance (parent-child)
  - Permission delegation
  - Approval workflow cho critical actions
```

#### 4. Performance Optimization
```yaml
Priority: MEDIUM
Tasks:
  - Cache permissions in Redis
  - Batch permission checks
  - Optimize database queries
  - Lazy load roles/permissions
```

#### 5. Testing & Documentation
```yaml
Priority: HIGH
Tasks:
  - Unit tests cho RBACService
  - Integration tests cho auth flow
  - E2E tests cho permission guards
  - API documentation (Swagger)
  - User manual cho từng role
```

---

### 📊 Metrics & Monitoring

#### Recommended KPIs
```yaml
Security:
  - Failed login attempts / day
  - Unauthorized access attempts
  - Permission denial rate
  - Session hijacking attempts

Usage:
  - Active users by role
  - Most used permissions
  - Least used permissions
  - Average session duration

Performance:
  - Permission check latency (< 10ms)
  - Auth API response time (< 100ms)
  - Database query time (< 50ms)
```

---

### 🚀 Next Steps

#### Phase 1: Production Preparation (Week 1-2)
- [ ] Change all demo passwords
- [ ] Enable 2FA for admin accounts
- [ ] Setup audit logging
- [ ] Configure session management
- [ ] Security testing & penetration test

#### Phase 2: Monitoring & Optimization (Week 3-4)
- [ ] Setup monitoring dashboard
- [ ] Configure alerts (failed logins, etc.)
- [ ] Performance optimization
- [ ] Cache implementation
- [ ] Load testing

#### Phase 3: Advanced Features (Month 2)
- [ ] Time-based permissions
- [ ] Approval workflows
- [ ] Permission delegation
- [ ] Advanced audit reports
- [ ] Role templates

#### Phase 4: Continuous Improvement (Ongoing)
- [ ] Regular security audits
- [ ] Permission usage analysis
- [ ] User feedback collection
- [ ] Feature flag management
- [ ] A/B testing for new permissions

---

### 📚 Related Documentation

1. **ADMIN-PERMISSIONS-SUMMARY.md** - Tóm tắt quyền Admin
2. **BAO-CAO-PHAN-QUYEN-ADMIN-VERIFIED.md** - Verification chi tiết
3. **Bao-Cao-Man-Hinh-Va-Phan-Quyen-Chi-Tiet.md** - Màn hình & phân quyền
4. **i-ContExchange.Roles-Permissions.md** - Thiết kế ban đầu
5. **RBAC-IMPLEMENTATION-SUMMARY.md** - Implementation guide
6. **Quick-Start-RBAC.md** - Quick start guide
7. **RBAC-TEST-GUIDE.md** - Testing guide

---

### 📞 Support & Contact

**Technical Lead:** GitHub Copilot AI  
**Email:** support@i-contexchange.vn  
**Documentation:** https://docs.i-contexchange.vn  
**GitHub:** https://github.com/CaoThaiDuong24/conttrade

---

## 📝 CHANGELOG

### Version 1.0 (24/10/2025)
- ✅ Initial release
- ✅ 53 permissions defined
- ✅ 10 roles + Guest
- ✅ Complete permission matrix
- ✅ Database schema documented
- ✅ Testing guidelines
- ✅ Demo accounts created

---

**© 2025 i-ContExchange Vietnam. All rights reserved.**

**Báo cáo này được tạo tự động bởi GitHub Copilot AI.**

---

## 📎 PHỤ LỤC

### A. Permission Code Reference

```
PM-001 to PM-003: Public & Viewing
PM-010 to PM-014: Listing Management
PM-020 to PM-024: RFQ & Quote
PM-030 to PM-031: Inspection
PM-040 to PM-043: Orders
PM-050:           Reviews
PM-060 to PM-061: Disputes
PM-070 to PM-074: Admin Core
PM-080 to PM-086: Depot Operations
PM-090 to PM-091: Finance
PM-100:           Customer Support
PM-110 to PM-125: Configuration Management
```

### B. Role Level Reference

```
Level 100: Admin (God mode)
Level 80:  Config Manager
Level 70:  Finance
Level 60:  Price Manager
Level 50:  Customer Support
Level 30:  Depot Manager
Level 25:  Inspector
Level 20:  Depot Staff
Level 10:  Seller, Buyer
Level 0:   Guest
```

### C. Database Seed Command

```bash
# Seed complete RBAC system
cd backend
node --import tsx scripts/seed/seed-final-rbac.mjs

# Expected output:
# 🌱 Creating complete RBAC system...
# 🔐 Created 53 permissions
# 🎭 Created 10 roles
# 👥 Created 10 demo users
# 🛡️ Assigned permissions to roles
# 🎉 COMPLETE! Admin has 53/53 permissions
```

### D. Verification Script

```typescript
// File: backend/scripts/verify-rbac.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyRBAC() {
  // Check total permissions
  const totalPerms = await prisma.permissions.count();
  console.log(`Total Permissions: ${totalPerms}`);
  
  // Check admin permissions
  const adminRole = await prisma.roles.findUnique({
    where: { code: 'admin' },
    include: {
      role_permissions: true
    }
  });
  
  console.log(`Admin Permissions: ${adminRole?.role_permissions.length}`);
  console.log(`Status: ${totalPerms === adminRole?.role_permissions.length ? '✅ PERFECT' : '❌ MISSING'}`);
}

verifyRBAC();
```

---

**END OF DOCUMENT**
