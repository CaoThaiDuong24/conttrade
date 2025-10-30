-- Reset permissions_updated_at cho admin
UPDATE users 
SET permissions_updated_at = NULL 
WHERE email = 'admin@i-contexchange.vn';

-- Kiểm tra kết quả
SELECT id, email, permissions_updated_at, last_login_at 
FROM users 
WHERE email = 'admin@i-contexchange.vn';
