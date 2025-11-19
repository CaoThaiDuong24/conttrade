# 📦 PHÂN TÍCH LUỒNG ĐƠN HÀNG THỰC TẾ

**Ngày:** 11/11/2025  
**Mục đích:** Phân tích chi tiết cách vận hành từ lúc tạo đơn hàng cho đến hoàn thành

---

## 📋 BẢNG TỔNG HỢP API & MÀN HÌNH

| Bước | Tên Bước | API Endpoint | Màn Hình Frontend | Người Dùng |
|------|----------|--------------|-------------------|------------|
| 1️⃣ | Tạo đơn hàng | `POST /api/v1/orders/from-listing` | `/orders/create` | BUYER |
| 2️⃣ | Buyer thanh toán | `POST /api/v1/orders/:id/pay` | `/orders/:id/pay` | BUYER |
| 3️⃣ | Seller xác nhận payment | `POST /api/v1/orders/:id/payment-verify` | `/orders/:id` (alert box) | SELLER |
| 4️⃣ | Seller chuẩn bị hàng | `POST /api/v1/orders/:id/prepare-delivery` | `/orders/:id` (dialog) | SELLER |
| 5️⃣ | Seller đánh dấu sẵn sàng | `POST /api/v1/orders/:id/mark-ready` | `/orders/:id` (dialog) | SELLER |
| 6️⃣ | Đặt vận chuyển batch | `POST /api/v1/orders/:id/schedule-delivery-batch` | `/orders/:id` (modal) | BUYER/SELLER |
| 7️⃣A | Bắt đầu vận chuyển | `POST /api/v1/orders/:id/start-delivering` | `/orders/:id` | SELLER |
| 7️⃣B | Xác nhận đã giao | `POST /api/v1/deliveries/:id/mark-delivered` | `/orders/:id` | SELLER |
| 8️⃣ | Buyer xác nhận nhận hàng | `POST /api/v1/deliveries/:id/confirm-receipt` | `/orders/:id` (dialog) | BUYER |
| 9️⃣ | Release payment | Auto (Cron) hoặc `/api/v1/payments/:id/release` | `/orders/:id` (view) | AUTO |

---

## 🎯 TỔNG QUAN LUỒNG

```
TẠO ĐƠN → THANH TOÁN → CHUẨN BỊ → VẬN CHUYỂN → XÁC NHẬN → HOÀN TẤT
  (1)        (2-3)       (4-5)        (6-7)        (8)        (9)
```

### Timeline Ước Tính
- **Ngày 0:** Tạo đơn hàng → Chờ thanh toán
- **Ngày 1:** Buyer thanh toán → Seller xác nhận
- **Ngày 2-4:** Seller chuẩn bị hàng
- **Ngày 5:** Sẵn sàng → Đặt vận chuyển
- **Ngày 7:** Giao hàng
- **Ngày 8:** Buyer xác nhận
- **Ngày 15:** Tự động release payment (7 ngày sau khi confirm)

---

## BƯỚC 1️⃣: TẠO ĐƠN HÀNG

### 🎯 API & Màn Hình

**Backend API:**
- Endpoint: `POST /api/v1/orders/from-listing`
- File: `backend/src/routes/orders.ts` (line 651-838)

**Frontend Screens:**
- Trang: `/orders/create` (Create Order Page)
- File: `frontend/app/[locale]/orders/create/page.tsx` (line 177)
- Component: `DirectOrderForm` (`frontend/components/orders/direct-order-form.tsx` line 183)
- Người dùng: **BUYER** (người mua)

### 📍 Có 3 Cách Tạo Đơn

#### **Cách A: Mua Trực Tiếp Từ Listing (Phổ biến nhất)**

**Flow Frontend:**
```
1. Buyer xem listing → /listings/:id
2. Click "Mua ngay" → Redirect to /orders/create?listingId=xxx
3. Điền form tại CreateOrderPage:
   - Quantity (tự động hoặc nhập)
   - Delivery address
   - Notes
   - Chọn containers cụ thể (optional)
4. Click "Xác nhận tạo đơn hàng"
5. Frontend gọi API: POST /api/v1/orders/from-listing
6. Redirect → /orders/:id (Trang chi tiết đơn)
```

**Code Backend:** `POST /api/v1/orders/from-listing`

```typescript
// File: backend/src/routes/orders.ts
// Dòng ~600-800

Input:
{
  listingId: "abc-123",
  quantity: 5,
  agreedPrice: 50000000,
  currency: "VND",
  deliveryAddress: { street, city, province, zipCode },
  notes: "Cần giao trước 20/11",
  selected_container_ids: ["CONT-001", "CONT-002", ...]  // Optional
}

Process trong Transaction:
1. Validate listing (approved, available)
2. Validate containers (nếu chọn cụ thể)
3. Calculate totals:
   subtotal = agreedPrice * quantity
   tax = subtotal * 0.1
   platformFee = subtotal * 0.02
   total = subtotal + tax + platformFee

4. Create Order:
   status: PENDING_PAYMENT
   order_number: "ORD-{timestamp}-{random}"

5. Create Order Items:
   item_type: "listing"
   qty: quantity
   unit_price: agreedPrice
   total_price: agreedPrice * quantity

6. 🔑 QUAN TRỌNG - Reserve Inventory:
   → Gọi InventoryService.reserveInventory()
   → Giảm listing.available_quantity
   → Đánh dấu containers là SOLD/RESERVED
   
7. Tạo notification cho seller

Output: Order với status PENDING_PAYMENT
```

