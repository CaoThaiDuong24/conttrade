import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.roles.findMany({
    select: { code: true, name: true },
    orderBy: { code: 'asc' }
  });
  
  console.log('\n=== ALL ROLES ===\n');
  roles.forEach(r => console.log(`  - ${r.code}: ${r.name}`));
  console.log('');
  
  await prisma.$disconnect();
}

main();
