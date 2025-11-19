-- Fix review constraints to allow multiple reviews per order (one per delivery + one order-level)

-- Step 1: Find and delete duplicate reviews (keep only the latest one)
DELETE FROM reviews a USING reviews b
WHERE a.id < b.id
  AND a.order_id = b.order_id
  AND a.reviewer_id = b.reviewer_id
  AND (a.delivery_id IS NULL AND b.delivery_id IS NULL OR a.delivery_id = b.delivery_id);

-- Step 2: Drop old constraint if exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_order_id_reviewer_id_key') THEN
        ALTER TABLE reviews DROP CONSTRAINT reviews_order_id_reviewer_id_key;
    END IF;
END $$;

-- Step 3: Add new unique constraint allowing multiple reviews per order
-- User can have: 1 order-level review + multiple delivery-level reviews for same order
ALTER TABLE reviews ADD CONSTRAINT reviews_order_reviewer_delivery_unique 
    UNIQUE (order_id, reviewer_id, delivery_id);

-- Verify
SELECT 'Reviews with duplicates:' as info, COUNT(*) 
FROM (
    SELECT order_id, reviewer_id, delivery_id, COUNT(*) 
    FROM reviews 
    GROUP BY order_id, reviewer_id, delivery_id 
    HAVING COUNT(*) > 1
) t;
