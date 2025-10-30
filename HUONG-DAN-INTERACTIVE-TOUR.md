# 🎯 HƯỚNG DẪN TƯƠNG TÁC TRỰC TIẾP (Interactive Tour)

> **Hệ thống hướng dẫn người dùng tương tác ngay trên UI - giống Driver.js**

---

## 📚 Mục Lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Cài đặt](#2-cài-đặt)
3. [Sử dụng cơ bản](#3-sử-dụng-cơ-bản)
4. [Tours có sẵn](#4-tours-có-sẵn)
5. [Tùy chỉnh Tour](#5-tùy-chỉnh-tour)
6. [Tạo Tour mới](#6-tạo-tour-mới)
7. [Best Practices](#7-best-practices)

---

## 1. Giới thiệu

### 🎬 Interactive Tour là gì?

Interactive Tour là hệ thống hướng dẫn **tương tác trực tiếp** trên giao diện web:
- ✨ **Highlight** các phần tử UI quan trọng
- 💬 **Popup** giải thích chi tiết từng bước
- 🎯 **Guide** người dùng từng step một
- 🚀 **Tự động** hiện khi lần đầu truy cập

### 🌟 Features

- ✅ **6 tours có sẵn** cho các trang chính
- ✅ **Auto-start** cho first-time users
- ✅ **Responsive** - hoạt động trên mobile
- ✅ **Customizable** - dễ tùy chỉnh
- ✅ **Multilingual** - hỗ trợ đa ngôn ngữ
- ✅ **Persistent** - nhớ user đã xem tour chưa

### 🎨 Demo

![Tour Demo](https://driverjs.com/images/driver-screenshot.png)

---

## 2. Cài đặt

### Bước 1: Install driver.js

```bash
cd frontend
npm install driver.js
```

### Bước 2: Import styles

**File:** `frontend/app/globals.css`

```css
/* Thêm vào cuối file */
@import '../styles/driver-custom.css';
```

### Bước 3: Kiểm tra

Files đã có sẵn:
```
frontend/
├── lib/tour/
│   └── driver-config.ts         ← Tour configuration & steps
├── components/tour/
│   ├── tour-button.tsx          ← Tour trigger buttons
│   └── auto-tour.tsx            ← Auto-start component
└── styles/
    └── driver-custom.css        ← Custom styles
```

---

## 3. Sử dụng Cơ Bản

### A. Auto-start Tour (Tự động)

Tour sẽ **tự động bắt đầu** khi user lần đầu truy cập page.

```typescript
// frontend/app/[locale]/listings/page.tsx

'use client';

import { AutoTour } from '@/components/tour/auto-tour';

export default function ListingsPage() {
  return (
    <>
      {/* Auto-start tour sau 1.5s */}
      <AutoTour tourName="listings" delay={1500} />
      
      {/* Page content */}
      <div>
        <h1>Listings Page</h1>
        {/* ... */}
      </div>
    </>
  );
}
```

### B. Manual Tour Button (Thủ công)

Thêm nút để user có thể xem lại tour.

```typescript
import { TourButton, TourHelpButton } from '@/components/tour/tour-button';

export default function MyPage() {
  return (
    <div>
      {/* Header với tour button */}
      <div className="flex items-center justify-between mb-6">
        <h1>Dashboard</h1>
        
        {/* Option 1: Button với text */}
        <TourButton 
          tourName="dashboard" 
          label="Xem hướng dẫn"
          variant="outline"
        />
        
        {/* Option 2: Icon button */}
        <TourHelpButton tourName="dashboard" />
      </div>
      
      {/* Page content */}
    </div>
  );
}
```

### C. Programmatic Start (Code)

Start tour từ bất kỳ đâu trong code.

```typescript
import { startTour } from '@/lib/tour/driver-config';

function MyComponent() {
  const handleShowHelp = () => {
    startTour('dashboard');
  };
  
  return (
    <button onClick={handleShowHelp}>
      Cần giúp đỡ?
    </button>
  );
}
```

---

## 4. Tours Có Sẵn

Dự án đã có **6 tours** built-in cho các trang chính:

### 1️⃣ Dashboard Tour

**Tour name:** `dashboard`

**Hướng dẫn:**
- Menu navigation
- User profile button
- Notifications
- Language toggle
- Dashboard stats
- Recent activities

**Sử dụng:**

```typescript
// frontend/app/[locale]/dashboard/page.tsx
import { AutoTour } from '@/components/tour/auto-tour';

export default function DashboardPage() {
  return (
    <>
      <AutoTour tourName="dashboard" />
      {/* Content với các IDs: */}
      <nav id="sidebar-navigation">...</nav>
      <button id="user-profile-button">...</button>
      <button id="notifications-button">...</button>
      <div id="language-toggle">...</div>
      <div id="dashboard-stats">...</div>
      <div id="recent-activities">...</div>
    </>
  );
}
```

### 2️⃣ Listings Tour

**Tour name:** `listings`

**Hướng dẫn:**
- Search input
- Filter buttons
- Create listing button
- Listing cards
- Favorite button
- View details button

**Sử dụng:**

```typescript
// frontend/app/[locale]/listings/page.tsx
<AutoTour tourName="listings" />

{/* Elements cần có IDs/classes: */}
<input id="search-input" />
<div id="filter-buttons">...</div>
<button id="create-listing-button">...</button>
<div className="listing-card">...</div>
<button className="listing-favorite-button">...</button>
<button className="listing-view-button">...</button>
```

### 3️⃣ Create Listing Tour

**Tour name:** `createListing`

**Hướng dẫn:**
- Title input
- Deal type select
- Container size select
- Condition select
- Price input
- Location input
- Description textarea
- Image upload
- Submit button

**Sử dụng:**

```typescript
// frontend/app/[locale]/seller/listings/create/page.tsx
<AutoTour tourName="createListing" />

{/* Form elements: */}
<input id="listing-title-input" />
<select id="deal-type-select">...</select>
<select id="container-size-select">...</select>
<select id="container-condition-select">...</select>
<input id="price-input" />
<input id="location-input" />
<textarea id="description-textarea">...</textarea>
<div id="image-upload">...</div>
<button id="submit-button">...</button>
```

### 4️⃣ Orders Tour

**Tour name:** `orders`

**Hướng dẫn:**
- Order tabs (status filters)
- Order cards
- Status badges
- Action buttons

**Sử dụng:**

```typescript
// frontend/app/[locale]/orders/page.tsx
<AutoTour tourName="orders" />

<div id="order-tabs">...</div>
<div className="order-card">...</div>
<span className="order-status-badge">...</span>
<div className="order-action-buttons">...</div>
```

### 5️⃣ Admin Users Tour

**Tour name:** `adminUsers`

**Hướng dẫn:**
- Create user button
- Search users
- Users table
- Role badges
- Edit user button

**Sử dụng:**

```typescript
// frontend/app/[locale]/admin/users/page.tsx
<AutoTour tourName="adminUsers" />

<button id="create-user-button">...</button>
<input id="users-search" />
<table id="users-table">...</table>
<div className="user-role-badges">...</div>
<button className="user-edit-button">...</button>
```

### 6️⃣ Settings Tour

**Tour name:** `settings`

**Hướng dẫn:**
- Profile section
- Avatar upload
- Password section
- Notification preferences

**Sử dụng:**

```typescript
// frontend/app/[locale]/account/settings/page.tsx
<AutoTour tourName="settings" />

<div id="profile-section">...</div>
<div id="avatar-upload">...</div>
<div id="password-section">...</div>
<div id="notification-preferences">...</div>
```

---

## 5. Tùy Chỉnh Tour

### A. Tùy chỉnh config global

**File:** `frontend/lib/tour/driver-config.ts`

```typescript
export const tourConfig: Config = {
  showProgress: true,              // Hiện "Bước 1/5"
  showButtons: ['next', 'previous', 'close'],
  progressText: 'Bước {{current}}/{{total}}',
  nextBtnText: 'Tiếp theo →',
  prevBtnText: '← Quay lại',
  doneBtnText: '✓ Hoàn thành',
  closeBtnText: '✕',
  animate: true,                   // Animation khi chuyển step
  overlayClickNext: false,         // Click overlay không next
  smoothScroll: true,              // Smooth scroll đến element
  allowClose: true,                // Cho phép đóng tour
  disableActiveInteraction: false, // Có thể interact với element
};
```

### B. Tùy chỉnh styles

**File:** `frontend/styles/driver-custom.css`

```css
:root {
  --driver-overlay-color: rgba(0, 0, 0, 0.75);
  --driver-popover-bg-color: #ffffff;
  --driver-btn-bg-color: #3b82f6;
  /* ... các CSS variables khác */
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --driver-popover-bg-color: #1f2937;
    --driver-popover-text-color: #f3f4f6;
  }
}
```

### C. Tùy chỉnh từng step

```typescript
const customSteps: DriveStep[] = [
  {
    element: '#my-element',
    popover: {
      title: '🎯 Custom Title',
      description: 'Custom description here',
      side: 'bottom',          // top, right, bottom, left
      align: 'start',          // start, center, end
      showButtons: ['next'],   // Chỉ hiện nút Next
      popoverClass: 'my-custom-class',
      onNextClick: () => {
        console.log('Next clicked!');
      },
      onPrevClick: () => {
        console.log('Previous clicked!');
      },
    },
  },
];
```

---

## 6. Tạo Tour Mới

### Ví dụ: Tạo tour cho trang "RFQ (Request for Quote)"

#### Bước 1: Định nghĩa steps

**File:** `frontend/lib/tour/driver-config.ts`

```typescript
// Thêm vào file driver-config.ts

export const rfqTourSteps: DriveStep[] = [
  {
    popover: {
      title: '📋 Request for Quote (RFQ)',
      description: 'Đây là trang để tạo yêu cầu báo giá từ sellers. Hãy để tôi hướng dẫn!',
    },
  },
  {
    element: '#rfq-title-input',
    popover: {
      title: '📝 Tiêu Đề RFQ',
      description: 'Nhập tiêu đề mô tả ngắn gọn về container bạn cần. VD: "Cần 10 container 40ft mới"',
      side: 'bottom',
    },
  },
  {
    element: '#container-requirements',
    popover: {
      title: '📦 Yêu Cầu Container',
      description: 'Chọn kích thước, tình trạng, số lượng container bạn cần.',
      side: 'bottom',
    },
  },
  {
    element: '#delivery-location',
    popover: {
      title: '📍 Địa Điểm Giao Hàng',
      description: 'Nhập địa điểm bạn muốn nhận container.',
      side: 'bottom',
    },
  },
  {
    element: '#budget-range',
    popover: {
      title: '💰 Ngân Sách',
      description: 'Nhập khoảng giá bạn mong muốn. Sellers sẽ dựa vào đó để báo giá.',
      side: 'top',
    },
  },
  {
    element: '#rfq-submit',
    popover: {
      title: '✅ Gửi RFQ',
      description: 'Sau khi gửi, sellers sẽ nhận được thông báo và gửi quotation cho bạn.',
      side: 'top',
    },
  },
];
```

#### Bước 2: Thêm vào tours registry

```typescript
// Trong function startTour, thêm:

const tours: Record<string, DriveStep[]> = {
  dashboard: dashboardTourSteps,
  listings: listingsTourSteps,
  createListing: createListingTourSteps,
  orders: ordersTourSteps,
  adminUsers: adminUsersTourSteps,
  settings: settingsTourSteps,
  rfq: rfqTourSteps,  // ← Thêm dòng này
};
```

#### Bước 3: Thêm IDs vào HTML

**File:** `frontend/app/[locale]/buyer/rfq/create/page.tsx`

```typescript
'use client';

import { AutoTour } from '@/components/tour/auto-tour';
import { TourHelpButton } from '@/components/tour/tour-button';

export default function CreateRFQPage() {
  return (
    <>
      {/* Auto-start tour */}
      <AutoTour tourName="rfq" delay={1500} />
      
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1>Tạo Request for Quote</h1>
          
          {/* Help button */}
          <TourHelpButton tourName="rfq" />
        </div>
        
        <form>
          {/* Thêm IDs tương ứng với tour steps */}
          <input 
            id="rfq-title-input"
            placeholder="Tiêu đề RFQ..."
          />
          
          <div id="container-requirements">
            <select id="container-size">...</select>
            <select id="container-condition">...</select>
            <input id="quantity" type="number" />
          </div>
          
          <input 
            id="delivery-location"
            placeholder="Địa điểm giao hàng..."
          />
          
          <div id="budget-range">
            <input id="min-budget" placeholder="Giá tối thiểu" />
            <input id="max-budget" placeholder="Giá tối đa" />
          </div>
          
          <button id="rfq-submit" type="submit">
            Gửi RFQ
          </button>
        </form>
      </div>
    </>
  );
}
```

#### Bước 4: Test tour

```bash
# 1. Chạy dev server
npm run dev

# 2. Truy cập page
http://localhost:3000/vi/buyer/rfq/create

# 3. Tour sẽ tự động bắt đầu sau 1.5s

# 4. Reset tour để test lại (dev only)
# Mở console và gõ:
localStorage.removeItem('tour_seen_rfq');
# Refresh page
```

---

## 7. Best Practices

### ✅ Dos

1. **Descriptive titles với emojis**
   ```typescript
   title: '🔍 Tìm Kiếm'  // ✅ Good
   title: 'Search'       // ❌ Boring
   ```

2. **Short descriptions (1-2 câu)**
   ```typescript
   description: 'Nhập từ khóa để tìm kiếm container.'  // ✅ Concise
   description: 'Đây là ô tìm kiếm, bạn có thể nhập...' // ❌ Too long
   ```

3. **Logical step order**
   - Bắt đầu với overview
   - Theo flow tự nhiên (top → bottom, left → right)
   - Kết thúc với action button

4. **Clear element selectors**
   ```typescript
   element: '#search-input'           // ✅ ID selector
   element: '.btn-primary:first-child' // ✅ Specific class
   element: 'button'                   // ❌ Too generic
   ```

5. **Test on mobile**
   - Tour phải hoạt động trên mobile
   - Popover không bị cắt
   - Buttons đủ lớn để tap

### ❌ Don'ts

1. **Quá nhiều steps** (> 10 steps)
   - User sẽ bỏ qua
   - Chia thành nhiều tours nhỏ

2. **Highlight element không tồn tại**
   - Check element có render chưa
   - Dùng conditional rendering

3. **Hardcode text** (không i18n)
   ```typescript
   // ❌ Bad
   title: 'Search'
   
   // ✅ Good (future)
   title: t('tour.search.title')
   ```

4. **Quá nhiều auto-tours**
   - Chỉ auto-start tour quan trọng nhất
   - Còn lại để user tự trigger

5. **Không test trên production**
   - Tour có thể break khi UI thay đổi
   - Kiểm tra định kỳ

---

## 🎯 Cheat Sheet

### Quick Start

```typescript
// 1. Import
import { AutoTour } from '@/components/tour/auto-tour';
import { TourButton } from '@/components/tour/tour-button';
import { startTour } from '@/lib/tour/driver-config';

// 2. Auto-start
<AutoTour tourName="dashboard" />

// 3. Manual button
<TourButton tourName="dashboard" label="Help" />

// 4. Programmatic
startTour('dashboard');

// 5. Reset (dev only)
localStorage.removeItem('tour_seen_dashboard');
```

### Available Tours

```typescript
startTour('dashboard');      // Dashboard tour
startTour('listings');       // Listings page
startTour('createListing');  // Create listing form
startTour('orders');         // Orders management
startTour('adminUsers');     // Admin users page
startTour('settings');       // Settings page
```

### Element IDs Required

Check `frontend/lib/tour/driver-config.ts` để xem đầy đủ IDs cần thiết cho mỗi tour.

---

## 📞 Hỗ Trợ

### Debug Issues

1. **Tour không chạy:**
   ```typescript
   // Check console
   console.log('Starting tour:', tourName);
   
   // Check element tồn tại
   const el = document.querySelector('#my-element');
   console.log('Element found:', el);
   ```

2. **Element không highlight:**
   - Check ID/class selector đúng chưa
   - Element có bị hidden không (display: none)
   - Element có z-index thấp không

3. **Popover bị cắt:**
   - Thử đổi `side` property
   - Check parent container có overflow: hidden không

### Resources

- **Driver.js Docs**: https://driverjs.com/
- **Examples**: Xem các tour có sẵn trong `driver-config.ts`
- **Styles**: Customize trong `driver-custom.css`

---

**🎉 Chúc bạn tạo tours tuyệt vời!**

*Cập nhật: October 29, 2025*
