# 🔒 PHÂN TÍCH: ẨN/KHÓA CONTAINER KHI NGƯỜI MUA CHỌN

> **Vấn đề:** Khi người mua vào chọn mua container, cần ẩn/khóa để người mua thứ 2 không bị trùng  
> **Câu hỏi:** Nên ẩn ở bước nào? Đã chọn container & đợi báo giá? Hay phải đợi tạo đơn hàng?  
> **Vấn đề mới:** 2 người mua chọn cùng container và đợi báo giá → Seller phải quản lý thế nào?

---

## 🚨 CASE STUDY: CONFLICT KHI 2 BUYER CHỌN CÙNG CONTAINER

### Scenario Thực Tế:

```
Listing: Container 40HC - Grade A
Total: 50 containers (CONT-001 đến CONT-050)

Timeline:
─────────────────────────────────────────────────────────────

10:00 AM - Buyer A tạo RFQ:
   "Tôi muốn mua các container sau với giá tốt nhất:"
   ✅ CONT-005 (CMA CGM, 2020)
   ✅ CONT-012 (MSC, 2019) 
   ✅ CONT-023 (Maersk, 2021)
   ✅ CONT-034 (Hapag, 2022)
   ✅ CONT-041 (COSCO, 2020)
   Quantity: 5 containers
   → RFQ Status: PENDING

10:15 AM - Buyer B tạo RFQ (KHÔNG biết Buyer A đã chọn):
   "Tôi cũng muốn mua:"
   ✅ CONT-012 (MSC, 2019) ⚠️ TRÙNG với Buyer A
   ✅ CONT-023 (Maersk, 2021) ⚠️ TRÙNG với Buyer A
   ✅ CONT-027 (ONE, 2021)
   ✅ CONT-038 (YangMing, 2020)
   ✅ CONT-045 (Evergreen, 2022)
   Quantity: 5 containers
   → RFQ Status: PENDING

11:00 AM - Seller vào xem RFQs:
   ❓ Thấy 2 RFQs
   ❓ CONT-012 và CONT-023 xuất hiện ở CẢ 2 RFQ
   ❓ Seller nên báo giá thế nào?
   ❓ Nếu cả 2 accept quote → Ai được mua CONT-012?

CONFLICT: 2 containers bị claim bởi 2 buyers khác nhau! 🔥
```

### Các Tình Huống Có Thể Xảy Ra:

#### **Tình huống 1: First Come First Served (FIFO)**
```
11:30 AM - Seller quote cho Buyer A trước:
   CONT-005, 012, 023, 034, 041 → $2,500/unit
   Total: $12,500

12:00 PM - Buyer A accept quote
   → Order created
   → CONT-012, CONT-023 → Status = SOLD ✅

12:30 PM - Seller quote cho Buyer B:
   ❌ CONT-012 → ĐÃ BÁN cho Buyer A
   ❌ CONT-023 → ĐÃ BÁN cho Buyer A
   ✅ CONT-027, 038, 045 → Còn available
   
   → Seller phải thay thế:
   Quote mới: CONT-027, 038, 045, CONT-046, CONT-047
   
   → Buyer B THẤT VỌNG vì không được container đã chọn ❌
```

#### **Tình huống 2: Best Price Wins (Giá cao hơn thắng)**
```
Buyer A: RFQ 5 containers, sẵn sàng trả $2,500/unit
Buyer B: RFQ 5 containers, sẵn sàng trả $2,800/unit

Seller ưu tiên quote cho Buyer B trước vì giá cao hơn
→ Buyer A bị mất CONT-012, CONT-023

→ KHÔNG CÔNG BẰNG cho Buyer A (đến trước) ❌
```

#### **Tình huống 3: Parallel Quotes (Quote song song)**
```
Seller quote cho CẢ 2 buyers CÙNG LÚC:
- Quote A: CONT-005, 012, 023, 034, 041 → $2,500/unit
- Quote B: CONT-012, 023, 027, 038, 045 → $2,500/unit

CẢ 2 accept quote cùng lúc (12:00 PM):
❓ Hệ thống tạo order nào trước?
❓ Race condition: Ai chiến thắng?

→ KHÔNG KIỂM SOÁT ĐƯỢC ❌
```

---

## 📊 TỔNG QUAN HỆ THỐNG HIỆN TẠI

### 1. **Luồng Mua Hàng Có 3 Cách**

```
┌─────────────────────────────────────────────────────────────────┐
│                    3 LUỒNG MUA CONTAINER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1️⃣ MUA TRỰC TIẾP (Direct Order)                                │
│     Listing Detail → Click "Mua ngay" → Tạo Order ngay          │
│     ✅ Container status = SOLD (trừ số lượng ngay)               │
│                                                                  │
│  2️⃣ MUA QUA GIỎ HÀNG (Cart → Order)                             │
│     Listing → Add to Cart → Cart Page → Checkout → Create Order │
│     ⚠️ Cart: Container CHƯA bị khóa                              │
│     ✅ Order: Container status = SOLD (trừ số lượng)             │
│                                                                  │
│  3️⃣ MUA QUA BÁO GIÁ (RFQ → Quote → Order)                       │
│     Listing → Create RFQ → Seller Quote → Buyer Accept → Order  │
│     ⚠️ RFQ: Container CHƯA bị khóa                               │
│     ⚠️ Quote: Container CHƯA bị khóa                             │
│     ✅ Accept Quote & Create Order: Container = SOLD             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. **Container Status Hiện Tại**

Theo database schema:
```typescript
enum ContainerStatus {
  AVAILABLE   // Có thể mua
  SOLD        // Đã bán (có sold_to_order_id)
  RENTED      // Đang cho thuê
  RESERVED    // Đang giữ chỗ (CHƯA SỬ DỤNG!)
}
```

### 3. **Khi Nào Container Bị Khóa?**

**Hiện tại:**
- ✅ **TẠO ORDER** → Container status = `SOLD` + `sold_to_order_id` + Trừ `available_quantity`
- ❌ **ADD TO CART** → Container KHÔNG bị khóa
- ❌ **CREATE RFQ** → Container KHÔNG bị khóa
- ❌ **SELLER QUOTE** → Container KHÔNG bị khóa

**Vấn đề:**
```
Scenario:
1. Buyer A: Add 5 containers (CONT-001 đến CONT-005) vào cart
   → Container vẫn status = AVAILABLE ❌
   
2. Buyer B: Vào listing, thấy 50 containers available
   → Thấy CONT-001, CONT-002,... (trùng với Buyer A) ❌
   
3. Buyer B: Add CONT-001, CONT-002 vào cart
   → HỆ THỐNG CHO PHÉP ❌
   
4. Buyer A checkout trước → CONT-001 đến CONT-005 = SOLD ✅
5. Buyer B checkout sau → LỖI: "Container không còn available" ❌

→ UX tệ: Buyer B đã chọn xong mới phát hiện hết hàng!
```

---

## 🎯 PHÂN TÍCH CÁC LỰA CHỌN

### **🔥 VẤN ĐỀ QUAN TRỌNG: QUẢN LÝ CONFLICT TRONG RFQ/QUOTE**

Trước khi quyết định LOCK ở đâu, cần giải quyết:
**"Làm sao để seller quản lý được khi nhiều buyer chọn cùng container?"**

---

### **SOLUTION A: RESERVED Status Khi Tạo RFQ** ⭐⭐⭐ **KHUYẾN NGHỊ**

#### Cách hoạt động:

```
Step 1: Buyer A tạo RFQ với containers [CONT-012, CONT-023,...]
   → Hệ thống check containers còn AVAILABLE không
   → Nếu có → Mark containers = RESERVED
   → Gán reserved_by_rfq_id = RFQ_A
   → Timeout: 7 ngày (hoặc do seller config)

