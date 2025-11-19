-- Migration: Add transportation booking fields to delivery_containers
-- Date: 2025-11-10
-- Description: Allow buyers to book transportation for individual containers

-- Add new columns to delivery_containers table
ALTER TABLE delivery_containers 
ADD COLUMN IF NOT EXISTS transportation_booked_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS transport_method VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS logistics_company VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS transport_notes TEXT NULL;

-- Create index for faster queries on transportation_booked_at
CREATE INDEX IF NOT EXISTS idx_delivery_containers_transport_booked 
ON delivery_containers(transportation_booked_at);

-- Add comment to columns for documentation
COMMENT ON COLUMN delivery_containers.transportation_booked_at IS 'Timestamp when buyer booked transportation for this container';
COMMENT ON COLUMN delivery_containers.transport_method IS 'Transport method: self_pickup, logistics, or seller_delivers';
COMMENT ON COLUMN delivery_containers.logistics_company IS 'Name of logistics company (if transport_method = logistics)';
COMMENT ON COLUMN delivery_containers.transport_notes IS 'JSON string containing delivery address, contact, phone, date, time, crane requirement, special instructions, and fee';
