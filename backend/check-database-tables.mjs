import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseTables() {
  try {
    console.log('🔍 Đang kiểm tra database...\n');

    // Lấy danh sách tất cả các bảng
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `;

    const totalTables = tables.length;
    console.log(`📊 Tổng số bảng: ${totalTables}\n`);

    // Kiểm tra từng bảng xem có dữ liệu không
    const tablesWithData = [];
    const tablesWithoutData = [];

    for (const table of tables) {
      const tableName = table.tablename;
      
      try {
        const result = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${tableName}";`);
        const count = parseInt(result[0].count);
        
        if (count > 0) {
          tablesWithData.push({ name: tableName, count });
        } else {
          tablesWithoutData.push(tableName);
        }
      } catch (error) {
        console.log(`❌ Lỗi khi kiểm tra bảng ${tableName}: ${error.message}`);
      }
    }

    console.log('📈 CÁC BẢNG CÓ DỮ LIỆU:');
    console.log('=' .repeat(80));
    tablesWithData.sort((a, b) => b.count - a.count);
    tablesWithData.forEach((table, index) => {
      console.log(`${index + 1}. ${table.name.padEnd(40)} : ${table.count.toLocaleString()} dòng`);
    });

    console.log('\n' + '=' .repeat(80));
    console.log(`✅ Tổng số bảng có dữ liệu: ${tablesWithData.length}/${totalTables}`);

    if (tablesWithoutData.length > 0) {
      console.log('\n📭 CÁC BẢNG RỖNG (KHÔNG CÓ DỮ LIỆU):');
      console.log('=' .repeat(80));
      tablesWithoutData.forEach((table, index) => {
        console.log(`${index + 1}. ${table}`);
      });
      console.log('\n' + '=' .repeat(80));
      console.log(`⚪ Tổng số bảng rỗng: ${tablesWithoutData.length}/${totalTables}`);
    }

    console.log('\n' + '=' .repeat(80));
    console.log('📊 TỔNG KẾT:');
    console.log(`   • Tổng số bảng: ${totalTables}`);
    console.log(`   • Bảng có dữ liệu: ${tablesWithData.length} (${((tablesWithData.length/totalTables)*100).toFixed(1)}%)`);
    console.log(`   • Bảng rỗng: ${tablesWithoutData.length} (${((tablesWithoutData.length/totalTables)*100).toFixed(1)}%)`);
    console.log('=' .repeat(80));

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseTables();
