# Tính năng: Seller Xác nhận Giao hàng

## Tổng quan
Tính năng cho phép **người bán (Seller)** xác nhận đã giao container/lô hàng cho buyer.

## Các tính năng chính

### 1. Xác nhận giao từng container riêng lẻ
- Seller có thể xác nhận đã giao từng container một trong lô
- Hiển thị nút "Xác nhận đã giao" ở cột Actions trong bảng danh sách container
- Chỉ hiển thị khi container đã đặt vận chuyển nhưng chưa giao

### 2. Xác nhận giao tất cả containers trong batch
- Seller có thể xác nhận đã giao tất cả containers còn lại trong lô
- Hiển thị nút "Xác nhận đã giao TẤT CẢ (X container)" ở batch level
- Chỉ hiển thị khi còn container chưa được giao

## Backend APIs

### 1. POST `/api/v1/deliveries/:deliveryId/containers/:containerId/confirm-delivery`

Seller xác nhận đã giao 1 container cụ thể.

**Request:**
```json
{
  "deliveredAt": "2025-11-13T10:30:00.000Z",  // Optional, mặc định = now
  "notes": "Giao hàng thành công",            // Optional
  "photos": ["url1.jpg", "url2.jpg"]          // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Container delivery confirmed successfully",
  "data": {
    "container": {
      "id": "cont-123",
      "containerCode": "ABCU1234567",
      "deliveredAt": "2025-11-13T10:30:00.000Z"
    },
    "delivery": {
      "id": "delivery-123",
      "batchNumber": 1,
      "allDelivered": false,
      "status": "IN_TRANSIT"
    }
  }
}
```

**Logic:**
1. Verify seller permission (chỉ seller của order mới được confirm)
2. Kiểm tra container có trong delivery không
3. Kiểm tra container chưa được giao trước đó
4. Cập nhật `delivery_containers.delivered_at`
5. Nếu tất cả containers trong batch đã giao:
   - Cập nhật `deliveries.status = 'DELIVERED'`
   - Tạo delivery event `DELIVERED`
   - Kiểm tra nếu tất cả batches đã giao → cập nhật `orders.status = 'DELIVERED'`
6. Gửi notification cho buyer

### 2. POST `/api/v1/deliveries/:deliveryId/confirm-all-delivered`

Seller xác nhận đã giao TẤT CẢ containers trong batch.

**Request:**
```json
{
  "deliveredAt": "2025-11-13T10:30:00.000Z",  // Optional
  "notes": "Giao tất cả containers thành công",
  "photos": ["url1.jpg"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully confirmed delivery of all 3 containers",
  "data": {
    "delivery": {
      "id": "delivery-123",
      "batchNumber": 1,
      "totalBatches": 2,
      "containersCount": 3,
      "deliveredAt": "2025-11-13T10:30:00.000Z",
      "status": "DELIVERED"
    },
    "containers": [
      {
        "id": "cont-1",
        "containerCode": "ABCU1234567",
        "deliveredAt": "2025-11-13T10:30:00.000Z"
      }
    ]
  }
}
```

**Logic:**
1. Verify seller permission
2. Kiểm tra có containers trong delivery
3. Kiểm tra chưa phải tất cả đều delivered
4. Cập nhật tất cả `delivery_containers.delivered_at = deliveredAt` (chỉ những cái chưa delivered)
5. Cập nhật `deliveries.status = 'DELIVERED'` và `delivered_at`
6. Tạo delivery event
7. Kiểm tra all batches → cập nhật order status
8. Gửi notification cho buyer

## Frontend UI

### BatchDeliveryManagement Component

**Cho Seller:**

1. **Trong bảng container (Table View):**
   - Cột "Hành động" hiển thị nút "Xác nhận đã giao" cho từng container
   - Điều kiện hiển thị:
     - `isSeller = true`
     - `container.transportation_booked_at !== null` (đã đặt vận chuyển)
     - `container.delivered_at === null` (chưa giao)
   - Khi click: gọi API confirm-delivery cho container đó

2. **Batch level actions:**
   - Nút "Xác nhận đã giao TẤT CẢ (X container)"
   - Điều kiện hiển thị:
     - `isSeller = true`
     - Có ít nhất 1 container chưa delivered
   - Hiển thị số lượng containers còn lại chưa giao
   - Khi click: confirm dialog → gọi API confirm-all-delivered

**Trạng thái hiển thị:**
- **Chưa đặt vận chuyển**: Badge xám "Chưa đặt"
- **Đã đặt vận chuyển**: Badge xanh dương "Đã đặt"
- **Đã giao**: Badge cam "Đã giao"
- **Hoàn tất** (buyer đã xác nhận): Badge xanh lá "Hoàn tất"

## Luồng xử lý

