# 📋 KIỂM TRA TRIỂN KHAI HỆ THỐNG

> **Ngày kiểm tra:** 10 Nov 2025  
> **Mục tiêu:** Đánh giá những gì đã triển khai và còn thiếu gì

---

## ✅ ĐÃ TRIỂN KHAI

### 1. **Database Schema** ✅

#### `listing_containers` table:
```prisma
model listing_containers {
  id                   String                      @id
  listing_id           String
  container_iso_code   String                      @unique
  shipping_line        String?
  manufactured_year    Int?
  status               ContainerInventoryStatus    @default(AVAILABLE)
  
  // ✅ Có fields reservation cho USER
  reserved_by          String?                     // User ID
  reserved_until       DateTime?
  
  // ✅ Có fields cho SOLD
  sold_to_order_id     String?
  sold_at              DateTime?
  
  // ✅ Có fields cho RENTAL
  rented_to_order_id   String?
  rented_at            DateTime?
  rental_return_date   DateTime?
  
  // ✅ Có delivery tracking
  delivery_status      String?                     @default("PENDING_PICKUP")
  scheduled_delivery_date DateTime?
  actual_delivery_date DateTime?
  
  created_at           DateTime                    @default(now())
  updated_at           DateTime                    @updatedAt
  
  // Relations
  listing              listings                    @relation(...)
  reserved_by_user     users?                      @relation(...)
  sold_order           orders?                     @relation(...)
  rented_order         orders?                     @relation(...)
}
```

**Status:** ✅ **HOÀN CHỈNH**  
**Enums:** `ContainerInventoryStatus = AVAILABLE | RESERVED | SOLD | RENTED`

---

### 2. **Cart API** ✅

**File:** `backend/src/routes/cart.ts`

#### Đã implement:
```typescript
✅ POST /api/v1/cart/items
   - Support selected_container_ids
   - Validate containers AVAILABLE
   - Validate quantity match
   - Merge containers khi update existing item

✅ GET /api/v1/cart
   - Include listing_containers data
   
✅ PUT /api/v1/cart/items/:id
   - Update quantity
   - Check availability

✅ DELETE /api/v1/cart/items/:id
   - Remove item from cart

✅ POST /api/v1/cart/checkout
   - Create orders/RFQs from cart
```

**Đặc điểm:**
- ❌ **KHÔNG LOCK containers** khi add to cart (đúng theo thiết kế)
- ✅ **Validate AVAILABLE** khi add
- ✅ Support chọn containers cụ thể (`selected_container_ids`)

**Status:** ✅ **HOÀN CHỈNH** (theo thiết kế không lock)

---

### 3. **RFQ API** ✅ (Partial)

**File:** `backend/src/routes/rfqs.ts`

#### Đã implement:
```typescript
✅ POST /api/v1/rfqs
   - Accept selected_container_ids
   - Validate containers exist
   - Validate containers AVAILABLE
   - Save selected_container_ids to RFQ
   
✅ GET /api/v1/rfqs
   - View sent/received RFQs
   
✅ GET /api/v1/rfqs/:id
   - Get RFQ details
```

**Vấn đề:** ❌ **CHƯA LOCK containers khi tạo RFQ**
```typescript
// Current: Chỉ validate, không lock
const unavailableContainers = containers.filter(c => c.status !== 'AVAILABLE');
if (unavailableContainers.length > 0) {
  return error; // ❌ Chỉ check, không update status
}

// Cần thêm: Lock containers
await prisma.listing_containers.updateMany({
  where: { id: { in: selected_container_ids } },
  data: {
    status: 'RESERVED',
    reserved_by_rfq_id: rfq.id,  // ❌ Field chưa có!
    reserved_until: new Date(...)
  }
});
```

**Status:** ⚠️ **THIẾU RFQ RESERVATION**

---

### 4. **Order API** ✅

**File:** `backend/src/routes/orders.ts`

#### Đã implement:
```typescript
✅ POST /api/v1/orders/from-listing
   - Support selected_container_ids
   - Lock containers: AVAILABLE → SOLD
   - Update sold_to_order_id, sold_at
   - Decrement available_quantity
   - Transaction để đảm bảo consistency

✅ POST /api/v1/orders/:id/cancel
   - ⚠️ CHƯA release containers (bug!)

✅ POST /api/v1/orders/:id/payment-verify
   - ⚠️ CHƯA release containers khi reject (bug!)
```

