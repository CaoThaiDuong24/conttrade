# BÁO CÁO: NAVIGATION VÀ MARK AS READ CHO NOTIFICATION

## 📅 Ngày: 20/10/2025

## ✅ ĐÃ TRIỂN KHAI

### 1. Click Notification → Navigate to Detail Page
Khi user click vào notification, hệ thống sẽ:
1. Đóng dropdown
2. Mark notification as read (nếu chưa đọc)
3. Navigate đến trang chi tiết tương ứng

### 2. Navigation Rules

| Notification Type | Recipient | Navigate To | Example |
|------------------|-----------|-------------|---------|
| `rfq_received` | Seller | `/vi/rfq/received/{rfqId}` | Seller xem RFQ chi tiết |
| `quote_received` | Buyer | `/vi/rfq/sent/{rfqId}` | Buyer xem Quote trong RFQ |
| `quote_accepted` | Seller | `/vi/orders/{orderId}` | Seller xem Order mới tạo |
| `quote_rejected` | Seller | `/vi/quotes/{quoteId}` | Seller xem Quote bị reject |
| `order_created` | Buyer/Seller | `/vi/orders/{orderId}` | Xem Order detail |
| `payment_received` | Seller | `/vi/orders/{orderId}` | Xem Order đã thanh toán |

### 3. Visual Improvements

#### Icon cho mỗi loại notification:
- 📋 `rfq_received` - RFQ mới (blue)
- 💰 `quote_received` - Quote mới (green)
- ✅ `quote_accepted` - Quote được chấp nhận (emerald)
- ❌ `quote_rejected` - Quote bị từ chối (red)
- 📦 `order_created` - Order mới (purple)
- 💵 `payment_received` - Thanh toán (yellow)

#### Layout:
```
[Icon] [Title + Message + Time] [• Unread]
  📋   Yêu cầu báo giá mới      •
       Buyer đã gửi yêu cầu...
       5 giờ trước
```

## 📝 CODE IMPLEMENTATION

### File: `components/notifications/simple-notification-bell.tsx`

#### 1. Import useRouter:
```typescript
import { useRouter } from 'next/navigation';

export function SimpleNotificationBell() {
  const router = useRouter();
  // ...
}
```

#### 2. Mark as Read Function:
```typescript
const markAsRead = async (notificationId: string) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/${notificationId}/read`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      console.log('✅ Marked notification as read:', notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  } catch (error) {
    console.error('❌ Error marking as read:', error);
  }
};
```

#### 3. Get Navigation Path:
```typescript
const getNavigationPath = (notification: Notification): string | null => {
  const data = notification.data || {};
  
  switch (notification.type) {
    case 'rfq_received':
      return data.rfqId ? `/vi/rfq/received/${data.rfqId}` : '/vi/rfq/received';
    
    case 'quote_received':
      return data.rfqId ? `/vi/rfq/sent/${data.rfqId}` : '/vi/rfq/sent';
    
    case 'quote_accepted':
      return data.orderId ? `/vi/orders/${data.orderId}` : '/vi/orders';
    
    case 'quote_rejected':
      return data.quoteId ? `/vi/quotes/${data.quoteId}` : '/vi/quotes';
    
    case 'order_created':
      return data.orderId ? `/vi/orders/${data.orderId}` : '/vi/orders';
    
    case 'payment_received':
      return data.orderId ? `/vi/orders/${data.orderId}` : '/vi/orders';
    
    default:
      console.warn('Unknown notification type:', notification.type);
      return null;
  }
};
```

#### 4. Handle Click:
```typescript
const handleNotificationClick = async (notification: Notification) => {
  console.log('📬 Notification clicked:', notification);
  
  // Close dropdown
  setIsOpen(false);
  
  // Mark as read if not already
  if (!notification.read) {
    await markAsRead(notification.id);
  }
  
  // Navigate
  const path = getNavigationPath(notification);
  if (path) {
    console.log('🔗 Navigating to:', path);
    router.push(path);
  } else {
    console.log('⚠️ No navigation path for this notification');
  }
};
```

#### 5. Icon & Color Functions:
```typescript
const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'rfq_received': return '📋';
    case 'quote_received': return '💰';
    case 'quote_accepted': return '✅';
    case 'quote_rejected': return '❌';
    case 'order_created': return '📦';
    case 'payment_received': return '💵';
    default: return '🔔';
  }
};