**InventoryService (Quan Trọng!):**

```typescript
// File: backend/src/lib/inventory/inventory-service.ts

async reserveInventory(orderId, listingId, quantity, containerIds?) {
  // 1. Kiểm tra đủ hàng không
  const listing = await prisma.listings.findUnique({
    where: { id: listingId }
  });
  
  if (listing.available_quantity < quantity) {
    throw new Error("Không đủ hàng!");
  }

  // 2. Giảm số lượng available
  await prisma.listings.update({
    where: { id: listingId },
    data: {
      available_quantity: { decrement: quantity }
    }
  });

  // 3. Đánh dấu containers cụ thể (nếu có)
  if (containerIds) {
    await prisma.listing_containers.updateMany({
      where: {
        listing_id: listingId,
        container_iso_code: { in: containerIds },
        status: 'AVAILABLE'
      },
      data: {
        status: 'SOLD',
        sold_to_order_id: orderId,
        sold_at: now
      }
    });
  }
}
```

**Database Changes:**
```sql
-- Bảng orders: Record mới
INSERT INTO orders (
  id, buyer_id, seller_id, listing_id,
  status = 'PENDING_PAYMENT',
  subtotal, tax, fees, total,
  order_number
);

-- Bảng order_items: Items
INSERT INTO order_items (order_id, item_type, qty, unit_price);

-- Bảng listings: Giảm available
UPDATE listings 
SET available_quantity = available_quantity - 5
WHERE id = 'listing-123';

-- Bảng listing_containers: Đánh dấu SOLD
UPDATE listing_containers 
SET status = 'SOLD', 
    sold_to_order_id = 'order-456',
    sold_at = NOW()
WHERE container_iso_code IN ('CONT-001', 'CONT-002', ...);
```

---

#### **Cách B: Từ RFQ/Quote**

```
1. Buyer tạo RFQ
2. Seller tạo Quote
3. Buyer accept quote
   → Tự động tạo order
   → Same process như Cách A
   → Nhưng có thêm quote_id
```

#### **Cách C: Từ Cart (Checkout Nhiều Items)**

```
1. Buyer thêm items vào cart
2. Click checkout
3. Backend tạo nhiều orders (1 order/seller)
4. Mỗi order process riêng
```

---

## BƯỚC 2️⃣: BUYER THANH TOÁN

### 🎯 API & Màn Hình

**Backend API:**
- Endpoint: `POST /api/v1/orders/:id/pay`
- File: `backend/src/routes/orders.ts` (line 903-1005)

**Frontend Screens:**
- Trang: `/orders/:id/pay` (Payment Page)
- File: `frontend/app/[locale]/orders/[id]/pay/page.tsx` (line 163)
- Component: `EscrowPaymentForm` (`frontend/components/payments/escrow-payment-form.tsx` line 190)
- Người dùng: **BUYER** (người mua)

**Flow Frontend:**
```
1. Buyer vào order detail → /orders/:id
2. Thấy status: PENDING_PAYMENT
3. Thấy nút "Thanh toán"
4. Click → Redirect /orders/:id/pay (Payment Page)
5. Chọn phương thức tại Payment Page:
   - Bank transfer
   - Credit card
   - E-wallet
6. Upload proof (ảnh chuyển khoản)
7. Click "Xác nhận thanh toán"
8. Frontend gọi API: POST /api/v1/orders/:id/pay
9. Redirect back to /orders/:id với status mới
```

**Code Backend:** `POST /api/v1/orders/:id/pay`

```typescript
// File: backend/src/routes/orders.ts
// Dòng ~850-920

Input:
{
  method: "bank_transfer",
  amount: 55000000,
  currency: "VND"
}

Process:
1. Validate order status = PENDING_PAYMENT
2. Validate buyer permission

3. Gọi PaymentService.processEscrowPayment():
   → Tạo payment record (status: PENDING)
   → Update order status: PAYMENT_PENDING_VERIFICATION
   
4. Notification:
   → Seller: "Buyer đã thanh toán - Cần xác nhận"
   → Buyer: "Đã ghi nhận thanh toán"

Output: Order status → PAYMENT_PENDING_VERIFICATION
```

**PaymentService:**

