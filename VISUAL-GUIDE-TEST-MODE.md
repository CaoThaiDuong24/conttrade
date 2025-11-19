# 🎨 TEST MODE - VISUAL GUIDE

## 🖼️ GIAO DIỆN PAYMENT PAGE

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│  ← [Back]      💰 Thanh toán đơn hàng                                    │
│                🛡️ Hoàn tất thanh toán để bảo vệ giao dịch qua Escrow     │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────────────────┐  ┌──────────────────────────┐  │
│  │  📦 Thông tin đơn hàng              │  │  💵 Chi tiết thanh toán │  │
│  ├──────────────────────────────────────┤  ├──────────────────────────┤  │
│  │  Container 40 feet HC               │  │  Tạm tính:  27,500,000₫ │  │
│  │  📍 Cảng Cát Lái                    │  │  Thuế:           0₫      │  │
│  │  👤 Người bán: Công ty ABC          │  │  Phí TT:         0₫      │  │
│  │  📅 01/11/2025                      │  │  ────────────────────── │  │
│  └──────────────────────────────────────┘  │  💰 Tổng: 27,500,000₫   │  │
│                                             └──────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  💳 Chọn phương thức thanh toán                                    │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │                                                                    │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │ ⚪ 🏦 Chuyển khoản ngân hàng                               │  │  │
│  │  │      Chuyển khoản trực tiếp • ✅ Miễn phí ✓                │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │                                                                    │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │ ⚪ 💳 Thẻ tín dụng/Ghi nợ                                  │  │  │
│  │  │      Visa, Mastercard, JCB • ⚠️ Phí 2.9% + 2,000₫         │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │                                                                    │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │ ⚪ 📱 Ví điện tử                                           │  │  │
│  │  │      MoMo, ZaloPay, VNPay • 💜 Phí 1.5%                   │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │                                                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │                                                              │ │  │
│  │  │  🧪 Test Mode                                               │ │  │
│  │  │  Giả lập thanh toán thành công ngay lập tức                │ │  │
│  │  │                                                              │ │  │
│  │  │  ┌────────────────────────────────────────────────────────┐ │ │  │
│  │  │  │  ✅ Giả lập thanh toán thành công                      │ │ │  │
│  │  │  └────────────────────────────────────────────────────────┘ │ │  │
│  │  │                                                              │ │  │
│  │  │  Không cần gateway thật - Dùng để test                     │ │  │
│  │  │                                                              │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  │                                                                    │  │
│  │  ────────────── Hoặc dùng QR thật ──────────────                 │  │
│  │                                                                    │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │  📱 Thanh toán bằng QR Code                                │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │                                                                    │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │  🔒 Thanh toán truyền thống                                │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │                                                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  🛡️ Bảo vệ Escrow                                                 │  │
│  │  Tiền sẽ được giữ an toàn và chỉ chuyển cho người bán             │  │
│  │  sau khi bạn xác nhận đã nhận hàng.                               │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLOW DIAGRAM

### Test Mode Flow:
```
┌─────────────┐
│   Buyer     │
│ truy cập    │
│ /pay page   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Chọn phương thức:  │
│  ⚪ Bank Transfer   │
│  ⚪ Credit Card     │
│  ⚪ E-Wallet        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Click "Giả lập thanh toán"    │
│         (Test Button)           │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Frontend gọi API:              │
│  POST /payments/escrow/{id}/fund│
│  {                              │
│    method: "bank",              │
│    amount: 27500000,            │
│    currency: "VND"              │
│  }                              │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Backend xử lý:                 │
│  1. Verify JWT                  │
│  2. Check order ownership       │
│  3. Update order status         │
│  4. Create payment record       │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Response:                      │
│  {                              │
│    success: true,               │
│    paymentId: "PAY-123",        │
│    status: "pending_verif"      │
│  }                              │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Frontend hiển thị alert:       │
│  ┌───────────────────────────┐ │
│  │ ✅ THANH TOÁN THÀNH CÔNG │ │
│  │                           │ │
│  │ Đơn hàng: ORD-abc123...  │ │
│  │ Số tiền: 27,500,000 VND  │ │
│  │ Phương thức: bank        │ │
│  │                           │ │
│  │ Đang chuyển hướng...     │ │
│  └───────────────────────────┘ │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Auto redirect (1 giây):        │
│  → /orders/{ORDER_ID}           │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Order Detail Page              │
│  Status: PAYMENT_PENDING_VERIF  │
│  ✅ Waiting for seller verify   │
└─────────────────────────────────┘
```

---

## 🎨 COLOR SCHEME

### Test Mode Box:
- **Background:** `bg-yellow-50` (Vàng nhạt)
- **Border:** `border-yellow-400` (Vàng đậm)
- **Icon:** 🧪 (Test tube emoji)
- **Button:** `yellow-500` to `orange-500` gradient

### Other Buttons:
- **QR Button:** `blue-600` to `indigo-600` gradient
- **Card Button:** `green-600` to `emerald-600` gradient
- **Traditional:** Outline với `green-600`

### Payment Methods:
- **Bank:** `blue` theme
- **Card:** `green` theme
- **Wallet:** `purple` theme

---

## 📱 RESPONSIVE DESIGN

### Desktop (>1024px):
```
┌─────────────────────────────────────────┐
│  Payment Info     │  Summary + Buttons  │
│  (2/3 width)      │  (1/3 width)        │
└─────────────────────────────────────────┘
```

