-- Migration: Add delivery workflow - Safe incremental update
-- Date: 2025-10-17
-- Purpose: Safely add new columns and tables

-- ============================================
-- 1. Update deliveries table - Add new columns if not exist
-- ============================================

DO $$
BEGIN
    -- Add new JSON columns for extended delivery data
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliveries' AND column_name='carrier_contact_json') THEN
        ALTER TABLE deliveries ADD COLUMN carrier_contact_json JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliveries' AND column_name='transport_method') THEN
        ALTER TABLE deliveries ADD COLUMN transport_method VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliveries' AND column_name='route_json') THEN
        ALTER TABLE deliveries ADD COLUMN route_json JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliveries' AND column_name='driver_info_json') THEN
        ALTER TABLE deliveries ADD COLUMN driver_info_json JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliveries' AND column_name='delivery_location_json') THEN
        ALTER TABLE deliveries ADD COLUMN delivery_location_json JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliveries' AND column_name='delivery_proof_json') THEN
        ALTER TABLE deliveries ADD COLUMN delivery_proof_json JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliveries' AND column_name='eir_data_json') THEN
        ALTER TABLE deliveries ADD COLUMN eir_data_json JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliveries' AND column_name='received_by_name') THEN
        ALTER TABLE deliveries ADD COLUMN received_by_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliveries' AND column_name='received_by_signature') THEN
        ALTER TABLE deliveries ADD COLUMN received_by_signature TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliveries' AND column_name='driver_notes') THEN
        ALTER TABLE deliveries ADD COLUMN driver_notes TEXT;
    END IF;
END $$;

-- ============================================
-- 2. Update disputes table - Add new columns if not exist
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='disputes' AND column_name='assigned_to') THEN
        ALTER TABLE disputes ADD COLUMN assigned_to TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='disputes' AND column_name='evidence_json') THEN
        ALTER TABLE disputes ADD COLUMN evidence_json JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='disputes' AND column_name='requested_resolution') THEN
        ALTER TABLE disputes ADD COLUMN requested_resolution VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='disputes' AND column_name='requested_amount') THEN
        ALTER TABLE disputes ADD COLUMN requested_amount DECIMAL(15, 2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='disputes' AND column_name='admin_notes') THEN
        ALTER TABLE disputes ADD COLUMN admin_notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='disputes' AND column_name='resolution_notes') THEN
        ALTER TABLE disputes ADD COLUMN resolution_notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='disputes' AND column_name='resolution_amount') THEN
        ALTER TABLE disputes ADD COLUMN resolution_amount DECIMAL(15, 2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='disputes' AND column_name='priority') THEN
        ALTER TABLE disputes ADD COLUMN priority VARCHAR(20) DEFAULT 'MEDIUM';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='disputes' AND column_name='responded_at') THEN
        ALTER TABLE disputes ADD COLUMN responded_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='disputes' AND column_name='escalated_at') THEN
        ALTER TABLE disputes ADD COLUMN escalated_at TIMESTAMPTZ;
    END IF;
    
    -- Rename column if old name exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='disputes' AND column_name='opened_by') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='disputes' AND column_name='raised_by') THEN
            ALTER TABLE disputes RENAME COLUMN opened_by TO raised_by;
        END IF;
    END IF;
END $$;

