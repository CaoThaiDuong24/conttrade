import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanupTestNotifications() {
  try {
    console.log('🧹 Xóa TẤT CẢ test notifications...\n');

    // Xóa tất cả notifications
    const result = await prisma.$executeRaw`DELETE FROM notifications`;
    
    console.log(`✅ Đã xóa ${result} test notifications`);
    console.log('\n📋 Bây giờ hệ thống SẼ CHỈ hiển thị notifications THẬT từ:');
    console.log('   - RFQ mới được tạo');
    console.log('   - Quote mới được tạo');
    console.log('   - Quote được accept');
    console.log('   - Quote được reject');
    console.log('\n🎯 Để test với dữ liệu thật:');
    console.log('   1. Login với tài khoản Buyer');
    console.log('   2. Tạo RFQ mới cho một listing');
    console.log('   3. Seller sẽ nhận notification THẬT');
    console.log('   4. Seller tạo Quote');
    console.log('   5. Buyer sẽ nhận notification THẬT');
    console.log('\n✅ HOÀN TẤT! Hệ thống sẵn sàng với dữ liệu thật.');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupTestNotifications();
