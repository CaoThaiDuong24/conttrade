import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRolePermissionsSchema() {
  try {
    console.log('🔍 Kiểm tra schema của bảng role_permissions\n');

    // Lấy thông tin về columns
    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'role_permissions'
      ORDER BY ordinal_position
    `);

    console.log('📋 Columns trong bảng role_permissions:');
    console.table(result);

    // Test query một record
    console.log('\n📊 Lấy 1 record mẫu:');
    const sample = await prisma.$queryRawUnsafe(`
      SELECT * FROM role_permissions LIMIT 1
    `);
    
    if (sample && sample.length > 0) {
      console.log('Column names:', Object.keys(sample[0]));
      console.log('Data:', sample[0]);
    } else {
      console.log('Không có dữ liệu');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRolePermissionsSchema();
