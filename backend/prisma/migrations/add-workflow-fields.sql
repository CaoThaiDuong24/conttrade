-- Migration: Add workflow fields for new order statuses and delivery workflow
-- Date: 2025-01-20
-- Description: Add new order statuses, document status, and delivery fields

-- Add new order statuses to enum
ALTER TYPE "OrderStatus" ADD VALUE 'AWAITING_FUNDS';
ALTER TYPE "OrderStatus" ADD VALUE 'ESCROW_FUNDED';
ALTER TYPE "OrderStatus" ADD VALUE 'PREPARING_DELIVERY';
ALTER TYPE "OrderStatus" ADD VALUE 'DOCUMENTS_READY';
ALTER TYPE "OrderStatus" ADD VALUE 'TRANSPORTATION_BOOKED';
ALTER TYPE "OrderStatus" ADD VALUE 'IN_TRANSIT';
ALTER TYPE "OrderStatus" ADD VALUE 'PAYMENT_RELEASED';
ALTER TYPE "OrderStatus" ADD VALUE 'DISPUTED';

-- Add new payment statuses to enum
ALTER TYPE "PaymentStatus" ADD VALUE 'ESCROW_HOLD';
ALTER TYPE "PaymentStatus" ADD VALUE 'RELEASED';

-- Create DocumentStatus enum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'ISSUED', 'EXPIRED', 'CANCELLED');

-- Add new fields to documents table
ALTER TABLE "documents" 
ADD COLUMN "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "pickup_code" TEXT,
ADD COLUMN "valid_until" TIMESTAMP(3),
ADD COLUMN "metadata" JSONB,
ADD COLUMN "document_number" TEXT;

-- Add new fields to deliveries table
ALTER TABLE "deliveries" 
ADD COLUMN "delivery_address" TEXT,
ADD COLUMN "delivery_contact" TEXT,
ADD COLUMN "delivery_phone" TEXT,
ADD COLUMN "delivery_date" TIMESTAMP(3),
ADD COLUMN "delivery_time" TEXT,
ADD COLUMN "needs_crane" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "special_instructions" TEXT,
ADD COLUMN "transportation_fee" DECIMAL(10,2),
ADD COLUMN "booked_at" TIMESTAMP(3),
ADD COLUMN "in_transit_at" TIMESTAMP(3),
ADD COLUMN "delivered_at" TIMESTAMP(3),
ADD COLUMN "current_location" TEXT,
ADD COLUMN "eir_data" JSONB,
ADD COLUMN "notes" TEXT;

-- Add new fields to payments table
ALTER TABLE "payments" 
ADD COLUMN "released_at" TIMESTAMP(3),
ADD COLUMN "escrow_hold_until" TIMESTAMP(3);

-- Create indexes for better performance
CREATE INDEX "idx_documents_status" ON "documents"("status");
CREATE INDEX "idx_documents_pickup_code" ON "documents"("pickup_code");
CREATE INDEX "idx_deliveries_delivery_date" ON "deliveries"("delivery_date");
CREATE INDEX "idx_deliveries_status" ON "deliveries"("status");
CREATE INDEX "idx_payments_released_at" ON "payments"("released_at");

-- Add comments for documentation
COMMENT ON COLUMN "documents"."status" IS 'Status of the document (DRAFT, ISSUED, EXPIRED, CANCELLED)';
COMMENT ON COLUMN "documents"."pickup_code" IS 'Code for pickup authorization';
COMMENT ON COLUMN "documents"."valid_until" IS 'Document validity expiration date';
COMMENT ON COLUMN "documents"."metadata" IS 'Additional document metadata';
COMMENT ON COLUMN "documents"."document_number" IS 'Official document number (e.g., EDO-xxx)';

COMMENT ON COLUMN "deliveries"."delivery_address" IS 'Final delivery address';
COMMENT ON COLUMN "deliveries"."delivery_contact" IS 'Contact person for delivery';
COMMENT ON COLUMN "deliveries"."delivery_phone" IS 'Phone number for delivery contact';
COMMENT ON COLUMN "deliveries"."delivery_date" IS 'Scheduled delivery date';
COMMENT ON COLUMN "deliveries"."delivery_time" IS 'Scheduled delivery time';
COMMENT ON COLUMN "deliveries"."needs_crane" IS 'Whether crane is needed for delivery';
COMMENT ON COLUMN "deliveries"."special_instructions" IS 'Special delivery instructions';
COMMENT ON COLUMN "deliveries"."transportation_fee" IS 'Transportation fee amount';
COMMENT ON COLUMN "deliveries"."booked_at" IS 'When transportation was booked';
COMMENT ON COLUMN "deliveries"."in_transit_at" IS 'When delivery started';
COMMENT ON COLUMN "deliveries"."delivered_at" IS 'When delivery was completed';
COMMENT ON COLUMN "deliveries"."current_location" IS 'Current delivery location';
COMMENT ON COLUMN "deliveries"."eir_data" IS 'Equipment Interchange Receipt data';
COMMENT ON COLUMN "deliveries"."notes" IS 'Additional delivery notes';

COMMENT ON COLUMN "payments"."released_at" IS 'When escrow payment was released';
COMMENT ON COLUMN "payments"."escrow_hold_until" IS 'Escrow hold expiration date';
