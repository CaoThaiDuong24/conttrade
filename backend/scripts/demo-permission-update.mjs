import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function demonstratePermissionUpdate() {
  try {
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║  DEMO: THAY ĐỔI PERMISSIONS TỰ ĐỘNG ẢNH HƯỞNG ĐẾN TẤT CẢ USERS  ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');

    // 1. Lấy thông tin role "buyer" TRƯỚC khi thay đổi
    console.log('📊 BƯỚC 1: KIỂM TRA TRẠNG THÁI BAN ĐẦU\n');
    
    const buyerRole = await prisma.roles.findFirst({
      where: { code: 'buyer' },
      include: {
        role_permissions: {
          include: {
            permissions: true
          }
        },
        user_roles: {
          include: {
            users_user_roles_user_idTousers: {
              select: {
                id: true,
                email: true,
                display_name: true
              }
            }
          }
        }
      }
    });

    if (!buyerRole) {
      console.log('❌ Không tìm thấy role "buyer"');
      return;
    }

    console.log(`📋 Role: ${buyerRole.name} (${buyerRole.code})`);
    console.log(`   Level: ${buyerRole.level}`);
    console.log(`   Số Permissions: ${buyerRole.role_permissions.length}`);
    console.log(`   Số Users có role này: ${buyerRole.user_roles.length}\n`);

    console.log('👥 Danh sách Users có role "buyer":');
    buyerRole.user_roles.forEach((ur, index) => {
      console.log(`   ${index + 1}. ${ur.users_user_roles_user_idTousers.email}`);
      console.log(`      └─ ${ur.users_user_roles_user_idTousers.display_name}`);
    });

    console.log('\n🔑 Permissions hiện tại:');
    const currentPermissions = buyerRole.role_permissions.map(rp => rp.permissions.code);
    console.log('   ', currentPermissions.join(', '));

    // 2. Demo thêm permission mới (giả lập)
    console.log('\n\n📝 BƯỚC 2: DEMO THAY ĐỔI PERMISSIONS\n');
    console.log('⚠️  Giả lập scenario: Admin thêm permission "PM-999" (Test Permission)');
    console.log('   vào role "buyer" qua UI\n');

    // Tìm hoặc tạo permission test
    let testPermission = await prisma.permissions.findFirst({
      where: { code: 'PM-999' }
    });

    if (!testPermission) {
      console.log('   → Tạo permission mới "PM-999"...');
      const { randomUUID } = await import('crypto');
      testPermission = await prisma.permissions.create({
        data: {
          id: randomUUID(),
          code: 'PM-999',
          name: 'Test Permission',
          description: 'Permission test để demo cơ chế dynamic',
          category: 'SYSTEM',
          updated_at: new Date()
        }
      });
      console.log('   ✅ Đã tạo permission "PM-999"\n');
    } else {
      console.log('   ℹ️  Permission "PM-999" đã tồn tại\n');
    }

    // Kiểm tra xem permission đã được gán chưa
    const existingAssignment = await prisma.role_permissions.findFirst({
      where: {
        role_id: buyerRole.id,
        permission_id: testPermission.id
      }
    });

    if (existingAssignment) {
      console.log('   → Permission "PM-999" ĐÃ được gán cho role "buyer"');
      console.log('   → Sẽ XÓA để demo quá trình thêm mới...\n');
      
      await prisma.role_permissions.delete({
        where: { id: existingAssignment.id }
      });
      
      console.log('   ✅ Đã xóa assignment cũ\n');
    }

    // 3. Kiểm tra permissions của TẤT CẢ users TRƯỚC khi thay đổi
    console.log('\n📊 BƯỚC 3: PERMISSIONS CỦA USERS TRƯỚC KHI THAY ĐỔI\n');

    for (const userRole of buyerRole.user_roles) {
      const user = await prisma.users.findUnique({
        where: { id: userRole.user_id },
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

      const userPermissions = user.user_roles_user_roles_user_idTousers.flatMap(ur =>
        ur.roles.role_permissions.map(rp => rp.permissions.code)
      );

      const hasPM999 = userPermissions.includes('PM-999');

      console.log(`   ${user.email}:`);
      console.log(`   └─ Tổng permissions: ${userPermissions.length}`);
      console.log(`   └─ Có "PM-999"? ${hasPM999 ? '✅ CÓ' : '❌ KHÔNG'}\n`);
    }

    // 4. THỰC HIỆN THAY ĐỔI
    console.log('\n🔧 BƯỚC 4: THỰC HIỆN THAY ĐỔI (Giống như Admin click "Lưu")\n');
    console.log('   → Đang thêm permission "PM-999" vào role "buyer"...\n');

    const { randomUUID } = await import('crypto');
    await prisma.role_permissions.create({
      data: {
        id: randomUUID(),
        role_id: buyerRole.id,
        permission_id: testPermission.id,
        scope: 'GLOBAL'
      }
    });

    console.log('   ✅ ĐÃ THÊM PERMISSION "PM-999" VÀO ROLE "BUYER"\n');

    // 5. Kiểm tra permissions của TẤT CẢ users SAU khi thay đổi
    console.log('\n📊 BƯỚC 5: PERMISSIONS CỦA USERS SAU KHI THAY ĐỔI\n');

    for (const userRole of buyerRole.user_roles) {
      const user = await prisma.users.findUnique({
        where: { id: userRole.user_id },
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

      const userPermissions = user.user_roles_user_roles_user_idTousers.flatMap(ur =>
        ur.roles.role_permissions.map(rp => rp.permissions.code)
      );

      const hasPM999 = userPermissions.includes('PM-999');

      console.log(`   ${user.email}:`);
      console.log(`   └─ Tổng permissions: ${userPermissions.length}`);
      console.log(`   └─ Có "PM-999"? ${hasPM999 ? '✅ CÓ' : '❌ KHÔNG'}`);
      
      if (hasPM999) {
        console.log(`   └─ 🎉 TỰ ĐỘNG NHẬN PERMISSION MỚI!\n`);
      } else {
        console.log(`   └─ ⚠️ Chưa có permission\n`);
      }
    }

    // 6. Kết luận
    console.log('\n╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                         KẾT LUẬN                                 ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');
    
    console.log('✅ CHỨNG MINH:');
    console.log('   1. Admin thay đổi permissions của role "buyer"');
    console.log('   2. TẤT CẢ users có role "buyer" TỰ ĐỘNG nhận permissions mới');
    console.log('   3. KHÔNG CẦN cập nhật từng user riêng lẻ');
    console.log('   4. Permissions được TÍNH ĐỘNG từ database\n');

    console.log('⚠️ LƯU Ý:');
    console.log('   - Users đang login sẽ có JWT token cũ (permissions cũ)');
    console.log('   - Để áp dụng ngay: logout và login lại');
    console.log('   - Hoặc đợi token hết hạn (24h) để auto refresh\n');

    console.log('🔄 Hệ thống sử dụng: DYNAMIC PERMISSIONS (Phân quyền động)\n');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

demonstratePermissionUpdate();
