-- Manual Migration: Add Cart Tables
-- Created: 2025-11-05
-- Purpose: Add shopping cart functionality

-- Create CartStatus enum
DO $$ BEGIN
    CREATE TYPE "CartStatus" AS ENUM ('ACTIVE', 'ABANDONED', 'CONVERTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    session_id VARCHAR(255),
    status "CartStatus" NOT NULL DEFAULT 'ACTIVE',
    expires_at TIMESTAMP(3),
    converted_to_rfq_id TEXT,
    converted_to_order_id TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT carts_user_id_unique UNIQUE (user_id),
    CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT carts_converted_to_rfq_id_fkey FOREIGN KEY (converted_to_rfq_id) REFERENCES rfqs(id) ON DELETE SET NULL,
    CONSTRAINT carts_converted_to_order_id_fkey FOREIGN KEY (converted_to_order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- Create indexes for carts
CREATE INDEX IF NOT EXISTS carts_status_idx ON carts(status);
CREATE INDEX IF NOT EXISTS carts_expires_at_idx ON carts(expires_at);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    cart_id TEXT NOT NULL,
    listing_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    deal_type "DealType",
    rental_duration_months INTEGER NOT NULL DEFAULT 0,
    price_snapshot DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    notes TEXT,
    added_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    CONSTRAINT cart_items_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    CONSTRAINT cart_item_key UNIQUE (cart_id, listing_id, deal_type, rental_duration_months)
);

-- Create indexes for cart_items
CREATE INDEX IF NOT EXISTS cart_items_cart_id_idx ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS cart_items_listing_id_idx ON cart_items(listing_id);

-- Add comment
COMMENT ON TABLE carts IS 'Shopping cart for users';
COMMENT ON TABLE cart_items IS 'Items in shopping cart';

-- Grant permissions (if needed)
-- GRANT ALL ON carts TO your_app_user;
-- GRANT ALL ON cart_items TO your_app_user;
