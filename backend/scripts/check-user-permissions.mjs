import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserPermissions() {
  try {
    console.log('=== KIỂM TRA CƠ CHẾ PHÂN QUYỀN ===\n');

    // 1. Kiểm tra user buyer
    const buyer = await prisma.users.findFirst({
      where: { email: 'buyer@example.com' },
      include: {
        user_roles_user_roles_user_idTousers: {
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
        }
      }
    });

    if (buyer) {
      console.log('👤 USER: Buyer');
      console.log('Email:', buyer.email);
      console.log('Display Name:', buyer.display_name);
      
      console.log('\n📋 ROLES:');
      buyer.user_roles_user_roles_user_idTousers.forEach(ur => {
        console.log(`  - ${ur.roles.name} (${ur.roles.code})`);
        console.log(`    Level: ${ur.roles.level}`);
        console.log(`    Permissions: ${ur.roles.role_permissions.length}`);
      });

      const allPermissions = buyer.user_roles_user_roles_user_idTousers.flatMap(ur => 
        ur.roles.role_permissions.map(rp => rp.permissions.code)
      );
      console.log('\n🔑 TOTAL PERMISSIONS:', allPermissions.length);
      console.log('Permissions:', allPermissions.slice(0, 10).join(', '), '...\n');
    }

    // 2. Kiểm tra seller
    const seller = await prisma.users.findFirst({
      where: { email: 'seller@example.com' },
      include: {
        user_roles_user_roles_user_idTousers: {
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
        }
      }
    });

    if (seller) {
      console.log('👤 USER: Seller');
      console.log('Email:', seller.email);
      console.log('Display Name:', seller.display_name);
      
      console.log('\n📋 ROLES:');
      seller.user_roles_user_roles_user_idTousers.forEach(ur => {
        console.log(`  - ${ur.roles.name} (${ur.roles.code})`);
        console.log(`    Level: ${ur.roles.level}`);
        console.log(`    Permissions: ${ur.roles.role_permissions.length}`);
      });

      const allPermissions = seller.user_roles_user_roles_user_idTousers.flatMap(ur => 
        ur.roles.role_permissions.map(rp => rp.permissions.code)
      );
      console.log('\n🔑 TOTAL PERMISSIONS:', allPermissions.length);
      console.log('Permissions:', allPermissions.slice(0, 10).join(', '), '...\n');
    }

    // 3. Kiểm tra cơ chế lấy permissions
    console.log('=== CƠ CHẾ LẤY PERMISSIONS ===\n');
    console.log('✅ Khi bạn thay đổi permissions của role trong menu RBAC:');
    console.log('');
    console.log('1️⃣ Thay đổi được LƯU vào bảng `role_permissions`');
    console.log('   (Quan hệ many-to-many giữa roles và permissions)');
    console.log('');
    console.log('2️⃣ Tài khoản người dùng KHÔNG LƯU permissions trực tiếp');
    console.log('   (Chỉ lưu role_id trong bảng `user_roles`)');
    console.log('');
    console.log('3️⃣ Permissions được TÍNH ĐỘNG mỗi khi:');
    console.log('   - User đăng nhập (login)');
    console.log('   - Refresh token');
    console.log('   - Kiểm tra quyền (hasPermission)');
    console.log('   - Gọi API được bảo vệ');
    console.log('');
    console.log('4️⃣ Luồng hoạt động:');
    console.log('   User -> user_roles -> roles -> role_permissions -> permissions');
    console.log('');
    console.log('📊 VÍ DỤ:');
    console.log('   - Admin sửa role "buyer" từ 10 permissions thành 15 permissions');
    console.log('   - Tất cả users có role "buyer" TỰ ĐỘNG có 15 permissions');
    console.log('   - KHÔNG CẦN cập nhật từng user');
    console.log('   - Permissions tính real-time từ database');
    console.log('');
    console.log('⚠️ LƯU Ý:');
    console.log('   - Users đang login sẽ có token cũ (chứa permissions cũ)');
    console.log('   - Token hết hạn sau 24h');
    console.log('   - Để áp dụng ngay: logout và login lại');
    console.log('   - Hoặc đợi token tự động refresh\n');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserPermissions();
