import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createSimpleNotifications() {
  try {
    console.log('🧪 Tạo notifications đơn giản cho TẤT CẢ users...\n');

    // Lấy tất cả users
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        display_name: true
      },
      take: 20 // Giới hạn 20 users đầu tiên
    });

    if (users.length === 0) {
      console.log('❌ Không tìm thấy users trong database');
      return;
    }

    console.log(`✅ Tìm thấy ${users.length} users\n`);

    // Xóa TẤT CẢ notifications cũ
    const deleted = await prisma.$executeRaw`DELETE FROM notifications`;
    console.log(`🗑️  Đã xóa ${deleted} notifications cũ\n`);

    // Danh sách notifications sẽ tạo (cho tất cả users)
    const allNotifications = [
      {
        type: 'rfq_received',
        title: 'Yêu cầu báo giá mới',
        message: 'Bạn có yêu cầu báo giá mới cho sản phẩm "Container 20ft Standard"',
        data: { rfqId: 'test-rfq-001', listingId: 'test-listing-001', quantity: 10 }
      },
      {
        type: 'quote_received',
        title: 'Báo giá mới',
        message: 'Bạn có báo giá mới cho yêu cầu của mình (Container 40ft High Cube)',
        data: { quoteId: 'test-quote-001', rfqId: 'test-rfq-001', total: 15000000, currency: 'VND' }
      },
      {
        type: 'quote_accepted',
        title: 'Báo giá được chấp nhận',
        message: 'Báo giá của bạn đã được chấp nhận. Đơn hàng ORD-12345 đã được tạo.',
        data: { quoteId: 'test-quote-001', orderId: 'test-order-001', orderNumber: 'ORD-12345', total: 15000000 }
      },
      {
        type: 'quote_rejected',
        title: 'Báo giá bị từ chối',
        message: 'Báo giá của bạn đã bị từ chối bởi người mua.',
        data: { quoteId: 'test-quote-002', rfqId: 'test-rfq-002', total: 12000000 }
      },
      {
        type: 'order_created',
        title: 'Đơn hàng mới',
        message: 'Bạn có đơn hàng mới #ORD-67890',
        data: { orderId: 'test-order-002', orderNumber: 'ORD-67890', total: 20000000 }
      },
      {
        type: 'payment_received',
        title: 'Thanh toán thành công',
        message: 'Thanh toán cho đơn hàng #ORD-12345 đã được xác nhận',
        data: { orderId: 'test-order-001', amount: 15000000, currency: 'VND' }
      }
    ];

    let totalCreated = 0;

    // Tạo notifications cho từng user
    for (const user of users) {
      console.log(`\n📝 Tạo notifications cho: ${user.email} (${user.id})`);
      
      // Tạo 3-5 notifications ngẫu nhiên cho mỗi user
      const numNotifs = Math.floor(Math.random() * 3) + 3; // 3-5 notifications
      const selectedNotifs = [];
      
      // Chọn ngẫu nhiên notifications
      const shuffled = [...allNotifications].sort(() => 0.5 - Math.random());
      for (let i = 0; i < Math.min(numNotifs, shuffled.length); i++) {
        selectedNotifs.push(shuffled[i]);
      }
      
      // Tạo từng notification
      for (let i = 0; i < selectedNotifs.length; i++) {
        const notif = selectedNotifs[i];
        const notifId = `NOTIF-${Date.now()}-${user.id.slice(-6)}-${i}`;
        const isRead = Math.random() > 0.6; // 40% chance đã đọc
        const hoursAgo = Math.floor(Math.random() * 12); // 0-12 hours ago
        
        try {
          await prisma.$executeRaw`
            INSERT INTO notifications (id, user_id, type, title, message, data, read, created_at, updated_at)
            VALUES (
              ${notifId},
              ${user.id},
              ${notif.type},
              ${notif.title},
              ${notif.message},
              ${JSON.stringify(notif.data)}::jsonb,
              ${isRead},
              NOW() - INTERVAL '${hoursAgo} hours',
              NOW()
            )
          `;
          
          console.log(`   ✓ [${isRead ? '✓' : '✗'}] ${notif.type} (${hoursAgo}h ago)`);
          totalCreated++;
          
        } catch (error) {
          console.error(`   ✗ Lỗi tạo notification: ${error.message}`);
        }
        
        // Delay nhỏ
        await new Promise(resolve => setTimeout(resolve, 5));
      }
    }

    console.log(`\n🎉 Đã tạo ${totalCreated} notifications cho ${users.length} users!`);
    
    // Thống kê
    console.log('\n📊 Thống kê:');
    
    const userStats = await prisma.$queryRaw`
      SELECT 
        u.email,
        COUNT(n.id) as total,
        SUM(CASE WHEN n.read = FALSE THEN 1 ELSE 0 END) as unread
      FROM users u
      LEFT JOIN notifications n ON u.id = n.user_id
      GROUP BY u.id, u.email
      HAVING COUNT(n.id) > 0
      ORDER BY total DESC
      LIMIT 10
    `;
    
    console.log('\n👥 Top 10 users có nhiều notifications:');
    userStats.forEach((stat, i) => {
      console.log(`   ${i+1}. ${stat.email}: ${stat.total} total, ${stat.unread} unread`);
    });

    const typeStats = await prisma.$queryRaw`
      SELECT 
        type,
        COUNT(*) as count,
        SUM(CASE WHEN read = FALSE THEN 1 ELSE 0 END) as unread
      FROM notifications
      GROUP BY type
      ORDER BY count DESC
    `;
    
    console.log('\n📋 Notifications theo type:');
    typeStats.forEach(stat => {
      console.log(`   ${stat.type}: ${stat.count} (${stat.unread} unread)`);
    });

    console.log('\n✅ HOÀN THÀNH!');
    console.log('🔔 Bây giờ login với BẤT KỲ tài khoản nào sẽ thấy notifications!');
    console.log('📧 Một số emails để thử:');
    users.slice(0, 5).forEach(u => console.log(`   - ${u.email}`));

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSimpleNotifications();
