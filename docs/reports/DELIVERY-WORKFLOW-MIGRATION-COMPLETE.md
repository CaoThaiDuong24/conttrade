# 📦 DELIVERY WORKFLOW MIGRATION - HOÀN THÀNH

**Ngày:** 16/10/2025  
**Mục đích:** Triển khai luồng giao hàng hoàn chỉnh cho seller chuẩn bị và giao container

---

## 🎯 TỔNG QUAN

Migration này bổ sung đầy đủ các API và database schema để hỗ trợ luồng:

```
PAID 
  ↓ Seller chuẩn bị container
PREPARING_DELIVERY 
  ↓ Seller đánh dấu sẵn sàng
READY_FOR_PICKUP 
  ↓ Seller/carrier ship
DELIVERING/IN_TRANSIT 
  ↓ Giao hàng đến buyer
DELIVERED 
  ↓ Buyer kiểm tra
  ├─ OK → CONFIRMED (release escrow)
  └─ NOT OK → DISPUTED (hold escrow)
```

---

## 📁 FILES ĐÃ TẠO/CẬP NHẬT

### 1. Migration Files
- ✅ `backend/prisma/migrations/add-delivery-workflow-tables.sql` - SQL migration script
- ✅ `backend/run-delivery-migration.ps1` - PowerShell script để chạy migration

### 2. Prisma Schema Updates
- ✅ `backend/prisma/schema.prisma` - Updated với:
  - Model `deliveries` - Thêm 10 columns mới
  - Model `disputes` - Thêm 11 fields mới
  - Model `dispute_messages` - Mới (tin nhắn trong dispute)
  - Model `dispute_audit_logs` - Mới (audit trail)
  - Model `order_preparations` - Mới (seller preparation tracking)
  - Model `users` - Thêm relations
  - Model `orders` - Thêm relation order_preparations
  - Enum `OrderStatus` - Thêm READY_FOR_PICKUP, DELIVERING

### 3. API Endpoints (Updated)
- ✅ `backend/src/routes/orders.ts` - Thêm 4 endpoints mới:
  - POST `/orders/:id/prepare-delivery`
  - POST `/orders/:id/mark-ready`
  - POST `/orders/:id/mark-delivered`
  - POST `/orders/:id/raise-dispute`

---

## 🗄️ DATABASE SCHEMA CHANGES

### 📋 Bảng Mới

#### 1. `order_preparations`
Tracking quá trình seller chuẩn bị container

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | FK to orders |
| seller_id | UUID | FK to users |
| preparation_started_at | TIMESTAMP | Thời gian bắt đầu chuẩn bị |
| preparation_completed_at | TIMESTAMP | Thời gian hoàn tất |
| estimated_ready_date | TIMESTAMP | Dự kiến sẵn sàng |
| container_inspection_completed | BOOLEAN | Đã kiểm tra container |
| container_cleaned | BOOLEAN | Đã vệ sinh |
| container_repaired | BOOLEAN | Đã sửa chữa |
| documents_prepared | BOOLEAN | Đã chuẩn bị giấy tờ |
| customs_cleared | BOOLEAN | Đã làm thủ tục hải quan |
| inspection_photos_json | JSONB | Ảnh kiểm tra |
| repair_photos_json | JSONB | Ảnh sửa chữa |
| document_urls_json | JSONB | Links tài liệu |
| preparation_notes | TEXT | Ghi chú chuẩn bị |
| seller_notes | TEXT | Ghi chú seller |
| pickup_location_json | JSONB | Vị trí pickup |
| pickup_contact_name | VARCHAR | Tên người liên hệ |
| pickup_contact_phone | VARCHAR | SĐT liên hệ |
| pickup_instructions | TEXT | Hướng dẫn pickup |
| pickup_available_from | TIMESTAMP | Có thể pickup từ |
| pickup_available_to | TIMESTAMP | Có thể pickup đến |
| status | VARCHAR | PREPARING, READY, PICKED_UP |

