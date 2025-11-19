# ✅ CONTAINER TRANSPORTATION BOOKING FEATURE

## 📋 Tổng quan

Feature cho phép **buyer đặt vận chuyển cho từng container riêng lẻ** sau khi order được seller chuẩn bị xong.

---

## 🔄 Quy trình (Workflow)

### **Bước 1: Seller chuẩn bị container** ✅
- Order status: `READY_FOR_PICKUP`
- Containers sẵn sàng để giao

### **Bước 2: Buyer đặt vận chuyển** 🆕
- Buyer mở order details
- Expand batch để xem danh sách containers
- Mỗi container có button **"Đặt vận chuyển"**
- Click button → Dialog mở ra
- Nhập thông tin:
  - ✅ Phương thức vận chuyển (logistics / tự lấy / seller giao)
  - ✅ Công ty logistics (nếu chọn logistics)
  - ✅ Địa chỉ giao hàng
  - ✅ Người nhận + số điện thoại
  - ✅ Ngày giờ giao hàng
  - ✅ Yêu cầu cẩu (checkbox)
  - ✅ Ghi chú đặc biệt
  - ✅ Phí vận chuyển ước tính

### **Bước 3: Container được đánh dấu "Đã đặt vận chuyển"** ✅
- Container status badge: **"Đã đặt vận chuyển"** (blue)
- Hiển thị thông tin:
  - Ngày đặt
  - Phương thức
  - Công ty logistics
  - Ngày giao dự kiến
- Seller nhận notification

### **Bước 4: Seller giao container** ✅
- Seller thấy button **"Đã giao"** (chỉ hiện khi đã đặt vận chuyển)
- Click → Container status: **"Đã giao"**

### **Bước 5: Buyer xác nhận nhận hàng** ✅
- Buyer xác nhận từng container
- Kiểm tra tình trạng (tốt/hư nhẹ/hư nặng)
- Status: **"Đã xác nhận"**

---

## 🗄️ Database Schema

### **Table: `delivery_containers`**

```sql
CREATE TABLE delivery_containers (
  id                      VARCHAR(255) PRIMARY KEY,
  delivery_id             VARCHAR(255) NOT NULL,
  container_id            VARCHAR(255) NOT NULL,
  container_iso_code      VARCHAR(50) NOT NULL,
  
  -- Transportation booking (NEW)
  transportation_booked_at TIMESTAMP NULL,
  transport_method        VARCHAR(50) NULL,  -- 'self_pickup' | 'logistics' | 'seller_delivers'
  logistics_company       VARCHAR(255) NULL,
  transport_notes         TEXT NULL,  -- JSON: { deliveryAddress, deliveryContact, deliveryPhone, deliveryDate, deliveryTime, needsCrane, specialInstructions, transportationFee }
  
  -- Delivery tracking
  pickup_date             TIMESTAMP NULL,
  loaded_at               TIMESTAMP NULL,
  delivered_at            TIMESTAMP NULL,
  
  -- Receipt confirmation
  received_by             VARCHAR(255) NULL,
  signature_url           TEXT NULL,
  condition_notes         TEXT NULL,  -- JSON: { condition, notes, photos }
  photos_json             JSON NULL,
  
  created_at              TIMESTAMP DEFAULT NOW(),
  updated_at              TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
  FOREIGN KEY (container_id) REFERENCES listing_containers(id) ON DELETE CASCADE,
  UNIQUE (delivery_id, container_id)
);
```

**Migration file:** `backend/migrations/add-transportation-booking-fields.sql`

---

## 🔌 API Endpoints

### **POST `/api/v1/deliveries/:deliveryId/containers/:containerId/book-transportation`**

