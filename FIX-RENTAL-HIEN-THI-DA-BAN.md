# 🔧 FIX: Đơn Thuê Hiển Thị Sai "Đã Bán"

**Ngày fix:** 18/11/2025  
**Trạng thái:** ✅ **HOÀN THÀNH**

---

## 🐛 VẤN ĐỀ

Đơn hàng **RENTAL (Cho thuê)** đang hiển thị trạng thái **"Đã bán"** thay vì **"Đang cho thuê"**.

Thêm nữa, **thời gian trả container (rental_return_date) bị NULL** do order thiếu `rental_duration_months`.

### Screenshot Vấn Đề
- Badge hiển thị "✓ Đã bán (3)" cho đơn thuê
- Trạng thái container trong bảng hiển thị "Đã bán" thay vì "Đang cho thuê"
- Cột "Ngày trả" không có giá trị (NULL)

---

## 🔍 NGUYÊN NHÂN

### 1. **DATABASE: Sai Relation + Thiếu Rental Duration**
Containers của đơn RENTAL đang được lưu vào **`sold_to_order_id`** thay vì **`rented_to_order_id`**.

Thêm nữa, **Order thiếu `rental_duration_months`** nên không tính được `rental_return_date`:

```sql
-- SAI (Hiện tại)
orders:
  - rental_duration_months: NULL  ❌
  
listing_containers:
  - sold_to_order_id: <order_id>  ❌
  - rented_to_order_id: NULL
  - rental_return_date: NULL  ❌

-- ĐÚNG (Cần sửa)
orders:
  - rental_duration_months: 24  ✅ (lấy từ RFQ)

listing_containers:
  - sold_to_order_id: NULL
  - rented_to_order_id: <order_id>  ✅
  - rented_at: <timestamp>
  - rental_return_date: <calculated_date>  ✅ (created_at + rental_duration_months)
```

### 2. **BACKEND API: Query Đúng Nhưng Data Sai**
```typescript
// Backend query đúng 2 relations
listing_containers_sold: { ... }     // ❌ Đơn RENTAL containers lại ở đây
listing_containers_rented: { ... }   // ✅ Nên ở đây
```

### 3. **FRONTEND: Code Cứng Hiển Thị**
```tsx
// SAI: Code cứng hiển thị "Đã bán"
<Badge className="bg-blue-100 text-blue-700">
  ✓ Đã bán ({order.listing_containers_sold.length})
</Badge>

// SAI: Logic không check deal_type trước
{container.status === 'SOLD' ? '✓ Đã bán' : '...'}
```

---

## ✅ GIẢI PHÁP

### 1. **FIX DATABASE** (Migration Scripts)

#### A. Fix Deal Type & Container Relations

Chạy script migration để:
- Set `deal_type = 'RENTAL'` cho order
- Chuyển containers từ `sold_to_order_id` → `rented_to_order_id`

```bash
# Từ thư mục root của project
node backend/fix-order-deal-type.mjs
```

**Script này sẽ:**
- ✅ Set `deal_type = 'RENTAL'` cho orders có listing type RENTAL
- ✅ Chuyển containers từ `sold_to_order_id` → `rented_to_order_id`
- ✅ Set `rented_at` = thời gian tạo order
- ✅ Giữ `status = 'RESERVED'` (cho đến khi giao hàng)

#### B. Fix Rental Return Date

Chạy script để tính và set thời gian trả container:

```bash
node backend/fix-rental-return-date.mjs
```

**Script này sẽ:**
- ✅ Lấy `rental_duration_months` từ RFQ
- ✅ Update `orders.rental_duration_months`
- ✅ Tính `rental_return_date` = created_at + rental_duration_months
- ✅ Update tất cả containers với return date

### 2. **FIX FRONTEND** (UI Display)

**File:** `frontend/app/[locale]/orders/[id]/page.tsx`

#### A. Fix Badge Title (Line 766-772)
```tsx
// TRƯỚC
<Badge className="bg-blue-100 text-blue-700">
  {order.deal_type === 'RENTAL' ? '🔄 Đang cho thuê' : '✓ Đã bán'} (...)
</Badge>

// SAU
<Badge className={order.deal_type === 'RENTAL' 
  ? "bg-orange-100 text-orange-700"  // Màu cam cho thuê
  : "bg-blue-100 text-blue-700"       // Màu xanh cho bán
}>
  {order.deal_type === 'RENTAL' ? '🔄 Đang cho thuê' : '✓ Đã bán'} (...)
</Badge>
```

#### B. Fix Container Status Display (Line 813-838)
```tsx
// TRƯỚC: Chỉ check container.status
{container.status === 'SOLD' ? '✓ Đã bán' : '...'}

// SAU: Check deal_type TRƯỚC
{order.deal_type === 'RENTAL'
  ? container.status === 'RESERVED'
    ? '🔒 Đang chờ giao'
    : '🔄 Đang cho thuê'
  : container.status === 'SOLD' 
  ? '✓ Đã bán'
  : container.status === 'RESERVED'
  ? '🔒 Đã đặt trước'
  : '📋 Đã chọn'}
```

---

