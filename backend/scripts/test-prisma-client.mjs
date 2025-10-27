import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPrismaClient() {
  try {
    // Test với Prisma Client API
    console.log('Test 1: Sử dụng Prisma Client API\n');
    
    const result = await prisma.role_permissions.deleteMany({
      where: {
        roleId: 'role-config' // Try camelCase
      }
    });
    
    console.log('✅ Success with roleId (camelCase):', result);
    
  } catch (error) {
    console.log('❌ Failed with roleId:', error.message);
    
    try {
      console.log('\nTest 2: Try with role_id (snake_case)');
      const result2 = await prisma.role_permissions.deleteMany({
        where: {
          role_id: 'role-config'
        }
      });
      console.log('✅ Success with role_id:', result2);
    } catch (e2) {
      console.log('❌ Failed with role_id:', e2.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaClient();
