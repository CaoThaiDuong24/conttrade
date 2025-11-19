import pg from 'pg';
const { Client } = pg;
import fs from 'fs/promises';

const dbConfig = {
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'conttrade_db'
};

async function runMigration() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Kết nối database thành công!\n');
    
    const sql = await fs.readFile('./migrations/20251114_add_quantity_to_rental_contracts.sql', 'utf-8');
    
    console.log('🔧 Đang chạy migration: add_quantity_to_rental_contracts...\n');
    
    await client.query(sql);
    
    console.log('✅ Migration thành công!\n');
    
    // Verify
    const result = await client.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'rental_contracts' 
      AND column_name = 'quantity'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Đã thêm field quantity vào rental_contracts:');
      console.log(result.rows[0]);
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

runMigration();
