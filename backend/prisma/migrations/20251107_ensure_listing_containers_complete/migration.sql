-- Migration: Ensure listing_containers table is complete
-- Date: 2025-11-07
-- Purpose: Đảm bảo bảng listing_containers có đầy đủ tất cả các cột và constraints

-- ========================================
-- 1. CREATE ENUM (if not exists)
-- ========================================
DO $$ BEGIN
    CREATE TYPE "ContainerInventoryStatus" AS ENUM (
        'AVAILABLE',
        'RESERVED', 
        'SOLD',
        'RENTED',
        'IN_MAINTENANCE',
        'DELETED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ========================================
-- 2. CREATE TABLE (if not exists)
-- ========================================
CREATE TABLE IF NOT EXISTS "listing_containers" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "container_iso_code" TEXT NOT NULL,
    "shipping_line" TEXT,
    "manufactured_year" INTEGER,
    "status" "ContainerInventoryStatus" NOT NULL DEFAULT 'AVAILABLE',
    "reserved_by" TEXT,
    "reserved_until" TIMESTAMP(3),
    "sold_to_order_id" TEXT,
    "sold_at" TIMESTAMP(3),
    "rented_to_order_id" TEXT,
    "rented_at" TIMESTAMP(3),
    "rental_return_date" TIMESTAMP(3),
    "notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_containers_pkey" PRIMARY KEY ("id")
);

-- ========================================
-- 3. ADD MISSING COLUMNS (if not exists)
-- ========================================

-- Add shipping_line if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'listing_containers' 
        AND column_name = 'shipping_line'
    ) THEN
        ALTER TABLE "listing_containers" ADD COLUMN "shipping_line" TEXT;
    END IF;
END $$;

-- Add manufactured_year if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'listing_containers' 
        AND column_name = 'manufactured_year'
    ) THEN
        ALTER TABLE "listing_containers" ADD COLUMN "manufactured_year" INTEGER;
    END IF;
END $$;

-- Add deleted_at if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'listing_containers' 
        AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE "listing_containers" ADD COLUMN "deleted_at" TIMESTAMP(3);
    END IF;
END $$;

-- ========================================
-- 4. UPDATE STATUS COLUMN TYPE (if needed)
-- ========================================

-- Check if status column exists but is TEXT type, then convert to ENUM
DO $$ 
DECLARE
    col_type TEXT;
BEGIN
    SELECT data_type INTO col_type
    FROM information_schema.columns 
    WHERE table_name = 'listing_containers' 
    AND column_name = 'status';
    
    IF col_type = 'text' THEN
        -- Convert TEXT to ENUM
        ALTER TABLE "listing_containers" 
            ALTER COLUMN "status" TYPE "ContainerInventoryStatus" 
            USING "status"::"ContainerInventoryStatus";
            
        -- Set default
        ALTER TABLE "listing_containers" 
            ALTER COLUMN "status" SET DEFAULT 'AVAILABLE'::"ContainerInventoryStatus";
    END IF;
END $$;

-- ========================================
-- 5. CREATE/RECREATE FOREIGN KEYS
-- ========================================

-- Drop existing foreign keys if they exist (to recreate properly)
ALTER TABLE "listing_containers" DROP CONSTRAINT IF EXISTS "listing_containers_listing_id_fkey";
ALTER TABLE "listing_containers" DROP CONSTRAINT IF EXISTS "listing_containers_reserved_by_fkey";
ALTER TABLE "listing_containers" DROP CONSTRAINT IF EXISTS "listing_containers_sold_to_order_id_fkey";
ALTER TABLE "listing_containers" DROP CONSTRAINT IF EXISTS "listing_containers_rented_to_order_id_fkey";

-- Recreate foreign keys
ALTER TABLE "listing_containers" 
    ADD CONSTRAINT "listing_containers_listing_id_fkey" 
    FOREIGN KEY ("listing_id") REFERENCES "listings"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "listing_containers" 
    ADD CONSTRAINT "listing_containers_reserved_by_fkey" 
    FOREIGN KEY ("reserved_by") REFERENCES "users"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "listing_containers" 
    ADD CONSTRAINT "listing_containers_sold_to_order_id_fkey" 
    FOREIGN KEY ("sold_to_order_id") REFERENCES "orders"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "listing_containers" 
    ADD CONSTRAINT "listing_containers_rented_to_order_id_fkey" 
    FOREIGN KEY ("rented_to_order_id") REFERENCES "orders"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ========================================
-- 6. CREATE INDEXES (if not exists)
-- ========================================

