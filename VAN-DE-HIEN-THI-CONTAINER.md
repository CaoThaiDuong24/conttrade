# 🚨 VẤN ĐỀ: NGƯỜI MUA THẤY CONTAINER NÀO?

> **Câu hỏi:** Người mua chỉ thấy những container chưa được mua không, hay là người mua vẫn thấy hết danh sách?

---

## 📊 HIỆN TRẠNG

### ❌ Backend KHÔNG Filter Status

**File:** `backend/src/routes/listings.ts` (line 1088-1110)

```typescript
// GET /api/v1/listings/:id/containers
fastify.get('/:id/containers', async (request, reply) => {
  const { id } = request.params as any;

  const containers = await prisma.listing_containers.findMany({
    where: { 
      listing_id: id,
      deleted_at: null 
      // ⚠️ VẤN ĐỀ: KHÔNG filter theo status!
      // → Trả về TẤT CẢ containers (AVAILABLE + RESERVED + SOLD + RENTED)
    },
    orderBy: {
      created_at: 'asc'
    }
  });

  return reply.send({
    success: true,
    data: {
      containers: containers.map(c => ({
        id: c.id,
        listing_id: c.listing_id,
        container_iso_code: c.container_iso_code,
        shipping_line: c.shipping_line,
        manufactured_year: c.manufactured_year,
        created_at: c.created_at,
        updated_at: c.updated_at
        // ❌ VẤN ĐỀ: THIẾU field "status"!
      }))
      // ❌ VẤN ĐỀ: KHÔNG có summary!
    }
  });
});
```

---

## 🔴 HẬU QUẢ

### 1. Người mua thấy TẤT CẢ containers

```
Listing có 50 containers:
- 45 AVAILABLE (có thể mua)
- 2 RESERVED (đang giữ chỗ)
- 3 SOLD (đã bán)

API trả về: 50 containers ❌
Người mua thấy: 50 containers ❌

→ KHÔNG biết container nào có thể mua!
```

### 2. Không có field "status"

```typescript
// Response hiện tại:
{
  "containers": [
    {
      "id": "cont-1",
      "container_iso_code": "ABCU1234560",
      "shipping_line": "CMA CGM"
      // ❌ THIẾU "status": "AVAILABLE"
    }
  ]
}

// Frontend KHÔNG biết container nào AVAILABLE!
```

### 3. Có thể chọn nhầm container đã bán

```
User flow:
1. Người mua xem danh sách → Thấy 50 containers
2. Chọn container ABCU1234560 (không biết đã SOLD)
3. Add to cart → ❌ LỖI hoặc checkout fail
4. Confusion và frustration
```

### 4. Frontend không thể filter

```tsx
// Frontend nhận data:
const containers = [
  { id: 'cont-1', code: 'ABCU1234560' },  // Không có status
  { id: 'cont-2', code: 'MSCU9876540' },  // Không có status
  ...
];

// Frontend KHÔNG THỂ filter:
const availableContainers = containers.filter(c => c.status === 'AVAILABLE');
// → Undefined! Vì không có field "status"
```

---

## ✅ GIẢI PHÁP ĐỀ XUẤT

### Option 1: CHỈ trả về AVAILABLE (Khuyến nghị) ⭐

**Mục tiêu:** Đơn giản, rõ ràng, UX tốt