**Buyer đặt vận chuyển cho container**

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Request Body:**
```json
{
  "transportMethod": "logistics",  // 'self_pickup' | 'logistics' | 'seller_delivers'
  "logisticsCompany": "Viettel Post",  // Required nếu method = 'logistics'
  "deliveryAddress": "123 Nguyễn Văn A, Phường 1, Quận 1, TP.HCM",
  "deliveryContact": "Nguyễn Văn A",
  "deliveryPhone": "0912345678",
  "deliveryDate": "2025-11-15",
  "deliveryTime": "09:00",
  "needsCrane": true,
  "specialInstructions": "Gọi trước 1 ngày",
  "transportationFee": 5000000
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Transportation booked successfully",
  "data": {
    "container": {
      "id": "container-uuid",
      "containerCode": "TCLU1234567",
      "transportationBookedAt": "2025-11-10T10:00:00Z"
    },
    "transport": {
      "method": "logistics",
      "logisticsCompany": "Viettel Post",
      "deliveryDate": "2025-11-15",
      "deliveryTime": "09:00",
      "deliveryAddress": "123 Nguyễn Văn A..."
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Only buyer can book transportation"
}
```

**Validation:**
- ✅ User phải là buyer của order
- ✅ Container chưa được đặt vận chuyển
- ✅ Transport method hợp lệ
- ✅ Logistics company bắt buộc nếu method = 'logistics'
- ✅ Ngày giao phải là tương lai

---

## 💻 Frontend Components

### **1. ContainerDeliveryCard** (Updated)

**File:** `frontend/components/orders/ContainerDeliveryCard.tsx`

**Props thêm:**
```typescript
interface ContainerDeliveryCardProps {
  container: {
    id: string;
    container_iso_code: string;
    // NEW: Transportation booking fields
    transportation_booked_at?: string;
    transport_method?: string;
    logistics_company?: string;
    transport_notes?: string;
    // Existing fields
    delivered_at?: string;
    received_by?: string;
    condition_notes?: string;
  };
  // ... other props
}
```

**Status Badges:**
1. ⏳ **"Chưa đặt vận chuyển"** (gray) - Chưa book transport
2. 📅 **"Đã đặt vận chuyển"** (blue) - Đã book, chờ seller giao
3. 🚚 **"Đã giao"** (default) - Seller đã giao, chờ buyer confirm
4. ✅ **"Đã xác nhận"** (green) - Buyer đã confirm
5. 🟢 **"Tốt"** / 🟡 **"Hư nhẹ"** / 🔴 **"Hư nặng"** - Condition sau khi confirm

**Action Buttons:**
- **Buyer (chưa đặt vận chuyển):** Button "Đặt vận chuyển"
- **Seller (đã đặt, chưa giao):** Button "Đã giao"
- **Buyer (đã giao, chưa confirm):** Button "Xác nhận"
- **Đã hoàn tất:** "✓ Hoàn tất"

---

### **2. BookTransportationDialog** (NEW)

**File:** `frontend/components/orders/BookTransportationDialog.tsx`

**Features:**
- ✅ Radio buttons chọn phương thức vận chuyển:
  - 🚚 Thuê công ty vận chuyển
  - 👤 Tự đến lấy hàng
  - 🏢 Người bán giao hàng
- ✅ Conditional field: Công ty logistics (chỉ hiện khi chọn logistics)
- ✅ Textarea: Địa chỉ giao hàng (required)
- ✅ Input: Tên người nhận + số điện thoại (required)
- ✅ Date & Time picker: Ngày giờ giao hàng (required, phải là tương lai)
- ✅ Checkbox: Cần cẩu để dỡ container
- ✅ Textarea: Ghi chú đặc biệt (optional)
- ✅ Input number: Phí vận chuyển ước tính (optional)
- ✅ Full validation
- ✅ Loading state
- ✅ Error handling

---

## 📊 UI/UX Flow

### **Vị trí trên UI:**

Button "Đặt vận chuyển" xuất hiện ở **2 vị trí** khác nhau trên trang **Order Details**:

---

### **📍 CẤU TRÚC TRANG ORDER DETAILS (`/orders/:id`)**

