import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createNotificationsForAllUsers() {
  try {
    console.log('🧪 Tạo notifications cho TẤT CẢ users...\n');

    // Lấy tất cả users
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        display_name: true
      }
    });
    
    // Lấy roles của users
    const userRolesData = await prisma.user_roles.findMany({
      include: {
        md_roles: {
          select: {
            code: true
          }
        }
      }
    });
    
    // Map user_id -> roles
    const userRolesMap = {};
    userRolesData.forEach(ur => {
      if (!userRolesMap[ur.user_id]) {
        userRolesMap[ur.user_id] = [];
      }
      userRolesMap[ur.user_id].push(ur.md_roles?.code);
    });

    if (users.length === 0) {
      console.log('❌ Không tìm thấy users trong database');
      return;
    }

    console.log(`✅ Tìm thấy ${users.length} users\n`);

    // Xóa TẤT CẢ notifications cũ
    await prisma.$executeRaw`DELETE FROM notifications`;
    console.log('🗑️  Đã xóa tất cả notifications cũ\n');

    // Notifications cho sellers
    const sellerNotifications = [
      {
        type: 'rfq_received',
        title: 'Yêu cầu báo giá mới',
        message: 'Bạn có yêu cầu báo giá mới cho sản phẩm "Container 20ft Standard"',
        data: { rfqId: 'test-rfq-001', listingId: 'test-listing-001', quantity: 10 }
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
      }
    ];

    // Notifications cho buyers
    const buyerNotifications = [
      {
        type: 'quote_received',
        title: 'Báo giá mới',
        message: 'Bạn có báo giá mới cho yêu cầu của mình (Container 40ft High Cube)',
        data: { quoteId: 'test-quote-001', rfqId: 'test-rfq-001', total: 15000000, currency: 'VND' }
      },
      {
        type: 'order_created',
        title: 'Đơn hàng mới',
        message: 'Bạn có đơn hàng mới #ORD-67890',
        data: { orderId: 'test-order-002', orderNumber: 'ORD-67890', total: 20000000 }
      }
    ];

    let created = 0;

    // Tạo notifications cho mỗi user
    for (const user of users) {
      const userRoles = userRolesMap[user.id] || [];
      const isSeller = userRoles.includes('seller');
      const isBuyer = userRoles.includes('buyer');
      
      console.log(`\n📝 User: ${user.email}`);
      console.log(`   Roles: ${userRoles.join(', ')}`);
      console.log(`   ID: ${user.id}`);

      let notificationsToCreate = [];

      // Nếu là seller, tạo seller notifications
      if (isSeller) {
        notificationsToCreate.push(...sellerNotifications);
        console.log('   → Tạo SELLER notifications');
      }

      // Nếu là buyer, tạo buyer notifications
      if (isBuyer) {
        notificationsToCreate.push(...buyerNotifications);
        console.log('   → Tạo BUYER notifications');
      }

      // Nếu không có role cụ thể, tạo cả 2
      if (!isSeller && !isBuyer) {
        notificationsToCreate.push(...sellerNotifications, ...buyerNotifications);
        console.log('   → Tạo TẤT CẢ notifications');
      }

      // Tạo notifications
      for (let i = 0; i < notificationsToCreate.length; i++) {
        const notif = notificationsToCreate[i];
        const notifId = `NOTIF-${Date.now()}-${user.id.slice(-4)}-${i}`;
        const isRead = Math.random() > 0.7; // 30% chance đã đọc
        
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
            NOW() - INTERVAL '${Math.floor(Math.random() * 6)} hours',
            NOW()
          )
        `;
        
        console.log(`   ✓ [${isRead ? '✓' : '✗'}] ${notif.type}`);
        created++;
        
        // Delay nhỏ để tránh trùng timestamp
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    console.log(`\n🎉 Đã tạo ${created} notifications cho ${users.length} users!`);
    
    // Hiển thị thống kê
    console.log('\n📊 Thống kê notifications:');
    const stats = await prisma.$queryRaw`
      SELECT 
        u.email,
        u.id,
        COUNT(n.id) as total,
        SUM(CASE WHEN n.read = FALSE THEN 1 ELSE 0 END) as unread
      FROM users u
      LEFT JOIN notifications n ON u.id = n.user_id
      GROUP BY u.id, u.email
      HAVING COUNT(n.id) > 0
      ORDER BY total DESC
    `;
    
    console.log('\n👥 Notifications per user:');
    stats.forEach(stat => {
      console.log(`   ${stat.email}: ${stat.total} total, ${stat.unread} unread`);
    });

    console.log('\n📋 Notification types:');
    const typeStats = await prisma.$queryRaw`
      SELECT 
        type,
        COUNT(*) as count
      FROM notifications
      GROUP BY type
      ORDER BY count DESC
    `;
    
    typeStats.forEach(stat => {
      console.log(`   ${stat.type}: ${stat.count}`);
    });

    console.log('\n✅ HOÀN THÀNH! Hãy login vào bất kỳ tài khoản nào để xem notifications.');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createNotificationsForAllUsers();
