// @ts-nocheck
/**
 * VNPAY PAYMENT GATEWAY INTEGRATION
 * Official VNPay API integration for Vietnam market
 * Documentation: https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/
 */

import crypto from 'crypto';
import querystring from 'querystring';

interface VNPayConfig {
  tmnCode: string;
  hashSecret: string;
  url: string;
  returnUrl: string;
  ipnUrl: string;
}

class VNPayService {
  private config: VNPayConfig;

  constructor() {
    // Load from environment variables
    this.config = {
      tmnCode: process.env.VNPAY_TMN_CODE || '',
      hashSecret: process.env.VNPAY_HASH_SECRET || '',
      url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      returnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/api/payments/vnpay/return',
      ipnUrl: process.env.VNPAY_IPN_URL || 'http://localhost:3000/api/payments/vnpay/ipn'
    };

    if (!this.config.tmnCode || !this.config.hashSecret) {
      console.warn('⚠️ VNPay credentials not configured. Set VNPAY_TMN_CODE and VNPAY_HASH_SECRET in .env');
    }
  }

  /**
   * Create payment URL for VNPay
   */
  createPaymentUrl(params: {
    orderId: string;
    amount: number;
    orderInfo: string;
    orderType?: string;
    locale?: string;
    bankCode?: string;
    ipAddr: string;
  }): string {
    try {
      const createDate = this.formatDate(new Date());
      const expireDate = this.formatDate(new Date(Date.now() + 15 * 60 * 1000)); // 15 minutes

      // Build VNPay params
      const vnpParams: any = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: this.config.tmnCode,
        vnp_Locale: params.locale || 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: params.orderId,
        vnp_OrderInfo: params.orderInfo,
        vnp_OrderType: params.orderType || 'other',
        vnp_Amount: params.amount * 100, // VNPay requires amount in smallest unit (VND * 100)
        vnp_ReturnUrl: this.config.returnUrl,
        vnp_IpAddr: params.ipAddr,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate
      };

      // Add bank code if specified
      if (params.bankCode) {
        vnpParams.vnp_BankCode = params.bankCode;
      }

      // Sort params and create signature
      const sortedParams = this.sortObject(vnpParams);
      const signData = querystring.stringify(sortedParams, { encode: false });
      const hmac = crypto.createHmac('sha512', this.config.hashSecret);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
      sortedParams.vnp_SecureHash = signed;

      // Build payment URL
      const paymentUrl = this.config.url + '?' + querystring.stringify(sortedParams, { encode: false });

      console.log('✅ VNPay payment URL created:', { orderId: params.orderId, amount: params.amount });
      
      return paymentUrl;
    } catch (error) {
      console.error('❌ VNPay payment URL creation failed:', error);
      throw new Error('Failed to create VNPay payment URL');
    }
  }

  /**
   * Verify VNPay callback signature
   */
  verifyReturnUrl(vnpParams: any): { isValid: boolean; message?: string } {
    try {
      const secureHash = vnpParams.vnp_SecureHash;
      delete vnpParams.vnp_SecureHash;
      delete vnpParams.vnp_SecureHashType;

      const sortedParams = this.sortObject(vnpParams);
      const signData = querystring.stringify(sortedParams, { encode: false });
      const hmac = crypto.createHmac('sha512', this.config.hashSecret);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

      if (secureHash === signed) {
        return { isValid: true };
      } else {
        return { isValid: false, message: 'Invalid signature' };
      }
    } catch (error) {
      console.error('❌ VNPay signature verification failed:', error);
      return { isValid: false, message: 'Verification error' };
    }
  }

  /**
   * Process VNPay IPN (Instant Payment Notification)
   */
  processIPN(vnpParams: any): { 
    success: boolean; 
    orderId?: string; 
    amount?: number;
    transactionStatus?: string;
    message?: string;
  } {
    try {
      const verification = this.verifyReturnUrl(vnpParams);
      
      if (!verification.isValid) {
        return { success: false, message: verification.message };
      }

      const orderId = vnpParams.vnp_TxnRef;
      const amount = parseInt(vnpParams.vnp_Amount) / 100; // Convert back from smallest unit
      const transactionStatus = vnpParams.vnp_TransactionStatus;
      const responseCode = vnpParams.vnp_ResponseCode;

      // Check transaction status
      if (responseCode === '00' && transactionStatus === '00') {
        console.log('✅ VNPay payment successful:', { orderId, amount });
        return {
          success: true,
          orderId,
          amount,
          transactionStatus: 'success'
        };
      } else {
        console.log('⚠️ VNPay payment failed:', { orderId, responseCode });
        return {
          success: false,
          orderId,
          amount,
          transactionStatus: 'failed',
          message: this.getResponseCodeMessage(responseCode)
        };
      }
    } catch (error) {
      console.error('❌ VNPay IPN processing failed:', error);
      return { success: false, message: 'IPN processing error' };
    }
  }

  /**
   * Query transaction status from VNPay
   */
  async queryTransaction(params: {
    orderId: string;
    transactionDate: string;
    ipAddr: string;
  }): Promise<any> {
    try {
      const createDate = this.formatDate(new Date());

      const vnpParams: any = {
        vnp_Version: '2.1.0',
        vnp_Command: 'querydr',
        vnp_TmnCode: this.config.tmnCode,
        vnp_TxnRef: params.orderId,
        vnp_OrderInfo: `Query transaction ${params.orderId}`,
        vnp_TransactionDate: params.transactionDate,
        vnp_CreateDate: createDate,
        vnp_IpAddr: params.ipAddr
      };

      // Create signature
      const sortedParams = this.sortObject(vnpParams);
      const signData = querystring.stringify(sortedParams, { encode: false });
      const hmac = crypto.createHmac('sha512', this.config.hashSecret);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
      sortedParams.vnp_SecureHash = signed;

      // In production, send request to VNPay API
      console.log('🔍 Querying VNPay transaction:', params.orderId);
      
      // TODO: Implement actual API call to VNPay
      // const response = await axios.post(this.config.queryUrl, sortedParams);
      
      return {
        success: true,
        message: 'Query transaction endpoint ready. Implement API call in production.'
      };
    } catch (error) {
      console.error('❌ VNPay transaction query failed:', error);
      throw new Error('Failed to query transaction');
    }
  }

  /**
   * Refund transaction
   */
  async refundTransaction(params: {
    orderId: string;
    amount: number;
    transactionDate: string;
    createBy: string;
    ipAddr: string;
  }): Promise<any> {
    try {
      const createDate = this.formatDate(new Date());
      const transactionType = '02'; // Full refund

      const vnpParams: any = {
        vnp_Version: '2.1.0',
        vnp_Command: 'refund',
        vnp_TmnCode: this.config.tmnCode,
        vnp_TxnRef: params.orderId,
        vnp_Amount: params.amount * 100,
        vnp_OrderInfo: `Refund for order ${params.orderId}`,
        vnp_TransactionType: transactionType,
        vnp_TransactionDate: params.transactionDate,
        vnp_CreateBy: params.createBy,
        vnp_CreateDate: createDate,
        vnp_IpAddr: params.ipAddr
      };

      // Create signature
      const sortedParams = this.sortObject(vnpParams);
      const signData = querystring.stringify(sortedParams, { encode: false });
      const hmac = crypto.createHmac('sha512', this.config.hashSecret);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
      sortedParams.vnp_SecureHash = signed;

      console.log('💰 Processing VNPay refund:', params.orderId);
      
      // TODO: Implement actual API call to VNPay
      // const response = await axios.post(this.config.refundUrl, sortedParams);
      
      return {
        success: true,
        message: 'Refund endpoint ready. Implement API call in production.'
      };
    } catch (error) {
      console.error('❌ VNPay refund failed:', error);
      throw new Error('Failed to process refund');
    }
  }

  /**
   * Helper: Format date for VNPay (yyyyMMddHHmmss)
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return year + month + day + hours + minutes + seconds;
  }

  /**
   * Helper: Sort object keys alphabetically
   */
  private sortObject(obj: any): any {
    const sorted: any = {};
    const keys = Object.keys(obj).sort();
    
    keys.forEach(key => {
      sorted[key] = obj[key];
    });
    
    return sorted;
  }

  /**
   * Helper: Get human-readable message for VNPay response code
   */
  private getResponseCodeMessage(code: string): string {
    const messages: { [key: string]: string } = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
      '99': 'Các lỗi khác'
    };
    
    return messages[code] || 'Lỗi không xác định';
  }

  /**
   * Check if VNPay is configured
   */
  isConfigured(): boolean {
    return !!(this.config.tmnCode && this.config.hashSecret);
  }
}

// Export singleton
const vnpayService = new VNPayService();
export default vnpayService;
export { VNPayService };

console.log('💳 VNPay Service Loaded');
console.log('🔧 Configured:', vnpayService.isConfigured() ? 'Yes' : 'No - Set environment variables');
