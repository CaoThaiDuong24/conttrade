import prisma from '../dist/lib/prisma.js';

async function checkPermissions() {
  try {
    console.log('\n=== ALL PERMISSIONS IN DATABASE ===\n');
    
    const permissions = await prisma.permissions.findMany({
      orderBy: { code: 'asc' }
    });
    
    permissions.forEach(p => {
      console.log(`Code: ${p.code.padEnd(10)} | Name: ${p.name.padEnd(30)} | Category: ${p.category}`);
    });
    
    console.log(`\nTotal: ${permissions.length} permissions\n`);
    
    // Check specifically for CREATE_LISTING related permissions
    console.log('=== LISTING RELATED PERMISSIONS ===\n');
    const listingPerms = permissions.filter(p => 
      p.name.toLowerCase().includes('listing') || 
      p.name.toLowerCase().includes('create') ||
      p.code.startsWith('PN-')
    );
    
    listingPerms.forEach(p => {
      console.log(`Code: ${p.code.padEnd(10)} | Name: ${p.name}`);
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkPermissions();
