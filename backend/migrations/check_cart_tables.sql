-- Script kiểm tra xem các bảng cart đã tồn tại chưa
-- Chạy script này trước khi migration để kiểm tra trạng thái hiện tại

-- Kiểm tra bảng carts
SELECT 
    'carts' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'carts'
        ) THEN '✅ Đã tồn tại'
        ELSE '❌ Chưa tồn tại'
    END as status;

-- Kiểm tra bảng cart_items
SELECT 
    'cart_items' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'cart_items'
        ) THEN '✅ Đã tồn tại'
        ELSE '❌ Chưa tồn tại'
    END as status;

-- Kiểm tra enum CartStatus
SELECT 
    'CartStatus (enum)' as object_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM pg_type 
            WHERE typname = 'CartStatus'
        ) THEN '✅ Đã tồn tại'
        ELSE '❌ Chưa tồn tại'
    END as status;

-- Nếu bảng đã tồn tại, kiểm tra số lượng dữ liệu
SELECT 
    'Số lượng giỏ hàng' as info,
    COUNT(*) as count
FROM carts
WHERE EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'carts'
);

SELECT 
    'Số lượng items trong giỏ' as info,
    COUNT(*) as count
FROM cart_items
WHERE EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'cart_items'
);

-- Kiểm tra cấu trúc bảng carts
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'carts'
ORDER BY ordinal_position;

-- Kiểm tra cấu trúc bảng cart_items
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'cart_items'
ORDER BY ordinal_position;
