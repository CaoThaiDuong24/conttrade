import prisma from '../dist/lib/prisma.js';

async function checkBuyerPermissions() {
  try {
    console.log('\n=== CHECKING BUYER ROLE PERMISSIONS ===\n');
    
    // Find buyer role
    const buyerRole = await prisma.roles.findFirst({
      where: { code: 'buyer' },
      include: {
        role_permissions: {
          include: {
            permissions: true
          }
        }
      }
    });
    
    if (!buyerRole) {
      console.log('❌ Buyer role not found!');
      return;
    }
    
    console.log(`Role: ${buyerRole.name} (${buyerRole.code})`);
    console.log(`Level: ${buyerRole.level}\n`);
    console.log('Permissions assigned to buyer role:\n');
    
    if (buyerRole.role_permissions.length === 0) {
      console.log('❌ NO PERMISSIONS assigned to buyer role!');
    } else {
      buyerRole.role_permissions.forEach(rp => {
        console.log(`  ✓ ${rp.permissions.code.padEnd(10)} | ${rp.permissions.name}`);
      });
    }
    
    // Check specifically for CREATE_LISTING
    const hasCreateListing = buyerRole.role_permissions.some(
      rp => rp.permissions.code === 'PM-010' || rp.permissions.name === 'CREATE_LISTING'
    );
    
    console.log(`\n${hasCreateListing ? '✅' : '❌'} Has CREATE_LISTING (PM-010): ${hasCreateListing}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkBuyerPermissions();
