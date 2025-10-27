import prisma from '../dist/lib/prisma.js';

async function verifySellerPermissions() {
  try {
    console.log('=== VERIFY SELLER PERMISSIONS ===\n');
    
    // Get seller role with all permissions
    const sellerRole = await prisma.roles.findFirst({
      where: { code: 'seller' },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
    
    if (!sellerRole) {
      console.log('❌ Seller role not found!');
      await prisma.$disconnect();
      return;
    }
    
    console.log('Role:', sellerRole.name);
    console.log('Code:', sellerRole.code);
    console.log('Total Permissions:', sellerRole.permissions.length);
    console.log('Role Version:', sellerRole.role_version || 1);
    
    const hasCreateListing = sellerRole.permissions.some(
      p => p.permission.code === 'CREATE_LISTING'
    );
    
    console.log('\n🔍 Has CREATE_LISTING:', hasCreateListing ? '✅ YES' : '❌ NO');
    
    if (hasCreateListing) {
      const perm = sellerRole.permissions.find(p => p.permission.code === 'CREATE_LISTING');
      console.log('   Permission Name:', perm.permission.name);
      console.log('   Permission Category:', perm.permission.category);
      console.log('   Assigned At:', perm.created_at);
    }
    
    console.log('\n📋 All Seller Permissions:');
    sellerRole.permissions
      .map(p => p.permission)
      .sort((a, b) => a.code.localeCompare(b.code))
      .forEach(p => {
        console.log(`   ${p.code.padEnd(25)} - ${p.name}`);
      });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifySellerPermissions();
