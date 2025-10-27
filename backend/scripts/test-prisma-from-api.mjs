import prisma from '../dist/lib/prisma.js';

async function testPrismaFromAPI() {
  try {
    console.log('Database URL:', process.env.DATABASE_URL);
    console.log('\nTest Prisma instance from API lib:\n');
    
    const result = await prisma.role_permissions.deleteMany({
      where: {
        role_id: 'role-test-12345-not-exist'
      }
    });
    
    console.log('✅ Success:', result);
    
  } catch (error) {
    console.log('❌ Failed:', error.message);
    console.log('Code:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaFromAPI();
