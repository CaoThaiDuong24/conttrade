-- ============================================
-- ADD RFQ RESERVATION SUPPORT TO LISTING_CONTAINERS
-- Date: 2025-11-10
-- Purpose: Enable container reservation when RFQ is created
-- ============================================

-- Step 1: Add reserved_by_rfq_id column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listing_containers' 
        AND column_name = 'reserved_by_rfq_id'
    ) THEN
        ALTER TABLE listing_containers
        ADD COLUMN reserved_by_rfq_id TEXT;
        
        RAISE NOTICE '✅ Added reserved_by_rfq_id column';
    ELSE
        RAISE NOTICE 'ℹ️  reserved_by_rfq_id column already exists';
    END IF;
END $$;

-- Step 2: Add foreign key constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'listing_containers_reserved_by_rfq_id_fkey'
    ) THEN
        ALTER TABLE listing_containers
        ADD CONSTRAINT listing_containers_reserved_by_rfq_id_fkey
        FOREIGN KEY (reserved_by_rfq_id) REFERENCES rfqs(id) ON DELETE SET NULL;
        
        RAISE NOTICE '✅ Added foreign key constraint for reserved_by_rfq_id';
    ELSE
        RAISE NOTICE 'ℹ️  Foreign key constraint already exists';
    END IF;
END $$;

-- Step 3: Add index for performance
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'listing_containers_reserved_by_rfq_id_idx'
    ) THEN
        CREATE INDEX listing_containers_reserved_by_rfq_id_idx 
        ON listing_containers(reserved_by_rfq_id);
        
        RAISE NOTICE '✅ Added index on reserved_by_rfq_id';
    ELSE
        RAISE NOTICE 'ℹ️  Index already exists';
    END IF;
END $$;

-- Step 4: Add comment
COMMENT ON COLUMN listing_containers.reserved_by_rfq_id IS 'RFQ ID that has reserved this container (for negotiation period)';

-- Step 5: Verify the changes
DO $$ 
DECLARE
    column_exists BOOLEAN;
    fk_exists BOOLEAN;
    index_exists BOOLEAN;
BEGIN
    -- Check column
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listing_containers' 
        AND column_name = 'reserved_by_rfq_id'
    ) INTO column_exists;
    
    -- Check foreign key
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'listing_containers_reserved_by_rfq_id_fkey'
    ) INTO fk_exists;
    
    -- Check index
    SELECT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'listing_containers_reserved_by_rfq_id_idx'
    ) INTO index_exists;
    
    RAISE NOTICE '=================================';
    RAISE NOTICE '✅ MIGRATION VERIFICATION';
    RAISE NOTICE '=================================';
    RAISE NOTICE 'Column reserved_by_rfq_id: %', CASE WHEN column_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE 'Foreign Key Constraint: %', CASE WHEN fk_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE 'Index: %', CASE WHEN index_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE '=================================';
    
    IF column_exists AND fk_exists AND index_exists THEN
        RAISE NOTICE '🎉 Migration completed successfully!';
    ELSE
        RAISE EXCEPTION '❌ Migration incomplete. Please check the errors above.';
    END IF;
END $$;

-- Step 6: Show sample data structure
SELECT 
    'listing_containers' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'listing_containers'
    AND column_name IN ('id', 'status', 'reserved_by', 'reserved_by_rfq_id', 'reserved_until', 'sold_to_order_id')
ORDER BY ordinal_position;
