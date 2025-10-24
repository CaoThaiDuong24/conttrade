import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addOrderStatusEnum() {
  try {
    console.log('Adding READY_FOR_PICKUP to OrderStatus enum...');
    
    // Check if enum value exists
    const result = await prisma.$queryRawUnsafe(`
      SELECT unnest(enum_range(NULL::\"OrderStatus\"))::text as enum_value
    `);
    
    const enumValues = result.map(r => r.enum_value);
    console.log('Current OrderStatus enum values:', enumValues);
    
    if (enumValues.includes('READY_FOR_PICKUP')) {
      console.log('✅ READY_FOR_PICKUP already exists in OrderStatus enum');
      process.exit(0);
    }
    
    // Add READY_FOR_PICKUP to enum
    await prisma.$executeRawUnsafe(`
      ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'READY_FOR_PICKUP'
    `);
    
    console.log('✅ Successfully added READY_FOR_PICKUP to OrderStatus enum');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addOrderStatusEnum();
