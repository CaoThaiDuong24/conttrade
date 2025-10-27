import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('🚀 Running categories table migration...\n');
    
    // Step 1: Create table
    console.log('[1/3] Creating categories table...');
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "categories" (
          "id" TEXT PRIMARY KEY,
          "code" TEXT UNIQUE NOT NULL,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "icon" TEXT,
          "sort_order" INTEGER DEFAULT 0,
          "created_at" TIMESTAMP DEFAULT NOW(),
          "updated_at" TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('✅ Table created\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Table already exists\n');
      } else {
        throw error;
      }
    }
    
    // Step 2: Insert categories
    console.log('[2/3] Inserting categories...');
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "categories" ("id", "code", "name", "description", "icon", "sort_order") VALUES
          ('cat-listings', 'listings', 'Tin đăng', 'Quản lý tin đăng container', '📋', 1),
          ('cat-users', 'users', 'Người dùng', 'Quản lý người dùng và hồ sơ', '👤', 2),
          ('cat-rfq', 'rfq', 'Yêu cầu báo giá', 'Quản lý RFQ (Request for Quote)', '📝', 3),
          ('cat-quotes', 'quotes', 'Báo giá', 'Quản lý báo giá', '💰', 4),
          ('cat-qa', 'qa', 'Hỏi đáp', 'Quản lý Q&A', '💬', 5),
          ('cat-moderation', 'moderation', 'Kiểm duyệt', 'Kiểm duyệt nội dung', '🛡️', 6),
          ('cat-inspection', 'inspection', 'Giám định', 'Quản lý giám định container', '🔍', 7),
          ('cat-orders', 'orders', 'Đơn hàng', 'Quản lý đơn hàng', '🛒', 8),
          ('cat-payments', 'payments', 'Thanh toán', 'Quản lý thanh toán', '💳', 9),
          ('cat-delivery', 'delivery', 'Vận chuyển', 'Quản lý vận chuyển', '🚚', 10),
          ('cat-reviews', 'reviews', 'Đánh giá', 'Quản lý đánh giá', '⭐', 11),
          ('cat-disputes', 'disputes', 'Tranh chấp', 'Quản lý tranh chấp', '⚖️', 12),
          ('cat-admin', 'admin', 'Quản trị', 'Quản trị hệ thống', '👑', 13),
          ('cat-pricing', 'pricing', 'Định giá', 'Quản lý giá cả', '💲', 14),
          ('cat-depot', 'depot', 'Kho bãi', 'Quản lý kho bãi', '🏭', 15),
          ('cat-finance', 'finance', 'Tài chính', 'Quản lý tài chính', '💵', 16),
          ('cat-support', 'support', 'Hỗ trợ', 'Hỗ trợ khách hàng', '🎧', 17),
          ('cat-config', 'config', 'Cấu hình', 'Cấu hình hệ thống', '⚙️', 18)
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          icon = EXCLUDED.icon,
          sort_order = EXCLUDED.sort_order,
          updated_at = NOW();
      `);
      console.log('✅ Categories inserted\n');
    } catch (error) {
      console.error('❌ Insert failed:', error.message);
      throw error;
    }
    
    // Step 3: Create index
    console.log('[3/3] Creating index...');
    try {
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "idx_categories_code" ON "categories"("code");
      `);
      console.log('✅ Index created\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Index already exists\n');
      } else {
        throw error;
      }
    }
    
    // Verify categories were inserted
    const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM categories`;
    console.log(`\n✨ Migration completed! Categories in database: ${count[0].count}`);
    
    // List all categories
    const categories = await prisma.$queryRaw`SELECT code, name, icon FROM categories ORDER BY sort_order`;
    console.log('\n📋 Categories:');
    categories.forEach(cat => {
      console.log(`  ${cat.icon} ${cat.code}: ${cat.name}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
