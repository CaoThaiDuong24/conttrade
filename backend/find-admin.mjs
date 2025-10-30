import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findAdmin() {
  console.log('\n🔍 SEARCHING FOR ADMIN ACCOUNTS');
  console.log('='.repeat(60));
  
  // Find all admin users
  const adminUsers = await prisma.users.findMany({
    where: {
      user_roles_user_roles_user_idTousers: {
        some: {
          roles: {
            code: 'admin'
          }
        }
      }
    },
    select: {
      id: true,
      email: true,
      phone: true,
      display_name: true,
      status: true,
      permissions_updated_at: true,
      last_login_at: true,
      user_roles_user_roles_user_idTousers: {
        include: {
          roles: true
        }
      }
    }
  });
  
  console.log(`\nFound ${adminUsers.length} admin account(s):\n`);
  
  adminUsers.forEach((user, i) => {
    console.log(`${i + 1}. ${user.email || user.phone}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Display Name: ${user.display_name}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Roles: ${user.user_roles_user_roles_user_idTousers.map(ur => ur.roles.code).join(', ')}`);
    console.log(`   Last Login: ${user.last_login_at || 'Never'}`);
    console.log(`   Perms Updated: ${user.permissions_updated_at || 'NULL'}`);
    console.log('');
  });
  
  await prisma.$disconnect();
}

findAdmin().catch(console.error);
