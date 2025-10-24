# 🎯 HƯỚNG DẪN TEST NHANH - ADMIN TOAST

**Thời gian:** 2 phút  
**Mục tiêu:** Verify toast hiển thị góc phải với Sonner

---

## ✅ CHUẨN BỊ

### **Backend đang chạy:**
```
✅ Server: http://localhost:3006
✅ Admin routes registered
```

### **Frontend:**
```bash
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web"
npm run dev
```

---

## 🧪 TEST CASES

### **1. Login Admin**
```
URL: http://localhost:3001/auth/login
Email: admin@lta.vn
Password: admin123
```

**Expected:** ✅ Redirect to dashboard

---

### **2. Navigate to Admin Listings**
```
URL: http://localhost:3001/admin/listings
```

**Expected:**
- ✅ Page loads
- ✅ Stats cards hiển thị
- ✅ Table với listings

---

### **3. Test Approve Toast**

**Steps:**
1. Click nút **[Duyệt]** (màu xanh)
2. Confirm dialog → Click **OK**

**Expected Toast:**
```
┌─────────────────────────────────┐
│ ✓ Thành công               [×] │ ← GÓC PHẢI
│   Đã duyệt tin đăng thành công! │   XANH LÁ
└─────────────────────────────────┘
```

**Checklist:**
- [ ] Toast xuất hiện góc phải
- [ ] Background màu xanh
- [ ] Icon ✓ (checkmark)
- [ ] Text "Thành công"
- [ ] Auto dismiss sau 5s
- [ ] Badge listing → "Đã duyệt"

---

### **4. Test Reject Validation Toast**

**Steps:**
1. Click nút **[Từ chối]** (màu đỏ)
2. Nhập lý do < 10 chars: `"Test"`
3. Click **[Từ chối]** trong dialog

**Expected Toast:**
```
┌───────────────────────────────────────────┐
│ ✕ Thông tin chưa đầy đủ              [×] │ ← GÓC PHẢI
│   Vui lòng nhập lý do từ chối...          │   ĐỎ
└───────────────────────────────────────────┘
```

**Checklist:**
- [ ] Toast xuất hiện góc phải
- [ ] Background màu đỏ
- [ ] Icon ✕ (X mark)
- [ ] Text "Thông tin chưa đầy đủ"
- [ ] Dialog VẪN MỞ
- [ ] Badge listing KHÔNG đổi

---

### **5. Test Reject Success Toast**

**Steps:**
1. Click **[Từ chối]**
2. Nhập lý do >= 10 chars:
   ```
   Ảnh không rõ ràng, thiếu thông tin chi tiết
   ```
3. Click **[Từ chối]**

**Expected Toast:**
```
┌─────────────────────────────────┐
│ ✓ Thành công               [×] │ ← GÓC PHẢI
│   Đã từ chối tin đăng thành công!│   XANH LÁ
└─────────────────────────────────┘
```

**Checklist:**
- [ ] Toast xuất hiện góc phải
- [ ] Background màu xanh
- [ ] Dialog ĐÃ ĐÓNG
- [ ] Badge listing → "Từ chối" (đỏ)
- [ ] Rejection reason hiển thị

---

### **6. Test Network Error (Optional)**

**Steps:**
1. Tắt backend (Ctrl+C)
2. Click **[Duyệt]**
3. Confirm

**Expected Toast:**
```
┌─────────────────────────────────┐
│ ✕ Lỗi kết nối             [×] │ ← GÓC PHẢI
│   Không thể kết nối đến server   │   ĐỎ
└─────────────────────────────────┘
```

**Cleanup:** Restart backend

---

## 🎨 VISUAL VERIFICATION

### **Position:**
- ✅ GÓC PHẢI màn hình (desktop)
- ❌ KHÔNG giữa màn hình
- ❌ KHÔNG góc trái

### **Colors:**
- ✅ Success: **#10B981** (Green)
- ✅ Error: **#EF4444** (Red)

### **Icons:**
- ✅ Success: **✓** (Checkmark)
- ✅ Error: **✕** (X mark)

### **Behavior:**
- ✅ Slide in từ phải
- ✅ Auto dismiss **5 giây**
- ✅ Click **[×]** → Đóng ngay
- ✅ Không block UI

---

## 🐛 TROUBLESHOOTING

### **Toast không hiển thị:**
```
Check:
1. Browser DevTools Console → Có error?
2. Layout có <Toaster /> component? ✓
3. Import đúng: import { toast } from 'sonner' ✓
```

### **Toast giữa màn hình:**
```
❌ Đang dùng alert() hoặc sai component
✅ Phải dùng Sonner toast.success() / toast.error()
```

### **Màu sai:**
```
Check:
- toast.success() → Xanh ✓
- toast.error() → Đỏ ✓
- Không dùng variant property (Sonner không có)
```

---

## ✅ SUCCESS CRITERIA

**All pass:**
```
✅ Toast góc phải (desktop)
✅ Colors đúng (xanh/đỏ)
✅ Icons đúng (✓/✕)
✅ Auto dismiss 5s
✅ UI không block
✅ Badge update real-time
✅ No console errors
```

---

**Status:** ✅ **READY TO TEST**  
**Duration:** ~2 phút
