# 🧪 QUICK TEST - ADMIN TOAST NOTIFICATIONS

**Mục tiêu:** Test nhanh approve/reject toast hiển thị góc phải  
**Thời gian:** ~5 phút

---

## 🚀 SETUP

### **1. Start Backend:**
```powershell
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web\backend"
npm run dev
```

**Verify:** Server chạy port 3006
```
✓ Server listening on http://localhost:3006
✓ Admin routes registered
```

---

### **2. Start Frontend:**
```powershell
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web"
npm run dev
```

**Verify:** Next.js chạy port 3001
```
✓ Ready on http://localhost:3001
```

---

## 📝 TEST CASES

### **Test 1: Login Admin ✅**

**Steps:**
1. Mở: `http://localhost:3001/auth/login`
2. Nhập:
   - Email: `admin@lta.vn`
   - Password: `admin123`
3. Click "Đăng nhập"

**Expected:**
- ✅ Redirect to dashboard
- ✅ Header hiển thị "Admin"
- ✅ Token lưu trong localStorage

**Verify localStorage:**
```javascript
// Mở DevTools Console (F12)
localStorage.getItem('accessToken')
// Should return: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### **Test 2: Navigate to Admin Listings ✅**

**Steps:**
1. Click menu "Duyệt tin đăng" hoặc
2. Navigate: `http://localhost:3001/admin/listings`

**Expected:**
- ✅ Page load với danh sách listings
- ✅ Stats hiển thị: Tổng, Chờ duyệt, Đã duyệt, Từ chối
- ✅ Table với listings

**Visual check:**
```
┌─────────────────────────────────────────┐
│  Duyệt tin đăng                         │
├─────────────────────────────────────────┤
│  [Tổng: X]  [Chờ duyệt: Y]  ...        │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ Title      Status      Actions   │  │
│  │ Listing 1  [Chờ duyệt] [Duyệt]  │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

### **Test 3: Approve Success ✅**

**Steps:**
1. Tìm listing với status "Chờ duyệt"
2. Click nút **[Duyệt]** (màu xanh)
3. Confirm dialog: Click **OK**

**Expected:**
```
                    ┌──────────────────────────┐
                    │ ✓ Thành công        [×] │ ← GÓC PHẢI
                    │ Đã duyệt tin đăng        │
                    │ thành công!              │
                    └──────────────────────────┘
```

**Verify:**
- ✅ Toast hiển thị **GÓC PHẢI** màn hình
- ✅ Background **XANH LÁ**
- ✅ Icon **✓ (checkmark)**
- ✅ Badge listing đổi thành **"Đã duyệt"** (xanh)
- ✅ Toast tự động biến mất sau **5 giây**

**DevTools check:**
```javascript
// Console should log:
"Listing approved successfully"
```

---

### **Test 4: Approve No Token ✅**

**Steps:**
1. Xóa token:
   ```javascript
   localStorage.removeItem('accessToken')
   ```
2. Refresh page
3. Click **[Duyệt]**

**Expected:**
```
                    ┌──────────────────────────┐
                    │ ✕ Lỗi xác thực      [×] │ ← GÓC PHẢI
                    │ Vui lòng đăng nhập lại   │
                    └──────────────────────────┘
```

**Verify:**
- ✅ Toast hiển thị GÓC PHẢI
- ✅ Background **ĐỎ**
- ✅ Icon **✕ (X mark)**
- ✅ **KHÔNG** gọi API (check Network tab)
- ✅ Badge listing **KHÔNG** thay đổi

---

### **Test 5: Reject Success ✅**

**Steps:**
1. Login lại nếu đã logout
2. Click nút **[Từ chối]** (màu đỏ)
3. Dialog mở ra
4. Nhập lý do:
   ```
   Ảnh không rõ ràng, thiếu thông tin chi tiết về container
   ```
   (>= 10 ký tự)
5. Click **[Từ chối]** trong dialog

**Expected:**
```
                    ┌──────────────────────────┐
                    │ ✓ Thành công        [×] │ ← GÓC PHẢI
                    │ Đã từ chối tin đăng      │
                    │ thành công!              │
                    └──────────────────────────┘
```

**Verify:**
- ✅ Toast hiển thị GÓC PHẢI
- ✅ Background **XANH LÁ**
- ✅ Badge listing đổi thành **"Từ chối"** (đỏ)
- ✅ **Rejection reason** hiển thị dưới badge:
   ```
   Lý do: Ảnh không rõ ràng, thiếu thông tin chi tiết về container
   ```
- ✅ Dialog **ĐÃ ĐÓNG**
- ✅ Input rejection reason **ĐÃ CLEAR**
- ✅ Toast tự động biến mất sau 5s

---

### **Test 6: Reject Validation ✅**

**Steps:**
1. Click **[Từ chối]**
2. Dialog mở
3. Nhập lý do **< 10 ký tự**:
   ```
   Không tốt
   ```
   (chỉ 9 chars)
4. Click **[Từ chối]**

**Expected:**
```
                    ┌──────────────────────────────────┐
                    │ ✕ Thông tin chưa đầy đủ     [×] │ ← GÓC PHẢI
                    │ Vui lòng nhập lý do từ chối      │
                    │ (tối thiểu 10 ký tự)             │
                    └──────────────────────────────────┘
```

**Verify:**
- ✅ Toast hiển thị GÓC PHẢI
- ✅ Background **ĐỎ**
- ✅ Dialog **VẪN MỞ**
- ✅ Input text **VẪN CÓ** giá trị
- ✅ Badge listing **KHÔNG** thay đổi
- ✅ **KHÔNG** gọi API

---

### **Test 7: Network Error ✅**

**Steps:**
1. Tắt backend server (Ctrl+C)
2. Click **[Duyệt]**
3. Confirm

**Expected:**
```
                    ┌──────────────────────────┐
                    │ ✕ Lỗi kết nối       [×] │ ← GÓC PHẢI
                    │ Không thể kết nối đến    │
                    │ server                   │
                    └──────────────────────────┘
