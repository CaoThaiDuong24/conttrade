# 📋 Hướng Dẫn Tài Khoản Demo

## 🎯 Tổng Quan

Hệ thống i-ContExchange hiện có **8 tài khoản demo** với các vai trò khác nhau để test chức năng và phân quyền.

**Tất cả tài khoản đều sử dụng mật khẩu:** `123456`

---

## 👥 Danh Sách Tài Khoản Demo

### 1. 👑 **Admin** - Quản Trị Hệ Thống
- **Email:** `admin@i-contexchange.vn`
- **Mật khẩu:** `123456`
- **Vai trò:** Admin
- **Quyền hạn:** Truy cập đầy đủ toàn bộ hệ thống
- **Trạng thái:** ✅ Active, Verified
- **Mô tả:** Tài khoản quản trị viên cấp cao nhất với quyền truy cập và quản lý toàn bộ hệ thống

---

### 2. 🛒 **Buyer** - Người Mua (Đã Xác Minh)
- **Email:** `buyer@example.com`
- **Mật khẩu:** `123456`
- **Vai trò:** Buyer
- **Quyền hạn:** Xem, tìm kiếm, mua container
- **Trạng thái:** ✅ Active, Verified, KYC Approved
- **Mô tả:** Người mua đã hoàn tất xác minh và có thể thực hiện các giao dịch mua

---

### 3. 🏪 **Seller** - Người Bán (Đã Xác Minh)
- **Email:** `seller@example.com`
- **Mật khẩu:** `123456`
- **Vai trò:** Seller
- **Quyền hạn:** Đăng tin, quản lý container, xem báo cáo
- **Trạng thái:** ✅ Active, Verified
- **Mô tả:** Người bán đã xác minh và có thể đăng tin bán container

---

### 4. 👷 **Depot Staff** - Nhân Viên Kho Bãi
- **Email:** `depot@example.com`
- **Mật khẩu:** `123456`
- **Vai trò:** Depot Staff
- **Quyền hạn:** Quản lý container trong kho, cập nhật trạng thái
- **Tổ chức:** ContainerHub Depot
- **Trạng thái:** ✅ Active, Verified
- **Mô tả:** Nhân viên kho bãi, có quyền quản lý container tại depot

---

### 5. 👔 **Depot Manager** - Quản Lý Kho Bãi
- **Email:** `manager@example.com`
- **Mật khẩu:** `123456`
- **Vai trò:** Depot Manager
- **Quyền hạn:** Quản lý toàn bộ kho, nhân viên, báo cáo
- **Tổ chức:** ContainerHub Depot
- **Trạng thái:** ✅ Active, Verified
- **Mô tả:** Quản lý kho bãi cấp cao, có quyền quản lý nhân viên và toàn bộ hoạt động depot

---

### 6. 🔍 **Inspector** - Giám Định Viên
- **Email:** `inspector@example.com`
- **Mật khẩu:** `123456`
- **Vai trò:** Inspector
- **Quyền hạn:** Giám định container, tạo báo cáo giám định
- **Tổ chức:** VN Inspection Services
- **Trạng thái:** ✅ Active, Verified
- **Mô tả:** Giám định viên chuyên nghiệp, có quyền tạo báo cáo giám định container

---

### 7. 🛒 **Buyer 2** - Người Mua (Chờ Xác Minh KYC)
- **Email:** `buyer2@example.com`
- **Mật khẩu:** `123456`
- **Vai trò:** Buyer
- **Quyền hạn:** Xem, tìm kiếm (không thể mua chưa)
- **Trạng thái:** ⏳ Active, Email Verified, KYC Pending
- **Mô tả:** Người mua mới đăng ký, đã xác minh email nhưng chưa hoàn tất KYC

---

### 8. 🏪 **Seller 2** - Người Bán (Chưa Xác Minh)
- **Email:** `seller2@example.com`
- **Mật khẩu:** `123456`
- **Vai trò:** Seller
- **Quyền hạn:** Giới hạn (chưa thể đăng tin)
- **Trạng thái:** ⚠️ Active, Unverified
- **Mô tả:** Người bán mới đăng ký, chưa xác minh email

---

## 🎨 Tính Năng Đăng Nhập Nhanh

Trang login đã được tích hợp **8 nút đăng nhập nhanh** với màu sắc và icon khác nhau:

