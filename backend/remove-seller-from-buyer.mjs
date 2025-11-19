// Remove seller role from buyer@example.com to test menu permissions
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeSellerRole() {
  try {
    console.log('\n🔍 Finding buyer user...');
    
    const buyer = await prisma.users.findUnique({
      where: { email: 'buyer@example.com' },
      include: {
        user_roles_user_roles_user_idTousers: {
          include: {
            roles: true
          }
        }
      }
    });
    
    if (!buyer) {
      console.log('❌ Buyer user not found');
      return;
    }
    
    console.log('✅ Found buyer:', buyer.email);
    console.log('   Current roles:', buyer.user_roles_user_roles_user_idTousers.map(ur => ur.roles.code).join(', '));
    
    // Find seller role assignment
    const sellerRole = await prisma.roles.findUnique({
      where: { code: 'seller' }
    });
    
    if (!sellerRole) {
      console.log('❌ Seller role not found');
      return;
    }
    
    const sellerRoleAssignment = buyer.user_roles_user_roles_user_idTousers.find(
      ur => ur.role_id === sellerRole.id
    );
    
    if (!sellerRoleAssignment) {
      console.log('⚠️  Buyer does not have seller role');
      return;
    }
    
    // Remove seller role
    console.log('\n📝 Removing seller role from buyer...');
    await prisma.user_roles.delete({
      where: {
        id: sellerRoleAssignment.id
      }
    });
    
    console.log('✅ Seller role removed successfully!');
    
    // Verify
    console.log('\n🔍 Verifying removal...');
    const updatedBuyer = await prisma.users.findUnique({
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
    
    console.log('   New roles:', updatedBuyer.user_roles_user_roles_user_idTousers.map(ur => ur.roles.code).join(', '));
    
    // Show permissions
    const permissions = new Set();
    updatedBuyer.user_roles_user_roles_user_idTousers.forEach(ur => {
      ur.roles.role_permissions.forEach(rp => {
        permissions.add(rp.permissions.code);
      });
    });
    
    console.log('   Total permissions:', permissions.size);
    console.log('   Has PM-010 (CREATE_LISTING):', permissions.has('PM-010') ? '✅ YES' : '❌ NO');
    console.log('   Has PM-020 (CREATE_RFQ):', permissions.has('PM-020') ? '✅ YES' : '❌ NO');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeSellerRole();