**Indexes:**
- `idx_order_preparations_order_id`
- `idx_order_preparations_seller_id`
- `idx_order_preparations_status`
- `idx_order_preparations_ready_date`

---

#### 2. `dispute_messages`
Tin nhắn trao đổi trong dispute

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| dispute_id | UUID | FK to disputes |
| sender_id | UUID | FK to users |
| message | TEXT | Nội dung tin nhắn |
| attachments_json | JSONB | File đính kèm |
| is_internal | BOOLEAN | Chỉ admin xem |
| is_resolution | BOOLEAN | Tin nhắn giải quyết cuối |
| created_at | TIMESTAMP | Thời gian gửi |
| read_at | TIMESTAMP | Thời gian đọc |

**Indexes:**
- `idx_dispute_messages_dispute_id`
- `idx_dispute_messages_sender_id`
- `idx_dispute_messages_created_at`

---

#### 3. `dispute_audit_logs`
Audit trail cho mọi thay đổi trong dispute

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| dispute_id | UUID | FK to disputes |
| user_id | UUID | Người thực hiện |
| action | VARCHAR | CREATED, STATUS_CHANGED, ASSIGNED, etc. |
| old_value | TEXT | Giá trị cũ |
| new_value | TEXT | Giá trị mới |
| metadata_json | JSONB | Metadata bổ sung |
| created_at | TIMESTAMP | Thời gian thực hiện |

**Indexes:**
- `idx_dispute_audit_dispute_id`
- `idx_dispute_audit_created_at`

---

### 🔄 Bảng Cập Nhật

#### 4. `deliveries` - Thêm 10 columns mới

| New Column | Type | Description |
|------------|------|-------------|
| carrier_contact_json | JSONB | {name, phone, email, company} |
| transport_method | VARCHAR | Phương thức vận chuyển |
| route_json | JSONB | Lộ trình {waypoints: [...]} |
| driver_info_json | JSONB | {name, phone, license_no, vehicle_no} |
| delivery_location_json | JSONB | Vị trí giao hàng thực tế |
| delivery_proof_json | JSONB | Bằng chứng giao hàng |
| eir_data_json | JSONB | Equipment Interchange Receipt |
| received_by_name | VARCHAR | Tên người nhận |
| received_by_signature | TEXT | Chữ ký người nhận |
| driver_notes | TEXT | Ghi chú từ tài xế |

---

#### 5. `disputes` - Thêm 11 fields mới

| New Field | Type | Description |
|-----------|------|-------------|
| assigned_to | UUID | FK to users (admin được assign) |
| evidence_json | JSONB | Array bằng chứng |
| requested_resolution | VARCHAR | Giải pháp yêu cầu |
| requested_amount | DECIMAL | Số tiền yêu cầu |
| admin_notes | TEXT | Ghi chú admin |
| resolution_notes | TEXT | Ghi chú giải quyết |
| resolution_amount | DECIMAL | Số tiền giải quyết |
| priority | VARCHAR | LOW, MEDIUM, HIGH, URGENT |
| responded_at | TIMESTAMP | Thời gian phản hồi |
| escalated_at | TIMESTAMP | Thời gian leo thang |

**Constraint mới:**
- `UNIQUE (order_id)` - Chỉ 1 dispute active mỗi order

---

#### 6. `OrderStatus` Enum - Thêm 2 giá trị

```prisma
enum OrderStatus {
  CREATED
  PENDING_PAYMENT
  AWAITING_FUNDS
  ESCROW_FUNDED
  PREPARING_DELIVERY     ← Có sẵn
  READY_FOR_PICKUP       ← MỚI THÊM
  DOCUMENTS_READY
  TRANSPORTATION_BOOKED
  IN_TRANSIT
  PAID
  PROCESSING
  SHIPPED
  DELIVERING             ← MỚI THÊM
  DELIVERED
  COMPLETED
  PAYMENT_RELEASED
  CANCELLED
  REFUNDED
  DISPUTED
}
```

---

## 🔌 API ENDPOINTS MỚI

### 1. POST `/api/v1/orders/:id/prepare-delivery`
**Mô tả:** Seller xác nhận bắt đầu chuẩn bị container

