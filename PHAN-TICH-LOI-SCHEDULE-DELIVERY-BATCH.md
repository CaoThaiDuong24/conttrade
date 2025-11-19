# 🔍 PHÂN TÍCH LỖI: POST /api/v1/orders/{orderId}/schedule-delivery-batch

## 📋 Thông Tin Lỗi

**Endpoint:** `POST http://localhost:3000/api/v1/orders/b78b4027f-72af-49b6-8857-98266a145a7e/schedule-delivery-batch`

**Status Code:** `500 Internal Server Error`

**Response Headers:**
```
✅ Response status: 200
✅ Fetching notifications from: /api/v1/notifications
🔍 Using token: eyJhbGc...
✅ Response status: 200
✅ Received 20 notifications
✅ Unread count: 10
```

**Error Message:** Internal Server Error (không có chi tiết cụ thể từ client)

---

## 🔎 NGUYÊN NHÂN CÓ THỂ

### 1️⃣ **ORDER ID KHÔNG TỒN TẠI** ❌
```
Order ID: b78b4027f-72af-49b6-8857-98266a145a7e
```

Khi kiểm tra database:
```javascript
prisma.orders.findFirst({ 
  where: { id: 'b78b4027f-72af-49b6-8857-98266a145a7e' } 
})
// Result: null (không tìm thấy)
```

**✅ Đây là nguyên nhân chính!**

---

### 2️⃣ **AUTHORIZATION ISSUE** ⚠️

Từ log:
```
🔍 Using token: eyJhbGc...
```

Token JWT có thể:
- ✅ Hợp lệ (vì `/api/v1/notifications` trả về 200)
- ❓ User không phải buyer của order này
- ❓ Token hết hạn (nhưng không giống vì notification API hoạt động)

---

### 3️⃣ **PHÂN TÍCH CODE BACKEND**

Từ file `backend/src/routes/orders.ts` (lines 3187-3530):

```typescript
fastify.post<{
  Params: { id: string },
  Body: { ... }
}>('/:id/schedule-delivery-batch', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify(); // ✅ Authorization check
    } catch (err) {
      return reply.status(401).send({ success: false, message: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  const userId = (request.user as any).userId;
  const { id: orderId } = request.params;
  const { containerIds, ... } = request.body;

  try {
    // 1. KIỂM TRA ORDER ⚠️
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        listing_containers_sold: {
          where: { sold_to_order_id: orderId }
        },
        deliveries: {
          include: { delivery_containers: true }
        }
      }
    });

    if (!order) {  // ❌ LỖI Ở ĐÂY!
      return reply.status(404).send({
        success: false,
        message: 'Order not found'
      });
    }

    // 2. KIỂM TRA PERMISSION
    if (order.buyer_id !== userId) {
      return reply.status(403).send({
        success: false,
        message: 'Only buyer can schedule delivery for this order'
      });
    }

    // 3. KIỂM TRA STATUS
    if (!['READY_FOR_PICKUP', 'TRANSPORTATION_BOOKED'].includes(order.status)) {
      return reply.status(400).send({
        success: false,
        message: `Order must be ready for pickup. Current status: ${order.status}`
      });
    }

    // ... rest of code
  } catch (error: any) {
    fastify.log.error('Error scheduling delivery batch:', error);
    return reply.status(500).send({  // ❌ TRẢ VỀ 500
      success: false,
      message: 'Failed to schedule delivery batch',
      error: error.message
    });
  }
});
```

---

## 🧩 TẠI SAO TRẢ VỀ 500 THAY VÌ 404?

Có 2 kịch bản:

### **Kịch bản A: Order Không Tồn Tại** (Khả năng cao nhất)
```typescript
const order = await prisma.orders.findUnique({
  where: { id: orderId },
  include: { ... }
});

if (!order) {
  return reply.status(404).send({ ... }); // ✅ PHẢI TRẢ VỀ 404
}
```

**Nhưng client nhận được 500!** 

**➡️ Có thể:**
1. **Exception xảy ra TRƯỚC khi kiểm tra `if (!order)`**
2. **Prisma query bị lỗi** (connection issue, syntax error, etc.)
3. **Include relations bị lỗi** (foreign key không match)

---

