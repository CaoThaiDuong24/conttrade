# 📋 DANH SÁCH TÀI KHOẢN DEMO - i-ContExchange

**Ngày cập nhật:** 24/10/2025  
**Trạng thái:** ✅ Hoàn chỉnh - 10 Roles đầy đủ

---

## 🎯 TỔNG QUAN

Hệ thống có **10 loại tài khoản** (roles) với phân quyền đầy đủ theo cấu trúc RBAC:

| STT | Role Code | Level | Tên Role | Số Permissions |
|-----|-----------|-------|----------|----------------|
| 1 | admin | 100 | Quản trị viên | 53 |
| 2 | config_manager | 80 | Quản lý cấu hình | 17 |
| 3 | finance | 70 | Kế toán | 6 |
| 4 | price_manager | 60 | Quản lý giá | 4 |
| 5 | customer_support | 50 | Hỗ trợ khách hàng | 5 |
| 6 | depot_manager | 30 | Quản lý kho bãi | 9 |
| 7 | inspector | 25 | Giám định viên | 4 |
| 8 | depot_staff | 20 | Nhân viên kho | 4 |
| 9 | seller | 10 | Người bán | 12 |
| 10 | buyer | 10 | Người mua | 12 |

---

## 👥 CHI TIẾT TÀI KHOẢN DEMO

### 1. 👑 **ADMIN - Quản trị viên hệ thống**
```
📧 Email:    admin@i-contexchange.vn
🔑 Password: admin123
🎭 Role:     admin (Level 100)
✅ Status:   ACTIVE
📱 Phone:    +84901234560
```

**Quyền hạn:** Toàn quyền quản trị hệ thống - 53 permissions
- Quản lý người dùng, roles, permissions
- Duyệt tin đăng, xử lý tranh chấp
- Xem tất cả báo cáo, thống kê
- Cấu hình toàn hệ thống

---

### 2. ⚙️ **CONFIG MANAGER - Quản lý cấu hình**
```
📧 Email:    config@example.com
🔑 Password: config123
🎭 Role:     config_manager (Level 80)
✅ Status:   ACTIVE
📱 Phone:    +84901234561
```

**Quyền hạn:** Quản lý cấu hình hệ thống - 17 permissions
- Quản lý namespace, entries
- Feature flags, tax rates
- Fee schedules, commission rules
- Templates, i18n, form schemas
- Business hours, depot calendars
- Integration configs, payment methods

---

### 3. 💰 **FINANCE - Kế toán**
```
📧 Email:    finance@example.com
🔑 Password: finance123
🎭 Role:     finance (Level 70)
✅ Status:   ACTIVE
📱 Phone:    +84901234562
```

**Quyền hạn:** Quản lý tài chính - 6 permissions
- Đối soát (FINANCE_RECONCILE)
- Xuất hóa đơn (FINANCE_INVOICE)
- Xem dashboard
- Xem listings, tạo đơn hàng
- Xác nhận nhận hàng

---

### 4. 💲 **PRICE MANAGER - Quản lý giá**
```
📧 Email:    price@example.com
🔑 Password: price123
🎭 Role:     price_manager (Level 60)
✅ Status:   ACTIVE
📱 Phone:    +84901234563
```

**Quyền hạn:** Quản lý giá cả - 4 permissions
- Quản lý pricing rules
- Cấu hình giá (ADMIN_CONFIG_PRICING)
- Xem dashboard
- Xem listings

---

### 5. 🎧 **CUSTOMER SUPPORT - Hỗ trợ khách hàng**
```
📧 Email:    support@example.com
🔑 Password: support123
🎭 Role:     customer_support (Level 50)
✅ Status:   ACTIVE
📱 Phone:    +84901234564
```

**Quyền hạn:** Hỗ trợ khách hàng - 5 permissions
- Quản lý tickets (CS_MANAGE_TICKETS)
- Xử lý khiếu nại (FILE_DISPUTE, RESOLVE_DISPUTE)
- Xem dashboard
- Xem listings

---

