# Hướng Dẫn Test Hệ Thống Notifications cho RFQ và Quote

## 📋 Checklist Test

### ✅ Chuẩn Bị
- [x] Backend server đã chạy trên port 3006
- [x] Bảng notifications đã được tạo
- [x] Frontend đã được cập nhật với NotificationBell component
- [x] Có 2 tài khoản: 1 buyer và 1 seller

### 🧪 Test Case 1: RFQ Notification

#### Bước thực hiện:
1. **Đăng nhập với tài khoản Buyer**
   - Email: buyer@test.com (hoặc buyer test khác)
   - Mật khẩu: password123

2. **Tạo RFQ mới**
   - Vào trang Listings: http://localhost:3000/vi/listings
   - Chọn một listing bất kỳ
   - Click "Yêu cầu báo giá" hoặc "Request Quote"
   - Điền form RFQ:
     - Purpose: Purchase/Sale
     - Quantity: 10
     - Need by: Chọn ngày trong tương lai
     - Services: Có thể để trống
   - Submit form

3. **Kiểm tra Seller có nhận notification không**
   - Đăng xuất tài khoản Buyer
   - Đăng nhập với tài khoản Seller (owner của listing vừa chọn)
   - Kiểm tra NotificationBell (icon chuông ở header)
   - Sẽ thấy:
     - Badge đỏ hiển thị số notifications chưa đọc
     - Click vào sẽ thấy notification:
       - Title: "Yêu cầu báo giá mới"
       - Icon: Bell màu tím
       - Message: "Bạn có yêu cầu báo giá mới cho sản phẩm [Tên listing]"

#### Kết quả mong đợi:
✅ Seller nhận được notification
✅ Notification có icon màu tím
✅ Notification hiển thị đúng thông tin
✅ Click vào notification đánh dấu đã đọc
✅ Badge số giảm đi khi đã đọc

---

### 🧪 Test Case 2: Quote Notification

#### Bước thực hiện:
1. **Đăng nhập với tài khoản Seller**
   - Vào trang RFQs Received: http://localhost:3000/vi/rfq?view=received
   - Chọn RFQ vừa tạo ở Test Case 1
   - Click "Tạo báo giá" hoặc "Create Quote"

2. **Tạo Quote**
   - Điền form Quote:
     - Price: 10000000 VND
     - Valid days: 7
     - Items: Điền thông tin containers
   - Submit form

3. **Kiểm tra Buyer có nhận notification không**
   - Đăng xuất tài khoản Seller
   - Đăng nhập lại với tài khoản Buyer
   - Kiểm tra NotificationBell
   - Sẽ thấy:
     - Badge đỏ hiển thị có notification mới
     - Click vào sẽ thấy notification:
       - Title: "Báo giá mới"
       - Icon: Bell màu indigo
       - Message: "Bạn có báo giá mới cho yêu cầu của mình..."

#### Kết quả mong đợi:
✅ Buyer nhận được notification
✅ Notification có icon màu indigo
✅ Notification hiển thị đúng thông tin quote
✅ Click notification chuyển đến trang quote detail

---

### 🧪 Test Case 3: Quote Accepted Notification

#### Bước thực hiện:
1. **Đăng nhập với tài khoản Buyer**
   - Vào trang My RFQs: http://localhost:3000/vi/rfq?view=sent
   - Chọn RFQ đã có quote
   - Xem quote detail
   - Click "Chấp nhận báo giá" hoặc "Accept Quote"

2. **Kiểm tra Seller có nhận notification không**
   - Đăng xuất và đăng nhập với tài khoản Seller
   - Kiểm tra NotificationBell
   - Sẽ thấy notification:
     - Title: "Báo giá được chấp nhận"
     - Icon: CheckCircle màu xanh lá
     - Message: "Báo giá của bạn đã được chấp nhận. Đơn hàng [ORDER_NUMBER] đã được tạo."

#### Kết quả mong đợi:
✅ Seller nhận được notification
✅ Notification có icon CheckCircle màu xanh
✅ Notification hiển thị order number
✅ Click notification chuyển đến order detail

---

### 🧪 Test Case 4: Quote Rejected Notification

#### Bước thực hiện:
1. **Tạo quote mới** (lặp lại Test Case 2)

2. **Đăng nhập với tài khoản Buyer**
   - Xem quote detail
   - Click "Từ chối báo giá" hoặc "Reject Quote"

3. **Kiểm tra Seller có nhận notification không**
   - Đăng xuất và đăng nhập với tài khoản Seller
   - Kiểm tra NotificationBell
   - Sẽ thấy notification:
     - Title: "Báo giá bị từ chối"
     - Icon: XCircle màu đỏ
     - Message: "Báo giá của bạn đã bị từ chối bởi người mua."

