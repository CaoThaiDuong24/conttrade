-- Script SQL tạo test notifications trực tiếp

-- 1. Kiểm tra users hiện có
SELECT id, email, display_name 
FROM users 
LIMIT 5;

-- 2. Tạo test notifications cho user đầu tiên
-- Thay USER_ID_HERE bằng id của user từ query trên

INSERT INTO notifications (id, user_id, type, title, message, data, read, created_at, updated_at)
VALUES
  -- RFQ Notification
  (
    'NOTIF-' || EXTRACT(EPOCH FROM NOW())::bigint || '-001',
    (SELECT id FROM users LIMIT 1),
    'rfq_received',
    'Yêu cầu báo giá mới',
    'Bạn có yêu cầu báo giá mới cho sản phẩm "Container 20ft Standard"',
    '{"rfqId": "test-rfq-001", "listingId": "test-listing-001", "quantity": 10}'::jsonb,
    false,
    NOW() - INTERVAL '2 hours',
    NOW()
  ),
  -- Quote Notification
  (
    'NOTIF-' || EXTRACT(EPOCH FROM NOW())::bigint || '-002',
    (SELECT id FROM users LIMIT 1),
    'quote_received',
    'Báo giá mới',
    'Bạn có báo giá mới cho yêu cầu của mình (Container 40ft High Cube)',
    '{"quoteId": "test-quote-001", "rfqId": "test-rfq-001", "total": 15000000, "currency": "VND"}'::jsonb,
    false,
    NOW() - INTERVAL '1 hour',
    NOW()
  ),
  -- Quote Accepted
  (
    'NOTIF-' || EXTRACT(EPOCH FROM NOW())::bigint || '-003',
    (SELECT id FROM users LIMIT 1),
    'quote_accepted',
    'Báo giá được chấp nhận',
    'Báo giá của bạn đã được chấp nhận. Đơn hàng ORD-12345 đã được tạo.',
    '{"quoteId": "test-quote-001", "orderId": "test-order-001", "orderNumber": "ORD-12345", "total": 15000000}'::jsonb,
    false,
    NOW() - INTERVAL '30 minutes',
    NOW()
  ),
  -- Quote Rejected
  (
    'NOTIF-' || EXTRACT(EPOCH FROM NOW())::bigint || '-004',
    (SELECT id FROM users LIMIT 1),
    'quote_rejected',
    'Báo giá bị từ chối',
    'Báo giá của bạn đã bị từ chối bởi người mua.',
    '{"quoteId": "test-quote-002", "rfqId": "test-rfq-002", "total": 12000000}'::jsonb,
    true,
    NOW() - INTERVAL '3 hours',
    NOW()
  ),
  -- Order Created
  (
    'NOTIF-' || EXTRACT(EPOCH FROM NOW())::bigint || '-005',
    (SELECT id FROM users LIMIT 1),
    'order_created',
    'Đơn hàng mới',
    'Bạn có đơn hàng mới #ORD-67890',
    '{"orderId": "test-order-002", "orderNumber": "ORD-67890", "total": 20000000}'::jsonb,
    false,
    NOW() - INTERVAL '15 minutes',
    NOW()
  );

-- 3. Kiểm tra kết quả
SELECT 
  id,
  type,
  title,
  read,
  created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 10;

-- 4. Thống kê notifications
SELECT 
  type,
  COUNT(*) as total,
  SUM(CASE WHEN read = FALSE THEN 1 ELSE 0 END) as unread
FROM notifications
GROUP BY type
ORDER BY total DESC;