**Vấn đề đã biết (từ tài liệu VAN-DE-TRU-SO-LUONG-CONTAINER.md):**
- ❌ Cancel order không hoàn trả containers
- ❌ Payment rejection không hoàn trả containers

**Status:** ✅ **Lock containers OK**, ⚠️ **Release logic thiếu**

---

### 5. **Quote/Accept Quote API** ✅

**File:** `backend/src/routes/quotes.ts`

#### Đã implement:
```typescript
✅ POST /api/v1/quotes/:id/accept
   - Get selected_container_ids from RFQ
   - Create order
   - Lock containers: AVAILABLE → SOLD
   - (Nhưng nếu RFQ đã reserve thì nên: RESERVED → SOLD)
```

**Status:** ✅ **Hoạt động**, nhưng thiếu RFQ reservation logic

---

### 6. **Listing Containers API** ✅

**File:** `backend/src/routes/listings.ts`

#### Đã implement:
```typescript
✅ GET /api/v1/listings/:id/containers
   - Filter by status (có thể filter AVAILABLE only)
   - Return summary (available, reserved, sold, rented)
   - Include container details
```

**Status:** ✅ **HOÀN CHỈNH**

---

### 7. **Inventory Service** ✅

**File:** `backend/src/lib/inventory/inventory-service.ts`

#### Đã implement:
```typescript
✅ reserveInventory(orderId, listingId, quantity, containerIds)
   - Decrement available_quantity
   - Update containers: AVAILABLE → SOLD
   - For orders

✅ releaseInventory(orderId, listingId, quantity)
   - Increment available_quantity
   - Reset containers: SOLD → AVAILABLE
   - For cancel/reject

✅ confirmSale(orderId)
   - Final confirmation

✅ getInventoryStatus(listingId)
   - Get inventory stats

✅ verifyInventoryConsistency(listingId)
   - Check discrepancies
```

**Vấn đề:** ⚠️ Service này chỉ dùng cho **ORDER**, không hỗ trợ **RFQ reservation**

**Status:** ✅ **Hoạt động tốt cho Order**, ❌ **Chưa có cho RFQ**

---

## ❌ CHƯA TRIỂN KHAI

### 1. **RFQ Reservation System** 🔴 **CRITICAL**

#### Database Schema thiếu:
```sql
-- ❌ CHƯA CÓ: reserved_by_rfq_id field
ALTER TABLE listing_containers
  ADD COLUMN reserved_by_rfq_id TEXT;

-- ❌ CHƯA CÓ: Foreign key constraint
ALTER TABLE listing_containers
  ADD CONSTRAINT listing_containers_reserved_by_rfq_id_fkey
    FOREIGN KEY (reserved_by_rfq_id) REFERENCES rfqs(id) ON DELETE SET NULL;

-- ❌ CHƯA CÓ: Index
CREATE INDEX listing_containers_reserved_by_rfq_id_idx 
  ON listing_containers(reserved_by_rfq_id);
```

#### API Logic thiếu:
```typescript
// ❌ POST /api/v1/rfqs - Chưa lock containers
// Cần thêm:
await prisma.$transaction(async (tx) => {
  // 1. Create RFQ
  const rfq = await tx.rfqs.create({...});
  
  // 2. Reserve containers
  if (selected_container_ids && selected_container_ids.length > 0) {
    const reservedUntil = new Date();
    reservedUntil.setDate(reservedUntil.getDate() + 7);
    
    await tx.listing_containers.updateMany({
      where: {
        id: { in: selected_container_ids },
        status: 'AVAILABLE'
      },
      data: {
        status: 'RESERVED',
        reserved_by_rfq_id: rfq.id,
        reserved_until: reservedUntil
      }
    });
  }
  
  return rfq;
});
```

#### Background Job thiếu:
```typescript
// ❌ CHƯA CÓ: Auto-release expired RFQ reservations
async function releaseExpiredRFQReservations() {
  await prisma.listing_containers.updateMany({
    where: {
      status: 'RESERVED',
      reserved_by_rfq_id: { not: null },
      reserved_until: { lt: new Date() }
    },
    data: {
      status: 'AVAILABLE',
      reserved_by_rfq_id: null,
      reserved_until: null
    }
  });
}

// Schedule: Every hour
```

