-- Add ContainerInventoryStatus ENUM
-- Migration to add enum type for listing_containers.status

-- Create enum type
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

-- Alter column to use enum (if exists and is TEXT)
DO $$ 
BEGIN
    -- Check if column is TEXT type
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listing_containers' 
        AND column_name = 'status' 
        AND data_type = 'text'
    ) THEN
        -- Convert existing TEXT values to match enum values
        UPDATE listing_containers 
        SET status = UPPER(status) 
        WHERE status IS NOT NULL;
        
        -- Drop unique index that uses status column
        DROP INDEX IF EXISTS idx_listing_containers_iso_code_unique;
        
        -- Drop default constraint first
        ALTER TABLE listing_containers 
        ALTER COLUMN status DROP DEFAULT;
        
        -- Alter column to use enum
        ALTER TABLE listing_containers 
        ALTER COLUMN status TYPE "ContainerInventoryStatus" 
        USING status::text::"ContainerInventoryStatus";
        
        -- Set new default value with proper enum type
        ALTER TABLE listing_containers 
        ALTER COLUMN status SET DEFAULT 'AVAILABLE'::"ContainerInventoryStatus";
        
        -- Recreate unique index with enum type
        CREATE UNIQUE INDEX "idx_listing_containers_iso_code_unique" 
            ON "listing_containers"("container_iso_code") 
            WHERE "status" != 'SOLD'::"ContainerInventoryStatus" 
            AND "status" != 'DELETED'::"ContainerInventoryStatus";
        
        RAISE NOTICE 'Successfully converted status column to ContainerInventoryStatus enum';
    ELSE
        RAISE NOTICE 'Status column is already using enum or does not exist';
    END IF;
END $$;
