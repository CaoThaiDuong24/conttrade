import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function validateListingStatuses() {
  console.log('=== KIỂM TRA TRẠNG THÁI LISTINGS ===\n');

  try {
    // 1. Kiểm tra enum values trong schema vs master data
    console.log('1. Master Data Listing Statuses:');
    const masterDataStatuses = await prisma.md_listing_statuses.findMany({
      select: { code: true, name: true, description: true }
    });
    masterDataStatuses.forEach(status => {
      console.log(`   - ${status.code}: ${status.name}`);
    });

    // 2. Kiểm tra enum values được sử dụng trong listings table
    console.log('\n2. Enum Values trong Listings Table:');
    const uniqueStatuses = await prisma.$queryRaw`
      SELECT DISTINCT status, COUNT(*) as count 
      FROM listings 
      GROUP BY status 
      ORDER BY status
    `;
    uniqueStatuses.forEach(item => {
      console.log(`   - ${item.status}: ${item.count} listings`);
    });

    // 3. Schema enum values (hardcoded từ schema)
    console.log('\n3. Schema Enum Values (từ schema.prisma):');
    const schemaEnums = [
      'DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'PAUSED', 
      'SOLD', 'RENTED', 'ARCHIVED', 'REJECTED'
    ];
    schemaEnums.forEach(status => {
      console.log(`   - ${status}`);
    });

    // 4. Tìm các mâu thuẫn
    console.log('\n4. PHÂN TÍCH MÂU THUẪN:');
    
    const masterDataCodes = masterDataStatuses.map(s => s.code);
    const usedStatuses = uniqueStatuses.map(s => s.status);
    
    console.log('\n   📋 Master Data có nhưng Schema KHÔNG có:');
    const extraInMasterData = masterDataCodes.filter(code => !schemaEnums.includes(code));
    extraInMasterData.forEach(code => {
      console.log(`   ❌ ${code} - cần thêm vào schema hoặc xóa khỏi master data`);
    });

    console.log('\n   📋 Schema có nhưng Master Data KHÔNG có:');
    const missingInMasterData = schemaEnums.filter(code => !masterDataCodes.includes(code));
    missingInMasterData.forEach(code => {
      console.log(`   ❌ ${code} - cần thêm vào master data`);
    });

    console.log('\n   📋 Listings đang dùng nhưng Master Data KHÔNG có:');
    const orphanedStatuses = usedStatuses.filter(code => !masterDataCodes.includes(code));
    orphanedStatuses.forEach(code => {
      console.log(`   ❌ ${code} - cần thêm vào master data hoặc migrate data`);
    });

    // 5. Đề xuất giải pháp
    console.log('\n5. ĐỀ XUẤT GIẢI PHÁP:');
    
    if (missingInMasterData.length > 0) {
      console.log('\n   🔧 Cần thêm vào master data:');
      for (const code of missingInMasterData) {
        let vietnameseName = '';
        switch(code) {
          case 'PENDING_REVIEW': vietnameseName = 'Chờ duyệt'; break;
          case 'PAUSED': vietnameseName = 'Tạm dừng'; break;
          case 'RENTED': vietnameseName = 'Đã cho thuê'; break;
          case 'ARCHIVED': vietnameseName = 'Lưu trữ'; break;
          case 'REJECTED': vietnameseName = 'Bị từ chối'; break;
          default: vietnameseName = code;
        }
        console.log(`   INSERT INTO md_listing_statuses (id, code, name, description) VALUES (gen_random_uuid(), '${code}', '${vietnameseName}', '${vietnameseName}');`);
      }
    }

    if (extraInMasterData.length > 0) {
      console.log('\n   🔧 Cần xóa khỏi master data hoặc thêm vào schema:');
      extraInMasterData.forEach(code => {
        console.log(`   - ${code}: Quyết định giữ hay xóa`);
      });
    }

    // 6. Test API endpoint
    console.log('\n6. TEST API ENDPOINT:');
    try {
      const response = await fetch('http://localhost:3006/api/v1/master-data/listing-statuses');
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ API response: ${data.success ? 'SUCCESS' : 'FAILED'}`);
        console.log(`   📊 Trả về ${data.data?.length || 0} statuses`);
      } else {
        console.log(`   ❌ API failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ API not accessible: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

validateListingStatuses();