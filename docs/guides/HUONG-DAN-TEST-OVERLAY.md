# 🔔 HƯỚNG DẪN TEST OVERLAY NOTIFICATION

## 📋 CHECKLIST TEST

### 1️⃣ Refresh Trang
```
Ctrl + F5 (Windows)
Cmd + Shift + R (Mac)
```

### 2️⃣ Mở DevTools Console
```
F12 hoặc Right-click → Inspect → Console tab
```

### 3️⃣ Test Overlay Click

#### ✅ Click vào chuông
**Expected**:
- Dropdown mở
- Console log: `🔔 Bell clicked! Current isOpen: false`
- Badge hiển thị số thông báo

#### ✅ Click ra ngoài dropdown

**Test zones** (tất cả phải đóng dropdown):

1. **Header area** (xung quanh logo, search)
   - Click vào logo
   - Click vào thanh search
   - Click vào khoảng trống header

2. **Sidebar** (menu bên trái)
   - Click vào menu items
   - Click vào khoảng trống sidebar

3. **Main content** (nội dung chính)
   - Click vào bảng
   - Click vào text
   - Click vào buttons

4. **Footer** (nếu có)
   - Click anywhere in footer

5. **Window edges**
   - Click vào cạnh trái màn hình
   - Click vào cạnh phải màn hình
   - Click bottom area

**Expected cho TẤT CẢ các zones trên**:
```
Console log: ❌ Overlay clicked - Closing dropdown
Dropdown đóng ngay lập tức
```

### 4️⃣ Test Dropdown Interactions

#### Click vào notification item
**Expected**:
- Dropdown VẪN MỞ
- Console log: `📬 Notification clicked: {...}`

#### Click "Làm mới thông báo"
**Expected**:
- Dropdown VẪN MỞ
- Console log: `🔄 Refreshing notifications...`
- Danh sách thông báo refresh

### 5️⃣ Verify Portal Rendered

**In browser console, run**:
```javascript
// Check overlay element
document.querySelectorAll('[style*="9998"]')

// Should return: NodeList [ div ]
// If empty, portal not working
```

**Check overlay properties**:
```javascript
const overlay = document.querySelector('[style*="9998"]');
console.log({
  exists: !!overlay,
  position: overlay?.style.position,
  zIndex: overlay?.style.zIndex,
  width: overlay?.style.width,
  height: overlay?.style.height,
  parent: overlay?.parentElement.tagName
});

// Expected output:
// {
//   exists: true,
//   position: "fixed",
//   zIndex: "9998",
//   width: "100vw",
//   height: "100vh",
//   parent: "BODY"  ← QUAN TRỌNG: phải là BODY
// }
```

### 6️⃣ Visual Verification

#### When dropdown is OPEN:
- ✅ Badge hiển thị số thông báo chưa đọc
- ✅ Dropdown có shadow rõ ràng
- ✅ Thông báo chưa đọc có background xanh nhạt
- ✅ Có dot xanh bên cạnh thông báo chưa đọc
- ✅ Time format: "Vừa xong", "5 giờ trước", "3 ngày trước"

#### When clicking outside:
- ✅ Dropdown đóng NGAY LẬP TỨC (no delay)
- ✅ Overlay biến mất
- ✅ Badge vẫn hiển thị số thông báo

## 🐛 TROUBLESHOOTING

### ❌ Problem: Overlay không đóng dropdown

**Debug steps**:

1. **Check Portal rendered**:
```javascript
document.body.children
// Cuối cùng phải có div overlay
```

2. **Check mounted state**:
```javascript
// Add temporary log in component
console.log('Mounted:', mounted, 'IsOpen:', isOpen);
```

3. **Check z-index conflicts**:
```javascript
[...document.querySelectorAll('*')]
  .map(el => ({
    tag: el.tagName,
    zIndex: window.getComputedStyle(el).zIndex
  }))
  .filter(x => x.zIndex !== 'auto' && parseInt(x.zIndex) > 9998)
  .sort((a, b) => parseInt(b.zIndex) - parseInt(a.zIndex));
```

