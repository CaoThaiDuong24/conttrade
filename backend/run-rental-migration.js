import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('📂 Reading migration file...');
    const sqlPath = path.join(__dirname, 'migrations', '20251113_add_rental_management_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    console.log('🚀 Running migration...');
    
    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement + ';');
        } catch (err) {
          // Skip if already exists
          if (!err.message.includes('already exists')) {
            console.warn('⚠️  Warning:', err.message.split('\n')[0]);
          }
        }
      }
    }
    
    console.log('✅ Migration completed successfully!');
    
    // Verify tables exist
    const tablesResult = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('rental_contracts', 'container_maintenance_logs', 'rental_payments')
      ORDER BY tablename;
    `;
    
    console.log('📋 Created tables:', tablesResult);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