```
┌────────────────────────────────────────────────────┐
│ 📄 ORDER DETAILS PAGE                              │
├────────────────────────────────────────────────────┤
│                                                    │
│ 1️⃣ THÔNG TIN ĐỢN HÀNG                            │
│    ├─ Order Number, Status, Dates                 │
│    ├─ Buyer Info, Seller Info                     │
│    └─ Payment Info                                │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│ 2️⃣ 🚚 BATCH DELIVERY MANAGEMENT  ← SECTION NÀY   │
│    (Chỉ hiện khi order có > 1 container)          │
│                                                    │
│    📦 Batch 1/3                                   │
│    ├─ Container TCLU1234567 [Card]                │
│    │  └─ Button: "Đặt vận chuyển" ← VỊ TRÍ 2     │
│    ├─ Container MSCU9876543 [Card]                │
│    └─ Container TEMU5555555 [Card]                │
│                                                    │
│    📦 Batch 2/3                                   │
│    └─ [Containers list...]                        │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│ 3️⃣ 🎯 HÀNH ĐỘNG (ACTIONS)                        │
│    └─ Button: "📦 Đặt vận chuyển" ← VỊ TRÍ 1     │
│       (Đặt cho TẤT CẢ containers)                 │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

#### **Vị trí 1: Đặt vận chuyển toàn bộ order (Batch-level)**
- **Section:** Card "Hành động" (ở cuối trang, sau tất cả thông tin)
- **Component:** Button trong Actions card
- **Điều kiện hiển thị:**
  - User là Buyer
  - Order status = `READY_FOR_PICKUP`
- **Button text:** "📦 Đặt vận chuyển (Bước 5.3)"
- **Action:** Mở modal book transportation cho **TẤT CẢ containers trong order**

#### **Vị trí 2: Đặt vận chuyển từng container (Container-level)** 🆕
- **Section:** "🚚 Batch Delivery Management" 
  - **Vị trí:** Nằm giữa "Thông tin đơn hàng" và "Hành động"
  - **Điều kiện render section:** Order có **nhiều hơn 1 container**
    ```tsx
    {order.listing_containers_sold?.length > 1 && (
      <BatchDeliveryManagement ... />
    )}
    ```
- **Component:** `ContainerDeliveryCard` - Mỗi container có 1 card riêng trong batch
- **Điều kiện hiển thị button:**
  - User là Buyer
  - Container chưa được đặt vận chuyển (`!transportation_booked_at`)
  - Container chưa giao (`!delivered_at`)
- **Button text:** "Đặt vận chuyển"
- **Action:** Mở dialog `BookTransportationDialog` cho **CONTAINER CỤ THỂ đó**

---

### **📝 LƯU Ý QUAN TRỌNG:**

**Section "Batch Delivery Management" CHỈ XUẤT HIỆN KHI:**
- Order có **nhiều hơn 1 container** (sold hoặc rented)
- Code check: 
  ```tsx
  {((order.listing_containers_sold?.length > 1) || 
    (order.listing_containers_rented?.length > 1)) && (
    <BatchDeliveryManagement ... />
  )}
  ```

**Nếu order chỉ có 1 container:**
- Section "Batch Delivery Management" **KHÔNG HIỆN**
- Chỉ có button "Đặt vận chuyển" ở phần Actions (Vị trí 1)

**Nếu order có nhiều containers:**
- **CẢ 2 vị trí đều hiện** button "Đặt vận chuyển"
- Buyer có thể chọn:
  - Đặt từng container riêng lẻ (Vị trí 2)
  - Đặt tất cả containers cùng lúc (Vị trí 1)

---

### **Buyer View - Container Level:**

```
📄 ORDER DETAILS PAGE
┌──────────────────────────────────────────────┐
│ Order #ORD-12345                             │
│ Status: READY_FOR_PICKUP                     │
├──────────────────────────────────────────────┤
│                                              │
│ 🚚 Batch Delivery Management                │
│    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━             │
│                                              │
│    Batch 1/3 [Đang giao]                    │
│    📦 Container list (3):                   │
│                                              │
│    ┌─────────────────────────────────────┐  │
│    │ 📦 TCLU1234567                      │  │
│    │ [Chưa đặt vận chuyển]               │  │
│    │                                     │  │
│    │          [Button: Đặt vận chuyển]  │  │  ← VỊ TRÍ NÀY
│    └─────────────────────────────────────┘  │
│                                              │
│    ┌─────────────────────────────────────┐  │
│    │ 📦 MSCU9876543                      │  │
│    │ [Đã đặt vận chuyển] 📅              │  │
│    │ 🚚 Logistics (Viettel Post)        │  │
│    │                                     │  │
│    │          [Chờ seller giao]         │  │
│    └─────────────────────────────────────┘  │
│                                              │
└──────────────────────────────────────────────┘

         ↓ Click button "Đặt vận chuyển" trên container card
         
