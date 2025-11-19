# 📘 API Quick Reference - Delivery Confirmation

**Version:** 1.0.0  
**Last Updated:** 10/11/2025

---

## 🎯 OVERVIEW

2 API endpoints mới cho xác nhận giao hàng và nhận hàng theo batch (lô):

| Endpoint | Method | Actor | Purpose |
|----------|--------|-------|---------|
| `/api/v1/deliveries/:deliveryId/mark-delivered` | POST | Seller | Xác nhận đã giao một batch |
| `/api/v1/deliveries/:deliveryId/confirm-receipt` | POST | Buyer | Xác nhận đã nhận một batch |

---

## 📤 API 1: Mark Delivered (Seller)

### Endpoint
```
POST /api/v1/deliveries/:deliveryId/mark-delivered
```

### Headers
```
Authorization: Bearer {seller_token}
Content-Type: application/json
```

### Request Body
```json
{
  "delivered_by": "Nguyễn Văn A - Tài xế",
  "delivered_at": "2025-11-10T10:30:00Z",
  "notes": "Giao hàng thành công"
}
```

### Response Success (200)
```json
{
  "success": true,
  "message": "Batch được đánh dấu là đã giao thành công",
  "data": {
    "delivery": {
      "id": "delivery-uuid",
      "status": "DELIVERED",
      "delivered_at": "2025-11-10T10:30:00Z",
      "batch_number": 1,
      "total_batches": 3
    },
    "order": {
      "id": "order-uuid",
      "status": "PARTIALLY_DELIVERED",
      "delivery_progress": {
        "total_batches": 3,
        "delivered_batches": 1,
        "percentage": 33.33
      }
    },
    "containers": [
      {
        "id": "container-1-uuid",
        "container_iso_code": "MSCU1234567",
        "delivery_status": "DELIVERED",
        "delivered_at": "2025-11-10T10:30:00Z"
      },
      {
        "id": "container-2-uuid",
        "container_iso_code": "MSCU2345678",
        "delivery_status": "DELIVERED",
        "delivered_at": "2025-11-10T10:30:00Z"
      }
    ]
  }
}
```

### Response Errors

#### 404 Not Found - Delivery không tồn tại
```json
{
  "success": false,
  "message": "Không tìm thấy thông tin giao hàng"
}
```

#### 403 Forbidden - Không có quyền
```json
{
  "success": false,
  "message": "Bạn không có quyền xác nhận giao hàng cho batch này"
}
```

#### 400 Bad Request - Status không hợp lệ
```json
{
  "success": false,
  "message": "Batch này đã được đánh dấu là đã giao rồi"
}
```

### Logic Flow

1. Validate delivery exists
2. Check authorization (must be seller of order)
3. Check current delivery status (must be PENDING, SCHEDULED, or IN_TRANSIT)
4. Update delivery:
   - status → DELIVERED
   - delivered_at → provided timestamp
   - notes → delivery notes
5. Update all containers in batch:
   - delivery_status → DELIVERED
   - delivered_at → provided timestamp
6. Check if all batches delivered:
   - If YES → Order status = DELIVERED
   - If NO → Order status = PARTIALLY_DELIVERED
7. Create delivery event (type: DELIVERED)
8. Send notifications to buyer and admin

### cURL Example
```bash
curl -X POST \
  http://localhost:8000/api/v1/deliveries/123e4567-e89b-12d3-a456-426614174000/mark-delivered \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "delivered_by": "Nguyễn Văn A - Tài xế",
    "delivered_at": "2025-11-10T10:30:00Z",
    "notes": "Giao hàng thành công"
  }'
```

---

## 📥 API 2: Confirm Receipt (Buyer)

### Endpoint
```
POST /api/v1/deliveries/:deliveryId/confirm-receipt
```

### Headers
```
Authorization: Bearer {buyer_token}
Content-Type: application/json
```

