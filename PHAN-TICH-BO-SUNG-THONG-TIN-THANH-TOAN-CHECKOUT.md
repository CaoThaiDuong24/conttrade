# 💳 PHÂN TÍCH BỔ SUNG THÔNG TIN THANH TOÁN Ở MENU ĐƠN HÀNG

**Ngày phân tích:** 19/11/2025  
**File phân tích:** `frontend/app/[locale]/orders/checkout/page.tsx`  
**Trạng thái hiện tại:** UI cơ bản, thiếu nhiều thông tin quan trọng

---

## 📋 MỤC ĐÍCH CHÍNH

### 1. **Thu thập thông tin người mua (Buyer Information)**
Trước khi thanh toán, cần xác nhận thông tin liên hệ của người mua:

- ✅ **Họ và tên** - Để xác định chủ đơn hàng
- ✅ **Email** - Gửi xác nhận đơn hàng, biên lai, thông báo
- ✅ **Số điện thoại** - Liên hệ khẩn cấp, xác thực giao dịch
- ✅ **Mã đơn hàng** - Reference cho việc thanh toán (đặc biệt với chuyển khoản)

**Lý do quan trọng:**
- Đảm bảo có thể liên lạc với buyer sau khi đơn hàng được tạo
- Cần thiết cho việc xác minh thanh toán chuyển khoản
- Dùng cho thông báo về trạng thái đơn hàng qua email/SMS
- Yêu cầu pháp lý cho giao dịch thương mại điện tử

---

### 2. **Hiển thị tóm tắt đơn hàng trước thanh toán**
Người mua cần thấy rõ những gì họ sắp thanh toán:

#### A. **Thông tin tài chính cơ bản** (Đang hiển thị)
```
- Tạm tính: 0 VND (subtotal)
- Phí dịch vụ: 0 VND (service fee)
- Tổng: 0 VND (total)
```

#### B. **Thông tin CẦN BỔ SUNG**

##### **Breakdown chi tiết của đơn hàng:**
```tsx
┌─────────────────────────────────────────┐
│   Tóm tắt đơn hàng                     │
├─────────────────────────────────────────┤
│                                         │
│   🏷️ Sản phẩm                          │
│   --------------------------------      │
│   Container 20ft Standard x2            │
│   50,000,000 VND x 2 = 100,000,000 VND │
│                                         │
│   Container 40ft HC x1                  │
│   80,000,000 VND x 1 = 80,000,000 VND  │
│                                         │
│   --------------------------------      │
│   Tạm tính:           180,000,000 VND  │
│                                         │
│   💰 Phí & Thuế                        │
│   --------------------------------      │
│   Phí nền tảng (5%):    9,000,000 VND  │
│   Phí thanh toán:         500,000 VND  │
│   Thuế VAT (10%):      18,950,000 VND  │
│                                         │
│   ================================      │
│   TỔNG THANH TOÁN:   208,450,000 VND  │
│   ================================      │
│                                         │
│   ⚠️ Lưu ý:                            │
│   • Tiền sẽ được giữ trong tài khoản  │
│     Escrow an toàn                     │
│   • Chỉ chuyển cho seller sau khi      │
│     giao hàng thành công               │
│   • Hoàn tiền nếu có tranh chấp        │
│                                         │
│   [Tiếp tục đến Escrow] ─────────────> │
└─────────────────────────────────────────┘
```

##### **Thông tin về phương thức thanh toán:**
- Các phương thức có sẵn (Bank Transfer, Credit Card, E-Wallet)
- Phí áp dụng cho từng phương thức
- Thời gian xử lý dự kiến
- Hướng dẫn thanh toán

##### **Thông tin về Escrow:**
- Giải thích Escrow là gì
- Lợi ích của Escrow (bảo vệ cả buyer và seller)
- Quy trình giải ngân
- Thời gian giữ tiền trong Escrow

---

### 3. **Điểm chuyển tiếp đến quy trình thanh toán**

Trang checkout là **gateway** giữa cart và payment:

```
CART ──> CHECKOUT ──> PAYMENT ──> ORDER CREATED ──> ESCROW FUNDED
         (Hiện tại)   (Tiếp theo)
```

