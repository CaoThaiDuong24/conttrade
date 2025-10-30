# 🔍 KIỂM TRA MENU VÀ PERMISSIONS CỦA SELLER

**Ngày:** 28/10/2025  
**Mục đích:** Đối chiếu permissions thực tế của seller với menu hiển thị trên UI

---

## 📋 SELLER PERMISSIONS (12 items)

Từ `backend/scripts/seed/seed-complete-rbac.mjs` (dòng 414):

```javascript
seller: [
  'PM-001',  // VIEW_PUBLIC_LISTINGS - Xem tin công khai
  'PM-002',  // SEARCH_LISTINGS - Tìm kiếm, lọc tin
  'PM-003',  // VIEW_SELLER_PROFILE - Xem hồ sơ người bán
  'PM-010',  // CREATE_LISTING - Tạo tin đăng ✅
  'PM-011',  // EDIT_LISTING - Sửa tin đăng ✅
  'PM-012',  // PUBLISH_LISTING - Gửi duyệt/Xuất bản tin ✅
  'PM-013',  // ARCHIVE_LISTING - Ẩn/Lưu trữ tin ✅
  'PM-014',  // DELETE_LISTING - Xóa tin đăng ✅
  'PM-021',  // ISSUE_QUOTE - Phát hành báo giá ✅
  'PM-022',  // VIEW_QUOTES - Xem/so sánh báo giá ✅
  'PM-040',  // CREATE_ORDER - Tạo đơn hàng ✅
  'PM-050'   // RATE_AND_REVIEW - Đánh giá sau giao dịch ✅
]
```

---

## 🎯 MENU HIỆN TẠI CỦA SELLER (UI)

Từ `frontend/components/layout/rbac-dashboard-sidebar.tsx` (dòng 181-223):

```typescript
seller: [
  1. 'Dashboard' (/dashboard) - Tổng quan
  2. 'Container' (/listings) - Xem listings (PM-001, PM-002)
  
  3. 'Bán hàng' - Group menu
     - 'Đăng tin mới' (/sell/new) - PM-010 ✅
     - 'Tin đăng của tôi' (/sell/my-listings) - PM-011, PM-012, PM-013, PM-014 ✅
  
  4. 'RFQ & Báo giá' - Group menu
     - 'RFQ nhận được' (/rfq/received) - PM-021 ✅
     - 'Tạo báo giá' (/quotes/create) - PM-021 ✅
     - 'Quản lý báo giá' (/quotes/management) - PM-022 ✅
  
  5. 'Đơn hàng' (/orders) - PM-040 ✅
  6. 'Vận chuyển' (/delivery) - Chức năng bổ sung
  7. 'Đánh giá' - Group menu
     - 'Tạo đánh giá' (/reviews/new) - PM-050 ✅
  
  8. 'Hóa đơn' (/billing) - Chức năng bổ sung
  9. 'Tài khoản' - Group menu
     - 'Hồ sơ' (/account/profile)
     - 'Cài đặt' (/account/settings)
]
```

**Tổng số menu items:** 9 main items + sub-items

---

## ✅ PHÂN TÍCH KẾT QUẢ

### Permissions được hiển thị đầy đủ:

| Permission Code | Tên | Menu tương ứng | Trạng thái |
|----------------|-----|----------------|-----------|
| PM-001 | VIEW_PUBLIC_LISTINGS | Container | ✅ Có |
| PM-002 | SEARCH_LISTINGS | Container | ✅ Có |
| PM-003 | VIEW_SELLER_PROFILE | Container | ✅ Có |
| PM-010 | CREATE_LISTING | Đăng tin mới | ✅ Có |
| PM-011 | EDIT_LISTING | Tin đăng của tôi | ✅ Có |
| PM-012 | PUBLISH_LISTING | Tin đăng của tôi | ✅ Có |
| PM-013 | ARCHIVE_LISTING | Tin đăng của tôi | ✅ Có |
| PM-014 | DELETE_LISTING | Tin đăng của tôi | ✅ Có |
| PM-021 | ISSUE_QUOTE | RFQ nhận được, Tạo báo giá | ✅ Có |
| PM-022 | VIEW_QUOTES | Quản lý báo giá | ✅ Có |
| PM-040 | CREATE_ORDER | Đơn hàng | ✅ Có |
| PM-050 | RATE_AND_REVIEW | Tạo đánh giá | ✅ Có |

---

## 🔍 PHÁT HIỆN

### ✅ ĐIỂM MẠNH:
1. **Tất cả 12 permissions đã được map đầy đủ vào menu UI**
2. Menu được tổ chức logic theo nhóm chức năng
3. Có thêm các menu bổ sung hữu ích:
   - **Vận chuyển** (/delivery) - Hỗ trợ theo dõi giao hàng
   - **Hóa đơn** (/billing) - Quản lý tài chính

### ⚠️ CẦN KIỂM TRA:

1. **Menu "Vận chuyển" (/delivery)**
   - Không có permission tương ứng rõ ràng
   - Cần xác nhận seller có được truy cập không?
   
2. **Menu "Hóa đơn" (/billing)**
   - Không có permission tương ứng (PM-091 là Finance)
   - Cần xác nhận seller có quyền xem billing không?

3. **Menu "Dashboard" (/dashboard)**
   - Không có permission Dashboard riêng cho seller
   - Nên kiểm tra dashboard có hiển thị đúng data cho seller không

---

## 🎯 KHUYẾN NGHỊ

### 1. Kiểm tra middleware routes:

Cần verify các route sau có được protect đúng permission không:

```typescript
✅ Đã kiểm tra:
- /sell/new → PM-010 (CREATE_LISTING)
- /rfq/received → PM-021 (ISSUE_QUOTE)
- /quotes/create → PM-021 (ISSUE_QUOTE)

⚠️ Cần kiểm tra:
- /delivery → Permission nào?
- /billing → Permission nào?
- /quotes/management → PM-022 (VIEW_QUOTES)
- /sell/my-listings → PM-011, PM-012, PM-013, PM-014
```

### 2. Bổ sung permissions (nếu cần):

Nếu seller cần truy cập `/delivery` và `/billing`, nên:
- Thêm permissions tương ứng vào database
- Assign cho seller role
- Update middleware

### 3. Tối ưu UI:

Menu đã đầy đủ, nhưng có thể cải thiện:
- Thêm badge số lượng (RFQ chưa đọc, Orders pending, etc.)
- Highlight menu đang active
- Group menu theo business flow

---

## 📊 KẾT LUẬN

**Trạng thái:** ✅ **MENU SELLER ĐÃ ĐẦY ĐỦ**

- **12/12 permissions** đã được map vào UI
- Menu được tổ chức hợp lý
- Có thêm 2 menu bổ sung (Delivery, Billing) cần verify permissions

**Hành động tiếp theo:**
1. ✅ Verify middleware routes cho /delivery và /billing
2. ✅ Test login seller và kiểm tra menu hiển thị
3. ✅ Kiểm tra dashboard seller có data đúng không

---

**Ngày hoàn thành:** 28/10/2025
