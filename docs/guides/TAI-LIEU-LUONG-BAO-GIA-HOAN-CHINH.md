# 📋 QUY TRÌNH SAU KHI GỬI BÁO GIÁ THÀNH CÔNG

**Ngày cập nhật:** 8/10/2025  
**Trạng thái:** ✅ ĐÃ IMPLEMENT HOÀN CHỈNH

---

## 🔄 LUỒNG HOÀN CHỈNH RFQ → QUOTE → ORDER

### **Bước 1: Seller gửi báo giá thành công** ✅
- **API:** `POST /api/v1/quotes`
- **Frontend:** Sau khi gửi thành công redirect về `/rfq` (đã fix duplicate `/vi/vi/rfq`)
- **Backend:** Quote được tạo với status: `sent`
- **Database:** 
  - Quote record tạo trong `quotes` table
  - Quote items tạo trong `quote_items` table
  - RFQ status update thành `awaiting_response`

### **Bước 2: Buyer nhận và xem báo giá**
- **Frontend:** Buyer vào trang RFQ received để xem quotes
- **API:** `GET /api/v1/rfqs` (filter by buyer)
- **Trạng thái:** Quote hiển thị với status `sent`, buyer có thể:
  - Xem chi tiết báo giá
  - Chấp nhận (Accept)
  - Từ chối (Decline)

---

## 🎯 KỊCH BẢN A: BUYER CHẤP NHẬN BÁO GIÁ

### **Bước 3A: Buyer chấp nhận Quote** ✅
- **API:** `POST /api/v1/quotes/:id/accept`
- **Quy trình backend (Transaction):**

```typescript
// 1. Update quote status
quote.status = 'accepted'

// 2. Update RFQ status  
rfq.status = 'completed'

// 3. Decline other quotes cho cùng RFQ
otherQuotes.status = 'declined'

// 4. Tự động tạo ORDER với status: 'pending_payment'
order = {
  buyerId: buyer.id,
  sellerId: seller.id, 
  listingId: listing.id,
  quoteId: quote.id,
  status: 'pending_payment',
  subtotal: quote.priceSubtotal,
  tax: subtotal * 0.1, // 10% VAT
  total: subtotal + tax,
  currency: quote.currency
}

// 5. Tạo order items từ quote items
orderItems = quote.items.map(item => ({
  itemType: item.itemType,
  description: item.description, 
  qty: item.qty,
  unitPrice: item.unitPrice
}))
```

**KẾT QUẢ:** Order được tạo tự động, chuyển sang bước thanh toán.

### **Bước 4A: Buyer thanh toán Escrow** ✅
- **API:** `POST /api/v1/orders/:id/pay`
- **Method:** `bank`, `credit_card`, `wallet`
- **Quy trình:**
  1. Kiểm tra order status = `pending_payment`
  2. Process payment qua Payment Service
  3. Update order status = `paid`
  4. Tạo payment record với escrow

```typescript
// Request body
{
  method: "bank", // hoặc credit_card, wallet
  amount: order.total,
  currency: "VND"
}
```

### **Bước 5A: Seller giao hàng**
- **Manual process:** Seller chuẩn bị và giao container
- **Optional API:** `POST /api/v1/orders/:id/ship` (update status = `shipped`)

### **Bước 6A: Buyer xác nhận nhận hàng** ✅
- **API:** `POST /api/v1/orders/:id/confirm-receipt`
- **Quy trình:**
  1. Kiểm tra order status = `paid` hoặc `shipped`
  2. Release escrow payment cho seller
  3. Update order status = `completed`

**KẾT QUẢ:** Giao dịch hoàn tất, seller nhận tiền.

---

## ❌ KỊCH BẢN B: BUYER TỪ CHỐI BÁO GIÁ

### **Bước 3B: Buyer từ chối Quote** ✅
- **API:** `POST /api/v1/quotes/:id/decline`
- **Body:** `{ reason: "Giá cao quá" }` (optional)
- **Quy trình:**
  1. Update quote status = `declined`
  2. Ghi lại lý do từ chối
  3. RFQ vẫn ở status `awaiting_response` (có thể có quotes khác)

**KẾT QUẢ:** Quote bị từ chối, seller được thông báo.

---

## 📊 CÁC TRẠNG THÁI (STATUS) QUAN TRỌNG

### **Quote Status:**
- `sent` → Quote vừa được gửi, chờ buyer phản hồi
- `accepted` → Buyer chấp nhận, order được tạo tự động
- `declined` → Buyer từ chối với lý do
- `expired` → Quote hết hạn (theo validUntil)

### **RFQ Status:**
- `awaiting_response` → Có ít nhất 1 quote, chờ buyer quyết định
- `completed` → Buyer đã chấp nhận 1 quote, tạo order thành công

### **Order Status:**
- `pending_payment` → Order được tạo, chờ buyer thanh toán escrow
- `paid` → Buyer đã thanh toán, tiền trong escrow, chờ giao hàng
- `shipped` → Seller đã giao hàng (optional status)
- `completed` → Buyer xác nhận nhận hàng, seller nhận tiền

---

## 🔄 WORKFLOW DIAGRAM

```
[Seller] Gửi Quote (sent)
    ↓
[Buyer] Nhận Quote
    ↓
┌─────────────────┬─────────────────┐
│   ACCEPT ✅     │   DECLINE ❌    │
├─────────────────┼─────────────────┤
│ • Quote: accepted│ • Quote: declined│
│ • RFQ: completed │ • RFQ: awaiting  │
│ • Tạo Order     │ • End (có thể có │
│   (pending_payment)│   quotes khác)  │
└─────────────────┴─────────────────┘
    ↓ (Accept path)
[Buyer] Pay Escrow
    ↓
Order: paid → Seller giao hàng
    ↓
[Buyer] Confirm Receipt
    ↓
Order: completed → Seller nhận tiền ✅
```

---

## 🛠️ APIs LIÊN QUAN

### **Quote Management:**
- ✅ `POST /api/v1/quotes` - Seller tạo quote
- ✅ `POST /api/v1/quotes/:id/accept` - Buyer chấp nhận
- ✅ `POST /api/v1/quotes/:id/decline` - Buyer từ chối
- ✅ `GET /api/v1/quotes` - Lấy danh sách quotes

### **Order Management:**
- ✅ `GET /api/v1/orders` - Lấy danh sách orders
- ✅ `POST /api/v1/orders/:id/pay` - Thanh toán escrow
- ✅ `POST /api/v1/orders/:id/confirm-receipt` - Xác nhận nhận hàng
- ⏳ `POST /api/v1/orders/:id/ship` - Update shipped status (optional)

### **RFQ Management:**
- ✅ `GET /api/v1/rfqs` - Lấy RFQs theo role (buyer/seller)
- ✅ `POST /api/v1/rfqs` - Buyer tạo RFQ mới

---

## ✅ HOÀN THÀNH

1. **Quote creation flow** - ✅ Đã fix redirect issue
2. **Quote acceptance** - ✅ Tự động tạo order
3. **Escrow payment** - ✅ Payment service integration  
4. **Order completion** - ✅ Release escrow cho seller
5. **All status transitions** - ✅ Proper state management

**KẾT LUẬN:** Luồng từ gửi báo giá → chấp nhận → thanh toán → hoàn thành đã được implement đầy đủ và hoạt động chính xác! 🎉