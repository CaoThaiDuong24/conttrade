# 🧪 CHECKLIST TESTING FIX RENTAL DURATION

## ✅ STATUS: Backend & Frontend đang chạy
- ✅ Backend: http://localhost:3006 (hoặc port hiện tại)
- ✅ Frontend: http://localhost:3001 (hoặc port hiện tại)
- ✅ No compile errors

---

## 📋 TEST CASES ĐẦY ĐỦ

### Test Case 1: Tạo Order trực tiếp từ Listing (RENTAL)
**URL Test:** `http://localhost:3001/orders/create?listingId=<rental-listing-id>`

**Steps:**
1. [ ] Mở trang create order với listing có deal_type = RENTAL
2. [ ] Kiểm tra có hiển thị field "Thời gian thuê (tháng)" không
3. [ ] Kiểm tra giá trị default = min_rental_duration của listing
4. [ ] Thử nhập giá trị < min_rental_duration → Phải show error
5. [ ] Thử nhập giá trị > max_rental_duration → Phải show error
6. [ ] Nhập giá trị hợp lệ (VD: 10 tháng)
7. [ ] Submit form
8. [ ] Mở database và check:
   ```sql
   SELECT 
     id, order_number, deal_type, rental_duration_months, created_at 
   FROM orders 
   WHERE id = '<order-id-vừa-tạo>';
   ```
9. [ ] Verify: `rental_duration_months = 10` ✅

**Expected Result:**
- ✅ Field "Thời gian thuê (tháng)" hiển thị
- ✅ Validation hoạt động
- ✅ Order được tạo với rental_duration_months = 10

---

### Test Case 2: Add to Cart → Checkout (RENTAL)
**Steps:**
1. [ ] Tìm listing RENTAL
2. [ ] Click "Thêm vào giỏ hàng"
3. [ ] Trong dialog, nhập rental duration = 8 tháng
4. [ ] Add to cart
5. [ ] Vào trang giỏ hàng: http://localhost:3001/cart
6. [ ] Verify hiển thị "Thuê 8 tháng"
7. [ ] Proceed to checkout
8. [ ] Complete checkout
9. [ ] Check database:
   ```sql
   SELECT 
     o.id, o.order_number, o.deal_type, o.rental_duration_months,
     oi.deal_type as item_deal_type, oi.rental_duration_months as item_duration
   FROM orders o
   JOIN order_items oi ON o.id = oi.order_id
   WHERE o.id = '<order-id-vừa-tạo>';
   ```
10. [ ] Verify: Cả order và order_items đều có rental_duration_months = 8

**Expected Result:**
- ✅ Cart hiển thị đúng "Thuê 8 tháng"
- ✅ Order & order_items có rental_duration_months = 8

---

### Test Case 3: RFQ → Quote → Order (RENTAL) 🔥 CRITICAL
**Steps:**

**3.1. Tạo RFQ:**
1. [ ] Tìm listing có deal_type = RENTAL
2. [ ] Vào trang listing detail
3. [ ] Click "Yêu cầu báo giá" (RFQ)
4. [ ] Trong form RFQ:
   - Chọn Purpose = RENTAL
   - Nhập Thời gian thuê = 6 tháng
   - Nhập số lượng = 2
5. [ ] Submit RFQ
6. [ ] Check database:
   ```sql
   SELECT id, listing_id, rental_duration_months, status 
   FROM rfqs 
   WHERE id = '<rfq-id-vừa-tạo>';
   ```
7. [ ] Verify: `rental_duration_months = 6` ✅

**3.2. Seller tạo Quote:**
1. [ ] Login as seller
2. [ ] Vào trang "My RFQs" hoặc "Quotes"
3. [ ] Tìm RFQ vừa tạo
4. [ ] Create quote (nhập giá)
5. [ ] Submit quote
6. [ ] Check database:
   ```sql
   SELECT q.id, q.rfq_id, r.rental_duration_months 
   FROM quotes q
   JOIN rfqs r ON q.rfq_id = r.id
   WHERE q.id = '<quote-id-vừa-tạo>';
   ```
7. [ ] Verify: RFQ vẫn có rental_duration_months = 6

**3.3. Buyer Accept Quote (CRITICAL TEST):**
1. [ ] Login as buyer
2. [ ] Vào trang "My Quotes"
3. [ ] Find quote vừa được tạo
4. [ ] Click "Accept Quote"
5. [ ] Order được tạo tự động
6. [ ] 🔍 **CRITICAL CHECK - Run this query:**
   ```sql
   SELECT 
     o.id as order_id,
     o.order_number,
     o.deal_type as order_deal_type,
     o.rental_duration_months as order_duration,
     o.quote_id,
     q.rfq_id,
     r.rental_duration_months as rfq_duration,
     l.deal_type as listing_deal_type
   FROM orders o
   JOIN quotes q ON o.quote_id = q.id
   JOIN rfqs r ON q.rfq_id = r.id
   JOIN listings l ON o.listing_id = l.id
   WHERE o.id = '<order-id-vừa-tạo>';
   ```

