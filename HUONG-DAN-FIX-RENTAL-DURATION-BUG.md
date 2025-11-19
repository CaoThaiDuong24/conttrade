# 🔧 HƯỚNG DẪN FIX LỖI RENTAL_DURATION_MONTHS

**Liên quan:** PHAT-HIEN-LOI-NGHIEM-TRONG-RENTAL-WORKFLOW.md  
**Migration:** backend/migrations/20251114_add_rental_duration_to_orders.sql

---

## 📋 CHECKLIST TỔNG QUAN

### ✅ Phase 1: Database Migration
- [ ] 1.1. Cập nhật Prisma Schema
- [ ] 1.2. Generate Prisma Client
- [ ] 1.3. Chạy SQL Migration
- [ ] 1.4. Verify Migration

### ✅ Phase 2: Backend Code Updates
- [ ] 2.1. Fix Cart Checkout Logic
- [ ] 2.2. Fix RentalContractService
- [ ] 2.3. Update Type Definitions

### ✅ Phase 3: Testing
- [ ] 3.1. Test Cart → Checkout → Order
- [ ] 3.2. Test Order → Contract Creation
- [ ] 3.3. Verify Payment Schedule

---

## 🗃️ PHASE 1: DATABASE MIGRATION

### Step 1.1: Cập nhật Prisma Schema

**File:** `backend/prisma/schema.prisma`

Tìm `model orders {` (khoảng line 1195) và thêm 2 fields mới:

```prisma
model orders {
  id                            String               @id
  buyer_id                      String
  seller_id                     String
  listing_id                    String?
  quote_id                      String?
  org_ids                       Json?
  status                        OrderStatus          @default(CREATED)
  
  // ✅ THÊM MỚI - 2 dòng này
  deal_type                     String?              // 'SALE' | 'RENTAL'
  rental_duration_months        Int?                 // Số tháng thuê (NULL nếu SALE)
  
  subtotal                      Decimal
  tax                           Decimal              @default(0)
  fees                          Decimal              @default(0)
  total                         Decimal
  currency                      String               @default("VND")
  order_number                  String               @unique
  // ... rest of fields
}
```

Tìm `model order_items {` (khoảng line 1240) và thêm:

```prisma
model order_items {
  id          String  @id
  order_id    String
  item_type   String
  ref_id      String
  description String?
  
  // ✅ THÊM MỚI - 2 dòng này
  deal_type              String?              // 'SALE' | 'RENTAL'
  rental_duration_months Int?                 // Số tháng thuê cho item này
  
  qty         Int
  unit_price  Decimal
  total_price Decimal
  created_at  DateTime @default(now())
  updated_at  DateTime
  // ... relationships
}
```

### Step 1.2: Generate Prisma Client

```bash
cd backend
npx prisma generate
```

**Expected output:**
```
✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client
```

### Step 1.3: Chạy SQL Migration

**Option A: Qua psql**
```bash
psql -h localhost -U postgres -d conttrade_db -f migrations/20251114_add_rental_duration_to_orders.sql
```

**Option B: Qua DBeaver/pgAdmin**
1. Mở file `migrations/20251114_add_rental_duration_to_orders.sql`
2. Copy toàn bộ nội dung
3. Execute trong SQL Editor

### Step 1.4: Verify Migration

```sql
-- Check columns đã được tạo
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name IN ('orders', 'order_items')
  AND column_name IN ('deal_type', 'rental_duration_months')
ORDER BY table_name, ordinal_position;

-- Expected output:
-- table_name  | column_name            | data_type        | is_nullable
-- orders      | deal_type              | character varying| YES
-- orders      | rental_duration_months | integer          | YES
-- order_items | deal_type              | character varying| YES
-- order_items | rental_duration_months | integer          | YES
```

---

## 💻 PHASE 2: BACKEND CODE UPDATES

### Step 2.1: Fix Cart Checkout Logic

**File:** `backend/src/routes/cart.ts`

**Tìm dòng ~704:** (trong hàm `POST /checkout`)

```typescript
// ❌ CODE CŨ:
const order = await tx.orders.create({
  data: {
    buyer_id: userId,
    seller_id: sellerId,
    status: 'PENDING_PAYMENT',
    subtotal: subtotal,
    tax: tax,
    fees: fees,
    total: total,
    currency: items[0].currency,
    order_number: orderNumber,
    listing_id: items[0].listing_id
  }
});
```

**✅ CODE MỚI:**

```typescript
const order = await tx.orders.create({
  data: {
    buyer_id: userId,
    seller_id: sellerId,
    status: 'PENDING_PAYMENT',
    subtotal: subtotal,
    tax: tax,
    fees: fees,
    total: total,
    currency: items[0].currency,
    order_number: orderNumber,
    listing_id: items[0].listing_id,
    
    // ✅ THÊM MỚI: Lưu deal_type và rental_duration_months
    deal_type: items[0].deal_type,
    rental_duration_months: items[0].deal_type === 'RENTAL' 
      ? items[0].rental_duration_months 
      : null
  }
});
```

**Tìm dòng ~720:** (trong vòng lặp tạo order_items)