CREATE INDEX IF NOT EXISTS "listing_containers_listing_id_idx" 
    ON "listing_containers"("listing_id");

CREATE INDEX IF NOT EXISTS "listing_containers_status_idx" 
    ON "listing_containers"("status");

CREATE INDEX IF NOT EXISTS "listing_containers_reserved_by_idx" 
    ON "listing_containers"("reserved_by");

CREATE INDEX IF NOT EXISTS "listing_containers_sold_to_order_id_idx" 
    ON "listing_containers"("sold_to_order_id");

CREATE INDEX IF NOT EXISTS "listing_containers_rented_to_order_id_idx" 
    ON "listing_containers"("rented_to_order_id");

CREATE INDEX IF NOT EXISTS "listing_containers_manufactured_year_idx" 
    ON "listing_containers"("manufactured_year") 
    WHERE "manufactured_year" IS NOT NULL;

-- ========================================
-- 7. CREATE UNIQUE CONSTRAINT
-- ========================================

-- Drop old unique index if exists
DROP INDEX IF EXISTS "idx_listing_containers_iso_code_unique";
DROP INDEX IF EXISTS "listing_containers_container_iso_code_key";

-- Create unique constraint on container_iso_code
-- Each container can only appear once in the system
CREATE UNIQUE INDEX IF NOT EXISTS "listing_containers_container_iso_code_key" 
    ON "listing_containers"("container_iso_code");

-- ========================================
-- 8. ADD CONSTRAINTS
-- ========================================

-- Add check constraint for manufactured_year
ALTER TABLE "listing_containers" DROP CONSTRAINT IF EXISTS "chk_manufactured_year_valid";
ALTER TABLE "listing_containers" 
    ADD CONSTRAINT "chk_manufactured_year_valid" 
    CHECK ("manufactured_year" IS NULL OR ("manufactured_year" >= 1970 AND "manufactured_year" <= 2100));

-- ========================================
-- 9. ADD COMMENTS
-- ========================================

COMMENT ON TABLE "listing_containers" IS 'Stores individual container IDs associated with listings. Each listing can have multiple containers with tracking capabilities.';
COMMENT ON COLUMN "listing_containers"."id" IS 'Primary key UUID';
COMMENT ON COLUMN "listing_containers"."listing_id" IS 'Foreign key to listings table';
COMMENT ON COLUMN "listing_containers"."container_iso_code" IS 'ISO 6346 compliant container number (e.g., ABCU1234560) - unique across system';
COMMENT ON COLUMN "listing_containers"."shipping_line" IS 'Container owner/shipping line name (e.g., Maersk, CMA CGM, MSC)';
COMMENT ON COLUMN "listing_containers"."manufactured_year" IS 'Year the container was manufactured (1970-2100)';
COMMENT ON COLUMN "listing_containers"."status" IS 'Container availability status: AVAILABLE, RESERVED, SOLD, RENTED, IN_MAINTENANCE, DELETED';
COMMENT ON COLUMN "listing_containers"."reserved_by" IS 'User ID who reserved this container';
COMMENT ON COLUMN "listing_containers"."reserved_until" IS 'Reservation expiration timestamp';
COMMENT ON COLUMN "listing_containers"."sold_to_order_id" IS 'Order ID if container was sold';
COMMENT ON COLUMN "listing_containers"."sold_at" IS 'Timestamp when container was sold';
COMMENT ON COLUMN "listing_containers"."rented_to_order_id" IS 'Order ID if container was rented';
COMMENT ON COLUMN "listing_containers"."rented_at" IS 'Timestamp when container was rented';
COMMENT ON COLUMN "listing_containers"."rental_return_date" IS 'Expected return date for rented container';
COMMENT ON COLUMN "listing_containers"."notes" IS 'Additional notes about this container';
COMMENT ON COLUMN "listing_containers"."deleted_at" IS 'Soft delete timestamp';
COMMENT ON COLUMN "listing_containers"."created_at" IS 'Record creation timestamp';
COMMENT ON COLUMN "listing_containers"."updated_at" IS 'Record last update timestamp';

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
-- Bảng listing_containers đã được đảm bảo có đầy đủ:
-- ✅ Enum ContainerInventoryStatus
-- ✅ Tất cả các cột cần thiết
-- ✅ Foreign keys đến listings, users, orders
-- ✅ Indexes để tối ưu query
-- ✅ Unique constraint cho container_iso_code
-- ✅ Check constraint cho manufactured_year
-- ✅ Comments cho documentation
