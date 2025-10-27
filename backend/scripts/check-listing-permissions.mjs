import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n=== CHECKING LISTING PERMISSIONS ===\n');
    
    const permissions = await prisma.permissions.findMany({
      where: {
        OR: [
          { code: { contains: 'listing', mode: 'insensitive' } },
          { code: { contains: 'LISTING' } },
          { name: { contains: 'listing', mode: 'insensitive' } },
          { name: { contains: 'tin đăng', mode: 'insensitive' } }
        ]
      },
      orderBy: { code: 'asc' }
    });

    if (permissions.length === 0) {
      console.log('❌ NO LISTING PERMISSIONS FOUND!');
      console.log('\nAll permissions in database:');
      const allPerms = await prisma.permissions.findMany({
        select: { code: true, name: true },
        orderBy: { code: 'asc' }
      });
      allPerms.forEach(p => {
        console.log(`  - ${p.code}: ${p.name}`);
      });
    } else {
      console.log('Found listing permissions:');
      permissions.forEach(p => {
        console.log(`  ✓ Code: ${p.code}`);
        console.log(`    Name: ${p.name}`);
        console.log(`    Category: ${p.category || 'N/A'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
