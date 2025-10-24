-- Add receipt confirmation fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS receipt_confirmed_at TIMESTAMP(6),
ADD COLUMN IF NOT EXISTS receipt_confirmed_by VARCHAR,
ADD COLUMN IF NOT EXISTS receipt_data_json JSONB;

-- Add receipt confirmation fields to deliveries table
ALTER TABLE deliveries 
ADD COLUMN IF NOT EXISTS receipt_confirmed_at TIMESTAMP(6),
ADD COLUMN IF NOT EXISTS receipt_data_json JSONB;

-- Add comment
COMMENT ON COLUMN orders.receipt_confirmed_at IS 'Timestamp when buyer confirmed receipt';
COMMENT ON COLUMN orders.receipt_confirmed_by IS 'User ID of buyer who confirmed';
COMMENT ON COLUMN orders.receipt_data_json IS 'Receipt data: received_by, condition, photos, notes, signature';
COMMENT ON COLUMN deliveries.receipt_confirmed_at IS 'Timestamp when receipt was confirmed';
COMMENT ON COLUMN deliveries.receipt_data_json IS 'Receipt confirmation data';