Step 2: Buyer B vào chọn container
   → GET /listings/:id/containers
   → API chỉ trả về containers có status = AVAILABLE
   → KHÔNG thấy CONT-012, CONT-023 (đã RESERVED) ✅

Step 3: Seller quote cho RFQ A
   → Containers vẫn RESERVED cho RFQ A

Step 4A: Buyer A accept quote
   → Create order
   → Containers: RESERVED → SOLD
   → Gán sold_to_order_id

Step 4B: Buyer A reject quote HOẶC timeout (7 ngày)
   → Containers: RESERVED → AVAILABLE
   → Xóa reserved_by_rfq_id
   → Buyer B giờ có thể chọn
```

#### Database Schema:

```sql
-- Migration: Add reservation fields
ALTER TABLE listing_containers
  ADD COLUMN reserved_by_rfq_id TEXT,
  ADD COLUMN reserved_at TIMESTAMP,
  ADD COLUMN reserved_until TIMESTAMP,
  ADD CONSTRAINT listing_containers_reserved_by_rfq_id_fkey
    FOREIGN KEY (reserved_by_rfq_id) REFERENCES rfqs(id) ON DELETE SET NULL;

-- Add index
CREATE INDEX listing_containers_reserved_by_rfq_id_idx 
  ON listing_containers(reserved_by_rfq_id);

-- Add config to seller settings
ALTER TABLE users
  ADD COLUMN rfq_reservation_days INTEGER DEFAULT 7;
```

#### Backend API Changes:

```typescript
// 1. POST /api/v1/rfqs - Tạo RFQ với reservation
async createRFQ(userId, data) {
  const { items } = data;
  
  await prisma.$transaction(async (tx) => {
    // Create RFQ first
    const rfq = await tx.rfqs.create({
      data: {
        buyer_id: userId,
        status: 'PENDING',
        ...
      }
    });

    for (const item of items) {
      const { listing_id, selected_container_ids, quantity } = item;

      // ✅ VALIDATE: Containers still AVAILABLE
      const availableContainers = await tx.listing_containers.findMany({
        where: {
          listing_id,
          container_iso_code: { in: selected_container_ids },
          status: 'AVAILABLE'  // ⭐ CRITICAL
        }
      });

      if (availableContainers.length !== selected_container_ids.length) {
        throw new Error(
          `Some containers are no longer available. ` +
          `Requested: ${selected_container_ids.length}, ` +
          `Available: ${availableContainers.length}`
        );
      }

      // ✅ RESERVE containers for this RFQ
      const seller = await tx.listings.findUnique({
        where: { id: listing_id },
        include: { users: { select: { rfq_reservation_days: true }}}
      });

      const reservationDays = seller.users.rfq_reservation_days || 7;
      const reservedUntil = new Date();
      reservedUntil.setDate(reservedUntil.getDate() + reservationDays);

      await tx.listing_containers.updateMany({
        where: {
          listing_id,
          container_iso_code: { in: selected_container_ids }
        },
        data: {
          status: 'RESERVED',
          reserved_by_rfq_id: rfq.id,
          reserved_at: new Date(),
          reserved_until: reservedUntil
        }
      });

      console.log(`✅ Reserved ${selected_container_ids.length} containers for RFQ ${rfq.id}`);
      console.log(`   Containers: ${selected_container_ids.join(', ')}`);
      console.log(`   Reserved until: ${reservedUntil.toISOString()}`);

      // Create RFQ item
      await tx.rfq_items.create({
        data: {
          rfq_id: rfq.id,
          listing_id,
          quantity,
          selected_container_ids,
          ...
        }
      });
    }

    return rfq;
  });
}

// 2. GET /api/v1/listings/:id/containers - Chỉ show AVAILABLE
async getListingContainers(listingId) {
  const containers = await prisma.listing_containers.findMany({
    where: {
      listing_id: listingId,
      status: 'AVAILABLE',  // ✅ Không show RESERVED, SOLD, RENTED
      deleted_at: null
    },
    orderBy: { created_at: 'asc' }
  });

  // Summary
  const allContainers = await prisma.listing_containers.groupBy({
    by: ['status'],
    where: { listing_id: listingId, deleted_at: null },
    _count: true
  });

  const summary = {
    total: allContainers.reduce((sum, g) => sum + g._count, 0),
    available: allContainers.find(g => g.status === 'AVAILABLE')?._count || 0,
    reserved: allContainers.find(g => g.status === 'RESERVED')?._count || 0,
    sold: allContainers.find(g => g.status === 'SOLD')?._count || 0,
    rented: allContainers.find(g => g.status === 'RENTED')?._count || 0
  };

  return {
    containers: containers.map(c => ({
      id: c.id,
      container_iso_code: c.container_iso_code,
      shipping_line: c.shipping_line,
      manufactured_year: c.manufactured_year,
      status: c.status,
      created_at: c.created_at
    })),
    summary
  };
}

// 3. Background Job: Auto-release expired reservations
async releaseExpiredReservations() {
  const result = await prisma.listing_containers.updateMany({
    where: {
      status: 'RESERVED',
      reserved_until: { lt: new Date() }
    },
    data: {
      status: 'AVAILABLE',
      reserved_by_rfq_id: null,
      reserved_at: null,
      reserved_until: null
    }
  });

  console.log(`✅ Released ${result.count} expired reservations`);
  return result.count;
}

// 4. Reject RFQ/Quote → Release containers
async rejectRFQ(rfqId) {
  await prisma.$transaction(async (tx) => {
    // Update RFQ status
    await tx.rfqs.update({
      where: { id: rfqId },
      data: { status: 'REJECTED' }
    });

    // ✅ Release reserved containers
    await tx.listing_containers.updateMany({
      where: { reserved_by_rfq_id: rfqId },
      data: {
        status: 'AVAILABLE',
        reserved_by_rfq_id: null,
        reserved_at: null,
        reserved_until: null
      }
    });

    console.log(`✅ Released containers for rejected RFQ ${rfqId}`);
  });
}

