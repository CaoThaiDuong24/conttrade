# HƯỚNG DẪN TEST BƯỚC 7 - XÁC NHẬN GIAO VÀ NHẬN HÀNG

## ⚠️ QUAN TRỌNG: Phải làm đúng thứ tự!

### BƯỚC 1: SELLER XÁC NHẬN ĐÃ GIAO HÀNG (Bước 7.1)

**Order cần test:** `72682c91-7499-4f0c-85a6-b2f78a75dbcd`

1. **Đăng xuất buyer** (nếu đang login)
   - Click vào avatar góc phải → Đăng xuất

2. **Login bằng tài khoản SELLER:**
   ```
   Email/Username: user-seller
   Password: password123
   ```

3. **Vào trang Đơn hàng:**
   - Click "Đơn hàng" trong menu bên trái
   - Hoặc truy cập: http://localhost:3000/vi/orders

4. **Tìm đơn hàng:**
   - Vào tab "Chuẩn bị & Giao hàng"
   - Tìm đơn có ID: `72682c91` (8 ký tự đầu)
   - Status hiện tại: `IN_TRANSIT` hoặc `TRANSPORTATION_BOOKED`

5. **Mở chi tiết đơn hàng:**
   - Click vào đơn hàng
   - Scroll xuống phần "Hành động"

6. **Click nút "Xác nhận đã giao hàng (Bước 7.1)":**
   - Nút màu xanh lá với icon CheckCircle
   - Modal MarkDeliveredForm sẽ hiện ra

7. **Điền thông tin giao hàng:**
   ```
   Thời gian giao hàng: [Chọn ngày giờ hiện tại]
   Người nhận hàng: Nguyễn Văn A
   Địa điểm giao hàng: Depot Cát Lái, TP.HCM
   Ghi chú: Đã giao container thành công
   ```

8. **Click "Xác nhận đã giao"**

9. **Kiểm tra kết quả:**
   - ✅ Thông báo "Đã xác nhận giao hàng thành công!"
   - ✅ Status đơn hàng chuyển từ `IN_TRANSIT` → `DELIVERED`
   - ✅ Nút "Xác nhận đã giao hàng" biến mất
   - ✅ Hiển thị thông tin giao hàng đã nhập

---

### BƯỚC 2: BUYER XÁC NHẬN NHẬN HÀNG (Bước 7.2)

**SAU KHI** seller đã xác nhận giao hàng ở Bước 1!

1. **Đăng xuất seller:**
   - Click avatar → Đăng xuất

2. **Login bằng tài khoản BUYER:**
   ```
   Email/Username: user-buyer
   Password: password123
   ```

3. **Kiểm tra trang Đơn hàng:**
   - Vào http://localhost:3000/vi/orders
   - **Phải thấy:**
     - ✅ Alert notification màu xanh lá: "📦 Có 1 đơn hàng đã giao - Cần xác nhận nhận hàng"
     - ✅ Tab mới: "Đã giao - Chờ xác nhận (1)"

4. **Vào tab "Đã giao - Chờ xác nhận":**
   - Click vào tab
   - Thấy đơn hàng `72682c91` hiển thị

5. **Mở chi tiết đơn hàng:**
   - Click vào đơn
   - Scroll xuống "Hành động"
   - **Phải thấy:** Nút "✅ Xác nhận nhận hàng (Bước 7.2)" màu xanh lá

6. **Click nút "Xác nhận nhận hàng":**
   - Modal ConfirmReceiptForm hiện ra với UI đẹp
   - Có các section:
     - 🔵 Lưu ý quan trọng
     - ⚫ Thông tin người nhận
     - 🟢 Tình trạng hàng hóa
     - 🟠 Ghi chú
     - 🟣 Hình ảnh bằng chứng

7. **Điền form:**
   ```
   Người nhận hàng: Nguyễn Văn B
   Tình trạng hàng hóa: 
     ○ Tốt - Không có vấn đề  [Chọn cái này]
     ○ Hư hỏng nhỏ
     ○ Hư hỏng nghiêm trọng
   Ghi chú: Container nguyên vẹn, không có vấn đề
   ```

