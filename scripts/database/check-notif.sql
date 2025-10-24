SELECT 
  id, 
  user_id, 
  type, 
  title, 
  message,
  read, 
  created_at,
  data
FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;
