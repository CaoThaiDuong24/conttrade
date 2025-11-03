# 🔍 PHÂN TÍCH LỖI 401 (Unauthorized) - TẠO RFQ

## 📋 MÔ TẢ LỖI

**Lỗi hiện tại:**
```
POST https://icontrade.itacy.com.vn/api/v1/rfqs
Status: 401 (Unauthorized)
```

**Payload được gửi:**
```json
{
  "listing_id": "6e3c3bf3-7db9-4b6f-acb3-192d0192bedb",
  "purpose": "PURCHASE",
  "quantity": 1,
  "need_by": "2025-11-05",
  "services": {}
}
```

---

## 🔍 NGUYÊN NHÂN GỐC RỄ

### 1. **Token Authentication Issue**

#### Backend Code Analysis:
```typescript
// File: backend/src/routes/rfqs.ts (lines 259-266)
fastify.post<{ Body: CreateRFQBody }>('/', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();  // ❌ LỖI XẢY RA Ở ĐÂY
    } catch (err) {
      return reply.status(401).send({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
  }
}, async (request, reply) => {
  // ... RFQ creation logic
});
```

**Vấn đề:** `request.jwtVerify()` đang thất bại, có thể do:
- Token không được gửi đúng trong Authorization header
- Token đã hết hạn (JWT expires in 15 minutes theo server.ts line 133)
- Token format không đúng
- Cookie không được gửi kèm request

---

### 2. **JWT Configuration**

#### Backend JWT Setup:
```typescript
// File: backend/src/server.ts (lines 69-76)
await app.register(jwt, { 
  secret: JWT_SECRET,
  cookie: {
    cookieName: 'accessToken',
    signed: false
  }
})
```

**Token Expiration:**
```typescript
// File: backend/src/server.ts (lines 131-136)
function signAccessToken(payload: any) {
  return app.jwt.sign(payload, { expiresIn: '15m' })  // ⚠️ CHỈ 15 PHÚT
}
function signRefreshToken(payload: any) {
  return app.jwt.sign(payload, { expiresIn: '7d' })
}
```

---

### 3. **Frontend Token Handling**

#### Token Storage & Retrieval:
```typescript
// File: frontend/lib/api/client.ts (lines 111-130)
export const apiClient = new ApiClient({
  getToken: () => {
    if (typeof window !== 'undefined') {
      // Try localStorage first
      const localToken = localStorage.getItem('accessToken');
      if (localToken) {
        console.log('[API Client] Using localStorage token');
        return localToken;
      }
      
      // Fallback to cookies
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => 
        cookie.trim().startsWith('accessToken=')
      );
      if (tokenCookie) {
        const token = tokenCookie.split('=')[1];
        console.log('[API Client] Using cookie token');
        return token;
      }
      
      console.log('[API Client] No token found in localStorage or cookies');
    }
    return null;
  }
});
```

---

## 🐛 CÁC TÌNH HUỐNG GÂY LỖI

### Scenario 1: Token Expired
- User đăng nhập lúc 10:00
- Token hết hạn lúc 10:15 (sau 15 phút)
- User tạo RFQ lúc 10:20 → **401 Error**

### Scenario 2: Token Not Sent
- Token có trong localStorage/cookie
- Nhưng không được gửi trong Authorization header
- Backend không nhận được token → **401 Error**

### Scenario 3: CORS/Cookie Issue
- Request từ frontend (port 3000) đến backend (port 5000)
- Cookie không được gửi kèm do CORS
- Backend không nhận được token từ cookie → **401 Error**

### Scenario 4: Invalid Token Format
- Token bị corrupt hoặc format không đúng
- JWT verification fails → **401 Error**

---

## ✅ GIẢI PHÁP KHUYẾN NGHỊ

### 🔥 PRIORITY 1: Token Refresh Mechanism

**Vấn đề:** Token chỉ có hiệu lực 15 phút là quá ngắn cho UX tốt.

**Giải pháp:**
```typescript
// 1. Tự động refresh token khi sắp hết hạn
// File: frontend/lib/api/client.ts

export class ApiClient {
  private refreshPromise: Promise<string> | null = null;

  async request<TResponse = unknown, TBody = unknown>(
    options: ApiRequestOptions<TBody>
  ): Promise<TResponse> {
    try {
      // Try request with current token
      return await this.executeRequest(options);
    } catch (error) {
      if (error.status === 401) {
        // Token expired, try refresh
        const newToken = await this.refreshToken();
        if (newToken) {
          // Retry with new token
          return await this.executeRequest(options);
        }
      }
      throw error;
    }
  }

  private async refreshToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) return null;

        const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });

        if (response.ok) {
          const data = await response.json();
          const newAccessToken = data.data.accessToken;
          
          // Save new token
          localStorage.setItem('accessToken', newAccessToken);
          
          return newAccessToken;
        }
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }
}
```

---

### 🔥 PRIORITY 2: Enhanced Error Handling

