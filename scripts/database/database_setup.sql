-- ========================================
-- i-ContExchange Database Setup Script
-- PostgreSQL Database Creation & Initialization
-- Based on Prisma Schema & Documentation
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- 1. ENUMS
-- ========================================

-- Listing status
DO $$ BEGIN
    CREATE TYPE listing_status AS ENUM (
        'draft', 'pending_review', 'active', 'paused', 
        'sold', 'rented', 'archived', 'rejected'
    );
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- Order status
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'created', 'awaiting_funds', 'escrow_funded', 'preparing',
        'delivering', 'delivered', 'completed', 'cancelled', 'disputed'
    );
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- Payment status
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'initiated', 'escrow_funded', 'released', 'refunded', 'failed'
    );
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- Delivery status
DO $$ BEGIN
    CREATE TYPE delivery_status AS ENUM (
        'requested', 'booked', 'in_transit', 'delivered', 'failed'
    );
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- Dispute status
DO $$ BEGIN
    CREATE TYPE dispute_status AS ENUM (
        'open', 'investigating', 'resolved_refund', 'resolved_payout', 
        'partial', 'closed'
    );
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- Inspection status
DO $$ BEGIN
    CREATE TYPE inspection_status AS ENUM (
        'requested', 'scheduled', 'in_progress', 'completed'
    );
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- Repair status
DO $$ BEGIN
    CREATE TYPE repair_status AS ENUM (
        'quoted', 'approved', 'in_progress', 'done', 'accepted', 'rework'
    );
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- Config status
DO $$ BEGIN
    CREATE TYPE config_status AS ENUM (
        'draft', 'published', 'archived'
    );
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- Notification channels
DO $$ BEGIN
    CREATE TYPE notify_channel AS ENUM (
        'email', 'sms', 'push', 'inapp'
    );
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- Calculation types
DO $$ BEGIN
    CREATE TYPE calc_type AS ENUM (
        'flat', 'percent', 'tiered'
    );
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- Payment method types
DO $$ BEGIN
    CREATE TYPE method_type AS ENUM (
        'bank', 'card', 'ewallet'
    );
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- ========================================
-- 2. CORE TABLES
-- ========================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    kyc_status TEXT NOT NULL DEFAULT 'unverified',
    display_name TEXT,
    default_locale TEXT NOT NULL DEFAULT 'vi',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Organizations table
CREATE TABLE IF NOT EXISTS orgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tax_code TEXT,
    kyb_status TEXT DEFAULT 'unverified',
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organization users table
CREATE TABLE IF NOT EXISTS org_users (
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_in_org TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (org_id, user_id)
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
);

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- Role permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    scope TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

-- ========================================
-- 3. DEPOT & LOCATION TABLES
-- ========================================

-- Depots table
CREATE TABLE IF NOT EXISTS depots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    address TEXT,
    province TEXT,
    capacity_teu INTEGER,
    contact JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Depot users table
