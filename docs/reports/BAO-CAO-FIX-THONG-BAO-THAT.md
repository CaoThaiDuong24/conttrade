# BÁO CÁO: FIX THÔNG BÁO THẬT TỪ RFQ/QUOTE

## 📅 Ngày: 20/10/2025

## ❌ VẤN ĐỀ
**"Hiện tại vẫn chưa nhận được thông báo mới từ seller cũng như buyer"**

### Nguyên nhân:
Backend đang dùng `ListingNotificationService` (service cũ) thay vì `NotificationService` mới, và thiếu notification ở nhiều điểm.

## 🔍 PHÁT HIỆN

### 1. RFQs Route (backend/src/routes/rfqs.ts)
```typescript
// ❌ CŨ - Dùng service cũ
import ListingNotificationService from '../lib/notifications/listing-notifications';
await ListingNotificationService.notifyRfqReceived(...);

// ✅ MỚI - Dùng NotificationService
import { NotificationService } from '../lib/notifications/notification-service';
await NotificationService.createNotification({...});
```

### 2. Quotes Route (backend/src/routes/quotes.ts)
```typescript
// ❌ CŨ - Không có notification
// Không có import notification service
// Không có gọi createNotification

// ✅ MỚI - Thêm đầy đủ
import { NotificationService } from '../lib/notifications/notification-service';
// Thêm notification ở 3 điểm
```

## ✅ GIẢI PHÁP ĐÃ TRIỂN KHAI

### File 1: `backend/src/routes/rfqs.ts`

#### Import mới:
```typescript
import { NotificationService } from '../lib/notifications/notification-service';
```

#### Notification khi tạo RFQ (Line ~363):
```typescript
// 🔔 Notify seller about new RFQ
if (rfq.listings && rfq.users) {
  const buyerName = rfq.users.display_name || rfq.users.email || 'Người mua';
  const listingTitle = rfq.listings.title || 'Container';
  
  await NotificationService.createNotification({
    userId: rfq.listings.seller_user_id,
    type: 'rfq_received',
    title: 'Yêu cầu báo giá mới',
    message: `${buyerName} đã gửi yêu cầu báo giá cho ${listingTitle}`,
    orderData: {
      rfqId: rfq.id,
      listingId: rfq.listing_id,
      buyerName: buyerName,
      quantity: rfq.quantity,
      purpose: rfq.purpose
    }
  });
  
  console.log('✅ Sent RFQ notification to seller:', rfq.listings.seller_user_id);
}
```

### File 2: `backend/src/routes/quotes.ts`

#### Import mới:
```typescript
import { NotificationService } from '../lib/notifications/notification-service';
```

#### 1. Notification khi tạo Quote (Line ~387):
```typescript
// 🔔 Notify buyer about new quote
const rfqData = await prisma.rfqs.findUnique({
  where: { id: actualRfqId },
  include: {
    listings: { select: { title: true } },
    users: { select: { display_name: true, email: true } }
  }
});

if (rfqData) {
  const sellerName = (request.user as any).name || (request.user as any).email || 'Người bán';
  const listingTitle = rfqData.listings?.title || 'Container';
  
  await NotificationService.createNotification({
    userId: rfqData.buyer_user_id,
    type: 'quote_received',
    title: 'Báo giá mới',
    message: `${sellerName} đã gửi báo giá cho yêu cầu của bạn - ${listingTitle}`,
    orderData: {
      quoteId: quote.id,
      rfqId: actualRfqId,
      sellerName: sellerName,
      total: finalTotal,
      currency: finalCurrency
    }
  });
  
  console.log('✅ Sent Quote notification to buyer:', rfqData.buyer_user_id);
}
```