```typescript
// File: backend/src/lib/payments/payment-service-simple.ts

async processEscrowPayment(orderId, method, amount) {
  return await prisma.$transaction(async (tx) => {
    // 1. Update order status
    await tx.orders.update({
      where: { id: orderId },
      data: { status: 'PAYMENT_PENDING_VERIFICATION' }
    });

    // 2. Tạo payment record
    const payment = await tx.payments.create({
      data: {
        id: `PAY-${Date.now()}-${orderId.slice(-4)}`,
        order_id: orderId,
        amount: amount,
        provider: 'BANK_TRANSFER',
        method: method,
        status: 'PENDING',  // Chờ seller verify
        paid_at: now
      }
    });

    return {
      success: true,
      paymentId: payment.id,
      status: 'payment_pending_verification'
    };
  });
}
```

**Database Changes:**
```sql
-- Update order
UPDATE orders 
SET status = 'PAYMENT_PENDING_VERIFICATION'
WHERE id = 'order-456';

-- Tạo payment record
INSERT INTO payments (
  id, order_id, amount, 
  status = 'PENDING',
  paid_at = NOW()
);

-- Tạo notification
INSERT INTO notifications (
  user_id = seller_id,
  type = 'payment_pending_verification',
  message = 'Buyer đã thanh toán - Cần xác nhận'
);
```

---

## BƯỚC 3️⃣: SELLER XÁC NHẬN PAYMENT

### 🎯 API & Màn Hình

**Backend API:**
- Endpoint: `POST /api/v1/orders/:id/payment-verify`
- File: `backend/src/routes/orders.ts` (line 1005-1228)

**Frontend Screens:**
- Trang: `/orders/:id` (Order Detail Page - Seller View)
- File: `frontend/app/[locale]/orders/[id]/page.tsx` (line 321)
- Component: `PaymentVerificationAlert` (`frontend/components/orders/PaymentVerificationAlert.tsx`)
- Người dùng: **SELLER** (người bán)

**Flow Frontend (Seller):**
```
1. Seller nhận notification: "Buyer đã thanh toán"
2. Vào order detail → /orders/:id
3. Thấy status: PAYMENT_PENDING_VERIFICATION
4. Thấy alert box: "Kiểm tra tài khoản ngân hàng"
5. Kiểm tra bank account (đã nhận tiền chưa)
6. Click:
   - "Xác nhận đã nhận tiền" (verified: true)
   - HOẶC "Từ chối" (verified: false)
7. Nếu từ chối → Nhập lý do trong dialog
8. Click "Submit"
9. Frontend gọi API: POST /api/v1/orders/:id/payment-verify
10. Page reload với status mới
```

**Code Backend:** `POST /api/v1/orders/:id/payment-verify`

```typescript
// File: backend/src/routes/orders.ts
// Dòng ~1050-1200

Input:
{
  verified: true,  // hoặc false
  notes: "Đã nhận tiền vào STK",
  paymentProofUrls: ["url1", "url2"]
}

Process:

IF verified = TRUE:
  1. Update payment:
     status: COMPLETED
     verified_at: now
     verified_by: seller_id
  
  2. Update order:
     status: PAID
     payment_verified_at: now
  
  3. Notifications:
     → Buyer: "Thanh toán đã được xác nhận"
     → Seller: "Có thể bắt đầu chuẩn bị hàng"

IF verified = FALSE:
  Transaction:
    1. Update payment: status = FAILED
    2. Update order: status = PENDING_PAYMENT (quay lại)
    
    3. 🔑 QUAN TRỌNG - Release Inventory:
       → Gọi InventoryService.releaseInventory()
       → Tăng listing.available_quantity
       → Đổi containers về AVAILABLE
    
    4. Notification:
       → Buyer: "Payment bị từ chối - Cần thanh toán lại"
```

**InventoryService - Release:**

```typescript
async releaseInventory(orderId, listingId, quantity) {
  // 1. Tăng available quantity
  await prisma.listings.update({
    where: { id: listingId },
    data: {
      available_quantity: { increment: quantity }
    }
  });

  // 2. Reset containers về AVAILABLE
  await prisma.listing_containers.updateMany({
    where: { sold_to_order_id: orderId },
    data: {
      status: 'AVAILABLE',
      sold_to_order_id: null,
      sold_at: null
    }
  });
}
```

**Database Changes (Nếu Approve):**
```sql
UPDATE payments 
SET status = 'COMPLETED',
    verified_at = NOW(),
    verified_by = 'seller-id'
WHERE id = 'payment-789';

UPDATE orders
SET status = 'PAID',
    payment_verified_at = NOW()
WHERE id = 'order-456';
```

**Database Changes (Nếu Reject):**
```sql
UPDATE payments SET status = 'FAILED';
UPDATE orders SET status = 'PENDING_PAYMENT';

-- Restore inventory
UPDATE listings 
SET available_quantity = available_quantity + 5;

UPDATE listing_containers 
SET status = 'AVAILABLE',
    sold_to_order_id = NULL,
    sold_at = NULL
WHERE sold_to_order_id = 'order-456';
```

---

## BƯỚC 4️⃣: SELLER CHUẨN BỊ HÀNG

### 🎯 API & Màn Hình

