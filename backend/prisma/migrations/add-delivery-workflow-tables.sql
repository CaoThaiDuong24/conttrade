-- Migration: Add delivery workflow tables and update existing tables
-- Date: 2025-10-16
-- Purpose: Support complete seller delivery preparation workflow

-- ============================================
-- 1. Create order_preparations table
-- ============================================
CREATE TABLE IF NOT EXISTS order_preparations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL,
    seller_id TEXT NOT NULL,
    
    -- Preparation details
    preparation_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    preparation_completed_at TIMESTAMPTZ,
    estimated_ready_date TIMESTAMPTZ,
    
    -- Container preparation checklist
    container_inspection_completed BOOLEAN DEFAULT FALSE,
    container_cleaned BOOLEAN DEFAULT FALSE,
    container_repaired BOOLEAN DEFAULT FALSE,
    documents_prepared BOOLEAN DEFAULT FALSE,
    customs_cleared BOOLEAN DEFAULT FALSE,
    
    -- Photos and documentation
    inspection_photos_json JSONB,
    repair_photos_json JSONB,
    document_urls_json JSONB,
    
    -- Notes and instructions
    preparation_notes TEXT,
    seller_notes TEXT,
    
    -- Pickup information
    pickup_location_json JSONB,
    pickup_contact_name VARCHAR(255),
    pickup_contact_phone VARCHAR(50),
    pickup_instructions TEXT,
    pickup_available_from TIMESTAMPTZ,
    pickup_available_to TIMESTAMPTZ,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'PREPARING', -- PREPARING, READY, PICKED_UP
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_order_preparation_order
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_preparation_seller
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_preparation_dates 
        CHECK (preparation_completed_at IS NULL OR preparation_completed_at >= preparation_started_at)
);

-- Indexes for order_preparations
CREATE INDEX idx_order_preparations_order_id ON order_preparations(order_id);
CREATE INDEX idx_order_preparations_seller_id ON order_preparations(seller_id);
CREATE INDEX idx_order_preparations_status ON order_preparations(status);
CREATE INDEX idx_order_preparations_ready_date ON order_preparations(estimated_ready_date);

-- ============================================
-- 2. Create disputes table
-- ============================================
CREATE TABLE IF NOT EXISTS disputes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL,
    raised_by TEXT NOT NULL,
    assigned_to TEXT,
    
    -- Dispute details
    reason VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    evidence_json JSONB, -- Array of {type, url, description}
    
    -- Resolution request
    requested_resolution VARCHAR(100),
    requested_amount DECIMAL(15, 2),
    
    -- Admin response
    admin_notes TEXT,
    resolution_notes TEXT,
    resolution_amount DECIMAL(15, 2),
    resolved_at TIMESTAMPTZ,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, INVESTIGATING, RESOLVED, CLOSED, ESCALATED
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
    
    -- Timeline
    responded_at TIMESTAMPTZ,
    escalated_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_dispute_order
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_dispute_raised_by
        FOREIGN KEY (raised_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_dispute_assigned_to
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Only one active dispute per order
    CONSTRAINT unique_active_dispute_per_order 
        UNIQUE (order_id)
);

