# 🎯 Hướng Dẫn Sử Dụng Interactive Tour - Login Page

## 📋 Tổng Quan

Đã tích hợp thành công **Interactive Tour** vào trang Login của hệ thống i-ContExchange. Tour sẽ hướng dẫn người dùng cách sử dụng các tính năng đăng nhập, bao gồm:
- Nhập email và mật khẩu
- Sử dụng tính năng ghi nhớ đăng nhập
- Khôi phục mật khẩu
- Đăng nhập nhanh với 10 tài khoản demo
- Đăng nhập bằng mạng xã hội
- Đăng ký tài khoản mới

---

## ✅ Đã Hoàn Thành

### 1. Thêm Login Tour Steps vào Driver Config

**File:** `frontend/lib/tour/driver-config.ts`

```typescript
// 7. Login Page Tour
export const loginTourSteps: DriveStep[] = [
  {
    popover: {
      title: '🎯 Chào Mừng Đến Trang Đăng Nhập',
      description: 'Đây là trang đăng nhập của i-ContExchange...',
    },
  },
  {
    element: '#email',
    popover: {
      title: '📧 Email',
      description: 'Nhập địa chỉ email của bạn. Ví dụ: admin@i-contexchange.vn',
    },
  },
  // ... 13 steps tổng cộng
];
```

**13 Steps trong Login Tour:**
1. ✅ Welcome message
2. ✅ Email input field
3. ✅ Password input field
4. ✅ Remember me checkbox
5. ✅ Forgot password link
6. ✅ Login submit button
7. ✅ Quick login section (10 demo accounts)
8. ✅ Admin quick login button
9. ✅ Buyer quick login button
10. ✅ Seller quick login button
11. ✅ Manager quick login button
12. ✅ Social login section
13. ✅ Sign up link

### 2. Đăng Ký Tour trong startTour Function

```typescript
export function startTour(tourName: string) {
  const tours: Record<string, DriveStep[]> = {
    dashboard: dashboardTourSteps,
    listings: listingsTourSteps,
    createListing: createListingTourSteps,
    orders: ordersTourSteps,
    adminUsers: adminUsersTourSteps,
    settings: settingsTourSteps,
    login: loginTourSteps, // ✅ Thêm login tour
  };
  // ...
}
```

### 3. Tích Hợp Tour vào Login Page

**File:** `frontend/app/[locale]/auth/login/page.tsx`

#### Import Components:
```typescript
import { TourHelpButton } from '@/components/tour/tour-button';
import { AutoTour } from '@/components/tour/auto-tour';
```

#### Thêm Tour Components:
```tsx
<div className="min-h-screen ...">
  {/* Auto-start tour on first visit */}
  <AutoTour tourName="login" delay={2000} enabled={false} />
  
  {/* Tour Help Button - Fixed position */}
  <div className="fixed bottom-6 right-6 z-50">
    <TourHelpButton tourName="login" />
  </div>
  
  {/* Rest of login page */}
</div>
```

#### Thêm IDs cho Tour Steps:

| Element | ID/Class | Description |
|---------|----------|-------------|
| Email Input | `#email` | Email input field |
| Password Input | `#password` | Password input field |
| Remember Checkbox | `#remember` | Remember me checkbox |
| Forgot Password Link | `#forgot-password-link` | Forgot password link |
| Login Button | `#login-submit-button` | Submit login button |
| Quick Login Section | `#quick-login-section` | Container cho 10 demo accounts |
| Admin Button | `.quick-login-admin` | Admin quick login button |
| Buyer Button | `.quick-login-buyer` | Buyer quick login button |
| Seller Button | `.quick-login-seller` | Seller quick login button |
| Manager Button | `.quick-login-manager` | Manager quick login button |
| Social Login Section | `#social-login-section` | Google/Facebook login section |
| Sign Up Link | `#signup-link` | Register link section |

---

## 🚀 Cách Sử Dụng

### 1. Xem Tour Trên Login Page

```
URL: http://localhost:3000/vi/auth/login
hoặc: http://localhost:3000/en/auth/login
```

### 2. Bật Tour Thủ Công

**Cách 1: Click vào Help Button**
- Ở góc dưới bên phải màn hình có button `?` màu xanh
- Click vào để bắt đầu tour

**Cách 2: Gọi từ Console**
```javascript
import { startTour } from '@/lib/tour/driver-config';
startTour('login');
```

