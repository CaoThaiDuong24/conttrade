-- Add sold_quantity field to listings table
-- This tracks containers that have been sold and are no longer available

-- Step 1: Add the new column
ALTER TABLE listings 
ADD COLUMN sold_quantity INT DEFAULT 0;

-- Step 2: Drop old constraint
ALTER TABLE listings 
DROP CONSTRAINT IF EXISTS check_quantity_balance;

-- Step 3: Add new constraint that includes sold_quantity
ALTER TABLE listings 
ADD CONSTRAINT check_quantity_balance 
CHECK (
  available_quantity >= 0 AND
  rented_quantity >= 0 AND
  reserved_quantity >= 0 AND
  maintenance_quantity >= 0 AND
  sold_quantity >= 0 AND
  total_quantity >= 0 AND
  (available_quantity + rented_quantity + reserved_quantity + maintenance_quantity + sold_quantity) = total_quantity
);

-- Step 4: Update existing data - calculate sold_quantity from container status
UPDATE listings l
SET sold_quantity = (
  SELECT COUNT(*)
  FROM listing_containers lc
  WHERE lc.listing_id = l.id 
    AND lc.status = 'SOLD'
    AND lc.deleted_at IS NULL
)
WHERE l.id IN (
  SELECT DISTINCT listing_id 
  FROM listing_containers 
  WHERE status = 'SOLD' 
    AND deleted_at IS NULL
);

-- Verify the update
SELECT 
  id,
  title,
  total_quantity,
  available_quantity,
  reserved_quantity,
  sold_quantity,
  (available_quantity + reserved_quantity + rented_quantity + maintenance_quantity + sold_quantity) as calculated_total
FROM listings
WHERE sold_quantity > 0;
