import prisma from '../dist/lib/prisma.js';

async function checkSeller() {
  try {
    const seller = await prisma.users.findFirst({ 
      where: { 
        roles: { 
          some: { 
            role: { code: 'seller' } 
          } 
        } 
      }, 
      include: { 
        roles: { 
          include: { 
            role: { 
              include: { 
                permissions: { 
                  include: { permission: true } 
                } 
              } 
            } 
          } 
        } 
      } 
    });
    
    if (seller) {
      console.log('=== SELLER USER ===');
      console.log('ID:', seller.id);
      console.log('Email:', seller.email);
      console.log('Roles:', seller.roles.map(r => r.role.code).join(', '));
      
      const allPerms = new Set();
      seller.roles.forEach(r => {
        r.role.permissions.forEach(p => {
          allPerms.add(p.permission.code);
        });
      });
      
      console.log('\nTotal Permissions:', allPerms.size);
      console.log('Has CREATE_LISTING:', allPerms.has('CREATE_LISTING'));
      
      if (allPerms.size > 0) {
        console.log('\n=== ALL PERMISSIONS ===');
        console.log(Array.from(allPerms).sort().join('\n'));
      } else {
        console.log('\n⚠️ WARNING: Seller has NO permissions!');
      }
      
      if (seller.permissions_updated_at) {
        console.log('\n📅 Permissions Updated At:', seller.permissions_updated_at);
      }
    } else {
      console.log('❌ No seller user found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSeller();
