# 💳 PHÂN TÍCH CHI TIẾT 3 PHƯƠNG THỨC THANH TOÁN

## 📋 TỔNG QUAN

Hệ thống cần hỗ trợ **3 phương thức thanh toán khác nhau**, mỗi phương thức có **UI và flow khác nhau**:

1. 🏦 **Chuyển khoản ngân hàng** → QR Code + Thông tin chuyển khoản
2. 💳 **Thẻ tín dụng/Ghi nợ** → Form nhập thông tin thẻ
3. 📱 **Ví điện tử** → QR Code hoặc Redirect

---

## 🏦 PHƯƠNG THỨC 1: CHUYỂN KHOẢN NGÂN HÀNG (QR)

### 📱 User Experience:

```
Buyer chọn: ○ Chuyển khoản ngân hàng
                    ↓
Click "Thanh toán bằng QR Code"
                    ↓
Modal hiển thị:
┌─────────────────────────────────────────┐
│   💰 Chuyển khoản ngân hàng            │
├─────────────────────────────────────────┤
│                                         │
│        [QR CODE IMAGE]                  │
│         (VietQR)                        │
│                                         │
│   📝 Quét mã QR bằng app ngân hàng     │
│      của bạn để thanh toán              │
│                                         │
├─────────────────────────────────────────┤
│   💵 Số tiền: 27,500,000 VND           │
│   ⏰ Hết hạn sau: 14:58                │
├─────────────────────────────────────────┤
│   🏦 Ngân hàng: Vietcombank            │
│   📄 Số TK: 1234567890 [📋 Copy]       │
│   👤 Chủ TK: CONG TY CONTTRADE         │
│   ✏️ Nội dung: ORDER-ABC123 [📋 Copy]  │
├─────────────────────────────────────────┤
│   ⏳ Đang chờ thanh toán...             │
│   🔄 Tự động cập nhật khi nhận tiền    │
└─────────────────────────────────────────┘
```

### 💻 Implementation:

#### Backend Service:

```typescript
// File: backend/src/lib/payments/vietqr-service.ts

import QRCode from 'qrcode';

export class VietQRService {
  /**
   * Generate VietQR code using VietQR.io API
   */
  async generateQR(params: {
    amount: number;
    description: string;
  }): Promise<{
    qrCodeUrl: string;
    qrCodeData: string;
    bankInfo: {
      bankId: string;
      bankName: string;
      accountNo: string;
      accountName: string;
      amount: number;
      content: string;
    };
  }> {
    const bankId = process.env.BANK_ID || '970436'; // Vietcombank
    const accountNo = process.env.BANK_ACCOUNT_NO || '1234567890';
    const accountName = process.env.BANK_ACCOUNT_NAME || 'CONG TY CONTTRADE';
    
    // Use VietQR.io API to generate QR
    const qrCodeUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png?amount=${params.amount}&addInfo=${encodeURIComponent(params.description)}&accountName=${encodeURIComponent(accountName)}`;
    
    // Also generate local QR code as backup
    const qrData = `${bankId}|${accountNo}|${params.amount}|${params.description}`;
    const localQR = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      width: 300,
    });

    return {
      qrCodeUrl,      // VietQR.io generated QR
      qrCodeData: qrData,
      bankInfo: {
        bankId,
        bankName: this.getBankName(bankId),
        accountNo,
        accountName,
        amount: params.amount,
        content: params.description,
      },
    };
  }

  private getBankName(bankId: string): string {
    const banks: Record<string, string> = {
      '970436': 'Vietcombank',
      '970415': 'VietinBank',
      '970422': 'MB Bank',
      '970418': 'BIDV',
      // ... more banks
    };
    return banks[bankId] || 'Unknown Bank';
  }
}
```

#### Frontend Component:

```tsx
// File: frontend/components/payment/BankTransferQR.tsx

