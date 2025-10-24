# BÁO CÁO KIỂM TRA VAI TRÒ BUYER

**Ngày:** 2 tháng 10, 2025  
**Tài khoản test:** buyer@example.com  
**Vai trò:** Buyer (Người mua)

---

## 1. PHÂN TÍCH PERMISSIONS CỦA BUYER

### Permissions hiện tại (từ middleware.ts):
```typescript
// Default buyer permissions
return [
  'dashboard.view',
  'account.read', 'account.write',
  'listings.read',              // ✅ Chỉ ĐỌC tin đăng
  'rfq.read', 'rfq.write',      // ✅ Tạo yêu cầu báo giá
  'orders.read', 'orders.write', // ✅ Quản lý đơn hàng
  'payments.view', 'payments.escrow', // ✅ Thanh toán
  'delivery.read',              // ✅ Xem giao hàng
  'inspection.schedule',        // ✅ Đặt lịch kiểm tra
  'reviews.read', 'reviews.write', // ✅ Viết đánh giá
  'disputes.read', 'disputes.write' // ✅ Khiếu nại
];
```

### ❌ KHÔNG CÓ:
- `listings.write` - Tạo/chỉnh sửa tin đăng

---

## 2. KẾT QUẢ KIỂM TRA TỪ TERMINAL LOG

### ✅ CÁC TRANG BUYER TRUY CẬP THÀNH CÔNG:

| Route | Permission Required | Kết quả | Ghi chú |
|-------|---------------------|---------|---------|
| `/dashboard` | `dashboard.view` | ✅ ACCESS GRANTED | Trang chủ |
| `/listings` | `listings.read` | ✅ ACCESS GRANTED | Duyệt tin đăng |
| `/orders` | `orders.read` | ✅ ACCESS GRANTED | Đơn hàng của tôi |
| `/orders/tracking` | `orders.read` | ✅ ACCESS GRANTED | Theo dõi đơn hàng |
| `/account/profile` | `account.read` | ✅ ACCESS GRANTED | Hồ sơ cá nhân |

### ❌ CÁC TRANG BUYER BỊ CHẶN (ĐÚNG THEO THIẾT KẾ):

| Route | Permission Required | Kết quả | Lý do |
|-------|---------------------|---------|--------|
| `/sell/new` | `listings.write` | ❌ PERMISSION DENIED | Buyer không có quyền đăng tin |
| `/admin/*` | `admin.*` | ❌ PERMISSION DENIED | Không phải admin |

---

## 3. PHÂN TÍCH NAVIGATION MENU

### Menu hiện có cho Buyer (từ NavigationService):

```typescript
// Main Menu
- Dashboard          (/dashboard)        ✅
- Container          (/listings)         ✅

// KHÔNG CÓ:
- Create Listing     (/listings/create)  ❌ (Chỉ cho seller)
- Admin Panel        (/admin)            ❌ (Chỉ cho admin)
```

### ⚠️ VẤN ĐỀ PHÁT HIỆN:

Từ terminal log, buyer đã cố truy cập `/vi/sell/new` và bị redirect về dashboard. 

**Nguyên nhân có thể:**
1. ✅ Có link/button "Đăng tin bán" ở đâu đó trên UI mà buyer nhìn thấy
2. ✅ Buyer tự gõ URL vào trình duyệt
3. ✅ Có menu cũ chưa được ẩn đi

---

## 4. HÀNH VI HIỆN TẠI

### Khi buyer click vào menu "Đăng tin":

```
User: buyer@example.com
Tries to access: /vi/sell/new
Permission required: listings.write

❌ PERMISSION DENIED: listings.write
→ Redirect to: /vi/dashboard
```

**Hành vi này là ĐÚNG** theo thiết kế RBAC. Buyer không có quyền đăng tin.

---

## 5. GIẢI PHÁP ĐỀ XUẤT

### Tùy chọn A: GIỮ NGUYÊN THIẾT KẾ (Khuyến nghị)

**Lý do:** Phân biệt rõ vai trò Buyer vs Seller
- ✅ Buyer: Chỉ mua hàng, tạo RFQ
- ✅ Seller: Đăng tin bán, quản lý listings