### **Kịch bản B: Lỗi Trong Transaction**
```typescript
const result = await prisma.$transaction(async (tx) => {
  // 1. Create delivery
  const delivery = await tx.deliveries.create({ ... });
  
  // 2. Link containers ⚠️ CÓ THỂ LỖI Ở ĐÂY
  const deliveryContainersData = containerIds.map(containerId => {
    const container = orderContainers.find(c => c.id === containerId);
    return {
      id: randomUUID(),
      delivery_id: delivery.id,
      container_id: containerId,
      container_iso_code: container?.container_iso_code || '', // ⚠️ container có thể undefined
      pickup_date: new Date(deliveryDate),
      created_at: new Date(),
      updated_at: new Date()
    };
  });
  
  // 3. createMany có thể fail nếu:
  //    - container_id không tồn tại
  //    - Foreign key constraint violation
  //    - Unique constraint violation
  await tx.delivery_containers.createMany({
    data: deliveryContainersData  // ❌ LỖI Ở ĐÂY
  });
});
```

---

## 🔧 CÁC LỖI CÓ THỂ XẢY RA

### ❌ **Lỗi 1: Foreign Key Constraint**
```sql
-- delivery_containers foreign key
FOREIGN KEY (container_id) REFERENCES listing_containers(id)
```

Nếu `containerIds` chứa ID không tồn tại trong `listing_containers`:
```
ERROR: insert or update on table "delivery_containers" 
violates foreign key constraint "delivery_containers_container_id_fkey"
```

---

### ❌ **Lỗi 2: Unique Constraint**
```sql
@@unique([delivery_id, container_id])
```

Nếu cùng 1 container được thêm 2 lần:
```
ERROR: duplicate key value violates unique constraint 
"delivery_containers_delivery_id_container_id_key"
```

---

### ❌ **Lỗi 3: Data Type Mismatch**
```typescript
transportation_fee: transportationFee,  // Decimal? trong schema
```

Nếu `transportationFee` không phải số hợp lệ:
```
ERROR: invalid input syntax for type numeric
```

---

### ❌ **Lỗi 4: Enum Value Invalid**
```typescript
status: 'SCHEDULED',  // DeliveryStatus enum
```

Nếu `SCHEDULED` không có trong enum:
```
ERROR: invalid input value for enum delivery_status: "SCHEDULED"
```

Kiểm tra schema:
```prisma
enum DeliveryStatus {
  PENDING
  SCHEDULED  // ✅ Có
  IN_TRANSIT
  DELIVERED
  FAILED
  CANCELLED
}
```

---

### ❌ **Lỗi 5: Missing Required Field**
```typescript
delivery_date: new Date(deliveryDate),  // DateTime? nullable
delivery_time: deliveryTime,             // String? nullable
```

**Nhưng nếu schema yêu cầu NOT NULL:**
```
ERROR: null value in column "xxx" violates not-null constraint
```

---

## 🎯 NGUYÊN NHÂN CHÍNH XÁC (Dự đoán)

### **Most Likely: ORDER KHÔNG TỒN TẠI**

```javascript
Order ID từ screenshot: b78b4027f-72af-49b6-8857-98266a145a7e
Database query result: null
```

**Nhưng tại sao trả về 500 thay vì 404?**

➡️ **Có thể exception xảy ra trong phần include relations:**

```typescript
const order = await prisma.orders.findUnique({
  where: { id: orderId },
  include: {
    listing_containers_sold: {
      where: { sold_to_order_id: orderId }  // ⚠️ Có thể lỗi nếu sold_to_order_id là string nhưng orderId format sai
    },
    deliveries: {
      include: { 
        delivery_containers: true  // ⚠️ Có thể lỗi nếu relation không đúng
      }
    }
  }
});
```

---

## 🔍 DEBUG STEPS

### Bước 1: Kiểm tra Order ID format
```javascript
// UUID v4 format check
const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
console.log(isValidUUID.test('b78b4027f-72af-49b6-8857-98266a145a7e'));
// Result: false ❌ - Thiếu 1 ký tự ở phần đầu!
```

**✅ ĐÂY LÀ VẤN ĐỀ!**

Order ID sai format:
```
Sai:  b78b4027f-72af-49b6-8857-98266a145a7e  (8 ký tự đầu chỉ có 8)
Đúng: b78b4027-72af-49b6-8857-98266a145a7e   (phải có 8 ký tự)
```

---

### Bước 2: Kiểm tra logs backend
```bash
cd backend
# Check PM2 logs
pm2 logs backend --lines 100 --nostream
```

Tìm:
```
Error scheduling delivery batch: ...
```

---

### Bước 3: Test với order thực tế
```javascript
// 1. Tạo order mới hoặc lấy order có sẵn
const realOrder = await prisma.orders.findFirst({
  where: {
    status: 'READY_FOR_PICKUP',
    buyer_id: userId
  }
});

// 2. Test API với order thực
const response = await fetch(`/api/v1/orders/${realOrder.id}/schedule-delivery-batch`, {
  method: 'POST',
  body: JSON.stringify({ ... })
});
```

