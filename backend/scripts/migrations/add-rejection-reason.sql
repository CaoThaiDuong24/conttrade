-- Add rejectionReason column to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
