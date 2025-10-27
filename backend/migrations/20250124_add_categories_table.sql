-- Migration: Add categories table for permission grouping
-- Purpose: Store Vietnamese labels for permission categories/modules
-- Date: 2025-01-24

-- Create categories table
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

-- Insert categories with Vietnamese names
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "idx_categories_code" ON "categories"("code");

-- Add comment
COMMENT ON TABLE "categories" IS 'Permission categories/modules with Vietnamese labels';
COMMENT ON COLUMN "categories"."code" IS 'Unique category code (e.g., listings, admin)';
COMMENT ON COLUMN "categories"."name" IS 'Vietnamese display name';
COMMENT ON COLUMN "categories"."icon" IS 'Emoji icon for UI';
COMMENT ON COLUMN "categories"."sort_order" IS 'Display order in UI';

-- Rollback script (if needed):
-- DROP TABLE IF EXISTS "categories";