```typescript
// File: backend/src/routes/listings.ts (line 1088)

fastify.get('/:id/containers', async (request, reply) => {
  try {
    const { id } = request.params as any;

    // ✅ CHỈ lấy AVAILABLE containers
    const containers = await prisma.listing_containers.findMany({
      where: { 
        listing_id: id,
        deleted_at: null,
        status: 'AVAILABLE'  // ⭐ FILTER
      },
      orderBy: { created_at: 'asc' }
    });

    // ✅ Thêm summary
    const totalCount = await prisma.listing_containers.count({
      where: { listing_id: id, deleted_at: null }
    });

    const summary = await prisma.listing_containers.groupBy({
      by: ['status'],
      where: { listing_id: id, deleted_at: null },
      _count: true
    });

    const getSummaryCount = (status: string) => {
      return summary.find(s => s.status === status)?._count || 0;
    };

    return reply.send({
      success: true,
      data: {
        containers: containers.map(c => ({
          id: c.id,
          listing_id: c.listing_id,
          container_iso_code: c.container_iso_code,
          shipping_line: c.shipping_line,
          manufactured_year: c.manufactured_year,
          status: c.status,  // ✅ Include status
          created_at: c.created_at,
          updated_at: c.updated_at
        })),
        summary: {  // ✅ Include summary
          total: totalCount,
          available: getSummaryCount('AVAILABLE'),
          reserved: getSummaryCount('RESERVED'),
          sold: getSummaryCount('SOLD'),
          rented: getSummaryCount('RENTED')
        }
      }
    });
  } catch (error: any) {
    fastify.log.error('Get listing containers error:', error);
    return reply.status(500).send({
      success: false,
      message: 'Lỗi hệ thống khi lấy danh sách container'
    });
  }
});
```

**Kết quả:**

```json
{
  "success": true,
  "data": {
    "containers": [
      {
        "id": "cont-1",
        "container_iso_code": "ABCU1234560",
        "shipping_line": "CMA CGM",
        "status": "AVAILABLE"  // ✅
      },
      {
        "id": "cont-2",
        "container_iso_code": "MSCU9876540",
        "shipping_line": "MSC",
        "status": "AVAILABLE"  // ✅
      }
      // ✅ CHỈ 45 containers AVAILABLE
    ],
    "summary": {
      "total": 50,
      "available": 45,
      "reserved": 2,
      "sold": 3,
      "rented": 0
    }
  }
}
```

---

### Option 2: Linh hoạt với query param

**Mục tiêu:** Hỗ trợ cả 2 mode (chỉ AVAILABLE / xem tất cả)

```typescript
fastify.get<{ 
  Params: { id: string };
  Querystring: { include_all?: string };
}>('/:id/containers', async (request, reply) => {
  try {
    const { id } = request.params;
    const { include_all } = request.query;

    const whereClause: any = { 
      listing_id: id,
      deleted_at: null
    };

    // ✅ Filter by status nếu KHÔNG có include_all
    if (include_all !== 'true') {
      whereClause.status = 'AVAILABLE';
    }

    const containers = await prisma.listing_containers.findMany({
      where: whereClause,
      orderBy: { created_at: 'asc' }
    });

    // ... (summary logic tương tự)

    return reply.send({
      success: true,
      data: {
        containers: containers.map(c => ({
          id: c.id,
          container_iso_code: c.container_iso_code,
          shipping_line: c.shipping_line,
          status: c.status,  // ✅ Luôn có status
          // ...
        })),
        summary: { /* ... */ }
      }
    });
  } catch (error: any) {
    // Error handling
  }
});
```

**Usage:**

```bash
# Chỉ lấy AVAILABLE (default)
GET /api/v1/listings/123/containers
→ Trả về 45 containers AVAILABLE

# Xem tất cả
GET /api/v1/listings/123/containers?include_all=true
→ Trả về 50 containers (tất cả status)
```

---

## 📋 SO SÁNH 2 OPTIONS

| Tiêu chí | Option 1: Chỉ AVAILABLE | Option 2: Linh hoạt |
|----------|------------------------|---------------------|
| **Độ phức tạp** | ⭐⭐⭐⭐⭐ Đơn giản | ⭐⭐⭐ Phức tạp hơn |
| **UX** | ⭐⭐⭐⭐⭐ Rõ ràng | ⭐⭐⭐⭐ Tốt (nếu UI tốt) |
| **Performance** | ⭐⭐⭐⭐⭐ Ít data | ⭐⭐⭐ Nhiều data hơn |
| **Use case** | Mua hàng | Mua + audit/research |
| **Khuyến nghị** | ✅ **Cho buyer** | ✅ Cho admin/seller |

---

## 🎯 KHUYẾN NGHỊ