### Mã màu theo vai trò:
- 👑 **Admin**: Đỏ (red-50)
- 🛒 **Buyer**: Xanh dương (blue-50)
- 🏪 **Seller**: Cam (orange-50)
- 👷 **Depot Staff**: Xanh lá nhạt (emerald-50)
- 👔 **Depot Manager**: Tím (purple-50)
- 🔍 **Inspector**: Xanh ngọc (cyan-50)
- 🛒 **Buyer 2**: Vàng (yellow-50) - Chờ KYC
- 🏪 **Seller 2**: Hồng (pink-50) - Chưa xác minh

### Cách sử dụng:
1. Mở trang login: `http://localhost:3000/auth/login`
2. Click vào button tài khoản demo bạn muốn test
3. Thông tin email và password sẽ tự động được điền
4. Click "Đăng nhập" để truy cập hệ thống

---

## 🔐 Quyền Hạn Chi Tiết Theo Vai Trò

### Admin (admin@i-contexchange.vn)
- ✅ Quản lý người dùng
- ✅ Quản lý vai trò và quyền
- ✅ Quản lý tổ chức
- ✅ Quản lý hệ thống
- ✅ Xem tất cả báo cáo
- ✅ Quản lý cấu hình
- ✅ Quản lý giá cả
- ✅ Quản lý tài chính
- ✅ Truy cập đầy đủ

### Buyer (buyer@example.com) - Đã xác minh
- ✅ Xem danh sách container
- ✅ Tìm kiếm container
- ✅ Xem chi tiết container
- ✅ Đặt hàng / Mua container
- ✅ Xem lịch sử đơn hàng
- ✅ Quản lý hồ sơ cá nhân
- ⏳ KYC: Approved

### Seller (seller@example.com) - Đã xác minh
- ✅ Đăng tin bán container
- ✅ Quản lý container của mình
- ✅ Xem báo cáo bán hàng
- ✅ Cập nhật thông tin container
- ✅ Xem lịch sử giao dịch
- ✅ Quản lý hồ sơ

### Depot Staff (depot@example.com)
- ✅ Quản lý container trong depot
- ✅ Cập nhật trạng thái container
- ✅ Xem danh sách container
- ✅ Tạo báo cáo depot
- 🏭 Thuộc: ContainerHub Depot

### Depot Manager (manager@example.com)
- ✅ Tất cả quyền của Depot Staff
- ✅ Quản lý nhân viên depot
- ✅ Xem báo cáo tổng hợp
- ✅ Phê duyệt giao dịch
- ✅ Quản lý tài chính depot
- 🏭 Thuộc: ContainerHub Depot

### Inspector (inspector@example.com)
- ✅ Xem danh sách container cần giám định
- ✅ Tạo báo cáo giám định
- ✅ Cập nhật trạng thái giám định
- ✅ Xem lịch sử giám định
- 🔍 Thuộc: VN Inspection Services

### Buyer 2 (buyer2@example.com) - Chờ KYC
- ✅ Xem danh sách container
- ✅ Tìm kiếm container
- ⏳ Không thể đặt hàng (chờ KYC)
- ⏳ KYC: Pending

### Seller 2 (seller2@example.com) - Chưa xác minh
- ⚠️ Không thể đăng tin
- ⚠️ Quyền hạn bị giới hạn
- ⚠️ Cần xác minh email

---

## 🧪 Kịch Bản Test Phân Quyền

### Test 1: Quyền Admin
1. Đăng nhập bằng `admin@i-contexchange.vn`
2. Kiểm tra menu có đầy đủ các mục:
   - Dashboard
   - Quản lý người dùng
   - Quản lý vai trò
   - Quản lý hệ thống
   - Báo cáo
   - Cấu hình

### Test 2: Quyền Buyer (Đã xác minh)
1. Đăng nhập bằng `buyer@example.com`
2. Kiểm tra menu:
   - ✅ Xem container
   - ✅ Tìm kiếm
   - ✅ Đơn hàng của tôi
   - ❌ Không có menu admin

### Test 3: Quyền Buyer (Chờ KYC)
1. Đăng nhập bằng `buyer2@example.com`
2. Kiểm tra:
   - ✅ Có thể xem container
   - ❌ Không thể đặt hàng
   - ⏳ Hiển thị thông báo "Chờ xác minh KYC"

### Test 4: Quyền Seller (Đã xác minh vs Chưa xác minh)
1. Đăng nhập `seller@example.com`:
   - ✅ Có thể đăng tin
2. Đăng nhập `seller2@example.com`:
   - ❌ Không thể đăng tin
   - ⚠️ Hiển thị "Cần xác minh email"

