# 📦 CHI TIẾT LUỒNG: SELLER CHUẨN BỊ VÀ GIAO HÀNG

**Ngày tạo:** 16/10/2025  
**Phiên bản:** 1.0  
**Mục đích:** Mô tả chi tiết quy trình từ khi seller nhận payment → chuẩn bị → giao hàng → buyer xác nhận

---

## 📋 MỤC LỤC

1. [Tổng Quan Flow](#1-tổng-quan-flow)
2. [Các Bước Chi Tiết](#2-các-bước-chi-tiết)
3. [API Endpoints](#3-api-endpoints)
4. [Database Changes](#4-database-changes)
5. [Notifications](#5-notifications)
6. [Documents & Compliance](#6-documents--compliance)
7. [Timeline & SLA](#7-timeline--sla)
8. [Error Handling](#8-error-handling)

---

## 1. TỔNG QUAN FLOW

### 🔄 **Complete Delivery Workflow**

```
┌────────────────────────────────────────────────────────────────────────┐
│                SELLER PREPARATION & DELIVERY FLOW                      │
└────────────────────────────────────────────────────────────────────────┘

PAID (Buyer completed escrow payment)
  │
  │  Event: Seller receives notification "Payment received"
  │  Action: Seller clicks "Bắt đầu chuẩn bị hàng"
  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 1: PREPARING_DELIVERY (Status mới - cần implement)                │
├─────────────────────────────────────────────────────────────────────────┤
│ Seller Tasks:                                                           │
│ • Kiểm tra container condition                                         │
│ • Dọn dẹp, sửa chữa nếu cần                                            │
│ • Chuẩn bị documents (Bill of Sale, Certificate, etc.)                 │
│ • Upload photos/videos hiện trạng                                      │
│ • Estimated ready date                                                  │
│                                                                         │
│ API: POST /api/v1/orders/:id/prepare-delivery                          │
│ {                                                                       │
│   estimatedReadyDate: "2025-10-20",                                    │
│   preparationNotes: "Đang kiểm tra và dọn dẹp container",             │
│   photos: ["url1", "url2", ...]                                        │
│ }                                                                       │
│                                                                         │
│ Notifications:                                                          │
│ → Buyer: "Seller đang chuẩn bị hàng, dự kiến sẵn sàng 20/10"          │
└─────────────────────────────────────────────────────────────────────────┘
  │
  │  Duration: 1-3 days (depends on order size)
  │  Seller updates: Daily progress updates (optional)
  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 2: READY_FOR_PICKUP (Status mới - optional)                       │
├─────────────────────────────────────────────────────────────────────────┤
│ Seller confirms:                                                        │
│ • Container ready for pickup/shipping                                   │
│ • All documents prepared                                                │
│ • Quality check completed                                               │
│                                                                         │
│ API: POST /api/v1/orders/:id/mark-ready                                │
│ {                                                                       │
│   readyDate: "2025-10-20T10:00:00Z",                                   │
│   pickupInstructions: "Container tại Depot A, bay 5, slot 12",        │
│   documents: ["billOfSale.pdf", "certificate.pdf"]                     │
│ }                                                                       │
│                                                                         │
│ Notifications:                                                          │
│ → Buyer: "Container sẵn sàng! Vui lòng sắp xếp vận chuyển"            │
└─────────────────────────────────────────────────────────────────────────┘
  │
  │  Seller arranges shipping / Buyer arranges pickup
  │  Delivery method decision (seller delivery vs buyer pickup)
  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 3: TRANSPORTATION_BOOKED (Already exists)                         │
├─────────────────────────────────────────────────────────────────────────┤
│ Seller books shipping:                                                  │
│ • Select carrier/shipping company                                       │
│ • Get tracking number                                                   │
│ • Estimated delivery date                                               │
│ • Shipping cost (if separate)                                           │
│                                                                         │
│ API: POST /api/v1/orders/:id/ship                                       │
│ {                                                                       │
│   trackingNumber: "SHIP-123456789",                                    │
│   carrier: "Vietnam Container Lines",                                   │
│   estimatedDelivery: "2025-10-25",                                     │
│   notes: "Container will be delivered by truck"                        │
│ }                                                                       │
│                                                                         │
│ Database:                                                               │
│ • Create deliveries record                                              │
│ • Update order.status = 'delivering'                                    │
│                                                                         │
│ Notifications:                                                          │
│ → Buyer: "Đơn hàng đã được ship! Tracking: SHIP-123456789"            │
└─────────────────────────────────────────────────────────────────────────┘
  │
  │  Container in transit
  │  Real-time tracking (optional - GPS/IoT integration)
  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 4: IN_TRANSIT (Status updates during shipping)                    │
├─────────────────────────────────────────────────────────────────────────┤
│ Seller/Carrier updates location:                                       │
│ • Current location                                                      │
│ • Progress milestones                                                   │
│ • Any delays or issues                                                  │
│                                                                         │
│ API: PATCH /api/v1/orders/:id/delivery-status                          │
│ {                                                                       │
│   status: "in_transit",                                                │
│   currentLocation: "Hai Phong Port",                                   │
│   progress: 60,                                                         │
│   notes: "Container loaded on truck, en route to HCM"                  │
│ }                                                                       │
│                                                                         │
│ Notifications (optional real-time):                                     │
│ → Buyer: Location updates every X hours                                │
└─────────────────────────────────────────────────────────────────────────┘
  │
  │  Container arrives at destination
  │  Buyer inspection (quality check)
  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 5: DELIVERED (Arrival confirmation)                               │
├─────────────────────────────────────────────────────────────────────────┤
│ Seller/Carrier confirms delivery:                                      │
│ • Delivered to buyer's location                                        │
│ • Upload delivery proof (photos, signature)                            │
│ • EIR (Equipment Interchange Receipt)                                  │
│                                                                         │
│ API: POST /api/v1/orders/:id/mark-delivered                            │
│ {                                                                       │
│   deliveredAt: "2025-10-25T15:30:00Z",                                │
│   deliveryProof: ["photo1.jpg", "signature.png"],                     │
│   eirData: {                                                           │
│     containerNumber: "ABCU1234567",                                    │
│     sealNumber: "SEAL789",                                             │
│     condition: "As described"                                          │
│   },                                                                   │
│   receivedByName: "Nguyễn Văn A",                                     │
│   receivedBySignature: "signature_url"                                 │
│ }                                                                       │
│                                                                         │
│ Database:                                                               │
│ • Update deliveries.status = 'delivered'                               │
│ • Update deliveries.deliveredAt                                        │
│ • Update order.status = 'delivered' (waiting buyer confirmation)       │
│                                                                         │
│ Notifications:                                                          │
│ → Buyer: "Container đã được giao! Vui lòng kiểm tra và xác nhận"      │
│ → Seller: "Container đã giao thành công, chờ buyer xác nhận"          │
└─────────────────────────────────────────────────────────────────────────┘
  │
  │  Buyer inspects container (1-7 days window)
  │  Check condition, documentation, compliance
  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 6: BUYER CONFIRMATION (Final step)                                │
├─────────────────────────────────────────────────────────────────────────┤
│ Buyer Decision:                                                         │
│                                                                         │
│ ✅ ACCEPT - Container as described                                     │
│ ❌ DISPUTE - Issues found                                              │
│                                                                         │
│ IF ACCEPT:                                                              │
│ API: POST /api/v1/orders/:id/confirm-receipt                           │
│ {                                                                       │
│   satisfied: true,                                                     │
│   rating: 5,                                                           │
│   feedback: "Container exactly as described, excellent seller"         │
│ }                                                                       │
│                                                                         │
│ Result:                                                                 │
│ • Release escrow payment to seller                                     │
│ • Calculate platform fee (5-10%)                                       │
│ • Update order.status = 'COMPLETED'                                    │
│ • Update payment.status = 'RELEASED'                                   │
│ • Trigger review system                                                │
│                                                                         │
│ IF DISPUTE:                                                             │
│ API: POST /api/v1/orders/:id/raise-dispute                             │
│ {                                                                       │
│   reason: "Container condition not as described",                      │
│   evidence: ["photo1.jpg", "video1.mp4"],                             │
│   requestedResolution: "partial_refund" | "full_refund"                │
│ }                                                                       │
│                                                                         │
│ Result:                                                                 │
│ • Hold escrow payment                                                  │
│ • Create dispute record                                                │
│ • Notify admin for investigation                                       │
│ • Update order.status = 'DISPUTED'                                     │
└─────────────────────────────────────────────────────────────────────────┘
  │
  ▼
COMPLETED (Transaction finished) ✅
  │
  └──► Mutual Reviews
       Seller rating & feedback
       Buyer rating & feedback
```

---

## 2. CÁC BƯỚC CHI TIẾT

### **BƯỚC 1: SELLER CHUẨN BỊ HÀNG** 📦

#### **Trigger:** 
Payment received (order.status = 'PAID')

#### **Seller Actions:**

1. **Kiểm Tra Container** (Quality Check)
   - Visual inspection: rust, dents, holes
   - Structural integrity
   - Door operation
   - Floor condition
   - Compare với listing description

2. **Cleaning & Maintenance**
   - Wash exterior/interior
   - Remove debris
   - Minor repairs if needed
   - Paint touch-up (optional)

3. **Documentation Preparation**
   - Bill of Sale
   - Certificate of Origin (if applicable)
   - Inspection Certificate (if available)
   - Ownership transfer papers
   - Tax documents

4. **Photo Documentation**
   - Multiple angles (6 sides)
   - Interior shots
   - Serial number/container number
   - Any damage or special features
   - Timestamp for authenticity

5. **Update System**

**API Call:**
```http
POST /api/v1/orders/:orderId/prepare-delivery
Authorization: Bearer [seller_token]
Content-Type: application/json

{
  "estimatedReadyDate": "2025-10-20",
  "preparationNotes": "Container kiểm tra xong, đang dọn dẹp và chuẩn bị documents",
  "photos": [
    "https://cdn.example.com/containers/front-view.jpg",
    "https://cdn.example.com/containers/side-view.jpg",
    "https://cdn.example.com/containers/interior.jpg"
  ],
  "documents": [
    {
      "type": "bill_of_sale",
      "url": "https://cdn.example.com/docs/bill-of-sale.pdf"
    },
    {
      "type": "certificate",
      "url": "https://cdn.example.com/docs/certificate.pdf"
    }
  ],
  "conditionNotes": "Excellent condition, cleaned and ready"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Preparation status updated",
  "data": {
    "order": {
      "id": "order-xyz",
      "status": "PREPARING_DELIVERY",
      "estimatedReadyDate": "2025-10-20",
      "updatedAt": "2025-10-16T10:30:00Z"
    },
    "preparation": {
      "id": "prep-abc123",
      "startedAt": "2025-10-16T10:30:00Z",
      "photos": [...],
      "documents": [...]
    }
  }
}
```

**Database Changes:**
```sql
-- Update order
UPDATE orders 
SET 
  status = 'PREPARING_DELIVERY',
  estimated_ready_date = '2025-10-20',
  updated_at = NOW()
WHERE id = 'order-xyz';

-- Create preparation record (new table)
INSERT INTO order_preparations (
  id, 
  order_id, 
  started_at,
  estimated_ready_date,
  preparation_notes,
  photos_json,
  documents_json,
  status
) VALUES (
  'prep-abc123',
  'order-xyz',
  NOW(),
  '2025-10-20',
  'Container kiểm tra xong...',
  '["url1", "url2"]',
  '[{"type": "bill_of_sale", "url": "..."}]',
  'IN_PROGRESS'
);
```

**Notifications:**
```javascript
// To Buyer
{
  type: 'preparation_started',
  title: 'Seller đang chuẩn bị hàng',
  message: 'Seller đã bắt đầu chuẩn bị container của bạn. Dự kiến sẵn sàng vào 20/10/2025.',
  data: {
    orderId: 'order-xyz',
    estimatedReadyDate: '2025-10-20',
    photos: [...]
  }
}
```

---

### **BƯỚC 2: MARK READY FOR PICKUP/SHIPPING** ✅

#### **Trigger:**
Seller completes all preparation tasks

#### **Seller Actions:**

1. **Final Quality Check**
   - Re-verify container condition
   - Ensure all documents signed
   - Photos uploaded
   - Container accessible for pickup

2. **Provide Pickup Details**
   - Depot location & address
   - Bay/slot number
   - Access hours
   - Contact person
   - Special instructions

3. **Mark as Ready**

**API Call:**
```http
POST /api/v1/orders/:orderId/mark-ready
Authorization: Bearer [seller_token]
Content-Type: application/json

{
  "readyDate": "2025-10-20T10:00:00Z",
  "pickupLocation": {
    "depotId": "depot-haiphong-001",
    "depotName": "Depot Hải Phòng A",
    "address": "123 Lê Hồng Phong, Hải Phòng",
    "bayNumber": "Bay 5",
    "slotNumber": "Slot 12",
    "coordinates": {
      "lat": 20.8449,
      "lng": 106.6881
    }
  },
  "pickupInstructions": "Container đã sẵn sàng tại Bay 5, Slot 12. Liên hệ Mr. Tuấn (0901234567) để pickup.",
  "accessHours": "7:00 AM - 5:00 PM, Mon-Sat",
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
      "readyDate": "2025-10-20T10:00:00Z"
    },
    "pickupDetails": {
      "location": {...},
      "instructions": "...",
      "contactPerson": {...}
    }
  }
}
```

**Notifications:**
```javascript
// To Buyer
{
  type: 'container_ready',
  title: 'Container sẵn sàng!',
  message: 'Container của bạn đã sẵn sàng tại Depot Hải Phòng A. Vui lòng sắp xếp vận chuyển.',
  data: {
    orderId: 'order-xyz',
    pickupLocation: {...},
    instructions: '...',
    contactPerson: {...}
  },
  actions: [
    {
      label: 'Xem chi tiết',
      url: '/orders/order-xyz/pickup'
    },
    {
      label: 'Liên hệ depot',
      phone: '0901234567'
    }
  ]
}
```

---

### **BƯỚC 3: SHIP ORDER** 🚚

#### **Trigger:**
- Seller arranges shipping OR
- Buyer arranges pickup

#### **Seller Actions:**

1. **Book Shipping/Transport**
   - Select carrier/shipping company
   - Get quote
   - Book slot
   - Receive tracking number

2. **Coordinate Logistics**
   - Schedule pickup from depot
   - Coordinate with truck driver
   - Ensure container ready for loading
   - Provide EIR to driver

3. **Update Shipping Info**

**API Call:**
```http
POST /api/v1/orders/:orderId/ship
Authorization: Bearer [seller_token]
Content-Type: application/json

{
  "trackingNumber": "VCL-SHIP-20251020-001",
  "carrier": "Vietnam Container Lines",
  "carrierContact": {
    "phone": "1900-xxxx",
    "email": "support@vcl.vn"
  },
  "transportMethod": "TRUCK",
  "estimatedDelivery": "2025-10-25T14:00:00Z",
  "route": [
    {
      "location": "Depot Hải Phòng A",
      "type": "PICKUP",
      "scheduledTime": "2025-10-20T08:00:00Z"
    },
    {
      "location": "Depot HCM B", 
      "type": "DELIVERY",
      "scheduledTime": "2025-10-25T14:00:00Z"
    }
  ],
  "driverInfo": {
    "name": "Nguyễn Văn B",
    "phone": "0912345678",
    "licensePlate": "29A-12345"
  },
  "shippingCost": 5000000,
  "notes": "Container will be transported by truck via NH1A"
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
      "updatedAt": "2025-10-20T08:00:00Z"
    },
    "delivery": {
      "id": "delivery-abc123",
      "trackingNumber": "VCL-SHIP-20251020-001",
      "carrier": "Vietnam Container Lines",
      "status": "SHIPPED",
      "shippedAt": "2025-10-20T08:00:00Z",
      "estimatedDelivery": "2025-10-25T14:00:00Z",
      "trackingUrl": "https://vcl.vn/tracking/VCL-SHIP-20251020-001"
    }
  }
}
```

**Database:**
```sql
-- Create delivery record
INSERT INTO deliveries (
  id,
  order_id,
  tracking_number,
  carrier,
  carrier_contact_json,
  transport_method,
  status,
  shipped_at,
  estimated_delivery,
  route_json,
  driver_info_json,
  shipping_cost,
  notes,
  created_at,
  updated_at
) VALUES (
  'delivery-abc123',
  'order-xyz',
  'VCL-SHIP-20251020-001',
  'Vietnam Container Lines',
  '{"phone": "1900-xxxx", "email": "support@vcl.vn"}',
  'TRUCK',
  'SHIPPED',
  NOW(),
  '2025-10-25 14:00:00',
  '[...]',
  '{"name": "Nguyễn Văn B", ...}',
  5000000,
  'Container will be transported...',
  NOW(),
  NOW()
);

-- Update order
UPDATE orders
SET 
  status = 'DELIVERING',
  updated_at = NOW()
WHERE id = 'order-xyz';
```

**Notifications:**
```javascript
// To Buyer
{
  type: 'order_shipped',
  title: 'Đơn hàng đã được ship!',
  message: 'Container của bạn đang trên đường giao. Mã vận đơn: VCL-SHIP-20251020-001',
  data: {
    orderId: 'order-xyz',
    trackingNumber: 'VCL-SHIP-20251020-001',
    carrier: 'Vietnam Container Lines',
    estimatedDelivery: '2025-10-25T14:00:00Z',
    trackingUrl: 'https://vcl.vn/tracking/...'
  },
  actions: [
    {
      label: 'Theo dõi vận chuyển',
      url: '/orders/order-xyz/tracking'
    },
    {
      label: 'Liên hệ carrier',
      phone: '1900-xxxx'
    }
  ]
}

// To Seller
{
  type: 'shipment_confirmed',
  title: 'Vận chuyển đã xác nhận',
  message: 'Container đang được vận chuyển. Tracking: VCL-SHIP-20251020-001',
  data: {
    orderId: 'order-xyz',
    trackingNumber: 'VCL-SHIP-20251020-001'
  }
}
```

---

### **BƯỚC 4: IN TRANSIT UPDATES** 📍

#### **Trigger:**
Container in transit (periodic updates)

#### **Carrier/Seller Actions:**

1. **Update Location** (Real-time or periodic)
   - Current GPS coordinates
   - Milestone reached
   - Progress percentage
   - Any delays

**API Call:**
```http
PATCH /api/v1/orders/:orderId/delivery-status
Authorization: Bearer [seller_token_or_carrier_token]
Content-Type: application/json

{
  "status": "IN_TRANSIT",
  "currentLocation": {
    "name": "Nghệ An",
    "coordinates": {
      "lat": 18.6783,
      "lng": 105.6920
    },
    "timestamp": "2025-10-22T10:30:00Z"
  },
  "progress": 60,
  "milestoneReached": "HALFWAY_POINT",
  "notes": "Container đang di chuyển qua Nghệ An, mọi thứ bình thường",
  "photos": [
    "https://cdn.example.com/transit/checkpoint1.jpg"
  ]
}
```

**Notifications to Buyer:**
```javascript
{
  type: 'delivery_progress',
  title: 'Cập nhật vận chuyển',
  message: 'Container đang ở Nghệ An (60% hành trình)',
  data: {
    orderId: 'order-xyz',
    location: 'Nghệ An',
    progress: 60,
    estimatedArrival: '2025-10-25T14:00:00Z'
  }
}
```

---

### **BƯỚC 5: DELIVERED** 📦

#### **Trigger:**
Container arrives at destination

#### **Driver/Seller Actions:**

1. **Confirm Delivery**
   - Take photos at delivery location
   - Get buyer signature
   - Complete EIR (Equipment Interchange Receipt)
   - Upload delivery proof

**API Call:**
```http
POST /api/v1/orders/:orderId/mark-delivered
Authorization: Bearer [seller_token]
Content-Type: application/json

{
  "deliveredAt": "2025-10-25T15:30:00Z",
  "deliveryLocation": {
    "address": "456 Nguyễn Văn Linh, Quận 7, HCM",
    "coordinates": {
      "lat": 10.7325,
      "lng": 106.7198
    }
  },
  "deliveryProof": [
    "https://cdn.example.com/delivery/photo1.jpg",
    "https://cdn.example.com/delivery/photo2.jpg",
    "https://cdn.example.com/delivery/signature.png"
  ],
  "eirData": {
    "containerNumber": "ABCU1234567",
    "sealNumber": "SEAL789123",
    "condition": "GOOD",
    "damages": [],
    "receivedByName": "Nguyễn Văn A",
    "receivedBySignature": "https://cdn.example.com/delivery/signature.png",
    "receivedAt": "2025-10-25T15:30:00Z"
  },
  "driverNotes": "Container delivered successfully, buyer inspected and signed EIR"
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
      "updatedAt": "2025-10-25T15:30:00Z"
    },
    "delivery": {
      "id": "delivery-abc123",
      "status": "DELIVERED",
      "deliveredAt": "2025-10-25T15:30:00Z",
      "deliveryProof": [...],
      "eir": {...}
    }
  }
}
```

**Database:**
```sql
-- Update delivery
UPDATE deliveries
SET
  status = 'DELIVERED',
  delivered_at = '2025-10-25 15:30:00',
  delivery_location_json = '{"address": "...", "coordinates": {...}}',
  delivery_proof_json = '["url1", "url2"]',
  eir_data_json = '{"containerNumber": "...", ...}',
  updated_at = NOW()
WHERE id = 'delivery-abc123';

-- Update order
UPDATE orders
SET
  status = 'DELIVERED',
  updated_at = NOW()
WHERE id = 'order-xyz';
```

**Notifications:**
```javascript
// To Buyer
{
  type: 'container_delivered',
  title: 'Container đã được giao!',
  message: 'Container đã được giao đến địa chỉ của bạn. Vui lòng kiểm tra và xác nhận trong vòng 7 ngày.',
  priority: 'HIGH',
  data: {
    orderId: 'order-xyz',
    deliveredAt: '2025-10-25T15:30:00Z',
    deliveryProof: [...],
    eir: {...}
  },
  actions: [
    {
      label: 'Xem chi tiết giao hàng',
      url: '/orders/order-xyz/delivery'
    },
    {
      label: 'Xác nhận đã nhận',
      url: '/orders/order-xyz/confirm-receipt'
    }
  ],
  deadline: '2025-11-01T23:59:59Z'  // 7 days to confirm
}

// To Seller
{
  type: 'delivery_completed',
  title: 'Giao hàng thành công',
  message: 'Container đã được giao cho buyer. Chờ buyer xác nhận để hoàn tất thanh toán.',
  data: {
    orderId: 'order-xyz',
    deliveredAt: '2025-10-25T15:30:00Z'
  }
}
```

---

### **BƯỚC 6: BUYER CONFIRMATION** ✅

#### **Scenario A: Buyer Accepts (Happy Path)**

**Buyer Actions:**
1. Inspect container (1-7 days)
2. Verify condition matches description
3. Check documents
4. Confirm receipt

**API Call:**
```http
POST /api/v1/orders/:orderId/confirm-receipt
Authorization: Bearer [buyer_token]
Content-Type: application/json

{
  "satisfied": true,
  "inspectionDate": "2025-10-26T10:00:00Z",
  "conditionRating": 5,
  "feedback": "Container exactly as described. Excellent condition. Very satisfied!",
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

**Backend Processing:**
```typescript
// 1. Validate buyer ownership
// 2. Check order status = 'DELIVERED'
// 3. Release escrow payment

const platformFeeRate = 0.05; // 5%
const sellerAmount = order.total * (1 - platformFeeRate);
const platformFee = order.total * platformFeeRate;

// Update payment
await prisma.payments.update({
  where: { orderId: order.id },
  data: {
    status: 'RELEASED',
    releasedAt: new Date(),
    sellerAmount: sellerAmount,
    platformFee: platformFee
  }
});

// Update order
await prisma.orders.update({
  where: { id: order.id },
  data: {
    status: 'COMPLETED',
    completedAt: new Date()
  }
});

// Transfer money to seller (external payment gateway)
await transferToSellerBankAccount(seller.id, sellerAmount);
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
      "completedAt": "2025-10-26T10:00:00Z"
    },
    "payment": {
      "id": "payment-abc",
      "status": "RELEASED",
      "releasedAt": "2025-10-26T10:00:00Z",
      "sellerAmount": 1149500000,
      "platformFee": 60500000
    }
  }
}
```

**Notifications:**
```javascript
// To Seller
{
  type: 'payment_released',
  title: '💰 Thanh toán đã được giải ngân!',
  message: 'Buyer đã xác nhận nhận hàng. Số tiền 1,149,500,000 VND đã được chuyển vào tài khoản của bạn.',
  priority: 'HIGH',
  data: {
    orderId: 'order-xyz',
    amount: 1149500000,
    platformFee: 60500000,
    receivedDate: '2025-10-26T10:00:00Z'
  },
  actions: [
    {
      label: 'Xem chi tiết thanh toán',
      url: '/payments/payment-abc'
    },
    {
      label: 'Đánh giá buyer',
      url: '/reviews/create?orderId=order-xyz'
    }
  ]
}

// To Buyer
{
  type: 'transaction_completed',
  title: 'Giao dịch hoàn tất!',
  message: 'Cảm ơn bạn đã xác nhận. Giao dịch đã hoàn tất thành công.',
  data: {
    orderId: 'order-xyz'
  },
  actions: [
    {
      label: 'Đánh giá seller',
      url: '/reviews/create?orderId=order-xyz'
    }
  ]
}
```

---

#### **Scenario B: Buyer Disputes** ⚠️

**Buyer Actions:**
1. Find issues with container
2. Document problems (photos/videos)
3. Raise dispute

**API Call:**
```http
POST /api/v1/orders/:orderId/raise-dispute
Authorization: Bearer [buyer_token]
Content-Type: application/json

{
  "reason": "CONDITION_NOT_AS_DESCRIBED",
  "description": "Container có nhiều vết rỉ sét không được đề cập trong listing. Sàn container bị hư hỏng.",
  "evidence": [
    {
      "type": "photo",
      "url": "https://cdn.example.com/disputes/rust1.jpg",
      "description": "Vết rỉ sét lớn ở thành bên"
    },
    {
      "type": "photo",
      "url": "https://cdn.example.com/disputes/floor-damage.jpg",
      "description": "Sàn bị thủng"
    },
    {
      "type": "video",
      "url": "https://cdn.example.com/disputes/inspection.mp4",
      "description": "Video kiểm tra toàn bộ container"
    }
  ],
  "requestedResolution": "PARTIAL_REFUND",
  "requestedAmount": 50000000,  // 50M VND compensation
  "additionalNotes": "Tôi muốn giữ container nhưng cần được bồi thường cho chi phí sửa chữa"
}
```

**Backend Processing:**
```typescript
// 1. Create dispute record
const dispute = await prisma.disputes.create({
  data: {
    id: randomUUID(),
    orderId: order.id,
    raisedBy: userId,
    reason: 'CONDITION_NOT_AS_DESCRIBED',
    description: '...',
    evidence: [...],
    requestedResolution: 'PARTIAL_REFUND',
    requestedAmount: 50000000,
    status: 'OPEN',
    createdAt: new Date()
  }
});

// 2. Hold escrow payment (no release)
await prisma.payments.update({
  where: { orderId: order.id },
  data: {
    status: 'ON_HOLD',
    holdReason: 'DISPUTE_RAISED'
  }
});

// 3. Update order status
await prisma.orders.update({
  where: { id: order.id },
  data: {
    status: 'DISPUTED',
    updatedAt: new Date()
  }
});

// 4. Notify admin and seller
```

**Notifications:**
```javascript
// To Admin
{
  type: 'dispute_raised',
  title: '⚠️ URGENT: Dispute cần xử lý',
  message: 'Buyer đã raise dispute cho order #' + orderId.slice(-8),
  priority: 'CRITICAL',
  data: {
    disputeId: dispute.id,
    orderId: 'order-xyz',
    reason: 'CONDITION_NOT_AS_DESCRIBED',
    requestedAmount: 50000000
  },
  actions: [
    {
      label: 'Xem chi tiết dispute',
      url: '/admin/disputes/' + dispute.id
    }
  ]
}

// To Seller
{
  type: 'dispute_notification',
  title: '⚠️ Buyer đã raise dispute',
  message: 'Buyer báo cáo container không đúng mô tả. Vui lòng cung cấp phản hồi.',
  priority: 'HIGH',
  data: {
    disputeId: dispute.id,
    orderId: 'order-xyz',
    reason: 'CONDITION_NOT_AS_DESCRIBED'
  },
  actions: [
    {
      label: 'Xem dispute & phản hồi',
      url: '/disputes/' + dispute.id
    }
  ]
}
```

---

## 3. API ENDPOINTS

### **Complete API List for Delivery Flow**

#### **Preparation Phase**
```
POST   /api/v1/orders/:id/prepare-delivery
POST   /api/v1/orders/:id/mark-ready
GET    /api/v1/orders/:id/preparation-status
PATCH  /api/v1/orders/:id/preparation
```

#### **Shipping Phase**
```
POST   /api/v1/orders/:id/ship
PATCH  /api/v1/orders/:id/delivery-status
GET    /api/v1/orders/:id/tracking
POST   /api/v1/orders/:id/mark-delivered
```

#### **Confirmation Phase**
```
POST   /api/v1/orders/:id/confirm-receipt
POST   /api/v1/orders/:id/raise-dispute
GET    /api/v1/orders/:id/delivery-details
```

#### **Documents**
```
GET    /api/v1/orders/:id/documents
POST   /api/v1/orders/:id/documents/upload
GET    /api/v1/orders/:id/eir
```

---

## 4. DATABASE CHANGES

### **New Tables Needed**

#### **order_preparations**
```sql
CREATE TABLE order_preparations (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL REFERENCES orders(id),
  started_at TIMESTAMP NOT NULL,
  estimated_ready_date DATE,
  actual_ready_date TIMESTAMP,
  preparation_notes TEXT,
  photos_json JSONB,  -- Array of photo URLs
  documents_json JSONB,  -- Array of {type, url, name}
  condition_notes TEXT,
  status VARCHAR(50) DEFAULT 'IN_PROGRESS',  -- IN_PROGRESS, COMPLETED
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_preparations_order_id ON order_preparations(order_id);
```

#### **deliveries** (Update existing)
```sql
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS carrier_contact_json JSONB;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS transport_method VARCHAR(50);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS route_json JSONB;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS driver_info_json JSONB;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(15,2);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS delivery_location_json JSONB;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS delivery_proof_json JSONB;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS eir_data_json JSONB;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS current_location_json JSONB;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS in_transit_at TIMESTAMP;
```

#### **disputes** (New)
```sql
CREATE TABLE disputes (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL REFERENCES orders(id),
  raised_by VARCHAR(255) NOT NULL REFERENCES users(id),
  reason VARCHAR(100) NOT NULL,  -- CONDITION_NOT_AS_DESCRIBED, DELIVERY_ISSUE, etc.
  description TEXT NOT NULL,
  evidence_json JSONB,  -- Array of {type, url, description}
  requested_resolution VARCHAR(50),  -- FULL_REFUND, PARTIAL_REFUND, REPLACEMENT
  requested_amount DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'OPEN',  -- OPEN, INVESTIGATING, RESOLVED, REJECTED
  admin_id VARCHAR(255) REFERENCES users(id),
  resolution TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_disputes_order_id ON disputes(order_id);
CREATE INDEX idx_disputes_status ON disputes(status);
```

---

## 5. NOTIFICATIONS

### **Notification Events**

| Event | Recipient | Priority | Type |
|-------|-----------|----------|------|
| `preparation_started` | Buyer | MEDIUM | INFO |
| `preparation_updated` | Buyer | LOW | INFO |
| `container_ready` | Buyer | HIGH | ACTION_REQUIRED |
| `order_shipped` | Buyer | HIGH | INFO |
| `shipment_confirmed` | Seller | MEDIUM | INFO |
| `delivery_progress` | Buyer | LOW | INFO |
| `container_delivered` | Buyer | HIGH | ACTION_REQUIRED |
| `delivery_completed` | Seller | MEDIUM | INFO |
| `payment_released` | Seller | HIGH | SUCCESS |
| `transaction_completed` | Buyer | MEDIUM | SUCCESS |
| `dispute_raised` | Admin, Seller | CRITICAL | ACTION_REQUIRED |

---

## 6. DOCUMENTS & COMPLIANCE

### **Required Documents**

1. **Bill of Sale**
   - Seller info
   - Buyer info
   - Container details
   - Price & payment terms
   - Signatures

2. **Equipment Interchange Receipt (EIR)**
   - Container number
   - Seal number
   - Condition assessment
   - Photos
   - Buyer/Seller signatures

3. **Certificate of Origin** (if applicable)

4. **Inspection Certificate** (if third-party inspection)

5. **Transfer of Ownership**

---

## 7. TIMELINE & SLA

### **Expected Timeline**

| Phase | Duration | Notes |
|-------|----------|-------|
| Payment to Preparation Start | 0-1 day | Seller should start immediately |
| Preparation | 1-3 days | Depends on container qty |
| Ready to Shipped | 1-2 days | Booking transportation |
| In Transit | 3-7 days | Depends on distance |
| Delivered to Confirmation | 1-7 days | Buyer inspection window |
| **Total** | **6-20 days** | Average: 10-12 days |

### **SLA Penalties**

- **Seller delays > 5 days**: Warning
- **Seller delays > 10 days**: Buyer can cancel with full refund
- **Buyer no confirmation > 7 days**: Auto-confirm & release payment

---

## 8. ERROR HANDLING

### **Common Scenarios**

**1. Seller không chuẩn bị đúng hạn**
- Auto-reminder sau 3 ngày
- Buyer có thể yêu cầu refund sau 10 ngày

**2. Shipping bị delay**
- Seller update estimated delivery
- Notify buyer with new timeline
- Compensate shipping cost nếu quá lâu

**3. Container damaged in transit**
- Insurance claim
- Dispute resolution
- Seller responsibility (usually covered by carrier insurance)

**4. Buyer không xác nhận sau 7 ngày**
- Auto-reminder daily
- After 7 days: Auto-confirm và release payment
- Buyer vẫn có thể dispute sau đó (30 ngày window)

---

## 📊 SUMMARY

### **Key Improvements**

✅ **Added PREPARING_DELIVERY status** - Seller có thể update tiến độ chuẩn bị  
✅ **Added READY_FOR_PICKUP status** - Clear signal cho buyer  
✅ **Enhanced delivery tracking** - Real-time location updates  
✅ **Comprehensive EIR system** - Full documentation  
✅ **Dispute mechanism** - Handle issues professionally  
✅ **Automated notifications** - Keep both parties informed  
✅ **Timeline & SLA** - Clear expectations  

### **Next Steps**

1. ✅ Implement new API endpoints
2. ✅ Create database migrations
3. ✅ Update frontend UI for new statuses
4. ✅ Implement notification system
5. ✅ Create dispute resolution workflow
6. ✅ Testing end-to-end flow

---

**© 2025 i-ContExchange**  
**Document Version:** 1.0  
**Last Updated:** October 16, 2025