┌────────────────────────────────────────────────┐
│ 🚚 Đặt vận chuyển container                   │
│ Container: TCLU1234567 (Batch 1)              │
├────────────────────────────────────────────────┤
│ Phương thức vận chuyển:                 │
│ ⚪ Thuê công ty vận chuyển              │
│ ⚪ Tự đến lấy hàng                      │
│ ⚪ Người bán giao hàng                  │
│                                         │
│ Công ty vận chuyển: [Viettel Post]     │
│ Địa chỉ giao hàng: [Textarea]          │
│ Người nhận: [Nguyễn Văn A]             │
│ Số điện thoại: [0912345678]            │
│ Ngày giao: [2025-11-15]  Giờ: [09:00] │
│                                         │
│ ☑ Cần cẩu để dỡ container              │
│                                         │
│ Ghi chú thêm: [Textarea]               │
│ Phí vận chuyển: [5,000,000 VND]        │
│                                         │
│      [Hủy]  [Xác nhận đặt vận chuyển] │
└────────────────────────────────────────────────┘

         ↓ Success - Quay lại Order Details page
         
📄 ORDER DETAILS PAGE (Updated)
┌──────────────────────────────────────────────┐
│ 🚚 Batch Delivery Management                │
│                                              │
│    ┌─────────────────────────────────────┐  │
│    │ 📦 TCLU1234567                      │  │
│    │ [Đã đặt vận chuyển] 📅              │  │
│    │ 📅 Đặt: 10/11 10:00                │  │
│    │ 🚚 Logistics (Viettel Post)        │  │
│    │ 📆 Giao dự kiến: 15/11/2025        │  │
│    │                                     │  │
│    │          [Chờ seller giao]         │  │
│    └─────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

---

### **Workflow Chi Tiết:**

**Bước 1:** Buyer login và vào trang "My Orders" (`/orders`)

**Bước 2:** Click vào order có status `READY_FOR_PICKUP`

**Bước 3:** Trang Order Details hiển thị:
- Thông tin order
- Section "Batch Delivery Management" (nếu có nhiều containers)
- Danh sách containers trong từng batch

**Bước 4:** Với mỗi container chưa đặt vận chuyển:
- Hiển thị badge **"Chưa đặt vận chuyển"** (gray)
- Hiển thị button **"Đặt vận chuyển"** ở góc phải card

**Bước 5:** Buyer click button "Đặt vận chuyển" → Dialog xuất hiện

**Bước 6:** Buyer điền form trong dialog và submit

**Bước 7:** Hệ thống:
- Validate input
- Gọi API `/deliveries/:deliveryId/containers/:containerId/book-transportation`
- Hiển thị toast notification
- Close dialog
- Refresh page data

**Bước 8:** Container card cập nhật:
- Badge chuyển sang **"Đã đặt vận chuyển"** (blue)
- Hiển thị thông tin transport đã đặt
- Button "Đặt vận chuyển" biến mất
- Seller nhận được notification

---

### **Seller View:**

