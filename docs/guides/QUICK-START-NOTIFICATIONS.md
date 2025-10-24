# 🚀 HƯỚNG DẪN NHANH: KÍCH HOẠT THÔNG BÁO

## ⚡ 3 BƯỚC ĐƠN GIẢN

### 1️⃣ REBUILD BACKEND (BẮT BUỘC)
```bash
cd backend
npm run build
```
**Chờ**: `✔ Built in XXXms`

### 2️⃣ RESTART BACKEND
```bash
npm run dev
```
**Chờ**: `Server listening at http://0.0.0.0:3006`

### 3️⃣ TEST NGAY

#### Test RFQ Notification:
1. **Login as buyer**: `buyer@example.com` / `password123`
2. **Tạo RFQ**: Go to listing → Click "Yêu cầu báo giá" → Submit
3. **Check backend log**: Phải thấy `✅ Sent RFQ notification to seller`
4. **Login as seller**: `seller@example.com` / `password123`
5. **Click chuông 🔔**: Phải thấy "Yêu cầu báo giá mới"

#### Test Quote Notification:
1. **Login as seller**: Create quote for RFQ
2. **Check log**: `✅ Sent Quote notification to buyer`
3. **Login as buyer**: Click chuông → Thấy "Báo giá mới"

---

## 🔍 VERIFY NHANH

### Check Backend Running:
```bash
# Terminal should show:
Server listening at http://0.0.0.0:3006
```

### Check Notifications Work:
```bash
node backend/test-notification-flow.js
```

### Check API:
```bash
# In browser console (F12):
fetch('http://localhost:3006/api/v1/notifications', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
  }
}).then(r => r.json()).then(console.log)
```

---

## ✅ ĐÃ SỬA GÌ?

### Backend Routes:
- ✅ `backend/src/routes/rfqs.ts` - RFQ notification
- ✅ `backend/src/routes/quotes.ts` - Quote notifications (3 types)

### Notification Types:
| Event | Recipient | Message |
|-------|-----------|---------|
| RFQ Created | Seller | "Yêu cầu báo giá mới" |
| Quote Created | Buyer | "Báo giá mới" |
| Quote Accepted | Seller | "Báo giá được chấp nhận" |
| Quote Rejected | Seller | "Báo giá bị từ chối" |

---

## 🐛 NẾU KHÔNG HOẠT ĐỘNG

### 1. Check Backend Built?
```bash
ls backend/dist/routes/rfqs.js
ls backend/dist/routes/quotes.js
# Should exist with recent timestamp
```

### 2. Check Backend Logs
```
Should see:
✅ Sent RFQ notification to seller: xxx
✅ Sent Quote notification to buyer: xxx
```

### 3. Check Database
```bash
node backend/test-notification-flow.js
# Should show notifications in database
```

### 4. Clear Browser Cache
```
Ctrl + Shift + Delete → Clear cache
Ctrl + F5 → Hard refresh
```

---

## 📞 SUPPORT

**Nếu vẫn không hoạt động**:
1. Send screenshot backend terminal
2. Send screenshot browser console (F12)
3. Send output của: `node backend/test-notification-flow.js`

---

**Thời gian**: ~5 phút  
**Độ khó**: ⭐ (Chỉ cần rebuild & restart)
