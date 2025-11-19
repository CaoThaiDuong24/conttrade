# ✅ FIX HOÀN TOÀN: RENTAL CONTAINERS SHOWING AS SOLD

## 🔍 VẤN ĐỀ PHÁT HIỆN

### Triệu chứng
Container của listing có `deal_type = 'RENTAL'` nhưng:
- ❌ Status hiển thị là **SOLD** thay vì RESERVED/RENTED
- ❌ Có `sold_to_order_id` thay vì `rented_to_order_id`
- ❌ Nằm trong relation `listing_containers_sold` thay vì `listing_containers_rented`
- ❌ Order có `deal_type = NULL` thay vì 'RENTAL'

### Dữ liệu bị lỗi
**Order:** `ORD-1763456513866-QBM9D` (ID: `3426ad0c-4035-4a0e-9e9a-8bda2e6dea97`)
- deal_type: NULL → **Phải là RENTAL**
- rental_duration_months: NULL → **Phải là 48 months**
- 3 containers trong sold relation → **Phải là rented relation**

**Containers bị lỗi:**
1. `VFCU9252050` - Status: SOLD, có sold_to_order_id
2. `YMMU6761344` - Status: SOLD, có sold_to_order_id
3. `FFAU1232981` - Status: SOLD, có sold_to_order_id

---

## 🔎 NGUYÊN NHÂN GỐC RỄ

### Code trong `quotes.ts` có lỗi
**File:** `backend/src/routes/quotes.ts`

Khi accept quote và tạo order, code **KHÔNG set** `deal_type` và `rental_duration_months` từ RFQ:

```typescript
// ❌ CODE CŨ (SAI):
const order = await tx.orders.create({
  data: {
    id: orderId,
    buyer_id: userId,
    seller_id: quote.seller_id,
    listing_id: quote.rfqs.listing_id,
    quote_id: id,
    status: 'PENDING_PAYMENT',
    order_number: orderNumber,
    subtotal: subtotalNum,
    tax,
    fees,
    total,
    currency: quote.currency,
    // ❌ THIẾU: deal_type và rental_duration_months
    updated_at: new Date(),
    order_items: { ... }
  }
});
```

Do đó:
1. Order được tạo với `deal_type = NULL`
2. Khi gọi `convertReservationToSold()`, code check `order.deal_type` → NULL → mặc định là 'SALE'
3. Containers bị set `sold_to_order_id` và status SOLD

---

## ✅ GIẢI PHÁP ĐÃ THỰC HIỆN

### 1. Fix Database (Đã hoàn thành ✅)

**Script:** `backend/fix-rental-containers-complete.mjs`

**Các bước:**
1. Tìm tất cả order có `deal_type = NULL` mà chứa containers từ listing RENTAL
2. Lấy `purpose` và `rental_duration_months` từ RFQ tương ứng
3. Update order:
   - Set `deal_type = 'RENTAL'`
   - Set `rental_duration_months` từ RFQ
4. Update containers:
   - Clear `sold_to_order_id` và `sold_at`
   - Set `rented_to_order_id`, `rented_at`, `rental_return_date`
   - Change status từ SOLD → RESERVED

**Kết quả:**
```
✅ Order ORD-1763456513866-QBM9D:
   Deal Type: RENTAL (đã fix)
   Rental Duration: 48 months (đã fix)
   Containers in SOLD relation: 0 ✅
   Containers in RENTED relation: 3 ✅
```

---

### 2. Fix Code (Đã hoàn thành ✅)

**File:** `backend/src/routes/quotes.ts`

**Thay đổi:**

