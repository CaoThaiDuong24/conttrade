-- Add missing fields to rental_payments table
ALTER TABLE rental_payments 
ADD COLUMN IF NOT EXISTS late_fee_amount DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS late_fee_currency VARCHAR(3);

-- Add missing fields to rental_contracts table
ALTER TABLE rental_contracts 
ADD COLUMN IF NOT EXISTS auto_renewal_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS auto_renewal_duration_months INTEGER,
ADD COLUMN IF NOT EXISTS previous_contract_id VARCHAR(255);

-- Add missing field to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- Update full_name from first_name and last_name where null
UPDATE users 
SET full_name = TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')))
WHERE full_name IS NULL AND (first_name IS NOT NULL OR last_name IS NOT NULL);
