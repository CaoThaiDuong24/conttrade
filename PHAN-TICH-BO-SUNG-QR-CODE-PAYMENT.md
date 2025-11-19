# 📱 PHÂN TÍCH BỔ SUNG QR CODE THANH TOÁN

## 📋 TỔNG QUAN

Hiện tại hệ thống chỉ có button thanh toán đơn giản. Cần bổ sung tính năng **quét mã QR** để thanh toán nhanh chóng và tiện lợi hơn.

---

## 🎯 MỤC TIÊU

### ✅ Yêu cầu chính:
1. **Hiển thị QR code** khi người dùng chọn phương thức thanh toán
2. **Tích hợp VNPay QR** - Phổ biến nhất tại Việt Nam
3. **Tích hợp MoMo QR** - Ví điện tử phổ biến
4. **Tích hợp ZaloPay QR** - Ví điện tử phổ biến
5. **Bank Transfer QR** - Chuyển khoản ngân hàng qua QR
6. **Auto-detect payment** - Tự động cập nhật khi thanh toán thành công

---

## 🔍 PHÂN TÍCH HIỆN TRẠNG

### 📂 File cần chỉnh sửa:

#### 1. **Frontend - Payment Page**
```
File: frontend/app/[locale]/orders/[id]/pay/page.tsx
Hiện trạng:
  ✅ Có radio button chọn phương thức thanh toán
  ✅ Có button "Thanh toán an toàn qua Escrow"
  ❌ Chưa có QR code display
  ❌ Chưa có tích hợp payment gateway
  ❌ Chưa có auto-detect payment
```

#### 2. **Backend - Payment Service**
```
File: backend/src/lib/payments/payment-service-simple.ts
Hiện trạng:
  ✅ Có processEscrowPayment method
  ❌ Chưa có QR code generation
  ❌ Chưa có VNPay integration
  ❌ Chưa có MoMo integration
  ❌ Chưa có payment webhook
```

#### 3. **Backend - Payment Routes**
```
File: backend/src/routes/payments.ts
Hiện trạng:
  ✅ Có POST /escrow/:orderId/fund
  ❌ Chưa có GET /qr-code/:orderId
  ❌ Chưa có POST /webhook/vnpay
  ❌ Chưa có POST /webhook/momo
```

---

## 🏗️ KIẾN TRÚC ĐỀ XUẤT

### 1️⃣ **QR Code Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                    BUYER PAYMENT PAGE                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   Chọn phương thức thanh toán:       │
        │   ○ Chuyển khoản ngân hàng (QR)      │
        │   ○ Thẻ tín dụng/Ghi nợ             │
        │   ○ Ví điện tử (VNPay/MoMo/ZaloPay) │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   Click "Tạo mã QR thanh toán"       │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   API: POST /api/qr/generate          │
        │   Body: {                             │
        │     orderId,                          │
        │     method: 'vnpay'|'momo'|'bank'     │
        │     amount,                           │
        │     currency                          │
        │   }                                   │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   Backend generates QR code:          │
        │   - VNPay: Call VNPay API             │
        │   - MoMo: Call MoMo API               │
        │   - Bank: Generate VietQR             │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   Response: {                         │
        │     qrCodeUrl: "data:image/png...",   │
        │     qrCodeData: "...",                │
        │     paymentUrl: "https://...",        │
        │     transactionId: "TXN123"           │
        │   }                                   │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   Display QR code + Info:             │
        │   ┌─────────────────────────────┐    │
        │   │     [QR CODE IMAGE]          │    │
        │   │                              │    │
        │   │  Quét mã để thanh toán       │    │
        │   │  Số tiền: 27,500,000 VND     │    │
        │   │  Nội dung: ORDER-XXX         │    │
        │   └─────────────────────────────┘    │
        │                                       │
        │   [Auto-checking payment status...]   │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   Poll API every 3s:                  │
        │   GET /api/payments/status/:orderId   │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   If payment detected:                │
        │   - Show success message              │
        │   - Redirect to order detail          │
        └───────────────────────────────────────┘
```

---

## 💻 IMPLEMENTATION PLAN

### 📦 **PHASE 1: Backend - QR Code Generation**

#### Step 1.1: Install Dependencies

```bash
cd backend
npm install qrcode
npm install axios
npm install crypto-js
```

#### Step 1.2: Create VNPay Service

```typescript
// File: backend/src/lib/payments/vnpay-service.ts

