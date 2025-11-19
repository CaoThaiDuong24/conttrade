# 🧪 HƯỚNG DẪN TEST CHECKOUT PAGE

**Ngày:** 19/11/2025  
**Feature:** Checkout page với dữ liệu thật từ database

---

## 🎯 CÁC TÍNH NĂNG ĐÃ IMPLEMENT

### ✅ **1. Load dữ liệu giỏ hàng thật từ API**
- Fetch cart items từ `/api/v1/cart`
- Hiển thị tất cả sản phẩm trong giỏ
- Hỗ trợ cả SALE và RENTAL deals
- Hiển thị hình ảnh sản phẩm (nếu có)

### ✅ **2. Tính toán giá tự động**
```javascript
Subtotal = Σ(price × quantity)
Platform Fee = Subtotal × 5%
Tax (VAT) = (Subtotal + Platform Fee) × 10%
Total = Subtotal + Platform Fee + Tax
```

### ✅ **3. Form validation**
- Họ tên: >= 3 ký tự
- Email: format chuẩn (regex)
- Số điện thoại: VN format (0909123456 hoặc +84909123456)
- Real-time validation với error messages

### ✅ **4. Tạo đơn hàng thật**
- Gọi API `/api/v1/orders/from-listing`
- Hỗ trợ multiple sellers (tạo nhiều orders nếu có sản phẩm từ nhiều người bán)
- Tự động clear cart sau khi tạo đơn thành công
- Redirect đến trang payment

### ✅ **5. UI/UX nâng cao**
- Sticky sidebar với order summary
- Scrollable cart items list
- Loading states
- Error handling
- FAQ accordion
- Escrow information card
- Security badges

---

## 📋 CÁC BƯỚC TEST

### **BƯỚC 1: Chuẩn bị dữ liệu**

#### A. Đăng nhập với tài khoản buyer
```
URL: http://localhost:3001/auth/login
Email: buyer@example.com (hoặc tạo tài khoản mới)
```

#### B. Thêm sản phẩm vào giỏ hàng
```
1. Vào trang Listings: http://localhost:3001/listings
2. Chọn một hoặc nhiều containers
3. Click "Add to Cart"
4. Chọn deal type (SALE hoặc RENTAL)
5. Nếu RENTAL, chọn số tháng thuê
6. Confirm thêm vào giỏ
```

#### C. Kiểm tra giỏ hàng
```
URL: http://localhost:3001/cart
✅ Phải có ít nhất 1 sản phẩm
✅ Kiểm tra quantity, price, deal_type hiển thị đúng
```

---

### **BƯỚC 2: Test Checkout Flow**

#### A. Navigate đến Checkout
```
URL: http://localhost:3001/orders/checkout
Hoặc: Click button "Checkout" trong cart page
```

#### B. Kiểm tra dữ liệu load
**Expected results:**
- ✅ Thông tin user tự động fill (họ tên, email)
- ✅ Cart items hiển thị đầy đủ:
  - Hình ảnh sản phẩm
  - Tên sản phẩm
  - Depot location
  - Quantity
  - Deal type (Mua/Thuê X tháng)
  - Unit price & Total price
- ✅ Price breakdown tính đúng:
  - Subtotal = Σ(price × qty)
  - Platform fee = 5% of subtotal
  - Tax = 10% of (subtotal + fee)
  - Total = sum tất cả

#### C. Test Form Validation

**Test case 1: Empty fields**
```
Action: Click "Tiếp tục đến thanh toán" khi chưa điền đủ
Expected: Error messages hiển thị dưới các field bắt buộc
```

**Test case 2: Invalid email**
```
Input: "invalid-email"
Expected: Error "Email không hợp lệ"
```

**Test case 3: Invalid phone**
```
Input: "12345"
Expected: Error "Số điện thoại không hợp lệ"
```

**Test case 4: Valid data**
```
Họ tên: "Nguyễn Văn Test"
Email: "test@example.com"
SĐT: "0909123456"
Expected: Không có error
```

#### D. Test Order Creation

**Test case 1: Single seller**
```
Setup: Cart có 2-3 items từ cùng 1 seller
Action: Fill form và click "Tiếp tục đến thanh toán"
Expected:
  ✅ Loading spinner hiện
  ✅ 1 order được tạo
  ✅ Cart được clear
  ✅ Redirect đến /orders/{orderId}/pay
  ✅ Toast notification "Đơn hàng đã được tạo"
```

**Test case 2: Multiple sellers**
```
Setup: Cart có items từ 2+ sellers khác nhau
Action: Fill form và submit
Expected:
  ✅ Multiple orders được tạo (1 order/seller)
  ✅ Toast hiển thị số lượng orders
  ✅ Redirect đến payment page của order đầu tiên
```

**Test case 3: Mixed deal types**
```
Setup: Cart có cả SALE và RENTAL items
Action: Submit checkout
Expected:
  ✅ Deal type được preserve cho từng item
  ✅ Rental duration được save đúng
  ✅ Orders tạo thành công
```

---

### **BƯỚC 3: Kiểm tra Database**

