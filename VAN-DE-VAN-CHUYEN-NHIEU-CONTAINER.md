# 🚚 PHÂN TÍCH: VẤN ĐỀ VẬN CHUYỂN NHIỀU CONTAINER

## 📊 Tổng Quan Vấn Đề

### 🎯 Vấn Đề Cốt Lõi
Khi người mua mua **nhiều container trong 1 đơn hàng** (ví dụ: 5 containers), họ **không thể vận chuyển tất cả cùng lúc** do:
- **Giới hạn vật lý:** Một xe tải thường chỉ chở được 1-2 container
- **Chi phí cao:** Thuê nhiều xe cùng lúc tốn kém
- **Logistics phức tạp:** Khó sắp xếp nhiều tài xế, nhiều xe cùng thời điểm
- **Nhu cầu thực tế:** Buyer có thể muốn nhận từng container theo lịch trình khác nhau

### ⚠️ Hệ Quả Nếu Không Xử Lý
1. **Trải nghiệm người dùng kém:** Buyer không thể lên kế hoạch vận chuyển linh hoạt
2. **Tắc nghẽn logistics:** Tất cả container phải chờ nhau
3. **Chi phí tăng cao:** Phải thuê nhiều xe cùng lúc
4. **Rủi ro kinh doanh:** Đơn hàng lớn bị delay do 1 container gặp vấn đề

---

## ✅ RÀ SOÁT DỰ ÁN HIỆN TẠI (Ngày 8/11/2025)

### 🔍 ĐÃ CÓ SẴN (Implemented ✅)

#### 1. Database Schema
- ✅ **Bảng `listing_containers`** - Đã tồn tại từ migration `20251106_add_listing_containers`
  - Lưu danh sách container IDs cho mỗi listing
  - Track status: AVAILABLE, RESERVED, SOLD, RENTED
  - Relations với orders (sold_to_order_id, rented_to_order_id)
  - **Có sẵn:** container_iso_code, shipping_line, manufactured_year, status
  - **THIẾU:** Không có relation với deliveries

- ✅ **Bảng `deliveries`** - Đã tồn tại từ ban đầu
  - Thông tin chuyến hàng đầy đủ
  - Có: carrier, driver, tracking, address, dates, fees
  - Relations: 1 order → many deliveries
  - **THIẾU:** Không biết delivery chở containers nào

- ✅ **Bảng `orders`** - Đã hoàn chỉnh
  - Relations đầy đủ với deliveries, order_items
  - Support order từ listing với selected_container_ids

#### 2. Backend API
- ✅ **POST /orders/from-listing** - Đã support chọn containers
  ```typescript
  selected_container_ids?: string[]; // Line 27, 633
  ```
  - Validate containers exist và AVAILABLE
  - Mark containers as SOLD khi tạo order
  - Decrement available_quantity

- ✅ **POST /orders/:id/book-transportation** - Đã có (line ~2998)
  - Buyer đặt vận chuyển
  - Tạo 1 delivery record cho order
  - **VẤN ĐỀ:** Không cho phép chọn containers nào để vận chuyển

#### 3. Migration History
- ✅ `20251106_add_listing_containers` - Tạo bảng listing_containers
- ✅ `20251107_add_container_inventory_status_enum` - Add enum status
- ✅ `20251107_add_deleted_at_to_listing_containers` - Soft delete
- ✅ `20251107_add_manufactured_year_to_listing_containers` - Add year
- ✅ `20251108_add_selected_container_ids` - Add field to orders

---

### ❌ CHƯA CÓ (Missing - Cần Implement)

#### 1. Database
- ❌ **Bảng `delivery_containers`** - Junction table chưa tồn tại
- ❌ **Fields trong `deliveries`**:
  - `batch_number` (để track Batch 1/3, 2/3, 3/3)
  - `total_batches`
  - `containers_count`
  - `is_partial_delivery`
- ❌ **Fields trong `listing_containers`**:
  - `delivery_status` (PENDING_PICKUP, SCHEDULED, IN_TRANSIT, DELIVERED)
  - `scheduled_delivery_date`
  - `actual_delivery_date`

#### 2. Backend API
- ❌ **POST /orders/:id/schedule-delivery-batch** - API mới
  - Cho phép chọn containers để vận chuyển
  - Tạo delivery với container selection
  - Track batch number
  
- ❌ **GET /orders/:id/delivery-schedule** - API mới
  - Xem toàn bộ lịch vận chuyển
  - Group containers by delivery
  - Show progress: delivered/in-transit/scheduled/pending

#### 3. Frontend Components
- ❌ **ScheduleDeliveryModal** component
- ❌ **DeliveryScheduleView** component
- ❌ UI để chọn containers

---

### 🎯 KẾT LUẬN RÀ SOÁT

**Hiện trạng dự án:**
```
Foundation Layer (Database & Basic APIs): 70% ✅
├── listing_containers table: ✅ Đã có
├── deliveries table: ✅ Đã có  
├── Order creation with containers: ✅ Đã có
└── Basic delivery booking: ✅ Đã có (nhưng chưa đủ)

Partial Delivery Feature: 0% ❌
├── delivery_containers junction table: ❌ Chưa có
├── Batch tracking fields: ❌ Chưa có
├── Schedule delivery batch API: ❌ Chưa có
├── Delivery schedule view API: ❌ Chưa có
└── Frontend UI/UX: ❌ Chưa có
```

**Đánh giá:**
- ✅ **Nền tảng tốt:** Database schema cơ bản đã đủ
- ✅ **API flow:** Order creation với container selection đã hoạt động
- ❌ **Thiếu:** Junction table để link containers ↔️ deliveries
- ❌ **Thiếu:** APIs để schedule/view delivery theo batch
- ❌ **Thiếu:** UI để người dùng tương tác

**Phân tích tôi đưa ra là MỚI 100%** - dựa trên:
1. Rà soát code hiện tại
2. Phát hiện gap (missing pieces)
3. Đề xuất giải pháp hoàn chỉnh

**Điểm mạnh của dự án hiện tại:**
- ✅ Đã có foundation rất tốt với `listing_containers`
- ✅ Order flow đã support chọn containers cụ thể
- ✅ Delivery system đã có cấu trúc cơ bản
- ✅ API `/orders/from-listing` đã handle `selected_container_ids`

