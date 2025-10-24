const { PrismaClient } = require('@prisma/client');

async function checkSchema() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking md_countries columns...');
    const countries_cols = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name='md_countries'`;
    console.log('md_countries columns:', countries_cols.map(c => c.column_name));
    
    console.log('\nChecking md_rental_units columns...');
    const rental_cols = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name='md_rental_units'`;
    console.log('md_rental_units columns:', rental_cols.map(c => c.column_name));
    
    console.log('\nChecking if notifications table exists...');
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_name='notifications'`;
    console.log('notifications table exists:', tables.length > 0);
    
    console.log('\nChecking md_currencies columns...');
    const currency_cols = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name='md_currencies'`;
    console.log('md_currencies columns:', currency_cols.map(c => c.column_name));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();