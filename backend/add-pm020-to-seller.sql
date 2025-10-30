-- Add PM-020 (CREATE_RFQ) permission to seller role

-- First, check if permission exists
SELECT * FROM permissions WHERE code = 'PM-020';

-- Check current seller permissions
SELECT p.code, p.name, p.description 
FROM role_permissions rp
JOIN permissions p ON rp.permission_id = p.id
JOIN roles r ON rp.role_id = r.id
WHERE r.code = 'seller'
ORDER BY p.code;

-- Add PM-020 to seller role
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 
  r.id as role_id,
  p.id as permission_id,
  NOW() as created_at,
  NOW() as updated_at
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'seller' 
  AND p.code = 'PM-020'
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- Increment role version to force users to re-login
UPDATE roles 
SET role_version = role_version + 1,
    updated_at = NOW()
WHERE code = 'seller';

-- Update permissions_updated_at for all seller users to force re-login
UPDATE users 
SET permissions_updated_at = NOW()
WHERE id IN (
  SELECT DISTINCT user_id 
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE r.code = 'seller'
);

-- Verify the change
SELECT p.code, p.name, p.description 
FROM role_permissions rp
JOIN permissions p ON rp.permission_id = p.id
JOIN roles r ON rp.role_id = r.id
WHERE r.code = 'seller'
ORDER BY p.code;

-- Show affected users
SELECT u.email, u.permissions_updated_at
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE r.code = 'seller';