**Điều cần bổ sung:**
- ❌ Junction table `delivery_containers` (core missing piece)
- ❌ Batch tracking system
- ❌ APIs để manage partial deliveries
- ❌ UI/UX components

**Ước tính công việc còn lại:**
```
Phase 1: Database (1-2 ngày)
  ├── Tạo delivery_containers table
  ├── Add batch fields vào deliveries
  └── Add delivery tracking fields vào listing_containers

Phase 2: Backend (2-3 ngày)
  ├── API schedule-delivery-batch
  ├── API delivery-schedule
  ├── Update existing book-transportation (optional)
  └── Testing

Phase 3: Frontend (2-3 ngày)
  ├── ScheduleDeliveryModal component
  ├── DeliveryScheduleView component
  └── Integration with order page

Phase 4: QA & Deploy (1-2 ngày)
```

**Tổng thời gian:** ~6-10 ngày development

---

## 🔍 Phân Tích Kiến Trúc Hiện Tại

### 1. Database Schema

#### Model `orders`
```prisma
model orders {
  id                String      @id
  buyer_id          String
  seller_id         String
  listing_id        String?
  status            OrderStatus @default(CREATED)
  // ... other fields
  
  // Relations
  deliveries        deliveries[]  // ✅ Quan hệ 1-nhiều (ĐÃ ĐÚNG)
  order_items       order_items[] // ✅ Có thể có nhiều items
}
```

**✅ Quan hệ đúng:** 1 Order có thể có **nhiều Deliveries**

#### Model `deliveries` (HIỆN TẠI - ĐÃ TỒN TẠI)
```prisma
model deliveries {
  id                     String            @id
  order_id               String            // ✅ FK về 1 order (1 order có thể có nhiều deliveries)
  pickup_depot_id        String?
  dropoff_address        String
  status                 DeliveryStatus    @default(PENDING)
  tracking_number        String?
  carrier_name           String?
  driver_info_json       Json?
  estimated_delivery     DateTime?
  actual_delivery        DateTime?
  delivery_date          DateTime?
  delivery_phone         String?
  needs_crane            Boolean           @default(false)
  transportation_fee     Decimal?
  delivery_method        DeliveryMethod    @default(logistics)
  logistics_company      String?
  // ... ~30+ fields khác
  
  orders                 orders            @relation(fields: [order_id], references: [id])
  delivery_events        delivery_events[] // ✅ Track từng event của delivery
}
```

**💡 HIỆN TRẠNG:**
- ✅ **Đã có:** Bảng `deliveries` đã tồn tại với đầy đủ thông tin vận chuyển
- ✅ **Đã support:** 1 Order có thể có nhiều Deliveries (relation 1-nhiều đã đúng)
- ✅ **Đầy đủ fields:** Có sẵn carrier, driver, tracking, address, date, etc.

**❌ VẤN ĐỀ CHÍNH:** 
Bảng `deliveries` chỉ lưu thông tin **về chuyến hàng** (shipment), KHÔNG lưu:
- Delivery này chở **container nào cụ thể**? (chỉ biết order_id, không biết container_ids)
- Có bao nhiêu containers trong delivery này?
- Container X đã được giao chưa? Container Y còn ở depot?
- Container Z bị delay, còn lại đã giao → làm sao track riêng?

**🔍 VÍ DỤ THỰC TÊ:**
```
Order #12345: Mua 10 containers
├── Delivery #1 (batch 1): ??? containers  ❌ KHÔNG BIẾT CONTAINER NÀO
├── Delivery #2 (batch 2): ??? containers  ❌ KHÔNG BIẾT CONTAINER NÀO
└── Delivery #3 (batch 3): ??? containers  ❌ KHÔNG BIẾT CONTAINER NÀO

→ Biết có 3 deliveries nhưng không biết container nào thuộc delivery nào!
```

#### Model `listing_containers` (HIỆN TẠI)
```prisma
model listing_containers {
  id                   String                      @id
  listing_id           String
  container_iso_code   String                      @unique
  status               ContainerInventoryStatus    @default(AVAILABLE)
  sold_to_order_id     String?
  sold_at              DateTime?
  rented_to_order_id   String?
  rented_at            DateTime?
  // ❌ THIẾU: delivered_by_delivery_id (không biết container thuộc delivery nào)
  // ❌ THIẾU: delivery_status (không biết container đã giao chưa)
  // ❌ THIẾU: estimated_delivery_date
  
  sold_order           orders?  @relation("listing_containers_sold_order", ...)
  rented_order         orders?  @relation("listing_containers_rented_order", ...)
  // ❌ THIẾU: relation với deliveries
}
```

**❌ VẤN ĐỀ:** Không có cách nào để:
- Track container nào thuộc delivery nào
- Biết container đã được giao hay chưa
- Lên lịch vận chuyển cho từng container

---

### 💡 GIẢI PHÁP: Bảng `delivery_containers` MỚI (Junction Table)

**🎯 MỤC ĐÍCH:**
Bảng `delivery_containers` là **bảng trung gian (junction table)** để kết nối:
- `deliveries` (chuyến hàng) ↔️ `listing_containers` (container cụ thể)
- Quan hệ **Many-to-Many**: 1 delivery có nhiều containers, 1 container có thể có nhiều deliveries (nếu giao lại)

```prisma
// 🆕 NEW: Junction table
model delivery_containers {
  id                   String    @id
  delivery_id          String    // FK → deliveries
  container_id         String    // FK → listing_containers
  container_iso_code   String    // Denormalized for quick query
  
  // 🆕 Track từng container riêng lẻ trong delivery
  pickup_date          DateTime? // Ngày lấy container này từ depot
  loaded_at            DateTime? // Thời điểm xếp lên xe
  delivered_at         DateTime? // Thời điểm giao container này
  received_by          String?   // Người nhận container này
  signature_url        String?   // Chữ ký xác nhận nhận hàng
  condition_notes      String?   // Tình trạng container khi giao
  photos_json          Json?     // Ảnh chụp khi giao hàng
  
  created_at           DateTime  @default(now())
  updated_at           DateTime  @updatedAt
  
  // Relations
  delivery             deliveries           @relation(fields: [delivery_id], references: [id], onDelete: Cascade)
  listing_container    listing_containers   @relation(fields: [container_id], references: [id], onDelete: Cascade)
  
  @@unique([delivery_id, container_id]) // Mỗi container chỉ xuất hiện 1 lần trong 1 delivery
}
```

