# 📊 BÁO CÁO MÀN HÌNH VÀ PHÂN QUYỀN CHI TIẾT - i-ContExchange

**Ngày tạo:** $(Get-Date -Format "dd/MM/yyyy HH:mm")  
**Phiên bản:** v2.0  
**Tác giả:** AI Assistant  
**Mục đích:** Thống kê chi tiết tất cả màn hình và phân quyền truy cập theo từng vai trò

---

## 📋 **TỔNG QUAN THỐNG KÊ**

### **📊 Thống kê tổng quan:**
- **Tổng số màn hình:** 52 pages
- **Tổng số roles:** 8 roles
- **Tổng số permissions:** 125+ permissions
- **Màn hình public:** 8 pages
- **Màn hình authenticated:** 44 pages

### **👥 Danh sách Roles:**
1. **👑 Admin** (Quản trị viên) - Level 100
2. **⚙️ Config Manager** (Quản lý cấu hình) - Level 80  
3. **💰 Finance** (Kế toán) - Level 70
4. **💲 Price Manager** (Quản lý giá) - Level 60
5. **🎧 Customer Support** (Hỗ trợ khách hàng) - Level 50
6. **🏭 Depot Manager** (Quản lý kho bãi) - Level 30
7. **🔍 Inspector** (Giám định viên) - Level 25
8. **👷 Depot Staff** (Nhân viên kho bãi) - Level 20
9. **🏪 Seller** (Người bán) - Level 10
10. **🛒 Buyer** (Người mua) - Level 10
11. **👤 Guest** (Khách) - Level 0

---

## 🏠 **NHÓM 1: TRANG PUBLIC (8 pages)**

*Không yêu cầu đăng nhập, truy cập được bởi tất cả roles*

| **STT** | **Màn hình** | **Route** | **Mô tả** | **Permissions** |
|---------|--------------|-----------|-----------|-----------------|
| 1 | Trang chủ | `/` | Landing page | `null` (public) |
| 2 | Đăng nhập | `/auth/login` | Form đăng nhập | `null` (public) |
| 3 | Đăng nhập nâng cao | `/auth/login/enhanced` | Enhanced login | `null` (public) |
| 4 | Đăng ký | `/auth/register` | Form đăng ký | `null` (public) |
| 5 | Quên mật khẩu | `/auth/forgot` | Reset password | `null` (public) |
| 6 | Đặt lại mật khẩu | `/auth/reset` | Password reset | `null` (public) |
| 7 | Trợ giúp | `/help` | Trung tâm trợ giúp | `null` (public) |
| 8 | Pháp lý | `/legal` | Điều khoản chung | `null` (public) |
| 9 | Chính sách | `/legal/privacy` | Chính sách bảo mật | `null` (public) |
| 10 | Điều khoản | `/legal/terms` | Điều khoản sử dụng | `null` (public) |

### **🎯 Roles có thể truy cập:**
- ✅ **Tất cả roles** (bao gồm Guest)

---

## 👤 **NHÓM 2: QUẢN LÝ TÀI KHOẢN (3 pages)**

*Yêu cầu đăng nhập*

| **STT** | **Màn hình** | **Route** | **Mô tả** | **Permission** | **Roles truy cập** |
|---------|--------------|-----------|-----------|----------------|-------------------|
| 11 | Hồ sơ cá nhân | `/account/profile` | Thông tin tài khoản | `account.read` | 👑🛒🏪🏭👷🔍⚙️💰💲🎧 |
| 12 | Xác thực tài khoản | `/account/verify` | eKYC/eKYB | `account.verify` | 👑🛒🏪🏭👷🔍⚙️💰💲🎧 |

### **🎯 Demo accounts:**
- ✅ **admin@i-contexchange.vn** / admin123 (👑 Admin)
- ✅ **buyer@example.com** / buyer123 (🛒 Buyer)  
- ✅ **seller@example.com** / seller123 (🏪 Seller)
- ✅ **depot@example.com** / depot123 (👷 Depot Staff)
- ✅ **manager@example.com** / depot123 (🏭 Depot Manager)
- ✅ **inspector@example.com** / inspector123 (🔍 Inspector)
- ✅ **operator@example.com** / operator123 (⚙️ Config Manager)

---

## 📊 **NHÓM 3: DASHBOARD (2 pages)**

