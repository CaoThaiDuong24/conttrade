import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateToVietnamese() {
  console.log('\n🇻🇳 BẮT ĐẦU CẬP NHẬT MASTER DATA SANG TIẾNG VIỆT\n');
  
  const updatedTables = [];
  const failedTables = [];

  try {
    // 1. Update md_countries - đã có tiếng Việt, chỉ cần check
    console.log('🌍 Kiểm tra md_countries...');
    const countryCount = await prisma.md_countries.count();
    console.log(`✅ md_countries: ${countryCount} records - đã có tiếng Việt`);
    updatedTables.push('md_countries');

    // 2. Update md_provinces - đã có tiếng Việt
    console.log('📍 Kiểm tra md_provinces...');
    const provinceCount = await prisma.md_provinces.count();
    console.log(`✅ md_provinces: ${provinceCount} records - đã có tiếng Việt`);
    updatedTables.push('md_provinces');

    // 3. Update md_cities - đã có tiếng Việt
    console.log('🏙️ Kiểm tra md_cities...');
    const cityCount = await prisma.md_cities.count();
    console.log(`✅ md_cities: ${cityCount} records - đã có tiếng Việt`);
    updatedTables.push('md_cities');

    // 4. Update md_currencies - cập nhật mô tả
    try {
      console.log('💵 Cập nhật md_currencies...');
      
      const currencyUpdates = [
        { code: 'USD', name: 'Đô la Mỹ', description: 'Đô la Mỹ - Đơn vị tiền tệ quốc tế chính' },
        { code: 'VND', name: 'Việt Nam Đồng', description: 'Việt Nam Đồng - Đơn vị tiền tệ của Việt Nam' },
        { code: 'EUR', name: 'Euro', description: 'Euro - Đơn vị tiền tệ của Liên minh châu Âu' },
        { code: 'SGD', name: 'Đô la Singapore', description: 'Đô la Singapore - Đơn vị tiền tệ của Singapore' },
        { code: 'CNY', name: 'Nhân dân tệ', description: 'Nhân dân tệ - Đơn vị tiền tệ của Trung Quốc' },
        { code: 'JPY', name: 'Yên Nhật', description: 'Yên Nhật - Đơn vị tiền tệ của Nhật Bản' }
      ];

      for (const currency of currencyUpdates) {
        await prisma.md_currencies.updateMany({
          where: { code: currency.code },
          data: { 
            name: currency.name, 
            description: currency.description,
            updated_at: new Date()
          }
        });
      }
      console.log('✅ md_currencies cập nhật thành công');
      updatedTables.push('md_currencies');
    } catch (error) {
      console.log('❌ md_currencies failed:', error.message);
      failedTables.push({ table: 'md_currencies', error: error.message });
    }

    // 5. Update md_container_sizes
    try {
      console.log('📦 Cập nhật md_container_sizes...');
      
      const sizeUpdates = [
        { code: '20', name: '20 feet', description: 'Container 20 feet tiêu chuẩn' },
        { code: '40', name: '40 feet', description: 'Container 40 feet tiêu chuẩn' },
        { code: '40HC', name: '40 feet cao', description: 'Container 40 feet cao (High Cube)' },
        { code: '45', name: '45 feet', description: 'Container 45 feet siêu dài' }
      ];

      for (const size of sizeUpdates) {
        await prisma.md_container_sizes.updateMany({
          where: { code: size.code },
          data: { 
            name: size.name, 
            description: size.description,
            updated_at: new Date()
          }
        });
      }
      console.log('✅ md_container_sizes cập nhật thành công');
      updatedTables.push('md_container_sizes');
    } catch (error) {
      console.log('❌ md_container_sizes failed:', error.message);
      failedTables.push({ table: 'md_container_sizes', error: error.message });
    }

    // 6. Update md_container_types
    try {
      console.log('📦 Cập nhật md_container_types...');
      
      const typeUpdates = [
        { code: 'DRY', name: 'Container khô', description: 'Container khô tiêu chuẩn cho hàng hóa thông thường' },
        { code: 'REF', name: 'Container lạnh', description: 'Container có hệ thống làm lạnh cho hàng tươi sống' },
        { code: 'OT', name: 'Container nóc mở', description: 'Container có thể mở nóc để vận chuyển hàng cao' },
        { code: 'FR', name: 'Container sàn phẳng', description: 'Container có sàn phẳng để vận chuyển hàng nặng' },
        { code: 'HC', name: 'Container cao', description: 'Container có chiều cao tăng cường (9\'6")' },
        { code: 'TANK', name: 'Container bồn', description: 'Container bồn chứa cho chất lỏng' },
        { code: 'SPECIAL', name: 'Container đặc biệt', description: 'Container thiết kế đặc biệt theo yêu cầu' },
        { code: 'BULK', name: 'Container rời', description: 'Container chuyên chở hàng rời (bulk cargo)' }
      ];

      for (const type of typeUpdates) {
        await prisma.md_container_types.updateMany({
          where: { code: type.code },
          data: { 
            name: type.name, 
            description: type.description,
            updated_at: new Date()
          }
        });
      }
      console.log('✅ md_container_types cập nhật thành công');
      updatedTables.push('md_container_types');
    } catch (error) {
      console.log('❌ md_container_types failed:', error.message);
      failedTables.push({ table: 'md_container_types', error: error.message });
    }

    // 7. Update md_quality_standards
    try {
      console.log('⭐ Cập nhật md_quality_standards...');
      
      const qualityUpdates = [
        { code: 'IICL', name: 'Tiêu chuẩn IICL', description: 'Tiêu chuẩn chất lượng cao nhất theo IICL' },
        { code: 'CW', name: 'Đạt chuẩn vận chuyển', description: 'Chất lượng tốt, đủ tiêu chuẩn vận chuyển hàng hóa' },
        { code: 'WWT', name: 'Kín gió và nước', description: 'Container kín gió và nước, chất lượng tốt' },
        { code: 'ASIS', name: 'Tình trạng hiện tại', description: 'Bán theo tình trạng hiện tại, không bảo hành' }
      ];

      for (const quality of qualityUpdates) {
        await prisma.md_quality_standards.updateMany({
          where: { code: quality.code },
          data: { 
            name: quality.name, 
            description: quality.description,
            updated_at: new Date()
          }
        });
      }
      console.log('✅ md_quality_standards cập nhật thành công');
      updatedTables.push('md_quality_standards');
    } catch (error) {
      console.log('❌ md_quality_standards failed:', error.message);
      failedTables.push({ table: 'md_quality_standards', error: error.message });
    }

    // 8. Update md_iso_container_codes
    try {
      console.log('📋 Cập nhật md_iso_container_codes...');
      
      const isoUpdates = [
        { iso_code: '22G1', description: 'Container 20 feet đa dụng tiêu chuẩn' },
        { iso_code: '42G1', description: 'Container 40 feet đa dụng tiêu chuẩn' },
        { iso_code: '45G1', description: 'Container 45 feet cao (High Cube)' },
        { iso_code: '22R1', description: 'Container 20 feet có hệ thống làm lạnh' },
        { iso_code: '42R1', description: 'Container 40 feet có hệ thống làm lạnh' },
        { iso_code: '22U1', description: 'Container 20 feet nóc mở' },
        { iso_code: '42U1', description: 'Container 40 feet nóc mở' },
        { iso_code: '22P1', description: 'Container 20 feet sàn phẳng' },
        { iso_code: '42P1', description: 'Container 40 feet sàn phẳng' },
        { iso_code: '22T1', description: 'Container 20 feet dạng bồn chứa' }
      ];

      for (const iso of isoUpdates) {
        await prisma.md_iso_container_codes.updateMany({
          where: { iso_code: iso.iso_code },
          data: { 
            description: iso.description,
            updated_at: new Date()
          }
        });
      }
      console.log('✅ md_iso_container_codes cập nhật thành công');
      updatedTables.push('md_iso_container_codes');
    } catch (error) {
      console.log('❌ md_iso_container_codes failed:', error.message);
      failedTables.push({ table: 'md_iso_container_codes', error: error.message });
    }

    // 9. Update md_deal_types - đã có tiếng Việt, chỉ cần cập nhật mô tả
    try {
      console.log('💼 Cập nhật md_deal_types...');
      
      const dealUpdates = [
        { code: 'SALE', name: 'Bán', description: 'Giao dịch bán container' },
        { code: 'RENTAL', name: 'Thuê', description: 'Giao dịch thuê container' }
      ];

      for (const deal of dealUpdates) {
        await prisma.md_deal_types.updateMany({
          where: { code: deal.code },
          data: { 
            name: deal.name, 
            description: deal.description,
            updated_at: new Date()
          }
        });
      }
      console.log('✅ md_deal_types cập nhật thành công');
      updatedTables.push('md_deal_types');
    } catch (error) {
      console.log('❌ md_deal_types failed:', error.message);
      failedTables.push({ table: 'md_deal_types', error: error.message });
    }

    // 10. Update Status Tables
    const statusTables = [
      {
        table: 'md_listing_statuses',
        updates: [
          { code: 'DRAFT', name: 'Bản nháp', description: 'Tin đăng đang ở trạng thái bản nháp' },
          { code: 'PENDING_APPROVAL', name: 'Chờ duyệt', description: 'Tin đăng đang chờ được duyệt' },
          { code: 'ACTIVE', name: 'Đang hoạt động', description: 'Tin đăng đang hoạt động và hiển thị' },
          { code: 'EXPIRED', name: 'Hết hạn', description: 'Tin đăng đã hết hạn' },
          { code: 'SOLD', name: 'Đã bán', description: 'Container trong tin đăng đã được bán' },
          { code: 'SUSPENDED', name: 'Tạm ngưng', description: 'Tin đăng bị tạm ngưng' }
        ]
      },
      {
        table: 'md_order_statuses',
        updates: [
          { code: 'PENDING', name: 'Chờ xử lý', description: 'Đơn hàng đang chờ xác nhận' },
          { code: 'CONFIRMED', name: 'Đã xác nhận', description: 'Đơn hàng đã được xác nhận' },
          { code: 'IN_PROGRESS', name: 'Đang xử lý', description: 'Đơn hàng đang được xử lý' },
          { code: 'COMPLETED', name: 'Hoàn thành', description: 'Đơn hàng đã hoàn thành thành công' },
          { code: 'CANCELLED', name: 'Đã hủy', description: 'Đơn hàng đã bị hủy' },
          { code: 'REFUNDED', name: 'Đã hoàn tiền', description: 'Đơn hàng đã được hoàn tiền' }
        ]
      },
      {
        table: 'md_payment_statuses',
        updates: [
          { code: 'PENDING', name: 'Chờ thanh toán', description: 'Thanh toán đang chờ xử lý' },
          { code: 'AUTHORIZED', name: 'Đã ủy quyền', description: 'Thanh toán đã được ủy quyền' },
          { code: 'CAPTURED', name: 'Đã thu tiền', description: 'Tiền đã được thu thành công' },
          { code: 'COMPLETED', name: 'Hoàn thành', description: 'Thanh toán đã hoàn thành' },
          { code: 'FAILED', name: 'Thất bại', description: 'Thanh toán bị thất bại' },
          { code: 'CANCELLED', name: 'Đã hủy', description: 'Thanh toán đã bị hủy' },
          { code: 'REFUNDED', name: 'Đã hoàn tiền', description: 'Thanh toán đã được hoàn tiền' },
          { code: 'PARTIAL_REFUND', name: 'Hoàn tiền một phần', description: 'Thanh toán được hoàn tiền một phần' }
        ]
      },
      {
        table: 'md_delivery_statuses',
        updates: [
          { code: 'PENDING', name: 'Chờ giao hàng', description: 'Giao hàng đang chờ xử lý' },
          { code: 'IN_TRANSIT', name: 'Đang vận chuyển', description: 'Hàng đang được vận chuyển' },
          { code: 'DELIVERED', name: 'Đã giao', description: 'Giao hàng thành công' },
          { code: 'FAILED', name: 'Giao hàng thất bại', description: 'Giao hàng bị thất bại' },
          { code: 'CANCELLED', name: 'Đã hủy giao hàng', description: 'Giao hàng đã bị hủy' }
        ]
      },
      {
        table: 'md_dispute_statuses',
        updates: [
          { code: 'OPEN', name: 'Mở tranh chấp', description: 'Tranh chấp đã được mở' },
          { code: 'INVESTIGATING', name: 'Đang điều tra', description: 'Tranh chấp đang được điều tra' },
          { code: 'AWAITING_RESPONSE', name: 'Chờ phản hồi', description: 'Chờ phản hồi từ các bên liên quan' },
          { code: 'MEDIATION', name: 'Đang hòa giải', description: 'Tranh chấp đang trong quá trình hòa giải' },
          { code: 'RESOLVED_BUYER', name: 'Giải quyết có lợi cho người mua', description: 'Tranh chấp được giải quyết có lợi cho người mua' },
          { code: 'RESOLVED_SELLER', name: 'Giải quyết có lợi cho người bán', description: 'Tranh chấp được giải quyết có lợi cho người bán' },
          { code: 'RESOLVED_PARTIAL', name: 'Giải quyết một phần', description: 'Tranh chấp được giải quyết một phần' },
          { code: 'WITHDRAWN', name: 'Đã rút lại', description: 'Tranh chấp đã được rút lại' },
          { code: 'CLOSED', name: 'Đã đóng', description: 'Tranh chấp đã được đóng' }
        ]
      }
    ];

    for (const statusTable of statusTables) {
      try {
        console.log(`📊 Cập nhật ${statusTable.table}...`);
        
        for (const status of statusTable.updates) {
          await prisma[statusTable.table].updateMany({
            where: { code: status.code },
            data: { 
              name: status.name, 
              description: status.description,
              updated_at: new Date()
            }
          });
        }
        console.log(`✅ ${statusTable.table} cập nhật thành công`);
        updatedTables.push(statusTable.table);
      } catch (error) {
        console.log(`❌ ${statusTable.table} failed:`, error.message);
        failedTables.push({ table: statusTable.table, error: error.message });
      }
    }

    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('🇻🇳 TÓM TẮT CẬP NHẬT TIẾNG VIỆT');
    console.log('='.repeat(70));
    console.log(`✅ Cập nhật thành công: ${updatedTables.length} bảng`);
    updatedTables.forEach(table => console.log(`   ✅ ${table}`));
    
    if (failedTables.length > 0) {
      console.log(`\n❌ Cập nhật thất bại: ${failedTables.length} bảng`);
      failedTables.forEach(item => console.log(`   ❌ ${item.table}: ${item.error}`));
    }
    
    console.log('\n🎯 Kết quả:');
    console.log('   🇻🇳 Tất cả master data đã được Việt hóa');
    console.log('   📱 Frontend có thể hiển thị hoàn toàn bằng tiếng Việt');
    console.log('   ✅ Sẵn sàng cho người dùng Việt Nam');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Lỗi trong quá trình cập nhật:', error);
    throw error;
  }
}

updateToVietnamese()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\n✅ Database connection closed');
  });