**✅ LỢI ÍCH:**
1. **Liên kết rõ ràng:** Biết chính xác container nào thuộc delivery nào
2. **Track độc lập:** Mỗi container có timestamp riêng (pickup, loaded, delivered)
3. **Proof of Delivery:** Lưu chữ ký, ảnh, ghi chú cho từng container
4. **Query dễ dàng:**
   ```sql
   -- Tìm tất cả containers trong delivery #123
   SELECT * FROM delivery_containers WHERE delivery_id = '123';
   
   -- Tìm delivery của container ABCD1234567
   SELECT * FROM delivery_containers WHERE container_iso_code = 'ABCD1234567';
   
   -- Containers đã giao trong order #456
   SELECT * FROM delivery_containers dc
   JOIN deliveries d ON dc.delivery_id = d.id
   WHERE d.order_id = '456' AND dc.delivered_at IS NOT NULL;
   ```

---

## 📊 SO SÁNH TRỰC QUAN

### Trước (KHÔNG có `delivery_containers`):
```
┌─────────────────────────────────────────────────────────────┐
│ Order #12345: 10 containers                                 │
├─────────────────────────────────────────────────────────────┤
│ Deliveries:                                                 │
│   ├── Delivery #1: status=DELIVERED, date=2025-11-10       │
│   ├── Delivery #2: status=IN_TRANSIT, date=2025-11-12      │
│   └── Delivery #3: status=SCHEDULED, date=2025-11-15       │
│                                                             │
│ ❌ KHÔNG BIẾT: Container nào thuộc delivery nào?           │
│ ❌ KHÔNG TRACK: Container X đã giao? Container Y đâu?      │
└─────────────────────────────────────────────────────────────┘
```

### Sau (CÓ `delivery_containers`):
```
┌─────────────────────────────────────────────────────────────┐
│ Order #12345: 10 containers                                 │
├─────────────────────────────────────────────────────────────┤
│ Delivery #1 (Batch 1/3) - DELIVERED                        │
│   ├── Container ABCD1234567 ✅ Delivered 2025-11-10 09:30 │
│   ├── Container EFGH2345678 ✅ Delivered 2025-11-10 09:32 │
│   ├── Container IJKL3456789 ✅ Delivered 2025-11-10 09:35 │
│   └── Container MNOP4567890 ✅ Delivered 2025-11-10 09:38 │
│                                                             │
│ Delivery #2 (Batch 2/3) - IN_TRANSIT                       │
│   ├── Container QRST5678901 🚚 Picked up 2025-11-12 08:00 │
│   ├── Container UVWX6789012 🚚 Picked up 2025-11-12 08:05 │
│   └── Container YZAB7890123 🚚 Picked up 2025-11-12 08:10 │
│                                                             │
│ Delivery #3 (Batch 3/3) - SCHEDULED                        │
│   ├── Container CDEF8901234 📅 Scheduled 2025-11-15        │
│   ├── Container GHIJ9012345 📅 Scheduled 2025-11-15        │
│   └── Container KLMN0123456 📅 Scheduled 2025-11-15        │
│                                                             │
│ ✅ BIẾT CHÍNH XÁC: Container nào, ở đâu, giao lúc nào     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 TÓM TẮT KHÁC BIỆT

| Aspect | `deliveries` (Hiện tại) | `delivery_containers` (Mới) |
|--------|------------------------|----------------------------|
| **Loại bảng** | Main table - Thông tin chuyến hàng | Junction table - Liên kết container ↔️ delivery |
| **Mục đích** | Lưu thông tin về **chuyến vận chuyển** (carrier, driver, route, fee, etc.) | Lưu **container nào** thuộc **delivery nào** |
| **Dữ liệu** | Metadata về shipment (địa chỉ, ngày giờ, phí, tracking) | Container-specific data (pickup time, delivered time, signature) |
| **Granularity** | Delivery-level (toàn chuyến hàng) | Container-level (từng container riêng lẻ) |
| **Relation** | 1 delivery → 1 order | 1 delivery → Many containers |
| **Đã tồn tại?** | ✅ Đã có sẵn | ❌ Cần tạo mới |
| **Cần thiết?** | ✅ Bắt buộc (core table) | ✅ Bắt buộc (để track containers) |

**💡 QUAN HỆ:**
```
orders (1) ──→ (many) deliveries (1) ──→ (many) delivery_containers (many) ──→ (1) listing_containers
```

1. **Order** (đơn hàng): "Mua 10 containers"
2. **Deliveries** (các chuyến hàng): "Chia làm 3 chuyến"
3. **Delivery_containers** (chi tiết container): "Chuyến 1 chở containers A, B, C, D"
4. **Listing_containers** (container thực tế): "Container A = ABCD1234567"

---

## ⚡ QUICK ANSWER

**Q: Deliveries đã có rồi, tại sao cần thêm delivery_containers?**

**A: Vì `deliveries` chỉ biết "CÓ MỘT CHUYẾN HÀNG", không biết "CHUYẾN ĐÓ CHỞ CONTAINER NÀO"**

Ví dụ thực tế:
```javascript
// ❌ CHỈ CÓ deliveries: Không biết container nào
const delivery = {
  id: 'del-123',
  order_id: 'order-456',
  status: 'IN_TRANSIT',
  carrier: 'Vietnam Logistics',
  tracking: 'VL123456'
  // ??? Chuyến này chở containers nào? → KHÔNG BIẾT!
}

