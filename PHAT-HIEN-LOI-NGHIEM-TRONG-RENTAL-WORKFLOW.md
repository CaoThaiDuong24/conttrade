# 🚨 PHÁT HIỆN LỖI NGHIÊM TRỌNG: RENTAL WORKFLOW

**Ngày phát hiện:** 14/11/2025  
**Mức độ nghiêm trọng:** 🔴 CRITICAL  
**Tác động:** Mâu thuẫn giữa số tiền thanh toán và thời hạn hợp đồng

---

## 📝 TÓM TẮT VẤN ĐỀ

### Lỗi: **Mất mát thông tin `rental_duration_months` khi tạo Order**

**Luồng hiện tại (CÓ LỖI):**
```
1. Buyer thêm vào Cart với rental_duration_months = 6 ✅
2. Cart tính tổng tiền = price × quantity × 6 ✅
3. Checkout tạo Order với total = giá 6 tháng ✅
4. Order được tạo NHƯNG KHÔNG LƯU rental_duration_months ❌
5. Payment verification trigger RentalContractService ✅
6. Service lấy duration từ listing.min_rental_duration = 1 ❌
7. Contract được tạo với thời hạn 1 tháng ❌
```

**Hậu quả:**
- 💰 Buyer đã trả tiền cho 6 tháng
- 📄 Nhưng contract chỉ ghi 1 tháng
- ⚖️ Mâu thuẫn pháp lý và tài chính nghiêm trọng!

---

## 🔍 PHÂN TÍCH CHI TIẾT

### 1. Cart System (✅ Hoạt động đúng)

**File:** `backend/src/routes/cart.ts`

**Code thêm vào cart:**
```typescript
// Line 176-185: Validate rental duration
if (effectiveDealType === 'RENTAL') {
  const months = Number(rental_duration_months ?? 0);
  
  if (!months || months < 1) {
    return reply.code(400).send({ 
      success: false, 
      error: 'Please enter valid rental duration (>= 1 month)' 
    });
  }
}

// Line 263-265: Lưu vào cart_items
const effectiveRentalMonths = effectiveDealType === 'RENTAL' 
  ? Number(rental_duration_months || 0) 
  : 0;
```

**Database schema - cart_items:**
```prisma
model cart_items {
  // ...
  deal_type              String    // 'SALE' | 'RENTAL'
  rental_duration_months Int       @default(0)  // ✅ Có cột này
  // ...
}
```

✅ **Kết luận:** Cart lưu đúng thông tin

---

### 2. Checkout System (⚠️ Tính giá đúng nhưng không lưu duration)

**File:** `backend/src/routes/cart.ts`

**Code checkout:**
```typescript
// Line 677-686: Tính subtotal ĐÚNG
for (const [sellerId, items] of Object.entries(itemsBySeller)) {
  const subtotal = items.reduce((sum, item) => {
    const unitPrice = parseFloat(item.price_snapshot.toString());
    const months = item.deal_type === 'RENTAL' 
      ? (item.rental_duration_months || 1)  // ✅ Lấy từ cart_items
      : 1;
    return sum + (unitPrice * item.quantity * months);  // ✅ Tính đúng
  }, 0);
  
  // Line 704: Tạo order
  const order = await tx.orders.create({
    data: {
      buyer_id: userId,
      seller_id: sellerId,
      status: 'PENDING_PAYMENT',
      subtotal: subtotal,      // ✅ Tổng tiền đúng
      total: total,
      currency: items[0].currency,
      // ❌ THIẾU: rental_duration_months (vì orders table không có cột này)
    }
  });
  
  // Line 715-728: Tạo order_items
  for (const item of items) {
    const months = item.deal_type === 'RENTAL' 
      ? (item.rental_duration_months || 1) 
      : 1;
    const totalPrice = unitPrice * item.quantity * months;
    
    await tx.order_items.create({
      data: {
        order_id: order.id,
        item_type: 'CONTAINER',
        ref_id: item.listing_id,
        description: `${item.listing.title} - ${item.deal_type === 'RENTAL' ? `${item.rental_duration_months} tháng` : 'Mua'}`,
        // ✅ Duration được lưu vào description (dạng text)
        // ❌ NHƯNG KHÔNG CÓ CỘT rental_duration_months
        qty: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice  // ✅ Giá đúng
      }
    });
  }
}
```

⚠️ **Vấn đề:** 
- Tính toán giá đúng
- Lưu duration vào `description` (dạng text)
- **KHÔNG** lưu vào cột riêng → Khó query và parse

---

### 3. Database Schema (❌ Thiếu cột quan trọng)

**File:** `backend/prisma/schema.prisma`

