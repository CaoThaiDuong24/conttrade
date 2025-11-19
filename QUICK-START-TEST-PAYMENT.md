# 🎯 QUICK START - TEST PAYMENT

## ⚡ 3 BƯỚC ĐỂ TEST THANH TOÁN

### 1️⃣ Mở trang thanh toán
```
http://localhost:3000/orders/{ORDER_ID}/pay
```

### 2️⃣ Chọn phương thức
- 🏦 Chuyển khoản (0% phí)
- 💳 Thẻ tín dụng (2.9% + 2,000₫)
- 📱 Ví điện tử (1.5%)

### 3️⃣ Click nút vàng
```
🧪 ✅ Giả lập thanh toán thành công
```

**🎉 XONG! Thanh toán thành công ngay lập tức!**

---

## 🎨 GIAO DIỆN

### Trang thanh toán sẽ có:

```
┌─────────────────────────────────────────┐
│  💰 Thanh toán đơn hàng                │
├─────────────────────────────────────────┤
│                                         │
│  ○ 🏦 Chuyển khoản (Miễn phí)         │
│  ○ 💳 Thẻ tín dụng (Phí 2.9% + 2K)    │
│  ○ 📱 Ví điện tử (Phí 1.5%)           │
│                                         │
├─────────────────────────────────────────┤
│  💵 Tổng: 27,500,000 VND               │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 🧪 Test Mode                      │ │
│  │ Giả lập thanh toán thành công     │ │
│  │                                   │ │
│  │ [✅ Giả lập thanh toán thành công] │ │
│  │                                   │ │
│  │ Không cần gateway - Dùng để test  │ │
│  └───────────────────────────────────┘ │
│                                         │
│         ───── Hoặc dùng QR thật ─────  │
│                                         │
│  [📱 Thanh toán bằng QR Code]          │
│  [🔒 Thanh toán truyền thống]          │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ SAU KHI CLICK TEST BUTTON

### Alert hiện ra:
```
✅ THANH TOÁN THÀNH CÔNG (Test Mode)

Đơn hàng: ORD-abc123...
Số tiền: 27,500,000 VND
Phương thức: bank

Đang chuyển hướng...
```

### Auto redirect sau 1 giây:
```
→ /orders/{ORDER_ID}
```

### Database đã update:
```sql
orders.status = 'PAYMENT_PENDING_VERIFICATION'
payments (new record created)
```

---

## 🔧 TẮT TEST MODE

### File: `frontend/app/[locale]/orders/[id]/pay/page.tsx`

Tìm dòng:
```typescript
const [testMode, setTestMode] = useState(true);
```

Đổi thành:
```typescript
const [testMode, setTestMode] = useState(false);
```

**Lưu ý:** Chỉ tắt khi deploy production!

---

## 📊 TÍNH PHÍ TỰ ĐỘNG

Test Mode tự động tính phí đúng:

| Phương thức | Phí | Ví dụ |
|------------|-----|-------|
| Chuyển khoản | 0% | 27,500,000 VND |
| Thẻ tín dụng | 2.9% + 2,000₫ | 27,500,000 + 799,750 + 2,000 = 28,301,750 VND |
| Ví điện tử | 1.5% | 27,500,000 + 412,500 = 27,912,500 VND |

---

## 🚀 BẮT ĐẦU NGAY

1. ✅ Backend đang chạy (port 3006/3007)
2. ✅ Frontend đang chạy (port 3000)
3. ✅ Có order ID để test
4. ✅ Đã login

**→ VÀO NGAY `/orders/{id}/pay` VÀ TEST!**

---

## 💡 TIPS

### Để test nhanh:
1. Tạo order mới qua cart hoặc direct order
2. Copy order ID
3. Vào `/orders/{ID}/pay`
4. Click test button → DONE!

### Để test nhiều lần:
- Có thể test cùng 1 order nhiều lần
- Mỗi lần tạo payment record mới
- Order status vẫn update

### Để test các phương thức khác:
- Đổi radio button (Bank/Card/Wallet)
- Click test button lại
- Phí sẽ thay đổi tự động

---

## 🎉 KẾT QUẢ MONG ĐỢI

Sau khi test thành công:

✅ Alert "Thanh toán thành công" xuất hiện  
✅ Redirect về order detail  
✅ Order status = PAYMENT_PENDING_VERIFICATION  
✅ Payment record mới trong database  
✅ Amount chính xác (bao gồm phí)  

**Tất cả mà KHÔNG CẦN payment gateway thật! 🚀**

---

## ❓ FAQ

**Q: Test Mode có charge tiền thật không?**  
A: KHÔNG! Hoàn toàn miễn phí, chỉ update database.

**Q: Có cần VNPay/MoMo/Stripe credentials không?**  
A: KHÔNG! Test Mode hoạt động độc lập.

**Q: Production có thể dùng Test Mode không?**  
A: KHÔNG! Chỉ dùng development. Nhớ tắt trước khi deploy.

**Q: Test Mode có an toàn không?**  
A: CÓ! Vẫn require authentication, check permissions.

**Q: Có giới hạn số lần test không?**  
A: KHÔNG! Test không giới hạn.

---

**🎯 READY TO TEST! Chúc bạn develop vui vẻ! 🚀**
