-- ============================================================================
-- FIX: Update existing delivery_containers với transportation_booked_at
-- ============================================================================
-- Vấn đề: Containers được lên lịch TRƯỚC KHI FIX không có transportation_booked_at
-- Giải pháp: Copy data từ delivery record sang delivery_containers
-- ============================================================================

BEGIN;

-- Step 1: Show current state
SELECT 
  'BEFORE UPDATE' as stage,
  COUNT(*) as total_containers,
  COUNT(*) FILTER (WHERE transportation_booked_at IS NULL) as missing_transport_data,
  COUNT(*) FILTER (WHERE transportation_booked_at IS NOT NULL) as has_transport_data
FROM delivery_containers;

-- Step 2: Update delivery_containers từ deliveries
UPDATE delivery_containers dc
SET 
  transportation_booked_at = COALESCE(dc.pickup_date, d.created_at),
  transport_method = COALESCE(d.delivery_method, 'self_pickup'),
  logistics_company = d.logistics_company,
  transport_notes = jsonb_build_object(
    'deliveryDate', d.delivery_date::text,
    'deliveryTime', d.delivery_time,
    'deliveryAddress', d.delivery_address,
    'deliveryContact', d.delivery_contact,
    'deliveryPhone', d.delivery_phone,
    'needsCrane', COALESCE(d.needs_crane, false),
    'specialInstructions', d.special_instructions,
    'migratedFrom', 'delivery_record',
    'migratedAt', NOW()::text
  )::text,
  updated_at = NOW()
FROM deliveries d
WHERE 
  dc.delivery_id = d.id 
  AND dc.transportation_booked_at IS NULL
  AND d.status IN ('SCHEDULED', 'IN_TRANSIT', 'PICKED_UP', 'DELIVERED', 'RECEIVED');

-- Step 3: Show updated state
SELECT 
  'AFTER UPDATE' as stage,
  COUNT(*) as total_containers,
  COUNT(*) FILTER (WHERE transportation_booked_at IS NULL) as missing_transport_data,
  COUNT(*) FILTER (WHERE transportation_booked_at IS NOT NULL) as has_transport_data
FROM delivery_containers;

-- Step 4: Show sample of updated records
SELECT 
  dc.container_iso_code,
  d.batch_number,
  d.status,
  dc.transportation_booked_at,
  dc.transport_method,
  dc.logistics_company,
  LEFT(dc.transport_notes, 50) || '...' as transport_notes_preview
FROM delivery_containers dc
JOIN deliveries d ON dc.delivery_id = d.id
WHERE dc.transportation_booked_at IS NOT NULL
ORDER BY dc.updated_at DESC
LIMIT 10;

-- Step 5: Verify no data loss
SELECT 
  'VERIFICATION' as stage,
  COUNT(*) as should_have_transport,
  COUNT(*) FILTER (WHERE dc.transportation_booked_at IS NOT NULL) as actually_has_transport
FROM delivery_containers dc
JOIN deliveries d ON dc.delivery_id = d.id
WHERE d.status IN ('SCHEDULED', 'IN_TRANSIT', 'PICKED_UP', 'DELIVERED', 'RECEIVED');

COMMIT;

-- Rollback if something looks wrong:
-- ROLLBACK;

-- ============================================================================
-- Kết quả mong đợi:
-- ============================================================================
-- ✅ BEFORE: missing_transport_data > 0
-- ✅ AFTER: missing_transport_data = 0 (or very few)
-- ✅ All scheduled deliveries should have transportation_booked_at
-- ============================================================================

-- ============================================================================
-- Cách chạy:
-- ============================================================================
-- Option 1: psql command line
--   psql -U postgres -d conttrade_db -f check-transport-data.sql
--
-- Option 2: pgAdmin
--   1. Connect to conttrade_db
--   2. Open Query Tool
--   3. Paste script này
--   4. Click Execute (F5)
--
-- Option 3: Copy từng query
--   1. Copy từng SELECT để xem data
--   2. Copy UPDATE để fix
--   3. Verify kết quả
-- ============================================================================