```

**Verify:**
- ✅ Toast hiển thị GÓC PHẢI
- ✅ Background **ĐỎ**
- ✅ Message "Lỗi kết nối"
- ✅ Console log error

**Cleanup:**
- Restart backend server

---

## 🎨 VISUAL CHECKLIST

### **Toast Position:**
- [ ] Góc **PHẢI TRÊN** màn hình (desktop)
- [ ] **Không** giữa màn hình
- [ ] **Không** góc trái
- [ ] **Không** bottom

### **Toast Style:**
- [ ] Success: Background **xanh lá** (#10B981)
- [ ] Error: Background **đỏ** (#EF4444)
- [ ] Success: Icon **✓ (checkmark)**
- [ ] Error: Icon **✕ (X mark)**
- [ ] Border radius: Rounded corners
- [ ] Shadow: Có drop shadow

### **Toast Behavior:**
- [ ] Slide in từ phải (animation smooth)
- [ ] Auto dismiss sau **5 giây**
- [ ] Click **[×]** đóng ngay lập tức
- [ ] Không block UI (có thể click vào listing khác)
- [ ] Multiple toasts stack vertically

### **Content:**
- [ ] Title rõ ràng: "Thành công", "Lỗi", "Lỗi xác thực"
- [ ] Description cụ thể, dễ hiểu
- [ ] Không có emoji (✅❌ không cần)
- [ ] Tiếng Việt có dấu đầy đủ

---

## 📱 RESPONSIVE TEST

### **Desktop (>1024px):**
```
┌─────────────────────────────────────────┐
│                          [Toast here] │ ← Góc phải
│  Main content                           │
└─────────────────────────────────────────┘
```

### **Mobile (<768px):**
- [ ] Toast **top center** (không góc phải)
- [ ] Toast **full width** (trừ margin)
- [ ] Readable on small screen

---

## 🔍 DEVTOOLS CHECK

### **Console Messages:**

**Approve success:**
```
Listing approved successfully
```

**Reject success:**
```
Listing rejected successfully
```

**Errors:**
```
Error approving listing: <error details>
Failed to approve listing: <response data>
```

---

### **Network Tab:**

**Approve request:**
```
PUT http://localhost:3006/api/v1/admin/listings/{id}/status
Status: 200 OK

Headers:
  Authorization: Bearer eyJhbGci...
  Content-Type: application/json

Body:
  {"status":"approved"}

Response:
  {
    "success": true,
    "data": {
      "listing": {...}
    }
  }
```

**Reject request:**
```
PUT http://localhost:3006/api/v1/admin/listings/{id}/status
Status: 200 OK

Body:
  {
    "status":"rejected",
    "reason":"Ảnh không rõ ràng..."
  }

Response:
  {"success":true,"data":{...}}
```

---

### **localStorage:**

**After login:**
```javascript
localStorage.getItem('accessToken')
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

localStorage.getItem('user')
// {"id":"...","email":"admin@lta.vn","fullName":"Admin","role":"admin"}
```

---

## ✅ PASS CRITERIA

**Tất cả phải đạt:**
- ✅ Toast hiển thị **GÓC PHẢI** (desktop)
- ✅ Toast **XANH** (success) / **ĐỎ** (error)
- ✅ Toast **AUTO DISMISS** sau 5s
- ✅ Badge update **real-time**
- ✅ Dialog close sau reject success
- ✅ No console errors (trừ expected network error)
- ✅ Token validation works
- ✅ Rejection reason validation works
- ✅ UI **KHÔNG** block khi toast hiển thị

---

## 🎉 SUCCESS INDICATOR

**Khi tất cả test pass:**
```
╔════════════════════════════════════╗
║                                    ║
║  ✅ ALL TESTS PASSED              ║
║                                    ║
║  Toast notifications:    ✅       ║
║  Position (góc phải):    ✅       ║
║  Colors (xanh/đỏ):       ✅       ║
║  Auto dismiss:           ✅       ║
║  Token validation:       ✅       ║
║  Rejection validation:   ✅       ║
║  UI/UX:                  ✅       ✅       ║
║                                    ║
║  🚀 READY FOR PRODUCTION          ║
║                                    ║
╚════════════════════════════════════╝
```

---

## 🐛 TROUBLESHOOTING

### **Issue: Toast không hiển thị**

**Check:**
1. `useToast` imported? ✓
2. `const { toast } = useToast();` declared? ✓
3. `<Toaster />` mounted in layout? ✓
4. Browser console có error?

**Fix:**
- Check `app/[locale]/layout.tsx` line 34 có `<Toaster />`
- Clear cache và refresh

---

### **Issue: Toast hiển thị giữa màn hình**

**Reason:** Có thể đang dùng `alert()` cũ

**Fix:**
- Check code đã đổi từ `alert()` → `toast()` chưa
- Xem file `page.tsx` line 153-280

---

### **Issue: Toast màu xám (không xanh/đỏ)**

**Reason:** Thiếu `variant` parameter

**Fix:**
- Success: Không cần variant (default = success)
- Error: Phải có `variant: "destructive"`

---

### **Issue: "Unauthorized" vẫn hiện**

**Check:**
1. Đã login chưa?
2. Token có trong localStorage?
3. Token còn hạn? (JWT exp)
4. Backend đang chạy?

**Fix:**
- Login lại
- Check backend console log
- Verify adminAuth middleware

---

**Created:** 4 tháng 10, 2025  
**Status:** ✅ **READY TO RUN**  
**Duration:** ~5 phút
