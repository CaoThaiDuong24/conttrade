// Kiểm tra database trực tiếp cho RFQ received
const { execSync } = require('child_process');

async function checkDatabase() {
  try {
    console.log('=== KIỂM TRA DATABASE RFQ ===\n');
    
    // Check if we have any RFQs at all
    console.log('🔍 Checking total RFQs in database...');
    
    const checkQuery = `
      SELECT 
        r.id,
        r.status,
        r.purpose,
        r.quantity,
        r.buyer_id,
        r.listing_id,
        r.submitted_at,
        u_buyer.email as buyer_email,
        u_buyer.display_name as buyer_name,
        l.title as listing_title,
        l.seller_user_id,
        u_seller.email as seller_email,
        u_seller.display_name as seller_name
      FROM rfqs r
      LEFT JOIN users u_buyer ON r.buyer_id = u_buyer.id
      LEFT JOIN listings l ON r.listing_id = l.id
      LEFT JOIN users u_seller ON l.seller_user_id = u_seller.id
      ORDER BY r.submitted_at DESC
      LIMIT 10;
    `;
    
    // Create a simple SQL script file
    const sqlScript = `
-- Check RFQ data
\\c icontexchange

${checkQuery}
    `;
    
    // Write to temp file and execute
    require('fs').writeFileSync('temp-check-rfq.sql', sqlScript);
    
    console.log('SQL Query được tạo. Cần chạy manual:');
    console.log('1. Mở PostgreSQL command line');
    console.log('2. Chạy: psql -U postgres -f temp-check-rfq.sql');
    console.log('\nHoặc kiểm tra qua Prisma Studio hoặc pgAdmin');
    
    // Alternative: Check through backend API patterns
    console.log('\n=== PHÂN TÍCH VẤN ĐỀ ===');
    console.log('Có thể có các vấn đề sau:');
    console.log('1. Không có RFQ nào trong database');
    console.log('2. RFQ có nhưng không match seller_user_id');
    console.log('3. Backend query logic có vấn đề');
    console.log('4. Authentication issue với JWT/cookies');
    
    console.log('\n🔧 GIẢI PHÁP:');
    console.log('1. Tạo test RFQ data');
    console.log('2. Fix backend query logic');
    console.log('3. Verify seller-listing relationships');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDatabase();