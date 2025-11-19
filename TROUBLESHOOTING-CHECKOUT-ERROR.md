# 🔧 Troubleshooting: Lỗi khi bấm "Xác nhận đặt hàng"

## 🐛 Vấn đề

Khi click nút "Xác nhận đặt hàng" ở trang `/cart/checkout?type=order`, nhận được lỗi:
```
POST http://localhost:3001/api/v1/cart/checkout
Status: 500 Internal Server Error
```

---

## ✅ Các fix đã thực hiện

### 1. Added `cart_item_ids` field support
**File**: `/backend/src/routes/cart.ts`

**Before**:
```typescript
server.post<{ 
  Body: { 
    checkout_type: 'rfq' | 'order';
    delivery_address_id?: string;
  } 
}>('/checkout', ...)
```

**After**:
```typescript
server.post<{ 
  Body: { 
    checkout_type: 'rfq' | 'order';
    delivery_address_id?: string;
    cart_item_ids?: string[]; // ✅ NEW: Accept but ignore (for future partial checkout)
  } 
}>('/checkout', ...)
```

**Reason**: Frontend `cart-context.tsx` gửi field `cart_item_ids` nhưng backend không expect, gây validation error.

---

### 2. Enhanced error logging
**File**: `/backend/src/routes/cart.ts`

**Before**:
```typescript
} catch (error: any) {
  console.error('Checkout error:', error);
  return reply.code(500).send({ success: false, error: error.message });
}
```

**After**:
```typescript
} catch (error: any) {
  console.error('❌ Checkout error FULL:', error);
  console.error('❌ Checkout error stack:', error.stack);
  console.error('❌ Checkout error message:', error.message);
  return reply.code(500).send({ 
    success: false, 
    error: error.message,
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
}
```

**Reason**: Để debug lỗi dễ dàng hơn với full stack trace.

---

### 3. Added request logging
**Added**:
```typescript
console.log('🛒 POST /cart/checkout - Request:', {
  userId,
  checkout_type,
  delivery_address_id,
  cart_item_ids: cart_item_ids?.length || 'all items'
});
```

**Reason**: Track incoming requests để debug.

---

## 🧪 Cách kiểm tra lỗi

### Method 1: Browser DevTools
1. Mở trang checkout: `http://localhost:3001/vi/cart/checkout?type=order`
2. Mở DevTools (F12) → Tab **Network**
3. Click "Xác nhận đặt hàng"
4. Click vào request `checkout` trong Network tab
5. Xem **Response** tab → Copy error message

### Method 2: Backend Terminal
1. Mở terminal đang chạy `npm run dev`
2. Tìm dòng log có `❌ Checkout error`
3. Copy full stack trace

---

## 🔍 Các lỗi thường gặp và cách fix

### Error 1: "checkout_type must be either rfq or order"
**Nguyên nhân**: Frontend gửi sai giá trị `checkout_type`

**Fix**: Kiểm tra `handleCheckout` trong `/frontend/app/[locale]/(buyer)/cart/checkout/page.tsx`:
```typescript
await checkout(checkoutType); // checkoutType phải là 'rfq' hoặc 'order'
```

---

### Error 2: "Giỏ hàng trống"
**Nguyên nhân**: Cart không có items

**Fix**: 
1. Thêm sản phẩm vào cart trước
2. Check API `/api/v1/cart` trả về `cart_items.length > 0`

**SQL Query kiểm tra**:
```sql
-- Xem cart của buyer
SELECT c.*, COUNT(ci.id) as items_count
FROM carts c
LEFT JOIN cart_items ci ON c.id = ci.cart_id
WHERE c.user_id = 'user-buyer'
GROUP BY c.id;

-- Xem chi tiết cart items
SELECT ci.*, l.title, l.price_amount, l.available_quantity
FROM cart_items ci
JOIN carts c ON ci.cart_id = c.id
JOIN listings l ON ci.listing_id = l.id
WHERE c.user_id = 'user-buyer';
```

---

### Error 3: "Sản phẩm [X] không còn khả dụng"
**Nguyên nhân**: Listing status không phải `ACTIVE`

**Fix**:
```sql
-- Update listing status
UPDATE listings 
SET status = 'ACTIVE' 
WHERE id = 'listing-xxx';
```

---

### Error 4: "Sản phẩm [X] không còn đủ số lượng"
**Nguyên nhân**: `available_quantity` < `cart_item.quantity`

**Fix**:
```sql
-- Tăng available_quantity
UPDATE listings 
SET available_quantity = 100 
WHERE id = 'listing-xxx';
```

---

### Error 5: Prisma error "Unknown field 'deal_type'"
**Nguyên nhân**: Database schema chưa có field `deal_type` hoặc `rental_duration_months`

**Fix**:
```bash
# Re-run migration
cd backend
npx prisma migrate dev
```

---

