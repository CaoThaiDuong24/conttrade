# 🔍 PHÂN TÍCH LỖI LOGIN - ADMIN@I-CONTEXCHANGE.VN

## 📸 Lỗi từ ảnh screenshot:

```
🚪 Starting login process for: admin@i-contexchange.vn
❌ API URL: undefined
▶ POST http://45.122.244.231/vi/auth/undefined/api/v1/auth/login 404 (Not Found)
❌ Response status: 404
▶ login failed with exception: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

---

## 🎯 NGUYÊN NHÂN GỐC RỄ

### **Lỗi 1: NEXT_PUBLIC_API_URL = undefined**

Frontend đang gọi API với URL sai:
```
http://45.122.244.231/vi/auth/undefined/api/v1/auth/login
                          ^^^^^^^^^
                          Đây là vị trí của NEXT_PUBLIC_API_URL bị undefined
```

**URL đúng phải là:**
```
http://45.122.244.231/api/v1/auth/login
```

---

## 🔧 TẠI SAO XẢY RA?

### 1. **Thiếu file `.env` hoặc `.env.local` trong frontend**

Kiểm tra cho thấy:
```bash
cd /home/lta/pj/conttrade/frontend
ls -la | grep .env
# Kết quả: Chỉ có .env.example và .env.production.example
# KHÔNG CÓ .env hoặc .env.local
```

### 2. **Biến môi trường không được set khi build hoặc runtime**

Trong code `middleware.ts` (line 220):
```typescript
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
```

Trong code `lib/api.ts` (line 3):
```typescript
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006') + '/api/v1'
```

**Vấn đề**: Nếu frontend được build mà không có biến môi trường, code sẽ bị compile với giá trị `undefined` thay vì fallback về `localhost:3006`.

### 3. **Next.js cần restart sau khi thay đổi .env**

Next.js chỉ load biến môi trường khi start. Nếu thêm `.env` file trong khi app đang chạy, cần restart.

---

## ✅ GIẢI PHÁP

### **Bước 1: Tạo file `.env.local` cho frontend**

```bash
cd /home/lta/pj/conttrade/frontend
cat > .env.local << 'EOF'
# Backend API URL - Production
NEXT_PUBLIC_API_URL=http://45.122.244.231:3006

# Optional: For local development
# NEXT_PUBLIC_API_URL=http://localhost:3006
EOF
```

### **Bước 2: Restart frontend service**

```bash
# Nếu đang chạy với pm2
pm2 restart frontend

# Hoặc nếu đang chạy manual
pkill -f "next"
cd /home/lta/pj/conttrade/frontend
npm run dev
# hoặc
npm run build && npm run start
```

### **Bước 3: Verify biến môi trường**

Thêm logging để check:
```typescript
// Tạm thời thêm vào đầu file login
console.log('🔧 ENV CHECK:', {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NODE_ENV: process.env.NODE_ENV
});
```

---

## 🚨 LƯU Ý QUAN TRỌNG

### 1. **Biến môi trường trong Next.js**

- `NEXT_PUBLIC_*` - Exposed to browser (client-side)
- Không có prefix - Chỉ available ở server-side
- Phải có SẴN khi build (không thể inject sau khi build)

### 2. **Production deployment**

Nếu deploy production, cần:

**Option A: Set biến môi trường khi build**
```bash
NEXT_PUBLIC_API_URL=http://45.122.244.231:3006 npm run build
```

**Option B: Sử dụng file .env.production**
```bash
cd /home/lta/pj/conttrade/frontend
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=http://45.122.244.231:3006
EOF
npm run build
```

**Option C: Runtime environment (với Docker)**
```dockerfile
ENV NEXT_PUBLIC_API_URL=http://45.122.244.231:3006
```

### 3. **Kiểm tra sau khi fix**

Test URL endpoint:
```bash
# Check frontend có gọi đúng API không
curl -X POST http://45.122.244.231:3006/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@i-contexchange.vn","password":"admin123"}'
```

Kết quả mong đợi:
```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {...}
  }
}
```

---

## 🎯 KẾT LUẬN

**Lỗi chính**: Frontend không có biến môi trường `NEXT_PUBLIC_API_URL`, dẫn đến:
1. API URL bị undefined
2. Request gọi sai endpoint: `/vi/auth/undefined/api/v1/auth/login`
3. Server trả về 404 Not Found
4. Response là HTML (<!DOCTYPE...) không phải JSON
5. Parse JSON failed → Login failed

**Fix**: Tạo file `.env.local` với `NEXT_PUBLIC_API_URL=http://45.122.244.231:3006` và restart frontend.

---

## 📋 CHECKLIST TRIỂN KHAI

- [ ] Tạo file `.env.local` trong `/home/lta/pj/conttrade/frontend`
- [ ] Set `NEXT_PUBLIC_API_URL=http://45.122.244.231:3006`
- [ ] Restart frontend service (pm2 restart hoặc kill + start lại)
- [ ] Verify bằng cách check browser console có log đúng API URL
- [ ] Test login với account admin@i-contexchange.vn
- [ ] Xóa logging debug sau khi fix xong

---

## 🔗 FILES LIÊN QUAN

- `/home/lta/pj/conttrade/frontend/middleware.ts` - Line 220
- `/home/lta/pj/conttrade/frontend/lib/api.ts` - Line 3
- `/home/lta/pj/conttrade/frontend/lib/auth/auth-context.tsx` - Login logic
- `/home/lta/pj/conttrade/frontend/.env.example` - Template
- `/home/lta/pj/conttrade/frontend/.env.production.example` - Production template

---

**Thời gian fix dự kiến**: 2-3 phút  
**Mức độ nghiêm trọng**: 🔴 Critical - Không thể login  
**Impact**: Tất cả users không thể login vào hệ thống
