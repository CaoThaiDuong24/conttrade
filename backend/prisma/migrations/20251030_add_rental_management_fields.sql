-- Migration: Add rental management fields to listings table
-- Date: 2025-10-30
-- Description: Bổ sung các trường quản lý container cho thuê

-- ============ RENTAL QUANTITY MANAGEMENT ============
ALTER TABLE listings ADD COLUMN IF NOT EXISTS total_quantity INT DEFAULT 1;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS available_quantity INT DEFAULT 1;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS rented_quantity INT DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS reserved_quantity INT DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS maintenance_quantity INT DEFAULT 0;

-- ============ RENTAL DURATION CONSTRAINTS ============
ALTER TABLE listings ADD COLUMN IF NOT EXISTS min_rental_duration INT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS max_rental_duration INT;

-- ============ DEPOSIT & FEE POLICY ============
ALTER TABLE listings ADD COLUMN IF NOT EXISTS deposit_required BOOLEAN DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(15,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS deposit_currency VARCHAR(3);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS late_return_fee_amount DECIMAL(15,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS late_return_fee_unit VARCHAR(20);

-- ============ AVAILABILITY DATES ============
ALTER TABLE listings ADD COLUMN IF NOT EXISTS earliest_available_date TIMESTAMP;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS latest_return_date TIMESTAMP;

-- ============ RENEWAL POLICY ============
ALTER TABLE listings ADD COLUMN IF NOT EXISTS auto_renewal_enabled BOOLEAN DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS renewal_notice_days INT DEFAULT 7;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS renewal_price_adjustment DECIMAL(5,2) DEFAULT 0.00;

-- ============ RENTAL TRACKING ============
ALTER TABLE listings ADD COLUMN IF NOT EXISTS last_rented_at TIMESTAMP;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS total_rental_count INT DEFAULT 0;

-- ============ COMMENTS ============
COMMENT ON COLUMN listings.total_quantity IS 'Tổng số container có thể cho thuê';
COMMENT ON COLUMN listings.available_quantity IS 'Số lượng container hiện có sẵn';
COMMENT ON COLUMN listings.rented_quantity IS 'Số lượng container đang được thuê';
COMMENT ON COLUMN listings.reserved_quantity IS 'Số lượng container đã được đặt trước';
COMMENT ON COLUMN listings.maintenance_quantity IS 'Số lượng container đang bảo trì';
COMMENT ON COLUMN listings.min_rental_duration IS 'Thời gian thuê tối thiểu (số đơn vị theo rental_unit)';
COMMENT ON COLUMN listings.max_rental_duration IS 'Thời gian thuê tối đa (số đơn vị theo rental_unit)';
COMMENT ON COLUMN listings.deposit_required IS 'Có yêu cầu đặt cọc hay không';
COMMENT ON COLUMN listings.deposit_amount IS 'Số tiền đặt cọc';
COMMENT ON COLUMN listings.deposit_currency IS 'Loại tiền tệ đặt cọc (VND, USD, etc)';
COMMENT ON COLUMN listings.late_return_fee_amount IS 'Phí phạt khi trả muộn';
COMMENT ON COLUMN listings.late_return_fee_unit IS 'Đơn vị tính phí: PER_DAY, PER_WEEK, PERCENTAGE';
COMMENT ON COLUMN listings.earliest_available_date IS 'Ngày sớm nhất có thể giao container';
COMMENT ON COLUMN listings.latest_return_date IS 'Ngày muộn nhất phải trả container';
COMMENT ON COLUMN listings.auto_renewal_enabled IS 'Cho phép gia hạn hợp đồng tự động';
COMMENT ON COLUMN listings.renewal_notice_days IS 'Số ngày thông báo trước khi hết hạn';
COMMENT ON COLUMN listings.renewal_price_adjustment IS 'Phần trăm điều chỉnh giá khi gia hạn';
COMMENT ON COLUMN listings.last_rented_at IS 'Thời điểm thuê gần nhất';
COMMENT ON COLUMN listings.total_rental_count IS 'Tổng số lần container được thuê';

-- ============ INDEXES FOR PERFORMANCE ============
CREATE INDEX IF NOT EXISTS idx_listings_available_quantity ON listings(available_quantity) WHERE deal_type IN ('RENTAL', 'LEASE');
CREATE INDEX IF NOT EXISTS idx_listings_earliest_available ON listings(earliest_available_date) WHERE deal_type IN ('RENTAL', 'LEASE');
CREATE INDEX IF NOT EXISTS idx_listings_rental_tracking ON listings(deal_type, total_rental_count) WHERE deal_type IN ('RENTAL', 'LEASE');

-- ============ VALIDATION CONSTRAINTS ============
-- Ensure quantity fields are non-negative
ALTER TABLE listings ADD CONSTRAINT check_total_quantity_positive 
  CHECK (total_quantity >= 1);

ALTER TABLE listings ADD CONSTRAINT check_available_quantity_non_negative 
  CHECK (available_quantity >= 0);

ALTER TABLE listings ADD CONSTRAINT check_rented_quantity_non_negative 
  CHECK (rented_quantity >= 0);

ALTER TABLE listings ADD CONSTRAINT check_reserved_quantity_non_negative 
  CHECK (reserved_quantity >= 0);

ALTER TABLE listings ADD CONSTRAINT check_maintenance_quantity_non_negative 
  CHECK (maintenance_quantity >= 0);

-- Ensure available + rented + reserved + maintenance = total
ALTER TABLE listings ADD CONSTRAINT check_quantity_balance 
  CHECK (available_quantity + rented_quantity + reserved_quantity + maintenance_quantity = total_quantity);

-- Duration constraints
ALTER TABLE listings ADD CONSTRAINT check_rental_duration_logical 
  CHECK (
    (min_rental_duration IS NULL OR min_rental_duration > 0) AND
    (max_rental_duration IS NULL OR max_rental_duration > 0) AND
    (min_rental_duration IS NULL OR max_rental_duration IS NULL OR min_rental_duration <= max_rental_duration)
  );

-- Deposit constraints
ALTER TABLE listings ADD CONSTRAINT check_deposit_amount_positive 
  CHECK (deposit_amount IS NULL OR deposit_amount > 0);

ALTER TABLE listings ADD CONSTRAINT check_deposit_currency_when_required 
  CHECK (
    NOT deposit_required OR 
    (deposit_amount IS NOT NULL AND deposit_amount > 0 AND deposit_currency IS NOT NULL)
  );

-- Late fee constraints
ALTER TABLE listings ADD CONSTRAINT check_late_fee_amount_positive 
  CHECK (late_return_fee_amount IS NULL OR late_return_fee_amount > 0);

-- Date constraints
ALTER TABLE listings ADD CONSTRAINT check_return_date_after_available 
  CHECK (
    earliest_available_date IS NULL OR 
    latest_return_date IS NULL OR 
    earliest_available_date < latest_return_date
  );

-- Renewal constraints
ALTER TABLE listings ADD CONSTRAINT check_renewal_notice_days_positive 
  CHECK (renewal_notice_days > 0);

ALTER TABLE listings ADD CONSTRAINT check_total_rental_count_non_negative 
  CHECK (total_rental_count >= 0);

COMMENT ON CONSTRAINT check_quantity_balance ON listings IS 'Đảm bảo tổng số container được phân bổ đúng: available + rented + reserved + maintenance = total';
