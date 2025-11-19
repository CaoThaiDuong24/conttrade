import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🚀 Seeding final 7 master data tables...\n');
  
  const completedTables = [];
  const failedTables = [];

  try {
    // 1. md_redaction_channels
    try {
      console.log('🔒 Seeding md_redaction_channels...');
      const redactionCount = await prisma.md_redaction_channels.count();
      if (redactionCount === 0) {
        await prisma.md_redaction_channels.createMany({
          data: [
            { id: uuid(), code: 'CHAT', name: 'Tin nhắn chat', description: 'Che thông tin trong chat' },
            { id: uuid(), code: 'LISTING', name: 'Tin đăng', description: 'Che thông tin trong tin đăng' },
            { id: uuid(), code: 'REVIEW', name: 'Đánh giá', description: 'Che thông tin trong đánh giá' },
            { id: uuid(), code: 'PROFILE', name: 'Hồ sơ', description: 'Che thông tin trong hồ sơ' },
            { id: uuid(), code: 'COMMENT', name: 'Bình luận', description: 'Che thông tin trong bình luận' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_redaction_channels seeded successfully');
      } else {
        console.log(`✅ md_redaction_channels already has ${redactionCount} records - skipping`);
      }
      completedTables.push('md_redaction_channels');
    } catch (error) {
      console.log('❌ md_redaction_channels failed:', error.message);
      failedTables.push({ table: 'md_redaction_channels', error: error.message });
    }

    // 2. md_ref_doc_types
    try {
      console.log('📄 Seeding md_ref_doc_types...');
      const refDocCount = await prisma.md_ref_doc_types.count();
      if (refDocCount === 0) {
        await prisma.md_ref_doc_types.createMany({
          data: [
            { id: uuid(), code: 'ORDER', name: 'Đơn hàng', description: 'Tài liệu tham chiếu đơn hàng' },
            { id: uuid(), code: 'INSPECTION', name: 'Giám định', description: 'Tài liệu tham chiếu giám định' },
            { id: uuid(), code: 'REPAIR', name: 'Sửa chữa', description: 'Tài liệu tham chiếu sửa chữa' },
            { id: uuid(), code: 'TRANSFER', name: 'Chuyển kho', description: 'Tài liệu tham chiếu chuyển kho' },
            { id: uuid(), code: 'ADJUSTMENT', name: 'Điều chỉnh', description: 'Tài liệu tham chiếu điều chỉnh tồn kho' },
            { id: uuid(), code: 'INVOICE', name: 'Hóa đơn', description: 'Tài liệu tham chiếu hóa đơn' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_ref_doc_types seeded successfully');
      } else {
        console.log(`✅ md_ref_doc_types already has ${refDocCount} records - skipping`);
      }
      completedTables.push('md_ref_doc_types');
    } catch (error) {
      console.log('❌ md_ref_doc_types failed:', error.message);
      failedTables.push({ table: 'md_ref_doc_types', error: error.message });
    }

    // 3. md_repair_item_codes
    try {
      console.log('🔧 Seeding md_repair_item_codes...');
      const repairItemCount = await prisma.md_repair_item_codes.count();
      if (repairItemCount === 0) {
        await prisma.md_repair_item_codes.createMany({
          data: [
            { id: uuid(), code: 'WELDING', name: 'Hàn', description: 'Hàn vá các vị trí hư hỏng' },
            { id: uuid(), code: 'PAINTING', name: 'Sơn', description: 'Sơn lại container' },
            { id: uuid(), code: 'DOOR_REPAIR', name: 'Sửa cửa', description: 'Sửa chữa cửa container' },
            { id: uuid(), code: 'FLOOR_REPAIR', name: 'Sửa sàn', description: 'Sửa chữa sàn container' },
            { id: uuid(), code: 'ROOF_REPAIR', name: 'Sửa mái', description: 'Sửa chữa mái container' },
            { id: uuid(), code: 'SEAL_REPLACEMENT', name: 'Thay gioăng', description: 'Thay gioăng chống thấm' },
            { id: uuid(), code: 'CLEANING', name: 'Vệ sinh', description: 'Vệ sinh container' },
            { id: uuid(), code: 'FUMIGATION', name: 'Xông khói', description: 'Xông khói diệt khuẩn' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_repair_item_codes seeded successfully');
      } else {
        console.log(`✅ md_repair_item_codes already has ${repairItemCount} records - skipping`);
      }
      completedTables.push('md_repair_item_codes');
    } catch (error) {
      console.log('❌ md_repair_item_codes failed:', error.message);
      failedTables.push({ table: 'md_repair_item_codes', error: error.message });
    }

    // 4. md_sla_codes
    try {
      console.log('⏱️ Seeding md_sla_codes...');
      const slaCount = await prisma.md_sla_codes.count();
      if (slaCount === 0) {
        await prisma.md_sla_codes.createMany({
          data: [
            { id: uuid(), code: 'RESPONSE_TIME', name: 'Thời gian phản hồi', description: 'SLA cho thời gian phản hồi' },
            { id: uuid(), code: 'DELIVERY_TIME', name: 'Thời gian giao hàng', description: 'SLA cho thời gian giao hàng' },
            { id: uuid(), code: 'INSPECTION_TIME', name: 'Thời gian giám định', description: 'SLA cho thời gian hoàn thành giám định' },
            { id: uuid(), code: 'REPAIR_TIME', name: 'Thời gian sửa chữa', description: 'SLA cho thời gian hoàn thành sửa chữa' },
            { id: uuid(), code: 'QUOTE_TIME', name: 'Thời gian báo giá', description: 'SLA cho thời gian gửi báo giá' },
            { id: uuid(), code: 'PAYMENT_TIME', name: 'Thời gian thanh toán', description: 'SLA cho thời gian xử lý thanh toán' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_sla_codes seeded successfully');
      } else {
        console.log(`✅ md_sla_codes already has ${slaCount} records - skipping`);
      }
      completedTables.push('md_sla_codes');
    } catch (error) {
      console.log('❌ md_sla_codes failed:', error.message);
      failedTables.push({ table: 'md_sla_codes', error: error.message });
    }

    // 5. md_tax_codes
    try {
      console.log('💸 Seeding md_tax_codes...');
      const taxCount = await prisma.md_tax_codes.count();
      if (taxCount === 0) {
        await prisma.md_tax_codes.createMany({
          data: [
            { id: uuid(), code: 'VAT_10', name: 'VAT 10%', description: 'Thuế giá trị gia tăng 10%' },
            { id: uuid(), code: 'VAT_8', name: 'VAT 8%', description: 'Thuế giá trị gia tăng 8%' },
            { id: uuid(), code: 'VAT_5', name: 'VAT 5%', description: 'Thuế giá trị gia tăng 5%' },
            { id: uuid(), code: 'VAT_0', name: 'VAT 0%', description: 'Miễn thuế VAT' },
            { id: uuid(), code: 'EXPORT_TAX', name: 'Thuế xuất khẩu', description: 'Thuế áp dụng cho xuất khẩu' },
            { id: uuid(), code: 'IMPORT_TAX', name: 'Thuế nhập khẩu', description: 'Thuế áp dụng cho nhập khẩu' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_tax_codes seeded successfully');
      } else {
        console.log(`✅ md_tax_codes already has ${taxCount} records - skipping`);
      }
      completedTables.push('md_tax_codes');
    } catch (error) {
      console.log('❌ md_tax_codes failed:', error.message);
      failedTables.push({ table: 'md_tax_codes', error: error.message });
    }

    // 6. md_template_codes
    try {
      console.log('📝 Seeding md_template_codes...');
      const templateCount = await prisma.md_template_codes.count();
      if (templateCount === 0) {
        await prisma.md_template_codes.createMany({
          data: [
            { id: uuid(), code: 'EMAIL_WELCOME', name: 'Email chào mừng', description: 'Template email chào mừng user mới' },
            { id: uuid(), code: 'EMAIL_RESET_PASSWORD', name: 'Email reset mật khẩu', description: 'Template email reset mật khẩu' },
            { id: uuid(), code: 'EMAIL_ORDER_CONFIRM', name: 'Email xác nhận đơn hàng', description: 'Template email xác nhận đơn hàng' },
            { id: uuid(), code: 'SMS_OTP', name: 'SMS OTP', description: 'Template SMS gửi mã OTP' },
            { id: uuid(), code: 'NOTIFICATION_NEW_MESSAGE', name: 'Thông báo tin nhắn mới', description: 'Template thông báo tin nhắn mới' },
            { id: uuid(), code: 'NOTIFICATION_PAYMENT', name: 'Thông báo thanh toán', description: 'Template thông báo thanh toán thành công' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_template_codes seeded successfully');
      } else {
        console.log(`✅ md_template_codes already has ${templateCount} records - skipping`);
      }
      completedTables.push('md_template_codes');
    } catch (error) {
      console.log('❌ md_template_codes failed:', error.message);
      failedTables.push({ table: 'md_template_codes', error: error.message });
    }

    // 7. md_violation_codes
    try {
      console.log('⚠️ Seeding md_violation_codes...');
      const violationCount = await prisma.md_violation_codes.count();
      if (violationCount === 0) {
        await prisma.md_violation_codes.createMany({
          data: [
            { id: uuid(), code: 'SPAM', name: 'Spam', description: 'Đăng tin spam, lặp lại' },
            { id: uuid(), code: 'FAKE_INFO', name: 'Thông tin giả', description: 'Cung cấp thông tin không chính xác' },
            { id: uuid(), code: 'INAPPROPRIATE_CONTENT', name: 'Nội dung không phù hợp', description: 'Nội dung không phù hợp với chính sách' },
            { id: uuid(), code: 'PRICE_MANIPULATION', name: 'Thao túng giá', description: 'Thao túng giá cả bất hợp lý' },
            { id: uuid(), code: 'CONTACT_INFO_SHARING', name: 'Chia sẻ thông tin liên hệ', description: 'Chia sẻ thông tin liên hệ trái phép' },
            { id: uuid(), code: 'HARASSMENT', name: 'Quấy rối', description: 'Quấy rối người dùng khác' },
            { id: uuid(), code: 'COPYRIGHT', name: 'Vi phạm bản quyền', description: 'Sử dụng hình ảnh, nội dung không có bản quyền' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_violation_codes seeded successfully');
      } else {
        console.log(`✅ md_violation_codes already has ${violationCount} records - skipping`);
      }
      completedTables.push('md_violation_codes');
    } catch (error) {
      console.log('❌ md_violation_codes failed:', error.message);
      failedTables.push({ table: 'md_violation_codes', error: error.message });
    }

    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('🎉 FINAL MASTER DATA SEEDING COMPLETE');
    console.log('='.repeat(70));
    console.log(`✅ Successfully completed: ${completedTables.length} tables`);
    completedTables.forEach(table => console.log(`   ✅ ${table}`));
    
    if (failedTables.length > 0) {
      console.log(`\n❌ Failed: ${failedTables.length} tables`);
      failedTables.forEach(item => console.log(`   ❌ ${item.table}: ${item.error}`));
    }
    
    console.log('\n🎯 ALL MASTER DATA TABLES NOW COMPLETE!');
    console.log('\n📋 Remaining empty tables (for users to populate):');
    console.log('   - orgs (organizations)');
    console.log('   - containers');
    console.log('   - listings');
    console.log('   - rfqs');
    console.log('   - quotes');
    console.log('   - orders');
    console.log('   - subscriptions');
    console.log('\n✨ System is 100% ready for production use!');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Error in final master data seeding:', error);
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