**Request Body:**
```json
{
  "preparationNotes": "Checking container condition...",
  "estimatedReadyDate": "2025-10-20T10:00:00Z",
  "inspectionPhotos": ["url1", "url2"],
  "documents": ["url3"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Preparation started successfully",
  "data": {
    "order": {
      "id": "uuid",
      "status": "preparing_delivery"
    },
    "preparation": {
      "id": "uuid",
      "status": "PREPARING"
    }
  }
}
```

**Hành động:**
- Tạo record trong `order_preparations`
- Update order status: `paid` → `preparing_delivery`
- Gửi notification cho buyer: "Seller đang chuẩn bị container"

---

### 2. POST `/api/v1/orders/:id/mark-ready`
**Mô tả:** Seller đánh dấu container sẵn sàng pickup

**Request Body:**
```json
{
  "checklistComplete": {
    "inspection": true,
    "cleaning": true,
    "repair": false,
    "documents": true,
    "customs": true
  },
  "pickupLocation": {
    "address": "123 Depot St, HCMC",
    "lat": 10.762622,
    "lng": 106.660172
  },
  "pickupContact": {
    "name": "Nguyen Van A",
    "phone": "+84901234567"
  },
  "pickupInstructions": "Call 30 mins before arrival",
  "pickupTimeWindow": {
    "from": "2025-10-20T08:00:00Z",
    "to": "2025-10-20T17:00:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Container marked as ready for pickup",
  "data": {
    "order": {
      "id": "uuid",
      "status": "ready_for_pickup"
    }
  }
}
```

**Hành động:**
- Update `order_preparations`: status → `READY`
- Update order status: `preparing_delivery` → `ready_for_pickup`
- Gửi notification cho buyer: "Container sẵn sàng! Vui lòng sắp xếp pickup"

---

### 3. POST `/api/v1/orders/:id/mark-delivered`
**Mô tả:** Seller/carrier xác nhận đã giao hàng

**Request Body:**
```json
{
  "deliveredAt": "2025-10-21T14:30:00Z",
  "deliveryLocation": {
    "lat": 10.762622,
    "lng": 106.660172,
    "address": "Buyer warehouse"
  },
  "deliveryProof": [
    "photo_url_1",
    "photo_url_2"
  ],
  "eirData": {
    "containerCondition": "GOOD",
    "damages": [],
    "photos": ["eir_photo_1"]
  },
  "receivedByName": "Tran Van B",
  "receivedBySignature": "base64_signature_image",
  "driverNotes": "Delivered successfully"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Delivery confirmed successfully",
  "data": {
    "order": {
      "id": "uuid",
      "status": "delivered",
      "deliveredAt": "2025-10-21T14:30:00Z"
    },
    "delivery": {
      "id": "uuid",
      "status": "delivered"
    }
  }
}
```

**Hành động:**
- Update `deliveries`: status → `delivered`, thêm EIR data, delivery proof
- Update order status: `delivering` → `delivered`
- Gửi notification cho buyer: "Container đã được giao! Vui lòng kiểm tra trong 7 ngày"
- Gửi notification cho seller: "Giao hàng thành công, chờ buyer xác nhận"

---

### 4. POST `/api/v1/orders/:id/raise-dispute`
**Mô tả:** Buyer báo cáo vấn đề với container

**Request Body:**
```json
{
  "reason": "CONTAINER_DAMAGED",
  "description": "Container has visible rust and holes that were not in the photos",
  "evidence": [
    {
      "type": "photo",
      "url": "evidence_photo_1.jpg",
      "description": "Rust on door"
    },
    {
      "type": "photo",
      "url": "evidence_photo_2.jpg",
      "description": "Hole in floor"
    },
    {
      "type": "video",
      "url": "evidence_video.mp4",
      "description": "Walk-through inspection"
    }
  ],
  "requestedResolution": "FULL_REFUND",
  "requestedAmount": 50000000,
  "additionalNotes": "Expected Grade A container as advertised"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dispute raised successfully",
  "data": {
    "dispute": {
      "id": "uuid",
      "orderId": "uuid",
      "reason": "CONTAINER_DAMAGED",
      "status": "OPEN",
      "createdAt": "2025-10-21T15:00:00Z"
    }
  }
}
```

