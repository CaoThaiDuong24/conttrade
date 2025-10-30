import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// Permissions HỢP LÝ cho BUYER (người mua)
const BUYER_PERMISSIONS = [
  'PM-001', // VIEW_PUBLIC_LISTINGS
  'PM-002', // SEARCH_LISTINGS
  'PM-003', // VIEW_SELLER_PROFILE
  'PM-020', // CREATE_RFQ (buyer tạo RFQ)
  'PM-022', // VIEW_QUOTES (buyer xem báo giá)
  'PM-030', // REQUEST_INSPECTION (buyer yêu cầu giám định)
  'PM-031', // VIEW_INSPECTION_REPORT
  'PM-040', // CREATE_ORDER (buyer tạo đơn hàng)
  'PM-041', // PAY_ESCROW (buyer thanh toán)
  'PM-042', // REQUEST_DELIVERY (buyer yêu cầu vận chuyển)
  'PM-043', // CONFIRM_RECEIPT (buyer xác nhận nhận hàng)
  'PM-050', // RATE_AND_REVIEW (buyer đánh giá)
  'PM-060', // FILE_DISPUTE (buyer khiếu nại)
];

// Permissions HỢP LÝ cho SELLER (người bán)
const SELLER_PERMISSIONS = [
  'PM-001', // VIEW_PUBLIC_LISTINGS
  'PM-002', // SEARCH_LISTINGS
  'PM-003', // VIEW_SELLER_PROFILE
  'PM-010', // CREATE_LISTING (seller đăng tin)
  'PM-011', // EDIT_LISTING
  'PM-012', // PUBLISH_LISTING
  'PM-013', // ARCHIVE_LISTING
  'PM-014', // DELETE_LISTING
  'PM-021', // ISSUE_QUOTE (seller tạo báo giá)
  'PM-022', // VIEW_QUOTES
  'PM-023', // MANAGE_QA (seller quản lý Q&A)
  'PM-040', // CREATE_ORDER (seller cũng có thể tạo đơn)
  'PM-050', // RATE_AND_REVIEW
  'PM-090', // FINANCE_RECONCILE (seller xem doanh thu/hóa đơn)
];

async function setProperPermissions() {
  console.log('\n🎯 THIẾT LẬP PERMISSIONS HỢP LÝ CHO BUYER VÀ SELLER\n');
  console.log('='.repeat(80));

  try {
    const buyerRole = await prisma.roles.findFirst({ where: { code: 'buyer' } });
    const sellerRole = await prisma.roles.findFirst({ where: { code: 'seller' } });

    if (!buyerRole || !sellerRole) {
      console.log('❌ Không tìm thấy buyer hoặc seller role');
      return;
    }

    // Map permission codes to IDs
    const allPerms = await prisma.permissions.findMany();
    const permMap = {};
    allPerms.forEach(p => { permMap[p.code] = p.id; });

    // === BUYER ===
    console.log('\n🔵 BUYER ROLE:');
    await prisma.role_permissions.deleteMany({ where: { role_id: buyerRole.id } });
    console.log('  ❌ Xóa permissions cũ');

    let addedBuyer = 0;
    for (const code of BUYER_PERMISSIONS) {
      if (permMap[code]) {
        await prisma.role_permissions.create({
          data: {
            id: randomUUID(),
            role_id: buyerRole.id,
            permission_id: permMap[code],
            created_at: new Date()
          }
        });
        addedBuyer++;
      }
    }
    console.log(`  ✅ Đã thêm ${addedBuyer} permissions`);

    // === SELLER ===
    console.log('\n🟠 SELLER ROLE:');
    await prisma.role_permissions.deleteMany({ where: { role_id: sellerRole.id } });
    console.log('  ❌ Xóa permissions cũ');

    let addedSeller = 0;
    for (const code of SELLER_PERMISSIONS) {
      if (permMap[code]) {
        await prisma.role_permissions.create({
          data: {
            id: randomUUID(),
            role_id: sellerRole.id,
            permission_id: permMap[code],
            created_at: new Date()
          }
        });
        addedSeller++;
      }
    }
    console.log(`  ✅ Đã thêm ${addedSeller} permissions`);

    // Update versions & force re-login
    await prisma.roles.update({
      where: { id: buyerRole.id },
      data: { role_version: buyerRole.role_version + 1 }
    });
    await prisma.roles.update({
      where: { id: sellerRole.id },
      data: { role_version: sellerRole.role_version + 1 }
    });
    await prisma.users.updateMany({
      where: {
        user_roles_user_roles_user_idTousers: {
          some: { role_id: { in: [buyerRole.id, sellerRole.id] } }
        }
      },
      data: { permissions_updated_at: new Date() }
    });

    // Show result
    const finalBuyer = await prisma.roles.findFirst({
      where: { code: 'buyer' },
      include: { role_permissions: { include: { permissions: true } } }
    });
    const finalSeller = await prisma.roles.findFirst({
      where: { code: 'seller' },
      include: { role_permissions: { include: { permissions: true } } }
    });

    console.log('\n📊 KẾT QUẢ:');
    console.log(`\n✅ BUYER (${finalBuyer.role_permissions.length} permissions):`);
    finalBuyer.role_permissions.forEach((rp, i) => {
      console.log(`   ${(i+1).toString().padStart(2)}. ${rp.permissions.code} - ${rp.permissions.name}`);
    });

    console.log(`\n✅ SELLER (${finalSeller.role_permissions.length} permissions):`);
    finalSeller.role_permissions.forEach((rp, i) => {
      console.log(`   ${(i+1).toString().padStart(2)}. ${rp.permissions.code} - ${rp.permissions.name}`);
    });

    console.log('\n💡 VỚI PERMISSION-BASED MENU:');
    console.log('   ✅ Buyer có PM-020 → Thấy menu "RFQ"');
    console.log('   ❌ Buyer KHÔNG có PM-010 → KHÔNG thấy menu "Bán hàng"');
    console.log('   ✅ Seller có PM-010 → Thấy menu "Bán hàng"');
    console.log('   ❌ Seller KHÔNG có PM-020 → KHÔNG thấy menu "RFQ" (buyer)');
    console.log('   ✅ Seller có PM-021 → Thấy menu "RFQ & Báo giá"');
    console.log('\n   → Menu tự động khác nhau vì permissions khác nhau!');
    console.log('   → Admin muốn buyer bán hàng? → Gán PM-010 → Menu tự xuất hiện!\n');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setProperPermissions();
