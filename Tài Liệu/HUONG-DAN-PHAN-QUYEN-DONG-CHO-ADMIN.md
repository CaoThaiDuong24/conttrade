# 📚 HƯỚNG DẪN PHÂN QUYỀN ĐỘNG CHO ADMIN

**Ngày cập nhật:** 24/01/2025  
**Phiên bản:** 2.0  
**Đối tượng:** Admin, Config Manager

---

## 🎯 TỔNG QUAN

Hệ thống **Phân quyền Động** cho phép Admin **quản lý toàn bộ permissions** qua giao diện UI mà **KHÔNG CẦN SỬA CODE**.

### ✅ Tính năng chính:

1. **Hiển thị đầy đủ 53 permissions** với thông tin chi tiết:
   - Code (PM-001, PM-002,...)
   - Tên permission (tiếng Việt)
   - Mô tả chi tiết (hover để xem đầy đủ)
   - Module/Category (Listing, Order, Payment,...)

2. **Ma trận phân quyền trực quan:**
   - Permissions × Roles trong một bảng duy nhất
   - Checkbox để bật/tắt permission cho từng role
   - Lọc theo module, tìm kiếm permission

3. **Thay đổi real-time:**
   - Admin thay đổi → Lưu ngay
   - Users đang online → Tự động logout trong 60s
   - Token mới → Có permissions mới

---

## 📋 DANH SÁCH 53 PERMISSIONS ĐẦY ĐỦ

### 📦 **Listing Module (14 permissions)**

| Code | Tên | Mô tả |
|------|-----|-------|
| PM-010 | Xem Danh sách Listing | Xem tất cả container listings có sẵn |
| PM-011 | Xem Chi tiết Listing | Xem thông tin chi tiết của một listing |
| PM-012 | Tạo Listing | Đăng container để bán |
| PM-013 | Chỉnh sửa Listing (Của mình) | Sửa thông tin listing do mình tạo |
| PM-014 | Xóa Listing (Của mình) | Xóa listing do mình tạo |
| PM-015 | Duyệt/Từ chối Listing | Admin duyệt hoặc từ chối listing |
| PM-016 | Xem Listing Đã duyệt | Xem các listing đã được duyệt |
| PM-017 | Xem Listing Chờ duyệt | Xem các listing đang chờ duyệt |
| PM-018 | Xuất bản Listing | Chuyển trạng thái listing thành công khai |
| PM-019 | Ẩn/Gỡ Listing | Ẩn listing khỏi danh sách công khai |
| PM-020 | Quản lý Media Listing | Upload/xóa hình ảnh cho listing |
| PM-021 | Bulk Edit Listings | Chỉnh sửa nhiều listing cùng lúc |
| PM-022 | Xuất dữ liệu Listing | Export danh sách listing ra Excel/CSV |
| PM-023 | Đánh dấu Listing yêu thích | Lưu listing vào danh sách yêu thích |

### 📝 **RFQ Module (7 permissions)**

| Code | Tên | Mô tả |
|------|-----|-------|
| PM-030 | Tạo RFQ | Tạo Request for Quotation mới |
| PM-031 | Xem RFQ của mình | Xem các RFQ do mình tạo |
| PM-032 | Xem Tất cả RFQ | Xem tất cả RFQ trong hệ thống (Admin) |
| PM-033 | Chỉnh sửa RFQ | Sửa thông tin RFQ |
| PM-034 | Hủy RFQ | Hủy RFQ đã gửi |
| PM-035 | Xem RFQ Responses | Xem các báo giá phản hồi RFQ |
| PM-036 | Chọn Quote từ RFQ | Chấp nhận một quote từ RFQ |

### 💰 **Quote Module (6 permissions)**

| Code | Tên | Mô tả |
|------|-----|-------|
| PM-040 | Gửi Quote | Gửi báo giá cho buyer |
| PM-041 | Xem Quote của mình | Xem các quote do mình gửi |
| PM-042 | Xem Tất cả Quote | Xem tất cả quote (Admin) |
| PM-043 | Chỉnh sửa Quote | Sửa thông tin quote |
| PM-044 | Thu hồi Quote | Rút lại quote đã gửi |
| PM-045 | So sánh Quotes | So sánh nhiều quote cùng lúc |

