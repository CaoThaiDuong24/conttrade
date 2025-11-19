-- Migration: Add Rental Management Permissions
-- Created: 2025-11-13
-- Description: Thêm permissions cho tính năng quản lý container cho thuê

-- 1. Thêm permissions mới cho Rental Management
INSERT INTO permissions (id, code, name, description, category, created_at, updated_at)
VALUES
  -- Rental Contracts Management (PM-100 to PM-105)
  ('perm-pm-100', 'PM-100', 'VIEW_RENTAL_CONTRACTS', 'Xem danh sách hợp đồng cho thuê', 'rentals', NOW(), NOW()),
  ('perm-pm-101', 'PM-101', 'CREATE_RENTAL_CONTRACT', 'Tạo hợp đồng cho thuê mới', 'rentals', NOW(), NOW()),
  ('perm-pm-102', 'PM-102', 'EDIT_RENTAL_CONTRACT', 'Chỉnh sửa hợp đồng cho thuê', 'rentals', NOW(), NOW()),
  ('perm-pm-103', 'PM-103', 'EXTEND_RENTAL_CONTRACT', 'Gia hạn hợp đồng cho thuê', 'rentals', NOW(), NOW()),
  ('perm-pm-104', 'PM-104', 'TERMINATE_RENTAL_CONTRACT', 'Kết thúc hợp đồng cho thuê', 'rentals', NOW(), NOW()),
  ('perm-pm-105', 'PM-105', 'COMPLETE_RENTAL_CONTRACT', 'Hoàn thành hợp đồng cho thuê', 'rentals', NOW(), NOW()),
  
  -- Container Rental Management - Seller (PM-110 to PM-112)
  ('perm-pm-110', 'PM-110', 'MANAGE_RENTAL_CONTAINERS', 'Quản lý container cho thuê', 'rentals', NOW(), NOW()),
  ('perm-pm-111', 'PM-111', 'UPDATE_RENTAL_PRICING', 'Cập nhật giá cho thuê', 'rentals', NOW(), NOW()),
  ('perm-pm-112', 'PM-112', 'VIEW_RENTAL_STATS', 'Xem thống kê container cho thuê', 'rentals', NOW(), NOW()),
  
  -- Maintenance Management (PM-120 to PM-123)
  ('perm-pm-120', 'PM-120', 'VIEW_MAINTENANCE_LOGS', 'Xem lịch sử bảo trì', 'rentals', NOW(), NOW()),
  ('perm-pm-121', 'PM-121', 'CREATE_MAINTENANCE', 'Tạo lịch bảo trì', 'rentals', NOW(), NOW()),
  ('perm-pm-122', 'PM-122', 'UPDATE_MAINTENANCE', 'Cập nhật thông tin bảo trì', 'rentals', NOW(), NOW()),
  ('perm-pm-123', 'PM-123', 'CANCEL_MAINTENANCE', 'Hủy lịch bảo trì', 'rentals', NOW(), NOW()),
  
  -- Buyer Rental Management (PM-130 to PM-133)
  ('perm-pm-130', 'PM-130', 'VIEW_MY_RENTALS', 'Xem hợp đồng thuê của tôi', 'rentals', NOW(), NOW()),
  ('perm-pm-131', 'PM-131', 'REQUEST_RENTAL_EXTENSION', 'Yêu cầu gia hạn thuê', 'rentals', NOW(), NOW()),
  ('perm-pm-132', 'PM-132', 'REPORT_CONTAINER_ISSUE', 'Báo cáo sự cố container', 'rentals', NOW(), NOW()),
  ('perm-pm-133', 'PM-133', 'VIEW_RENTAL_INVOICES', 'Xem hóa đơn thuê', 'rentals', NOW(), NOW()),
  
  -- Finance & Reporting (PM-140 to PM-141)
  ('perm-pm-140', 'PM-140', 'MANAGE_RENTAL_PAYMENTS', 'Quản lý thanh toán thuê', 'rentals', NOW(), NOW()),
  ('perm-pm-141', 'PM-141', 'VIEW_RENTAL_REPORTS', 'Xem báo cáo cho thuê', 'rentals', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- 2. Gán permissions cho role SELLER
-- Seller được full permissions cho rental management (trừ buyer-specific)
INSERT INTO role_permissions (id, role_id, permission_id, scope, created_at)
SELECT 
  'role-perm-seller-' || p.code,
  r.id,
  p.id,
  'GLOBAL',
  NOW()
FROM permissions p
CROSS JOIN roles r
WHERE r.code = 'seller'
  AND p.code IN (
    'PM-100', 'PM-101', 'PM-102', 'PM-103', 'PM-104', 'PM-105',  -- Contracts
    'PM-110', 'PM-111', 'PM-112',  -- Container management
    'PM-120', 'PM-121', 'PM-122', 'PM-123',  -- Maintenance
    'PM-140', 'PM-141'  -- Finance & Reports
  )
ON CONFLICT (role_id, permission_id, scope) DO NOTHING;

-- 3. Gán permissions cho role BUYER
-- Buyer chỉ có permissions xem và quản lý rental của mình
INSERT INTO role_permissions (id, role_id, permission_id, scope, created_at)
SELECT 
  'role-perm-buyer-' || p.code,
  r.id,
  p.id,
  'GLOBAL',
  NOW()
FROM permissions p
CROSS JOIN roles r
WHERE r.code = 'buyer'
  AND p.code IN (
    'PM-130', 'PM-131', 'PM-132', 'PM-133'  -- My rentals only
  )
ON CONFLICT (role_id, permission_id, scope) DO NOTHING;

-- 4. Gán TẤT CẢ rental permissions cho role ADMIN
INSERT INTO role_permissions (id, role_id, permission_id, scope, created_at)
SELECT 
  'role-perm-admin-' || p.code,
  r.id,
  p.id,
  'GLOBAL',
  NOW()
FROM permissions p
CROSS JOIN roles r
WHERE r.code = 'admin'
  AND p.code LIKE 'PM-1%'  -- All PM-100 to PM-199
ON CONFLICT (role_id, permission_id, scope) DO NOTHING;

-- 5. Update role_version để force users re-login và lấy permissions mới
UPDATE roles 
SET role_version = COALESCE(role_version, 0) + 1,
    updated_at = NOW()
WHERE code IN ('seller', 'buyer', 'admin');

-- 6. Update permissions_updated_at cho users có roles này
UPDATE users
SET permissions_updated_at = NOW()
WHERE id IN (
  SELECT DISTINCT user_id 
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE r.code IN ('seller', 'buyer', 'admin')
);

-- Verification queries (comment out for production)
-- SELECT code, name, category, description FROM permissions WHERE category = 'rentals' ORDER BY code;
-- SELECT r.code as role, p.code as permission FROM role_permissions rp JOIN roles r ON rp.role_id = r.id JOIN permissions p ON rp.permission_id = p.id WHERE p.category = 'rentals' ORDER BY r.code, p.code;
