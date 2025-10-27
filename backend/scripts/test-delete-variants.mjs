import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDeleteNoQuotes() {
  try {
    console.log('Test 1: Với dấu ngoặc kép');
    try {
      const r1 = await prisma.$executeRawUnsafe(`
        DELETE FROM "role_permissions" WHERE "role_id" = '${roleId}'
      `, 'role-config');
      console.log('✅ Success:', r1);
    } catch (e) {
      console.log('❌ Failed:', e.message);
    }
    
    console.log('\nTest 2: Không dấu ngoặc kép');
    try {
      const r2 = await prisma.$executeRawUnsafe(
        `DELETE FROM role_permissions WHERE role_id = '${roleId}'`,
        'role-config'
      );
      console.log('✅ Success:', r2);
    } catch (e) {
      console.log('❌ Failed:', e.message);
    }
    
    console.log('\nTest 3: Dùng prisma.delete');
    try {
      const r3 = await prisma.$queryRawUnsafe(
        `DELETE FROM role_permissions WHERE role_id = 'role-config' RETURNING *`
      );
      console.log('✅ Success:', r3);
    } catch (e) {
      console.log('❌ Failed:', e.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDeleteNoQuotes();
