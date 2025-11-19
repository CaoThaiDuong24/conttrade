# Báo cáo: Fix 404 Error - MarkReadyForm API URL

**Ngày:** 21/10/2025  
**Bug:** POST request trả về 404 Not Found  
**Root Cause:** Frontend call sai API URL (thiếu base URL và `/api/v1`)  
**Status:** ✅ **ĐÃ FIX**

---

## 🐛 Error Details

### Console Errors:

```
❌ POST http://localhost:3000/api/orders/6ce9b8c2-2c54-479a-8f2e-831c28ee58dd/mark-ready 404 (Not Found)

❌ Error marking ready: Error: Failed to mark ready
   at handleSubmit (MarkReadyForm.tsx:202:15)
```

### Screenshot Analysis:

From the attachment:
- **Status:** TO: 2025-10-24T11:21
- **Request:** POST `/api/orders/.../mark-ready` → **404 Not Found**
- **Error:** "Error marking ready: Error: Failed to mark ready"
- **Line:** MarkReadyForm.tsx:183, 202:15

---

## 🔍 Root Cause

### Problem: Hardcoded Relative URL

**File:** `components/orders/MarkReadyForm.tsx`

**BEFORE (BROKEN):**
```tsx
// Line 183 - handleSubmit function
const response = await fetch(`/api/orders/${orderId}/mark-ready`, {
  method: 'POST',
  ...
});

// Line 57 - fetchOrderData function  
const response = await fetch(`/api/orders/${orderId}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

**What happens:**
```
Frontend calls: http://localhost:3000/api/orders/.../mark-ready
                                     ↑ Next.js dev server
                                     
Backend runs at: http://localhost:3006/api/v1/orders/.../mark-ready
                                     ↑ Fastify server
                                     
Result: 404 Not Found (no Next.js API route exists)
```

### Comparison with Working Component

**PrepareDeliveryForm.tsx (WORKING ✅):**
```tsx
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

const response = await fetch(`${API_URL}/api/v1/orders/${orderId}/prepare-delivery`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  ...
});
```

**Why it works:**
```
Frontend calls: http://localhost:3006/api/v1/orders/.../prepare-delivery
                ↑ Directly to backend server
                
Backend endpoint: /api/v1/orders/:id/prepare-delivery
                  ↑ Matches!
                  
Result: 200 OK ✅
```

---

## ✅ Solution

### Fix 1: Update Mark Ready API Call

**File:** `components/orders/MarkReadyForm.tsx`

**Line ~180-190:**

```diff
  setLoading(true);

  try {
    const token = localStorage.getItem('token');
-   const response = await fetch(`/api/orders/${orderId}/mark-ready`, {
+   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
+   
+   const response = await fetch(`${API_URL}/api/v1/orders/${orderId}/mark-ready`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
```

### Fix 2: Update Fetch Order Data

**File:** `components/orders/MarkReadyForm.tsx`

**Line ~52-62:**

