# 🔍 DEBUG: Người Mua Chưa Nhận Được Thông Báo Quote

## Vấn đề hiện tại
- ❌ Seller tạo Quote → Buyer KHÔNG nhận được thông báo
- ✅ Buyer tạo RFQ → Seller ĐÃ nhận được thông báo (working!)

## ✅ Code đã có sẵn

### Backend Code (CONFIRMED)
File: `backend/dist/routes/quotes.js` (line 345-359)

```javascript
await NotificationService.createNotification({
    userId: rfqData.buyer_user_id,  // ← Buyer nhận thông báo
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
```

### Frontend Code (CONFIRMED)
File: `components/notifications/simple-notification-bell.tsx`

```typescript
case 'quote_received':
  // Buyer nhận Quote → đi tới RFQ detail để xem quote
  return data.rfqId ? `/vi/rfq/${data.rfqId}` : '/vi/rfq/sent';
```

## 🧪 TEST STEPS (Làm theo thứ tự)

### Step 1: Verify Backend Running
```powershell
# Check if backend is on port 3006
netstat -ano | findstr :3006
```

**Expected**: Should see something like:
```
TCP    0.0.0.0:3006    0.0.0.0:0    LISTENING    12345
```

### Step 2: Check Backend Logs
Backend console phải hiển thị:
```
✅ Server started successfully!
🌐 API running at http://localhost:3006
```

### Step 3: Create NEW Quote (CRITICAL!)

⚠️ **QUAN TRỌNG**: Phải tạo Quote MỚI sau khi backend restart!

1. **Login as Seller** (seller-001@mail.com)
2. Navigate to: **RFQ Received**
3. Click vào RFQ mới nhất (từ buyer-001@mail.com)
4. Click **"Create Quote"** button
5. Điền thông tin Quote:
   - Items: Add quote items
   - Total: Enter total amount
   - Valid days: 7
6. Click **"Submit Quote"**

### Step 4: Check Backend Console IMMEDIATELY

Sau khi submit Quote, backend console PHẢI hiển thị:
```
✅ Sent Quote notification to buyer: user-buyer
```

Nếu KHÔNG thấy log này → Quote notification code không được execute!

### Step 5: Verify Notification in Database

```powershell
node backend\quick-notif-check.js
```

Hoặc check trực tiếp database:
```sql
SELECT * FROM notifications 
WHERE type = 'quote_received' 
ORDER BY created_at DESC 
LIMIT 5;
```

### Step 6: Login as Buyer and Check

1. **Logout Seller**
2. **Login as Buyer** (buyer-001@mail.com)
3. **Click bell icon** 🔔 trong header
4. Should see: **"Báo giá mới"** notification

### Step 7: Test Navigation

Click vào notification → Should navigate to `/vi/rfq/{rfqId}`

---

## 🔧 TROUBLESHOOTING

### Scenario A: Backend log KHÔNG hiện
```
❌ Không thấy: "✅ Sent Quote notification to buyer"
```

**Problem**: Backend code không được execute

**Solutions**:
1. Backend chưa được restart sau `npm run build`
2. Đang test với Quote CŨ (created before restart)
3. Có error trong code (check backend error logs)

**Fix**:
```powershell
cd backend

# Stop backend (Ctrl+C)
# Then:
npm run build
npm run dev

# Wait for: "Server listening at http://0.0.0.0:3006"
# Then create NEW Quote
```

### Scenario B: Backend log CÓ hiện nhưng buyer không nhận
```
✅ Thấy: "✅ Sent Quote notification to buyer: user-xxx"
❌ Buyer không thấy notification
```

**Problem**: Database hoặc API issue

**Solutions**:
1. Check database có notification không:
   ```powershell
   node backend\quick-notif-check.js
   ```

2. Check API endpoint:
   - Open browser DevTools (F12)
   - Network tab
   - Click bell icon
   - Look for: `GET /api/v1/notifications`
   - Check response has notifications

3. Check user_id matching:
   - Notification user_id phải = logged in buyer user_id
   - Check localStorage: `localStorage.getItem('user')`

### Scenario C: Notification có trong DB nhưng không hiện UI
```
✅ Database có notification
❌ Frontend không hiển thị
```

**Problem**: Frontend issue