**Model `orders`:**
```prisma
model orders {
  id                String      @id
  buyer_id          String
  seller_id         String
  listing_id        String?
  status            OrderStatus
  subtotal          Decimal
  total             Decimal
  currency          String
  order_number      String      @unique
  // ...
  
  // ❌ THIẾU: rental_duration_months Int?
  // ❌ THIẾU: deal_type String?
}
```

**Model `order_items`:**
```prisma
model order_items {
  id          String  @id
  order_id    String
  item_type   String
  ref_id      String
  description String?   // ✅ Có duration ở đây (dạng text)
  qty         Int
  unit_price  Decimal
  total_price Decimal
  // ...
  
  // ❌ THIẾU: rental_duration_months Int?
  // ❌ THIẾU: deal_type String?
}
```

❌ **Kết luận:** Schema thiếu cột cần thiết

---

### 4. RentalContractService (❌ Dùng sai nguồn dữ liệu)

**File:** `backend/src/services/rental-contract-service.ts`

**Code tạo contract:**
```typescript
// Line 80-90: Hàm createContractFromOrder
const listing = await prisma.listings.findUnique({
  where: { id: order.listing_id! },
  include: { /* ... */ }
});

const orderItem = order.order_items[0];

// ❌ LỖI NGHIÊM TRỌNG: Lấy từ min_rental_duration thay vì từ order
const rentalDurationMonths = listing.min_rental_duration || 1;

// Line 106: Tính tổng tiền DỰA TRÊN DURATION착 SAI
const totalAmountDue = rentalPrice * rentalDurationMonths;
// → Nếu listing.min_rental_duration = 1 nhưng buyer chọn 6 tháng
//    thì totalAmountDue = rentalPrice × 1 (SAI!)
//    trong khi order.total = rentalPrice × 6 (ĐÚNG)
```

**Kết quả:**
```typescript
// Contract được tạo với:
{
  start_date: "2025-11-14",
  end_date: "2025-12-14",        // ❌ Chỉ 1 tháng
  rental_price: 10000000,
  total_amount_due: 10000000,    // ❌ Chỉ 1 tháng
  // NHƯNG order.total = 60000000  // ✅ 6 tháng
}
```

🚨 **Mâu thuẫn:** 
- Buyer đã thanh toán: **60,000,000 VND** (6 tháng)
- Contract ghi: **10,000,000 VND** (1 tháng)
- Chênh lệch: **50,000,000 VND** không được ghi nhận!

---

## 💡 GIẢI PHÁP ĐỀ XUẤT

### Option 1: **Thêm cột vào Database** (KHUYẾN NGHỊ)

#### Bước 1: Cập nhật Prisma Schema

```prisma
// backend/prisma/schema.prisma

model orders {
  // ... existing fields
  
  // ✅ Thêm mới
  deal_type              String?              // 'SALE' | 'RENTAL'
  rental_duration_months Int?                 // Số tháng thuê (null nếu SALE)
  
  // ... relationships
}

model order_items {
  // ... existing fields
  
  // ✅ Thêm mới
  deal_type              String?              // 'SALE' | 'RENTAL'
  rental_duration_months Int?                 // Số tháng thuê cho item này
  
  // ... relationships
}
```

#### Bước 2: Tạo Migration

```sql
-- backend/migrations/add_rental_duration_to_orders.sql

ALTER TABLE orders 
ADD COLUMN deal_type VARCHAR(20),
ADD COLUMN rental_duration_months INTEGER;

ALTER TABLE order_items 
ADD COLUMN deal_type VARCHAR(20),
ADD COLUMN rental_duration_months INTEGER;

COMMENT ON COLUMN orders.deal_type IS 'SALE or RENTAL';
COMMENT ON COLUMN orders.rental_duration_months IS 'Number of months for rental (NULL for SALE)';
COMMENT ON COLUMN order_items.deal_type IS 'SALE or RENTAL';
COMMENT ON COLUMN order_items.rental_duration_months IS 'Number of months for rental (NULL for SALE)';
```

#### Bước 3: Cập nhật Checkout Code

```typescript
// backend/src/routes/cart.ts - Line 704

const order = await tx.orders.create({
  data: {
    buyer_id: userId,
    seller_id: sellerId,
    status: 'PENDING_PAYMENT',
    subtotal: subtotal,
    total: total,
    currency: items[0].currency,
    order_number: orderNumber,
    listing_id: items[0].listing_id,
    
    // ✅ THÊM MỚI
    deal_type: items[0].deal_type,
    rental_duration_months: items[0].deal_type === 'RENTAL' 
      ? items[0].rental_duration_months 
      : null
  }
});

// Line 715-728: Order items
for (const item of items) {
  await tx.order_items.create({
    data: {
      order_id: order.id,
      item_type: 'CONTAINER',
      ref_id: item.listing_id,
      description: `${item.listing.title}`,
      qty: item.quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      
      // ✅ THÊM MỚI
      deal_type: item.deal_type,
      rental_duration_months: item.deal_type === 'RENTAL' 
        ? item.rental_duration_months 
        : null
    }
  });
}
```

