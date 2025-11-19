-- Migration: Add rental_duration_months to orders and order_items
-- Date: 2025-11-14
-- Purpose: Fix critical bug where rental duration is lost during checkout
-- Related: PHAT-HIEN-LOI-NGHIEM-TRONG-RENTAL-WORKFLOW.md

-- ============================================
-- PART 1: ADD COLUMNS
-- ============================================

-- Add columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS deal_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS rental_duration_months INTEGER;

-- Add columns to order_items table  
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS deal_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS rental_duration_months INTEGER;

-- ============================================
-- PART 2: ADD COMMENTS
-- ============================================

COMMENT ON COLUMN orders.deal_type IS 'Transaction type: SALE or RENTAL';
COMMENT ON COLUMN orders.rental_duration_months IS 'Number of months for rental (NULL for SALE orders)';
COMMENT ON COLUMN order_items.deal_type IS 'Transaction type: SALE or RENTAL';
COMMENT ON COLUMN order_items.rental_duration_months IS 'Number of months for rental (NULL for SALE items)';

-- ============================================
-- PART 3: CREATE INDEXES
-- ============================================

-- Index for filtering rental orders
CREATE INDEX IF NOT EXISTS idx_orders_deal_type ON orders(deal_type);
CREATE INDEX IF NOT EXISTS idx_orders_rental_duration ON orders(rental_duration_months) 
  WHERE rental_duration_months IS NOT NULL;

-- Index for filtering rental order items
CREATE INDEX IF NOT EXISTS idx_order_items_deal_type ON order_items(deal_type);

-- ============================================
-- PART 4: ADD CONSTRAINTS
-- ============================================

-- Ensure rental orders have duration
ALTER TABLE orders
ADD CONSTRAINT check_rental_has_duration 
CHECK (
  (deal_type != 'RENTAL') OR 
  (deal_type = 'RENTAL' AND rental_duration_months IS NOT NULL AND rental_duration_months >= 1)
);

-- Ensure rental order items have duration
ALTER TABLE order_items
ADD CONSTRAINT check_rental_item_has_duration 
CHECK (
  (deal_type != 'RENTAL') OR 
  (deal_type = 'RENTAL' AND rental_duration_months IS NOT NULL AND rental_duration_months >= 1)
);

-- ============================================
-- PART 5: DATA MIGRATION (if needed)
-- ============================================

-- Migrate existing orders from cart_items (if cart still exists)
-- This is a best-effort migration - manual review may be needed

DO $$
DECLARE
  migrated_count INTEGER := 0;
  order_record RECORD;
  cart_item_record RECORD;
BEGIN
  -- Try to backfill rental_duration_months from cart_items
  FOR order_record IN 
    SELECT o.id, o.order_number, c.id as cart_id
    FROM orders o
    LEFT JOIN carts c ON c.user_id = o.buyer_id AND c.status = 'CONVERTED'
    WHERE o.deal_type IS NULL
    LIMIT 100
  LOOP
    -- Check if we can find matching cart_item
    SELECT ci.deal_type, ci.rental_duration_months
    INTO cart_item_record
    FROM cart_items ci
    WHERE ci.cart_id = order_record.cart_id
      AND ci.listing_id IN (
        SELECT oi.ref_id 
        FROM order_items oi 
        WHERE oi.order_id = order_record.id 
        LIMIT 1
      )
    LIMIT 1;
    
    IF FOUND THEN
      -- Update order with cart_item data
      UPDATE orders 
      SET 
        deal_type = cart_item_record.deal_type,
        rental_duration_months = CASE 
          WHEN cart_item_record.deal_type = 'RENTAL' 
          THEN cart_item_record.rental_duration_months 
          ELSE NULL 
        END
      WHERE id = order_record.id;
      
      -- Update order_items
      UPDATE order_items
      SET 
        deal_type = cart_item_record.deal_type,
        rental_duration_months = CASE 
          WHEN cart_item_record.deal_type = 'RENTAL' 
          THEN cart_item_record.rental_duration_months 
          ELSE NULL 
        END
      WHERE order_id = order_record.id;
      
      migrated_count := migrated_count + 1;
    ELSE
      -- Fallback: Try to parse from order_items.description
      FOR cart_item_record IN 
        SELECT id, description
        FROM order_items
        WHERE order_id = order_record.id
      LOOP
        -- Pattern: "... - 6 tháng" or "... - Mua"
        IF cart_item_record.description ~ '\d+\s*tháng' THEN
          -- This is a rental
          DECLARE
            months_match TEXT;
            months_int INTEGER;
          BEGIN
            months_match := substring(cart_item_record.description from '(\d+)\s*tháng');
            months_int := months_match::INTEGER;
            
            UPDATE orders 
            SET 
              deal_type = 'RENTAL',
              rental_duration_months = months_int
            WHERE id = order_record.id;
            
            UPDATE order_items
            SET 
              deal_type = 'RENTAL',
              rental_duration_months = months_int
            WHERE id = cart_item_record.id;
            
            migrated_count := migrated_count + 1;
          END;
        ELSIF cart_item_record.description ~ 'Mua' THEN
          -- This is a sale
          UPDATE orders 
          SET deal_type = 'SALE'
          WHERE id = order_record.id;
          
          UPDATE order_items
          SET deal_type = 'SALE'
          WHERE id = cart_item_record.id;
          
          migrated_count := migrated_count + 1;
        END IF;
      END LOOP;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ Data migration completed: % orders migrated', migrated_count;
END $$;

-- ============================================
-- PART 6: VERIFICATION
-- ============================================

DO $$
DECLARE
  total_orders INTEGER;
  rental_orders INTEGER;
  sale_orders INTEGER;
  null_deal_type INTEGER;
  rental_without_duration INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_orders FROM orders;
  SELECT COUNT(*) INTO rental_orders FROM orders WHERE deal_type = 'RENTAL';
  SELECT COUNT(*) INTO sale_orders FROM orders WHERE deal_type = 'SALE';
  SELECT COUNT(*) INTO null_deal_type FROM orders WHERE deal_type IS NULL;
  SELECT COUNT(*) INTO rental_without_duration 
    FROM orders 
    WHERE deal_type = 'RENTAL' AND rental_duration_months IS NULL;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION VERIFICATION RESULTS';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total orders: %', total_orders;
  RAISE NOTICE 'Rental orders: %', rental_orders;
  RAISE NOTICE 'Sale orders: %', sale_orders;
  RAISE NOTICE 'Orders with NULL deal_type: %', null_deal_type;
  RAISE NOTICE 'Rental orders without duration: %', rental_without_duration;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  IF rental_without_duration > 0 THEN
    RAISE WARNING '⚠️  Found % rental orders without duration - manual review needed!', rental_without_duration;
  ELSE
    RAISE NOTICE '✅ All rental orders have valid duration';
  END IF;
END $$;

-- ============================================
-- ROLLBACK SCRIPT (for emergency)
-- ============================================

-- To rollback this migration:
/*
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS check_rental_has_duration,
DROP COLUMN IF EXISTS deal_type,
DROP COLUMN IF EXISTS rental_duration_months;

ALTER TABLE order_items 
DROP CONSTRAINT IF EXISTS check_rental_item_has_duration,
DROP COLUMN IF EXISTS deal_type,
DROP COLUMN IF EXISTS rental_duration_months;

DROP INDEX IF EXISTS idx_orders_deal_type;
DROP INDEX IF EXISTS idx_orders_rental_duration;
DROP INDEX IF EXISTS idx_order_items_deal_type;
*/
