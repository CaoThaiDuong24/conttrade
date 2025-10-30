import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const depot = await prisma.depots.findFirst({
  select: { id: true, name: true }
});

if (depot) {
  console.log(JSON.stringify(depot));
} else {
  console.log('NO_DEPOT');
}

await prisma.$disconnect();
