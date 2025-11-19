-- Migration: Merge delivery_reviews into reviews table
-- Date: 2025-11-18
-- Purpose: Consolidate both order-level and delivery-level reviews into single table

BEGIN;

-- Step 1: Add new columns to reviews table
ALTER TABLE reviews 
  ADD COLUMN IF NOT EXISTS delivery_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS delivery_quality_rating INTEGER,
  ADD COLUMN IF NOT EXISTS packaging_rating INTEGER,
  ADD COLUMN IF NOT EXISTS timeliness_rating INTEGER,
  ADD COLUMN IF NOT EXISTS photos_json JSONB;

-- Step 2: Add check constraints for new rating columns
ALTER TABLE reviews 
  ADD CONSTRAINT check_delivery_quality_rating 
    CHECK (delivery_quality_rating IS NULL OR (delivery_quality_rating >= 1 AND delivery_quality_rating <= 5));

ALTER TABLE reviews 
  ADD CONSTRAINT check_packaging_rating 
    CHECK (packaging_rating IS NULL OR (packaging_rating >= 1 AND packaging_rating <= 5));

ALTER TABLE reviews 
  ADD CONSTRAINT check_timeliness_rating 
    CHECK (timeliness_rating IS NULL OR (timeliness_rating >= 1 AND timeliness_rating <= 5));

-- Step 3: Migrate data from delivery_reviews to reviews
INSERT INTO reviews (
  id,
  order_id,
  delivery_id,
  reviewer_id,
  reviewee_id,
  rating,
  comment,
  delivery_quality_rating,
  packaging_rating,
  timeliness_rating,
  photos_json,
  response,
  response_by,
  response_at,
  moderated,
  moderated_by,
  moderated_at,
  created_at,
  updated_at
)
SELECT 
  id,
  order_id,
  delivery_id,
  reviewer_id,
  reviewee_id,
  rating,
  comment,
  delivery_quality_rating,
  packaging_rating,
  timeliness_rating,
  photos_json,
  response,
  response_by,
  response_at,
  COALESCE(moderated, false),
  moderated_by,
  moderated_at,
  created_at,
  COALESCE(updated_at, created_at)
FROM delivery_reviews
ON CONFLICT DO NOTHING;

-- Step 4: Drop old unique constraint and create new one
ALTER TABLE reviews 
  DROP CONSTRAINT IF EXISTS reviews_order_id_reviewer_id_key;

-- New unique constraint: one review per (order, reviewer, delivery)
-- NULL delivery_id means order-level review
CREATE UNIQUE INDEX reviews_order_reviewer_delivery_unique 
  ON reviews (order_id, reviewer_id, COALESCE(delivery_id, 'ORDER_LEVEL'));

-- Step 5: Add foreign key constraint for delivery_id
ALTER TABLE reviews 
  ADD CONSTRAINT reviews_delivery_id_fkey 
    FOREIGN KEY (delivery_id) 
    REFERENCES deliveries(id) 
    ON UPDATE CASCADE 
    ON DELETE CASCADE;

-- Step 6: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_delivery_id ON reviews(delivery_id) WHERE delivery_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_order_level ON reviews(order_id) WHERE delivery_id IS NULL;

-- Step 7: Update deliveries table to reference new reviews structure
-- Add reviewed flag if doesn't exist
ALTER TABLE deliveries 
  ADD COLUMN IF NOT EXISTS reviewed BOOLEAN DEFAULT FALSE;

-- Update reviewed flag based on reviews
UPDATE deliveries d
SET reviewed = TRUE
WHERE EXISTS (
  SELECT 1 FROM reviews r 
  WHERE r.delivery_id = d.id
);

-- Step 8: Drop old delivery_reviews table
DROP TABLE IF EXISTS delivery_reviews CASCADE;

COMMIT;

-- Verification queries (run manually after migration):
-- SELECT COUNT(*) FROM reviews WHERE delivery_id IS NULL; -- Order-level reviews
-- SELECT COUNT(*) FROM reviews WHERE delivery_id IS NOT NULL; -- Delivery-level reviews
-- SELECT * FROM reviews ORDER BY created_at DESC LIMIT 5;
