/**
 * Verify Vietnamese data in database
 * Run: node prisma/verify-vietnamese.cjs
 */

const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:240499@localhost:5432/i_contexchange'
});

async function main() {
  try {
    await client.connect();
    console.log('🔍 Kiểm tra dữ liệu tiếng Việt...\n');

    // 1. Countries
    console.log('1. QUỐC GIA (md_countries):');
    const countries = await client.query(`
      SELECT code, name, name_vi 
      FROM md_countries 
      WHERE name_vi IS NOT NULL
      ORDER BY code
      LIMIT 10
    `);
    console.table(countries.rows);

    // 2. Currencies
    console.log('\n2. TIỀN TỆ (md_currencies):');
    const currencies = await client.query(`
      SELECT code, name, name_vi 
      FROM md_currencies 
      WHERE name_vi IS NOT NULL
      ORDER BY code
      LIMIT 10
    `);
    console.table(currencies.rows);

    // 3. Container Types
    console.log('\n3. LOẠI CONTAINER (md_container_types):');
    const containers = await client.query(`
      SELECT code, name, name_vi 
      FROM md_container_types 
      WHERE name_vi IS NOT NULL
      ORDER BY code
    `);
    console.table(containers.rows);

    // 4. Listing Statuses
    console.log('\n4. TRẠNG THÁI TIN ĐĂNG (md_listing_statuses):');
    const listingStatuses = await client.query(`
      SELECT code, name_vi 
      FROM md_listing_statuses 
      WHERE name_vi IS NOT NULL
      ORDER BY code
    `);
    console.table(listingStatuses.rows);

    // 5. Order Statuses
    console.log('\n5. TRẠNG THÁI ĐƠN HÀNG (md_order_statuses):');
    const orderStatuses = await client.query(`
      SELECT code, name_vi 
      FROM md_order_statuses 
      WHERE name_vi IS NOT NULL
      ORDER BY code
    `);
    console.table(orderStatuses.rows);

    // Statistics
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 THỐNG KÊ:');
    console.log('═══════════════════════════════════════════════════════');
    
    const stats = await client.query(`
      SELECT 
        'md_countries' as table_name,
        COUNT(*) FILTER (WHERE name_vi IS NOT NULL) as vietnamese_count,
        COUNT(*) as total_count
      FROM md_countries
      UNION ALL
      SELECT 'md_currencies', COUNT(*) FILTER (WHERE name_vi IS NOT NULL), COUNT(*) FROM md_currencies
      UNION ALL
      SELECT 'md_container_types', COUNT(*) FILTER (WHERE name_vi IS NOT NULL), COUNT(*) FROM md_container_types
      UNION ALL
      SELECT 'md_quality_standards', COUNT(*) FILTER (WHERE name_vi IS NOT NULL), COUNT(*) FROM md_quality_standards
      UNION ALL
      SELECT 'md_deal_types', COUNT(*) FILTER (WHERE name_vi IS NOT NULL), COUNT(*) FROM md_deal_types
      UNION ALL
      SELECT 'md_listing_statuses', COUNT(*) FILTER (WHERE name_vi IS NOT NULL), COUNT(*) FROM md_listing_statuses
      UNION ALL
      SELECT 'md_order_statuses', COUNT(*) FILTER (WHERE name_vi IS NOT NULL), COUNT(*) FROM md_order_statuses
      UNION ALL
      SELECT 'md_payment_statuses', COUNT(*) FILTER (WHERE name_vi IS NOT NULL), COUNT(*) FROM md_payment_statuses
      UNION ALL
      SELECT 'md_delivery_statuses', COUNT(*) FILTER (WHERE name_vi IS NOT NULL), COUNT(*) FROM md_delivery_statuses
      UNION ALL
      SELECT 'md_dispute_statuses', COUNT(*) FILTER (WHERE name_vi IS NOT NULL), COUNT(*) FROM md_dispute_statuses
      UNION ALL
      SELECT 'md_document_types', COUNT(*) FILTER (WHERE name_vi IS NOT NULL), COUNT(*) FROM md_document_types
      UNION ALL
      SELECT 'md_service_codes', COUNT(*) FILTER (WHERE name_vi IS NOT NULL), COUNT(*) FROM md_service_codes
      UNION ALL
      SELECT 'md_movement_types', COUNT(*) FILTER (WHERE name_vi IS NOT NULL), COUNT(*) FROM md_movement_types
      UNION ALL
      SELECT 'md_rental_units', COUNT(*) FILTER (WHERE name_vi IS NOT NULL), COUNT(*) FROM md_rental_units
      UNION ALL
      SELECT 'md_units', COUNT(*) FILTER (WHERE name_vi IS NOT NULL), COUNT(*) FROM md_units
    `);
    
    console.table(stats.rows);

    const totalVi = stats.rows.reduce((sum, row) => sum + parseInt(row.vietnamese_count), 0);
    const totalAll = stats.rows.reduce((sum, row) => sum + parseInt(row.total_count), 0);
    
    console.log(`\n✅ Tổng: ${totalVi}/${totalAll} bản ghi có dữ liệu tiếng Việt`);
    console.log(`📈 Tỷ lệ hoàn thành: ${(totalVi/totalAll*100).toFixed(1)}%\n`);

  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
