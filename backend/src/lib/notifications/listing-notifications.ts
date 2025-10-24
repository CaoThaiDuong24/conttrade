import prisma from '../prisma';
import { NotificationService } from './notification-service';

/**
 * Listing Notification Service
 * Handles all listing-related notifications for sellers, buyers, and admins
 */

export class ListingNotificationService {
  /**
   * Notify seller when listing is submitted for review
   */
  static async notifyListingSubmitted(listingId: string, sellerId: string, listingTitle: string) {
    try {
      await NotificationService.createNotification({
        userId: sellerId,
        type: 'order_created', // Reuse existing type for now
        title: '📝 Tin đăng đã gửi',
        message: `Tin đăng "${listingTitle}" đã được gửi và đang chờ admin duyệt.`,
        orderData: {
          listingId,
          action: 'listing_submitted',
          actionUrl: `/seller/listings/${listingId}`
        }
      });
      
      console.log('✅ Notified seller about listing submission:', listingId);
    } catch (error) {
      console.error('❌ Error notifying listing submission:', error);
    }
  }

  /**
   * Notify seller when listing is approved by admin
   */
  static async notifyListingApproved(listingId: string, sellerId: string, listingTitle: string) {
    try {
      await NotificationService.createNotification({
        userId: sellerId,
        type: 'order_completed', // Reuse existing type for now
        title: '✅ Tin đăng đã được duyệt!',
        message: `Tin đăng "${listingTitle}" đã được duyệt và hiển thị công khai. Buyer có thể xem và gửi RFQ ngay bây giờ.`,
        orderData: {
          listingId,
          action: 'listing_approved',
          actionUrl: `/listings/${listingId}`
        }
      });
      
      console.log('✅ Notified seller about listing approval:', listingId);
    } catch (error) {
      console.error('❌ Error notifying listing approval:', error);
    }
  }

  /**
   * Notify seller when listing is rejected by admin
   */
  static async notifyListingRejected(
    listingId: string, 
    sellerId: string, 
    listingTitle: string, 
    rejectionReason: string
  ) {
    try {
      await NotificationService.createNotification({
        userId: sellerId,
        type: 'payment_received', // Reuse existing type for now
        title: '❌ Tin đăng bị từ chối',
        message: `Tin đăng "${listingTitle}" bị từ chối. Lý do: ${rejectionReason}. Vui lòng chỉnh sửa và gửi lại.`,
        orderData: {
          listingId,
          rejectionReason,
          action: 'listing_rejected',
          actionUrl: `/seller/listings/${listingId}/edit`
        }
      });
      
      console.log('✅ Notified seller about listing rejection:', listingId);
    } catch (error) {
      console.error('❌ Error notifying listing rejection:', error);
    }
  }

  /**
   * Notify seller when they receive a new RFQ
   */
  static async notifyRfqReceived(
    rfqId: string,
    listingId: string,
    sellerId: string,
    buyerName: string,
    listingTitle: string
  ) {
    try {
      await NotificationService.createNotification({
        userId: sellerId,
        type: 'order_created', // Reuse existing type for now
        title: '💼 Nhận được RFQ mới!',
        message: `Bạn nhận được yêu cầu báo giá mới từ ${buyerName} cho tin đăng "${listingTitle}".`,
        orderData: {
          rfqId,
          listingId,
          buyerName,
          action: 'rfq_received',
          actionUrl: `/seller/rfqs/${rfqId}`
        }
      });
      
      console.log('✅ Notified seller about new RFQ:', rfqId);
    } catch (error) {
      console.error('❌ Error notifying RFQ received:', error);
    }
  }

  /**
   * Notify seller when listing is about to expire
   */
  static async notifyListingExpiringSoon(
    listingId: string,
    sellerId: string,
    listingTitle: string,
    daysRemaining: number
  ) {
    try {
      await NotificationService.createNotification({
        userId: sellerId,
        type: 'payment_received', // Reuse existing type for now
        title: '⏰ Tin đăng sắp hết hạn',
        message: `Tin đăng "${listingTitle}" sẽ hết hạn trong ${daysRemaining} ngày. Vui lòng gia hạn để tiếp tục hiển thị.`,
        orderData: {
          listingId,
          daysRemaining,
          action: 'listing_expiring_soon',
          actionUrl: `/seller/listings/${listingId}`
        }
      });
      
      console.log('✅ Notified seller about listing expiring soon:', listingId);
    } catch (error) {
      console.error('❌ Error notifying listing expiring soon:', error);
    }
  }