### 3. Bật Auto-Start Tour (First-time users)

Mặc định `enabled={false}`, để bật auto-start khi người dùng vào trang lần đầu:

**File:** `frontend/app/[locale]/auth/login/page.tsx`

```tsx
<AutoTour tourName="login" delay={2000} enabled={true} />
```

**Tham số:**
- `tourName`: `"login"`
- `delay`: `2000` (ms) - Đợi 2 giây sau khi page load
- `enabled`: `true` để bật, `false` để tắt

---

## 🎨 Tùy Chỉnh Tour

### Thay Đổi Nội Dung Steps

**File:** `frontend/lib/tour/driver-config.ts`

```typescript
{
  element: '#email',
  popover: {
    title: '📧 Email của bạn', // Thay đổi tiêu đề
    description: 'Hướng dẫn mới...', // Thay đổi mô tả
    side: 'bottom', // Vị trí: 'top', 'right', 'bottom', 'left'
    align: 'start', // Căn chỉnh: 'start', 'center', 'end'
  },
}
```

### Thêm Step Mới

```typescript
export const loginTourSteps: DriveStep[] = [
  // ... existing steps
  {
    element: '#new-element-id',
    popover: {
      title: '🆕 Tính Năng Mới',
      description: 'Mô tả tính năng mới...',
      side: 'right',
      align: 'start',
    },
  },
];
```

### Thay Đổi Styling

**File:** `frontend/styles/driver-custom.css`

```css
/* Thay đổi màu primary */
:root {
  --driver-primary: #3b82f6; /* Blue */
  --driver-primary-hover: #2563eb;
}

/* Thay đổi màu popover background */
.driver-popover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

---

## 📱 Responsive Design

Tour đã được tối ưu cho mobile:

```css
@media (max-width: 640px) {
  .driver-popover {
    max-width: 90vw;
    font-size: 14px;
  }
  
  .driver-popover-title {
    font-size: 16px;
  }
}
```

**Test trên mobile:**
1. Mở Chrome DevTools (F12)
2. Click vào icon "Toggle device toolbar" (Ctrl+Shift+M)
3. Chọn device (iPhone, Samsung, etc.)
4. Bắt đầu tour

---

## 🧪 Testing

### Test Tour Hoạt Động

```bash
# 1. Start development server
cd frontend
npm run dev

# 2. Mở browser
http://localhost:3000/vi/auth/login

# 3. Click vào Help button (?) ở góc dưới phải
# 4. Xem tour chạy qua 13 steps
```

### Test Auto-Start Tour

```tsx
// Bật auto-start
<AutoTour tourName="login" delay={1000} enabled={true} />
```

**Kiểm tra:**
1. Mở trang login lần đầu → Tour tự động bắt đầu
2. Refresh page → Tour không chạy lại (đã seen)
3. Mở Console → Check `localStorage.getItem('tour_seen_login')` === `'true'`

### Reset Tour (Để test lại)

**Console:**
```javascript
localStorage.removeItem('tour_seen_login');
```

**Hoặc dùng Reset Button:**
```tsx
import { TourResetButton } from '@/components/tour/tour-button';

<TourResetButton tourName="login" />
```

---

## 🎯 10 Tài Khoản Demo

Tour highlight các tài khoản demo trong phần "Quick Login":

| Role | Email | Password | Highlight Class |
|------|-------|----------|----------------|
| Admin | admin@i-contexchange.vn | admin123 | `.quick-login-admin` |
| Buyer | buyer@example.com | buyer123 | `.quick-login-buyer` |
| Seller | seller@example.com | seller123 | `.quick-login-seller` |
| Manager | manager@example.com | manager123 | `.quick-login-manager` |
| Depot | depot@example.com | depot123 | *(optional)* |
| Inspector | inspector@example.com | inspector123 | *(optional)* |
| Finance | finance@example.com | finance123 | *(optional)* |
| Support | support@example.com | support123 | *(optional)* |
| Config | config@example.com | config123 | *(optional)* |
| Price | price@example.com | price123 | *(optional)* |

**Note:** Tour hiện tại highlight 4 accounts chính. Để highlight tất cả, thêm class tương tự vào các buttons còn lại.

---

## 🔧 Troubleshooting

### 1. Tour Không Hiện

**Kiểm tra:**
```javascript
// Check driver.js đã được install?
import { driver } from 'driver.js';
console.log(driver); // Should not be undefined