// 5. Accept Quote → Create Order → RESERVED to SOLD
async acceptQuote(quoteId) {
  await prisma.$transaction(async (tx) => {
    const quote = await tx.quotes.findUnique({
      where: { id: quoteId },
      include: {
        rfq: {
          include: { rfq_items: true }
        }
      }
    });

    // Create order
    const order = await tx.orders.create({...});

    // Update containers: RESERVED → SOLD
    for (const item of quote.rfq.rfq_items) {
      if (item.selected_container_ids) {
        await tx.listing_containers.updateMany({
          where: {
            container_iso_code: { in: item.selected_container_ids },
            reserved_by_rfq_id: quote.rfq.id  // ✅ Verify ownership
          },
          data: {
            status: 'SOLD',
            sold_to_order_id: order.id,
            sold_at: new Date(),
            reserved_by_rfq_id: null,  // Clear reservation
            reserved_at: null,
            reserved_until: null
          }
        });
      }
    }

    console.log(`✅ Converted RESERVED containers to SOLD for order ${order.id}`);
  });
}
```

#### UI/UX Changes:

**1. Listing Detail Page - Container List:**

```tsx
<ContainerList>
  <div className="summary">
    <Badge variant="success">Có sẵn: {summary.available}</Badge>
    <Badge variant="warning">Đang giữ chỗ: {summary.reserved}</Badge>
    <Badge variant="secondary">Đã bán: {summary.sold}</Badge>
  </div>

  {containers.map(container => (
    <ContainerItem key={container.id}>
      <Checkbox 
        checked={isSelected(container.id)}
        onChange={() => toggleSelect(container.id)}
      />
      <span>{container.container_iso_code}</span>
      <span>{container.shipping_line}</span>
      <Badge variant="success">Có sẵn</Badge>
    </ContainerItem>
  ))}
  
  {summary.reserved > 0 && (
    <Alert>
      ℹ️ Có {summary.reserved} container đang được giữ chỗ bởi người mua khác
    </Alert>
  )}
</ContainerList>
```

**2. Seller RFQ Management Dashboard:**

```tsx
<RFQDashboard>
  <RFQCard rfq={rfqA}>
    <h3>RFQ #{rfqA.id} - Buyer A</h3>
    <p>Created: {rfqA.created_at}</p>
    
    <div className="containers">
      <h4>Containers đã giữ chỗ:</h4>
      {rfqA.items[0].selected_container_ids.map(code => (
        <Badge key={code} variant="warning">
          🔒 {code}
        </Badge>
      ))}
    </div>

    <Alert variant="info">
      ⏰ Giữ chỗ hết hạn: {rfqA.reserved_until}
      <br/>
      ℹ️ Containers này KHÔNG thể được buyer khác chọn
    </Alert>

    <Button onClick={() => createQuote(rfqA.id)}>
      Báo giá ngay
    </Button>
  </RFQCard>

  {rfqB && (
    <RFQCard rfq={rfqB}>
      <h3>RFQ #{rfqB.id} - Buyer B</h3>
      <Badge variant="success">
        ✅ Không có conflict với RFQ khác
      </Badge>
      {/* Buyer B đã tự động chọn các containers khác */}
    </RFQCard>
  )}
</RFQDashboard>
```

**3. Buyer RFQ Status Page:**

```tsx
<RFQStatusPage rfq={rfq}>
  <Alert variant="success">
    <h3>✅ RFQ của bạn đã được tạo thành công!</h3>
    <p>Containers sau đã được giữ chỗ cho bạn:</p>
    
    <ul>
      {rfq.items[0].selected_container_ids.map(code => (
        <li key={code}>
          🔒 {code} - Giữ chỗ đến {rfq.reserved_until}
        </li>
      ))}
    </ul>

    <p>
      ℹ️ Seller sẽ xem xét và báo giá trong vòng 24-48 giờ.
      <br/>
      ⚠️ Nếu không nhận được báo giá trong {rfq.reservation_days} ngày,
      containers sẽ tự động được mở khóa.
    </p>
  </Alert>
</RFQStatusPage>
```

#### ✅ Ưu điểm của Solution A:

1. **Công bằng:** First Come First Served - Ai tạo RFQ trước được ưu tiên
2. **Rõ ràng:** Buyer B không thấy containers đã RESERVED → Không confusion
3. **Quản lý dễ:** Seller thấy rõ containers nào đang hold cho RFQ nào
4. **Không conflict:** Không thể có 2 RFQ cùng claim 1 container
5. **Auto-cleanup:** Timeout tự động release containers nếu không accept

#### ❌ Nhược điểm:

1. **Lock lâu:** 7 ngày có thể quá lâng phí (nhưng cần cho business negotiation)
2. **Phức tạp:** Cần background job cleanup expired reservations
3. **Edge case:** Nếu buyer tạo RFQ nhưng không responsive → Waste inventory

---

### **SOLUTION B: Seller Priority Queue System** 🎯

#### Cách hoạt động:

```
Không lock containers ngay lập tức.
Thay vào đó, seller thấy TẤT CẢ RFQs và tự quyết định:

Dashboard Seller:
┌─────────────────────────────────────────────────────────┐
│  RFQs đang chờ xử lý                                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🔴 CONFLICT DETECTED!                                  │
│                                                          │
│  RFQ #123 (Buyer A) - Created: 10:00 AM                │
│     Containers: CONT-012, CONT-023, CONT-034            │
│     Quantity: 3                                         │
│     ⚠️ CONT-012, CONT-023 cũng được yêu cầu bởi RFQ #124│
│     [Ưu tiên RFQ này] [Báo giá ngay]                   │
│                                                          │
│  RFQ #124 (Buyer B) - Created: 10:15 AM                │
│     Containers: CONT-012, CONT-023, CONT-045            │
│     Quantity: 3                                         │
│     ⚠️ CONT-012, CONT-023 đang được yêu cầu bởi RFQ #123│
│     [Ưu tiên RFQ này] [Báo giá với containers thay thế]│
│                                                          │
└─────────────────────────────────────────────────────────┘

Seller Actions:
1. Chọn "Ưu tiên RFQ #123" (vì đến trước)
2. Quote cho RFQ #123 với CONT-012, 023, 034
3. Buyer A accept → Containers SOLD

4. Với RFQ #124:
   - Option A: Quote với containers thay thế (CONT-046, 047, 045)
   - Option B: Chờ RFQ #123 reject/timeout rồi quote lại
   - Option C: Reject RFQ #124 với lý do "Hết hàng"
```

#### ✅ Ưu điểm:
- Seller có FULL CONTROL
- Flexible - Seller quyết định ưu tiên ai
- Có thể xem xét giá, relationship, order history

#### ❌ Nhược điểm:
- Phức tạp cho seller
- Buyer B không biết containers đã được claim
- Manual process → Slow, error-prone

---

### **SOLUTION C: Auction/Competitive Bidding** 💰

```
Khi có conflict, chuyển sang đấu giá:

Step 1: Hệ thống detect 2 RFQs claim cùng container
Step 2: Thông báo cả 2 buyers:
   "Containers bạn chọn đang được yêu cầu bởi buyer khác.
    Vui lòng đưa ra giá tốt nhất của bạn."
