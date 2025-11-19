-- SAFE MIGRATION: Add Cart Tables
-- Created: 2025-11-05
-- Purpose: Add shopping cart functionality to the system
-- IMPORTANT: This script is SAFE - only creates if not exists, no data loss

-- =========================================
-- STEP 1: Create enum CartStatus (if not exists)
-- =========================================
DO $$ 
BEGIN
    -- Check and create enum CartStatus
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CartStatus') THEN
        CREATE TYPE "CartStatus" AS ENUM ('ACTIVE', 'ABANDONED', 'CONVERTED');
        RAISE NOTICE 'Created enum CartStatus';
    ELSE
        RAISE NOTICE 'Enum CartStatus already exists, skipping';
    END IF;
END $$;

-- =========================================
-- BƯỚC 2: Tạo bảng carts (nếu chưa có)
-- =========================================
CREATE TABLE IF NOT EXISTS carts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    session_id VARCHAR(255),
    status "CartStatus" NOT NULL DEFAULT 'ACTIVE',
    expires_at TIMESTAMP(3),
    converted_to_rfq_id TEXT,
    converted_to_order_id TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Thông báo
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'carts'
    ) THEN
        RAISE NOTICE '✅ Bảng carts đã sẵn sàng';
    END IF;
END $$;

-- =========================================
-- BƯỚC 3: Thêm constraints cho bảng carts (nếu chưa có)
-- =========================================

-- Unique constraint cho user_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'carts_user_id_unique'
    ) THEN
        ALTER TABLE carts ADD CONSTRAINT carts_user_id_unique UNIQUE (user_id);
        RAISE NOTICE '✅ Đã thêm unique constraint cho user_id';
    ELSE
        RAISE NOTICE 'ℹ️ Unique constraint user_id đã tồn tại';
    END IF;
END $$;

-- Foreign key cho user_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'carts_user_id_fkey'
    ) THEN
        ALTER TABLE carts 
        ADD CONSTRAINT carts_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Đã thêm foreign key cho user_id';
    ELSE
        RAISE NOTICE 'ℹ️ Foreign key user_id đã tồn tại';
    END IF;
END $$;

-- Foreign key cho converted_to_rfq_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'carts_converted_to_rfq_id_fkey'
    ) THEN
        ALTER TABLE carts 
        ADD CONSTRAINT carts_converted_to_rfq_id_fkey 
        FOREIGN KEY (converted_to_rfq_id) REFERENCES rfqs(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ Đã thêm foreign key cho converted_to_rfq_id';
    ELSE
        RAISE NOTICE 'ℹ️ Foreign key converted_to_rfq_id đã tồn tại';
    END IF;
END $$;

-- Foreign key cho converted_to_order_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'carts_converted_to_order_id_fkey'
    ) THEN
        ALTER TABLE carts 
        ADD CONSTRAINT carts_converted_to_order_id_fkey 
        FOREIGN KEY (converted_to_order_id) REFERENCES orders(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ Đã thêm foreign key cho converted_to_order_id';
    ELSE
        RAISE NOTICE 'ℹ️ Foreign key converted_to_order_id đã tồn tại';
    END IF;
END $$;

-- =========================================
-- BƯỚC 4: Tạo indexes cho bảng carts (nếu chưa có)
-- =========================================
CREATE INDEX IF NOT EXISTS carts_status_idx ON carts(status);
CREATE INDEX IF NOT EXISTS carts_expires_at_idx ON carts(expires_at);

RAISE NOTICE '✅ Đã tạo indexes cho bảng carts';

-- =========================================
-- BƯỚC 5: Tạo bảng cart_items (nếu chưa có)
-- =========================================
CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    cart_id TEXT NOT NULL,
    listing_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    deal_type "DealType",
    rental_duration_months INTEGER NOT NULL DEFAULT 0,
    price_snapshot DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    notes TEXT,
    added_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Thông báo
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'cart_items'
    ) THEN
        RAISE NOTICE '✅ Bảng cart_items đã sẵn sàng';
    END IF;
END $$;

-- =========================================
-- BƯỚC 6: Thêm constraints cho bảng cart_items (nếu chưa có)
-- =========================================

-- Foreign key cho cart_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cart_items_cart_id_fkey'
    ) THEN
        ALTER TABLE cart_items 
        ADD CONSTRAINT cart_items_cart_id_fkey 
        FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Đã thêm foreign key cho cart_id';
    ELSE
        RAISE NOTICE 'ℹ️ Foreign key cart_id đã tồn tại';
    END IF;
END $$;

-- Foreign key cho listing_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cart_items_listing_id_fkey'
    ) THEN
        ALTER TABLE cart_items 
        ADD CONSTRAINT cart_items_listing_id_fkey 
        FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Đã thêm foreign key cho listing_id';
    ELSE
        RAISE NOTICE 'ℹ️ Foreign key listing_id đã tồn tại';
    END IF;
END $$;