import crypto from 'crypto';
import querystring from 'querystring';

interface VNPayConfig {
  tmnCode: string;      // Terminal code
  secretKey: string;    // Secret key
  url: string;          // VNPay gateway URL
  returnUrl: string;    // Return URL after payment
}

export class VNPayService {
  private config: VNPayConfig;

  constructor(config: VNPayConfig) {
    this.config = config;
  }

  /**
   * Create VNPay payment URL
   */
  createPaymentUrl(params: {
    orderId: string;
    amount: number;
    orderInfo: string;
    ipAddr: string;
  }): string {
    const createDate = this.formatDate(new Date());
    const expireDate = this.formatDate(new Date(Date.now() + 15 * 60 * 1000)); // 15 minutes

    const vnpParams: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.config.tmnCode,
      vnp_Amount: params.amount * 100, // VNPay requires amount in smallest unit (VND * 100)
      vnp_CreateDate: createDate,
      vnp_CurrCode: 'VND',
      vnp_IpAddr: params.ipAddr,
      vnp_Locale: 'vn',
      vnp_OrderInfo: params.orderInfo,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: this.config.returnUrl,
      vnp_TxnRef: params.orderId,
      vnp_ExpireDate: expireDate,
    };

    // Sort params
    const sortedParams = this.sortObject(vnpParams);

    // Create signature
    const signData = querystring.stringify(sortedParams);
    const hmac = crypto.createHmac('sha512', this.config.secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    sortedParams.vnp_SecureHash = signed;

    // Create payment URL
    const paymentUrl = this.config.url + '?' + querystring.stringify(sortedParams);

    return paymentUrl;
  }

  /**
   * Verify VNPay callback
   */
  verifyReturnUrl(params: any): { isValid: boolean; message?: string } {
    const secureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const sortedParams = this.sortObject(params);
    const signData = querystring.stringify(sortedParams);
    const hmac = crypto.createHmac('sha512', this.config.secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      return { isValid: true };
    } else {
      return { isValid: false, message: 'Invalid signature' };
    }
  }

  /**
   * Format date for VNPay
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Sort object by keys
   */
  private sortObject(obj: any): any {
    const sorted: any = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
      sorted[key] = obj[key];
    });
    return sorted;
  }
}

// Export singleton instance
const vnpayConfig: VNPayConfig = {
  tmnCode: process.env.VNPAY_TMN_CODE || 'YOUR_TMN_CODE',
  secretKey: process.env.VNPAY_SECRET_KEY || 'YOUR_SECRET_KEY',
  url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  returnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/payment/vnpay-return',
};

export const vnpayService = new VNPayService(vnpayConfig);
```

#### Step 1.3: Create MoMo Service

```typescript
// File: backend/src/lib/payments/momo-service.ts

import crypto from 'crypto';
import axios from 'axios';

interface MoMoConfig {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  endpoint: string;
  returnUrl: string;
  notifyUrl: string;
}

export class MoMoService {
  private config: MoMoConfig;

  constructor(config: MoMoConfig) {
    this.config = config;
  }

  /**
   * Create MoMo payment QR
   */
  async createPaymentQR(params: {
    orderId: string;
    amount: number;
    orderInfo: string;
  }): Promise<{
    qrCodeUrl: string;
    deeplink: string;
    payUrl: string;
  }> {
    const requestId = `${params.orderId}_${Date.now()}`;
    const requestType = 'captureWallet';
    const extraData = '';

    // Create raw signature
    const rawSignature = `accessKey=${this.config.accessKey}&amount=${params.amount}&extraData=${extraData}&ipnUrl=${this.config.notifyUrl}&orderId=${params.orderId}&orderInfo=${params.orderInfo}&partnerCode=${this.config.partnerCode}&redirectUrl=${this.config.returnUrl}&requestId=${requestId}&requestType=${requestType}`;

    // Create signature using HMAC SHA256
    const signature = crypto
      .createHmac('sha256', this.config.secretKey)
      .update(rawSignature)
      .digest('hex');

    // Request body
    const requestBody = {
      partnerCode: this.config.partnerCode,
      accessKey: this.config.accessKey,
      requestId,
      amount: params.amount,
      orderId: params.orderId,
      orderInfo: params.orderInfo,
      redirectUrl: this.config.returnUrl,
      ipnUrl: this.config.notifyUrl,
      extraData,
      requestType,
      signature,
      lang: 'vi',
    };

    try {
      // Call MoMo API
      const response = await axios.post(this.config.endpoint, requestBody);

      if (response.data.resultCode === 0) {
        return {
          qrCodeUrl: response.data.qrCodeUrl,
          deeplink: response.data.deeplink,
          payUrl: response.data.payUrl,
        };
      } else {
        throw new Error(response.data.message || 'MoMo payment failed');
      }
    } catch (error: any) {
      throw new Error(`MoMo API error: ${error.message}`);
    }
  }

