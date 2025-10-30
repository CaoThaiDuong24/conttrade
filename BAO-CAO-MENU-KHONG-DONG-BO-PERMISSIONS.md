# 🔍 BÁO CÁO PHÂN TÍCH: VẤN ĐỀ MENU KHÔNG ĐỒNG BỘ VỚI PERMISSIONS

**Ngày**: 28/10/2025  
**Vấn đề**: Buyer và Seller có permissions giống nhau nhưng menu hiển thị khác nhau

---

## 📊 1. KẾT QUẢ KIỂM TRA DATABASE

### Permissions của Buyer và Seller:

```
BUYER (buyer): 35 permissions
SELLER (seller): 35 permissions

✅ Permissions giống nhau 100%: 35 permissions
🔵 Chỉ có BUYER: 0
🟠 Chỉ có SELLER: 0
```

**Danh sách 35 permissions giống nhau:**
- PM-001: VIEW_PUBLIC_LISTINGS
- PM-002: SEARCH_LISTINGS
- PM-003: VIEW_SELLER_PROFILE
- **PM-010: CREATE_LISTING** ✅
- PM-011: EDIT_LISTING
- PM-012: PUBLISH_LISTING
- PM-013: ARCHIVE_LISTING
- PM-014: DELETE_LISTING
- **PM-020: CREATE_RFQ** ✅
- PM-021: ISSUE_QUOTE
- PM-022: VIEW_QUOTES
- PM-023: MANAGE_QA
- PM-030: REQUEST_INSPECTION
- PM-040: CREATE_ORDER
- PM-041: PAY_ESCROW
- PM-042: REQUEST_DELIVERY
- PM-043: CONFIRM_RECEIPT
- PM-050: RATE_AND_REVIEW
- PM-060: FILE_DISPUTE
- PM-110 - PM-125: Config permissions (16 items)

**Kết luận Database**: ✅ PERMISSIONS HOÀN TOÀN GIỐNG NHAU

---

## 🎫 2. KẾT QUẢ KIỂM TRA JWT TOKEN

### Token Data:

**Buyer Token:**
```json
{
  "userId": "buyer-id",
  "email": "buyer@example.com",
  "roles": ["buyer"],
  "permissions": ["PM-001", "PM-002", ..., "PM-010", ..., "PM-125"]
}
```

**Seller Token:**
```json
{
  "userId": "seller-id",
  "email": "seller@example.com",
  "roles": ["seller"],
  "permissions": ["PM-001", "PM-002", ..., "PM-010", ..., "PM-125"]
}
```

**Kiểm tra PM-010 (CREATE_LISTING):**
- ✅ Buyer has PM-010: **YES**
- ✅ Seller has PM-010: **YES**

**Kết luận Token**: ✅ CẢ 2 ĐỀU CÓ PM-010 VÀ TẤT CẢ PERMISSIONS

---

## 🎨 3. PHÂN TÍCH CODE FRONTEND

### File: `frontend/components/layout/rbac-dashboard-sidebar.tsx`

#### 3.1. Cấu trúc Menu Hard-coded (Line 112-350):

```typescript
const NAVIGATION_MENU: Record<string, any[]> = {
  buyer: [
    { title: 'Dashboard', url: '/dashboard', icon: 'BarChart3' },
    { title: 'Container', url: '/listings', icon: 'Package' },
    { title: 'RFQ', url: '/rfq', icon: 'FileText', ... },
    { title: 'Đơn hàng', url: '/orders', icon: 'ShoppingCart', ... },
    { title: 'Thanh toán', url: '/payments/escrow', icon: 'DollarSign', ... },
    // ❌ KHÔNG CÓ MENU "Bán hàng" / "Đăng tin mới"
  ],
  
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
    // ✅ CÓ MENU "Bán hàng"
    { title: 'RFQ & Báo giá', url: '/rfq', icon: 'FileText', ... },
    { title: 'Đơn hàng', url: '/orders', icon: 'ShoppingCart' },
    { title: 'Vận chuyển', url: '/delivery', icon: 'Truck' },
    { title: 'Hóa đơn', url: '/billing', icon: 'Receipt' },
    // ✅ NHIỀU MENU HƠN BUYER
  ],
}
```

#### 3.2. Logic Xác định Menu (Line 430-480):

```typescript
// Bước 1: Lấy role có level cao nhất
const userLevel = Math.max(...userInfo.roles.map(role => ROLE_HIERARCHY[role] || 0));
const primaryRole = userInfo.roles.find(role => ROLE_HIERARCHY[role] === userLevel) || 'buyer';

// Bước 2: Lấy menu theo ROLE (không phải theo PERMISSION)
let baseMenu = NAVIGATION_MENU[primaryRole] || NAVIGATION_MENU.buyer;
//           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//           VẤN ĐỀ: Chọn menu theo ROLE, không theo PERMISSION

// Bước 3: Logic bổ sung (chỉ áp dụng cho 1 menu "Đăng tin mới")
const isSeller = userInfo.roles.includes('seller');
const hasCreateListingPermission = userPermissions.includes('PM-010');

if (isSeller || hasCreateListingPermission) {
  // Chỉ thêm menu "Đăng tin mới" nếu chưa có
  // ❌ KHÔNG XỬ LÝ CÁC MENU KHÁC
}
```

