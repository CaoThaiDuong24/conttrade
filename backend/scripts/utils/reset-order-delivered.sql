-- Reset order to DELIVERED status for testing
UPDATE orders 
SET 
  status = 'DELIVERED',
  receipt_confirmed_at = NULL,
  receipt_confirmed_by = NULL,
  receipt_data_json = NULL
WHERE id = '745201cf-581b-4b4f-a173-718226677fec'
RETURNING id, status, delivered_at, receipt_confirmed_at;