### Request Body
```json
{
  "received_by": "Trần Thị B - Quản lý kho",
  "containers": [
    {
      "container_id": "container-1-uuid",
      "condition": "GOOD",
      "notes": "Container trong tình trạng tốt"
    },
    {
      "container_id": "container-2-uuid",
      "condition": "MINOR_DAMAGE",
      "notes": "Một vài vết trầy nhẹ ở góc container",
      "photos": [
        "https://cdn.example.com/photo1.jpg"
      ]
    },
    {
      "container_id": "container-3-uuid",
      "condition": "MAJOR_DAMAGE",
      "notes": "Cửa container bị hỏng nghiêm trọng, không đóng được",
      "photos": [
        "https://cdn.example.com/photo1.jpg",
        "https://cdn.example.com/photo2.jpg"
      ]
    }
  ]
}
```

### Condition Values
- `GOOD`: Container tốt, không vấn đề gì
- `MINOR_DAMAGE`: Hư hỏng nhẹ (vết trầy, xước nhỏ)
- `MAJOR_DAMAGE`: Hư hỏng nặng (cửa hỏng, thủng, biến dạng) → Tự động tạo dispute

### Response Success (200)
```json
{
  "success": true,
  "message": "Xác nhận nhận hàng thành công",
  "data": {
    "delivery": {
      "id": "delivery-uuid",
      "receipt_confirmed_at": "2025-11-10T11:00:00Z",
      "batch_number": 1,
      "total_batches": 3
    },
    "order": {
      "id": "order-uuid",
      "status": "PARTIALLY_CONFIRMED",
      "confirmation_progress": {
        "total_batches": 3,
        "confirmed_batches": 1,
        "percentage": 33.33
      }
    },
    "containers": [
      {
        "id": "container-1-uuid",
        "container_iso_code": "MSCU1234567",
        "receipt_condition": "GOOD",
        "receipt_notes": "Container trong tình trạng tốt",
        "receipt_confirmed_at": "2025-11-10T11:00:00Z"
      },
      {
        "id": "container-2-uuid",
        "container_iso_code": "MSCU2345678",
        "receipt_condition": "MINOR_DAMAGE",
        "receipt_notes": "Một vài vết trầy nhẹ",
        "receipt_photos": ["https://cdn.example.com/photo1.jpg"],
        "receipt_confirmed_at": "2025-11-10T11:00:00Z"
      },
      {
        "id": "container-3-uuid",
        "container_iso_code": "MSCU3456789",
        "receipt_condition": "MAJOR_DAMAGE",
        "receipt_notes": "Cửa container bị hỏng nghiêm trọng",
        "receipt_photos": [
          "https://cdn.example.com/photo1.jpg",
          "https://cdn.example.com/photo2.jpg"
        ],
        "receipt_confirmed_at": "2025-11-10T11:00:00Z"
      }
    ],
    "disputes_created": [
      {
        "id": "dispute-uuid",
        "type": "DAMAGE",
        "status": "OPEN",
        "priority": "HIGH",
        "container_id": "container-3-uuid",
        "container_iso_code": "MSCU3456789",
        "reason": "MAJOR_DAMAGE: Cửa container bị hỏng nghiêm trọng"
      }
    ]
  }
}
```

### Response Errors

#### 404 Not Found - Delivery không tồn tại
```json
{
  "success": false,
  "message": "Không tìm thấy thông tin giao hàng"
}
```

#### 403 Forbidden - Không có quyền
```json
{
  "success": false,
  "message": "Bạn không có quyền xác nhận nhận hàng cho batch này"
}
```

#### 400 Bad Request - Chưa giao hàng
```json
{
  "success": false,
  "message": "Batch này chưa được đánh dấu là đã giao"
}
```

#### 400 Bad Request - Container không thuộc batch
```json
{
  "success": false,
  "message": "Container MSCU9999999 không thuộc batch này"
}
```

