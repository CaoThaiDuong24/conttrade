-- Quick database check
SELECT 'USERS' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'ROLES' as table_name, COUNT(*) as count FROM roles  
UNION ALL
SELECT 'PERMISSIONS' as table_name, COUNT(*) as count FROM permissions
UNION ALL
SELECT 'USER_ROLES' as table_name, COUNT(*) as count FROM user_roles
UNION ALL
SELECT 'ROLE_PERMISSIONS' as table_name, COUNT(*) as count FROM role_permissions;