import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🚀 Starting essential missing data seeding (Master Data + Depots)...\n');
  
  const completedTables = [];
  const failedTables = [];

  try {
    // 1. md_unlocodes (UN Location Codes)
    try {
      console.log('🌐 Seeding md_unlocodes...');
      const unlocodeCount = await prisma.md_unlocodes.count();
      if (unlocodeCount === 0) {
        await prisma.md_unlocodes.createMany({
          data: [
            { id: uuid(), code: 'VNSGN', name: 'Ho Chi Minh City', country_code: 'VN' },
            { id: uuid(), code: 'VNHAN', name: 'Hanoi', country_code: 'VN' },
            { id: uuid(), code: 'VNHPH', name: 'Hai Phong', country_code: 'VN' },
            { id: uuid(), code: 'VNDAD', name: 'Da Nang', country_code: 'VN' },
            { id: uuid(), code: 'VNQNH', name: 'Quy Nhon', country_code: 'VN' },
            { id: uuid(), code: 'VNVUT', name: 'Vung Tau', country_code: 'VN' },
            { id: uuid(), code: 'VNCAN', name: 'Can Tho', country_code: 'VN' },
            { id: uuid(), code: 'VNPHU', name: 'Phu My', country_code: 'VN' },
            { id: uuid(), code: 'SGSIN', name: 'Singapore', country_code: 'SG' },
            { id: uuid(), code: 'HKHKG', name: 'Hong Kong', country_code: 'HK' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_unlocodes seeded successfully');
      } else {
        console.log(`✅ md_unlocodes already has ${unlocodeCount} records - skipping`);
      }
      completedTables.push('md_unlocodes');
    } catch (error) {
      console.log('❌ md_unlocodes failed:', error.message);
      failedTables.push({ table: 'md_unlocodes', error: error.message });
    }

    // 2. md_adjust_reasons
    try {
      console.log('📝 Seeding md_adjust_reasons...');
      const adjustCount = await prisma.md_adjust_reasons.count();
      if (adjustCount === 0) {
        await prisma.md_adjust_reasons.createMany({
          data: [
            { id: uuid(), code: 'STOCK_COUNT', name: 'Kiểm kê tồn kho', description: 'Điều chỉnh sau kiểm kê' },
            { id: uuid(), code: 'DAMAGE', name: 'Hư hỏng', description: 'Container bị hư hỏng' },
            { id: uuid(), code: 'LOST', name: 'Thất lạc', description: 'Container bị thất lạc' },
            { id: uuid(), code: 'FOUND', name: 'Tìm thấy', description: 'Tìm thấy container thất lạc' },
            { id: uuid(), code: 'REPAIR_COMPLETE', name: 'Hoàn thành sửa chữa', description: 'Container sửa chữa xong' },
            { id: uuid(), code: 'SYSTEM_ERROR', name: 'Lỗi hệ thống', description: 'Điều chỉnh do lỗi hệ thống' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_adjust_reasons seeded successfully');
      } else {
        console.log(`✅ md_adjust_reasons already has ${adjustCount} records - skipping`);
      }
      completedTables.push('md_adjust_reasons');
    } catch (error) {
      console.log('❌ md_adjust_reasons failed:', error.message);
      failedTables.push({ table: 'md_adjust_reasons', error: error.message });
    }

    // 3. md_business_hours_policies
    try {
      console.log('🕐 Seeding md_business_hours_policies...');
      const businessHoursCount = await prisma.md_business_hours_policies.count();
      if (businessHoursCount === 0) {
        await prisma.md_business_hours_policies.createMany({
          data: [
            { id: uuid(), code: 'STANDARD', name: 'Giờ hành chính', description: '8:00-17:00, Thứ 2-6' },
            { id: uuid(), code: 'EXTENDED', name: 'Giờ mở rộng', description: '6:00-22:00, Thứ 2-7' },
            { id: uuid(), code: 'FULL_TIME', name: '24/7', description: 'Hoạt động 24/7' },
            { id: uuid(), code: 'HALF_DAY_SAT', name: 'Nửa ngày thứ 7', description: '8:00-12:00 thứ 7' },
            { id: uuid(), code: 'NIGHT_SHIFT', name: 'Ca đêm', description: '18:00-6:00' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_business_hours_policies seeded successfully');
      } else {
        console.log(`✅ md_business_hours_policies already has ${businessHoursCount} records - skipping`);
      }
      completedTables.push('md_business_hours_policies');
    } catch (error) {
      console.log('❌ md_business_hours_policies failed:', error.message);
      failedTables.push({ table: 'md_business_hours_policies', error: error.message });
    }

    // 4. md_cancel_reasons
    try {
      console.log('❌ Seeding md_cancel_reasons...');
      const cancelCount = await prisma.md_cancel_reasons.count();
      if (cancelCount === 0) {
        await prisma.md_cancel_reasons.createMany({
          data: [
            { id: uuid(), code: 'CUSTOMER_REQUEST', name: 'Yêu cầu khách hàng', description: 'Khách hàng yêu cầu hủy' },
            { id: uuid(), code: 'PAYMENT_FAILED', name: 'Thanh toán thất bại', description: 'Không thể thanh toán' },
            { id: uuid(), code: 'OUT_OF_STOCK', name: 'Hết hàng', description: 'Container không còn' },
            { id: uuid(), code: 'QUALITY_ISSUE', name: 'Vấn đề chất lượng', description: 'Container không đạt yêu cầu' },
            { id: uuid(), code: 'FORCE_MAJEURE', name: 'Bất khả kháng', description: 'Thiên tai, dịch bệnh' },
            { id: uuid(), code: 'SYSTEM_ERROR', name: 'Lỗi hệ thống', description: 'Lỗi kỹ thuật hệ thống' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_cancel_reasons seeded successfully');
      } else {
        console.log(`✅ md_cancel_reasons already has ${cancelCount} records - skipping`);
      }
      completedTables.push('md_cancel_reasons');
    } catch (error) {
      console.log('❌ md_cancel_reasons failed:', error.message);
      failedTables.push({ table: 'md_cancel_reasons', error: error.message });
    }

    // 5. md_commission_codes
    try {
      console.log('💰 Seeding md_commission_codes...');
      const commissionCount = await prisma.md_commission_codes.count();
      if (commissionCount === 0) {
        await prisma.md_commission_codes.createMany({
          data: [
            { id: uuid(), code: 'TRANSACTION', name: 'Hoa hồng giao dịch', description: 'Hoa hồng trên mỗi giao dịch' },
            { id: uuid(), code: 'LISTING', name: 'Phí đăng tin', description: 'Phí cho việc đăng tin' },
            { id: uuid(), code: 'MEMBERSHIP', name: 'Phí thành viên', description: 'Phí thành viên hàng tháng' },
            { id: uuid(), code: 'PREMIUM', name: 'Phí premium', description: 'Phí dịch vụ cao cấp' },
            { id: uuid(), code: 'INSPECTION', name: 'Phí giám định', description: 'Phí dịch vụ giám định' },
            { id: uuid(), code: 'DELIVERY', name: 'Phí vận chuyển', description: 'Phí dịch vụ vận chuyển' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_commission_codes seeded successfully');
      } else {
        console.log(`✅ md_commission_codes already has ${commissionCount} records - skipping`);
      }
      completedTables.push('md_commission_codes');
    } catch (error) {
      console.log('❌ md_commission_codes failed:', error.message);
      failedTables.push({ table: 'md_commission_codes', error: error.message });
    }

    // 6. md_delivery_event_types
    try {
      console.log('🚚 Seeding md_delivery_event_types...');
      const deliveryEventCount = await prisma.md_delivery_event_types.count();
      if (deliveryEventCount === 0) {
        await prisma.md_delivery_event_types.createMany({
          data: [
            { id: uuid(), code: 'CREATED', name: 'Tạo đơn giao hàng', description: 'Đơn giao hàng được tạo' },
            { id: uuid(), code: 'SCHEDULED', name: 'Lên lịch giao hàng', description: 'Đã lên lịch giao hàng' },
            { id: uuid(), code: 'PICKED_UP', name: 'Nhận hàng', description: 'Đã nhận hàng từ kho' },
            { id: uuid(), code: 'IN_TRANSIT', name: 'Đang vận chuyển', description: 'Đang trên đường giao' },
            { id: uuid(), code: 'DELIVERED', name: 'Đã giao', description: 'Đã giao hàng thành công' },
            { id: uuid(), code: 'FAILED', name: 'Giao thất bại', description: 'Giao hàng thất bại' },
            { id: uuid(), code: 'RETURNED', name: 'Hoàn trả', description: 'Hàng được hoàn trả' },
            { id: uuid(), code: 'CANCELLED', name: 'Hủy giao hàng', description: 'Đơn giao hàng bị hủy' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_delivery_event_types seeded successfully');
      } else {
        console.log(`✅ md_delivery_event_types already has ${deliveryEventCount} records - skipping`);
      }
      completedTables.push('md_delivery_event_types');
    } catch (error) {
      console.log('❌ md_delivery_event_types failed:', error.message);
      failedTables.push({ table: 'md_delivery_event_types', error: error.message });
    }

    // 7. md_dispute_reasons
    try {
      console.log('⚖️ Seeding md_dispute_reasons...');
      const disputeReasonCount = await prisma.md_dispute_reasons.count();
      if (disputeReasonCount === 0) {
        await prisma.md_dispute_reasons.createMany({
          data: [
            { id: uuid(), code: 'QUALITY_ISSUE', name: 'Vấn đề chất lượng', description: 'Container không đúng chất lượng mô tả' },
            { id: uuid(), code: 'DELIVERY_DELAY', name: 'Giao hàng trễ', description: 'Giao hàng không đúng thời gian' },
            { id: uuid(), code: 'DAMAGE_IN_TRANSIT', name: 'Hư hỏng khi vận chuyển', description: 'Container bị hư hỏng trong quá trình vận chuyển' },
            { id: uuid(), code: 'WRONG_ITEM', name: 'Sai hàng hóa', description: 'Nhận sai container so với đơn hàng' },
            { id: uuid(), code: 'PAYMENT_ISSUE', name: 'Vấn đề thanh toán', description: 'Tranh chấp về thanh toán' },
            { id: uuid(), code: 'CONTRACT_BREACH', name: 'Vi phạm hợp đồng', description: 'Một bên vi phạm điều khoản hợp đồng' },
            { id: uuid(), code: 'DOCUMENTATION', name: 'Vấn đề giấy tờ', description: 'Thiếu hoặc sai giấy tờ' },
            { id: uuid(), code: 'COMMUNICATION', name: 'Vấn đề giao tiếp', description: 'Hiểu lầm trong giao tiếp' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_dispute_reasons seeded successfully');
      } else {
        console.log(`✅ md_dispute_reasons already has ${disputeReasonCount} records - skipping`);
      }
      completedTables.push('md_dispute_reasons');
    } catch (error) {
      console.log('❌ md_dispute_reasons failed:', error.message);
      failedTables.push({ table: 'md_dispute_reasons', error: error.message });
    }

    // Continue with remaining master data tables...
    
    // 8. md_feature_flag_codes
    try {
      console.log('🚩 Seeding md_feature_flag_codes...');
      const featureFlagCount = await prisma.md_feature_flag_codes.count();
      if (featureFlagCount === 0) {
        await prisma.md_feature_flag_codes.createMany({
          data: [
            { id: uuid(), code: 'ADVANCED_SEARCH', name: 'Tìm kiếm nâng cao', description: 'Tính năng tìm kiếm nâng cao' },
            { id: uuid(), code: 'REAL_TIME_CHAT', name: 'Chat thời gian thực', description: 'Tính năng chat trực tiếp' },
            { id: uuid(), code: 'MOBILE_APP', name: 'Ứng dụng di động', description: 'Hỗ trợ ứng dụng mobile' },
            { id: uuid(), code: 'API_ACCESS', name: 'Truy cập API', description: 'Cho phép truy cập API' },
            { id: uuid(), code: 'BULK_UPLOAD', name: 'Tải lên hàng loạt', description: 'Tải lên nhiều container cùng lúc' },
            { id: uuid(), code: 'AUTO_MATCHING', name: 'Tự động ghép đôi', description: 'Tự động ghép buyer-seller' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_feature_flag_codes seeded successfully');
      } else {
        console.log(`✅ md_feature_flag_codes already has ${featureFlagCount} records - skipping`);
      }
      completedTables.push('md_feature_flag_codes');
    } catch (error) {
      console.log('❌ md_feature_flag_codes failed:', error.message);
      failedTables.push({ table: 'md_feature_flag_codes', error: error.message });
    }

    // 9. md_fee_codes
    try {
      console.log('💳 Seeding md_fee_codes...');
      const feeCodeCount = await prisma.md_fee_codes.count();
      if (feeCodeCount === 0) {
        await prisma.md_fee_codes.createMany({
          data: [
            { id: uuid(), code: 'TRANSACTION_FEE', name: 'Phí giao dịch', description: 'Phí cho mỗi giao dịch thành công' },
            { id: uuid(), code: 'LISTING_FEE', name: 'Phí đăng tin', description: 'Phí đăng tin premium' },
            { id: uuid(), code: 'INSPECTION_FEE', name: 'Phí giám định', description: 'Phí dịch vụ giám định container' },
            { id: uuid(), code: 'DELIVERY_FEE', name: 'Phí giao hàng', description: 'Phí vận chuyển container' },
            { id: uuid(), code: 'ESCROW_FEE', name: 'Phí ký quỹ', description: 'Phí dịch vụ ký quỹ' },
            { id: uuid(), code: 'PAYMENT_PROCESSING', name: 'Phí xử lý thanh toán', description: 'Phí xử lý thanh toán online' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_fee_codes seeded successfully');
      } else {
        console.log(`✅ md_fee_codes already has ${feeCodeCount} records - skipping`);
      }
      completedTables.push('md_fee_codes');
    } catch (error) {
      console.log('❌ md_fee_codes failed:', error.message);
      failedTables.push({ table: 'md_fee_codes', error: error.message });
    }

    // 10. md_form_schema_codes
    try {
      console.log('📋 Seeding md_form_schema_codes...');
      const formSchemaCount = await prisma.md_form_schema_codes.count();
      if (formSchemaCount === 0) {
        await prisma.md_form_schema_codes.createMany({
          data: [
            { id: uuid(), code: 'LISTING_FORM', name: 'Form đăng tin', description: 'Schema cho form đăng tin container' },
            { id: uuid(), code: 'RFQ_FORM', name: 'Form RFQ', description: 'Schema cho form yêu cầu báo giá' },
            { id: uuid(), code: 'INSPECTION_FORM', name: 'Form giám định', description: 'Schema cho form yêu cầu giám định' },
            { id: uuid(), code: 'USER_PROFILE_FORM', name: 'Form hồ sơ người dùng', description: 'Schema cho form cập nhật hồ sơ' },
            { id: uuid(), code: 'COMPANY_REGISTRATION', name: 'Form đăng ký doanh nghiệp', description: 'Schema cho form đăng ký công ty' },
            { id: uuid(), code: 'DISPUTE_FORM', name: 'Form khiếu nại', description: 'Schema cho form khiếu nại tranh chấp' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_form_schema_codes seeded successfully');
      } else {
        console.log(`✅ md_form_schema_codes already has ${formSchemaCount} records - skipping`);
      }
      completedTables.push('md_form_schema_codes');
    } catch (error) {
      console.log('❌ md_form_schema_codes failed:', error.message);
      failedTables.push({ table: 'md_form_schema_codes', error: error.message });
    }

    // 11. md_i18n_namespaces
    try {
      console.log('🌐 Seeding md_i18n_namespaces...');
      const i18nCount = await prisma.md_i18n_namespaces.count();
      if (i18nCount === 0) {
        await prisma.md_i18n_namespaces.createMany({
          data: [
            { id: uuid(), code: 'COMMON', name: 'Chung', description: 'Từ khóa chung dùng toàn hệ thống' },
            { id: uuid(), code: 'AUTH', name: 'Xác thực', description: 'Từ khóa liên quan đến đăng nhập, đăng ký' },
            { id: uuid(), code: 'LISTINGS', name: 'Tin đăng', description: 'Từ khóa liên quan đến tin đăng container' },
            { id: uuid(), code: 'RFQ', name: 'Yêu cầu báo giá', description: 'Từ khóa liên quan đến RFQ' },
            { id: uuid(), code: 'ORDERS', name: 'Đơn hàng', description: 'Từ khóa liên quan đến đơn hàng' },
            { id: uuid(), code: 'ADMIN', name: 'Quản trị', description: 'Từ khóa dành cho admin panel' },
            { id: uuid(), code: 'ERRORS', name: 'Lỗi', description: 'Thông báo lỗi hệ thống' },
            { id: uuid(), code: 'SUCCESS', name: 'Thành công', description: 'Thông báo thành công' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_i18n_namespaces seeded successfully');
      } else {
        console.log(`✅ md_i18n_namespaces already has ${i18nCount} records - skipping`);
      }
      completedTables.push('md_i18n_namespaces');
    } catch (error) {
      console.log('❌ md_i18n_namespaces failed:', error.message);
      failedTables.push({ table: 'md_i18n_namespaces', error: error.message });
    }

    // 12. md_inspection_item_codes
    try {
      console.log('🔍 Seeding md_inspection_item_codes...');
      const inspectionItemCount = await prisma.md_inspection_item_codes.count();
      if (inspectionItemCount === 0) {
        await prisma.md_inspection_item_codes.createMany({
          data: [
            { id: uuid(), code: 'EXTERIOR_WALLS', name: 'Tường ngoài', description: 'Kiểm tra tường bên ngoài container' },
            { id: uuid(), code: 'INTERIOR_WALLS', name: 'Tường trong', description: 'Kiểm tra tường bên trong container' },
            { id: uuid(), code: 'FLOOR', name: 'Sàn container', description: 'Kiểm tra sàn container' },
            { id: uuid(), code: 'ROOF', name: 'Mái container', description: 'Kiểm tra mái container' },
            { id: uuid(), code: 'DOORS', name: 'Cửa container', description: 'Kiểm tra cửa và khóa container' },
            { id: uuid(), code: 'CORNERS', name: 'Góc container', description: 'Kiểm tra 4 góc container' },
            { id: uuid(), code: 'SEALS', name: 'Gioăng cửa', description: 'Kiểm tra gioăng chống thấm' },
            { id: uuid(), code: 'MARKINGS', name: 'Ký hiệu', description: 'Kiểm tra ký hiệu và số container' },
            { id: uuid(), code: 'VENTILATION', name: 'Thông gió', description: 'Kiểm tra hệ thống thông gió' },
            { id: uuid(), code: 'ELECTRICAL', name: 'Điện', description: 'Kiểm tra hệ thống điện (với reefer)' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_inspection_item_codes seeded successfully');
      } else {
        console.log(`✅ md_inspection_item_codes already has ${inspectionItemCount} records - skipping`);
      }
      completedTables.push('md_inspection_item_codes');
    } catch (error) {
      console.log('❌ md_inspection_item_codes failed:', error.message);
      failedTables.push({ table: 'md_inspection_item_codes', error: error.message });
    }

    // Continue with more master data tables...

    // 13. md_notification_channels
    try {
      console.log('📢 Seeding md_notification_channels...');
      const notificationChannelCount = await prisma.md_notification_channels.count();
      if (notificationChannelCount === 0) {
        await prisma.md_notification_channels.createMany({
          data: [
            { id: uuid(), code: 'EMAIL', name: 'Email', description: 'Thông báo qua email' },
            { id: uuid(), code: 'SMS', name: 'SMS', description: 'Thông báo qua tin nhắn' },
            { id: uuid(), code: 'IN_APP', name: 'Trong ứng dụng', description: 'Thông báo trong ứng dụng' },
            { id: uuid(), code: 'PUSH', name: 'Push notification', description: 'Thông báo đẩy trên mobile' },
            { id: uuid(), code: 'WEBHOOK', name: 'Webhook', description: 'Thông báo qua webhook API' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_notification_channels seeded successfully');
      } else {
        console.log(`✅ md_notification_channels already has ${notificationChannelCount} records - skipping`);
      }
      completedTables.push('md_notification_channels');
    } catch (error) {
      console.log('❌ md_notification_channels failed:', error.message);
      failedTables.push({ table: 'md_notification_channels', error: error.message });
    }

    // 14. md_notification_event_types
    try {
      console.log('🔔 Seeding md_notification_event_types...');
      const notificationEventCount = await prisma.md_notification_event_types.count();
      if (notificationEventCount === 0) {
        await prisma.md_notification_event_types.createMany({
          data: [
            { id: uuid(), code: 'NEW_MESSAGE', name: 'Tin nhắn mới', description: 'Có tin nhắn mới' },
            { id: uuid(), code: 'NEW_RFQ', name: 'RFQ mới', description: 'Có yêu cầu báo giá mới' },
            { id: uuid(), code: 'NEW_QUOTE', name: 'Báo giá mới', description: 'Có báo giá mới' },
            { id: uuid(), code: 'ORDER_STATUS_CHANGE', name: 'Thay đổi trạng thái đơn hàng', description: 'Đơn hàng thay đổi trạng thái' },
            { id: uuid(), code: 'PAYMENT_RECEIVED', name: 'Nhận thanh toán', description: 'Đã nhận được thanh toán' },
            { id: uuid(), code: 'LISTING_APPROVED', name: 'Tin đăng được duyệt', description: 'Tin đăng đã được phê duyệt' },
            { id: uuid(), code: 'LISTING_REJECTED', name: 'Tin đăng bị từ chối', description: 'Tin đăng bị từ chối' },
            { id: uuid(), code: 'INSPECTION_SCHEDULED', name: 'Lên lịch giám định', description: 'Đã lên lịch giám định container' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_notification_event_types seeded successfully');
      } else {
        console.log(`✅ md_notification_event_types already has ${notificationEventCount} records - skipping`);
      }
      completedTables.push('md_notification_event_types');
    } catch (error) {
      console.log('❌ md_notification_event_types failed:', error.message);
      failedTables.push({ table: 'md_notification_event_types', error: error.message });
    }

    // 15. md_payment_failure_reasons
    try {
      console.log('❌ Seeding md_payment_failure_reasons...');
      const paymentFailureCount = await prisma.md_payment_failure_reasons.count();
      if (paymentFailureCount === 0) {
        await prisma.md_payment_failure_reasons.createMany({
          data: [
            { id: uuid(), code: 'INSUFFICIENT_FUNDS', name: 'Không đủ tiền', description: 'Tài khoản không đủ số dư' },
            { id: uuid(), code: 'CARD_EXPIRED', name: 'Thẻ hết hạn', description: 'Thẻ tín dụng đã hết hạn' },
            { id: uuid(), code: 'CARD_DECLINED', name: 'Thẻ bị từ chối', description: 'Ngân hàng từ chối giao dịch' },
            { id: uuid(), code: 'NETWORK_ERROR', name: 'Lỗi mạng', description: 'Lỗi kết nối mạng' },
            { id: uuid(), code: 'INVALID_CARD', name: 'Thẻ không hợp lệ', description: 'Thông tin thẻ không đúng' },
            { id: uuid(), code: 'FRAUD_DETECTED', name: 'Phát hiện gian lận', description: 'Hệ thống phát hiện giao dịch gian lận' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_payment_failure_reasons seeded successfully');
      } else {
        console.log(`✅ md_payment_failure_reasons already has ${paymentFailureCount} records - skipping`);
      }
      completedTables.push('md_payment_failure_reasons');
    } catch (error) {
      console.log('❌ md_payment_failure_reasons failed:', error.message);
      failedTables.push({ table: 'md_payment_failure_reasons', error: error.message });
    }

    // 16. md_rental_units
    try {
      console.log('📅 Seeding md_rental_units...');
      const rentalUnitCount = await prisma.md_rental_units.count();
      if (rentalUnitCount === 0) {
        await prisma.md_rental_units.createMany({
          data: [
            { id: uuid(), code: 'DAY', name: 'Ngày', description: 'Thuê theo ngày' },
            { id: uuid(), code: 'WEEK', name: 'Tuần', description: 'Thuê theo tuần' },
            { id: uuid(), code: 'MONTH', name: 'Tháng', description: 'Thuê theo tháng' },
            { id: uuid(), code: 'QUARTER', name: 'Quý', description: 'Thuê theo quý' },
            { id: uuid(), code: 'YEAR', name: 'Năm', description: 'Thuê theo năm' },
            { id: uuid(), code: 'TRIP', name: 'Chuyến', description: 'Thuê theo chuyến đi' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_rental_units seeded successfully');
      } else {
        console.log(`✅ md_rental_units already has ${rentalUnitCount} records - skipping`);
      }
      completedTables.push('md_rental_units');
    } catch (error) {
      console.log('❌ md_rental_units failed:', error.message);
      failedTables.push({ table: 'md_rental_units', error: error.message });
    }

    // 17. md_pricing_regions
    try {
      console.log('💰 Seeding md_pricing_regions...');
      const pricingRegionCount = await prisma.md_pricing_regions.count();
      if (pricingRegionCount === 0) {
        await prisma.md_pricing_regions.createMany({
          data: [
            { id: uuid(), code: 'NORTH', name: 'Miền Bắc', description: 'Khu vực miền Bắc Việt Nam' },
            { id: uuid(), code: 'CENTRAL', name: 'Miền Trung', description: 'Khu vực miền Trung Việt Nam' },
            { id: uuid(), code: 'SOUTH', name: 'Miền Nam', description: 'Khu vực miền Nam Việt Nam' },
            { id: uuid(), code: 'INTERNATIONAL', name: 'Quốc tế', description: 'Khu vực quốc tế' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_pricing_regions seeded successfully');
      } else {
        console.log(`✅ md_pricing_regions already has ${pricingRegionCount} records - skipping`);
      }
      completedTables.push('md_pricing_regions');
    } catch (error) {
      console.log('❌ md_pricing_regions failed:', error.message);
      failedTables.push({ table: 'md_pricing_regions', error: error.message });
    }

    // 18. md_rating_scales
    try {
      console.log('⭐ Seeding md_rating_scales...');
      const ratingScaleCount = await prisma.md_rating_scales.count();
      if (ratingScaleCount === 0) {
        await prisma.md_rating_scales.createMany({
          data: [
            { id: uuid(), code: 'FIVE_STAR', name: 'Thang điểm 5 sao', description: 'Đánh giá từ 1 đến 5 sao' },
            { id: uuid(), code: 'TEN_POINT', name: 'Thang điểm 10', description: 'Đánh giá từ 1 đến 10 điểm' },
            { id: uuid(), code: 'HUNDRED_POINT', name: 'Thang điểm 100', description: 'Đánh giá từ 0 đến 100 điểm' },
            { id: uuid(), code: 'PASS_FAIL', name: 'Đạt/Không đạt', description: 'Chỉ có 2 mức đạt hoặc không đạt' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_rating_scales seeded successfully');
      } else {
        console.log(`✅ md_rating_scales already has ${ratingScaleCount} records - skipping`);
      }
      completedTables.push('md_rating_scales');
    } catch (error) {
      console.log('❌ md_rating_scales failed:', error.message);
      failedTables.push({ table: 'md_rating_scales', error: error.message });
    }

    // 19. md_insurance_coverages
    try {
      console.log('🛡️ Seeding md_insurance_coverages...');
      const insuranceCount = await prisma.md_insurance_coverages.count();
      if (insuranceCount === 0) {
        await prisma.md_insurance_coverages.createMany({
          data: [
            { id: uuid(), code: 'BASIC', name: 'Bảo hiểm cơ bản', description: 'Bảo hiểm thiệt hại cơ bản' },
            { id: uuid(), code: 'COMPREHENSIVE', name: 'Bảo hiểm toàn diện', description: 'Bảo hiểm toàn diện mọi rủi ro' },
            { id: uuid(), code: 'THEFT_ONLY', name: 'Chỉ bảo hiểm trộm cắp', description: 'Chỉ bảo hiểm mất trộm' },
            { id: uuid(), code: 'FIRE_FLOOD', name: 'Hỏa hoạn và lũ lụt', description: 'Bảo hiểm hỏa hoạn và thiên tai' },
            { id: uuid(), code: 'TRANSIT', name: 'Bảo hiểm vận chuyển', description: 'Bảo hiểm trong quá trình vận chuyển' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_insurance_coverages seeded successfully');
      } else {
        console.log(`✅ md_insurance_coverages already has ${insuranceCount} records - skipping`);
      }
      completedTables.push('md_insurance_coverages');
    } catch (error) {
      console.log('❌ md_insurance_coverages failed:', error.message);
      failedTables.push({ table: 'md_insurance_coverages', error: error.message });
    }

    // 20. md_integration_vendor_codes
    try {
      console.log('🔗 Seeding md_integration_vendor_codes...');
      const integrationCount = await prisma.md_integration_vendor_codes.count();
      if (integrationCount === 0) {
        await prisma.md_integration_vendor_codes.createMany({
          data: [
            { id: uuid(), code: 'VNPAY', name: 'VNPay', description: 'Cổng thanh toán VNPay' },
            { id: uuid(), code: 'MOMO', name: 'MoMo', description: 'Ví điện tử MoMo' },
            { id: uuid(), code: 'ZALOPAY', name: 'ZaloPay', description: 'Ví điện tử ZaloPay' },
            { id: uuid(), code: 'VIETTEL_POST', name: 'Viettel Post', description: 'Dịch vụ chuyển phát Viettel' },
            { id: uuid(), code: 'VIETNAM_POST', name: 'Vietnam Post', description: 'Bưu điện Việt Nam' },
            { id: uuid(), code: 'GHN', name: 'Giao Hàng Nhanh', description: 'Dịch vụ giao hàng nhanh' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_integration_vendor_codes seeded successfully');
      } else {
        console.log(`✅ md_integration_vendor_codes already has ${integrationCount} records - skipping`);
      }
      completedTables.push('md_integration_vendor_codes');
    } catch (error) {
      console.log('❌ md_integration_vendor_codes failed:', error.message);
      failedTables.push({ table: 'md_integration_vendor_codes', error: error.message });
    }

    // NOW ADD DEPOTS - This is the main business table we need
    try {
      console.log('🏭 Seeding depots (Sample depot locations)...');
      const depotCount = await prisma.depots.count();
      if (depotCount === 0) {
        await prisma.depots.createMany({
          data: [
            {
              id: uuid(),
              name: 'Depot Saigon Port',
              code: 'SGN01',
              address: 'Khu vực cảng Sài Gòn, Quận 4, TP.HCM',
              province: 'TP. Hồ Chí Minh',
              city: 'Quận 4',
              geo_point: '10.7769,106.7009',
              capacity_teu: 5000,
              contact: JSON.stringify({
                phone: '+84-28-1234-5678',
                email: 'sgn01@depot.vn',
                manager: 'Nguyễn Văn A'
              }),
              operating_hours: JSON.stringify({
                weekdays: '07:00-17:00',
                saturday: '07:00-12:00',
                sunday: 'Closed'
              }),
              services: JSON.stringify(['storage', 'inspection', 'repair', 'washing']),
              status: 'ACTIVE'
            },
            {
              id: uuid(),
              name: 'Depot Hai Phong',
              code: 'HPH01',
              address: 'Khu công nghiệp Đình Vũ, Hải Phong',
              province: 'Hải Phòng',
              city: 'Hải An',
              geo_point: '20.8449,106.7880',
              capacity_teu: 3000,
              contact: JSON.stringify({
                phone: '+84-225-1234-567',
                email: 'hph01@depot.vn',
                manager: 'Trần Văn B'
              }),
              operating_hours: JSON.stringify({
                weekdays: '06:00-18:00',
                saturday: '06:00-12:00',
                sunday: 'Closed'
              }),
              services: JSON.stringify(['storage', 'inspection', 'repair']),
              status: 'ACTIVE'
            },
            {
              id: uuid(),
              name: 'Depot Da Nang',
              code: 'DAD01',
              address: 'Khu vực cảng Đà Nẵng, Quận Sơn Trà, Đà Nẵng',
              province: 'Đà Nẵng',
              city: 'Sơn Trà',
              geo_point: '16.0544,108.2022',
              capacity_teu: 2000,
              contact: JSON.stringify({
                phone: '+84-236-1234-567',
                email: 'dad01@depot.vn',
                manager: 'Lê Thị C'
              }),
              operating_hours: JSON.stringify({
                weekdays: '07:00-17:00',
                saturday: '07:00-12:00',
                sunday: 'Closed'
              }),
              services: JSON.stringify(['storage', 'inspection']),
              status: 'ACTIVE'
            },
            {
              id: uuid(),
              name: 'Depot Can Tho',
              code: 'VCA01',
              address: 'Khu công nghiệp Trà Nóc, Cần Thơ',
              province: 'Cần Thơ',
              city: 'Bình Thủy',
              geo_point: '10.0452,105.7469',
              capacity_teu: 1500,
              contact: JSON.stringify({
                phone: '+84-292-1234-567',
                email: 'vca01@depot.vn',
                manager: 'Phạm Văn D'
              }),
              operating_hours: JSON.stringify({
                weekdays: '07:00-17:00',
                saturday: '07:00-12:00',
                sunday: 'Closed'
              }),
              services: JSON.stringify(['storage', 'washing']),
              status: 'ACTIVE'
            },
            {
              id: uuid(),
              name: 'Depot Vung Tau',
              code: 'VUT01',
              address: 'Khu công nghiệp Phú Mỹ, Vũng Tàu',
              province: 'Bà Rịa - Vũng Tàu',
              city: 'Phú Mỹ',
              geo_point: '10.6004,107.2695',
              capacity_teu: 2500,
              contact: JSON.stringify({
                phone: '+84-254-1234-567',
                email: 'vut01@depot.vn',
                manager: 'Hoàng Văn E'
              }),
              operating_hours: JSON.stringify({
                weekdays: '06:00-18:00',
                saturday: '06:00-14:00',
                sunday: 'Closed'
              }),
              services: JSON.stringify(['storage', 'inspection', 'repair', 'washing']),
              status: 'ACTIVE'
            }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ depots seeded successfully - 5 sample depots created');
      } else {
        console.log(`✅ depots already has ${depotCount} records - skipping`);
      }
      completedTables.push('depots');
    } catch (error) {
      console.log('❌ depots failed:', error.message);
      failedTables.push({ table: 'depots', error: error.message });
    }

    // 8. md_units (Đơn vị tính)
    try {
      console.log('📏 Seeding md_units...');
      const unitsCount = await prisma.md_units.count();
      if (unitsCount === 0) {
        await prisma.md_units.createMany({
          data: [
            { id: uuid(), code: 'TEU', name: 'Twenty-foot Equivalent Unit', description: 'Đơn vị container 20 feet' },
            { id: uuid(), code: 'FEU', name: 'Forty-foot Equivalent Unit', description: 'Đơn vị container 40 feet' },
            { id: uuid(), code: 'KG', name: 'Kilogram', description: 'Kilogram' },
            { id: uuid(), code: 'TON', name: 'Tấn', description: 'Tấn (1000kg)' },
            { id: uuid(), code: 'CBM', name: 'Cubic Meter', description: 'Mét khối' },
            { id: uuid(), code: 'DAY', name: 'Ngày', description: 'Đơn vị thời gian - ngày' },
            { id: uuid(), code: 'MONTH', name: 'Tháng', description: 'Đơn vị thời gian - tháng' },
            { id: uuid(), code: 'YEAR', name: 'Năm', description: 'Đơn vị thời gian - năm' },
            { id: uuid(), code: 'TRIP', name: 'Chuyến', description: 'Đơn vị chuyến đi' },
            { id: uuid(), code: 'HOUR', name: 'Giờ', description: 'Đơn vị thời gian - giờ' }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ md_units seeded successfully');
      } else {
        console.log(`✅ md_units already has ${unitsCount} records - skipping`);
      }
      completedTables.push('md_units');
    } catch (error) {
      console.log('❌ md_units failed:', error.message);
      failedTables.push({ table: 'md_units', error: error.message });
    }

    // 9. plans (Subscription Plans)
    try {
      console.log('💎 Seeding plans...');
      const plansCount = await prisma.plans.count();
      if (plansCount === 0) {
        await prisma.plans.createMany({
          data: [
            {
              id: uuid(),
              code: 'FREE',
              name: 'Miễn phí',
              description: 'Gói miễn phí cơ bản',
              price: 0,
              currency: 'VND',
              cycle: 'MONTHLY',
              max_listings: 5,
              max_rfqs: 3,
              priority_support: false,
              features: JSON.stringify(['Đăng tối đa 5 tin', 'Tạo tối đa 3 RFQ', 'Hỗ trợ email'])
            },
            {
              id: uuid(),
              code: 'BASIC',
              name: 'Cơ bản',
              description: 'Gói cơ bản cho doanh nghiệp nhỏ',
              price: 500000,
              currency: 'VND',
              cycle: 'MONTHLY',
              max_listings: 50,
              max_rfqs: 20,
              priority_support: false,
              features: JSON.stringify(['Đăng tối đa 50 tin', 'Tạo tối đa 20 RFQ', 'Hỗ trợ chat', 'Báo cáo cơ bản'])
            },
            {
              id: uuid(),
              code: 'PREMIUM',
              name: 'Cao cấp',
              description: 'Gói cao cấp cho doanh nghiệp vừa',
              price: 2000000,
              currency: 'VND',
              cycle: 'MONTHLY',
              max_listings: 200,
              max_rfqs: 100,
              priority_support: true,
              features: JSON.stringify(['Đăng không giới hạn tin', 'RFQ không giới hạn', 'Hỗ trợ ưu tiên', 'Báo cáo chi tiết', 'API access'])
            },
            {
              id: uuid(),
              code: 'ENTERPRISE',
              name: 'Doanh nghiệp',
              description: 'Gói doanh nghiệp lớn',
              price: 5000000,
              currency: 'VND',
              cycle: 'MONTHLY',
              max_listings: null,
              max_rfqs: null,
              priority_support: true,
              features: JSON.stringify(['Không giới hạn tính năng', 'Hỗ trợ 24/7', 'Custom integration', 'Dedicated account manager'])
            }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ plans seeded successfully');
      } else {
        console.log(`✅ plans already has ${plansCount} records - skipping`);
      }
      completedTables.push('plans');
    } catch (error) {
      console.log('❌ plans failed:', error.message);
      failedTables.push({ table: 'plans', error: error.message });
    }

    // 10. settings (System Settings)
    try {
      console.log('⚙️ Seeding settings...');
      const settingsCount = await prisma.settings.count();
      if (settingsCount === 0) {
        await prisma.settings.createMany({
          data: [
            {
              id: uuid(),
              key: 'SITE_NAME',
              value: JSON.stringify('i-ContExchange'),
              description: 'Tên website',
              category: 'general',
              is_public: true
            },
            {
              id: uuid(),
              key: 'SITE_DESCRIPTION',
              value: JSON.stringify('Nền tảng mua bán container hàng đầu Việt Nam'),
              description: 'Mô tả website',
              category: 'general',
              is_public: true
            },
            {
              id: uuid(),
              key: 'DEFAULT_CURRENCY',
              value: JSON.stringify('VND'),
              description: 'Tiền tệ mặc định',
              category: 'financial',
              is_public: true
            },
            {
              id: uuid(),
              key: 'COMMISSION_RATE',
              value: JSON.stringify(3.5),
              description: 'Tỷ lệ hoa hồng mặc định (%)',
              category: 'financial',
              is_public: false
            },
            {
              id: uuid(),
              key: 'LISTING_APPROVAL_REQUIRED',
              value: JSON.stringify(true),
              description: 'Yêu cầu duyệt tin đăng',
              category: 'moderation',
              is_public: false
            },
            {
              id: uuid(),
              key: 'MAX_FREE_LISTINGS',
              value: JSON.stringify(5),
              description: 'Số tin đăng miễn phí tối đa',
              category: 'limits',
              is_public: true
            },
            {
              id: uuid(),
              key: 'MAINTENANCE_MODE',
              value: JSON.stringify(false),
              description: 'Chế độ bảo trì',
              category: 'system',
              is_public: true
            },
            {
              id: uuid(),
              key: 'SUPPORT_EMAIL',
              value: JSON.stringify('support@i-contexchange.vn'),
              description: 'Email hỗ trợ',
              category: 'contact',
              is_public: true
            }
          ].map(item => ({ ...item, updated_at: new Date() })),
          skipDuplicates: true
        });
        console.log('✅ settings seeded successfully');
      } else {
        console.log(`✅ settings already has ${settingsCount} records - skipping`);
      }
      completedTables.push('settings');
    } catch (error) {
      console.log('❌ settings failed:', error.message);
      failedTables.push({ table: 'settings', error: error.message });
    }

    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('🎉 MISSING DATA SEEDING SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully completed: ${completedTables.length} tables`);
    completedTables.forEach(table => console.log(`   ✅ ${table}`));
    
    if (failedTables.length > 0) {
      console.log(`\n❌ Failed: ${failedTables.length} tables`);
      failedTables.forEach(item => console.log(`   ❌ ${item.table}: ${item.error}`));
    }
    
    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('🎉 ESSENTIAL DATA SEEDING SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully completed: ${completedTables.length} tables`);
    completedTables.forEach(table => console.log(`   ✅ ${table}`));
    
    if (failedTables.length > 0) {
      console.log(`\n❌ Failed: ${failedTables.length} tables`);
      failedTables.forEach(item => console.log(`   ❌ ${item.table}: ${item.error}`));
    }
    
    console.log('\n📊 What was seeded:');
    console.log('   🏭 Sample Depots: 5 depot locations across Vietnam');
    console.log('   📋 Master Data: All essential lookup tables');
    console.log('\n💡 Next steps for users:');
    console.log('   - Organizations: Users can register their companies');
    console.log('   - Containers: Users can add their container inventory');
    console.log('   - Listings: Users can create container listings');
    console.log('   - RFQs & Quotes: Users can create business transactions');
    console.log('   - Orders: Users can place and manage orders');
    console.log('\n🎯 The system is now ready for users to start adding business data!');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Error in missing data seeding:', error);
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