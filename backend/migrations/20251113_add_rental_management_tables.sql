-- =====================================================
-- MIGRATION: Add Rental Management Tables
-- Created: 2025-11-13
-- Purpose: Enable seller to manage rented containers, contracts, and maintenance
-- =====================================================

-- =====================================================
-- Table: rental_contracts
-- Purpose: Store rental agreements between seller and buyer
-- =====================================================

CREATE TABLE IF NOT EXISTS rental_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Listing & Container Info
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  container_id UUID REFERENCES listing_containers(id) ON DELETE SET NULL,
  
  -- Parties
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Order Reference (if created from order)
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Rental Terms
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rental_price DECIMAL(15,2) NOT NULL,
  rental_currency VARCHAR(3) NOT NULL DEFAULT 'VND',
  rental_unit VARCHAR(50) NOT NULL, -- DAY, WEEK, MONTH, QUARTER, YEAR
  
  -- Deposit
  deposit_amount DECIMAL(15,2),
  deposit_currency VARCHAR(3),
  deposit_paid BOOLEAN DEFAULT FALSE,
  deposit_paid_at TIMESTAMP,
  deposit_returned BOOLEAN DEFAULT FALSE,
  deposit_return_date DATE,
  deposit_return_amount DECIMAL(15,2), -- Có thể trừ phí hư hỏng
  
  -- Contract Status
  status VARCHAR(50) DEFAULT 'ACTIVE', 
    -- ACTIVE: Đang thuê
    -- COMPLETED: Đã hoàn thành và trả container
    -- TERMINATED: Kết thúc sớm
    -- OVERDUE: Quá hạn chưa trả
    -- CANCELLED: Hủy trước khi bắt đầu
  
  -- Payment Status
  payment_status VARCHAR(50) DEFAULT 'PENDING',
    -- PENDING: Chưa thanh toán
    -- PAID: Đã thanh toán đủ
    -- PARTIALLY_PAID: Thanh toán một phần
    -- OVERDUE: Quá hạn thanh toán
  total_amount_due DECIMAL(15,2), -- Tổng tiền phải trả
  total_paid DECIMAL(15,2) DEFAULT 0, -- Tổng đã thanh toán
  
  -- Late Fees
  late_fees DECIMAL(15,2) DEFAULT 0,
  days_overdue INT DEFAULT 0,
  late_fee_rate DECIMAL(10,2), -- Phí trễ mỗi ngày/tuần
  late_fee_unit VARCHAR(20), -- PER_DAY, PER_WEEK
  
  -- Contract Details
  contract_number VARCHAR(100) UNIQUE, -- Mã hợp đồng (auto-generated)
  contract_pdf_url TEXT, -- Link to PDF contract
  terms_and_conditions TEXT,
  special_notes TEXT,
  
  -- Location
  pickup_depot_id UUID REFERENCES depots(id) ON DELETE SET NULL,
  return_depot_id UUID REFERENCES depots(id) ON DELETE SET NULL,
  
  -- Auto Renewal
  auto_renewal BOOLEAN DEFAULT FALSE,
  renewal_count INT DEFAULT 0,
  last_renewed_at TIMESTAMP,
  next_renewal_date DATE,
  
  -- Inspection & Condition
  pickup_condition TEXT, -- Tình trạng khi nhận
  pickup_photos TEXT[], -- Array of photo URLs
  pickup_inspection_date TIMESTAMP,
  pickup_inspector_name VARCHAR(255),
  
  return_condition TEXT, -- Tình trạng khi trả
  return_photos TEXT[],
  return_inspection_date TIMESTAMP,
  return_inspector_name VARCHAR(255),
  
  damage_report TEXT, -- Báo cáo hư hỏng (nếu có)
  damage_cost DECIMAL(15,2), -- Chi phí sửa chữa
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Soft Delete
  deleted_at TIMESTAMP,
  
  -- Constraints
  CONSTRAINT check_rental_dates CHECK (end_date > start_date),
  CONSTRAINT check_rental_price_positive CHECK (rental_price > 0),
  CONSTRAINT check_deposit_positive CHECK (deposit_amount IS NULL OR deposit_amount >= 0),
  CONSTRAINT check_total_paid_non_negative CHECK (total_paid >= 0),
  CONSTRAINT check_late_fees_non_negative CHECK (late_fees >= 0),
  CONSTRAINT check_days_overdue_non_negative CHECK (days_overdue >= 0),
  CONSTRAINT check_renewal_count_non_negative CHECK (renewal_count >= 0),
  CONSTRAINT check_deposit_return_logic CHECK (
    NOT deposit_returned OR (deposit_returned AND deposit_return_date IS NOT NULL)
  )
);

