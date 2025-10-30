import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script tự động điều chỉnh permissions cho buyer và seller
 * để menu hiển thị đúng với vai trò của từng role
 */

// Permissions hợp lý cho BUYER (người mua)
const BUYER_PERMISSIONS = [
  // Xem và tìm kiếm
  'PM-001', // VIEW_PUBLIC_LISTINGS
  'PM-002', // SEARCH_LISTINGS
  'PM-003', // VIEW_SELLER_PROFILE
  
  // RFQ - Buyer tạo RFQ
  'PM-020', // CREATE_RFQ ✅
  'PM-022', // VIEW_QUOTES ✅
  
  // Inspection
  'PM-030', // REQUEST_INSPECTION ✅
  'PM-031', // VIEW_INSPECTION_REPORT
  
  // Orders - Buyer tạo đơn hàng
  'PM-040', // CREATE_ORDER ✅
  'PM-043', // CONFIRM_RECEIPT ✅
  
  // Payments
  'PM-041', // PAY_ESCROW ✅
  
  // Delivery - Buyer yêu cầu vận chuyển
  'PM-042', // REQUEST_DELIVERY ✅
  
  // Reviews & Disputes
  'PM-050', // RATE_AND_REVIEW ✅
  'PM-060', // FILE_DISPUTE ✅
];

// Permissions hợp lý cho SELLER (người bán)
const SELLER_PERMISSIONS = [
  // Xem và tìm kiếm
  'PM-001', // VIEW_PUBLIC_LISTINGS
  'PM-002', // SEARCH_LISTINGS
  'PM-003', // VIEW_SELLER_PROFILE
  
  // Listing Management - SELLER tạo và quản lý tin đăng
  'PM-010', // CREATE_LISTING ✅
  'PM-011', // EDIT_LISTING ✅
  'PM-012', // PUBLISH_LISTING ✅
  'PM-013', // ARCHIVE_LISTING ✅
  'PM-014', // DELETE_LISTING ✅
  
  // RFQ & Quotes - SELLER nhận RFQ và tạo báo giá
  'PM-021', // ISSUE_QUOTE ✅
  'PM-022', // VIEW_QUOTES ✅
  'PM-023', // MANAGE_QA ✅
  
  // Orders - Seller xem và quản lý đơn hàng
  'PM-040', // CREATE_ORDER (seller cũng có thể tạo đơn)
  
  // Delivery - Seller xem thông tin vận chuyển
  'PM-042B', // VIEW_DELIVERY (nếu có)
  
  // Reviews
  'PM-050', // RATE_AND_REVIEW ✅
  
  // Billing/Invoices - Seller xem hóa đơn
  'PM-091B', // VIEW_SELLER_INVOICES (nếu có)
  'PM-090', // FINANCE_RECONCILE (có thể cần cho seller xem doanh thu)
];

