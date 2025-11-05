-- =====================================================
-- Query RFQs Received cho Seller
-- =====================================================
-- Logic:
-- 1. Lấy tất cả listings có seller_user_id = userId
-- 2. Lấy tất cả RFQs có listing_id thuộc danh sách listings trên
-- 3. Mặc định chỉ hiển thị RFQs có status: SUBMITTED, QUOTED, ACCEPTED, REJECTED
-- 4. Sắp xếp theo submitted_at giảm dần
-- =====================================================

-- CÁCH 1: Sử dụng JOIN (Recommended - Performance tốt hơn)
-- Thay 'USER_ID_HERE' bằng userId thực tế
SELECT
    r.id,
    r.listing_id,
    r.buyer_id,
    r.purpose,
    r.quantity,
    r.need_by,
    r.services_json,
    r.status,
    r.submitted_at,
    r.expired_at,
    r.created_at,
    r.updated_at,
    l.id as listing_id,
    l.title as listing_title,
    l.seller_user_id
FROM rfqs r
INNER JOIN listings l ON r.listing_id = l.id
WHERE l.seller_user_id = 'USER_ID_HERE'  -- Thay bằng userId thực tế
  AND r.status IN ('SUBMITTED', 'QUOTED', 'ACCEPTED', 'REJECTED')
ORDER BY r.submitted_at DESC NULLS LAST;

-- =====================================================
-- CÁCH 2: Sử dụng Subquery
-- =====================================================
SELECT
    r.*
FROM rfqs r
WHERE r.listing_id IN (
    SELECT id
    FROM listings
    WHERE seller_user_id = 'USER_ID_HERE'  -- Thay bằng userId thực tế
)
AND r.status IN ('SUBMITTED', 'QUOTED', 'ACCEPTED', 'REJECTED')
ORDER BY r.submitted_at DESC NULLS LAST;

-- =====================================================
-- CÁCH 3: Query với thông tin buyer (người gửi RFQ)
-- =====================================================
SELECT
    r.id,
    r.listing_id,
    r.buyer_id,
    r.purpose,
    r.quantity,
    r.need_by,
    r.services_json,
    r.status,
    r.submitted_at,
    r.expired_at,
    r.created_at,
    r.updated_at,
    l.id as listing_id,
    l.title as listing_title,
    l.seller_user_id,
    u.id as buyer_user_id,
    u.display_name as buyer_name,
    u.email as buyer_email
FROM rfqs r
INNER JOIN listings l ON r.listing_id = l.id
LEFT JOIN users u ON r.buyer_id = u.id
WHERE l.seller_user_id = 'USER_ID_HERE'  -- Thay bằng userId thực tế
  AND r.status IN ('SUBMITTED', 'QUOTED', 'ACCEPTED', 'REJECTED')
ORDER BY r.submitted_at DESC NULLS LAST;

-- =====================================================
-- CÁCH 4: Query để hiển thị TẤT CẢ RFQs (không filter status)
-- Thêm parameter show_all=true
-- =====================================================
SELECT
    r.id,
    r.listing_id,
    r.buyer_id,
    r.purpose,
    r.quantity,
    r.need_by,
    r.services_json,
    r.status,
    r.submitted_at,
    r.expired_at,
    r.created_at,
    r.updated_at,
    l.id as listing_id,
    l.title as listing_title,
    l.seller_user_id,
    u.id as buyer_user_id,
    u.display_name as buyer_name,
    u.email as buyer_email
FROM rfqs r
INNER JOIN listings l ON r.listing_id = l.id
LEFT JOIN users u ON r.buyer_id = u.id
WHERE l.seller_user_id = 'USER_ID_HERE'  -- Thay bằng userId thực tế
  -- Bỏ filter status để hiển thị tất cả (DRAFT, EXPIRED, etc.)
ORDER BY r.submitted_at DESC NULLS LAST;

-- =====================================================
-- CÁCH 5: Query với COUNT quotes cho mỗi RFQ
-- =====================================================
SELECT
    r.id,
    r.listing_id,
    r.buyer_id,
    r.purpose,
    r.quantity,
    r.status,
    r.submitted_at,
    l.title as listing_title,
    u.display_name as buyer_name,
    COUNT(q.id) as quote_count
FROM rfqs r
INNER JOIN listings l ON r.listing_id = l.id
LEFT JOIN users u ON r.buyer_id = u.id
LEFT JOIN quotes q ON q.rfq_id = r.id AND q.seller_id = l.seller_user_id
WHERE l.seller_user_id = 'USER_ID_HERE'  -- Thay bằng userId thực tế
  AND r.status IN ('SUBMITTED', 'QUOTED', 'ACCEPTED', 'REJECTED')
GROUP BY r.id, r.listing_id, r.buyer_id, r.purpose, r.quantity, r.status, r.submitted_at, l.title, u.display_name
ORDER BY r.submitted_at DESC NULLS LAST;

-- =====================================================
-- LƯU Ý:
-- 1. Thay 'USER_ID_HERE' bằng userId thực tế (UUID)
-- 2. CÁCH 1 (JOIN) thường có performance tốt hơn CÁCH 2 (Subquery)
-- 3. NULLS LAST đảm bảo các RFQ có submitted_at = NULL sẽ ở cuối
-- 4. Để hiển thị tất cả status, bỏ điều kiện: AND r.status IN (...)
-- =====================================================

