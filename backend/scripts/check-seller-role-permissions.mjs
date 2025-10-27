import prisma from '../dist/lib/prisma.js';

async function checkSellerRole() {
  try {
    console.log('=== CHECKING SELLER ROLE PERMISSIONS ===\n');
    
    // Get seller role with permissions
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
      console.log('❌ Seller role NOT found!');
      return;
    }
    
    console.log('✅ Seller Role:', sellerRole.name);
    console.log('Total Permissions:', sellerRole.permissions.length);
    
    const hasCreateListing = sellerRole.permissions.some(
      p => p.permission.code === 'CREATE_LISTING'
    );
    
    console.log('\n🔍 Has CREATE_LISTING permission:', hasCreateListing);
    
    if (hasCreateListing) {
      const perm = sellerRole.permissions.find(p => p.permission.code === 'CREATE_LISTING');
      console.log('✅ Permission details:', {
        code: perm.permission.code,
        name: perm.permission.name,
        category: perm.permission.category
      });
    } else {
      console.log('❌ CREATE_LISTING permission NOT assigned to seller role!');
      console.log('\n📋 Current permissions:');
      sellerRole.permissions.forEach(p => {
        console.log(`  - ${p.permission.code}: ${p.permission.name}`);
      });
    }
    
    // Check if there are any seller users
    console.log('\n=== CHECKING SELLER USERS ===');
    const sellerUsers = await prisma.users.findMany({
      where: {
        roles: {
          some: {
            role: { code: 'seller' }
          }
        }
      },
      select: {
        id: true,
        email: true,
        permissions_updated_at: true
      },
      take: 5
    });
    
    console.log(`Found ${sellerUsers.length} seller users`);
    sellerUsers.forEach(user => {
      console.log(`  - ${user.email}`);
      console.log(`    permissions_updated_at: ${user.permissions_updated_at || 'NULL (never updated)'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSellerRole();
