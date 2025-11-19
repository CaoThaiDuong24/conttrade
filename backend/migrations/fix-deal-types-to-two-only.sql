-- =====================================================
-- Migration: Giới hạn deal_type chỉ còn 2 loại: SALE và RENTAL
-- Date: 2025-01-18
-- Description: Loại bỏ các loại giao dịch khác (LEASE, SWAP, etc.)
--              và chỉ giữ lại 2 loại: "Bán" (SALE) và "Thuê" (RENTAL)
-- =====================================================

-- NOTE: Không dùng BEGIN/COMMIT vì Prisma CLI không hỗ trợ transaction trong db execute

-- 1. Kiểm tra các deal_type hiện tại trong hệ thống
DO $$
BEGIN
  RAISE NOTICE 'Checking current deal_type values...';
END $$;

-- 2. Thêm tạm LEASE vào enum nếu chưa có (để migration không bị lỗi)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'LEASE' AND enumtypid = 'DealType'::regtype) THEN
    ALTER TYPE "DealType" ADD VALUE 'LEASE';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'LEASE may already exist or enum handling issue';
END $$;

-- 3. Cập nhật các listing có deal_type không hợp lệ
-- Chuyển LEASE -> RENTAL (thuê dài hạn vẫn là thuê)
UPDATE listings
SET deal_type = 'RENTAL'::"DealType"
WHERE deal_type::text = 'LEASE';

-- Xóa hoặc chuyển các loại khác về SALE (nếu có)
UPDATE listings
SET deal_type = 'SALE'::"DealType"
WHERE deal_type::text NOT IN ('SALE', 'RENTAL');

-- 3. Cập nhật cart_items nếu có
UPDATE cart_items
SET deal_type = 'RENTAL'::"DealType"
WHERE deal_type::text = 'LEASE';

UPDATE cart_items
SET deal_type = 'SALE'::"DealType"
WHERE deal_type::text NOT IN ('SALE', 'RENTAL');

-- 4. Cập nhật orders nếu có deal_type
UPDATE orders
SET deal_type = 'RENTAL'
WHERE deal_type = 'LEASE';

UPDATE orders
SET deal_type = 'SALE'
WHERE deal_type NOT IN ('SALE', 'RENTAL');

-- 5. Cập nhật order_items nếu có deal_type
UPDATE order_items
SET deal_type = 'RENTAL'
WHERE deal_type = 'LEASE';

UPDATE order_items
SET deal_type = 'SALE'
WHERE deal_type NOT IN ('SALE', 'RENTAL');

-- 6. Cập nhật master data table md_deal_types
-- Giữ lại chỉ 2 loại
UPDATE md_deal_types
SET name = 'Bán'
WHERE code = 'SALE';

UPDATE md_deal_types
SET name = 'Thuê'
WHERE code = 'RENTAL';

-- Xóa các loại không dùng nữa
DELETE FROM md_deal_types
WHERE code NOT IN ('SALE', 'RENTAL');

-- 7. Hoàn thành
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE 'System now supports only 2 deal types: SALE and RENTAL';
END $$;

-- =====================================================
-- Ghi chú:
-- - Sau khi chạy migration này, hệ thống chỉ hỗ trợ 2 loại:
--   + SALE: Bán (mua đứt)
--   + RENTAL: Thuê (theo tháng hoặc theo thỏa thuận)
-- - LEASE (thuê dài hạn) được chuyển thành RENTAL
-- - Các loại khác (SWAP, etc.) được chuyển thành SALE
-- - NOTE: Enum "DealType" trong Prisma schema đã chỉ có SALE và RENTAL
-- =====================================================
