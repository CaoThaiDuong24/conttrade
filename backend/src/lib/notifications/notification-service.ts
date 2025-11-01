import prisma from '../prisma.js';

type NotificationType = 
  | 'payment_received' 
  | 'order_completed' 
  | 'order_created'
  | 'rfq_received'
  | 'quote_received'
  | 'quote_accepted'
  | 'quote_rejected'
  | 'container_ready'
  | 'system'
  | 'reminder';

export class NotificationService {
  static async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    orderData?: any;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    actionUrl?: string;
  }) {
    try {
      // Check if notifications table exists first
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'notifications'
        )
      ` as any[];
      
      if (!tableExists[0]?.exists) {
        console.log('⚠️  Notifications table does not exist, skipping notification creation');
        return { success: true, notificationId: 'skipped' };
      }
      
      const notificationId = `NOTIF-${Date.now()}-${data.userId.slice(-4)}`;
      
      // Prepare notification data with priority and action_url
      const notificationData = {
        ...data.orderData,
        priority: data.priority || 'medium',
        action_url: data.actionUrl || null
      };
      const jsonData = JSON.stringify(notificationData);
      
      // Use CURRENT_TIMESTAMP to get current time
      await prisma.$executeRaw`
        INSERT INTO notifications (id, user_id, type, title, message, data, created_at, updated_at)
        VALUES (${notificationId}, ${data.userId}, ${data.type}, ${data.title}, ${data.message}, ${jsonData}::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      
      console.log('✅ Notification created:', notificationId, 'for user:', data.userId, 'at:', new Date().toISOString());
      return { success: true, notificationId };
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      return { success: true, notificationId: 'error' }; // Don't fail the main operation
    }
  }

  static async getNotifications(userId: string, limit = 10) {
    try {
      // Check if notifications table exists first
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'notifications'
        )
      ` as any[];
      
      if (!tableExists[0]?.exists) {
        console.log('⚠️  Notifications table does not exist, returning empty array');
        return { success: true, notifications: [] };
      }
      
      // Get notifications with proper timezone conversion
      const notifications = await prisma.$queryRaw`
        SELECT 
          id, 
          user_id, 
          type, 
          title, 
          message, 
          data, 
          read,
          to_char(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD"T"HH24:MI:SS') as created_at,
          to_char(updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD"T"HH24:MI:SS') as updated_at
        FROM notifications 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC 
        LIMIT ${limit}
      ` as any[];
      
      // Extract action_url and priority from data JSON
      const processedNotifications = notifications.map((notif: any) => ({
        ...notif,
        action_url: notif.data?.action_url || null,
        priority: notif.data?.priority || 'medium',
      }));
      
      console.log('✅ Retrieved', notifications.length, 'notifications for user:', userId);
      console.log('📅 First notification created_at:', notifications[0]?.created_at, 'type:', typeof notifications[0]?.created_at);
      return { success: true, notifications: processedNotifications };
    } catch (error) {
      console.error('❌ Error getting notifications:', error);
      return { success: true, notifications: [] }; // Return empty array instead of error
    }
  }

  static async markAsRead(userId: string, notificationId: string) {
    try {
      // Check if notifications table exists first
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'notifications'
        )
      ` as any[];
      
      if (!tableExists[0]?.exists) {
        console.log('⚠️  Notifications table does not exist, skipping mark as read');
        return { success: true };
      }
      
      await prisma.$executeRaw`
        UPDATE notifications 
        SET read = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${notificationId} AND user_id = ${userId}
      `;
      
      console.log('✅ Marked notification as read:', notificationId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return { success: true }; // Don't fail the operation
    }
  }

  static async markAllAsRead(userId: string) {
    try {
      // Check if notifications table exists first
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'notifications'
        )
      ` as any[];
      
      if (!tableExists[0]?.exists) {
        console.log('⚠️  Notifications table does not exist, skipping mark all as read');
        return { success: true };
      }
      
      await prisma.$executeRaw`
        UPDATE notifications 
        SET read = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId} AND read = FALSE
      `;
      
      console.log('✅ Marked all notifications as read for user:', userId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      return { success: true }; // Don't fail the operation
    }
  }

  static async deleteNotification(userId: string, notificationId: string) {
    try {
      // Check if notifications table exists first
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'notifications'
        )
      ` as any[];
      
      if (!tableExists[0]?.exists) {
        console.log('⚠️  Notifications table does not exist, skipping delete');
        return { success: true };
      }
      
      await prisma.$executeRaw`
        DELETE FROM notifications 
        WHERE id = ${notificationId} AND user_id = ${userId}
      `;
      
      console.log('✅ Deleted notification:', notificationId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      return { success: false, error: 'Failed to delete notification' };
    }
  }
}