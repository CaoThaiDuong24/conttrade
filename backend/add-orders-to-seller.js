import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addOrdersPermissionToSeller() {
  try {
    // Get seller role
    const seller = await prisma.roles.findUnique({
      where: { code: 'seller' },
      include: {
        role_permissions: {
          include: {
            permissions: true
          }
        }
      }
    });

    if (!seller) {
      console.log('❌ Seller role not found');
      return;
    }

    console.log('\n📋 Seller current permissions:');
    seller.role_permissions.forEach(rp => {
      console.log(`  - ${rp.permissions.code}: ${rp.permissions.name}`);
    });

    // Check if PM-030 exists
    const pm030 = await prisma.permissions.findUnique({
      where: { code: 'PM-030' }
    });

    if (!pm030) {
      console.log('\n❌ PM-030 permission not found in database');
      return;
    }

    console.log(`\n📌 Found PM-030: ${pm030.name}`);

    // Check if seller already has PM-030
    const existing = await prisma.role_permissions.findFirst({
      where: {
        role_id: seller.id,
        permission_id: pm030.id
      }
    });

    if (existing) {
      console.log('⚠️  Seller already has PM-030 permission');
      return;
    }

    // Add PM-030 to seller
    const rolePermId = `role-perm-${Date.now()}`;
    await prisma.role_permissions.create({
      data: {
        id: rolePermId,
        role_id: seller.id,
        permission_id: pm030.id
      }
    });

    console.log('\n✅ Successfully added PM-030 (ORDERS_MANAGE) to seller role');
    console.log('   Seller can now access /orders routes');

    // Update role_version to force JWT refresh
    await prisma.roles.update({
      where: { id: seller.id },
      data: { role_version: { increment: 1 } }
    });

    console.log('✅ Updated seller role_version - users need to re-login');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addOrdersPermissionToSeller();
