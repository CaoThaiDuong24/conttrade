import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🚀 Starting complete master data seeding...\n');
  
  const completedTables = [];
  const failedTables = [];

  try {
    // 1. md_countries (already seeded - skip)
    console.log('🌍 Checking md_countries...');
    const countryCount = await prisma.md_countries.count();
    if (countryCount > 0) {
      console.log(`✅ md_countries already has ${countryCount} records - skipping`);
      completedTables.push('md_countries');
    }

    // 2. md_currencies (already seeded - skip)
    console.log('💵 Checking md_currencies...');
    const currencyCount = await prisma.md_currencies.count();
    if (currencyCount > 0) {
      console.log(`✅ md_currencies already has ${currencyCount} records - skipping`);
      completedTables.push('md_currencies');
    }

    // 3. md_provinces (already seeded - skip)
    console.log('📍 Checking md_provinces...');
    const provinceCount = await prisma.md_provinces.count();
    if (provinceCount > 0) {
      console.log(`✅ md_provinces already has ${provinceCount} records - skipping`);
      completedTables.push('md_provinces');
    }

    // 4. md_cities (already seeded - skip) 
    console.log('🏙️ Checking md_cities...');
    const cityCount = await prisma.md_cities.count();
    if (cityCount > 0) {
      console.log(`✅ md_cities already has ${cityCount} records - skipping`);
      completedTables.push('md_cities');
    }

    // 5. md_container_sizes (already seeded - skip)
    console.log('📦 Checking md_container_sizes...');
    const sizeCount = await prisma.md_container_sizes.count();
    if (sizeCount > 0) {
      console.log(`✅ md_container_sizes already has ${sizeCount} records - skipping`);
      completedTables.push('md_container_sizes');
    }

    // 6. md_container_types (already seeded - skip)
    console.log('📦 Checking md_container_types...');
    const typeCount = await prisma.md_container_types.count();
    if (typeCount > 0) {
      console.log(`✅ md_container_types already has ${typeCount} records - skipping`);
      completedTables.push('md_container_types');
    }

    // 7. md_quality_standards (already seeded - skip)
    console.log('⭐ Checking md_quality_standards...');
    const qualityCount = await prisma.md_quality_standards.count();
    if (qualityCount > 0) {
      console.log(`✅ md_quality_standards already has ${qualityCount} records - skipping`);
      completedTables.push('md_quality_standards');
    }

    // 8. md_iso_container_codes - FIX SCHEMA ISSUE
    try {
      console.log('📋 Seeding md_iso_container_codes...');
      const isoCount = await prisma.md_iso_container_codes.count();
      if (isoCount === 0) {
        await prisma.md_iso_container_codes.createMany({
          data: [
            { id: uuid(), iso_code: '22G1', description: '20ft General Purpose' },
            { id: uuid(), iso_code: '42G1', description: '40ft General Purpose' },
            { id: uuid(), iso_code: '45G1', description: '45ft High Cube' },
            { id: uuid(), iso_code: '22R1', description: '20ft Refrigerated' },
            { id: uuid(), iso_code: '42R1', description: '40ft Refrigerated' },
            { id: uuid(), iso_code: '22U1', description: '20ft Open Top' },
            { id: uuid(), iso_code: '42U1', description: '40ft Open Top' },
            { id: uuid(), iso_code: '22P1', description: '20ft Flat Rack' },
            { id: uuid(), iso_code: '42P1', description: '40ft Flat Rack' },
            { id: uuid(), iso_code: '22T1', description: '20ft Tank' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_iso_container_codes seeded successfully');
      } else {
        console.log(`✅ md_iso_container_codes already has ${isoCount} records - skipping`);
      }
      completedTables.push('md_iso_container_codes');
    } catch (error) {
      console.log('❌ md_iso_container_codes failed:', error.message);
      failedTables.push({ table: 'md_iso_container_codes', error: error.message });
    }

    // 9. md_deal_types
    try {
      console.log('💼 Seeding md_deal_types...');
      const dealCount = await prisma.md_deal_types.count();
      if (dealCount === 0) {
        await prisma.md_deal_types.createMany({
          data: [
            { id: uuid(), code: 'SALE', name: 'Sale', description: 'Container sale transaction' },
            { id: uuid(), code: 'RENTAL', name: 'Rental', description: 'Container rental transaction' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_deal_types seeded successfully');
      } else {
        console.log(`✅ md_deal_types already has ${dealCount} records - skipping`);
      }
      completedTables.push('md_deal_types');
    } catch (error) {
      console.log('❌ md_deal_types failed:', error.message);
      failedTables.push({ table: 'md_deal_types', error: error.message });
    }

    // 10. md_delivery_statuses
    try {
      console.log('🚚 Seeding md_delivery_statuses...');
      const deliveryStatusCount = await prisma.md_delivery_statuses.count();
      if (deliveryStatusCount === 0) {
        await prisma.md_delivery_statuses.createMany({
          data: [
            { id: uuid(), code: 'PENDING', name: 'Pending', description: 'Delivery is pending' },
            { id: uuid(), code: 'IN_TRANSIT', name: 'In Transit', description: 'Delivery is in transit' },
            { id: uuid(), code: 'DELIVERED', name: 'Delivered', description: 'Delivery completed successfully' },
            { id: uuid(), code: 'FAILED', name: 'Failed', description: 'Delivery failed' },
            { id: uuid(), code: 'CANCELLED', name: 'Cancelled', description: 'Delivery was cancelled' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_delivery_statuses seeded successfully');
      } else {
        console.log(`✅ md_delivery_statuses already has ${deliveryStatusCount} records - skipping`);
      }
      completedTables.push('md_delivery_statuses');
    } catch (error) {
      console.log('❌ md_delivery_statuses failed:', error.message);
      failedTables.push({ table: 'md_delivery_statuses', error: error.message });
    }

    // 11. md_order_statuses
    try {
      console.log('📦 Seeding md_order_statuses...');
      const orderStatusCount = await prisma.md_order_statuses.count();
      if (orderStatusCount === 0) {
        await prisma.md_order_statuses.createMany({
          data: [
            { id: uuid(), code: 'PENDING', name: 'Pending', description: 'Order is pending confirmation' },
            { id: uuid(), code: 'CONFIRMED', name: 'Confirmed', description: 'Order has been confirmed' },
            { id: uuid(), code: 'IN_PROGRESS', name: 'In Progress', description: 'Order is being processed' },
            { id: uuid(), code: 'COMPLETED', name: 'Completed', description: 'Order completed successfully' },
            { id: uuid(), code: 'CANCELLED', name: 'Cancelled', description: 'Order was cancelled' },
            { id: uuid(), code: 'REFUNDED', name: 'Refunded', description: 'Order has been refunded' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_order_statuses seeded successfully');
      } else {
        console.log(`✅ md_order_statuses already has ${orderStatusCount} records - skipping`);
      }
      completedTables.push('md_order_statuses');
    } catch (error) {
      console.log('❌ md_order_statuses failed:', error.message);
      failedTables.push({ table: 'md_order_statuses', error: error.message });
    }

    // 12. md_listing_statuses
    try {
      console.log('📋 Seeding md_listing_statuses...');
      const listingStatusCount = await prisma.md_listing_statuses.count();
      if (listingStatusCount === 0) {
        await prisma.md_listing_statuses.createMany({
          data: [
            { id: uuid(), code: 'DRAFT', name: 'Draft', description: 'Listing is in draft state' },
            { id: uuid(), code: 'PENDING_APPROVAL', name: 'Pending Approval', description: 'Listing awaiting approval' },
            { id: uuid(), code: 'ACTIVE', name: 'Active', description: 'Listing is active and visible' },
            { id: uuid(), code: 'EXPIRED', name: 'Expired', description: 'Listing has expired' },
            { id: uuid(), code: 'SOLD', name: 'Sold', description: 'Listing item has been sold' },
            { id: uuid(), code: 'SUSPENDED', name: 'Suspended', description: 'Listing has been suspended' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_listing_statuses seeded successfully');
      } else {
        console.log(`✅ md_listing_statuses already has ${listingStatusCount} records - skipping`);
      }
      completedTables.push('md_listing_statuses');
    } catch (error) {
      console.log('❌ md_listing_statuses failed:', error.message);
      failedTables.push({ table: 'md_listing_statuses', error: error.message });
    }

    // 13. md_movement_types
    try {
      console.log('📊 Seeding md_movement_types...');
      const movementCount = await prisma.md_movement_types.count();
      if (movementCount === 0) {
        await prisma.md_movement_types.createMany({
          data: [
            { id: uuid(), code: 'GATE_IN', name: 'Gate In', description: 'Container entering depot' },
            { id: uuid(), code: 'GATE_OUT', name: 'Gate Out', description: 'Container leaving depot' },
            { id: uuid(), code: 'STRIP', name: 'Strip', description: 'Container being stripped' },
            { id: uuid(), code: 'STUFF', name: 'Stuff', description: 'Container being stuffed' },
            { id: uuid(), code: 'INSPECTION', name: 'Inspection', description: 'Container inspection' },
            { id: uuid(), code: 'REPAIR', name: 'Repair', description: 'Container repair activity' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_movement_types seeded successfully');
      } else {
        console.log(`✅ md_movement_types already has ${movementCount} records - skipping`);
      }
      completedTables.push('md_movement_types');
    } catch (error) {
      console.log('❌ md_movement_types failed:', error.message);
      failedTables.push({ table: 'md_movement_types', error: error.message });
    }

    // 14. md_document_types
    try {
      console.log('📄 Seeding md_document_types...');
      const docCount = await prisma.md_document_types.count();
      if (docCount === 0) {
        await prisma.md_document_types.createMany({
          data: [
            { id: uuid(), code: 'INVOICE', name: 'Invoice', description: 'Commercial invoice document' },
            { id: uuid(), code: 'RECEIPT', name: 'Receipt', description: 'Payment receipt document' },
            { id: uuid(), code: 'CONTRACT', name: 'Contract', description: 'Contract agreement document' },
            { id: uuid(), code: 'INSPECTION_REPORT', name: 'Inspection Report', description: 'Container inspection report' },
            { id: uuid(), code: 'PHOTO', name: 'Photo', description: 'Photo documentation' },
            { id: uuid(), code: 'CERTIFICATE', name: 'Certificate', description: 'Certification document' },
            { id: uuid(), code: 'EDO', name: 'Equipment Delivery Order', description: 'Equipment delivery order document' },
            { id: uuid(), code: 'EIR', name: 'Equipment Interchange Receipt', description: 'Equipment interchange receipt' },
            { id: uuid(), code: 'BOL', name: 'Bill of Lading', description: 'Bill of lading document' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_document_types seeded successfully');
      } else {
        console.log(`✅ md_document_types already has ${docCount} records - skipping`);
      }
      completedTables.push('md_document_types');
    } catch (error) {
      console.log('❌ md_document_types failed:', error.message);
      failedTables.push({ table: 'md_document_types', error: error.message });
    }

    // 15. md_service_codes
    try {
      console.log('🔧 Seeding md_service_codes...');
      const serviceCount = await prisma.md_service_codes.count();
      if (serviceCount === 0) {
        await prisma.md_service_codes.createMany({
          data: [
            { id: uuid(), code: 'STORAGE', name: 'Storage', description: 'Container storage service' },
            { id: uuid(), code: 'TRANSPORT', name: 'Transport', description: 'Container transport service' },
            { id: uuid(), code: 'INSPECTION', name: 'Inspection', description: 'Container inspection service' },
            { id: uuid(), code: 'REPAIR', name: 'Repair', description: 'Container repair service' },
            { id: uuid(), code: 'CLEANING', name: 'Cleaning', description: 'Container cleaning service' },
            { id: uuid(), code: 'CERTIFICATION', name: 'Certification', description: 'Container certification service' },
            { id: uuid(), code: 'FUMIGATION', name: 'Fumigation', description: 'Container fumigation service' },
            { id: uuid(), code: 'SURVEY', name: 'Survey', description: 'Container survey service' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_service_codes seeded successfully');
      } else {
        console.log(`✅ md_service_codes already has ${serviceCount} records - skipping`);
      }
      completedTables.push('md_service_codes');
    } catch (error) {
      console.log('❌ md_service_codes failed:', error.message);
      failedTables.push({ table: 'md_service_codes', error: error.message });
    }

    // 16. md_payment_method_types
    try {
      console.log('💳 Seeding md_payment_method_types...');
      const paymentCount = await prisma.md_payment_method_types.count();
      if (paymentCount === 0) {
        await prisma.md_payment_method_types.createMany({
          data: [
            { id: uuid(), code: 'CREDIT_CARD', name: 'Credit Card', description: 'Credit card payment' },
            { id: uuid(), code: 'BANK_TRANSFER', name: 'Bank Transfer', description: 'Bank wire transfer' },
            { id: uuid(), code: 'PAYPAL', name: 'PayPal', description: 'PayPal payment' },
            { id: uuid(), code: 'CASH', name: 'Cash', description: 'Cash payment' },
            { id: uuid(), code: 'CHECK', name: 'Check', description: 'Check payment' },
            { id: uuid(), code: 'CRYPTOCURRENCY', name: 'Cryptocurrency', description: 'Digital currency payment' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_payment_method_types seeded successfully');
      } else {
        console.log(`✅ md_payment_method_types already has ${paymentCount} records - skipping`);
      }
      completedTables.push('md_payment_method_types');
    } catch (error) {
      console.log('❌ md_payment_method_types failed:', error.message);
      failedTables.push({ table: 'md_payment_method_types', error: error.message });
    }

    // 17. md_incoterms
    try {
      console.log('🌐 Seeding md_incoterms...');
      const incotermsCount = await prisma.md_incoterms.count();
      if (incotermsCount === 0) {
        await prisma.md_incoterms.createMany({
          data: [
            { id: uuid(), code: 'EXW', name: 'Ex Works', description: 'Ex Works (named place of delivery)' },
            { id: uuid(), code: 'FCA', name: 'Free Carrier', description: 'Free Carrier (named place of delivery)' },
            { id: uuid(), code: 'CPT', name: 'Carriage Paid To', description: 'Carriage Paid To (named place of destination)' },
            { id: uuid(), code: 'CIP', name: 'Carriage and Insurance Paid', description: 'Carriage and Insurance Paid To (named place of destination)' },
            { id: uuid(), code: 'DAP', name: 'Delivered at Place', description: 'Delivered at Place (named place of destination)' },
            { id: uuid(), code: 'DPU', name: 'Delivered at Place Unloaded', description: 'Delivered at Place Unloaded (named place of destination)' },
            { id: uuid(), code: 'DDP', name: 'Delivered Duty Paid', description: 'Delivered Duty Paid (named place of destination)' },
            { id: uuid(), code: 'FAS', name: 'Free Alongside Ship', description: 'Free Alongside Ship (named port of shipment)' },
            { id: uuid(), code: 'FOB', name: 'Free on Board', description: 'Free on Board (named port of shipment)' },
            { id: uuid(), code: 'CFR', name: 'Cost and Freight', description: 'Cost and Freight (named port of destination)' },
            { id: uuid(), code: 'CIF', name: 'Cost, Insurance and Freight', description: 'Cost, Insurance and Freight (named port of destination)' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_incoterms seeded successfully');
      } else {
        console.log(`✅ md_incoterms already has ${incotermsCount} records - skipping`);
      }
      completedTables.push('md_incoterms');
    } catch (error) {
      console.log('❌ md_incoterms failed:', error.message);
      failedTables.push({ table: 'md_incoterms', error: error.message });
    }

    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('🎉 COMPLETE MASTER DATA SEEDING SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully completed: ${completedTables.length} tables`);
    completedTables.forEach(table => console.log(`   ✅ ${table}`));
    
    if (failedTables.length > 0) {
      console.log(`\n❌ Failed: ${failedTables.length} tables`);
      failedTables.forEach(item => console.log(`   ❌ ${item.table}: ${item.error}`));
    }
    
    console.log('\n📊 Verification - Final counts:');
    
    // Count all master data tables
    const finalCounts = {};
    const tableNames = [
      'md_countries', 'md_currencies', 'md_provinces', 'md_cities',
      'md_container_sizes', 'md_container_types', 'md_quality_standards', 'md_iso_container_codes',
      'md_deal_types', 'md_delivery_statuses', 'md_order_statuses', 'md_listing_statuses',
      'md_movement_types', 'md_document_types', 'md_service_codes', 'md_payment_method_types',
      'md_incoterms'
    ];
    
    for (const tableName of tableNames) {
      try {
        const count = await prisma[tableName].count();
        finalCounts[tableName] = count;
        console.log(`   📋 ${tableName}: ${count} records`);
      } catch (error) {
        finalCounts[tableName] = 0;
        console.log(`   ❌ ${tableName}: Error counting records`);
      }
    }
    
    const totalRecords = Object.values(finalCounts).reduce((sum, count) => sum + count, 0);
    console.log(`\n🎯 Total master data records: ${totalRecords}`);
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Error in master data seeding:', error);
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