8. **Click "Xác nhận nhận hàng"**

9. **Kiểm tra kết quả:**
   - ✅ Thông báo "Đã xác nhận nhận hàng thành công! Đơn hàng hoàn tất."
   - ✅ Modal đóng lại
   - ✅ Status chuyển: `DELIVERED` → `COMPLETED`
   - ✅ Nút "Xác nhận nhận hàng" biến mất
   - ✅ Hiển thị thông tin xác nhận nhận hàng
   - ✅ Đơn hàng xuất hiện trong tab "Hoàn thành"

---

## 🎯 TEST CASE 2: HƯ HỎNG NGHIÊM TRỌNG

Nếu muốn test trường hợp hàng hư hỏng:

Ở Bước 2.7, chọn:
```
Tình trạng hàng hóa: ● Hư hỏng nghiêm trọng
Ghi chú: Container bị rách, hàng bị ướt
```

Kết quả:
- ⚠️ Status chuyển: `DELIVERED` → `DELIVERY_ISSUE`
- ⚠️ Tranh chấp được tạo cho admin xem xét
- ⚠️ Thanh toán cho seller bị giữ lại

---

## 🔧 NẾU GẶP LỖI

### Lỗi "Failed to confirm receipt"

**Nguyên nhân:** Order chưa ở status `DELIVERED`

**Giải pháp:** 
1. Kiểm tra xem seller đã làm Bước 7.1 chưa
2. Check order status trong database:
   ```sql
   SELECT id, status FROM orders WHERE id = '72682c91-7499-4f0c-85a6-b2f78a75dbcd';
   ```
3. Phải là `DELIVERED` thì buyer mới confirm receipt được!

### Không thấy nút "Xác nhận nhận hàng"

**Nguyên nhân:** Order chưa DELIVERED hoặc bạn không phải buyer

**Giải pháp:**
1. Kiểm tra đã login đúng tài khoản buyer chưa
2. Kiểm tra order status = DELIVERED chưa
3. F5 refresh lại trang

### Backend trả về 500 Error

**Nguyên nhân:** Lỗi server hoặc database

**Giải pháp:**
1. Kiểm tra backend đang chạy: http://localhost:3006
2. Xem logs trong terminal backend
3. Restart backend nếu cần

---

## 📊 KIỂM TRA CUỐI CÙNG

Sau khi hoàn thành cả 2 bước:

1. **Database:**
   ```sql
   SELECT 
     id, 
     status, 
     receipt_confirmed_at, 
     receipt_confirmed_by,
     receipt_data_json
   FROM orders 
   WHERE id = '72682c91-7499-4f0c-85a6-b2f78a75dbcd';
   ```
   
   Phải có:
   - status = 'COMPLETED'
   - receipt_confirmed_at = [timestamp]
   - receipt_confirmed_by = 'user-buyer'
   - receipt_data_json = {...}

2. **UI:**
   - Seller: Không thấy nút "Xác nhận đã giao"
   - Buyer: Không thấy nút "Xác nhận nhận hàng"
   - Cả 2: Thấy thông tin đầy đủ về giao hàng và nhận hàng
   - Đơn trong tab "Hoàn thành"

---

## ✅ WORKFLOW HOÀN CHỈNH

```
Order Status Flow:
IN_TRANSIT 
  ↓ [Seller - Bước 7.1: Xác nhận đã giao]
DELIVERED
  ↓ [Buyer - Bước 7.2: Xác nhận nhận hàng]
COMPLETED (nếu GOOD/MINOR_DAMAGE)
  hoặc
DELIVERY_ISSUE (nếu MAJOR_DAMAGE)
```

**LƯU Ý:** 
- ❌ KHÔNG THỂ nhảy từ IN_TRANSIT thẳng tới COMPLETED
- ✅ PHẢI đi qua DELIVERED (seller confirm trước)
- ✅ MỚI đến COMPLETED (buyer confirm sau)
