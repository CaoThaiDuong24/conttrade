# FEATURE: Xác Nhận Giao/Nhận Từng Container Riêng Lẻ

## 📋 Tổng quan

Triển khai tính năng cho phép **giao và nhận từng container riêng lẻ** thay vì phải xác nhận cả batch cùng lúc.

---

## 🎯 Yêu cầu

### ❌ Vấn đề trước đây:
- Phải xác nhận giao/nhận **TẤT CẢ** containers trong một batch cùng lúc
- Không linh hoạt khi giao từng container vào thời điểm khác nhau
- Không theo dõi được trạng thái từng container riêng lẻ

### ✅ Giải pháp mới:
- ✅ Seller có thể xác nhận giao **TỪNG container** riêng lẻ
- ✅ Buyer có thể xác nhận nhận **TỪNG container** riêng lẻ  
- ✅ Mỗi container có status độc lập
- ✅ Tự động cập nhật status delivery/order khi đủ điều kiện
- ✅ Vẫn giữ lại option xác nhận cả batch (hàng loạt)

---

## 🏗️ Kiến trúc

### Backend API Endpoints

#### 1. Mark Delivered - Single Container
```
POST /api/v1/deliveries/:deliveryId/containers/:containerId/mark-delivered
```

**Request Body:**
```json
{
  "deliveredAt": "2025-11-10T10:00:00Z",
  "deliveredBy": "Seller name",
  "notes": "Container delivered at warehouse"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Container delivered successfully (1/3 in batch)",
  "data": {
    "container": {
      "id": "container-uuid",
      "containerCode": "TCLU1234567",
      "deliveredAt": "2025-11-10T10:00:00Z"
    },
    "delivery": {
      "id": "delivery-uuid",
      "batchNumber": 1,
      "allContainersDelivered": false,
      "deliveredCount": 1,
      "totalCount": 3
    },
    "order": {
      "id": "order-uuid",
      "allDeliveriesComplete": false
    }
  }
}
```

**Logic:**
1. ✅ Verify seller permission
2. ✅ Check container thuộc delivery
3. ✅ Check chưa delivered
4. ✅ Update `delivery_containers.delivered_at`
5. ✅ Update `listing_containers.delivery_status = 'DELIVERED'`
6. ✅ Create delivery event
7. ✅ Check nếu ALL containers trong delivery delivered → update delivery status
8. ✅ Check nếu ALL deliveries trong order complete → update order status
9. ✅ Send notification to buyer

---

#### 2. Confirm Receipt - Single Container
```
POST /api/v1/deliveries/:deliveryId/containers/:containerId/confirm-receipt
```

**Request Body:**
```json
{
  "receivedBy": "John Doe",
  "condition": "GOOD" | "MINOR_DAMAGE" | "MAJOR_DAMAGE",
  "notes": "Container in good condition",
  "photos": ["url1", "url2"],
  "signature": "data:image/png;base64,..."
}
```

**Validation:**
- ✅ `receivedBy` required
- ✅ `condition` required
- ✅ `notes` required nếu MINOR_DAMAGE hoặc MAJOR_DAMAGE
- ✅ `photos` required nếu MAJOR_DAMAGE

**Response:**
```json
{
  "success": true,
  "message": "Receipt confirmed (1/3 in batch)",
  "data": {
    "container": {
      "id": "container-uuid",
      "containerCode": "TCLU1234567",
      "condition": "GOOD",
      "confirmedAt": "2025-11-10T14:00:00Z"
    },
    "delivery": {
      "id": "delivery-uuid",
      "batchNumber": 1,
      "allContainersConfirmed": false,
      "confirmedCount": 1,
      "totalCount": 3
    },
    "order": {
      "id": "order-uuid",
      "status": "DELIVERED",
      "allDeliveriesConfirmed": false
    },
    "dispute": null
  }
}
```

**Logic:**
1. ✅ Verify buyer permission
2. ✅ Validation input
3. ✅ Check container đã delivered
4. ✅ Update `delivery_containers.received_by`, `condition_notes`
5. ✅ Create delivery event
6. ✅ Nếu MAJOR_DAMAGE → tạo dispute tự động
7. ✅ Check nếu ALL containers confirmed → update delivery.receipt_confirmed_at
8. ✅ Check nếu ALL deliveries confirmed → update order status (COMPLETED hoặc DISPUTED)
9. ✅ Send notifications

---

### Database Schema

