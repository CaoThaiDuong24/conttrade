# Hướng Dẫn Debug Driver.js Buttons

## Vấn Đề
Close button (X) và Done button không hoạt động khi click.

## Các Bước Debug

### 1. Kiểm Tra Files Đã Update

✅ **driver-config.ts** - Đã thêm:
- Multiple event listeners (capture + normal + onclick)
- Detailed console logging
- onCloseClick callback
- attachButtonHandlers với 3 phương pháp attach

✅ **driver-custom.css** - Đã thêm:
- pointer-events: auto !important
- user-select: none
- touch-action: manipulation
- :active styles

### 2. Test Trong Browser

#### A. Mở trang test HTML
1. Truy cập: http://localhost:3000/test-close-button-debug.html
2. Click "Bắt đầu Test Tour"
3. Xem log console (màu xanh lá)
4. Test click X và Done button
5. Xem "Kiểm tra Buttons" để xem chi tiết

#### B. Test trên trang login thật
1. Truy cập: http://localhost:3000/vi/auth/login
2. Hard refresh: Ctrl+Shift+R
3. Click nút ? (help) để start tour
4. Mở Console (F12)

### 3. Các Lệnh Debug Trong Console

Load test script:
```javascript
// Copy toàn bộ nội dung file test-buttons-console.js vào console
```

Sau đó chạy:
```javascript
// Xem chi tiết buttons
debugDriverButtons()

// Test click programmatically
testClickCloseButton()
testClickDoneButton()

// Attach test handlers
attachTestHandlers()

// Watch DOM changes
watchButtonChanges()
```

### 4. Các Log Cần Xem

Khi start tour, console nên hiện:
```
📍 Step highlighted: [Tên bước]
🔍 Searching for buttons...
✓ Close button found
🔧 Attaching close button handlers (multiple methods)
✅ Close button handlers attached
📊 Button states: Close=true, Done=false, Next=true, Prev=false
```

Khi click close button:
```
❌ CLOSE clicked (capture) - destroying
🔚 Tour "login" is being destroyed
✅ Tour "login" destroyed successfully
```

### 5. Các Vấn Đề Có Thể Gặp

#### Vấn đề 1: Không thấy console log
- Kiểm tra xem có đang filter console không
- Đảm bảo console level = "Verbose"

#### Vấn đề 2: Button tìm thấy nhưng không click được
Chạy trong console:
```javascript
const btn = document.querySelector('.driver-popover-close-btn');
console.log('Button:', btn);
console.log('Computed styles:', window.getComputedStyle(btn));
console.log('Event listeners:', getEventListeners(btn));

// Test click manually
btn.click();

// Test with event
btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
```

#### Vấn đề 3: Handler không được attach
Kiểm tra timing:
```javascript
// Sau khi start tour, đợi 200ms rồi check
setTimeout(() => {
  const btn = document.querySelector('.driver-popover-close-btn');
  console.log('Has handler:', btn?._handlerAttached);
}, 200);
```

### 6. Các Phương Pháp Attach Handler

Code hiện tại dùng **3 phương pháp** để đảm bảo:

1. **Capture phase** (ưu tiên cao nhất)
```javascript
closeBtn.addEventListener('click', handler, { capture: true });
```

2. **Normal phase** (backup)
```javascript
closeBtn.addEventListener('click', handler);
```

3. **Direct onclick** (last resort)
```javascript
closeBtn.onclick = handler;
```

### 7. CSS Override Critical

```css
.driver-popover-close-btn {
  pointer-events: auto !important;
  cursor: pointer !important;
  user-select: none !important;
  touch-action: manipulation !important;
  visibility: visible !important;
  opacity: 1 !important;
}
```

### 8. Test Checklist

- [ ] Refresh browser (Ctrl+Shift+R)
- [ ] Mở Console (F12)
- [ ] Start tour (click ? button)
- [ ] Xem console log có đủ messages
- [ ] Test click X button → Xem log
- [ ] Test click Next → Xem log
- [ ] Test click Done → Xem log
- [ ] Chạy debugDriverButtons() để xem chi tiết
- [ ] Check computed styles
- [ ] Check event listeners

### 9. Nếu Vẫn Không Được

#### Option A: Downgrade Driver.js
```bash
cd frontend
npm uninstall driver.js
npm install driver.js@1.3.5
```

#### Option B: Sử dụng library khác
- Intro.js
- Shepherd.js
- React Joyride

#### Option C: Build custom tour
Tự implement với:
- Overlay manual
- Popover component
- Highlight với z-index

### 10. Files Liên Quan

```
frontend/
├── lib/tour/
│   └── driver-config.ts          ← Core config với handlers
├── styles/
│   └── driver-custom.css         ← CSS overrides
├── components/tour/
│   ├── tour-button.tsx           ← Tour trigger components
│   └── simple-tour-test.tsx      ← Test component
├── app/[locale]/auth/login/
│   └── page.tsx                  ← Login page với tour
└── public/
    ├── test-close-button-debug.html  ← Standalone test
    └── test-buttons-console.js       ← Console debug script
```

### 11. Thông Tin Thêm

- Driver.js version: 1.3.6
- React version: 18
- Next.js version: 14.2.33
- Issue: Event handlers bị block bởi React hoặc CSS
- Solution: Multiple listener attachment + CSS overrides

---

## Kết Luận

Hiện tại đã implement:
- ✅ 3 phương pháp attach handlers
- ✅ Detailed logging
- ✅ CSS overrides mạnh
- ✅ Test files đầy đủ
- ✅ Debug utilities

**Next step**: Test trong browser và xem console log để tìm root cause chính xác.