-- ============================================
-- 3. Create order_preparations table
-- ============================================
CREATE TABLE IF NOT EXISTS order_preparations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL,
    seller_id TEXT NOT NULL,
    preparation_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    preparation_completed_at TIMESTAMPTZ,
    estimated_ready_date TIMESTAMPTZ,
    container_inspection_completed BOOLEAN DEFAULT FALSE,
    container_cleaned BOOLEAN DEFAULT FALSE,
    container_repaired BOOLEAN DEFAULT FALSE,
    documents_prepared BOOLEAN DEFAULT FALSE,
    customs_cleared BOOLEAN DEFAULT FALSE,
    inspection_photos_json JSONB,
    repair_photos_json JSONB,
    document_urls_json JSONB,
    preparation_notes TEXT,
    seller_notes TEXT,
    pickup_location_json JSONB,
    pickup_contact_name VARCHAR(255),
    pickup_contact_phone VARCHAR(50),
    pickup_instructions TEXT,
    pickup_available_from TIMESTAMPTZ,
    pickup_available_to TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'PREPARING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign keys for order_preparations (only if table was just created)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_order_preparation_order'
    ) THEN
        ALTER TABLE order_preparations
        ADD CONSTRAINT fk_order_preparation_order
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_order_preparation_seller'
    ) THEN
        ALTER TABLE order_preparations
        ADD CONSTRAINT fk_order_preparation_seller
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- 4. Create dispute_messages table
-- ============================================
CREATE TABLE IF NOT EXISTS dispute_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    dispute_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    message TEXT NOT NULL,
    attachments_json JSONB,
    is_internal BOOLEAN DEFAULT FALSE,
    is_resolution BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Foreign keys for dispute_messages
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_dispute_message_dispute'
    ) THEN
        ALTER TABLE dispute_messages
        ADD CONSTRAINT fk_dispute_message_dispute
        FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_dispute_message_sender'
    ) THEN
        ALTER TABLE dispute_messages
        ADD CONSTRAINT fk_dispute_message_sender
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- 5. Create dispute_audit_logs table
-- ============================================
CREATE TABLE IF NOT EXISTS dispute_audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    dispute_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    metadata_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign keys for dispute_audit_logs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_dispute_audit_dispute'
    ) THEN
        ALTER TABLE dispute_audit_logs
        ADD CONSTRAINT fk_dispute_audit_dispute
        FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_dispute_audit_user'
    ) THEN
        ALTER TABLE dispute_audit_logs
        ADD CONSTRAINT fk_dispute_audit_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- 6. Create indexes
-- ============================================
DO $$
BEGIN
    -- order_preparations indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_order_preparations_order_id') THEN
        CREATE INDEX idx_order_preparations_order_id ON order_preparations(order_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_order_preparations_seller_id') THEN
        CREATE INDEX idx_order_preparations_seller_id ON order_preparations(seller_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_order_preparations_status') THEN
        CREATE INDEX idx_order_preparations_status ON order_preparations(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_order_preparations_ready_date') THEN
        CREATE INDEX idx_order_preparations_ready_date ON order_preparations(estimated_ready_date);
    END IF;
    
    -- dispute_messages indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_dispute_messages_dispute_id') THEN
        CREATE INDEX idx_dispute_messages_dispute_id ON dispute_messages(dispute_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_dispute_messages_sender_id') THEN
        CREATE INDEX idx_dispute_messages_sender_id ON dispute_messages(sender_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_dispute_messages_created_at') THEN
        CREATE INDEX idx_dispute_messages_created_at ON dispute_messages(created_at);
    END IF;
    
    -- dispute_audit_logs indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_dispute_audit_dispute_id') THEN
        CREATE INDEX idx_dispute_audit_dispute_id ON dispute_audit_logs(dispute_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_dispute_audit_created_at') THEN
        CREATE INDEX idx_dispute_audit_created_at ON dispute_audit_logs(created_at DESC);
    END IF;
    
    -- disputes indexes (might already exist)
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_disputes_assigned_to') THEN
        CREATE INDEX idx_disputes_assigned_to ON disputes(assigned_to);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_disputes_priority') THEN
        CREATE INDEX idx_disputes_priority ON disputes(priority);
    END IF;
END $$;

-- ============================================
-- 7. Create triggers for auto-updating updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_order_preparations_updated_at') THEN
        CREATE TRIGGER update_order_preparations_updated_at 
            BEFORE UPDATE ON order_preparations
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_disputes_updated_at') THEN
        CREATE TRIGGER update_disputes_updated_at 
            BEFORE UPDATE ON disputes
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================
-- 8. Add comments for documentation
-- ============================================
COMMENT ON COLUMN deliveries.carrier_contact_json IS 'Contact info: {name, phone, email, company}';
COMMENT ON COLUMN deliveries.route_json IS 'Planned route: {waypoints: [{location, eta, status}]}';
COMMENT ON COLUMN deliveries.driver_info_json IS 'Driver details: {name, phone, license_no, vehicle_no}';
COMMENT ON COLUMN deliveries.delivery_location_json IS 'Actual delivery location: {lat, lng, address, timestamp}';
COMMENT ON COLUMN deliveries.delivery_proof_json IS 'Proof of delivery: {photos: [], signature, timestamp}';
COMMENT ON COLUMN deliveries.eir_data_json IS 'Equipment Interchange Receipt: {container_condition, damages: [], photos: []}';

-- ============================================
-- Migration completed successfully!
-- ============================================