---

## 🔴 4. NGUYÊN NHÂN CỐT LÕI

### Vấn đề chính: **ROLE-BASED MENU thay vì PERMISSION-BASED MENU**

1. **Thiết kế hiện tại**: Menu được xác định bởi **ROLE**
   - Buyer → lấy `NAVIGATION_MENU.buyer` (ít menu)
   - Seller → lấy `NAVIGATION_MENU.seller` (nhiều menu)

2. **Logic bổ sung không đủ**: 
   - Chỉ xử lý 1 trường hợp: menu "Đăng tin mới" (PM-010)
   - Không xử lý các menu khác như:
     - "Hóa đơn" (PM-090)
     - "RFQ & Báo giá" cho seller
     - "Vận chuyển" 
     - etc.

3. **Mâu thuẫn giữa Permission và Menu**:
   - Database: Buyer có PM-010 ✅
   - Token: Buyer có PM-010 ✅
   - Menu: Buyer KHÔNG có menu "Đăng tin mới" ❌
   - Menu: Buyer THIẾU nhiều menu khác mà có permission ❌

---

## 💡 5. GIẢI PHÁP ĐỀ XUẤT

### Option 1: **Thay đổi sang PERMISSION-BASED MENU** (Khuyến nghị)

Thay vì chọn menu theo role, nên:

```typescript
// Tạo danh sách TẤT CẢ menu items có thể
const ALL_MENU_ITEMS = [
  { title: 'Dashboard', url: '/dashboard', icon: 'BarChart3', requiredPermission: 'PM-001' },
  { title: 'Container', url: '/listings', icon: 'Package', requiredPermission: 'PM-001' },
  { 
    title: 'Bán hàng', 
    url: '/sell/new', 
    icon: 'Store',
    requiredPermission: 'PM-010', // CREATE_LISTING
    subItems: [...]
  },
  { 
    title: 'RFQ', 
    url: '/rfq', 
    icon: 'FileText',
    requiredPermission: 'PM-020', // CREATE_RFQ
    subItems: [...]
  },
  // ... tất cả menu items
];

// Lọc menu dựa trên PERMISSIONS
const userMenu = ALL_MENU_ITEMS.filter(item => 
  !item.requiredPermission || 
  userPermissions.includes(item.requiredPermission)
);
```

**Ưu điểm**:
- ✅ Menu tự động đồng bộ với permissions
- ✅ Không cần hard-code từng role
- ✅ Dễ bảo trì và mở rộng
- ✅ Đúng với nguyên tắc RBAC

### Option 2: **Giữ ROLE-BASED nhưng đồng bộ permissions**

Nếu muốn giữ role-based menu, cần:
1. Review lại permissions của từng role
2. Đảm bảo buyer KHÔNG có các permissions của seller
3. Tách riêng permissions cho buyer và seller

**Ưu điểm**:
- ✅ Giữ nguyên cấu trúc code
- ❌ Khó bảo trì
- ❌ Không linh hoạt

### Option 3: **Hybrid - Kết hợp cả 2**

```typescript
// Lấy base menu theo role
let baseMenu = NAVIGATION_MENU[primaryRole];

// Thêm/bớt menu items dựa trên permissions
baseMenu = enrichMenuWithPermissions(baseMenu, userPermissions);
```

---

## 📋 6. KẾT LUẬN

### Hiện trạng:
- ✅ Database permissions: ĐỒNG BỘ (buyer = seller = 35 permissions)
- ✅ Token permissions: ĐỒNG BỘ 
- ❌ **Menu UI: KHÔNG ĐỒNG BỘ** (buyer < seller)

### Nguyên nhân:
- Menu được quyết định bởi **ROLE** (hard-coded) thay vì **PERMISSION** (dynamic)
- Logic bổ sung chỉ xử lý 1 trường hợp đặc biệt, không toàn diện

### Khuyến nghị:
1. **Ngắn hạn**: Review lại có nên cho buyer có đầy đủ permissions như seller không
2. **Dài hạn**: Chuyển sang **PERMISSION-BASED MENU** để tự động đồng bộ

---

**File liên quan:**
- `backend/compare-buyer-seller-permissions.mjs` (script so sánh)
- `backend/test-user-tokens.mjs` (script kiểm tra token)
- `frontend/components/layout/rbac-dashboard-sidebar.tsx` (component menu)
- Database: tables `roles`, `permissions`, `role_permissions`