```typescript
// ✅ CODE MỚI (ĐÚNG):
// Map RFQ purpose to deal_type
const rfqPurpose = quote.rfqs.purpose;
const rfqRentalDuration = quote.rfqs.rental_duration_months;
let orderDealType: 'SALE' | 'RENTAL' = 'SALE';

if (rfqPurpose === 'RENTAL') {
  orderDealType = 'RENTAL';
}

console.log('🔍 [Accept Quote] RFQ Purpose:', rfqPurpose);
console.log('🔍 [Accept Quote] Order Deal Type:', orderDealType);
console.log('🔍 [Accept Quote] Rental Duration:', rfqRentalDuration, 'months');

// Create order với deal_type và rental_duration_months
const order = await tx.orders.create({
  data: {
    id: orderId,
    buyer_id: userId,
    seller_id: quote.seller_id,
    listing_id: quote.rfqs.listing_id,
    quote_id: id,
    status: 'PENDING_PAYMENT',
    order_number: orderNumber,
    subtotal: subtotalNum,
    tax,
    fees,
    total,
    currency: quote.currency,
    deal_type: orderDealType, // ✅ THÊM: Set từ RFQ
    rental_duration_months: orderDealType === 'RENTAL' ? rfqRentalDuration : null, // ✅ THÊM
    updated_at: new Date(),
    order_items: { ... }
  }
});
```

**Lợi ích:**
- Order luôn có đúng `deal_type` từ lúc tạo
- `convertReservationToSold()` nhận đúng dealType
- Containers được set đúng relation (sold vs rented)
- Không còn lỗi này trong tương lai

---

## 🧪 VERIFICATION

### Script kiểm tra: `backend/check-rental-containers-issue.mjs`

Chạy để verify:
```bash
node check-rental-containers-issue.mjs
```

**Kết quả sau khi fix:**
```
✅ Tất cả 8 containers của listing RENTAL:
   - 2 AVAILABLE (chưa order)
   - 6 RESERVED với rented_to_order_id ✅
   - 0 containers có sold_to_order_id ✅
   - 0 containers status SOLD ✅

✅ Tất cả orders:
   - Có deal_type đúng
   - Rental orders có rental_duration_months
   - Containers trong đúng relation
```

---

## 📊 TỔNG KẾT

### ✅ Đã sửa
1. ✅ **Database:** 1 order và 3 containers đã được fix
2. ✅ **Code:** `quotes.ts` đã được cập nhật để set đúng deal_type
3. ✅ **Verification:** Tất cả kiểm tra đều pass

### 🎯 Flow đúng cho tương lai

1. User tạo RFQ với `purpose = 'RENTAL'` và `rental_duration_months = 48`
2. Seller tạo quote
3. Buyer accept quote
4. **Order được tạo với:**
   - ✅ `deal_type = 'RENTAL'` (từ RFQ)
   - ✅ `rental_duration_months = 48` (từ RFQ)
5. **`convertReservationToSold()` được gọi với:**
   - ✅ `dealType = 'RENTAL'`
   - ✅ `rentalDurationMonths = 48`
6. **Containers được update:**
   - ✅ `rented_to_order_id` = order.id
   - ✅ `rented_at` = now
   - ✅ `rental_return_date` = now + 48 months
   - ✅ `status` = 'RESERVED'
7. **Order hiển thị:**
   - ✅ Trong `listing_containers_rented` relation
   - ✅ Không trong `listing_containers_sold`

---

## 📝 FILES LIÊN QUAN

### Scripts đã tạo
- ✅ `backend/check-rental-containers-issue.mjs` - Kiểm tra vấn đề
- ✅ `backend/fix-rental-containers-complete.mjs` - Fix database

### Code đã sửa
- ✅ `backend/src/routes/quotes.ts` - Fix logic tạo order

### Code đã verify (không cần sửa)
- ✅ `backend/src/lib/rfq/rfq-reservation-service.ts` - Logic đúng, chỉ cần nhận đúng params

---

## 🚀 DEPLOYMENT CHECKLIST

- [x] Fix database cho production
- [x] Deploy code mới
- [x] Test flow tạo RFQ RENTAL mới
- [x] Verify containers được set đúng relation
- [x] Monitor logs để đảm bảo không có lỗi

---

**Ngày fix:** 18/11/2025  
**Status:** ✅ HOÀN TẤT 100%
