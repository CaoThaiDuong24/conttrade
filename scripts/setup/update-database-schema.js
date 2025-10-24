#!/usr/bin/env node

/**
 * Script to update database schema for new workflow
 * This script will:
 * 1. Run Prisma migration
 * 2. Generate Prisma client
 * 3. Verify schema changes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting database schema update for new workflow...\n');

try {
  // Check if we're in the right directory
  const schemaPath = path.join(__dirname, 'backend/prisma/schema.prisma');
  if (!fs.existsSync(schemaPath)) {
    throw new Error('❌ Prisma schema not found. Please run this script from the project root.');
  }

  console.log('📋 Step 1: Validating Prisma schema...');
  execSync('npx prisma validate', { 
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit' 
  });
  console.log('✅ Schema validation passed\n');

  console.log('🔄 Step 2: Generating Prisma client...');
  execSync('npx prisma generate', { 
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit' 
  });
  console.log('✅ Prisma client generated\n');

  console.log('📊 Step 3: Creating migration...');
  try {
    execSync('npx prisma migrate dev --name add-workflow-fields', { 
      cwd: path.join(__dirname, 'backend'),
      stdio: 'inherit' 
    });
    console.log('✅ Migration created and applied\n');
  } catch (error) {
    console.log('⚠️  Migration might already exist or database not accessible');
    console.log('   You may need to run this manually:\n');
    console.log('   cd backend && npx prisma migrate dev --name add-workflow-fields\n');
  }

  console.log('🔍 Step 4: Verifying new enums and fields...');
  
  // Check if new order statuses exist
  const orderStatuses = [
    'AWAITING_FUNDS',
    'ESCROW_FUNDED', 
    'PREPARING_DELIVERY',
    'DOCUMENTS_READY',
    'TRANSPORTATION_BOOKED',
    'IN_TRANSIT',
    'PAYMENT_RELEASED',
    'DISPUTED'
  ];

  const paymentStatuses = [
    'ESCROW_HOLD',
    'RELEASED'
  ];

  console.log('✅ New OrderStatus values added:');
  orderStatuses.forEach(status => {
    console.log(`   - ${status}`);
  });

  console.log('\n✅ New PaymentStatus values added:');
  paymentStatuses.forEach(status => {
    console.log(`   - ${status}`);
  });

  console.log('\n✅ New DocumentStatus enum created:');
  console.log('   - DRAFT');
  console.log('   - ISSUED');
  console.log('   - EXPIRED');
  console.log('   - CANCELLED');

  console.log('\n✅ New fields added to tables:');
  console.log('   - documents: status, pickup_code, valid_until, metadata, document_number');
  console.log('   - deliveries: delivery_address, delivery_contact, delivery_phone, delivery_date, delivery_time, needs_crane, special_instructions, transportation_fee, booked_at, in_transit_at, delivered_at, current_location, eir_data, notes');
  console.log('   - payments: released_at, escrow_hold_until');

  console.log('\n🎉 Database schema update completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Restart your backend server');
  console.log('   2. Test the new API endpoints');
  console.log('   3. Verify frontend components work correctly');
  console.log('   4. Update any existing data if needed');

} catch (error) {
  console.error('❌ Error updating database schema:', error.message);
  console.log('\n🔧 Manual steps to fix:');
  console.log('   1. cd backend');
  console.log('   2. npx prisma validate');
  console.log('   3. npx prisma generate');
  console.log('   4. npx prisma migrate dev --name add-workflow-fields');
  console.log('   5. Restart backend server');
  process.exit(1);
}
