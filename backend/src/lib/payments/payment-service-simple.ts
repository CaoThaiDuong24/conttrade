// @ts-nocheck
import prisma from '../prisma.js';

export class PaymentService {
  async processEscrowPayment(orderId: string, method: string, amount?: number) {
    try {
      // Simple implementation without complex validation
      const result = await prisma.$transaction(async (tx) => {
        // Get order to extract amount if not provided
        const order = await tx.orders.findUnique({
          where: { id: orderId }
        });
        
        if (!order) {
          throw new Error('Order not found');
        }

        const paymentAmount = amount || parseFloat(order.total);

        // Update order status to PAYMENT_PENDING_VERIFICATION (waiting for seller to confirm)
        const updatedOrder = await tx.orders.update({
          where: { id: orderId },
          data: { status: 'PAYMENT_PENDING_VERIFICATION' }
        });

        // Create payment record with generated ID
        const paymentId = `PAY-${Date.now()}-${orderId.slice(-4)}`;
        const payment = await tx.payments.create({
          data: {
            id: paymentId,
            order_id: orderId,
            amount: paymentAmount,
            currency: order.currency || 'USD',
            provider: method === 'bank_transfer' ? 'BANK_TRANSFER' : 'VNPAY',
            method: method === 'bank_transfer' ? 'BANK_TRANSFER' : 'CARD',
            status: 'PENDING', // Pending until seller verifies
            paid_at: new Date(),
            updated_at: new Date()
          }
        });

        return { order: updatedOrder, payment };
      });

      return {
        success: true,
        paymentId: result.payment.id,
        status: 'payment_pending_verification',
        message: 'Payment submitted successfully. Waiting for seller verification.'
      };

    } catch (error: any) {
      console.error('Payment error:', error);
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        message: error.message || 'Payment processing failed'
      };
    }
  }

  async releaseEscrowPayment(orderId: string) {
    try {
      const order = await prisma.orders.findUnique({
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

      const updatedPayment = await prisma.payments.update({
        where: { id: escrowPayment.id },
        data: { status: 'released' }
      });

      return {
        success: true,
        paymentId: updatedPayment.id,
        status: 'released',
        message: 'Escrow payment released successfully'
      };

    } catch (error: any) {
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        message: error.message || 'Escrow release failed'
      };
    }
  }

  async refundEscrowPayment(orderId: string, reason?: string) {
    try {
      const order = await prisma.orders.findUnique({
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

      const updatedPayment = await prisma.payments.update({
        where: { id: escrowPayment.id },
        data: { status: 'refunded' }
      });

      return {
        success: true,
        paymentId: updatedPayment.id,
        status: 'refunded',
        message: 'Escrow payment refunded successfully'
      };

    } catch (error: any) {
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        message: error.message || 'Escrow refund failed'
      };
    }
  }

  async getPaymentStatus(orderId: string) {
    try {
      const payments = await prisma.payments.findMany({
        where: { orderId },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        data: payments
      };

    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to get payment status'
      };
    }
  }
}

export const paymentService = new PaymentService();