**Chức năng của nút "Tiếp tục đến Escrow":**
1. Validate thông tin người mua
2. Tạo đơn hàng mới trong database (status = PENDING_PAYMENT)
3. Tạo payment record
4. Redirect đến trang thanh toán (`/orders/{id}/pay`)
5. Người dùng chọn phương thức và hoàn tất thanh toán
6. Escrow account được tạo và funded

---

## 🔍 PHÂN TÍCH HIỆN TRẠNG

### ✅ **Có sẵn** (Minimal UI)
```tsx
// File: frontend/app/[locale]/orders/checkout/page.tsx

<Card className="lg:col-span-2">
  <CardHeader>
    <CardTitle>Thông tin thanh toán</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid md:grid-cols-2 gap-4">
      <Input placeholder="Nguyễn Văn A" />        // Họ tên
      <Input placeholder="name@example.com" />    // Email
      <Input placeholder="0909xxxxxx" />          // SĐT
      <Input placeholder="ORD-0001" />            // Mã ĐH
    </div>
  </CardContent>
</Card>

<Card>
  <CardHeader>
    <CardTitle>Tóm tắt đơn hàng</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2 text-sm">
      <div>Tạm tính: 0 VND</div>
      <div>Phí dịch vụ: 0 VND</div>
      <div>Tổng: 0 VND</div>
    </div>
    <Button>Tiếp tục đến Escrow</Button>
  </CardContent>
</Card>
```

### ❌ **THIẾU các thông tin quan trọng:**

1. **Không có dữ liệu thực từ cart/order**
   - Hiển thị hardcoded "0 VND"
   - Không fetch cart items từ API
   - Không tính toán tổng tiền

2. **Không có breakdown chi tiết**
   - Không list sản phẩm trong cart
   - Không hiển thị số lượng, đơn giá
   - Không có phí chi tiết (platform fee, payment fee, tax)

3. **Không có thông tin Escrow**
   - Không giải thích Escrow là gì
   - Không nói rõ tiền sẽ được giữ như thế nào
   - Không có timeline dự kiến

4. **Không có validation**
   - Form không có validation
   - Không check required fields
   - Không verify email/phone format

5. **Không có luồng logic**
   - Button "Tiếp tục đến Escrow" không làm gì
   - Không tạo order
   - Không redirect đến payment page

---

## 📊 THÔNG TIN CẦN HIỂN THỊ

### **Section 1: Thông tin liên hệ** (Bên trái - 2/3 width)

```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <User className="h-5 w-5 text-blue-600" />
      Thông tin liên hệ
    </CardTitle>
    <CardDescription>
      Thông tin này sẽ dùng để liên lạc về đơn hàng của bạn
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Form onSubmit={handleCheckout}>
      {/* Họ và tên */}
      <FormField
        name="fullName"
        label="Họ và tên"
        placeholder="Nguyễn Văn A"
        required
        error={errors.fullName}
      />
      
      {/* Email */}
      <FormField
        name="email"
        type="email"
        label="Email"
        placeholder="nguyenvana@example.com"
        required
        error={errors.email}
        description="Biên lai và thông báo sẽ được gửi đến email này"
      />
      
      {/* Số điện thoại */}
      <FormField
        name="phone"
        type="tel"
        label="Số điện thoại"
        placeholder="0909 123 456"
        required
        error={errors.phone}
        description="Để liên hệ nếu có vấn đề với đơn hàng"
      />
      
      {/* Ghi chú (optional) */}
      <FormField
        name="notes"
        type="textarea"
        label="Ghi chú (tuỳ chọn)"
        placeholder="Yêu cầu đặc biệt về đơn hàng..."
        rows={3}
      />
    </Form>
  </CardContent>
</Card>
```

---

### **Section 2: Tóm tắt đơn hàng** (Bên phải - 1/3 width)