### 🛒 **Order Module (9 permissions)**

| Code | Tên | Mô tả |
|------|-----|-------|
| PM-050 | Tạo Order | Tạo đơn hàng mới |
| PM-051 | Xem Order của mình | Xem các order liên quan đến mình |
| PM-052 | Xem Tất cả Order | Xem tất cả order (Admin) |
| PM-053 | Cập nhật Order Status | Thay đổi trạng thái đơn hàng |
| PM-054 | Hủy Order | Hủy đơn hàng |
| PM-055 | Xuất Hóa đơn | Tạo và xuất hóa đơn |
| PM-056 | Theo dõi Vận chuyển | Xem thông tin vận chuyển real-time |
| PM-057 | Xác nhận Nhận hàng | Xác nhận đã nhận container |
| PM-058 | Yêu cầu Hoàn tiền | Gửi yêu cầu hoàn lại tiền |

### 💳 **Payment Module (5 permissions)**

| Code | Tên | Mô tả |
|------|-----|-------|
| PM-060 | Thanh toán | Thực hiện thanh toán đơn hàng |
| PM-061 | Xem Lịch sử Thanh toán | Xem các giao dịch đã thực hiện |
| PM-062 | Xác nhận Thanh toán | Admin xác nhận đã nhận tiền |
| PM-063 | Hoàn tiền | Xử lý hoàn tiền cho buyer |
| PM-064 | Quản lý Ví | Xem và quản lý số dư ví |

### 🚚 **Delivery Module (4 permissions)**

| Code | Tên | Mô tả |
|------|-----|-------|
| PM-070 | Tạo Lịch Vận chuyển | Lên lịch giao/nhận container |
| PM-071 | Cập nhật Trạng thái Vận chuyển | Cập nhật tiến độ vận chuyển |
| PM-072 | Xem Thông tin Vận chuyển | Xem chi tiết lộ trình |
| PM-073 | Xác nhận Giao hàng | Xác nhận đã giao container |

### 🔍 **Inspection Module (4 permissions)**

| Code | Tên | Mô tả |
|------|-----|-------|
| PM-080 | Yêu cầu Giám định | Gửi yêu cầu inspection |
| PM-081 | Thực hiện Giám định | Inspector thực hiện kiểm tra |
| PM-082 | Xem Báo cáo Giám định | Xem kết quả inspection |
| PM-083 | Phê duyệt Báo cáo | Admin duyệt báo cáo giám định |

### ⚠️ **Dispute Module (3 permissions)**

| Code | Tên | Mô tả |
|------|-----|-------|
| PM-090 | Tạo Khiếu nại | Gửi khiếu nại |
| PM-091 | Xử lý Khiếu nại | Admin xử lý tranh chấp |
| PM-092 | Đóng Khiếu nại | Kết thúc dispute |

### 💬 **Message Module (2 permissions)**

| Code | Tên | Mô tả |
|------|-----|-------|
| PM-100 | Gửi Tin nhắn | Chat với người dùng khác |
| PM-101 | Xem Lịch sử Chat | Xem tin nhắn đã gửi/nhận |

### ⭐ **Review Module (2 permissions)**

| Code | Tên | Mô tả |
|------|-----|-------|
| PM-110 | Viết Đánh giá | Đánh giá người bán/mua |
| PM-111 | Xóa Đánh giá Vi phạm | Admin xóa review không phù hợp |

### ⚙️ **Admin/Config Module (6 permissions)**

| Code | Tên | Mô tả |
|------|-----|-------|
| PM-120 | Quản lý Người dùng | CRUD users, khóa tài khoản |
| PM-121 | Quản lý Roles | Tạo/sửa/xóa roles |
| PM-122 | Quản lý Permissions | Thêm permissions mới |
| PM-123 | Xem Dashboard Admin | Truy cập trang quản trị |
| PM-124 | Cấu hình Hệ thống | Sửa settings, master data |
| PM-125 | Xem Báo cáo & Thống kê | Xem analytics, reports |