#### Release Logic thiếu:
```typescript
// ❌ Reject/Cancel RFQ → Release containers
// ❌ Quote timeout → Release containers
// ❌ Accept quote → RESERVED → SOLD (hiện tại là AVAILABLE → SOLD)
```

---

### 2. **Cart Validation Enhancement** 🟡 **SHOULD HAVE**

#### API cần cải thiện:
```typescript
// ⚠️ GET /api/v1/cart - Cần thêm warnings
async getCart(userId) {
  const cart = await prisma.carts.findUnique({
    where: { user_id: userId },
    include: {
      cart_items: {
        include: {
          listing: {
            include: {
              listing_containers: true
            }
          }
        }
      }
    }
  });

  // ❌ THIẾU: Check if selected containers still available
  cart.cart_items.forEach(item => {
    if (item.selected_container_ids) {
      const unavailable = item.selected_container_ids.filter(id => {
        const container = item.listing.listing_containers.find(c => c.id === id);
        return !container || container.status !== 'AVAILABLE';
      });
      
      if (unavailable.length > 0) {
        item.warnings = [`${unavailable.length} containers no longer available`];
        item.needs_reselection = true;
      }
    }
  });

  return cart;
}
```

#### Frontend cần:
```tsx
// ❌ CHƯA CÓ: Warning UI in cart
<CartItem item={item}>
  {item.needs_reselection && (
    <Alert variant="warning">
      ⚠️ Some containers are no longer available.
      <Button onClick={() => reselect()}>Choose again</Button>
    </Alert>
  )}
</CartItem>
```

---

### 3. **Seller RFQ Conflict Dashboard** 🟢 **NICE TO HAVE**

#### API cần tạo:
```typescript
// ❌ CHƯA CÓ: GET /api/v1/seller/rfqs/conflicts
async getRFQConflicts(sellerId) {
  // Find RFQs with overlapping containers
  const rfqs = await prisma.rfqs.findMany({
    where: {
      listings: { seller_user_id: sellerId },
      status: 'SUBMITTED'
    },
    include: { rfq_items: true }
  });

  // Detect conflicts
  const containerMap = new Map();
  rfqs.forEach(rfq => {
    rfq.selected_container_ids?.forEach(id => {
      if (!containerMap.has(id)) {
        containerMap.set(id, []);
      }
      containerMap.get(id).push(rfq.id);
    });
  });

  const conflicts = [];
  containerMap.forEach((rfqIds, containerId) => {
    if (rfqIds.length > 1) {
      conflicts.push({ containerId, rfqIds });
    }
  });

  return conflicts;
}
```

**Note:** Nếu implement RFQ Reservation, conflict này sẽ KHÔNG xảy ra!

---

### 4. **Release Containers on Cancel/Reject** 🔴 **CRITICAL**

#### Orders API cần fix:
```typescript
// ❌ POST /api/v1/orders/:id/cancel
// Cần thêm: Release containers + inventory
await prisma.$transaction(async (tx) => {
  // 1. Cancel order
  await tx.orders.update({
    where: { id },
    data: { status: 'CANCELLED' }
  });

  // 2. Release inventory
  await inventoryService.releaseInventory(
    order.id,
    order.listing_id,
    order.quantity
  );
});
```

#### Quotes API cần fix:
```typescript
// ❌ POST /api/v1/quotes/:id/reject
// Cần thêm: Release reserved containers từ RFQ
await prisma.$transaction(async (tx) => {
  // 1. Reject quote
  await tx.quotes.update({
    where: { id },
    data: { status: 'REJECTED' }
  });

  // 2. Release RFQ reservations
  await tx.listing_containers.updateMany({
    where: { reserved_by_rfq_id: quote.rfq_id },
    data: {
      status: 'AVAILABLE',
      reserved_by_rfq_id: null,
      reserved_until: null
    }
  });
});
```

---

### 5. **Frontend Container Selection UI** 🟡 **SHOULD HAVE**

