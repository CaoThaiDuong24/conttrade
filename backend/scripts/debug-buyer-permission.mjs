import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n=== DEBUGGING BUYER CREATE_LISTING PERMISSION ===\n');

    // 1. Check if CREATE_LISTING permission exists
    const createListingPerm = await prisma.permissions.findFirst({
      where: { code: 'CREATE_LISTING' }
    });

    console.log('1. Permission CREATE_LISTING:');
    if (createListingPerm) {
      console.log(`   ✅ EXISTS - ID: ${createListingPerm.id}, Name: ${createListingPerm.name}`);
    } else {
      console.log('   ❌ NOT FOUND!');
      return;
    }

    // 2. Check buyer role
    const buyerRole = await prisma.roles.findFirst({
      where: { code: 'buyer' }
    });

    console.log('\n2. Buyer Role:');
    if (buyerRole) {
      console.log(`   ✅ EXISTS - ID: ${buyerRole.id}, Name: ${buyerRole.name}`);
    } else {
      console.log('   ❌ NOT FOUND!');
      return;
    }

    // 3. Check if buyer role has CREATE_LISTING permission
    const rolePermission = await prisma.role_permissions.findFirst({
      where: {
        role_id: buyerRole.id,
        permission_id: createListingPerm.id
      }
    });

    console.log('\n3. Buyer Role has CREATE_LISTING permission:');
    if (rolePermission) {
      console.log(`   ✅ YES - Assignment ID: ${rolePermission.id}`);
      console.log(`   Scope: ${rolePermission.scope}`);
    } else {
      console.log('   ❌ NO - Permission NOT assigned to buyer role!');
      console.log('\n   🔧 FIX: Admin cần vào /admin/rbac/roles và gán permission CREATE_LISTING cho role buyer');
    }

    // 4. Find a user with buyer role
    const userWithBuyerRole = await prisma.user_roles.findFirst({
      where: { role_id: buyerRole.id },
      include: {
        users_user_roles_user_idTousers: {
          select: {
            id: true,
            email: true,
            permissions_updated_at: true
          }
        }
      }
    });

    if (!userWithBuyerRole) {
      console.log('\n4. ❌ No user found with buyer role!');
      return;
    }

    const user = userWithBuyerRole.users_user_roles_user_idTousers;
    console.log(`\n4. Test User: ${user.email}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   permissions_updated_at: ${user.permissions_updated_at || 'NULL (chưa từng update)'}`);

    // 5. Get all permissions user should have
    const userRoles = await prisma.user_roles.findMany({
      where: { user_id: user.id },
      include: {
        roles: {
          include: {
            role_permissions: {
              include: {
                permissions: true
              }
            }
          }
        }
      }
    });

    const allPermissions = new Set();
    userRoles.forEach(ur => {
      ur.roles.role_permissions.forEach(rp => {
        allPermissions.add(rp.permissions.code);
      });
    });

    console.log(`\n5. User's Actual Permissions from Database (${allPermissions.size}):`);
    const permsArray = Array.from(allPermissions);
    permsArray.forEach(p => {
      if (p === 'CREATE_LISTING') {
        console.log(`   ✅ ${p} (REQUIRED FOR CREATING LISTINGS)`);
      } else {
        console.log(`   - ${p}`);
      }
    });

    const hasCreateListing = allPermissions.has('CREATE_LISTING');

    console.log('\n=== DIAGNOSIS ===\n');
    
    if (!hasCreateListing) {
      console.log('❌ PROBLEM: User KHÔNG có permission CREATE_LISTING trong database!');
      console.log('\n📋 GIẢI PHÁP:');
      console.log('   1. Admin login vào hệ thống');
      console.log('   2. Vào trang: http://localhost:3000/vi/admin/rbac/roles');
      console.log('   3. Click vào role "Người mua" (buyer)');
      console.log('   4. Tìm và check vào permission "CREATE_LISTING" hoặc "Tạo tin đăng"');
      console.log('   5. Lưu lại');
      console.log('   6. User phải LOGOUT và LOGIN LẠI để nhận token mới');
    } else {
      console.log('✅ User CÓ permission CREATE_LISTING trong database!');
      console.log('\n🔍 Nếu user vẫn không tạo được listing, kiểm tra:');
      console.log('   1. User đã LOGOUT và LOGIN LẠI chưa?');
      console.log('   2. Check token hiện tại có chứa CREATE_LISTING không:');
      console.log('      - Mở Console browser (F12)');
      console.log('      - Paste: localStorage.getItem("token")');
      console.log('      - Copy token và decode tại: https://jwt.io');
      console.log('      - Kiểm tra field "permissions" có chứa "CREATE_LISTING" không');
      console.log('   3. Nếu token không có CREATE_LISTING → LOGOUT và LOGIN LẠI');
      console.log('   4. Nếu vẫn lỗi, check console browser xem lỗi gì (F12 > Console)');
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