**Backend API:**
- Endpoint: `POST /api/v1/orders/:id/prepare-delivery`
- File: `backend/src/routes/orders.ts` (line 1233-1375)

**Frontend Screens:**
- Trang: `/orders/:id` (Order Detail Page - Seller View)
- File: `frontend/app/[locale]/orders/[id]/page.tsx`
- Component: `PrepareDeliveryForm` (`frontend/components/orders/PrepareDeliveryForm.tsx` line 83)
- Người dùng: **SELLER** (người bán)

**Flow Frontend (Seller):**
```
1. Order status = PAID
2. Seller vào order detail → /orders/:id
3. Thấy button "Bắt đầu chuẩn bị hàng"
4. Click button → Hiện dialog PrepareDeliveryForm
5. Điền form trong dialog:
   - Ngày dự kiến sẵn sàng (estimated ready date)
   - Ghi chú chuẩn bị (preparation notes)
   - Upload ảnh inspection
   - Upload documents (certificates, inspection reports)
   - Ghi chú về tình trạng hàng (condition notes)
6. Click "Xác nhận"
7. Frontend gọi API: POST /api/v1/orders/:id/prepare-delivery
8. Dialog đóng, order detail reload với status mới: PREPARING_DELIVERY
```

**Code Backend:** `POST /api/v1/orders/:id/prepare-delivery`

```typescript
// File: backend/src/routes/orders.ts
// Dòng ~1250-1350

Input:
{
  estimatedReadyDate: "2025-11-15",
  preparationNotes: "Kiểm tra container, làm sạch",
  photos: ["photo1.jpg", "photo2.jpg"],
  documents: [
    { type: "certificate", url: "cert.pdf", name: "Safety Cert" }
  ]
}

Process:
1. Validate seller permission
2. Validate order status = PAID

3. Tạo order_preparations record:
   status: PREPARING
   preparation_started_at: now
   estimated_ready_date
   photos, documents

4. Update order status: PREPARING_DELIVERY

5. Notification:
   → Buyer: "Seller đang chuẩn bị hàng"

Output: Order status → PREPARING_DELIVERY
```

**Database Changes:**
```sql
-- Tạo preparation record
INSERT INTO order_preparations (
  id, order_id, seller_id,
  status = 'PREPARING',
  preparation_started_at = NOW(),
  estimated_ready_date = '2025-11-15',
  preparation_notes,
  inspection_photos_json,
  document_urls_json
);

-- Update order
UPDATE orders 
SET status = 'PREPARING_DELIVERY'
WHERE id = 'order-456';
```

---

## BƯỚC 5️⃣: SELLER ĐÁNH DẤU SẴN SÀNG

### 🎯 API & Màn Hình

**Backend API:**
- Endpoint: `POST /api/v1/orders/:id/mark-ready`
- File: `backend/src/routes/orders.ts` (line 1377-1558)

**Frontend Screens:**
- Trang: `/orders/:id` (Order Detail Page - Seller View)
- File: `frontend/app/[locale]/orders/[id]/page.tsx`
- Component: `MarkReadyForm` (`frontend/components/orders/MarkReadyForm.tsx` line 197)
- Người dùng: **SELLER** (người bán)

**Flow Frontend (Seller):**
```
1. Order status = PREPARING_DELIVERY
2. Chuẩn bị xong hàng
3. Seller vào order detail → /orders/:id
4. Click "Đánh dấu sẵn sàng giao hàng"
5. Hiện dialog MarkReadyForm, điền thông tin pickup:
   - Địa điểm lấy hàng (address, coordinates)
   - Người liên hệ + SĐT
   - Khung giờ lấy hàng (from - to)
   - Hướng dẫn đặc biệt (special instructions)
   - Upload ảnh cuối cùng
6. Click "Xác nhận"
7. Frontend gọi API: POST /api/v1/orders/:id/mark-ready
8. Dialog đóng, order reload với status: READY_FOR_PICKUP
```

**Code Backend:** `POST /api/v1/orders/:id/mark-ready`

```typescript
// File: backend/src/routes/orders.ts
// Dòng ~1400-1500

Input:
{
  pickupLocation: {
    address: "123 Depot St",
    latitude: 10.123,
    longitude: 106.456
  },
  pickupContact: {
    name: "Nguyễn Văn A",
    phone: "0901234567"
  },
  pickupTimeWindow: {
    from: "2025-11-15 08:00",
    to: "2025-11-15 17:00"
  },
  specialInstructions: "Cần xe nâng, cổng số 2"
}

Process:
1. Update order_preparations:
   status: READY
   preparation_completed_at: now
   pickup_location_json
   pickup_contact_name, pickup_contact_phone
   pickup_instructions
   pickup_available_from, pickup_available_to

2. Update order status: READY_FOR_PICKUP

3. Notification:
   → Buyer: "Container sẵn sàng! Vui lòng đặt vận chuyển"

Output: Order status → READY_FOR_PICKUP
```

