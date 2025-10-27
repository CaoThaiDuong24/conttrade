import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findTables() {
  const tables = await prisma.$queryRawUnsafe(`
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_name LIKE '%role%permission%' OR table_name LIKE '%permission%'
    ORDER BY table_name
  `);
  
  console.log('Tables found:');
  console.table(tables);
  
  await prisma.$disconnect();
}

findTables();