// ✅ CÓ delivery_containers: Biết rõ từng container
const deliveryWithContainers = {
  id: 'del-123',
  order_id: 'order-456',
  status: 'IN_TRANSIT',
  carrier: 'Vietnam Logistics',
  tracking: 'VL123456',
  containers: [ // ← Từ bảng delivery_containers
    { isoCode: 'ABCD1234567', deliveredAt: '2025-11-10 09:30' },
    { isoCode: 'EFGH2345678', deliveredAt: '2025-11-10 09:32' },
    { isoCode: 'IJKL3456789', deliveredAt: '2025-11-10 09:35' }
  ]
}
```

**Kết luận:** 
- `deliveries` = Thông tin về **chuyến hàng** (đã có ✅)
- `delivery_containers` = **Container nào** trong **chuyến hàng đó** (cần thêm ❌)
- Hai bảng này **bổ trợ cho nhau**, KHÔNG thay thế!

---

### 2. API Hiện Tại

#### POST `/orders/:id/book-transportation` - Đặt Vận Chuyển
**Location:** `backend/src/routes/orders.ts` (dòng ~2990-3130)

```typescript
fastify.post<{
  Params: { id: string },
  Body: {
    deliveryAddress: string,
    deliveryContact: string,
    deliveryPhone: string,
    deliveryDate: string,
    deliveryTime?: string,
    needsCrane?: boolean,
    specialInstructions?: string,
    transportationFee?: number,
    deliveryMethod?: string,
    logisticsCompany?: string
  }
}>('/:id/book-transportation', ...);
```

**❌ VẤN ĐỀ:**
1. **Chỉ tạo 1 delivery cho cả order:**
   ```typescript
   const delivery = await prisma.deliveries.create({
     data: {
       id: randomUUID(),
       order_id: order.id,  // ❌ 1 delivery cho toàn bộ order
       delivery_address: deliveryAddress,
       // ... không chỉ định container nào
     }
   });
   ```

2. **Không cho phép chọn container:**
   - Không có param `container_ids` trong request body
   - Không có validation số lượng container
   - Không có logic split containers thành nhiều deliveries

3. **Update toàn bộ order status:**
   ```typescript
   await prisma.orders.update({
     where: { id },
     data: {
       status: 'TRANSPORTATION_BOOKED',  // ❌ Toàn bộ order
       updated_at: new Date()
     }
   });
   ```

---

## 🎯 Giải Pháp Chi Tiết

### Solution 1: Thêm Container Tracking vào Deliveries

#### 1.1. Database Migration

**File:** `backend/prisma/migrations/XXX_add_delivery_containers.sql`

```sql
-- 1. Add new table to track which containers are in which delivery
CREATE TABLE IF NOT EXISTS delivery_containers (
  id TEXT PRIMARY KEY,
  delivery_id TEXT NOT NULL,
  container_id TEXT NOT NULL,  -- Reference to listing_containers.id
  container_iso_code TEXT NOT NULL,
  pickup_date DATE,
  loaded_at TIMESTAMP,
  delivered_at TIMESTAMP,
  received_by TEXT,
  signature_url TEXT,
  condition_notes TEXT,
  photos_json JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_delivery FOREIGN KEY (delivery_id) 
    REFERENCES deliveries(id) ON DELETE CASCADE,
  CONSTRAINT fk_listing_container FOREIGN KEY (container_id) 
    REFERENCES listing_containers(id) ON DELETE CASCADE,
  
  UNIQUE(delivery_id, container_id)
);

CREATE INDEX idx_delivery_containers_delivery_id ON delivery_containers(delivery_id);
CREATE INDEX idx_delivery_containers_container_id ON delivery_containers(container_id);
CREATE INDEX idx_delivery_containers_iso_code ON delivery_containers(container_iso_code);

-- 2. Add delivery tracking fields to listing_containers
ALTER TABLE listing_containers 
  ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'PENDING_PICKUP',
  ADD COLUMN IF NOT EXISTS scheduled_delivery_date DATE,
  ADD COLUMN IF NOT EXISTS actual_delivery_date DATE,
  ADD COLUMN IF NOT EXISTS delivery_notes TEXT;

-- 3. Add batch info to deliveries table
ALTER TABLE deliveries
  ADD COLUMN IF NOT EXISTS batch_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_batches INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS containers_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_partial_delivery BOOLEAN DEFAULT FALSE;

-- 4. Create enum for delivery_status
CREATE TYPE delivery_container_status AS ENUM (
  'PENDING_PICKUP',
  'SCHEDULED',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
  'DELAYED',
  'FAILED'
);

-- 5. Add comment for clarity
COMMENT ON TABLE delivery_containers IS 'Tracks which specific containers are assigned to which delivery shipment';
COMMENT ON COLUMN deliveries.batch_number IS 'Sequential batch number for multi-batch deliveries (Batch 1/3, 2/3, etc.)';
COMMENT ON COLUMN deliveries.is_partial_delivery IS 'TRUE if this delivery is part of multiple shipments for the same order';
```

#### 1.2. Update Prisma Schema

**File:** `backend/prisma/schema.prisma`

```prisma
model deliveries {
  id                     String                  @id
  order_id               String
  // ... existing fields ...
  
  // 🆕 NEW: Batch tracking
  batch_number           Int?                    @default(1)
  total_batches          Int?                    @default(1)
  containers_count       Int?                    @default(0)
  is_partial_delivery    Boolean?                @default(false)
  
  // Relations
  orders                 orders                  @relation(fields: [order_id], references: [id])
  delivery_events        delivery_events[]
  delivery_containers    delivery_containers[]   // 🆕 NEW
}

// 🆕 NEW: Junction table for delivery-container relationship
model delivery_containers {
  id                   String    @id
  delivery_id          String
  container_id         String    // FK to listing_containers
  container_iso_code   String
  pickup_date          DateTime?
  loaded_at            DateTime?
  delivered_at         DateTime?
  received_by          String?
  signature_url        String?
  condition_notes      String?
  photos_json          Json?
  created_at           DateTime  @default(now())
  updated_at           DateTime  @updatedAt
  
  delivery             deliveries           @relation(fields: [delivery_id], references: [id], onDelete: Cascade)
  listing_container    listing_containers   @relation(fields: [container_id], references: [id], onDelete: Cascade)
  
  @@unique([delivery_id, container_id])
  @@index([delivery_id])
  @@index([container_id])
  @@index([container_iso_code])
}

model listing_containers {
  id                       String                      @id
  listing_id               String
  container_iso_code       String                      @unique
  status                   ContainerInventoryStatus    @default(AVAILABLE)
  sold_to_order_id         String?
  sold_at                  DateTime?
  
  // 🆕 NEW: Delivery tracking
  delivery_status          String?                     @default("PENDING_PICKUP")
  scheduled_delivery_date  DateTime?
  actual_delivery_date     DateTime?
  delivery_notes           String?
  
  // Relations
  listing                  listings                    @relation(...)
  sold_order               orders?                     @relation(...)
  delivery_containers      delivery_containers[]       // 🆕 NEW
}

