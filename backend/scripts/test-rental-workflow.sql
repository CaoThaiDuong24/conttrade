-- ============================================================================
-- TEST SCRIPT: Rental Workflow End-to-End Verification
-- ============================================================================
-- Purpose: Verify rental_duration_months fix is working correctly
-- Run after: Migration 20251114_add_rental_duration_to_orders.sql
-- ============================================================================

\echo '========================================='
\echo 'RENTAL WORKFLOW VERIFICATION TEST'
\echo '========================================='
\echo ''

-- ============================================================================
-- TEST 1: Check database schema
-- ============================================================================
\echo '📋 TEST 1: Verifying database schema...'
\echo ''

SELECT 
  table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name IN ('orders', 'order_items')
  AND column_name IN ('deal_type', 'rental_duration_months')
ORDER BY table_name, ordinal_position;

\echo ''
\echo '✅ Expected: 4 rows (2 columns × 2 tables)'
\echo ''

-- ============================================================================
-- TEST 2: Check constraints
-- ============================================================================
\echo '📋 TEST 2: Verifying constraints...'
\echo ''

SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conname LIKE '%rental%'
ORDER BY conname;

\echo ''
\echo '✅ Expected: check_rental_has_duration, check_rental_item_has_duration'
\echo ''

-- ============================================================================
-- TEST 3: Check indexes
-- ============================================================================
\echo '📋 TEST 3: Verifying indexes...'
\echo ''

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE (indexname LIKE '%deal_type%' OR indexname LIKE '%rental%')
  AND tablename IN ('orders', 'order_items')
ORDER BY tablename, indexname;

\echo ''
\echo '✅ Expected: idx_orders_deal_type, idx_orders_rental_duration, idx_order_items_deal_type'
\echo ''

-- ============================================================================
-- TEST 4: Sample data check
-- ============================================================================
\echo '📋 TEST 4: Checking existing orders...'
\echo ''

SELECT 
  COUNT(*) AS total_orders,
  COUNT(CASE WHEN deal_type = 'RENTAL' THEN 1 END) AS rental_orders,
  COUNT(CASE WHEN deal_type = 'SALE' THEN 1 END) AS sale_orders,
  COUNT(CASE WHEN deal_type IS NULL THEN 1 END) AS null_deal_type,
  COUNT(CASE WHEN deal_type = 'RENTAL' AND rental_duration_months IS NULL THEN 1 END) AS rental_without_duration
FROM orders;

\echo ''
\echo '⚠️  Warning if: rental_without_duration > 0 (data integrity issue)'
\echo ''

-- ============================================================================
-- TEST 5: Verify rental contracts match order durations
-- ============================================================================
\echo '📋 TEST 5: Verifying rental contracts vs orders...'
\echo ''

WITH contract_duration AS (
  SELECT 
    rc.id AS contract_id,
    rc.contract_number,
    rc.order_id,
    EXTRACT(MONTH FROM AGE(rc.end_date, rc.start_date)) AS contract_months,
    o.rental_duration_months AS order_months,
    rc.total_amount_due AS contract_total,
    o.total AS order_total,
    ABS(rc.total_amount_due - o.total) AS amount_difference
  FROM rental_contracts rc
  JOIN orders o ON o.id = rc.order_id
  WHERE rc.deleted_at IS NULL
    AND o.deal_type = 'RENTAL'
  LIMIT 10
)
SELECT 
  contract_number,
  contract_months,
  order_months,
  CASE 
    WHEN contract_months = order_months THEN '✅ MATCH'
    ELSE '❌ MISMATCH'
  END AS duration_check,
  contract_total,
  order_total,
  CASE 
    WHEN amount_difference <= 1000 THEN '✅ MATCH'
    ELSE '⚠️ DIFF: ' || amount_difference::TEXT
  END AS amount_check
FROM contract_duration;

\echo ''
\echo '✅ Expected: All rows show MATCH (or empty if no rental contracts yet)'
\echo ''

-- ============================================================================
-- TEST 6: Verify payment schedule
-- ============================================================================
\echo '📋 TEST 6: Verifying payment schedules...'
\echo ''

WITH payment_summary AS (
  SELECT 
    rc.contract_number,
    rc.order_id,
    o.rental_duration_months,
    COUNT(rp.id) AS payment_count,
    SUM(rp.amount_due) AS total_payment_amount,
    rc.total_amount_due AS contract_total
  FROM rental_contracts rc
  JOIN orders o ON o.id = rc.order_id
  LEFT JOIN rental_payments rp ON rp.contract_id = rc.id
  WHERE rc.deleted_at IS NULL
    AND o.deal_type = 'RENTAL'
  GROUP BY rc.id, rc.contract_number, rc.order_id, o.rental_duration_months, rc.total_amount_due
  LIMIT 5
)
SELECT 
  contract_number,
  rental_duration_months,
  payment_count,
  CASE 
    WHEN payment_count = rental_duration_months THEN '✅ CORRECT'
    WHEN rental_duration_months IS NULL THEN '⚠️ NULL DURATION'
    ELSE '❌ COUNT MISMATCH'
  END AS schedule_check,
  total_payment_amount,
  contract_total,
  CASE 
    WHEN ABS(total_payment_amount - contract_total) <= 100 THEN '✅ MATCH'
    ELSE '❌ AMOUNT MISMATCH'
  END AS amount_check
FROM payment_summary;

\echo ''
\echo '✅ Expected: payment_count = rental_duration_months for each contract'
\echo ''

-- ============================================================================
-- TEST 7: Find potential issues
-- ============================================================================
\echo '📋 TEST 7: Looking for data issues...'
\echo ''

-- Orders with RENTAL deal_type but no duration
SELECT 
  'RENTAL order missing duration' AS issue_type,
  id,
  order_number,
  deal_type,
  rental_duration_months,
  total,
  created_at
FROM orders
WHERE deal_type = 'RENTAL' 
  AND rental_duration_months IS NULL
LIMIT 5;

-- Contracts where duration doesn't match order
SELECT 
  'Contract duration mismatch' AS issue_type,
  rc.contract_number,
  EXTRACT(MONTH FROM AGE(rc.end_date, rc.start_date))::INTEGER AS contract_months,
  o.rental_duration_months AS order_months,
  ABS(EXTRACT(MONTH FROM AGE(rc.end_date, rc.start_date))::INTEGER - COALESCE(o.rental_duration_months, 0)) AS diff_months
FROM rental_contracts rc
JOIN orders o ON o.id = rc.order_id
WHERE rc.deleted_at IS NULL
  AND ABS(EXTRACT(MONTH FROM AGE(rc.end_date, rc.start_date))::INTEGER - COALESCE(o.rental_duration_months, 0)) > 0
LIMIT 5;

\echo ''
\echo '✅ Expected: 0 rows (or empty result)'
\echo ''

-- ============================================================================
-- TEST SUMMARY
-- ============================================================================
\echo ''
\echo '========================================='
\echo 'TEST SUMMARY'
\echo '========================================='
\echo 'If all tests pass:'
\echo '  ✅ Schema is correct'
\echo '  ✅ Constraints are in place'
\echo '  ✅ Indexes exist'
\echo '  ✅ No data integrity issues'
\echo '  ✅ Contracts match order durations'
\echo '  ✅ Payment schedules are correct'
\echo ''
\echo 'Next steps:'
\echo '  1. Test cart → checkout → order creation'
\echo '  2. Test order → contract creation'
\echo '  3. Verify frontend displays correct data'
\echo '========================================='
\echo ''
