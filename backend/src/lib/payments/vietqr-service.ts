// @ts-nocheck
/**
 * VIETQR PAYMENT SERVICE
 * Generate QR codes for bank transfer payments using VietQR standard
 * Documentation: https://www.vietqr.io/
 */

import QRCode from 'qrcode';

interface VietQRConfig {
  bankId: string;        // Bank ID (e.g., '970436' for Vietcombank)
  accountNo: string;     // Account number
  accountName: string;   // Account name
  template: string;      // Template (e.g., 'compact', 'qr_only')
}

class VietQRService {
  private config: VietQRConfig;

  constructor() {
    // Load from environment variables
    this.config = {
      bankId: process.env.BANK_ID || '970436', // Default: Vietcombank
      accountNo: process.env.BANK_ACCOUNT_NO || '',
      accountName: process.env.BANK_ACCOUNT_NAME || 'CONG TY CONTTRADE',
      template: 'compact',
    };

    if (!this.config.accountNo) {
      console.warn('⚠️ Bank account not configured. Set BANK_ACCOUNT_NO in .env');
    }
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
    bankInfo: {
      bankId: string;
      bankName: string;
      accountNo: string;
      accountName: string;
      amount: number;
      content: string;
    };
  }> {
    try {
      // Use VietQR.io API to generate QR image
      const vietQRImageUrl = `https://img.vietqr.io/image/${this.config.bankId}-${this.config.accountNo}-${this.config.template}.png?amount=${params.amount}&addInfo=${encodeURIComponent(params.description)}&accountName=${encodeURIComponent(this.config.accountName)}`;

      // Also generate local QR code as backup
      const qrData = `${this.config.bankId}|${this.config.accountNo}|${params.amount}|${params.description}`;
      const localQRDataUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 300,
        margin: 1,
      });

      console.log('✅ VietQR code generated:', { 
        amount: params.amount, 
        description: params.description 
      });

      return {
        qrCodeUrl: vietQRImageUrl,  // Use VietQR.io generated image
        qrCodeData: qrData,
        bankInfo: {
          bankId: this.config.bankId,
          bankName: this.getBankName(this.config.bankId),
          accountNo: this.config.accountNo,
          accountName: this.config.accountName,
          amount: params.amount,
          content: params.description,
        },
      };
    } catch (error: any) {
      console.error('❌ VietQR generation error:', error);
      throw new Error(`VietQR generation error: ${error.message}`);
    }
  }

  /**
   * Get bank name from bank ID
   */
  private getBankName(bankId: string): string {
    const banks: Record<string, string> = {
      '970436': 'Vietcombank (VCB)',
      '970415': 'VietinBank (CTG)',
      '970422': 'MB Bank (MB)',
      '970418': 'BIDV',
      '970405': 'Agribank',
      '970407': 'Techcombank (TCB)',
      '970403': 'Sacombank (STB)',
      '970432': 'VPBank',
      '970423': 'TPBank',
      '970416': 'ACB',
      '970448': 'OCB',
      '970414': 'Oceanbank',
      '970431': 'Eximbank',
      '970426': 'MSB',
      '970412': 'PVcomBank',
      '970427': 'VIB',
      '970441': 'VietCapitalBank',
      '970454': 'VietBank',
      '970429': 'SCB',
      '970443': 'SHB',
      '970439': 'PublicBank',
      '970410': 'StandardChartered',
      '970425': 'ABBank',
      '970406': 'DongA Bank',
      '970408': 'GPBank',
      '970437': 'HDBank',
      '970438': 'BaoVietBank',
      '970440': 'SeABank',
      '970434': 'IndovinaBank',
      '970428': 'NamABank',
      '970430': 'PGBank',
      '970433': 'VietABank',
      '970419': 'NCB',
      '970458': 'UnitedOverseas',
      '970421': 'VRB',
      '546034': 'CAKE by VPBank',
      '546035': 'Ubank by VPBank',
      '963388': 'Timo',
    };
    
    return banks[bankId] || 'Unknown Bank';
  }

  /**
   * Check if VietQR is configured
   */
  isConfigured(): boolean {
    return !!(this.config.accountNo && this.config.bankId);
  }
}

// Export singleton
const vietQRService = new VietQRService();
export default vietQRService;
export { VietQRService };

console.log('🏦 VietQR Service Loaded');
console.log('🔧 Configured:', vietQRService.isConfigured() ? 'Yes' : 'No - Set BANK_ACCOUNT_NO in .env');