export function BankTransferQR({ orderId, amount, currency }: Props) {
  const [qrData, setQrData] = useState(null);
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutes
  
  useEffect(() => {
    generateQR();
    startStatusCheck();
  }, []);

  const generateQR = async () => {
    const response = await fetch('/api/v1/qr/generate', {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        method: 'bank',
        amount,
      }),
    });
    const data = await response.json();
    setQrData(data.data);
  };

  return (
    <div className="space-y-6">
      {/* QR Code Image */}
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <img 
          src={qrData.qrCodeUrl} 
          alt="VietQR Code" 
          className="w-64 h-64 mx-auto"
        />
        <p className="text-center text-sm text-gray-600 mt-4">
          Quét mã QR bằng app ngân hàng để thanh toán
        </p>
      </div>

      {/* Bank Info */}
      <div className="bg-blue-50 p-4 rounded-lg space-y-3">
        <InfoRow 
          label="Ngân hàng" 
          value={qrData.bankInfo.bankName} 
        />
        <InfoRow 
          label="Số tài khoản" 
          value={qrData.bankInfo.accountNo}
          copyable
        />
        <InfoRow 
          label="Chủ tài khoản" 
          value={qrData.bankInfo.accountName} 
        />
        <InfoRow 
          label="Số tiền" 
          value={formatCurrency(qrData.bankInfo.amount)}
          highlight
        />
        <InfoRow 
          label="Nội dung CK" 
          value={qrData.bankInfo.content}
          copyable
          important
        />
      </div>

      {/* Status */}
      <PaymentStatusChecker orderId={orderId} />
    </div>
  );
}
```

### ⚙️ Features:

- ✅ **QR Code tự động** - Generate bằng VietQR.io API
- ✅ **Copy to clipboard** - Sao chép STK, nội dung CK
- ✅ **Auto-detect payment** - Check status mỗi 3 giây
- ✅ **Countdown timer** - QR hết hạn sau 15 phút
- ✅ **Manual refresh** - Nút tạo QR mới nếu hết hạn

---

## 💳 PHƯƠNG THỨC 2: THẺ TÍN DỤNG/GHI NỢ

### 📱 User Experience:

```
Buyer chọn: ○ Thẻ tín dụng/Ghi nợ
                    ↓
Click "Thanh toán bằng thẻ"
                    ↓