#### A. Check Orders table
```sql
SELECT 
  id, 
  order_number, 
  buyer_id, 
  seller_id, 
  status,
  subtotal,
  fees,
  tax,
  total,
  currency,
  deal_type,
  rental_duration_months,
  created_at
FROM orders
WHERE buyer_id = '{your_user_id}'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:**
- ✅ Status = 'PENDING_PAYMENT'
- ✅ Subtotal, fees, tax, total đúng với calculation
- ✅ deal_type được save (SALE/RENTAL)
- ✅ rental_duration_months được save (nếu RENTAL)

#### B. Check Order Items
```sql
SELECT 
  oi.*,
  o.order_number
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE o.buyer_id = '{your_user_id}'
ORDER BY oi.created_at DESC
LIMIT 10;
```

**Expected:**
- ✅ Quantity đúng với cart
- ✅ Unit price và total price đúng
- ✅ Description chứa listing title
- ✅ deal_type được save
- ✅ rental_duration_months (nếu RENTAL)

#### C. Check Cart (should be empty)
```sql
SELECT ci.* 
FROM cart_items ci
JOIN carts c ON c.id = ci.cart_id
WHERE c.user_id = '{your_user_id}';
```

**Expected:**
- ✅ Không còn cart items (đã bị clear)

#### D. Check Inventory
```sql
SELECT 
  listing_id,
  available_quantity,
  reserved_quantity,
  total_quantity
FROM listings
WHERE id IN (SELECT listing_id FROM order_items WHERE order_id = '{created_order_id}');
```

**Expected:**
- ✅ reserved_quantity tăng lên = quantity đã order
- ✅ available_quantity giảm đi tương ứng

---

### **BƯỚC 4: Edge Cases**

#### Test 1: Empty cart
```
Setup: Clear tất cả items trong cart
Navigate to: /orders/checkout
Expected: 
  ✅ Hiển thị empty state
  ✅ Message: "Giỏ hàng trống"
  ✅ Button "Khám phá sản phẩm"
```

#### Test 2: Not authenticated
```
Setup: Logout
Navigate to: /orders/checkout
Expected:
  ✅ Redirect đến /auth/login
```

#### Test 3: Network error
```
Setup: Stop backend server
Action: Try to submit checkout
Expected:
  ✅ Error message hiển thị
  ✅ Toast notification "Có lỗi xảy ra"
  ✅ Form không bị reset
  ✅ User có thể retry
```

#### Test 4: Listing không còn available
```
Setup: 
  1. Add listing A vào cart
  2. Seller marks listing A as SOLD
  3. Try to checkout
Expected:
  ✅ Error: "Listing is not available"
  ✅ User được thông báo
```

#### Test 5: Số lượng không đủ
```
Setup:
  1. Listing có available_quantity = 5
  2. Add 10 items vào cart
  3. Try to checkout
Expected:
  ✅ Error: "Not enough quantity available"
```

---

## 🐛 KNOWN ISSUES & LIMITATIONS

### ⚠️ Current Limitations:
1. **Multiple orders redirect**: Chỉ redirect đến order đầu tiên
   - TODO: Tạo summary page cho multiple orders

2. **Payment methods**: Chưa implement actual payment
   - Redirect đến `/orders/{id}/pay` nhưng page đó cần implement

3. **Delivery address**: Chưa collect delivery address trong checkout
   - TODO: Thêm delivery address form

4. **Promo codes**: Chưa hỗ trợ coupon/discount codes
   - TODO: Thêm promo code field

### 🔧 Future Enhancements:
- [ ] Guest checkout (không cần login)
- [ ] Save contact info cho lần sau
- [ ] Multiple delivery addresses
- [ ] Order notes per item
- [ ] Estimated delivery date
- [ ] Insurance options
- [ ] Terms & conditions checkbox

---

## 📊 SUCCESS METRICS

### ✅ Checkout flow thành công khi:
1. User có thể xem tất cả items trong cart
2. Pricing calculation chính xác 100%
3. Form validation hoạt động tốt
4. Order được tạo thành công trong DB
5. Cart được clear sau checkout
6. Inventory được reserve đúng
7. User được redirect đến payment page
8. Không có console errors
9. UX smooth, không có flickering
10. Mobile responsive

---

## 🚀 NEXT STEPS

### Sau khi checkout hoàn thành, implement:

1. **Payment Page** (`/orders/[id]/pay`)
   - 3 phương thức: Bank Transfer, Credit Card, E-Wallet
   - QR code generation (VietQR)
   - Payment status tracking
   - Escrow integration

2. **Order Confirmation Page**
   - Order summary
   - Payment instructions
   - Timeline
   - Download invoice

3. **Email Notifications**
   - Order created email
   - Payment received email
   - Order status updates

4. **Seller Dashboard**
   - New order notifications
   - Prepare delivery workflow
   - Inventory management

---

## 📝 TEST CHECKLIST

### Frontend Tests:
- [ ] Cart data loads correctly
- [ ] Price calculation accurate
- [ ] Form validation works
- [ ] Error handling works
- [ ] Loading states display
- [ ] Empty cart handled
- [ ] Mobile responsive
- [ ] Accessibility (keyboard navigation)

### Backend Tests:
- [ ] Order creation API works
- [ ] Multiple orders created correctly
- [ ] Inventory reserved properly
- [ ] Cart cleared after checkout
- [ ] Deal type preserved
- [ ] Rental duration saved
- [ ] Notifications sent

### Integration Tests:
- [ ] End-to-end flow works
- [ ] Database transactions atomic
- [ ] Error rollback works
- [ ] Concurrent requests handled

---

**✅ READY TO TEST!**

URL: http://localhost:3001/orders/checkout
