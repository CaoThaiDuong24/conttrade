# 📦 LUỒNG SAU KHI SELLER XÁC NHẬN CHUẨN BỊ HÀNG

**Ngày tạo:** 20/10/2025  
**Mục đích:** Tài liệu chi tiết các bước tiếp theo sau khi seller xác nhận đã chuẩn bị hàng xong

---

## 📋 MỤC LỤC

1. [Tổng Quan Luồng](#1-tổng-quan-luồng)
2. [Bước 1: Seller Chuẩn Bị Hàng](#2-bước-1-seller-chuẩn-bị-hàng)
3. [Bước 2: Đánh Dấu Sẵn Sàng](#3-bước-2-đánh-dấu-sẵn-sàng)
4. [Bước 3: Vận Chuyển](#4-bước-3-vận-chuyển)
5. [Bước 4: Giao Hàng](#5-bước-4-giao-hàng)
6. [Bước 5: Buyer Xác Nhận](#6-bước-5-buyer-xác-nhận)
7. [Xử Lý Tranh Chấp](#7-xử-lý-tranh-chấp)
8. [Timeline & SLA](#8-timeline--sla)

---

## 1. TỔNG QUAN LUỒNG

### 🔄 Complete Delivery Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    LUỒNG GIAO HÀNG HOÀN CHỈNH                   │
└─────────────────────────────────────────────────────────────────┘

1️⃣ PAID (Buyer đã thanh toán vào escrow)
   │
   │  Trigger: Seller nhận notification "💰 Đã nhận thanh toán mới!"
   │  Action: Seller click "Bắt đầu chuẩn bị giao hàng"
   ▼
2️⃣ PREPARING_DELIVERY (Đang chuẩn bị) ⏳
   │
   │  Seller làm gì?
   │  • Kiểm tra container condition
   │  • Vệ sinh, sửa chữa nếu cần
   │  • Chuẩn bị giấy tờ (Bill of Sale, Certificate)
   │  • Upload ảnh/video hiện trạng
   │  • Estimate ngày sẵn sàng
   │
   │  API: POST /api/v1/orders/:id/prepare-delivery
   │  Duration: 1-3 ngày
   │  Notification → Buyer: "Seller đang chuẩn bị hàng"
   ▼
3️⃣ READY_FOR_PICKUP (Sẵn sàng pickup) ✅
   │
   │  Seller làm gì?
   │  • Xác nhận container đã sẵn sàng
   │  • Cung cấp địa điểm pickup (depot address)
   │  • Thông tin liên hệ pickup
   │  • Khung giờ có thể pickup
   │  • Hướng dẫn đặc biệt (nếu có)
   │
   │  API: POST /api/v1/orders/:id/mark-ready
   │  Duration: Ngay lập tức
   │  Notification → Buyer: "Container sẵn sàng! Vui lòng sắp xếp vận chuyển"
   ▼
4️⃣ DELIVERING / IN_TRANSIT (Đang vận chuyển) 🚚
   │
   │  Seller/Carrier làm gì?
   │  • Book shipping/transport company
   │  • Lấy tracking number
   │  • Cung cấp thông tin tài xế & xe
   │  • Update vị trí hiện tại (optional)
   │  • Estimated delivery date
   │
   │  API: POST /api/v1/orders/:id/ship (nếu có implement)
   │  Duration: 3-7 ngày (tùy khoảng cách)
   │  Notification → Buyer: "Container đang vận chuyển - Tracking: XXX"
   ▼
5️⃣ DELIVERED (Đã giao hàng) 📦
   │
   │  Seller/Carrier làm gì?
   │  • Xác nhận đã giao đến địa điểm buyer
   │  • Upload ảnh delivery proof
   │  • Buyer ký EIR (Equipment Interchange Receipt)
   │  • Ghi chú tình trạng khi giao
   │
   │  API: POST /api/v1/orders/:id/mark-delivered
   │  Duration: Ngay khi giao xong
   │  Notification → Buyer: "Container đã giao! Kiểm tra trong 7 ngày"
   ▼
6️⃣ BUYER XÁC NHẬN
   │
   ├─── ✅ ACCEPT (Container OK) ────────┐
   │    • Buyer kiểm tra container       │
   │    • Xác nhận nhận hàng             │
   │    • Rate seller                    │
   │                                     │
   │    API: POST /orders/:id/confirm-receipt
   │    Result: COMPLETED ✅             │
   │    • Release escrow → Seller        │
   │    • Trừ platform fee (5-10%)       │
   │    • Giao dịch hoàn tất             │
   │                                     │
   └─── ❌ DISPUTE (Có vấn đề) ──────────┘
        • Buyer phát hiện vấn đề
        • Upload evidence (ảnh/video)
        • Yêu cầu giải quyết
        
        API: POST /orders/:id/raise-dispute
        Result: DISPUTED ⚠️
        • Hold escrow payment
        • Admin investigation
        • Có thể refund hoặc negotiate

7️⃣ COMPLETED (Hoàn tất) 🎉
   • Payment released to seller
   • Platform fee deducted
   • Mutual reviews
   • Transaction closed
```

---

## 2. BƯỚC 1: SELLER CHUẨN BỊ HÀNG

### ✅ Đã Hoàn Thành - Xem Chi Tiết

Bước này **ĐÃ ĐƯỢC IMPLEMENT** và hoạt động tốt. Xem tài liệu:
- `BAO-CAO-FIX-500-ERROR-HOAN-THANH.md`
- `CHI-TIET-LUONG-SELLER-CHUAN-BI-GIAO-HANG.md`

**Status:** `PAID` → `PREPARING_DELIVERY`

**Seller Dashboard:**
- Nhận notification: "💰 Đã nhận thanh toán mới!"
- Vào Order Detail → Tab "Vận chuyển"
- Click button "🚀 Bắt đầu chuẩn bị giao hàng"
- Điền form PrepareDeliveryForm:
  - Ghi chú chuẩn bị
  - Ngày dự kiến sẵn sàng
  - Upload ảnh container
  - Upload documents

**API Endpoint:**
```
POST /api/v1/orders/:id/prepare-delivery
```

**Request Body:**
```json
{
  "estimatedReadyDate": "2025-10-25",
  "preparationNotes": "Đang kiểm tra và dọn dẹp container",
  "photos": ["url1", "url2", "url3"],
  "documents": [
    {
      "type": "bill_of_sale",
      "url": "https://...",
      "name": "Bill of Sale.pdf"
    }
  ],
  "conditionNotes": "Container trong tình trạng tốt"
}
```

**Database Changes:**
```sql
-- Tạo record trong order_preparations
INSERT INTO order_preparations (
  id, order_id, seller_id,
  preparation_started_at, estimated_ready_date,
  preparation_notes, inspection_photos_json,
  document_urls_json, seller_notes,
  status
) VALUES (...);

-- Update order status
UPDATE orders 
SET status = 'PREPARING_DELIVERY', updated_at = NOW()
WHERE id = :orderId;
```

**Notification → Buyer:**
```
📦 Seller đang chuẩn bị hàng

Seller đã bắt đầu chuẩn bị container của bạn.
Dự kiến sẵn sàng vào: 25/10/2025

[Xem chi tiết]
```

---

## 3. BƯỚC 2: ĐÁNH DẤU SẴN SÀNG

### 📍 HIỆN TRẠNG

**Status:** `PREPARING_DELIVERY` → `READY_FOR_PICKUP`

**Khi nào?** Sau khi seller hoàn tất:
- ✅ Kiểm tra container xong
- ✅ Vệ sinh hoàn tất
- ✅ Sửa chữa (nếu cần) xong
- ✅ Giấy tờ đã chuẩn bị đầy đủ
- ✅ Container sẵn sàng để pickup

### 🎯 Seller Cần Làm Gì?

**Bước 1:** Trong Order Detail → Tab "Vận chuyển"
- Khi status = `PREPARING_DELIVERY`
- Button "✅ Đánh dấu sẵn sàng" xuất hiện

**Bước 2:** Click button → Modal `MarkReadyForm` hiển thị

**Bước 3:** Điền thông tin:

#### A. Checklist Chuẩn Bị
```
✅ Container inspection completed (Đã kiểm tra)
✅ Container cleaned (Đã vệ sinh)
☐ Container repaired (Đã sửa chữa - optional)
✅ Documents prepared (Giấy tờ đã sẵn sàng)
✅ Customs cleared (Đã làm thủ tục hải quan - nếu cần)
```

#### B. Thông Tin Pickup Location
```
Địa chỉ depot: 123 Nguyễn Văn Linh, Quận 7, HCM
Bay: Bay 5
Slot: Slot 12
GPS: 10.762622, 106.660172
```

#### C. Thông Tin Liên Hệ
```
Người liên hệ: Mr. Tuấn
Số điện thoại: 0901234567
Vai trò: Depot Manager
```

#### D. Khung Giờ Pickup
```
Có thể pickup từ: 25/10/2025 08:00
Đến: 25/10/2025 17:00
Hướng dẫn: Gọi trước 30 phút khi đến
```

#### E. Ảnh Cuối Cùng
```
Upload ảnh container đã sẵn sàng (3-5 ảnh)
```

### 📡 API Call

**Endpoint:**
```
POST /api/v1/orders/:id/mark-ready
```

**Request Body:**
```json
{
  "readyDate": "2025-10-25T08:00:00Z",
  "pickupLocation": {
    "depotId": "depot-hcm-001",
    "depotName": "Depot HCM A",
    "address": "123 Nguyễn Văn Linh, Quận 7, HCM",
    "bayNumber": "Bay 5",
    "slotNumber": "Slot 12",
    "coordinates": {
      "lat": 10.762622,
      "lng": 106.660172
    }
  },
  "pickupInstructions": "Container tại Bay 5, Slot 12. Gọi Mr. Tuấn 30 phút trước khi đến.",
  "accessHours": "08:00-17:00, Mon-Sat",
  "contactPerson": {
    "name": "Mr. Tuấn",
    "phone": "0901234567",
    "role": "Depot Manager"
  },
  "finalPhotos": [
    "https://cdn.example.com/final/ready-1.jpg",
    "https://cdn.example.com/final/ready-2.jpg"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Container marked as ready for pickup",
  "data": {
    "order": {
      "id": "order-xyz",
      "status": "READY_FOR_PICKUP",
      "readyDate": "2025-10-25T08:00:00Z",
      "updatedAt": "2025-10-24T10:00:00Z"
    },
    "pickupDetails": {
      "location": {...},
      "instructions": "...",
      "contactPerson": {...}
    }
  }
}
```

### 💾 Database Changes

```sql
-- Update order_preparations status
UPDATE order_preparations
SET 
  status = 'READY',
  preparation_completed_at = NOW(),
  pickup_location_json = '{"address": "...", "coordinates": {...}}',
  pickup_contact_name = 'Mr. Tuấn',
  pickup_contact_phone = '0901234567',
  pickup_instructions = 'Container tại Bay 5...',
  pickup_available_from = '2025-10-25 08:00:00',
  pickup_available_to = '2025-10-25 17:00:00',
  updated_at = NOW()
WHERE order_id = :orderId;

-- Update order status
UPDATE orders
SET 
  status = 'READY_FOR_PICKUP',
  ready_date = '2025-10-25 08:00:00',
  updated_at = NOW()
WHERE id = :orderId;
```

### 📬 Notifications

**→ Buyer:**
```
✅ Container sẵn sàng!

Container của bạn đã sẵn sàng để pickup tại:
📍 Depot HCM A - Bay 5, Slot 12
📞 Liên hệ: Mr. Tuấn - 0901234567
⏰ Có thể pickup: 08:00-17:00, T2-T7

Vui lòng sắp xếp vận chuyển trong vòng 3 ngày.

[Xem bản đồ] [Liên hệ depot] [Xem chi tiết]
```

**→ Seller:**
```
✅ Đã đánh dấu sẵn sàng

Container đã được đánh dấu sẵn sàng cho buyer pickup.
Buyer sẽ sắp xếp vận chuyển trong vài ngày tới.

[Xem chi tiết]
```

---

## 4. BƯỚC 3: VẬN CHUYỂN

### 🚚 HIỆN TRẠNG

**Status:** `READY_FOR_PICKUP` → `DELIVERING` / `IN_TRANSIT`

**Ai làm?**
- **Option 1:** Seller tự arrange shipping → Seller gọi API
- **Option 2:** Buyer tự arrange pickup → Buyer hoặc carrier gọi API

### 🎯 Seller/Carrier Cần Làm Gì?

**Khi nào?** Khi đã book được shipping/transport company

**Bước 1:** Book vận chuyển
- Liên hệ công ty vận tải
- Lấy quote giá
- Book slot
- Nhận tracking number

**Bước 2:** Thông tin cần có:
- Tracking number
- Tên carrier/công ty vận tải
- Phương thức vận chuyển (truck, train, ship)
- Ngày dự kiến giao hàng
- Thông tin tài xế & xe
- Lộ trình (route)

### 📡 API Call (Nếu có implement)

**Endpoint:**
```
POST /api/v1/orders/:id/ship
```

**Request Body:**
```json
{
  "trackingNumber": "VCL-SHIP-20251025-001",
  "carrier": "Vietnam Container Lines",
  "carrierContact": {
    "phone": "1900-xxxx",
    "email": "support@vcl.vn",
    "website": "https://vcl.vn"
  },
  "transportMethod": "TRUCK",
  "estimatedDelivery": "2025-10-30T14:00:00Z",
  "route": [
    {
      "location": "Depot HCM A",
      "type": "PICKUP",
      "scheduledTime": "2025-10-25T09:00:00Z",
      "address": "123 Nguyễn Văn Linh, Q7, HCM"
    },
    {
      "location": "Depot Hà Nội B",
      "type": "DELIVERY",
      "scheduledTime": "2025-10-30T14:00:00Z",
      "address": "456 Trường Chinh, Đống Đa, HN"
    }
  ],
  "driverInfo": {
    "name": "Nguyễn Văn B",
    "phone": "0912345678",
    "licensePlate": "29A-12345",
    "licenseNumber": "123456789"
  },
  "shippingCost": 5000000,
  "notes": "Container sẽ được vận chuyển bằng xe tải qua QL1A"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order shipped successfully",
  "data": {
    "order": {
      "id": "order-xyz",
      "status": "DELIVERING",
      "updatedAt": "2025-10-25T09:00:00Z"
    },
    "delivery": {
      "id": "delivery-abc123",
      "trackingNumber": "VCL-SHIP-20251025-001",
      "carrier": "Vietnam Container Lines",
      "status": "SHIPPED",
      "shippedAt": "2025-10-25T09:00:00Z",
      "estimatedDelivery": "2025-10-30T14:00:00Z",
      "trackingUrl": "https://vcl.vn/tracking/VCL-SHIP-20251025-001"
    }
  }
}
```

### 💾 Database Changes

```sql
-- Create or update delivery record
INSERT INTO deliveries (
  id, order_id, tracking_number,
  carrier, carrier_contact_json,
  transport_method, status,
  shipped_at, estimated_delivery,
  route_json, driver_info_json,
  shipping_cost, notes,
  created_at, updated_at
) VALUES (...);

-- Update order status
UPDATE orders
SET 
  status = 'DELIVERING',
  updated_at = NOW()
WHERE id = :orderId;
```

### 📬 Notifications

**→ Buyer:**
```
🚚 Đơn hàng đã được ship!

Container của bạn đang trên đường giao hàng.

📦 Mã vận đơn: VCL-SHIP-20251025-001
🚛 Carrier: Vietnam Container Lines
📅 Dự kiến giao: 30/10/2025, 14:00
👤 Tài xế: Nguyễn Văn B - 0912345678
🚗 Xe: 29A-12345

[Theo dõi vận chuyển] [Liên hệ carrier] [Xem lộ trình]
```

**→ Seller:**
```
✅ Vận chuyển đã xác nhận

Container đang được vận chuyển.
Tracking: VCL-SHIP-20251025-001

Dự kiến giao hàng: 30/10/2025

[Xem chi tiết]
```

### 📍 Optional: Real-time Tracking Updates

**Endpoint:**
```
PATCH /api/v1/orders/:id/delivery-status
```

**Request Body:**
```json
{
  "status": "IN_TRANSIT",
  "currentLocation": {
    "name": "Nghệ An",
    "coordinates": {
      "lat": 18.6783,
      "lng": 105.6920
    },
    "timestamp": "2025-10-27T10:30:00Z"
  },
  "progress": 60,
  "milestoneReached": "HALFWAY_POINT",
  "notes": "Container đang di chuyển qua Nghệ An",
  "photos": ["https://cdn.example.com/transit/checkpoint1.jpg"]
}
```

**Notification → Buyer:**
```
📍 Cập nhật vận chuyển

Container đang ở Nghệ An (60% hành trình)
Dự kiến đến nơi: 30/10/2025, 14:00

[Xem bản đồ]
```

---

## 5. BƯỚC 4: GIAO HÀNG

### 📦 HIỆN TRẠNG

**Status:** `DELIVERING` → `DELIVERED`

**Khi nào?** Khi container đã được giao đến địa điểm của buyer

### 🎯 Seller/Driver/Carrier Cần Làm Gì?

**Khi Giao Hàng:**

1. **Xác nhận vị trí giao hàng**
   - GPS coordinates
   - Địa chỉ chính xác
   - Thời gian giao

2. **Kiểm tra với buyer**
   - Buyer có mặt để nhận
   - Kiểm tra container cùng buyer
   - Note bất kỳ damage nào (nếu có)

3. **Hoàn thành EIR (Equipment Interchange Receipt)**
   - Container number
   - Seal number (nếu có)
   - Tình trạng container
   - Ảnh container khi giao
   - Chữ ký buyer nhận

4. **Upload delivery proof**
   - Ảnh container tại location
   - Ảnh buyer nhận hàng
   - Chữ ký buyer
   - EIR đã ký

### 📡 API Call

**Endpoint:**
```
POST /api/v1/orders/:id/mark-delivered
```

**Request Body:**
```json
{
  "deliveredAt": "2025-10-30T15:30:00Z",
  "deliveryLocation": {
    "address": "456 Trường Chinh, Đống Đa, Hà Nội",
    "coordinates": {
      "lat": 21.0122,
      "lng": 105.8302
    },
    "notes": "Giao tại kho của buyer"
  },
  "deliveryProof": [
    "https://cdn.example.com/delivery/arrival-1.jpg",
    "https://cdn.example.com/delivery/arrival-2.jpg",
    "https://cdn.example.com/delivery/handover.jpg"
  ],
  "eirData": {
    "containerNumber": "ABCU1234567",
    "sealNumber": "SEAL789123",
    "condition": "GOOD",
    "damages": [],
    "damagePhotos": [],
    "notes": "Container giao trong tình trạng tốt, không có damage"
  },
  "receivedByName": "Nguyễn Văn A",
  "receivedBySignature": "https://cdn.example.com/delivery/signature.png",
  "driverNotes": "Giao hàng thành công, buyer đã ký nhận"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Delivery confirmed successfully",
  "data": {
    "order": {
      "id": "order-xyz",
      "status": "DELIVERED",
      "deliveredAt": "2025-10-30T15:30:00Z",
      "updatedAt": "2025-10-30T15:30:00Z"
    },
    "delivery": {
      "id": "delivery-abc123",
      "status": "DELIVERED",
      "deliveredAt": "2025-10-30T15:30:00Z",
      "deliveryLocation": {...},
      "deliveryProof": [...],
      "eir": {...}
    }
  }
}
```

### 💾 Database Changes

```sql
-- Update deliveries table
UPDATE deliveries
SET
  status = 'DELIVERED',
  delivered_at = '2025-10-30 15:30:00',
  delivery_location_json = '{"address": "...", "coordinates": {...}}',
  delivery_proof_json = '["url1", "url2", "url3"]',
  eir_data_json = '{"containerNumber": "ABCU1234567", ...}',
  received_by_name = 'Nguyễn Văn A',
  received_by_signature = 'https://.../signature.png',
  driver_notes = 'Giao hàng thành công...',
  updated_at = NOW()
WHERE order_id = :orderId;

-- Update orders table
UPDATE orders
SET
  status = 'DELIVERED',
  delivered_at = '2025-10-30 15:30:00',
  updated_at = NOW()
WHERE id = :orderId;
```

### 📬 Notifications

**→ Buyer:**
```
📦 Container đã được giao!

Container của bạn đã được giao đến địa chỉ:
📍 456 Trường Chinh, Đống Đa, Hà Nội
⏰ Thời gian: 30/10/2025, 15:30

📋 Equipment Interchange Receipt (EIR):
✅ Container: ABCU1234567
✅ Seal: SEAL789123
✅ Tình trạng: Tốt, không damage

⚠️ QUAN TRỌNG:
Vui lòng kiểm tra container trong vòng 7 ngày và xác nhận.
Nếu có vấn đề, hãy báo cáo ngay.

Deadline xác nhận: 06/11/2025

[Xem ảnh giao hàng] [Xác nhận nhận hàng] [Báo cáo vấn đề]
```

**→ Seller:**
```
✅ Giao hàng thành công

Container đã được giao cho buyer.
Buyer đã ký nhận: Nguyễn Văn A

Bây giờ chờ buyer kiểm tra và xác nhận trong 7 ngày.
Sau khi buyer xác nhận, tiền sẽ được chuyển vào tài khoản của bạn.

[Xem chi tiết giao hàng] [Xem EIR]
```

---

## 6. BƯỚC 5: BUYER XÁC NHẬN

### ✅ SCENARIO A: BUYER ACCEPT (Happy Path)

**Status:** `DELIVERED` → `COMPLETED`

#### Buyer Làm Gì?

**Sau khi nhận container, buyer có 7 ngày để:**

1. **Kiểm tra kỹ container:**
   - Bên ngoài: rust, dents, holes, paint condition
   - Bên trong: floor, walls, ceiling, cleanliness
   - Cửa: hoạt động tốt, seal intact
   - So sánh với listing photos
   - Check với description

2. **Kiểm tra documents:**
   - Bill of Sale
   - Certificate (nếu có)
   - EIR
   - Ownership papers

3. **Chụp ảnh inspection:**
   - Multiple angles
   - Any issues found
   - Condition documentation

4. **Quyết định:**
   - ✅ **Accept** nếu mọi thứ OK
   - ❌ **Dispute** nếu có vấn đề

#### Nếu Buyer ACCEPT

**Buyer Actions:**
- Vào Order Detail
- Click "✅ Xác nhận nhận hàng"
- Điền form confirm receipt:
  - Rating (1-5 sao)
  - Feedback text
  - Upload ảnh inspection (optional)
  - Confirm condition

**API Call:**
```
POST /api/v1/orders/:id/confirm-receipt
```

**Request Body:**
```json
{
  "satisfied": true,
  "inspectionDate": "2025-10-31T10:00:00Z",
  "conditionRating": 5,
  "feedback": "Container chính xác như mô tả. Tình trạng rất tốt. Rất hài lòng!",
  "inspectionPhotos": [
    "https://cdn.example.com/inspection/final1.jpg",
    "https://cdn.example.com/inspection/final2.jpg"
  ],
  "confirmedCondition": {
    "exterior": "EXCELLENT",
    "interior": "EXCELLENT",
    "doors": "WORKING_PERFECTLY",
    "floor": "CLEAN_AND_SOLID"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Receipt confirmed. Payment released to seller.",
  "data": {
    "order": {
      "id": "order-xyz",
      "status": "COMPLETED",
      "completedAt": "2025-10-31T10:00:00Z"
    },
    "payment": {
      "id": "payment-abc",
      "status": "RELEASED",
      "releasedAt": "2025-10-31T10:00:00Z",
      "sellerAmount": 114950000,
      "platformFee": 6050000,
      "totalAmount": 121000000
    }
  }
}
```

#### Backend Processing

```typescript
// 1. Validate
if (order.status !== 'DELIVERED') {
  throw new Error('Order must be delivered first');
}

// 2. Calculate amounts
const platformFeeRate = 0.05; // 5%
const sellerAmount = order.total * (1 - platformFeeRate);
const platformFee = order.total * platformFeeRate;

// 3. Release escrow payment
await prisma.payments.update({
  where: { orderId: order.id },
  data: {
    status: 'RELEASED',
    releasedAt: new Date(),
    sellerAmount: sellerAmount,
    platformFee: platformFee
  }
});

// 4. Update order to completed
await prisma.orders.update({
  where: { id: order.id },
  data: {
    status: 'COMPLETED',
    completedAt: new Date(),
    buyerRating: conditionRating,
    buyerFeedback: feedback
  }
});

// 5. Transfer money to seller
await transferToSellerBankAccount(seller.id, sellerAmount);

// 6. Send notifications
```

#### Notifications

**→ Seller:**
```
💰 THANH TOÁN ĐÃ ĐƯỢC GIẢI NGÂN!

Buyer đã xác nhận nhận hàng và hài lòng.

💵 Số tiền: 114,950,000 VNĐ
💳 Đã chuyển vào tài khoản: **** 1234
📊 Platform fee: 6,050,000 VNĐ (5%)

⭐ Buyer rating: 5/5 sao
💬 Feedback: "Container chính xác như mô tả..."

Giao dịch đã hoàn tất thành công!

[Xem chi tiết thanh toán] [Đánh giá buyer] [Rút tiền]
```

**→ Buyer:**
```
✅ Giao dịch hoàn tất!

Cảm ơn bạn đã xác nhận nhận hàng.
Giao dịch đã hoàn tất thành công.

Tiền đã được chuyển cho seller.

[Đánh giá seller] [Xem chi tiết đơn hàng]
```

---

### ❌ SCENARIO B: BUYER DISPUTE (Issues Found)

**Status:** `DELIVERED` → `DISPUTED`

#### Khi nào Buyer raise dispute?

- Container không đúng như mô tả
- Có damage không được mention
- Missing documents
- Sai container number
- Condition worse than advertised

#### Buyer Actions

**Bước 1:** Phát hiện vấn đề trong 7 ngày

**Bước 2:** Document evidence:
- Chụp ảnh/video chi tiết vấn đề
- So sánh với listing photos
- Note tất cả discrepancies
- Gather witnesses (nếu có)

**Bước 3:** Raise dispute
- Vào Order Detail
- Click "⚠️ Báo cáo vấn đề"
- Điền form dispute:
  - Reason (dropdown)
  - Detailed description
  - Upload evidence (ảnh/video)
  - Requested resolution
  - Requested amount (nếu partial refund)

#### API Call

**Endpoint:**
```
POST /api/v1/orders/:id/raise-dispute
```

**Request Body:**
```json
{
  "reason": "CONDITION_NOT_AS_DESCRIBED",
  "description": "Container có nhiều vết rỉ sét không được đề cập trong listing. Sàn container bị hư hỏng ở góc. Photos trong listing không show những damage này.",
  "evidence": [
    {
      "type": "photo",
      "url": "https://cdn.example.com/disputes/rust-damage-1.jpg",
      "description": "Vết rỉ sét lớn ở thành bên trái",
      "timestamp": "2025-10-31T11:00:00Z"
    },
    {
      "type": "photo",
      "url": "https://cdn.example.com/disputes/floor-damage.jpg",
      "description": "Sàn bị thủng ở góc phải",
      "timestamp": "2025-10-31T11:05:00Z"
    },
    {
      "type": "video",
      "url": "https://cdn.example.com/disputes/inspection-walkthrough.mp4",
      "description": "Video walk-through toàn bộ container showing damages",
      "timestamp": "2025-10-31T11:10:00Z"
    },
    {
      "type": "photo",
      "url": "https://cdn.example.com/disputes/comparison.jpg",
      "description": "So sánh với listing photo - clearly different condition",
      "timestamp": "2025-10-31T11:15:00Z"
    }
  ],
  "requestedResolution": "PARTIAL_REFUND",
  "requestedAmount": 30000000,
  "additionalNotes": "Tôi vẫn muốn giữ container nhưng cần được bồi thường 30,000,000 VNĐ cho chi phí sửa chữa rust và floor. Hoặc có thể negotiate giá khác với seller."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dispute raised successfully",
  "data": {
    "dispute": {
      "id": "dispute-xyz",
      "orderId": "order-xyz",
      "reason": "CONDITION_NOT_AS_DESCRIBED",
      "status": "OPEN",
      "priority": "HIGH",
      "createdAt": "2025-10-31T11:20:00Z",
      "deadline": "2025-11-07T11:20:00Z"
    }
  }
}
```

#### Backend Processing

```typescript
// 1. Validate
if (order.status !== 'DELIVERED') {
  throw new Error('Can only dispute after delivery');
}

// 2. Create dispute record
const dispute = await prisma.disputes.create({
  data: {
    id: randomUUID(),
    orderId: order.id,
    raisedBy: userId,
    reason: 'CONDITION_NOT_AS_DESCRIBED',
    description: description,
    evidence: evidence,
    requestedResolution: 'PARTIAL_REFUND',
    requestedAmount: 30000000,
    status: 'OPEN',
    priority: 'HIGH',
    createdAt: new Date()
  }
});

// 3. Hold escrow payment (no release)
await prisma.payments.update({
  where: { orderId: order.id },
  data: {
    status: 'ON_HOLD',
    holdReason: 'DISPUTE_RAISED',
    holdAt: new Date()
  }
});

// 4. Update order status
await prisma.orders.update({
  where: { id: order.id },
  data: {
    status: 'DISPUTED',
    disputedAt: new Date()
  }
});

// 5. Notify admin & seller
```

#### Notifications

**→ Admin (URGENT):**
```
🚨 URGENT: DISPUTE CẦN XỬ LÝ

Dispute mới từ buyer cần investigation.

📦 Order: #...xyz
👤 Buyer: Nguyễn Văn A
👤 Seller: Container Seller Co.
⚠️ Lý do: Container không đúng mô tả
💰 Yêu cầu bồi thường: 30,000,000 VNĐ
⏰ Deadline: 7 ngày

Evidence:
- 3 ảnh damage
- 1 video inspection
- 1 ảnh so sánh

[XEM DISPUTE NGAY] [ASSIGN TO ME]
```

**→ Seller:**
```
⚠️ BUYER ĐÃ RAISE DISPUTE

Buyer báo cáo container không đúng như mô tả.

📋 Lý do: Condition not as described
💰 Yêu cầu: Bồi thường 30,000,000 VNĐ

Evidence từ buyer:
- Ảnh vết rỉ sét ở thành bên
- Ảnh sàn bị hư hỏng
- Video walk-through

⚠️ QUAN TRỌNG:
Tiền escrow đang bị hold. 
Vui lòng cung cấp phản hồi và evidence trong 3 ngày.

[XEM DISPUTE CHI TIẾT] [PHẢN HỒI NGAY] [UPLOAD EVIDENCE]
```

#### Admin Investigation Process

1. **Review evidence từ cả 2 bên:**
   - Buyer evidence (ảnh/video damage)
   - Seller listing photos
   - Original description
   - Previous inspection reports (nếu có)

2. **Compare:**
   - Listing photos vs buyer photos
   - Description vs actual condition
   - Timestamps

3. **Contact both parties:**
   - Request more info nếu cần
   - Clarify discrepancies
   - Negotiate resolution

4. **Make decision:**
   - ✅ **Approve dispute** → Partial/full refund to buyer
   - ❌ **Reject dispute** → Release payment to seller
   - 🤝 **Mediate** → Both parties agree on settlement

5. **Execute resolution:**
```sql
-- Update dispute
UPDATE disputes
SET
  status = 'RESOLVED',
  resolution_notes = 'After review...',
  resolution_amount = 20000000,
  resolved_at = NOW()
WHERE id = :disputeId;

-- Update payment (example: partial refund)
UPDATE payments
SET
  status = 'PARTIALLY_REFUNDED',
  seller_amount = 94950000,  -- Original 114950000 - refund 20000000
  refund_amount = 20000000,
  refunded_at = NOW()
WHERE order_id = :orderId;
```

---

## 7. XỬ LÝ TRANH CHẤP

### 📋 QUY TRÌNH DISPUTE RESOLUTION

```
BUYER RAISE DISPUTE
  │
  ├─ Admin receives urgent notification
  ├─ Seller receives warning notification
  └─ Escrow payment HOLD
  │
  ▼
ADMIN INVESTIGATION (3-7 ngày)
  │
  ├─ Review evidence from both sides
  ├─ Compare listing vs actual condition
  ├─ Request additional info if needed
  ├─ Contact both parties
  └─ Evaluate case
  │
  ▼
ADMIN DECISION
  │
  ├─── ✅ APPROVE DISPUTE ────────────┐
  │    • Full refund to buyer         │
  │    • No payment to seller         │
  │    • Seller may get blacklisted   │
  │    • Negative review              │
  │                                   │
  ├─── ⚖️ PARTIAL RESOLUTION ────────┤
  │    • Partial refund to buyer      │
  │    • Partial payment to seller    │
  │    • Both parties compromise      │
  │    • Fair settlement              │
  │                                   │
  └─── ❌ REJECT DISPUTE ────────────┘
       • No refund
       • Full payment to seller
       • Buyer may get warning
       • If frivolous dispute
  │
  ▼
EXECUTE RESOLUTION
  │
  ├─ Update payments table
  ├─ Transfer funds accordingly
  ├─ Update order status
  ├─ Create audit log
  └─ Notify both parties
  │
  ▼
CASE CLOSED
  • Both parties can review
  • Ratings updated
  • Dispute archived
```

### 🔍 Dispute Categories

| Reason | Description | Typical Resolution |
|--------|-------------|-------------------|
| `CONDITION_NOT_AS_DESCRIBED` | Container khác listing | Partial refund (20-50%) |
| `MISSING_DOCUMENTS` | Thiếu giấy tờ | Partial refund (5-10%) |
| `WRONG_CONTAINER` | Sai container number | Full refund |
| `SEVERE_DAMAGE` | Damage nghiêm trọng không mention | Full refund hoặc 50% |
| `DELIVERY_ISSUE` | Giao muộn/sai địa điểm | Compensate shipping cost |
| `FRAUDULENT_LISTING` | Listing gian lận | Full refund + ban seller |

### ⚖️ Resolution Options

1. **FULL_REFUND**
   - Buyer gets 100% money back
   - Seller gets nothing
   - Used for serious violations

2. **PARTIAL_REFUND**
   - Buyer gets X% back
   - Seller gets (100-X)%
   - Most common resolution

3. **COMPENSATE_REPAIRS**
   - Buyer keeps container
   - Seller pays for repair costs
   - Buyer provides repair receipts

4. **REPLACEMENT**
   - Seller provides replacement container
   - Original refunded
   - Rare case

5. **MEDIATED_SETTLEMENT**
   - Both parties negotiate
   - Admin facilitates
   - Custom agreement

---

## 8. TIMELINE & SLA

### ⏱️ Expected Timeline

| Phase | Duration | Deadline | Auto-action if exceed |
|-------|----------|----------|----------------------|
| **Payment → Prepare Start** | 0-1 ngày | 2 ngày | Auto-reminder to seller |
| **Preparing** | 1-3 ngày | 5 ngày | Buyer can request update |
| **Ready → Shipped** | 1-2 ngày | 3 ngày | Auto-reminder to arrange shipping |
| **In Transit** | 3-7 ngày | 10 ngày | Investigate delay |
| **Delivered → Confirm** | 1-7 ngày | 7 ngày | ✅ **Auto-confirm & release payment** |
| **Dispute Resolution** | 3-7 ngày | 14 ngày | Escalate to senior admin |
| **Total** | 6-20 ngày | 30 ngày | - |

### 🚨 SLA Penalties & Auto-Actions

#### Seller Delays

**Scenario 1: Không bắt đầu chuẩn bị sau 3 ngày**
- Day 3: Auto-reminder email + in-app notification
- Day 5: Warning + second reminder
- Day 7: Buyer có quyền cancel với full refund
- Day 10: Automatic cancel + refund + seller penalty

**Scenario 2: Chuẩn bị quá lâu (>5 ngày)**
- Day 5: Request explanation
- Day 7: Buyer can request refund
- Day 10: Admin investigation

**Scenario 3: Không ship sau ready (>3 ngày)**
- Day 3: Reminder to arrange shipping
- Day 5: Buyer can arrange own pickup
- Day 7: Seller pays buyer's pickup cost

#### Buyer Delays

**Scenario 1: Không xác nhận sau giao (>7 ngày)**
- Day 3: Reminder notification
- Day 5: Second reminder
- Day 7: ⚠️ **AUTOMATIC CONFIRMATION**
  ```typescript
  // Auto-confirm after 7 days
  if (daysSinceDelivery >= 7 && order.status === 'DELIVERED') {
    await autoConfirmReceipt(order.id);
    // - Release escrow to seller
    // - Mark order as completed
    // - Send notifications
  }
  ```
- Day 7-37: Buyer vẫn có thể dispute (30-day window)

**Scenario 2: Frivolous disputes (không có evidence)**
- Admin review: 2 ngày
- Reject dispute
- Warning to buyer
- Release payment to seller
- Note on buyer profile

### 📊 Success Metrics

**Ideal Timeline:**
- Payment → Completed: **10-12 ngày**
- Dispute rate: **< 5%**
- Auto-confirm rate: **< 10%** (most buyers confirm manually)
- Resolution time: **< 5 ngày**

---

## 🎯 TÓM TẮT CÁC BƯỚC

### Quick Reference Checklist

#### 1️⃣ PREPARING_DELIVERY (Seller)
- [ ] Kiểm tra container
- [ ] Vệ sinh container
- [ ] Sửa chữa (nếu cần)
- [ ] Chuẩn bị documents
- [ ] Upload ảnh
- [ ] Estimate ready date
- [ ] API: `POST /orders/:id/prepare-delivery`

#### 2️⃣ READY_FOR_PICKUP (Seller)
- [ ] Complete checklist
- [ ] Provide pickup location
- [ ] Contact info
- [ ] Access hours
- [ ] Final photos
- [ ] API: `POST /orders/:id/mark-ready`

#### 3️⃣ DELIVERING (Seller/Carrier)
- [ ] Book transport
- [ ] Get tracking number
- [ ] Driver info
- [ ] Estimated delivery
- [ ] Route planning
- [ ] API: `POST /orders/:id/ship` (nếu có)

#### 4️⃣ DELIVERED (Driver/Seller)
- [ ] Confirm arrival
- [ ] Delivery location GPS
- [ ] Complete EIR
- [ ] Upload delivery proof
- [ ] Get buyer signature
- [ ] API: `POST /orders/:id/mark-delivered`

#### 5️⃣ BUYER CONFIRMATION (Buyer)
- [ ] Inspect container (7 days)
- [ ] Check documents
- [ ] Take photos
- [ ] Decision: Accept or Dispute

**If ACCEPT:**
- [ ] API: `POST /orders/:id/confirm-receipt`
- [ ] Rate seller
- [ ] Provide feedback
- ✅ Payment released

**If DISPUTE:**
- [ ] Document evidence
- [ ] API: `POST /orders/:id/raise-dispute`
- [ ] Admin investigation
- [ ] Resolution
- ⚖️ Payment split/refund

---

## 📞 CONTACTS & SUPPORT

### Seller Support
- 🔧 **Technical issues:** `seller-support@icontexchange.com`
- 💬 **Chat:** In-app messaging
- 📞 **Hotline:** 1900-xxxx (8AM-8PM)

### Buyer Support
- 🛒 **Order issues:** `buyer-support@icontexchange.com`
- 💬 **Chat:** In-app messaging
- 📞 **Hotline:** 1900-yyyy (8AM-8PM)

### Admin/Disputes
- ⚖️ **Dispute resolution:** `disputes@icontexchange.com`
- 🚨 **Urgent:** `urgent@icontexchange.com`
- 📞 **Emergency hotline:** 1900-zzzz (24/7)

---

## 📚 RELATED DOCUMENTS

- `CHI-TIET-LUONG-SELLER-CHUAN-BI-GIAO-HANG.md` - Luồng chi tiết chuẩn bị
- `BAO-CAO-FIX-500-ERROR-HOAN-THANH.md` - Fix lỗi prepare delivery
- `DELIVERY-WORKFLOW-INTEGRATION-SUMMARY.md` - Tích hợp UI components
- `DELIVERY-WORKFLOW-MIGRATION-COMPLETE.md` - Database migration
- `backend/src/routes/orders.ts` - API implementation
- `backend/test-delivery-workflow.js` - Testing script

---

## ✅ STATUS IMPLEMENTATION

| Bước | Status | API Endpoint | Frontend | Backend | Tested |
|------|--------|--------------|----------|---------|--------|
| 1. Prepare | `PREPARING_DELIVERY` | ✅ `/prepare-delivery` | ✅ | ✅ | ✅ |
| 2. Mark Ready | `READY_FOR_PICKUP` | ✅ `/mark-ready` | ✅ | ✅ | ⏳ |
| 3. Ship | `DELIVERING` | ⏳ `/ship` | ⏳ | ⏳ | ❌ |
| 4. Delivered | `DELIVERED` | ✅ `/mark-delivered` | ⏳ | ✅ | ⏳ |
| 5. Confirm | `COMPLETED` | ✅ `/confirm-receipt` | ⏳ | ✅ | ⏳ |
| 6. Dispute | `DISPUTED` | ✅ `/raise-dispute` | ✅ | ✅ | ⏳ |

**Legend:**
- ✅ = Hoàn thành
- ⏳ = Đang làm/cần test
- ❌ = Chưa bắt đầu

---

## 🎉 KẾT LUẬN

Sau khi seller **xác nhận chuẩn bị hàng**, luồng tiếp theo bao gồm:

1. ✅ **Đánh dấu sẵn sàng** - Seller xác nhận container ready for pickup
2. 🚚 **Vận chuyển** - Book shipping, get tracking number
3. 📦 **Giao hàng** - Deliver to buyer, complete EIR
4. ⏰ **Chờ xác nhận** - Buyer có 7 ngày để inspect
5. ✅ **Hoàn tất** - Buyer confirm → Payment released
6. ⚠️ **Tranh chấp** - Buyer dispute → Admin investigation

**Toàn bộ luồng được thiết kế để:**
- ✅ Bảo vệ cả buyer và seller
- ✅ Escrow payment security
- ✅ Clear communication với notifications
- ✅ Evidence-based dispute resolution
- ✅ Automated reminders & deadlines
- ✅ Fair & transparent process

---

**Tài liệu này:** Version 1.0  
**Ngày:** 20/10/2025  
**Author:** GitHub Copilot  
**Status:** ✅ Complete & Ready for Use

