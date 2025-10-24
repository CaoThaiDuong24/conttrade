-- Add performance indexes for listings table
-- Created: 17/10/2025 03:30 AM
-- Purpose: Improve query performance for listings searches and filters

-- Index for status filtering (most common query)
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);

-- Index for deal type filtering
CREATE INDEX IF NOT EXISTS idx_listings_deal_type ON listings(deal_type);

-- Index for seller queries (my listings)
CREATE INDEX IF NOT EXISTS idx_listings_seller_user_id ON listings(seller_user_id);

-- Index for location filtering
CREATE INDEX IF NOT EXISTS idx_listings_location_depot_id ON listings(location_depot_id);

-- Index for price sorting/filtering
CREATE INDEX IF NOT EXISTS idx_listings_price_amount ON listings(price_amount);

-- Index for sorting by published date (DESC for newest first)
CREATE INDEX IF NOT EXISTS idx_listings_published_at ON listings(published_at DESC);

-- Composite index for active listings by date (most common query)
CREATE INDEX IF NOT EXISTS idx_listings_status_published_at ON listings(status, published_at DESC);

-- Index for searching by created date
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);

-- Index for org-level listings
CREATE INDEX IF NOT EXISTS idx_listings_org_id ON listings(org_id) WHERE org_id IS NOT NULL;

-- Show created indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'listings'
  AND indexname LIKE 'idx_listings_%'
ORDER BY indexname;
