# 🧪 HƯỚNG DẪN TEST NHANH - Lọc Container Đã Lên Lịch

## ✅ Hoàn Thành Thay Đổi

### 1. Backend Changes
- ✅ File: `backend/src/routes/orders.ts` (line 349-383)
- ✅ Thêm `delivery_containers` vào API GET `/orders/:id`
- ✅ Backend đã restart và đang chạy ở port 3006

### 2. Frontend Changes  
- ✅ File: `frontend/app/[locale]/orders/[id]/page.tsx` (line 289-307)
- ✅ Lọc containers chưa lên lịch dựa trên `delivery_containers`
- ✅ Console log để debug

## 🎯 Cách Test Manual (5 phút)

### Bước 1: Chuẩn bị dữ liệu test

**Tạo đơn hàng có 2 containers:**
1. Đăng nhập với account **buyer**
2. Tìm listing có ≥2 containers available
3. Tạo RFQ và accept quote để có order
4. Order status phải là `READY_FOR_PICKUP` hoặc `DOCUMENTS_READY`

**Hoặc dùng order có sẵn:**
- Tìm order có ≥2 containers chưa lên lịch
- Đảm bảo order status phù hợp

### Bước 2: Test lên lịch container đầu tiên

1. **Mở trang order detail** 
   ```
   http://localhost:3000/orders/{order_id}
   ```

2. **Click button "Đặt vận chuyển"** hoặc **"Lên lịch giao hàng"**

3. **Kiểm tra modal:**
   ```
   ✅ Hiển thị TẤT CẢ containers (ví dụ: 2 containers)
   ✅ Có thể chọn từng container
   ✅ Message: "Đợt giao hàng 1"
   ```

4. **Lên lịch cho 1 container:**
   - Chọn CONT001 (container đầu tiên)
   - Điền form:
     - Phương thức: Tự đến lấy hàng (để test nhanh)
     - Ngày: Chọn ngày mai
     - Giờ: Chọn bất kỳ
   - Click "Lên lịch giao hàng (1 containers)"

5. **Kiểm tra kết quả:**
   ```
   ✅ Toast success: "Đã đăng ký lịch đến lấy Batch 1/2!"
   ✅ Modal đóng
   ✅ Trang refresh
   ```

### Bước 3: Test lên lịch container thứ 2

1. **Mở lại modal lên lịch** (click button "Đặt vận chuyển" lần nữa)

2. **KIỂM TRA QUAN TRỌNG - Mở Console (F12):**
   ```
   Tìm log:
   📦 Total containers: 2
   ✅ Unscheduled containers: 1
   📋 Already scheduled: 1
   ```

3. **Kiểm tra danh sách containers trong modal:**
   ```
   ✅ CHỈ hiển thị 1 container (CONT002)
   ❌ CONT001 KHÔNG có trong danh sách
   ✅ Message: "Còn lại 1 containers chưa lên lịch"
   ✅ Dropdown hiển thị "Chọn containers cho đợt này (0/1)"
   ```

4. **Lên lịch container còn lại:**
   - Chọn CONT002
   - Điền form
   - Click "Lên lịch giao hàng (1 containers)"

5. **Kiểm tra kết quả:**
   ```
   ✅ Toast success: "Đã đăng ký lịch đến lấy Batch 2/2!"
   ✅ Modal đóng
   ```

### Bước 4: Test khi đã hết containers

1. **Mở lại modal lần nữa**

2. **Kiểm tra Console:**
   ```
   📦 Total containers: 2
   ✅ Unscheduled containers: 0
   📋 Already scheduled: 2
   ```

3. **Kiểm tra modal:**
   ```
   ✅ Hiển thị message: "Không có container nào khả dụng để lên lịch"
   ✅ Icon package với opacity thấp
   ✅ Không có containers nào trong list
   ```

## 🔍 Debug Checklist

Nếu gặp lỗi, kiểm tra:

### ❌ Vẫn hiển thị container đã lên lịch?

**Check 1**: Console log có đúng không?
```
Mở F12 → Console
Tìm: "📦 Total containers:", "✅ Unscheduled containers:"
```

**Check 2**: API response có delivery_containers không?
```bash
# Copy access token từ localStorage
# Gọi API:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3006/api/v1/orders/ORDER_ID | jq '.data.listing_containers_sold[0].delivery_containers'

# Kết quả mong đợi:
# Container chưa lên lịch: []
# Container đã lên lịch: [{delivery_id: "...", ...}]
```

**Check 3**: Frontend có gọi fetchOrderDetail() sau khi lên lịch không?
```
Trong schedule-delivery-batch-modal.tsx
Line 311: onSuccess?.(); // Phải gọi callback này
```

### ❌ Modal không mở được?

**Check**: Button có bị disable không?
```
Kiểm tra order status:
- Phải là READY_FOR_PICKUP hoặc DOCUMENTS_READY
- User phải là buyer
```

### ❌ API error 500?

**Check**: Backend log
```
Tìm error trong terminal backend
Có thể là Prisma query lỗi
```

## 📊 Test Cases Summary

| Test Case | Mô tả | Kết quả mong đợi |
|-----------|-------|------------------|
| TC-1 | Mở modal lần đầu (chưa lên lịch gì) | Hiển thị TẤT CẢ containers |
| TC-2 | Lên lịch 1 container | Thành công, tạo batch 1/2 |
| TC-3 | Mở modal lần 2 | CHỈ hiển thị containers còn lại |
| TC-4 | Console log | Hiển thị số lượng đúng |
| TC-5 | Lên lịch container cuối | Thành công, tạo batch 2/2 |
| TC-6 | Mở modal lần 3 | Hiển thị "Không có container..." |

## ✨ Expected Behavior

### Scenario: Order có 2 containers (CONT001, CONT002)

**Lần 1 mở modal:**
```
Available containers: [CONT001, CONT002]
Có thể chọn: ✅
```

**Sau khi lên lịch CONT001:**
```
Available containers: [CONT002]
CONT001: ❌ Không còn trong list
```

**Sau khi lên lịch CONT002:**
```
Available containers: []
Message: "Không có container nào khả dụng"
```

## 🎉 Kết luận

Nếu tất cả test cases PASS:
- ✅ Feature hoạt động đúng
- ✅ Containers đã lên lịch bị ẩn khỏi danh sách
- ✅ Không thể lên lịch trùng
- ✅ UX tốt, tránh nhầm lẫn

## 📞 Hỗ trợ

Nếu cần hỗ trợ:
1. Copy console logs
2. Copy API response
3. Copy error message (nếu có)
4. Screenshot modal
