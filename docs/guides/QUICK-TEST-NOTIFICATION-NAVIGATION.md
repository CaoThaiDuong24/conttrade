# ✅ QUICK TEST: NOTIFICATION NAVIGATION

## 🚀 TEST NGAY (3 PHÚT)

### 1️⃣ Test RFQ Notification

**As Buyer** (buyer@example.com):
1. Tạo RFQ mới cho một listing
2. Submit form

**As Seller** (seller@example.com):
1. Login
2. Click chuông 🔔
3. Thấy: **📋 "Yêu cầu báo giá mới"** (icon màu xanh)
4. **Click vào notification**
5. Expected:
   - ✅ Navigate to RFQ detail page
   - ✅ Notification không còn dot xanh (marked as read)
   - ✅ Badge count giảm

---

### 2️⃣ Test Quote Notification

**As Seller** (seller@example.com):
1. Go to RFQ Received page
2. Create quote
3. Submit

**As Buyer** (buyer@example.com):
1. Login
2. Click chuông 🔔
3. Thấy: **💰 "Báo giá mới"** (icon màu xanh lá)
4. **Click vào notification**
5. Expected:
   - ✅ Navigate to RFQ detail (with quote shown)
   - ✅ Notification marked as read
   - ✅ Can see quote details

---

### 3️⃣ Test Quote Accept

**As Buyer** (buyer@example.com):
1. Go to RFQ Sent page
2. Find RFQ with quote
3. Click "Accept Quote"

**As Seller** (seller@example.com):
1. Login
2. Click chuông 🔔
3. Thấy: **✅ "Báo giá được chấp nhận"** (icon màu xanh lục)
4. **Click vào notification**
5. Expected:
   - ✅ Navigate to Order page
   - ✅ See new order created
   - ✅ Notification marked as read

---

## 🔍 VERIFY CHECKLIST

### Visual:
- [ ] Icon hiển thị đúng cho mỗi loại notification
- [ ] Màu sắc khác nhau cho mỗi type
- [ ] Unread có dot xanh bên phải
- [ ] Read không có dot xanh
- [ ] Hover effect (background xám nhạt)

### Functional:
- [ ] Click notification → đóng dropdown
- [ ] Click notification → navigate đúng page
- [ ] Click notification → mark as read
- [ ] Badge count update real-time
- [ ] Console log rõ ràng

### Performance:
- [ ] Mark as read < 200ms
- [ ] Navigation smooth, không lag
- [ ] State update immediately (optimistic)

---

## 📊 ICON LEGEND

| Icon | Type | Color | Navigate To |
|------|------|-------|-------------|
| 📋 | RFQ Received | Blue | RFQ Detail (Received) |
| 💰 | Quote Received | Green | RFQ Detail (Sent) |
| ✅ | Quote Accepted | Emerald | Order Detail |
| ❌ | Quote Rejected | Red | Quote Detail |
| 📦 | Order Created | Purple | Order Detail |
| 💵 | Payment Received | Yellow | Order Detail |

---

## 🐛 IF SOMETHING WRONG

### Navigation không hoạt động:
1. Check console: `🔗 Navigating to: /vi/...`
2. If no log → check onClick event
3. If path null → check notification.data

### Mark as read failed:
1. Check console: `✅ Marked notification as read`
2. Check network tab: POST /notifications/xxx/read
3. Check response status (should be 200)

### Icon không hiển thị:
1. Check emoji support
2. Check className applied
3. Try refresh cache (Ctrl+F5)

---

## 🎯 SUCCESS CRITERIA

✅ All 3 tests pass  
✅ Navigation works for all notification types  
✅ Mark as read updates immediately  
✅ Badge count accurate  
✅ Visual feedback clear  

---

**Time**: ~3 minutes  
**Difficulty**: ⭐ Easy  
**Status**: Ready to test