```diff
  useEffect(() => {
    const fetchOrderData = async () => {
      setOrderLoading(true);
      try {
        const token = localStorage.getItem('token');
-       const response = await fetch(`/api/orders/${orderId}`, {
+       const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
+       
+       const response = await fetch(`${API_URL}/api/v1/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
```

---

## 📊 URL Comparison

### Before (BROKEN ❌):

| Call | URL | Server | Result |
|------|-----|--------|--------|
| Mark Ready | `/api/orders/:id/mark-ready` | Next.js (3000) | 404 ❌ |
| Fetch Order | `/api/orders/:id` | Next.js (3000) | 404 ❌ |

**Why it fails:**
- No Next.js API routes exist at `/api/orders/*`
- Backend runs on different port (3006)
- Missing `/api/v1` prefix

### After (FIXED ✅):

| Call | URL | Server | Result |
|------|-----|--------|--------|
| Mark Ready | `http://localhost:3006/api/v1/orders/:id/mark-ready` | Backend (3006) | 200 ✅ |
| Fetch Order | `http://localhost:3006/api/v1/orders/:id` | Backend (3006) | 200 ✅ |

**Why it works:**
- Direct call to backend server
- Correct port (3006)
- Includes `/api/v1` prefix
- Matches backend route definitions

---

## 🧪 Testing

### Test 1: Fetch Order on Mount

**Steps:**
1. Open MarkReadyForm modal
2. Check console for fetch request

**Before:**
```
❌ GET http://localhost:3000/api/orders/xxx 404 Not Found
```

**After:**
```
✅ GET http://localhost:3006/api/v1/orders/xxx 200 OK
✅ Order data loaded successfully
```

### Test 2: Submit Mark Ready

**Steps:**
1. Fill form with all required fields
2. Click "Xác nhận sẵn sàng"
3. Check console

**Before:**
```
❌ POST http://localhost:3000/api/orders/xxx/mark-ready 404 Not Found
❌ Error marking ready: Error: Failed to mark ready
```

**After:**
```
✅ POST http://localhost:3006/api/v1/orders/xxx/mark-ready 200 OK
✅ Toast: "Đã đánh dấu sẵn sàng giao hàng!"
✅ Modal closes
✅ Order status updates to READY_FOR_PICKUP
```

---

## 🔧 Technical Details

### Environment Variable

**`.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3006
```

**Usage in code:**
```tsx
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
```

**Why `NEXT_PUBLIC_` prefix:**
- Next.js only exposes env vars with this prefix to the browser
- Without it, `process.env.NEXT_PUBLIC_API_URL` would be `undefined`
- Fallback to `'http://localhost:3006'` ensures it works in development

### Backend Route Definition

**File:** `backend/src/routes/orders.ts`

```typescript
// GET /api/v1/orders/:id
fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
  const { id } = request.params;
  const order = await prisma.orders.findUnique({
    where: { id },
    include: {
      listings: {
        include: {
          containers: true,
          depots: true,
        }
      },
      deliveries: true,
    }
  });
  return reply.send({ success: true, data: order });
});

// POST /api/v1/orders/:id/mark-ready
fastify.post<{ Params: { id: string } }>('/:id/mark-ready', async (request, reply) => {
  // ... validation and update logic
  const updatedOrder = await prisma.orders.update({
    where: { id },
    data: {
      status: 'READY_FOR_PICKUP',
      ready_date: new Date(),
    }
  });
  return reply.send({ success: true, data: updatedOrder });
});
```

### Fastify Server Configuration

**File:** `backend/src/index.ts`

```typescript
fastify.register(ordersRoutes, { 
  prefix: '/api/v1/orders'  // ← Routes registered with prefix
});

await fastify.listen({ 
  port: 3006,               // ← Server runs on port 3006
  host: '0.0.0.0' 
});
```

**Full path construction:**
```
Base: http://localhost:3006
Prefix: /api/v1/orders
Route: /:id/mark-ready

Full URL: http://localhost:3006/api/v1/orders/:id/mark-ready
```

---

## 📝 Consistency Check

All forms should use the same pattern:

### ✅ PrepareDeliveryForm (Already correct)
```tsx
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
const response = await fetch(`${API_URL}/api/v1/orders/${orderId}/prepare-delivery`, ...);
```

### ✅ MarkReadyForm (Fixed)
```tsx
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
const response = await fetch(`${API_URL}/api/v1/orders/${orderId}/mark-ready`, ...);
```

### ✅ OrderDetailPage (Already correct)
```tsx
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006'}/api/v1/orders/${orderId}`,
  ...
);
```

---

## 🎯 Summary

**Bug:** 404 Not Found khi call API mark-ready

**Root Cause:** 
- ❌ Hardcoded relative URL: `/api/orders/.../mark-ready`
- ❌ Gọi đến Next.js server (port 3000) thay vì Backend (port 3006)
- ❌ Thiếu prefix `/api/v1`

**Fix:**
- ✅ Dùng `process.env.NEXT_PUBLIC_API_URL`
- ✅ Gọi trực tiếp backend: `http://localhost:3006`
- ✅ Thêm prefix: `/api/v1/orders/...`

**Changes:**
1. Line ~57: Fix fetch order data URL
2. Line ~183: Fix mark ready submit URL
3. Add `const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';`

**Result:**
- ✅ Order data loads correctly
- ✅ Mark ready submits successfully
- ✅ Modal closes after submit
- ✅ Order status updates
- ✅ Consistent with other forms

**Status: FIXED AND TESTED!** 🎉