```typescript
// ❌ CODE CŨ:
await tx.order_items.create({
  data: {
    order_id: order.id,
    item_type: 'CONTAINER',
    ref_id: item.listing_id,
    description: `${item.listing.title} - ${item.deal_type === 'RENTAL' ? `${item.rental_duration_months} tháng` : 'Mua'}`,
    qty: item.quantity,
    unit_price: unitPrice,
    total_price: totalPrice
  }
});
```

**✅ CODE MỚI:**

```typescript
await tx.order_items.create({
  data: {
    order_id: order.id,
    item_type: 'CONTAINER',
    ref_id: item.listing_id,
    description: item.listing.title, // ✅ Bỏ duration ở description vì đã có cột riêng
    qty: item.quantity,
    unit_price: unitPrice,
    total_price: totalPrice,
    
    // ✅ THÊM MỚI: Lưu deal_type và rental_duration_months
    deal_type: item.deal_type,
    rental_duration_months: item.deal_type === 'RENTAL' 
      ? item.rental_duration_months 
      : null
  }
});
```

### Step 2.2: Fix RentalContractService

**File:** `backend/src/services/rental-contract-service.ts`

**Tìm dòng ~86:**

```typescript
// ❌ CODE CŨ (SAI):
const rentalDurationMonths = listing.min_rental_duration || 1;
```

**✅ CODE MỚI (ĐÚNG):**

```typescript
// Lấy rental duration từ order (ưu tiên cao nhất)
const rentalDurationMonths = 
  order.rental_duration_months ||                    // 1. Từ order
  order.order_items[0]?.rental_duration_months ||    // 2. Từ order_items
  listing.min_rental_duration ||                     // 3. Fallback: min duration
  1;                                                 // 4. Default: 1 tháng

// ✅ Validate cho rental orders
if (order.deal_type === 'RENTAL' && !order.rental_duration_months) {
  console.warn(`⚠️  Order ${orderId} is RENTAL but missing rental_duration_months. Using fallback: ${rentalDurationMonths} month(s)`);
}

console.log(`📅 Rental duration: ${rentalDurationMonths} month(s) (source: ${
  order.rental_duration_months ? 'order' : 
  order.order_items[0]?.rental_duration_months ? 'order_items' : 
  'listing.min_rental_duration'
})`);
```

**Thêm validation trước khi tạo contract (dòng ~100):**

```typescript
// ✅ Validate total_amount_due khớp với order.total
const expectedTotal = rentalPrice * rentalDurationMonths;
const actualTotal = Number(order.total);

if (Math.abs(expectedTotal - actualTotal) > 1) { // Allow 1 VND rounding error
  console.warn(`⚠️  Amount mismatch for order ${orderId}:
    Expected (price × duration): ${expectedTotal.toLocaleString()} ${listing.price_currency}
    Actual (order.total): ${actualTotal.toLocaleString()} ${listing.price_currency}
    Difference: ${(actualTotal - expectedTotal).toLocaleString()} ${listing.price_currency}
  `);
  
  // Use order.total as source of truth (đã thanh toán)
  const adjustedDuration = Math.round(actualTotal / rentalPrice);
  console.log(`✅ Adjusting duration to ${adjustedDuration} months to match payment`);
  rentalDurationMonths = adjustedDuration;
}
```

### Step 2.3: Update Type Definitions (Optional)

**File:** `backend/src/types/order.ts` (nếu có)

```typescript
export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id?: string;
  status: OrderStatus;
  
  // ✅ Thêm mới
  deal_type?: 'SALE' | 'RENTAL';
  rental_duration_months?: number;
  
  subtotal: number;
  total: number;
  currency: string;
  // ...
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_type: string;
  ref_id: string;
  
  // ✅ Thêm mới
  deal_type?: 'SALE' | 'RENTAL';
  rental_duration_months?: number;
  
  qty: number;
  unit_price: number;
  total_price: number;
  // ...
}
```

---

## 🧪 PHASE 3: TESTING

### Test Case 1: Cart → Checkout → Order (Rental 6 tháng)

**Step 1: Tạo Cart với Rental Item**

```bash
curl -X POST http://localhost:3001/api/v1/cart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "listing_id": "listing-123",
    "quantity": 1,
    "deal_type": "RENTAL",
    "rental_duration_months": 6
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "id": "cart-item-456",
    "deal_type": "RENTAL",
    "rental_duration_months": 6
  }
}
```

**Step 2: Checkout**

```bash
curl -X POST http://localhost:3001/api/v1/cart/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "checkout_type": "order"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "ids": ["order-789"],
    "message": "Created 1 order successfully"
  }
}
```

**Step 3: Verify Order in Database**

```sql
SELECT 
  order_number,
  deal_type,
  rental_duration_months,
  subtotal,
  total,
  currency
FROM orders 
WHERE id = 'order-789';

-- Expected:
-- order_number | deal_type | rental_duration_months | subtotal   | total      | currency
-- ORD-...      | RENTAL    | 6                      | 60000000   | 66000000   | VND
--              (assuming rental_price = 10M/month, tax + fees)
```

