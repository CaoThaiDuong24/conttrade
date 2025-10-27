-- Check seller role permissions
SELECT 
    r.id as role_id,
    r.code as role_code,
    r.name as role_name,
    COUNT(rp.permission_id) as total_permissions,
    COUNT(CASE WHEN p.code = 'CREATE_LISTING' THEN 1 END) as has_create_listing
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE r.code = 'seller'
GROUP BY r.id, r.code, r.name;

-- List all permissions of seller role
SELECT 
    p.code,
    p.name,
    p.category,
    rp.created_at as assigned_at
FROM role_permissions rp
JOIN permissions p ON rp.permission_id = p.id
JOIN roles r ON rp.role_id = r.id
WHERE r.code = 'seller'
ORDER BY p.code;

-- Check if CREATE_LISTING permission exists
SELECT * FROM permissions WHERE code = 'CREATE_LISTING';
