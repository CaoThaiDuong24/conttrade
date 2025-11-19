# 📋 DANH SÁCH TÀI KHOẢN DEMO - i-ContExchange

## 🎯 Tổng quan
Hệ thống có **10 tài khoản demo** với phân quyền RBAC (Role-Based Access Control) hoàn chỉnh, mỗi tài khoản đại diện cho một vai trò khác nhau trong hệ thống quản lý container.

## 🔑 Quy tắc mật khẩu
- **Pattern**: `[role]123`
- **Ví dụ**: 
  - admin@i-contexchange.vn → `admin123`
  - buyer@example.com → `buyer123`
  - seller@example.com → `seller123`

---

## 👥 DANH SÁCH TÀI KHOẢN

### 1. ⚡ Admin - Quản trị viên hệ thống
- **Email**: `admin@i-contexchange.vn`
- **Password**: `admin123`
- **Vai trò**: Quản trị viên
- **Quyền hạn**: 
  - Quản lý toàn bộ hệ thống
  - Phê duyệt tin đăng
  - Quản lý người dùng
  - Xem báo cáo tổng hợp
  - Cấu hình hệ thống

### 2. 🛒 Buyer - Người mua container
- **Email**: `buyer@example.com`
- **Password**: `buyer123`
- **Vai trò**: Người mua container
- **Quyền hạn**:
  - Xem danh sách container
  - Tạo RFQ (Request for Quote)
  - Đặt hàng container
  - Quản lý đơn hàng của mình
  - Nhắn tin với người bán

### 3. 🏪 Seller - Người bán container
- **Email**: `seller@example.com`
- **Password**: `seller123`
- **Vai trò**: Người bán container
- **Quyền hạn**:
  - Đăng tin bán container
  - Quản lý kho container
  - Trả lời RFQ từ buyer
  - Quản lý đơn hàng
  - Nhắn tin với buyer

### 4. 👨‍💼 Manager - Quản lý kho bãi
- **Email**: `manager@example.com`
- **Password**: `manager123`
- **Vai trò**: Quản lý kho bãi
- **Quyền hạn**:
  - Quản lý depot (kho bãi)
  - Xem báo cáo kho
  - Quản lý nhân viên kho
  - Kiểm tra tồn kho
  - Điều phối container

### 5. 🏭 Depot - Nhân viên kho
- **Email**: `depot@example.com`
- **Password**: `depot123`
- **Vai trò**: Nhân viên kho
- **Quyền hạn**:
  - Nhập/xuất container
  - Cập nhật vị trí container
  - Kiểm tra tình trạng container
  - Báo cáo hư hỏng
  - Quản lý gate in/out

### 6. 🔍 Inspector - Giám định viên
- **Email**: `inspector@example.com`
- **Password**: `inspector123`
- **Vai trò**: Giám định viên
- **Quyền hạn**:
  - Thực hiện inspection (giám định)
  - Tạo báo cáo giám định
  - Đánh giá chất lượng container
  - Upload ảnh inspection
  - Phê duyệt/từ chối container

### 7. 💰 Finance - Kế toán
- **Email**: `finance@example.com`
- **Password**: `finance123`
- **Vai trò**: Kế toán
- **Quyền hạn**:
  - Xem báo cáo tài chính
  - Quản lý thanh toán
  - Theo dõi công nợ
  - Xuất hóa đơn
  - Kiểm tra giao dịch

### 8. 🎧 Support - Hỗ trợ khách hàng
- **Email**: `support@example.com`
- **Password**: `support123`
- **Vai trò**: Hỗ trợ khách hàng
- **Quyền hạn**:
  - Trả lời câu hỏi khách hàng
  - Xử lý khiếu nại
  - Xem thông tin đơn hàng
  - Hỗ trợ kỹ thuật
  - Quản lý ticket

### 9. ⚙️ Config - Quản lý cấu hình
- **Email**: `config@example.com`
- **Password**: `config123`
- **Vai trò**: Quản lý cấu hình hệ thống
- **Quyền hạn**:
  - Cấu hình master data
  - Quản lý danh mục (categories)
  - Cấu hình giá
  - Thiết lập quy trình
  - Quản lý template