#### Cần tạo components:
```tsx
// ❌ CHƯA CÓ: ContainerSelector component
<ContainerSelector
  listingId={listingId}
  onSelect={(containerIds) => setSelectedContainers(containerIds)}
/>

// ❌ CHƯA CÓ: Container status badges
<ContainerBadge status="AVAILABLE" />
<ContainerBadge status="RESERVED" />
<ContainerBadge status="SOLD" />

// ❌ CHƯA CÓ: Container list with checkboxes
<ContainerList>
  {containers.map(container => (
    <ContainerItem key={container.id}>
      <Checkbox 
        checked={isSelected(container.id)}
        disabled={container.status !== 'AVAILABLE'}
      />
      <span>{container.container_iso_code}</span>
      <Badge>{container.status}</Badge>
    </ContainerItem>
  ))}
</ContainerList>
```

**Location:** `frontend/components/containers/`

---

### 6. **Notifications** 🟢 **NICE TO HAVE**

#### Cần thêm notifications:
```typescript
// ❌ CHƯA CÓ: RFQ reservation expiring soon
// → Email/in-app notification: "Your RFQ will expire in 1 day"

// ❌ CHƯA CÓ: Seller quote reminder
// → Email: "You have pending RFQs to quote"

// ❌ CHƯA CÓ: Container availability change
// → Notify cart users: "Containers in your cart are no longer available"
```

---

### 7. **Admin Monitoring Dashboard** 🟢 **NICE TO HAVE**

#### Metrics cần track:
```typescript
// ❌ CHƯA CÓ: Reservation metrics
- Reservation rate
- Expiration rate
- Conflict rate
- Conversion rate (RFQ → Order)

// ❌ CHƯA CÓ: Inventory health
- Total containers
- Available vs Reserved vs Sold
- Stuck reservations (expired but not released)
```

---

## 🎯 ĐÁNH GIÁ TỔNG QUAN

### **Đã triển khai:** ✅

| Module | Status | Note |
|--------|--------|------|
| Database Schema | ✅ 90% | Thiếu `reserved_by_rfq_id` |
| Cart API | ✅ 100% | Hoàn chỉnh, không lock (đúng) |
| Listing Containers API | ✅ 100% | Hoàn chỉnh |
| Order Lock | ✅ 100% | Lock containers khi create order |
| Inventory Service | ✅ 95% | Hoàn chỉnh cho Order, thiếu cho RFQ |
| RFQ API | ✅ 70% | Có validate, thiếu lock |

### **Chưa triển khai:** ❌

| Module | Priority | Effort | Impact |
|--------|----------|--------|--------|
| **RFQ Reservation** | 🔴 CRITICAL | 4-5 ngày | Giải quyết conflict |
| **Release on Cancel** | 🔴 CRITICAL | 1 ngày | Fix inventory bug |
| **Cart Warning** | 🟡 IMPORTANT | 1-2 ngày | Better UX |
| **Background Job** | 🟡 IMPORTANT | 1 ngày | Auto-cleanup |
| **Frontend UI** | 🟡 IMPORTANT | 2-3 ngày | Container selection |
| **Conflict Dashboard** | 🟢 NICE | 1 ngày | Seller tool |
| **Notifications** | 🟢 NICE | 2 ngày | Engagement |

---

## 📋 ROADMAP ĐỀ XUẤT

### **Week 1: Critical Fixes** 🔴

**Mục tiêu:** Sửa bugs nghiêm trọng

#### Day 1-2: Database Migration
```bash
# 1. Add reserved_by_rfq_id field
cd backend
npx prisma migrate dev --name add_rfq_reservation
```

```sql
-- Migration file
ALTER TABLE listing_containers
  ADD COLUMN reserved_by_rfq_id TEXT;

ALTER TABLE listing_containers
  ADD CONSTRAINT listing_containers_reserved_by_rfq_id_fkey
    FOREIGN KEY (reserved_by_rfq_id) REFERENCES rfqs(id) ON DELETE SET NULL;

CREATE INDEX listing_containers_reserved_by_rfq_id_idx 
  ON listing_containers(reserved_by_rfq_id);
```

