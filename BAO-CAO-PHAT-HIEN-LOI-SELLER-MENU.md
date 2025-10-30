# 🚨 VẤN ĐỀ PHÁT HIỆN: SELLER MENU PERMISSIONS

**Ngày:** 28/10/2025  
**Mức độ:** 🔴 **CRITICAL** - Menu hiển thị nhưng không có quyền truy cập

---

## ❌ VẤN ĐỀ

Seller menu có 2 items **KHÔNG CÓ PERMISSION** tương ứng:

### 1. Menu "Vận chuyển" (/delivery)
- **Middleware yêu cầu:** PM-042 (REQUEST_DELIVERY)
- **Seller có:** ❌ **KHÔNG**
- **Buyer có:** ✅ CÓ
- **Kết quả:** Seller click menu sẽ bị **redirect hoặc 403**

### 2. Menu "Hóa đơn" (/billing)  
- **Middleware yêu cầu:** PM-090 (FINANCE_RECONCILE)
- **Seller có:** ❌ **KHÔNG**
- **Finance role có:** ✅ CÓ
- **Kết quả:** Seller click menu sẽ bị **redirect hoặc 403**

---

## 📊 PHÂN TÍCH NGHIỆP VỤ

### Câu hỏi 1: Seller có nên truy cập /delivery không?

**YẾU TỐ CÂN NHẮC:**

✅ **NÊN CÓ:**
- Seller cần theo dõi giao hàng cho đơn của mình
- Seller cần cập nhật trạng thái vận chuyển
- Seller có thể phối hợp với logistics

❌ **KHÔNG NÊN:**
- REQUEST_DELIVERY (PM-042) là quyền "yêu cầu vận chuyển" - thường là buyer
- Seller có thể chỉ cần VIEW delivery, không cần REQUEST

**KHUYẾN NGHỊ:**
- ✅ Tạo permission mới: **PM-042B: VIEW_DELIVERY** (Xem thông tin vận chuyển)
- ✅ Assign cho seller
- Hoặc: Xóa menu "Vận chuyển" khỏi seller sidebar

---

### Câu hỏi 2: Seller có nên truy cập /billing không?

**YẾU TỐ CÂN NHẮC:**

✅ **NÊN CÓ:**
- Seller cần xem hóa đơn bán hàng
- Seller cần track doanh thu
- Seller cần xuất hóa đơn cho buyer

❌ **KHÔNG NÊN:**
- PM-090 (FINANCE_RECONCILE) là quyền đối soát/giải ngân - chỉ Finance
- PM-091 (FINANCE_INVOICE) là xuất hóa đơn - cũng cho Finance

**KHUYẾN NGHỊ:**
- ✅ Tạo permission mới: **PM-091B: VIEW_SELLER_INVOICES** (Xem hóa đơn seller)
- ✅ Assign cho seller
- Hoặc: Đổi tên menu thành "Doanh thu" và tạo page riêng

---

## 🎯 GIẢI PHÁP ĐỀ XUẤT

### Option 1: BỔ SUNG PERMISSIONS (Khuyến nghị ⭐)

```javascript
// Thêm vào seed-complete-rbac.mjs

// Delivery permissions
{ code: 'PM-042B', name: 'VIEW_DELIVERY', description: 'Xem thông tin vận chuyển', module: 'delivery', action: 'view' },

// Billing permissions  
{ code: 'PM-091B', name: 'VIEW_SELLER_INVOICES', description: 'Xem hóa đơn/doanh thu seller', module: 'billing', action: 'view' },

// Update seller permissions
seller: [
  'PM-001', 'PM-002', 'PM-003',
  'PM-010', 'PM-011', 'PM-012', 'PM-013', 'PM-014',
  'PM-021', 'PM-022',
  'PM-040', 'PM-042B', // + VIEW_DELIVERY
  'PM-050', 'PM-091B'  // + VIEW_SELLER_INVOICES
]
```

**Ưu điểm:**
- ✅ Seller có thể truy cập đầy đủ menu
- ✅ Phân quyền rõ ràng theo nghiệp vụ
- ✅ Không phá vỡ logic hiện tại

**Nhược điểm:**
- ⚠️ Cần update database và reseed
- ⚠️ Cần update middleware routes

---

### Option 2: XÓA MENU KHÔNG CẦN THIẾT

```typescript
// frontend/components/layout/rbac-dashboard-sidebar.tsx

seller: [
  { title: 'Dashboard', url: '/dashboard', icon: 'BarChart3' },
  { title: 'Container', url: '/listings', icon: 'Package' },
  { 
    title: 'Bán hàng', 
    url: '/sell/new', 
    icon: 'Store',
    subItems: [
      { title: 'Đăng tin mới', url: '/sell/new', icon: 'Plus' },
      { title: 'Tin đăng của tôi', url: '/sell/my-listings', icon: 'List' },
    ]
  },
  { 
    title: 'RFQ & Báo giá', 
    url: '/rfq', 
    icon: 'FileText',
    subItems: [
      { title: 'RFQ nhận được', url: '/rfq/received', icon: 'Inbox' },
      { title: 'Tạo báo giá', url: '/quotes/create', icon: 'Plus' },
      { title: 'Quản lý báo giá', url: '/quotes/management', icon: 'List' },
    ]
  },
  { title: 'Đơn hàng', url: '/orders', icon: 'ShoppingCart' },
  // ❌ XÓA: { title: 'Vận chuyển', url: '/delivery', icon: 'Truck' },
  { 
    title: 'Đánh giá', 
    url: '/reviews', 
    icon: 'Star',
    subItems: [
      { title: 'Tạo đánh giá', url: '/reviews/new', icon: 'Plus' },
    ]
  },
  // ❌ XÓA: { title: 'Hóa đơn', url: '/billing', icon: 'Receipt' },
  { 
    title: 'Tài khoản', 
    url: '/account/profile', 
    icon: 'User',
    subItems: [
      { title: 'Hồ sơ', url: '/account/profile', icon: 'User' },
      { title: 'Cài đặt', url: '/account/settings', icon: 'Settings' },
    ]
  },
]
```

**Ưu điểm:**
- ✅ Fix nhanh, không cần update database
- ✅ Không có menu "dối" người dùng

**Nhược điểm:**
- ❌ Seller mất 2 chức năng hữu ích
- ❌ Không phù hợp nghiệp vụ

---

### Option 3: SỬA MIDDLEWARE (Tạm thời)

```typescript
// middleware.ts

// Cho phép seller truy cập /delivery và /billing mà không check permission
const SELLER_ALLOWED_ROUTES = ['/delivery', '/billing'];

if (userRoles.includes('seller') && SELLER_ALLOWED_ROUTES.includes(pathname)) {
  return NextResponse.next();
}
```

**Ưu điểm:**
- ✅ Fix nhanh

**Nhược điểm:**
- ❌ Bypass security
- ❌ Không đúng RBAC design pattern
- ❌ Không khuyến nghị

---

## ✅ QUYẾT ĐỊNH

**CHỌN OPTION 1** - Bổ sung permissions

**Lý do:**
1. ✅ Đúng nghiệp vụ - Seller cần xem delivery và billing
2. ✅ Đúng RBAC pattern
3. ✅ Scalable cho tương lai
4. ✅ Security tốt hơn

**Hành động:**
1. Tạo 2 permissions mới: PM-042B, PM-091B
2. Update seed script
3. Reseed database
4. Update middleware routes
5. Test seller menu

---

**Ngày:** 28/10/2025