4. **Check click events**:
```javascript
// Listen to all clicks
document.addEventListener('click', (e) => {
  console.log('Global click:', e.target);
}, true);
```

### ❌ Problem: Console không có logs

**Solutions**:
- Clear cache: Ctrl + Shift + Delete
- Hard refresh: Ctrl + F5
- Check console filters (All levels)
- Check if logs are being filtered out

### ❌ Problem: Hydration error

**Error message**:
```
Warning: Expected server HTML to contain a matching <div> in <body>
```

**Solution**:
- Already fixed with `mounted` state
- If still occurs, check if Portal is inside client component
- Check `'use client'` directive at top of file

### ❌ Problem: Overlay has wrong position

**Debug**:
```javascript
const overlay = document.querySelector('[style*="9998"]');
const rect = overlay.getBoundingClientRect();
console.log({
  top: rect.top,      // Should be 0
  left: rect.left,    // Should be 0
  width: rect.width,  // Should be window.innerWidth
  height: rect.height // Should be window.innerHeight
});
```

## 📊 TEST SCENARIOS

### Scenario 1: Normal Flow
1. Page load → ✅ No dropdown
2. Click bell → ✅ Dropdown opens
3. Click outside → ✅ Dropdown closes
4. Click bell again → ✅ Dropdown opens
5. Click notification → ✅ Dropdown stays open
6. Click outside → ✅ Dropdown closes

### Scenario 2: Multiple Opens
1. Click bell → open
2. Click outside → close
3. Click bell → open
4. Click outside → close
5. Repeat 10 times → ✅ Should work every time

### Scenario 3: Fast Clicks
1. Click bell quickly 5 times
2. Expected: ✅ Toggle state consistent
3. Click outside → ✅ Closes

### Scenario 4: Edge Cases
1. **Window resize**: Dropdown open → resize window → click outside → ✅ Should close
2. **Scroll**: Dropdown open → scroll page → click outside → ✅ Should close
3. **Tab switch**: Dropdown open → switch tab → return → click outside → ✅ Should close

## 📸 SCREENSHOT CHECKLIST

### Screenshot 1: Dropdown Closed
- [ ] Badge hiển thị số thông báo
- [ ] Icon chuông rõ ràng
- [ ] No dropdown visible
- [ ] No overlay

### Screenshot 2: Dropdown Open
- [ ] Dropdown hiển thị đầy đủ
- [ ] Shadow rõ ràng
- [ ] Header "Thông báo" + badge "X mới"
- [ ] Danh sách notifications
- [ ] Button "Làm mới thông báo"
- [ ] Console logs visible

### Screenshot 3: After Click Outside
- [ ] Dropdown đã đóng
- [ ] Console log: "Overlay clicked - Closing dropdown"
- [ ] Badge vẫn hiển thị

## ✅ SUCCESS CRITERIA

### Must Have:
- ✅ Click outside ANYWHERE → dropdown closes
- ✅ Console logs show "Overlay clicked"
- ✅ No errors in console
- ✅ Overlay renders to document.body
- ✅ Z-index correct (9998-9999)

### Nice to Have:
- ✅ Smooth animations
- ✅ Proper time formatting
- ✅ Badge count accurate
- ✅ Hover effects work
- ✅ No visual glitches

## 🎯 PASS/FAIL

### ✅ PASS if:
1. Click outside ALWAYS closes dropdown (10/10 attempts)
2. Console shows proper logs
3. No JavaScript errors
4. Overlay covers entire viewport
5. Portal renders to body (inspect with DevTools)

### ❌ FAIL if:
1. Click outside doesn't close (even 1 time)
2. No console logs
3. Hydration errors
4. Overlay has wrong size/position
5. Portal renders to wrong parent

---

## 🚀 QUICK TEST (2 minutes)

```
1. Refresh page (Ctrl+F5)
2. Open Console (F12)
3. Click bell → Should open
4. Click ANYWHERE outside → Should close
5. Check console → Should see "Overlay clicked"
```

**If all 5 steps work → ✅ SUCCESS!**

---

**Status**: Waiting for test results
**Tester**: Please follow checklist and report