### Triển khai theo 2 giai đoạn:

**Giai đoạn 1: Quick Fix (Option 1)** ⚡

- Sửa ngay API để CHỈ trả về AVAILABLE
- Thêm field `status` và `summary`
- Deploy ngay để fix bug

**Giai đoạn 2: Enhancement (Option 2)** 🔧

- Thêm query param `include_all`
- Frontend thêm toggle "Xem tất cả"
- Cho phép seller/admin xem full list

---

## 📊 IMPACT ANALYSIS

### Trước khi sửa:

```
┌─────────────────────────────────────┐
│ Danh sách Container (50)            │  ❌ Gây confusion
│                                     │
│ ☐ ABCU1234560 - CMA CGM             │  ✅ AVAILABLE
│ ☐ MSCU9876540 - MSC                 │  ✅ AVAILABLE
│ ☐ MAEU1111110 - Maersk              │  ❌ SOLD (nhưng không biết!)
│ ☐ CMAU5555550 - CMA CGM             │  ❌ RESERVED (không biết!)
│ ... (46 containers nữa)             │
│                                     │
│ ⚠️ User có thể chọn nhầm container  │
│    đã bán hoặc đang reserve         │
└─────────────────────────────────────┘
```

### Sau khi sửa (Option 1):

```
┌─────────────────────────────────────┐
│ Container khả dụng (45/50)          │  ✅ Rõ ràng
│                                     │
│ ☐ ABCU1234560 - CMA CGM - 2020      │  ✅ AVAILABLE
│ ☐ MSCU9876540 - MSC - 2019          │  ✅ AVAILABLE
│ ☐ HLCU3333330 - Hapag - 2022        │  ✅ AVAILABLE
│ ... (42 containers nữa)             │
│                                     │
│ ℹ️ 5 containers đã bán/đang giữ chỗ │
│                                     │
│ ✅ User CHỈ thấy container có thể   │
│    mua, không bị confusion          │
└─────────────────────────────────────┘
```

---

## ✅ CHECKLIST TRIỂN KHAI

### Backend:

- [ ] Sửa API `GET /listings/:id/containers`
  - [ ] Thêm filter `status = 'AVAILABLE'` (line 1091)
  - [ ] Thêm field `status` vào response (line 1096)
  - [ ] Thêm `summary` object (line 1100+)
  - [ ] (Optional) Support query param `include_all`

### Testing:

- [ ] Test API trả về đúng containers
  - [ ] Chỉ AVAILABLE khi không có param
  - [ ] Tất cả khi `include_all=true`
  - [ ] Summary đếm đúng
- [ ] Test Frontend hiển thị
  - [ ] Chỉ show containers có thể chọn
  - [ ] Disable checkbox cho SOLD/RESERVED (nếu có)
- [ ] Test Add to cart
  - [ ] Chỉ add được AVAILABLE
  - [ ] Validate lại status khi checkout

---

## 🎯 KẾT LUẬN

**Câu trả lời cho câu hỏi ban đầu:**

> **Q:** Người mua chỉ thấy những container chưa được mua không, hay là người mua vẫn thấy hết danh sách?

**A (Hiện tại):** ❌ **Người mua THẤY HẾT danh sách** (kể cả đã bán) vì:
- Backend KHÔNG filter theo status
- Response KHÔNG có field status
- Frontend KHÔNG biết container nào có thể mua

**A (Sau khi sửa):** ✅ **Người mua CHỈ THẤY container chưa bán** vì:
- Backend CHỈ trả về `status = 'AVAILABLE'`
- Response CÓ field status và summary
- UX rõ ràng, không confusion

**Khuyến nghị:** Sửa ngay theo **Option 1** để fix bug và cải thiện UX!

---

**📅 Ngày phân tích:** 2024-12-07  
**🔍 Vấn đề:** Backend không filter status → Người mua thấy tất cả  
**✅ Giải pháp:** Filter AVAILABLE + thêm status field + summary  
**⚡ Priority:** HIGH (ảnh hưởng trực tiếp đến UX)