**Database Changes:**
```sql
UPDATE order_preparations
SET status = 'READY',
    preparation_completed_at = NOW(),
    pickup_location_json = '{"address": "123 Depot St", ...}',
    pickup_contact_name = 'Nguyễn Văn A',
    pickup_contact_phone = '0901234567',
    pickup_instructions = 'Cần xe nâng...',
    pickup_available_from = '2025-11-15 08:00',
    pickup_available_to = '2025-11-15 17:00'
WHERE order_id = 'order-456';

UPDATE orders
SET status = 'READY_FOR_PICKUP',
    ready_date = NOW()
WHERE id = 'order-456';
```

---

## BƯỚC 6️⃣: ĐẶT VẬN CHUYỂN (BATCH DELIVERY)

### 🎯 API & Màn Hình

**Backend API:**
- Endpoint: `POST /api/v1/orders/:id/schedule-delivery-batch`
- File: `backend/src/routes/orders.ts` (line 3115-3428)

**Frontend Screens:**
- Trang: `/orders/:id` (Order Detail Page - Buyer/Seller View)
- File: `frontend/app/[locale]/orders/[id]/page.tsx`
- Component: `ScheduleDeliveryBatchModal` (`frontend/components/orders/schedule-delivery-batch-modal.tsx` line 251)
- Người dùng: **BUYER** hoặc **SELLER** (tuỳ cấu hình)

**⭐ Đặc Điểm Quan Trọng: Hỗ Trợ Giao Từng Batch**

Nếu order có nhiều containers, có thể giao từng batch (không cần giao hết cùng lúc).

**Flow Frontend (Buyer/Seller):**
```
1. Order status = READY_FOR_PICKUP hoặc TRANSPORTATION_BOOKED
2. Vào order detail → /orders/:id
3. Click "Đặt vận chuyển" hoặc "Schedule Delivery"
4. Hiện modal ScheduleDeliveryBatchModal
5. Chọn containers muốn giao trong batch này:
   ☑ CONT-001 (checked)
   ☑ CONT-002 (checked)
   ☐ CONT-003 (unchecked - giao lần sau)
6. Điền thông tin trong modal:
   - Địa chỉ giao (delivery address)
   - Người nhận + SĐT
   - Ngày giao dự kiến
   - Carrier (nếu có)
   - Ghi chú
7. Click "Xác nhận đặt vận chuyển"
8. Frontend gọi API: POST /api/v1/orders/:id/schedule-delivery-batch
9. Modal đóng, hiện danh sách deliveries với batch mới tạo
```

**Code Backend:** `POST /api/v1/orders/:id/schedule-delivery-batch`
   - Ngày giờ giao
   - Yêu cầu đặc biệt (cần cẩu, xe nâng)
5. Submit
```

**Code Backend:** `POST /api/orders/:id/schedule-delivery-batch`

```typescript
// File: backend/src/routes/orders.ts
// Dòng ~3200-3550

Input:
{
  containerIds: ["cont-id-1", "cont-id-2"],  // Chọn 2/5 containers
  deliveryAddress: "456 Buyer Street",
  deliveryContact: "Trần Văn B",
  deliveryPhone: "0912345678",
  deliveryDate: "2025-11-17",
  deliveryTime: "09:00",
  needsCrane: true,
  specialInstructions: "Gọi trước 30 phút",
  transportationFee: 5000000
}

Process trong Transaction:
1. Validate containers thuộc order
2. Kiểm tra containers chưa được schedule
3. Tính batch info:
   - Total containers trong order: 5
   - Containers đã schedule trước: 0
   - Containers batch này: 2
   - Batch number: 1
   - Estimated total batches: 3 (5/2 = ~3)

4. Tạo delivery record:
   status: SCHEDULED
   batch_number: 1
   total_batches: 3
   containers_count: 2
   is_partial_delivery: true

5. Tạo delivery_containers records:
   Link containers với delivery
   Đánh dấu transportation_booked_at
   Store transport_notes

6. Update listing_containers:
   delivery_status: SCHEDULED
   scheduled_delivery_date

7. Update order status: TRANSPORTATION_BOOKED

8. Tạo delivery_event

Output: Delivery Batch 1/3 đã schedule
```

**Database Changes:**
```sql
-- Tạo delivery (batch 1)
INSERT INTO deliveries (
  id, order_id,
  batch_number = 1,
  total_batches = 3,
  containers_count = 2,
  is_partial_delivery = true,
  status = 'SCHEDULED',
  delivery_address = '456 Buyer Street',
  delivery_date = '2025-11-17',
  delivery_time = '09:00',
  needs_crane = true,
  transportation_fee = 5000000,
  booked_at = NOW()
);

-- Link containers
INSERT INTO delivery_containers (
  delivery_id, container_id, container_iso_code,
  transportation_booked_at = NOW(),
  transport_method = 'logistics',
  transport_notes = '{"deliveryAddress": "456...", ...}'
);

-- Update containers status
UPDATE listing_containers
SET delivery_status = 'SCHEDULED',
    scheduled_delivery_date = '2025-11-17'
WHERE id IN ('cont-id-1', 'cont-id-2');

