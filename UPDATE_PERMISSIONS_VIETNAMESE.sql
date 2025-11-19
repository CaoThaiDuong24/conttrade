-- Script để cập nhật mô tả permissions
-- Chạy trong pgAdmin hoặc psql

-- Cập nhật mô tả cho các permissions PM-100 đến PM-141
UPDATE permissions 
SET 
  description = CASE code
    -- PM-100 to PM-105: Rental Contracts Management
    WHEN 'PM-100' THEN 'Xem danh sách hợp đồng cho thuê'
    WHEN 'PM-101' THEN 'Tạo hợp đồng cho thuê mới'
    WHEN 'PM-102' THEN 'Chỉnh sửa hợp đồng cho thuê'
    WHEN 'PM-103' THEN 'Gia hạn hợp đồng cho thuê'
    WHEN 'PM-104' THEN 'Kết thúc hợp đồng cho thuê'
    WHEN 'PM-105' THEN 'Hoàn thành hợp đồng cho thuê'
    
    -- PM-110 to PM-112: Container Rental Management
    WHEN 'PM-110' THEN 'Quản lý container cho thuê'
    WHEN 'PM-111' THEN 'Cập nhật giá cho thuê'
    WHEN 'PM-112' THEN 'Xem thống kê cho thuê'
    
    -- PM-120 to PM-123: Maintenance Management
    WHEN 'PM-120' THEN 'Xem nhật ký bảo trì'
    WHEN 'PM-121' THEN 'Tạo lịch bảo trì'
    WHEN 'PM-122' THEN 'Cập nhật bảo trì'
    WHEN 'PM-123' THEN 'Hủy bảo trì'
    
    -- PM-130 to PM-133: Buyer Rental Management
    WHEN 'PM-130' THEN 'Xem hợp đồng thuê của tôi'
    WHEN 'PM-131' THEN 'Yêu cầu gia hạn thuê'
    WHEN 'PM-132' THEN 'Báo cáo vấn đề container'
    WHEN 'PM-133' THEN 'Xem hóa đơn thuê'
    
    -- PM-140 to PM-141: Finance & Reporting
    WHEN 'PM-140' THEN 'Quản lý thanh toán cho thuê'
    WHEN 'PM-141' THEN 'Xem báo cáo cho thuê'
    
    ELSE description
  END,
  updated_at = NOW()
WHERE code IN (
  'PM-100', 'PM-101', 'PM-102', 'PM-103', 'PM-104', 'PM-105',
  'PM-110', 'PM-111', 'PM-112',
  'PM-120', 'PM-121', 'PM-122', 'PM-123',
  'PM-130', 'PM-131', 'PM-132', 'PM-133',
  'PM-140', 'PM-141'
);

-- Kiểm tra kết quả
SELECT code, name, description, category 
FROM permissions 
WHERE code IN (
  'PM-100', 'PM-101', 'PM-102', 'PM-103', 'PM-104', 'PM-105',
  'PM-110', 'PM-111', 'PM-112',
  'PM-120', 'PM-121', 'PM-122', 'PM-123',
  'PM-130', 'PM-131', 'PM-132', 'PM-133',
  'PM-140', 'PM-141'
)
ORDER BY code;
