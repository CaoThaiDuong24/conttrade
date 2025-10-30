import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetAdminToken() {
  console.log('\n🔧 RESET ADMIN TOKEN - CLEAR permissions_updated_at');
  console.log('='.repeat(60));
  
  // Find admin user
  const admin = await prisma.users.findFirst({
    where: { email: 'admin@i-contexchange.vn' },
    select: {
      id: true,
      email: true,
      permissions_updated_at: true
    }
  });
  
  if (!admin) {
    console.log('❌ Admin not found');
    await prisma.$disconnect();
    return;
  }
  
  console.log('\n📋 Admin hiện tại:');
  console.log('   Email:', admin.email);
  console.log('   permissions_updated_at:', admin.permissions_updated_at || 'NULL');
  
  if (admin.permissions_updated_at) {
    console.log('\n⚠️  Token đang bị INVALIDATED!');
    console.log('   Đang reset về NULL...');
    
    await prisma.users.update({
      where: { id: admin.id },
      data: {
        permissions_updated_at: null,
        updated_at: new Date()
      }
    });
    
    console.log('✅ ĐÃ RESET THÀNH CÔNG!');
    console.log('\n📝 Bây giờ làm theo:');
    console.log('   1. Refresh trang (F5)');
    console.log('   2. HOẶC đăng xuất và đăng nhập lại');
    console.log('   3. Token mới sẽ hoạt động bình thường');
  } else {
    console.log('\n✅ permissions_updated_at đã là NULL');
    console.log('   Token KHÔNG bị invalidate');
    console.log('\n⚠️  Nếu vẫn bị popup, có thể do:');
    console.log('   1. Token đã HẾT HẠN (> 7 ngày)');
    console.log('   2. Token được issue TRƯỚC KHI chạy fix code');
    console.log('\n💡 Giải pháp: ĐĂNG NHẬP LẠI để lấy token mới');
  }
  
  await prisma.$disconnect();
}

resetAdminToken().catch(console.error);