#### 400 Bad Request - Condition không hợp lệ
```json
{
  "success": false,
  "message": "Condition phải là GOOD, MINOR_DAMAGE hoặc MAJOR_DAMAGE"
}
```

### Logic Flow

1. Validate delivery exists
2. Check authorization (must be buyer of order)
3. Check delivery already marked as delivered
4. Validate all containers belong to this delivery
5. Validate condition values
6. Update each container:
   - receipt_condition → GOOD/MINOR_DAMAGE/MAJOR_DAMAGE
   - receipt_notes → buyer's notes
   - receipt_photos → array of photo URLs (if provided)
   - receipt_confirmed_at → current timestamp
7. Create dispute automatically for MAJOR_DAMAGE containers:
   - Type: DAMAGE
   - Status: OPEN
   - Priority: HIGH
   - Notify seller and admin
8. Update delivery:
   - receipt_confirmed_at → current timestamp
9. Check if all batches confirmed:
   - If YES → Order status = COMPLETED
   - If NO → Order status = PARTIALLY_CONFIRMED
10. Create delivery event (type: DELIVERED)
11. Send notifications to seller and admin

### cURL Example
```bash
curl -X POST \
  http://localhost:8000/api/v1/deliveries/123e4567-e89b-12d3-a456-426614174000/confirm-receipt \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "received_by": "Trần Thị B - Quản lý kho",
    "containers": [
      {
        "container_id": "container-1-uuid",
        "condition": "GOOD",
        "notes": "Container trong tình trạng tốt"
      },
      {
        "container_id": "container-2-uuid",
        "condition": "MAJOR_DAMAGE",
        "notes": "Cửa bị hỏng",
        "photos": ["https://cdn.example.com/photo1.jpg"]
      }
    ]
  }'
```

---

## 📊 ORDER STATUS TRANSITIONS

### Complete Flow

```
TRANSPORTATION_BOOKED
  ↓
[Seller marks batch 1 delivered]
  ↓
PARTIALLY_DELIVERED
  ↓
[Buyer confirms batch 1 receipt]
  ↓
PARTIALLY_CONFIRMED
  ↓
[Seller marks batch 2 delivered]
  ↓
PARTIALLY_DELIVERED (still)
  ↓
[Buyer confirms batch 2 receipt]
  ↓
PARTIALLY_CONFIRMED (still)
  ↓
[Seller marks batch 3 delivered - LAST BATCH]
  ↓
DELIVERED (all batches delivered)
  ↓
[Buyer confirms batch 3 receipt - LAST BATCH]
  ↓
COMPLETED ✅
```

### Status Meanings

| Status | Meaning | Next Action |
|--------|---------|-------------|
| `TRANSPORTATION_BOOKED` | Vận chuyển đã được đặt | Seller mark delivered batch 1 |
| `PARTIALLY_DELIVERED` | Một số batch đã giao | Buyer confirm receipt batch 1, hoặc Seller mark delivered batch tiếp |
| `DELIVERED` | Tất cả batch đã giao | Buyer confirm receipt các batch đã giao |
| `PARTIALLY_CONFIRMED` | Một số batch đã xác nhận | Buyer confirm receipt các batch còn lại |
| `COMPLETED` | Hoàn thành | End state ✅ |

---

## 🔔 NOTIFICATIONS

### When Seller Marks Delivered

**To Buyer:**
```json
{
  "type": "DELIVERY_COMPLETED",
  "title": "Lô hàng đã được giao",
  "message": "Lô 1/3 của đơn hàng #ORD-2025-001 đã được giao. Vui lòng xác nhận nhận hàng.",
  "data": {
    "order_id": "order-uuid",
    "delivery_id": "delivery-uuid",
    "batch_number": 1,
    "total_batches": 3,
    "containers_count": 2
  }
}
```

