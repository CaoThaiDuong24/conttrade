-- SAFE MIGRATION: Add Cart Tables
-- Created: 2025-11-05
-- Purpose: Add shopping cart functionality
-- IMPORTANT: This script is SAFE - only creates if not exists

-- Create CartStatus enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CartStatus') THEN
        CREATE TYPE "CartStatus" AS ENUM ('ACTIVE', 'ABANDONED', 'CONVERTED');
        RAISE NOTICE 'Created enum CartStatus';
    ELSE
        RAISE NOTICE 'Enum CartStatus already exists';
    END IF;
END $$;

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    session_id VARCHAR(255),
    status "CartStatus" NOT NULL DEFAULT 'ACTIVE',
    expires_at TIMESTAMP(3),
    converted_to_rfq_id TEXT,
    converted_to_order_id TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add unique constraint for user_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'carts_user_id_unique'
    ) THEN
        ALTER TABLE carts ADD CONSTRAINT carts_user_id_unique UNIQUE (user_id);
        RAISE NOTICE 'Added unique constraint for user_id';
    ELSE
        RAISE NOTICE 'Unique constraint user_id already exists';
    END IF;
END $$;

-- Add foreign key for user_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'carts_user_id_fkey'
    ) THEN
        ALTER TABLE carts 
        ADD CONSTRAINT carts_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key for user_id';
    ELSE
        RAISE NOTICE 'Foreign key user_id already exists';
    END IF;
END $$;

-- Add foreign key for converted_to_rfq_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'carts_converted_to_rfq_id_fkey'
    ) THEN
        ALTER TABLE carts 
        ADD CONSTRAINT carts_converted_to_rfq_id_fkey 
        FOREIGN KEY (converted_to_rfq_id) REFERENCES rfqs(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key for converted_to_rfq_id';
    ELSE
        RAISE NOTICE 'Foreign key converted_to_rfq_id already exists';
    END IF;
END $$;

-- Add foreign key for converted_to_order_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'carts_converted_to_order_id_fkey'
    ) THEN
        ALTER TABLE carts 
        ADD CONSTRAINT carts_converted_to_order_id_fkey 
        FOREIGN KEY (converted_to_order_id) REFERENCES orders(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key for converted_to_order_id';
    ELSE
        RAISE NOTICE 'Foreign key converted_to_order_id already exists';
    END IF;
END $$;

-- Create indexes for carts
CREATE INDEX IF NOT EXISTS carts_status_idx ON carts(status);
CREATE INDEX IF NOT EXISTS carts_expires_at_idx ON carts(expires_at);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    cart_id TEXT NOT NULL,
    listing_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    deal_type "DealType",
    rental_duration_months INTEGER NOT NULL DEFAULT 0,
    price_snapshot DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    notes TEXT,
    added_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key for cart_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cart_items_cart_id_fkey'
    ) THEN
        ALTER TABLE cart_items 
        ADD CONSTRAINT cart_items_cart_id_fkey 
        FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key for cart_id';
    ELSE
        RAISE NOTICE 'Foreign key cart_id already exists';
    END IF;
END $$;

-- Add foreign key for listing_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cart_items_listing_id_fkey'
    ) THEN
        ALTER TABLE cart_items 
        ADD CONSTRAINT cart_items_listing_id_fkey 
        FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key for listing_id';
    ELSE
        RAISE NOTICE 'Foreign key listing_id already exists';
    END IF;
END $$;

-- Add unique constraint for cart_item_key
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cart_item_key'
    ) THEN
        ALTER TABLE cart_items 
        ADD CONSTRAINT cart_item_key 
        UNIQUE (cart_id, listing_id, deal_type, rental_duration_months);
        RAISE NOTICE 'Added unique constraint cart_item_key';
    ELSE
        RAISE NOTICE 'Unique constraint cart_item_key already exists';
    END IF;
END $$;

-- Create indexes for cart_items
CREATE INDEX IF NOT EXISTS cart_items_cart_id_idx ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS cart_items_listing_id_idx ON cart_items(listing_id);

-- Add comments
COMMENT ON TABLE carts IS 'Shopping cart for users';
COMMENT ON TABLE cart_items IS 'Items in shopping cart';
COMMENT ON COLUMN carts.status IS 'Cart status: ACTIVE, ABANDONED, CONVERTED';
COMMENT ON COLUMN carts.expires_at IS 'Cart expiration time (default 30 days)';
COMMENT ON COLUMN cart_items.deal_type IS 'Transaction type: SALE or RENTAL';
COMMENT ON COLUMN cart_items.rental_duration_months IS 'Rental months (0 for SALE, >=1 for RENTAL)';
COMMENT ON COLUMN cart_items.price_snapshot IS 'Price snapshot at time of adding to cart';

-- Final summary
DO $$ 
DECLARE
    cart_count INTEGER;
    cart_item_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO cart_count FROM carts;
    SELECT COUNT(*) INTO cart_item_count FROM cart_items;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Statistics:';
    RAISE NOTICE '  - Number of carts in database: %', cart_count;
    RAISE NOTICE '  - Number of items in carts: %', cart_item_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Tables created/verified:';
    RAISE NOTICE '  * Enum: CartStatus';
    RAISE NOTICE '  * Table: carts (with indexes and foreign keys)';
    RAISE NOTICE '  * Table: cart_items (with indexes and foreign keys)';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Restart backend server';
    RAISE NOTICE '  2. Test API endpoints at /api/v1/cart';
    RAISE NOTICE '  3. Test frontend Cart components';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;