#### Day 3-4: RFQ Reservation Logic
- [ ] Update `POST /api/v1/rfqs` → Lock containers
- [ ] Update `POST /api/v1/quotes/:id/accept` → RESERVED → SOLD
- [ ] Update `POST /api/v1/quotes/:id/reject` → Release containers
- [ ] Add transaction với `FOR UPDATE NOWAIT` để tránh race condition

#### Day 5: Release Logic
- [ ] Fix `POST /api/v1/orders/:id/cancel` → Release inventory
- [ ] Fix `POST /api/v1/orders/:id/payment-verify` (reject) → Release
- [ ] Testing toàn diện

**Deliverables:**
- ✅ RFQ reservation hoạt động
- ✅ Không có conflict
- ✅ Cancel/reject release đúng

---

### **Week 2: Background Jobs & Validation** 🟡

#### Day 1-2: Background Job
- [ ] Create `releaseExpiredRFQReservations()` function
- [ ] Schedule với node-cron hoặc pm2 cron
- [ ] Add logging và monitoring

```typescript
// backend/src/jobs/release-expired-reservations.ts
import cron from 'node-cron';
import prisma from '../lib/prisma.js';

// Run every hour
cron.schedule('0 * * * *', async () => {
  console.log('🔄 Running expired reservation cleanup...');
  
  const result = await prisma.listing_containers.updateMany({
    where: {
      status: 'RESERVED',
      reserved_by_rfq_id: { not: null },
      reserved_until: { lt: new Date() }
    },
    data: {
      status: 'AVAILABLE',
      reserved_by_rfq_id: null,
      reserved_until: null
    }
  });
  
  console.log(`✅ Released ${result.count} expired reservations`);
});
```

#### Day 3-4: Cart Validation
- [ ] Update `GET /api/v1/cart` → Check container availability
- [ ] Add warnings field
- [ ] Frontend cart page → Show warnings

#### Day 5: Testing
- [ ] Test concurrent RFQ creation
- [ ] Test expiration cleanup
- [ ] Test cart warnings
- [ ] Load testing

**Deliverables:**
- ✅ Auto-cleanup hoạt động
- ✅ Cart validation tốt hơn

---

### **Week 3: Frontend UI** 🟢

#### Day 1-3: Container Selection Components
- [ ] Create `ContainerSelector` component
- [ ] Create `ContainerList` component
- [ ] Create `ContainerBadge` component
- [ ] Integrate vào Listing Detail page

#### Day 4-5: RFQ & Cart UI
- [ ] RFQ creation modal với container selection
- [ ] Cart page với container warnings
- [ ] Error handling improvements

**Deliverables:**
- ✅ UI/UX hoàn chỉnh

---

### **Week 4: Polish & Monitoring** 🟢

#### Day 1-2: Notifications
- [ ] RFQ expiry reminder (email + in-app)
- [ ] Seller quote reminder
- [ ] Container availability change notification

#### Day 3-4: Admin Dashboard
- [ ] Reservation metrics
- [ ] Inventory health dashboard
- [ ] Conflict detection tool (if needed)

#### Day 5: Documentation
- [ ] API documentation update
- [ ] User guide
- [ ] Deployment guide

**Deliverables:**
- ✅ Production-ready system

---

## 🚨 PRIORITIZATION

### **Must Do (Week 1):** 🔴
1. RFQ Reservation System
2. Release on Cancel/Reject
3. Database Migration

**Impact:** Giải quyết conflict, fix inventory bugs

### **Should Do (Week 2):** 🟡
1. Background Job
2. Cart Validation
3. Testing

**Impact:** Automation, better UX

### **Nice to Have (Week 3-4):** 🟢
1. Frontend UI Polish
2. Notifications
3. Admin Dashboard

**Impact:** Enhanced UX, monitoring

---

## 📊 COMPLIANCE CHECK

Theo phân tích trong `PHAN-TICH-AN-CONTAINER-KHI-CHON.md`:

| Requirement | Current Status | Action Needed |
|-------------|----------------|---------------|
| Cart không lock | ✅ Đúng | None |
| RFQ phải lock | ❌ Chưa có | **Week 1** |
| Order phải lock | ✅ Đúng | None |
| FIFO principle | ❌ Chưa có | **Week 1** (RFQ reservation) |
| Auto-cleanup | ❌ Chưa có | **Week 2** |
| Seller không phải manage conflict | ❌ Chưa có | **Week 1** (RFQ reservation) |

