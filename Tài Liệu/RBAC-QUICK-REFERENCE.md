# 🎯 RBAC QUICK REFERENCE CARD

## 🚀 TRUY CẬP NHANH

### URLs chính:
```
📋 Quản lý Roles:      http://localhost:3000/vi/admin/rbac/roles
🔑 Chỉnh sửa Quyền:    http://localhost:3000/vi/admin/rbac/roles/[id]
🔲 Ma trận Phân quyền: http://localhost:3000/vi/admin/rbac/matrix
```

### Login Admin:
```
Email:    admin@i-contexchange.vn
Password: admin123
```

---

## 📊 THÔNG TIN QUẢN LÝ

### Menu hiện tại quản lý:

| Thông tin | Mô tả | Hiển thị |
|-----------|-------|----------|
| **Icon** | Icon đại diện role | Emoji theo role code |
| **Mã Role** | Unique identifier | Font mono, bold |
| **Tên Role** | Tên hiển thị | Badge màu theo level |
| **Mô tả** | Chi tiết vai trò | Text mờ, truncate |
| **Level** | Cấp độ quyền hạn (0-100) | Badge màu gradient |
| **Permissions** | Số quyền đã gán | Badge với icon Key |
| **Users** | Số người dùng | Badge outline với icon Users |
| **Demo Account** | Email + Password test | Click để copy |
| **Loại** | System/Custom | Badge "System" nếu có |

---

## 🎨 MÀU SẮC THEO LEVEL

| Level | Màu | Role điển hình |
|-------|-----|----------------|
| 100 | 🔴 Red | Admin |
| 80-99 | 🟣 Purple | Config Manager |
| 70-79 | 🔵 Blue | Finance |
| 60-69 | 🟦 Indigo | Price Manager |
| 50-59 | 🌸 Pink | Customer Support |
| 30-49 | 🟡 Yellow/Teal | Depot Manager/Inspector |
| 20-29 | 🟢 Green | Depot Staff |
| 10-19 | 🟠 Orange/Cyan | Seller/Buyer |

---

## 👥 10 ROLES TRONG HỆ THỐNG

| # | Code | Tên | Level | Icon |
|---|------|-----|-------|------|
| 1 | admin | Quản trị viên | 100 | 👑 |
| 2 | config_manager | Quản lý cấu hình | 80 | ⚙️ |
| 3 | finance | Kế toán | 70 | 💰 |
| 4 | price_manager | Quản lý giá | 60 | 💲 |
| 5 | customer_support | Hỗ trợ KH | 50 | 🎧 |
| 6 | depot_manager | Quản lý kho | 30 | 🏭 |
| 7 | inspector | Giám định viên | 25 | 🔍 |
| 8 | depot_staff | Nhân viên kho | 20 | 👷 |
| 9 | seller | Người bán | 10 | 🏪 |
| 10 | buyer | Người mua | 10 | 🛒 |

---

## 🔑 53 PERMISSIONS THEO 10 CATEGORIES

### 1. **admin** (8 permissions)
- admin.access, admin.users, admin.roles, admin.permissions
- admin.settings, admin.logs, admin.reports, admin.analytics

### 2. **listings** (6 permissions)
- listings.view, listings.create, listings.edit, listings.delete
- listings.approve, listings.reject

### 3. **containers** (5 permissions)
- containers.view, containers.create, containers.edit
- containers.delete, containers.manage

### 4. **rfq** (5 permissions)
- rfq.view, rfq.create, rfq.edit, rfq.delete, rfq.respond

### 5. **quotes** (5 permissions)
- quotes.view, quotes.create, quotes.edit
- quotes.delete, quotes.approve

### 6. **orders** (6 permissions)
- orders.view, orders.create, orders.edit, orders.delete
- orders.approve, orders.cancel

### 7. **deliveries** (5 permissions)
- deliveries.view, deliveries.create, deliveries.edit
- deliveries.delete, deliveries.track

### 8. **depots** (5 permissions)
- depots.view, depots.create, depots.edit
- depots.delete, depots.manage

### 9. **pricing** (4 permissions)
- pricing.view, pricing.edit, pricing.approve, pricing.history

### 10. **payments** (4 permissions)
- payments.view, payments.process
- payments.refund, payments.reconcile

**TỔNG: 53 permissions**

---

## ✨ CHỨC NĂNG CHÍNH

### 📋 Trang Quản lý Roles

#### Xem danh sách:
- ✅ 10 roles hiển thị dạng table
- ✅ Sort theo level (cao xuống thấp)
- ✅ Badge màu sắc theo level
- ✅ Icon đại diện từng role
- ✅ Demo account click-to-copy

#### Tạo role mới:
1. Click nút "Tạo Role Mới"
2. Nhập: Code, Tên, Mô tả, Level
3. Click "Tạo Role"
4. Toast notification thành công

#### Chỉnh sửa role:
1. Click icon Edit (✏️)
2. Sửa: Tên, Mô tả, Level (không sửa được Code)
3. Click "Cập nhật"
4. ⚠️ Không sửa được System Roles