---

## 🖥️ HƯỚNG DẪN SỬ DỤNG GIAO DIỆN

### **Bước 1: Truy cập Ma trận Phân quyền**

1. Login với tài khoản Admin: `admin@i-contexchange.vn` / `admin123`
2. Vào menu: **Admin** → **RBAC** → **Permission Matrix**
3. URL: `http://localhost:3000/vi/admin/rbac/matrix`

### **Bước 2: Hiểu giao diện Ma trận**

```
┌─────────────────────────────────────────────────────────────┐
│  Permission Matrix - Ma Trận Phân Quyền                     │
├─────────────────────────────────────────────────────────────┤
│  [🔍 Tìm kiếm permission...]  [📂 Lọc theo module ▼]       │
├───────────────┬─────────┬────────┬────────┬───────┬────────┤
│ Permission    │ Module  │ Admin  │ Seller │ Buyer │ ...    │
│ Code • Name   │         │        │        │       │        │
├───────────────┼─────────┼────────┼────────┼───────┼────────┤
│ PM-010 ℹ️     │ Listing │  ☑️    │  ☑️    │  ☑️   │        │
│ Xem Listings  │         │        │        │       │        │
│ Xem tất cả... │         │        │        │       │        │
├───────────────┼─────────┼────────┼────────┼───────┼────────┤
│ PM-012 ℹ️     │ Listing │  ☑️    │  ☑️    │  ☐    │        │
│ Tạo Listing   │         │        │        │       │        │
│ Đăng cont...  │         │        │        │       │        │
└───────────────┴─────────┴────────┴────────┴───────┴────────┘
```

**Giải thích:**
- **Cột Permission:** Code + Tên + Mô tả ngắn (hover icon ℹ️ để xem đầy đủ)
- **Cột Module:** Phân loại permission (Listing, Order, Payment,...)
- **Cột Roles:** Mỗi role một cột, checkbox bật/tắt permission
- **☑️ = Có quyền** | **☐ = Không có quyền**
- **Admin:** Luôn có ALL permissions (disabled, không sửa được)

### **Bước 3: Thay đổi Permissions**

#### **Ví dụ 1: Cho Buyer quyền tạo Listing**

1. Tìm permission `PM-012` (Tạo Listing)
2. Nhìn cột `Buyer`
3. Click checkbox để **bật** ☑️
4. Thông báo: **"1 thay đổi chưa lưu"** hiện lên
5. Click nút **"Lưu Thay Đổi"** ở góc trên

#### **Ví dụ 2: Thu hồi quyền "Hủy Order" của Seller**

1. Tìm kiếm: `PM-054` hoặc gõ "Hủy Order"
2. Nhìn cột `Seller`
3. Click checkbox để **tắt** ☐
4. Click **"Lưu Thay Đổi"**

#### **Ví dụ 3: Lọc và cấp toàn bộ quyền Payment cho Finance**

1. Chọn filter: **"Payment"** trong dropdown Module
2. Hệ thống hiển thị 5 permissions: PM-060 → PM-064
3. Click tất cả checkboxes trong cột `Finance`
4. Click **"Lưu Thay Đổi"**

### **Bước 4: Xác nhận Thay đổi**

Sau khi click "Lưu":
- ✅ Hệ thống cập nhật database
- ✅ `role_version` tự động tăng (vd: 1 → 2)
- ✅ Users đang online với role đó sẽ nhận thông báo logout sau **60 giây**
- ✅ Login lại → Có permissions mới

---

## 🔍 TÍNH NĂNG NÂNG CAO

### **1. Tìm kiếm Permission**

**Tìm theo Code:**
```
Gõ: PM-050
→ Hiển thị: "PM-050 | Tạo Order"
```

**Tìm theo Tên:**
```
Gõ: thanh toán
→ Hiển thị tất cả permissions có "thanh toán" trong tên
```

