-- Verify migration: Check only 2 deal types exist

-- 1. Check listings
SELECT 'Listings' as table_name, deal_type::text as deal_type, COUNT(*) as count
FROM listings
WHERE deal_type IS NOT NULL
GROUP BY deal_type::text
UNION ALL
-- 2. Check cart_items
SELECT 'Cart Items', deal_type::text, COUNT(*)
FROM cart_items
WHERE deal_type IS NOT NULL
GROUP BY deal_type::text
UNION ALL
-- 3. Check orders
SELECT 'Orders', deal_type::text, COUNT(*)
FROM orders
WHERE deal_type IS NOT NULL
GROUP BY deal_type::text
UNION ALL
-- 4. Check order_items
SELECT 'Order Items', deal_type::text, COUNT(*)
FROM order_items
WHERE deal_type IS NOT NULL
GROUP BY deal_type::text
UNION ALL
-- 5. Check master data
SELECT 'Master Data', code::text, COUNT(*)
FROM md_deal_types
GROUP BY code::text
ORDER BY table_name, deal_type;
