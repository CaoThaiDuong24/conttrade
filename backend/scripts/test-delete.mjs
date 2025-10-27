import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDelete() {
  try {
    // Test query xem có data không
    const before = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM "role_permissions" WHERE "role_id" = $1
    `, 'role-buyer');
    
    console.log('Before delete:', before);
    
    // Test delete
    const result = await prisma.$executeRawUnsafe(`
      DELETE FROM "role_permissions" WHERE "role_id" = $1
    `, 'role-buyer');
    
    console.log('Delete result:', result);
    
    const after = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM "role_permissions" WHERE "role_id" = $1
    `, 'role-buyer');
    
    console.log('After delete:', after);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDelete();
