# 🎨 VISUAL GUIDE - ADMIN TOAST NOTIFICATIONS

**Ngày:** 4 tháng 10, 2025  
**Mô tả:** Hướng dẫn visual các loại toast notification trong Admin Listings

---

## 📍 VỊ TRÍ HIỂN THỊ

```
┌─────────────────────────────────────────────────────────┐
│  ContExchange - Admin Duyệt tin đăng              👤 Admin │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Tổng: 1]  [Chờ duyệt: 1]  [Đã duyệt: 0]  [Từ chối: 0] │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │ Listing Title                                  │    │
│  │ [Chờ duyệt]  Container ISO 20ft                │    │
│  │                                                │    │
│  │ [Duyệt]  [Từ chối]                            │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│                                                         │
│                          ┌────────────────────────┐  ← GÓC PHẢI
│                          │ ✓ Thành công      [×] │
│                          │ Đã duyệt tin đăng     │
│                          │ thành công!           │
│                          └────────────────────────┘
│                                 ↑
│                          TOAST HIỂN THỊ Ở ĐÂY
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 CÁC LOẠI TOAST

### **1️⃣ SUCCESS TOAST - APPROVE**

**Trigger:** Click nút "Duyệt" thành công

```
┌────────────────────────────────────────┐
│  ✓  Thành công                    [×]  │
│     Đã duyệt tin đăng thành công!      │
└────────────────────────────────────────┘
```

**Màu sắc:**
- Background: `#10B981` (Green-500) với opacity
- Border: `#059669` (Green-600)
- Text: White
- Icon: ✓ (Checkmark)

**Animation:**
- Slide in từ phải
- Auto dismiss sau 5 giây
- Fade out khi đóng

**Code:**
```typescript
toast({
  title: "Thành công",
  description: "Đã duyệt tin đăng thành công!",
});
```

---

### **2️⃣ SUCCESS TOAST - REJECT**

**Trigger:** Từ chối listing thành công

```
┌────────────────────────────────────────┐
│  ✓  Thành công                    [×]  │
│     Đã từ chối tin đăng thành công!    │
└────────────────────────────────────────┘
```

**Tương tự Success Approve**, chỉ khác message

---

### **3️⃣ ERROR TOAST - AUTH**

**Trigger:** Không có token hoặc token hết hạn

```
┌────────────────────────────────────────┐
│  ✕  Lỗi xác thực                  [×]  │
│     Vui lòng đăng nhập lại             │
└────────────────────────────────────────┘
```

**Màu sắc:**
- Background: `#EF4444` (Red-500) với opacity
- Border: `#DC2626` (Red-600)
- Text: White
- Icon: ✕ (X mark)

**Code:**
```typescript
toast({
  title: "Lỗi xác thực",
  description: "Vui lòng đăng nhập lại",
  variant: "destructive",
});
```

---

### **4️⃣ ERROR TOAST - API ERROR**

**Trigger:** Backend trả về lỗi (403, 500, etc)

```
┌────────────────────────────────────────┐
│  ✕  Lỗi                           [×]  │
│     Không thể duyệt tin đăng           │
└────────────────────────────────────────┘
```

hoặc với message từ backend:

```
┌────────────────────────────────────────┐
│  ✕  Lỗi                           [×]  │
│     Access denied: Admin only          │
└────────────────────────────────────────┘
```

**Code:**
```typescript
toast({
  title: "Lỗi",
  description: data.message || 'Không thể duyệt tin đăng',
  variant: "destructive",
});
```

---

### **5️⃣ ERROR TOAST - NETWORK**

**Trigger:** Không kết nối được server (CORS, timeout, etc)

```
┌────────────────────────────────────────┐
│  ✕  Lỗi kết nối                   [×]  │
│     Không thể kết nối đến server       │
└────────────────────────────────────────┘
```

**Code:**
```typescript
toast({
  title: "Lỗi kết nối",
  description: "Không thể kết nối đến server",
  variant: "destructive",
});
```

---

### **6️⃣ WARNING TOAST - VALIDATION**

**Trigger:** Lý do từ chối < 10 ký tự

