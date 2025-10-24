-- Migration: Add delivery method and logistics company fields
-- Date: 2025-01-20
-- Description: Add delivery_method and logistics_company fields to deliveries table

-- Create DeliveryMethod enum
CREATE TYPE "DeliveryMethod" AS ENUM ('self_pickup', 'logistics', 'seller_delivers');

-- Add new fields to deliveries table
ALTER TABLE "deliveries" 
ADD COLUMN "delivery_method" "DeliveryMethod" NOT NULL DEFAULT 'logistics',
ADD COLUMN "logistics_company" TEXT;

-- Add comments for documentation
COMMENT ON COLUMN "deliveries"."delivery_method" IS 'Method of delivery (self_pickup, logistics, seller_delivers)';
COMMENT ON COLUMN "deliveries"."logistics_company" IS 'Name of logistics company if using third-party logistics';