**Hành động:**
- Tạo record trong `disputes`
- Update payment status: `completed` → `on_hold`
- Update order status → `disputed`
- Gửi notification cho admin: "⚠️ URGENT: Dispute cần xử lý"
- Gửi notification cho seller: "⚠️ Buyer đã raise dispute"

---

## 🚀 CÁCH CHẠY MIGRATION

### Option 1: Sử dụng PowerShell Script (KHUYẾN NGHỊ)

```powershell
cd "D:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web\backend"
.\run-delivery-migration.ps1
```

Script sẽ tự động:
1. ✅ Validate Prisma schema
2. ✅ Format schema
3. ✅ Generate Prisma Client
4. ✅ Run SQL migration
5. ✅ Create Prisma migration record

---

### Option 2: Manual Migration

#### Bước 1: Format và Validate Schema
```powershell
cd backend
npx prisma format
npx prisma validate
```

#### Bước 2: Generate Prisma Client
```powershell
npx prisma generate
```

#### Bước 3: Run SQL Migration
```powershell
# Lấy database connection từ .env
$env:DATABASE_URL = "postgresql://user:password@host:port/database"

# Run migration
psql -d your_database -f .\prisma\migrations\add-delivery-workflow-tables.sql
```

#### Bước 4: Create Migration Record
```powershell
npx prisma migrate dev --name add_delivery_workflow_tables --create-only
```

---

## ✅ TESTING

### Test Script
Tạo file `test-delivery-workflow.js`:

```javascript
const API_BASE = 'http://localhost:3006/api/v1';
let authToken = 'your_jwt_token';
let orderId = 'test_order_id';

// Test 1: Prepare Delivery
async function testPrepareDelivery() {
  const response = await fetch(`${API_BASE}/orders/${orderId}/prepare-delivery`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      preparationNotes: 'Starting container preparation',
      estimatedReadyDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      inspectionPhotos: ['https://example.com/photo1.jpg']
    })
  });
  
  const data = await response.json();
  console.log('✅ Prepare Delivery:', data);
}

// Test 2: Mark Ready
async function testMarkReady() {
  const response = await fetch(`${API_BASE}/orders/${orderId}/mark-ready`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      checklistComplete: {
        inspection: true,
        cleaning: true,
        documents: true
      },
      pickupLocation: {
        address: '123 Test St',
        lat: 10.762622,
        lng: 106.660172
      },
      pickupContact: {
        name: 'John Doe',
        phone: '+84901234567'
      }
    })
  });
  
  const data = await response.json();
  console.log('✅ Mark Ready:', data);
}

// Test 3: Mark Delivered
async function testMarkDelivered() {
  const response = await fetch(`${API_BASE}/orders/${orderId}/mark-delivered`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      deliveredAt: new Date().toISOString(),
      deliveryLocation: {
        lat: 10.762622,
        lng: 106.660172
      },
      deliveryProof: ['https://example.com/proof.jpg'],
      receivedByName: 'Receiver Name'
    })
  });
  
  const data = await response.json();
  console.log('✅ Mark Delivered:', data);
}

// Test 4: Raise Dispute
async function testRaiseDispute() {
  const response = await fetch(`${API_BASE}/orders/${orderId}/raise-dispute`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      reason: 'CONTAINER_DAMAGED',
      description: 'Container not as described',
      evidence: [
        { type: 'photo', url: 'evidence1.jpg', description: 'Damage photo' }
      ],
      requestedResolution: 'PARTIAL_REFUND',
      requestedAmount: 10000000
    })
  });
  
  const data = await response.json();
  console.log('✅ Raise Dispute:', data);
}

// Run tests sequentially
(async () => {
  await testPrepareDelivery();
  await testMarkReady();
  // await testMarkDelivered();  // Uncomment after shipping
  // await testRaiseDispute();   // Uncomment to test dispute
})();
```