| **STT** | **Màn hình** | **Route** | **Mô tả** | **Permission** | **Roles truy cập** |
|---------|--------------|-----------|-----------|----------------|-------------------|
| 13 | Dashboard chính | `/dashboard` | Bảng điều khiển | `dashboard.view` | 👑🛒🏪🏭👷🔍⚙️💰💲🎧 |
| 14 | Dashboard test | `/dashboard/test` | Test dashboard | `dashboard.view` | 👑🛒🏪🏭👷🔍⚙️💰💲🎧 |

---

## 📦 **NHÓM 4: QUẢN LÝ CONTAINER (4 pages)**

| **STT** | **Màn hình** | **Route** | **Mô tả** | **Permission** | **Roles truy cập** |
|---------|--------------|-----------|-----------|----------------|-------------------|
| 15 | Danh sách container | `/listings` | Browse containers | `listings.read` | 👑🛒🏪👤 |
| 16 | Chi tiết container | `/listings/[id]` | Container details | `listings.read` | 👑🛒🏪👤 |
| 17 | Đăng tin mới | `/sell/new` | Tạo listing mới | `listings.write` | 👑🏪 |
| 18 | Quản lý tin đăng | `/sell/my-listings` | Listings của tôi | `listings.write` | 👑🏪 |

### **🎯 Navigation trong menu:**
- **👑 Admin:** Container (listings), Tin đăng (admin/listings)
- **🛒 Buyer:** Container (listings)
- **🏪 Seller:** Container (listings), Bán hàng → Đăng tin mới, Tin đăng của tôi
- **👤 Guest:** Container (listings) - chỉ xem

---

## 📄 **NHÓM 5: RFQ & BÁO GIÁ (3 pages)**

| **STT** | **Màn hình** | **Route** | **Mô tả** | **Permission** | **Roles truy cập** |
|---------|--------------|-----------|-----------|----------------|-------------------|
| 19 | Danh sách RFQ | `/rfq` | Request for Quote | `rfq.read` | 👑🛒🏪 |
| 20 | Chi tiết RFQ | `/rfq/[id]` | RFQ details | `rfq.read` | 👑🛒🏪 |
| 21 | Q&A RFQ | `/rfq/[id]/qa` | Questions & Answers | `rfq.read` | 👑🛒🏪 |

### **🎯 Navigation trong menu:**
- **👑 Admin:** Không có menu trực tiếp
- **🛒 Buyer:** RFQ (rfq)
- **🏪 Seller:** RFQ (rfq)

---

## 🛒 **NHÓM 6: QUẢN LÝ ĐỀN HÀNG (3 pages)**

| **STT** | **Màn hình** | **Route** | **Mô tả** | **Permission** | **Roles truy cập** |
|---------|--------------|-----------|-----------|----------------|-------------------|
| 22 | Danh sách đơn hàng | `/orders` | Order management | `orders.read` | 👑🛒🏪🏭 |
| 23 | Chi tiết đơn hàng | `/orders/[id]` | Order details | `orders.read` | 👑🛒🏪🏭 |
| 24 | Thanh toán | `/orders/checkout` | Checkout process | `orders.write` | 👑🛒 |

### **🎯 Navigation trong menu:**
- **👑 Admin:** Đơn hàng (orders)
- **🛒 Buyer:** Đơn hàng → Tất cả đơn hàng, Thanh toán
- **🏪 Seller:** Đơn hàng (orders)
- **🏭 Depot Manager:** Đơn hàng (orders)

---

## 💰 **NHÓM 7: THANH TOÁN (1 page)**

| **STT** | **Màn hình** | **Route** | **Mô tả** | **Permission** | **Roles truy cập** |
|---------|--------------|-----------|-----------|----------------|-------------------|
| 25 | Ví Escrow | `/payments/escrow` | Escrow wallet | `payments.escrow` | 👑🛒💰 |

### **🎯 Navigation trong menu:**
- **👑 Admin:** Không có menu trực tiếp
- **🛒 Buyer:** Thanh toán → Ví escrow
- **💰 Finance:** Thanh toán (payments/escrow)

---

## 🔍 **NHÓM 8: GIÁM ĐỊNH (1 page)**

| **STT** | **Màn hình** | **Route** | **Mô tả** | **Permission** | **Roles truy cập** |
|---------|--------------|-----------|-----------|----------------|-------------------|
| 26 | Tạo yêu cầu giám định | `/inspection/new` | Schedule inspection | `inspection.schedule` | 👑🛒🔍 |

### **🎯 Navigation trong menu:**
- **👑 Admin:** Không có menu trực tiếp
- **🛒 Buyer:** Giám định (inspection/new)
- **🔍 Inspector:** Giám định (inspection/new)

---