-- Update order
UPDATE orders
SET status = 'TRANSPORTATION_BOOKED'
WHERE id = 'order-456';
```

---

## BƯỚC 7️⃣: VẬN CHUYỂN & GIAO HÀNG

### 7A. Seller Bắt Đầu Vận Chuyển

**Backend API:**
- Endpoint: `POST /api/v1/orders/:id/start-delivering`
- File: `backend/src/routes/orders.ts` (line 1560-1750)

**Frontend Screens:**
- Trang: `/orders/:id` (Order Detail Page - Seller View)
- Component: Inline form hoặc dialog
- Người dùng: **SELLER**

**Flow:** Seller click "Bắt đầu giao hàng", điền thông tin carrier & tracking

**Code Backend:** `POST /api/v1/orders/:id/start-delivering`

```typescript
Input:
{
  carrierName: "Viettel Post",
  trackingNumber: "VTP123456789",
  driverInfo: {
    name: "Lê Văn C",
    phone: "0923456789"
  },
  estimatedDeliveryDate: "2025-11-17 14:00"
}

Process:
1. Update delivery:
   status: IN_TRANSIT
   in_transit_at: now
   carrier_name, tracking_number
   driver_info_json

2. Update order status: IN_TRANSIT

3. Notification:
   → Buyer: "Đơn hàng đang vận chuyển"
```

**Database Changes:**
```sql
UPDATE deliveries
SET status = 'IN_TRANSIT',
    in_transit_at = NOW(),
    carrier_name = 'Viettel Post',
    tracking_number = 'VTP123456789',
    driver_info_json = '{"name": "Lê Văn C", ...}'
WHERE id = 'delivery-123';

UPDATE orders
SET status = 'IN_TRANSIT'
WHERE id = 'order-456';
```

---

### 7B. Seller Xác Nhận Đã Giao (Mark Delivered)

**Backend API:**
- Endpoint: `POST /api/v1/deliveries/:deliveryId/mark-delivered`
- File: `backend/src/routes/deliveries.ts` (line 390-700)

**Frontend Screens:**
- Trang: `/orders/:id` (Order Detail Page - Seller View)
- Component: `BatchDeliveryManagement` (`frontend/components/orders/BatchDeliveryManagement.tsx` line 112)
- Component: `MarkDeliveredForm` (`frontend/components/orders/MarkDeliveredForm.tsx`)
- Người dùng: **SELLER** hoặc **CARRIER**

**Flow Frontend:**
```
1. Seller/carrier đã giao hàng tại địa điểm
2. Vào order detail → /orders/:id
3. Trong phần "Deliveries", tìm batch vừa giao
4. Click "Mark as Delivered" cho batch đó
5. Hiện form MarkDeliveredForm, điền:
   - Thời gian giao thực tế
   - Địa điểm giao (coordinates)
   - Upload ảnh proof of delivery (POD)
   - EIR data (Equipment Interchange Receipt)
   - Tên người nhận
   - Chữ ký người nhận
6. Click "Xác nhận đã giao"
7. Frontend gọi API: POST /api/v1/deliveries/:deliveryId/mark-delivered
8. Batch status update → DELIVERED
```

**Code Backend:** `POST /api/v1/deliveries/:deliveryId/mark-delivered`

```typescript
// File: backend/src/routes/deliveries.ts
// Dòng ~390-700

Input:
{
  deliveredAt: "2025-11-17 14:30",
  deliveryLocation: { lat, lng },
  deliveryProof: ["photo1.jpg", "photo2.jpg"],
  eirData: { /* Equipment Interchange Receipt */ },
  receivedByName: "Trần Văn B",
  receivedBySignature: "signature-base64",
  containerIds: ["cont-id-1", "cont-id-2"]  // Optional
}

Process trong Transaction:
1. Kiểm tra có giao hết containers trong batch không
   - Total containers in this batch: 2
   - Containers được giao lần này: 2
   - All delivered: true

2. Update delivery:
   status: DELIVERED (nếu all delivered)
   delivered_at: now
   delivery_proof_json, eir_data_json

3. Update delivery_containers:
   delivered_at: now
   received_by, signature_url

4. Update listing_containers:
   delivery_status: DELIVERED
   actual_delivery_date: now

5. Kiểm tra ALL deliveries của order:
   - Batch 1/3: DELIVERED ✓
   - Batch 2/3: Not yet
   - Batch 3/3: Not yet
   → Một số đã giao → PARTIALLY_DELIVERED

6. Update order status:
   - Nếu all batches delivered: DELIVERED
   - Nếu một số batches: PARTIALLY_DELIVERED

7. Create delivery_event

Output: Batch 1/3 delivered successfully
```

**Database Changes:**
```sql
UPDATE deliveries
SET status = 'DELIVERED',
    delivered_at = NOW(),
    delivery_proof_json = '["photo1.jpg", ...]'
WHERE id = 'delivery-123';

UPDATE delivery_containers
SET delivered_at = NOW(),
    received_by = 'Trần Văn B',
    signature_url = 'signature-base64'