---

## ✅ CHECKLIST TRIỂN KHAI

### **Phase 1: Critical (Week 1)** 🔴

- [ ] **Database Migration**
  - [ ] Add `reserved_by_rfq_id` field
  - [ ] Add foreign key constraint
  - [ ] Add index
  - [ ] Run migration on production

- [ ] **RFQ Reservation API**
  - [ ] Update `POST /api/v1/rfqs`
  - [ ] Add transaction lock (FOR UPDATE)
  - [ ] Update containers status → RESERVED
  - [ ] Set reserved_until (7 days default)

- [ ] **Release Logic**
  - [ ] Fix `POST /api/v1/orders/:id/cancel`
  - [ ] Fix `POST /api/v1/orders/:id/payment-verify`
  - [ ] Add `POST /api/v1/rfqs/:id/cancel`
  - [ ] Update `POST /api/v1/quotes/:id/reject`

- [ ] **Accept Quote Update**
  - [ ] Update `POST /api/v1/quotes/:id/accept`
  - [ ] RESERVED → SOLD (instead of AVAILABLE → SOLD)

- [ ] **Testing**
  - [ ] Concurrent RFQ creation
  - [ ] Conflict detection
  - [ ] Release on cancel/reject
  - [ ] Integration tests

### **Phase 2: Important (Week 2)** 🟡

- [ ] **Background Job**
  - [ ] Create cleanup function
  - [ ] Schedule with cron
  - [ ] Add logging
  - [ ] Monitor execution

- [ ] **Cart Validation**
  - [ ] Update `GET /api/v1/cart`
  - [ ] Add container availability check
  - [ ] Add warnings field
  - [ ] Frontend warning UI

- [ ] **API Enhancements**
  - [ ] GET /api/v1/listings/:id/containers (filter only AVAILABLE)
  - [ ] GET /api/v1/seller/rfqs/stats
  - [ ] Error handling improvements

### **Phase 3: Nice to Have (Week 3-4)** 🟢

- [ ] **Frontend Components**
  - [ ] ContainerSelector
  - [ ] ContainerList
  - [ ] ContainerBadge
  - [ ] Cart warnings UI

- [ ] **Notifications**
  - [ ] RFQ expiry reminder
  - [ ] Seller quote reminder
  - [ ] Container availability change

- [ ] **Admin Dashboard**
  - [ ] Reservation metrics
  - [ ] Inventory health
  - [ ] Manual override tools

---

## 📝 KẾT LUẬN

### **Tình trạng hiện tại:**

**Điểm mạnh:** ✅
- Cart API hoàn chỉnh
- Order lock hoạt động tốt
- Database schema 90% ready
- Inventory Service robust

**Điểm yếu:** ❌
- **RFQ không lock containers** → Conflict xảy ra
- **Cancel/Reject không release** → Inventory leakage
- Không có background cleanup
- Frontend UI chưa có container selection

### **Rủi ro hiện tại:**

🔴 **HIGH:**
- 2 buyers có thể chọn cùng container trong RFQ
- Seller phải xử lý conflict manual
- Inventory bị leak khi cancel order

🟡 **MEDIUM:**
- Expired reservations không được cleanup
- Cart không warning khi container hết
- UX không tốt (không thấy container status)

🟢 **LOW:**
- Thiếu notifications
- Thiếu admin monitoring

### **Khuyến nghị:**

⭐ **TRIỂN KHAI NGAY WEEK 1** ⭐

RFQ Reservation System là **CRITICAL** để:
1. Giải quyết conflict
2. Đảm bảo công bằng (FIFO)
3. Giảm workload cho seller
4. Improve UX cho buyer

**Estimate:**
- Week 1: 5 ngày (Critical)
- Week 2: 5 ngày (Important)
- Week 3-4: 10 ngày (Nice to have)

**Total:** 20 ngày work (1 tháng calendar time)

---

**📅 Ngày tạo:** 10 Nov 2025  
**👤 Phân tích bởi:** GitHub Copilot  
**🎯 Next Action:** Bắt đầu Database Migration (Week 1, Day 1)