### 10. 💲 Price - Quản lý giá
- **Email**: `price@example.com`
- **Password**: `price123`
- **Vai trò**: Quản lý giá cả
- **Quyền hạn**:
  - Thiết lập bảng giá
  - Quản lý chương trình khuyến mãi
  - Phê duyệt giá đặc biệt
  - Theo dõi giá thị trường
  - Báo cáo giá

---

## 🚀 Cách sử dụng

### Đăng nhập nhanh trên UI
1. Truy cập trang Login: `/auth/login`
2. Click vào button tài khoản demo tương ứng
3. Thông tin email và password sẽ tự động điền
4. Click "Đăng nhập"

### Đăng nhập thủ công
1. Nhập email từ danh sách trên
2. Nhập password theo pattern: `[role]123`
3. Click "Đăng nhập"

---

## 📊 Phân quyền RBAC

### Cấu trúc phân quyền
```
roles (vai trò)
├── permissions (quyền)
└── user_roles (gán vai trò cho user)
```

### Các loại quyền chính
1. **Listings** - Quản lý tin đăng
2. **Orders** - Quản lý đơn hàng
3. **RFQ** - Quản lý báo giá
4. **Depots** - Quản lý kho bãi
5. **Users** - Quản lý người dùng
6. **Reports** - Xem báo cáo
7. **Master Data** - Quản lý dữ liệu chuẩn
8. **Inspections** - Quản lý giám định
9. **Finance** - Quản lý tài chính
10. **Config** - Quản lý cấu hình

---

## 🔧 Script hữu ích

### Kiểm tra tất cả tài khoản
```bash
cd backend
npx tsx list-all-demo-accounts.js
```

### Reset mật khẩu tất cả tài khoản
```bash
cd backend
npx tsx reset-all-passwords.js
```

### Kiểm tra quyền của user
```bash
cd backend
npx tsx check-user-permissions.js [email]
```

---

## 📝 Ghi chú

- Tất cả tài khoản đều có trạng thái `ACTIVE`
- KYC status được thiết lập theo vai trò
- Email đã được verified cho demo accounts
- Mật khẩu được hash bằng bcrypt với salt rounds = 12
- Session timeout: 24 giờ
- Refresh token: 7 ngày

---

## 🎨 UI/UX Features

### Trang Login
- ✅ 10 nút đăng nhập nhanh với màu sắc riêng biệt
- ✅ Auto-fill email và password khi click
- ✅ Thông báo toast hiển thị vai trò khi chọn
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Dark mode support
- ✅ Loading state khi đăng nhập

### Màu sắc theo vai trò
- 🔴 Admin - Red
- 🔵 Buyer - Blue
- 🟢 Seller - Green
- 🟣 Manager - Purple
- 🟡 Depot - Yellow
- 🔵 Inspector - Indigo
- 🟢 Finance - Emerald
- 🌸 Support - Pink
- 🔷 Config - Teal
- 🟠 Price - Orange

---

## 🔐 Bảo mật

### Production Checklist
- [ ] Đổi tất cả mật khẩu demo
- [ ] Xóa hoặc disable tài khoản demo không cần thiết
- [ ] Thiết lập 2FA cho admin accounts
- [ ] Giới hạn số lần đăng nhập sai
- [ ] Enable IP whitelisting cho admin
- [ ] Audit log cho tất cả hành động quan trọng
- [ ] Session management và force logout
- [ ] Password policy enforcement

---

## 📞 Hỗ trợ

Nếu có vấn đề với tài khoản demo, vui lòng:
1. Chạy script `list-all-demo-accounts.js` để kiểm tra
2. Chạy script `reset-all-passwords.js` để reset password
3. Kiểm tra logs trong `backend/logs/`
4. Liên hệ team developer

---

**Cập nhật lần cuối**: 2025-10-09
**Version**: 1.0.0
**Trạng thái**: ✅ Hoàn thành và tested