### 6. 🏭 **DEPOT MANAGER - Quản lý kho bãi**
```
📧 Email:    manager@example.com
🔑 Password: manager123
🎭 Role:     depot_manager (Level 30)
✅ Status:   ACTIVE
📱 Phone:    +84901234565
```

**Quyền hạn:** Quản lý kho bãi đầy đủ - 9 permissions
- Tạo/cập nhật công việc depot
- Lập EIR
- Xem tồn kho, di chuyển
- Điều chỉnh tồn kho
- Chuyển kho giữa các depot
- Xem listings

---

### 7. 🔍 **INSPECTOR - Giám định viên**
```
📧 Email:    inspector@example.com
🔑 Password: inspector123
🎭 Role:     inspector (Level 25)
✅ Status:   ACTIVE
📱 Phone:    +84901234566
```

**Quyền hạn:** Giám định container - 4 permissions
- Yêu cầu giám định (REQUEST_INSPECTION)
- Xem báo cáo giám định
- Xem listings

---

### 8. 👷 **DEPOT STAFF - Nhân viên kho**
```
📧 Email:    depot@example.com
🔑 Password: depot123
🎭 Role:     depot_staff (Level 20)
✅ Status:   ACTIVE
📱 Phone:    +84901234567
```

**Quyền hạn:** Nhân viên kho cơ bản - 4 permissions
- Xem tồn kho (DEPOT_VIEW_STOCK)
- Xem di chuyển (DEPOT_VIEW_MOVEMENTS)
- Xem listings

---

### 9. 🏪 **SELLER - Người bán container**
```
📧 Email:    seller@example.com
🔑 Password: seller123
🎭 Role:     seller (Level 10)
✅ Status:   ACTIVE
📱 Phone:    +84901234568
```

**Quyền hạn:** Người bán - 12 permissions
- Tạo/sửa/xóa tin đăng
- Xuất bản tin
- Phát hành báo giá
- Xem/quản lý đơn hàng
- Đánh giá sau giao dịch

---

### 10. 🛒 **BUYER - Người mua container**
```
📧 Email:    buyer@example.com
🔑 Password: buyer123
🎭 Role:     buyer (Level 10)
✅ Status:   ACTIVE
📱 Phone:    +84901234569
```

**Quyền hạn:** Người mua - 12 permissions
- Tìm kiếm, xem listings
- Tạo RFQ
- Yêu cầu giám định
- Tạo đơn hàng, thanh toán
- Yêu cầu vận chuyển
- Đánh giá, khiếu nại

---

## 🔑 HƯỚNG DẪN ĐĂNG NHẬP

### Bước 1: Truy cập trang đăng nhập
```
URL: http://localhost:3000/auth/login
hoặc: http://localhost:3000/vi/auth/login
```

### Bước 2: Nhập thông tin
- **Email:** Chọn một trong các email trên
- **Password:** Password tương ứng với role

### Bước 3: Kiểm tra sau khi đăng nhập
✅ Sidebar hiển thị đúng menu theo role  
✅ Badge hiển thị đúng tên role và màu sắc  
✅ Chỉ hiển thị các menu có quyền truy cập

---

## 🎨 MÀU SẮC BADGE THEO ROLE

| Role | Màu Badge | CSS Class |
|------|-----------|-----------|
| Admin | 🔴 Đỏ | bg-red-500 |
| Config Manager | 🟣 Tím | bg-purple-500 |
| Finance | 🔵 Xanh dương | bg-blue-500 |
| Price Manager | 🟦 Indigo | bg-indigo-500 |
| Customer Support | 🩷 Hồng | bg-pink-500 |
| Depot Manager | 🟡 Vàng | bg-yellow-500 |
| Inspector | 🔷 Teal | bg-teal-500 |
| Depot Staff | 🟢 Xanh lá | bg-green-500 |
| Seller | 🟠 Cam | bg-orange-500 |
| Buyer | 🔵 Cyan | bg-cyan-500 |

---

## 📊 THỐNG KÊ MENU THEO ROLE

### Admin (13 items)
- Dashboard
- Quản trị (10 subitems)
- Phân quyền RBAC (4 subitems)
- Container
- Đơn hàng
- Tài khoản