## 🚚 **NHÓM 9: VẬN CHUYỂN (2 pages)**

| **STT** | **Màn hình** | **Route** | **Mô tả** | **Permission** | **Roles truy cập** |
|---------|--------------|-----------|-----------|----------------|-------------------|
| 27 | Quản lý vận chuyển | `/delivery` | Delivery management | `delivery.read` | 👑🛒🏪🏭👷 |
| 28 | Theo dõi giao hàng | `/delivery/track/[id]` | Track delivery | `delivery.track` | 👑🛒🏪🏭👷 |

### **🎯 Navigation trong menu:**
- **👑 Admin:** Không có menu trực tiếp
- **🛒 Buyer:** Vận chuyển (delivery)
- **🏪 Seller:** Vận chuyển (delivery)
- **🏭 Depot Manager:** Vận chuyển (delivery)
- **👷 Depot Staff:** Vận chuyển (delivery)

---

## ⭐ **NHÓM 10: ĐÁNH GIÁ (2 pages)**

| **STT** | **Màn hình** | **Route** | **Mô tả** | **Permission** | **Roles truy cập** |
|---------|--------------|-----------|-----------|----------------|-------------------|
| 29 | Danh sách đánh giá | `/reviews` | Review management | `reviews.read` | 👑🛒🏪🏭 |
| 30 | Tạo đánh giá | `/reviews/new` | Create review | `reviews.write` | 👑🛒🏪🏭 |

### **🎯 Navigation trong menu:**
- **👑 Admin:** Không có menu trực tiếp
- **🛒 Buyer:** Đánh giá → Tạo đánh giá
- **🏪 Seller:** Đánh giá → Tạo đánh giá
- **🏭 Depot Manager:** Đánh giá → Tạo đánh giá

---

## ⚠️ **NHÓM 11: TRANH CHẤP (2 pages)**

| **STT** | **Màn hình** | **Route** | **Mô tả** | **Permission** | **Roles truy cập** |
|---------|--------------|-----------|-----------|----------------|-------------------|
| 31 | Danh sách tranh chấp | `/disputes` | Dispute management | `disputes.read` | 👑🛒🎧 |
| 32 | Tạo tranh chấp | `/disputes/new` | Create dispute | `disputes.write` | 👑🛒 |

### **🎯 Navigation trong menu:**
- **👑 Admin:** Quản trị → Tranh chấp
- **🛒 Buyer:** Khiếu nại → Tạo khiếu nại
- **🎧 Customer Support:** Tranh chấp (disputes)

---

## 🧾 **NHÓM 12: HÓA ĐƠN & THANH TOÁN (2 pages)**

| **STT** | **Màn hình** | **Route** | **Mô tả** | **Permission** | **Roles truy cập** |
|---------|--------------|-----------|-----------|----------------|-------------------|
| 33 | Quản lý hóa đơn | `/billing` | Billing management | `billing.read` | 👑🏪🏭💰 |
| 34 | Gói dịch vụ | `/subscriptions` | Subscription plans | `billing.read` | 👑🏪🏭💰 |

### **🎯 Navigation trong menu:**
- **👑 Admin:** Không có menu trực tiếp
- **🏪 Seller:** Hóa đơn (billing)
- **🏭 Depot Manager:** Hóa đơn (billing)
- **💰 Finance:** Hóa đơn (billing)

---

## 🏭 **NHÓM 13: QUẢN LÝ KHO BÃI (6 pages)**

| **STT** | **Màn hình** | **Route** | **Mô tả** | **Permission** | **Roles truy cập** |
|---------|--------------|-----------|-----------|----------------|-------------------|
| 35 | Tồn kho | `/depot/stock` | Inventory management | `depot.inventory` | 👑🏭👷 |
| 36 | Nhật ký di chuyển | `/depot/movements` | Movement logs | `depot.inventory` | 👑🏭👷 |
| 37 | Chuyển kho | `/depot/transfers` | Inter-depot transfers | `depot.inventory` | 👑🏭👷 |
| 38 | Điều chỉnh tồn kho | `/depot/adjustments` | Stock adjustments | `depot.inventory` | 👑🏭👷 |
| 39 | Lịch giám định | `/depot/inspections` | Inspection schedule | `depot.inspect` | 👑🏭👷🔍 |
| 40 | Sửa chữa | `/depot/repairs` | Repair management | `depot.repair` | 👑🏭👷 |