### Luồng 1: Seller xác nhận từng container
```
1. Seller mở order detail → tab "Giao hàng"
2. Expand batch cần xác nhận
3. Trong bảng container, click "Xác nhận đã giao" ở container cụ thể
4. Confirm dialog
5. Frontend gọi POST /deliveries/:id/containers/:containerId/confirm-delivery
6. Backend:
   - Cập nhật delivery_containers.delivered_at
   - Kiểm tra nếu all containers delivered → update delivery status
   - Gửi notification cho buyer
7. Frontend refresh → container hiển thị badge "Đã giao"
8. Buyer nhận notification
```

### Luồng 2: Seller xác nhận tất cả containers
```
1. Seller mở order detail → tab "Giao hàng"
2. Expand batch cần xác nhận
3. Click "Xác nhận đã giao TẤT CẢ (X container)"
4. Confirm dialog hiển thị số lượng
5. Frontend gọi POST /deliveries/:id/confirm-all-delivered
6. Backend:
   - Cập nhật tất cả delivery_containers.delivered_at
   - Update delivery.status = 'DELIVERED'
   - Tạo delivery event
   - Kiểm tra all batches → update order status nếu cần
   - Gửi notification cho buyer
7. Frontend refresh → batch hiển thị status "Đã giao"
8. Buyer nhận notification
```

## Database Changes

Sử dụng trường có sẵn:
- `delivery_containers.delivered_at` - timestamp khi seller xác nhận đã giao
- `deliveries.delivered_at` - timestamp khi batch được giao xong
- `deliveries.status` - DELIVERED khi tất cả containers đã giao

## Notifications

### Container Delivered (từng container)
```typescript
{
  type: 'container_delivered',
  title: '📦 Container đã được giao',
  message: 'Seller đã xác nhận giao container ABCU1234567 trong lô 1/2.',
  data: {
    orderId: '...',
    deliveryId: '...',
    containerId: '...',
    containerCode: 'ABCU1234567'
  }
}
```

### Batch Delivered (cả batch)
```typescript
{
  type: 'delivery_completed',
  title: '✅ Lô hàng đã được giao',
  message: 'Seller đã xác nhận giao xong lô 1/2 với 3 container(s). Vui lòng kiểm tra và xác nhận nhận hàng.',
  data: {
    orderId: '...',
    deliveryId: '...',
    batchNumber: 1,
    totalBatches: 2,
    containersCount: 3
  }
}
```

## Testing

### Test Case 1: Xác nhận từng container
1. Login as seller
2. Vào order detail có batch đã đặt vận chuyển
3. Expand batch
4. Click "Xác nhận đã giao" ở 1 container
5. ✅ Verify: Container hiển thị badge "Đã giao"
6. ✅ Verify: Buyer nhận notification
7. ✅ Verify: Database: `delivery_containers.delivered_at` updated

### Test Case 2: Xác nhận tất cả
1. Login as seller
2. Vào order detail có batch với nhiều containers
3. Expand batch
4. Click "Xác nhận đã giao TẤT CẢ (X container)"
5. ✅ Verify: Tất cả containers hiển thị "Đã giao"
6. ✅ Verify: Batch status = "Đã giao"
7. ✅ Verify: Buyer nhận notification
8. ✅ Verify: Database: tất cả containers có `delivered_at`

### Test Case 3: Mixed delivery
1. Seller xác nhận 2/5 containers riêng lẻ
2. ✅ Verify: Chỉ 2 containers hiển thị "Đã giao"
3. ✅ Verify: Nút "Xác nhận TẤT CẢ" vẫn hiển thị "(3 container)"
4. Click "Xác nhận TẤT CẢ"
5. ✅ Verify: Cả 5 containers đều "Đã giao"
6. ✅ Verify: Batch status = "DELIVERED"

### Test Case 4: Permission check
1. Login as buyer
2. ✅ Verify: Không thấy nút "Xác nhận đã giao" (chỉ seller)
3. Login as seller khác (không phải seller của order)
4. Try POST API
5. ✅ Verify: Response 403 Forbidden

### Test Case 5: Already delivered
1. Seller xác nhận container A
2. Try xác nhận lại container A
3. ✅ Verify: API response 400 "Container already marked as delivered"

## Code Files Modified

1. **Backend:**
   - `backend/src/routes/deliveries.ts`:
     - Added POST `/:deliveryId/containers/:containerId/confirm-delivery`
     - Added POST `/:deliveryId/confirm-all-delivered`

2. **Frontend:**
   - `frontend/components/orders/BatchDeliveryManagement.tsx`:
     - Added `handleConfirmContainerDelivery()`
     - Added `handleConfirmAllDelivered()`
     - Updated table to show Actions column for seller
     - Added buttons in table rows for individual containers
     - Added batch-level button for confirm all

## Notes

- Seller chỉ có thể xác nhận giao khi container đã được đặt vận chuyển
- Buyer sẽ nhận notification và có thể xác nhận nhận hàng sau khi seller xác nhận giao
- Hệ thống tự động cập nhật order status khi tất cả batches đã delivered
- Có thể thêm tính năng upload hình ảnh proof of delivery trong tương lai
