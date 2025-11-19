-- ✅ SCRIPT KIỂM TRA FIX RENTAL DURATION
-- Run this in PostgreSQL to verify the fix

-- 1. Kiểm tra RFQs có rental_duration_months
SELECT 
    id as rfq_id,
    listing_id,
    buyer_id,
    purpose,
    quantity,
    rental_duration_months,
    status,
    created_at
FROM rfqs 
WHERE purpose = 'RENTAL' OR rental_duration_months IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 2. Kiểm tra Orders từ RFQ có rental_duration_months không
SELECT 
    o.id as order_id,
    o.order_number,
    o.deal_type,
    o.rental_duration_months as order_rental_months,
    o.quote_id,
    q.rfq_id,
    r.rental_duration_months as rfq_rental_months,
    l.deal_type as listing_deal_type,
    o.created_at
FROM orders o
LEFT JOIN quotes q ON o.quote_id = q.id
LEFT JOIN rfqs r ON q.rfq_id = r.id
LEFT JOIN listings l ON o.listing_id = l.id
WHERE o.quote_id IS NOT NULL  -- Orders created from quotes
ORDER BY o.created_at DESC
LIMIT 10;

-- 3. Kiểm tra Order Items có rental_duration_months không
SELECT 
    oi.id as order_item_id,
    oi.order_id,
    oi.deal_type,
    oi.rental_duration_months as item_rental_months,
    o.deal_type as order_deal_type,
    o.rental_duration_months as order_rental_months,
    o.created_at
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.quote_id IS NOT NULL
ORDER BY o.created_at DESC
LIMIT 10;

-- 4. ❌ Tìm Orders bị thiếu rental_duration_months (BUG)
SELECT 
    o.id as order_id,
    o.order_number,
    o.deal_type,
    o.rental_duration_months,
    l.deal_type as listing_deal_type,
    r.rental_duration_months as rfq_had_duration,
    o.created_at,
    '❌ BUG: Order RENTAL nhưng thiếu rental_duration_months!' as issue
FROM orders o
LEFT JOIN quotes q ON o.quote_id = q.id
LEFT JOIN rfqs r ON q.rfq_id = r.id
LEFT JOIN listings l ON o.listing_id = l.id
WHERE 
    o.quote_id IS NOT NULL AND
    l.deal_type = 'RENTAL' AND
    o.rental_duration_months IS NULL
ORDER BY o.created_at DESC;

-- 5. ✅ Kiểm tra Rental Contracts được tạo đúng không
SELECT 
    rc.id as contract_id,
    rc.contract_number,
    rc.order_id,
    rc.start_date,
    rc.end_date,
    EXTRACT(MONTH FROM AGE(rc.end_date, rc.start_date)) as actual_duration_months,
    o.rental_duration_months as order_duration_months,
    CASE 
        WHEN EXTRACT(MONTH FROM AGE(rc.end_date, rc.start_date)) = o.rental_duration_months 
        THEN '✅ MATCH' 
        ELSE '❌ MISMATCH' 
    END as status
FROM rental_contracts rc
JOIN orders o ON rc.order_id = o.id
WHERE o.deal_type = 'RENTAL'
ORDER BY rc.created_at DESC
LIMIT 10;

-- 6. 🔍 DEBUG: Xem full chain RFQ → Quote → Order → Contract
SELECT 
    r.id as rfq_id,
    r.rental_duration_months as rfq_duration,
    q.id as quote_id,
    o.id as order_id,
    o.deal_type as order_deal_type,
    o.rental_duration_months as order_duration,
    rc.id as contract_id,
    EXTRACT(MONTH FROM AGE(rc.end_date, rc.start_date)) as contract_duration,
    CASE 
        WHEN r.rental_duration_months = o.rental_duration_months 
             AND o.rental_duration_months = EXTRACT(MONTH FROM AGE(rc.end_date, rc.start_date))
        THEN '✅ ALL MATCH' 
        ELSE '❌ DATA INCONSISTENT' 
    END as status
FROM rfqs r
LEFT JOIN quotes q ON r.id = q.rfq_id
LEFT JOIN orders o ON q.id = o.quote_id
LEFT JOIN rental_contracts rc ON o.id = rc.order_id
WHERE r.rental_duration_months IS NOT NULL
ORDER BY r.created_at DESC
LIMIT 10;

-- 7. 📊 SUMMARY: Thống kê số orders bị bug
SELECT 
    COUNT(*) FILTER (WHERE o.quote_id IS NOT NULL AND l.deal_type = 'RENTAL' AND o.rental_duration_months IS NULL) as orders_missing_duration,
    COUNT(*) FILTER (WHERE o.quote_id IS NOT NULL AND l.deal_type = 'RENTAL' AND o.rental_duration_months IS NOT NULL) as orders_with_duration,
    COUNT(*) FILTER (WHERE o.quote_id IS NOT NULL AND l.deal_type = 'RENTAL') as total_rental_orders_from_quote
FROM orders o
LEFT JOIN listings l ON o.listing_id = l.id;
