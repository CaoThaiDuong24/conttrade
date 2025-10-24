/**
 * Script tạo notification test data
 */

import prisma from './dist/lib/prisma.js';

async function createTestNotifications() {
  console.log('🧪 Tạo test notifications...\n');

  try {
    // Lấy danh sách users
    const users = await prisma.users.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        display_name: true
      }
    });

    if (users.length === 0) {
      console.log('❌ Không tìm thấy users trong database');
      return;
    }

    console.log(`✅ Tìm thấy ${users.length} users\n`);

    // Tạo các loại notifications khác nhau
    const notificationTypes = [
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

    let created = 0;

    // Tạo notifications cho mỗi user
    for (const user of users) {
      console.log(`\n📝 Tạo notifications cho user: ${user.email}`);
      
      // Tạo 2-3 notifications cho mỗi user
      const numNotifs = Math.floor(Math.random() * 2) + 2; // 2-3 notifications
      
      for (let i = 0; i < numNotifs; i++) {
        const notifType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        const notifId = `NOTIF-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const isRead = Math.random() > 0.5; // 50% chance đã đọc
        
        await prisma.$executeRaw`
          INSERT INTO notifications (id, user_id, type, title, message, data, read, created_at, updated_at)
          VALUES (
            ${notifId},
            ${user.id},
            ${notifType.type},
            ${notifType.title},
            ${notifType.message},
            ${JSON.stringify(notifType.data)}::jsonb,
            ${isRead},
            NOW() - INTERVAL '${Math.floor(Math.random() * 24)} hours',
            NOW()
          )
        `;
        
        console.log(`   ✓ [${isRead ? '✓' : '✗'}] ${notifType.type}: ${notifType.title}`);
        created++;
        
        // Delay nhỏ để tránh trùng timestamp
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    console.log(`\n🎉 Đã tạo ${created} test notifications thành công!`);
    
    // Hiển thị thống kê
    console.log('\n📊 Thống kê notifications:');
    const stats = await prisma.$queryRaw`
      SELECT 
        type,
        COUNT(*) as count,
        SUM(CASE WHEN read = FALSE THEN 1 ELSE 0 END) as unread
      FROM notifications
      GROUP BY type
      ORDER BY count DESC
    `;
    
    stats.forEach(stat => {
      console.log(`   - ${stat.type}: ${stat.count} (${stat.unread} chưa đọc)`);
    });

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy
createTestNotifications()
  .then(() => {
    console.log('\n✅ Hoàn thành!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Thất bại:', error);
    process.exit(1);
  });
