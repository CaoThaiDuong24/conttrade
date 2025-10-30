## ⚡ QUICK FIX TEST

### Những gì vừa thay đổi (AGGRESSIVE APPROACH):

1. **Clone & Replace Buttons** - Loại bỏ TẤT CẢ event listeners cũ
2. **3 Event Types** cho mỗi button:
   - `mousedown` (capture) - Bắt sớm nhất
   - `click` (capture) 
   - `click` (normal)
3. **Force Destroy Function** - Destroy + Manual DOM cleanup
4. **ESC Key Handler** - Nhấn ESC để thoát tour

### Test Ngay:

1. **Hard Refresh**: `Ctrl + Shift + R`
2. **Mở Console**: `F12`
3. **Vào login page**: http://localhost:3000/vi/auth/login
4. **Click nút ?** để start tour
5. **Thử các cách đóng**:
   - Click nút X
   - Nhấn phím ESC
   - Đến bước cuối click "Hoàn thành"

### Console Log Mong Đợi:

Khi start:
```
📍 Step highlighted: ...
🔍 Searching for buttons...
✓ Popover found: [object]
✓ Close button found in popover
🔧 Attaching NEW close button handler (replaced element)
✅ Close button handlers attached (3 methods)
⌨️ ESC key handler added
```

Khi click X hoặc nhấn ESC:
```
❌ CLOSE mousedown - destroying
💥 FORCE DESTROY CALLED
✅ Driver.destroy() called
✅ DOM elements removed manually
🔚 Tour "login" is being destroyed
✅ Tour "login" destroyed successfully
```

### Nếu VẪN không được:

Chạy trong console:
```javascript
// Check button
const btn = document.querySelector('.driver-popover-close-btn');
console.log('Button:', btn);
console.log('Parent:', btn?.parentElement);

// Test manual click
btn?.click();

// Test mousedown
btn?.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, cancelable: true}));

// Check if button is inside popover
const popover = document.querySelector('.driver-popover');
console.log('Button in popover?', popover?.contains(btn));
```

### Alternative - Nếu vẫn fail:

Nhấn **F12** và chạy:
```javascript
// Force close tour manually
document.querySelector('.driver-overlay')?.remove();
document.querySelector('.driver-popover')?.remove();
document.querySelector('.driver-active-element')?.classList.remove('driver-active-element');
```

---

**Key Changes in Code:**
- ✅ `cloneNode()` để remove old listeners
- ✅ `mousedown` event (fires before click)
- ✅ `forceDestroy()` với manual DOM cleanup
- ✅ ESC key global handler
- ✅ Query buttons từ popover thay vì document
- ✅ Timeout tăng lên 200ms để đảm bảo DOM ready