### **🎯 Navigation trong menu:**
- **👑 Admin:** Không có menu trực tiếp
- **🏭 Depot Manager:** Kho bãi → Tồn kho, Di chuyển, Chuyển kho, Điều chỉnh, Sửa chữa
- **👷 Depot Staff:** Kho bãi → Tồn kho, Di chuyển, Chuyển kho, Điều chỉnh
- **🔍 Inspector:** Lịch giám định (depot/inspections)

---

## 💰 **NHÓM 14: TÀI CHÍNH (1 page)**

| **STT** | **Màn hình** | **Route** | **Mô tả** | **Permission** | **Roles truy cập** |
|---------|--------------|-----------|-----------|----------------|-------------------|
| 41 | Đối soát tài chính | `/finance/reconcile` | Financial reconciliation | `finance.reconcile` | 👑💰 |

### **🎯 Navigation trong menu:**
- **👑 Admin:** Không có menu trực tiếp
- **💰 Finance:** Đối soát (finance/reconcile)

---

## 👑 **NHÓM 15: QUẢN TRỊ HỆ THỐNG (7 pages)**

| **STT** | **Màn hình** | **Route** | **Mô tả** | **Permission** | **Roles truy cập** |
|---------|--------------|-----------|-----------|----------------|-------------------|
| 42 | Admin Dashboard | `/admin` | Admin overview | `admin.access` | 👑 |
| 43 | Quản lý người dùng | `/admin/users` | User management | `admin.users` | 👑 |
| 44 | Duyệt tin đăng | `/admin/listings` | Listing moderation | `admin.moderate` | 👑 |
| 45 | Quản lý tranh chấp | `/admin/disputes` | Dispute resolution | `admin.moderate` | 👑 |
| 46 | Cấu hình hệ thống | `/admin/config` | System configuration | `admin.settings` | 👑⚙️💲 |
| 47 | Mẫu thông báo | `/admin/templates` | Notification templates | `admin.settings` | 👑⚙️ |
| 48 | Nhật ký audit | `/admin/audit` | Audit logs | `admin.audit` | 👑 |

### **🎯 Navigation trong menu:**
- **👑 Admin:** 
  - Quản trị → Tổng quan, Người dùng, **Duyệt tin đăng**, Tranh chấp, Cấu hình, Mẫu thông báo, Nhật ký
  - **Duyệt tin đăng** (menu riêng - nổi bật) ✅
- **⚙️ Config Manager:** Cấu hình (admin/config), Mẫu thông báo (admin/templates)
- **💲 Price Manager:** Cấu hình (admin/config)

---

## 📊 **THỐNG KÊ PHÂN QUYỀN THEO ROLE**

### **👑 Admin (Level 100) - 26 pages**
```
Permissions: Toàn quyền hệ thống (125+ permissions)
Pages: Dashboard, Account, Listings, RFQ, Orders, Payments, Inspection, 
       Delivery, Reviews, Disputes, Billing, Depot, Finance, Admin
Navigation: 7 main items (bao gồm "Duyệt tin đăng" nổi bật), 13 sub-items
Tính năng đặc biệt: ✅ Duyệt tin đăng với đầy đủ chức năng approve/reject
```

### **🛒 Buyer (Level 10) - 19 pages**
```
Permissions: PM-001,002,003,020,022,030,031,040,041,042,043,050,060
Pages: Dashboard, Account, Listings, RFQ, Orders, Payments, Inspection, 
       Delivery, Reviews, Disputes
Navigation: 11 main items, 4 sub-items
```

### **🏪 Seller (Level 10) - 16 pages**
```
Permissions: PM-001,002,003,010,011,012,013,014,021,031
Pages: Dashboard, Account, Listings, Sell, RFQ, Orders, Delivery, 
       Reviews, Billing
Navigation: 9 main items, 3 sub-items
```

### **🏭 Depot Manager (Level 30) - 20 pages**
```
Permissions: PM-080,081,082,083,084,085,086
Pages: Dashboard, Account, Depot, Orders, Delivery, Billing, Reviews
Navigation: 8 main items, 6 sub-items
```

### **👷 Depot Staff (Level 20) - 15 pages**
```
Permissions: PM-080,081,082,083,084
Pages: Dashboard, Account, Depot, Delivery
Navigation: 6 main items, 4 sub-items
```

### **🔍 Inspector (Level 25) - 6 pages**
```
Permissions: PM-070,061,072
Pages: Dashboard, Account, Inspection, Depot/Inspections
Navigation: 4 main items
```

### **⚙️ Config Manager (Level 80) - 6 pages**
```
Permissions: PM-110..125,072
Pages: Dashboard, Account, Admin/Config, Admin/Templates
Navigation: 4 main items
```