WHERE delivery_id = 'delivery-123'
  AND container_id IN ('cont-id-1', 'cont-id-2');

UPDATE listing_containers
SET delivery_status = 'DELIVERED',
    actual_delivery_date = NOW()
WHERE id IN ('cont-id-1', 'cont-id-2');

-- Order vẫn PARTIALLY_DELIVERED (vì còn batch 2,3)
UPDATE orders
SET status = 'PARTIALLY_DELIVERED'
WHERE id = 'order-456';
```

---

## BƯỚC 8️⃣: BUYER XÁC NHẬN NHẬN HÀNG

### 🎯 API & Màn Hình

**Backend API:**
- Endpoint: `POST /api/v1/deliveries/:deliveryId/confirm-receipt`
- File: `backend/src/routes/deliveries.ts` (line 730-1150)

**Frontend Screens:**
- Trang: `/orders/:id` (Order Detail Page - Buyer View)
- Component: `BatchReceiptConfirmationDialog` (`frontend/components/orders/BatchReceiptConfirmationDialog.tsx` line 86)
- Component: `ConfirmContainerReceiptDialog` (`frontend/components/orders/ConfirmContainerReceiptDialog.tsx`)
- Người dùng: **BUYER** (người mua)

**Flow Frontend (Buyer):**
```
1. Buyer nhận notification: "Batch 1/3 đã được giao"
2. Kiểm tra thực tế containers tại depot/địa chỉ giao
3. Vào order detail → /orders/:id
4. Trong phần "Deliveries", tìm batch đã giao
5. Click "Xác nhận nhận hàng" cho batch đó
6. Hiện dialog ConfirmReceiptDialog
7. Đánh giá tình trạng TỪNG container trong dialog:
   
   CONT-001:
   ● GOOD (Tốt)
   ○ MINOR_DAMAGE (Hư nhỏ)
   ○ MAJOR_DAMAGE (Hư nặng)
   Upload ảnh inspection, ghi chú
   
   CONT-002:
   ● GOOD
   
8. Điền thông tin chung:
   - Tên người nhận
   - Chữ ký điện tử
   - Overall notes
9. Click "Xác nhận"
10. Frontend gọi API: POST /api/v1/deliveries/:deliveryId/confirm-receipt
11. Dialog đóng, batch status update → CONFIRMED
```

**Code Backend:** `POST /api/v1/deliveries/:deliveryId/confirm-receipt`

```typescript
// File: backend/src/routes/deliveries.ts
// Dòng ~730-1150

Input:
{
  receivedBy: "Trần Văn B",
  conditions: [
    {
      containerId: "cont-id-1",
      condition: "GOOD",
      photos: ["good1.jpg"],
      notes: "Container trong tình trạng tốt"
    },
    {
      containerId: "cont-id-2",
      condition: "GOOD",
      photos: [],
      notes: ""
    }
  ],
  signature: "signature-base64",
  overallNotes: "Nhận hàng OK"
}

Process trong Transaction:
1. Validate phải đánh giá ALL containers trong batch

2. Kiểm tra có MAJOR_DAMAGE không:
   - GOOD: 2 containers
   - MINOR_DAMAGE: 0
   - MAJOR_DAMAGE: 0
   → Không có vấn đề

3. Update delivery_containers:
   condition_notes: JSON với condition + photos + notes
   received_by, signature_url

4. Update delivery:
   receipt_confirmed_at: now
   receipt_data_json

5. Kiểm tra ALL batches đã confirm chưa:
   - Batch 1/3: CONFIRMED ✓
   - Batch 2/3: Not yet
   - Batch 3/3: Not yet
   → PARTIALLY_CONFIRMED

6. Update order status:
   - Nếu all batches confirmed + no major damage: COMPLETED
   - Nếu all batches confirmed + có major damage: DISPUTED
   - Nếu một số batches: PARTIALLY_CONFIRMED

7. Nếu MAJOR_DAMAGE → Tạo dispute

Output: Batch 1/3 confirmed, order PARTIALLY_CONFIRMED
```

**Database Changes (Case GOOD):**
```sql
UPDATE delivery_containers
SET condition_notes = '{
  "condition": "GOOD",
  "photos": ["good1.jpg"],
  "notes": "Container tốt"
}',
received_by = 'Trần Văn B',
signature_url = 'signature-base64'
WHERE delivery_id = 'delivery-123';

UPDATE deliveries
SET receipt_confirmed_at = NOW(),
    receipt_data_json = '{
      "conditions": [...],
      "summary": {"good": 2, "minor": 0, "major": 0}
    }'
WHERE id = 'delivery-123';

-- Order vẫn PARTIALLY_CONFIRMED (chờ batch 2,3)
UPDATE orders
SET status = 'PARTIALLY_CONFIRMED'
WHERE id = 'order-456';
```

**Database Changes (Case MAJOR_DAMAGE):**
```sql
-- Same updates above +

