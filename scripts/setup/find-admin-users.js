const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findAdminUsers() {
  try {
    const users = await prisma.users.findMany({
      where: {
        user_roles_user_roles_user_idTousers: {
          some: {
            roles: { code: 'admin' }
          }
        }
      },
      select: {
        id: true,
        email: true,
        display_name: true,
        status: true
      }
    });
    
    console.log('Admin users:', JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findAdminUsers();
