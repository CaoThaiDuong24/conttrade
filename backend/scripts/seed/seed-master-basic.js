import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Master Data Seeding for i-ContExchange...\n');

  try {
    // 1. Countries
    console.log('📍 Seeding md_countries...');
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
        data: {
          ...country,
          updated_at: new Date()
        }
      });
    }
    console.log(`✅ Created ${countries.length} countries\n`);

    // 2. Currencies
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
        data: {
          ...currency,
          updated_at: new Date()
        }
      });
    }
    console.log(`✅ Created ${currencies.length} currencies\n`);

    // 3. Provinces
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
        data: {
          ...province,
          updated_at: new Date()
        }
      });
    }
    console.log(`✅ Created ${provinces.length} provinces\n`);

    // 4. Container Sizes
    console.log('📦 Seeding md_container_sizes...');
    const containerSizes = [
      { id: 'size-10', size_ft: 10, name: '10ft Container', description: '10 feet container' },
      { id: 'size-20', size_ft: 20, name: '20ft Container', description: '20 feet container' },
      { id: 'size-40', size_ft: 40, name: '40ft Container', description: '40 feet container' },
      { id: 'size-45', size_ft: 45, name: '45ft Container', description: '45 feet container' },
    ];

    for (const size of containerSizes) {
      await prisma.md_container_sizes.create({
        data: {
          ...size,
          updated_at: new Date()
        }
      });
    }
    console.log(`✅ Created ${containerSizes.length} container sizes\n`);

    // 5. Container Types
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
        data: {
          ...type,
          updated_at: new Date()
        }
      });
    }
    console.log(`✅ Created ${containerTypes.length} container types\n`);

    // 6. Quality Standards
    console.log('⭐ Seeding md_quality_standards...');
    const qualityStandards = [
      { id: 'quality-wwt', code: 'WWT', name: 'Wind and Water Tight', description: 'Highest quality standard' },
      { id: 'quality-cw', code: 'CW', name: 'Cargo Worthy', description: 'Good condition for cargo' },
      { id: 'quality-iicl', code: 'IICL', name: 'IICL Standard', description: 'Institute of International Container Lessors' },
      { id: 'quality-asis', code: 'ASIS', name: 'As Is', description: 'Sold as-is condition' },
    ];

    for (const standard of qualityStandards) {
      await prisma.md_quality_standards.create({
        data: {
          ...standard,
          updated_at: new Date()
        }
      });
    }
    console.log(`✅ Created ${qualityStandards.length} quality standards\n`);

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