**To Admin:**
```json
{
  "type": "DELIVERY_COMPLETED",
  "title": "Lô hàng đã được giao",
  "message": "Seller đã xác nhận giao lô 1/3 của đơn #ORD-2025-001",
  "data": {
    "order_id": "order-uuid",
    "delivery_id": "delivery-uuid",
    "seller_id": "seller-uuid",
    "buyer_id": "buyer-uuid"
  }
}
```

---

### When Buyer Confirms Receipt

**To Seller:**
```json
{
  "type": "DELIVERY_RECEIPT_CONFIRMED",
  "title": "Người mua đã xác nhận nhận hàng",
  "message": "Lô 1/3 của đơn #ORD-2025-001 đã được xác nhận. 2 container tốt, 0 hư hỏng.",
  "data": {
    "order_id": "order-uuid",
    "delivery_id": "delivery-uuid",
    "batch_number": 1,
    "total_batches": 3,
    "condition_summary": {
      "good": 2,
      "minor_damage": 0,
      "major_damage": 0
    }
  }
}
```

**To Admin:**
```json
{
  "type": "DELIVERY_RECEIPT_CONFIRMED",
  "title": "Lô hàng đã được xác nhận",
  "message": "Buyer đã xác nhận lô 1/3 của đơn #ORD-2025-001",
  "data": {
    "order_id": "order-uuid",
    "delivery_id": "delivery-uuid",
    "buyer_id": "buyer-uuid",
    "seller_id": "seller-uuid"
  }
}
```

---

### When MAJOR_DAMAGE Detected

**To Seller:**
```json
{
  "type": "DISPUTE_CREATED",
  "title": "Tranh chấp mới: Container hư hỏng",
  "message": "Container MSCU3456789 bị báo cáo hư hỏng nặng. Vui lòng kiểm tra.",
  "data": {
    "dispute_id": "dispute-uuid",
    "order_id": "order-uuid",
    "container_id": "container-uuid",
    "container_iso_code": "MSCU3456789",
    "reason": "MAJOR_DAMAGE: Cửa container bị hỏng nghiêm trọng"
  }
}
```

**To Admin:**
```json
{
  "type": "DISPUTE_CREATED",
  "title": "Tranh chấp mới cần xử lý",
  "message": "Dispute về container MSCU3456789 trong đơn #ORD-2025-001",
  "data": {
    "dispute_id": "dispute-uuid",
    "order_id": "order-uuid",
    "priority": "HIGH",
    "type": "DAMAGE"
  }
}
```

---

## 🔍 COMMON USE CASES

### Use Case 1: Giao hàng tuần tự (Sequential Delivery)

```javascript
// Day 1: Seller delivers batch 1
POST /deliveries/{batch1-id}/mark-delivered
// Order: PARTIALLY_DELIVERED

// Day 1: Buyer confirms batch 1
POST /deliveries/{batch1-id}/confirm-receipt
// Order: PARTIALLY_CONFIRMED

// Day 2: Seller delivers batch 2
POST /deliveries/{batch2-id}/mark-delivered
// Order: PARTIALLY_DELIVERED

// Day 2: Buyer confirms batch 2
POST /deliveries/{batch2-id}/confirm-receipt
// Order: PARTIALLY_CONFIRMED

// Day 3: Seller delivers batch 3 (last)
POST /deliveries/{batch3-id}/mark-delivered
// Order: DELIVERED

// Day 3: Buyer confirms batch 3 (last)
POST /deliveries/{batch3-id}/confirm-receipt
// Order: COMPLETED ✅
```

---

### Use Case 2: Giao hết rồi xác nhận sau (Deliver All, Confirm Later)

```javascript
// Day 1: Seller delivers all batches
POST /deliveries/{batch1-id}/mark-delivered
POST /deliveries/{batch2-id}/mark-delivered
POST /deliveries/{batch3-id}/mark-delivered
// Order: DELIVERED

// Day 2: Buyer confirms all batches
POST /deliveries/{batch1-id}/confirm-receipt
// Order: PARTIALLY_CONFIRMED
POST /deliveries/{batch2-id}/confirm-receipt
// Order: PARTIALLY_CONFIRMED
POST /deliveries/{batch3-id}/confirm-receipt
// Order: COMPLETED ✅
```