**Cần làm:**
1. ✅ Ẩn hoàn toàn button/link "Đăng tin bán" khỏi UI của buyer
2. ✅ Thêm message rõ ràng khi buyer cố truy cập seller features
3. ✅ Cung cấp link "Nâng cấp lên Seller" trong account settings

### Tùy chọn B: CHO PHÉP BUYER ĐĂNG TIN

**Kịch bản:** Người dùng vừa mua vừa bán (hybrid role)

**Thay đổi cần thiết:**

#### Bước 1: Thêm permissions vào buyer
```typescript
// middleware.ts - getUserPermissions()
// Default buyer permissions
return [
  'dashboard.view',
  'account.read', 'account.write',
  'listings.read',
  'listings.write',     // ← THÊM QUYỀN NÀY
  'rfq.read', 'rfq.write',
  'orders.read', 'orders.write',
  'payments.view', 'payments.escrow',
  'delivery.read',
  'inspection.schedule',
  'reviews.read', 'reviews.write',
  'disputes.read', 'disputes.write'
];
```

#### Bước 2: Thêm menu vào NavigationService
```typescript
// navigation-service.ts
if (userRoles.includes('buyer') || userRoles.includes('seller')) {
  items.push({
    title: 'Create Listing',
    url: '/listings/create',
    icon: 'Plus',
    permissions: ['PM-002'],
  });
}
```

---

## 6. KIỂM TRA THÊM

### Cần kiểm tra các trang sau để đảm bảo không có link "Đăng tin":

- ✅ `/dashboard` - Dashboard page
- ✅ `/listings` - Browse listings page
- ✅ `/account/profile` - Profile page
- ✅ AppHeader component
- ✅ DashboardLayout component

### Lệnh kiểm tra:

```bash
# Tìm tất cả các link đến /sell hoặc /listings/create
grep -r "href.*\/sell" --include="*.tsx" --include="*.ts" app/ components/

# Tìm button "Đăng tin" hoặc "Create Listing"
grep -ri "đăng tin\|create listing\|sell" --include="*.tsx" app/ components/
```

---

## 7. KẾT LUẬN

### ✅ HỆ THỐNG HOẠT ĐỘNG ĐÚNG:
- Middleware chặn buyer truy cập seller features
- Permissions được kiểm tra chính xác
- Redirect về dashboard là hành vi an toàn

### ⚠️ CẦN KIỂM TRA:
- Có menu/button nào buyer nhìn thấy mà không nên thấy không?
- Message khi bị chặn có rõ ràng không?
- Có cách nào để buyer nâng cấp lên seller không?

### 📋 HÀNH ĐỘNG TIẾP THEO:

**Nếu giữ nguyên thiết kế (Buyer ≠ Seller):**
1. Kiểm tra toàn bộ UI để ẩn menu "Đăng tin" khỏi buyer
2. Thêm notification khi buyer cố truy cập seller features
3. Thêm link "Become a Seller" trong account settings

**Nếu cho phép Buyer cũng đăng tin:**
1. Thêm `listings.write` vào buyer permissions
2. Update NavigationService để show menu
3. Test kỹ các trang seller với buyer account

---

## 8. CẤU HÌNH KHUYẾN NGHỊ

### Thiết kế vai trò tách biệt:

```
┌──────────────────────────────────────────────────┐
│ BUYER (Người mua)                                │
│ - Duyệt tin đăng (read)                          │
│ - Tạo RFQ (yêu cầu báo giá)                      │
│ - Mua hàng                                       │
│ - Theo dõi đơn hàng                              │
│ - Đánh giá                                       │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ SELLER (Người bán)                               │
│ - Tất cả quyền của Buyer                         │
│ - Đăng tin bán (write)                           │
│ - Quản lý tin đăng của mình                      │
│ - Nhận RFQ và báo giá                            │
└──────────────────────────────────────────────────┘
```

### Upgrade path:
```
Buyer → Request Seller Status → Admin Approve → Seller
```

---

**Tóm tắt:** Buyer role hoạt động CHÍNH XÁC theo thiết kế. Redirect về dashboard khi cố truy cập `/sell/new` là **ĐÚNG** vì buyer không có quyền `listings.write`. Nếu bạn muốn thay đổi thiết kế này, cần cập nhật permissions và navigation menu.