### Test 5: Quyền Depot Staff vs Depot Manager
1. Đăng nhập `depot@example.com`:
   - ✅ Quản lý container
   - ❌ Không thể quản lý nhân viên
2. Đăng nhập `manager@example.com`:
   - ✅ Quản lý container
   - ✅ Quản lý nhân viên
   - ✅ Xem báo cáo tổng hợp

### Test 6: Quyền Inspector
1. Đăng nhập `inspector@example.com`
2. Kiểm tra:
   - ✅ Xem danh sách container cần giám định
   - ✅ Tạo báo cáo giám định
   - ❌ Không thể mua/bán container

---

## 🔄 Cách Reset Dữ Liệu Demo

Nếu cần reset lại dữ liệu demo:

```powershell
# Di chuyển vào thư mục backend
cd backend

# Chạy script setup đơn giản
.\setup-rbac-simple.ps1

# Hoặc chạy thủ công
npx prisma db push --force-reset
npx tsx prisma/seed-rbac-complete.ts
```

---

## 📊 Thống Kê Hệ Thống RBAC

- **Tổng số quyền:** 53 permissions (PM-001 đến PM-125 với khoảng trống)
- **Tổng số vai trò:** 12 roles
- **Tổng số tài khoản demo:** 8 users
- **Tổng số tổ chức demo:** 3 organizations

### Danh sách vai trò đầy đủ:
1. `guest` - Khách
2. `user` - Người dùng cơ bản
3. `buyer` - Người mua
4. `seller` - Người bán
5. `depot_staff` - Nhân viên kho
6. `depot_manager` - Quản lý kho
7. `inspector` - Giám định viên
8. `moderator` - Kiểm duyệt viên
9. `price_manager` - Quản lý giá
10. `config_manager` - Quản lý cấu hình
11. `finance` - Quản lý tài chính
12. `admin` - Quản trị viên

---

## 📝 Ghi Chú Quan Trọng

### ⚠️ Lưu ý bảo mật:
- Mật khẩu `123456` chỉ dùng cho môi trường development
- **KHÔNG BAO GIỜ** sử dụng mật khẩu này trong production
- Trong production, cần:
  - Bắt buộc mật khẩu mạnh (8+ ký tự, chữ hoa, chữ thường, số, ký tự đặc biệt)
  - Bật xác thực 2 yếu tố (2FA)
  - Giới hạn số lần đăng nhập sai

### ✅ Dữ liệu đã seed:
- ✅ 53 permissions với mã PM-001 đến PM-125
- ✅ 12 roles với phân quyền chi tiết
- ✅ 8 demo users với vai trò khác nhau
- ✅ 3 organizations (ContainerHub Depot, VN Inspection, ABC Logistics)
- ✅ Role-Permission mappings
- ✅ User-Role assignments

### 🎯 Mục đích sử dụng:
- Kiểm tra phân quyền menu
- Test các luồng nghiệp vụ
- Demo cho khách hàng
- Training cho người dùng mới
- Development và debugging

---

## 🚀 Bước Tiếp Theo

1. ✅ **Đã hoàn thành:**
   - Database schema với RBAC đầy đủ
   - Seed data với 8 tài khoản demo
   - Login page với quick-login buttons

2. 🔄 **Cần thực hiện:**
   - Khởi động frontend: `npm run dev`
   - Test đăng nhập từng tài khoản
   - Kiểm tra menu hiển thị theo role
   - Test các chức năng theo phân quyền
   - Kiểm tra redirect logic

3. 📋 **Checklist test:**
   - [ ] Login thành công với 8 tài khoản
   - [ ] Menu hiển thị đúng theo role
   - [ ] Redirect đúng sau login
   - [ ] Permission check hoạt động
   - [ ] Buyer có thể xem/mua container
   - [ ] Seller có thể đăng tin
   - [ ] Admin có full access
   - [ ] Depot staff/manager quản lý được depot
   - [ ] Inspector tạo được báo cáo giám định

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề với tài khoản demo:
1. Kiểm tra backend đang chạy: `http://localhost:3001`
2. Kiểm tra database đã seed: chạy `npx prisma studio`
3. Reset dữ liệu nếu cần: chạy `setup-rbac-simple.ps1`
4. Kiểm tra log trong console

---

*Tài liệu được tạo tự động bởi GitHub Copilot*
*Cập nhật lần cuối: 2024*