-- Tạo dispute
INSERT INTO disputes (
  id, order_id, raised_by = buyer_id,
  status = 'OPEN',
  reason = 'Container(s) damaged on delivery',
  description = 'Buyer reported MAJOR_DAMAGE for 1 container(s)',
  evidence_json = '{
    "deliveryId": "delivery-123",
    "damagedContainers": [...]
  }',
  priority = 'HIGH'
);

-- Hold payment
UPDATE payments
SET status = 'ON_HOLD'
WHERE order_id = 'order-456';

-- Update order
UPDATE orders
SET status = 'DISPUTED'
WHERE id = 'order-456';
```

---

## BƯỚC 9️⃣: HOÀN TẤT & RELEASE PAYMENT

### 🎯 API & Màn Hình

**Backend API:**
- Endpoint: Tự động (Cron job) hoặc `POST /api/v1/payments/:id/release`
- File: `backend/src/routes/payments.ts` hoặc background job
- Trigger: Sau 7 ngày kể từ receipt_confirmed_at

**Frontend Screens:**
- Trang: `/orders/:id` (Order Detail Page - View Only)
- Component: Status badge hiển thị "PAYMENT_RELEASED"
- Người dùng: **BUYER** và **SELLER** (view only)

### Khi Tất Cả Batches Đã Confirm (GOOD)

**Tự động sau 7 ngày:**

```typescript
// Cron job hoặc manual trigger

IF order.status = COMPLETED
   AND receipt_confirmed_at + 7 days <= NOW
   AND payment.status != RELEASED:

Process:
1. Release payment to seller:
   - Transfer từ escrow → seller wallet
   - Deduct platform fee (2%)

2. Update payment:
   status: RELEASED
   released_at: now

3. Notifications:
   → Seller: "Payment released! Đã chuyển tiền"
   → Buyer: "Transaction hoàn tất"
```

**Database Changes:**
```sql
UPDATE payments
SET status = 'RELEASED',
    released_at = NOW(),
    released_amount = amount * 0.98  -- Trừ 2% phí
WHERE order_id = 'order-456';

UPDATE orders
SET status = 'PAYMENT_RELEASED'
WHERE id = 'order-456';
```

---

## 🎯 TỔNG KẾT LUỒNG HOÀN CHỈNH

### Timeline Thực Tế (Ví Dụ)

```
📅 Ngày 10/11 - 08:00
  → Buyer tạo đơn hàng (5 containers)
  → Status: PENDING_PAYMENT
  → Inventory: -5 containers từ listing

📅 Ngày 10/11 - 10:30
  → Buyer thanh toán 55,000,000 VND
  → Status: PAYMENT_PENDING_VERIFICATION

📅 Ngày 10/11 - 14:00
  → Seller xác nhận đã nhận tiền
  → Status: PAID

📅 Ngày 11/11 - 09:00
  → Seller bắt đầu chuẩn bị
  → Status: PREPARING_DELIVERY

📅 Ngày 13/11 - 16:00
  → Seller đánh dấu sẵn sàng
  → Status: READY_FOR_PICKUP

📅 Ngày 14/11 - 10:00
  → Buyer đặt vận chuyển Batch 1 (2 containers)
  → Status: TRANSPORTATION_BOOKED

📅 Ngày 15/11 - 08:00
  → Seller bắt đầu giao Batch 1
  → Status: IN_TRANSIT

📅 Ngày 15/11 - 14:00
  → Seller xác nhận đã giao Batch 1
  → Status: PARTIALLY_DELIVERED (còn 3 containers)

📅 Ngày 15/11 - 15:00
  → Buyer xác nhận nhận Batch 1 (GOOD)
  → Status: PARTIALLY_CONFIRMED

📅 Ngày 16/11 - 10:00
  → Buyer đặt Batch 2 (2 containers)
  
📅 Ngày 17/11
  → Giao + xác nhận Batch 2

📅 Ngày 18/11
  → Giao + xác nhận Batch 3 (1 container cuối)
  → Status: COMPLETED (all batches done)

📅 Ngày 25/11 (7 ngày sau)
  → Tự động release payment cho seller
  → Status: PAYMENT_RELEASED
  → ✅ HOÀN TẤT
```

### Các Điểm Quan Trọng

✅ **Inventory Management Tự Động**
- Reserve khi tạo order
- Release khi cancel/reject payment
- Hỗ trợ batch delivery

✅ **Payment Escrow An Toàn**
- Buyer trả trước
- Platform giữ
- Seller verify mới chuyển status
- Auto-release sau 7 ngày

✅ **Batch Delivery Linh Hoạt**
- Không cần giao hết cùng lúc
- Mỗi batch track riêng
- Order complete khi all batches done

✅ **Dispute Handling**
- Buyer report damage → Tạo dispute
- Payment on hold
- Admin xử lý
- Full audit trail

---

**Ngày cập nhật:** 11/11/2025  
**Version:** 2.0  
**Status:** ✅ Phân Tích Hoàn Chỉnh Dựa Trên Code Thực Tế