#### Table: `delivery_containers`
```sql
delivery_containers {
  id                   UUID PRIMARY KEY
  delivery_id          UUID NOT NULL
  container_id         UUID NOT NULL
  container_iso_code   VARCHAR(11)
  
  -- ✅ NEW: Individual container tracking
  delivered_at         TIMESTAMP        -- Khi nào container này được giao
  received_by          VARCHAR(255)     -- Ai nhận container này
  signature_url        TEXT             -- Chữ ký xác nhận
  condition_notes      TEXT             -- JSON: {condition, notes, photos}
  photos_json          JSONB            -- Ảnh chứng minh
  
  created_at           TIMESTAMP
  updated_at           TIMESTAMP
}
```

**Condition Notes JSON Structure:**
```json
{
  "condition": "GOOD" | "MINOR_DAMAGE" | "MAJOR_DAMAGE",
  "notes": "Description of damage",
  "photos": ["url1", "url2"]
}
```

---

### Frontend Components

#### 1. ContainerDeliveryCard.tsx

Hiển thị từng container với trạng thái và action buttons riêng.

**Props:**
```typescript
interface ContainerDeliveryCardProps {
  container: {
    id: string;
    container_iso_code: string;
    delivered_at?: string;
    received_by?: string;
    condition_notes?: string;
  };
  deliveryId: string;
  batchNumber: number;
  isSeller: boolean;
  isBuyer: boolean;
  onRefresh: () => void;
}
```

**Features:**
- ✅ Show container code
- ✅ Show status badges (Chờ giao / Đã giao / Đã xác nhận)
- ✅ Show condition badge (Tốt / Hư nhẹ / Hư nặng)
- ✅ Seller button: "Đã giao" (nếu chưa giao)
- ✅ Buyer button: "Xác nhận" (nếu đã giao chưa confirm)
- ✅ Show delivery info, received by, notes

---

#### 2. SingleContainerReceiptDialog.tsx

Dialog để buyer xác nhận nhận 1 container.

**Features:**
- ✅ Input: Người nhận hàng
- ✅ Radio: Tình trạng container (GOOD/MINOR_DAMAGE/MAJOR_DAMAGE)
- ✅ Textarea: Ghi chú (bắt buộc nếu hư hỏng)
- ✅ Upload: Ảnh chứng minh (bắt buộc nếu hư nặng)
- ✅ Warning: Tự động tạo dispute nếu MAJOR_DAMAGE
- ✅ Call API confirm-receipt

---

#### 3. BatchDeliveryManagement.tsx (Updated)

**Changes:**
- ✅ Import `ContainerDeliveryCard`
- ✅ Render danh sách containers bằng `ContainerDeliveryCard`
- ✅ Giữ lại button "Xác nhận TẤT CẢ" cho batch action (optional)
- ✅ Auto-refresh sau khi action

```tsx
{delivery.delivery_containers.map((container) => (
  <ContainerDeliveryCard
    key={container.id}
    container={container}
    deliveryId={delivery.id}
    batchNumber={delivery.batch_number}
    isSeller={isSeller}
    isBuyer={isBuyer}
    onRefresh={fetchDeliveries}
  />
))}
```

---

## 🔄 User Flow

### Flow 1: Seller giao từng container

1. Seller mở order details page
2. Expand batch để xem danh sách containers
3. Với mỗi container:
   - Status hiển thị "Chờ giao"
   - Click button "Đã giao"
   - Container được mark as delivered
   - Status chuyển sang "Đã giao"
   - Buyer nhận notification
4. Khi TẤT CẢ containers trong batch delivered:
   - Delivery status tự động chuyển "DELIVERED"
5. Khi TẤT CẢ deliveries trong order delivered:
   - Order status tự động chuyển "DELIVERED"

---

### Flow 2: Buyer xác nhận từng container

1. Buyer nhận notification về container delivered
2. Mở order details page
3. Expand batch để xem containers
4. Với mỗi container đã giao:
   - Status hiển thị "Đã giao"
   - Click button "Xác nhận"
   - Dialog mở ra
5. Trong dialog:
   - Nhập tên người nhận
   - Chọn tình trạng: Tốt / Hư nhẹ / Hư nặng
   - Nếu hư hỏng: nhập ghi chú
   - Nếu hư nặng: upload ảnh
   - Click "Xác nhận nhận hàng"
6. Backend xử lý:
   - Lưu thông tin confirm
   - Nếu MAJOR_DAMAGE → tạo dispute
   - Gửi notification cho seller
