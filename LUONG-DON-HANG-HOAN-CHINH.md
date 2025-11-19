# 🔄 PHÂN TÍCH LUỒNG ĐƠN HÀNG THỰC TẾ - i-ContExchange

**Ngày phân tích:** 11/11/2025  
**Mục đích:** Phân tích chi tiết cách vận hành thực tế của hệ thống để hoàn thành 1 đơn hàng
**Dựa trên:** Code thực tế đang chạy trong dự án

---

## 📋 MỤC LỤC

1. [Tổng Quan Hệ Thống](#1-tổng-quan-hệ-thống)
2. [Luồng Tạo Đơn Hàng - Chi Tiết Code](#2-luồng-tạo-đơn-hàng---chi-tiết-code)
3. [Luồng Thanh Toán - Chi Tiết Code](#3-luồng-thanh-toán---chi-tiết-code)
4. [Luồng Chuẩn Bị & Giao Hàng - Chi Tiết Code](#4-luồng-chuẩn-bị--giao-hàng---chi-tiết-code)
5. [Luồng Xác Nhận & Hoàn Tất - Chi Tiết Code](#5-luồng-xác-nhận--hoàn-tất---chi-tiết-code)
6. [Các Trường Hợp Đặc Biệt](#6-các-trường-hợp-đặc-biệt)
7. [Database Schema Thực Tế](#7-database-schema-thực-tế)
8. [Hệ Thống Quản Lý Inventory](#8-hệ-thống-quản-lý-inventory)
9. [Hệ Thống Giao Hàng Batch](#9-hệ-thống-giao-hàng-batch)

---

## 1. TỔNG QUAN HỆ THỐNG

### 🎯 Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────────┐
│                    HỆ THỐNG i-ContExchange                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Frontend (Next.js + TypeScript)                                │
│  ├─ /app/[locale]/(buyer)/                                      │
│  │  ├─ /listings/[id]     - Chi tiết listing                   │
│  │  ├─ /cart             - Giỏ hàng                            │
│  │  ├─ /orders           - Đơn hàng của buyer                  │
│  │  └─ /orders/[id]      - Chi tiết đơn hàng                   │
│  │                                                              │
│  ├─ /app/[locale]/(seller)/                                     │
│  │  ├─ /orders           - Đơn hàng cần xử lý                  │
│  │  ├─ /orders/[id]      - Chi tiết & actions                  │
│  │  └─ /deliveries       - Quản lý giao hàng                   │
│  │                                                              │
│  └─ State Management:                                           │
│     ├─ useCart()         - Cart context                        │
│     ├─ useAuth()         - Authentication                      │
│     └─ React Query       - Server state                        │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Backend (Fastify + TypeScript)                                 │
│  ├─ /routes/                                                    │
│  │  ├─ orders.ts        - 60+ endpoints cho orders             │
│  │  ├─ deliveries.ts    - 20+ endpoints cho deliveries         │
│  │  ├─ cart.ts          - Cart management                      │
│  │  └─ payments.ts      - Payment processing                   │
│  │                                                              │
│  ├─ /lib/                                                       │
│  │  ├─ inventory/                                              │
│  │  │  └─ inventory-service.ts - Quản lý tồn kho               │
│  │  ├─ payments/                                               │
│  │  │  └─ payment-service-simple.ts - Escrow payment           │
│  │  └─ notifications/                                          │
│  │     └─ notification-service.ts - Thông báo realtime         │
│  │                                                              │
│  └─ Database (PostgreSQL + Prisma ORM)                          │
│     ├─ orders            - Đơn hàng chính                      │
│     ├─ order_items       - Chi tiết items                      │
│     ├─ payments          - Thanh toán escrow                   │
│     ├─ deliveries        - Batch deliveries                    │
│     ├─ delivery_containers - Container tracking                │
│     ├─ listing_containers  - Inventory management              │
│     ├─ order_preparations  - Seller preparation                │
│     ├─ disputes           - Tranh chấp                         │
│     └─ notifications      - Thông báo                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 🎯 Sơ Đồ Tổng Quát

```
┌──────────────────────────────────────────────────────────────────────┐
│                    COMPLETE ORDER LIFECYCLE                          │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────┐
│  CREATE     │───▶│   PAYMENT    │───▶│  DELIVERY   │───▶│ COMPLETE │
│  ORDER      │    │   PROCESS    │    │   PROCESS   │    │          │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────┘
     │                    │                    │                 │
     ├─ From Listing     ├─ Buyer pays       ├─ Seller preps   ├─ Buyer confirms
     ├─ From RFQ/Quote   ├─ Seller verifies  ├─ Transport      ├─ Payment released
     └─ From Cart        └─ Escrow holds     └─ Delivers       └─ Review/Rating
```

### 📊 Order Status Flow

```
CREATED/PENDING_PAYMENT
    │
    ├──▶ [Buyer pays] ──▶ PAYMENT_PENDING_VERIFICATION
    │                           │
    │                           ├──▶ [Seller verifies] ──▶ PAID
    │                           └──▶ [Seller rejects] ──▶ PENDING_PAYMENT
    │
    └──▶ [Cancel] ──▶ CANCELLED

PAID
    │
    └──▶ [Seller starts prep] ──▶ PREPARING_DELIVERY
                                        │
                                        └──▶ [Prep complete] ──▶ READY_FOR_PICKUP

READY_FOR_PICKUP
    │
    ├──▶ [Buyer books transport] ──▶ TRANSPORTATION_BOOKED
    │                                       │
    │                                       └──▶ [Start delivery] ──▶ IN_TRANSIT
    │
    └──▶ [Seller starts delivery] ──▶ IN_TRANSIT

IN_TRANSIT
    │
    └──▶ [Seller marks delivered] ──▶ DELIVERED

DELIVERED
    │
    ├──▶ [Buyer confirms good] ──▶ COMPLETED
    ├──▶ [Buyer reports minor damage] ──▶ COMPLETED
    └──▶ [Buyer reports major damage] ──▶ DISPUTED

COMPLETED
    │
    └──▶ [Payment released to seller after 7 days]
```

---

## 2. LUỒNG TẠO ĐƠN HÀNG

### 📝 Có 3 Cách Tạo Đơn Hàng

#### **A. Tạo từ Listing (Direct Buy)**

**API:** `POST /api/orders/from-listing`

**Frontend Flow:**
```
1. Buyer browsing listings → /listings
2. Click listing detail → /listings/:id
3. Click "Mua ngay" button
4. Fill order form:
   - Quantity (auto or manual)
   - Agreed price (auto-filled from listing)
   - Delivery address (required)
   - Notes (optional)
   - Select specific containers (optional)
5. Click "Xác nhận tạo đơn hàng"
6. Redirect to Order Detail → /orders/:id
```

**Backend Process:**
```typescript
// POST /api/orders/from-listing
{
  listingId: string,
  quantity?: number,
  agreedPrice: number,
  currency: string,
  deliveryAddress: { street, city, province, zipCode },
  notes?: string,
  selected_container_ids?: string[]
}

→ Validate listing (approved, available quantity)
→ Validate containers (if selected)
→ Transaction:
   1. Create order (status: PENDING_PAYMENT)
   2. Create order_items
   3. Reserve inventory (InventoryService.reserveInventory)
      - Update listing.available_quantity
      - Mark containers as RESERVED or SOLD/RENTED
   4. Create notification to seller
→ Return order with status PENDING_PAYMENT
```

**Database Changes:**
- `orders` table: New record created
- `order_items` table: Items linked to order
- `listing_containers`: Status updated to RESERVED/SOLD/RENTED
- `listings`: available_quantity decreased

---

#### **B. Tạo từ RFQ/Quote**

**API:** `POST /api/orders`

**Frontend Flow:**
```
1. Buyer creates RFQ → /rfq/create
2. Seller receives RFQ notification
3. Seller creates quote → /quotes/create
4. Buyer views quote → /quotes/:id
5. Buyer accepts quote → PUT /quotes/:id/accept
   → Auto-creates order
6. Redirect to Order Detail → /orders/:id
```

**Backend Process:**
```typescript
// When buyer accepts quote:
PUT /api/quotes/:id/accept

→ Transaction:
   1. Update quote status: ACCEPTED
   2. Create order from quote:
      - buyer_id, seller_id
      - listing_id, quote_id
      - status: PENDING_PAYMENT
      - subtotal, tax, fees, total from quote
   3. Create order_items from quote_items
   4. Reserve containers (from RFQ.selected_container_ids)
   5. Notify seller "Quote accepted, order created"
→ Return order
```

---

#### **C. Tạo từ Cart (Checkout Multiple Items)**

**API:** `POST /api/cart/checkout`

**Frontend Flow:**
```
1. Buyer adds items to cart → /cart
2. Select items to checkout
3. Click "Thanh toán"
4. Review cart items
5. Click "Xác nhận thanh toán"
6. Backend creates orders (1 order per seller)
7. Redirect to orders list → /buyer/orders
```

**Backend Process:**
```typescript
// POST /api/cart/checkout
→ Group cart items by seller_id
→ For each seller:
   1. Create order (PENDING_PAYMENT)
   2. Create order_items
   3. Reserve inventory
   4. Notify seller
→ Delete cart items
→ Return array of order IDs
```

---

## 3. LUỒNG THANH TOÁN

### 💳 Payment Process

**Order Status:** `PENDING_PAYMENT` → `PAYMENT_PENDING_VERIFICATION` → `PAID`

#### **Bước 1: Buyer Thanh Toán**

**API:** `POST /api/orders/:id/pay`

**Frontend:**
```
1. Buyer on order detail → /orders/:id
2. See status: PENDING_PAYMENT
3. Click "Thanh toán" button
4. Redirect to payment page → /orders/:id/pay
5. Choose payment method:
   - Bank transfer
   - Credit card
   - E-wallet
6. Submit payment
7. Upload proof (bank receipt, screenshot)
8. Order status → PAYMENT_PENDING_VERIFICATION
```

**Backend:**
```typescript
POST /api/orders/:id/pay
{
  method: 'bank' | 'credit_card' | 'wallet',
  amount: number,
  currency?: string,
  paymentData?: any
}

→ Validate order status = PENDING_PAYMENT
→ Validate buyer permission
→ paymentService.processEscrowPayment()
   1. Create payment record (status: PENDING_VERIFICATION)
   2. Store payment proof
   3. Update order status: PAYMENT_PENDING_VERIFICATION
   4. Notify seller "Buyer đã thanh toán - Cần xác nhận"
   5. Notify buyer "Đã ghi nhận thanh toán"
```

---

#### **Bước 2: Seller Xác Nhận Payment**

**API:** `POST /api/orders/:id/payment-verify`

**Frontend (Seller):**
```
1. Seller receives notification
2. Go to order detail → /seller/orders/:id
3. Check bank account / payment gateway
4. Click "Xác nhận đã nhận tiền" or "Từ chối"
5. If reject: Enter reason
6. Submit verification
```

**Backend:**
```typescript
POST /api/orders/:id/payment-verify
{
  verified: boolean,
  notes?: string,
  paymentProofUrls?: string[]
}

→ Validate seller permission
→ Validate order status = PAYMENT_PENDING_VERIFICATION

IF verified = true:
   1. Update payment status: COMPLETED
   2. Update order status: PAID
   3. Set payment_verified_at, verified_by
   4. Notify buyer "Thanh toán đã được xác nhận"
   5. Notify seller "Có thể bắt đầu chuẩn bị hàng"

IF verified = false:
   Transaction:
      1. Update payment status: FAILED
      2. Update order status: PENDING_PAYMENT (back to start)
      3. Release inventory (InventoryService.releaseInventory)
      4. Notify buyer "Payment rejected - need to retry"
```

**⚠️ Quan Trọng:**
- Nếu seller từ chối payment → inventory được restore
- Buyer có thể thanh toán lại hoặc cancel order
- Auto-cancel sau 7 ngày nếu không payment (TODO)

---

## 4. LUỒNG CHUẨN BỊ & GIAO HÀNG

### 📦 Delivery Process

**Order Status:** `PAID` → `PREPARING_DELIVERY` → `READY_FOR_PICKUP` → `TRANSPORTATION_BOOKED` → `IN_TRANSIT` → `DELIVERED`

---

#### **Bước 1: Seller Bắt Đầu Chuẩn Bị**

**API:** `POST /api/orders/:id/prepare-delivery`

**Frontend (Seller):**
```
1. Order status = PAID
2. Seller clicks "Bắt đầu chuẩn bị hàng"
3. Fill preparation form:
   - Estimated ready date
   - Preparation notes
   - Photos (inspection, condition)
   - Documents (certificates, etc.)
4. Submit
5. Order status → PREPARING_DELIVERY
```

**Backend:**
```typescript
POST /api/orders/:id/prepare-delivery
{
  estimatedReadyDate?: string,
  preparationNotes?: string,
  photos?: string[],
  documents?: [{ type, url, name }],
  conditionNotes?: string
}

→ Validate seller permission
→ Validate order status = PAID
→ Create order_preparations record:
   - status: PREPARING
   - preparation_started_at: now
   - estimated_ready_date
   - preparation_notes, photos, documents
→ Update order status: PREPARING_DELIVERY
→ Notify buyer "Seller đang chuẩn bị hàng"
```

**Database:**
```sql
order_preparations {
  id, order_id, seller_id,
  status: 'PREPARING',
  preparation_started_at,
  estimated_ready_date,
  preparation_notes,
  inspection_photos_json,
  document_urls_json
}
```

---

#### **Bước 2: Seller Đánh Dấu Sẵn Sàng**

**API:** `POST /api/orders/:id/mark-ready`

**Frontend (Seller):**
```
1. Order status = PREPARING_DELIVERY
2. Preparation completed
3. Click "Đánh dấu sẵn sàng giao hàng"
4. Fill pickup information:
   - Pickup location
   - Contact person (name, phone)
   - Pickup time window (from - to)
   - Special instructions
   - Final photos
5. Submit
6. Order status → READY_FOR_PICKUP
```

**Backend:**
```typescript
POST /api/orders/:id/mark-ready
{
  readyDate?: string,
  pickupLocation?: object,
  pickupContact?: { name, phone },
  pickupTimeWindow?: { from, to },
  specialInstructions?: string,
  finalPhotos?: string[]
}

→ Validate seller permission
→ Validate order status = PREPARING_DELIVERY
→ Update order_preparations:
   - status: READY
   - preparation_completed_at: now
   - pickup_location_json
   - pickup_contact_name, pickup_contact_phone
   - pickup_instructions
   - pickup_available_from, pickup_available_to
→ Update order status: READY_FOR_PICKUP
→ Notify buyer "Container sẵn sàng! Vui lòng sắp xếp vận chuyển"
```

---

#### **Bước 3: Đặt Vận Chuyển (Buyer hoặc Seller)**

**API:** `POST /api/deliveries/schedule`

**Có 2 kịch bản:**

**A. Buyer tự đặt vận chuyển:**
```
1. Order status = READY_FOR_PICKUP
2. Buyer clicks "Đặt vận chuyển"
3. Fill delivery form:
   - Delivery address
   - Delivery contact & phone
   - Preferred date & time
   - Special requirements (crane, forklift)
   - Selected containers (for batch delivery)
4. Submit
5. Order status → TRANSPORTATION_BOOKED
```

**Backend:**
```typescript
POST /api/deliveries/schedule
{
  order_id: string,
  delivery_address: object,
  delivery_contact: string,
  delivery_phone: string,
  scheduled_date: string,
  special_requirements?: object,
  selected_container_ids?: string[]
}

→ Validate buyer/seller permission
→ Create delivery record:
   - status: SCHEDULED
   - scheduled_date
   - delivery_address, contact, phone
   - batch_number, total_batches (if partial delivery)
→ Create delivery_containers (link containers to delivery)
→ Update order status: TRANSPORTATION_BOOKED
→ Notify seller "Buyer đã đặt vận chuyển"
```

**B. Seller tự giao hàng:**
```
→ Skip to Bước 4 (start-delivering)
→ Order: READY_FOR_PICKUP → IN_TRANSIT directly
```

---

#### **Bước 4: Bắt Đầu Vận Chuyển**

**API:** `POST /api/orders/:id/start-delivering`

**Frontend (Seller):**
```
1. Order status = READY_FOR_PICKUP or TRANSPORTATION_BOOKED
2. Seller clicks "Bắt đầu vận chuyển"
3. Fill transport details:
   - Carrier name
   - Tracking number
   - Driver info (name, phone)
   - Transport method
   - Estimated delivery date
4. Submit
5. Order status → IN_TRANSIT
```

**Backend:**
```typescript
POST /api/orders/:id/start-delivering
{
  carrierName?: string,
  trackingNumber?: string,
  estimatedDeliveryDate?: string,
  driverInfo?: { name, phone },
  transportMethod?: string,
  route?: string,
  notes?: string
}

→ Validate seller permission
→ Validate order status = READY_FOR_PICKUP or TRANSPORTATION_BOOKED
→ Update or create delivery record:
   - status: IN_TRANSIT
   - in_transit_at: now
   - carrier_name, tracking_number
   - driver_info_json, transport_method
   - estimated_delivery
→ Update order status: IN_TRANSIT
→ Notify buyer "Đơn hàng đang được vận chuyển"
```

---

#### **Bước 5: Seller Xác Nhận Đã Giao**

**API:** `POST /api/orders/:id/mark-delivered`

**Frontend (Seller):**
```
1. Order status = IN_TRANSIT
2. Driver delivers containers
3. Seller clicks "Xác nhận đã giao hàng"
4. Upload delivery proof:
   - Delivery photos
   - EIR (Equipment Interchange Receipt)
   - Receiver signature
   - Received by name
   - Delivery location
5. Submit
6. Order status → DELIVERED
```

**Backend:**
```typescript
POST /api/orders/:id/mark-delivered
{
  deliveredAt?: string,
  deliveryLocation?: object,
  deliveryProof?: string[],
  eirData?: object,
  receivedByName?: string,
  receivedBySignature?: string,
  driverNotes?: string
}

→ Validate seller permission
→ Validate order status = IN_TRANSIT
→ Update delivery record:
   - status: DELIVERED
   - delivered_at: now
   - delivery_location_json
   - delivery_proof_json, eir_data_json
   - received_by_name, received_by_signature
→ Update order status: DELIVERED
→ Notify buyer "Container đã được giao! Vui lòng kiểm tra và xác nhận"
→ Notify seller "Giao hàng thành công. Chờ buyer xác nhận"
```

---

## 5. LUỒNG XÁC NHẬN & HOÀN TẤT

### ✅ Receipt Confirmation & Completion

**Order Status:** `DELIVERED` → `COMPLETED` or `DISPUTED`

---

#### **Bước 1: Buyer Xác Nhận Nhận Hàng**

**API:** `POST /api/orders/:id/confirm-receipt`

**Frontend (Buyer):**
```
1. Order status = DELIVERED
2. Buyer receives notification
3. Go to order detail
4. Click "Xác nhận nhận hàng"
5. Inspect containers
6. Fill confirmation form:
   - Received by (name)
   - Condition for each container:
     * GOOD (Tốt)
     * MINOR_DAMAGE (Hư nhỏ)
     * MAJOR_DAMAGE (Hư nặng)
   - Photos for each container
   - Notes
   - Signature
7. Submit
```

**Backend:**
```typescript
POST /api/orders/:id/confirm-receipt
{
  receivedAt?: string,
  receivedBy: string,
  condition: 'GOOD' | 'MINOR_DAMAGE' | 'MAJOR_DAMAGE',
  photos?: string[],
  notes?: string,
  signature?: string
}

→ Validate buyer permission
→ Validate order status = DELIVERED

IF condition = GOOD or MINOR_DAMAGE:
   1. Update order status: COMPLETED
   2. Set receipt_confirmed_at, receipt_confirmed_by
   3. Store receipt_data_json
   4. Notify seller "Buyer đã xác nhận. Đơn hàng hoàn tất!"
   5. Notify buyer "Xác nhận thành công"
   6. Schedule payment release (after 7 days)

IF condition = MAJOR_DAMAGE:
   1. Update order status: DISPUTED
   2. Create dispute record:
      - reason: "Container damaged on delivery"
      - evidence: photos, notes
      - status: OPEN
      - priority: HIGH
   3. Hold payment (set payment status: ON_HOLD)
   4. Notify seller "Buyer báo cáo vấn đề. Admin sẽ xử lý"
   5. Notify buyer "Tranh chấp đã tạo. Admin sẽ liên hệ"
   6. Notify all admins "Dispute cần xử lý"
```

**Database:**
```sql
-- For GOOD/MINOR_DAMAGE
orders {
  status: 'COMPLETED',
  receipt_confirmed_at: NOW(),
  receipt_confirmed_by: buyer_id,
  receipt_data_json: { condition, photos, notes, ... }
}

-- For MAJOR_DAMAGE
disputes {
  id, order_id, raised_by: buyer_id,
  status: 'OPEN',
  reason: 'Container damaged on delivery',
  evidence_json: { condition, photos, notes },
  requested_resolution: 'FULL_REFUND',
  priority: 'HIGH'
}

payments {
  status: 'ON_HOLD'  -- Hold payment until dispute resolved
}
```

---

#### **Bước 2: Payment Release (Sau 7 ngày)**

**Tự động hoặc manual:**

```typescript
// Auto release after 7 days (cron job)
IF order.status = COMPLETED
   AND receipt_confirmed_at + 7 days <= NOW()
   AND payment.status != RELEASED:
   
   1. Release payment to seller:
      - Transfer from escrow to seller wallet
      - Deduct platform fee (2%)
   2. Update payment status: RELEASED
   3. Notify seller "Payment released!"
   4. Notify buyer "Transaction completed"
```

---

#### **Bước 3: Review & Rating (Optional)**

```
Buyer can leave review:
- Rating (1-5 stars)
- Comment
- Transaction experience

Seller can respond to review
```

---

## 6. CÁC TRƯỜNG HỢP ĐẶC BIỆT

### ❌ A. Cancel Order

**Ai có thể cancel:**
- Buyer: Trước khi PAID hoặc với seller agreement
- Seller: Trước khi PREPARING_DELIVERY hoặc với buyer agreement
- Admin: Bất cứ lúc nào

**API:** `POST /api/orders/:id/cancel`

**Process:**
```typescript
POST /api/orders/:id/cancel
{ reason?: string }

→ Validate permission (buyer or seller)
→ Check order status (cannot cancel if COMPLETED/CANCELLED)
→ Transaction:
   1. Refund payment (if paid):
      - paymentService.refundEscrowPayment()
      - Return money to buyer
   2. Update order status: CANCELLED
   3. Release inventory:
      - InventoryService.releaseInventory()
      - Update listing.available_quantity
      - Mark containers back to AVAILABLE
   4. Notify both parties
```

---

### 🔁 B. Partial Delivery (Batch Delivery)

**Khi nào dùng:**
- Order có nhiều containers
- Không thể giao hết cùng lúc
- Giao từng batch

**Process:**
```typescript
// Schedule multiple deliveries
POST /api/deliveries/schedule-batch
{
  order_id: string,
  batches: [
    {
      batch_number: 1,
      container_ids: [...],
      scheduled_date: '...'
    },
    {
      batch_number: 2,
      container_ids: [...],
      scheduled_date: '...'
    }
  ]
}

→ Create multiple delivery records:
   - delivery 1: batch 1/2
   - delivery 2: batch 2/2

→ Each delivery has own lifecycle:
   SCHEDULED → IN_TRANSIT → DELIVERED → CONFIRMED

→ Order status updates:
   - First batch delivered: PARTIALLY_DELIVERED
   - All batches delivered: DELIVERED
   - All batches confirmed: COMPLETED
```

---

### ⚠️ C. Dispute Resolution

**Khi có dispute:**

```
1. Order status = DISPUTED
2. Payment on hold
3. Admin reviews:
   - Evidence (photos, documents)
   - Both parties' statements
   - Contract terms

4. Admin decides:
   A. Full refund to buyer
   B. Partial refund
   C. Release payment to seller (reject dispute)

5. Update order status:
   - If refund: REFUNDED
   - If release: COMPLETED

6. Close dispute
```

**API:**
```typescript
POST /api/admin/disputes/:id/resolve
{
  resolution: 'FULL_REFUND' | 'PARTIAL_REFUND' | 'REJECT_DISPUTE',
  refund_amount?: number,
  admin_notes: string
}
```

---

## 7. DATABASE SCHEMA

### 📊 Các Bảng Chính

```sql
-- Orders table
orders {
  id VARCHAR(36) PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE,
  buyer_id VARCHAR(36),
  seller_id VARCHAR(36),
  listing_id VARCHAR(36),
  quote_id VARCHAR(36),
  status ENUM(...),  -- See status flow above
  subtotal DECIMAL(12,2),
  tax DECIMAL(12,2),
  fees DECIMAL(12,2),
  total DECIMAL(12,2),
  currency VARCHAR(3),
  
  -- Timestamps
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  payment_verified_at TIMESTAMP,
  ready_date TIMESTAMP,
  delivered_at TIMESTAMP,
  receipt_confirmed_at TIMESTAMP,
  receipt_confirmed_by VARCHAR(36),
  
  -- JSON data
  receipt_data_json JSON,
  notes TEXT
}

-- Order items
order_items {
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36),
  item_type VARCHAR(50),
  ref_id VARCHAR(36),
  description TEXT,
  qty INT,
  unit_price DECIMAL(12,2),
  total_price DECIMAL(12,2)
}

-- Payments
payments {
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36),
  method VARCHAR(50),
  amount DECIMAL(12,2),
  currency VARCHAR(3),
  status ENUM('PENDING_VERIFICATION', 'COMPLETED', 'FAILED', 'ON_HOLD', 'RELEASED'),
  verified_at TIMESTAMP,
  verified_by VARCHAR(36),
  notes TEXT,
  created_at TIMESTAMP
}

-- Deliveries
deliveries {
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36),
  batch_number INT,
  total_batches INT,
  status ENUM('SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'CONFIRMED'),
  tracking_number VARCHAR(100),
  carrier_name VARCHAR(100),
  
  -- Addresses
  dropoff_address TEXT,
  delivery_address TEXT,
  
  -- Timestamps
  scheduled_date TIMESTAMP,
  booked_at TIMESTAMP,
  in_transit_at TIMESTAMP,
  delivered_at TIMESTAMP,
  receipt_confirmed_at TIMESTAMP,
  
  -- Delivery details
  driver_info_json JSON,
  delivery_proof_json JSON,
  eir_data_json JSON,
  receipt_data_json JSON,
  
  -- Contact
  delivery_contact VARCHAR(100),
  delivery_phone VARCHAR(20)
}

-- Delivery Containers (Many-to-Many)
delivery_containers {
  id VARCHAR(36) PRIMARY KEY,
  delivery_id VARCHAR(36),
  container_id VARCHAR(36),
  container_iso_code VARCHAR(50),
  
  -- Individual container delivery status
  delivered_at TIMESTAMP,
  received_by VARCHAR(100),
  condition_notes JSON,
  signature_url TEXT,
  
  -- Transport booking
  transportation_booked_at TIMESTAMP,
  transport_method VARCHAR(50),
  logistics_company VARCHAR(100),
  transport_notes JSON
}

-- Order Preparations
order_preparations {
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36),
  seller_id VARCHAR(36),
  status ENUM('PREPARING', 'READY', 'CANCELLED'),
  
  -- Preparation
  preparation_started_at TIMESTAMP,
  preparation_completed_at TIMESTAMP,
  estimated_ready_date TIMESTAMP,
  preparation_notes TEXT,
  inspection_photos_json JSON,
  document_urls_json JSON,
  
  -- Pickup info
  pickup_location_json JSON,
  pickup_contact_name VARCHAR(100),
  pickup_contact_phone VARCHAR(20),
  pickup_instructions TEXT,
  pickup_available_from TIMESTAMP,
  pickup_available_to TIMESTAMP
}

-- Disputes
disputes {
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36),
  raised_by VARCHAR(36),
  status ENUM('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'),
  reason VARCHAR(255),
  description TEXT,
  evidence_json JSON,
  requested_resolution VARCHAR(50),
  requested_amount DECIMAL(12,2),
  priority VARCHAR(20),
  
  -- Resolution
  resolved_at TIMESTAMP,
  resolved_by VARCHAR(36),
  resolution_notes TEXT,
  final_decision VARCHAR(50),
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
}

-- Listing Containers
listing_containers {
  id VARCHAR(36) PRIMARY KEY,
  listing_id VARCHAR(36),
  container_iso_code VARCHAR(50) UNIQUE,
  status ENUM('AVAILABLE', 'RESERVED', 'SOLD', 'RENTED', 'IN_TRANSIT'),
  
  -- Order links
  sold_to_order_id VARCHAR(36),
  rented_to_order_id VARCHAR(36),
  
  -- Timestamps
  sold_at TIMESTAMP,
  rented_at TIMESTAMP,
  rental_return_date TIMESTAMP,
  
  -- Delivery links
  delivery_containers → Many records
}
```

---

## 8. API ENDPOINTS

### 📡 Danh Sách API Endpoints

#### **A. Order Creation**
```
POST   /api/orders/from-listing    - Create order from listing (direct buy)
POST   /api/orders                 - Create order from quote
POST   /api/cart/checkout          - Create orders from cart
```

#### **B. Order Management**
```
GET    /api/orders                 - List orders (buyer/seller)
GET    /api/orders/:id             - Get order detail
GET    /api/orders/:id/tracking    - Get tracking info
PUT    /api/orders/:id/status      - Update order status
POST   /api/orders/:id/cancel      - Cancel order
```

#### **C. Payment**
```
POST   /api/orders/:id/pay                 - Buyer pays order
POST   /api/orders/:id/payment-verify      - Seller verifies payment
GET    /api/payments/history               - Payment history
```

#### **D. Preparation & Delivery**
```
POST   /api/orders/:id/prepare-delivery    - Seller starts preparation
POST   /api/orders/:id/mark-ready          - Seller marks ready for pickup
POST   /api/orders/:id/start-delivering    - Seller starts delivery
POST   /api/orders/:id/mark-delivered      - Seller confirms delivered
```

#### **E. Receipt Confirmation**
```
POST   /api/orders/:id/confirm-receipt     - Buyer confirms receipt
POST   /api/orders/:id/raise-dispute       - Buyer raises dispute
```

#### **F. Deliveries**
```
POST   /api/deliveries/schedule            - Schedule delivery
POST   /api/deliveries/schedule-batch      - Schedule batch deliveries
GET    /api/deliveries/order/:orderId      - Get order deliveries
POST   /api/deliveries/:id/mark-delivered  - Mark delivery delivered
POST   /api/deliveries/:id/confirm-receipt - Confirm delivery receipt
```

#### **G. Admin**
```
GET    /api/admin/orders                   - List all orders
POST   /api/admin/disputes/:id/resolve     - Resolve dispute
POST   /api/admin/payments/release         - Manual payment release
```

---

## 🎯 SUMMARY

### Quy Trình Hoàn Chỉnh (Happy Path)

```
1. CREATE ORDER (from listing/quote/cart)
   → Status: PENDING_PAYMENT
   → Inventory reserved

2. BUYER PAYS
   → Status: PAYMENT_PENDING_VERIFICATION
   → Escrow holds funds

3. SELLER VERIFIES PAYMENT
   → Status: PAID
   → Funds in escrow

4. SELLER PREPARES
   → Status: PREPARING_DELIVERY
   → Inspection, documents

5. SELLER MARKS READY
   → Status: READY_FOR_PICKUP
   → Pickup info provided

6. TRANSPORTATION BOOKED
   → Status: TRANSPORTATION_BOOKED
   → Delivery scheduled

7. SELLER STARTS DELIVERY
   → Status: IN_TRANSIT
   → Tracking available

8. SELLER MARKS DELIVERED
   → Status: DELIVERED
   → Delivery proof uploaded

9. BUYER CONFIRMS RECEIPT (GOOD)
   → Status: COMPLETED
   → Payment release scheduled

10. PAYMENT RELEASED (after 7 days)
    → Seller receives funds
    → Transaction complete
```

### Thời Gian Ước Tính

```
Day 0:  Order created → Payment pending
Day 1:  Buyer pays → Seller verifies
Day 2:  Seller prepares (1-3 days)
Day 5:  Ready for pickup → Transport booked
Day 7:  Delivery in transit
Day 8:  Delivered → Buyer confirms
Day 15: Payment auto-released (7 days after confirm)
```

### Key Features

✅ **Inventory Management**
- Auto-reserve on order creation
- Auto-release on cancel/reject
- Support partial delivery

✅ **Payment Escrow**
- Buyer pays first
- Seller verifies
- Platform holds
- Auto-release after 7 days

✅ **Flexible Delivery**
- Batch delivery support
- Multiple carriers
- Real-time tracking
- EIR documentation

✅ **Dispute Handling**
- Buyer can report damage
- Payment on hold
- Admin resolution
- Full audit trail

✅ **Notifications**
- Real-time updates
- Email + in-app
- Both buyer & seller
- Admin alerts

---

**Ngày cập nhật:** 11/11/2025  
**Version:** 1.0  
**Status:** ✅ Production Ready
