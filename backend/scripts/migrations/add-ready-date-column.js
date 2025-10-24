import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addMissingColumns() {
  try {
    console.log('Checking missing columns in orders table...');
    
    // Check ready_date
    const readyDateResult = await prisma.$queryRawUnsafe(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name = 'ready_date'
    `);
    
    if (readyDateResult.length === 0) {
      console.log('Adding ready_date column...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE orders 
        ADD COLUMN ready_date TIMESTAMP
      `);
      console.log('✅ Added ready_date column');
    } else {
      console.log('✅ Column ready_date already exists');
    }
    
    // Check delivered_at
    const deliveredAtResult = await prisma.$queryRawUnsafe(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name = 'delivered_at'
    `);
    
    if (deliveredAtResult.length === 0) {
      console.log('Adding delivered_at column...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE orders 
        ADD COLUMN delivered_at TIMESTAMP
      `);
      console.log('✅ Added delivered_at column');
    } else {
      console.log('✅ Column delivered_at already exists');
    }
    
    // Check completed_at
    const completedAtResult = await prisma.$queryRawUnsafe(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name = 'completed_at'
    `);
    
    if (completedAtResult.length === 0) {
      console.log('Adding completed_at column...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE orders 
        ADD COLUMN completed_at TIMESTAMP
      `);
      console.log('✅ Added completed_at column');
    } else {
      console.log('✅ Column completed_at already exists');
    }
    
    console.log('\n🎉 All columns checked and added successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingColumns();