#### Xóa role:
1. Click icon Delete (🗑️)
2. Confirm dialog
3. Click "Xóa Role"
4. ⚠️ Không xóa được:
   - System Roles
   - Roles đang có users

### 🔑 Trang Chỉnh sửa Permissions

#### Quản lý quyền hạn:
1. Click "Permissions" ở role muốn sửa
2. Xem 53 permissions group theo 10 categories
3. Search: Gõ tên hoặc code
4. Filter: Chọn category cụ thể
5. Chọn permissions:
   - Click vào card
   - Click checkbox
   - Click category header (chọn toàn bộ)
6. Click "Lưu thay đổi"

#### Bulk actions:
- **Chọn tất cả**: Tick 53/53 permissions
- **Bỏ chọn tất cả**: Untick toàn bộ
- **Chọn category**: Tick header của accordion

#### Visual feedback:
- 🟢 Card có border xanh = đã chọn
- 🔴 Card border xám = chưa chọn
- 🟡 Badge "Có thay đổi chưa lưu"
- 💾 Floating save button ở góc phải

### 🔲 Trang Ma trận Phân quyền

#### Xem tổng quan:
- Table: Permissions (rows) × Roles (columns)
- ✓ màu xanh = Có quyền
- ✗ màu đỏ = Không có quyền
- Group theo category với accordion
- Sticky headers khi scroll

#### Search & Filter:
- Tìm permission theo tên/code
- Filter theo category
- Kết quả real-time

#### Thống kê:
- Tổng roles: 10
- Tổng permissions: 53
- Tổng categories: 10
- Tổng cặp role-permission: 200+

---

## 🔒 BẢO MẬT REAL-TIME

### Cơ chế tự động:

```
KỊCH BẢN: Admin sửa permissions của role "Finance"

1️⃣ Admin vào trang chỉnh sửa permissions
2️⃣ Thêm/bớt permissions cho role Finance
3️⃣ Click "Lưu thay đổi"

⚡ HỆ THỐNG TỰ ĐỘNG:
├── Backend: Update role_permissions table
├── Backend: Tăng version của role Finance
├── Backend: Gửi signal đến auth service
└── Auth Service: Đánh dấu tokens của Finance users

⏱️ TRONG 60 GIÂY:
├── User A (Finance role): Auto logout
├── User B (Finance role): Auto logout
└── User C (Admin role): Không bị ảnh hưởng

🔄 SAU KHI LOGOUT:
├── Users phải login lại
├── Token mới có version mới
└── Permissions mới được áp dụng
```

### Lưu ý:
- ⚠️ Không ảnh hưởng đến users của roles khác
- ⚠️ Admin role không bị logout
- ⚠️ Chỉ users ĐANG ONLINE bị ảnh hưởng
- ⚠️ Token cũ sẽ invalid ngay lập tức

---

## 🧪 TESTING NHANH

### Test backend API:
```bash
cd backend
node scripts/test-rbac-api.mjs
```

### Test frontend:
1. Login: admin@i-contexchange.vn / admin123
2. Vào: http://localhost:3000/vi/admin/rbac/roles
3. Kiểm tra:
   - ✅ 10 roles hiển thị
   - ✅ Demo accounts copy được
   - ✅ Tạo role mới thành công
   - ✅ Chỉnh sửa permissions OK
   - ✅ Ma trận phân quyền đúng

### Debug:
```javascript
// Bấm F12 mở Console
// Sẽ thấy logs:
🔑 Token: eyJhbGciOiJIUzI1NiIsInR...
📡 Sending request to: http://localhost:3006/api/v1/admin/rbac/roles
📡 Response status: 200 OK
📋 Roles Data: {success: true, data: Array(10)}
📋 Success: true
📋 Data array: (10) [{…}, {…}, …]
📋 Data length: 10
✅ Setting 10 roles to state
```

---

## 🆘 TROUBLESHOOTING

### Không thấy dữ liệu?
1. F12 → Console → Xem logs
2. Check token: `localStorage.getItem('accessToken')`
3. Response 401? → Login lại
4. Response 500? → Check backend logs

### Backend crash?
```bash
# Check port
netstat -ano | findstr ":3006"

# Restart
cd backend
npm run build
npm start
```

### Prisma errors?
```bash
cd backend
npx prisma generate
npx prisma db push
```

---

## 📞 SUPPORT

### Tài liệu đầy đủ:
```
Tài Liệu/BAO-CAO-RBAC-HOAN-THANH.md
```

### File quan trọng:
```
Backend API:
├── backend/src/routes/admin/rbac.ts

Frontend Pages:
├── app/[locale]/admin/rbac/roles/page.tsx
├── app/[locale]/admin/rbac/roles/[id]/page.tsx
└── app/[locale]/admin/rbac/matrix/page.tsx

Database:
└── prisma/schema.prisma
```

---

**Cập nhật lần cuối: 25/10/2025**
**Version: 1.0.0**
**Status: ✅ Production Ready**