### Error 6: "Cannot read property 'seller_user_id' of undefined"
**Nguyên nhân**: Listing không include seller relation

**Fix**: Đã có trong code:
```typescript
include: {
  listing: {
    include: { seller: true }
  }
}
```

---

### Error 7: InventoryService error
**Nguyên nhân**: Lỗi khi reserve inventory

**Check**:
```sql
-- Xem listing_containers
SELECT * FROM listing_containers 
WHERE listing_id = 'listing-xxx' 
AND status = 'AVAILABLE';
```

**Fix**: Đảm bảo có đủ containers AVAILABLE.

---

## 🎯 Expected Behavior

### Successful Checkout Flow:

1. **Request**:
```json
POST /api/v1/cart/checkout
{
  "checkout_type": "order",
  "delivery_address_id": null,
  "cart_item_ids": ["cart-item-1", "cart-item-2"]
}
```

2. **Backend Processing**:
- ✅ Validate cart exists and not empty
- ✅ Validate all listings are ACTIVE
- ✅ Validate all quantities available
- ✅ Group items by seller
- ✅ Create orders (one per seller)
- ✅ Create order_items with deal_type and rental_duration_months
- ✅ Reserve inventory via InventoryService
- ✅ Send notifications to sellers
- ✅ Mark cart as CONVERTED

3. **Response**:
```json
{
  "success": true,
  "message": "Đã tạo thành công 2 đơn hàng",
  "data": {
    "ids": ["order-1", "order-2"],
    "type": "order"
  }
}
```

4. **Frontend Behavior**:
- ✅ Redirect to success page or orders list
- ✅ Clear cart
- ✅ Show success message

---

## 📊 Debug Checklist

Trước khi checkout, verify:

- [ ] User đã login (có token)
- [ ] Cart có ít nhất 1 item
- [ ] Tất cả listings có status = 'ACTIVE'
- [ ] Tất cả listings có available_quantity > 0
- [ ] Mỗi cart_item có valid deal_type ('SALE' hoặc 'RENTAL')
- [ ] Nếu RENTAL: rental_duration_months > 0
- [ ] Backend server đang chạy (port 3006)
- [ ] Frontend server đang chạy (port 3001)
- [ ] Database connection OK

---

## 🚀 Test Case

### Scenario: Checkout với 1 ORDER item

**Setup**:
```sql
-- 1. Ensure buyer exists
SELECT * FROM users WHERE id = 'user-buyer';

-- 2. Ensure seller exists
SELECT * FROM users WHERE id = 'user-seller';

-- 3. Create active listing
INSERT INTO listings (id, seller_user_id, title, type, deal_type, status, price_amount, price_currency, available_quantity)
VALUES ('test-listing-1', 'user-seller', 'Test Container 20FT', 'DRY', 'SALE', 'ACTIVE', 5000000, 'VND', 10);

-- 4. Add to cart
INSERT INTO carts (id, user_id, status, expires_at, created_at, updated_at)
VALUES ('test-cart-1', 'user-buyer', 'ACTIVE', NOW() + INTERVAL '30 days', NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO cart_items (id, cart_id, listing_id, quantity, deal_type, price_snapshot, currency, added_at, updated_at)
VALUES ('test-cart-item-1', 'test-cart-1', 'test-listing-1', 2, 'SALE', 5000000, 'VND', NOW(), NOW());
```

**Execute**:
```bash
# In browser
http://localhost:3001/vi/cart/checkout?type=order
# Click "Xác nhận đặt hàng"
```

**Verify**:
```sql
-- Check order created
SELECT * FROM orders WHERE buyer_id = 'user-buyer' ORDER BY created_at DESC LIMIT 1;

-- Check order items
SELECT * FROM order_items WHERE order_id = (SELECT id FROM orders WHERE buyer_id = 'user-buyer' ORDER BY created_at DESC LIMIT 1);

-- Check inventory reserved
SELECT * FROM listing_containers WHERE listing_id = 'test-listing-1' AND status = 'RESERVED';

-- Check cart converted
SELECT * FROM carts WHERE user_id = 'user-buyer';
```

---

## 📝 Notes

- Backend auto-restart khi sửa file `.ts` nhờ `tsx watch`
- Frontend auto-reload khi sửa file `.tsx` nhờ Next.js HMR
- Lỗi 500 thường do Prisma query fail hoặc validation error
- Check terminal log để thấy full error stack trace

---

## 🔗 Related Files

- `/backend/src/routes/cart.ts` - Cart checkout route
- `/frontend/lib/contexts/cart-context.tsx` - Cart checkout function
- `/frontend/app/[locale]/(buyer)/cart/checkout/page.tsx` - Checkout UI
- `/backend/src/lib/inventory/inventory-service.ts` - Inventory reservation

---

**Status**: 🔧 Investigating
**Last Updated**: 2024-11-19
**Next Action**: Xem error message từ DevTools Network tab hoặc backend terminal log