enum DeliveryContainerStatus {
  PENDING_PICKUP
  SCHEDULED
  PICKED_UP
  IN_TRANSIT
  DELIVERED
  DELAYED
  FAILED
}
```

---

### Solution 2: Update API để Hỗ Trợ Partial Deliveries

#### 2.1. API Mới: Lên Lịch Vận Chuyển Từng Batch

**Endpoint:** `POST /api/v1/orders/:orderId/schedule-delivery-batch`

```typescript
// File: backend/src/routes/orders.ts

fastify.post<{
  Params: { orderId: string },
  Body: {
    containerIds: string[],          // 🆕 Container IDs to ship in this batch
    deliveryAddress: string,
    deliveryContact: string,
    deliveryPhone: string,
    deliveryDate: string,
    deliveryTime?: string,
    needsCrane?: boolean,
    specialInstructions?: string,
    transportationFee?: number,
    deliveryMethod?: 'self_pickup' | 'logistics' | 'seller_delivers',
    logisticsCompany?: string,
    carrierInfo?: {
      name: string,
      phone: string,
      vehiclePlate?: string,
      driverName?: string
    }
  }
}>('/:orderId/schedule-delivery-batch', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ success: false, message: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  const userId = (request.user as any).userId;
  const { orderId } = request.params;
  const {
    containerIds,
    deliveryAddress,
    deliveryContact,
    deliveryPhone,
    deliveryDate,
    deliveryTime,
    needsCrane,
    specialInstructions,
    transportationFee,
    deliveryMethod,
    logisticsCompany,
    carrierInfo
  } = request.body;

  try {
    // ============ VALIDATION ============
    
    // 1. Validate order exists and user has permission
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        listing_containers_sold: {
          where: {
            sold_to_order_id: orderId
          }
        },
        deliveries: {
          include: {
            delivery_containers: true
          }
        }
      }
    });

    if (!order) {
      return reply.status(404).send({
        success: false,
        message: 'Order not found'
      });
    }

    // Only buyer can schedule delivery (or admin)
    if (order.buyer_id !== userId) {
      return reply.status(403).send({
        success: false,
        message: 'Only buyer can schedule delivery for this order'
      });
    }

    // Order must be ready for pickup
    if (!['READY_FOR_PICKUP', 'TRANSPORTATION_BOOKED'].includes(order.status)) {
      return reply.status(400).send({
        success: false,
        message: `Order must be ready for pickup. Current status: ${order.status}`
      });
    }

    // 2. Validate containers
    if (!containerIds || containerIds.length === 0) {
      return reply.status(400).send({
        success: false,
        message: 'At least one container must be selected for delivery'
      });
    }

    // Get containers for this order
    const orderContainers = order.listing_containers_sold || [];
    const validContainerIds = orderContainers.map(c => c.id);

    // Check all requested containers belong to this order
    const invalidContainers = containerIds.filter(id => !validContainerIds.includes(id));
    if (invalidContainers.length > 0) {
      return reply.status(400).send({
        success: false,
        message: 'Some containers do not belong to this order',
        data: { invalidContainerIds: invalidContainers }
      });
    }

    // 3. Check if containers already scheduled/delivered
    const alreadyScheduledContainers = await prisma.delivery_containers.findMany({
      where: {
        container_id: { in: containerIds }
      },
      include: {
        delivery: {
          select: {
            id: true,
            status: true,
            delivery_date: true
          }
        }
      }
    });

    const alreadyDelivered = alreadyScheduledContainers.filter(dc => 
      ['DELIVERED', 'IN_TRANSIT'].includes(dc.delivery.status)
    );

    if (alreadyDelivered.length > 0) {
      return reply.status(400).send({
        success: false,
        message: 'Some containers are already delivered or in transit',
        data: {
          alreadyDeliveredIds: alreadyDelivered.map(dc => dc.container_id)
        }
      });
    }

    // ============ CALCULATE BATCH INFO ============
    
    const totalContainers = orderContainers.length;
    const existingDeliveries = order.deliveries.filter(d => d.status !== 'CANCELLED');
    const batchNumber = existingDeliveries.length + 1;
    
    // Calculate how many containers already delivered/scheduled
    const alreadyScheduledCount = alreadyScheduledContainers.length;
    const remainingCount = totalContainers - alreadyScheduledCount;
    const thisDeliveryCount = containerIds.length;
    
    // Estimate total batches needed
    const estimatedTotalBatches = Math.ceil(totalContainers / thisDeliveryCount);

    // ============ CREATE DELIVERY IN TRANSACTION ============
    
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create delivery record
      const delivery = await tx.deliveries.create({
        data: {
          id: randomUUID(),
          order_id: orderId,
          delivery_address: deliveryAddress,
          delivery_contact: deliveryContact,
          delivery_phone: deliveryPhone,
          delivery_date: new Date(deliveryDate),
          delivery_time: deliveryTime || '09:00',
          needs_crane: needsCrane || false,
          special_instructions: specialInstructions || null,
          transportation_fee: transportationFee || 0,
          delivery_method: deliveryMethod || 'logistics',
          logistics_company: logisticsCompany || null,
          carrier_name: carrierInfo?.name || null,
          driver_name: carrierInfo?.driverName || null,
          driver_phone: carrierInfo?.phone || null,
          driver_info_json: carrierInfo || null,
          status: 'SCHEDULED',
          booked_at: new Date(),
          
          // 🆕 Batch tracking
          batch_number: batchNumber,
          total_batches: estimatedTotalBatches,
          containers_count: thisDeliveryCount,
          is_partial_delivery: totalContainers > thisDeliveryCount,
          
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // 2. Link containers to this delivery
      const deliveryContainersData = containerIds.map(containerId => {
        const container = orderContainers.find(c => c.id === containerId);
        return {
          id: randomUUID(),
          delivery_id: delivery.id,
          container_id: containerId,
          container_iso_code: container?.container_iso_code || '',
          pickup_date: new Date(deliveryDate),
          created_at: new Date(),
          updated_at: new Date()
        };
      });

      await tx.delivery_containers.createMany({
        data: deliveryContainersData
      });

      // 3. Update listing_containers status
      await tx.listing_containers.updateMany({
        where: {
          id: { in: containerIds }
        },
        data: {
          delivery_status: 'SCHEDULED',
          scheduled_delivery_date: new Date(deliveryDate),
          updated_at: new Date()
        }
      });

      // 4. Update order status
      await tx.orders.update({
        where: { id: orderId },
        data: {
          status: 'TRANSPORTATION_BOOKED',
          updated_at: new Date()
        }
      });

      // 5. Create delivery event
      await tx.delivery_events.create({
        data: {
          id: randomUUID(),
          delivery_id: delivery.id,
          event_type: 'SCHEDULED',
          payload: {
            batchNumber,
            totalBatches: estimatedTotalBatches,
            containersCount: thisDeliveryCount,
            containerIds
          },
          occurred_at: new Date(),
          created_at: new Date()
        }
      });

      return { delivery, deliveryContainersData };
    });

    // ============ SEND NOTIFICATIONS ============
    
    try {
      const { NotificationService } = await import('../lib/notifications/notification-service');
      
      // Notify seller
      await NotificationService.createNotification({
        userId: order.seller_id,
        type: 'delivery_scheduled',
        title: `Vận chuyển Batch ${batchNumber} đã được đặt`,
        message: `Buyer đã đặt vận chuyển ${thisDeliveryCount} container (Batch ${batchNumber}/${estimatedTotalBatches}). Ngày giao: ${new Date(deliveryDate).toLocaleDateString('vi-VN')}`,
        data: {
          orderId: order.id,
          deliveryId: result.delivery.id,
          batchNumber,
          totalBatches: estimatedTotalBatches,
          containersCount: thisDeliveryCount,
          deliveryDate
        }
      });
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
    }

    // ============ RETURN RESPONSE ============
    
    return reply.send({
      success: true,
      message: `Đã đặt vận chuyển thành công cho Batch ${batchNumber}/${estimatedTotalBatches}`,
      data: {
        delivery: {
          id: result.delivery.id,
          orderId: order.id,
          status: 'SCHEDULED',
          batchNumber,
          totalBatches: estimatedTotalBatches,
          containersCount: thisDeliveryCount,
          deliveryDate: result.delivery.delivery_date,
          deliveryTime: result.delivery.delivery_time,
          transportationFee: result.delivery.transportation_fee,
          isPartialDelivery: result.delivery.is_partial_delivery
        },
        containers: result.deliveryContainersData.map(dc => ({
          containerId: dc.container_id,
          containerIsoCode: dc.container_iso_code,
          pickupDate: dc.pickup_date
        })),
        summary: {
          totalContainersInOrder: totalContainers,
          containersInThisBatch: thisDeliveryCount,
          alreadyDelivered: alreadyScheduledCount,
          remainingToSchedule: remainingCount - thisDeliveryCount
        }
      }
    });

  } catch (error: any) {
    fastify.log.error('Error scheduling delivery batch:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to schedule delivery batch',
      error: error.message
    });
  }
});
```

---

#### 2.2. API: Get Delivery Schedule cho Order

**Endpoint:** `GET /api/v1/orders/:orderId/delivery-schedule`

```typescript
fastify.get<{
  Params: { orderId: string }
}>('/:orderId/delivery-schedule', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ success: false, message: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  const userId = (request.user as any).userId;
  const { orderId } = request.params;

  try {
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        listing_containers_sold: {
          where: {
            sold_to_order_id: orderId
          },
          include: {
            delivery_containers: {
              include: {
                delivery: {
                  select: {
                    id: true,
                    status: true,
                    delivery_date: true,
                    delivery_time: true,
                    carrier_name: true,
                    tracking_number: true,
                    batch_number: true,
                    total_batches: true
                  }
                }
              }
            }
          }
        },
        deliveries: {
          include: {
            delivery_containers: {
              include: {
                listing_container: {
                  select: {
                    id: true,
                    container_iso_code: true,
                    shipping_line: true,
                    manufactured_year: true
                  }
                }
              }
            }
          },
          orderBy: {
            batch_number: 'asc'
          }
        }
      }
    });

    if (!order) {
      return reply.status(404).send({
        success: false,
        message: 'Order not found'
      });
    }

    // Check permission
    if (order.buyer_id !== userId && order.seller_id !== userId) {
      return reply.status(403).send({
        success: false,
        message: 'Access denied'
      });
    }

    // Group containers by delivery status
    const allContainers = order.listing_containers_sold || [];
    
    const containersByStatus = {
      delivered: [] as any[],
      inTransit: [] as any[],
      scheduled: [] as any[],
      pendingSchedule: [] as any[]
    };

    allContainers.forEach(container => {
      const deliveryInfo = container.delivery_containers[0];
      
      if (!deliveryInfo) {
        containersByStatus.pendingSchedule.push({
          id: container.id,
          isoCode: container.container_iso_code,
          shippingLine: container.shipping_line,
          manufacturedYear: container.manufactured_year,
          status: container.delivery_status || 'PENDING_PICKUP'
        });
      } else {
        const status = deliveryInfo.delivery.status;
        const containerData = {
          id: container.id,
          isoCode: container.container_iso_code,
          shippingLine: container.shipping_line,
          manufacturedYear: container.manufactured_year,
          deliveryId: deliveryInfo.delivery_id,
          deliveryStatus: status,
          deliveryDate: deliveryInfo.delivery.delivery_date,
          batchNumber: deliveryInfo.delivery.batch_number,
          trackingNumber: deliveryInfo.delivery.tracking_number,
          deliveredAt: deliveryInfo.delivered_at
        };

        if (status === 'DELIVERED') {
          containersByStatus.delivered.push(containerData);
        } else if (status === 'IN_TRANSIT') {
          containersByStatus.inTransit.push(containerData);
        } else {
          containersByStatus.scheduled.push(containerData);
        }
      }
    });

    // Format deliveries
    const deliveryBatches = order.deliveries.map(delivery => ({
      id: delivery.id,
      batchNumber: delivery.batch_number,
      totalBatches: delivery.total_batches,
      status: delivery.status,
      deliveryDate: delivery.delivery_date,
      deliveryTime: delivery.delivery_time,
      containersCount: delivery.containers_count,
      transportationFee: delivery.transportation_fee,
      carrierName: delivery.carrier_name,
      trackingNumber: delivery.tracking_number,
      containers: delivery.delivery_containers.map(dc => ({
        id: dc.listing_container.id,
        isoCode: dc.listing_container.container_iso_code,
        shippingLine: dc.listing_container.shipping_line,
        manufacturedYear: dc.listing_container.manufactured_year,
        pickedUpAt: dc.loaded_at,
        deliveredAt: dc.delivered_at
      }))
    }));

    return reply.send({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        orderStatus: order.status,
        totalContainers: allContainers.length,
        summary: {
          delivered: containersByStatus.delivered.length,
          inTransit: containersByStatus.inTransit.length,
          scheduled: containersByStatus.scheduled.length,
          pendingSchedule: containersByStatus.pendingSchedule.length
        },
        containers: containersByStatus,
        deliveryBatches
      }
    });

  } catch (error: any) {
    fastify.log.error('Error fetching delivery schedule:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to fetch delivery schedule',
      error: error.message
    });
  }
});
```

---

### Solution 3: Frontend UI/UX

#### 3.1. Container Selection UI

**Component:** `frontend/components/orders/schedule-delivery-modal.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, AlertCircle } from 'lucide-react';

