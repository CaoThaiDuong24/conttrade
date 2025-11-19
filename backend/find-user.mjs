import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findTestUser() {
  const users = await prisma.users.findMany({
    where: { role: 'BUYER' },
    select: { id: true, email: true, display_name: true },
    take: 3
  });
  
  console.log('👤 Buyer users:', JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

findTestUser();
