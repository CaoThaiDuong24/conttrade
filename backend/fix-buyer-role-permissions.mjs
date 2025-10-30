// Fix buyer role permissions - remove seller permissions
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixBuyerRolePermissions() {
  try {
    console.log('\n🔧 FIXING BUYER ROLE PERMISSIONS...\n');
    
    // Seller-only permissions that should NOT be in buyer role
    const sellerOnlyPermissions = [
      'PM-010', // CREATE_LISTING
      'PM-011', // EDIT_LISTING
      'PM-012', // PUBLISH_LISTING
      'PM-013', // ARCHIVE_LISTING
      'PM-014', // DELETE_LISTING
      'PM-021', // ISSUE_QUOTE
      'PM-023', // MANAGE_QA
    ];
    
    const buyerRole = await prisma.roles.findUnique({
      where: { code: 'buyer' }
    });
    
    if (!buyerRole) {
      console.log('❌ Buyer role not found');
      return;
    }
    
    console.log('✅ Found buyer role:', buyerRole.name);
    
    // Get permissions to remove
    const permsToRemove = await prisma.permissions.findMany({
      where: {
        code: {
          in: sellerOnlyPermissions
        }
      }
    });
    
    console.log(`\n📋 Found ${permsToRemove.length} seller permissions to remove from buyer role:`);
    permsToRemove.forEach(p => console.log(`   - ${p.code}: ${p.name}`));
    
    // Remove these permissions from buyer role
    console.log('\n🗑️  Removing seller permissions from buyer role...');
    
    for (const perm of permsToRemove) {
      const deleted = await prisma.role_permissions.deleteMany({
        where: {
          role_id: buyerRole.id,
          permission_id: perm.id
        }
      });
      
      if (deleted.count > 0) {
        console.log(`   ✅ Removed ${perm.code}`);
      }
    }
    
    // Verify
    console.log('\n🔍 Verifying buyer role permissions...');
    const updatedRole = await prisma.roles.findUnique({
      where: { code: 'buyer' },
      include: {
        role_permissions: {
          include: {
            permissions: true
          }
        }
      }
    });
    
    console.log(`\n✅ Buyer role now has ${updatedRole.role_permissions.length} permissions:`);
    updatedRole.role_permissions.forEach(rp => {
      console.log(`   - ${rp.permissions.code}: ${rp.permissions.name}`);
    });
    
    // Check if any seller permissions remain
    const stillHasSeller = updatedRole.role_permissions.filter(rp => 
      sellerOnlyPermissions.includes(rp.permissions.code)
    );
    
    if (stillHasSeller.length > 0) {
      console.log('\n⚠️  WARNING: Buyer still has seller permissions:');
      stillHasSeller.forEach(rp => console.log(`   - ${rp.permissions.code}`));
    } else {
      console.log('\n✅✅✅ SUCCESS! Buyer role no longer has seller permissions!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBuyerRolePermissions();