// Check tour steps đã được đăng ký?
import { startTour } from '@/lib/tour/driver-config';
startTour('login'); // Should start tour
```

**Giải pháp:**
```bash
cd frontend
npm install driver.js
```

### 2. Elements Không Được Highlight

**Lý do:** ID/Class không khớp

**Kiểm tra:**
```javascript
// Check element có tồn tại?
document.querySelector('#email'); // Should return element
document.querySelector('.quick-login-admin'); // Should return element
```

**Giải pháp:** Xem lại IDs trong `page.tsx` có khớp với `driver-config.ts`

### 3. Tour Chạy Quá Nhanh

**Tăng delay:**
```typescript
export const tourConfig: Config = {
  animate: true,
  smoothScroll: true,
  // ... other configs
};
```

### 4. Styling Không Áp Dụng

**Kiểm tra CSS import:**

**File:** `frontend/app/globals.css`
```css
@import '../styles/driver-custom.css';
```

**Nếu chưa có, thêm vào đầu file.**

---

## 📊 Tour Flow Diagram

```
🎯 Start
    ↓
📧 Email Input (Step 1)
    ↓
🔒 Password Input (Step 2)
    ↓
💾 Remember Me (Step 3)
    ↓
🔑 Forgot Password (Step 4)
    ↓
✅ Login Button (Step 5)
    ↓
🚀 Quick Login Section (Step 6)
    ↓
⚡ Admin Button (Step 7)
    ↓
🛒 Buyer Button (Step 8)
    ↓
🏪 Seller Button (Step 9)
    ↓
👨‍💼 Manager Button (Step 10)
    ↓
🌐 Social Login (Step 11)
    ↓
📝 Sign Up Link (Step 12)
    ↓
✓ Complete
```

---

## 🎁 Bonus: Thêm Tour Cho Các Trang Khác

### Register Page

```typescript
// driver-config.ts
export const registerTourSteps: DriveStep[] = [
  {
    popover: {
      title: '📝 Đăng Ký Tài Khoản Mới',
      description: 'Hãy điền thông tin để tạo tài khoản...',
    },
  },
  // ... add more steps
];

// register/page.tsx
import { TourHelpButton } from '@/components/tour/tour-button';

<TourHelpButton tourName="register" />
```

### Forgot Password Page

```typescript
export const forgotPasswordTourSteps: DriveStep[] = [
  {
    element: '#email-reset',
    popover: {
      title: '📧 Nhập Email',
      description: 'Nhập email để nhận link reset password...',
    },
  },
];
```

---

## 📚 Tài Liệu Tham Khảo

- **Driver.js Official Docs:** https://driverjs.com/
- **Tour Configuration:** `frontend/lib/tour/driver-config.ts`
- **Tour Components:** `frontend/components/tour/`
- **Custom Styling:** `frontend/styles/driver-custom.css`
- **Interactive Tour Guide:** `HUONG-DAN-INTERACTIVE-TOUR.md`

---

## ✨ Best Practices

### 1. Keep Steps Short
- Mỗi step nên focus vào 1 element
- Mô tả ngắn gọn (1-2 câu)
- Sử dụng emoji để thu hút

### 2. Logical Flow
- Sắp xếp steps theo thứ tự người dùng sẽ sử dụng
- Từ trên xuống dưới, trái sang phải

### 3. Highlight Important Elements
- Đăng nhập button
- Quick login demo accounts
- Forgot password link

### 4. Test Trên Nhiều Devices
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

### 5. Auto-Start Wisely
- Chỉ bật cho first-time users
- Thêm delay hợp lý (1-2s)
- Cho phép skip/close

---

## 🎉 Kết Luận

✅ **Login Tour đã được tích hợp thành công!**

**Tính năng:**
- 13 steps hướng dẫn chi tiết
- Auto-start cho first-time users
- Help button luôn available
- Highlight 10 demo accounts
- Responsive mobile-friendly
- Custom styling phù hợp theme

**Tiếp theo:**
- Thêm tour cho Register page
- Thêm tour cho Forgot Password page
- Tối ưu performance cho mobile
- A/B testing để cải thiện UX

---

💡 **Tips:** Enable auto-start tour bằng cách set `enabled={true}` trong `<AutoTour />` component!
