import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function syncListingStatuses() {
  console.log('=== ĐỒNG BỘ HÓA TRẠNG THÁI LISTINGS ===\n');

  try {
    // Định nghĩa tất cả trạng thái cần có (theo schema enum)
    const requiredStatuses = [
      { code: 'DRAFT', name: 'Bản nháp', description: 'Tin đăng đang ở trạng thái bản nháp' },
      { code: 'PENDING_REVIEW', name: 'Chờ duyệt', description: 'Tin đăng đang chờ được duyệt' },
      { code: 'ACTIVE', name: 'Đang hoạt động', description: 'Tin đăng đang hoạt động và hiển thị công khai' },
      { code: 'PAUSED', name: 'Tạm dừng', description: 'Tin đăng bị tạm dừng hiển thị' },
      { code: 'SOLD', name: 'Đã bán', description: 'Container trong tin đăng đã được bán' },
      { code: 'RENTED', name: 'Đã cho thuê', description: 'Container trong tin đăng đã được cho thuê' },
      { code: 'ARCHIVED', name: 'Lưu trữ', description: 'Tin đăng đã được lưu trữ' },
      { code: 'REJECTED', name: 'Bị từ chối', description: 'Tin đăng bị từ chối duyệt' }
    ];

    // Kiểm tra trạng thái hiện tại
    const currentStatuses = await prisma.md_listing_statuses.findMany({
      select: { code: true }
    });
    const currentCodes = currentStatuses.map(s => s.code);

    console.log('1. Trạng thái hiện tại trong master data:');
    currentCodes.forEach(code => console.log(`   ✓ ${code}`));

    // Tìm các trạng thái cần thêm
    const missingStatuses = requiredStatuses.filter(status => 
      !currentCodes.includes(status.code)
    );

    if (missingStatuses.length > 0) {
      console.log('\n2. Thêm các trạng thái thiếu:');
      
      for (const status of missingStatuses) {
        console.log(`   + Thêm ${status.code}: ${status.name}`);
        
        await prisma.md_listing_statuses.create({
          data: {
            id: crypto.randomUUID(),
            code: status.code,
            name: status.name,
            description: status.description,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }
      console.log(`   ✅ Đã thêm ${missingStatuses.length} trạng thái mới`);
    } else {
      console.log('\n2. ✅ Tất cả trạng thái đã có trong master data');
    }

    // 3. Kiểm tra lại
    console.log('\n3. Kiểm tra sau khi đồng bộ:');
    const updatedStatuses = await prisma.md_listing_statuses.findMany({
      select: { code: true, name: true },
      orderBy: { code: 'asc' }
    });
    
    updatedStatuses.forEach(status => {
      const isInSchema = requiredStatuses.some(req => req.code === status.code);
      const marker = isInSchema ? '✅' : '⚠️';
      console.log(`   ${marker} ${status.code}: ${status.name}`);
    });

    // 4. Cập nhật API validation function
    console.log('\n4. Cập nhật API validation...');
    
    // Tạo validation function cho listings
    const validationCode = `
// Validation function for listing status
export const isValidListingStatus = (status: string): boolean => {
  const validStatuses = [${requiredStatuses.map(s => `'${s.code}'`).join(', ')}];
  return validStatuses.includes(status);
};

// Get all valid listing statuses
export const getValidListingStatuses = () => {
  return [${requiredStatuses.map(s => `'${s.code}'`).join(', ')}];
};
`;

    // Ghi vào file validation
    const fs = await import('fs');
    fs.writeFileSync('./src/lib/listing-status-validation.ts', validationCode);
    console.log('   ✅ Đã tạo file validation: src/lib/listing-status-validation.ts');

    console.log('\n5. ✅ HOÀN THÀNH ĐỒNG BỘ HÓA!');
    console.log('\nBây giờ cần:');
    console.log('1. Restart backend server');
    console.log('2. Test API endpoint /master-data/listing-statuses');
    console.log('3. Kiểm tra frontend có cần update không');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

syncListingStatuses();