#### Bước 4: Cập nhật RentalContractService

```typescript
// backend/src/services/rental-contract-service.ts - Line 86

// ❌ CŨ (SAI):
const rentalDurationMonths = listing.min_rental_duration || 1;

// ✅ MỚI (ĐÚNG):
const rentalDurationMonths = order.rental_duration_months || 
                             order.order_items[0]?.rental_duration_months || 
                             listing.min_rental_duration || 
                             1;

// Validate
if (order.deal_type === 'RENTAL' && !rentalDurationMonths) {
  return { 
    success: false, 
    message: 'Rental duration not found in order' 
  };
}
```

---

### Option 2: **Parse từ description** (TẠM THỜI - không khuyến nghị)

```typescript
// Không nên dùng vì:
// - Khó parse nếu format thay đổi
// - Không thể query trong database
// - Dễ lỗi nếu text bị sửa
// - Không đáng tin cậy

const descriptionMatch = orderItem.description?.match(/(\d+)\s*tháng/);
const rentalDurationMonths = descriptionMatch 
  ? parseInt(descriptionMatch[1]) 
  : listing.min_rental_duration || 1;
```

---

## 🎯 KHUYẾN NGHỊ

### Độ ưu tiên: 🔴 **CRITICAL - Cần fix ngay**

**Lý do:**
1. **Tác động pháp lý:** Contract không phản ánh đúng thỏa thuận
2. **Tác động tài chính:** Số tiền thu không khớp với thời hạn
3. **Tác động vận hành:** Không biết khi nào container phải trả
4. **Tác động khách hàng:** Buyer có thể khiếu nại

**Hành động:**
1. ✅ **Ngay lập tức:** Implement Option 1 (thêm cột vào database)
2. ✅ **Trước khi production:** Test end-to-end workflow
3. ✅ **Sau khi deploy:** Migrate dữ liệu cũ (nếu có orders đã tạo)

---

## 📋 CHECKLIST TRIỂN KHAI

### Phase 1: Database (1-2 giờ)
- [ ] Cập nhật `schema.prisma`
- [ ] Tạo migration SQL
- [ ] Chạy `npx prisma generate`
- [ ] Chạy migration trên database
- [ ] Verify columns đã được tạo

### Phase 2: Backend (2-3 giờ)
- [ ] Cập nhật `cart.ts` checkout logic
- [ ] Cập nhật `rental-contract-service.ts`
- [ ] Thêm validation cho rental orders
- [ ] Test API với Postman/Insomnia

### Phase 3: Testing (2-3 giờ)
- [ ] Test case: Thêm rental item vào cart
- [ ] Test case: Checkout với 1 tháng
- [ ] Test case: Checkout với 6 tháng
- [ ] Test case: Checkout với 12 tháng
- [ ] Verify contract có đúng duration
- [ ] Verify total_amount_due = rental_price × duration
- [ ] Verify payment_schedule có đủ số kỳ

### Phase 4: Data Migration (nếu cần)
- [ ] Identify các orders cũ bị ảnh hưởng
- [ ] Script để parse duration từ description
- [ ] Backfill rental_duration_months
- [ ] Verify data integrity

---

## 📊 TÁC ĐỘNG DỰ KIẾN

### Tích cực:
- ✅ Contract chính xác với thỏa thuận
- ✅ Dễ query và báo cáo
- ✅ Hỗ trợ tốt cho automation
- ✅ Tăng độ tin cậy của hệ thống

### Tiêu cực:
- ⚠️ Cần dừng deploy trong 4-6 giờ để implement
- ⚠️ Phải test kỹ trước khi release
- ⚠️ Có thể ảnh hưởng đến orders đang pending

---

## 🔗 FILES CẦN SỬA

1. **Database:**
   - `backend/prisma/schema.prisma`
   - Migration file mới

2. **Backend:**
   - `backend/src/routes/cart.ts` (checkout logic)
   - `backend/src/services/rental-contract-service.ts` (contract creation)

3. **Testing:**
   - Thêm test cases cho rental workflow

4. **Documentation:**
   - Cập nhật API docs
   - Cập nhật workflow diagrams

---

**Kết luận:** Đây là lỗi nghiêm trọng cần được ưu tiên cao nhất trong sprint tiếp theo. Không nên deploy tính năng cho thuê ra production trước khi fix lỗi này.
