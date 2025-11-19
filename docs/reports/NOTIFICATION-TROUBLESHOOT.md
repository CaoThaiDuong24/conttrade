# 🔔 Notification Troubleshooting Guide

## Vấn đề hiện tại
- ❌ Người mua chưa nhận được thông báo khi có Quote mới
- ❌ Người bán chưa nhận được thông báo khi có RFQ mới  
- ❌ Click vào thông báo chưa nhảy đến đúng link

## ✅ Code đã được implement

### 1. Backend Notifications (READY)

#### RFQ Created → Notify Seller
File: `backend/src/routes/rfqs.ts` (line ~363-383)
```typescript
await NotificationService.createNotification({
  userId: rfq.listings.seller_user_id,  // ← Seller nhận thông báo
  type: 'rfq_received',
  title: 'Yêu cầu báo giá mới',
  message: `${buyerName} đã gửi yêu cầu báo giá cho ${listingTitle}`,
  orderData: { rfqId, listingId, buyerName, quantity, purpose }
});
```

#### Quote Created → Notify Buyer
File: `backend/src/routes/quotes.ts` (line ~387-407)
```typescript
await NotificationService.createNotification({
  userId: rfqData.buyer_user_id,  // ← Buyer nhận thông báo
  type: 'quote_received',
  title: 'Báo giá mới',
  message: `${sellerName} đã gửi báo giá cho yêu cầu của bạn - ${listingTitle}`,
  orderData: { quoteId, rfqId, sellerName, total, currency }
});
```

### 2. Frontend Navigation (READY)

File: `components/notifications/simple-notification-bell.tsx`

```typescript
const getNavigationPath = (notification: Notification): string | null => {
  switch (notification.type) {
    case 'rfq_received':
      // Seller nhận RFQ → đi tới RFQ detail trong "Received" tab
      return data.rfqId ? `/vi/rfq/received/${data.rfqId}` : '/vi/rfq/received';
    
    case 'quote_received':
      // Buyer nhận Quote → đi tới RFQ detail để xem quote
      return data.rfqId ? `/vi/rfq/sent/${data.rfqId}` : '/vi/rfq/sent';
    
    case 'quote_accepted':
      return data.orderId ? `/vi/orders/${data.orderId}` : '/vi/orders';
    
    case 'quote_rejected':
      return data.quoteId ? `/vi/quotes/${data.quoteId}` : '/vi/quotes';
    
    case 'order_created':
      return data.orderId ? `/vi/orders/${data.orderId}` : '/vi/orders';
    
    case 'payment_received':
      return data.orderId ? `/vi/orders/${data.orderId}` : '/vi/orders';
  }
};
```

## 🔧 Giải pháp: RESTART BACKEND

### Bước 1: Stop Backend hiện tại
```powershell
# Tìm process Node.js đang chạy
Get-Process -Name node | Stop-Process -Force
```

### Bước 2: Rebuild Backend
```powershell
cd backend
npm run build
```

### Bước 3: Start Backend
```powershell
npm run dev
```

### Bước 4: Verify Backend Running
Kiểm tra console log phải thấy:
```
Server listening at http://0.0.0.0:3006
```

## 🧪 Test Notifications

### Test 1: Create RFQ (as Buyer)
1. Login as Buyer
2. Tạo RFQ mới cho một listing
3. **Check backend console** → phải thấy:
   ```
   ✅ Sent RFQ notification to seller: seller-user-id
   ```
4. Login as Seller → Click bell icon → phải thấy thông báo "Yêu cầu báo giá mới"

### Test 2: Create Quote (as Seller)  
1. Login as Seller
2. Vào RFQ received → tạo Quote
3. **Check backend console** → phải thấy:
   ```
   ✅ Sent Quote notification to buyer: buyer-user-id
   ```
4. Login as Buyer → Click bell icon → phải thấy thông báo "Báo giá mới"

### Test 3: Navigation
1. Click vào notification
2. Phải tự động navigate đến đúng trang:
   - **rfq_received** → `/vi/rfq/received/{rfqId}`
   - **quote_received** → `/vi/rfq/sent/{rfqId}`
   - **order_created** → `/vi/orders/{orderId}`

## 📊 Debug Commands

### Check Notifications in Database
```javascript
// Run: node backend/check-latest-notifications.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const notifications = await prisma.notifications.findMany({
    orderBy: { created_at: 'desc' },
    take: 10
  });
  
  console.log(`Found ${notifications.length} notifications:\n`);
  notifications.forEach((n, i) => {
    console.log(`${i + 1}. ${n.type} - ${n.title}`);
    console.log(`   User: ${n.user_id}`);
    console.log(`   Read: ${n.read}`);
    console.log(`   Created: ${n.created_at}`);
    console.log(`   Data:`, n.data);
  });
  
  await prisma.$disconnect();
}

check();
```

### Check Backend Process
```powershell
# Is backend running?
netstat -ano | findstr :3006

# Check Node processes
Get-Process -Name node | Select-Object Id,StartTime,CPU
```

## ✅ Success Criteria

- [ ] Backend restart thành công (port 3006)
- [ ] Create RFQ → Seller nhận notification
- [ ] Create Quote → Buyer nhận notification  
- [ ] Click notification → Navigate đến đúng page
- [ ] Bell icon hiển thị số unread đúng
- [ ] Mark as read hoạt động

## 🚨 Common Issues

### Issue 1: Backend chưa restart
**Symptom**: Code có nhưng không tạo notification
**Solution**: Restart backend với `npm run dev`

### Issue 2: Console log không thấy
**Symptom**: Không thấy "✅ Sent notification to..."
**Solution**: 
- Check backend terminal có đang chạy không
- Check có error trong backend log không

### Issue 3: Notification không hiện trong UI
**Symptom**: Database có notification nhưng UI không hiện
**Solution**:
- Check localStorage có accessToken không
- Check API call `/api/v1/notifications` có 200 OK không
- Refresh page hoặc click bell icon lại

### Issue 4: Click notification không navigate
**Symptom**: Click vào nhưng không chuyển trang
**Solution**: 
- Check `notification.data` có `rfqId`/`orderId` không
- Check route có tồn tại không (ví dụ: `/vi/rfq/sent/...`)

## 📞 Next Steps

1. **RESTART BACKEND** (quan trọng nhất!)
2. Test tạo RFQ mới
3. Test tạo Quote mới
4. Verify notifications xuất hiện
5. Test navigation khi click

---

**⚠️ LƯU Ý**: Phải restart backend SAU KHI `npm run build` để code mới được load!
