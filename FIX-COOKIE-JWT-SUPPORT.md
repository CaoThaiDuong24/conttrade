# FIX: Backend hỗ trợ JWT từ Cookie

## ❌ VẤN ĐỀ

Frontend gửi JWT token qua **cookie** (`accessToken`) nhưng backend chỉ hỗ trợ đọc token từ **Authorization header**.

### Triệu chứng
```
Error: Token expired - Permissions have been updated. Please login again.
Response status: 401 Unauthorized
```

Khi frontend gọi API (ví dụ: `/api/v1/admin/rbac/roles`), backend không nhận được token từ cookie → reject request.

## ✅ GIẢI PHÁP

### 1. Cài đặt `@fastify/cookie` plugin

```bash
cd backend
npm install @fastify/cookie
```

### 2. Import cookie plugin (`backend/src/server.ts`)

```typescript
import Fastify from 'fastify'
import cors from '@fastify/cors'
import sensible from '@fastify/sensible'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'  // ← THÊM
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
```

### 3. Register cookie plugin TRƯỚC JWT plugin

```typescript
console.log('Registering cookie plugin...')
await app.register(cookie)  // ← THÊM

console.log('Registering JWT plugin...')
await app.register(jwt, { 
  secret: JWT_SECRET,
  cookie: {
    cookieName: 'accessToken',  // ← THÊM: Đọc từ cookie accessToken
    signed: false               // ← Cookie không signed
  }
})
```

## 🔍 CÁCH HOẠT ĐỘNG

### Trước khi fix
```
Frontend → Cookie: accessToken=eyJhbGc...
             ↓
Backend JWT Plugin → Chỉ đọc từ Authorization header
             ↓
          ❌ Token not found → 401 Unauthorized
```

### Sau khi fix
```
Frontend → Cookie: accessToken=eyJhbGc...
             ↓
Backend Cookie Plugin → Parse cookies
             ↓
Backend JWT Plugin → Đọc từ cookie 'accessToken'
             ↓
          ✅ Token found → Verify → Success
```

## 📝 FILES ĐÃ SỬA

### `backend/src/server.ts`

**Thay đổi 1: Import cookie plugin**
```diff
import Fastify from 'fastify'
import cors from '@fastify/cors'
import sensible from '@fastify/sensible'
import jwt from '@fastify/jwt'
+ import cookie from '@fastify/cookie'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
```

**Thay đổi 2: Register cookie plugin**
```diff
console.log('Registering sensible plugin...')
// await app.register(sensible)

+ console.log('Registering cookie plugin...')
+ await app.register(cookie)

console.log('Registering JWT plugin...')
await app.register(jwt, { 
- secret: JWT_SECRET
+ secret: JWT_SECRET,
+ cookie: {
+   cookieName: 'accessToken',
+   signed: false
+ }
})
```

## ✅ KẾT QUẢ

- ✅ Backend giờ hỗ trợ JWT từ cả **Authorization header** và **Cookie**
- ✅ Frontend có thể gửi token qua cookie `accessToken`
- ✅ API `/admin/rbac/roles` và các endpoints khác hoạt động bình thường
- ✅ Không cần thay đổi gì ở frontend

## 🧪 TEST

### Test 1: Login và lấy token trong cookie

```bash
curl -X POST http://localhost:3006/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  -c cookies.txt

# Token sẽ được lưu trong cookies.txt
```

### Test 2: Gọi API với token từ cookie

```bash
curl -X GET http://localhost:3006/api/v1/admin/rbac/roles \
  -b cookies.txt

# Kết quả: 200 OK với danh sách roles
```

### Test 3: Frontend auto test

Mở browser → DevTools → Application → Cookies → Kiểm tra có cookie `accessToken`

Sau đó truy cập admin panel → Quản lý phân quyền → Không còn lỗi 401

## 🎯 TÓM TẮT

**Vấn đề:** Backend không đọc JWT từ cookie  
**Nguyên nhân:** JWT plugin không được config để đọc cookie  
**Giải pháp:** Cài và register `@fastify/cookie` + config JWT plugin  
**Kết quả:** ✅ Backend hỗ trợ cả Authorization header và Cookie  

---

**Ngày fix:** 28/10/2025  
**Status:** ✅ HOÀN THÀNH VÀ TESTED
