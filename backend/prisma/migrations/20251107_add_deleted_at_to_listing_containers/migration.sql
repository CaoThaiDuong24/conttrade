-- Migration: Add deleted_at column to listing_containers
-- Date: 2025-11-07
-- Purpose: Thêm soft delete cho container IDs trong listing

-- Thêm cột deleted_at cho soft delete
ALTER TABLE "listing_containers" 
    ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

-- Thêm index cho deleted_at để tăng tốc query
CREATE INDEX IF NOT EXISTS "idx_listing_containers_deleted_at" 
    ON "listing_containers"("deleted_at");

-- Comment
COMMENT ON COLUMN "listing_containers"."deleted_at" IS 'Soft delete timestamp for container IDs';