  /**
   * Notify admin when new listing is pending review
   */
  static async notifyAdminPendingReview(listingId: string, sellerName: string, listingTitle: string) {
    try {
      // Get all admin users via user_roles
      const adminUsers = await prisma.user_roles.findMany({
        where: {
          roles: {
            name: 'ADMIN'
          }
        },
        select: {
          user_id: true
        }
      });
      
      // Send notification to all admins
      for (const adminUser of adminUsers) {
        await NotificationService.createNotification({
          userId: adminUser.user_id,
          type: 'order_created', // Reuse existing type for now
          title: '🔔 Tin đăng mới cần duyệt',
          message: `Seller ${sellerName} đã gửi tin đăng mới "${listingTitle}" cần được duyệt.`,
          orderData: {
            listingId,
            sellerName,
            action: 'listing_pending_review',
            actionUrl: `/admin/listings/${listingId}`
          }
        });
      }
      
      console.log(`✅ Notified ${adminUsers.length} admins about pending listing:`, listingId);
    } catch (error) {
      console.error('❌ Error notifying admins about pending review:', error);
    }
  }

  /**
   * Notify buyer when new listing matches their saved search/preferences
   * (Optional - for future enhancement)
   */
  static async notifyBuyerNewMatch(
    buyerId: string,
    listingId: string,
    listingTitle: string,
    matchReason: string
  ) {
    try {
      await NotificationService.createNotification({
        userId: buyerId,
        type: 'order_created', // Reuse existing type for now
        title: '🎯 Có tin đăng mới phù hợp!',
        message: `Tin đăng mới "${listingTitle}" phù hợp với ${matchReason}.`,
        orderData: {
          listingId,
          matchReason,
          action: 'listing_new_match',
          actionUrl: `/listings/${listingId}`
        }
      });
      
      console.log('✅ Notified buyer about new matching listing:', listingId);
    } catch (error) {
      console.error('❌ Error notifying buyer about new match:', error);
    }
  }

  /**
   * Notify buyer when price drops on a listing they're watching
   * (Optional - for future enhancement)
   */
  static async notifyBuyerPriceDrop(
    buyerId: string,
    listingId: string,
    listingTitle: string,
    oldPrice: number,
    newPrice: number,
    currency: string
  ) {
    try {
      const percentageChange = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
      
      await NotificationService.createNotification({
        userId: buyerId,
        type: 'payment_received', // Reuse existing type for now
        title: '💰 Giá giảm!',
        message: `Tin đăng "${listingTitle}" giảm giá ${percentageChange}% (${oldPrice.toLocaleString()} → ${newPrice.toLocaleString()} ${currency}).`,
        orderData: {
          listingId,
          oldPrice,
          newPrice,
          percentageChange,
          action: 'listing_price_drop',
          actionUrl: `/listings/${listingId}`
        }
      });
      
      console.log('✅ Notified buyer about price drop:', listingId);
    } catch (error) {
      console.error('❌ Error notifying buyer about price drop:', error);
    }
  }

  /**
   * Notify seller when listing views reach milestones
   * (Optional - for engagement)
   */
  static async notifyListingMilestone(
    listingId: string,
    sellerId: string,
    listingTitle: string,
    milestone: number
  ) {
    try {
      await NotificationService.createNotification({
        userId: sellerId,
        type: 'order_completed', // Reuse existing type for now
        title: '🎉 Milestone đạt được!',
        message: `Tin đăng "${listingTitle}" đã đạt ${milestone.toLocaleString()} lượt xem!`,
        orderData: {
          listingId,
          milestone,
          action: 'listing_milestone',
          actionUrl: `/seller/listings/${listingId}`
        }
      });
      
      console.log('✅ Notified seller about listing milestone:', listingId, milestone);
    } catch (error) {
      console.error('❌ Error notifying listing milestone:', error);
    }
  }
}

export default ListingNotificationService;
