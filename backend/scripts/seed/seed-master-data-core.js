import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 SEED MASTER DATA CƠ BẢN - i-ContExchange\n');

  try {
    // 1. COUNTRIES - Theo đúng schema
    console.log('🌍 Seeding md_countries...');
    const countries = [
      { id: 'country-vn', code: 'VN', name: 'Việt Nam', name_en: 'Vietnam' },
      { id: 'country-us', code: 'US', name: 'Hoa Kỳ', name_en: 'United States' },
      { id: 'country-cn', code: 'CN', name: 'Trung Quốc', name_en: 'China' },
      { id: 'country-jp', code: 'JP', name: 'Nhật Bản', name_en: 'Japan' },
      { id: 'country-kr', code: 'KR', name: 'Hàn Quốc', name_en: 'South Korea' },
      { id: 'country-sg', code: 'SG', name: 'Singapore', name_en: 'Singapore' },
      { id: 'country-th', code: 'TH', name: 'Thái Lan', name_en: 'Thailand' },
      { id: 'country-my', code: 'MY', name: 'Malaysia', name_en: 'Malaysia' },
      { id: 'country-id', code: 'ID', name: 'Indonesia', name_en: 'Indonesia' },
      { id: 'country-ph', code: 'PH', name: 'Philippines', name_en: 'Philippines' },
    ];

    for (const country of countries) {
      await prisma.md_countries.create({
        data: { ...country, updated_at: new Date() }
      });
    }
    console.log(`✅ Created ${countries.length} countries\n`);

    // 2. CURRENCIES - Theo đúng schema  
    console.log('💵 Seeding md_currencies...');
    const currencies = [
      { id: 'currency-vnd', code: 'VND', name: 'Vietnamese Dong', symbol: '₫', decimal_places: 0 },
      { id: 'currency-usd', code: 'USD', name: 'US Dollar', symbol: '$', decimal_places: 2 },
      { id: 'currency-eur', code: 'EUR', name: 'Euro', symbol: '€', decimal_places: 2 },
      { id: 'currency-jpy', code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimal_places: 0 },
      { id: 'currency-cny', code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimal_places: 2 },
      { id: 'currency-sgd', code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimal_places: 2 },
    ];

    for (const currency of currencies) {
      await prisma.md_currencies.create({
        data: { ...currency, updated_at: new Date() }
      });
    }
    console.log(`✅ Created ${currencies.length} currencies\n`);

    // 3. PROVINCES - Với country relationship
    console.log('📍 Seeding md_provinces...');
    const provinces = [
      { id: 'province-hn', code: 'VN-HN', name: 'Hà Nội', name_en: 'Hanoi', country_id: 'country-vn' },
      { id: 'province-hp', code: 'VN-HP', name: 'Hải Phòng', name_en: 'Hai Phong', country_id: 'country-vn' },
      { id: 'province-dn', code: 'VN-DN', name: 'Đà Nẵng', name_en: 'Da Nang', country_id: 'country-vn' },
      { id: 'province-sg', code: 'VN-SG', name: 'TP. Hồ Chí Minh', name_en: 'Ho Chi Minh City', country_id: 'country-vn' },
      { id: 'province-bd', code: 'VN-BD', name: 'Bình Dương', name_en: 'Binh Duong', country_id: 'country-vn' },
      { id: 'province-dn-dong', code: 'VN-DN-DONG', name: 'Đồng Nai', name_en: 'Dong Nai', country_id: 'country-vn' },
      { id: 'province-br-vt', code: 'VN-BR-VT', name: 'Bà Rịa - Vũng Tàu', name_en: 'Ba Ria - Vung Tau', country_id: 'country-vn' },
      { id: 'province-ct', code: 'VN-CT', name: 'Cần Thơ', name_en: 'Can Tho', country_id: 'country-vn' },
    ];

    for (const province of provinces) {
      await prisma.md_provinces.create({
        data: { ...province, updated_at: new Date() }
      });
    }
    console.log(`✅ Created ${provinces.length} provinces\n`);

    // 4. CITIES
    console.log('🏙️ Seeding md_cities...');
    const cities = [
      { id: 'city-hcm', code: 'HCM', name: 'TP. Hồ Chí Minh', name_en: 'Ho Chi Minh City', province_id: 'province-sg' },
      { id: 'city-hn', code: 'HN', name: 'Hà Nội', name_en: 'Hanoi', province_id: 'province-hn' },
      { id: 'city-dn', code: 'DN', name: 'Đà Nẵng', name_en: 'Da Nang', province_id: 'province-dn' },
      { id: 'city-hp', code: 'HP', name: 'Hải Phòng', name_en: 'Hai Phong', province_id: 'province-hp' },
      { id: 'city-ct', code: 'CT', name: 'Cần Thơ', name_en: 'Can Tho', province_id: 'province-ct' },
    ];

    for (const city of cities) {
      await prisma.md_cities.create({
        data: { ...city, updated_at: new Date() }
      });
    }
    console.log(`✅ Created ${cities.length} cities\n`);

    // 5. CONTAINER SIZES
    console.log('📦 Seeding md_container_sizes...');
    const containerSizes = [
      { id: 'size-10', size_ft: 10, name: '10ft Container', description: '10 feet container' },
      { id: 'size-20', size_ft: 20, name: '20ft Container', description: '20 feet container' },
      { id: 'size-40', size_ft: 40, name: '40ft Container', description: '40 feet container' },
      { id: 'size-45', size_ft: 45, name: '45ft Container', description: '45 feet container' },
    ];

    for (const size of containerSizes) {
      await prisma.md_container_sizes.create({
        data: { ...size, updated_at: new Date() }
      });
    }
    console.log(`✅ Created ${containerSizes.length} container sizes\n`);

    // 6. CONTAINER TYPES
    console.log('📦 Seeding md_container_types...');
    const containerTypes = [
      { id: 'type-dry', code: 'DRY', name: 'Dry Cargo', description: 'Standard dry cargo container' },
      { id: 'type-hc', code: 'HC', name: 'High Cube', description: 'High cube container (9\'6" height)' },
      { id: 'type-rf', code: 'RF', name: 'Refrigerated', description: 'Refrigerated container' },
      { id: 'type-ot', code: 'OT', name: 'Open Top', description: 'Open top container' },
      { id: 'type-fr', code: 'FR', name: 'Flat Rack', description: 'Flat rack container' },
      { id: 'type-tk', code: 'TK', name: 'Tank', description: 'Tank container' },
      { id: 'type-pf', code: 'PF', name: 'Platform', description: 'Platform container' },
      { id: 'type-vh', code: 'VH', name: 'Ventilated', description: 'Ventilated container' },
    ];

    for (const type of containerTypes) {
      await prisma.md_container_types.create({
        data: { ...type, updated_at: new Date() }
      });
    }
    console.log(`✅ Created ${containerTypes.length} container types\n`);

    // 7. QUALITY STANDARDS
    console.log('⭐ Seeding md_quality_standards...');
    const qualityStandards = [
      { id: 'quality-wwt', code: 'WWT', name: 'Wind and Water Tight', description: 'Highest quality standard' },
      { id: 'quality-cw', code: 'CW', name: 'Cargo Worthy', description: 'Good condition for cargo' },
      { id: 'quality-iicl', code: 'IICL', name: 'IICL Standard', description: 'Institute of International Container Lessors' },
      { id: 'quality-asis', code: 'ASIS', name: 'As Is', description: 'Sold as-is condition' },
    ];

    for (const standard of qualityStandards) {
      await prisma.md_quality_standards.create({
        data: { ...standard, updated_at: new Date() }
      });
    }
    console.log(`✅ Created ${qualityStandards.length} quality standards\n`);

    // 8. ISO CONTAINER CODES
    console.log('📋 Seeding md_iso_container_codes...');
    const isoCodes = [
      { id: 'iso-22g1', code: '22G1', description: '20ft General Purpose' },
      { id: 'iso-42g1', code: '42G1', description: '40ft General Purpose' },
      { id: 'iso-45g1', code: '45G1', description: '45ft High Cube' },
      { id: 'iso-22r1', code: '22R1', description: '20ft Refrigerated' },
      { id: 'iso-42r1', code: '42R1', description: '40ft Refrigerated' },
      { id: 'iso-22u1', code: '22U1', description: '20ft Open Top' },
      { id: 'iso-42u1', code: '42U1', description: '40ft Open Top' },
      { id: 'iso-22p1', code: '22P1', description: '20ft Flat Rack' },
      { id: 'iso-42p1', code: '42P1', description: '40ft Flat Rack' },
      { id: 'iso-22t1', code: '22T1', description: '20ft Tank' },
    ];

    for (const iso of isoCodes) {
      await prisma.md_iso_container_codes.create({
        data: { ...iso, updated_at: new Date() }
      });
    }
    console.log(`✅ Created ${isoCodes.length} ISO container codes\n`);

    // 9. DEAL TYPES
    console.log('💼 Seeding md_deal_types...');
    const dealTypes = [
      { id: 'deal-sale', code: 'sale', name: 'Sale', description: 'Container sale' },
      { id: 'deal-rental', code: 'rental', name: 'Rental', description: 'Container rental/lease' },
    ];

    for (const deal of dealTypes) {
      await prisma.md_deal_types.create({
        data: { ...deal, updated_at: new Date() }
      });
    }
    console.log(`✅ Created ${dealTypes.length} deal types\n`);

    // 10. STATUS TABLES
    console.log('📊 Seeding status tables...');

    // Listing Statuses
    const listingStatuses = [
      { id: 'listing-draft', code: 'draft', name: 'Draft', sort_order: 1 },
      { id: 'listing-pending', code: 'pending_review', name: 'Pending Review', sort_order: 2 },
      { id: 'listing-active', code: 'active', name: 'Active', sort_order: 3 },
      { id: 'listing-paused', code: 'paused', name: 'Paused', sort_order: 4 },
      { id: 'listing-sold', code: 'sold', name: 'Sold', sort_order: 5 },
      { id: 'listing-rented', code: 'rented', name: 'Rented', sort_order: 6 },
      { id: 'listing-archived', code: 'archived', name: 'Archived', sort_order: 7 },
      { id: 'listing-rejected', code: 'rejected', name: 'Rejected', sort_order: 8 },
    ];

    for (const status of listingStatuses) {
      await prisma.md_listing_statuses.create({
        data: { ...status, updated_at: new Date() }
      });
    }

    // Order Statuses  
    const orderStatuses = [
      { id: 'order-created', code: 'created', name: 'Created', sort_order: 1 },
      { id: 'order-awaiting', code: 'awaiting_funds', name: 'Awaiting Funds', sort_order: 2 },
      { id: 'order-escrow', code: 'escrow_funded', name: 'Escrow Funded', sort_order: 3 },
      { id: 'order-preparing', code: 'preparing', name: 'Preparing', sort_order: 4 },
      { id: 'order-delivering', code: 'delivering', name: 'Delivering', sort_order: 5 },
      { id: 'order-delivered', code: 'delivered', name: 'Delivered', sort_order: 6 },
      { id: 'order-completed', code: 'completed', name: 'Completed', sort_order: 7 },
      { id: 'order-cancelled', code: 'cancelled', name: 'Cancelled', sort_order: 8 },
      { id: 'order-disputed', code: 'disputed', name: 'Disputed', sort_order: 9 },
    ];

    for (const status of orderStatuses) {
      await prisma.md_order_statuses.create({
        data: { ...status, updated_at: new Date() }
      });
    }

    // Payment Statuses
    const paymentStatuses = [
      { id: 'payment-initiated', code: 'initiated', name: 'Initiated', sort_order: 1 },
      { id: 'payment-escrow', code: 'escrow_funded', name: 'Escrow Funded', sort_order: 2 },
      { id: 'payment-released', code: 'released', name: 'Released', sort_order: 3 },
      { id: 'payment-refunded', code: 'refunded', name: 'Refunded', sort_order: 4 },
      { id: 'payment-failed', code: 'failed', name: 'Failed', sort_order: 5 },
    ];

    for (const status of paymentStatuses) {
      await prisma.md_payment_statuses.create({
        data: { ...status, updated_at: new Date() }
      });
    }

    // Delivery Statuses
    const deliveryStatuses = [
      { id: 'delivery-requested', code: 'requested', name: 'Requested', sort_order: 1 },
      { id: 'delivery-booked', code: 'booked', name: 'Booked', sort_order: 2 },
      { id: 'delivery-transit', code: 'in_transit', name: 'In Transit', sort_order: 3 },
      { id: 'delivery-delivered', code: 'delivered', name: 'Delivered', sort_order: 4 },
      { id: 'delivery-failed', code: 'failed', name: 'Failed', sort_order: 5 },
    ];

    for (const status of deliveryStatuses) {
      await prisma.md_delivery_statuses.create({
        data: { ...status, updated_at: new Date() }
      });
    }

    // Dispute Statuses
    const disputeStatuses = [
      { id: 'dispute-open', code: 'open', name: 'Open', sort_order: 1 },
      { id: 'dispute-investigating', code: 'investigating', name: 'Investigating', sort_order: 2 },
      { id: 'dispute-resolved-refund', code: 'resolved_refund', name: 'Resolved - Refund', sort_order: 3 },
      { id: 'dispute-resolved-payout', code: 'resolved_payout', name: 'Resolved - Payout', sort_order: 4 },
      { id: 'dispute-partial', code: 'partial', name: 'Partial Resolution', sort_order: 5 },
      { id: 'dispute-closed', code: 'closed', name: 'Closed', sort_order: 6 },
    ];

    for (const status of disputeStatuses) {
      await prisma.md_dispute_statuses.create({
        data: { ...status, updated_at: new Date() }
      });
    }

    console.log('✅ Created all status tables\n');

    // 11. DOCUMENT TYPES
    console.log('📄 Seeding md_document_types...');
    const documentTypes = [
      { id: 'doc-edo', code: 'EDO', name: 'Equipment Delivery Order', description: 'Equipment delivery order document' },
      { id: 'doc-eir', code: 'EIR', name: 'Equipment Interchange Receipt', description: 'Equipment interchange receipt' },
      { id: 'doc-invoice', code: 'INVOICE', name: 'Invoice', description: 'Invoice document' },
      { id: 'doc-receipt', code: 'RECEIPT', name: 'Payment Receipt', description: 'Payment receipt' },
      { id: 'doc-bol', code: 'BOL', name: 'Bill of Lading', description: 'Bill of lading document' },
      { id: 'doc-packing', code: 'PACKING_LIST', name: 'Packing List', description: 'Packing list document' },
      { id: 'doc-coo', code: 'COO', name: 'Certificate of Origin', description: 'Certificate of origin' },
      { id: 'doc-insurance', code: 'INSURANCE', name: 'Insurance Certificate', description: 'Insurance certificate' },
      { id: 'doc-customs', code: 'CUSTOMS', name: 'Customs Declaration', description: 'Customs declaration' },
    ];

    for (const docType of documentTypes) {
      await prisma.md_document_types.create({
        data: { ...docType, updated_at: new Date() }
      });
    }
    console.log(`✅ Created ${documentTypes.length} document types\n`);

    // 12. SERVICE CODES
    console.log('🔧 Seeding md_service_codes...');
    const serviceCodes = [
      { id: 'service-inspection', code: 'inspection', name: 'Inspection Service', billable: true },
      { id: 'service-repair', code: 'repair', name: 'Repair Service', billable: true },
      { id: 'service-storage', code: 'storage', name: 'Storage Service', billable: true },
      { id: 'service-delivery', code: 'delivery_estimate', name: 'Delivery Estimate', billable: true },
      { id: 'service-insurance', code: 'insurance', name: 'Insurance', billable: true },
      { id: 'service-cleaning', code: 'cleaning', name: 'Cleaning Service', billable: true },
      { id: 'service-fumigation', code: 'fumigation', name: 'Fumigation', billable: true },
      { id: 'service-survey', code: 'survey', name: 'Container Survey', billable: true },
    ];

    for (const service of serviceCodes) {
      await prisma.md_service_codes.create({
        data: { ...service, updated_at: new Date() }
      });
    }
    console.log(`✅ Created ${serviceCodes.length} service codes\n`);

    // 13. MOVEMENT TYPES
    console.log('📊 Seeding md_movement_types...');
    const movementTypes = [
      { id: 'movement-in', code: 'IN', name: 'Inbound', direction: 1 },
      { id: 'movement-out', code: 'OUT', name: 'Outbound', direction: -1 },
      { id: 'movement-transfer', code: 'TRANSFER', name: 'Transfer', direction: 0 },
    ];

    for (const movement of movementTypes) {
      await prisma.md_movement_types.create({
        data: { ...movement, updated_at: new Date() }
      });
    }
    console.log(`✅ Created ${movementTypes.length} movement types\n`);

    // SUMMARY
    console.log('\n' + '='.repeat(70));
    console.log('🎉 MASTER DATA SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log('📊 Summary:');
    console.log(`   🌍 Countries: ${countries.length}`);
    console.log(`   💵 Currencies: ${currencies.length}`);
    console.log(`   📍 Provinces: ${provinces.length}`);
    console.log(`   🏙️ Cities: ${cities.length}`);
    console.log(`   📦 Container Sizes: ${containerSizes.length}`);
    console.log(`   📦 Container Types: ${containerTypes.length}`);
    console.log(`   ⭐ Quality Standards: ${qualityStandards.length}`);
    console.log(`   📋 ISO Codes: ${isoCodes.length}`);
    console.log(`   💼 Deal Types: ${dealTypes.length}`);
    console.log(`   📊 Status Tables: Listing (8), Order (9), Payment (5), Delivery (5), Dispute (6)`);
    console.log(`   📄 Document Types: ${documentTypes.length}`);
    console.log(`   🔧 Service Codes: ${serviceCodes.length}`);
    console.log(`   📊 Movement Types: ${movementTypes.length}`);
    console.log('='.repeat(70));
    console.log('✅ Core master data ready for business operations!');

  } catch (error) {
    console.error('❌ Error seeding master data:', error);
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