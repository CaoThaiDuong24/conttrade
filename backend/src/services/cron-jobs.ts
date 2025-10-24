// @ts-nocheck
/**
 * CRON JOBS SERVICE
 * Scheduled tasks để tự động xử lý các tác vụ định kỳ
 */

import cron from 'node-cron';
import prisma from '../lib/prisma.js';
import { NotificationService } from '../lib/notifications/notification-service.js';
import { releasePaymentToSeller } from './payment-release.js';

/**
 * Auto-complete orders sau dispute period (7 ngày)
 * Chạy mỗi ngày lúc 2:00 AM
 */
export async function autoCompleteOrders() {
  try {
    console.log('🔄 [CRON] Starting auto-complete orders job...');
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Tìm orders có status = DELIVERED và đã giao hơn 7 ngày
    const ordersToComplete = await prisma.orders.findMany({
      where: {
        status: 'DELIVERED',
        delivered_at: {
          lte: sevenDaysAgo
        }
      },
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            display_name: true,
            full_name: true
          }
        },
        seller: {
          select: {
            id: true,
            email: true,
            display_name: true,
            full_name: true
          }
        }
      }
    });

    console.log(`📦 Found ${ordersToComplete.length} orders to auto-complete`);

    let completedCount = 0;
    let errorCount = 0;

    for (const order of ordersToComplete) {
      try {
        // Update order status to COMPLETED
        const updatedOrder = await prisma.orders.update({
          where: { id: order.id },
          data: {
            status: 'COMPLETED',
            completed_at: now
          }
        });

        // Add timeline entry
        await prisma.order_timeline.create({
          data: {
            order_id: order.id,
            status: 'COMPLETED',
            actor_user_id: null, // System action
            notes: 'Order auto-completed after 7-day dispute period',
            metadata: {
              auto_completed: true,
              delivered_at: order.delivered_at,
              completed_at: now
            }
          }
        });

        // Release payment to seller
        try {
          await releasePaymentToSeller(order.id);
          console.log(`   💰 Payment released for order ${order.id}`);
        } catch (error) {
          console.error(`   ❌ Failed to release payment for order ${order.id}:`, error);
        }

        // Send notifications to both parties
        if (order.buyer?.id) {
          await NotificationService.createNotification({
            userId: order.buyer.id,
            type: 'order_completed',
            title: '✅ Đơn hàng hoàn tất',
            message: `Đơn hàng ${order.order_number || order.id.slice(-8).toUpperCase()} đã hoàn tất. Hãy đánh giá seller!`,
            relatedId: order.id,
            relatedType: 'order',
            priority: 'normal',
            actionUrl: `/orders/${order.id}`,
            metadata: {
              orderId: order.id,
              orderNumber: order.order_number,
              autoCompleted: true
            }
          });
        }

        if (order.seller?.id) {
          await NotificationService.createNotification({
            userId: order.seller.id,
            type: 'order_completed',
            title: '🎉 Đơn hàng hoàn tất - Thanh toán đã được giải ngân',
            message: `Đơn hàng ${order.order_number || order.id.slice(-8).toUpperCase()} đã hoàn tất. Thanh toán đã được chuyển vào tài khoản của bạn.`,
            relatedId: order.id,
            relatedType: 'order',
            priority: 'high',
            actionUrl: `/orders/${order.id}`,
            metadata: {
              orderId: order.id,
              orderNumber: order.order_number,
              paymentReleased: true,
              autoCompleted: true
            }
          });
        }

        completedCount++;
        console.log(`✅ Auto-completed order: ${order.order_number || order.id.slice(-8)}`);

      } catch (error) {
        errorCount++;
        console.error(`❌ Error auto-completing order ${order.id}:`, error);
      }
    }

    console.log(`✅ [CRON] Auto-complete job finished:`);
    console.log(`   - Total orders: ${ordersToComplete.length}`);
    console.log(`   - Successfully completed: ${completedCount}`);
    console.log(`   - Errors: ${errorCount}`);

    return {
      success: true,
      total: ordersToComplete.length,
      completed: completedCount,
      errors: errorCount
    };

  } catch (error) {
    console.error('❌ [CRON] Error in auto-complete orders job:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cleanup expired RFQs
 * Chạy mỗi ngày lúc 3:00 AM
 */
export async function cleanupExpiredRFQs() {
  try {
    console.log('🔄 [CRON] Starting cleanup expired RFQs job...');
    
    const now = new Date();

    // Tìm RFQs đã hết hạn và chưa có response
    const expiredRFQs = await prisma.rfqs.updateMany({
      where: {
        status: 'SENT',
        expires_at: {
          lte: now
        }
      },
      data: {
        status: 'EXPIRED'
      }
    });

    console.log(`✅ [CRON] Expired ${expiredRFQs.count} RFQs`);

    return {
      success: true,
      count: expiredRFQs.count
    };

  } catch (error) {
    console.error('❌ [CRON] Error in cleanup expired RFQs job:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cleanup expired quotes
 * Chạy mỗi ngày lúc 3:30 AM
 */
export async function cleanupExpiredQuotes() {
  try {
    console.log('🔄 [CRON] Starting cleanup expired quotes job...');
    
    const now = new Date();

    // Tìm quotes đã hết hạn và chưa được accept
    const expiredQuotes = await prisma.quotes.updateMany({
      where: {
        status: 'SENT',
        valid_until: {
          lte: now
        }
      },
      data: {
        status: 'EXPIRED'
      }
    });

    console.log(`✅ [CRON] Expired ${expiredQuotes.count} quotes`);

    return {
      success: true,
      count: expiredQuotes.count
    };

  } catch (error) {
    console.error('❌ [CRON] Error in cleanup expired quotes job:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send reminder for pending reviews
 * Chạy mỗi ngày lúc 10:00 AM
 */
export async function sendReviewReminders() {
  try {
    console.log('🔄 [CRON] Starting send review reminders job...');
    
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    // Tìm completed orders chưa có review sau 3 ngày
    const ordersNeedingReview = await prisma.orders.findMany({
      where: {
        status: 'COMPLETED',
        completed_at: {
          lte: threeDaysAgo
        }
      },
      include: {
        reviews: true,
        buyer: {
          select: { id: true, email: true, display_name: true }
        },
        seller: {
          select: { id: true, email: true, display_name: true }
        }
      }
    });

    let remindersSent = 0;

    for (const order of ordersNeedingReview) {
      const buyerReviewed = (order.reviews as any[]).some(r => r.reviewer_id === order.buyer_id);
      const sellerReviewed = (order.reviews as any[]).some(r => r.reviewer_id === order.seller_id);

      // Send reminder to buyer if not reviewed
      if (!buyerReviewed && order.buyer?.id) {
        await NotificationService.createNotification({
          userId: order.buyer.id,
          type: 'review_reminder',
          title: '⭐ Hãy đánh giá giao dịch',
          message: `Đơn hàng ${order.order_number || order.id.slice(-8).toUpperCase()} đã hoàn tất. Đánh giá của bạn sẽ giúp người khác!`,
          relatedId: order.id,
          relatedType: 'order',
          priority: 'low',
          actionUrl: `/orders/${order.id}/review`,
          metadata: {
            orderId: order.id,
            role: 'buyer'
          }
        });
        remindersSent++;
      }

      // Send reminder to seller if not reviewed
      if (!sellerReviewed && order.seller?.id) {
        await NotificationService.createNotification({
          userId: order.seller.id,
          type: 'review_reminder',
          title: '⭐ Hãy đánh giá giao dịch',
          message: `Đơn hàng ${order.order_number || order.id.slice(-8).toUpperCase()} đã hoàn tất. Đánh giá của bạn sẽ giúp người khác!`,
          relatedId: order.id,
          relatedType: 'order',
          priority: 'low',
          actionUrl: `/orders/${order.id}/review`,
          metadata: {
            orderId: order.id,
            role: 'seller'
          }
        });
        remindersSent++;
      }
    }

    console.log(`✅ [CRON] Sent ${remindersSent} review reminders`);

    return {
      success: true,
      remindersSent
    };

  } catch (error) {
    console.error('❌ [CRON] Error in send review reminders job:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Initialize cron jobs
 * Được gọi khi server start
 */
export function initializeCronJobs() {
  console.log('🕐 Initializing cron jobs...');

  // Auto-complete orders: Chạy mỗi ngày lúc 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('⏰ [CRON] Running auto-complete orders job at 2:00 AM');
    await autoCompleteOrders();
  });

  // Cleanup expired RFQs: Chạy mỗi ngày lúc 3:00 AM
  cron.schedule('0 3 * * *', async () => {
    console.log('⏰ [CRON] Running cleanup expired RFQs job at 3:00 AM');
    await cleanupExpiredRFQs();
  });

  // Cleanup expired quotes: Chạy mỗi ngày lúc 3:30 AM
  cron.schedule('30 3 * * *', async () => {
    console.log('⏰ [CRON] Running cleanup expired quotes job at 3:30 AM');
    await cleanupExpiredQuotes();
  });

  // Send review reminders: Chạy mỗi ngày lúc 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('⏰ [CRON] Running send review reminders job at 10:00 AM');
    await sendReviewReminders();
  });

  console.log('✅ Cron jobs initialized successfully!');
  console.log('   📅 Auto-complete orders: Every day at 2:00 AM');
  console.log('   📅 Cleanup expired RFQs: Every day at 3:00 AM');
  console.log('   📅 Cleanup expired quotes: Every day at 3:30 AM');
  console.log('   📅 Send review reminders: Every day at 10:00 AM');
}

/**
 * Manual trigger endpoint (for testing)
 */
export async function runAllCronJobs() {
  console.log('🔄 Running all cron jobs manually...');
  
  const results = {
    autoComplete: await autoCompleteOrders(),
    cleanupRFQs: await cleanupExpiredRFQs(),
    cleanupQuotes: await cleanupExpiredQuotes(),
    reviewReminders: await sendReviewReminders()
  };

  return results;
}