CREATE TABLE IF NOT EXISTS depot_users (
    depot_id UUID NOT NULL REFERENCES depots(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_in_depot TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (depot_id, user_id)
);

-- ========================================
-- 4. CONTAINER & LISTING TABLES
-- ========================================

-- Containers table
CREATE TABLE IF NOT EXISTS containers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    iso_code TEXT,
    size_ft INTEGER CHECK (size_ft IN (10, 20, 40, 45)),
    type TEXT,
    serial_no TEXT UNIQUE,
    owner_org_id UUID REFERENCES orgs(id) ON DELETE SET NULL,
    current_depot_id UUID REFERENCES depots(id) ON DELETE SET NULL,
    condition TEXT,
    quality_standard TEXT,
    csc_plate_no TEXT,
    manufactured_year INTEGER CHECK (manufactured_year BETWEEN 1970 AND EXTRACT(YEAR FROM NOW())::INT),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    container_id UUID REFERENCES containers(id) ON DELETE SET NULL,
    seller_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    org_id UUID REFERENCES orgs(id) ON DELETE SET NULL,
    deal_type TEXT NOT NULL,
    price_currency TEXT NOT NULL DEFAULT 'VND',
    price_amount DECIMAL(18,2) NOT NULL CHECK (price_amount >= 0),
    rental_unit TEXT,
    location_depot_id UUID REFERENCES depots(id) ON DELETE SET NULL,
    status listing_status NOT NULL DEFAULT 'draft',
    title TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Listing media table
CREATE TABLE IF NOT EXISTS listing_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Listing facets table
CREATE TABLE IF NOT EXISTS listing_facets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- 5. INSPECTION & REPAIR TABLES
-- ========================================

-- Inspections table
CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    container_id UUID REFERENCES containers(id) ON DELETE SET NULL,
    depot_id UUID NOT NULL REFERENCES depots(id) ON DELETE RESTRICT,
    requested_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status inspection_status NOT NULL DEFAULT 'requested',
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    summary TEXT,
    standard TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inspection items table
CREATE TABLE IF NOT EXISTS inspection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    severity TEXT,
    note TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Repairs table
CREATE TABLE IF NOT EXISTS repairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES inspections(id) ON DELETE SET NULL,
    depot_id UUID NOT NULL REFERENCES depots(id) ON DELETE RESTRICT,
    quote_amount DECIMAL(18,2),
    status repair_status NOT NULL DEFAULT 'quoted',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Repair items table
CREATE TABLE IF NOT EXISTS repair_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repair_id UUID NOT NULL REFERENCES repairs(id) ON DELETE CASCADE,
    item_code TEXT NOT NULL,
    qty DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(18,2) NOT NULL,
    note TEXT,
    before_photo TEXT,
    after_photo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- 6. RFQ/QUOTE & Q&A TABLES
-- ========================================

-- RFQs table
CREATE TABLE IF NOT EXISTS rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    purpose TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    need_by TIMESTAMPTZ,
    services_json JSONB,
    status TEXT NOT NULL DEFAULT 'submitted',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expired_at TIMESTAMPTZ
);

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    price_subtotal DECIMAL(18,2) NOT NULL,
    fees_json JSONB,
    total DECIMAL(18,2) NOT NULL,
    currency TEXT NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quote items table
