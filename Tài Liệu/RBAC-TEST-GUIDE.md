# Hướng dẫn Test Hệ thống RBAC - i-ContExchange

## 🧪 Test Roles và Permissions

Tôi đã cập nhật hệ thống để hoạt động đúng theo tài liệu `i-ContExchange.Roles-Permissions.md`:

### 1. **Test với Role Admin:**

Để test với role admin, bạn có thể:

**Option 1: Sử dụng Role Test Panel (Recommended)**
- Mở sidebar
- Tìm hộp "🧪 Role Tester (Dev Only)" 
- Chọn "Quản trị hệ thống" từ dropdown
- Sidebar sẽ cập nhật ngay lập tức với menu admin

**Option 2: Đăng nhập với email admin**
- Sử dụng email có chứa "admin@" như: `admin@icontexchange.com`
- Email bắt đầu với "admin" như: `admin.test@example.com`
- Hệ thống sẽ tự động detect và gán role admin

### 2. **Test với các Role khác:**

| Role | Email Test | Menu sẽ hiển thị |
|------|------------|-----------------|
| Admin | `admin@icontexchange.com` | Quản trị hệ thống, Config Center |
| Config Manager | `config@company.com` | Cấu hình hệ thống |
| Finance | `finance@company.com` | Tài chính (Đối soát, Hóa đơn) |
| Price Manager | `price@company.com` | Quản lý giá (Pricing Rules) |
| Moderator | `mod@company.com` | Kiểm duyệt (Duyệt tin, Tranh chấp) |
| Depot Manager | `depot.manager@company.com` | Kho bãi (Full permissions) |
| Depot Staff | `depot@company.com` | Kho bãi (Limited permissions) |
| Org Owner | `owner@company.com` | Seller + Org Management |
| Customer Support | `support@company.com` | Hỗ trợ khách hàng |
| Seller | `seller@company.com` | Bán hàng, RFQ & Báo giá |
| Buyer | `buyer@company.com` hoặc bất kỳ email nào | Container, RFQ, Đơn hàng |

### 3. **Kiểm tra Navigation theo Roles:**

**Admin Menu sẽ bao gồm:**
- ✅ Dashboard
- ✅ Quản trị hệ thống → Dashboard KPI, Quản lý người dùng, Duyệt tin đăng, Xử lý tranh chấp, Cấu hình phí & gói, Pricing Rules
- ✅ Config Center → Namespace, Entry Config, Feature Flags, Templates, v.v.
- ✅ Container công khai
- ✅ Tất cả đơn hàng

**Seller Menu sẽ bao gồm:**
- ✅ Container
- ✅ Bán hàng → Đăng tin mới, Tin đăng của tôi, Nháp, Thống kê
- ✅ RFQ & Báo giá → RFQ nhận được, Tạo báo giá, Quản lý báo giá
- ✅ Đơn hàng, Vận chuyển, Đánh giá, Hóa đơn

**Buyer Menu sẽ bao gồm:**
- ✅ Container → Tất cả container, Tìm kiếm, Hồ sơ người bán, Đã lưu, Đã xem
- ✅ RFQ & Báo giá → Tạo RFQ mới, RFQ đã gửi, Báo giá nhận, So sánh báo giá
- ✅ Đơn hàng → Tạo đơn hàng, Tất cả đơn hàng, Theo dõi, Xác nhận nhận hàng, Lịch sử
- ✅ Thanh toán → Ví escrow, Lịch sử thanh toán, Phương thức
- ✅ Giám định → Yêu cầu giám định, Báo cáo giám định, Lịch sử
- ✅ Vận chuyển, Đánh giá, Khiếu nại

### 4. **Permissions theo tài liệu:**

| Role | Permissions (theo RP-SPEC-v1.0) |
|------|----------------------------------|
| RL-ANON (guest) | PM-001, PM-002 |
| RL-BUYER | PM-001, PM-002, PM-003, PM-020, PM-022, PM-030, PM-031, PM-040, PM-041, PM-042, PM-043, PM-050, PM-060 |
| RL-SELLER | PM-001, PM-002, PM-003, PM-010, PM-011, PM-012, PM-013, PM-014, PM-021, PM-031 |
| RL-ORG-OWNER | SELLER + PM-071 (limited org scope) |
| RL-DEPOT-STAFF | PM-080, PM-081, PM-082, PM-083, PM-084 |
| RL-DEPOT-MANAGER | DEPOT-STAFF + PM-085, PM-086 |
| RL-MOD | PM-070, PM-061, PM-072 |
| RL-ADMIN | PM-070..PM-073, PM-071, PM-061, PM-072 + full system access |
| RL-PRICE | PM-074, PM-072 |
| RL-CONFIG | PM-110..PM-125, PM-072 |
| RL-FIN | PM-090, PM-091, PM-072 |
| RL-CS | PM-100, PM-072 |

### 5. **Cách test nhanh:**

```bash
# 1. Mở browser và vào http://localhost:3002/vi/dashboard
# 2. Mở sidebar → tìm "🧪 Role Tester (Dev Only)"
# 3. Chọn role "Quản trị hệ thống" 
# 4. Kiểm tra menu sidebar đã thay đổi
# 5. Click vào các menu items để test routing
```

### 6. **Debugging:**

Mở Console (F12) để xem logs:
```
🔍 User roles: ['admin']
🔍 User permissions: ['PM-070', 'PM-071', ...]
🚪 Navigation groups: [...]
```

Hệ thống đã được cập nhật hoàn toàn theo tài liệu! 🎉