**Expected Result (CRITICAL):**
- ✅ `order_deal_type = 'RENTAL'` (BEFORE: NULL ❌)
- ✅ `order_duration = 6` (BEFORE: NULL ❌)
- ✅ `rfq_duration = 6`
- ✅ `listing_deal_type = 'RENTAL'`

**3.4. Check Order Items:**
```sql
SELECT 
  oi.id,
  oi.order_id,
  oi.deal_type,
  oi.rental_duration_months
FROM order_items oi
WHERE oi.order_id = '<order-id-vừa-tạo>';
```

**Expected Result:**
- ✅ `deal_type = 'RENTAL'` (BEFORE: NULL ❌)
- ✅ `rental_duration_months = 6` (BEFORE: NULL ❌)

**3.5. Check Rental Contract (nếu order được thanh toán):**
1. [ ] Pay the order
2. [ ] Check database:
   ```sql
   SELECT 
     rc.id,
     rc.contract_number,
     rc.order_id,
     rc.start_date,
     rc.end_date,
     EXTRACT(MONTH FROM AGE(rc.end_date, rc.start_date)) as duration_months,
     o.rental_duration_months as order_duration
   FROM rental_contracts rc
   JOIN orders o ON rc.order_id = o.id
   WHERE o.id = '<order-id>';
   ```

**Expected Result:**
- ✅ Contract duration = 6 tháng
- ✅ Order duration = 6 tháng
- ✅ MATCH! ✅

---

### Test Case 4: Backend API Validation
**Test invalid requests:**

**4.1. POST /api/v1/orders/from-listing (no rental_duration_months):**
```bash
curl -X POST http://localhost:3006/api/v1/orders/from-listing \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": "<rental-listing-id>",
    "agreedPrice": 1000000,
    "currency": "VND",
    "deliveryAddress": {...},
    "deal_type": "RENTAL"
    // Missing: rental_duration_months
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Rental duration is required for rental orders. Please specify rental duration in months.",
  "data": {
    "minRentalDuration": 3,
    "maxRentalDuration": 24
  }
}
```

**4.2. POST with invalid duration:**
```bash
# Duration < min
curl ... -d '{"rental_duration_months": 1, ...}'
# Expected: Error "must be at least X months"

# Duration > max
curl ... -d '{"rental_duration_months": 100, ...}'
# Expected: Error "cannot exceed X months"
```

---

## 🔍 QUICK DATABASE QUERIES

**1. Tìm orders bị bug (thiếu rental_duration_months):**
```sql
SELECT 
  o.id, o.order_number, o.deal_type, o.rental_duration_months,
  l.deal_type as listing_deal_type,
  o.created_at
FROM orders o
LEFT JOIN listings l ON o.listing_id = l.id
WHERE l.deal_type = 'RENTAL' 
  AND o.rental_duration_months IS NULL
ORDER BY o.created_at DESC;
```

**2. Check toàn bộ orders từ quotes:**
```sql
SELECT 
  o.id, 
  o.deal_type, 
  o.rental_duration_months,
  q.rfq_id,
  r.rental_duration_months as rfq_had_duration
FROM orders o
JOIN quotes q ON o.quote_id = q.id
JOIN rfqs r ON q.rfq_id = r.id
WHERE o.quote_id IS NOT NULL
ORDER BY o.created_at DESC
LIMIT 20;
```

**3. Summary statistics:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE l.deal_type = 'RENTAL' AND o.rental_duration_months IS NULL) as bug_count,
  COUNT(*) FILTER (WHERE l.deal_type = 'RENTAL' AND o.rental_duration_months IS NOT NULL) as fixed_count
FROM orders o
LEFT JOIN listings l ON o.listing_id = l.id
WHERE l.deal_type = 'RENTAL';
```

---

## ✅ SIGN-OFF CHECKLIST

- [ ] Test Case 1: Direct order from listing ✅
- [ ] Test Case 2: Cart → Checkout ✅
- [ ] Test Case 3: RFQ → Quote → Order ✅ (CRITICAL)
- [ ] Test Case 4: API validation ✅
- [ ] No bugged orders found in database ✅
- [ ] All rental contracts have correct duration ✅

---

## 🚀 NEXT STEPS IF ALL TESTS PASS

1. Remove test endpoint (if added)
2. Commit changes với message:
   ```
   fix: rental duration not saved correctly from user input
   
   - POST /from-listing: require rental_duration_months for RENTAL orders
   - POST / (order from quote): copy rental_duration_months from RFQ
   - Frontend: add rental duration input field in order create form
   - Fix critical bug where RFQ → Quote → Order flow lost rental data
   ```

3. Deploy to staging
4. Re-run tests on staging
5. Deploy to production

---

**Date:** November 17, 2025
**Tested by:** [Your Name]
**Status:** [ ] PENDING / [ ] PASSED / [ ] FAILED