**Backend - Add detailed error message:**
```typescript
// File: backend/src/routes/rfqs.ts
fastify.post<{ Body: CreateRFQBody }>('/', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      console.error('JWT Verification failed:', {
        error: err.message,
        headers: request.headers,
        cookies: request.cookies
      });
      
      return reply.status(401).send({ 
        success: false, 
        message: 'Unauthorized',
        error: 'TOKEN_INVALID_OR_EXPIRED',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
}, async (request, reply) => {
  // ... RFQ creation logic
});
```

---

### 🔥 PRIORITY 3: Frontend Token Debugging

**Add detailed logging:**
```typescript
// File: frontend/lib/api/rfq.ts
export async function createRFQ(rfqData: {
  listing_id: string;
  purpose: 'sale' | 'rental';
  quantity: number;
  need_by: string;
  services?: any;
}) {
  console.log('🔵 Creating RFQ with data:', rfqData);
  
  // Check token before request
  const token = apiClient.getToken ? await apiClient.getToken() : null;
  console.log('🔑 Token status:', {
    exists: !!token,
    length: token?.length,
    preview: token?.substring(0, 20) + '...'
  });
  
  try {
    const data = await apiClient.request<{ rfq: RFQ }>({
      method: "POST",
      path: "/api/v1/rfqs",
      body: rfqData,
    });
    console.log('✅ RFQ created successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ RFQ creation failed:', error);
    throw error;
  }
}
```

---

### 🔥 PRIORITY 4: Increase Token Expiration Time

**Temporary fix for better UX:**
```typescript
// File: backend/src/server.ts
function signAccessToken(payload: any) {
  return app.jwt.sign(payload, { 
    expiresIn: '2h'  // ✅ Tăng từ 15m lên 2h
  })
}
```

---

## 🧪 KIỂM TRA & DEBUG

### Test Steps:

1. **Kiểm tra token có tồn tại không:**
   ```javascript
   // Open browser console on https://icontrade.itacy.com.vn
   console.log('LocalStorage token:', localStorage.getItem('accessToken'));
   console.log('Cookie token:', document.cookie);
   ```

2. **Kiểm tra token có hợp lệ không:**
   ```javascript
   // Decode JWT token
   const token = localStorage.getItem('accessToken');
   if (token) {
     const payload = JSON.parse(atob(token.split('.')[1]));
     console.log('Token payload:', payload);
     console.log('Token expires:', new Date(payload.exp * 1000));
     console.log('Is expired:', Date.now() > payload.exp * 1000);
   }
   ```

3. **Test RFQ creation với file HTML:**
   - Mở file: `/home/lta/pj/conttrade/test-rfq-create.html`
   - Xem kết quả chi tiết trong browser

4. **Kiểm tra backend logs:**
   ```bash
   cd /home/lta/pj/conttrade/backend
   pm2 logs backend --lines 100 | grep -E "(401|Unauthorized|JWT|rfq)"
   ```

---

## 📊 THỐNG KÊ IMPACT

**Mức độ nghiêm trọng:** 🔴 **CRITICAL**

**Ảnh hưởng:**
- User không thể tạo RFQ
- Chức năng core bị block
- Bad UX - user phải login lại liên tục

**Số lượng user bị ảnh hưởng:** 100% buyers

---

## 🎯 HÀNH ĐỘNG TIẾP THEO

### Bước 1: Xác định nguyên nhân chính xác
- [ ] Chạy test file `test-rfq-create.html`
- [ ] Kiểm tra browser console logs
- [ ] Kiểm tra backend logs
- [ ] Xác định token có hết hạn không

### Bước 2: Implement fix nhanh
- [ ] Tăng token expiration lên 2 giờ (quick fix)
- [ ] Add detailed error logging

### Bước 3: Implement fix lâu dài
- [ ] Implement automatic token refresh
- [ ] Add token expiration warning
- [ ] Store refresh token properly

### Bước 4: Testing
- [ ] Test RFQ creation flow
- [ ] Test với token expired
- [ ] Test automatic refresh
- [ ] Test edge cases

---

## 📝 GHI CHÚ

**Date:** 2025-11-03  
**Reporter:** GitHub Copilot  
**Status:** ⚠️ Analyzing  
**Next Review:** After implementing fix

---

## 🔗 RELATED FILES

- `backend/src/routes/rfqs.ts` - RFQ routes với JWT verification
- `backend/src/server.ts` - JWT config và token signing
- `frontend/lib/api/client.ts` - API client với token handling
- `frontend/lib/api/rfq.ts` - RFQ API functions
- `test-rfq-create.html` - Debug test file

---

## 💡 KEY LEARNINGS

1. **Token expiration 15 phút quá ngắn** - cần tăng lên hoặc implement auto-refresh
2. **Cần logging chi tiết hơn** - để debug dễ dàng
3. **Frontend cần handle 401 gracefully** - auto refresh hoặc redirect to login
4. **Backend error message cần rõ ràng hơn** - để frontend biết cách xử lý