async function fixPermissions() {
  console.log('\n🔧 BẮT ĐẦU ĐIỀU CHỈNH PERMISSIONS\n');
  console.log('='.repeat(80));

  try {
    // Get buyer and seller roles
    const buyerRole = await prisma.roles.findFirst({
      where: { code: 'buyer' },
      include: {
        role_permissions: {
          include: { permissions: true }
        }
      }
    });

    const sellerRole = await prisma.roles.findFirst({
      where: { code: 'seller' },
      include: {
        role_permissions: {
          include: { permissions: true }
        }
      }
    });

    if (!buyerRole || !sellerRole) {
      console.log('❌ Không tìm thấy buyer hoặc seller role');
      return;
    }

    console.log('\n📊 TRẠNG THÁI HIỆN TẠI:\n');
    console.log(`Buyer: ${buyerRole.role_permissions.length} permissions`);
    console.log(`Seller: ${sellerRole.role_permissions.length} permissions`);

    // Get all permissions
    const allPermissions = await prisma.permissions.findMany();
    const permissionMap = {};
    allPermissions.forEach(p => {
      permissionMap[p.code] = p.id;
    });

    // ===== FIX BUYER PERMISSIONS =====
    console.log('\n\n🔵 ĐIỀU CHỈNH BUYER PERMISSIONS:\n');
    
    const currentBuyerPerms = buyerRole.role_permissions.map(rp => rp.permissions.code);
    const permsToRemoveFromBuyer = currentBuyerPerms.filter(p => !BUYER_PERMISSIONS.includes(p));
    const permsToAddToBuyer = BUYER_PERMISSIONS.filter(p => !currentBuyerPerms.includes(p) && permissionMap[p]);

    if (permsToRemoveFromBuyer.length > 0) {
      console.log(`❌ Xóa ${permsToRemoveFromBuyer.length} permissions không phù hợp:`);
      permsToRemoveFromBuyer.forEach(p => console.log(`   - ${p}`));
      
      for (const permCode of permsToRemoveFromBuyer) {
        const permId = permissionMap[permCode];
        if (permId) {
          await prisma.role_permissions.deleteMany({
            where: {
              role_id: buyerRole.id,
              permission_id: permId
            }
          });
        }
      }
      console.log('✅ Đã xóa');
    } else {
      console.log('✅ Không có permission nào cần xóa');
    }

    if (permsToAddToBuyer.length > 0) {
      console.log(`\n➕ Thêm ${permsToAddToBuyer.length} permissions còn thiếu:`);
      permsToAddToBuyer.forEach(p => console.log(`   + ${p}`));
      
      for (const permCode of permsToAddToBuyer) {
        const permId = permissionMap[permCode];
        if (permId) {
          await prisma.role_permissions.create({
            data: {
              role_id: buyerRole.id,
              permission_id: permId
            }
          });
        }
      }
      console.log('✅ Đã thêm');
    } else {
      console.log('\n✅ Không có permission nào cần thêm');
    }

    // Update buyer role version
    await prisma.roles.update({
      where: { id: buyerRole.id },
      data: {
        role_version: buyerRole.role_version + 1,
        updated_at: new Date()
      }
    });

    // ===== FIX SELLER PERMISSIONS =====
    console.log('\n\n🟠 ĐIỀU CHỈNH SELLER PERMISSIONS:\n');
    
    const currentSellerPerms = sellerRole.role_permissions.map(rp => rp.permissions.code);
    const permsToRemoveFromSeller = currentSellerPerms.filter(p => !SELLER_PERMISSIONS.includes(p));
    const permsToAddToSeller = SELLER_PERMISSIONS.filter(p => !currentSellerPerms.includes(p) && permissionMap[p]);

    if (permsToRemoveFromSeller.length > 0) {
      console.log(`❌ Xóa ${permsToRemoveFromSeller.length} permissions không phù hợp:`);
      permsToRemoveFromSeller.forEach(p => console.log(`   - ${p}`));
      
      for (const permCode of permsToRemoveFromSeller) {
        const permId = permissionMap[permCode];
        if (permId) {
          await prisma.role_permissions.deleteMany({
            where: {
              role_id: sellerRole.id,
              permission_id: permId
            }
          });
        }
      }
      console.log('✅ Đã xóa');
    } else {
      console.log('✅ Không có permission nào cần xóa');
    }

    if (permsToAddToSeller.length > 0) {
      console.log(`\n➕ Thêm ${permsToAddToSeller.length} permissions còn thiếu:`);
      permsToAddToSeller.forEach(p => console.log(`   + ${p}`));
      
      for (const permCode of permsToAddToSeller) {
        const permId = permissionMap[permCode];
        if (permId) {
          await prisma.role_permissions.create({
            data: {
              role_id: sellerRole.id,
              permission_id: permId
            }
          });
        }
      }
      console.log('✅ Đã thêm');
    } else {
      console.log('\n✅ Không có permission nào cần thêm');
    }

    // Update seller role version
    await prisma.roles.update({
      where: { id: sellerRole.id },
      data: {
        role_version: sellerRole.role_version + 1,
        updated_at: new Date()
      }
    });

    // Force users to re-login by updating permissions_updated_at
    console.log('\n\n🔄 BẮT BUỘC USERS ĐỂ LOGIN LẠI:\n');
    
    const buyerUsers = await prisma.users.updateMany({
      where: {
        user_roles_user_roles_user_idTousers: {
          some: {
            role_id: buyerRole.id
          }
        }
      },
      data: {
        permissions_updated_at: new Date()
      }
    });

    const sellerUsers = await prisma.users.updateMany({
      where: {
        user_roles_user_roles_user_idTousers: {
          some: {
            role_id: sellerRole.id
          }
        }
      },
      data: {
        permissions_updated_at: new Date()
      }
    });

    console.log(`✅ Đã cập nhật ${buyerUsers.count} buyer users`);
    console.log(`✅ Đã cập nhật ${sellerUsers.count} seller users`);

    // Verify final state
    console.log('\n\n📊 TRẠNG THÁI SAU KHI ĐIỀU CHỈNH:\n');
    
    const updatedBuyer = await prisma.roles.findFirst({
      where: { code: 'buyer' },
      include: {
        role_permissions: {
          include: { permissions: true }
        }
      }
    });

    const updatedSeller = await prisma.roles.findFirst({
      where: { code: 'seller' },
      include: {
        role_permissions: {
          include: { permissions: true }
        }
      }
    });

    console.log('=== BUYER ===');
    console.log(`Total: ${updatedBuyer.role_permissions.length} permissions`);
    updatedBuyer.role_permissions.forEach((rp, i) => {
      console.log(`  ${(i+1).toString().padStart(2)}. ${rp.permissions.code.padEnd(10)} - ${rp.permissions.name}`);
    });

    console.log('\n=== SELLER ===');
    console.log(`Total: ${updatedSeller.role_permissions.length} permissions`);
    updatedSeller.role_permissions.forEach((rp, i) => {
      console.log(`  ${(i+1).toString().padStart(2)}. ${rp.permissions.code.padEnd(10)} - ${rp.permissions.name}`);
    });

    console.log('\n\n✅ HOÀN TẤT!\n');
    console.log('📝 Lưu ý: Users cần đăng nhập lại để cập nhật permissions mới');
    console.log('\n');

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixPermissions();