#### 2. Notification khi Accept Quote (Line ~1243):
```typescript
// 🔔 Notify seller about accepted quote
const buyerName = quote.rfqs.users?.display_name || quote.rfqs.users?.email || 'Người mua';
const listingTitle = quote.rfqs.listings?.title || 'Container';

await NotificationService.createNotification({
  userId: quote.seller_id,
  type: 'quote_accepted',
  title: 'Báo giá được chấp nhận',
  message: `${buyerName} đã chấp nhận báo giá của bạn cho ${listingTitle}`,
  orderData: {
    quoteId: id,
    orderId: order.id,
    orderNumber: orderNumber,
    buyerName: buyerName,
    total: total,
    currency: quote.currency
  }
});

console.log('✅ Sent Quote Accepted notification to seller:', quote.seller_id);
```

#### 3. Notification khi Reject Quote (Line ~1525):
```typescript
// 🔔 Notify seller about rejected quote
const buyerName = updatedQuote.rfqs.users?.display_name || updatedQuote.rfqs.users?.email || 'Người mua';
const listingTitle = updatedQuote.rfqs.listings?.title || 'Container';

await NotificationService.createNotification({
  userId: updatedQuote.seller_id,
  type: 'quote_rejected',
  title: 'Báo giá bị từ chối',
  message: `${buyerName} đã từ chối báo giá của bạn cho ${listingTitle}`,
  orderData: {
    quoteId: id,
    rfqId: updatedQuote.rfq_id,
    buyerName: buyerName,
    total: updatedQuote.total,
    currency: updatedQuote.currency
  }
});

console.log('✅ Sent Quote Rejected notification to seller:', updatedQuote.seller_id);
```

## 📊 NOTIFICATION TYPES

| Event | Type | Recipient | Title | Message |
|-------|------|-----------|-------|---------|
| RFQ Created | `rfq_received` | Seller | "Yêu cầu báo giá mới" | "{Buyer} đã gửi yêu cầu báo giá cho {Listing}" |
| Quote Created | `quote_received` | Buyer | "Báo giá mới" | "{Seller} đã gửi báo giá cho yêu cầu của bạn - {Listing}" |
| Quote Accepted | `quote_accepted` | Seller | "Báo giá được chấp nhận" | "{Buyer} đã chấp nhận báo giá của bạn cho {Listing}" |
| Quote Rejected | `quote_rejected` | Seller | "Báo giá bị từ chối" | "{Buyer} đã từ chối báo giá của bạn cho {Listing}" |

## 🧪 CÁCH TEST

### Bước 1: Rebuild Backend
```bash
cd backend
npm run build
```

### Bước 2: Restart Backend
```bash
npm run dev
```

### Bước 3: Verify Backend Running
```bash
# Check backend logs
# Should see: Server listening at http://0.0.0.0:3006
```

### Bước 4: Test RFQ Flow

#### 4.1. Login as Buyer
- Email: `buyer@example.com`
- Password: `password123`

#### 4.2. Create RFQ
1. Navigate to Listings page
2. Click on a listing
3. Click "Yêu cầu báo giá"
4. Fill form:
   - Purpose: Sale/Rental
   - Quantity: 1
   - Need by date: (select date)
5. Submit

#### 4.3. Check Backend Logs
```
Expected:
✅ Sent RFQ notification to seller: user-seller-xxx
```

#### 4.4. Login as Seller
- Email: `seller@example.com`
- Password: `password123`

#### 4.5. Check Notification
- Click bell icon 🔔
- Should see: "Yêu cầu báo giá mới"
- Message: "Người mua đã gửi yêu cầu báo giá cho ..."

### Bước 5: Test Quote Flow

#### 5.1. Create Quote (as Seller)
1. Go to "RFQ Received" page
2. Click on RFQ
3. Create quote
4. Submit

#### 5.2. Check Backend Logs
```
Expected:
✅ Sent Quote notification to buyer: user-buyer-xxx
```

#### 5.3. Login as Buyer
- Check bell icon
- Should see: "Báo giá mới"

### Bước 6: Test Accept/Reject