#### Kết quả mong đợi:
✅ Seller nhận được notification
✅ Notification có icon XCircle màu đỏ
✅ Notification hiển thị đúng thông tin

---

## 🔍 Debug và Troubleshooting

### 1. Không nhận được notification
**Kiểm tra:**
```bash
# Kiểm tra backend logs
# Trong terminal backend, tìm dòng:
✅ RFQ notification sent to seller: [USER_ID]
✅ Quote notification sent to buyer: [USER_ID]
```

**Nếu không thấy log:**
- Kiểm tra lại code trong `backend/dist/routes/rfqs.js` và `quotes.js`
- Đảm bảo NotificationService được import đúng

**Kiểm tra database:**
```sql
-- Kiểm tra notifications trong database
SELECT * FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;

-- Kiểm tra notifications của một user
SELECT * FROM notifications 
WHERE user_id = 'USER_ID_HERE'
ORDER BY created_at DESC;
```

### 2. Badge không hiển thị số đúng
**Kiểm tra:**
- Mở Developer Tools (F12)
- Vào tab Network
- Reload trang
- Tìm request đến `/api/v1/notifications`
- Xem response data

**Nếu response trống:**
- Kiểm tra token authentication
- Kiểm tra user_id trong database có khớp không

### 3. Icon không hiển thị đúng màu
**Kiểm tra:**
- Mở `components/notifications/notification-bell.tsx`
- Kiểm tra function `getNotificationIcon`
- Đảm bảo type từ backend khớp với type trong frontend

### 4. Click notification không chuyển trang
**Hiện tại:** Chưa implement navigation khi click
**TODO:** Cần thêm onClick handler để navigate đến trang tương ứng

---

## 📊 Kiểm Tra Dữ Liệu

### Query kiểm tra notifications
```sql
-- Tất cả notifications
SELECT 
  id,
  user_id,
  type,
  title,
  read,
  created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 20;

-- Notifications theo type
SELECT 
  type,
  COUNT(*) as count,
  SUM(CASE WHEN read = FALSE THEN 1 ELSE 0 END) as unread
FROM notifications
GROUP BY type;

-- Notifications của một user cụ thể
SELECT * FROM notifications
WHERE user_id = 'user-buyer'
ORDER BY created_at DESC;
```

### API Endpoints để test manual

#### 1. Get Notifications
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3006/api/v1/notifications
```

#### 2. Mark as Read
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3006/api/v1/notifications/NOTIF_ID/read
```

---

## 🎯 Test Automation (Optional)

### Script kiểm tra nhanh
```javascript
// test-notification-flow.js
async function testNotificationFlow() {
  // 1. Create RFQ
  const rfq = await createRFQ({
    listing_id: 'listing-id',
    buyer_id: 'user-buyer',
    // ...
  });

  // 2. Check seller notification
  const sellerNotifs = await getNotifications('user-seller');
  console.assert(sellerNotifs.length > 0, 'Seller should have notification');

  // 3. Create Quote
  const quote = await createQuote({
    rfq_id: rfq.id,
    seller_id: 'user-seller',
    // ...
  });

  // 4. Check buyer notification
  const buyerNotifs = await getNotifications('user-buyer');
  console.assert(buyerNotifs.length > 0, 'Buyer should have notification');

  console.log('✅ All tests passed!');
}
```

---

## 📝 Ghi Chú

### Notification Types
- `rfq_received` - Seller nhận khi có RFQ mới
- `quote_received` - Buyer nhận khi có quote mới
- `quote_accepted` - Seller nhận khi quote được chấp nhận
- `quote_rejected` - Seller nhận khi quote bị từ chối

### Refresh Rate
- NotificationBell tự động refresh mỗi 30 giây
- Có thể click "Làm mới thông báo" để refresh thủ công

### Browser Storage
- Access token được lưu trong localStorage
- Key: `accessToken`
- Cần đăng nhập để có token

---

## ✅ Checklist Hoàn Thành

### Backend
- [x] Thêm notification khi tạo RFQ
- [x] Thêm notification khi tạo Quote
- [x] Thêm notification khi accept Quote
- [x] Thêm notification khi reject Quote
- [x] Tạo bảng notifications
- [x] Tạo indexes cho performance
- [x] Error handling đúng cách

### Frontend
- [x] Cập nhật NotificationBell component
- [x] Thêm các type mới
- [x] Thêm icon và màu sắc
- [x] Auto-refresh notifications
- [x] Mark as read functionality

### Testing
- [ ] Test RFQ notification
- [ ] Test Quote notification
- [ ] Test Accept notification
- [ ] Test Reject notification
- [ ] Test với multiple users
- [ ] Test performance với nhiều notifications

---

**Người tạo:** GitHub Copilot  
**Ngày tạo:** 20/10/2025  
**Version:** 1.0
