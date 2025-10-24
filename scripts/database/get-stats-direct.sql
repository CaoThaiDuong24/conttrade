-- Get Listings Stats
SELECT status, COUNT(*) as count 
FROM listings 
GROUP BY status;

-- Get RFQs Stats  
SELECT status, COUNT(*) as count 
FROM rfqs 
GROUP BY status;

-- Get Orders Stats
SELECT status, COUNT(*) as count 
FROM orders 
GROUP BY status;

-- Get Deliveries Stats
SELECT status, COUNT(*) as count 
FROM deliveries 
GROUP BY status;

-- Get Users Stats
SELECT status, COUNT(*) as count 
FROM users 
GROUP BY status;

