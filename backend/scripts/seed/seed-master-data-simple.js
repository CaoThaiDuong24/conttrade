import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Master Data Seeding for i-ContExchange...\n');

  try {
    // 1. Countries
    console.log('📍 Seeding md_countries...');
    await prisma.$executeRaw`
      INSERT INTO md_countries (id, code, name, name_en, created_at, updated_at) VALUES
      ('country-vn', 'VN', 'Việt Nam', 'Vietnam', NOW(), NOW()),
      ('country-us', 'US', 'Hoa Kỳ', 'United States', NOW(), NOW()),
      ('country-cn', 'CN', 'Trung Quốc', 'China', NOW(), NOW()),
      ('country-jp', 'JP', 'Nhật Bản', 'Japan', NOW(), NOW()),
      ('country-kr', 'KR', 'Hàn Quốc', 'South Korea', NOW(), NOW()),
      ('country-sg', 'SG', 'Singapore', 'Singapore', NOW(), NOW()),
      ('country-th', 'TH', 'Thái Lan', 'Thailand', NOW(), NOW()),
      ('country-my', 'MY', 'Malaysia', 'Malaysia', NOW(), NOW()),
      ('country-id', 'ID', 'Indonesia', 'Indonesia', NOW(), NOW()),
      ('country-ph', 'PH', 'Philippines', 'Philippines', NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `;
    console.log('✅ Created 10 countries\n');

    // 2. Currencies
    console.log('💵 Seeding md_currencies...');
    await prisma.$executeRaw`
      INSERT INTO md_currencies (id, code, name, symbol, decimal_places, created_at, updated_at) VALUES
      ('currency-vnd', 'VND', 'Vietnamese Dong', '₫', 0, NOW(), NOW()),
      ('currency-usd', 'USD', 'US Dollar', '$', 2, NOW(), NOW()),
      ('currency-eur', 'EUR', 'Euro', '€', 2, NOW(), NOW()),
      ('currency-jpy', 'JPY', 'Japanese Yen', '¥', 0, NOW(), NOW()),
      ('currency-cny', 'CNY', 'Chinese Yuan', '¥', 2, NOW(), NOW()),
      ('currency-sgd', 'SGD', 'Singapore Dollar', 'S$', 2, NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `;
    console.log('✅ Created 6 currencies\n');

    // 3. Provinces
    console.log('📍 Seeding md_provinces...');
    await prisma.$executeRaw`
      INSERT INTO md_provinces (id, code, name, name_en, country_id, created_at, updated_at) VALUES
      ('province-hn', 'VN-HN', 'Hà Nội', 'Hanoi', 'country-vn', NOW(), NOW()),
      ('province-hp', 'VN-HP', 'Hải Phòng', 'Hai Phong', 'country-vn', NOW(), NOW()),
      ('province-dn', 'VN-DN', 'Đà Nẵng', 'Da Nang', 'country-vn', NOW(), NOW()),
      ('province-sg', 'VN-SG', 'TP. Hồ Chí Minh', 'Ho Chi Minh City', 'country-vn', NOW(), NOW()),
      ('province-bd', 'VN-BD', 'Bình Dương', 'Binh Duong', 'country-vn', NOW(), NOW()),
      ('province-dn-dong', 'VN-DN-DONG', 'Đồng Nai', 'Dong Nai', 'country-vn', NOW(), NOW()),
      ('province-br-vt', 'VN-BR-VT', 'Bà Rịa - Vũng Tàu', 'Ba Ria - Vung Tau', 'country-vn', NOW(), NOW()),
      ('province-ct', 'VN-CT', 'Cần Thơ', 'Can Tho', 'country-vn', NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `;
    console.log('✅ Created 8 provinces\n');

    // 4. Container Sizes
    console.log('📦 Seeding md_container_sizes...');
    await prisma.$executeRaw`
      INSERT INTO md_container_sizes (id, size_ft, teu_equivalent, created_at, updated_at) VALUES
      ('size-10', 10, 0.5, NOW(), NOW()),
      ('size-20', 20, 1.0, NOW(), NOW()),
      ('size-40', 40, 2.0, NOW(), NOW()),
      ('size-45', 45, 2.25, NOW(), NOW())
      ON CONFLICT (size_ft) DO NOTHING;
    `;
    console.log('✅ Created 4 container sizes\n');

    // 5. Container Types
    console.log('📦 Seeding md_container_types...');
    await prisma.$executeRaw`
      INSERT INTO md_container_types (id, code, name, description, created_at, updated_at) VALUES
      ('type-dry', 'DRY', 'Dry Cargo', 'Standard dry cargo container', NOW(), NOW()),
      ('type-hc', 'HC', 'High Cube', 'High cube container (9''6" height)', NOW(), NOW()),
      ('type-rf', 'RF', 'Refrigerated', 'Refrigerated container', NOW(), NOW()),
      ('type-ot', 'OT', 'Open Top', 'Open top container', NOW(), NOW()),
      ('type-fr', 'FR', 'Flat Rack', 'Flat rack container', NOW(), NOW()),
      ('type-tk', 'TK', 'Tank', 'Tank container', NOW(), NOW()),
      ('type-pf', 'PF', 'Platform', 'Platform container', NOW(), NOW()),
      ('type-vh', 'VH', 'Ventilated', 'Ventilated container', NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `;
    console.log('✅ Created 8 container types\n');

    // 6. Quality Standards
    console.log('⭐ Seeding md_quality_standards...');
    await prisma.$executeRaw`
      INSERT INTO md_quality_standards (id, code, name, description, created_at, updated_at) VALUES
      ('quality-wwt', 'WWT', 'Wind and Water Tight', 'Highest quality standard', NOW(), NOW()),
      ('quality-cw', 'CW', 'Cargo Worthy', 'Good condition for cargo', NOW(), NOW()),
      ('quality-iicl', 'IICL', 'IICL Standard', 'Institute of International Container Lessors', NOW(), NOW()),
      ('quality-asis', 'ASIS', 'As Is', 'Sold as-is condition', NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `;
    console.log('✅ Created 4 quality standards\n');

    // 7. ISO Container Codes
    console.log('📋 Seeding md_iso_container_codes...');
    await prisma.$executeRaw`
      INSERT INTO md_iso_container_codes (id, code, description, created_at, updated_at) VALUES
      ('iso-22g1', '22G1', '20ft General Purpose', NOW(), NOW()),
      ('iso-42g1', '42G1', '40ft General Purpose', NOW(), NOW()),
      ('iso-45g1', '45G1', '45ft High Cube', NOW(), NOW()),
      ('iso-22r1', '22R1', '20ft Refrigerated', NOW(), NOW()),
      ('iso-42r1', '42R1', '40ft Refrigerated', NOW(), NOW()),
      ('iso-22u1', '22U1', '20ft Open Top', NOW(), NOW()),
      ('iso-42u1', '42U1', '40ft Open Top', NOW(), NOW()),
      ('iso-22p1', '22P1', '20ft Flat Rack', NOW(), NOW()),
      ('iso-42p1', '42P1', '40ft Flat Rack', NOW(), NOW()),
      ('iso-22t1', '22T1', '20ft Tank', NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `;
    console.log('✅ Created 10 ISO container codes\n');

    // 8. Deal Types
    console.log('💼 Seeding md_deal_types...');
    await prisma.$executeRaw`
      INSERT INTO md_deal_types (id, code, name, description, created_at, updated_at) VALUES
      ('deal-sale', 'sale', 'Sale', 'Container sale', NOW(), NOW()),
      ('deal-rental', 'rental', 'Rental', 'Container rental/lease', NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `;
    console.log('✅ Created 2 deal types\n');

    // 9. Listing Statuses
    console.log('📊 Seeding md_listing_statuses...');
    await prisma.$executeRaw`
      INSERT INTO md_listing_statuses (id, code, name, sort_order, created_at, updated_at) VALUES
      ('listing-draft', 'draft', 'Draft', 1, NOW(), NOW()),
      ('listing-pending', 'pending_review', 'Pending Review', 2, NOW(), NOW()),
      ('listing-active', 'active', 'Active', 3, NOW(), NOW()),
      ('listing-paused', 'paused', 'Paused', 4, NOW(), NOW()),
      ('listing-sold', 'sold', 'Sold', 5, NOW(), NOW()),
      ('listing-rented', 'rented', 'Rented', 6, NOW(), NOW()),
      ('listing-archived', 'archived', 'Archived', 7, NOW(), NOW()),
      ('listing-rejected', 'rejected', 'Rejected', 8, NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `;
    console.log('✅ Created 8 listing statuses\n');

    // 10. Order Statuses
    console.log('📦 Seeding md_order_statuses...');
    await prisma.$executeRaw`
      INSERT INTO md_order_statuses (id, code, name, sort_order, created_at, updated_at) VALUES
      ('order-created', 'created', 'Created', 1, NOW(), NOW()),
      ('order-awaiting', 'awaiting_funds', 'Awaiting Funds', 2, NOW(), NOW()),
      ('order-escrow', 'escrow_funded', 'Escrow Funded', 3, NOW(), NOW()),
      ('order-preparing', 'preparing', 'Preparing', 4, NOW(), NOW()),
      ('order-delivering', 'delivering', 'Delivering', 5, NOW(), NOW()),
      ('order-delivered', 'delivered', 'Delivered', 6, NOW(), NOW()),
      ('order-completed', 'completed', 'Completed', 7, NOW(), NOW()),
      ('order-cancelled', 'cancelled', 'Cancelled', 8, NOW(), NOW()),
      ('order-disputed', 'disputed', 'Disputed', 9, NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `;
    console.log('✅ Created 9 order statuses\n');

    // 11. Payment Statuses
    console.log('💳 Seeding md_payment_statuses...');
    await prisma.$executeRaw`
      INSERT INTO md_payment_statuses (id, code, name, sort_order, created_at, updated_at) VALUES
      ('payment-initiated', 'initiated', 'Initiated', 1, NOW(), NOW()),
      ('payment-escrow', 'escrow_funded', 'Escrow Funded', 2, NOW(), NOW()),
      ('payment-released', 'released', 'Released', 3, NOW(), NOW()),
      ('payment-refunded', 'refunded', 'Refunded', 4, NOW(), NOW()),
      ('payment-failed', 'failed', 'Failed', 5, NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `;
    console.log('✅ Created 5 payment statuses\n');

    // 12. Service Codes
    console.log('🔧 Seeding md_service_codes...');
    await prisma.$executeRaw`
      INSERT INTO md_service_codes (id, code, name, billable, created_at, updated_at) VALUES
      ('service-inspection', 'inspection', 'Inspection Service', true, NOW(), NOW()),
      ('service-repair', 'repair', 'Repair Service', true, NOW(), NOW()),
      ('service-storage', 'storage', 'Storage Service', true, NOW(), NOW()),
      ('service-delivery', 'delivery_estimate', 'Delivery Estimate', true, NOW(), NOW()),
      ('service-insurance', 'insurance', 'Insurance', true, NOW(), NOW()),
      ('service-cleaning', 'cleaning', 'Cleaning Service', true, NOW(), NOW()),
      ('service-fumigation', 'fumigation', 'Fumigation', true, NOW(), NOW()),
      ('service-survey', 'survey', 'Container Survey', true, NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `;
    console.log('✅ Created 8 service codes\n');

    // Summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ MASTER DATA SEEDING COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 Summary:');
    console.log('   Countries: 10');
    console.log('   Currencies: 6');
    console.log('   Provinces: 8');
    console.log('   Container Sizes: 4');
    console.log('   Container Types: 8');
    console.log('   Quality Standards: 4');
    console.log('   ISO Container Codes: 10');
    console.log('   Deal Types: 2');
    console.log('   Listing Statuses: 8');
    console.log('   Order Statuses: 9');
    console.log('   Payment Statuses: 5');
    console.log('   Service Codes: 8');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 Ready for RBAC and Business Data Seeding!');

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