CREATE TABLE IF NOT EXISTS quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL,
    ref_id TEXT,
    description TEXT NOT NULL,
    qty DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(18,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- QA Questions table
CREATE TABLE IF NOT EXISTS qa_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    question TEXT NOT NULL,
    moderated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- QA Answers table
CREATE TABLE IF NOT EXISTS qa_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES qa_questions(id) ON DELETE CASCADE,
    responder_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    answer TEXT NOT NULL,
    moderated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- 7. ORDER, PAYMENT & DELIVERY TABLES
-- ========================================

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    org_ids JSONB,
    status order_status NOT NULL DEFAULT 'created',
    subtotal DECIMAL(18,2) NOT NULL,
    tax DECIMAL(18,2),
    fees DECIMAL(18,2),
    total DECIMAL(18,2) NOT NULL,
    currency TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL,
    ref_id TEXT,
    description TEXT NOT NULL,
    qty DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(18,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    provider TEXT NOT NULL,
    method TEXT NOT NULL,
    status payment_status NOT NULL DEFAULT 'initiated',
    escrow_account_ref TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    pickup_depot_id UUID REFERENCES depots(id) ON DELETE SET NULL,
    dropoff_address TEXT,
    schedule_at TIMESTAMPTZ,
    carrier_id TEXT,
    status delivery_status NOT NULL DEFAULT 'requested',
    gps_tracking_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Delivery events table
CREATE TABLE IF NOT EXISTS delivery_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    doc_type TEXT NOT NULL,
    number TEXT,
    file_url TEXT,
    issued_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- 8. REVIEW & DISPUTE TABLES
-- ========================================

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disputes table
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    opened_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status dispute_status NOT NULL DEFAULT 'open',
    reason TEXT,
    resolution TEXT,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dispute evidence table
CREATE TABLE IF NOT EXISTS dispute_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    file_url TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- 9. SUBSCRIPTION & CONFIGURATION TABLES
-- ========================================

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price DECIMAL(18,2) NOT NULL,
    cycle TEXT NOT NULL,
    features JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    org_id UUID REFERENCES orgs(id) ON DELETE SET NULL,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'active',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    renewed_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Settings table (legacy)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- 10. ADMIN CONFIGURATION TABLES
-- ========================================

-- Config namespaces table
CREATE TABLE IF NOT EXISTS config_namespaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Config entries table
CREATE TABLE IF NOT EXISTS config_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace_id UUID NOT NULL REFERENCES config_namespaces(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    status config_status NOT NULL DEFAULT 'draft',
    value_json JSONB NOT NULL,
    checksum TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    published_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    UNIQUE(namespace_id, key, version)
);

-- Feature flags table
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    rollout_json JSONB,
    effective_from TIMESTAMPTZ,
    effective_to TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1,
    status config_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tax rates table
CREATE TABLE IF NOT EXISTS tax_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region TEXT NOT NULL,
    tax_code TEXT NOT NULL,
    rate DECIMAL(6,4) NOT NULL CHECK (rate >= 0),
    effective_from DATE NOT NULL,
    effective_to DATE,
    status config_status NOT NULL DEFAULT 'published',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fee schedules table
CREATE TABLE IF NOT EXISTS fee_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fee_code TEXT NOT NULL,
    name TEXT,
    calc_type calc_type NOT NULL,
    currency TEXT NOT NULL DEFAULT 'VND',
    amount DECIMAL(18,2),
    percent DECIMAL(6,4),
    tiers_json JSONB,
    scope TEXT,
    effective_from DATE NOT NULL,
    effective_to DATE,
    status config_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Commission rules table
CREATE TABLE IF NOT EXISTS commission_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_code TEXT NOT NULL,
    name TEXT,
    basis TEXT NOT NULL DEFAULT 'subtotal',
    percent DECIMAL(6,4),
    min_amount DECIMAL(18,2),
    max_amount DECIMAL(18,2),
    conditions_json JSONB,
    effective_from DATE NOT NULL,
    effective_to DATE,
    status config_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Marketplace policies table
CREATE TABLE IF NOT EXISTS marketplace_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_code TEXT UNIQUE NOT NULL,
    name TEXT,
    content_md TEXT,
    effective_from TIMESTAMPTZ,
    effective_to TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1,
    status config_status NOT NULL DEFAULT 'published',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification templates table
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel notify_channel NOT NULL,
    template_code TEXT NOT NULL,
    locale TEXT NOT NULL DEFAULT 'vi',
    subject TEXT,
    body_md TEXT,
    variables_json JSONB,
    version INTEGER NOT NULL DEFAULT 1,
    status config_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(channel, template_code, locale, version)
);

-- Business hours table
CREATE TABLE IF NOT EXISTS business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES orgs(id) ON DELETE SET NULL,
    timezone TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    schedule_json JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Depot calendars table
CREATE TABLE IF NOT EXISTS depot_calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    depot_id UUID NOT NULL REFERENCES depots(id) ON DELETE CASCADE,
    closed_dates_json JSONB,
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    provider TEXT,
    method_type method_type NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    config_json JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partners table
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    contact_json JSONB,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- 11. STOCK MOVEMENT & AUDIT TABLES
-- ========================================

-- Depot stock movements table
CREATE TABLE IF NOT EXISTS depot_stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    depot_id UUID NOT NULL REFERENCES depots(id) ON DELETE RESTRICT,
    container_id UUID NOT NULL REFERENCES containers(id) ON DELETE RESTRICT,
    owner_org_id UUID REFERENCES orgs(id) ON DELETE SET NULL,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'TRANSFER')),
    direction SMALLINT NOT NULL CHECK (direction IN (1, -1)),
    ref_doc_type TEXT NOT NULL,
    ref_doc_id UUID,
    reason TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id UUID,
    meta JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- I18n translations table
CREATE TABLE IF NOT EXISTS i18n_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace TEXT NOT NULL,
    key TEXT NOT NULL,
    locale TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(namespace, key, locale)
);

