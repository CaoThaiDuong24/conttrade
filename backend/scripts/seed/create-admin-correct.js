import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

async function createAdminAccount() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 TẠO LẠI TÀI KHOẢN ADMIN...');
    console.log('='.repeat(50));
    
    // Hash password admin123
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Xóa admin cũ nếu tồn tại
    await prisma.users.deleteMany({
      where: { email: 'admin@i-contexchange.vn' }
    });
    
    // Tạo admin mới với mật khẩu đúng
    const newAdmin = await prisma.users.create({
      data: {
        id: 'admin-' + Date.now(),
        email: 'admin@i-contexchange.vn',
        password: hashedPassword,
        displayName: 'System Administrator',
        fullName: 'System Administrator',
        status: 'active',
        emailVerified: true,
        phoneVerified: true,
        kycStatus: 'verified',
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Tạo admin thành công:');
    console.log('Email:', newAdmin.email);
    console.log('Password: admin123');
    console.log('ID:', newAdmin.id);
    
    // Test ngay
    const testLogin = await bcrypt.compare('admin123', newAdmin.password);
    console.log('Test login với admin123:', testLogin ? '✅ OK' : '❌ Lỗi');
    
  } catch (error) {
    console.error('❌ Lỗi tạo admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminAccount();