// @ts-nocheck
import prisma from '../prisma.js';

export class PaymentService {
  async processEscrowPayment(orderId: string, method: string, amount?: number) {
    try {
      // Simple implementation without complex validation
      const result = await prisma.$transaction(async (tx) => {
        // Get order to extract amount if not provided
        const order = await tx.orders.findUnique({
          where: { id: orderId },
          include: {
            order_items: true,
            listings: true
          }
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

        // ✅ FIX #10: If RENTAL order, create rental_payments breakdown
        if (order.deal_type === 'RENTAL') {
          console.log(`💰 Creating rental payment breakdown for order ${orderId}`);
          
          // Get rental contract (may not exist yet, will be created after payment)
          const rentalContract = await tx.rental_contracts.findFirst({
            where: { order_id: orderId }
          });

          if (rentalContract) {
            const listing = order.listings;
            const depositAmount = listing?.deposit_required 
              ? Number(listing.deposit_amount || 0) 
              : 0;
            const rentalPrice = Number(listing?.price_amount || 0);
            const months = order.rental_duration_months || 1;

            // Create DEPOSIT payment if required
            if (depositAmount > 0) {
              await tx.rental_payments.create({
                data: {
                  rental_contract_id: rentalContract.id,
                  amount: depositAmount,
                  currency: order.currency || 'VND',
                  payment_type: 'DEPOSIT',
                  payment_method: method === 'bank_transfer' ? 'BANK_TRANSFER' : 'VNPAY',
                  status: 'PENDING',
                  transaction_id: paymentId,
                  payment_reference: `DEPOSIT-${orderId.slice(-8)}`,
                  notes: 'Deposit payment for rental contract'
                }
              });
            }

            // Create RENTAL_FEE payments for each month
            for (let month = 1; month <= months; month++) {
              const dueDate = new Date(rentalContract.start_date);
              dueDate.setMonth(dueDate.getMonth() + month - 1);

              await tx.rental_payments.create({
                data: {
                  rental_contract_id: rentalContract.id,
                  amount: rentalPrice,
                  currency: order.currency || 'VND',
                  payment_type: 'RENTAL_FEE',
                  payment_method: method === 'bank_transfer' ? 'BANK_TRANSFER' : 'VNPAY',
                  status: month === 1 ? 'PENDING' : 'PENDING', // First month pending, rest scheduled
                  due_date: dueDate,
                  transaction_id: month === 1 ? paymentId : undefined,
                  payment_reference: `RENT-M${month}-${orderId.slice(-8)}`,
                  invoice_number: `INV-RENT-${rentalContract.contract_number}-M${month}`,
                  notes: `Monthly rental fee - Month ${month}/${months}`
                }
              });
            }

            console.log(`✅ Created rental payment schedule: ${depositAmount > 0 ? '1 deposit + ' : ''}${months} monthly payments`);
          } else {
            console.warn(`⚠️ Rental contract not found for order ${orderId}, will create payments after contract creation`);
          }
        }

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

      const escrowPayment = order.payments.find(p => p.status === 'escrow_funded' || p.status === 'PENDING');
      if (!escrowPayment) {
        throw new Error('No payment found to refund');
      }

      const updatedPayment = await prisma.payments.update({
        where: { id: escrowPayment.id },
        data: { 
          status: 'REFUNDED',
          notes: reason || 'Payment refunded'
        }
      });

      // Update order status
      await prisma.orders.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' }
      });

      return {
        success: true,
        paymentId: updatedPayment.id,
        status: 'refunded',
        message: 'Payment refunded successfully'
      };

    } catch (error: any) {
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        message: error.message || 'Refund failed'
      };
    }
  }

  // ✅ FIX #13: Handle payment failure
  async handlePaymentFailure(orderId: string, errorCode: string, errorMessage: string) {
    try {
      await prisma.$transaction(async (tx) => {
        // Find payment for this order
        const payment = await tx.payments.findFirst({
          where: { order_id: orderId },
          orderBy: { created_at: 'desc' }
        });

        if (payment) {
          // Update payment status to FAILED
          await tx.payments.update({
            where: { id: payment.id },
            data: {
              status: 'FAILED',
              notes: `Failed: ${errorCode} - ${errorMessage}`,
              updated_at: new Date()
            }
          });
        }

        // Update order status
        await tx.orders.update({
          where: { id: orderId },
          data: { 
            status: 'PAYMENT_FAILED',
            notes: `Payment failed: ${errorMessage}`
          }
        });

        // Release reserved inventory
        const order = await tx.orders.findUnique({
          where: { id: orderId },
          include: { listings: true }
        });

        if (order?.listing_id) {
          const { InventoryService } = await import('../inventory/inventory-service');
          const inventoryService = new InventoryService(tx as any);
          await inventoryService.releaseReservation(orderId);
        }
      });

      // Send notification to buyer
      const order = await prisma.orders.findUnique({
        where: { id: orderId },
        select: { buyer_id: true, order_number: true, total: true, currency: true }
      });

      if (order) {
        try {
          const { NotificationService } = await import('../notifications/notification-service');
          await NotificationService.createNotification({
            userId: order.buyer_id,
            type: 'payment_failed',
            title: 'Thanh toán thất bại',
            message: `Thanh toán cho đơn hàng #${order.order_number} thất bại. Lý do: ${errorMessage}. Bạn có thể thử lại.`,
            data: {
              orderId,
              errorCode,
              errorMessage,
              actionUrl: `/buy/orders/${orderId}/retry-payment`
            }
          });
        } catch (notifError) {
          console.error('Failed to send payment failure notification:', notifError);
        }
      }

      // Schedule auto-cancel after 24 hours if no retry
      // TODO: Implement cron job for auto-cancel

      return {
        success: true,
        message: 'Payment failure handled'
      };
    } catch (error: any) {
      console.error('Error handling payment failure:', error);
      return {
        success: false,
        message: error.message || 'Failed to handle payment failure'
      };
    }
  }

  // ✅ FIX #13: Retry failed payment
  async retryPayment(orderId: string, method: string) {
    try {
      const order = await prisma.orders.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status !== 'PAYMENT_FAILED' && order.status !== 'PENDING_PAYMENT') {
        throw new Error(`Cannot retry payment for order with status: ${order.status}`);
      }

      // Create new payment attempt
      return await this.processEscrowPayment(orderId, method);
    } catch (error: any) {
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        message: error.message || 'Payment retry failed'
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