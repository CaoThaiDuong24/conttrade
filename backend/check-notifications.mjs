import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: './environment.env' });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkNotifications() {
  try {
    console.log('🔍 Đang kiểm tra thông báo trong database...\n');
    
    const notifications = await prisma.notification.findMany({
      orderBy: {
        created_at: 'desc'
      },
      take: 10
    });
    
    console.log(`📊 Tổng số thông báo (10 mới nhất):\n`);
    
    if (notifications.length === 0) {
      console.log('❌ Không có thông báo nào trong database!\n');
      console.log('💡 Gợi ý: Hãy tạo một thông báo test để kiểm tra hệ thống.\n');
    } else {
      notifications.forEach((notif, index) => {
        console.log(`\n${index + 1}. Thông báo ID: ${notif.id}`);
        console.log(`   📝 Tiêu đề: ${notif.title}`);
        console.log(`   💬 Nội dung: ${notif.message}`);
        console.log(`   👤 User ID: ${notif.user_id}`);
        console.log(`   🔔 Loại: ${notif.type}`);
        console.log(`   ✅ Đã đọc: ${notif.read ? 'Có' : 'Không'}`);
        console.log(`   📅 Tạo lúc: ${notif.created_at}`);
        if (notif.data) {
          console.log(`   📦 Data: ${JSON.stringify(notif.data)}`);
        }
      });
    }
    
    // Count unread notifications
    const unreadCount = await prisma.notification.count({
      where: { read: false }
    });
    
    console.log(`\n📌 Tổng số thông báo chưa đọc: ${unreadCount}`);
    
    // Count by user
    const notificationsByUser = await prisma.notification.groupBy({
      by: ['user_id'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });
    
    console.log('\n👥 Thông báo theo User:');
    notificationsByUser.forEach(item => {
      console.log(`   User ${item.user_id}: ${item._count.id} thông báo`);
    });
    
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNotifications();