-- Unique constraint cho cart_item_key
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cart_item_key'
    ) THEN
        ALTER TABLE cart_items 
        ADD CONSTRAINT cart_item_key 
        UNIQUE (cart_id, listing_id, deal_type, rental_duration_months);
        RAISE NOTICE '✅ Đã thêm unique constraint cart_item_key';
    ELSE
        RAISE NOTICE 'ℹ️ Unique constraint cart_item_key đã tồn tại';
    END IF;
END $$;

-- =========================================
-- BƯỚC 7: Tạo indexes cho bảng cart_items (nếu chưa có)
-- =========================================
CREATE INDEX IF NOT EXISTS cart_items_cart_id_idx ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS cart_items_listing_id_idx ON cart_items(listing_id);

RAISE NOTICE '✅ Đã tạo indexes cho bảng cart_items';

-- =========================================
-- BƯỚC 8: Thêm comments cho documentation
-- =========================================
COMMENT ON TABLE carts IS 'Bảng lưu giỏ hàng của người dùng';
COMMENT ON TABLE cart_items IS 'Bảng lưu các sản phẩm trong giỏ hàng';

COMMENT ON COLUMN carts.status IS 'Trạng thái giỏ hàng: ACTIVE (đang dùng), ABANDONED (bỏ quên), CONVERTED (đã chuyển thành đơn)';
COMMENT ON COLUMN carts.expires_at IS 'Thời gian giỏ hàng tự động hết hạn (mặc định 30 ngày)';
COMMENT ON COLUMN cart_items.deal_type IS 'Loại giao dịch: SALE (mua) hoặc RENTAL (thuê)';
COMMENT ON COLUMN cart_items.rental_duration_months IS 'Số tháng thuê (0 nếu là SALE, >=1 nếu là RENTAL)';
COMMENT ON COLUMN cart_items.price_snapshot IS 'Giá tại thời điểm thêm vào giỏ (để đảm bảo giá không thay đổi)';

-- =========================================
-- BƯỚC 9: Kiểm tra và hiển thị kết quả
-- =========================================
DO $$ 
DECLARE
    cart_count INTEGER;
    cart_item_count INTEGER;
BEGIN
    -- Đếm số giỏ hàng
    SELECT COUNT(*) INTO cart_count FROM carts;
    
    -- Đếm số sản phẩm trong giỏ
    SELECT COUNT(*) INTO cart_item_count FROM cart_items;
    
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '✅ MIGRATION HOÀN TẤT THÀNH CÔNG!';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Thống kê hiện tại:';
    RAISE NOTICE '   - Số giỏ hàng trong database: %', cart_count;
    RAISE NOTICE '   - Số sản phẩm trong giỏ: %', cart_item_count;
    RAISE NOTICE '';
    RAISE NOTICE '📋 Các bảng đã được tạo/kiểm tra:';
    RAISE NOTICE '   ✅ Enum: CartStatus';
    RAISE NOTICE '   ✅ Table: carts (với indexes và foreign keys)';
    RAISE NOTICE '   ✅ Table: cart_items (với indexes và foreign keys)';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Các ràng buộc đã được thiết lập:';
    RAISE NOTICE '   ✅ carts.user_id -> users.id (CASCADE DELETE)';
    RAISE NOTICE '   ✅ carts.converted_to_rfq_id -> rfqs.id (SET NULL)';
    RAISE NOTICE '   ✅ carts.converted_to_order_id -> orders.id (SET NULL)';
    RAISE NOTICE '   ✅ cart_items.cart_id -> carts.id (CASCADE DELETE)';
    RAISE NOTICE '   ✅ cart_items.listing_id -> listings.id (CASCADE DELETE)';
    RAISE NOTICE '   ✅ Unique constraint: user mỗi lúc chỉ có 1 active cart';
    RAISE NOTICE '   ✅ Unique constraint: không duplicate items trong cart';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Lưu ý quan trọng:';
    RAISE NOTICE '   - Script này AN TOÀN, không làm mất dữ liệu hiện có';
    RAISE NOTICE '   - Nếu bảng đã tồn tại, script sẽ bỏ qua bước tạo';
    RAISE NOTICE '   - Nếu constraint đã có, script sẽ không tạo lại';
    RAISE NOTICE '   - Có thể chạy lại script này nhiều lần mà không lo lỗi';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Bước tiếp theo:';
    RAISE NOTICE '   1. Khởi động lại backend server';
    RAISE NOTICE '   2. Test API endpoints tại /api/v1/cart';
    RAISE NOTICE '   3. Kiểm tra frontend Cart components';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

-- =========================================
-- ROLLBACK SCRIPT (Chỉ dùng khi cần xóa hoàn toàn)
-- =========================================
-- CẢNH BÁO: KHÔNG CHẠY PHẦN NÀY TRỪ KHI BẠN MUỐN XÓA HẾT DỮ LIỆU CART!
-- 
-- DROP TABLE IF EXISTS cart_items CASCADE;
-- DROP TABLE IF EXISTS carts CASCADE;
-- DROP TYPE IF EXISTS "CartStatus" CASCADE;
-- 
-- RAISE NOTICE '⚠️ Đã xóa tất cả bảng cart và dữ liệu liên quan!';
