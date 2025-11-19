// @ts-nocheck
/**
 * MOMO PAYMENT GATEWAY INTEGRATION
 * MoMo e-wallet payment integration for Vietnam market
 * Documentation: https://developers.momo.vn/
 */

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

class MoMoService {
  private config: MoMoConfig;

  constructor() {
    // Load from environment variables
    this.config = {
      partnerCode: process.env.MOMO_PARTNER_CODE || '',
      accessKey: process.env.MOMO_ACCESS_KEY || '',
      secretKey: process.env.MOMO_SECRET_KEY || '',
      endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
      returnUrl: process.env.MOMO_RETURN_URL || 'http://localhost:3000/payment/momo-return',
      notifyUrl: process.env.MOMO_NOTIFY_URL || 'http://localhost:4000/api/v1/qr/webhook/momo',
    };

    if (!this.config.partnerCode || !this.config.secretKey) {
      console.warn('⚠️ MoMo credentials not configured. Set MOMO_PARTNER_CODE and MOMO_SECRET_KEY in .env');
    }
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
    try {
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

      console.log('📱 Calling MoMo API for order:', params.orderId);

      // Call MoMo API
      const response = await axios.post(this.config.endpoint, requestBody);

      if (response.data.resultCode === 0) {
        console.log('✅ MoMo payment QR created:', params.orderId);
        return {
          qrCodeUrl: response.data.qrCodeUrl,
          deeplink: response.data.deeplink,
          payUrl: response.data.payUrl,
        };
      } else {
        console.error('❌ MoMo API error:', response.data);
        throw new Error(response.data.message || 'MoMo payment failed');
      }
    } catch (error: any) {
      console.error('❌ MoMo payment creation failed:', error);
      throw new Error(`MoMo API error: ${error.message}`);
    }
  }

  /**
   * Verify MoMo callback signature
   */
  verifyCallback(params: any): { isValid: boolean; message?: string } {
    try {
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
        console.log('✅ MoMo signature verified');
        return { isValid: true };
      } else {
        console.error('❌ MoMo signature mismatch');
        return { isValid: false, message: 'Invalid signature' };
      }
    } catch (error: any) {
      console.error('❌ MoMo signature verification failed:', error);
      return { isValid: false, message: 'Verification error' };
    }
  }

  /**
   * Process MoMo IPN (Instant Payment Notification)
   */
  processIPN(params: any): {
    success: boolean;
    orderId?: string;
    amount?: number;
    transactionStatus?: string;
    message?: string;
  } {
    try {
      const verification = this.verifyCallback(params);

      if (!verification.isValid) {
        return { success: false, message: verification.message };
      }

      const orderId = params.orderId;
      const amount = params.amount;
      const resultCode = params.resultCode;

      // Check transaction status
      if (resultCode === 0) {
        console.log('✅ MoMo payment successful:', { orderId, amount });
        return {
          success: true,
          orderId,
          amount,
          transactionStatus: 'success',
        };
      } else {
        console.log('⚠️ MoMo payment failed:', { orderId, resultCode });
        return {
          success: false,
          orderId,
          amount,
          transactionStatus: 'failed',
          message: this.getResultCodeMessage(resultCode),
        };
      }
    } catch (error: any) {
      console.error('❌ MoMo IPN processing failed:', error);
      return { success: false, message: 'IPN processing error' };
    }
  }

  /**
   * Query transaction status from MoMo
   */
  async queryTransaction(params: {
    orderId: string;
    requestId: string;
  }): Promise<any> {
    try {
      const rawSignature = `accessKey=${this.config.accessKey}&orderId=${params.orderId}&partnerCode=${this.config.partnerCode}&requestId=${params.requestId}`;

      const signature = crypto
        .createHmac('sha256', this.config.secretKey)
        .update(rawSignature)
        .digest('hex');

      const requestBody = {
        partnerCode: this.config.partnerCode,
        accessKey: this.config.accessKey,
        requestId: params.requestId,
        orderId: params.orderId,
        signature,
        lang: 'vi',
      };

      console.log('🔍 Querying MoMo transaction:', params.orderId);

      const response = await axios.post(
        'https://test-payment.momo.vn/v2/gateway/api/query',
        requestBody
      );

      return {
        success: response.data.resultCode === 0,
        data: response.data,
      };
    } catch (error: any) {
      console.error('❌ MoMo transaction query failed:', error);
      throw new Error('Failed to query transaction');
    }
  }

  /**
   * Helper: Get human-readable message for MoMo result code
   */
  private getResultCodeMessage(code: number): string {
    const messages: Record<number, string> = {
      0: 'Giao dịch thành công',
      9000: 'Giao dịch đã được xác nhận thành công',
      1000: 'Giao dịch đã được khởi tạo, chờ người dùng xác nhận thanh toán',
      1001: 'Giao dịch thất bại do người dùng từ chối xác nhận thanh toán',
      1002: 'Giao dịch thất bại do Link thanh toán đã hết hạn',
      1003: 'Giao dịch bị từ chối bởi người dùng',
      1004: 'Giao dịch thất bại do số dư tài khoản không đủ',
      1005: 'Giao dịch thất bại do url hoặc QR code đã hết hạn',
      1006: 'Giao dịch thất bại do người dùng từ chối xác nhận thanh toán',
      1007: 'Giao dịch bị từ chối vì tài khoản người dùng đang bị tạm khóa',
      1026: 'Giao dịch bị hạn chế theo thể lệ chương trình khuyến mãi',
      1080: 'Giao dịch hoàn tiền bị từ chối',
      1081: 'Giao dịch hoàn tiền thất bại',
      2001: 'Giao dịch thất bại do sai thông tin',
      2007: 'Giao dịch thất bại do không thực hiện trong thời gian quy định',
      3001: 'Liên kết thanh toán không tồn tại',
      3002: 'Liên kết thanh toán không hợp lệ',
      3003: 'Liên kết thanh toán đã được xử lý',
      3004: 'Link thanh toán hết hạn',
      4001: 'Giao dịch bị từ chối do vi phạm quy định của MoMo',
      4010: 'Đơn hàng không tồn tại',
      4011: 'Số tiền thanh toán không hợp lệ',
      4100: 'Giao dịch bị hủy do không hoàn thành trong thời gian quy định',
      10: 'Hệ thống đang được bảo trì',
      11: 'Giao dịch bị từ chối vì truy cập ngoài thời gian quy định',
      12: 'Hệ thống đang được bảo trì',
      13: 'Yêu cầu bị từ chối vì IP không được phép truy cập',
      20: 'Số dư không đủ để thanh toán',
      21: 'Số tiền không hợp lệ',
      40: 'RequestId bị trùng',
      41: 'OrderId bị trùng',
      42: 'OrderId không hợp lệ hoặc không được tìm thấy',
      43: 'Yêu cầu bị từ chối vì dịch vụ thanh toán đang được bảo trì',
      1000000: 'Lỗi không xác định',
    };

    return messages[code] || 'Lỗi không xác định';
  }

  /**
   * Check if MoMo is configured
   */
  isConfigured(): boolean {
    return !!(this.config.partnerCode && this.config.secretKey);
  }
}

// Export singleton
const momoService = new MoMoService();
export default momoService;
export { MoMoService };

console.log('📱 MoMo Service Loaded');
console.log('🔧 Configured:', momoService.isConfigured() ? 'Yes' : 'No - Set environment variables');