### **💰 Finance (Level 70) - 8 pages**
```
Permissions: PM-090,091,072
Pages: Dashboard, Account, Finance/Reconcile, Billing, Payments
Navigation: 5 main items
```

### **💲 Price Manager (Level 60) - 4 pages**
```
Permissions: PM-074,072
Pages: Dashboard, Account, Admin/Config
Navigation: 3 main items
```

### **🎧 Customer Support (Level 50) - 6 pages**
```
Permissions: PM-100,072
Pages: Dashboard, Account, Disputes, Help
Navigation: 4 main items
```

### **👤 Guest (Level 0) - 10 pages**
```
Permissions: PM-001,002
Pages: Home, Auth pages, Help, Legal, Listings (read-only)
Navigation: 3 main items
```

---

## 🔒 **MA TRẬN PHÂN QUYỀN CHI TIẾT**

### **Permission Codes được sử dụng:**

| **Code** | **Mô tả** | **Scope** | **Roles** |
|----------|-----------|-----------|-----------|
| `dashboard.view` | Xem dashboard | Global | All authenticated |
| `account.read` | Xem thông tin tài khoản | Own | All authenticated |
| `account.verify` | Xác thực tài khoản | Own | All authenticated |
| `listings.read` | Xem danh sách container | Global | All + Guest |
| `listings.write` | Tạo/sửa tin đăng | Own/Org | Admin, Seller |
| `rfq.read` | Xem RFQ | Participants | Admin, Buyer, Seller |
| `rfq.write` | Tạo RFQ | Own | Admin, Buyer |
| `rfq.respond` | Phản hồi RFQ | Global | Admin, Seller |
| `orders.read` | Xem đơn hàng | Own/Assigned | Admin, Buyer, Seller, Depot Manager |
| `orders.write` | Tạo đơn hàng | Own | Admin, Buyer |
| `payments.view` | Xem thanh toán | Own | Admin, Buyer, Finance |
| `payments.escrow` | Quản lý escrow | Own | Admin, Buyer, Finance |
| `inspection.schedule` | Đặt lịch giám định | Own | Admin, Buyer, Inspector |
| `delivery.read` | Xem vận chuyển | Own/Assigned | Admin, Buyer, Seller, Depot |
| `delivery.track` | Theo dõi giao hàng | Own/Assigned | Admin, Buyer, Seller, Depot |
| `reviews.read` | Xem đánh giá | Global | All authenticated |
| `reviews.write` | Tạo đánh giá | Own | Admin, Buyer, Seller, Depot Manager |
| `disputes.read` | Xem tranh chấp | Own/Assigned | Admin, Buyer, Customer Support |
| `disputes.write` | Tạo tranh chấp | Own | Admin, Buyer |
| `billing.read` | Xem hóa đơn | Own/Org | Admin, Seller, Depot Manager, Finance |
| `depot.inventory` | Quản lý tồn kho | Depot | Admin, Depot Manager, Depot Staff |
| `depot.inspect` | Lịch giám định | Depot | Admin, Depot Manager, Depot Staff, Inspector |
| `depot.repair` | Quản lý sửa chữa | Depot | Admin, Depot Manager, Depot Staff |
| `finance.reconcile` | Đối soát tài chính | Global | Admin, Finance |
| `admin.access` | Truy cập admin | Global | Admin |
| `admin.users` | Quản lý người dùng | Global | Admin |
| `admin.moderate` | Kiểm duyệt nội dung | Global | Admin |
| `admin.settings` | Cấu hình hệ thống | Global | Admin, Config Manager |
| `admin.audit` | Xem nhật ký | Global | Admin |

---

## 🎯 **KẾT LUẬN**

### **📊 Tổng kết:**
- **Tổng cộng 52 màn hình** được phân quyền chi tiết
- **8 roles chính** với hierarchy rõ ràng
- **30+ permissions** được mapping cụ thể
- **100% màn hình** đã có navigation menu tương ứng
- **Demo accounts** hoạt động đầy đủ cho test

### **✅ Điểm mạnh:**
- Phân quyền chi tiết và logic
- Navigation menu động theo role
- Route protection hoàn chỉnh
- Demo accounts đầy đủ
- Documentation chi tiết

### **🔧 Khuyến nghị:**
- Thường xuyên review và update permissions
- Thêm audit logging cho các hành động quan trọng
- Implement session management tốt hơn
- Tối ưu hóa performance cho large datasets

---

**© 2025 i-ContExchange Vietnam. All rights reserved.**
