-- Migration: Add manufactured_year column to listing_containers
-- Date: 2025-11-07
-- Purpose: Thêm cột năm sản xuất vào bảng listing_containers

-- Thêm cột manufactured_year
ALTER TABLE "listing_containers" 
    ADD COLUMN IF NOT EXISTS "manufactured_year" INTEGER;

-- Thêm constraint kiểm tra năm sản xuất hợp lệ (1970 - năm hiện tại)
ALTER TABLE "listing_containers" 
    ADD CONSTRAINT "chk_manufactured_year_valid" 
    CHECK ("manufactured_year" IS NULL OR ("manufactured_year" >= 1970 AND "manufactured_year" <= EXTRACT(YEAR FROM NOW())::INTEGER));

-- Thêm index cho năm sản xuất để tăng tốc query
CREATE INDEX IF NOT EXISTS "idx_listing_containers_manufactured_year" 
    ON "listing_containers"("manufactured_year") 
    WHERE "manufactured_year" IS NOT NULL;

-- Comment
COMMENT ON COLUMN "listing_containers"."manufactured_year" IS 'Year the container was manufactured (optional, 1970-present)';