```tsx
<div className="space-y-6 sticky top-6">
  {/* Cart Items */}
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-blue-600" />
        Sản phẩm ({cartItems.length})
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {cartItems.map(item => (
          <div key={item.id} className="flex gap-3 pb-3 border-b">
            {/* Product Image */}
            <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100">
              <img 
                src={item.listing.images?.[0] || '/placeholder.png'} 
                alt={item.listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Product Info */}
            <div className="flex-1">
              <p className="font-medium text-sm line-clamp-2">
                {item.listing.title}
              </p>
              <p className="text-xs text-gray-500">
                {item.listing.containers?.iso_code} • 
                {item.listing.containers?.size_ft}ft
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">
                  x{item.quantity}
                </span>
                <span className="font-semibold text-sm">
                  {formatPrice(item.unit_price * item.quantity)} VND
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>

  {/* Price Breakdown */}
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-green-600" />
        Chi tiết thanh toán
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3 text-sm">
        {/* Subtotal */}
        <div className="flex justify-between pb-2">
          <span className="text-gray-600">Tạm tính:</span>
          <span className="font-medium">
            {formatPrice(subtotal)} VND
          </span>
        </div>
        
        {/* Platform Fee */}
        <div className="flex justify-between pb-2 border-t pt-2">
          <div className="flex items-center gap-1">
            <span className="text-gray-600">Phí nền tảng (5%):</span>
            <InfoIcon className="h-3 w-3 text-gray-400" />
          </div>
          <span className="font-medium">
            {formatPrice(platformFee)} VND
          </span>
        </div>
        
        {/* Payment Fee (if applicable) */}
        {paymentFee > 0 && (
          <div className="flex justify-between pb-2">
            <div className="flex items-center gap-1">
              <span className="text-gray-600">Phí thanh toán:</span>
              <InfoIcon className="h-3 w-3 text-gray-400" />
            </div>
            <span className="font-medium">
              {formatPrice(paymentFee)} VND
            </span>
          </div>
        )}
        
        {/* Tax */}
        <div className="flex justify-between pb-3 border-b">
          <span className="text-gray-600">Thuế VAT (10%):</span>
          <span className="font-medium">
            {formatPrice(tax)} VND
          </span>
        </div>
        
        {/* Total */}
        <div className="flex justify-between items-center pt-2 bg-gradient-to-r from-blue-50 to-indigo-50 -mx-4 px-4 py-3 rounded-lg">
          <span className="font-bold text-base">Tổng thanh toán:</span>
          <div className="text-right">
            <p className="font-bold text-xl text-blue-600">
              {formatPrice(total)}
            </p>
            <p className="text-xs text-gray-500">VND</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Escrow Info */}
  <Card className="bg-amber-50 border-amber-200">
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Shield className="h-5 w-5 text-amber-700" />
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-amber-900">
            💰 Bảo vệ bởi Escrow
          </p>
          <p className="text-amber-800">
            Tiền của bạn sẽ được giữ an toàn trong tài khoản Escrow 
            và chỉ chuyển cho người bán sau khi:
          </p>
          <ul className="list-disc list-inside space-y-1 text-amber-700 text-xs">
            <li>Seller chuẩn bị hàng xong</li>
            <li>Bạn xác nhận đã nhận hàng</li>
            <li>Hàng đúng mô tả, không có vấn đề</li>
          </ul>
          <p className="text-xs text-amber-600 italic">
            ℹ️ Nếu có tranh chấp, bạn có thể yêu cầu hoàn tiền
          </p>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Checkout Button */}
  <Button
    onClick={handleCheckout}
    disabled={isSubmitting || !isFormValid}
    className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg shadow-lg"
  >
    {isSubmitting ? (
      <>
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Đang xử lý...
      </>
    ) : (
      <>
        <Lock className="mr-2 h-5 w-5" />
        Tiếp tục đến thanh toán
      </>
    )}
  </Button>

  {/* Security Badge */}
  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
    <CheckCircle className="h-4 w-4 text-green-600" />
    <span>Thanh toán an toàn & mã hóa 256-bit SSL</span>
  </div>
</div>
```

---

### **Section 3: Thông tin bổ sung** (Dưới form chính)