-- ========================================
-- 12. INDEXES FOR PERFORMANCE
-- ========================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);

-- Listing indexes
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_location_depot ON listings(location_depot_id);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_user_id);
CREATE INDEX IF NOT EXISTS idx_listings_deal_type ON listings(deal_type);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);

-- Full-text search index for listings
CREATE INDEX IF NOT EXISTS idx_listings_search ON listings 
USING GIN (to_tsvector('simple', COALESCE(title, '') || ' ' || COALESCE(description, '')));

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- RFQ indexes
CREATE INDEX IF NOT EXISTS idx_rfqs_buyer ON rfqs(buyer_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_listing ON rfqs(listing_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);

-- Quote indexes
CREATE INDEX IF NOT EXISTS idx_quotes_rfq ON quotes(rfq_id);
CREATE INDEX IF NOT EXISTS idx_quotes_seller ON quotes(seller_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);

-- Inspection indexes
CREATE INDEX IF NOT EXISTS idx_inspections_depot ON inspections(depot_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_requested_by ON inspections(requested_by);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Delivery indexes
CREATE INDEX IF NOT EXISTS idx_deliveries_order ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);

-- Stock movement indexes
CREATE INDEX IF NOT EXISTS idx_dsm_depot_time ON depot_stock_movements(depot_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_dsm_container ON depot_stock_movements(container_id);
CREATE INDEX IF NOT EXISTS idx_dsm_owner ON depot_stock_movements(owner_org_id);
CREATE INDEX IF NOT EXISTS idx_dsm_type ON depot_stock_movements(movement_type, direction);

-- Config entry indexes
CREATE INDEX IF NOT EXISTS idx_config_entries_lookup ON config_entries(namespace_id, key, status);
CREATE INDEX IF NOT EXISTS idx_config_entries_version ON config_entries(version DESC);

-- Tax rate indexes
CREATE INDEX IF NOT EXISTS idx_tax_rates_region_code ON tax_rates(region, tax_code, effective_from);

-- Fee schedule indexes
CREATE INDEX IF NOT EXISTS idx_fee_schedules_code ON fee_schedules(fee_code, status, effective_from);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_table, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- I18n indexes
CREATE INDEX IF NOT EXISTS idx_i18n_namespace_key ON i18n_translations(namespace, key);
CREATE INDEX IF NOT EXISTS idx_i18n_locale ON i18n_translations(locale);

-- ========================================
-- 13. ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on sensitive tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE depot_stock_movements ENABLE ROW LEVEL SECURITY;

-- Orders RLS policy
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'order_participants_policy' AND tablename = 'orders') THEN
        CREATE POLICY order_participants_policy ON orders
            FOR ALL USING (
                buyer_id = current_setting('app.user_id', true)::uuid OR
                seller_id = current_setting('app.user_id', true)::uuid
            );
    END IF;
END $$;

-- RFQ RLS policy
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rfq_participants_policy' AND tablename = 'rfqs') THEN
        CREATE POLICY rfq_participants_policy ON rfqs
            FOR ALL USING (
                buyer_id = current_setting('app.user_id', true)::uuid OR
                listing_id IN (
                    SELECT id FROM listings 
                    WHERE seller_user_id = current_setting('app.user_id', true)::uuid
                )
            );
    END IF;
END $$;

-- Quote RLS policy
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'quote_participants_policy' AND tablename = 'quotes') THEN
        CREATE POLICY quote_participants_policy ON quotes
            FOR ALL USING (
                seller_id = current_setting('app.user_id', true)::uuid OR
                rfq_id IN (
                    SELECT rfq_id FROM rfqs 
                    WHERE buyer_id = current_setting('app.user_id', true)::uuid
                )
            );
    END IF;
END $$;

-- Dispute RLS policy
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dispute_participants_policy' AND tablename = 'disputes') THEN
        CREATE POLICY dispute_participants_policy ON disputes
            FOR ALL USING (
                opened_by = current_setting('app.user_id', true)::uuid OR
                order_id IN (
                    SELECT id FROM orders 
                    WHERE buyer_id = current_setting('app.user_id', true)::uuid OR
                          seller_id = current_setting('app.user_id', true)::uuid
                )
            );
    END IF;