#### 6.1. Accept Quote (as Buyer)
1. Go to "RFQ Sent" page
2. Click RFQ with quote
3. Accept quote

#### 6.2. Check Seller Notification
- Login as seller
- Check bell icon
- Should see: "Báo giá được chấp nhận"

#### 6.3. Reject Quote (as Buyer)
1. Go to "RFQ Sent" page
2. Click RFQ with quote
3. Reject quote

#### 6.4. Check Seller Notification
- Should see: "Báo giá bị từ chối"

## 📁 FILES ĐÃ SỬA

1. ✅ `backend/src/routes/rfqs.ts`
   - Changed import: ListingNotificationService → NotificationService
   - Updated RFQ notification call with new format

2. ✅ `backend/src/routes/quotes.ts`
   - Added import: NotificationService
   - Added quote_received notification
   - Added quote_accepted notification
   - Added quote_rejected notification

3. ✅ `backend/test-notification-flow.js` (new)
   - Test script to verify data
   - Shows existing RFQs, Quotes, Notifications
   - Provides testing instructions

## 🔧 TROUBLESHOOTING

### Vấn đề 1: Backend không build
**Check**:
```bash
cd backend
npm run build
# Look for TypeScript errors
```

### Vấn đề 2: Notification không tạo
**Debug**:
```bash
# Check backend logs
# Should see console.log:
✅ Sent RFQ notification to seller: xxx
✅ Sent Quote notification to buyer: xxx
```

### Vấn đề 3: Database error
**Check**:
```bash
node backend/test-notification-flow.js
# Verify notifications table exists
```

### Vấn đề 4: Không thấy notification trong UI
**Verify**:
1. Backend logs show notification created? ✓
2. API returns notifications? `GET /api/v1/notifications` ✓
3. Frontend console shows data? F12 → Console ✓
4. Dropdown opens? Click bell icon ✓

## 📊 DATABASE SCHEMA

```sql
CREATE TABLE notifications (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  type VARCHAR NOT NULL,  -- rfq_received, quote_received, quote_accepted, quote_rejected
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  data JSONB,  -- {rfqId, quoteId, orderId, buyerName, sellerName, etc}
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 KẾT QUẢ MONG ĐỢI

### Backend Logs:
```
✅ Sent RFQ notification to seller: user-seller-xxx
✅ Sent Quote notification to buyer: user-buyer-xxx
✅ Sent Quote Accepted notification to seller: user-seller-xxx
✅ Sent Quote Rejected notification to seller: user-seller-xxx
```

### Frontend UI:
- ✅ Bell icon shows badge with count
- ✅ Click bell → dropdown opens
- ✅ Notifications display with Vietnamese messages
- ✅ Time format: "Vừa xong", "5 giờ trước", etc
- ✅ Unread notifications have blue background
- ✅ Click outside → dropdown closes (via Portal)

### Database:
```bash
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;
# Should show new notifications with correct user_id and type
```

## ⚠️ LƯU Ý

1. **Backend MUST be rebuilt**: `npm run build` sau khi sửa TypeScript
2. **Backend MUST be restarted**: `npm run dev` để load code mới
3. **Test accounts cần tồn tại**: seller@example.com, buyer@example.com
4. **Listings cần có seller_user_id**: Để notification gửi đúng người

## 📝 NEXT STEPS

1. ✅ Rebuild backend
2. ✅ Restart backend
3. ⏳ Test create RFQ → Seller nhận notification
4. ⏳ Test create Quote → Buyer nhận notification
5. ⏳ Test accept Quote → Seller nhận notification
6. ⏳ Test reject Quote → Seller nhận notification
7. ⏳ Verify overlay closes when clicking outside

---

**Status**: ✅ CODE HOÀN THÀNH - Chờ rebuild & test
**Action Required**: 
1. `cd backend; npm run build`
2. `npm run dev`
3. Test flow theo hướng dẫn trên