---

### Use Case 3: Container bị hư hỏng (Damaged Container)

```javascript
// Buyer confirms receipt with one MAJOR_DAMAGE container
POST /deliveries/{batch1-id}/confirm-receipt
{
  "received_by": "Trần Thị B",
  "containers": [
    {
      "container_id": "xxx",
      "condition": "GOOD"
    },
    {
      "container_id": "yyy",
      "condition": "MAJOR_DAMAGE",
      "notes": "Cửa hỏng nặng",
      "photos": ["url1.jpg", "url2.jpg"]
    }
  ]
}

// Response includes auto-created dispute
{
  "success": true,
  "data": {
    "disputes_created": [
      {
        "id": "dispute-uuid",
        "type": "DAMAGE",
        "status": "OPEN",
        "priority": "HIGH"
      }
    ]
  }
}

// Notifications sent to:
// - Seller: "Container hư hỏng được báo cáo"
// - Admin: "Dispute mới cần xử lý"
```

---

## 📝 NOTES

### Important Points

1. **Authorization:**
   - Chỉ có seller của order mới có thể mark delivered
   - Chỉ có buyer của order mới có thể confirm receipt

2. **Validation:**
   - Delivery phải tồn tại
   - Containers phải thuộc đúng delivery
   - Condition values phải hợp lệ

3. **Transaction Safety:**
   - Tất cả database operations trong transaction
   - Rollback nếu có lỗi bất kỳ

4. **Automatic Actions:**
   - Tự động tạo dispute cho MAJOR_DAMAGE
   - Tự động gửi notifications
   - Tự động cập nhật order status

5. **Status Progression:**
   - PARTIALLY_DELIVERED → khi có batch đã giao nhưng chưa hết
   - DELIVERED → khi TẤT CẢ batch đã giao
   - PARTIALLY_CONFIRMED → khi có batch đã confirm nhưng chưa hết
   - COMPLETED → khi TẤT CẢ batch đã confirm

---

## 🧪 TESTING

### Test với cURL

```bash
# 1. Get delivery ID from order
curl -X GET http://localhost:8000/api/v1/orders/{orderId}/deliveries \
  -H 'Authorization: Bearer {token}'

# 2. Seller marks delivered
curl -X POST http://localhost:8000/api/v1/deliveries/{deliveryId}/mark-delivered \
  -H 'Authorization: Bearer {seller_token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "delivered_by": "Test Driver",
    "delivered_at": "2025-11-10T10:00:00Z",
    "notes": "Test delivery"
  }'

# 3. Buyer confirms receipt
curl -X POST http://localhost:8000/api/v1/deliveries/{deliveryId}/confirm-receipt \
  -H 'Authorization: Bearer {buyer_token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "received_by": "Test Receiver",
    "containers": [
      {
        "container_id": "{container1_id}",
        "condition": "GOOD",
        "notes": "Perfect"
      },
      {
        "container_id": "{container2_id}",
        "condition": "MINOR_DAMAGE",
        "notes": "Small scratch"
      }
    ]
  }'
```

### Integration Test

```bash
cd backend
node test-delivery-confirmation.mjs
```

Expected output: ALL TESTS PASSED ✅

---

## 🔗 RELATED ENDPOINTS

### Get Order Deliveries
```
GET /api/v1/orders/:orderId/deliveries
```

### Get Single Delivery
```
GET /api/v1/deliveries/:deliveryId
```

### Get Delivery Containers
```
GET /api/v1/deliveries/:deliveryId/containers
```

---

**End of Quick Reference**  
For detailed implementation guide, see: `HOAN-THANH-XAC-NHAN-GIAO-HANG-NHIEU-CONTAINER.md`
