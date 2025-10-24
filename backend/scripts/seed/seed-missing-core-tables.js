import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🚀 Seeding missing core master data tables...\n');
  
  const completedTables = [];
  const failedTables = [];

  // 1. md_payment_statuses
  try {
    console.log('💳 Seeding md_payment_statuses...');
    const paymentStatusCount = await prisma.md_payment_statuses.count();
    if (paymentStatusCount === 0) {
      await prisma.md_payment_statuses.createMany({
        data: [
          { id: uuid(), code: 'PENDING', name: 'Pending', description: 'Payment is pending' },
          { id: uuid(), code: 'AUTHORIZED', name: 'Authorized', description: 'Payment has been authorized' },
          { id: uuid(), code: 'CAPTURED', name: 'Captured', description: 'Payment has been captured' },
          { id: uuid(), code: 'COMPLETED', name: 'Completed', description: 'Payment completed successfully' },
          { id: uuid(), code: 'FAILED', name: 'Failed', description: 'Payment failed' },
          { id: uuid(), code: 'CANCELLED', name: 'Cancelled', description: 'Payment was cancelled' },
          { id: uuid(), code: 'REFUNDED', name: 'Refunded', description: 'Payment was refunded' },
          { id: uuid(), code: 'PARTIAL_REFUND', name: 'Partial Refund', description: 'Payment was partially refunded' }
        ].map(item => ({ ...item, updated_at: new Date() })),
        skipDuplicates: true
      });
      console.log('✅ md_payment_statuses seeded successfully');
    } else {
      console.log(`✅ md_payment_statuses already has ${paymentStatusCount} records - skipping`);
    }
    completedTables.push('md_payment_statuses');
  } catch (error) {
    console.log('❌ md_payment_statuses failed:', error.message);
    failedTables.push({ table: 'md_payment_statuses', error: error.message });
  }

  // 2. md_dispute_statuses
  try {
    console.log('⚖️ Seeding md_dispute_statuses...');
    const disputeStatusCount = await prisma.md_dispute_statuses.count();
    if (disputeStatusCount === 0) {
      await prisma.md_dispute_statuses.createMany({
        data: [
          { id: uuid(), code: 'OPEN', name: 'Open', description: 'Dispute has been opened' },
          { id: uuid(), code: 'INVESTIGATING', name: 'Under Investigation', description: 'Dispute is being investigated' },
          { id: uuid(), code: 'AWAITING_RESPONSE', name: 'Awaiting Response', description: 'Awaiting response from parties' },
          { id: uuid(), code: 'MEDIATION', name: 'In Mediation', description: 'Dispute is in mediation process' },
          { id: uuid(), code: 'RESOLVED_BUYER', name: 'Resolved - Buyer Favor', description: 'Dispute resolved in buyer favor' },
          { id: uuid(), code: 'RESOLVED_SELLER', name: 'Resolved - Seller Favor', description: 'Dispute resolved in seller favor' },
          { id: uuid(), code: 'RESOLVED_PARTIAL', name: 'Resolved - Partial', description: 'Dispute resolved with partial resolution' },
          { id: uuid(), code: 'WITHDRAWN', name: 'Withdrawn', description: 'Dispute was withdrawn' },
          { id: uuid(), code: 'CLOSED', name: 'Closed', description: 'Dispute has been closed' }
        ].map(item => ({ ...item, updated_at: new Date() })),
        skipDuplicates: true
      });
      console.log('✅ md_dispute_statuses seeded successfully');
    } else {
      console.log(`✅ md_dispute_statuses already has ${disputeStatusCount} records - skipping`);
    }
    completedTables.push('md_dispute_statuses');
  } catch (error) {
    console.log('❌ md_dispute_statuses failed:', error.message);
    failedTables.push({ table: 'md_dispute_statuses', error: error.message });
  }

  // Optional: md_partner_types (commonly used)
  try {
    console.log('🤝 Seeding md_partner_types...');
    const partnerCount = await prisma.md_partner_types.count();
    if (partnerCount === 0) {
      await prisma.md_partner_types.createMany({
        data: [
          { id: uuid(), code: 'SUPPLIER', name: 'Supplier', description: 'Container supplier partner' },
          { id: uuid(), code: 'BUYER', name: 'Buyer', description: 'Container buyer partner' },
          { id: uuid(), code: 'LOGISTICS', name: 'Logistics Provider', description: 'Logistics service provider' },
          { id: uuid(), code: 'DEPOT', name: 'Depot Operator', description: 'Container depot operator' },
          { id: uuid(), code: 'INSPECTOR', name: 'Inspector', description: 'Container inspection service provider' },
          { id: uuid(), code: 'FINANCIER', name: 'Financier', description: 'Financial service provider' },
          { id: uuid(), code: 'INSURANCE', name: 'Insurance Provider', description: 'Insurance service provider' },
          { id: uuid(), code: 'SHIPPER', name: 'Shipper', description: 'Shipping line partner' }
        ].map(item => ({ ...item, updated_at: new Date() })),
        skipDuplicates: true
      });
      console.log('✅ md_partner_types seeded successfully');
    } else {
      console.log(`✅ md_partner_types already has ${partnerCount} records - skipping`);
    }
    completedTables.push('md_partner_types');
  } catch (error) {
    console.log('❌ md_partner_types failed:', error.message);
    failedTables.push({ table: 'md_partner_types', error: error.message });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('🎉 MISSING CORE TABLES SEEDING SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully completed: ${completedTables.length} tables`);
  completedTables.forEach(table => console.log(`   ✅ ${table}`));
  
  if (failedTables.length > 0) {
    console.log(`\n❌ Failed: ${failedTables.length} tables`);
    failedTables.forEach(item => console.log(`   ❌ ${item.table}: ${item.error}`));
  }
  
  console.log('\n📊 Final verification:');
  
  // Verify the core tables
  try {
    const paymentCount = await prisma.md_payment_statuses.count();
    const disputeCount = await prisma.md_dispute_statuses.count();
    const partnerCount = await prisma.md_partner_types.count();
    
    console.log(`   💳 md_payment_statuses: ${paymentCount} records`);
    console.log(`   ⚖️ md_dispute_statuses: ${disputeCount} records`);
    console.log(`   🤝 md_partner_types: ${partnerCount} records`);
    
    const totalAdded = paymentCount + disputeCount + partnerCount;
    console.log(`\n🎯 Total new records added: ${totalAdded}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error verifying tables:', error);
  }

  } catch (error) {
    console.error('❌ Error in main seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\n✅ Database connection closed');
  });