# HƯỚNG DẪN TEST BƯỚC 7.2 - XÁC NHẬN NHẬN HÀNG

## ✅ ĐÃ HOÀN THÀNH

### Backend
- ✅ API endpoint: POST /orders/:id/confirm-receipt
- ✅ Database fields added (receipt_confirmed_at, receipt_confirmed_by, receipt_data_json)
- ✅ Prisma schema updated
- ✅ Business logic implemented

### Frontend  
- ✅ Component: ConfirmReceiptForm.tsx
- ✅ Button "✅ Xác nhận nhận hàng (Bước 7.2)" added
- ✅ Modal integration complete
- ✅ State management done

## 🧪 CÁCH TEST

### Bước 1: Chuẩn bị dữ liệu test
```bash
# Chạy script để set 1 order thành DELIVERED
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web\backend"
node test-delivered-status.js
```

### Bước 2: Đăng nhập với BUYER
1. Mở http://localhost:3000
2. Đăng nhập với email BUYER (từ output của script)
3. Navigate đến order detail page

### Bước 3: Kiểm tra Button
**Nơi hiển thị:** Tab "Overview" → Card "Hành động"

**Button phải có:**
- Text: "✅ Xác nhận nhận hàng (Bước 7.2)"
- Màu: Gradient xanh lá (green-600 to emerald-700)
- Icon: CheckCircle
- Visible khi: order.status === 'DELIVERED' && isBuyer === true

### Bước 4: Test Modal
1. Click button "✅ Xác nhận nhận hàng (Bước 7.2)"
2. Modal phải mở ra với form:

**Form fields:**
- **Người nhận hàng** (required): Text input
- **Tình trạng hàng hóa** (required): Radio group
  - ✅ GOOD - Tốt, không vấn đề
  - ⚠️ MINOR_DAMAGE - Hư hỏng nhỏ  
  - ❌ MAJOR_DAMAGE - Hư hỏng nghiêm trọng
- **Ghi chú**: Textarea (required nếu MAJOR_DAMAGE)
- **Hình ảnh**: Placeholder (chưa implement upload)

### Bước 5: Test Submit

#### Test Case 1: GOOD Condition
```
Input:
- Người nhận: "Nguyễn Văn A"
- Tình trạng: GOOD
- Ghi chú: "Hàng nguyên vẹn"

Expected:
- Toast success: "Đã xác nhận nhận hàng thành công! Đơn hàng hoàn tất."
- Order status: DELIVERED → COMPLETED
- Notification sent to seller
- Modal close
- Page refresh
```

#### Test Case 2: MINOR_DAMAGE
```
Input:
- Người nhận: "Nguyễn Văn A"
- Tình trạng: MINOR_DAMAGE
- Ghi chú: "Có vài vết xước nhỏ"

Expected:
- Order status: DELIVERED → COMPLETED
- Notes saved in receipt_data_json
- Seller notified about minor damage
```

#### Test Case 3: MAJOR_DAMAGE
```
Input:
- Người nhận: "Nguyễn Văn A"
- Tình trạng: MAJOR_DAMAGE
- Ghi chú: "Container bị móp méo nghiêm trọng"

Expected:
- Order status: DELIVERED → DELIVERY_ISSUE
- Dispute created
- Admin notified
- Toast: "Issue reported. Dispute created for admin review."
```

### Bước 6: Verify Database
```sql
-- Check order status
SELECT id, status, receipt_confirmed_at, receipt_confirmed_by, receipt_data_json
FROM orders 
WHERE id = 'YOUR_ORDER_ID';

-- Check delivery
SELECT id, order_id, status, receipt_confirmed_at, receipt_data_json
FROM deliveries
WHERE order_id = 'YOUR_ORDER_ID';
```

## 🐛 TROUBLESHOOTING

### Button không hiển thị?
✅ Check:
1. User đã đăng nhập chưa?
2. User có phải BUYER của order không?
3. Order status có phải DELIVERED không?
4. Component ConfirmReceiptForm đã được import chưa?
5. State showConfirmReceiptForm đã được khai báo chưa?

### Modal không mở?
✅ Check:
1. onClick handler có gọi setShowConfirmReceiptForm(true)?
2. Component ConfirmReceiptForm có prop isOpen={showConfirmReceiptForm}?
3. Console có error không?

### Submit failed?
✅ Check:
1. Backend server đang chạy?
2. Token có hợp lệ không?
3. receivedBy field có giá trị không?
4. condition field có giá trị hợp lệ không?

## 📊 EXPECTED RESULTS

### UI Elements
- ✅ Button visible for buyer when DELIVERED
- ✅ Modal opens with proper form
- ✅ Radio buttons for 3 conditions
- ✅ Warning box for MAJOR_DAMAGE
- ✅ Info box with instructions
- ✅ Gradient green theme

### API Response
```json
{
  "success": true,
  "message": "Receipt confirmed successfully. Order completed!",
  "data": {
    "order": {
      "id": "xxx",
      "status": "COMPLETED",
      "receiptConfirmedAt": "2025-10-22T...",
      "condition": "GOOD"
    }
  }
}
```

### Database Updates
- orders.status = 'COMPLETED' (or 'DELIVERY_ISSUE')
- orders.receipt_confirmed_at = timestamp
- orders.receipt_confirmed_by = buyer_id
- orders.receipt_data_json = { received_by, condition, notes, photos, confirmed_at }
- deliveries.receipt_confirmed_at = timestamp
- deliveries.receipt_data_json = same as above

## ✨ FEATURES

### Condition Logic
- **GOOD**: Order completes successfully, payment released
- **MINOR_DAMAGE**: Order completes with notes, payment released
- **MAJOR_DAMAGE**: Dispute created, payment held, admin review needed

### Notifications
- **GOOD/MINOR**: Seller gets "Order completed" notification
- **MAJOR**: Seller gets "Issue reported" notification
- **MAJOR**: Admin gets "Dispute created" notification
- Buyer always gets confirmation notification

## 📝 NOTES

- Component file: `components/orders/ConfirmReceiptForm.tsx`
- Backend endpoint: `backend/src/routes/orders.ts` line ~2007
- Integration: `app/[locale]/orders/[id]/page.tsx` line ~983, ~1454
- Migration SQL: `backend/prisma/migrations/add-receipt-confirmation-fields.sql`
