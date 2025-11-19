# HƯỚNG DẪN TEST LẠI CHỨC NĂNG LÊN LỊCH GIAO HÀNG

**Ngày:** 12/11/2025  
**Mục đích:** Fix lỗi 500 khi schedule delivery batch

---

## ✅ ĐÃ THỰC HIỆN

### 1. Fix Backend Code

**File:** `backend/src/routes/orders.ts`

**Các fix:**
- ✅ Sửa `driver_info_json` từ `JSON.stringify(carrierInfo)` → `carrierInfo || null`
- ✅ Thêm validation check `orderContainers.length > 0`
- ✅ Thêm console logging chi tiết cho mỗi step trong transaction
- ✅ Backend đã restart thành công

### 2. Thêm Frontend Logging

**File:** `frontend/components/orders/schedule-delivery-batch-modal.tsx`

**Các thêm mới:**
- ✅ Log payload trước khi gửi request
- ✅ Log response status và body
- ✅ Log error chi tiết khi fail

---

## 🧪 HƯỚNG DẪN TEST

### Bước 1: Đảm Bảo Services Đang Chạy

**Backend:**
```
✅ Running on: http://localhost:3006
✅ Process ID: 16572
✅ Status: Server listening
```

**Frontend:**
Bạn cần restart frontend nếu chưa chạy:
```powershell
cd 'd:\DiskE\SUKIENLTA\LTA PROJECT NEW\Conttrade\conttrade-server2.1\frontend'
npm run dev
```

Frontend sẽ chạy trên: `http://localhost:3000`

---

### Bước 2: Test Lại Chức Năng

1. **Mở trình duyệt** và truy cập order page:
   ```
   http://localhost:3000/orders/92d71fbe-c327-4557-a8a3-0003785046d1f
   ```

2. **Mở DevTools Console** (F12) để xem logs

3. **Bấm nút "Đặt vận chuyển"** hoặc "Schedule Delivery"

4. **Điền thông tin giao hàng:**
   - Chọn container(s) muốn giao
   - Nhập địa chỉ giao hàng
   - Chọn ngày/giờ giao
   - Chọn phương thức: Logistics / Self Pickup
   - (Optional) Chọn cần cẩu nếu cần

5. **Bấm "Xác nhận"**

---

### Bước 3: Kiểm Tra Logs

#### A. Frontend Console Logs (Browser DevTools)

Bạn sẽ thấy logs như sau:

**Khi submit form:**
```javascript
📦 Schedule Delivery Payload: {
  orderId: "92d71fbe-c327-4557-a8a3-0003785046d1f",
  selectedContainerIds: ["container-id-1", "container-id-2"],
  containerCount: 2,
  deliveryAddress: "123 Street, District, City",
  deliveryDate: "2025-11-15",
  deliveryMethod: "logistics",
  logisticsCompany: "Some Logistics"
}
```

**Khi nhận response:**
```javascript
📨 API Response: {
  status: 200,  // Nếu thành công
  statusText: "OK",
  result: {
    success: true,
    message: "Đã đặt vận chuyển thành công cho Batch 1/2",
    data: { ... }
  }
}
```

**Nếu lỗi:**
```javascript
📨 API Response: {
  status: 500,
  statusText: "Internal Server Error",
  result: {
    success: false,
    message: "Failed to schedule delivery batch",
    error: "Chi tiết lỗi ở đây"
  }
}
```

---

#### B. Backend Console Logs (Terminal)

Trong terminal backend, bạn sẽ thấy:

**Khi request đến:**
```
📦 Order containers found: 2
📦 Container IDs: ['container-id-1', 'container-id-2']
🚚 Creating delivery batch: {
  batchNumber: 1,
  estimatedTotalBatches: 2,
  containerIds: ['container-id-1', 'container-id-2'],
  deliveryDate: '2025-11-15',
  deliveryAddress: '123 Street, District, City'
}
✅ Delivery created: delivery-xyz-123
📦 Creating delivery_containers: 2
✅ Delivery containers created
✅ Listing containers updated
✅ Order status updated
✅ Delivery event created
✅ Transaction completed successfully
```

**Nếu lỗi, sẽ có log:**
```
❌ ERROR in schedule-delivery-batch:
   Message: [Chi tiết lỗi]
   Stack: [Call stack]
   Code: [Error code nếu có]
   Meta: [Metadata từ Prisma nếu có]
```

---

### Bước 4: Verify Kết Quả

#### Nếu Thành Công: ✅

1. **Toast notification** xuất hiện:
   ```
   ✅ Đã lên lịch giao Batch 1/2 thành công!
   2 containers sẽ được giao vào 15/11/2025
   ```