Step 3: Seller xem 2 bids, chọn giá cao hơn
Step 4: Winner gets containers
```

#### ❌ Nhược điểm:
- Quá phức tạp
- Không phù hợp với B2B (cần negotiation, không phải auction)
- Có thể gây giá tăng vọt

---

## 📊 SO SÁNH SOLUTIONS

| Tiêu chí | Solution A: RESERVED at RFQ | Solution B: Seller Queue | Solution C: Auction |
|----------|----------------------------|-------------------------|---------------------|
| **Công bằng** | ⭐⭐⭐⭐⭐ FIFO | ⭐⭐⭐ Seller decides | ⭐⭐ Highest bid wins |
| **Rõ ràng** | ⭐⭐⭐⭐⭐ Clear | ⭐⭐ Confusing | ⭐⭐⭐ Clear rules |
| **Quản lý** | ⭐⭐⭐⭐ Auto | ⭐⭐ Manual | ⭐⭐⭐ Auto |
| **Development** | ⭐⭐⭐ Medium | ⭐⭐⭐⭐ Easy | ⭐ Hard |
| **UX** | ⭐⭐⭐⭐⭐ Tốt nhất | ⭐⭐ Tệ | ⭐⭐⭐ OK |
| **Fit B2B** | ⭐⭐⭐⭐⭐ Perfect | ⭐⭐⭐⭐ Good | ⭐ Poor |

---

## ✅ QUYẾT ĐỊNH CUỐI CÙNG

### **Triển khai Solution A: RESERVED Status tại RFQ** ⭐

**Lý do:**
1. ✅ Công bằng - FIFO principle
2. ✅ Rõ ràng - Không có conflict
3. ✅ Automation - Seller không cần quản lý manual
4. ✅ UX tốt - Buyer biết containers đã được giữ chỗ
5. ✅ Phù hợp B2B - Đủ thời gian negotiation

**Implementation Plan:**

#### **Phase 1: Backend Changes (2-3 ngày)**

- [ ] Migration: Add reservation fields to `listing_containers`
- [ ] Update `POST /api/v1/rfqs` - Reserve containers
- [ ] Update `GET /api/v1/listings/:id/containers` - Filter AVAILABLE only
- [ ] Add background job: Release expired reservations (chạy mỗi giờ)
- [ ] Handle reject RFQ → Release containers
- [ ] Handle accept quote → RESERVED to SOLD

#### **Phase 2: Frontend Changes (2 ngày)**

- [ ] Listing page: Show summary (available, reserved, sold)
- [ ] RFQ creation: Validate containers still available
- [ ] RFQ status page: Show reserved containers + expiry
- [ ] Seller dashboard: Show reserved containers per RFQ
- [ ] Error handling: Container no longer available

#### **Phase 3: Configuration (1 ngày)**

- [ ] Seller settings: Configure reservation duration (default 7 days)
- [ ] Admin dashboard: Monitor reservation metrics
- [ ] Notifications: Remind seller about expiring reservations

---

### **ALTERNATIVE: Nếu chưa sẵn sàng cho Phase 1-3**

Tạm thời dùng **Solution B (Seller Manual Management):**

```typescript
// GET /api/v1/seller/rfqs/conflicts
async getRFQConflicts(sellerId) {
  // Tìm các RFQs có chung containers
  const rfqs = await prisma.rfqs.findMany({
    where: {
      seller_id: sellerId,
      status: 'PENDING'
    },
    include: { rfq_items: true }
  });

  const conflicts = [];
  const containerMap = new Map(); // container_id -> [rfq_ids]

  // Build map
  rfqs.forEach(rfq => {
    rfq.rfq_items.forEach(item => {
      item.selected_container_ids?.forEach(containerId => {
        if (!containerMap.has(containerId)) {
          containerMap.set(containerId, []);
        }
        containerMap.get(containerId).push(rfq.id);
      });
    });
  });

  // Find conflicts (container claimed by 2+ RFQs)
  containerMap.forEach((rfqIds, containerId) => {
    if (rfqIds.length > 1) {
      conflicts.push({
        container_id: containerId,
        rfq_ids: rfqIds,
        count: rfqIds.length
      });
    }
  });

  return {
    total_conflicts: conflicts.length,
    conflicts,
    rfqs: rfqs.filter(rfq => 
      conflicts.some(c => c.rfq_ids.includes(rfq.id))
    )
  };
}
```

**Seller Dashboard:**
```tsx
<ConflictAlert>
  ⚠️ Bạn có {conflicts.length} containers đang được yêu cầu bởi nhiều RFQs!
  
  {conflicts.map(conflict => (
    <ConflictCard key={conflict.container_id}>
      <h4>Container: {conflict.container_id}</h4>
      <p>Được yêu cầu bởi {conflict.count} RFQs:</p>
      <ul>
        {conflict.rfq_ids.map(rfqId => (
          <li key={rfqId}>
            RFQ #{rfqId}
            <Button onClick={() => prioritize(rfqId)}>
              Ưu tiên RFQ này
            </Button>
          </li>
        ))}
      </ul>
    </ConflictCard>
  ))}