### Config Manager (4 items)
- Dashboard
- Cấu hình
- Mẫu thông báo
- Tài khoản

### Finance (5 items)
- Dashboard
- Đối soát
- Hóa đơn
- Thanh toán
- Tài khoản

### Price Manager (3 items)
- Dashboard
- Cấu hình
- Tài khoản

### Customer Support (4 items)
- Dashboard
- Tranh chấp
- Trợ giúp
- Tài khoản

### Depot Manager (7 items)
- Dashboard
- Kho bãi (5 subitems)
- Giám định
- Đơn hàng
- Vận chuyển
- Hóa đơn
- Đánh giá
- Tài khoản

### Inspector (4 items)
- Dashboard
- Giám định
- Lịch giám định
- Tài khoản

### Depot Staff (5 items)
- Dashboard
- Kho bãi (4 subitems)
- Giám định
- Sửa chữa
- Vận chuyển
- Tài khoản

### Seller (8 items)
- Dashboard
- Container
- Bán hàng (2 subitems)
- RFQ & Báo giá (3 subitems)
- Đơn hàng
- Vận chuyển
- Đánh giá
- Hóa đơn
- Tài khoản

### Buyer (10 items)
- Dashboard
- Container
- RFQ (2 subitems)
- Đơn hàng (3 subitems)
- Thanh toán (3 subitems)
- Giám định
- Vận chuyển
- Đánh giá
- Khiếu nại
- Tài khoản

---

## 🧪 CHECKLIST KIỂM TRA

Khi test từng role, kiểm tra các điểm sau:

### ✅ Login thành công
- [ ] Đăng nhập không có lỗi
- [ ] Token được lưu vào localStorage
- [ ] Redirect đúng sau login

### ✅ UI hiển thị đúng
- [ ] Sidebar hiển thị menu đúng role
- [ ] Badge role đúng màu và tên
- [ ] Avatar/tên user hiển thị
- [ ] Số lượng menu items đúng

### ✅ Phân quyền hoạt động
- [ ] Truy cập được routes có quyền
- [ ] Bị chặn routes không có quyền
- [ ] Middleware redirect đúng
- [ ] API calls có quyền thành công

### ✅ Navigation
- [ ] Click menu chuyển trang đúng
- [ ] Submenu expand/collapse
- [ ] Active state đúng
- [ ] Breadcrumb đúng

---

## 🔧 TROUBLESHOOTING

### Lỗi: Menu không hiển thị đúng
**Giải pháp:**
1. Clear localStorage
2. Logout và login lại
3. Kiểm tra console log xem role có đúng không

### Lỗi: 403 Forbidden khi truy cập
**Giải pháp:**
1. Kiểm tra token còn hạn không
2. Verify role có permission cho route đó
3. Xem middleware log

### Lỗi: Badge hiển thị sai màu
**Giải pháp:**
1. Check `getRoleBadgeColor()` trong sidebar
2. Verify role code đúng format
3. Clear cache và reload

---

## 📝 GHI CHÚ

- **User chưa có role:** `test@example.com` - cần gán role trước khi test
- **Mật khẩu mặc định:** Theo pattern `{role}123` (vd: admin123, buyer123)
- **Phone format:** +8490123456{0-9}
- **User ID format:** `user-{role_code}` (vd: user-admin, user-buyer)

---

## 🚀 NEXT STEPS

1. ✅ **Đã hoàn thành:**
   - Đồng bộ 10 roles với database
   - Cập nhật RBAC service (client + server)
   - Cập nhật navigation menu theo role
   - Cập nhật middleware permissions
   - Cập nhật badge colors và labels

2. 🔄 **Cần test:**
   - Login và kiểm tra UI với 10 roles
   - Verify permissions cho từng role
   - Test navigation và routing

3. 📋 **Có thể mở rộng:**
   - Thêm demo users cho mỗi role
   - Tạo organizations và depot cho testing
   - Seed sample data (containers, listings, orders)

---

**Tài liệu được tạo tự động bởi GitHub Copilot**  
**Dự án:** i-ContExchange - Container Trading Platform  
**Phiên bản:** 1.0.0
