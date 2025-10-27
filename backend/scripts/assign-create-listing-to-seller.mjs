import prisma from '../dist/lib/prisma.js';

async function assignCreateListingToSeller() {
  try {
    console.log('=== ASSIGNING CREATE_LISTING TO SELLER ROLE ===\n');
    
    // 1. Find seller role
    const sellerRole = await prisma.roles.findFirst({
      where: { code: 'seller' }
    });
    
    if (!sellerRole) {
      console.log('❌ Seller role not found!');
      return;
    }
    
    console.log('✅ Found seller role:', sellerRole.name, '(ID:', sellerRole.id + ')');
    
    // 2. Find CREATE_LISTING permission
    const createListingPerm = await prisma.permissions.findFirst({
      where: { code: 'CREATE_LISTING' }
    });
    
    if (!createListingPerm) {
      console.log('❌ CREATE_LISTING permission not found!');
      return;
    }
    
    console.log('✅ Found CREATE_LISTING permission:', createListingPerm.name, '(ID:', createListingPerm.id + ')');
    
    // 3. Check if already assigned
    const existing = await prisma.role_permissions.findUnique({
      where: {
        role_id_permission_id: {
          role_id: sellerRole.id,
          permission_id: createListingPerm.id
        }
      }
    });
    
    if (existing) {
      console.log('\n✅ CREATE_LISTING already assigned to seller role!');
      console.log('   Assigned at:', existing.created_at);
    } else {
      console.log('\n❌ CREATE_LISTING NOT assigned to seller role yet!');
      console.log('🔄 Assigning now...\n');
      
      // 4. Assign permission
      await prisma.role_permissions.create({
        data: {
          role_id: sellerRole.id,
          permission_id: createListingPerm.id
        }
      });
      
      console.log('✅ Successfully assigned CREATE_LISTING to seller role!');
      
      // 5. Update role version to invalidate cached tokens
      await prisma.roles.update({
        where: { id: sellerRole.id },
        data: { 
          role_version: { increment: 1 }
        }
      });
      
      console.log('✅ Updated role version to invalidate old tokens');
    }
    
    // 6. Update all seller users' permissions_updated_at
    const sellerUsers = await prisma.users.findMany({
      where: {
        roles: {
          some: {
            role_id: sellerRole.id
          }
        }
      }
    });
    
    console.log(`\n📝 Found ${sellerUsers.length} seller users`);
    
    for (const user of sellerUsers) {
      await prisma.users.update({
        where: { id: user.id },
        data: { permissions_updated_at: new Date() }
      });
      console.log(`   ✅ Updated permissions_updated_at for: ${user.email}`);
    }
    
    console.log('\n🎉 DONE! All seller users need to logout and login again to get new token with CREATE_LISTING permission.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

assignCreateListingToSeller();
