import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAccounts() {
  console.log('🔍 KIỂM TRA TÀI KHOẢN HIỆN CÓ TRONG HỆ THỐNG\n');
  console.log('='.repeat(80));
  
  // 1. Kiểm tra tất cả users
  const users = await prisma.users.findMany({
    include: {
      user_roles_user_roles_user_idTousers: {
        include: {
          roles: true
        }
      }
    },
    orderBy: {
      created_at: 'asc'
    }
  });
  
  console.log('\n📊 DANH SÁCH TÀI KHOẢN:\n');
  
  users.forEach((user, index) => {
    const roles = user.user_roles_user_roles_user_idTousers.map(ur => ur.roles.code).join(', ');
    const roleNames = user.user_roles_user_roles_user_idTousers.map(ur => ur.roles.name).join(', ');
    
    console.log(`${index + 1}. ${user.email}`);
    console.log(`   👤 Tên: ${user.display_name || 'Chưa có'}`);
    console.log(`   🎭 Role Code: ${roles || 'Chưa gán role'}`);
    console.log(`   📛 Role Name: ${roleNames || 'Chưa gán role'}`);
    console.log(`   📱 SĐT: ${user.phone || 'Chưa có'}`);
    console.log(`   ✅ Trạng thái: ${user.status}`);
    console.log(`   🆔 User ID: ${user.id}`);
    console.log('');
  });
  
  console.log('='.repeat(80));
  console.log(`\n✅ Tổng cộng: ${users.length} tài khoản\n`);
  
  // 2. Thống kê theo role
  console.log('='.repeat(80));
  console.log('\n🎭 THỐNG KÊ THEO ROLE:\n');
  
  const roles = await prisma.roles.findMany({
    include: {
      _count: {
        select: {
          user_roles: true
        }
      }
    },
    orderBy: {
      level: 'desc'
    }
  });
  
  console.log('Role Code            | Level | Users | Tên Role');
  console.log('-'.repeat(80));
  
  roles.forEach(role => {
    const code = role.code.padEnd(20);
    const level = String(role.level).padStart(5);
    const count = String(role._count.user_roles).padStart(5);
    console.log(`${code} | ${level} | ${count} | ${role.name}`);
  });
  
  console.log('='.repeat(80));
  console.log(`\n✅ Tổng cộng: ${roles.length} roles\n`);
  
  // 3. Danh sách role chưa có user
  const rolesWithoutUsers = roles.filter(r => r._count.user_roles === 0);
  
  if (rolesWithoutUsers.length > 0) {
    console.log('⚠️  ROLES CHƯA CÓ USER:\n');
    rolesWithoutUsers.forEach(r => {
      console.log(`   - ${r.code} (${r.name})`);
    });
    console.log('');
  }
  
  // 4. Users chưa có role
  const usersWithoutRoles = users.filter(u => u.user_roles_user_roles_user_idTousers.length === 0);
  
  if (usersWithoutRoles.length > 0) {
    console.log('⚠️  USERS CHƯA ĐƯỢC GÁN ROLE:\n');
    usersWithoutRoles.forEach(u => {
      console.log(`   - ${u.email} (${u.display_name})`);
    });
    console.log('');
  }
  
  console.log('='.repeat(80));
  console.log('✅ Kiểm tra hoàn tất!\n');
}

checkAccounts()
  .catch(e => {
    console.error('❌ Lỗi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