Chạy test:
```powershell
node test-delivery-workflow.js
```

---

## 📊 DATABASE VERIFICATION

Sau khi chạy migration, verify các bảng đã được tạo:

```sql
-- Check new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'order_preparations',
    'dispute_messages', 
    'dispute_audit_logs'
  );

-- Check new columns in deliveries
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'deliveries' 
  AND column_name LIKE '%_json%';

-- Check updated disputes table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'disputes';

-- Check OrderStatus enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid 
  FROM pg_type 
  WHERE typname = 'OrderStatus'
);
```

---

## 🔒 ROLLBACK (Nếu Cần)

Nếu cần rollback migration:

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS update_order_preparations_updated_at ON order_preparations;
DROP TRIGGER IF EXISTS update_disputes_updated_at ON disputes;

-- Drop new tables
DROP TABLE IF EXISTS dispute_audit_logs CASCADE;
DROP TABLE IF EXISTS dispute_messages CASCADE;
DROP TABLE IF EXISTS order_preparations CASCADE;

-- Remove new columns from deliveries
ALTER TABLE deliveries 
  DROP COLUMN IF EXISTS carrier_contact_json,
  DROP COLUMN IF EXISTS transport_method,
  DROP COLUMN IF EXISTS route_json,
  DROP COLUMN IF EXISTS driver_info_json,
  DROP COLUMN IF EXISTS delivery_location_json,
  DROP COLUMN IF EXISTS delivery_proof_json,
  DROP COLUMN IF EXISTS eir_data_json,
  DROP COLUMN IF EXISTS received_by_name,
  DROP COLUMN IF EXISTS received_by_signature,
  DROP COLUMN IF EXISTS driver_notes;

-- Remove new columns from disputes
ALTER TABLE disputes
  DROP COLUMN IF EXISTS assigned_to,
  DROP COLUMN IF EXISTS evidence_json,
  DROP COLUMN IF EXISTS requested_resolution,
  DROP COLUMN IF EXISTS requested_amount,
  DROP COLUMN IF EXISTS admin_notes,
  DROP COLUMN IF EXISTS resolution_notes,
  DROP COLUMN IF EXISTS resolution_amount,
  DROP COLUMN IF EXISTS priority,
  DROP COLUMN IF EXISTS responded_at,
  DROP COLUMN IF EXISTS escalated_at;

-- Note: Cannot easily remove enum values in PostgreSQL
-- Need to recreate enum if rollback is critical
```

---

## 📝 NEXT STEPS

1. **Chạy Migration:**
   ```powershell
   .\run-delivery-migration.ps1
   ```

2. **Restart Backend:**
   ```powershell
   npm run dev
   ```

3. **Test Endpoints:**
   - Tạo test order với status PAID
   - Test luồng: prepare → ready → ship → deliver → confirm/dispute

4. **Update Frontend:**
   - Thêm UI cho seller preparation checklist
   - Thêm UI cho pickup instructions
   - Thêm UI cho delivery confirmation
   - Thêm UI cho dispute form

5. **Monitoring:**
   - Theo dõi logs cho errors
   - Verify notifications được gửi
   - Check escrow payment flow

---

## 🎉 KẾT LUẬN

Migration này hoàn thiện luồng giao hàng với:

✅ **4 API Endpoints mới** cho seller workflow  
✅ **3 Bảng mới** (order_preparations, dispute_messages, dispute_audit_logs)  
✅ **21 Columns mới** trong bảng deliveries và disputes  
✅ **2 OrderStatus mới** (READY_FOR_PICKUP, DELIVERING)  
✅ **Notification system** tích hợp đầy đủ  
✅ **Escrow protection** khi có dispute  

Hệ thống giờ đây hỗ trợ đầy đủ quá trình từ payment → preparation → delivery → confirmation/dispute!

---

**Author:** GitHub Copilot  
**Date:** 16/10/2025  
**Version:** 1.0.0