END $$;

-- ========================================
-- 14. TRIGGERS FOR UPDATED_AT
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orgs_updated_at ON orgs;
CREATE TRIGGER update_orgs_updated_at BEFORE UPDATE ON orgs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deliveries_updated_at ON deliveries;
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_disputes_updated_at ON disputes;
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_repairs_updated_at ON repairs;
CREATE TRIGGER update_repairs_updated_at BEFORE UPDATE ON repairs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 15. INITIAL DATA SEEDING
-- ========================================

-- Insert default roles
INSERT INTO roles (id, code, name) VALUES 
    (gen_random_uuid(), 'admin', 'Administrator'),
    (gen_random_uuid(), 'user', 'User'),
    (gen_random_uuid(), 'seller', 'Seller'),
    (gen_random_uuid(), 'buyer', 'Buyer')
ON CONFLICT (code) DO NOTHING;

-- Insert basic permissions
INSERT INTO permissions (id, code, name) VALUES 
    (gen_random_uuid(), 'PM-070', 'ADMIN_REVIEW_LISTING'),
    (gen_random_uuid(), 'PM-071', 'ADMIN_MANAGE_USERS'),
    (gen_random_uuid(), 'PM-072', 'ADMIN_VIEW_DASHBOARD'),
    (gen_random_uuid(), 'PM-073', 'ADMIN_CONFIG_PRICING'),
    (gen_random_uuid(), 'PM-001', 'VIEW_PUBLIC_LISTINGS'),
    (gen_random_uuid(), 'PM-002', 'SEARCH_LISTINGS'),
    (gen_random_uuid(), 'PM-010', 'CREATE_LISTING'),
    (gen_random_uuid(), 'PM-011', 'EDIT_LISTING'),
    (gen_random_uuid(), 'PM-012', 'PUBLISH_LISTING')
ON CONFLICT (code) DO NOTHING;

-- Insert default config namespace
INSERT INTO config_namespaces (id, code, name, description) VALUES 
    (gen_random_uuid(), 'pricing', 'Pricing Configuration', 'Container pricing rules and bands'),
    (gen_random_uuid(), 'system', 'System Configuration', 'General system settings'),
    (gen_random_uuid(), 'notifications', 'Notification Templates', 'Email and SMS templates')
ON CONFLICT (code) DO NOTHING;

-- Insert default payment methods
INSERT INTO payment_methods (id, code, provider, method_type, enabled) VALUES 
    (gen_random_uuid(), 'bank_transfer', 'Vietcombank', 'bank', true),
    (gen_random_uuid(), 'credit_card', 'VNPay', 'card', true),
    (gen_random_uuid(), 'momo', 'MoMo', 'ewallet', true)
ON CONFLICT (code) DO NOTHING;

-- Insert default partners
INSERT INTO partners (id, type, name, contact_json, status) VALUES 
    (gen_random_uuid(), 'carrier', 'Vietnam Airlines Cargo', '{"phone": "1900-1800", "email": "cargo@vietnamairlines.com"}', 'active'),
    (gen_random_uuid(), 'insurer', 'Bao Viet Insurance', '{"phone": "1900-9666", "email": "info@baoviet.com.vn"}', 'active'),
    (gen_random_uuid(), 'psp', 'VNPay', '{"phone": "1900-636-545", "email": "support@vnpay.vn"}', 'active')
ON CONFLICT DO NOTHING;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'i-ContExchange Database Setup Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'Schema: %', current_schema();
    RAISE NOTICE 'Total Tables Created: ~50+ tables';
    RAISE NOTICE 'Extensions Enabled: uuid-ossp, pgcrypto';
    RAISE NOTICE 'RLS Enabled: orders, rfqs, quotes, payments, disputes, depot_stock_movements';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Run: npm run prisma:generate';
    RAISE NOTICE '2. Run: npm run seed';
    RAISE NOTICE '3. Start your application';
    RAISE NOTICE '========================================';
END $$;
