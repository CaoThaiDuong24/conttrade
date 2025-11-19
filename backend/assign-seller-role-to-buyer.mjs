// Assign seller role to buyer@example.com for testing realtime permissions
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function assignSellerRole() {
  try {
    console.log('\n🔍 Finding buyer user...');
    
    // Find buyer user
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
    
    // Find seller role
    console.log('\n🔍 Finding seller role...');
    const sellerRole = await prisma.roles.findUnique({
      where: { code: 'seller' }
    });
    
    if (!sellerRole) {
      console.log('❌ Seller role not found');
      return;
    }
    
    console.log('✅ Found seller role:', sellerRole.code);
    
    // Check if buyer already has seller role
    const existingRole = buyer.user_roles_user_roles_user_idTousers.find(
      ur => ur.role_id === sellerRole.id
    );
    
    if (existingRole) {
      console.log('⚠️  Buyer already has seller role');
      return;
    }
    
    // Assign seller role to buyer
    console.log('\n📝 Assigning seller role to buyer...');
    await prisma.user_roles.create({
      data: {
        id: uuidv4(),
        user_id: buyer.id,
        role_id: sellerRole.id,
        assigned_at: new Date()
      }
    });
    
    console.log('✅ Seller role assigned successfully!');
    
    // Verify
    console.log('\n🔍 Verifying assignment...');
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
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignSellerRole();
