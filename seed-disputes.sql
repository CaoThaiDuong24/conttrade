-- Insert test disputes into database
-- Make sure you have orders and users first

-- Check if we have any orders
SELECT COUNT(*) as order_count FROM orders;

-- Get a sample order to create dispute
SELECT id, order_number, buyer_id, seller_id, status 
FROM orders 
WHERE status IN ('PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED')
LIMIT 3;

-- Insert sample disputes (adjust order_id and raised_by from above query)
-- This is just a template - you need to replace the IDs with real ones

-- Example:
-- INSERT INTO disputes (
--   id, 
--   order_id, 
--   raised_by, 
--   status, 
--   reason, 
--   description,
--   priority,
--   created_at,
--   updated_at
-- ) VALUES (
--   'DISP-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('temp_seq')::text, 6, '0'),
--   'YOUR_ORDER_ID_HERE',
--   'YOUR_USER_ID_HERE',  
--   'OPEN',
--   'Product not as described',
--   'The container received does not match the specifications listed in the order',
--   'HIGH',
--   now(),
--   now()
-- );