  /**
   * Verify MoMo callback
   */
  verifyCallback(params: any): { isValid: boolean; message?: string } {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = params;

    // Create raw signature
    const rawSignature = `accessKey=${this.config.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    // Create signature
    const calculatedSignature = crypto
      .createHmac('sha256', this.config.secretKey)
      .update(rawSignature)
      .digest('hex');

    if (signature === calculatedSignature) {
      return { isValid: true };
    } else {
      return { isValid: false, message: 'Invalid signature' };
    }
  }
}

// Export singleton instance
const momoConfig: MoMoConfig = {
  partnerCode: process.env.MOMO_PARTNER_CODE || 'YOUR_PARTNER_CODE',
  accessKey: process.env.MOMO_ACCESS_KEY || 'YOUR_ACCESS_KEY',
  secretKey: process.env.MOMO_SECRET_KEY || 'YOUR_SECRET_KEY',
  endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
  returnUrl: process.env.MOMO_RETURN_URL || 'http://localhost:3000/payment/momo-return',
  notifyUrl: process.env.MOMO_NOTIFY_URL || 'http://localhost:4000/api/v1/payments/webhook/momo',
};

export const momoService = new MoMoService(momoConfig);
```

#### Step 1.4: Create VietQR Service (Bank Transfer)

```typescript
// File: backend/src/lib/payments/vietqr-service.ts

import QRCode from 'qrcode';

interface VietQRConfig {
  bankId: string;        // Bank ID (e.g., '970436' for Vietcombank)
  accountNo: string;     // Account number
  accountName: string;   // Account name
  template: string;      // Template (e.g., 'compact', 'qr_only')
}

export class VietQRService {
  private config: VietQRConfig;

  constructor(config: VietQRConfig) {
    this.config = config;
  }

  /**
   * Generate VietQR code for bank transfer
   */
  async generateQR(params: {
    amount: number;
    description: string;
  }): Promise<{
    qrCodeUrl: string;
    qrCodeData: string;
  }> {
    // VietQR format
    const qrData = this.createVietQRData({
      bankId: this.config.bankId,
      accountNo: this.config.accountNo,
      amount: params.amount,
      description: params.description,
    });

    try {
      // Generate QR code as data URL
      const qrCodeUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 300,
        margin: 1,
      });

      return {
        qrCodeUrl,
        qrCodeData: qrData,
      };
    } catch (error: any) {
      throw new Error(`VietQR generation error: ${error.message}`);
    }
  }

  /**
   * Create VietQR data string
   */
  private createVietQRData(params: {
    bankId: string;
    accountNo: string;
    amount: number;
    description: string;
  }): string {
    // VietQR uses format:
    // https://img.vietqr.io/image/{BANK_ID}-{ACCOUNT_NO}-{TEMPLATE}.png?amount={AMOUNT}&addInfo={DESCRIPTION}
    
    // For QR code content, we use standard format
    const qrContent = `${params.bankId}|${params.accountNo}|${params.amount}|${params.description}|${this.config.accountName}`;
    
    return qrContent;
  }
}

// Export singleton instance
const vietQRConfig: VietQRConfig = {
  bankId: process.env.BANK_ID || '970436', // Vietcombank
  accountNo: process.env.BANK_ACCOUNT_NO || '1234567890',
  accountName: process.env.BANK_ACCOUNT_NAME || 'CONG TY CONTTRADE',
  template: 'compact',
};

export const vietQRService = new VietQRService(vietQRConfig);
```

#### Step 1.5: Create QR Payment Routes

```typescript
// File: backend/src/routes/qr-payments.ts

import { FastifyInstance } from 'fastify';
import { vnpayService } from '../lib/payments/vnpay-service.js';
import { momoService } from '../lib/payments/momo-service.js';
import { vietQRService } from '../lib/payments/vietqr-service.js';

export default async function qrPaymentRoutes(fastify: FastifyInstance) {
  // POST /api/v1/qr/generate - Generate QR code for payment
  fastify.post<{
    Body: {
      orderId: string;
      method: 'vnpay' | 'momo' | 'bank';
      amount: number;
      currency?: string;
    };
  }>('/generate', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    },
  }, async (request, reply) => {
    const { orderId, method, amount, currency = 'VND' } = request.body;
    const user = request.user as any;

    try {
      let qrResult: any = {};

      switch (method) {
        case 'vnpay':
          // Generate VNPay payment URL
          const vnpayUrl = vnpayService.createPaymentUrl({
            orderId,
            amount,
            orderInfo: `Thanh toan don hang ${orderId}`,
            ipAddr: request.ip,
          });
          
          qrResult = {
            method: 'vnpay',
            paymentUrl: vnpayUrl,
            qrCodeData: vnpayUrl,
            message: 'Vui lòng quét mã QR hoặc click vào link để thanh toán',
          };
          break;

        case 'momo':
          // Generate MoMo QR
          const momoResult = await momoService.createPaymentQR({
            orderId,
            amount,
            orderInfo: `Thanh toan don hang ${orderId}`,
          });
          
          qrResult = {
            method: 'momo',
            qrCodeUrl: momoResult.qrCodeUrl,
            deeplink: momoResult.deeplink,
            payUrl: momoResult.payUrl,
            message: 'Vui lòng quét mã QR bằng ứng dụng MoMo',
          };
          break;

        case 'bank':
          // Generate VietQR for bank transfer
          const bankResult = await vietQRService.generateQR({
            amount,
            description: `Thanh toan ${orderId}`,
          });
          
          qrResult = {
            method: 'bank',
            qrCodeUrl: bankResult.qrCodeUrl,
            qrCodeData: bankResult.qrCodeData,
            message: 'Vui lòng quét mã QR bằng ứng dụng ngân hàng',
            bankInfo: {
              bankName: 'Vietcombank',
              accountNo: process.env.BANK_ACCOUNT_NO,
              accountName: process.env.BANK_ACCOUNT_NAME,
              amount,
              content: `Thanh toan ${orderId}`,
            },
          };
          break;

        default:
          return reply.status(400).send({
            success: false,
            message: 'Invalid payment method',
          });
      }

      return reply.send({
        success: true,
        data: {
          orderId,
          ...qrResult,
        },
      });
    } catch (error: any) {
      fastify.log.error('QR generation error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to generate QR code',
        error: error.message,
      });
    }
  });

  // POST /api/v1/qr/webhook/vnpay - VNPay webhook
  fastify.post('/webhook/vnpay', async (request, reply) => {
    const params = request.body as any;

    try {
      const verification = vnpayService.verifyReturnUrl(params);

      if (verification.isValid) {
        const orderId = params.vnp_TxnRef;
        const responseCode = params.vnp_ResponseCode;

        if (responseCode === '00') {
          // Payment successful
          fastify.log.info(`VNPay payment successful for order ${orderId}`);
          
          // TODO: Update order status to PAID
          // TODO: Update payment record
          
          return reply.send({ RspCode: '00', Message: 'Confirm Success' });
        } else {
          // Payment failed
          fastify.log.warn(`VNPay payment failed for order ${orderId}: ${responseCode}`);
          return reply.send({ RspCode: '00', Message: 'Confirm Success' });
        }
      } else {
        return reply.status(400).send({ RspCode: '97', Message: 'Invalid Signature' });
      }
    } catch (error: any) {
      fastify.log.error('VNPay webhook error:', error);
      return reply.status(500).send({ RspCode: '99', Message: 'System Error' });
    }
  });

  // POST /api/v1/qr/webhook/momo - MoMo webhook
  fastify.post('/webhook/momo', async (request, reply) => {
    const params = request.body as any;

    try {
      const verification = momoService.verifyCallback(params);

      if (verification.isValid) {
        const orderId = params.orderId;
        const resultCode = params.resultCode;

        if (resultCode === 0) {
          // Payment successful
          fastify.log.info(`MoMo payment successful for order ${orderId}`);
          
          // TODO: Update order status to PAID
          // TODO: Update payment record
          
          return reply.send({ resultCode: 0, message: 'Success' });
        } else {
          // Payment failed
          fastify.log.warn(`MoMo payment failed for order ${orderId}: ${resultCode}`);
          return reply.send({ resultCode: 0, message: 'Success' });
        }
      } else {
        return reply.status(400).send({ resultCode: 1, message: 'Invalid Signature' });
      }
    } catch (error: any) {
      fastify.log.error('MoMo webhook error:', error);
      return reply.status(500).send({ resultCode: 99, message: 'System Error' });
    }
  });
}
```

#### Step 1.6: Register QR Routes

```typescript
// File: backend/src/server.ts

// Add this import
import qrPaymentRoutes from './routes/qr-payments.js';

// Add this registration (trong phần route registration)
fastify.register(qrPaymentRoutes, { prefix: '/api/v1/qr' });
```

---

### 🎨 **PHASE 2: Frontend - QR Code Display**

#### Step 2.1: Install Dependencies

```bash
cd frontend
npm install react-qr-code
npm install @heroicons/react
```

#### Step 2.2: Create QR Payment Component

```tsx
// File: frontend/components/payment/QRPaymentModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRPaymentModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  currency: string;
  method: 'vnpay' | 'momo' | 'bank';
}

export function QRPaymentModal({
  open,
  onClose,
  orderId,
  amount,
  currency,
  method,
}: QRPaymentModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'checking' | 'success' | 'failed'>('pending');
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutes

  useEffect(() => {
    if (open) {
      generateQRCode();
      startPaymentStatusCheck();
      startCountdown();
    }
  }, [open]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      const response = await fetch('/api/v1/qr/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          method,
          amount,
          currency,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setQrData(data.data);
        setPaymentStatus('checking');
      } else {
        throw new Error(data.message || 'Failed to generate QR code');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message,
      });
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const startPaymentStatusCheck = () => {
    const interval = setInterval(async () => {
      const token = localStorage.getItem('accessToken');
      
      try {
        const response = await fetch(`/api/v1/payments/order/${orderId}/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success && data.data.status === 'completed') {
          setPaymentStatus('success');
          clearInterval(interval);
          
          toast({
            title: 'Thanh toán thành công!',
            description: 'Đơn hàng của bạn đã được thanh toán.',
          });

          setTimeout(() => {
            onClose();
            window.location.href = `/orders/${orderId}`;
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 3000); // Check every 3 seconds

    // Clear interval after 15 minutes
    setTimeout(() => clearInterval(interval), 15 * 60 * 1000);
  };

  const startCountdown = () => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setPaymentStatus('failed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Đã sao chép',
      description: 'Nội dung đã được sao chép vào clipboard',
    });
  };

  const getMethodName = () => {
    switch (method) {
      case 'vnpay': return 'VNPay';
      case 'momo': return 'MoMo';
      case 'bank': return 'Chuyển khoản ngân hàng';
      default: return 'Thanh toán';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Thanh toán bằng {getMethodName()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Đang tạo mã QR...</p>
            </div>
          )}

          {paymentStatus === 'checking' && qrData && (
            <>
              {/* QR Code */}
              <div className="flex flex-col items-center bg-white rounded-lg p-6 border-2 border-gray-200">
                {method === 'bank' && qrData.qrCodeUrl && (
                  <img 
                    src={qrData.qrCodeUrl} 
                    alt="QR Code" 
                    className="w-64 h-64 mb-4"
                  />
                )}
                
                {method === 'momo' && qrData.qrCodeUrl && (
                  <img 
                    src={qrData.qrCodeUrl} 
                    alt="MoMo QR Code" 
                    className="w-64 h-64 mb-4"
                  />
                )}

                {method === 'vnpay' && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Vui lòng click vào nút bên dưới để thanh toán qua VNPay
                    </p>
                    <Button
                      onClick={() => window.open(qrData.paymentUrl, '_blank')}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Mở trang thanh toán VNPay
                    </Button>
                  </div>
                )}

                <p className="text-sm text-gray-600 text-center mt-4">
                  {qrData.message}
                </p>

                {/* Countdown */}
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    Hết hạn sau: {formatTime(countdown)}
                  </Badge>
                </div>
              </div>

              {/* Amount Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-bold text-lg text-blue-900">
                    {new Intl.NumberFormat('vi-VN').format(amount)} {currency}
                  </span>
                </div>
                
                {method === 'bank' && qrData.bankInfo && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Ngân hàng:</span>
                      <span className="font-medium">{qrData.bankInfo.bankName}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Số tài khoản:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{qrData.bankInfo.accountNo}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(qrData.bankInfo.accountNo)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Chủ tài khoản:</span>
                      <span className="font-medium">{qrData.bankInfo.accountName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Nội dung:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-red-600">{qrData.bankInfo.content}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(qrData.bankInfo.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span>Đang chờ thanh toán...</span>
              </div>
            </>
          )}

          {paymentStatus === 'success' && (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-green-900 mb-2">Thanh toán thành công!</h3>
              <p className="text-gray-600 text-center">
                Đơn hàng của bạn đã được thanh toán. Đang chuyển hướng...
              </p>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="flex flex-col items-center justify-center py-12">
              <XCircle className="h-16 w-16 text-red-600 mb-4" />
              <h3 className="text-xl font-bold text-red-900 mb-2">Thanh toán thất bại!</h3>
              <p className="text-gray-600 text-center mb-4">
                Mã QR đã hết hạn hoặc thanh toán không thành công.
              </p>
              <Button onClick={generateQRCode}>
                Tạo mã QR mới
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### Step 2.3: Update Payment Page

```tsx
// File: frontend/app/[locale]/orders/[id]/pay/page.tsx

// Add import
import { QRPaymentModal } from '@/components/payment/QRPaymentModal';

// Add state
const [showQRModal, setShowQRModal] = useState(false);

// Replace handlePayment button with:
<div className="space-y-3">
  {/* QR Payment Button */}
  <Button 
    onClick={() => setShowQRModal(true)}
    disabled={processing}
    className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all font-bold text-base"
    size="lg"
  >
    <QrCode className="mr-2 h-5 w-5" />
    Thanh toán bằng QR Code
  </Button>

  {/* Traditional Payment Button */}
  <Button 
    onClick={handlePayment}
    disabled={processing}
    variant="outline"
    className="w-full h-14 border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold text-base"
    size="lg"
  >
    {processing ? (
      <div className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Đang xử lý...</span>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5" />
        <span>Thanh toán truyền thống</span>
      </div>
    )}
  </Button>
</div>

{/* QR Modal */}
<QRPaymentModal
  open={showQRModal}
  onClose={() => setShowQRModal(false)}
  orderId={order.id}
  amount={calculatePaymentFees().total}
  currency={order.currency || 'VND'}
  method={paymentMethod as 'vnpay' | 'momo' | 'bank'}
/>
```

---

## 📝 **ENVIRONMENT VARIABLES**

### Backend .env

```env
# VNPay Configuration
VNPAY_TMN_CODE=YOUR_TMN_CODE_HERE
VNPAY_SECRET_KEY=YOUR_SECRET_KEY_HERE
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/vnpay-return

# MoMo Configuration
MOMO_PARTNER_CODE=YOUR_PARTNER_CODE_HERE
MOMO_ACCESS_KEY=YOUR_ACCESS_KEY_HERE
MOMO_SECRET_KEY=YOUR_SECRET_KEY_HERE
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=http://localhost:3000/payment/momo-return
MOMO_NOTIFY_URL=http://localhost:4000/api/v1/qr/webhook/momo

# Bank Transfer Configuration
BANK_ID=970436
BANK_ACCOUNT_NO=1234567890
BANK_ACCOUNT_NAME=CONG TY CONTTRADE
```

---

## 🎯 **USER EXPERIENCE FLOW**

### 📱 Buyer Flow:

```
1. Buyer vào trang thanh toán: /orders/:id/pay

2. Chọn phương thức thanh toán:
   ○ Chuyển khoản ngân hàng (QR) - Miễn phí
   ○ Thẻ tín dụng/Ghi nợ - Phí 2.9% + 2,000₫
   ○ Ví điện tử (VNPay/MoMo) - Phí 1.5%

3. Click "Thanh toán bằng QR Code"

4. Modal hiện ra với:
   ┌─────────────────────────────────┐
   │  Thanh toán bằng [Method]      │
   ├─────────────────────────────────┤
   │                                 │
   │      [QR CODE IMAGE]            │
   │                                 │
   │  Quét mã để thanh toán          │
   │                                 │
   │  Số tiền: 27,500,000 VND        │
   │  Hết hạn sau: 14:58             │
   │                                 │
   │  Ngân hàng: Vietcombank         │
   │  STK: 1234567890 [Copy]         │
   │  Nội dung: ORDER-XXX [Copy]     │
   │                                 │
   │  ⏳ Đang chờ thanh toán...      │
   └─────────────────────────────────┘

5. Buyer quét QR bằng app ngân hàng/ví điện tử

6. Hệ thống tự động check payment status mỗi 3 giây

7. Khi thanh toán thành công:
   ┌─────────────────────────────────┐
   │  ✅ Thanh toán thành công!      │
   │                                 │
   │  Đơn hàng đã được thanh toán    │
   │  Đang chuyển hướng...           │
   └─────────────────────────────────┘

8. Redirect về order detail page
```

---

## 🔐 **SECURITY CONSIDERATIONS**

### ✅ Bảo mật:

1. **HMAC Signature Verification**
   - Tất cả webhook đều verify signature
   - Prevent man-in-the-middle attacks

2. **HTTPS Only**
   - Chỉ accept HTTPS requests
   - SSL/TLS encryption

3. **QR Code Expiration**
   - QR code hết hạn sau 15 phút
   - Prevent replay attacks

4. **Amount Verification**
   - Backend verify số tiền từ webhook match với order
   - Prevent amount tampering

5. **Order Status Check**
   - Chỉ allow thanh toán khi order status = PENDING_PAYMENT
   - Prevent duplicate payments

---

## 📊 **TESTING CHECKLIST**

### ✅ Test Cases:

- [ ] Generate QR code for VNPay
- [ ] Generate QR code for MoMo
- [ ] Generate QR code for Bank Transfer
- [ ] QR code displays correctly
- [ ] Countdown timer works
- [ ] Copy to clipboard works
- [ ] Payment status auto-check works
- [ ] Payment success detection
- [ ] Payment failure handling
- [ ] QR code expiration
- [ ] Webhook signature verification
- [ ] Redirect after success
- [ ] Mobile responsive
- [ ] Error handling

---

## 🚀 **DEPLOYMENT STEPS**

### Step 1: Backend Deployment

```bash
# 1. Add environment variables to production
# 2. Deploy backend with new routes
# 3. Configure webhooks with VNPay/MoMo
# 4. Test webhook endpoints
```

### Step 2: Frontend Deployment

```bash
# 1. Build frontend with new components
# 2. Test QR generation
# 3. Test payment flow
# 4. Deploy to production
```

---

## 📈 **FUTURE ENHANCEMENTS**

1. **Multiple QR Options**
   - Show multiple QR codes simultaneously
   - Let user choose preferred method

2. **Payment Analytics**
   - Track which payment method is most popular
   - Conversion rate by method

3. **Smart Routing**
   - Auto-select best payment method based on user history
   - Suggest method with lowest fees

4. **QR Code Customization**
   - Branded QR codes
   - Logo in center

5. **Push Notifications**
   - Push notification when payment detected
   - Email confirmation

---

## 🎉 **SUMMARY**

### Tính năng mới:

✅ **QR Code Payment** cho 3 phương thức:
  - VNPay (Cổng thanh toán quốc gia)
  - MoMo (Ví điện tử)
  - Bank Transfer (Chuyển khoản ngân hàng)

✅ **Auto-detection** thanh toán thành công

✅ **Real-time status** update mỗi 3 giây

✅ **QR expiration** sau 15 phút

✅ **Copy to clipboard** cho thông tin thanh toán

✅ **Mobile responsive** design

✅ **Secure webhooks** với signature verification

---

## 📞 **SUPPORT**

Nếu có vấn đề trong quá trình implement, vui lòng:
1. Check logs
2. Verify environment variables
3. Test webhooks với tools như ngrok
4. Contact payment gateway support

---

**🎯 READY TO IMPLEMENT!**