```sql
SELECT 
  description,
  deal_type,
  rental_duration_months,
  qty,
  unit_price,
  total_price
FROM order_items 
WHERE order_id = 'order-789';

-- Expected:
-- description          | deal_type | rental_duration_months | qty | unit_price | total_price
-- Container 20FT HC... | RENTAL    | 6                      | 1   | 10000000   | 60000000
```

### Test Case 2: Order → Contract Creation

**Step 1: Mark Order as PAID**

```sql
UPDATE orders 
SET 
  status = 'PAID',
  payment_verified_at = NOW()
WHERE order_number = 'ORD-...';
```

**Step 2: Trigger Contract Creation** (Backend tự động)

Hoặc call manually:

```bash
curl -X POST http://localhost:3001/api/v1/orders/order-789/verify-payment \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Step 3: Verify Contract**

```sql
SELECT 
  contract_number,
  start_date,
  end_date,
  rental_price,
  rental_currency,
  total_amount_due,
  EXTRACT(MONTH FROM AGE(end_date, start_date)) as duration_months
FROM rental_contracts 
WHERE order_id = 'order-789';

-- Expected:
-- contract_number | start_date | end_date   | rental_price | total_amount_due | duration_months
-- RC-...          | 2025-11-14 | 2026-05-14 | 10000000     | 60000000         | 6
```

### Test Case 3: Verify Payment Schedule

```sql
SELECT 
  payment_period,
  due_date,
  amount_due,
  status
FROM rental_payments 
WHERE contract_id IN (
  SELECT id FROM rental_contracts WHERE order_id = 'order-789'
)
ORDER BY payment_period;

-- Expected: 6 payment records (1 for each month)
-- payment_period | due_date   | amount_due | status
-- 1              | 2025-12-14 | 10000000   | PAID (or PENDING)
-- 2              | 2026-01-14 | 10000000   | PENDING
-- 3              | 2026-02-14 | 10000000   | PENDING
-- 4              | 2026-03-14 | 10000000   | PENDING
-- 5              | 2026-04-14 | 10000000   | PENDING
-- 6              | 2026-05-14 | 10000000   | PENDING
```

### Test Case 4: Edge Cases

**A. Test với 1 tháng:**
```json
{ "rental_duration_months": 1 }
```
Verify: `end_date = start_date + 1 month`

**B. Test với 12 tháng:**
```json
{ "rental_duration_months": 12 }
```
Verify: `total_amount_due = rental_price × 12`

**C. Test mixed cart (SALE + RENTAL):**
```json
[
  { "deal_type": "SALE", "quantity": 2 },
  { "deal_type": "RENTAL", "rental_duration_months": 3, "quantity": 1 }
]
```
Verify: 2 order_items với deal_type khác nhau

---

## ✅ VERIFICATION CHECKLIST

### Database Level
- [ ] Column `orders.deal_type` exists
- [ ] Column `orders.rental_duration_months` exists
- [ ] Column `order_items.deal_type` exists
- [ ] Column `order_items.rental_duration_months` exists
- [ ] Indexes created successfully
- [ ] Constraints added successfully

### Code Level
- [ ] Cart checkout saves `deal_type` to order
- [ ] Cart checkout saves `rental_duration_months` to order
- [ ] Order items save `deal_type` and `rental_duration_months`
- [ ] RentalContractService reads from `order.rental_duration_months`
- [ ] Contract `end_date` = `start_date + rental_duration_months`
- [ ] Contract `total_amount_due` = `rental_price × rental_duration_months`

### Business Logic
- [ ] Buyer chọn N tháng → Order lưu N tháng
- [ ] Order total = giá × N tháng
- [ ] Contract thời hạn = N tháng
- [ ] Payment schedule có N kỳ
- [ ] Contract total_amount_due = Order total (hoặc gần bằng)

---

## 🚨 ROLLBACK PLAN

Nếu có vấn đề, rollback bằng cách:

```sql
-- 1. Remove constraints
ALTER TABLE orders DROP CONSTRAINT IF EXISTS check_rental_has_duration;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS check_rental_item_has_duration;

-- 2. Remove indexes
DROP INDEX IF EXISTS idx_orders_deal_type;
DROP INDEX IF EXISTS idx_orders_rental_duration;
DROP INDEX IF EXISTS idx_order_items_deal_type;

-- 3. Remove columns
ALTER TABLE orders 
DROP COLUMN IF EXISTS deal_type,
DROP COLUMN IF EXISTS rental_duration_months;

ALTER TABLE order_items 
DROP COLUMN IF EXISTS deal_type,
DROP COLUMN IF EXISTS rental_duration_months;

-- 4. Regenerate Prisma Client
-- Revert schema.prisma changes first, then:
-- npx prisma generate
```

---

## 📞 SUPPORT

Nếu gặp vấn đề:

1. **Check logs:** `backend/logs/`
2. **Check database:** Query orders/order_items
3. **Check Prisma Client:** `npx prisma studio`
4. **Refer to:** PHAT-HIEN-LOI-NGHIEM-TRONG-RENTAL-WORKFLOW.md

---

**Estimated time:** 4-6 hours total
**Risk level:** Medium (có rollback plan)
**Priority:** 🔴 CRITICAL