Modal hiển thị FORM:
┌─────────────────────────────────────────┐
│   💳 Thanh toán bằng thẻ               │
├─────────────────────────────────────────┤
│                                         │
│   🔒 Thông tin thẻ của bạn             │
│                                         │
│   Số thẻ *                              │
│   ┌─────────────────────────────────┐  │
│   │ 1234 5678 9012 3456             │  │
│   └─────────────────────────────────┘  │
│   [Visa] [Mastercard] [JCB]            │
│                                         │
│   Tên chủ thẻ *                        │
│   ┌─────────────────────────────────┐  │
│   │ NGUYEN VAN A                    │  │
│   └─────────────────────────────────┘  │
│                                         │
│   Ngày hết hạn *        CVV *          │
│   ┌──────────┐  ┌─────────────┐       │
│   │ 12/2028  │  │    123      │       │
│   └──────────┘  └─────────────┘       │
│                                         │
│   ☑️ Lưu thẻ cho lần sau               │
│                                         │
├─────────────────────────────────────────┤
│   💰 Số tiền: 28,302,500 VND           │
│   📊 Phí: 802,500 VND (2.9% + 2,000đ)  │
├─────────────────────────────────────────┤
│   🔐 Bảo mật bởi Stripe                │
│                                         │
│   [💳 Thanh toán 28,302,500 VND]       │
└─────────────────────────────────────────┘
```

### 💻 Implementation:

#### Backend Service (Stripe Integration):

```typescript
// File: backend/src/lib/payments/stripe-service.ts

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export class StripeService {
  /**
   * Create payment intent for card payment
   */
  async createPaymentIntent(params: {
    orderId: string;
    amount: number;
    currency: string;
    customerId?: string;
  }): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> {
    // Calculate fee (2.9% + 2000 VND)
    const fee = Math.round(params.amount * 0.029 + 2000);
    const total = params.amount + fee;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total, // Amount in smallest currency unit
      currency: params.currency.toLowerCase(),
      customer: params.customerId,
      metadata: {
        orderId: params.orderId,
        originalAmount: params.amount,
        fee: fee,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Create customer for saving card
   */
  async createCustomer(params: {
    email: string;
    name: string;
  }): Promise<string> {
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
    });
    return customer.id;
  }

  /**
   * Attach payment method to customer
   */
  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<void> {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  /**
   * Get saved cards for customer
   */
  async getSavedCards(customerId: string) {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return paymentMethods.data;
  }
}
```

#### Frontend Component (Using Stripe Elements):

```tsx
// File: frontend/components/payment/CreditCardPayment.tsx

import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CardPaymentForm({ orderId, amount }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // Step 1: Create payment intent
      const response = await fetch('/api/v1/payments/create-intent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          currency: 'VND',
        }),
      });

      const { clientSecret } = await response.json();

      // Step 2: Confirm card payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: billingName,
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Payment successful
        toast({ title: 'Thanh toán thành công!' });
        router.push(`/orders/${orderId}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Input */}
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <label className="block text-sm font-medium mb-2">
          Thông tin thẻ
        </label>
        <div className="p-3 border rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Billing Name */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Tên chủ thẻ
        </label>
        <input
          type="text"
          value={billingName}
          onChange={(e) => setBillingName(e.target.value)}
          className="w-full p-3 border rounded-lg"
          placeholder="NGUYEN VAN A"
          required
        />
      </div>

      {/* Save Card Option */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="save-card"
          checked={saveCard}
          onChange={(e) => setSaveCard(e.target.checked)}
        />
        <label htmlFor="save-card" className="text-sm">
          Lưu thẻ cho lần thanh toán sau
        </label>
      </div>

      {/* Amount Breakdown */}
      <div className="bg-blue-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between">
          <span>Số tiền đơn hàng:</span>
          <span className="font-bold">{formatCurrency(amount)} VND</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Phí xử lý thẻ (2.9% + 2,000₫):</span>
          <span>{formatCurrency(calculateFee(amount))} VND</span>
        </div>
        <Separator />
        <div className="flex justify-between text-lg font-bold">
          <span>Tổng thanh toán:</span>
          <span className="text-blue-600">
            {formatCurrency(amount + calculateFee(amount))} VND
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Thanh toán {formatCurrency(amount + calculateFee(amount))} VND
          </>
        )}
      </Button>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
        <Shield className="h-4 w-4" />
        <span>Bảo mật bởi Stripe - PCI DSS Level 1</span>
      </div>
    </form>
  );
}

// Wrapper with Stripe Elements provider
export function CreditCardPayment(props: Props) {
  return (
    <Elements stripe={stripePromise}>
      <CardPaymentForm {...props} />
    </Elements>
  );
}
```

### ⚙️ Features:

- ✅ **Stripe Elements** - UI components bảo mật của Stripe
- ✅ **Card validation** - Tự động validate số thẻ, CVV, expiry
- ✅ **Save card** - Lưu thẻ cho lần sau (tokenization)
- ✅ **3D Secure** - Tự động xử lý xác thực 3D Secure
- ✅ **Fee calculation** - Hiển thị rõ phí (2.9% + 2,000đ)
- ✅ **Error handling** - Xử lý lỗi từ Stripe API

---

## 📱 PHƯƠNG THỨC 3: VÍ ĐIỆN TỬ (VNPay/MoMo/ZaloPay)

### 📱 User Experience:

```
Buyer chọn: ○ Ví điện tử
                    ↓
Sub-menu hiện ra:
┌─────────────────────────────────────────┐
│   Chọn ví điện tử:                     │
│   ○ VNPay                               │
│   ○ MoMo                                │
│   ○ ZaloPay                             │
└─────────────────────────────────────────┘
                    ↓
Click "Thanh toán"
                    ↓
OPTION A: QR Code (MoMo, ZaloPay)
┌─────────────────────────────────────────┐
│   📱 Thanh toán bằng MoMo              │
├─────────────────────────────────────────┤
│                                         │
│        [MOMO QR CODE]                   │
│                                         │
│   📝 Quét mã bằng app MoMo             │
│                                         │
│   [Hoặc]                                │
│                                         │
│   [📱 Mở app MoMo] ← Deep link          │
│                                         │
├─────────────────────────────────────────┤
│   💰 Số tiền: 27,912,500 VND           │
│   📊 Phí: 412,500 VND (1.5%)           │
│   ⏰ Hết hạn sau: 14:58                │
└─────────────────────────────────────────┘

OPTION B: Redirect (VNPay)
┌─────────────────────────────────────────┐
│   💳 Thanh toán bằng VNPay             │
├─────────────────────────────────────────┤
│   Bạn sẽ được chuyển đến trang         │
│   thanh toán của VNPay                 │
│                                         │
│   💰 Số tiền: 27,912,500 VND           │
│   📊 Phí: 412,500 VND (1.5%)           │
│                                         │
│   [🔗 Chuyển đến VNPay]                │
└─────────────────────────────────────────┘
```

### 💻 Implementation:

#### A. MoMo (QR Code + Deeplink):

```typescript
// Backend: backend/src/lib/payments/momo-service.ts

export class MoMoService {
  async createPaymentQR(params: {
    orderId: string;
    amount: number;
    orderInfo: string;
  }) {
    // Calculate fee (1.5%)
    const fee = Math.round(params.amount * 0.015);
    const total = params.amount + fee;

    const requestId = `${params.orderId}_${Date.now()}`;
    const requestType = 'captureWallet';

    // Create signature
    const rawSignature = `accessKey=${this.config.accessKey}&amount=${total}&extraData=&ipnUrl=${this.config.notifyUrl}&orderId=${params.orderId}&orderInfo=${params.orderInfo}&partnerCode=${this.config.partnerCode}&redirectUrl=${this.config.returnUrl}&requestId=${requestId}&requestType=${requestType}`;
    
    const signature = crypto
      .createHmac('sha256', this.config.secretKey)
      .update(rawSignature)
      .digest('hex');

    // Call MoMo API
    const response = await axios.post(this.config.endpoint, {
      partnerCode: this.config.partnerCode,
      accessKey: this.config.accessKey,
      requestId,
      amount: total,
      orderId: params.orderId,
      orderInfo: params.orderInfo,
      redirectUrl: this.config.returnUrl,
      ipnUrl: this.config.notifyUrl,
      extraData: '',
      requestType,
      signature,
      lang: 'vi',
    });

    return {
      qrCodeUrl: response.data.qrCodeUrl,      // QR to display
      deeplink: response.data.deeplink,        // momo://... link
      payUrl: response.data.payUrl,            // Web URL
    };
  }
}
```

```tsx
// Frontend: frontend/components/payment/MoMoPayment.tsx

export function MoMoPayment({ orderId, amount }: Props) {
  const [qrData, setQrData] = useState(null);

  useEffect(() => {
    generateMoMoQR();
  }, []);

  const generateMoMoQR = async () => {
    const response = await fetch('/api/v1/qr/generate', {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        method: 'momo',
        amount,
      }),
    });
    const data = await response.json();
    setQrData(data.data);
  };

  const openMoMoApp = () => {
    // Try to open MoMo app via deeplink
    window.location.href = qrData.deeplink;
    
    // Fallback to web URL after 2 seconds
    setTimeout(() => {
      window.open(qrData.payUrl, '_blank');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* QR Code */}
      <div className="bg-white p-6 rounded-lg">
        <img 
          src={qrData.qrCodeUrl} 
          alt="MoMo QR" 
          className="w-64 h-64 mx-auto"
        />
        <p className="text-center mt-4">
          Quét mã bằng ứng dụng MoMo
        </p>
      </div>

      {/* OR Divider */}
      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-gray-500">
          Hoặc
        </span>
      </div>

      {/* Open App Button */}
      <Button
        onClick={openMoMoApp}
        className="w-full h-12 bg-pink-600 hover:bg-pink-700"
      >
        <Smartphone className="mr-2" />
        Mở ứng dụng MoMo
      </Button>

      {/* Amount Info */}
      <div className="bg-pink-50 p-4 rounded-lg">
        <div className="flex justify-between mb-2">
          <span>Số tiền đơn hàng:</span>
          <span>{formatCurrency(amount)} VND</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Phí MoMo (1.5%):</span>
          <span>{formatCurrency(amount * 0.015)} VND</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between font-bold">
          <span>Tổng:</span>
          <span className="text-pink-600">
            {formatCurrency(amount * 1.015)} VND
          </span>
        </div>
      </div>

      {/* Status Checker */}
      <PaymentStatusChecker orderId={orderId} />
    </div>
  );
}
```

#### B. VNPay (Redirect):

```typescript
// Backend: backend/src/lib/payments/vnpay-service.ts

export class VNPayService {
  createPaymentUrl(params: {
    orderId: string;
    amount: number;
    orderInfo: string;
    ipAddr: string;
  }): string {
    // Calculate fee (1.5%)
    const fee = Math.round(params.amount * 0.015);
    const total = params.amount + fee;

    const vnpParams: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.config.tmnCode,
      vnp_Amount: total * 100, // VNPay uses smallest unit
      vnp_CreateDate: this.formatDate(new Date()),
      vnp_CurrCode: 'VND',
      vnp_IpAddr: params.ipAddr,
      vnp_Locale: 'vn',
      vnp_OrderInfo: params.orderInfo,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: this.config.returnUrl,
      vnp_TxnRef: params.orderId,
      vnp_ExpireDate: this.formatDate(new Date(Date.now() + 15 * 60 * 1000)),
    };

    // Sort and sign
    const sortedParams = this.sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams);
    const hmac = crypto.createHmac('sha512', this.config.secretKey);
    const signature = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    sortedParams.vnp_SecureHash = signature;

    return this.config.url + '?' + querystring.stringify(sortedParams);
  }
}
```

```tsx
// Frontend: frontend/components/payment/VNPayPayment.tsx

export function VNPayPayment({ orderId, amount }: Props) {
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generatePaymentUrl();
  }, []);

  const generatePaymentUrl = async () => {
    const response = await fetch('/api/v1/qr/generate', {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        method: 'vnpay',
        amount,
      }),
    });
    const data = await response.json();
    setPaymentUrl(data.data.paymentUrl);
    setLoading(false);
  };

  const redirectToVNPay = () => {
    window.location.href = paymentUrl;
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-bold text-lg mb-2">
            Chuyển đến VNPay để thanh toán
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Bạn sẽ được chuyển đến trang thanh toán an toàn của VNPay
          </p>
          
          {/* Amount */}
          <div className="bg-white p-4 rounded-lg mb-4">
            <div className="flex justify-between mb-2">
              <span>Số tiền đơn hàng:</span>
              <span>{formatCurrency(amount)} VND</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Phí VNPay (1.5%):</span>
              <span>{formatCurrency(amount * 0.015)} VND</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Tổng:</span>
              <span className="text-blue-600">
                {formatCurrency(amount * 1.015)} VND
              </span>
            </div>
          </div>

          <Button
            onClick={redirectToVNPay}
            disabled={loading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : (
              <ExternalLink className="mr-2" />
            )}
            Chuyển đến VNPay
          </Button>
        </CardContent>
      </Card>

      {/* Security Info */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Shield className="h-4 w-4" />
        <span>Bảo mật bởi VNPay - Cổng thanh toán quốc gia</span>
      </div>
    </div>
  );
}
```

#### C. ZaloPay (Similar to MoMo):

```typescript
// Similar implementation to MoMo with ZaloPay API
// QR Code + Deeplink support
```

### ⚙️ Features:

**MoMo & ZaloPay:**
- ✅ **QR Code** - Hiển thị QR để quét
- ✅ **Deep Link** - Mở app trực tiếp
- ✅ **Auto-detect** - Check status tự động
- ✅ **Countdown** - 15 phút hết hạn

**VNPay:**
- ✅ **Redirect** - Chuyển đến trang VNPay
- ✅ **Return URL** - Quay lại sau khi thanh toán
- ✅ **Signature verify** - Xác thực callback

---

## 🎨 FRONTEND - MAIN PAYMENT PAGE

### Update Payment Page with 3 Methods:

```tsx
// File: frontend/app/[locale]/orders/[id]/pay/page.tsx

export default function OrderPaymentPage({ params }: Props) {
  const [paymentMethod, setPaymentMethod] = useState<
    'bank' | 'credit_card' | 'vnpay' | 'momo' | 'zalopay'
  >('bank');
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Payment Methods Selection */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Chọn phương thức thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              
              {/* 1. BANK TRANSFER */}
              <div className={`payment-option ${paymentMethod === 'bank' ? 'selected' : ''}`}>
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank">
                  <Building2 className="icon" />
                  <div>
                    <div className="title">Chuyển khoản ngân hàng</div>
                    <div className="description">
                      Quét QR hoặc chuyển khoản thủ công • 
                      <span className="fee-free">Miễn phí ✓</span>
                    </div>
                  </div>
                </Label>
              </div>

              {/* 2. CREDIT CARD */}
              <div className={`payment-option ${paymentMethod === 'credit_card' ? 'selected' : ''}`}>
                <RadioGroupItem value="credit_card" id="credit_card" />
                <Label htmlFor="credit_card">
                  <CreditCard className="icon" />
                  <div>
                    <div className="title">Thẻ tín dụng/Ghi nợ</div>
                    <div className="description">
                      Visa, Mastercard, JCB • 
                      <span className="fee-warning">Phí 2.9% + 2,000₫</span>
                    </div>
                  </div>
                </Label>
              </div>

              {/* 3. E-WALLETS */}
              <Collapsible>
                <CollapsibleTrigger>
                  <div className="payment-option-group">
                    <Smartphone className="icon" />
                    <span>Ví điện tử</span>
                    <span className="fee-info">Phí 1.5%</span>
                    <ChevronDown className="chevron" />
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="pl-12 space-y-2 mt-2">
                  {/* VNPay */}
                  <div className={`payment-sub-option ${paymentMethod === 'vnpay' ? 'selected' : ''}`}>
                    <RadioGroupItem value="vnpay" id="vnpay" />
                    <Label htmlFor="vnpay">
                      <img src="/logos/vnpay.png" alt="VNPay" className="w-12" />
                      <span>VNPay</span>
                    </Label>
                  </div>

                  {/* MoMo */}
                  <div className={`payment-sub-option ${paymentMethod === 'momo' ? 'selected' : ''}`}>
                    <RadioGroupItem value="momo" id="momo" />
                    <Label htmlFor="momo">
                      <img src="/logos/momo.png" alt="MoMo" className="w-12" />
                      <span>MoMo</span>
                    </Label>
                  </div>

                  {/* ZaloPay */}
                  <div className={`payment-sub-option ${paymentMethod === 'zalopay' ? 'selected' : ''}`}>
                    <RadioGroupItem value="zalopay" id="zalopay" />
                    <Label htmlFor="zalopay">
                      <img src="/logos/zalopay.png" alt="ZaloPay" className="w-12" />
                      <span>ZaloPay</span>
                    </Label>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      {/* Summary & Payment Button */}
      <div>
        <PaymentSummary 
          amount={amount} 
          method={paymentMethod} 
        />
        
        <Button 
          onClick={() => setShowModal(true)}
          className="w-full h-14"
        >
          Thanh toán {formatCurrency(getTotalAmount())} VND
        </Button>
      </div>
    </div>

    {/* Payment Modal - Different UI based on method */}
    {showModal && (
      <>
        {paymentMethod === 'bank' && (
          <BankTransferQRModal {...props} />
        )}
        {paymentMethod === 'credit_card' && (
          <CreditCardPaymentModal {...props} />
        )}
        {paymentMethod === 'momo' && (
          <MoMoPaymentModal {...props} />
        )}
        {paymentMethod === 'vnpay' && (
          <VNPayPaymentModal {...props} />
        )}
        {paymentMethod === 'zalopay' && (
          <ZaloPayPaymentModal {...props} />
        )}
      </>
    )}
  );
}
```

---

## 📊 SO SÁNH 3 PHƯƠNG THỨC

| Tiêu chí | Chuyển khoản NH | Thẻ tín dụng | Ví điện tử |
|----------|-----------------|--------------|------------|
| **UI** | QR Code + Bank Info | Card Form | QR Code / Redirect |
| **Phí** | 0% (Miễn phí) | 2.9% + 2,000₫ | 1.5% |
| **Thời gian** | Instant - 15 phút | Instant | Instant |
| **Auto-detect** | ✅ Có | ✅ Có (Stripe webhook) | ✅ Có |
| **User steps** | 2 bước (Quét QR → Done) | 3 bước (Fill form → Submit → Done) | 2 bước (Quét/Click → Done) |
| **Security** | VietQR Standard | PCI DSS Level 1 | Gateway security |
| **Mobile** | ✅ Tốt nhất | ⚠️ Cần nhập nhiều | ✅ Tốt (Deep link) |
| **Save for later** | ❌ Không | ✅ Có (Save card) | ⚠️ Tùy gateway |

---

## 🎯 KHUYẾN NGHỊ

### Thứ tự ưu tiên hiển thị:

1. **🏦 Chuyển khoản ngân hàng** (Default)
   - ✅ Miễn phí
   - ✅ UX tốt nhất (QR)
   - ✅ Phổ biến tại VN

2. **📱 Ví điện tử**
   - ✅ Phí thấp (1.5%)
   - ✅ Nhanh chóng
   - ✅ Mobile-friendly

3. **💳 Thẻ tín dụng**
   - ⚠️ Phí cao nhất
   - ⚠️ UX phức tạp hơn
   - ✅ International support

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Basic (Week 1-2)
- ✅ Chuyển khoản ngân hàng (VietQR)
- ✅ Basic payment status check

### Phase 2: E-Wallets (Week 3-4)
- ✅ VNPay integration
- ✅ MoMo integration
- ✅ Webhooks

### Phase 3: Credit Card (Week 5-6)
- ✅ Stripe integration
- ✅ Card form UI
- ✅ Save card feature

### Phase 4: Optimization (Week 7-8)
- ✅ Auto-select best method
- ✅ Payment analytics
- ✅ A/B testing

---

**🎯 READY TO CODE! Bạn muốn implement phương thức nào trước?**