### Mobile (<768px):
```
┌──────────────┐
│ Payment Info │
├──────────────┤
│   Summary    │
├──────────────┤
│   Buttons    │
└──────────────┘
```

---

## 🎯 INTERACTIVE STATES

### Test Button States:

#### Normal (Idle):
```
┌────────────────────────────────────┐
│  ✅ Giả lập thanh toán thành công │
└────────────────────────────────────┘
Color: Yellow-Orange Gradient
```

#### Hover:
```
┌────────────────────────────────────┐
│  ✅ Giả lập thanh toán thành công │
└────────────────────────────────────┘
Color: Darker Yellow-Orange
Shadow: Increased
```

#### Processing:
```
┌────────────────────────────────────┐
│  ⏳ Đang xử lý...                  │
└────────────────────────────────────┘
Spinner: Rotating
Disabled: true
```

#### Success (Alert):
```
╔════════════════════════════════════╗
║  ✅ THANH TOÁN THÀNH CÔNG         ║
║                                    ║
║  Đơn hàng: ORD-abc123...          ║
║  Số tiền: 27,500,000 VND          ║
║  Phương thức: bank                ║
║                                    ║
║  Đang chuyển hướng...             ║
╚════════════════════════════════════╝
```

---

## 🔍 ZOOM VIEW - TEST MODE BOX

```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║  ┌─────┐                                                ║
║  │ 🧪  │  Test Mode                                     ║
║  └─────┘  Giả lập thanh toán thành công ngay lập tức   ║
║                                                          ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │                                                    │ ║
║  │  ✅ Giả lập thanh toán thành công                 │ ║
║  │                                                    │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  Không cần gateway thật - Dùng để test                 ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

Dimensions:
- Padding: 16px (p-4)
- Border: 2px solid yellow-400
- Border Radius: 8px (rounded-lg)
- Icon Size: 32px (w-8 h-8)
- Button Height: 48px (h-12)
```

---

## 📊 COMPONENT HIERARCHY

```
OrderPaymentPage
├── Header (Back button + Title)
├── Error Display (if any)
└── Grid Layout (lg:grid-cols-3)
    ├── Left Column (2/3)
    │   ├── Order Summary Card
    │   │   ├── Order Info
    │   │   ├── Depot Location
    │   │   ├── Seller Info
    │   │   └── Created Date
    │   │
    │   └── Payment Methods Card
    │       ├── RadioGroup
    │       │   ├── Bank Transfer
    │       │   ├── Credit Card
    │       │   └── E-Wallet
    │       
    └── Right Column (1/3)
        ├── Payment Summary Card
        │   ├── Subtotal
        │   ├── Tax
        │   ├── Payment Fee
        │   └── Total
        │
        ├── Action Buttons
        │   ├── 🧪 Test Mode Box ⭐ NEW
        │   │   └── Test Payment Button
        │   ├── Separator
        │   ├── QR Payment Button
        │   ├── Card Payment Button
        │   └── Traditional Button
        │
        ├── Escrow Info Card
        └── Security Features Card

Modals (Conditional):
├── QRPaymentModal
│   ├── QR Code Image
│   ├── Bank Info
│   ├── Countdown Timer
│   └── Auto-check Status
│
└── CreditCardPaymentModal
    ├── Stripe Elements
    ├── Card Input
    ├── Billing Name
    └── Submit Button
```

---

## 🎭 ANIMATION SEQUENCE

### On Page Load:
```
1. ↓ Fade in Header (0.2s)
2. ↓ Slide in Order Card (0.3s)
3. ↓ Slide in Payment Methods (0.4s)
4. → Slide in Summary (0.5s)
5. ↑ Bounce in Test Mode Box (0.6s) ⭐
```

### On Test Button Click:
```
1. Button → Loading state (spinner)
2. API Call → Backend
3. Response → Success
4. Alert → Fade in (0.2s)
5. Wait → 1 second
6. Page → Redirect with fade out
```

### On QR Button Click:
```
1. Modal → Slide up from bottom
2. Loading → Show spinner
3. QR Generated → Fade in QR image
4. Info → Slide in bank details
5. Timer → Start countdown
6. Auto-check → Start polling
```

---

## 💡 USER EXPERIENCE NOTES

### Why Yellow for Test Mode?
- ⚠️ **Warning color** - Indicates test/dev mode
- 🔆 **High visibility** - Easy to spot
- 🧪 **Associated with testing** - Industry standard

### Button Placement:
- **Top position** - First thing user sees
- **Full width** - Easy to click
- **Above separator** - Clear distinction from real payment

### Clear Messaging:
- "Giả lập" - Clear it's simulation
- "Test Mode" - English term recognizable
- "Không cần gateway" - Reassuring

---

## 🎉 FINAL RESULT

```
User lands on /pay page
    ↓
Sees bright yellow Test Mode box
    ↓
Reads: "Giả lập thanh toán thành công"
    ↓
Thinks: "Oh! I can test without real payment!"
    ↓
Clicks big yellow button
    ↓
Alert shows: "✅ THANH TOÁN THÀNH CÔNG"
    ↓
Auto redirects to order detail
    ↓
Order status updated: PAYMENT_PENDING_VERIFICATION
    ↓
User happy: "Wow! That was easy!" 😊
```

---

**🎨 Beautiful, Intuitive, Fast! 🚀**