```tsx
{/* FAQ / Thông tin hữu ích */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <HelpCircle className="h-5 w-5 text-blue-600" />
      Câu hỏi thường gặp
    </CardTitle>
  </CardHeader>
  <CardContent>
    <Accordion type="single" collapsible>
      <AccordionItem value="escrow">
        <AccordionTrigger>
          Escrow là gì và tại sao cần thiết?
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-sm text-gray-600 mb-2">
            Escrow là dịch vụ bên thứ ba giữ tiền an toàn cho đến khi 
            giao dịch hoàn tất. Nó bảo vệ cả người mua và người bán.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li><strong>Cho buyer:</strong> Tiền chỉ chuyển cho seller khi nhận hàng OK</li>
            <li><strong>Cho seller:</strong> Đảm bảo được thanh toán sau khi giao hàng</li>
            <li><strong>Nếu có tranh chấp:</strong> Hệ thống sẽ giải quyết công bằng</li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="payment-methods">
        <AccordionTrigger>
          Có những phương thức thanh toán nào?
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span><strong>Chuyển khoản ngân hàng:</strong> Miễn phí, quét QR nhanh chóng</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-green-600" />
              <span><strong>Thẻ tín dụng/ghi nợ:</strong> Phí 2.9% + 2,000₫</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-pink-600" />
              <span><strong>Ví điện tử (VNPay/MoMo):</strong> Phí 1.5%</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="timeline">
        <AccordionTrigger>
          Quy trình sau khi thanh toán như thế nào?
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
              <div>
                <p className="font-semibold text-sm">Thanh toán</p>
                <p className="text-xs text-gray-600">Tiền vào tài khoản Escrow</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
              <div>
                <p className="font-semibold text-sm">Seller chuẩn bị hàng</p>
                <p className="text-xs text-gray-600">Thời gian: 1-3 ngày làm việc</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
              <div>
                <p className="font-semibold text-sm">Vận chuyển/Lấy hàng</p>
                <p className="text-xs text-gray-600">Theo phương thức đã chọn</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">4</div>
              <div>
                <p className="font-semibold text-sm">Xác nhận nhận hàng</p>
                <p className="text-xs text-gray-600">Kiểm tra và confirm trên hệ thống</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">5</div>
              <div>
                <p className="font-semibold text-sm">Giải ngân cho seller</p>
                <p className="text-xs text-gray-600">Tiền được chuyển từ Escrow</p>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="refund">
        <AccordionTrigger>
          Nếu muốn huỷ đơn hoặc hoàn tiền thì sao?
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Trước khi seller chuẩn bị hàng:</strong></p>
            <ul className="list-disc list-inside ml-4 mb-3">
              <li>Có thể huỷ đơn miễn phí, hoàn tiền 100%</li>
              <li>Xử lý trong 1-2 ngày làm việc</li>
            </ul>
            
            <p><strong>Sau khi seller đã chuẩn bị hàng:</strong></p>
            <ul className="list-disc list-inside ml-4 mb-3">
              <li>Cần trao đổi với seller</li>
              <li>Có thể bị tính phí huỷ tuỳ theo chính sách</li>
            </ul>
            
            <p><strong>Nếu hàng có vấn đề:</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li>Mở tranh chấp (dispute) ngay khi nhận hàng</li>
              <li>Upload ảnh, mô tả vấn đề</li>
              <li>Hệ thống sẽ xem xét và giải quyết</li>
              <li>Có thể được hoàn tiền một phần hoặc toàn bộ</li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </CardContent>
</Card>
```

---

## 🎯 LUỒNG XỬ LÝ KHI CLICK "TIẾP TỤC ĐẾN THANH TOÁN"

### Frontend Logic:

```typescript
// File: frontend/app/[locale]/orders/checkout/page.tsx

const handleCheckout = async (e: FormEvent) => {
  e.preventDefault();
  
  try {
    setIsSubmitting(true);
    setError(null);
    
    // 1. Validate form
    const formData = {
      fullName: fullNameRef.current?.value,
      email: emailRef.current?.value,
      phone: phoneRef.current?.value,
      notes: notesRef.current?.value,
    };
    
    const validationResult = validateCheckoutForm(formData);
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }
    
    // 2. Get cart items
    const cart = await fetchCart();
    if (!cart || cart.cart_items.length === 0) {
      throw new Error('Giỏ hàng trống');
    }
    
    // 3. Create order
    const response = await fetch('/api/v1/orders/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cart_id: cart.id,
        buyer_info: formData,
        order_type: 'PURCHASE', // or 'RENTAL'
      }),
    });
    
    const { data: order } = await response.json();
    
    if (!order?.id) {
      throw new Error('Không thể tạo đơn hàng');
    }
    
    // 4. Clear cart
    await clearCart(cart.id);
    
    // 5. Redirect to payment page
    router.push(`/orders/${order.id}/pay`);
    
    // 6. Show success notification
    toast({
      title: 'Đơn hàng đã được tạo!',
      description: `Mã đơn hàng: ${order.order_number}`,
      variant: 'success',
    });
    
  } catch (err: any) {
    console.error('Checkout error:', err);
    setError(err.message || 'Có lỗi xảy ra khi tạo đơn hàng');
    toast({
      title: 'Lỗi',
      description: err.message,
      variant: 'destructive',
    });
  } finally {
    setIsSubmitting(false);
  }
};
```

### Backend API:

```typescript
// File: backend/src/routes/orders.ts

router.post('/orders/create', authenticate, async (req, res) => {
  const { cart_id, buyer_info, order_type } = req.body;
  const userId = req.user!.id;
  
  try {
    // 1. Get cart and validate
    const cart = await prisma.carts.findFirst({
      where: {
        id: cart_id,
        user_id: userId,
      },
      include: {
        cart_items: {
          include: {
            listings: {
              include: {
                containers: true,
                depots: true,
              },
            },
          },
        },
      },
    });
    
    if (!cart || cart.cart_items.length === 0) {
      return res.status(400).json({
        error: 'Cart is empty or not found',
      });
    }
    
    // 2. Calculate pricing
    const subtotal = cart.cart_items.reduce((sum, item) => {
      return sum + (item.unit_price * item.quantity);
    }, 0);
    
    const platformFee = subtotal * 0.05; // 5% platform fee
    const tax = (subtotal + platformFee) * 0.1; // 10% VAT
    const total = subtotal + platformFee + tax;
    
    // 3. Create order
    const order = await prisma.orders.create({
      data: {
        id: generateUUID(),
        order_number: generateOrderNumber(),
        buyer_id: userId,
        seller_id: cart.cart_items[0].listings.user_id, // First item's seller
        listing_id: cart.cart_items[0].listing_id,
        status: 'PENDING_PAYMENT',
        order_type: order_type || 'PURCHASE',
        subtotal,
        fees: platformFee,
        tax,
        total,
        currency: 'VND',
        buyer_notes: buyer_info.notes,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    
    // 4. Create order items
    await prisma.order_items.createMany({
      data: cart.cart_items.map(item => ({
        id: generateUUID(),
        order_id: order.id,
        listing_id: item.listing_id,
        container_id: item.container_id,
        item_type: item.item_type,
        qty: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
        description: item.listings.title,
        created_at: new Date(),
        updated_at: new Date(),
      })),
    });
    
    // 5. Create payment record (PENDING)
    const payment = await prisma.payments.create({
      data: {
        id: generateUUID(),
        order_id: order.id,
        amount: total,
        currency: 'VND',
        status: 'PENDING',
        provider: 'PENDING', // Will be set when user selects method
        method: 'PENDING',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    
    // 6. Clear cart (optional - can keep for history)
    // await prisma.cart_items.deleteMany({
    //   where: { cart_id: cart.id },
    // });
    
    // 7. Send notification email
    await sendOrderCreatedEmail({
      to: buyer_info.email,
      orderNumber: order.order_number,
      total,
      paymentUrl: `${process.env.FRONTEND_URL}/orders/${order.id}/pay`,
    });
    
    // 8. Return order
    res.json({
      success: true,
      data: {
        id: order.id,
        order_number: order.order_number,
        total: order.total,
        currency: order.currency,
        status: order.status,
        payment_id: payment.id,
      },
    });
    
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: error.message,
    });
  }
});
```

---

## 📈 DATA FLOW

