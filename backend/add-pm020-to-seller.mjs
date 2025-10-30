import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addPM020ToSeller() {
  try {
    console.log('\n=== Adding PM-020 (CREATE_RFQ) to Seller Role ===\n');
    
    // Step 1: Check if permission exists
    const pm020 = await prisma.permission.findUnique({
      where: { code: 'PM-020' }
    });
    
    if (!pm020) {
      console.log('❌ Permission PM-020 does not exist!');
      return;
    }
    
    console.log(`✅ Found permission: ${pm020.code} - ${pm020.name}`);
    
    // Step 2: Get seller role
    const sellerRole = await prisma.role.findUnique({
      where: { code: 'seller' },
      include: {
        role_permissions: {
          include: {
            permission: true
          }
        }
      }
    });
    
    if (!sellerRole) {
      console.log('❌ Seller role not found!');
      return;
    }
    
    console.log(`✅ Found seller role with ${sellerRole.role_permissions.length} permissions\n`);
    
    // Step 3: Check if seller already has PM-020
    const hasPM020 = sellerRole.role_permissions.some(rp => rp.permission.code === 'PM-020');
    
    if (hasPM020) {
      console.log('⚠️  Seller already has PM-020 permission!');
      console.log('\n📋 Current seller permissions:');
      sellerRole.role_permissions.forEach((rp, i) => {
        console.log(`${i + 1}. ${rp.permission.code} - ${rp.permission.name}`);
      });
      return;
    }
    
    console.log('📋 Current seller permissions (before):');
    sellerRole.role_permissions.forEach((rp, i) => {
      console.log(`${i + 1}. ${rp.permission.code} - ${rp.permission.name}`);
    });
    
    // Step 4: Add PM-020 to seller role
    console.log(`\n🔄 Adding PM-020 to seller role...`);
    
    await prisma.role_permission.create({
      data: {
        role_id: sellerRole.id,
        permission_id: pm020.id
      }
    });
    
    console.log('✅ Permission added successfully!');
    
    // Step 5: Increment role_version to force users to re-login
    console.log('🔄 Updating role version...');
    
    await prisma.role.update({
      where: { code: 'seller' },
      data: {
        role_version: sellerRole.role_version + 1,
        updated_at: new Date()
      }
    });
    
    console.log(`✅ Role version updated: ${sellerRole.role_version} → ${sellerRole.role_version + 1}`);
    
    // Step 6: Update permissions_updated_at for all seller users
    console.log('🔄 Forcing seller users to re-login...');
    
    const sellerUsers = await prisma.user.findMany({
      where: {
        user_roles: {
          some: {
            role_id: sellerRole.id
          }
        }
      }
    });
    
    await prisma.user.updateMany({
      where: {
        id: {
          in: sellerUsers.map(u => u.id)
        }
      },
      data: {
        permissions_updated_at: new Date()
      }
    });
    
    console.log(`✅ Updated ${sellerUsers.length} seller user(s) - they need to re-login`);
    
    // Step 7: Verify the change
    const updatedSeller = await prisma.role.findUnique({
      where: { code: 'seller' },
      include: {
        role_permissions: {
          include: {
            permission: true
          },
          orderBy: {
            permission: {
              code: 'asc'
            }
          }
        }
      }
    });
    
    console.log(`\n📋 Updated seller permissions (${updatedSeller.role_permissions.length} total):`);
    updatedSeller.role_permissions.forEach((rp, i) => {
      const marker = rp.permission.code === 'PM-020' ? '🆕' : '  ';
      console.log(`${marker} ${i + 1}. ${rp.permission.code} - ${rp.permission.name}`);
    });
    
    console.log('\n✅ SUCCESS! Seller can now access RFQ menu!');
    console.log('⚠️  Important: Existing seller users MUST RE-LOGIN to see the change!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addPM020ToSeller();
