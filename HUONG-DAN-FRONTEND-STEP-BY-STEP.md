# 📘 HƯỚNG DẪN THỰC HÀNH FRONTEND - STEP BY STEP TUTORIAL

> **Mục tiêu**: Học cách làm việc với code frontend của dự án i-ContExchange bằng cách thực hành từng bước cụ thể

## 📚 Nội dung Tutorial

### 🎓 Phần 1: Setup & First Steps
- [Tutorial 1: Khởi động dự án lần đầu](#tutorial-1-khởi-động-dự-án-lần-đầu)
- [Tutorial 2: Tạo trang đầu tiên](#tutorial-2-tạo-trang-đầu-tiên)
- [Tutorial 3: Thêm component vào trang](#tutorial-3-thêm-component-vào-trang)

### 🔐 Phần 2: Authentication
- [Tutorial 4: Tạo form đăng nhập](#tutorial-4-tạo-form-đăng-nhập)
- [Tutorial 5: Kết nối với API login](#tutorial-5-kết-nối-với-api-login)
- [Tutorial 6: Protect routes với authentication](#tutorial-6-protect-routes-với-authentication)

### 🛡️ Phần 3: Authorization & Permissions
- [Tutorial 7: Kiểm tra quyền người dùng](#tutorial-7-kiểm-tra-quyền-người-dùng)
- [Tutorial 8: Ẩn/hiện button theo permission](#tutorial-8-ẩnhiện-button-theo-permission)
- [Tutorial 9: Tạo menu động theo role](#tutorial-9-tạo-menu-động-theo-role)

### 📡 Phần 4: API Integration
- [Tutorial 10: Fetch data từ API](#tutorial-10-fetch-data-từ-api)
- [Tutorial 11: Tạo mới record qua API](#tutorial-11-tạo-mới-record-qua-api)
- [Tutorial 12: Update và Delete data](#tutorial-12-update-và-delete-data)

### 🎨 Phần 5: UI & Components
- [Tutorial 13: Tạo component tái sử dụng](#tutorial-13-tạo-component-tái-sử-dụng)
- [Tutorial 14: Style với Tailwind CSS](#tutorial-14-style-với-tailwind-css)
- [Tutorial 15: Sử dụng Shadcn/ui components](#tutorial-15-sử-dụng-shadcnui-components)

### 🌍 Phần 6: Internationalization
- [Tutorial 16: Thêm text đa ngôn ngữ](#tutorial-16-thêm-text-đa-ngôn-ngữ)
- [Tutorial 17: Chuyển đổi ngôn ngữ](#tutorial-17-chuyển-đổi-ngôn-ngữ)

### 🚀 Phần 7: Complete Feature
- [Tutorial 18: Tạo tính năng hoàn chỉnh từ A-Z](#tutorial-18-tạo-tính-năng-hoàn-chỉnh-từ-a-z)

---

## PHẦN 1: SETUP & FIRST STEPS

---

## Tutorial 1: Khởi động dự án lần đầu

### � Mục tiêu
- Cài đặt và chạy được dự án trên máy local
- Hiểu được cấu trúc thư mục cơ bản
- Đăng nhập và xem được trang dashboard

### 📝 Bước thực hiện

#### Bước 1: Clone và cài đặt

```bash
# 1. Mở PowerShell hoặc Terminal
# 2. Di chuyển vào thư mục dự án
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web"

# 3. Cài đặt dependencies (chọn 1 trong 2)
npm install
# hoặc
pnpm install

# ⏱️ Đợi khoảng 2-3 phút để cài đặt
```

#### Bước 2: Setup môi trường Backend

```bash
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Copy file environment
cp .env.example .env

# 3. Mở file .env và kiểm tra
# DATABASE_URL="postgresql://postgres:240499@localhost:5432/i_contexchange"
# JWT_SECRET="your-secret-key-here"

# 4. Generate Prisma Client
npx prisma generate

# 5. Chạy migrations
npx prisma migrate dev

# 6. Seed dữ liệu demo
npx tsx prisma/seed.ts
```

#### Bước 3: Khởi động Backend

```bash
# Trong thư mục backend
npm run dev

# ✅ Backend chạy ở: http://localhost:3005
# Bạn sẽ thấy: "Server is running on http://localhost:3005"
```

#### Bước 4: Khởi động Frontend (terminal mới)

```bash
# 1. Mở terminal/PowerShell mới
# 2. Di chuyển vào thư mục Web
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web"

# 3. Chạy frontend
npm run dev

# ✅ Frontend chạy ở: http://localhost:3000
```

#### Bước 5: Truy cập và đăng nhập

```
1. Mở browser: http://localhost:3000
2. Click nút "Đăng nhập" hoặc vào: http://localhost:3000/vi/auth/login
3. Thử đăng nhập với:
   - Email: admin@i-contexchange.vn
   - Password: admin123
4. ✅ Bạn sẽ thấy trang Admin Dashboard
```

### ✅ Kiểm tra kết quả

- [ ] Backend chạy ở port 3005
- [ ] Frontend chạy ở port 3000
- [ ] Đăng nhập thành công
- [ ] Thấy menu sidebar bên trái
- [ ] Có thể click vào các menu item

### 🐛 Troubleshooting

**Lỗi "Port already in use":**
```bash
# Tìm process đang dùng port
netstat -ano | findstr :3000
# Kill process
taskkill /PID <process_id> /F
```

**Lỗi "Cannot connect to database":**
- Kiểm tra PostgreSQL đã chạy chưa
- Kiểm tra `DATABASE_URL` trong `.env`

---

## Tutorial 2: Tạo trang đầu tiên

### 🎯 Mục tiêu
- Tạo một trang mới trong dự án
- Hiểu cấu trúc routing của Next.js
- Truy cập được trang vừa tạo

### 📝 Bước thực hiện

#### Bước 1: Tạo file page mới

```bash
# 1. Tạo thư mục cho trang "test-page"
mkdir -p frontend/app/[locale]/test-page

# 2. Tạo file page.tsx
# Sử dụng editor (VS Code) hoặc command line
```

**File**: `frontend/app/[locale]/test-page/page.tsx`

```typescript
// Copy code này vào file page.tsx

export default function TestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">
        🎉 Trang Test Đầu Tiên
      </h1>
      
      <p className="text-gray-600 mb-4">
        Chúc mừng! Bạn đã tạo trang đầu tiên thành công.
      </p>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          Đây là trang test của bạn. Route: /test-page
        </p>
      </div>
    </div>
  );
}
```

#### Bước 2: Lưu file và test

```bash
# 1. Lưu file (Ctrl + S)
# 2. Frontend sẽ tự động reload
# 3. Mở browser và truy cập:
#    http://localhost:3000/vi/test-page
```

#### Bước 3: Thêm metadata cho trang

```typescript
// Thêm vào đầu file page.tsx

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test Page - i-ContExchange',
  description: 'Đây là trang test đầu tiên',
};

export default function TestPage() {
  // ... code như trên
}
```

### ✅ Kiểm tra kết quả

- [ ] Truy cập `/vi/test-page` thành công
- [ ] Thấy tiêu đề "Trang Test Đầu Tiên"
- [ ] Thấy box màu xanh với text
- [ ] Title tab browser hiển thị "Test Page"

### 💡 Giải thích

**Tại sao tạo trong `[locale]/`?**
- `[locale]` là dynamic route cho i18n
- Cho phép URL: `/vi/test-page` hoặc `/en/test-page`
- Tự động handle đa ngôn ngữ

**Routing trong Next.js:**
```
frontend/app/[locale]/test-page/page.tsx  →  /vi/test-page
frontend/app/[locale]/about/page.tsx      →  /vi/about
frontend/app/[locale]/contact/page.tsx    →  /vi/contact
```

---

## Tutorial 3: Thêm component vào trang

### 🎯 Mục tiêu
- Tạo một component riêng
- Import và sử dụng component trong page
- Truyền props vào component

### 📝 Bước thực hiện

#### Bước 1: Tạo component đơn giản

**File**: `frontend/components/test/welcome-card.tsx`

```typescript
// 1. Tạo thư mục: components/test/
// 2. Tạo file: welcome-card.tsx
// 3. Copy code này vào:

interface WelcomeCardProps {
  title: string;
  description: string;
  userName?: string;
}

export function WelcomeCard({ title, description, userName }: WelcomeCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {title}
      </h2>
      
      {userName && (
        <p className="text-sm text-gray-500 mb-3">
          Xin chào, {userName}!
        </p>
      )}
      
      <p className="text-gray-700">
        {description}
      </p>
      
      <div className="mt-4 flex gap-2">
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
          ✅ Active
        </span>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
          🎯 New
        </span>
      </div>
    </div>
  );
}
```

#### Bước 2: Sử dụng component trong page

**File**: `frontend/app/[locale]/test-page/page.tsx`

```typescript
// Update file page.tsx

import { WelcomeCard } from '@/components/test/welcome-card';

export default function TestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        🎉 Trang Test Component
      </h1>
      
      {/* Sử dụng component với props */}
      <div className="space-y-4">
        <WelcomeCard
          title="Component đầu tiên"
          description="Đây là component WelcomeCard được tái sử dụng."
          userName="Developer"
        />
        
        <WelcomeCard
          title="Component thứ hai"
          description="Cùng một component nhưng với nội dung khác."
        />
        
        <WelcomeCard
          title="Component thứ ba"
          description="Bạn có thể tạo bao nhiêu component cũng được!"
          userName="Admin"
        />
      </div>
    </div>
  );
}
```

#### Bước 3: Test và xem kết quả

```bash
# 1. Lưu cả 2 file (Ctrl + S)
# 2. Refresh browser: http://localhost:3000/vi/test-page
# 3. Bạn sẽ thấy 3 cards giống nhau nhưng khác nội dung
```

### ✅ Kiểm tra kết quả

- [ ] Thấy 3 cards được hiển thị
- [ ] Card 1 và 3 có text "Xin chào, ..."
- [ ] Card 2 không có text "Xin chào"
- [ ] Mỗi card có 2 badges (Active, New)

### 💡 Giải thích

**Props là gì?**
- Props = Properties = Thuộc tính truyền vào component
- Giống như function parameters

**Optional props (`?`):**
```typescript
userName?: string  // Có thể có hoặc không
```

**Import path `@/`:**
```typescript
import { WelcomeCard } from '@/components/test/welcome-card';
// @ = frontend/ (root directory)
```

---

## PHẦN 2: AUTHENTICATION

---

## Tutorial 4: Tạo form đăng nhập

### 🎯 Mục tiêu
- Tạo form đăng nhập với validation
- Sử dụng React Hook Form + Zod
- Style form với Shadcn/ui components

### 📝 Bước thực hiện

#### Bước 1: Tạo file login page mới

**File**: `frontend/app/[locale]/my-login/page.tsx`

```typescript
// Tạo folder: app/[locale]/my-login/
// Tạo file: page.tsx

'use client';

import { useState } from 'react';

export default function MyLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login clicked:', { email, password });
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          🔐 Đăng Nhập
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>
          
          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          
          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Đăng Nhập
          </button>
        </form>
      </div>
    </div>
  );
}
```

#### Bước 2: Test form cơ bản

```bash
# 1. Lưu file
# 2. Truy cập: http://localhost:3000/vi/my-login
# 3. Thử nhập email và password
# 4. Click "Đăng Nhập"
# 5. Mở Console (F12) → Xem log
```

#### Bước 3: Thêm validation với Zod

```typescript
// Update file page.tsx

'use client';

import { useState } from 'react';
import { z } from 'zod';

// Định nghĩa schema validation
const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Password phải có ít nhất 6 ký tự'),
});

export default function MyLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const result = loginSchema.safeParse({ email, password });
    
    if (!result.success) {
      // Có lỗi validation
      const fieldErrors: any = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    
    // Validation thành công
    setErrors({});
    console.log('✅ Form valid:', result.data);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          🔐 Đăng Nhập
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.email 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          
          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.password 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          
          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Đăng Nhập
          </button>
        </form>
      </div>
    </div>
  );
}
```

#### Bước 4: Test validation

```bash
# Test các trường hợp:
1. Submit form rỗng → Thấy lỗi
2. Nhập email sai format (abc) → Thấy lỗi "Email không hợp lệ"
3. Nhập password ngắn (123) → Thấy lỗi "Password phải có ít nhất 6 ký tự"
4. Nhập đúng cả 2 → Console log "✅ Form valid"
```

### ✅ Kiểm tra kết quả

- [ ] Form hiển thị đẹp, center màn hình
- [ ] Input có border màu đỏ khi có lỗi
- [ ] Hiển thị message lỗi bên dưới input
- [ ] Validation hoạt động chính xác
- [ ] Console log data khi form valid

### 💡 Giải thích

**`'use client'` là gì?**
- Báo cho Next.js biết đây là Client Component
- Cần thiết khi dùng hooks như `useState`, `useEffect`
- Có thể dùng event handlers (onClick, onChange)

**Zod schema:**
```typescript
z.string()           // Phải là string
.email()            // Phải là email format
.min(6)             // Độ dài tối thiểu 6 ký tự
```

---

## Tutorial 5: Kết nối với API login

### 🎯 Mục tiêu
- Gọi API login thật từ backend
- Lưu token vào localStorage
- Redirect sau khi login thành công
- Xử lý lỗi từ API

### 📝 Bước thực hiện

#### Bước 1: Tạo API client

**File**: `frontend/lib/api/auth-client.ts`

```typescript
// Tạo folder: lib/api/
// Tạo file: auth-client.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api/v1';

export const authApi = {
  // Login function
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    return data;
  },
};
```

#### Bước 2: Update login page để call API

```typescript
// Update file: app/[locale]/my-login/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { authApi } from '@/lib/api/auth-client';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Password phải có ít nhất 6 ký tự'),
});

export default function MyLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    
    // Validate form
    const result = loginSchema.safeParse({ email, password });
    
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    
    // Call API
    setErrors({});
    setIsLoading(true);
    
    try {
      const response = await authApi.login(email, password);
      
      console.log('✅ Login success:', response);
      
      // Lưu token vào localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      // Redirect về dashboard
      router.push('/vi/dashboard');
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setApiError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          🔐 Đăng Nhập
        </h1>
        
        {/* API Error Alert */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{apiError}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.email 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              } disabled:bg-gray-100`}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          
          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.password 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              } disabled:bg-gray-100`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>
        
        {/* Test accounts hint */}
        <div className="mt-6 p-3 bg-gray-50 rounded text-sm">
          <p className="font-medium text-gray-700 mb-1">Test accounts:</p>
          <p className="text-gray-600">Admin: admin@i-contexchange.vn / admin123</p>
          <p className="text-gray-600">Seller: seller@example.com / seller123</p>
        </div>
      </div>
    </div>
  );
}
```

#### Bước 3: Test login thật

```bash
# 1. Đảm bảo backend đang chạy (port 3005)
# 2. Truy cập: http://localhost:3000/vi/my-login
# 3. Nhập: admin@i-contexchange.vn / admin123
# 4. Click "Đăng Nhập"
# 5. ✅ Sẽ redirect về /vi/dashboard
```

#### Bước 4: Kiểm tra token đã lưu

```bash
# Mở Browser Console (F12)
# Gõ lệnh:
localStorage.getItem('token')

# Sẽ thấy JWT token được lưu
```

### ✅ Kiểm tra kết quả

- [ ] Login thành công với tài khoản đúng
- [ ] Hiển thị lỗi với tài khoản sai
- [ ] Button disabled khi đang loading
- [ ] Token được lưu vào localStorage
- [ ] Redirect về dashboard sau login

### 💡 Giải thích

**async/await:**
```typescript
const response = await authApi.login(email, password);
// Đợi API trả về rồi mới chạy tiếp
```

**try/catch:**
```typescript
try {
  // Code có thể gây lỗi
} catch (error) {
  // Xử lý lỗi
} finally {
  // Chạy dù thành công hay lỗi
}
```

**localStorage:**
```typescript
localStorage.setItem('token', value);  // Lưu
localStorage.getItem('token');         // Lấy
localStorage.removeItem('token');      // Xóa
```

---

## Tutorial 6: Protect routes với authentication

### 🎯 Mục tiêu
- Tạo component guard để protect routes
- Redirect về login nếu chưa đăng nhập
- Hiển thị thông tin user đã đăng nhập

### 📝 Bước thực hiện

#### Bước 1: Tạo Auth Guard component

**File**: `frontend/components/guards/simple-auth-guard.tsx`

```typescript
// Tạo folder: components/guards/
// Tạo file: simple-auth-guard.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SimpleAuthGuardProps {
  children: React.ReactNode;
}

export function SimpleAuthGuard({ children }: SimpleAuthGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Kiểm tra token trong localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Không có token → redirect về login
      console.log('❌ No token found, redirecting to login');
      router.push('/vi/auth/login');
      return;
    }
    
    // Có token → cho phép access
    console.log('✅ Token found, user authenticated');
    setIsAuthenticated(true);
    setIsChecking(false);
  }, [router]);
  
  // Đang kiểm tra → hiển thị loading
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra...</p>
        </div>
      </div>
    );
  }
  
  // Đã authenticated → hiển thị nội dung
  if (isAuthenticated) {
    return <>{children}</>;
  }
  
  // Fallback
  return null;
}
```

#### Bước 2: Tạo protected page

**File**: `frontend/app/[locale]/protected-page/page.tsx`

```typescript
// Tạo folder: app/[locale]/protected-page/
// Tạo file: page.tsx

'use client';

import { SimpleAuthGuard } from '@/components/guards/simple-auth-guard';
import { useRouter } from 'next/navigation';

function ProtectedContent() {
  const router = useRouter();
  
  const handleLogout = () => {
    // Xóa token
    localStorage.removeItem('token');
    
    // Redirect về login
    router.push('/vi/auth/login');
  };
  
  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-green-900 mb-2">
            🔒 Protected Page
          </h1>
          <p className="text-green-700">
            Chúc mừng! Bạn đã đăng nhập và có thể xem trang này.
          </p>
        </div>
        
        {/* User info */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Thông tin người dùng</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Token:</span> {localStorage.getItem('token')?.substring(0, 50)}...</p>
            <p><span className="font-medium">Status:</span> <span className="text-green-600">✅ Authenticated</span></p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/vi/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            📊 Dashboard
          </button>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            🚪 Đăng Xuất
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProtectedPage() {
  return (
    <SimpleAuthGuard>
      <ProtectedContent />
    </SimpleAuthGuard>
  );
}
```

#### Bước 3: Test protected page

```bash
# Test Case 1: Chưa đăng nhập
1. Xóa token: localStorage.removeItem('token')
2. Truy cập: http://localhost:3000/vi/protected-page
3. ✅ Sẽ redirect về /vi/auth/login

# Test Case 2: Đã đăng nhập
1. Login tại: http://localhost:3000/vi/my-login
2. Truy cập: http://localhost:3000/vi/protected-page
3. ✅ Thấy nội dung protected page

# Test Case 3: Logout
1. Click button "Đăng Xuất"
2. ✅ Token bị xóa và redirect về login
3. Thử access protected page lại → redirect về login
```

### ✅ Kiểm tra kết quả

- [ ] Không thể access protected page khi chưa login
- [ ] Tự động redirect về login page
- [ ] Hiển thị loading spinner khi checking auth
- [ ] Hiển thị nội dung khi đã authenticated
- [ ] Logout xóa token và redirect đúng

### 💡 Giải thích

**Guard Pattern:**
```typescript
<SimpleAuthGuard>
  <ProtectedContent />  {/* Chỉ render khi authenticated */}
</SimpleAuthGuard>
```

**useEffect with empty deps:**
```typescript
useEffect(() => {
  // Chỉ chạy 1 lần khi component mount
}, []);
```

**Conditional rendering:**
```typescript
if (isChecking) return <Loading />;
if (isAuthenticated) return <Content />;
return null;
```

---

## PHẦN 3: AUTHORIZATION & PERMISSIONS

---

## Tutorial 7: Kiểm tra quyền người dùng

### 🎯 Mục tiêu
- Fetch thông tin user từ API
- Lưu user data vào Context
- Kiểm tra permissions của user

### 📝 Bước thực hiện

#### Bước 1: Tạo hook để get user info

**File**: `frontend/hooks/use-current-user.ts`

```typescript
// Tạo folder: hooks/ (nếu chưa có)
// Tạo file: use-current-user.ts

'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser();
  }, []);
  
  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3005/api/v1/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('👤 User data:', data);
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return { user, loading };
}
```

#### Bước 2: Tạo page hiển thị user info

**File**: `frontend/app/[locale]/my-profile/page.tsx`

```typescript
'use client';

import { SimpleAuthGuard } from '@/components/guards/simple-auth-guard';
import { useCurrentUser } from '@/hooks/use-current-user';

function ProfileContent() {
  const { user, loading } = useCurrentUser();
  
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <div className="p-8 text-center text-red-600">Không tìm thấy thông tin user</div>;
  }
  
  return (
    <div className="container mx-auto p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-6">👤 Thông Tin Tài Khoản</h1>
        
        {/* Basic Info */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">ID:</span>
              <span className="ml-2 text-gray-900">{user.id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <span className="ml-2 text-gray-900">{user.email}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Tên:</span>
              <span className="ml-2 text-gray-900">{user.name}</span>
            </div>
          </div>
        </div>
        
        {/* Roles */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Vai trò ({user.roles.length})</h2>
          <div className="flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <span
                key={role}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
              >
                🎭 {role}
              </span>
            ))}
          </div>
        </div>
        
        {/* Permissions */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Quyền hạn ({user.permissions.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {user.permissions.map((permission) => (
              <div
                key={permission}
                className="px-3 py-2 bg-green-50 text-green-800 rounded text-sm border border-green-200"
              >
                ✅ {permission}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyProfilePage() {
  return (
    <SimpleAuthGuard>
      <ProfileContent />
    </SimpleAuthGuard>
  );
}
```

#### Bước 3: Test xem user info

```bash
# 1. Login tại: http://localhost:3000/vi/my-login
# 2. Truy cập: http://localhost:3000/vi/my-profile
# 3. ✅ Thấy thông tin user, roles, và permissions
```

### ✅ Kiểm tra kết quả

- [ ] Hiển thị đúng email và tên user
- [ ] Hiển thị danh sách roles (badges màu tím)
- [ ] Hiển thị danh sách permissions (boxes màu xanh)
- [ ] Loading spinner hiển thị khi fetch data

---

## Tutorial 8: Ẩn/hiện button theo permission

### 🎯 Mục tiêu
- Tạo hook check permission
- Ẩn/hiện UI elements dựa trên permission
- Tạo PermissionGuard component

### 📝 Bước thực hiện

#### Bước 1: Tạo hook check permission

**File**: `frontend/hooks/use-permission.ts`

```typescript
'use client';

import { useCurrentUser } from './use-current-user';

export function usePermission() {
  const { user, loading } = useCurrentUser();
  
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };
  
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    return permissions.some(p => user.permissions.includes(p));
  };
  
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user) return false;
    return permissions.every(p => user.permissions.includes(p));
  };
  
  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  };
  
  return {
    user,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
  };
}
```

#### Bước 2: Tạo demo page với conditional buttons

**File**: `frontend/app/[locale]/permission-demo/page.tsx`

```typescript
'use client';

import { SimpleAuthGuard } from '@/components/guards/simple-auth-guard';
import { usePermission } from '@/hooks/use-permission';

function PermissionDemoContent() {
  const { hasPermission, hasRole, loading } = usePermission();
  
  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  
  return (
    <div className="container mx-auto p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🛡️ Permission Demo</h1>
        
        {/* Example 1: Single permission */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Single Permission Check</h2>
          <p className="text-gray-600 mb-4">
            Permission: <code className="bg-gray-100 px-2 py-1 rounded">admin.users.read</code>
          </p>
          
          {hasPermission('admin.users.read') ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800">✅ Bạn có quyền xem danh sách users</p>
              <button className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Xem Users
              </button>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800">❌ Bạn không có quyền xem danh sách users</p>
            </div>
          )}
        </div>
        
        {/* Example 2: Write permission */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">2. Write Permission Check</h2>
          <p className="text-gray-600 mb-4">
            Permission: <code className="bg-gray-100 px-2 py-1 rounded">listings.write</code>
          </p>
          
          <div className="flex gap-3">
            {/* Read button - luôn hiện nếu có quyền read */}
            {hasPermission('listings.read') && (
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                👁️ Xem Listings
              </button>
            )}
            
            {/* Create button - chỉ hiện nếu có quyền write */}
            {hasPermission('listings.write') && (
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                ➕ Tạo Listing
              </button>
            )}
            
            {/* Delete button - chỉ hiện nếu có quyền delete */}
            {hasPermission('listings.delete') && (
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                🗑️ Xóa Listing
              </button>
            )}
          </div>
          
          {!hasPermission('listings.read') && (
            <p className="mt-3 text-gray-500 text-sm">Không có button nào hiển thị (không có quyền)</p>
          )}
        </div>
        
        {/* Example 3: Role check */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">3. Role Check</h2>
          
          <div className="space-y-3">
            {hasRole('admin') && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                <p className="text-purple-800">👑 Bạn là Admin - có quyền cao nhất</p>
              </div>
            )}
            
            {hasRole('seller') && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-blue-800">🏪 Bạn là Seller - có thể bán container</p>
              </div>
            )}
            
            {hasRole('buyer') && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800">🛒 Bạn là Buyer - có thể mua container</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PermissionDemoPage() {
  return (
    <SimpleAuthGuard>
      <PermissionDemoContent />
    </SimpleAuthGuard>
  );
}
```

#### Bước 3: Test với các user khác nhau

```bash
# Test với Admin
1. Logout hiện tại
2. Login: admin@i-contexchange.vn / admin123
3. Truy cập: http://localhost:3000/vi/permission-demo
4. ✅ Thấy tất cả buttons (admin có full quyền)

# Test với Seller
1. Logout
2. Login: seller@example.com / seller123
3. Truy cập: http://localhost:3000/vi/permission-demo
4. ✅ Chỉ thấy một số buttons (seller có quyền hạn chế hơn)

# Test với Buyer
1. Logout
2. Login: buyer@example.com / buyer123
3. Truy cập: http://localhost:3000/vi/permission-demo
4. ✅ Thấy buttons khác với seller
```

### ✅ Kiểm tra kết quả

- [ ] Admin thấy nhiều buttons nhất
- [ ] Seller và Buyer thấy buttons khác nhau
- [ ] UI thay đổi dựa trên permissions
- [ ] Role badges hiển thị đúng

### 💡 Giải thích

**Conditional rendering pattern:**
```typescript
{hasPermission('some.permission') && (
  <Button>Chỉ hiện khi có quyền</Button>
)}

{condition ? <ComponentA /> : <ComponentB />}
```

**Array methods:**
```typescript
.includes()  // Check có trong array không
.some()      // Check có ít nhất 1 item thỏa điều kiện
.every()     // Check tất cả items thỏa điều kiện
```

---

## PHẦN 4: API INTEGRATION

---

## Tutorial 10: Fetch data từ API

### 🎯 Mục tiêu
- Fetch danh sách data từ API
- Hiển thị data trong table
- Handle loading và error states
- Sử dụng React Query

### 📝 Bước thực hiện

#### Bước 1: Install React Query (nếu chưa có)

```bash
npm install @tanstack/react-query
# hoặc
pnpm add @tanstack/react-query
```

#### Bước 2: Tạo API client cho users

**File**: `frontend/lib/api/users-api.ts`

```typescript
const API_URL = 'http://localhost:3005/api/v1';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  createdAt: string;
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const data = await response.json();
    return data.users || data;
  },
};
```

#### Bước 3: Tạo page hiển thị users với React Query

**File**: `frontend/app/[locale]/users-list/page.tsx`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { SimpleAuthGuard } from '@/components/guards/simple-auth-guard';
import { usersApi, User } from '@/lib/api/users-api';

function UsersListContent() {
  // Fetch data với React Query
  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Đang tải danh sách users...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-2">❌ Lỗi</h2>
          <p className="text-red-700 mb-4">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }
  
  // Success state - có data
  return (
    <div className="container mx-auto p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">👥 Danh Sách Users</h1>
          <p className="text-gray-600 mt-1">Tổng: {users?.length || 0} users</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🔄 Refresh
        </button>
      </div>
      
      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Vai trò
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ngày tạo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users && users.length > 0 ? (
              users.map((user: User) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  Không có users nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function UsersListPage() {
  return (
    <SimpleAuthGuard>
      <UsersListContent />
    </SimpleAuthGuard>
  );
}
```

#### Bước 4: Wrap app với QueryClient Provider

**File**: `frontend/app/layout.tsx` (hoặc tạo mới nếu chưa có)

```typescript
// Thêm vào layout.tsx hoặc tạo provider riêng

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

#### Bước 5: Test fetch data

```bash
# 1. Login với admin account
# 2. Truy cập: http://localhost:3000/vi/users-list
# 3. ✅ Thấy danh sách users trong table
# 4. Click "Refresh" → Data reload
```

### ✅ Kiểm tra kết quả

- [ ] Hiển thị loading spinner khi fetch
- [ ] Hiển thị table với data
- [ ] Mỗi user có email, name, roles
- [ ] Click Refresh → data reload
- [ ] Hiển thị error nếu API fail

### 💡 Giải thích

**React Query benefits:**
- ✅ Auto caching
- ✅ Auto refetch
- ✅ Loading & error states
- ✅ Easy refresh

**Table structure:**
```typescript
<table>
  <thead>      {/* Header */}
  <tbody>      {/* Body với data */}
</table>
```

---

## PHẦN 5: COMPLETE FEATURE

---

## Tutorial 18: Tạo tính năng hoàn chỉnh từ A-Z

### 🎯 Mục tiêu
Tạo tính năng **"Ghi chú" (Notes)** hoàn chỉnh với:
- ✅ Hiển thị danh sách notes
- ✅ Tạo note mới
- ✅ Sửa note
- ✅ Xóa note
- ✅ Protected với authentication
- ✅ Styled đẹp với Tailwind

### 📝 Các bước thực hiện

#### BƯỚC 1: Tạo API endpoints (Mock data)

**File**: `frontend/lib/api/notes-api.ts`

```typescript
// Mock data - trong thực tế sẽ call backend API
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

let mockNotes: Note[] = [
  {
    id: '1',
    title: 'Note đầu tiên',
    content: 'Đây là nội dung của note đầu tiên',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Meeting Notes',
    content: 'Ghi chú buổi họp ngày 29/10/2025',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const notesApi = {
  getAll: async (): Promise<Note[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockNotes];
  },
  
  getById: async (id: string): Promise<Note | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockNotes.find(note => note.id === id);
  },
  
  create: async (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newNote: Note = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockNotes.push(newNote);
    return newNote;
  },
  
  update: async (id: string, data: Partial<Note>): Promise<Note> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockNotes.findIndex(note => note.id === id);
    if (index === -1) throw new Error('Note not found');
    
    mockNotes[index] = {
      ...mockNotes[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockNotes[index];
  },
  
  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    mockNotes = mockNotes.filter(note => note.id !== id);
  },
};
```

#### BƯỚC 2: Tạo components

**File**: `frontend/components/notes/note-card.tsx`

```typescript
import { Note } from '@/lib/api/notes-api';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition">
      <h3 className="font-semibold text-lg mb-2">{note.title}</h3>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{note.content}</p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {new Date(note.updatedAt).toLocaleDateString('vi-VN')}
        </span>
        
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(note)}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            ✏️ Sửa
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            🗑️ Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
```

**File**: `frontend/components/notes/note-form.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/lib/api/notes-api';

interface NoteFormProps {
  note?: Note | null;
  onSubmit: (data: { title: string; content: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function NoteForm({ note, onSubmit, onCancel, isLoading }: NoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [note]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập tiêu đề note..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nội dung
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={isLoading}
          rows={4}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập nội dung note..."
        />
      </div>
      
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Đang lưu...' : note ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
}
```

#### BƯỚC 3: Tạo main page

**File**: `frontend/app/[locale]/notes/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SimpleAuthGuard } from '@/components/guards/simple-auth-guard';
import { notesApi, Note } from '@/lib/api/notes-api';
import { NoteCard } from '@/components/notes/note-card';
import { NoteForm } from '@/components/notes/note-form';

function NotesContent() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  // Fetch notes
  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: notesApi.getAll,
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: notesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setIsFormOpen(false);
      alert('✅ Tạo note thành công!');
    },
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Note> }) =>
      notesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setEditingNote(null);
      alert('✅ Cập nhật note thành công!');
    },
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: notesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      alert('✅ Xóa note thành công!');
    },
  });
  
  const handleCreate = (data: { title: string; content: string }) => {
    createMutation.mutate(data);
  };
  
  const handleUpdate = (data: { title: string; content: string }) => {
    if (editingNote) {
      updateMutation.mutate({ id: editingNote.id, data });
    }
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa note này?')) {
      deleteMutation.mutate(id);
    }
  };
  
  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingNote(null);
  };
  
  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  
  return (
    <div className="container mx-auto p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📝 Ghi Chú</h1>
          <p className="text-gray-600 mt-1">Quản lý ghi chú của bạn</p>
        </div>
        
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            ➕ Tạo Note Mới
          </button>
        )}
      </div>
      
      {/* Form */}
      {isFormOpen && (
        <div className="mb-8 bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingNote ? '✏️ Sửa Note' : '➕ Tạo Note Mới'}
          </h2>
          <NoteForm
            note={editingNote}
            onSubmit={editingNote ? handleUpdate : handleCreate}
            onCancel={handleCloseForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      )}
      
      {/* Notes Grid */}
      {notes && notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">📭 Chưa có note nào</p>
          <p className="text-gray-400 text-sm mt-2">Click "Tạo Note Mới" để bắt đầu</p>
        </div>
      )}
    </div>
  );
}

export default function NotesPage() {
  return (
    <SimpleAuthGuard>
      <NotesContent />
    </SimpleAuthGuard>
  );
}
```

#### BƯỚC 4: Test toàn bộ tính năng

```bash
# 1. Login
http://localhost:3000/vi/my-login

# 2. Truy cập Notes page
http://localhost:3000/vi/notes

# 3. Test các tính năng:
✅ Xem danh sách notes (có 2 notes mẫu)
✅ Click "Tạo Note Mới" → Nhập form → Submit
✅ Click "Sửa" một note → Thay đổi → Update
✅ Click "Xóa" một note → Confirm → Xóa thành công
✅ Form validation hoạt động
✅ Loading states hiển thị đúng
```

### ✅ Kiểm tra kết quả

- [ ] Hiển thị danh sách notes dạng grid
- [ ] Tạo note mới thành công
- [ ] Sửa note thành công
- [ ] Xóa note có confirm dialog
- [ ] Form có validation
- [ ] Loading states hoạt động
- [ ] UI responsive và đẹp

### 🎉 Chúc mừng!

Bạn đã hoàn thành một tính năng **CRUD hoàn chỉnh** từ A-Z! Áp dụng pattern này cho các tính năng khác trong dự án.

---

## 📚 Tài Liệu Bổ Sung

### 🔗 Links tham khảo
- **Next.js**: https://nextjs.org/docs
- **React Query**: https://tanstack.com/query/latest
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Zod**: https://zod.dev/

### 🎓 Best Practices đã học

1. ✅ **Component Structure**: Tách nhỏ components (Card, Form, Page)
2. ✅ **State Management**: React Query cho server state, useState cho UI state
3. ✅ **TypeScript**: Định nghĩa rõ ràng types/interfaces
4. ✅ **Error Handling**: Try/catch và error states
5. ✅ **Loading States**: Hiển thị loading khi async operations
6. ✅ **Authentication**: Protected routes với guards
7. ✅ **Permissions**: Check quyền trước khi hiển thị UI
8. ✅ **API Integration**: Sử dụng React Query mutations
9. ✅ **Styling**: Tailwind CSS với responsive design
10. ✅ **User Experience**: Confirmations, alerts, feedback

---

## 🚀 Bước Tiếp Theo

Sau khi hoàn thành tutorial này, bạn có thể:

1. **Áp dụng vào dự án thật**: 
   - Tạo các tính năng mới theo pattern đã học
   - Kết nối với backend API thật
   - Implement các business logic phức tạp

2. **Nâng cao kỹ năng**:
   - Học thêm về Next.js Server Components
   - Tìm hiểu về optimistic updates
   - Implement real-time features với WebSocket

3. **Optimize performance**:
   - Code splitting
   - Image optimization
   - Caching strategies

---

**💡 Lời khuyên cuối**: 
- Thực hành là cách tốt nhất để học
- Đọc error messages kỹ càng
- Dùng console.log() để debug
- Tham khảo docs khi cần
- Đừng sợ thử nghiệm!

**🎉 Chúc bạn code vui vẻ và thành công!**

*Last updated: October 29, 2025*

---

## 3. Cấu Trúc Code Frontend

### 📁 Cấu trúc thư mục chính

```
frontend/
├── app/                          # Next.js App Router
│   ├── [locale]/                # Routes có i18n
│   │   ├── page.tsx            # Trang chủ
│   │   ├── layout.tsx          # Layout chính
│   │   ├── auth/               # Authentication pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot/
│   │   ├── admin/              # Admin pages (7+ pages)
│   │   ├── buyer/              # Buyer pages
│   │   ├── seller/             # Seller pages
│   │   ├── dashboard/          # Dashboard
│   │   ├── listings/           # Container listings
│   │   ├── orders/             # Order management
│   │   └── ...
│   ├── api/                     # API routes (server-side)
│   ├── auth/                    # Auth fallback routes
│   └── globals.css             # Global styles
│
├── components/                  # Reusable components
│   ├── ui/                     # Base UI components (Shadcn)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/                 # Layout components
│   │   ├── rbac-dashboard-sidebar.tsx
│   │   ├── header.tsx
│   │   └── footer.tsx
│   ├── providers/              # Context providers
│   │   ├── auth-context.tsx
│   │   └── theme-provider.tsx
│   ├── guards/                 # Route protection
│   │   ├── auth-guard.tsx
│   │   └── permission-guard.tsx
│   ├── listings/               # Listing components
│   ├── orders/                 # Order components
│   └── ...
│
├── lib/                        # Utilities & helpers
│   ├── api/                   # API client
│   │   ├── client.ts
│   │   └── endpoints/
│   ├── auth/                  # Auth utilities
│   ├── utils/                 # Helper functions
│   └── constants/             # Constants
│
├── hooks/                      # Custom React hooks
│   ├── use-auth.ts
│   ├── use-permissions.ts
│   └── ...
│
├── types/                      # TypeScript types
│   ├── auth.ts
│   ├── user.ts
│   └── ...
│
├── i18n/                       # i18n configuration
│   └── routing.ts
│
├── messages/                   # Translation files
│   ├── en.json
│   └── vi.json
│
└── public/                     # Static assets
    ├── images/
    └── icons/
```

### 📄 File quan trọng

#### `middleware.ts` - Route protection
```typescript
// Xử lý authentication, i18n, và permissions
export default async function middleware(request: NextRequest) {
  // 1. Handle locale
  // 2. Check authentication
  // 3. Verify permissions
}
```

#### `next.config.mjs` - Next.js configuration
```javascript
// Cấu hình Next.js, i18n, images, API routes
```

#### `tailwind.config.js` - Styling configuration
```javascript
// Cấu hình Tailwind CSS, theme, colors
```

---

## 4. Routing và Navigation

### 🗺️ Cấu trúc Routes

#### A. Public Routes (không cần đăng nhập)
```
/ hoặc /{locale}              → Trang chủ
/auth/login                    → Đăng nhập
/auth/register                 → Đăng ký
/auth/forgot                   → Quên mật khẩu
/help                          → Trợ giúp
```

#### B. Protected Routes (cần đăng nhập)

**Admin Routes** (role: admin)
```
/admin                         → Admin dashboard
/admin/users                   → Quản lý users
/admin/users/kyc              → KYC approval
/admin/roles                   → Quản lý roles
/admin/permissions            → Quản lý permissions
/admin/settings               → Settings
/admin/disputes               → Quản lý tranh chấp
```

**Buyer Routes** (role: buyer)
```
/buyer/dashboard              → Buyer dashboard
/buyer/rfqs                   → Request for Quote
/buyer/orders                 → Đơn hàng của buyer
```

**Seller Routes** (role: seller)
```
/seller/dashboard             → Seller dashboard
/seller/listings              → Quản lý listings
/seller/listings/create       → Tạo listing mới
/seller/listings/edit/[id]    → Chỉnh sửa listing
/seller/orders                → Đơn hàng seller
/seller/rfqs                  → RFQ của seller
```

**Shared Routes** (tất cả users)
```
/dashboard                     → Main dashboard
/listings                      → Browse containers
/listings/[id]                → Chi tiết listing
/orders                        → Quản lý orders
/orders/[id]                  → Chi tiết order
/favorites                     → Danh sách yêu thích
/account/profile              → Profile settings
/account/settings             → Account settings
```

### 🧭 Navigation Component

**Dynamic Sidebar** - `components/layout/rbac-dashboard-sidebar.tsx`

Menu sidebar tự động hiển thị dựa trên:
- ✅ Role của user
- ✅ Permissions của user
- ✅ Locale hiện tại

```typescript
// Cách hoạt động
const sidebar = <RBACDashboardSidebar 
  user={currentUser}          // User object với roles & permissions
  locale="vi"                 // Current locale
/>

// Menu tự động filter theo permissions
if (hasPermission('admin.users.read')) {
  // Hiển thị menu "Users"
}
```

### 🔗 Tạo Link Navigation

**❌ Không nên dùng:**
```typescript
import Link from 'next/link';  // Không hỗ trợ i18n tự động
```

**✅ Nên dùng:**
```typescript
import { Link } from '@/i18n/routing';  // Tự động thêm locale prefix

<Link href="/dashboard">Dashboard</Link>
// → Tự động redirect: /vi/dashboard hoặc /en/dashboard
```

**Router Navigation:**
```typescript
import { useRouter } from '@/i18n/routing';

const router = useRouter();
router.push('/orders');        // Tự động thêm locale
router.replace('/dashboard');  // Replace history
```

---

## 5. Authentication & Authorization

### 🔐 Authentication Flow

#### Bước 1: Login Process

**File**: `app/[locale]/auth/login/page.tsx`

```typescript
// 1. User submit form login
const handleLogin = async (data: LoginFormData) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: data.email,
      password: data.password
    })
  });
  
  // 2. Backend trả về JWT token + user data
  const { token, user } = await response.json();
  
  // 3. Save token vào localStorage
  localStorage.setItem('token', token);
  
  // 4. Save user data vào Context
  setUser(user);
  
  // 5. Redirect dựa trên role
  if (user.roles.includes('admin')) {
    router.push('/admin');
  } else if (user.roles.includes('seller')) {
    router.push('/seller/dashboard');
  } else {
    router.push('/dashboard');
  }
};
```

#### Bước 2: Auth Context

**File**: `components/providers/auth-context.tsx`

```typescript
// Context cung cấp user data cho toàn bộ app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load user từ token khi app khởi động
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    }
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook để sử dụng
export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
```

#### Bước 3: Sử dụng Auth trong Component

```typescript
import { useAuth } from '@/components/providers/auth-context';

export default function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;
  
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Role: {user.roles[0]}</p>
    </div>
  );
}
```

### 🛡️ Authorization (Permissions)

#### Permission Guard Component

**File**: `components/guards/permission-guard.tsx`

```typescript
interface PermissionGuardProps {
  permissions: string[];  // Required permissions
  requireAll?: boolean;   // Require ALL or ANY
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ 
  permissions, 
  requireAll = false,
  children,
  fallback 
}: PermissionGuardProps) {
  const { user } = useAuth();
  
  // Check if user has required permissions
  const hasPermission = requireAll
    ? permissions.every(p => userPermissions.includes(p))
    : permissions.some(p => userPermissions.includes(p));
    
  if (!hasPermission) {
    return fallback || <AccessDenied />;
  }
  
  return <>{children}</>;
}
```

#### Sử dụng Permission Guard

```typescript
// Ví dụ 1: Protect cả page
export default function AdminUsersPage() {
  return (
    <PermissionGuard permissions={['admin.users.read']}>
      <div>Admin Users Content</div>
    </PermissionGuard>
  );
}

// Ví dụ 2: Protect button
<PermissionGuard permissions={['listings.delete']}>
  <Button onClick={handleDelete}>Delete</Button>
</PermissionGuard>

// Ví dụ 3: Require nhiều permissions
<PermissionGuard 
  permissions={['admin.users.read', 'admin.users.write']}
  requireAll={true}
>
  <Button>Edit User</Button>
</PermissionGuard>
```

#### Hook để check permission

```typescript
// File: hooks/use-permissions.ts
export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission) || false;
  };
  
  const hasAnyPermission = (permissions: string[]) => {
    return permissions.some(p => hasPermission(p));
  };
  
  const hasAllPermissions = (permissions: string[]) => {
    return permissions.every(p => hasPermission(p));
  };
  
  return { hasPermission, hasAnyPermission, hasAllPermissions };
};

// Sử dụng
const { hasPermission } = usePermissions();

if (hasPermission('admin.users.write')) {
  // Show edit button
}
```

---

## 6. Components

### 🎨 UI Components (Shadcn/ui)

Dự án sử dụng **Shadcn/ui** - một collection của reusable components.

#### Cài đặt component mới

```bash
# Thêm component từ Shadcn
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
```

#### Sử dụng UI Components

```typescript
// File: components/ui/button.tsx (đã có sẵn)
import { Button } from "@/components/ui/button";

<Button variant="default">Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

```typescript
// Dialog (Modal)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <div>Content here</div>
  </DialogContent>
</Dialog>
```

```typescript
// Table
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map(user => (
      <TableRow key={user.id}>
        <TableCell>{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### 🏗️ Layout Components

#### Sidebar Navigation

**File**: `components/layout/rbac-dashboard-sidebar.tsx`

```typescript
// Component tự động render menu dựa trên permissions
<RBACDashboardSidebar />

// Menu items được filter tự động
const menuItems = MENU_ITEMS.filter(item => {
  // Check permission
  if (item.permission) {
    return hasPermission(item.permission);
  }
  // Check role
  if (item.roles) {
    return item.roles.some(role => userRoles.includes(role));
  }
  return true;
});
```

#### Header

```typescript
// components/layout/header.tsx
<Header>
  <Logo />
  <Navigation />
  <UserMenu />
  <LanguageToggle />
  <ThemeToggle />
</Header>
```

### 📦 Feature Components

#### Listing Components

```typescript
// components/listings/listing-card.tsx
<ListingCard
  listing={listingData}
  onFavorite={handleFavorite}
  onViewDetails={handleView}
/>

// components/listings/listing-form.tsx
<ListingForm
  mode="create"  // or "edit"
  initialData={listing}
  onSubmit={handleSubmit}
/>

// components/listings/listing-filters.tsx
<ListingFilters
  onFilterChange={handleFilterChange}
  initialFilters={filters}
/>
```

#### Order Components

```typescript
// components/orders/order-table.tsx
<OrderTable
  orders={orders}
  onViewDetails={handleViewOrder}
  onUpdateStatus={handleUpdateStatus}
/>

// components/orders/order-status-badge.tsx
<OrderStatusBadge status="pending" />
<OrderStatusBadge status="confirmed" />
<OrderStatusBadge status="completed" />
```

---

## 7. State Management

### 🗄️ Zustand Store

#### Create Store

```typescript
// lib/stores/cart-store.ts
import { create } from 'zustand';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  
  clearCart: () => set({ items: [] })
}));
```

#### Sử dụng Store

```typescript
import { useCartStore } from '@/lib/stores/cart-store';

export function CartComponent() {
  const items = useCartStore(state => state.items);
  const addItem = useCartStore(state => state.addItem);
  
  return (
    <div>
      <p>Items: {items.length}</p>
      <Button onClick={() => addItem(newItem)}>
        Add to Cart
      </Button>
    </div>
  );
}
```

### ⚛️ React Context

**File**: `components/providers/auth-context.tsx`

```typescript
// Đã có sẵn Auth Context
// Sử dụng:
const { user, setUser, logout } = useAuth();
```

---

## 8. API Integration

### 🔌 API Client Setup

#### API Client Configuration

**File**: `lib/api/client.ts`

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - thêm token vào mọi request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - xử lý lỗi
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - redirect to login
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
```

### 📡 API Endpoints

#### Auth API

```typescript
// lib/api/auth.ts
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
  
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
  
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  }
};
```

#### Listings API

```typescript
// lib/api/listings.ts
export const listingsApi = {
  getAll: async (filters?: ListingFilters) => {
    const response = await apiClient.get('/listings', { params: filters });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await apiClient.get(`/listings/${id}`);
    return response.data;
  },
  
  create: async (data: CreateListingData) => {
    const response = await apiClient.post('/listings', data);
    return response.data;
  },
  
  update: async (id: string, data: UpdateListingData) => {
    const response = await apiClient.put(`/listings/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await apiClient.delete(`/listings/${id}`);
    return response.data;
  }
};
```

### 🪝 API Hooks với React Query

```typescript
// hooks/use-listings.ts
import { useQuery, useMutation } from '@tanstack/react-query';

export const useListings = (filters?: ListingFilters) => {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => listingsApi.getAll(filters),
  });
};

export const useListing = (id: string) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: listingsApi.create,
    onSuccess: () => {
      // Refetch listings after create
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
};
```

### 📝 Sử dụng API trong Component

```typescript
import { useListings, useCreateListing } from '@/hooks/use-listings';

export function ListingsPage() {
  // Fetch data
  const { data: listings, isLoading, error } = useListings();
  
  // Create mutation
  const createMutation = useCreateListing();
  
  const handleCreate = async (data: CreateListingData) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Listing created successfully!');
    } catch (error) {
      toast.error('Failed to create listing');
    }
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {listings.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
```

---

## 9. Internationalization (i18n)

### 🌍 Cấu hình i18n

**File**: `i18n/routing.ts`

```typescript
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const locales = ['en', 'vi'] as const;
export const defaultLocale = 'vi' as const;

export const { Link, useRouter, usePathname } = 
  createSharedPathnamesNavigation({ locales });
```

### 📝 Translation Files

**File**: `messages/vi.json`

```json
{
  "common": {
    "login": "Đăng nhập",
    "logout": "Đăng xuất",
    "save": "Lưu",
    "cancel": "Hủy"
  },
  "dashboard": {
    "title": "Bảng điều khiển",
    "welcome": "Chào mừng, {name}"
  },
  "listings": {
    "title": "Danh sách Container",
    "create": "Tạo Listing mới",
    "edit": "Chỉnh sửa Listing"
  }
}
```

**File**: `messages/en.json`

```json
{
  "common": {
    "login": "Login",
    "logout": "Logout",
    "save": "Save",
    "cancel": "Cancel"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome, {name}"
  },
  "listings": {
    "title": "Container Listings",
    "create": "Create New Listing",
    "edit": "Edit Listing"
  }
}
```

### 🔤 Sử dụng Translation trong Component

```typescript
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  const tDashboard = useTranslations('dashboard');
  
  return (
    <div>
      <h1>{tDashboard('title')}</h1>
      <p>{tDashboard('welcome', { name: 'John' })}</p>
      <Button>{t('save')}</Button>
    </div>
  );
}
```

### 🌐 Language Toggle

```typescript
import { useRouter, usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  
  const handleChangeLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };
  
  return (
    <Select value={locale} onValueChange={handleChangeLanguage}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
        <SelectItem value="en">🇬🇧 English</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

---

## 10. Tạo Tính Năng Mới

### 🎯 Ví dụ: Tạo tính năng "Wishlist"

#### Bước 1: Tạo API Endpoints

**File**: `lib/api/wishlist.ts`

```typescript
import { apiClient } from './client';

export const wishlistApi = {
  getAll: async () => {
    const response = await apiClient.get('/wishlist');
    return response.data;
  },
  
  add: async (listingId: string) => {
    const response = await apiClient.post('/wishlist', { listingId });
    return response.data;
  },
  
  remove: async (listingId: string) => {
    const response = await apiClient.delete(`/wishlist/${listingId}`);
    return response.data;
  }
};
```

#### Bước 2: Tạo Custom Hook

**File**: `hooks/use-wishlist.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '@/lib/api/wishlist';

export const useWishlist = () => {
  const queryClient = useQueryClient();
  
  const { data: items, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.getAll,
  });
  
  const addMutation = useMutation({
    mutationFn: wishlistApi.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
  
  const removeMutation = useMutation({
    mutationFn: wishlistApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
  
  return {
    items,
    isLoading,
    addToWishlist: addMutation.mutateAsync,
    removeFromWishlist: removeMutation.mutateAsync,
  };
};
```

#### Bước 3: Tạo Component

**File**: `components/wishlist/wishlist-button.tsx`

```typescript
'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/use-wishlist';
import { toast } from 'react-hot-toast';

interface WishlistButtonProps {
  listingId: string;
}

export function WishlistButton({ listingId }: WishlistButtonProps) {
  const { items, addToWishlist, removeFromWishlist } = useWishlist();
  
  const isInWishlist = items?.some(item => item.listingId === listingId);
  
  const handleToggle = async () => {
    try {
      if (isInWishlist) {
        await removeFromWishlist(listingId);
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        await addToWishlist(listingId);
        toast.success('Đã thêm vào danh sách yêu thích');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };
  
  return (
    <Button
      variant={isInWishlist ? 'default' : 'outline'}
      size="icon"
      onClick={handleToggle}
    >
      <Heart className={isInWishlist ? 'fill-current' : ''} />
    </Button>
  );
}
```

#### Bước 4: Tạo Page

**File**: `app/[locale]/wishlist/page.tsx`

```typescript
import { useTranslations } from 'next-intl';
import { useWishlist } from '@/hooks/use-wishlist';
import { ListingCard } from '@/components/listings/listing-card';

export default function WishlistPage() {
  const t = useTranslations('wishlist');
  const { items, isLoading } = useWishlist();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      
      {items.length === 0 ? (
        <p>{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map(item => (
            <ListingCard key={item.id} listing={item.listing} />
          ))}
        </div>
      )}
    </div>
  );
}
```

#### Bước 5: Thêm Translation

**File**: `messages/vi.json`

```json
{
  "wishlist": {
    "title": "Danh sách yêu thích",
    "empty": "Chưa có container nào trong danh sách yêu thích",
    "add": "Thêm vào yêu thích",
    "remove": "Xóa khỏi yêu thích"
  }
}
```

#### Bước 6: Thêm vào Navigation

**File**: `components/layout/rbac-dashboard-sidebar.tsx`

```typescript
const menuItems = [
  // ... existing items
  {
    title: 'Yêu thích',
    href: '/wishlist',
    icon: Heart,
    permission: 'listings.read',
  },
];
```

---

## 📚 Tài Liệu Bổ Sung

### 🔗 Links hữu ích

- **Next.js Documentation**: https://nextjs.org/docs
- **Shadcn/ui Components**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Hook Form**: https://react-hook-form.com/
- **Zustand**: https://github.com/pmndrs/zustand
- **next-intl**: https://next-intl-docs.vercel.app/

### 🎓 Best Practices

1. **Component Structure**
   - Một component một file
   - Tên file = tên component (kebab-case)
   - Export default cho main component
   - Export named cho helper functions

2. **TypeScript**
   - Luôn define types cho props
   - Sử dụng interface cho object types
   - Tránh `any`, dùng `unknown` nếu cần

3. **State Management**
   - Local state cho UI state
   - Context cho shared state
   - Zustand cho global state
   - React Query cho server state

4. **API Calls**
   - Luôn sử dụng React Query
   - Handle loading & error states
   - Implement retry logic
   - Cache data appropriately

5. **Styling**
   - Sử dụng Tailwind CSS
   - Tránh inline styles
   - Tái sử dụng component variants
   - Mobile-first approach

6. **Security**
   - Luôn validate input
   - Check permissions trước khi render
   - Không expose sensitive data
   - Sanitize user input

---

## 🐛 Troubleshooting

### Lỗi thường gặp và cách fix

#### 1. "Cannot find module '@/...'"
```bash
# Kiểm tra tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 2. "Authentication failed"
```typescript
// Kiểm tra token trong localStorage
console.log(localStorage.getItem('token'));

// Kiểm tra API endpoint
console.log(process.env.NEXT_PUBLIC_API_URL);
```

#### 3. "Permission denied"
```typescript
// Debug permissions
const { user } = useAuth();
console.log('User permissions:', user?.permissions);
```

#### 4. Build errors
```bash
# Clear cache và rebuild
rm -rf .next
npm run build
```

#### 5. i18n routing not working
```typescript
// Ensure middleware.ts is configured correctly
export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
```

---

## 📞 Hỗ Trợ

Nếu bạn gặp vấn đề hoặc cần hỗ trợ:

1. **Xem documentation**: Kiểm tra các file `.md` trong thư mục `/docs`
2. **Check examples**: Xem các component có sẵn để tham khảo
3. **Console logs**: Sử dụng `console.log()` để debug
4. **React DevTools**: Install extension để inspect components
5. **Network tab**: Check API calls trong browser DevTools

---

**🎉 Chúc bạn code vui vẻ!**

*Last updated: October 2025*