interface Container {
  id: string;
  isoCode: string;
  shippingLine?: string;
  manufacturedYear?: number;
  deliveryStatus?: string;
}

interface ScheduleDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  containers: Container[];
  onSuccess: () => void;
}

export default function ScheduleDeliveryModal({
  isOpen,
  onClose,
  orderId,
  containers,
  onSuccess
}: ScheduleDeliveryModalProps) {
  const [selectedContainerIds, setSelectedContainerIds] = useState<string[]>([]);
  const [deliveryDate, setDeliveryDate] = useState<Date>(new Date());
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryContact, setDeliveryContact] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [needsCrane, setNeedsCrane] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter out already scheduled/delivered containers
  const availableContainers = containers.filter(
    c => !['DELIVERED', 'IN_TRANSIT', 'SCHEDULED'].includes(c.deliveryStatus || '')
  );

  const handleContainerToggle = (containerId: string) => {
    setSelectedContainerIds(prev =>
      prev.includes(containerId)
        ? prev.filter(id => id !== containerId)
        : [...prev, containerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContainerIds.length === availableContainers.length) {
      setSelectedContainerIds([]);
    } else {
      setSelectedContainerIds(availableContainers.map(c => c.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedContainerIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 container');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/v1/orders/${orderId}/schedule-delivery-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          containerIds: selectedContainerIds,
          deliveryAddress,
          deliveryContact,
          deliveryPhone,
          deliveryDate: deliveryDate.toISOString(),
          needsCrane,
          specialInstructions
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ ${result.message}`);
        onSuccess();
        onClose();
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Error scheduling delivery:', error);
      alert('Có lỗi xảy ra khi đặt vận chuyển');
    } finally {
      setLoading(false);
    }
  };

  const estimatedBatches = Math.ceil(containers.length / (selectedContainerIds.length || 1));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Đặt Lịch Vận Chuyển
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Container Selection */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Chọn Container để vận chuyển</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedContainerIds.length === availableContainers.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </Button>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">💡 Lưu ý:</p>
                  <p>Bạn có thể chia nhỏ đơn hàng thành nhiều lần vận chuyển. Mỗi lần chọn số lượng container phù hợp với phương tiện vận chuyển (thường 1-2 container/chuyến).</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-50 rounded p-3 text-center">
                <div className="text-2xl font-bold">{containers.length}</div>
                <div className="text-sm text-gray-600">Tổng containers</div>
              </div>
              <div className="bg-green-50 rounded p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{selectedContainerIds.length}</div>
                <div className="text-sm text-gray-600">Đã chọn</div>
              </div>
              <div className="bg-orange-50 rounded p-3 text-center">
                <div className="text-2xl font-bold text-orange-600">{estimatedBatches}</div>
                <div className="text-sm text-gray-600">Dự kiến số chuyến</div>
              </div>
            </div>

            {/* Container List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableContainers.map(container => (
                <div
                  key={container.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedContainerIds.includes(container.id)
                      ? 'bg-blue-50 border-blue-300'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleContainerToggle(container.id)}
                >
                  <Checkbox
                    checked={selectedContainerIds.includes(container.id)}
                    onCheckedChange={() => handleContainerToggle(container.id)}
                  />
                  <Package className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="font-medium">{container.isoCode}</div>
                    <div className="text-sm text-gray-500">
                      {container.shippingLine && `${container.shippingLine} • `}
                      {container.manufacturedYear || 'N/A'}
                    </div>
                  </div>
                  {container.deliveryStatus && (
                    <Badge variant={
                      container.deliveryStatus === 'PENDING_PICKUP' ? 'secondary' : 'default'
                    }>
                      {container.deliveryStatus}
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {availableContainers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Tất cả container đã được lên lịch vận chuyển
              </div>
            )}
          </div>

          {/* Delivery Details */}
          {selectedContainerIds.length > 0 && (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="deliveryAddress">Địa chỉ giao hàng *</Label>
                  <Input
                    id="deliveryAddress"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Nhập địa chỉ đầy đủ"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deliveryContact">Người nhận *</Label>
                    <Input
                      id="deliveryContact"
                      value={deliveryContact}
                      onChange={(e) => setDeliveryContact(e.target.value)}
                      placeholder="Tên người nhận"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryPhone">Số điện thoại *</Label>
                    <Input
                      id="deliveryPhone"
                      value={deliveryPhone}
                      onChange={(e) => setDeliveryPhone(e.target.value)}
                      placeholder="0xxx xxx xxx"
                    />
                  </div>
                </div>

                <div>
                  <Label>Ngày giao hàng *</Label>
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={(date) => date && setDeliveryDate(date)}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="needsCrane"
                    checked={needsCrane}
                    onCheckedChange={(checked) => setNeedsCrane(checked as boolean)}
                  />
                  <Label htmlFor="needsCrane">Cần cần cẩu tại địa điểm giao hàng</Label>
                </div>

                <div>
                  <Label htmlFor="specialInstructions">Ghi chú đặc biệt</Label>
                  <textarea
                    id="specialInstructions"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Yêu cầu đặc biệt về thời gian, địa điểm..."
                    className="w-full min-h-[100px] p-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Hủy
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Đang xử lý...' : `Đặt vận chuyển ${selectedContainerIds.length} container`}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

#### 3.2. Delivery Schedule Dashboard

**Component:** `frontend/components/orders/delivery-schedule-view.tsx`

```tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Truck, Package, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface DeliveryScheduleViewProps {
  orderId: string;
}

export default function DeliveryScheduleView({ orderId }: DeliveryScheduleViewProps) {
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, [orderId]);

  const fetchSchedule = async () => {
    try {
      const response = await fetch(`/api/v1/orders/${orderId}/delivery-schedule`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setSchedule(result.data);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!schedule) {
    return <div>No schedule data</div>;
  }

  const { summary, deliveryBatches, containers } = schedule;
  const progress = (summary.delivered / schedule.totalContainers) * 100;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Tiến Độ Vận Chuyển
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  {summary.delivered} / {schedule.totalContainers} containers đã giao
                </span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <div>
                  <div className="text-xl font-bold">{summary.delivered}</div>
                  <div className="text-xs text-gray-600">Đã giao</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-xl font-bold">{summary.inTransit}</div>
                  <div className="text-xs text-gray-600">Đang vận chuyển</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <div>
                  <div className="text-xl font-bold">{summary.scheduled}</div>
                  <div className="text-xs text-gray-600">Đã lên lịch</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-gray-600" />
                <div>
                  <div className="text-xl font-bold">{summary.pendingSchedule}</div>
                  <div className="text-xs text-gray-600">Chưa lên lịch</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Batches */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Các Chuyến Vận Chuyển</h3>
        {deliveryBatches.map((batch: any) => (
          <Card key={batch.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">
                    Chuyến {batch.batchNumber} / {batch.totalBatches}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {batch.containersCount} containers • {new Date(batch.deliveryDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <Badge variant={
                  batch.status === 'DELIVERED' ? 'success' :
                  batch.status === 'IN_TRANSIT' ? 'default' :
                  batch.status === 'SCHEDULED' ? 'secondary' :
                  'outline'
                }>
                  {batch.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {batch.carrierName && (
                  <div className="text-sm">
                    <span className="text-gray-600">Đơn vị vận chuyển:</span>{' '}
                    <span className="font-medium">{batch.carrierName}</span>
                  </div>
                )}
                {batch.trackingNumber && (
                  <div className="text-sm">
                    <span className="text-gray-600">Mã vận đơn:</span>{' '}
                    <span className="font-mono">{batch.trackingNumber}</span>
                  </div>
                )}
                
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Containers trong chuyến này:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {batch.containers.map((container: any) => (
                      <div key={container.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span>{container.isoCode}</span>
                        {container.deliveredAt && (
                          <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Containers */}
      {summary.pendingSchedule > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Containers Chưa Lên Lịch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {containers.pendingSchedule.map((container: any) => (
                <div key={container.id} className="flex items-center gap-2 p-2 border rounded text-sm">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span>{container.isoCode}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## 📋 Implementation Checklist

### Phase 1: Database (1-2 ngày)
- [ ] Tạo migration file `add_delivery_containers`
- [ ] Thêm table `delivery_containers`
- [ ] Thêm fields vào `deliveries` (batch_number, total_batches, etc.)
- [ ] Thêm fields vào `listing_containers` (delivery_status, scheduled_delivery_date, etc.)
- [ ] Update Prisma schema
- [ ] Chạy migration: `npx prisma migrate dev`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Test database changes

### Phase 2: Backend API (2-3 ngày)
- [ ] Implement `POST /orders/:id/schedule-delivery-batch`
- [ ] Implement `GET /orders/:id/delivery-schedule`
- [ ] Update existing `POST /orders/:id/book-transportation` (optional - backwards compat)
- [ ] Add validation logic
- [ ] Add transaction handling
- [ ] Add notification triggers
- [ ] Test API endpoints
- [ ] Write API documentation

### Phase 3: Frontend UI (2-3 ngày)
- [ ] Create `ScheduleDeliveryModal` component
- [ ] Create `DeliveryScheduleView` component
- [ ] Update order detail page
- [ ] Add "Schedule Delivery" button
- [ ] Add delivery status badges
- [ ] Test UI/UX flow
- [ ] Mobile responsive testing

### Phase 4: Testing & Deployment (1-2 ngày)
- [ ] End-to-end testing
- [ ] Test với nhiều scenarios:
  - [ ] 1 container order
  - [ ] 5 containers → chia 3 batches
  - [ ] 10 containers → chia 5 batches
  - [ ] Cancel delivery batch
  - [ ] Re-schedule delivery
- [ ] Load testing
- [ ] Staging deployment
- [ ] Production deployment
- [ ] Monitor logs

---

## 🎯 Tóm Tắt

### Vấn Đề
❌ Hệ thống hiện tại **không hỗ trợ vận chuyển từng phần** (partial deliveries) cho đơn hàng nhiều container

### Giải Pháp
✅ **Delivery Batching System:**
1. **Database:** Thêm `delivery_containers` junction table để track container nào thuộc delivery nào
2. **API:** Tạo endpoint mới cho phép schedule delivery theo batch với container selection
3. **UI:** Giao diện chọn containers, xem tiến độ giao hàng theo batch

### Lợi Ích
1. ✅ **Linh hoạt:** Buyer có thể chia nhỏ đơn hàng thành nhiều chuyến vận chuyển
2. ✅ **Tiết kiệm:** Không cần thuê nhiều xe cùng lúc
3. ✅ **Rõ ràng:** Track được từng container đang ở đâu trong quy trình
4. ✅ **Trải nghiệm tốt:** UI/UX rõ ràng, dễ quản lý
5. ✅ **Scalable:** Hỗ trợ đơn hàng lớn (10, 20, 100+ containers)

---

**Ngày phân tích:** 8 Tháng 11, 2025  
**Phân tích bởi:** GitHub Copilot  
**Trạng thái:** Ready for Implementation
