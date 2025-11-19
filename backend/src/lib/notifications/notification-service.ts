import prisma from '../prisma.js';
import sgMail from '@sendgrid/mail';

type NotificationType = 
  | 'payment_received' 
  | 'order_completed' 
  | 'order_created'
  | 'order_update'
  | 'rental_contract_created'
  | 'rental_contract_overdue'
  | 'rental_contract_expiring'
  | 'rental_contract_extended'
  | 'rental_contract_completed'
  | 'rental_payment_reminder'
  | 'rental_payment_overdue'
  | 'rfq_received'
  | 'quote_received'
  | 'quote_accepted'
  | 'quote_rejected'
  | 'container_ready'
  | 'system'
  | 'reminder';

/**
 * 🆕 EMAIL SERVICE (Production-Ready with SendGrid)
 * Supports both SendGrid (production) and console logging (development)
 */
export class EmailService {
  private static initialized = false;

  /**
   * Initialize SendGrid (call once at app startup)
   */
  static initialize() {
    if (this.initialized) return;

    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey && apiKey !== 'your_sendgrid_api_key_here') {
      sgMail.setApiKey(apiKey);
      this.initialized = true;
      console.log('✅ SendGrid initialized successfully');
    } else {
      console.log('⚠️  SendGrid API key not configured - emails will be logged only');
    }
  }

  /**
   * Send email using SendGrid (production) or console log (development)
   */
  static async sendEmail(data: {
    to: string;
    subject: string;
    html: string;
    priority?: 'low' | 'normal' | 'high';
  }): Promise<boolean> {
    try {
      this.initialize();

      const fromEmail = process.env.EMAIL_FROM || 'noreply@conttrade.com';
      const fromName = process.env.EMAIL_FROM_NAME || 'ContTrade Platform';

      // If SendGrid is configured, send real email
      if (this.initialized) {
        const msg = {
          to: data.to,
          from: {
            email: fromEmail,
            name: fromName
          },
          subject: data.subject,
          html: data.html,
          // Set priority header
          headers: data.priority === 'high' ? {
            'X-Priority': '1',
            'Importance': 'high'
          } : undefined
        };

        await sgMail.send(msg);
        console.log(`✅ Email sent to ${data.to}: ${data.subject}`);
        return true;
      } 
      // Development mode - just log
      else {
        console.log('📧 [DEV MODE] Email would be sent:');
        console.log(`   From: ${fromName} <${fromEmail}>`);
        console.log(`   To: ${data.to}`);
        console.log(`   Subject: ${data.subject}`);
        console.log(`   Priority: ${data.priority || 'normal'}`);
        console.log(`   HTML Length: ${data.html.length} characters`);
        return true;
      }
    } catch (error: any) {
      console.error('❌ Error sending email:', error);
      // Log detailed error for debugging
      if (error?.response?.body) {
        console.error('   SendGrid Error:', error.response.body);
      }
      return false;
    }
  }

  /**
   * 🆕 RENTAL EMAIL TEMPLATES
   */
  static async sendRentalContractCreated(contractData: {
    buyerEmail: string;
    buyerName: string;
    contractNumber: string;
    startDate: string;
    endDate: string;
    rentalPrice: number;
    currency: string;
    containerDetails: string;
  }): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0066cc; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Hợp Đồng Thuê Container Đã Được Tạo</h1>
          </div>
          <div class="content">
            <p>Xin chào <strong>${contractData.buyerName}</strong>,</p>
            <p>Hợp đồng thuê container của bạn đã được tạo thành công!</p>
            
            <h3>📋 Thông Tin Hợp Đồng:</h3>
            <ul>
              <li><strong>Số hợp đồng:</strong> ${contractData.contractNumber}</li>
              <li><strong>Container:</strong> ${contractData.containerDetails}</li>
              <li><strong>Thời hạn:</strong> ${contractData.startDate} đến ${contractData.endDate}</li>
              <li><strong>Giá thuê:</strong> ${new Intl.NumberFormat('vi-VN').format(contractData.rentalPrice)} ${contractData.currency}/tháng</li>
            </ul>
            
            <p><strong>Bước tiếp theo:</strong></p>
            <ol>
              <li>Xem chi tiết hợp đồng và lịch thanh toán</li>
              <li>Thanh toán đúng hạn để tránh phí trễ hạn</li>
              <li>Liên hệ seller để sắp xếp nhận container</li>
            </ol>
            
            <a href="https://i-contexchange.com/my-rentals" class="button">Xem Hợp Đồng</a>
          </div>
          <div class="footer">
            <p>i-ContExchange - Nền tảng giao dịch container hàng đầu</p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: contractData.buyerEmail,
      subject: `🎉 Hợp Đồng Thuê ${contractData.contractNumber} Đã Được Tạo`,
      html,
      priority: 'high',
    });
  }

  static async sendPaymentReminder(data: {
    buyerEmail: string;
    buyerName: string;
    contractNumber: string;
    amount: number;
    currency: string;
    dueDate: string;
  }): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ff9800; color: white; padding: 20px; text-align: center;">
            <h1>💳 Nhắc Nhở Thanh Toán Tiền Thuê</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <p>Xin chào <strong>${data.buyerName}</strong>,</p>
            <p>Đây là lời nhắc nhở về kỳ thanh toán tiền thuê container sắp đến hạn:</p>
            
            <div style="background: white; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Hợp đồng:</strong> ${data.contractNumber}</p>
              <p style="margin: 5px 0;"><strong>Số tiền:</strong> <span style="color: #ff9800; font-size: 20px;">${new Intl.NumberFormat('vi-VN').format(data.amount)} ${data.currency}</span></p>
              <p style="margin: 5px 0;"><strong>Hạn thanh toán:</strong> ${data.dueDate}</p>
            </div>
            
            <p>⚠️ <strong>Lưu ý:</strong> Thanh toán trễ hạn có thể phát sinh phí phạt.</p>
            
            <a href="https://i-contexchange.com/my-rentals/payments" style="display: inline-block; padding: 12px 24px; background: #ff9800; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Thanh Toán Ngay</a>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: data.buyerEmail,
      subject: `💳 Nhắc Nhở: Thanh Toán Tiền Thuê - ${data.contractNumber}`,
      html,
      priority: 'normal',
    });
  }

  static async sendPaymentOverdue(data: {
    buyerEmail: string;
    buyerName: string;
    contractNumber: string;
    amount: number;
    currency: string;
    daysOverdue: number;
    lateFee: number;
  }): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f44336; color: white; padding: 20px; text-align: center;">
            <h1>⚠️ Thanh Toán Quá Hạn</h1>
          </div>
          <div style="padding: 20px; background: #ffebee;">
            <p>Xin chào <strong>${data.buyerName}</strong>,</p>
            <p><strong style="color: #f44336;">Kỳ thanh toán tiền thuê của bạn đã quá hạn ${data.daysOverdue} ngày.</strong></p>
            
            <div style="background: white; padding: 15px; border-left: 4px solid #f44336; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Hợp đồng:</strong> ${data.contractNumber}</p>
              <p style="margin: 5px 0;"><strong>Số tiền gốc:</strong> ${new Intl.NumberFormat('vi-VN').format(data.amount)} ${data.currency}</p>
              <p style="margin: 5px 0;"><strong>Phí trễ hạn:</strong> <span style="color: #f44336;">${new Intl.NumberFormat('vi-VN').format(data.lateFee)} ${data.currency}</span></p>
              <p style="margin: 5px 0;"><strong>Tổng cộng:</strong> <span style="color: #f44336; font-size: 20px; font-weight: bold;">${new Intl.NumberFormat('vi-VN').format(data.amount + data.lateFee)} ${data.currency}</span></p>
            </div>
            
            <p>Vui lòng thanh toán ngay để tránh phí phạt tiếp tục tăng.</p>
            
            <a href="https://i-contexchange.com/my-rentals/payments" style="display: inline-block; padding: 12px 24px; background: #f44336; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Thanh Toán Ngay</a>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: data.buyerEmail,
      subject: `⚠️ KHẨN CẤP: Thanh Toán Quá Hạn - ${data.contractNumber}`,
      html,
      priority: 'high',
    });
  }

  static async sendContractExpiring(data: {
    buyerEmail: string;
    buyerName: string;
    contractNumber: string;
    endDate: string;
    daysRemaining: number;
  }): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #673ab7; color: white; padding: 20px; text-align: center;">
            <h1>📅 Hợp Đồng Sắp Hết Hạn</h1>
          </div>
          <div style="padding: 20px; background: #f3e5f5;">
            <p>Xin chào <strong>${data.buyerName}</strong>,</p>
            <p>Hợp đồng thuê container của bạn sắp hết hạn sau <strong>${data.daysRemaining} ngày</strong>.</p>
            
            <div style="background: white; padding: 15px; margin: 20px 0;">
              <p><strong>Hợp đồng:</strong> ${data.contractNumber}</p>
              <p><strong>Ngày hết hạn:</strong> ${data.endDate}</p>
            </div>
            
            <p><strong>Bạn có thể:</strong></p>
            <ul>
              <li>✅ Yêu cầu gia hạn hợp đồng</li>
              <li>✅ Sắp xếp trả container</li>
              <li>✅ Liên hệ seller để thảo luận</li>
            </ul>
            
            <a href="https://i-contexchange.com/my-rentals" style="display: inline-block; padding: 12px 24px; background: #673ab7; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Xem Hợp Đồng</a>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: data.buyerEmail,
      subject: `📅 Hợp Đồng ${data.contractNumber} Sắp Hết Hạn`,
      html,
      priority: 'normal',
    });
  }
}

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