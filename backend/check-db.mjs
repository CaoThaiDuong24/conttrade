// Test RBAC API directly with database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database...\n');

    // Check roles
    const rolesCount = await prisma.roles.count();
    console.log(`📊 Total roles: ${rolesCount}`);

    if (rolesCount > 0) {
      const roles = await prisma.roles.findMany({
        include: {
          role_permissions: true,
          user_roles: true
        }
      });

      console.log('\n✅ Roles in database:');
      roles.forEach(role => {
        console.log(`  - ${role.code}: ${role.name} (Level ${role.level})`);
        console.log(`    Permissions: ${role.role_permissions.length}`);
        console.log(`    Users: ${role.user_roles.length}`);
      });
    } else {
      console.log('\n⚠️  No roles found! Need to run seed script.');
    }

    // Check users
    const usersCount = await prisma.users.count();
    console.log(`\n👥 Total users: ${usersCount}`);

    if (usersCount > 0) {
      const adminUser = await prisma.users.findFirst({
        where: { email: 'admin@i-contexchange.vn' }
      });
      
      if (adminUser) {
        console.log('\n✅ Admin user exists:', adminUser.email);
      } else {
        console.log('\n⚠️  Admin user NOT found!');
      }
    }

    // Check permissions
    const permissionsCount = await prisma.permissions.count();
    console.log(`\n🔐 Total permissions: ${permissionsCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