7. Status container chuyển "Đã xác nhận"
8. Khi TẤT CẢ containers confirmed:
   - Delivery.receipt_confirmed_at được set
9. Khi TẤT CẢ deliveries confirmed:
   - Order status → COMPLETED (hoặc DISPUTED nếu có hư hỏng nặng)

---

### Flow 3: Xử lý dispute tự động

Khi buyer report MAJOR_DAMAGE:

1. ✅ System tự động tạo dispute
```json
{
  "id": "dispute-uuid",
  "order_id": "order-uuid",
  "raised_by": "buyer-id",
  "status": "OPEN",
  "reason": "Container damaged on delivery",
  "description": "Container TCLU1234567 reported with MAJOR_DAMAGE in Batch 1",
  "evidence_json": {
    "deliveryId": "...",
    "containerId": "...",
    "condition": "MAJOR_DAMAGE",
    "notes": "Door broken",
    "photos": ["url1", "url2"]
  },
  "priority": "HIGH"
}
```

2. ✅ Notifications:
   - **Seller**: "⚠️ Container TCLU1234567 bị hư hỏng - Tranh chấp đã được tạo"
   - **Buyer**: "Tranh chấp đã được tạo. Admin sẽ xử lý trong 24h"
   - **Admin**: "🚨 Tranh chấp mới - Container TCLU1234567"

3. ✅ Order status → DISPUTED
4. ✅ Admin xử lý dispute trong dashboard

---

## 📊 Status Tracking

### Container Level Status

| Field | Location | Values | Meaning |
|-------|----------|--------|---------|
| `delivered_at` | `delivery_containers` | timestamp or null | Khi nào container được giao |
| `received_by` | `delivery_containers` | string or null | Ai xác nhận nhận container |
| `condition_notes` | `delivery_containers` | JSON string | Tình trạng container |

**Status Logic:**
```typescript
const isDelivered = !!container.delivered_at;
const isConfirmed = !!container.received_by;
const condition = JSON.parse(container.condition_notes)?.condition;
```

---

### Delivery Level Status

Auto-update based on containers:

```typescript
// Check if ALL containers delivered
const allDelivered = delivery_containers.every(dc => dc.delivered_at !== null);

// Check if ALL containers confirmed
const allConfirmed = delivery_containers.every(dc => dc.received_by !== null);

// Update delivery
if (allDelivered) {
  delivery.status = 'DELIVERED';
  delivery.delivered_at = now();
}

if (allConfirmed) {
  delivery.receipt_confirmed_at = now();
}
```

---

### Order Level Status

Auto-update based on deliveries:

```typescript
// Check all deliveries
const allDeliveriesDelivered = deliveries.every(d => d.status === 'DELIVERED');
const allDeliveriesConfirmed = deliveries.every(d => d.receipt_confirmed_at !== null);
const hasMajorDamage = /* check dispute */;

// Update order
if (allDeliveriesDelivered) {
  order.status = 'DELIVERED';
}

if (allDeliveriesConfirmed) {
  order.status = hasMajorDamage ? 'DISPUTED' : 'COMPLETED';
  order.receipt_confirmed_at = now();
}
```

---

## 🧪 Testing

### Test Case 1: Giao từng container

```bash
# Container 1
POST /api/v1/deliveries/{deliveryId}/containers/{container1}/mark-delivered
→ Status: delivered_at set, delivery still SCHEDULED

# Container 2
POST /api/v1/deliveries/{deliveryId}/containers/{container2}/mark-delivered
→ Status: delivered_at set, delivery still SCHEDULED

# Container 3 (cuối cùng)
POST /api/v1/deliveries/{deliveryId}/containers/{container3}/mark-delivered
→ Status: delivered_at set, delivery → DELIVERED
```

**Expected:**
- ✅ Mỗi container có delivered_at độc lập
- ✅ Delivery status chỉ chuyển sang DELIVERED khi ALL containers delivered
- ✅ Notification gửi cho buyer sau mỗi container

---

### Test Case 2: Xác nhận từng container