```
┌──────────────────────────────────────────────┐
│  ⚠  Thông tin chưa đầy đủ            [×]    │
│     Vui lòng nhập lý do từ chối              │
│     (tối thiểu 10 ký tự)                     │
└──────────────────────────────────────────────┘
```

**Màu sắc:**
- Background: `#EF4444` (Red-500) - dùng destructive
- Border: `#DC2626` (Red-600)
- Text: White
- Icon: ⚠ (Warning triangle)

**Code:**
```typescript
toast({
  title: "Thông tin chưa đầy đủ",
  description: "Vui lòng nhập lý do từ chối (tối thiểu 10 ký tự)",
  variant: "destructive",
});
```

---

## 🎬 LUỒNG HOÀN CHỈNH VỚI TOAST

### **APPROVE FLOW:**

```
1. User click [Duyệt]
   │
   ├─> Confirm dialog: "Bạn có chắc chắn muốn duyệt tin đăng này?"
   │   ├─> Click "Cancel" → Nothing happens
   │   └─> Click "OK" → Continue
   │
2. Check token
   │
   ├─> ❌ No token
   │   └─> Toast: "Lỗi xác thực - Vui lòng đăng nhập lại"
   │       STOP ⛔
   │
   └─> ✅ Has token
       │
3. Send API request
   │
   ├─> ❌ Network error
   │   └─> Toast: "Lỗi kết nối - Không thể kết nối đến server"
   │       STOP ⛔
   │
   ├─> ❌ API error (403, 500)
   │   └─> Toast: "Lỗi - {error.message}"
   │       STOP ⛔
   │
   └─> ✅ Success
       │
       ├─> Update UI: Badge → "Đã duyệt" (Green)
       │
       └─> Toast: "Thành công - Đã duyệt tin đăng thành công!"
           │
           └─> Auto dismiss sau 5s
               DONE ✅
```

---

### **REJECT FLOW:**

```
1. User click [Từ chối]
   │
   └─> Dialog mở: "Từ chối tin đăng"
       │
2. User nhập lý do
   │
   ├─> ❌ Lý do < 10 chars
   │   └─> Toast: "Thông tin chưa đầy đủ - Vui lòng nhập lý do..."
   │       Dialog vẫn mở
   │       RETRY ↻
   │
   └─> ✅ Lý do >= 10 chars
       │
3. User click [Từ chối] trong dialog
   │
4. Check token
   │
   ├─> ❌ No token
   │   └─> Toast: "Lỗi xác thực - Vui lòng đăng nhập lại"
   │       STOP ⛔
   │
   └─> ✅ Has token
       │
5. Send API request
   │
   ├─> ❌ Network error
   │   └─> Toast: "Lỗi kết nối - Không thể kết nối đến server"
   │       STOP ⛔
   │
   ├─> ❌ API error
   │   └─> Toast: "Lỗi - {error.message}"
   │       STOP ⛔
   │
   └─> ✅ Success
       │
       ├─> Update UI: 
       │   ├─> Badge → "Từ chối" (Red)
       │   └─> Show rejection reason
       │
       ├─> Close dialog
       │
       └─> Toast: "Thành công - Đã từ chối tin đăng thành công!"
           │
           └─> Auto dismiss sau 5s
               DONE ✅
```

---

## 🎯 SO SÁNH TRƯỚC/SAU

### **TRƯỚC (alert):**

```
User click [Duyệt]
  ↓
┌─────────────────────────────────┐
│  localhost:3000 says            │  ← Browser default popup
│  ❌ Không thể duyệt tin đăng:   │  ← Giữa màn hình
│  Unauthorized                   │  ← Block toàn bộ UI
│                                 │
│          [    OK    ]           │  ← Phải click mới đóng
└─────────────────────────────────┘
```

**Vấn đề:**
- ❌ Giữa màn hình, không phải góc phải
- ❌ Block toàn bộ UI
- ❌ Phải click OK
- ❌ Không đẹp, không modern
- ❌ Không nhất quán với các trang khác

---

### **SAU (toast):**

```
User click [Duyệt]
  ↓
                    ┌────────────────────────────┐
                    │  ✕  Lỗi xác thực      [×] │  ← Góc phải
                    │     Vui lòng đăng nhập lại │  ← Không block UI
                    └────────────────────────────┘  ← Tự động biến mất
                         ↑
                   Slide in animation
                   Auto dismiss 5s
```

