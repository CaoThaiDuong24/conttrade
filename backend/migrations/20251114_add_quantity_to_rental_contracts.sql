-- Migration: Add quantity field to rental_contracts table
-- Date: 2025-11-14
-- Purpose: Fix issue where contracts don't store the number of containers rented

-- Add quantity column
ALTER TABLE rental_contracts 
ADD COLUMN IF NOT EXISTS quantity INT NOT NULL DEFAULT 1;

-- Add comment
COMMENT ON COLUMN rental_contracts.quantity IS 'Number of containers rented in this contract';

-- Add index for better performance when querying by quantity
CREATE INDEX IF NOT EXISTS idx_rental_contracts_quantity 
ON rental_contracts(quantity) WHERE quantity > 1;

-- Update existing contracts to have quantity = 1 if null
UPDATE rental_contracts 
SET quantity = 1 
WHERE quantity IS NULL;

-- Add constraint to ensure quantity is at least 1
ALTER TABLE rental_contracts 
ADD CONSTRAINT check_quantity_positive 
CHECK (quantity >= 1);

COMMENT ON CONSTRAINT check_quantity_positive ON rental_contracts 
IS 'Ensure quantity is at least 1';