### **2. Lọc theo Module**

Click dropdown **"Lọc theo module"** → Chọn:
- **Listing** → Hiển thị 14 permissions
- **Order** → Hiển thị 9 permissions
- **Payment** → Hiển thị 5 permissions
- **Tất cả modules** → Hiển thị 53 permissions

### **3. Xem Mô tả Đầy đủ**

- **Cách 1:** Hover icon ℹ️ bên cạnh code → Tooltip hiện mô tả chi tiết
- **Cách 2:** Đọc text nhỏ màu xám dưới tên permission

### **4. Thống kê Realtime**

Ở cuối trang, xem:
- **Tổng Roles:** 10
- **Tổng Permissions:** 53
- **Đang hiển thị:** Số permissions sau khi filter
- **Chưa lưu:** Số thay đổi đang pending

---

## ⚡ CÁCH HOẠT ĐỘNG TỰ ĐỘNG

### **Khi Admin thay đổi permission:**

```
1. Admin bật PM-050 (Tạo Order) cho Buyer
   ↓
2. Click "Lưu Thay Đổi"
   ↓
3. Backend API: /api/v1/admin/rbac/role-permissions/assign
   ↓
4. Database cập nhật bảng role_permissions
   ↓
5. Trigger tự động tăng buyer.role_version: 1 → 2
   ↓
6. Users đang online (role=buyer) có token với version=1
   ↓
7. Sau 60s, client auto-check: GET /api/v1/auth/check-version
   ↓
8. API response: { requireReauth: true, changedRoles: ["buyer"] }
   ↓
9. Client tự động:
      - Alert("Quyền hạn đã được cập nhật")
      - localStorage.clear()
      - Redirect to /login
      - Reload page
   ↓
10. User login lại → Token mới với version=2 và permissions mới
```

**Không cần sửa code!** Tất cả tự động.

---

## 📊 KịCH BẢN THỰC TẾ

### **Kịch bản 1: Thêm quyền "Xuất báo cáo" cho Finance**

**Hiện tại:** Finance chỉ có 6 permissions về thanh toán  
**Yêu cầu:** Cho thêm quyền xem báo cáo (PM-125)

**Các bước:**
1. Admin vào Permission Matrix
2. Tìm `PM-125 | Xem Báo cáo & Thống kê`
3. Click checkbox cột `Finance` → ☑️
4. Lưu thay đổi
5. User "finance@example.com" đang online → Logout sau 60s
6. Login lại → Vào được menu "Reports" ✅

### **Kịch bản 2: Thu hồi quyền "Xóa Listing" của tất cả Sellers**

**Lý do:** Phát hiện sellers xóa listing sau khi đã có buyer quan tâm

**Các bước:**
1. Admin vào Permission Matrix
2. Tìm `PM-014 | Xóa Listing (Của mình)`
3. Xem cột `Seller` → Đang ☑️
4. Click để tắt → ☐
5. Lưu
6. Tất cả sellers đang online → Logout trong 60s
7. Login lại → Nút "Xóa Listing" biến mất (disabled) ✅

### **Kịch bản 3: Tạo role mới "Accountant" với permissions tùy chỉnh**

**Yêu cầu:** Role kế toán chỉ xem order và payment, không sửa/xóa

**Các bước:**
1. Admin vào **Admin → RBAC → Roles**
2. Click "Tạo Role Mới"
3. Điền:
   - Code: `accountant`
   - Tên: `Kế toán`
   - Level: `65`
4. Lưu → Role mới xuất hiện
5. Vào **Permission Matrix**
6. Cột `Accountant` mới xuất hiện
7. Bật các permissions:
   - ☑️ PM-051 (Xem Order của mình)
   - ☑️ PM-061 (Xem Lịch sử Thanh toán)
   - ☑️ PM-125 (Xem Báo cáo)
8. Lưu
9. Gán role cho user: **Admin → RBAC → Users** → Assign `accountant` role

---

## 🛡️ BẢO MẬT & KIỂM SOÁT

