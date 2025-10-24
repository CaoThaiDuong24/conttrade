-- Add ready_date column to orders table
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "ready_date" TIMESTAMP(3);