## 📊 KẾT QUẢ SAU KHI FIX

### ✅ Hiển Thị Đúng Cho Đơn RENTAL

```
┌─────────────────────────────────────────────────┐
│ 🔄 Đang cho thuê (3)                            │
│                                                  │
│ # │ Container ISO │ Status                      │
│───┼───────────────┼─────────────────────────────│
│ 1 │ MWTU1252271   │ 🔒 Đang chờ giao           │
│ 2 │ TGBU3729542   │ 🔒 Đang chờ giao           │
│ 3 │ 00LU6966982   │ 🔒 Đang chờ giao           │
└─────────────────────────────────────────────────┘
```

### ✅ Vẫn Đúng Cho Đơn SALE

```
┌─────────────────────────────────────────────────┐
│ ✓ Đã bán (3)                                    │
│                                                  │
│ # │ Container ISO │ Status                      │
│───┼───────────────┼─────────────────────────────│
│ 1 │ MWTU1252271   │ ✓ Đã bán                   │
│ 2 │ TGBU3729542   │ ✓ Đã bán                   │
│ 3 │ 00LU6966982   │ ✓ Đã bán                   │
└─────────────────────────────────────────────────┘
```

---

## 🧪 KIỂM TRA SAU KHI FIX

### 1. Database Check
```bash
node backend/check-order-deal-type.mjs
```

Kết quả mong đợi:
```
✅ All RENTAL orders have containers in rented_to_order_id
✅ All SALE orders have containers in sold_to_order_id
```

### 2. Frontend Check
1. Mở đơn hàng RENTAL
2. Kiểm tra:
   - ✅ Badge hiển thị "🔄 Đang cho thuê" (màu cam)
   - ✅ Trạng thái container: "🔒 Đang chờ giao" hoặc "🔄 Đang cho thuê"
   - ✅ KHÔNG hiển thị "Đã bán"

---

## 📁 FILES MODIFIED

### Database Migration Scripts
- ✅ `backend/fix-order-deal-type.mjs` - Fix deal_type và container relations
- ✅ `backend/fix-rental-return-date.mjs` - Fix rental return date
- ✅ `backend/quick-check-rental.mjs` - Quick check script
- ✅ `backend/check-rental-dates.mjs` - Verify rental dates

### Frontend Fix
- ✅ `frontend/app/[locale]/orders/[id]/page.tsx`
  - Line 766-772: Fix badge color và title
  - Line 813-838: Fix container status logic

---

## 🔄 LUỒNG XỬ LÝ ĐÃ FIX

### Khi Tạo Order RENTAL:
```typescript
// inventory-service.ts
if (dealType === 'RENTAL') {
  updateData.rented_to_order_id = orderId;  ✅
  updateData.rented_at = new Date();        ✅
  updateData.rental_return_date = ...;      ✅
  updateData.status = 'RESERVED';           ✅
} else {
  updateData.sold_to_order_id = orderId;    ✅
  updateData.sold_at = new Date();          ✅
  updateData.status = 'SOLD';               ✅
}
```

### Khi Backend Query:
```typescript
// orders.ts
include: {
  listing_containers_sold: { ... },    // SALE containers
  listing_containers_rented: { ... }   // RENTAL containers
}
```

### Khi Frontend Hiển Thị:
```tsx
// Check deal_type TRƯỚC khi hiển thị
{order.deal_type === 'RENTAL' 
  ? 'Đang cho thuê'   // ✅
  : 'Đã bán'}          // ✅
```

---

## 🎯 KẾT LUẬN

### Vấn đề gốc:
1. ❌ Order thiếu `deal_type` (NULL)
2. ❌ Order thiếu `rental_duration_months` (NULL)
3. ❌ Containers thuê lưu sai vào `sold_to_order_id`
4. ❌ Containers thiếu `rental_return_date` (NULL)
5. ❌ Frontend code cứng "Đã bán" không check `deal_type`

### Đã fix:
1. ✅ Set `deal_type = 'RENTAL'` cho order
2. ✅ Set `rental_duration_months` từ RFQ (24 tháng)
3. ✅ Chuyển containers về đúng relation (`rented_to_order_id`)
4. ✅ Tính và set `rental_return_date` (18/11/2027)
5. ✅ Frontend check `deal_type` trước khi hiển thị
6. ✅ Logic backend đã đúng, chỉ cần fix data cũ

### Lưu ý:
- ⚠️ Chạy migration scripts theo thứ tự:
  1. `fix-order-deal-type.mjs` (fix containers relations)
  2. `fix-rental-return-date.mjs` (fix return dates)
- ⚠️ Orders mới sẽ tự động đúng (backend logic đã fix)
- ⚠️ Có thể backup database trước khi chạy migration

---

## 📝 CHANGELOG

**18/11/2025:**
- ✅ Fix frontend UI display logic
- ✅ Fix order deal_type (NULL → RENTAL)
- ✅ Fix container relations (sold → rented)
- ✅ Fix rental_duration_months (NULL → 24 từ RFQ)
- ✅ Fix rental_return_date (NULL → 18/11/2027)
- ✅ Test và verify tất cả changes
- ✅ Document root cause and solution

