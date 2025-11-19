-- Quick check and create listing_containers table
-- Run this in your PostgreSQL database

-- 1. Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'listing_containers'
);

-- 2. If table doesn't exist, create it
CREATE TABLE IF NOT EXISTS listing_containers (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    container_iso_code TEXT NOT NULL UNIQUE,
    shipping_line TEXT,
    manufactured_year INTEGER,
    status TEXT NOT NULL DEFAULT 'AVAILABLE',
    reserved_by TEXT,
    reserved_until TIMESTAMP,
    sold_to_order_id TEXT,
    sold_at TIMESTAMP,
    rented_to_order_id TEXT,
    rented_at TIMESTAMP,
    rental_return_date TIMESTAMP,
    notes TEXT,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Add foreign keys if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'listing_containers_listing_id_fkey'
    ) THEN
        ALTER TABLE listing_containers 
        ADD CONSTRAINT listing_containers_listing_id_fkey 
        FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_listing_containers_listing_id ON listing_containers(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_containers_status ON listing_containers(status);
CREATE INDEX IF NOT EXISTS idx_listing_containers_sold_to_order_id ON listing_containers(sold_to_order_id);
CREATE INDEX IF NOT EXISTS idx_listing_containers_rented_to_order_id ON listing_containers(rented_to_order_id);

-- 5. Verify
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'listing_containers'
ORDER BY ordinal_position;