const getNotificationColor = (type: string): string => {
  switch (type) {
    case 'rfq_received': return 'text-blue-600';
    case 'quote_received': return 'text-green-600';
    case 'quote_accepted': return 'text-emerald-600';
    case 'quote_rejected': return 'text-red-600';
    case 'order_created': return 'text-purple-600';
    case 'payment_received': return 'text-yellow-600';
    default: return 'text-gray-600';
  }
};
```

#### 6. Updated JSX:
```tsx
<div onClick={() => handleNotificationClick(notification)}>
  <div className="flex items-start justify-between gap-2">
    {/* Icon */}
    <div className={`text-2xl ${getNotificationColor(notification.type)}`}>
      {getNotificationIcon(notification.type)}
    </div>
    
    {/* Content */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium">{notification.title}</p>
      <p className="text-xs text-gray-600">{notification.message}</p>
      <p className="text-xs text-gray-400">{formatDate(notification.created_at)}</p>
    </div>
    
    {/* Unread dot */}
    {!notification.read && (
      <div className="h-2 w-2 bg-blue-600 rounded-full" />
    )}
  </div>
</div>
```

## 🧪 CÁCH TEST

### Test 1: RFQ Notification (Seller)
1. **Tạo RFQ** (as buyer)
2. **Login as seller**
3. **Click bell** 🔔 → Thấy notification "Yêu cầu báo giá mới" với icon 📋
4. **Click notification** → Navigate to `/vi/rfq/received/{rfqId}`
5. **Check**: 
   - ✅ Notification marked as read (background không xanh nữa)
   - ✅ Unread count giảm
   - ✅ Navigate đúng trang RFQ detail

### Test 2: Quote Notification (Buyer)
1. **Tạo Quote** (as seller)
2. **Login as buyer**
3. **Click bell** → Thấy "Báo giá mới" với icon 💰
4. **Click notification** → Navigate to `/vi/rfq/sent/{rfqId}`
5. **Check**: Thấy quote trong RFQ detail

### Test 3: Quote Accepted (Seller)
1. **Accept quote** (as buyer)
2. **Login as seller**
3. **Click bell** → Thấy "Báo giá được chấp nhận" với icon ✅
4. **Click notification** → Navigate to `/vi/orders/{orderId}`
5. **Check**: Thấy order mới được tạo

### Test 4: Quote Rejected (Seller)
1. **Reject quote** (as buyer)
2. **Login as seller**
3. **Click bell** → Thấy "Báo giá bị từ chối" với icon ❌
4. **Click notification** → Navigate to `/vi/quotes/{quoteId}`
5. **Check**: Thấy quote với status rejected

### Test 5: Multiple Clicks
1. Click notification → navigate
2. Back button → return to page
3. Click bell again
4. **Check**: Notification đã marked as read (không có dot xanh)

## 📊 API ENDPOINTS USED

### 1. Get Notifications
```
GET /api/v1/notifications
Authorization: Bearer {token}

Response:
{
  success: true,
  data: [
    {
      id: "notif-123",
      type: "rfq_received",
      title: "Yêu cầu báo giá mới",
      message: "Buyer đã gửi yêu cầu...",
      read: false,
      data: {
        rfqId: "rfq-456",
        listingId: "listing-789",
        buyerName: "John Doe"
      }
    }
  ]
}
```

### 2. Mark as Read
```
POST /api/v1/notifications/{id}/read
Authorization: Bearer {token}

Response:
{
  success: true,
  message: "Notification marked as read"
}
```

## 🎨 UI/UX IMPROVEMENTS

### Before:
```
[🔔] Yêu cầu báo giá mới
     Buyer đã gửi yêu cầu...
     5 giờ trước
     • (blue dot)
```

### After:
```
[📋] Yêu cầu báo giá mới        •
     Buyer đã gửi yêu cầu...
     5 giờ trước
```

### Benefits:
- ✅ **Visual clarity**: Icon giúp nhận diện nhanh loại notification
- ✅ **Color coding**: Màu sắc tương ứng với action (green=good, red=bad)
- ✅ **Better spacing**: Icon cách xa content, dễ scan
- ✅ **Consistent layout**: 3-column structure (Icon | Content | Indicator)

## 🔧 TROUBLESHOOTING

### Problem 1: Navigation không hoạt động
**Debug**:
```javascript
// Check console logs
📬 Notification clicked: {...}
🔗 Navigating to: /vi/rfq/received/xxx

// If no log, check onClick attached correctly
// If path is null, check notification.data has correct fields
```

### Problem 2: Mark as read failed
**Debug**:
```javascript
// Check console
✅ Marked notification as read: notif-123
// Or
❌ Error marking as read: {...}

// Check network tab
POST /api/v1/notifications/xxx/read
Status: 200 (success) or 4xx/5xx (error)
```

### Problem 3: State không update
**Debug**:
```typescript
// After markAsRead, check:
console.log('Notifications:', notifications);
console.log('Unread count:', unreadCount);

// Should see notification.read changed to true
// Should see unreadCount decreased by 1
```

### Problem 4: Icon không hiển thị
**Check**:
- Emoji có hỗ trợ trên OS/browser?
- className có đúng?
- `text-2xl` có apply được?

**Solution**: Dùng lucide-react icons thay emoji nếu cần:
```typescript
import { FileText, DollarSign, Check, X, Package, CreditCard } from 'lucide-react';
```

## 📝 NOTIFICATION DATA STRUCTURE

Backend phải đảm bảo `data` field có đủ thông tin:

```typescript
// RFQ Received
{
  type: 'rfq_received',
  data: {
    rfqId: 'rfq-123',        // ← Required for navigation
    listingId: 'listing-456',
    buyerName: 'John'
  }
}

// Quote Received
{
  type: 'quote_received',
  data: {
    quoteId: 'quote-123',
    rfqId: 'rfq-456',        // ← Required for navigation
    sellerName: 'Jane'
  }
}

// Quote Accepted
{
  type: 'quote_accepted',
  data: {
    quoteId: 'quote-123',
    orderId: 'order-789',     // ← Required for navigation
    orderNumber: 'ORD-001'
  }
}
```

## ⚠️ LƯU Ý

1. **Navigation paths phải tồn tại**: Đảm bảo routes `/vi/rfq/received/:id`, `/vi/rfq/sent/:id`, etc. đã được define

2. **Permission check**: Nếu user không có quyền xem page, cần handle redirect hoặc show error

3. **Data validation**: Check `notification.data` có đầy đủ fields trước khi navigate

4. **Error handling**: Nếu navigate failed, show toast notification cho user

5. **Optimistic update**: Mark as read ngay lập tức ở UI, không chờ API response

## 🎯 KẾT QUẢ MONG ĐỢI

### User Experience:
1. **Click notification** → Smooth transition
2. **Page loads** → Đúng detail cần xem
3. **Back button** → Return to previous page
4. **Notification marked** → Badge count giảm, visual feedback

### Performance:
- ✅ Mark as read: < 200ms
- ✅ Navigation: < 500ms (depends on page complexity)
- ✅ State update: Immediate (optimistic)

### Visual:
- ✅ Icon colors match action type
- ✅ Read/Unread states clear
- ✅ Smooth animations
- ✅ Consistent spacing

---

**Status**: ✅ HOÀN THÀNH
**Testing**: ⏳ Chờ user test
**Next Steps**: Test toàn bộ flow end-to-end
