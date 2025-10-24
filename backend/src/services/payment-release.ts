// @ts-nocheck
/**
 * PAYMENT RELEASE SERVICE
 * Logic để release payment cho seller sau khi order completed
 */

import prisma from '../lib/prisma.js';
import { NotificationService } from '../lib/notifications/notification-service.js';

/**
 * Release payment to seller when order is completed
 * @param orderId - ID của order
 * @returns Payment release result
 */
export async function releasePaymentToSeller(orderId: string) {
  try {
    console.log(`💰 [Payment Release] Processing payment release for order: ${orderId}`);

    // Get order với payment info
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            display_name: true,
            full_name: true
          }
        },
        buyer: {
          select: {
            id: true,
            email: true,
            display_name: true
          }
        }
      }
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Verify order status
    if (order.status !== 'COMPLETED') {
      throw new Error(`Order must be COMPLETED to release payment. Current status: ${order.status}`);
    }

    // Check if payment already released
    if (order.payment_released_at) {
      console.log(`⚠️ Payment already released for order ${orderId} at ${order.payment_released_at}`);
      return {
        success: true,
        message: 'Payment already released',
        alreadyReleased: true
      };
    }

    // Update order: mark payment as released
    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: {
        payment_released_at: new Date(),
        payment_released_to: order.seller_id,
        payment_release_amount: order.total,
        payment_release_status: 'RELEASED'
      }
    });

    // Add timeline entry
    await prisma.order_timeline.create({
      data: {
        order_id: orderId,
        status: 'PAYMENT_RELEASED',
        actor_user_id: null, // System action
        notes: `Payment of ${order.currency} ${order.total} released to seller`,
        metadata: {
          amount: order.total,
          currency: order.currency,
          released_at: new Date().toISOString(),
          seller_id: order.seller_id
        }
      }
    });

    // TODO: Integrate với payment gateway để thực hiện transfer thật
    // - Nếu dùng escrow: Release funds từ escrow account
    // - Nếu dùng bank transfer: Gửi lệnh chuyển tiền
    // - Nếu dùng e-wallet: Transfer từ platform wallet đến seller wallet
    // Example: await paymentGateway.releaseFunds(orderId, order.seller_id, order.total);

    // Send notification to seller
    if (order.seller?.id) {
      await NotificationService.createNotification({
        userId: order.seller.id,
        type: 'payment_released',
        title: '💰 Thanh toán đã được giải ngân',
        message: `Thanh toán ${new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: order.currency || 'VND'
        }).format(parseFloat(order.total))} cho đơn hàng ${order.order_number || order.id.slice(-8).toUpperCase()} đã được chuyển vào tài khoản của bạn.`,
        relatedId: orderId,
        relatedType: 'order',
        priority: 'high',
        actionUrl: `/orders/${orderId}`,
        metadata: {
          orderId: orderId,
          orderNumber: order.order_number,
          amount: order.total,
          currency: order.currency,
          releasedAt: new Date().toISOString()
        }
      });
    }

    console.log(`✅ [Payment Release] Successfully released ${order.currency} ${order.total} to seller ${order.seller_id}`);

    return {
      success: true,
      message: 'Payment released successfully',
      orderId: orderId,
      amount: order.total,
      currency: order.currency,
      sellerId: order.seller_id,
      releasedAt: updatedOrder.payment_released_at
    };

  } catch (error) {
    console.error(`❌ [Payment Release] Error releasing payment for order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Refund payment to buyer (for disputes)
 * @param orderId - ID của order
 * @param amount - Số tiền refund (null = full refund)
 * @param reason - Lý do refund
 * @returns Refund result
 */
export async function refundPaymentToBuyer(
  orderId: string,
  amount?: number,
  reason?: string
) {
  try {
    console.log(`💸 [Refund] Processing refund for order: ${orderId}`);

    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        buyer: {
          select: { id: true, email: true, display_name: true }
        },
        seller: {
          select: { id: true, email: true, display_name: true }
        }
      }
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const refundAmount = amount || parseFloat(order.total);

    // Update order
    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: {
        status: 'REFUNDED',
        refund_amount: refundAmount.toString(),
        refund_reason: reason || 'Dispute resolved - refund issued',
        refunded_at: new Date()
      }
    });

    // Add timeline entry
    await prisma.order_timeline.create({
      data: {
        order_id: orderId,
        status: 'REFUNDED',
        actor_user_id: null,
        notes: `Refund of ${order.currency} ${refundAmount} issued to buyer. Reason: ${reason || 'Dispute resolved'}`,
        metadata: {
          refund_amount: refundAmount,
          currency: order.currency,
          reason: reason,
          refunded_at: new Date().toISOString()
        }
      }
    });

    // TODO: Integrate với payment gateway để thực hiện refund thật
    // Example: await paymentGateway.refund(orderId, order.buyer_id, refundAmount);

    // Send notification to buyer
    if (order.buyer?.id) {
      await NotificationService.createNotification({
        userId: order.buyer.id,
        type: 'refund_issued',
        title: '💸 Hoàn tiền đã được xử lý',
        message: `Bạn đã được hoàn ${new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: order.currency || 'VND'
        }).format(refundAmount)} cho đơn hàng ${order.order_number || order.id.slice(-8).toUpperCase()}.`,
        relatedId: orderId,
        relatedType: 'order',
        priority: 'high',
        actionUrl: `/orders/${orderId}`,
        metadata: {
          orderId: orderId,
          orderNumber: order.order_number,
          refundAmount: refundAmount,
          currency: order.currency,
          reason: reason
        }
      });
    }

    // Send notification to seller
    if (order.seller?.id) {
      await NotificationService.createNotification({
        userId: order.seller.id,
        type: 'refund_issued',
        title: '⚠️ Đơn hàng đã được hoàn tiền',
        message: `Đơn hàng ${order.order_number || order.id.slice(-8).toUpperCase()} đã được hoàn tiền ${new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: order.currency || 'VND'
        }).format(refundAmount)} cho buyer.`,
        relatedId: orderId,
        relatedType: 'order',
        priority: 'high',
        actionUrl: `/orders/${orderId}`,
        metadata: {
          orderId: orderId,
          orderNumber: order.order_number,
          refundAmount: refundAmount,
          currency: order.currency,
          reason: reason
        }
      });
    }

    console.log(`✅ [Refund] Successfully refunded ${order.currency} ${refundAmount} to buyer ${order.buyer_id}`);

    return {
      success: true,
      message: 'Refund processed successfully',
      orderId: orderId,
      refundAmount: refundAmount,
      currency: order.currency,
      buyerId: order.buyer_id,
      refundedAt: updatedOrder.refunded_at
    };

  } catch (error) {
    console.error(`❌ [Refund] Error processing refund for order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Get payment release status
 */
export async function getPaymentReleaseStatus(orderId: string) {
  try {
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        total: true,
        currency: true,
        payment_released_at: true,
        payment_released_to: true,
        payment_release_amount: true,
        payment_release_status: true,
        refund_amount: true,
        refunded_at: true,
        refund_reason: true
      }
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    return {
      success: true,
      data: {
        orderId: order.id,
        status: order.status,
        total: order.total,
        currency: order.currency,
        paymentReleased: !!order.payment_released_at,
        paymentReleasedAt: order.payment_released_at,
        paymentReleasedTo: order.payment_released_to,
        paymentReleaseAmount: order.payment_release_amount,
        paymentReleaseStatus: order.payment_release_status,
        refunded: !!order.refunded_at,
        refundAmount: order.refund_amount,
        refundedAt: order.refunded_at,
        refundReason: order.refund_reason
      }
    };

  } catch (error) {
    console.error(`❌ Error getting payment release status for order ${orderId}:`, error);
    throw error;
  }
}