-- Indexes for rental_contracts
CREATE INDEX idx_rental_contracts_listing ON rental_contracts(listing_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_rental_contracts_seller ON rental_contracts(seller_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_rental_contracts_buyer ON rental_contracts(buyer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_rental_contracts_container ON rental_contracts(container_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_rental_contracts_order ON rental_contracts(order_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_rental_contracts_status ON rental_contracts(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_rental_contracts_payment_status ON rental_contracts(payment_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_rental_contracts_end_date ON rental_contracts(end_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_rental_contracts_start_date ON rental_contracts(start_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_rental_contracts_contract_number ON rental_contracts(contract_number) WHERE deleted_at IS NULL;

-- Trigger to auto-generate contract number
CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.contract_number IS NULL THEN
    NEW.contract_number := 'RC-' || TO_CHAR(NEW.created_at, 'YYYYMMDD') || '-' || LPAD(nextval('rental_contract_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS rental_contract_seq START 1;

CREATE TRIGGER trg_generate_contract_number
  BEFORE INSERT ON rental_contracts
  FOR EACH ROW
  EXECUTE FUNCTION generate_contract_number();

-- Trigger to update updated_at
CREATE TRIGGER trg_rental_contracts_updated_at
  BEFORE UPDATE ON rental_contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE rental_contracts IS 'Stores rental agreements and contracts between sellers and buyers';
COMMENT ON COLUMN rental_contracts.status IS 'ACTIVE, COMPLETED, TERMINATED, OVERDUE, CANCELLED';
COMMENT ON COLUMN rental_contracts.payment_status IS 'PENDING, PAID, PARTIALLY_PAID, OVERDUE';
COMMENT ON COLUMN rental_contracts.contract_number IS 'Auto-generated unique contract identifier (RC-YYYYMMDD-XXXXXX)';

-- =====================================================
-- Table: container_maintenance_logs
-- Purpose: Track maintenance history for rented containers
-- =====================================================

CREATE TABLE IF NOT EXISTS container_maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  container_id UUID REFERENCES listing_containers(id) ON DELETE SET NULL,
  rental_contract_id UUID REFERENCES rental_contracts(id) ON DELETE SET NULL,
  
  -- Maintenance Type
  maintenance_type VARCHAR(50) NOT NULL,
    -- ROUTINE: Bảo trì định kỳ
    -- REPAIR: Sửa chữa
    -- INSPECTION: Kiểm tra
    -- CLEANING: Vệ sinh
    -- DAMAGE_REPAIR: Sửa hư hỏng từ người thuê
  
  -- Maintenance Details
  reason TEXT NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
  
  -- Schedule
  start_date DATE NOT NULL,
  estimated_completion_date DATE,
  actual_completion_date DATE,
  estimated_duration_days INT, -- Số ngày ước tính
  actual_duration_days INT, -- Số ngày thực tế
  
  -- Cost
  estimated_cost DECIMAL(15,2),
  actual_cost DECIMAL(15,2),
  cost_currency VARCHAR(3) DEFAULT 'VND',
  
  -- Status
  status VARCHAR(50) DEFAULT 'SCHEDULED',
    -- SCHEDULED: Đã lên lịch
    -- IN_PROGRESS: Đang thực hiện
    -- ON_HOLD: Tạm dừng
    -- COMPLETED: Hoàn thành
    -- CANCELLED: Hủy bỏ
  
  -- Photos/Documentation
  before_photos TEXT[], -- Array of URLs - ảnh trước bảo trì
  after_photos TEXT[], -- Array of URLs - ảnh sau bảo trì
  maintenance_report_url TEXT,
  invoice_url TEXT,
  
  -- Performed By
  performed_by VARCHAR(255), -- Company/person name
  technician_name VARCHAR(255),
  technician_contact VARCHAR(100),
  technician_notes TEXT,
  
  -- Parts & Materials Used
  parts_used JSONB, -- [{ name, quantity, cost }]
  materials_used JSONB,
  
  -- Quality Check
  quality_checked BOOLEAN DEFAULT FALSE,
  quality_check_date TIMESTAMP,
  quality_checker_name VARCHAR(255),
  quality_notes TEXT,
  
  -- Downtime Impact
  revenue_loss DECIMAL(15,2), -- Mất doanh thu do không cho thuê được
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Soft Delete
  deleted_at TIMESTAMP,
  
  -- Constraints
  CONSTRAINT check_maintenance_dates CHECK (
    estimated_completion_date IS NULL OR estimated_completion_date >= start_date
  ),
  CONSTRAINT check_actual_completion CHECK (
    actual_completion_date IS NULL OR actual_completion_date >= start_date
  ),
  CONSTRAINT check_estimated_cost_non_negative CHECK (
    estimated_cost IS NULL OR estimated_cost >= 0
  ),
  CONSTRAINT check_actual_cost_non_negative CHECK (
    actual_cost IS NULL OR actual_cost >= 0
  ),
  CONSTRAINT check_duration_positive CHECK (
    (estimated_duration_days IS NULL OR estimated_duration_days > 0) AND
    (actual_duration_days IS NULL OR actual_duration_days > 0)
  ),
  CONSTRAINT check_quality_check_logic CHECK (
    NOT quality_checked OR (quality_checked AND quality_check_date IS NOT NULL)
  )
);

-- Indexes for container_maintenance_logs
CREATE INDEX idx_maintenance_listing ON container_maintenance_logs(listing_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_maintenance_container ON container_maintenance_logs(container_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_maintenance_contract ON container_maintenance_logs(rental_contract_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_maintenance_status ON container_maintenance_logs(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_maintenance_type ON container_maintenance_logs(maintenance_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_maintenance_priority ON container_maintenance_logs(priority) WHERE deleted_at IS NULL;
CREATE INDEX idx_maintenance_start_date ON container_maintenance_logs(start_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_maintenance_completion_date ON container_maintenance_logs(estimated_completion_date) WHERE deleted_at IS NULL;

-- Trigger to update updated_at
CREATE TRIGGER trg_maintenance_logs_updated_at
  BEFORE UPDATE ON container_maintenance_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to calculate actual duration when completed
CREATE OR REPLACE FUNCTION calculate_maintenance_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'COMPLETED' AND NEW.actual_completion_date IS NOT NULL AND OLD.status != 'COMPLETED' THEN
    NEW.actual_duration_days := NEW.actual_completion_date - NEW.start_date;
    NEW.completed_at := CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_maintenance_duration
  BEFORE UPDATE ON container_maintenance_logs
  FOR EACH ROW
  EXECUTE FUNCTION calculate_maintenance_duration();

COMMENT ON TABLE container_maintenance_logs IS 'Tracks maintenance and repair history for containers';
COMMENT ON COLUMN container_maintenance_logs.maintenance_type IS 'ROUTINE, REPAIR, INSPECTION, CLEANING, DAMAGE_REPAIR';
COMMENT ON COLUMN container_maintenance_logs.status IS 'SCHEDULED, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED';
COMMENT ON COLUMN container_maintenance_logs.priority IS 'LOW, MEDIUM, HIGH, URGENT';

-- =====================================================
-- Table: rental_payments
-- Purpose: Track individual payment transactions for rental contracts
-- =====================================================

CREATE TABLE IF NOT EXISTS rental_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  rental_contract_id UUID NOT NULL REFERENCES rental_contracts(id) ON DELETE CASCADE,
  
  -- Payment Details
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'VND',
  payment_type VARCHAR(50) NOT NULL,
    -- RENTAL_FEE: Tiền thuê
    -- DEPOSIT: Tiền cọc
    -- LATE_FEE: Phí trễ
    -- DAMAGE_FEE: Phí hư hỏng
    -- REFUND: Hoàn tiền
  
  -- Payment Method
  payment_method VARCHAR(50),
    -- BANK_TRANSFER, CREDIT_CARD, VNPAY, MOMO, ZALOPAY, CASH
  
  -- Status
  status VARCHAR(50) DEFAULT 'PENDING',
    -- PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED
  
  -- Transaction Info
  transaction_id VARCHAR(255), -- Payment gateway transaction ID
  payment_reference VARCHAR(255), -- Reference number
  
  -- Dates
  due_date DATE,
  paid_at TIMESTAMP,
  
  -- Receipt
  receipt_url TEXT,
  invoice_number VARCHAR(100),
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT check_payment_amount_positive CHECK (amount > 0)
);

-- Indexes for rental_payments
CREATE INDEX idx_rental_payments_contract ON rental_payments(rental_contract_id);
CREATE INDEX idx_rental_payments_status ON rental_payments(status);
CREATE INDEX idx_rental_payments_type ON rental_payments(payment_type);
CREATE INDEX idx_rental_payments_method ON rental_payments(payment_method);
CREATE INDEX idx_rental_payments_due_date ON rental_payments(due_date);
CREATE INDEX idx_rental_payments_paid_at ON rental_payments(paid_at);

-- Trigger to update rental contract total_paid when payment is completed
CREATE OR REPLACE FUNCTION update_contract_total_paid()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'COMPLETED' AND (OLD.status IS NULL OR OLD.status != 'COMPLETED') THEN
    UPDATE rental_contracts
    SET 
      total_paid = total_paid + NEW.amount,
      payment_status = CASE
        WHEN total_paid + NEW.amount >= total_amount_due THEN 'PAID'
        WHEN total_paid + NEW.amount > 0 THEN 'PARTIALLY_PAID'
        ELSE 'PENDING'
      END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.rental_contract_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_contract_total_paid
  AFTER INSERT OR UPDATE ON rental_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_contract_total_paid();

COMMENT ON TABLE rental_payments IS 'Tracks individual payment transactions for rental contracts';

-- =====================================================
-- Grant permissions (adjust based on your DB user)
-- =====================================================

-- GRANT ALL PRIVILEGES ON rental_contracts TO your_db_user;
-- GRANT ALL PRIVILEGES ON container_maintenance_logs TO your_db_user;
-- GRANT ALL PRIVILEGES ON rental_payments TO your_db_user;
-- GRANT USAGE, SELECT ON SEQUENCE rental_contract_seq TO your_db_user;

-- =====================================================
-- End of Migration
-- =====================================================