**Cải thiện:**
- ✅ Góc phải màn hình (theo design)
- ✅ Không block UI
- ✅ Tự động biến mất
- ✅ Đẹp, modern
- ✅ Nhất quán với `/sell/new` và các trang khác
- ✅ Icon + màu sắc rõ ràng

---

## 📱 RESPONSIVE DESIGN

### **Desktop (>1024px):**
```
┌─────────────────────────────────────────────────┐
│                                  [Toast ở đây] │ ← Góc phải top
│                                                 │
│  Main content                                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### **Tablet (768px - 1024px):**
```
┌───────────────────────────────────┐
│              [Toast ở đây]       │ ← Vẫn góc phải
│                                   │
│  Main content                     │
│                                   │
└───────────────────────────────────┘
```

### **Mobile (<768px):**
```
┌─────────────────────┐
│  [Toast full width] │ ← Top center, full width
├─────────────────────┤
│                     │
│  Main content       │
│                     │
└─────────────────────┘
```

---

## 🎨 THEME COLORS

### **Success (Green):**
```css
background: hsl(142, 76%, 36%); /* #10B981 */
border: hsl(142, 76%, 30%);     /* #059669 */
foreground: hsl(0, 0%, 100%);   /* White */
```

### **Destructive (Red):**
```css
background: hsl(0, 84%, 60%);   /* #EF4444 */
border: hsl(0, 72%, 51%);       /* #DC2626 */
foreground: hsl(0, 0%, 100%);   /* White */
```

### **Default (Gray/Blue):**
```css
background: hsl(222, 47%, 11%); /* Dark */
border: hsl(217, 33%, 17%);     /* Border */
foreground: hsl(210, 40%, 98%); /* White */
```

---

## 🧪 TEST CHECKLIST

### **Visual Tests:**
- [ ] Toast xuất hiện góc phải (desktop)
- [ ] Toast full width top (mobile)
- [ ] Icon đúng: ✓ (success), ✕ (error)
- [ ] Màu đúng: Green (success), Red (error)
- [ ] Animation smooth: slide in + fade out
- [ ] Auto dismiss sau 5s
- [ ] Click [×] đóng ngay lập tức
- [ ] Multiple toasts stack vertically

### **Functional Tests:**
- [ ] Approve success → Green toast
- [ ] Approve error → Red toast
- [ ] Reject success → Green toast
- [ ] Reject validation → Red toast
- [ ] No token → Red toast "Lỗi xác thực"
- [ ] Network error → Red toast "Lỗi kết nối"
- [ ] API error → Red toast với message từ backend

### **Accessibility Tests:**
- [ ] Screen reader đọc được toast
- [ ] Keyboard: Có thể đóng toast bằng ESC
- [ ] Color contrast đủ (WCAG AA)
- [ ] Focus trap trong dialog reject

---

## 📚 REFERENCES

**Component sử dụng:**
- `@/hooks/use-toast` - Toast hook
- `@/components/ui/sonner` - Sonner toast library
- Mounted tại: `app/[locale]/layout.tsx` (line 34)

**Similar implementations:**
- `/sell/new` - Create listing với toast
- `/auth/login` - Login với toast
- `/profile` - Update profile với toast

**Design system:**
- Colors: Tailwind CSS
- Typography: Inter font
- Spacing: 4px grid
- Shadows: Tailwind default

---

## 🎉 SUMMARY

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  ✅ TOAST NOTIFICATIONS - VISUAL GUIDE            │
│                                                    │
│  Vị trí:      Góc phải (desktop), Top (mobile)    │
│  Animation:   Slide in + Auto dismiss 5s          │
│  Variants:    Success (Green), Error (Red)        │
│  Icons:       ✓ (Success), ✕ (Error)             │
│  Responsive:  Desktop, Tablet, Mobile             │
│  A11y:        Screen reader, Keyboard support     │
│                                                    │
│  🎨 UI/UX CẢI THIỆN 100%                          │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

**Ngày tạo:** 4 tháng 10, 2025  
**Trạng thái:** ✅ **COMPLETE**  
**Next:** Test với real data