---

## ✅ GIẢI PHÁP

### 🔹 **Giải pháp 1: Sửa Order ID**
Nếu order ID sai format, frontend cần:
```typescript
// Before: b78b4027f-72af-49b6-8857-98266a145a7e
// After:  eb78b402-7f72-af49-b685-5798266a145a (example)
```

### 🔹 **Giải pháp 2: Cải thiện Error Handling Backend**
```typescript
// Thêm logging chi tiết
fastify.post('/:id/schedule-delivery-batch', async (request, reply) => {
  const { id: orderId } = request.params;
  
  fastify.log.info(`[schedule-delivery-batch] Order ID: ${orderId}`);
  
  try {
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: { ... }
    });
    
    fastify.log.info(`[schedule-delivery-batch] Order found: ${!!order}`);
    
    if (!order) {
      fastify.log.warn(`[schedule-delivery-batch] Order not found: ${orderId}`);
      return reply.status(404).send({
        success: false,
        message: 'Order not found',
        orderId: orderId  // ✅ Trả về orderId để debug
      });
    }
    
    // ... rest
    
  } catch (error: any) {
    fastify.log.error('[schedule-delivery-batch] Error:', {
      orderId,
      error: error.message,
      stack: error.stack,
      code: error.code  // ✅ Prisma error code
    });
    
    // ✅ Trả về error chi tiết hơn
    return reply.status(500).send({
      success: false,
      message: 'Failed to schedule delivery batch',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      orderId: orderId
    });
  }
});
```

### 🔹 **Giải pháp 3: Frontend Validation**
```typescript
// components/orders/schedule-delivery-batch-modal.tsx
const handleSubmit = async () => {
  // ✅ Validate orderId format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(orderId)) {
    toast.error('Invalid order ID format');
    return;
  }
  
  try {
    const response = await fetch(`/api/v1/orders/${orderId}/schedule-delivery-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      
      // ✅ Handle different error types
      if (response.status === 404) {
        toast.error(`Order not found: ${errorData.orderId || orderId}`);
      } else if (response.status === 403) {
        toast.error('You are not authorized to schedule delivery for this order');
      } else if (response.status === 400) {
        toast.error(errorData.message || 'Invalid request');
      } else {
        toast.error(`Server error: ${errorData.message || 'Please try again'}`);
      }
      return;
    }
    
    // Success
    const result = await response.json();
    toast.success(result.message);
    onSuccess?.();
    
  } catch (error) {
    console.error('[schedule-delivery-batch] Exception:', error);
    toast.error('Network error. Please check your connection.');
  }
};
```

---

## 📊 TÓM TẮT

| **Vấn đề** | **Nguyên nhân** | **Giải pháp** |
|------------|----------------|---------------|
| ❌ 500 Error | Order ID không tồn tại hoặc format sai | Validate UUID format, kiểm tra order trong DB |
| ⚠️ Authorization | Token hết hạn hoặc user không phải buyer | Refresh token, kiểm tra quyền |
| 🔧 Foreign Key | Container IDs không hợp lệ | Validate container IDs trước khi gọi API |
| 📝 Enum Value | DeliveryStatus không hợp lệ | Đảm bảo dùng đúng enum từ schema |
| 🛠️ Error Handling | Không có logging chi tiết | Thêm logs, trả về error rõ ràng hơn |

---

## 🎯 HÀNH ĐỘNG TIẾP THEO

1. ✅ **Kiểm tra Order ID thực tế trong database**
   ```sql
   SELECT id, order_number, status, buyer_id 
   FROM orders 
   WHERE status = 'READY_FOR_PICKUP';
   ```

2. ✅ **Check backend logs để xem error message chính xác**
   ```bash
   pm2 logs backend | grep "schedule-delivery-batch"
   ```

3. ✅ **Test với order thực tế có status READY_FOR_PICKUP**

4. ✅ **Thêm better error handling như đã đề xuất ở trên**

---

## 🔗 FILES LIÊN QUAN

- `backend/src/routes/orders.ts` - Line 3187-3530 (API endpoint)
- `backend/prisma/schema.prisma` - Line 129-229 (deliveries model)
- `frontend/components/orders/schedule-delivery-batch-modal.tsx` - Line 177-178 (API call)
- `test-schedule-delivery-batch.mjs` - Test script

---

**Created:** 2025-11-10
**Status:** ⚠️ PENDING INVESTIGATION
**Priority:** 🔴 HIGH