```
┌──────────────┐
│   Browser    │
│   (Checkout  │
│    Page)     │
└──────┬───────┘
       │
       │ 1. User fills form
       │    + Full name
       │    + Email
       │    + Phone
       │    + Notes
       │
       │ 2. Click "Tiếp tục đến thanh toán"
       │
       ▼
┌──────────────────┐
│   POST /api/v1/  │
│  orders/create   │
└──────┬───────────┘
       │
       │ 3. Fetch cart from DB
       │
       ▼
┌──────────────────┐
│    Database      │
│  - carts         │
│  - cart_items    │
│  - listings      │
└──────┬───────────┘
       │
       │ 4. Calculate pricing
       │    subtotal = Σ(unit_price × qty)
       │    fees = subtotal × 5%
       │    tax = (subtotal + fees) × 10%
       │    total = subtotal + fees + tax
       │
       ▼
┌──────────────────┐
│  Create records: │
│  - orders        │
│  - order_items   │
│  - payments      │
│    (PENDING)     │
└──────┬───────────┘
       │
       │ 5. Return order data
       │
       ▼
┌──────────────────┐
│   Frontend       │
│   Redirect to:   │
│  /orders/{id}/pay│
└──────┬───────────┘
       │
       │ 6. User selects payment method
       │    - Bank Transfer (QR)
       │    - Credit Card
       │    - E-Wallet
       │
       ▼
┌──────────────────┐
│  Payment Page    │
│  (Next step)     │
└──────────────────┘
```

---

## 🔐 BẢO MẬT & VALIDATION

### Client-side Validation:
```typescript
function validateCheckoutForm(data: CheckoutForm): ValidationResult {
  const errors: Record<string, string> = {};
  
  // Full name
  if (!data.fullName || data.fullName.trim().length < 3) {
    errors.fullName = 'Họ tên phải có ít nhất 3 ký tự';
  }
  
  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = 'Email không hợp lệ';
  }
  
  // Phone
  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
  if (!data.phone || !phoneRegex.test(data.phone.replace(/\s/g, ''))) {
    errors.phone = 'Số điện thoại không hợp lệ';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
```

### Server-side Validation:
```typescript
// In backend API
if (!cart || cart.cart_items.length === 0) {
  throw new Error('Cart is empty');
}

// Verify all items are still available
for (const item of cart.cart_items) {
  const listing = await prisma.listings.findUnique({
    where: { id: item.listing_id },
  });
  
  if (!listing || listing.status === 'SOLD' || listing.deleted_at) {
    throw new Error(`Item ${listing?.title} is no longer available`);
  }
}

// Verify prices haven't changed
const currentPrice = listing.price;
if (item.unit_price !== currentPrice) {
  throw new Error(`Price has changed for ${listing.title}`);
}
```

---

## 📝 TÓM TẮT

### **Checkout Page dùng để:**

1. ✅ **Thu thập thông tin liên hệ người mua**
   - Họ tên, email, SĐT (bắt buộc)
   - Ghi chú đặc biệt (tuỳ chọn)

2. ✅ **Hiển thị tổng quan đơn hàng trước thanh toán**
   - Danh sách sản phẩm trong cart
   - Breakdown chi tiết: subtotal, fees, tax, total
   - Phương thức thanh toán có sẵn

3. ✅ **Giải thích về Escrow**
   - Escrow là gì, lợi ích
   - Quy trình giữ tiền và giải ngân
   - Chính sách hoàn tiền/tranh chấp

4. ✅ **Tạo đơn hàng trong database**
   - Status: PENDING_PAYMENT
   - Tạo order + order_items + payment records
   - Clear cart items

5. ✅ **Chuyển tiếp đến trang thanh toán**
   - Redirect: `/orders/{id}/pay`
   - Người dùng chọn phương thức và hoàn tất thanh toán
   - Escrow account được funded

---

## 🚀 NEXT STEPS

1. Implement full checkout page với tất cả thông tin trên
2. Kết nối với Cart API để lấy items
3. Implement backend API `/orders/create`
4. Tạo payment page `/orders/[id]/pay` với 3 phương thức
5. Testing end-to-end flow

**Bạn muốn tôi implement code chi tiết cho phần nào trước?**