```bash
# Container 1 - GOOD
POST /api/v1/deliveries/{deliveryId}/containers/{container1}/confirm-receipt
Body: { condition: "GOOD", receivedBy: "John" }
→ No dispute, status updated

# Container 2 - MINOR_DAMAGE
POST /api/v1/deliveries/{deliveryId}/containers/{container2}/confirm-receipt
Body: { condition: "MINOR_DAMAGE", notes: "Scratched", receivedBy: "John" }
→ No dispute, status updated

# Container 3 - MAJOR_DAMAGE
POST /api/v1/deliveries/{deliveryId}/containers/{container3}/confirm-receipt
Body: { 
  condition: "MAJOR_DAMAGE", 
  notes: "Door broken",
  photos: ["url1"],
  receivedBy: "John"
}
→ Dispute created, order → DISPUTED
```

**Expected:**
- ✅ Container 1: condition GOOD, no dispute
- ✅ Container 2: condition MINOR_DAMAGE, no dispute
- ✅ Container 3: condition MAJOR_DAMAGE, dispute created automatically
- ✅ Order status → DISPUTED (vì có MAJOR_DAMAGE)
- ✅ Notifications sent to seller, buyer, admin

---

### Test Case 3: Mixed scenario

**Setup:**
- Order có 2 batches (Batch 1: 2 containers, Batch 2: 1 container)

**Actions:**
```
Day 1: Seller giao Batch 1 Container 1 
→ Batch 1 status: SCHEDULED (1/2 delivered)

Day 2: Seller giao Batch 1 Container 2
→ Batch 1 status: DELIVERED (2/2 delivered)
→ Order status: DELIVERED (1/2 batches delivered)

Day 3: Buyer xác nhận Batch 1 Container 1 (GOOD)
→ Batch 1: 1/2 confirmed

Day 4: Buyer xác nhận Batch 1 Container 2 (GOOD)
→ Batch 1: 2/2 confirmed, receipt_confirmed_at set
→ Order status: still DELIVERED (waiting Batch 2)

Day 5: Seller giao Batch 2 Container 1
→ Batch 2: DELIVERED
→ Order: ALL batches delivered

Day 6: Buyer xác nhận Batch 2 Container 1 (GOOD)
→ Batch 2: confirmed
→ Order: COMPLETED (all confirmed, no disputes)
```

---

## 🎨 UI/UX

### Container Card Design

```
┌─────────────────────────────────────────────────┐
│ 📦 TCLU1234567                     [Đã giao]   │
│                                   [Tốt]        │
│                                                 │
│ ✅ Giao: 2025-11-10 10:00                      │
│ 👤 Nhận bởi: John Doe                          │
│                                                 │
│                           [Button: Xác nhận]   │
└─────────────────────────────────────────────────┘
```

### Badge Colors

| Status | Color | Icon |
|--------|-------|------|
| Chờ giao | Gray | ⏱️ Clock |
| Đã giao | Blue | 🚚 Truck |
| Đã xác nhận | Green | ✅ CheckCircle |
| Tốt | Green | ✓ CheckCircle |
| Hư nhẹ | Yellow | ⚠ AlertTriangle |
| Hư nặng | Red | ✗ XCircle |

---

## 📝 Notes

### Backward Compatibility

✅ **Giữ lại batch-level actions:**
- Vẫn có endpoint cũ: `POST /deliveries/:id/mark-delivered` (mark all)
- Vẫn có endpoint cũ: `POST /deliveries/:id/confirm-receipt` (confirm all)
- Button "Xác nhận TẤT CẢ" vẫn hiển thị cho quick action

### Performance

- ✅ Individual updates không ảnh hưởng performance
- ✅ Transaction đảm bảo data consistency
- ✅ Notification async không block response

### Future Enhancements

- 🔮 Signature capture trực tiếp trên mobile
- 🔮 Photo upload lên S3/storage service
- 🔮 QR code scan để confirm container
- 🔮 GPS tracking vị trí giao hàng
- 🔮 Real-time updates với WebSocket

---

## ✅ Kết luận

**Đã triển khai:**
- ✅ Backend API cho container-level actions
- ✅ Frontend components mới
- ✅ Auto status updates
- ✅ Dispute handling
- ✅ Notifications
- ✅ Backward compatible

**Files changed:**
- ✅ `backend/src/routes/deliveries.ts` (added 2 endpoints)
- ✅ `frontend/components/orders/ContainerDeliveryCard.tsx` (new)
- ✅ `frontend/components/orders/SingleContainerReceiptDialog.tsx` (new)
- ✅ `frontend/components/orders/BatchDeliveryManagement.tsx` (updated)

**Ready for testing!** 🚀

---

**Ngày triển khai:** 2025-11-10  
**Status:** ✅ COMPLETED - Ready for QA
