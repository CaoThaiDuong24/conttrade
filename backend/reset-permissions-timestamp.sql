-- Reset permissions_updated_at for all users
-- This will allow them to login with their current tokens

UPDATE users 
SET permissions_updated_at = NULL, 
    updated_at = CURRENT_TIMESTAMP
WHERE permissions_updated_at IS NOT NULL;

-- Check results
SELECT 
  email, 
  permissions_updated_at,
  updated_at
FROM users
WHERE email IN ('admin@example.com', 'buyer@example.com', 'seller@example.com')
ORDER BY email;
