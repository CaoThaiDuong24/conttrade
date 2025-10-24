// @ts-nocheck
import prisma from '../prisma';

export interface PaymentRequest {
  orderId: string;
  method: string;
  amount: number;
  currency: string;
  paymentData?: any;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  status: string;
  message: string;
}

export class PaymentService {
  /**
   * Process escrow payment for order
   */
  async processEscrowPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // 1. Validate order exists and is in correct state
      const order = await prisma.order.findUnique({
        where: { id: request.orderId },
        include: { payments: true }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status !== 'pending_payment') {
        throw new Error(`Cannot pay for order with status: ${order.status}`);
      }

      // 2. Calculate total with fees
      const baseAmount = request.amount;
      const processingFee = this.calculateProcessingFee(request.method, baseAmount);
      const totalAmount = baseAmount + processingFee;

      // 3. Use database transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update order status
        const updatedOrder = await tx.order.update({
          where: { id: request.orderId },
          data: { 
            status: 'paid',
            updatedAt: new Date()
          }
        });

        // Create payment record
        const payment = await tx.Payment.create({
          data: {
            orderId: request.orderId,
            provider: this.getPaymentProvider(request.method),
            method: request.method,
            status: 'escrow_funded',
            paidAt: new Date(),
            escrowAccountRef: `ESC-${Date.now()}-${request.orderId.slice(-4)}`
          }
        });

        return { order: updatedOrder, payment };
      });

      return {
        success: true,
        paymentId: result.payment.id,
        status: 'escrow_funded',
        message: 'Payment successful. Funds held in escrow.'
      };

    } catch (error: any) {
      console.error('Error processing escrow payment:', error);
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        message: error.message || 'Payment processing failed'
      };
    }
  }

  /**
   * Release escrow payment when order is completed
   */
  async releaseEscrowPayment(orderId: string): Promise<PaymentResult> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { payments: true }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const escrowPayment = order.payments.find(p => p.status === 'escrow_funded');
      if (!escrowPayment) {
        throw new Error('No escrow payment found');
      }

      // Update payment status to released
      const updatedPayment = await prisma.payment.update({
        where: { id: escrowPayment.id },
        data: { 
          status: 'released',
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        paymentId: updatedPayment.id,
        status: 'released',
        message: 'Escrow payment released successfully'
      };

    } catch (error: any) {
      console.error('Error releasing escrow payment:', error);
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        message: error.message || 'Escrow release failed'
      };
    }
  }

  /**
   * Refund escrow payment when order is cancelled
   */
  async refundEscrowPayment(orderId: string, reason?: string): Promise<PaymentResult> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { payments: true }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const escrowPayment = order.payments.find(p => p.status === 'escrow_funded');
      if (!escrowPayment) {
        throw new Error('No escrow payment found');
      }

      // Update payment status to refunded
      const updatedPayment = await prisma.payment.update({
        where: { id: escrowPayment.id },
        data: { 
          status: 'refunded',
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        paymentId: updatedPayment.id,
        status: 'refunded',
        message: 'Escrow payment refunded successfully'
      };

    } catch (error: any) {
      console.error('Error refunding escrow payment:', error);
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        message: error.message || 'Escrow refund failed'
      };
    }
  }

  /**
   * Get payment status for order
   */
  async getPaymentStatus(orderId: string) {
    try {
      const payments = await prisma.payment.findMany({
        where: { orderId },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        data: payments
      };

    } catch (error: any) {
      console.error('Error getting payment status:', error);
      return {
        success: false,
        message: error.message || 'Failed to get payment status'
      };
    }
  }

  /**
   * Calculate processing fee based on payment method
   */
  private calculateProcessingFee(method: string, amount: number): number {
    switch (method) {
      case 'credit_card':
        return Math.round(amount * 0.029) + 2000; // 2.9% + 2,000₫
      case 'wallet':
        return Math.round(amount * 0.015); // 1.5%
      case 'bank':
      default:
        return 0; // Free bank transfer
    }
  }

  /**
   * Get payment provider based on method
   */
  private getPaymentProvider(method: string): string {
    switch (method) {
      case 'credit_card':
        return 'vnpay'; // or stripe, etc.
      case 'wallet':
        return 'momo'; // or zalopay, etc.
      case 'bank':
      default:
        return 'bank_transfer';
    }
  }

  /**
   * Validate payment data
   */
  validatePaymentData(method: string, paymentData: any): boolean {
    switch (method) {
      case 'bank':
        return !!(paymentData?.bankAccount && paymentData?.bankName && paymentData?.accountHolder);
      case 'credit_card':
        return !!(paymentData?.cardNumber && paymentData?.cardHolder && paymentData?.expiryDate && paymentData?.cvv);
      case 'wallet':
        return !!(paymentData?.phoneNumber);
      default:
        return false;
    }
  }
}

export const paymentService = new PaymentService();