```
📄 ORDER DETAILS PAGE (Seller)
┌──────────────────────────────────────────────┐
│ � Batch Delivery Management                │
│                                              │
│    ┌─────────────────────────────────────┐  │
│    │ �📦 TCLU1234567                      │  │
│    │ [Đã đặt vận chuyển] 📅              │  │
│    │ 📅 Đặt: 10/11 10:00                │  │
│    │ 🚚 Logistics (Viettel Post)        │  │
│    │ 📆 Giao dự kiến: 15/11/2025        │  │
│    │                                     │  │
│    │          [Button: Đã giao] 🚚      │  │  ← Seller thấy button này
│    └─────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
         ↓ Click
┌─────────────────────────────────────────┐
│ 📦 TCLU1234567  [Đã giao]              │
│ ✅ Giao: 15/11 09:30                   │
│                                         │
│                    [Chờ buyer confirm] │
└─────────────────────────────────────────┘
```

---

## 🔔 Notifications

### **1. Buyer đặt vận chuyển → Seller nhận thông báo:**
```json
{
  "type": "transportation_booked",
  "title": "🚚 Vận chuyển đã được đặt",
  "message": "Buyer đã đặt vận chuyển cho container TCLU1234567. Phương thức: Logistics",
  "data": {
    "orderId": "order-uuid",
    "deliveryId": "delivery-uuid",
    "containerId": "container-uuid",
    "containerCode": "TCLU1234567",
    "transportMethod": "logistics",
    "deliveryDate": "2025-11-15"
  }
}
```

---

## ✅ Testing Checklist

### **Backend:**
- [ ] Migration chạy thành công
- [ ] API endpoint `/book-transportation` hoạt động
- [ ] Validation đầy đủ
- [ ] Chỉ buyer mới được book transportation
- [ ] Không thể book 2 lần cho cùng 1 container
- [ ] Notification gửi đến seller
- [ ] Delivery event được tạo

### **Frontend:**
- [ ] Button "Đặt vận chuyển" chỉ hiện cho buyer
- [ ] Dialog mở đúng với container tương ứng
- [ ] Validation form đầy đủ
- [ ] Conditional field logistics company
- [ ] Date picker chỉ chọn được tương lai
- [ ] Submit thành công → Toast + Dialog close + Refresh
- [ ] Badge "Đã đặt vận chuyển" hiển thị sau khi book
- [ ] Thông tin transport hiển thị trong card
- [ ] Seller thấy button "Đã giao" sau khi buyer book

### **E2E Flow:**
- [ ] Buyer book transport → Seller nhận notification
- [ ] Seller mark delivered → Buyer nhận notification
- [ ] Buyer confirm receipt → Order status update
- [ ] Multiple containers có thể book độc lập
- [ ] Batch status tính toán đúng dựa trên container status

---

## 📝 Notes

### **Khác biệt với batch booking:**
- **Batch booking:** Đặt vận chuyển cho TẤT CẢ containers trong 1 lần (existing feature)
- **Container booking:** Đặt vận chuyển cho TỪNG container riêng lẻ (new feature)

### **Khi nào dùng container booking:**
- Containers giao ở nhiều địa chỉ khác nhau
- Giao vào những ngày khác nhau
- Dùng nhiều phương thức vận chuyển khác nhau (1 container tự lấy, 1 container logistics)

### **Backward compatibility:**
- ✅ Vẫn giữ batch-level actions
- ✅ Container-level actions bổ sung, không thay thế

---

## 🚀 Deployment

### **Steps:**
1. ✅ Apply database migration:
   ```bash
   psql -U postgres -d conttrade -f backend/migrations/add-transportation-booking-fields.sql
   ```

2. ✅ Deploy backend changes:
   ```bash
   cd backend
   npm install
   npm run build
   pm2 restart conttrade-backend
   ```

3. ✅ Deploy frontend changes:
   ```bash
   cd frontend
   npm install
   npm run build
   pm2 restart conttrade-frontend
   ```

4. ✅ Test on production:
   - Login as buyer
   - Find order with status READY_FOR_PICKUP
   - Book transportation for a container
   - Verify notification sent to seller
   - Login as seller
   - Verify button "Đã giao" appears
   - Mark container as delivered
   - Verify buyer can confirm receipt

---

**Date:** 2025-11-10  
**Status:** ✅ READY FOR TESTING  
**Feature:** Container Transportation Booking (Individual)