</ConflictAlert>
```

---

### **CART: Không Lock, Chỉ Warning** 🛒

Với Cart, không nên lock. Chỉ cần:

```typescript
// GET /api/v1/cart
async getCart(userId) {
  const cart = await prisma.carts.findUnique({
    where: { user_id: userId },
    include: {
      cart_items: {
        include: {
          listing: {
            include: {
              listing_containers: {
                where: {
                  container_iso_code: { 
                    in: cart_item.selected_container_ids 
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  // ✅ Check if selected containers still available
  cart.cart_items.forEach(item => {
    const unavailable = item.selected_container_ids.filter(code => {
      const container = item.listing.listing_containers
        .find(c => c.container_iso_code === code);
      return !container || container.status !== 'AVAILABLE';
    });

    if (unavailable.length > 0) {
      item.warnings = [
        `⚠️ ${unavailable.length} container(s) không còn available: ${unavailable.join(', ')}`
      ];
      item.needs_reselection = true;
    }
  });

  return cart;
}
```

**Cart UI:**
```tsx
<CartItem item={item}>
  {item.needs_reselection && (
    <Alert variant="warning">
      ⚠️ Một số containers bạn chọn không còn available.
      <Button onClick={() => router.push(`/listings/${item.listing_id}`)}>
        Chọn lại containers
      </Button>
    </Alert>
  )}
</CartItem>
```

---

## 🎯 ROADMAP TRIỂN KHAI

### **Week 1: Quick Wins (Seller Conflict Detection)**
- [ ] API detect RFQ conflicts
- [ ] Seller dashboard show conflicts
- [ ] Manual priority selection
- **Effort:** 1-2 ngày
- **Impact:** Seller có visibility ngay

### **Week 2-3: RFQ Reservation (Solution A)**
- [ ] Database migration
- [ ] Reserve containers at RFQ creation
- [ ] Auto-release expired reservations
- [ ] Frontend updates
- **Effort:** 4-5 ngày
- **Impact:** Giải quyết triệt để conflict

### **Week 4: Cart Validation**
- [ ] Cart check container availability real-time
- [ ] Warning khi containers không còn
- [ ] Smooth reselection UX
- **Effort:** 1-2 ngày
- **Impact:** Better UX, avoid checkout errors

---

## 📋 EDGE CASES CẦN XỬ LÝ

### **Case 1: Buyer tạo RFQ rồi bỏ đi**
```
Solution: Auto-expire reservation sau X ngày
- Default: 7 ngày
- Seller có thể config: 3-30 ngày
- Notification: Remind buyer trước khi expire 1 ngày
```

### **Case 2: Seller quote nhưng buyer không response**
```
Solution: Quote cũng có expiry
- Default: 3 ngày
- Sau đó RFQ status → EXPIRED
- Release reserved containers
```

### **Case 3: Multiple items trong cùng RFQ**
```
RFQ có 3 items từ 3 listings khác nhau.
Item 1: 5 containers từ Listing A
Item 2: 3 containers từ Listing B
Item 3: 10 containers từ Listing C

→ Phải reserve containers cho CẢ 3 items atomic
→ Nếu 1 item không reserve được → Fail toàn bộ RFQ
```

### **Case 4: Buyer update RFQ (change containers)**
```
Buyer đã tạo RFQ với CONT-001, 002, 003
Giờ muốn đổi sang CONT-004, 005, 006

Option A: Không cho phép update → Phải reject & create new RFQ
Option B: Cho phép update:
  - Release CONT-001, 002, 003
  - Reserve CONT-004, 005, 006
  - Nếu không reserve được → Keep old reservation
```

### **Case 5: Concurrent RFQ creation**
```
2 buyers tạo RFQ cùng lúc, chọn cùng containers

Timeline:
10:00:00.000 - Buyer A: POST /rfqs (start transaction)
10:00:00.100 - Buyer B: POST /rfqs (start transaction)
10:00:00.200 - Buyer A: Check containers AVAILABLE ✅
10:00:00.300 - Buyer B: Check containers AVAILABLE ✅ (vẫn còn!)
10:00:00.400 - Buyer A: Update containers = RESERVED ✅
10:00:00.500 - Buyer B: Update containers = RESERVED ❌ (conflict!)

Solution: Database lock
```typescript
await prisma.$queryRaw`
  SELECT * FROM listing_containers
  WHERE container_iso_code IN (${containerIds})
    AND status = 'AVAILABLE'
  FOR UPDATE NOWAIT;
`;

// Nếu containers đã bị lock bởi transaction khác:
// → Throw error: "Containers đang được xử lý bởi request khác"
```

---

## 🧪 TEST SCENARIOS

### **Scenario 1: Normal Flow**
```
1. Listing có 50 containers AVAILABLE
2. Buyer A tạo RFQ chọn 5 containers
   ✅ Status: AVAILABLE → RESERVED
3. Buyer B vào listing
   ✅ Chỉ thấy 45 containers (không thấy 5 của Buyer A)
4. Buyer B tạo RFQ chọn 5 containers khác
   ✅ Không conflict
5. Seller quote cho cả 2 RFQs
6. Buyer A accept → Containers = SOLD
7. Buyer B accept → Containers = SOLD
   ✅ Success, không conflict
```

### **Scenario 2: Conflict Detection**
```
1. Listing có 50 containers
2. Buyer A tạo RFQ chọn CONT-001, 002, 003
   ✅ Reserved
3. Buyer B (không biết) cố tạo RFQ chọn CONT-002, 003, 004
   ❌ Error: "CONT-002, CONT-003 không còn available"
   ✅ Frontend suggest chọn containers khác
4. Buyer B chọn lại: CONT-004, 005, 006
   ✅ Success
```

### **Scenario 3: Expiration**
```
1. Buyer A tạo RFQ, reserved 5 containers
2. Seller không quote trong 7 ngày
3. Day 8: Background job chạy
   ✅ Containers: RESERVED → AVAILABLE
4. Buyer B giờ có thể chọn các containers này
   ✅ Success
```

### **Scenario 4: Rejection**
```
1. Buyer A tạo RFQ, reserved 5 containers
2. Seller quote
3. Buyer A reject quote
   ✅ Containers: RESERVED → AVAILABLE ngay lập tức
4. Buyer B tạo RFQ chọn cùng containers
   ✅ Success
```

---

## 📊 METRICS & MONITORING

Track các metrics:
```typescript
// 1. Reservation Rate
const reservationRate = 
  (containers_reserved / total_containers) * 100;
// Target: < 20% (không lock quá nhiều)

// 2. Expiration Rate
const expirationRate = 
  (reservations_expired / total_reservations) * 100;
// Target: < 30% (buyer responsive)

// 3. Conflict Rate (Before Implementation)
const conflictRate = 
  (rfqs_with_same_containers / total_rfqs) * 100;
// Measure để justify solution

// 4. Avg Time to Accept Quote
const avgTimeToAccept = 
  avg(quote.created_at → order.created_at);
// Use để set optimal reservation duration

// 5. Conversion Rate
const conversionRate = 
  (rfqs_converted_to_orders / total_rfqs) * 100;
// Measure impact of reservation system
```

---

## 🎯 KẾT LUẬN CUỐI CÙNG

### **Câu trả lời cho vấn đề conflict:**

**Q:** Khi 2 người mua chọn cùng container và đợi báo giá, làm sao seller quản lý được? Ai được mua?

**A:** ⭐ **RESERVE CONTAINERS KHI TẠO RFQ (Solution A)** ⭐

**Lý do:**

1. **Công bằng:** First-come-first-served, không có conflict
2. **Rõ ràng:** Buyer 2 không thấy containers đã reserved → Không confusion
3. **Tự động:** Seller không cần quản lý manual conflicts
4. **Phù hợp B2B:** Đủ thời gian (7 ngày) cho negotiation
5. **Có timeout:** Auto-release nếu không accept → Không lãng phí

**Flow chi tiết:**
```
10:00 - Buyer A tạo RFQ chọn CONT-012, 023
        → CONT-012, 023: AVAILABLE → RESERVED
        → Reserved by RFQ A, expires in 7 days

10:15 - Buyer B vào listing
        → GET /containers → Chỉ trả về AVAILABLE
        → KHÔNG thấy CONT-012, 023 ✅
        → Chọn CONT-045, 046 thay vì

10:30 - Seller vào dashboard
        → Thấy RFQ A: CONT-012, 023 (RESERVED)
        → Thấy RFQ B: CONT-045, 046 (RESERVED)
        → KHÔNG có conflict ✅
        → Quote cho cả 2 bình thường

11:00 - Buyer A accept quote
        → CONT-012, 023: RESERVED → SOLD
        
12:00 - Buyer B accept quote
        → CONT-045, 046: RESERVED → SOLD
        
✅ Cả 2 buyers đều hài lòng, seller không stress!
```

**Implementation:**
- **Priority 1:** RFQ Reservation (Week 2-3) - **CRITICAL**
- **Priority 2:** Cart Warning (Week 4) - Important
- **Priority 3:** Conflict Dashboard (Week 1) - Quick win

**Effort:**
- Backend: 3-4 ngày
- Frontend: 2 ngày  
- Testing: 1 ngày
- **Total: 6-7 ngày**

**Impact:**
- ✅ Giải quyết 100% conflict trong RFQ
- ✅ UX tốt cho cả buyer (biết containers đã reserved) và seller (không phải quản lý manual)
- ✅ Công bằng (FIFO)
- ✅ Scalable, maintainable

---

## 📌 TÓM TẮT QUYẾT ĐỊNH

| Trường hợp | Giải pháp | Khi nào lock? |
|------------|-----------|---------------|
| **Cart** | Warning only | ❌ KHÔNG lock |
| **RFQ** | **Reserve containers** | ✅ **Lock khi tạo RFQ** |
| **Direct Order** | Lock immediately | ✅ Lock khi tạo order |

**Lý do khác nhau:**
- **Cart:** Chưa có cam kết, user có thể abandon → Không nên lock
- **RFQ:** Có ý định rõ ràng + cần time negotiate → **NÊN lock**
- **Order:** Cam kết mua ngay → Phải lock

---

## 🔗 TÀI LIỆU LIÊN QUAN

1. `UX-BUYER-CHON-CONTAINER.md` - UX flow chọn container
2. `VAN-DE-HIEN-THI-CONTAINER.md` - Vấn đề hiển thị container theo status
3. `VAN-DE-TRU-SO-LUONG-CONTAINER.md` - Logic trừ số lượng khi đặt hàng
4. `backend/src/lib/inventory/inventory-service.ts` - Service quản lý inventory
5. `backend/src/routes/orders.ts` - Logic tạo order và lock containers
6. `backend/src/routes/quotes.ts` - Logic RFQ và quotes

---

**📅 Ngày phân tích:** 10 Nov 2025  
**🔍 Vấn đề:** Conflict khi 2 buyers chọn cùng container trong RFQ  
**✅ Giải pháp:** Reserve containers at RFQ creation (FIFO)  
**⚡ Priority:** CRITICAL - Cần implement để tránh conflict và bad UX  
**🕒 Timeline:** Week 2-3 (6-7 ngày development)

---

## 📊 SO SÁNH SOLUTIONS

| Tiêu chí | Solution A: RESERVED at RFQ | Solution B: Seller Queue | Solution C: Auction |
|----------|----------------------------|-------------------------|---------------------|
| **Công bằng** | ⭐⭐⭐⭐⭐ FIFO | ⭐⭐⭐ Seller decides | ⭐⭐ Highest bid wins |
| **Rõ ràng** | ⭐⭐⭐⭐⭐ Clear | ⭐⭐ Confusing | ⭐⭐⭐ Clear rules |
| **Quản lý** | ⭐⭐⭐⭐ Auto | ⭐⭐ Manual | ⭐⭐⭐ Auto |
| **Development** | ⭐⭐⭐ Medium | ⭐⭐⭐⭐ Easy | ⭐ Hard |
| **UX** | ⭐⭐⭐⭐⭐ Tốt nhất | ⭐⭐ Tệ | ⭐⭐⭐ OK |
| **Fit B2B** | ⭐⭐⭐⭐⭐ Perfect | ⭐⭐⭐⭐ Good | ⭐ Poor |

---

## ✅ QUYẾT ĐỊNH CUỐI CÙNG

### **Triển khai Solution A: RESERVED Status tại RFQ** ⭐

**Lý do:**
1. ✅ Công bằng - FIFO principle
2. ✅ Rõ ràng - Không có conflict
3. ✅ Automation - Seller không cần quản lý manual
4. ✅ UX tốt - Buyer biết containers đã được giữ chỗ
5. ✅ Phù hợp B2B - Đủ thời gian negotiation

**Implementation Plan:**

#### **Phase 1: Backend Changes (2-3 ngày)**

- [ ] Migration: Add reservation fields to `listing_containers`
- [ ] Update `POST /api/v1/rfqs` - Reserve containers
- [ ] Update `GET /api/v1/listings/:id/containers` - Filter AVAILABLE only
- [ ] Add background job: Release expired reservations (chạy mỗi giờ)
- [ ] Handle reject RFQ → Release containers
- [ ] Handle accept quote → RESERVED to SOLD

#### **Phase 2: Frontend Changes (2 ngày)**

- [ ] Listing page: Show summary (available, reserved, sold)
- [ ] RFQ creation: Validate containers still available
- [ ] RFQ status page: Show reserved containers + expiry
- [ ] Seller dashboard: Show reserved containers per RFQ
- [ ] Error handling: Container no longer available

#### **Phase 3: Configuration (1 ngày)**

- [ ] Seller settings: Configure reservation duration (default 7 days)
- [ ] Admin dashboard: Monitor reservation metrics
- [ ] Notifications: Remind seller about expiring reservations

---

### **ALTERNATIVE: Nếu chưa sẵn sàng cho Phase 1-3**



#### Cách hoạt động:
```
Add to Cart → Container status = RESERVED
            → Gắn cart_id hoặc reserved_by_user_id
            → Timeout 30 phút → Auto release nếu không checkout
```

#### ✅ Ưu điểm:
- Đảm bảo người đã chọn sẽ có hàng
- Tránh conflict giữa các buyer
- UX tốt: Chọn xong là "giữ chỗ" ngay

#### ❌ Nhược điểm:
- **Phức tạp cao:** Cần thêm timeout mechanism, background job auto-release
- **Rủi ro:** Buyer add vào cart rồi bỏ đi → Container bị lock vô ích
- **Performance:** Phải track timeout cho từng cart item
- **Database:** Cần thêm field `reserved_at`, `reserved_until`, `reserved_by_cart_id`
- **Race condition:** Nhiều người add cùng lúc vẫn có thể conflict

#### Schema Changes Cần Thiết:
```sql
ALTER TABLE listing_containers 
  ADD COLUMN reserved_by_cart_id TEXT,
  ADD COLUMN reserved_at TIMESTAMP,
  ADD COLUMN reserved_until TIMESTAMP,
  ADD CONSTRAINT listing_containers_reserved_by_cart_id_fkey 
    FOREIGN KEY (reserved_by_cart_id) REFERENCES carts(id) ON DELETE SET NULL;

-- Background job cần chạy mỗi phút:
UPDATE listing_containers 
SET status = 'AVAILABLE',
    reserved_by_cart_id = NULL,
    reserved_at = NULL,
    reserved_until = NULL
WHERE status = 'RESERVED' 
  AND reserved_until < NOW();
```

#### Code Example:
```typescript
// Add to cart
async addToCart(userId, listingId, containerIds) {
  await prisma.$transaction(async (tx) => {
    // 1. Check containers are AVAILABLE
    const containers = await tx.listing_containers.findMany({
      where: {
        container_iso_code: { in: containerIds },
        status: 'AVAILABLE'
      }
    });

    if (containers.length !== containerIds.length) {
      throw new Error('Some containers are not available');
    }

    // 2. Reserve containers (30 min timeout)
    const reservedUntil = new Date();
    reservedUntil.setMinutes(reservedUntil.getMinutes() + 30);

    await tx.listing_containers.updateMany({
      where: {
        container_iso_code: { in: containerIds }
      },
      data: {
        status: 'RESERVED',
        reserved_by_cart_id: cartId,
        reserved_at: new Date(),
        reserved_until: reservedUntil
      }
    });

    // 3. Add to cart
    await tx.cart_items.create({
      data: {
        cart_id: cartId,
        listing_id: listingId,
        selected_container_ids: containerIds,
        quantity: containerIds.length
      }
    });
  });
}
```

---

### **Option 2: Khóa Khi Tạo RFQ/Quote** 🟡 **KHẢ THI NHƯNG PHỨC TẠP**

#### Cách hoạt động:
```
Create RFQ → Container status = RESERVED (gắn rfq_id)
           → Seller Quote → Vẫn RESERVED
           → Buyer Accept Quote → Create Order → SOLD ✅
           → Buyer Reject/Timeout → AVAILABLE lại
```

#### ✅ Ưu điểm:
- Đảm bảo container không bị bán khi đang thương lượng
- Phù hợp với business logic (RFQ là cam kết mua)
- Timeout dài hơn cart (vd: 7 ngày)

#### ❌ Nhược điểm:
- Vẫn cần timeout mechanism
- Phức tạp: Phải handle Accept/Reject/Timeout
- Cart vẫn không được bảo vệ

#### Schema Changes:
```sql
ALTER TABLE listing_containers
  ADD COLUMN reserved_by_rfq_id TEXT,
  ADD COLUMN reserved_by_quote_id TEXT,
  ADD CONSTRAINT listing_containers_reserved_by_rfq_id_fkey
    FOREIGN KEY (reserved_by_rfq_id) REFERENCES rfqs(id) ON DELETE SET NULL;
```

---

### **Option 3: CHỈ Khóa Khi Tạo Order** ⭐⭐⭐ **KHUYẾN NGHỊ**

#### Cách hoạt động:
```
Add to Cart → Container vẫn AVAILABLE
Create Order → Container status = SOLD ngay lập tức
             → Gắn sold_to_order_id
             → Trừ available_quantity
```

#### ✅ Ưu điểm:
- **Đơn giản:** Không cần timeout, background job
- **Hiện tại đã implement:** Code đã có logic này
- **Performance tốt:** Không phải track reservation
- **Ít rủi ro:** Không lo container bị lock vô ích

#### ❌ Nhược điểm:
- Race condition: 2 người checkout cùng lúc có thể chọn cùng container
- UX: Cart/RFQ có thể "hết hàng" khi checkout

#### Giải pháp cho nhược điểm:

**A. Thêm Transaction Lock Khi Checkout**
```typescript
async createOrderFromCart(userId, cartId) {
  await prisma.$transaction(async (tx) => {
    // 1. Lock containers with FOR UPDATE
    const containers = await tx.$queryRaw`
      SELECT * FROM listing_containers
      WHERE container_iso_code IN (${containerIds})
        AND status = 'AVAILABLE'
      FOR UPDATE NOWAIT;
    `;

    if (containers.length !== containerIds.length) {
      throw new Error('Some containers are no longer available');
    }

    // 2. Create order
    const order = await tx.orders.create({...});

    // 3. Update container status
    await tx.listing_containers.updateMany({
      where: { container_iso_code: { in: containerIds } },
      data: {
        status: 'SOLD',
        sold_to_order_id: order.id
      }
    });

    // 4. Decrement available_quantity
    await tx.listings.update({
      where: { id: listingId },
      data: {
        available_quantity: { decrement: containerIds.length }
      }
    });
  });
}
```

**B. Filter Containers Real-time Trong GET API**
```typescript
// GET /api/v1/listings/:id/containers
async getListingContainers(listingId) {
  const containers = await prisma.listing_containers.findMany({
    where: {
      listing_id: listingId,
      status: 'AVAILABLE',  // ✅ CHỈ show AVAILABLE
      deleted_at: null
    }
  });

  return {
    containers,
    summary: {
      total: 50,
      available: 45,  // Số thực tế hiện tại
      sold: 5
    }
  };
}
```

**C. Validate Lại Khi Checkout**
```typescript
// Frontend: Hiển thị error rõ ràng
try {
  await checkout();
} catch (error) {
  if (error.code === 'CONTAINERS_NOT_AVAILABLE') {
    toast.error(
      'Một số container đã được mua bởi người khác. ' +
      'Vui lòng chọn lại container khác.',
      {
        action: {
          label: 'Chọn lại',
          onClick: () => router.push(`/listings/${listingId}`)
        }
      }
    );
  }
}
```

---

### **Option 4: Hybrid - Soft Reservation với Warning** 🟢 **TỐT NHẤT**

#### Cách hoạt động:
```
Add to Cart → Ghi nhận "đang trong cart của ai"
           → Không lock hard, chỉ hiển thị warning
           → Checkout → Lock hard với transaction
```

#### Schema:
```sql
-- Thêm field tracking (không enforce hard lock)
ALTER TABLE listing_containers
  ADD COLUMN in_cart_of_user_ids TEXT[];  -- Array user IDs

-- Update khi add to cart
UPDATE listing_containers
SET in_cart_of_user_ids = array_append(in_cart_of_user_ids, 'user-123')
WHERE container_iso_code = 'CONT-001';
```

#### Frontend UI:
```tsx
<ContainerList>
  {containers.map(container => (
    <ContainerItem 
      container={container}
      isInOtherCart={container.in_cart_of_user_ids?.length > 0}
    >
      {container.in_cart_of_user_ids?.length > 0 && (
        <Badge variant="warning">
          ⚠️ {container.in_cart_of_user_ids.length} người đang chọn
        </Badge>
      )}
    </ContainerItem>
  ))}
</ContainerList>
```

#### ✅ Ưu điểm:
- **Đơn giản:** Không cần timeout
- **Minh bạch:** User biết container đang "hot"
- **Không block:** Container vẫn chọn được
- **Tối ưu UX:** Warning nhẹ nhàng, không gây friction

#### ❌ Nhược điểm:
- Không đảm bảo 100% (vẫn race condition)
- Nhưng acceptable vì:
  - Xác suất thấp (ít khi 2 người checkout cùng lúc)
  - Có validation lại khi checkout
  - Error message rõ ràng

---

## 📋 SO SÁNH CÁC LỰA CHỌN

| Tiêu chí | Opt 1: Cart Lock | Opt 2: RFQ Lock | Opt 3: Order Lock | Opt 4: Hybrid |
|----------|-----------------|-----------------|-------------------|---------------|
| **Độ phức tạp** | 🔴🔴🔴🔴 Cao | 🟡🟡🟡 Trung bình | 🟢 Thấp | 🟢🟢 Thấp |
| **Development time** | 5-7 ngày | 3-4 ngày | 0 ngày (có sẵn) | 1-2 ngày |
| **Rủi ro race condition** | 🟢 Thấp | 🟢🟢 Thấp | 🔴 Cao | 🟡 Trung bình |
| **Performance** | 🔴 Tệ (timeout job) | 🟡 OK | 🟢 Tốt | 🟢 Tốt |
| **UX** | 🟢🟢🟢 Rất tốt | 🟢🟢 Tốt | 🟡 OK (có warning) | 🟢🟢🟢 Rất tốt |
| **Maintainability** | 🔴 Khó maintain | 🟡 OK | 🟢 Dễ | 🟢 Dễ |
| **Khả năng mở rộng** | 🟡 OK | 🟡 OK | 🟢 Tốt | 🟢🟢 Rất tốt |

---

## 🎯 KHUYẾN NGHỊ

### **Giai đoạn 1: Triển khai Option 3 ngay (0 ngày)** ⚡

**Hiện tại đã có:**
- ✅ Container lock khi create order
- ✅ Transaction để tránh race condition
- ✅ Inventory service để manage

**Cần làm thêm:**
1. **Cải thiện API `GET /listings/:id/containers`** (30 phút)
   ```typescript
   // Chỉ trả về AVAILABLE containers
   where: {
     listing_id: listingId,
     status: 'AVAILABLE',  // ✅ Filter
     deleted_at: null
   }
   ```

2. **Thêm validation khi checkout** (30 phút)
   ```typescript
   // Validate containers still available
   const availableContainers = await prisma.listing_containers.findMany({
     where: {
       container_iso_code: { in: selectedContainerIds },
       status: 'AVAILABLE'
     }
   });

   if (availableContainers.length !== selectedContainerIds.length) {
     throw new Error('CONTAINERS_NOT_AVAILABLE');
   }
   ```

3. **Frontend: Error handling** (1 giờ)
   ```tsx
   // Hiển thị error rõ ràng + CTA chọn lại
   ```

**Kết quả:**
- ✅ Giải quyết 95% trường hợp
- ✅ Không tốn thời gian develop
- ⚠️ 5% trường hợp race condition (acceptable)

---

### **Giai đoạn 2: Nâng cấp lên Option 4 (1-2 ngày)** 🚀

**Khi nào:**
- Khi có nhiều buyer tranh nhau cùng container
- Khi cần UX tốt hơn
- Khi có thời gian develop

**Làm gì:**
1. **Backend: Thêm tracking** (4 giờ)
   - Migration: Thêm `in_cart_of_user_ids` array
   - API update khi add/remove cart
   - Cleanup khi cart expires

2. **Frontend: Hiển thị warning** (4 giờ)
   - Badge "X người đang chọn"
   - Tooltip giải thích
   - Real-time update (optional)

**Kết quả:**
- ✅ UX tốt nhất
- ✅ Minh bạch
- ✅ Vẫn đơn giản

---

### **Giai đoạn 3: Nếu cần đảm bảo 100% (Optional)** 🔒

**Chỉ khi:**
- Containers rất khan hiếm
- Business yêu cầu strict reservation
- Có resource để maintain

**Triển khai Option 1:**
- Timeout 15-30 phút cho cart
- Background job cleanup
- UI countdown timer

**Effort:** 5-7 ngày  
**Trade-off:** Phức tạp cao vs. lợi ích nhỏ

---

## 🔍 PHÂN TÍCH SÂU: TẠI SAO KHÔNG NÊN LOCK Ở CART?

### 1. **Cart là "Giỏ hàng ảo", không phải "Đơn hàng thật"**

```
🛒 Cart:
- User có thể add/remove thoải mái
- User có thể bỏ đi không quay lại
- User có thể so sánh nhiều listing
→ Không nên lock container vì chưa có cam kết mua

📦 Order:
- User đã xác nhận mua
- User đã chọn địa chỉ giao hàng
- User sẵn sàng thanh toán
→ PHẢI lock container vì đã cam kết
```

### 2. **Timeout Management Rất Phức Tạp**

```typescript
// Các edge cases cần handle:

// 1. User add to cart nhưng không checkout
if (cart.reserved_until < now()) {
  await releaseContainers(cart);
}

// 2. User xóa item khỏi cart
await releaseContainers(itemContainerIds);

// 3. User update quantity (giảm số lượng)
await releaseContainers(removedContainerIds);

// 4. Cart expires tự động
await cleanupExpiredReservations();  // Chạy mỗi phút?

// 5. User logout → cart vẫn tồn tại
// → Container vẫn bị lock 30 phút?

// 6. Browser crash → không gọi API cleanup
// → Container bị lock vô thời hạn?
```

### 3. **Performance Impact**

```sql
-- Background job phải chạy liên tục:
SELECT * FROM listing_containers
WHERE status = 'RESERVED'
  AND reserved_until < NOW()
LIMIT 1000;  -- Nếu có 100k containers?

UPDATE listing_containers
SET status = 'AVAILABLE',
    reserved_by_cart_id = NULL
WHERE id IN (...);

-- Chạy mỗi phút → Load cao
-- Chạy mỗi 10 phút → Container bị lock lâu hơn
```

### 4. **Real-world Statistics**

Theo kinh nghiệm e-commerce:
```
Cart Conversion Rate: 20-30%
→ 70-80% cart bị abandoned
→ 70-80% containers bị lock VÔ ÍCH

Race Condition Probability: < 5%
→ Chỉ xảy ra khi 2+ người checkout CÙNG LÚC
→ Với container B2B, xác suất còn thấp hơn

Time to Checkout: 15-60 phút
→ Lock 30 phút có thể không đủ
→ Lock 60 phút → quá lãng phí
```

---

## ✅ KẾT LUẬN VÀ QUYẾT ĐỊNH

### **Câu trả lời cho câu hỏi ban đầu:**

> **Q:** Nên ẩn ở bước đã chọn container và đợi báo giá, hay phải đợi tới bước tạo đơn hàng?

**A:** ⭐ **PHẢI ĐỢI TẠO ĐƠN HÀNG** ⭐

**Lý do:**

1. **Simplicity > Complexity**
   - Lock ở Cart/RFQ quá phức tạp
   - Benefit không xứng đáng với effort
   - Rủi ro bugs cao

2. **Cart/RFQ chưa phải cam kết**
   - User có thể thay đổi ý định
   - Lock sớm → lãng phí inventory
   - Gây friction trong UX

3. **Order = Cam kết thật sự**
   - User đã chọn địa chỉ giao hàng
   - User sẵn sàng thanh toán
   - Đây là lúc PHẢI lock

4. **Race condition không đáng ngại**
   - Xác suất thấp (< 5%)
   - Có validation + error handling
   - UX vẫn acceptable

### **Action Plan:**

#### **Week 1: Immediate (Option 3 + Improvements)** ✅

- [ ] Filter `status = 'AVAILABLE'` trong API containers
- [ ] Thêm validation khi checkout
- [ ] Frontend error handling với retry UX
- [ ] Testing: Concurrent checkout scenarios

**Effort:** 2 giờ  
**Impact:** Giải quyết 95% vấn đề

#### **Week 2-3: Enhancement (Option 4)** 🚀

- [ ] Migration: Thêm `in_cart_of_user_ids`
- [ ] API: Update tracking khi add/remove cart
- [ ] Frontend: Warning badge "X người đang chọn"
- [ ] Analytics: Track race condition frequency

**Effort:** 1-2 ngày  
**Impact:** UX tốt hơn, minh bạch hơn

#### **Future (Option 1 - If Needed)** 🔮

- [ ] Chỉ implement nếu:
  - Analytics cho thấy race condition > 10%
  - Business yêu cầu strict reservation
  - Có dedicated resource maintain

**Effort:** 5-7 ngày  
**Impact:** Đảm bảo 100% nhưng trade-off phức tạp

---

## 📊 METRICS ĐỂ ĐÁNH GIÁ

Track các metrics sau để quyết định có cần nâng cấp:

```typescript
// 1. Race Condition Rate
const raceConditions = orders.filter(o => 
  o.status === 'FAILED' && 
  o.error === 'CONTAINERS_NOT_AVAILABLE'
).length;

const raceConditionRate = raceConditions / totalCheckouts;
// Nếu > 10% → Cân nhắc Option 1

// 2. Time to Checkout
const avgTimeToCheckout = 
  sum(cart.created_at → order.created_at) / totalOrders;
// Nếu < 5 phút → Timeout quá ngắn

// 3. Cart Abandonment Rate
const abandonmentRate = abandonedCarts / totalCarts;
// Nếu > 80% → Lock ở cart là lãng phí

// 4. Concurrent Buyers
const concurrentBuyers = 
  buyers_viewing_same_listing_at_same_time;
// Nếu cao → Cần warning (Option 4)
```

---

**📅 Ngày phân tích:** 10 Nov 2025  
**🎯 Quyết định:** Lock ở ORDER, không lock ở CART/RFQ  
**⭐ Khuyến nghị:** Triển khai Option 3 ngay, nâng cấp Option 4 sau  
**🔧 Effort:** 2 giờ (Option 3) → 1-2 ngày (Option 4)  
**✅ Priority:** HIGH - Cần làm ngay để improve UX

---

## 🔗 TÀI LIỆU LIÊN QUAN

1. `UX-BUYER-CHON-CONTAINER.md` - UX flow chọn container
2. `VAN-DE-HIEN-THI-CONTAINER.md` - Vấn đề hiển thị container theo status
3. `VAN-DE-TRU-SO-LUONG-CONTAINER.md` - Logic trừ số lượng khi đặt hàng
4. `backend/src/lib/inventory/inventory-service.ts` - Service quản lý inventory
5. `backend/src/routes/orders.ts` - Logic tạo order và lock containers
