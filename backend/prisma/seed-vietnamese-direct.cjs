/**
 * Seed Vietnamese data using pg library directly
 * Run: node prisma/seed-vietnamese-direct.js
 */

const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:240499@localhost:5432/i_contexchange'
});

const vietnameseData = {
  countries: [
    { code: 'VN', name_vi: 'Việt Nam' },
    { code: 'US', name_vi: 'Hoa Kỳ' },
    { code: 'CN', name_vi: 'Trung Quốc' },
    { code: 'JP', name_vi: 'Nhật Bản' },
    { code: 'KR', name_vi: 'Hàn Quốc' },
    { code: 'SG', name_vi: 'Singapore' },
    { code: 'TH', name_vi: 'Thái Lan' },
    { code: 'MY', name_vi: 'Malaysia' },
    { code: 'ID', name_vi: 'Indonesia' },
    { code: 'PH', name_vi: 'Philippines' },
    { code: 'GB', name_vi: 'Vương Quốc Anh' },
    { code: 'DE', name_vi: 'Đức' },
    { code: 'FR', name_vi: 'Pháp' },
    { code: 'AU', name_vi: 'Úc' },
    { code: 'NZ', name_vi: 'New Zealand' },
  ],
  currencies: [
    { code: 'VND', name_vi: 'Đồng Việt Nam' },
    { code: 'USD', name_vi: 'Đô la Mỹ' },
    { code: 'EUR', name_vi: 'Euro' },
    { code: 'JPY', name_vi: 'Yên Nhật' },
    { code: 'CNY', name_vi: 'Nhân dân tệ' },
    { code: 'SGD', name_vi: 'Đô la Singapore' },
    { code: 'THB', name_vi: 'Baht Thái' },
    { code: 'MYR', name_vi: 'Ringgit Malaysia' },
    { code: 'GBP', name_vi: 'Bảng Anh' },
    { code: 'AUD', name_vi: 'Đô la Úc' },
  ],
  container_types: [
    { code: 'DRY', name_vi: 'Container hàng khô' },
    { code: 'HC', name_vi: 'Container cao' },
    { code: 'RF', name_vi: 'Container lạnh' },
    { code: 'OT', name_vi: 'Container nóc mở' },
    { code: 'FR', name_vi: 'Container sàn phẳng' },
    { code: 'TK', name_vi: 'Container bồn' },
    { code: 'PF', name_vi: 'Container sàn' },
    { code: 'VH', name_vi: 'Container thông gió' },
  ],
  quality_standards: [
    { code: 'WWT', name_vi: 'Kín gió và nước' },
    { code: 'CW', name_vi: 'Đạt chuẩn vận chuyển hàng' },
    { code: 'IICL', name_vi: 'Tiêu chuẩn IICL' },
    { code: 'ASIS', name_vi: 'Nguyên trạng' },
  ],
  deal_types: [
    { code: 'sale', name_vi: 'Bán' },
    { code: 'rental', name_vi: 'Cho thuê' },
  ],
  listing_statuses: [
    { code: 'draft', name_vi: 'Bản nháp' },
    { code: 'pending_review', name_vi: 'Chờ duyệt' },
    { code: 'active', name_vi: 'Đang hoạt động' },
    { code: 'paused', name_vi: 'Tạm dừng' },
    { code: 'sold', name_vi: 'Đã bán' },
    { code: 'rented', name_vi: 'Đã cho thuê' },
    { code: 'archived', name_vi: 'Đã lưu trữ' },
    { code: 'rejected', name_vi: 'Bị từ chối' },
  ],
  order_statuses: [
    { code: 'created', name_vi: 'Đã tạo' },
    { code: 'awaiting_funds', name_vi: 'Chờ thanh toán' },
    { code: 'escrow_funded', name_vi: 'Đã thanh toán vào ký quỹ' },
    { code: 'preparing', name_vi: 'Đang chuẩn bị' },
    { code: 'delivering', name_vi: 'Đang vận chuyển' },
    { code: 'delivered', name_vi: 'Đã giao hàng' },
    { code: 'completed', name_vi: 'Hoàn thành' },
    { code: 'cancelled', name_vi: 'Đã hủy' },
    { code: 'disputed', name_vi: 'Tranh chấp' },
  ],
  payment_statuses: [
    { code: 'initiated', name_vi: 'Đã khởi tạo' },
    { code: 'escrow_funded', name_vi: 'Đã nạp vào ký quỹ' },
    { code: 'released', name_vi: 'Đã giải ngân' },
    { code: 'refunded', name_vi: 'Đã hoàn tiền' },
    { code: 'failed', name_vi: 'Thất bại' },
  ],
  delivery_statuses: [
    { code: 'requested', name_vi: 'Đã yêu cầu' },
    { code: 'booked', name_vi: 'Đã đặt lịch' },
    { code: 'in_transit', name_vi: 'Đang vận chuyển' },
    { code: 'delivered', name_vi: 'Đã giao' },
    { code: 'failed', name_vi: 'Thất bại' },
  ],
  dispute_statuses: [
    { code: 'open', name_vi: 'Đang mở' },
    { code: 'investigating', name_vi: 'Đang điều tra' },
    { code: 'resolved_refund', name_vi: 'Đã giải quyết - Hoàn tiền' },
    { code: 'resolved_payout', name_vi: 'Đã giải quyết - Thanh toán' },
    { code: 'partial', name_vi: 'Một phần' },
    { code: 'closed', name_vi: 'Đã đóng' },
  ],
  document_types: [
    { code: 'EDO', name_vi: 'Lệnh giao container' },
    { code: 'EIR', name_vi: 'Biên nhận giao nhận container' },
    { code: 'INVOICE', name_vi: 'Hóa đơn' },
    { code: 'RECEIPT', name_vi: 'Biên lai thanh toán' },
    { code: 'BOL', name_vi: 'Vận đơn' },
    { code: 'PACKING_LIST', name_vi: 'Danh sách đóng gói' },
    { code: 'COO', name_vi: 'Giấy chứng nhận xuất xứ' },
    { code: 'INSURANCE', name_vi: 'Giấy chứng nhận bảo hiểm' },
    { code: 'CUSTOMS', name_vi: 'Tờ khai hải quan' },
  ],
  service_codes: [
    { code: 'inspection', name_vi: 'Dịch vụ kiểm định' },
    { code: 'repair', name_vi: 'Dịch vụ sửa chữa' },
    { code: 'storage', name_vi: 'Dịch vụ lưu kho' },
    { code: 'delivery_estimate', name_vi: 'Báo giá vận chuyển' },
    { code: 'insurance', name_vi: 'Bảo hiểm' },
    { code: 'cleaning', name_vi: 'Dịch vụ vệ sinh' },
    { code: 'fumigation', name_vi: 'Dịch vụ hun trùng' },
    { code: 'survey', name_vi: 'Khảo sát container' },
  ],
  movement_types: [
    { code: 'IN', name_vi: 'Nhập kho' },
    { code: 'OUT', name_vi: 'Xuất kho' },
    { code: 'TRANSFER', name_vi: 'Chuyển kho' },
  ],
  rental_units: [
    { code: 'day', name_vi: 'Theo ngày' },
    { code: 'week', name_vi: 'Theo tuần' },
    { code: 'month', name_vi: 'Theo tháng' },
    { code: 'quarter', name_vi: 'Theo quý' },
    { code: 'year', name_vi: 'Theo năm' },
  ],
  units: [
    { code: 'EA', name_vi: 'Cái' },
    { code: 'KG', name_vi: 'Kilogram' },
    { code: 'LB', name_vi: 'Pound' },
    { code: 'M3', name_vi: 'Mét khối' },
    { code: 'FT3', name_vi: 'Foot khối' },
    { code: 'DAY', name_vi: 'Ngày' },
    { code: 'HOUR', name_vi: 'Giờ' },
    { code: 'M', name_vi: 'Mét' },
    { code: 'FT', name_vi: 'Foot' },
  ],
};

async function main() {
  try {
    await client.connect();
    console.log('🇻🇳 Starting Vietnamese data seed...\n');

    let totalUpdated = 0;

    for (const [table, records] of Object.entries(vietnameseData)) {
      const tableName = 'md_' + table;
      console.log(`Updating ${tableName}...`);
      
      for (const record of records) {
        const result = await client.query(
          `UPDATE ${tableName} SET name_vi = $1 WHERE code = $2`,
          [record.name_vi, record.code]
        );
        totalUpdated += result.rowCount;
      }
      
      console.log(`✅ Updated ${records.length} records in ${tableName}\n`);
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ HOÀN THÀNH! Đã cập nhật ${totalUpdated} bản ghi tiếng Việt`);
    console.log('═══════════════════════════════════════════════════════');
    
    // Verify some data
    console.log('\n📊 Kiểm tra dữ liệu:');
    const check = await client.query(`
      SELECT code, name, name_vi 
      FROM md_countries 
      WHERE code IN ('VN', 'US', 'JP')
      ORDER BY code
    `);
    console.table(check.rows);

  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