### **1. Admin luôn có ALL permissions**
- Checkbox cột Admin **disabled** (màu xám)
- Không thể tắt bất kỳ permission nào
- Đảm bảo admin luôn có quyền quản trị

### **2. System Roles không xóa được**
- Các role có flag `is_system_role = true`:
  - admin
  - buyer
  - seller
  - depot_manager
  - inspector
- Chỉ được **sửa permissions**, không xóa role

### **3. Không xóa role đang có users**
- Nếu role có 5 users → Hiển thị lỗi:
  ```
  "Không thể xóa role đang có 5 người dùng"
  ```
- Phải remove users khỏi role trước khi xóa

### **4. Real-time Permission Enforcement**
- Mọi API request đều **validate permissions từ database**
- Token cũ → API trả về `403 PERMISSION_VERSION_MISMATCH`
- Users không thể bypass bằng cách giữ token cũ

---

## 📱 RESPONSIVE & UX

### **Desktop (> 1024px):**
- Hiển thị đầy đủ tất cả cột roles
- Sticky header và cột Permission
- Scroll ngang cho nhiều roles

### **Tablet (768px - 1024px):**
- Scroll ngang để xem thêm roles
- Permission column sticky (luôn hiện khi scroll)

### **Mobile (< 768px):**
- Chuyển sang view dạng list/accordion
- Mỗi permission → Dropdown chọn roles

---

## 🎓 CÂU HỎI THƯỜNG GẶP (FAQ)

### **Q1: Thay đổi permission có ảnh hưởng ngay lập tức không?**
**A:** Có, nhưng users đang online sẽ bị logout sau **60 giây**. Sau khi login lại, permissions mới có hiệu lực ngay.

### **Q2: Có thể tạo permissions mới từ UI không?**
**A:** Có, vào **Admin → RBAC → Permissions** → Click "Tạo Permission Mới" → Điền code, tên, mô tả, module → Lưu.

### **Q3: Làm sao biết permission nào quan trọng?**
**A:** Hover icon ℹ️ để đọc mô tả chi tiết. Permissions có code `PM-120` trở lên thường là admin-only.

### **Q4: Có thể bulk assign permissions không?**
**A:** Có, sử dụng filter theo module → Chọn tất cả checkboxes trong một cột → Lưu.

### **Q5: Nếu vô tình tắt permission quan trọng thì sao?**
**A:** Admin (role level 100) luôn có ALL permissions, không thể tắt. Dùng admin để sửa lại.

### **Q6: Có log lịch sử thay đổi permissions không?**
**A:** Hiện tại chưa có UI, nhưng database lưu `role_version` và `updated_at`. Sẽ có tính năng Audit Log trong version sau.

---

## 🚀 BEST PRACTICES

### **1. Nguyên tắc Least Privilege**
- Chỉ cấp permissions **tối thiểu** cần thiết
- Ví dụ: Seller chỉ cần "Xem Order của mình", không cần "Xem tất cả Order"

### **2. Nhóm Permissions theo Module**
- Sử dụng filter Module để quản lý dễ dàng
- Cấp/thu hồi theo từng nhóm logic

### **3. Test trước khi Apply**
- Tạo tài khoản test với role đó
- Thử các chức năng xem có hoạt động không
- Sau đó mới apply cho toàn bộ users

### **4. Thông báo Users trước khi thay đổi lớn**
- Nếu thu hồi permission quan trọng
- Gửi notification hoặc email thông báo trước

### **5. Backup định kỳ**
- Export danh sách permissions và role assignments
- Lưu lại trước khi thay đổi lớn

---

## 📞 HỖ TRỢ

- **Email:** admin@i-contexchange.vn
- **Docs:** `/docs/rbac-management.md`
- **Video hướng dẫn:** [Link coming soon]

---

**Kết luận:** Hệ thống Phân quyền Động giúp Admin **quản lý 100% permissions qua UI** mà không cần lập trình viên. Mọi thay đổi **tự động enforce** trong 60 giây. 🎉
