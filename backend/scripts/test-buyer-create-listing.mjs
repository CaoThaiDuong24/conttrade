// Test script: Kiểm tra xem buyer có thể tạo listing sau khi được gán quyền CREATE_LISTING

import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function main() {
  try {
    console.log('\n=== TEST: BUYER CREATE LISTING PERMISSION ===\n');

    // 1. Find a buyer user
    const buyerRole = await prisma.roles.findFirst({
      where: { code: 'buyer' }
    });

    if (!buyerRole) {
      console.log('❌ BUYER role not found!');
      return;
    }

    const userWithBuyerRole = await prisma.user_roles.findFirst({
      where: { role_id: buyerRole.id },
      include: {
        users_user_roles_user_idTousers: {
          select: { id: true, email: true }
        }
      }
    });

    if (!userWithBuyerRole) {
      console.log('❌ No user with BUYER role found!');
      return;
    }

    const user = userWithBuyerRole.users_user_roles_user_idTousers;
    console.log(`📌 Testing with user: ${user.email} (ID: ${user.id})`);

    // 2. Get user's permissions
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

    const permissions = new Set();
    userRoles.forEach(ur => {
      ur.roles.role_permissions.forEach(rp => {
        permissions.add(rp.permissions.code);
      });
    });

    const permissionsArray = Array.from(permissions);
    console.log(`\n📋 User's current permissions (${permissionsArray.length}):`);
    permissionsArray.forEach(p => console.log(`   - ${p}`));

    // 3. Check if user has CREATE_LISTING permission
    const hasCreateListing = permissions.has('CREATE_LISTING');
    console.log(`\n🔍 Has CREATE_LISTING permission: ${hasCreateListing ? '✅ YES' : '❌ NO'}`);

    // 4. Generate JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      roles: userRoles.map(ur => ur.roles.code),
      permissions: permissionsArray
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });
    console.log(`\n🎫 Generated JWT token for testing`);

    // 5. Check permissions_updated_at
    const userInfo = await prisma.users.findUnique({
      where: { id: user.id },
      select: { 
        permissions_updated_at: true,
        updated_at: true
      }
    });

    console.log(`\n⏰ Timestamps:`);
    console.log(`   - permissions_updated_at: ${userInfo.permissions_updated_at || 'NULL'}`);
    console.log(`   - updated_at: ${userInfo.updated_at}`);

    // 6. Instructions
    console.log(`\n📝 HƯỚNG DẪN TEST:\n`);
    console.log(`1. Đăng nhập với user: ${user.email}`);
    console.log(`2. Thử tạo tin đăng mới`);
    
    if (hasCreateListing) {
      console.log(`3. ✅ EXPECTED: Cho phép tạo tin đăng (có quyền CREATE_LISTING)`);
    } else {
      console.log(`3. ❌ EXPECTED: Bị từ chối với lỗi 403 - PERMISSION_DENIED`);
      console.log(`\n🔧 Để cấp quyền, chạy:`);
      console.log(`   - Vào trang Admin > RBAC > Roles`);
      console.log(`   - Chọn role BUYER`);
      console.log(`   - Thêm permission CREATE_LISTING (PM-010)`);
      console.log(`   - Sau đó user cần LOGOUT và LOGIN LẠI để nhận quyền mới`);
    }

    console.log(`\n🧪 Test token (copy để test API):`);
    console.log(`Bearer ${token}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