2. **Page refresh** và bạn sẽ thấy:
   - Delivery timeline có thêm entry mới
   - Batch number hiển thị (VD: "Batch 1/2")
   - Số containers trong batch
   - Nút "Đặt vận chuyển" có thể bị disable hoặc change text

3. **Database check** (optional):
   ```sql
   SELECT * FROM deliveries WHERE order_id = '92d71fbe-c327-4557-a8a3-0003785046d1f' ORDER BY created_at DESC LIMIT 1;
   
   SELECT * FROM delivery_containers WHERE delivery_id = 'delivery-id-vừa-tạo';
   ```

---

#### Nếu Vẫn Lỗi 500: ❌

**Cần thu thập thông tin sau:**

1. **Frontend console log** - Copy toàn bộ output, đặc biệt là:
   - `📦 Schedule Delivery Payload`
   - `📨 API Response`
   - `❌ API Error` (nếu có)

2. **Backend console log** - Copy từ lúc bấm submit đến khi có error:
   - Có thấy `📦 Order containers found` không?
   - Step nào fail? (Delivery create? Containers create?)
   - Error message chính xác là gì?

3. **Network tab** (Browser DevTools):
   - Click vào request `schedule-delivery-batch`
   - Tab "Payload" - copy request body
   - Tab "Response" - copy response body
   - Tab "Headers" - check status code

4. **Screenshot** nếu cần thiết

---

## 🔍 COMMON ISSUES & SOLUTIONS

### Issue 1: containerIds Empty

**Triệu chứng:**
```javascript
📦 Schedule Delivery Payload: {
  selectedContainerIds: [],  // ❌ Rỗng!
  containerCount: 0
}
```

**Nguyên nhân:** Không chọn container nào

**Fix:** Tick chọn ít nhất 1 container trước khi submit

---

### Issue 2: Order No Containers

**Backend log:**
```
📦 Order containers found: 0  // ❌
📦 Container IDs: []
```

**Response:**
```json
{
  "success": false,
  "message": "This order has no containers assigned. Please check order status."
}
```

**Nguyên nhân:** Order này không có containers nào (data issue)

**Fix:** 
1. Check order status - phải là `READY_FOR_PICKUP` hoặc `TRANSPORTATION_BOOKED`
2. Check database xem order có containers không:
   ```sql
   SELECT * FROM listing_containers 
   WHERE sold_to_order_id = 'order-id' 
   OR rented_to_order_id = 'order-id';
   ```

---

### Issue 3: Containers Already Scheduled

**Response:**
```json
{
  "success": false,
  "message": "Các container sau đã được lên lịch giao hàng: CONT-001, CONT-002"
}
```

**Fix:** Chọn containers khác chưa được schedule

---

### Issue 4: Database Constraint Violation

**Backend log:**
```
❌ ERROR in schedule-delivery-batch:
   Message: Foreign key constraint failed on the field: `order_id`
   Code: P2003
```

**Nguyên nhân:** Order ID không tồn tại hoặc đã bị xóa

**Fix:** Verify order exists trong database

---

### Issue 5: Prisma Type Error

**Backend log:**
```
❌ ERROR in schedule-delivery-batch:
   Message: Invalid value for argument `transportation_fee`: ...
   Code: P2000
```

**Nguyên nhân:** Data type không match với schema

**Fix:** Đã fix trong code - `driver_info_json` nhận object thay vì string

---

## 📞 NẾU VẪN GẶP LỖI

Gửi cho tôi thông tin sau:

1. ✅ **Full frontend console log** (copy toàn bộ)
2. ✅ **Full backend console log** (từ khi bấm submit)
3. ✅ **Network tab screenshot** (Payload + Response)
4. ✅ **Order status** từ database:
   ```sql
   SELECT id, status, 
          (SELECT COUNT(*) FROM listing_containers WHERE sold_to_order_id = orders.id OR rented_to_order_id = orders.id) as container_count
   FROM orders 
   WHERE id = '92d71fbe-c327-4557-a8a3-0003785046d1f';
   ```

---

## ✨ EXPECTED RESULT

Khi chức năng hoạt động đúng:

1. ✅ Bấm "Đặt vận chuyển" → Modal mở
2. ✅ Chọn container(s) → Tick hiển thị
3. ✅ Điền thông tin → Form validation pass
4. ✅ Submit → Loading spinner
5. ✅ Backend xử lý → Logs hiển thị từng step
6. ✅ Response 200 → Toast success
7. ✅ Modal đóng → Page refresh hoặc update
8. ✅ Delivery hiển thị trong timeline

---

**Thực hiện bởi:** GitHub Copilot  
**Timestamp:** 2025-11-12 10:18:16 UTC+7  
**Backend Status:** ✅ Running on port 3006  
**Code Status:** ✅ All fixes applied

Chúc bạn test thành công! 🎉