**Solutions**:
1. Hard refresh: `Ctrl + Shift + R`
2. Clear localStorage và login lại
3. Check console errors (F12 → Console)
4. Wait 30 seconds (auto-polling interval)

---

## 📊 Diagnostic Commands

### 1. Check Latest Quote and Notification
```powershell
node backend\quick-notif-check.js
```

**Expected Output**:
```
📊 LATEST QUOTE:
ID: quote-xxx
Created: 2025-10-20T09:15:00.000Z
Buyer ID: user-buyer
Buyer: buyer-001@mail.com

🔔 LATEST QUOTE NOTIFICATION:
ID: NOTIF-xxx
User: user-buyer
Title: Báo giá mới
Created: 2025-10-20T09:15:01.000Z

✅ They match! Notification was created for this quote
✅ Notification sent to CORRECT buyer!
```

### 2. Check All Buyer Notifications
```javascript
// Run in backend/check-buyer-notif.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.notifications.findMany({
  where: { user_id: 'user-buyer' }, // Replace with actual buyer ID
  orderBy: { created_at: 'desc' }
}).then(notifications => {
  console.log('Buyer notifications:', notifications.length);
  notifications.forEach(n => {
    console.log(`- ${n.type}: ${n.title} (${n.created_at})`);
  });
  prisma.$disconnect();
});
```

### 3. Manual Notification Test
```javascript
// Create test notification manually
const { NotificationService } = require('./backend/dist/lib/notifications/notification-service');

NotificationService.createNotification({
  userId: 'user-buyer', // Replace with actual buyer ID
  type: 'quote_received',
  title: 'TEST: Báo giá mới',
  message: 'This is a test notification',
  orderData: {
    quoteId: 'test-quote-123',
    rfqId: 'test-rfq-123',
    sellerName: 'Test Seller',
    total: 1000,
    currency: 'USD'
  }
}).then(() => {
  console.log('✅ Test notification created!');
  console.log('Login as buyer and check bell icon');
});
```

---

## ✅ Success Criteria

- [ ] Backend shows: `✅ Sent Quote notification to buyer: user-xxx`
- [ ] Database query returns notification with type='quote_received'
- [ ] Buyer sees notification in UI (bell icon shows count)
- [ ] Click notification navigates to `/vi/rfq/{rfqId}`
- [ ] Notification marked as read after click

---

## 🚨 Common Mistakes

### 1. Testing with OLD Quote
❌ **Wrong**: Using Quote created before backend restart
✅ **Correct**: Create NEW Quote AFTER backend restart

### 2. Not Checking Backend Logs
❌ **Wrong**: Only checking frontend/database
✅ **Correct**: ALWAYS check backend console log first!

### 3. Wrong User Login
❌ **Wrong**: Login as Seller to check Quote notification
✅ **Correct**: BUYER should receive Quote notification

### 4. Not Waiting for Polling
❌ **Wrong**: Expect immediate update
✅ **Correct**: Wait up to 30 seconds or refresh page

---

## 📝 Quick Checklist

Before reporting issue, verify:

- [ ] Backend is running (port 3006)
- [ ] Backend restarted AFTER `npm run build`
- [ ] Created NEW Quote (not testing old one)
- [ ] Backend log shows: "✅ Sent Quote notification to buyer"
- [ ] Checked database: `node backend\quick-notif-check.js`
- [ ] Logged in as BUYER (not seller)
- [ ] Clicked bell icon or waited 30s
- [ ] Checked browser console for errors (F12)
- [ ] Verified token in localStorage

---

## 💡 Next Steps

1. **Stop and restart backend properly**:
   ```powershell
   cd backend
   npm run build    # Build new code
   npm run dev      # Start server
   ```

2. **Create NEW Quote** as Seller

3. **Watch backend console** for log message

4. **Run diagnostic**:
   ```powershell
   node backend\quick-notif-check.js
   ```

5. **Login as Buyer** and check notifications

6. **Report back** với:
   - Backend console log (có thấy "✅ Sent Quote notification" không?)
   - Output của `quick-notif-check.js`
   - Screenshot of buyer's notification dropdown (nếu có)

---

**📞 Need Help?**

Gửi cho mình:
1. Backend console output khi create Quote
2. Output của `node backend\quick-notif-check.js`
3. Screenshot của notification dropdown (as buyer)
4. Browser console errors (if any)