-- Indexes for disputes (IF NOT EXISTS not supported, use DO block)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_disputes_order_id') THEN
        CREATE INDEX idx_disputes_order_id ON disputes(order_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_disputes_raised_by') THEN
        CREATE INDEX idx_disputes_raised_by ON disputes(raised_by);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_disputes_assigned_to') THEN
        CREATE INDEX idx_disputes_assigned_to ON disputes(assigned_to);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_disputes_status') THEN
        CREATE INDEX idx_disputes_status ON disputes(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_disputes_priority') THEN
        CREATE INDEX idx_disputes_priority ON disputes(priority);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_disputes_created_at') THEN
        CREATE INDEX idx_disputes_created_at ON disputes(created_at DESC);
    END IF;
END $$;

-- ============================================
-- 3. Create dispute_messages table
-- ============================================
CREATE TABLE IF NOT EXISTS dispute_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    dispute_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    
    -- Message content
    message TEXT NOT NULL,
    attachments_json JSONB, -- Array of {type, url, filename}
    
    -- Message metadata
    is_internal BOOLEAN DEFAULT FALSE, -- Admin-only notes
    is_resolution BOOLEAN DEFAULT FALSE, -- Final resolution message
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    
    -- Foreign keys
    CONSTRAINT fk_dispute_message_dispute
        FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE,
    CONSTRAINT fk_dispute_message_sender
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for dispute_messages
CREATE INDEX idx_dispute_messages_dispute_id ON dispute_messages(dispute_id);
CREATE INDEX idx_dispute_messages_sender_id ON dispute_messages(sender_id);
CREATE INDEX idx_dispute_messages_created_at ON dispute_messages(created_at);

-- ============================================
-- 4. Alter deliveries table - Add new columns
-- ============================================

-- Add JSON columns for extended data
ALTER TABLE deliveries
ADD COLUMN IF NOT EXISTS carrier_contact_json JSONB,
ADD COLUMN IF NOT EXISTS transport_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS route_json JSONB,
ADD COLUMN IF NOT EXISTS driver_info_json JSONB,
ADD COLUMN IF NOT EXISTS delivery_location_json JSONB,
ADD COLUMN IF NOT EXISTS delivery_proof_json JSONB,
ADD COLUMN IF NOT EXISTS eir_data_json JSONB,
ADD COLUMN IF NOT EXISTS received_by_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS received_by_signature TEXT,
ADD COLUMN IF NOT EXISTS driver_notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN deliveries.carrier_contact_json IS 'Contact info: {name, phone, email, company}';
COMMENT ON COLUMN deliveries.route_json IS 'Planned route: {waypoints: [{location, eta, status}]}';
COMMENT ON COLUMN deliveries.driver_info_json IS 'Driver details: {name, phone, license_no, vehicle_no}';
COMMENT ON COLUMN deliveries.delivery_location_json IS 'Actual delivery location: {lat, lng, address, timestamp}';
COMMENT ON COLUMN deliveries.delivery_proof_json IS 'Proof of delivery: {photos: [], signature, timestamp}';
COMMENT ON COLUMN deliveries.eir_data_json IS 'Equipment Interchange Receipt: {container_condition, damages: [], photos: []}';

-- ============================================
-- 5. Update OrderStatus enum
-- ============================================

-- Note: Prisma will handle enum updates, but for manual migration:
-- ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'READY_FOR_PICKUP';
-- ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PREPARING_DELIVERY';

-- The values PREPARING_DELIVERY, READY_FOR_PICKUP are already added in the enum

-- ============================================
-- 6. Create audit trail for disputes
-- ============================================
CREATE TABLE IF NOT EXISTS dispute_audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    dispute_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    
    -- Action details
    action VARCHAR(50) NOT NULL, -- CREATED, STATUS_CHANGED, ASSIGNED, RESOLVED, etc.
    old_value TEXT,
    new_value TEXT,
    metadata_json JSONB,
    
    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_dispute_audit_dispute
        FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE,
    CONSTRAINT fk_dispute_audit_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for audit logs
CREATE INDEX idx_dispute_audit_dispute_id ON dispute_audit_logs(dispute_id);
CREATE INDEX idx_dispute_audit_created_at ON dispute_audit_logs(created_at DESC);

-- ============================================
-- 7. Create function to auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for auto-updating updated_at
CREATE TRIGGER update_order_preparations_updated_at 
    BEFORE UPDATE ON order_preparations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at 
    BEFORE UPDATE ON disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. Grant permissions (adjust as needed)
-- ============================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON order_preparations TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON disputes TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON dispute_messages TO your_app_user;
-- GRANT SELECT, INSERT ON dispute_audit_logs TO your_app_user;

-- ============================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================
-- DROP TRIGGER IF EXISTS update_order_preparations_updated_at ON order_preparations;
-- DROP TRIGGER IF EXISTS update_disputes_updated_at ON disputes;
-- DROP TABLE IF EXISTS dispute_audit_logs CASCADE;
-- DROP TABLE IF EXISTS dispute_messages CASCADE;
-- DROP TABLE IF EXISTS disputes CASCADE;
-- DROP TABLE IF EXISTS order_preparations CASCADE;
-- ALTER TABLE deliveries DROP COLUMN IF EXISTS carrier_contact_json;
-- ALTER TABLE deliveries DROP COLUMN IF EXISTS transport_method;
-- ALTER TABLE deliveries DROP COLUMN IF EXISTS route_json;
-- ALTER TABLE deliveries DROP COLUMN IF EXISTS driver_info_json;
-- ALTER TABLE deliveries DROP COLUMN IF EXISTS delivery_location_json;
-- ALTER TABLE deliveries DROP COLUMN IF EXISTS delivery_proof_json;
-- ALTER TABLE deliveries DROP COLUMN IF EXISTS eir_data_json;
-- ALTER TABLE deliveries DROP COLUMN IF EXISTS received_by_name;
-- ALTER TABLE deliveries DROP COLUMN IF EXISTS received_by_signature;
-- ALTER TABLE deliveries DROP COLUMN IF EXISTS driver_notes;
