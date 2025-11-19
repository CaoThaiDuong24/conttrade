# 📊 BÁO CÁO PHÂN TÍCH PHƯƠNG THỨC CHO THUÊ CONTAINER

**Ngày tạo:** 13/11/2025  
**Người phân tích:** GitHub Copilot  
**Trạng thái:** Hoàn chỉnh ✅

---

## 📋 MỤC LỤC

1. [Tổng Quan](#tổng-quan)
2. [Các Tính Năng Đã Triển Khai](#các-tính-năng-đã-triển-khai)
3. [Tính Năng Cần Bổ Sung](#tính-năng-cần-bổ-sung)
4. [Phân Tích Chi Tiết](#phân-tích-chi-tiết)
5. [Phân Tích Buyer Side - Người Thuê Container](#phân-tích-buyer-side---người-thuê-container) ⭐ MỚI
6. [Kế Hoạch Triển Khai](#kế-hoạch-triển-khai)

---

## 🎯 TỔNG QUAN

### Phương Thức Thanh Toán Hỗ Trợ

Hệ thống hiện hỗ trợ **3 loại giao dịch** (Deal Type):

| Mã API | Tên Hiển Thị | Trạng Thái | Ghi Chú |
|--------|--------------|------------|---------|
| `SALE` | Bán | ✅ Hoàn chỉnh | Bán đứt container |
| `RENTAL` | Thuê ngắn hạn | ✅ Cơ bản hoàn chỉnh | Thuê theo ngày/tuần/tháng |
| `LEASE` | Thuê dài hạn | ✅ Cơ bản hoàn chỉnh | Thuê theo quý/năm |
| `SWAP` | Trao đổi | ⏸️ Chưa triển khai | Dự kiến tương lai |

### Rental vs Lease

```
RENTAL (Thuê ngắn hạn)
├─ Đơn vị: Ngày, Tuần, Tháng
├─ Thời gian: < 6 tháng thường
├─ Use case: Thuê tạm thời, project ngắn hạn
└─ Giá: Cao hơn (theo ngày/tuần)

LEASE (Thuê dài hạn)
├─ Đơn vị: Tháng, Quý, Năm
├─ Thời gian: 6 tháng - nhiều năm
├─ Use case: Thuê lâu dài, doanh nghiệp
└─ Giá: Thấp hơn (ưu đãi dài hạn)
```

---

## ✅ CÁC TÍNH NĂNG ĐÃ TRIỂN KHAI

### 1. 🎨 Frontend - Tạo Listing Cho Thuê

#### a) Form Đăng Tin (`/sell/new/page.tsx`)

**✅ Đã có:**

```tsx
// Dynamic Steps - Tự động thêm bước "Quản lý" khi chọn RENTAL/LEASE
const steps = React.useMemo(() => {
  const baseSteps = [
    { key: 'specs', label: 'Thông số' },
    { key: 'media', label: 'Hình ảnh' },
    { key: 'pricing', label: 'Giá cả' },
  ];

  // ✅ Bước "Quản lý" chỉ hiện khi chọn RENTAL/LEASE
  if (isRentalType(dealType)) {
    baseSteps.push({ key: 'rental', label: 'Quản lý' });
  }

  baseSteps.push(
    { key: 'depot', label: 'Vị trí' },
    { key: 'review', label: 'Xem lại' }
  );

  return baseSteps;
}, [dealType]);
```

**Các trường thông tin cho thuê:**

| Trường | Loại | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `dealType` | Select | ✅ | SALE / RENTAL / LEASE |
| `priceAmount` | Number | ✅ | Giá thuê (VD: 100) |
| `priceCurrency` | Select | ✅ | VND / USD / EUR |
| `rentalUnit` | Select | ✅ (nếu RENTAL) | DAY / WEEK / MONTH / QUARTER / YEAR |
| `totalQuantity` | Number | ✅ | Tổng số container cho thuê |
| `availableQuantity` | Number | ✅ | Số container có sẵn |
| `maintenanceQuantity` | Number | ✅ | Số container đang bảo trì |
| `rentedQuantity` | Number | Auto (0) | Số đã cho thuê (luôn 0 khi tạo mới) |
| `minRentalDuration` | Number | ⚪ | Thời gian thuê tối thiểu (VD: 3 tháng) |
| `maxRentalDuration` | Number | ⚪ | Thời gian thuê tối đa (VD: 12 tháng) |
| `depositRequired` | Boolean | ⚪ | Yêu cầu đặt cọc? |
| `depositAmount` | Number | ⚪ | Số tiền cọc |
| `depositCurrency` | String | ⚪ | Đơn vị tiền cọc |
| `lateReturnFeeAmount` | Number | ⚪ | Phí trả muộn |
| `lateReturnFeeUnit` | Select | ⚪ | PER_DAY / PER_WEEK |
| `earliestAvailableDate` | Date | ⚪ | Ngày sớm nhất có thể thuê |
| `latestReturnDate` | Date | ⚪ | Ngày muộn nhất phải trả |
| `autoRenewalEnabled` | Boolean | ⚪ | Cho phép gia hạn tự động? |
| `renewalNoticeDays` | Number | ⚪ | Thông báo trước X ngày |
| `renewalPriceAdjustment` | Number | ⚪ | Điều chỉnh giá khi gia hạn (%) |

**Validation Logic:**

```tsx
case 'rental':
  // Only validate for RENTAL/LEASE types
  if (!isRentalType(dealType)) return true;
  
  // ✅ Quantity validation
  if (!totalQuantity || totalQuantity < 1) return false;
  if (availableQuantity < 0) return false;
  if (maintenanceQuantity < 0) return false;
  
  // ✅ Quantity Balance Check
  const totalAccounted = availableQuantity + rentedQuantity + maintenanceQuantity;
  if (totalAccounted !== totalQuantity) return false;
  
  // ✅ Deposit validation (chỉ khi bật)
  if (depositRequired) {
    if (!depositAmount || depositAmount <= 0) return false;
    if (!depositCurrency) return false;
  }
  
  return true;
```

#### b) UI/UX Cho Thuê

**✅ Có sẵn:**

1. **Step "Quản lý Container Cho Thuê"** (rental step)
   - Card hiển thị phân bổ số lượng
   - Input totalQuantity, availableQuantity, maintenanceQuantity
   - Real-time validation balance
   - Warning messages khi balance sai

2. **Thời Gian Thuê**
   - Min/Max rental duration
   - Date pickers cho earliest/latest dates

3. **Chính Sách Đặt Cọc**
   - Toggle depositRequired
   - Input depositAmount + currency
   - Late return fee settings

4. **Gia Hạn Tự Động**
   - Toggle autoRenewalEnabled
   - Renewal notice days
   - Price adjustment (%)

5. **Review Page**
   - Hiển thị đầy đủ thông tin cho thuê
   - Summary card với pricing breakdown

**✅ Tour Guide:**

```tsx
// File: frontend/lib/tour/driver-config.ts
{
  element: '#rental-management-section',
  popover: {
    title: '📦 Quản Lý Container Cho Thuê',
    description: 'Thiết lập số lượng container, chính sách cọc, và điều khoản thuê...'
  }
},
{
  element: '#rental-duration-section',
  popover: {
    title: '⏰ Thời Gian Thuê',
    description: 'Đặt thời gian thuê tối thiểu và tối đa...'
  }
},
{
  element: '#deposit-policy-section',
  popover: {
    title: '💰 Chính Sách Đặt Cọc',
    description: 'Bật tùy chọn yêu cầu đặt cọc và thiết lập số tiền...'
  }
}
```

---

### 2. 🔧 Backend - API Xử Lý Cho Thuê

#### a) Route `/api/v1/listings` (POST)

**File:** `backend/src/routes/listings.ts`

**✅ Validation Logic:**

```typescript
// ✅ Deal Type Mapping
const dealType = rawDealType === 'LEASE' ? 'RENTAL' : rawDealType;
// Prisma enum chỉ có SALE | RENTAL
// Frontend dùng LEASE cho UX, backend map về RENTAL

// ✅ Quantity Validations
if (isNaN(total) || total < 1) {
  return reply.status(400).send({
    success: false,
    message: 'Total quantity must be at least 1'
  });
}

if (available + maintenance + rented + reserved !== total) {
  return reply.status(400).send({
    success: false,
    message: `Quantity mismatch: ${available} + ${maintenance} + ${rented} + ${reserved} != ${total}`
  });
}

// ✅ Rental-specific Validations
if (dealType === 'RENTAL') {
  // Duration constraints
  if (minRentalDuration && minRentalDuration < 1) {
    return reply.status(400).send({
      message: 'Minimum rental duration must be at least 1'
    });
  }

  if (minRentalDuration && maxRentalDuration && minRentalDuration > maxRentalDuration) {
    return reply.status(400).send({
      message: 'Min duration cannot exceed max duration'
    });
  }

  // Deposit validation
  if (depositRequired && (!depositAmount || depositAmount <= 0)) {
    return reply.status(400).send({
      message: 'Deposit amount is required when depositRequired is true'
    });
  }
}
```

**✅ Database Insert:**

```typescript
const newListing = await prisma.listings.create({
  data: {
    deal_type: dealType as any, // SALE | RENTAL
    price_amount: new Prisma.Decimal(priceAmount),
    price_currency: priceCurrency,
    rental_unit: rentalUnit || null,
    
    // ✅ Quantity fields
    total_quantity: total,
    available_quantity: available,
    rented_quantity: rented, // 0 for new listings
    reserved_quantity: reserved, // 0 for new listings
    maintenance_quantity: maintenance,
    
    // ✅ Rental management
    min_rental_duration: minRentalDuration || null,
    max_rental_duration: maxRentalDuration || null,
    deposit_required: depositRequired || false,
    deposit_amount: depositAmount ? new Prisma.Decimal(depositAmount) : null,
    deposit_currency: depositCurrency || null,
    late_return_fee_amount: lateReturnFeeAmount ? new Prisma.Decimal(lateReturnFeeAmount) : null,
    late_return_fee_unit: lateReturnFeeUnit || null,
    earliest_available_date: earliestAvailableDate ? new Date(earliestAvailableDate) : null,
    latest_return_date: latestReturnDate ? new Date(latestReturnDate) : null,
    auto_renewal_enabled: autoRenewalEnabled || false,
    renewal_notice_days: renewalNoticeDays || null,
    renewal_price_adjustment: renewalPriceAdjustment ? new Prisma.Decimal(renewalPriceAdjustment) : null,
    
    // ... other fields
  }
});
```

#### b) Database Schema

**✅ Các cột đã có trong bảng `listings`:**

```sql
-- Quantity Management
total_quantity INT NOT NULL DEFAULT 1,
available_quantity INT NOT NULL DEFAULT 1,
rented_quantity INT NOT NULL DEFAULT 0,
reserved_quantity INT NOT NULL DEFAULT 0,
maintenance_quantity INT NOT NULL DEFAULT 0,
sold_quantity INT DEFAULT 0,

-- Rental Specific Fields
rental_unit VARCHAR(50), -- DAY, WEEK, MONTH, QUARTER, YEAR
min_rental_duration INT,
max_rental_duration INT,

-- Deposit Policy
deposit_required BOOLEAN DEFAULT FALSE,
deposit_amount DECIMAL(15,2),
deposit_currency VARCHAR(3),

-- Late Fees
late_return_fee_amount DECIMAL(15,2),
late_return_fee_unit VARCHAR(20), -- PER_DAY, PER_WEEK

-- Availability Dates
earliest_available_date DATE,
latest_return_date DATE,

-- Auto Renewal
auto_renewal_enabled BOOLEAN DEFAULT FALSE,
renewal_notice_days INT,
renewal_price_adjustment DECIMAL(5,2), -- % adjustment

-- Rental Statistics
last_rented_at TIMESTAMP,
total_rental_count INT DEFAULT 0,

-- Constraints
CONSTRAINT check_quantity_balance CHECK (
  available_quantity + rented_quantity + reserved_quantity + maintenance_quantity + sold_quantity = total_quantity
),
CONSTRAINT check_rental_duration_logical CHECK (
  (min_rental_duration IS NULL OR min_rental_duration > 0) AND
  (max_rental_duration IS NULL OR max_rental_duration > 0) AND
  (min_rental_duration IS NULL OR max_rental_duration IS NULL OR min_rental_duration <= max_rental_duration)
),
CONSTRAINT check_deposit_currency_when_required CHECK (
  NOT deposit_required OR (deposit_amount IS NOT NULL AND deposit_amount > 0 AND deposit_currency IS NOT NULL)
)
```

---

### 3. 📊 Master Data

**✅ Bảng `md_rental_units` đã seed:**

```javascript
// File: backend/scripts/seed/seed-complete.mjs
md_rental_units: [
  { code: 'DAY', name: 'Ngày', description: 'Thuê theo ngày' },
  { code: 'WEEK', name: 'Tuần', description: 'Thuê theo tuần' },
  { code: 'MONTH', name: 'Tháng', description: 'Thuê theo tháng' },
  { code: 'QUARTER', name: 'Quý', description: 'Thuê theo quý' },
  { code: 'YEAR', name: 'Năm', description: 'Thuê theo năm' },
  { code: 'TRIP', name: 'Chuyến', description: 'Thuê theo chuyến đi' }
]
```

---

### 4. 🎨 Hiển Thị Deal Type

**✅ Utility Functions:**

```typescript
// File: frontend/lib/utils/dealType.ts

export function getDealTypeDisplayName(code: string): string {
  switch (code?.toUpperCase()) {
    case 'SALE': return 'Bán';
    case 'RENTAL': return 'Thuê ngắn hạn';
    case 'LEASE': return 'Thuê dài hạn';
    case 'SWAP': return 'Trao đổi';
    default: return code || 'N/A';
  }
}

export function isRentalType(code: string): boolean {
  const upperCode = code?.toUpperCase();
  return upperCode === 'RENTAL' || upperCode === 'LEASE';
}
```

**✅ Badge Components:**

```typescript
// File: frontend/lib/utils/listingStatus.tsx

export const DEAL_TYPE_LABELS: Record<string, string> = {
  SALE: 'Bán',
  RENTAL: 'Thuê ngắn hạn',
  LEASE: 'Thuê dài hạn',
  RENTAL_DAILY: 'Cho thuê theo ngày',
  RENTAL_MONTHLY: 'Cho thuê theo tháng',
  // ... lowercase versions
};
```

---

## ❌ TÍNH NĂNG CẦN BỔ SUNG

### 🚨 MỤC QUAN TRỌNG: QUẢN LÝ CONTAINER CHO THUÊ (SELLER)

#### **Vấn đề hiện tại:**

Người bán (seller) **CHƯA CÓ** trang/chức năng để:

1. ✅ Xem danh sách container cho thuê của mình
2. ❌ **Xem chi tiết container nào đang được thuê**
3. ❌ **Xem ai đang thuê (thông tin người thuê)**
4. ❌ **Xem thời gian thuê còn lại**
5. ❌ **Quản lý trạng thái container (Available → Rented → Maintenance → Available)**
6. ❌ **Thống kê doanh thu cho thuê**
7. ❌ **Lịch sử cho thuê (rental history)**

#### **Trang hiện có:**

**File:** `frontend/app/[locale]/sell/my-listings/page.tsx`

```tsx
// ✅ Hiển thị danh sách listings của seller
// ✅ Filter theo SALE/RENTAL
// ❌ KHÔNG có chi tiết quản lý container cho thuê

// Thông tin hiện có:
{listing.total_quantity} container
{listing.available_quantity} available
{listing.rented_quantity} rented
// ⚠️ CHỈ hiển thị số, KHÔNG có chi tiết
```

#### **Tính năng cần bổ sung:**

##### 1. **Trang "Chi Tiết Listing Cho Thuê"** (Seller View)

**Route:** `/sell/my-listings/[id]/manage-rental`

**Nội dung cần có:**

```
┌─────────────────────────────────────────────────────────────┐
│  📦 QUẢN LÝ CONTAINER CHO THUÊ                              │
│  Listing: Container 20ft Standard - Tình trạng tốt          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 TỔNG QUAN                                               │
│  ┌───────────┬───────────┬───────────┬───────────┐        │
│  │ Tổng: 10  │ Có sẵn: 6 │ Đã thuê: 3│ Bảo trì: 1│        │
│  └───────────┴───────────┴───────────┴───────────┘        │
│                                                             │
│  🔵🔵🔵🟠🟠🟠🟢🟢🟢🟢 (visualization bar)               │
│  🔵 Rented | 🟠 Maintenance | 🟢 Available                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  📋 DANH SÁCH CONTAINER                                     │
│                                                             │
│  Tab: [🟢 Có sẵn (6)] [🔵 Đang thuê (3)] [🟠 Bảo trì (1)] │
│                                                             │
│  === TAB: ĐANG THUÊ ===                                     │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📦 Container #CONT-001                               │  │
│  │ ────────────────────────────────────────────────────  │  │
│  │ 👤 Người thuê: Nguyễn Văn A (Công ty ABC)           │  │
│  │ 📧 Email: nguyenvana@company.com                     │  │
│  │ 📱 SĐT: 0901234567                                   │  │
│  │ 📅 Bắt đầu: 01/11/2025                              │  │
│  │ ⏰ Kết thúc: 01/12/2025 (còn 18 ngày)              │  │
│  │ 💰 Giá thuê: 100 USD/tháng                          │  │
│  │ 💵 Cọc: 200 USD                                      │  │
│  │ 📍 Địa điểm: Depot Sài Gòn                          │  │
│  │                                                       │  │
│  │ [📞 Liên hệ] [📄 Xem hợp đồng] [⚙️ Hành động ▾]    │  │
│  │     └─ Gia hạn                                       │  │
│  │     └─ Kết thúc sớm                                  │  │
│  │     └─ Chuyển sang bảo trì                          │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📦 Container #CONT-002                               │  │
│  │ ... (similar card)                                   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  === TAB: CÓ SẴN ===                                       │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📦 Container #CONT-005                               │  │
│  │ ────────────────────────────────────────────────────  │  │
│  │ ✅ Sẵn sàng cho thuê                                 │  │
│  │ 📍 Địa điểm: Depot Sài Gòn                          │  │
│  │ 🔍 Tình trạng: Đã kiểm tra - 05/11/2025             │  │
│  │                                                       │  │
│  │ [⚙️ Hành động ▾]                                     │  │
│  │     └─ Chuyển sang bảo trì                          │  │
│  │     └─ Cho thuê thủ công (manual)                   │  │
│  │     └─ Xem lịch sử                                  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  === TAB: BẢO TRÌ ===                                      │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📦 Container #CONT-010                               │  │
│  │ ────────────────────────────────────────────────────  │  │
│  │ 🔧 Lý do: Sửa chữa cửa container                    │  │
│  │ 📅 Bắt đầu bảo trì: 10/11/2025                      │  │
│  │ ⏰ Dự kiến xong: 15/11/2025 (còn 2 ngày)           │  │
│  │ 💰 Chi phí ước tính: 50 USD                         │  │
│  │                                                       │  │
│  │ [✅ Hoàn thành bảo trì] [📝 Cập nhật tiến độ]       │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  📈 THỐNG KÊ & BÁO CÁO                                      │
│                                                             │
│  Tháng này:                                                 │
│  - Doanh thu: 300 USD (3 container x 100 USD)              │
│  - Tiền cọc đang giữ: 600 USD                              │
│  - Tỷ lệ cho thuê: 30% (3/10 container)                    │
│                                                             │
│  [📊 Xem báo cáo chi tiết] [📥 Xuất Excel]                 │
└─────────────────────────────────────────────────────────────┘
```

##### 2. **Database Changes Cần Thiết**

**Bảng mới: `rental_contracts`**

```sql
CREATE TABLE rental_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Listing & Container Info
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  container_id UUID REFERENCES listing_containers(id) ON DELETE SET NULL,
  
  -- Parties
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Rental Terms
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rental_price DECIMAL(15,2) NOT NULL,
  rental_currency VARCHAR(3) NOT NULL,
  rental_unit VARCHAR(50) NOT NULL, -- DAY, WEEK, MONTH
  
  -- Deposit
  deposit_amount DECIMAL(15,2),
  deposit_currency VARCHAR(3),
  deposit_paid BOOLEAN DEFAULT FALSE,
  deposit_returned BOOLEAN DEFAULT FALSE,
  deposit_return_date DATE,
  
  -- Contract Status
  status VARCHAR(50) DEFAULT 'ACTIVE', 
    -- ACTIVE, COMPLETED, TERMINATED, OVERDUE
  
  -- Payment Status
  payment_status VARCHAR(50) DEFAULT 'PENDING',
    -- PENDING, PAID, PARTIALLY_PAID, OVERDUE
  total_paid DECIMAL(15,2) DEFAULT 0,
  
  -- Late Fees
  late_fees DECIMAL(15,2) DEFAULT 0,
  days_overdue INT DEFAULT 0,
  
  -- Contract Details
  contract_pdf_url TEXT, -- Link to PDF contract
  terms_and_conditions TEXT,
  special_notes TEXT,
  
  -- Auto Renewal
  auto_renewal BOOLEAN DEFAULT FALSE,
  renewal_count INT DEFAULT 0,
  last_renewed_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Soft Delete
  deleted_at TIMESTAMP
);

CREATE INDEX idx_rental_contracts_listing ON rental_contracts(listing_id);
CREATE INDEX idx_rental_contracts_seller ON rental_contracts(seller_id);
CREATE INDEX idx_rental_contracts_buyer ON rental_contracts(buyer_id);
CREATE INDEX idx_rental_contracts_status ON rental_contracts(status);
CREATE INDEX idx_rental_contracts_end_date ON rental_contracts(end_date);
```

**Bảng mới: `container_maintenance_logs`**

```sql
CREATE TABLE container_maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  container_id UUID REFERENCES listing_containers(id) ON DELETE SET NULL,
  
  -- Maintenance Details
  reason TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  estimated_completion_date DATE,
  actual_completion_date DATE,
  
  -- Cost
  estimated_cost DECIMAL(15,2),
  actual_cost DECIMAL(15,2),
  cost_currency VARCHAR(3),
  
  -- Status
  status VARCHAR(50) DEFAULT 'IN_PROGRESS',
    -- IN_PROGRESS, COMPLETED, CANCELLED
  
  -- Photos/Documentation
  before_photos TEXT[], -- Array of URLs
  after_photos TEXT[],
  maintenance_report_url TEXT,
  
  -- Performed By
  performed_by VARCHAR(255), -- Company/person name
  technician_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_maintenance_listing ON container_maintenance_logs(listing_id);
CREATE INDEX idx_maintenance_container ON container_maintenance_logs(container_id);
CREATE INDEX idx_maintenance_status ON container_maintenance_logs(status);
```

##### 3. **API Endpoints Cần Bổ Sung**

```typescript
// ===== RENTAL CONTRACTS APIs =====

// 1. Get all rental contracts for a listing (seller view)
GET /api/v1/listings/:listingId/rental-contracts
Query params: 
  - status: ACTIVE | COMPLETED | TERMINATED
  - page, limit
Response: {
  success: true,
  data: {
    contracts: [...],
    summary: {
      total: 10,
      active: 3,
      completed: 5,
      terminated: 2
    }
  }
}

// 2. Get specific rental contract details
GET /api/v1/rental-contracts/:contractId

// 3. Update rental contract (extend, terminate, etc.)
PATCH /api/v1/rental-contracts/:contractId
Body: {
  action: 'EXTEND' | 'TERMINATE' | 'UPDATE_PAYMENT',
  newEndDate?: Date,
  paymentAmount?: number,
  notes?: string
}

// 4. Get rental statistics for seller
GET /api/v1/sellers/rental-stats
Response: {
  thisMonth: {
    revenue: 300,
    activeContracts: 3,
    occupancyRate: 0.30
  },
  allTime: {
    totalRevenue: 5000,
    totalContracts: 25,
    averageRentalDuration: 45 // days
  }
}

// ===== CONTAINER MANAGEMENT APIs =====

// 5. Get containers by status for a listing
GET /api/v1/listings/:listingId/containers
Query params:
  - status: AVAILABLE | RENTED | MAINTENANCE
Response: {
  success: true,
  data: {
    available: [...],
    rented: [...],
    maintenance: [...]
  }
}

// 6. Move container to maintenance
POST /api/v1/listings/:listingId/containers/:containerId/maintenance
Body: {
  reason: string,
  description: string,
  estimatedCompletionDate: Date,
  estimatedCost: number
}

// 7. Complete maintenance
PATCH /api/v1/maintenance-logs/:logId/complete
Body: {
  actualCost: number,
  afterPhotos: string[],
  technicianNotes: string
}

// 8. Get maintenance history for container
GET /api/v1/containers/:containerId/maintenance-history
```

##### 4. **Frontend Components Cần Tạo**

```
frontend/app/[locale]/sell/my-listings/[id]/manage-rental/
├── page.tsx                           # Main rental management page
├── components/
│   ├── RentalOverview.tsx            # Summary cards (total, available, rented, maintenance)
│   ├── ContainerTabs.tsx             # Tabs for Available/Rented/Maintenance
│   ├── RentedContainerCard.tsx       # Card hiển thị container đang thuê
│   ├── AvailableContainerCard.tsx    # Card hiển thị container có sẵn
│   ├── MaintenanceContainerCard.tsx  # Card hiển thị container đang bảo trì
│   ├── RentalStats.tsx               # Statistics & charts
│   ├── ContractDetailsModal.tsx      # Modal xem chi tiết hợp đồng
│   ├── MaintenanceModal.tsx          # Modal tạo/cập nhật bảo trì
│   └── RentalHistoryTable.tsx        # Bảng lịch sử cho thuê

frontend/components/rental/
├── RentalStatusBadge.tsx             # Badge cho status (Active/Completed/etc)
├── OccupancyBar.tsx                  # Visualization bar (🔵🟠🟢)
├── RentalDurationIndicator.tsx       # "Còn X ngày"
└── RentalRevenueChart.tsx            # Chart doanh thu theo tháng
```

##### 5. **User Stories Cần Cover**

**US-1: Xem Tổng Quan Container Cho Thuê**
```
Là seller
Tôi muốn xem tổng quan tất cả container của listing cho thuê
Để biết có bao nhiêu container đang thuê, bao nhiêu available, bao nhiêu bảo trì
```

**US-2: Xem Chi Tiết Container Đang Cho Thuê**
```
Là seller
Tôi muốn xem ai đang thuê container của tôi
Để biết thông tin người thuê và thời gian thuê còn lại
```

**US-3: Quản Lý Bảo Trì Container**
```
Là seller
Tôi muốn đưa container vào bảo trì khi cần sửa chữa
Để theo dõi tiến độ và chi phí bảo trì
```

**US-4: Xem Thống Kê Doanh Thu**
```
Là seller
Tôi muốn xem doanh thu từ cho thuê container
Để đánh giá hiệu quả kinh doanh
```

**US-5: Gia Hạn Hợp Đồng Thuê**
```
Là seller
Tôi muốn gia hạn hợp đồng cho khách hàng hiện tại
Để tăng tỷ lệ lấp đầy và giữ chân khách hàng
```

---

### 📊 PHÂN TÍCH CHI TIẾT

### 🔍 PHÂN TÍCH: CÓ NÊN TẠO MENU QUẢN LÝ CONTAINER CHO THUÊ RIÊNG?

#### ✅ **KẾT LUẬN: NÊN TẠO MENU RIÊNG**

Sau phân tích kỹ lưỡng, **STRONGLY RECOMMEND** tạo một menu/section riêng cho quản lý container cho thuê vì:

---

#### 📌 LÝ DO 1: Khối Lượng Chức Năng Lớn

Quản lý container cho thuê cần **ít nhất 10+ tính năng riêng biệt**:

✅ **Quản lý hợp đồng:**
- Xem danh sách hợp đồng đang chạy
- Chi tiết hợp đồng (buyer info, dates, pricing)
- Gia hạn hợp đồng
- Kết thúc hợp đồng sớm
- Lịch sử hợp đồng

✅ **Quản lý container:**
- Xem trạng thái real-time (Available/Rented/Maintenance)
- Chuyển container sang bảo trì
- Hoàn thành bảo trì
- Theo dõi thời gian thuê còn lại

✅ **Thống kê & báo cáo:**
- Dashboard tổng quan
- Doanh thu theo tháng/quý/năm
- Occupancy rate (tỷ lệ lấp đầy)
- Contract renewal rate
- Xuất báo cáo Excel/PDF

**→ Quá nhiều chức năng để nhét vào page hiện tại!**

---

#### 📌 LÝ DO 2: User Flow Hoàn Toàn Khác Biệt

| 🏪 Bán Container (SALE) | 🔑 Cho Thuê Container (RENTAL) |
|------------------------|-------------------------------|
| Tạo listing → Bán → **KẾT THÚC** | Tạo listing → Cho thuê → **QUẢN LÝ LIÊN TỤC** |
| **Một lần** giao dịch | **Nhiều giao dịch** cùng lúc (1 listing có thể có 10 hợp đồng) |
| Không cần follow-up | Cần theo dõi: thanh toán, gia hạn, bảo trì, trả container |
| Inventory giảm vĩnh viễn | Inventory **fluctuate** (Available ⇄ Rented ⇄ Maintenance) |
| Metrics: Tổng doanh thu, số đơn bán | Metrics: **Occupancy rate, MRR, renewal rate, lifetime value** |

**Business mindset khác nhau:**
- **Bán:** Focus on **volume** (bán nhanh, bán nhiều)
- **Cho thuê:** Focus on **utilization** (lấp đầy tối đa, giữ chân khách hàng lâu dài)

---

#### 📌 LÝ DO 3: Dữ Liệu & Complexity Cao Hơn

**Bán container (SALE):**
```
listings (tin đăng)
    ↓
orders (đơn hàng)
    ↓
deliveries (giao hàng)
    ↓
DONE ✅
```

**Cho thuê container (RENTAL):**
```
listings (tin đăng)
    ↓
rental_contracts (hợp đồng) ← PERSISTENT, LONG-TERM
    ├─→ payments (thanh toán định kỳ)
    ├─→ contract_renewals (gia hạn)
    ├─→ late_fees (phí trễ hạn)
    └─→ deposit_refunds (hoàn cọc)
    ↓
container_maintenance_logs (bảo trì)
    ├─→ maintenance_costs
    └─→ maintenance_schedules
    ↓
rental_revenue_reports (thống kê)
    ├─→ monthly_revenue
    ├─→ occupancy_trends
    └─→ customer_lifetime_value
```

**→ Cần nhiều tables, relationships phức tạp, và continuous monitoring!**

---

#### 📌 LÝ DO 4: Target Users & Use Cases Khác Nhau

| 👤 Người Bán Container | 👔 Người Cho Thuê Container (Rental Manager) |
|----------------------|------------------------------------------|
| Cá nhân, doanh nghiệp nhỏ | **Doanh nghiệp vừa & lớn** |
| Bán 1-2 lần/tháng | Quản lý **hàng chục hợp đồng** đồng thời |
| KPI: Doanh thu 1 lần | KPI: **MRR (Monthly Recurring Revenue), Churn rate, LTV** |
| Công cụ cần: Form đăng tin, xem đơn hàng | Công cụ cần: **Dashboard, Contract management, Analytics** |

**User stories khác nhau:**
- **Seller:** "Tôi muốn bán container nhanh với giá tốt"
- **Rental Manager:** "Tôi cần biết occupancy rate hôm nay là bao nhiêu, container nào sắp hết hạn, revenue tháng này so với tháng trước thế nào"

---

#### 📌 LÝ DO 5: Opportunity For Premium Features

Tách riêng menu cho phép:
- **Freemium model:** Free cho SALE, Premium cho RENTAL management
- **Advanced analytics:** Predictive analytics, demand forecasting
- **Automation:** Auto-renewal, auto-pricing adjustment
- **Integration:** Với accounting software, CRM, logistics

---

### 🏗️ ĐỀ XUẤT CẤU TRÚC MENU (RECOMMENDED)

#### **Option 1: Submenu Trong "Bán Hàng" ⭐ RECOMMENDED**

```
📦 Bán Hàng (Sell) ← Main menu
├─ 📝 Đăng tin (My Listings)
│   ├─ Tất cả tin đăng
│   ├─ Đang bán (SALE filter)
│   └─ Đang cho thuê (RENTAL/LEASE filter)
│
├─ 📊 Quản lý đơn hàng (Orders)
│   └─ Đơn mua bán
│
└─ 🔑 Quản lý cho thuê (Rental Management) ⭐ MỚI - SUBMENU
    ├─ 📊 Dashboard (Tổng quan)
    │   ├─ Quick stats (occupancy, revenue, etc.)
    │   ├─ Upcoming actions (contracts expiring, maintenance due)
    │   └─ Recent activity
    │
    ├─ 📦 Container (Container Management)
    │   ├─ Đang cho thuê (Active rentals)
    │   ├─ Có sẵn (Available)
    │   ├─ Bảo trì (Maintenance)
    │   └─ Tất cả
    │
    ├─ 📄 Hợp đồng (Contracts)
    │   ├─ Đang chạy (Active)
    │   ├─ Sắp hết hạn (Expiring soon)
    │   ├─ Đã kết thúc (Completed)
    │   └─ Tìm kiếm theo khách hàng
    │
    ├─ 🔧 Bảo trì (Maintenance)
    │   ├─ Đang bảo trì (In progress)
    │   ├─ Đã hoàn thành (Completed)
    │   ├─ Lên lịch (Scheduled)
    │   └─ Lịch sử bảo trì
    │
    ├─ 💰 Tài chính (Finance)
    │   ├─ Doanh thu (Revenue)
    │   ├─ Thanh toán (Payments)
    │   ├─ Tiền cọc (Deposits)
    │   └─ Phí trễ hạn (Late fees)
    │
    └─ 📈 Báo cáo (Reports)
        ├─ Thống kê tổng quan
        ├─ Phân tích khách hàng
        ├─ ROI & Performance
        └─ Xuất báo cáo (Excel/PDF)
```

**✅ Ưu điểm:**
- Tập trung tất cả chức năng seller vào 1 menu
- Dễ access, không phá vỡ navigation hiện tại
- Scalable - có thể thêm nhiều submenu
- Clear hierarchy

**⚠️ Nhược điểm:**
- Menu "Bán Hàng" có thể dài (nhưng OK với collapsible submenu)

---

#### **Option 2: Top-Level Menu Riêng (Alternative)**

```
🏠 Trang chủ
📦 Bán Hàng (Sell)
🛒 Mua Hàng (Buy)
🔑 Quản Lý Cho Thuê (Rental Management) ⭐ MỚI - TOP LEVEL
    └─ (Same structure as Option 1)
⚙️ Cài đặt
```

**✅ Ưu điểm:**
- Tách biệt hoàn toàn BÁN vs CHO THUÊ
- Professional, enterprise-grade
- Phù hợp nếu cho thuê là business model chính

**⚠️ Nhược điểm:**
- Thêm top-level item (có thể cluttered)
- Navigation phức tạp hơn
- Chỉ phù hợp nếu % rental listings cao (>30%)

---

#### **Option 3: Tab Trong "My Listings" ❌ NOT RECOMMENDED**

```
📦 Đăng tin của tôi (My Listings)
├─ Tab: Bán (SALE)
└─ Tab: Cho thuê (RENTAL) 
    └─ Click vào → redirect to /sell/rental-management
```

**⚠️ Nhược điểm:**
- ❌ Quá nhiều thông tin trong 1 page
- ❌ UX kém - users phải switch tabs liên tục
- ❌ Không có space cho dashboard/analytics
- ❌ Khó để hiển thị cross-listing insights

---

### 🎯 QUYẾT ĐỊNH CUỐI CÙNG

**✅ CHỌN OPTION 1: Submenu "Quản Lý Cho Thuê" trong "Bán Hàng"**

**Lý do:**
1. ✅ **Balance tốt** giữa organization và simplicity
2. ✅ **Không phá vỡ** UX hiện tại
3. ✅ **Dễ implement** - chỉ cần thêm routes + components
4. ✅ **Scalable** - có thể thêm features dần dần
5. ✅ **User-friendly** - sellers vẫn có mental model "Bán Hàng = Kiếm tiền"

---

#### So Sánh: Đã Có vs Cần Bổ Sung

| Chức năng | Trạng thái | Ghi chú |
|-----------|------------|---------|
| **Tạo listing cho thuê** | ✅ Hoàn chỉnh | Form đầy đủ, validation OK |
| **Lưu thông tin rental** | ✅ Hoàn chỉnh | Database schema đầy đủ |
| **Hiển thị giá thuê** | ✅ Hoàn chỉnh | Có rental_unit, price_amount |
| **Quản lý số lượng (quantity)** | ✅ Cơ bản OK | Total/Available/Rented/Maintenance |
| **Xem listing của seller** | ✅ Có | Page `/sell/my-listings` |
| **MENU quản lý cho thuê** | ❌ CHƯA CÓ | **CẦN BỔ SUNG** ⭐ |
| **Dashboard tổng quan** | ❌ CHƯA CÓ | **CẦN BỔ SUNG** |
| **Xem CHI TIẾT container thuê** | ❌ CHƯA CÓ | **CẦN BỔ SUNG** |
| **Xem thông tin người thuê** | ❌ CHƯA CÓ | **CẦN BỔ SUNG** |
| **Quản lý hợp đồng thuê** | ❌ CHƯA CÓ | **CẦN BỔ SUNG** |
| **Quản lý bảo trì container** | ❌ CHƯA CÓ | **CẦN BỔ SUNG** |
| **Thống kê doanh thu thuê** | ❌ CHƯA CÓ | **CẦN BỔ SUNG** |
| **Lịch sử cho thuê** | ❌ CHƯA CÓ | **CẦN BỔ SUNG** |

---

## 🔵 PHÂN TÍCH BUYER SIDE - NGƯỜI THUÊ CONTAINER

### 🎯 TẠI SAO BUYER CŨNG CẦN QUẢN LÝ CONTAINER ĐÃ THUÊ?

**CÂU TRẢ LỜI: CÓ, CHẮC CHẮN CẦN!**

Tương tự như seller cần quản lý container cho thuê, **buyer (người thuê)** cũng cần có khả năng:
- ✅ Xem danh sách container đang thuê
- ✅ Theo dõi thời gian thuê còn lại
- ✅ Quản lý thanh toán
- ✅ Gia hạn hợp đồng
- ✅ Liên hệ seller
- ✅ Xem lịch sử thuê

---

### 📊 SO SÁNH: SELLER VIEW vs BUYER VIEW

| Khía Cạnh | 🏪 Seller (Người Cho Thuê) | 🛒 Buyer (Người Thuê) |
|-----------|---------------------------|----------------------|
| **Mục đích** | Quản lý inventory, maximize revenue | Quản lý chi phí, ensure container availability |
| **Focus** | Occupancy rate, nhiều hợp đồng cùng lúc | Hợp đồng của mình, compliance |
| **Metrics quan tâm** | MRR, Renewal rate, ROI | Thời gian còn lại, Total cost, Payment status |
| **Actions chính** | Approve/Reject, Set maintenance | Request extension, Pay rent, Return container |
| **Notifications** | Contract expiring (nhiều contracts) | Payment due, Contract expiring (của mình) |
| **Dashboard** | Tổng quan portfolio (all listings) | My Rentals (chỉ container mình thuê) |

---

### 🏗️ CẤU TRÚC MENU CHO BUYER

#### **Option 1: Menu Trong "Mua Hàng" ⭐ RECOMMENDED**

```
🛒 Mua Hàng (Buy)
├─ 🔍 Tìm kiếm Container
├─ 📋 Đơn hàng của tôi (My Orders)
│   ├─ Đơn mua (SALE orders)
│   └─ Lọc theo trạng thái
│
└─ 🔑 Container Đang Thuê (My Rentals) ⭐ MỚI
    ├─ 📦 Đang thuê (Active Rentals)
    ├─ ⏰ Sắp hết hạn (Expiring Soon)
    ├─ 💰 Thanh toán (Payments)
    ├─ 📜 Lịch sử (History)
    └─ ⚙️ Cài đặt (Settings)
```

**Lý do:**
- Logical grouping: MUA & THUÊ đều là "buying activities"
- User mental model: "Tôi mua/thuê container ở đây"
- Không cluttered navigation

---

### 📱 TRANG "CONTAINER ĐANG THUÊ" (BUYER VIEW)

#### **Route:** `/buy/my-rentals/page.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│  🔑 CONTAINER ĐANG THUÊ                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 TỔNG QUAN                                               │
│  ┌────────────┬────────────┬────────────┬────────────┐    │
│  │ Đang thuê  │ Chi phí/   │ Sắp hết    │ Quá hạn    │    │
│  │     5      │  tháng     │    hạn     │  thanh toán│    │
│  │ containers │  500 USD   │     2      │     1      │    │
│  └────────────┴────────────┴────────────┴────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  📋 DANH SÁCH CONTAINER                                     │
│                                                             │
│  Tab: [🟢 Đang thuê (5)] [⏰ Sắp hết hạn (2)] [📜 Lịch sử]│
│                                                             │
│  === TAB: ĐANG THUÊ ===                                     │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📦 Container #CONT-001                               │  │
│  │ ────────────────────────────────────────────────────  │  │
│  │ 📦 20ft Standard - Tình trạng tốt                   │  │
│  │ 🏪 Người cho thuê: Công ty XYZ Container            │  │
│  │ 📧 Email: contact@xyzcontainer.com                  │  │
│  │ 📱 SĐT: 0901234567                                  │  │
│  │                                                       │  │
│  │ 📅 Bắt đầu: 01/11/2025                              │  │
│  │ ⏰ Kết thúc: 01/12/2025                             │  │
│  │ ⏳ Còn lại: 18 ngày                                 │  │
│  │                                                       │  │
│  │ 💰 Giá thuê: 100 USD/tháng                          │  │
│  │ 💵 Cọc đã đặt: 200 USD                              │  │
│  │ 📍 Địa điểm: Depot Sài Gòn                          │  │
│  │                                                       │  │
│  │ 💳 Thanh toán tiếp theo: 01/12/2025 (18 ngày nữa)  │  │
│  │ 💵 Số tiền: 100 USD                                 │  │
│  │ ✅ Trạng thái: Đã thanh toán                        │  │
│  │                                                       │  │
│  │ [📞 Liên hệ chủ container] [💰 Thanh toán]          │  │
│  │ [🔄 Gia hạn] [📄 Xem hợp đồng] [📍 Vị trí]         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📦 Container #CONT-002                               │  │
│  │ ────────────────────────────────────────────────────  │  │
│  │ 📦 40ft High Cube - Đã qua sử dụng                 │  │
│  │ 🏪 Người cho thuê: ABC Logistics                    │  │
│  │                                                       │  │
│  │ ⏰ Kết thúc: 15/11/2025                             │  │
│  │ ⚠️ SẮP HẾT HẠN: Còn 2 ngày!                        │  │
│  │                                                       │  │
│  │ 💰 Giá thuê: 120 USD/tháng                          │  │
│  │ 💳 Thanh toán: ❌ Chưa thanh toán (QUÁHẠN 5 ngày) │  │
│  │ 💵 Phí trễ: 25 USD                                  │  │
│  │                                                       │  │
│  │ [🚨 THANH TOÁN NGAY] [🔄 Gia hạn] [📞 Liên hệ]    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  === TAB: SẮP HẾT HẠN ===                                  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ⏰ 2 hợp đồng sắp hết hạn trong 7 ngày tới          │  │
│  │                                                       │  │
│  │ 📦 #CONT-002 - Còn 2 ngày                           │  │
│  │    [Gia hạn ngay] [Liên hệ seller]                 │  │
│  │                                                       │  │
│  │ 📦 #CONT-003 - Còn 5 ngày                           │  │
│  │    [Gia hạn ngay] [Liên hệ seller]                 │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  === TAB: LỊCH SỬ ===                                      │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📦 Container #CONT-100 (ĐÃ KẾT THÚC)                │  │
│  │ ────────────────────────────────────────────────────  │  │
│  │ 📅 Thời gian: 01/08/2025 - 01/10/2025 (60 ngày)    │  │
│  │ 💰 Tổng chi phí: 200 USD                            │  │
│  │ 💵 Cọc đã hoàn: 200 USD (05/10/2025)                │  │
│  │ ⭐ Đánh giá: ⭐⭐⭐⭐⭐                             │  │
│  │                                                       │  │
│  │ [📄 Xem hợp đồng] [📥 Tải hóa đơn]                 │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

### 🔧 TÍNH NĂNG CHI TIẾT CHO BUYER

#### 1️⃣ **Dashboard Overview**

```tsx
<BuyerRentalDashboard>
  <StatsGrid>
    <StatCard 
      title="Đang Thuê"
      value={5}
      icon="📦"
      subtitle="5 containers"
    />
    <StatCard 
      title="Chi Phí Hàng Tháng"
      value="500 USD"
      icon="💰"
      trend="+50 USD vs tháng trước"
    />
    <StatCard 
      title="Sắp Hết Hạn"
      value={2}
      icon="⏰"
      variant="warning"
      action={() => navigate('/buy/my-rentals?tab=expiring')}
    />
    <StatCard 
      title="Thanh Toán Quá Hạn"
      value={1}
      icon="🚨"
      variant="danger"
      action={() => navigate('/buy/my-rentals?tab=payments')}
    />
  </StatsGrid>
  
  {/* Alerts Section */}
  <AlertsSection>
    <Alert type="danger" dismissible={false}>
      🚨 1 thanh toán quá hạn! Container #CONT-002 - 
      <Button variant="link">Thanh toán ngay</Button>
    </Alert>
    <Alert type="warning">
      ⏰ 2 hợp đồng sắp hết hạn trong 7 ngày - 
      <Button variant="link">Xem chi tiết</Button>
    </Alert>
  </AlertsSection>
  
  {/* Cost Breakdown Chart */}
  <Card title="Chi Phí Thuê Container (6 tháng gần đây)">
    <BarChart 
      data={monthlyCosts}
      xAxis="month"
      yAxis="cost"
      tooltipFormatter={(value) => `${value} USD`}
    />
  </Card>
</BuyerRentalDashboard>
```

---

#### 2️⃣ **Rental Container Card (Active)**

```tsx
<RentalContainerCard status="active">
  <Header>
    <Badge variant="success">Đang Thuê</Badge>
    <ContainerNumber>#CONT-001</ContainerNumber>
  </Header>
  
  {/* Container Info */}
  <Section title="Thông Tin Container">
    <ContainerImage src={container.image} />
    <h3>{container.type}</h3>
    <p>{container.condition}</p>
    <p>📍 {container.location}</p>
  </Section>
  
  {/* Seller Info */}
  <Section title="Người Cho Thuê">
    <SellerAvatar src={seller.avatar} />
    <div>
      <strong>{seller.name}</strong>
      <p>{seller.company}</p>
      <ContactButtons>
        <Button icon="📧" onClick={sendEmail}>Email</Button>
        <Button icon="📱" onClick={callPhone}>Gọi điện</Button>
        <Button icon="💬" onClick={openChat}>Chat</Button>
      </ContactButtons>
    </div>
  </Section>
  
  {/* Rental Period */}
  <Section title="Thời Gian Thuê">
    <Timeline>
      <TimelineStart>
        📅 {contract.startDate}
      </TimelineStart>
      <TimelineBar 
        progress={calculateProgress(contract)}
        color="blue"
      />
      <TimelineEnd>
        🏁 {contract.endDate}
      </TimelineEnd>
    </Timeline>
    <CountdownTimer endDate={contract.endDate}>
      ⏳ Còn {daysRemaining} ngày
    </CountdownTimer>
  </Section>
  
  {/* Pricing */}
  <Section title="Chi Phí">
    <PriceRow>
      <span>Giá thuê</span>
      <strong>{contract.price} {contract.currency}/{contract.unit}</strong>
    </PriceRow>
    <PriceRow>
      <span>Cọc đã đặt</span>
      <span>{contract.deposit} {contract.currency}</span>
    </PriceRow>
    <PriceRow>
      <span>Tổng đã trả</span>
      <span>{contract.totalPaid} {contract.currency}</span>
    </PriceRow>
    <Divider />
    <PriceRow className="total">
      <span>Tổng chi phí (dự kiến)</span>
      <strong>{contract.estimatedTotal} {contract.currency}</strong>
    </PriceRow>
  </Section>
  
  {/* Next Payment */}
  <Section title="Thanh Toán Tiếp Theo">
    <PaymentSchedule>
      <PaymentDate>
        💳 {nextPayment.dueDate}
      </PaymentDate>
      <PaymentAmount>
        {nextPayment.amount} {nextPayment.currency}
      </PaymentAmount>
      <PaymentStatus status={nextPayment.status}>
        {nextPayment.status === 'PAID' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
      </PaymentStatus>
    </PaymentSchedule>
    {nextPayment.status === 'PENDING' && (
      <Button variant="primary" onClick={handlePayNow}>
        💰 Thanh toán ngay
      </Button>
    )}
  </Section>
  
  {/* Actions */}
  <ActionButtons>
    <Button onClick={requestExtension}>
      🔄 Gia hạn
    </Button>
    <Button onClick={viewContract}>
      📄 Xem hợp đồng
    </Button>
    <Button onClick={viewLocation}>
      📍 Xem vị trí
    </Button>
    <Button onClick={reportIssue}>
      ⚠️ Báo vấn đề
    </Button>
  </ActionButtons>
</RentalContainerCard>
```

---

#### 3️⃣ **Expiring Soon Alert Card**

```tsx
<ExpiringAlertCard variant="warning">
  <AlertHeader>
    ⏰ HỢP ĐỒNG SẮP HẾT HẠN
  </AlertHeader>
  
  <ContainerSummary>
    <ContainerThumb src={container.image} />
    <div>
      <strong>#{container.number}</strong>
      <p>{container.type}</p>
    </div>
  </ContainerSummary>
  
  <ExpiryInfo>
    <ExpiryDate>
      Hết hạn: {contract.endDate}
    </ExpiryDate>
    <Countdown urgent>
      ⚠️ Chỉ còn {daysRemaining} ngày!
    </Countdown>
  </ExpiryInfo>
  
  <Message>
    Bạn có muốn gia hạn hợp đồng này?
  </Message>
  
  <ActionButtons>
    <Button variant="primary" onClick={quickExtend}>
      🔄 Gia hạn 1 tháng
    </Button>
    <Button variant="outline" onClick={customExtend}>
      ⚙️ Tùy chỉnh gia hạn
    </Button>
    <Button variant="ghost" onClick={contactSeller}>
      📞 Liên hệ chủ container
    </Button>
  </ActionButtons>
  
  <AutoRenewalToggle>
    <Checkbox 
      checked={autoRenewal}
      onChange={handleAutoRenewalChange}
    />
    <label>Bật gia hạn tự động cho lần sau</label>
  </AutoRenewalToggle>
</ExpiringAlertCard>
```

---

#### 4️⃣ **Payment History & Upcoming Payments**

```tsx
<PaymentManagement>
  <Tabs defaultValue="upcoming">
    <TabsList>
      <TabsTrigger value="upcoming">
        Sắp tới ({upcomingPayments.length})
      </TabsTrigger>
      <TabsTrigger value="history">
        Lịch sử ({paymentHistory.length})
      </TabsTrigger>
      <TabsTrigger value="overdue">
        Quá hạn ({overduePayments.length})
      </TabsTrigger>
    </TabsList>
    
    <TabContent value="upcoming">
      <PaymentList>
        {upcomingPayments.map(payment => (
          <PaymentItem key={payment.id}>
            <PaymentInfo>
              <PaymentDate>
                💳 {payment.dueDate}
              </PaymentDate>
              <ContainerRef>
                Container #{payment.containerNumber}
              </ContainerRef>
              <Amount>
                {payment.amount} {payment.currency}
              </Amount>
            </PaymentInfo>
            <PaymentActions>
              <Button onClick={() => payNow(payment.id)}>
                Thanh toán ngay
              </Button>
              <Button variant="outline" onClick={() => setupAutoPay(payment)}>
                Thiết lập tự động
              </Button>
            </PaymentActions>
          </PaymentItem>
        ))}
      </PaymentList>
    </TabContent>
    
    <TabContent value="history">
      <Table>
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Container</th>
            <th>Số tiền</th>
            <th>Phương thức</th>
            <th>Trạng thái</th>
            <th>Hóa đơn</th>
          </tr>
        </thead>
        <tbody>
          {paymentHistory.map(p => (
            <tr key={p.id}>
              <td>{p.paidDate}</td>
              <td>#{p.containerNumber}</td>
              <td>{p.amount} {p.currency}</td>
              <td>{p.method}</td>
              <td>
                <Badge variant="success">✅ Đã thanh toán</Badge>
              </td>
              <td>
                <Button 
                  variant="ghost" 
                  onClick={() => downloadInvoice(p.id)}
                >
                  📥 Tải
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TabContent>
    
    <TabContent value="overdue">
      <Alert variant="danger">
        🚨 Bạn có {overduePayments.length} khoản thanh toán quá hạn.
        Vui lòng thanh toán sớm để tránh phí trễ hạn.
      </Alert>
      {overduePayments.map(payment => (
        <OverduePaymentCard key={payment.id}>
          <OverdueHeader>
            <Badge variant="danger">QUÁ HẠN {payment.daysOverdue} NGÀY</Badge>
          </OverdueHeader>
          <PaymentDetails>
            <InfoRow>
              <span>Container:</span>
              <strong>#{payment.containerNumber}</strong>
            </InfoRow>
            <InfoRow>
              <span>Ngày đến hạn:</span>
              <span>{payment.dueDate}</span>
            </InfoRow>
            <InfoRow>
              <span>Số tiền gốc:</span>
              <span>{payment.amount} {payment.currency}</span>
            </InfoRow>
            <InfoRow className="danger">
              <span>Phí trễ:</span>
              <strong>{payment.lateFee} {payment.currency}</strong>
            </InfoRow>
            <Divider />
            <InfoRow className="total">
              <span>Tổng phải trả:</span>
              <strong>{payment.totalDue} {payment.currency}</strong>
            </InfoRow>
          </PaymentDetails>
          <Button 
            variant="danger" 
            fullWidth
            onClick={() => payOverdueNow(payment.id)}
          >
            🚨 THANH TOÁN NGAY
          </Button>
        </OverduePaymentCard>
      ))}
    </TabContent>
  </Tabs>
</PaymentManagement>
```

---

#### 5️⃣ **Extension Request Modal (Buyer initiates)**

```tsx
<ExtensionRequestModal>
  <ModalHeader>
    <h2>🔄 Yêu Cầu Gia Hạn</h2>
    <ContainerInfo>
      Container #{container.number} - {container.type}
    </ContainerInfo>
  </ModalHeader>
  
  <ModalBody>
    <CurrentContract>
      <h3>Hợp đồng hiện tại</h3>
      <InfoRow>
        <span>Bắt đầu:</span>
        <span>{contract.startDate}</span>
      </InfoRow>
      <InfoRow>
        <span>Kết thúc:</span>
        <span>{contract.endDate}</span>
      </InfoRow>
      <InfoRow>
        <span>Giá thuê:</span>
        <span>{contract.price} {contract.currency}/{contract.unit}</span>
      </InfoRow>
    </CurrentContract>
    
    <Divider />
    
    <ExtensionForm>
      <h3>Gia hạn</h3>
      
      {/* Quick Options */}
      <QuickExtensionButtons>
        <QuickButton 
          onClick={() => setExtensionPeriod(30)}
          selected={extensionPeriod === 30}
        >
          + 1 tháng
        </QuickButton>
        <QuickButton 
          onClick={() => setExtensionPeriod(90)}
          selected={extensionPeriod === 90}
        >
          + 3 tháng
        </QuickButton>
        <QuickButton 
          onClick={() => setExtensionPeriod(180)}
          selected={extensionPeriod === 180}
        >
          + 6 tháng
        </QuickButton>
      </QuickExtensionButtons>
      
      {/* Custom Date Picker */}
      <DatePicker 
        label="Hoặc chọn ngày kết thúc mới"
        min={contract.endDate}
        value={customEndDate}
        onChange={setCustomEndDate}
      />
      
      {/* New End Date Preview */}
      <PreviewBox>
        <h4>Ngày kết thúc mới:</h4>
        <DateDisplay>{newEndDate}</DateDisplay>
        <DurationDisplay>
          Gia hạn thêm: {extensionDays} ngày ({extensionMonths} tháng)
        </DurationDisplay>
      </PreviewBox>
      
      {/* Pricing Preview */}
      <PricingPreview>
        <h4>Chi phí gia hạn:</h4>
        <PriceRow>
          <span>Giá thuê hiện tại:</span>
          <span>{contract.price} {contract.currency}/tháng</span>
        </PriceRow>
        {renewalPriceAdjustment && (
          <PriceRow className="adjustment">
            <span>Điều chỉnh giá ({renewalPriceAdjustment}%):</span>
            <span>+{adjustmentAmount} {contract.currency}/tháng</span>
          </PriceRow>
        )}
        <PriceRow className="new-price">
          <span>Giá mới:</span>
          <strong>{newPrice} {contract.currency}/tháng</strong>
        </PriceRow>
        <Divider />
        <PriceRow className="total">
          <span>Tổng chi phí gia hạn:</span>
          <strong>{totalExtensionCost} {contract.currency}</strong>
        </PriceRow>
      </PricingPreview>
      
      {/* Additional Notes */}
      <Textarea 
        label="Ghi chú cho người cho thuê (không bắt buộc)"
        placeholder="VD: Tôi muốn gia hạn vì dự án còn kéo dài..."
      />
      
      {/* Auto-renewal option */}
      <Checkbox 
        label="Bật gia hạn tự động cho các lần sau"
        hint="Hợp đồng sẽ tự động gia hạn trước 7 ngày khi hết hạn"
        checked={autoRenewal}
        onChange={setAutoRenewal}
      />
    </ExtensionForm>
  </ModalBody>
  
  <ModalFooter>
    <Button variant="outline" onClick={closeModal}>
      Hủy
    </Button>
    <Button variant="primary" onClick={submitExtensionRequest}>
      📤 Gửi yêu cầu gia hạn
    </Button>
  </ModalFooter>
  
  <InfoNote>
    ℹ️ Yêu cầu gia hạn sẽ được gửi đến người cho thuê.
    Bạn sẽ nhận được thông báo khi yêu cầu được chấp nhận.
  </InfoNote>
</ExtensionRequestModal>
```

---

#### 6️⃣ **Rental History & Analytics (Buyer)**

```tsx
<BuyerRentalHistory>
  <Tabs defaultValue="history">
    <TabsList>
      <TabsTrigger value="history">Lịch Sử</TabsTrigger>
      <TabsTrigger value="analytics">Phân Tích</TabsTrigger>
    </TabsList>
    
    <TabContent value="history">
      <FiltersBar>
        <DateRangePicker label="Khoảng thời gian" />
        <Select label="Trạng thái">
          <option value="all">Tất cả</option>
          <option value="completed">Đã kết thúc</option>
          <option value="terminated">Đã hủy</option>
        </Select>
      </FiltersBar>
      
      <HistoryTable>
        <thead>
          <tr>
            <th>Container</th>
            <th>Người cho thuê</th>
            <th>Thời gian</th>
            <th>Tổng chi phí</th>
            <th>Trạng thái</th>
            <th>Đánh giá</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {historyItems.map(item => (
            <tr key={item.id}>
              <td>
                <ContainerCell>
                  <ContainerImage src={item.image} />
                  <div>
                    <strong>#{item.containerNumber}</strong>
                    <small>{item.type}</small>
                  </div>
                </ContainerCell>
              </td>
              <td>{item.sellerName}</td>
              <td>
                <DateRange>
                  {item.startDate} - {item.endDate}
                </DateRange>
                <Duration>({item.duration} ngày)</Duration>
              </td>
              <td>
                <Amount>{item.totalCost} {item.currency}</Amount>
              </td>
              <td>
                <Badge variant={item.status === 'completed' ? 'success' : 'neutral'}>
                  {item.status === 'completed' ? '✅ Hoàn thành' : '❌ Đã hủy'}
                </Badge>
              </td>
              <td>
                {item.rating ? (
                  <Rating value={item.rating} readonly />
                ) : (
                  <Button 
                    variant="link" 
                    onClick={() => openRatingModal(item.id)}
                  >
                    Đánh giá
                  </Button>
                )}
              </td>
              <td>
                <ActionMenu>
                  <MenuItem onClick={() => viewContract(item.id)}>
                    📄 Xem hợp đồng
                  </MenuItem>
                  <MenuItem onClick={() => downloadInvoice(item.id)}>
                    📥 Tải hóa đơn
                  </MenuItem>
                  <MenuItem onClick={() => rentAgain(item)}>
                    🔄 Thuê lại
                  </MenuItem>
                </ActionMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </HistoryTable>
    </TabContent>
    
    <TabContent value="analytics">
      <AnalyticsDashboard>
        <StatsGrid>
          <StatCard 
            title="Tổng số lần thuê"
            value={analytics.totalRentals}
          />
          <StatCard 
            title="Tổng chi phí (all-time)"
            value={`${analytics.totalSpent} USD`}
          />
          <StatCard 
            title="Thời gian thuê trung bình"
            value={`${analytics.avgDuration} ngày`}
          />
          <StatCard 
            title="Chi phí trung bình/tháng"
            value={`${analytics.avgMonthlyCost} USD`}
          />
        </StatsGrid>
        
        <Card title="Chi Phí Theo Thời Gian">
          <LineChart 
            data={analytics.costOverTime}
            xAxis="month"
            yAxis="cost"
            tooltipFormatter={(v) => `${v} USD`}
          />
        </Card>
        
        <Grid cols={2}>
          <Card title="Container Thuê Nhiều Nhất">
            <RankingList>
              {analytics.topContainerTypes.map((type, i) => (
                <RankingItem rank={i+1}>
                  <TypeName>{type.name}</TypeName>
                  <Count>{type.count} lần</Count>
                </RankingItem>
              ))}
            </RankingList>
          </Card>
          
          <Card title="Người Cho Thuê Uy Tín">
            <RankingList>
              {analytics.topSellers.map((seller, i) => (
                <RankingItem rank={i+1}>
                  <SellerInfo>
                    <Avatar src={seller.avatar} />
                    <Name>{seller.name}</Name>
                  </SellerInfo>
                  <Rating value={seller.avgRating} readonly />
                </RankingItem>
              ))}
            </RankingList>
          </Card>
        </Grid>
      </AnalyticsDashboard>
    </TabContent>
  </Tabs>
</BuyerRentalHistory>
```

---

### 🔔 NOTIFICATIONS CHO BUYER

| Event | Trigger | Channel | Priority |
|-------|---------|---------|----------|
| **Hợp đồng được tạo** | Khi seller approve rental request | In-app + Email | High |
| **Thanh toán thành công** | Sau khi payment processed | In-app + Email | Medium |
| **Hợp đồng sắp hết hạn** | 7 ngày trước expiry | In-app + Email + SMS | High |
| **Thanh toán sắp đến hạn** | 3 ngày trước due date | In-app + Email | High |
| **Thanh toán quá hạn** | 1 ngày sau due date | In-app + Email + SMS | Critical |
| **Phí trễ hạn được áp dụng** | Mỗi ngày quá hạn | In-app + Email | High |
| **Yêu cầu gia hạn được chấp nhận** | Khi seller approve | In-app + Email | Medium |
| **Yêu cầu gia hạn bị từ chối** | Khi seller reject | In-app + Email | Medium |
| **Container cần trả lại** | 3 ngày trước end date | In-app + Email + SMS | High |
| **Cọc được hoàn lại** | Sau khi return confirmed | In-app + Email | Medium |

---

### 🗄️ DATABASE CHANGES FOR BUYER SIDE

**Bổ sung vào bảng `rental_contracts`:**

```sql
ALTER TABLE rental_contracts ADD COLUMN IF NOT EXISTS
  -- Extension Requests
  extension_requested BOOLEAN DEFAULT FALSE,
  extension_request_date TIMESTAMP,
  extension_request_end_date DATE,
  extension_request_notes TEXT,
  extension_request_status VARCHAR(50), -- PENDING, APPROVED, REJECTED
  extension_approved_by UUID REFERENCES users(id),
  extension_approved_at TIMESTAMP,
  
  -- Buyer Actions
  buyer_auto_renewal_enabled BOOLEAN DEFAULT FALSE,
  buyer_payment_reminders_enabled BOOLEAN DEFAULT TRUE,
  buyer_rating INT, -- 1-5 stars
  buyer_review TEXT,
  buyer_reviewed_at TIMESTAMP,
  
  -- Communication
  last_buyer_contacted_seller TIMESTAMP,
  buyer_seller_messages_count INT DEFAULT 0;
```

**Bảng mới: `rental_extension_requests`**

```sql
CREATE TABLE rental_extension_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  contract_id UUID NOT NULL REFERENCES rental_contracts(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  
  -- Request Details
  current_end_date DATE NOT NULL,
  requested_end_date DATE NOT NULL,
  extension_days INT NOT NULL,
  
  -- Pricing
  current_price DECIMAL(15,2) NOT NULL,
  requested_price DECIMAL(15,2), -- Buyer can propose new price
  seller_price DECIMAL(15,2), -- Seller can counter-offer
  
  -- Status
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, COUNTER_OFFER
  
  -- Notes
  buyer_notes TEXT,
  seller_response_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP,
  
  -- Metadata
  auto_renewal BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_extension_requests_contract ON rental_extension_requests(contract_id);
CREATE INDEX idx_extension_requests_buyer ON rental_extension_requests(buyer_id);
CREATE INDEX idx_extension_requests_status ON rental_extension_requests(status);
```

---

### 🔌 API ENDPOINTS FOR BUYER

```typescript
// ========== BUYER RENTALS APIs ==========

// 1. Get all active rentals for buyer
GET /api/v1/buyers/my-rentals
Query params:
  - status: active | expiring | overdue
  - page, limit
Response: {
  success: true,
  data: {
    active: [...],
    expiring: [...],
    overdue: [...],
    summary: {
      totalActive: 5,
      totalMonthlyСost: 500,
      expiringCount: 2,
      overduePayments: 1
    }
  }
}

// 2. Get specific rental contract (buyer view)
GET /api/v1/buyers/my-rentals/:contractId
Response: {
  success: true,
  data: {
    contract: {...},
    container: {...},
    seller: {
      id, name, email, phone, company, rating
    },
    payments: {
      upcoming: [...],
      history: [...],
      overdue: [...]
    }
  }
}

// 3. Request contract extension
POST /api/v1/buyers/my-rentals/:contractId/request-extension
Body: {
  newEndDate: Date,
  requestedPrice?: number, // Optional price negotiation
  notes?: string,
  autoRenewal?: boolean
}
Response: {
  success: true,
  message: 'Extension request sent to seller',
  data: {
    requestId: UUID,
    status: 'PENDING'
  }
}

// 4. Get rental history
GET /api/v1/buyers/rental-history
Query params:
  - startDate, endDate
  - status: completed | terminated
  - page, limit
Response: {
  success: true,
  data: {
    rentals: [...],
    analytics: {
      totalRentals: 25,
      totalSpent: 5000,
      avgDuration: 45,
      avgMonthlyCost: 110
    }
  }
}

// 5. Make payment
POST /api/v1/buyers/my-rentals/:contractId/pay
Body: {
  paymentId: UUID,
  paymentMethod: 'vnpay' | 'stripe',
  amount: number
}
Response: {
  success: true,
  data: {
    paymentUrl: string, // Redirect to payment gateway
    transactionId: UUID
  }
}

// 6. Rate rental experience
POST /api/v1/buyers/my-rentals/:contractId/rate
Body: {
  rating: 1-5,
  review?: string
}
Response: {
  success: true,
  message: 'Thank you for your feedback!'
}

// 7. Report issue
POST /api/v1/buyers/my-rentals/:contractId/report-issue
Body: {
  issueType: 'container_damage' | 'payment_problem' | 'other',
  description: string,
  photos?: string[]
}
Response: {
  success: true,
  data: {
    ticketId: UUID,
    status: 'OPEN'
  }
}

// 8. Contact seller
POST /api/v1/buyers/my-rentals/:contractId/contact-seller
Body: {
  message: string,
  urgency: 'low' | 'medium' | 'high'
}
Response: {
  success: true,
  message: 'Message sent to seller'
}

// 9. Get payment schedule
GET /api/v1/buyers/my-rentals/:contractId/payment-schedule
Response: {
  success: true,
  data: {
    schedule: [
      {
        dueDate: Date,
        amount: number,
        status: 'PAID' | 'PENDING' | 'OVERDUE',
        paidDate?: Date
      },
      ...
    ]
  }
}

// 10. Setup auto-payment
POST /api/v1/buyers/my-rentals/:contractId/setup-auto-pay
Body: {
  paymentMethod: 'vnpay' | 'stripe',
  cardToken: string // From payment gateway
}
Response: {
  success: true,
  message: 'Auto-payment enabled'
}
```

---

### 📱 MOBILE APP CONSIDERATIONS

**Buyer-focused mobile features:**

1. **Push Notifications:**
   - Payment reminders (3 days, 1 day, on due date)
   - Contract expiring alerts
   - Extension request responses
   - Late fee warnings

2. **Quick Actions:**
   - One-tap payment (saved cards)
   - Quick extension (preset durations)
   - Emergency contact seller (call/chat)

3. **Widgets:**
   - Next payment due (countdown)
   - Active rentals count
   - Total monthly cost

4. **Offline Mode:**
   - View contract details offline
   - Save invoices for offline access

---

### ✅ BUYER SIDE CHECKLIST

#### Phase 1: Core Buyer Features (Week 1-2)
- [ ] Create `/buy/my-rentals` route
- [ ] Buyer rental dashboard (overview stats)
- [ ] Active rentals list with cards
- [ ] Container detail view (buyer perspective)
- [ ] Seller contact information display
- [ ] Rental timeline & countdown
- [ ] Payment schedule display

#### Phase 2: Payment & Extension (Week 3-4)
- [ ] Payment management page (upcoming, history, overdue)
- [ ] Pay now functionality (VNPay/Stripe integration)
- [ ] Request extension modal
- [ ] Extension request tracking
- [ ] Auto-payment setup
- [ ] Invoice download

#### Phase 3: History & Analytics (Week 5)
- [ ] Rental history page
- [ ] Completed rentals list
- [ ] Rating & review system
- [ ] Analytics dashboard (spending, duration, trends)
- [ ] Export rental history (PDF/Excel)

#### Phase 4: Communication & Support (Week 6)
- [ ] Contact seller feature
- [ ] In-app messaging
- [ ] Report issue form
- [ ] Support ticket system
- [ ] FAQ for buyers

#### Phase 5: Notifications (Week 7)
- [ ] Email templates (payment reminder, expiry alert, etc.)
- [ ] SMS notifications for critical events
- [ ] In-app notification center
- [ ] Notification preferences

#### Phase 6: Testing & Polish (Week 8)
- [ ] E2E testing (buyer flows)
- [ ] Mobile responsive
- [ ] Performance optimization
- [ ] UAT with real buyers

---

### 🎯 KẾT LUẬN - BUYER SIDE

**CÓ, NGƯỜI MUA CHẮC CHẮN CẦN QUẢN LÝ CONTAINER ĐÃ THUÊ!**

**Lý do:**
1. ✅ **Transparency:** Buyer cần biết mình đang thuê gì, còn bao lâu, phải trả bao nhiêu
2. ✅ **Control:** Buyer muốn tự gia hạn, thanh toán, liên hệ seller
3. ✅ **Compliance:** Tránh quên thanh toán, quá hạn, phí phạt
4. ✅ **Cost Management:** Track chi phí, budget planning
5. ✅ **User Experience:** Không cần gọi điện hỏi seller, tự quản lý được

**Impact:**
- ✅ Giảm 60% support calls (buyers tự xử lý)
- ✅ Tăng on-time payment rate lên 90%+
- ✅ Tăng renewal rate lên 70%+ (easy extension)
- ✅ Tăng buyer satisfaction score
- ✅ Reduce churn (buyers stay longer)

**Priority:**
- 🔴 **HIGH** - Nên implement cùng lúc với Seller side
- Buyer & Seller là 2 mặt của cùng 1 transaction
- Không thể có seller management mà không có buyer management

**Timeline:**
- Develop parallel với Seller side: 8 weeks
- Hoặc sau Seller side 2 weeks: +6 weeks (reuse components)

---

### 🎯 ROADMAP TỔNG THỂ

```
Phase 0: Menu & Navigation (Week 1)
    ↓
Phase 1: Database & Backend API (Week 2-3)
    ↓
Phase 2: Dashboard & Overview (Week 4)
    ↓
Phase 3: Contract Management (Week 5-6)
    ↓
Phase 4: Maintenance Management (Week 7)
    ↓
Phase 5: Analytics & Reporting (Week 8)
    ↓
Phase 6: Testing & Polish (Week 9-10)
```

---

### Phase 0: Menu & Navigation Structure (Week 1) ⭐ PRIORITIZE

**Sprint 0.1: Frontend Navigation**

- [ ] **Update navigation component**
  - File: `frontend/components/layout/navigation.tsx` (hoặc sidebar)
  - Thêm menu item "Quản lý cho thuê" vào seller menu
  - Implement collapsible submenu
  - Add icons & labels

```tsx
// Pseudocode structure
const sellerMenuItems = [
  { label: 'Đăng tin', href: '/sell/my-listings' },
  { label: 'Đơn hàng', href: '/sell/orders' },
  { 
    label: 'Quản lý cho thuê', // ⭐ NEW
    icon: '🔑',
    submenu: [
      { label: 'Dashboard', href: '/sell/rental-management' },
      { label: 'Container', href: '/sell/rental-management/containers' },
      { label: 'Hợp đồng', href: '/sell/rental-management/contracts' },
      { label: 'Bảo trì', href: '/sell/rental-management/maintenance' },
      { label: 'Tài chính', href: '/sell/rental-management/finance' },
      { label: 'Báo cáo', href: '/sell/rental-management/reports' },
    ]
  }
];
```

- [ ] **Create route structure**
  ```
  frontend/app/[locale]/sell/rental-management/
  ├── page.tsx                              # Dashboard
  ├── containers/page.tsx                   # Container list
  ├── contracts/
  │   ├── page.tsx                          # Contract list
  │   └── [id]/page.tsx                     # Contract detail
  ├── maintenance/
  │   ├── page.tsx                          # Maintenance list
  │   └── [id]/page.tsx                     # Maintenance detail
  ├── finance/page.tsx                      # Finance overview
  └── reports/page.tsx                      # Reports & analytics
  ```

- [ ] **Create placeholder pages**
  - Mỗi page có basic layout + "Coming soon" message
  - Để test navigation flow
  - Add breadcrumbs

**Sprint 0.2: Authorization & Guards**

- [ ] **Middleware cho rental management routes**
  - Chỉ seller có listings RENTAL/LEASE mới access được
  - Redirect nếu user chưa login hoặc không phải seller
  
```tsx
// middleware.ts
if (path.startsWith('/sell/rental-management')) {
  const hasRentalListings = await checkUserHasRentalListings(userId);
  if (!hasRentalListings) {
    return redirect('/sell/my-listings?message=no-rental-listings');
  }
}
```

**Deliverables Phase 0:**
- ✅ Menu "Quản lý cho thuê" hiển thị trong sidebar
- ✅ 6 placeholder pages có thể access được
- ✅ Authorization middleware hoạt động
- ✅ Breadcrumbs navigation

---

### Phase 1: Database & Backend API (Week 2-3)

**Sprint 1.1: Database Schema**
- [ ] Tạo bảng `rental_contracts`
- [ ] Tạo bảng `container_maintenance_logs`
- [ ] Viết migration scripts
- [ ] Seed sample data cho testing

**Sprint 1.2: Backend APIs**
- [ ] GET `/api/v1/listings/:id/rental-contracts`
- [ ] GET `/api/v1/rental-contracts/:id`
- [ ] PATCH `/api/v1/rental-contracts/:id`
- [ ] GET `/api/v1/listings/:id/containers` (by status)
- [ ] POST `/api/v1/listings/:id/containers/:containerId/maintenance`
- [ ] GET `/api/v1/sellers/rental-stats`

**Sprint 1.3: Testing**
- [ ] Unit tests cho APIs
- [ ] Integration tests
- [ ] Manual testing với Postman/Insomnia

---

### Phase 2: Frontend - Dashboard & Overview (Week 4)

**Sprint 2.1: Dashboard Page**

**Route:** `/sell/rental-management/page.tsx`

- [ ] **Quick Stats Cards**
  ```tsx
  <StatsGrid>
    <StatCard 
      title="Tổng Container Cho Thuê"
      value={50}
      icon="📦"
      trend="+5 so với tháng trước"
    />
    <StatCard 
      title="Đang Cho Thuê"
      value={35}
      percentage={70}
      icon="🔵"
      subtitle="Occupancy Rate: 70%"
    />
    <StatCard 
      title="Có Sẵn"
      value={10}
      icon="🟢"
    />
    <StatCard 
      title="Đang Bảo Trì"
      value={5}
      icon="🟠"
    />
  </StatsGrid>
  ```

- [ ] **Revenue Overview**
  ```tsx
  <RevenueCard>
    <h3>Doanh Thu Tháng Này</h3>
    <div className="amount">3,500 USD</div>
    <div className="comparison">
      <TrendUp /> +15% so với tháng trước
    </div>
    <MiniChart data={monthlyRevenue} />
  </RevenueCard>
  ```

- [ ] **Upcoming Actions (Alerts)**
  ```tsx
  <AlertsSection>
    <Alert type="warning">
      <Icon>⏰</Icon>
      <span>5 hợp đồng sắp hết hạn trong 7 ngày tới</span>
      <Button variant="link">Xem chi tiết</Button>
    </Alert>
    <Alert type="info">
      <Icon>🔧</Icon>
      <span>2 container cần bảo trì định kỳ</span>
      <Button variant="link">Lên lịch</Button>
    </Alert>
    <Alert type="danger">
      <Icon>💰</Icon>
      <span>3 thanh toán quá hạn</span>
      <Button variant="link">Theo dõi</Button>
    </Alert>
  </AlertsSection>
  ```

- [ ] **Recent Activity Feed**
  ```tsx
  <ActivityFeed>
    <ActivityItem>
      <Avatar>👤</Avatar>
      <div>
        <strong>Nguyễn Văn A</strong> đã thuê container #CONT-123
        <TimeAgo>2 giờ trước</TimeAgo>
      </div>
    </ActivityItem>
    <ActivityItem>
      <Avatar>🔧</Avatar>
      <div>
        Bảo trì container #CONT-045 đã hoàn thành
        <TimeAgo>5 giờ trước</TimeAgo>
      </div>
    </ActivityItem>
  </ActivityFeed>
  ```

- [ ] **Quick Actions**
  ```tsx
  <QuickActionsGrid>
    <ActionCard href="/sell/rental-management/contracts">
      <Icon>📄</Icon>
      <h4>Xem Tất Cả Hợp Đồng</h4>
    </ActionCard>
    <ActionCard onClick={openMaintenanceModal}>
      <Icon>🔧</Icon>
      <h4>Tạo Bảo Trì Mới</h4>
    </ActionCard>
    <ActionCard href="/sell/rental-management/reports">
      <Icon>📊</Icon>
      <h4>Xuất Báo Cáo</h4>
    </ActionCard>
  </QuickActionsGrid>
  ```

**Sprint 2.2: Container List Page**

**Route:** `/sell/rental-management/containers/page.tsx`

- [ ] **Tabs & Filters**
  ```tsx
  <Tabs defaultValue="rented">
    <TabsList>
      <TabsTrigger value="all">
        Tất cả ({stats.total})
      </TabsTrigger>
      <TabsTrigger value="rented">
        🔵 Đang Thuê ({stats.rented})
      </TabsTrigger>
      <TabsTrigger value="available">
        🟢 Có Sẵn ({stats.available})
      </TabsTrigger>
      <TabsTrigger value="maintenance">
        🟠 Bảo Trì ({stats.maintenance})
      </TabsTrigger>
    </TabsList>
  </Tabs>
  ```

- [ ] **Container Cards (Rented View)**
  ```tsx
  <ContainerCard status="rented">
    <Header>
      <Badge variant="blue">Đang Thuê</Badge>
      <h3>Container #CONT-001</h3>
    </Header>
    
    <Section title="Thông Tin Listing">
      <p>20ft Standard - Tình trạng tốt</p>
      <p>Depot: Sài Gòn</p>
    </Section>
    
    <Section title="Người Thuê">
      <Avatar />
      <div>
        <strong>Nguyễn Văn A</strong>
        <p>Công ty ABC</p>
        <p>📧 nguyenvana@company.com</p>
        <p>📱 0901234567</p>
      </div>
    </Section>
    
    <Section title="Thời Gian Thuê">
      <DateRange>
        📅 01/11/2025 → 01/12/2025
      </DateRange>
      <CountdownBadge>
        ⏰ Còn 18 ngày
      </CountdownBadge>
    </Section>
    
    <Section title="Chi Phí">
      <p>💰 Giá thuê: 100 USD/tháng</p>
      <p>💵 Cọc: 200 USD</p>
    </Section>
    
    <Actions>
      <Button variant="outline">📞 Liên hệ</Button>
      <Button variant="outline">📄 Xem hợp đồng</Button>
      <DropdownMenu>
        <DropdownTrigger>⚙️ Hành động</DropdownTrigger>
        <DropdownContent>
          <Item>Gia hạn</Item>
          <Item>Kết thúc sớm</Item>
          <Item>Chuyển sang bảo trì</Item>
        </DropdownContent>
      </DropdownMenu>
    </Actions>
  </ContainerCard>
  ```

- [ ] **Available Containers View**
  ```tsx
  <ContainerCard status="available">
    <Header>
      <Badge variant="green">Sẵn Sàng</Badge>
      <h3>Container #CONT-005</h3>
    </Header>
    
    <Section>
      <p>✅ Sẵn sàng cho thuê</p>
      <p>📍 Depot Sài Gòn</p>
      <p>🔍 Đã kiểm tra - 05/11/2025</p>
    </Section>
    
    <Actions>
      <Button onClick={moveToMaintenance}>
        Chuyển sang Bảo Trì
      </Button>
      <Button variant="outline">
        Cho thuê thủ công
      </Button>
      <Button variant="ghost">
        Xem lịch sử
      </Button>
    </Actions>
  </ContainerCard>
  ```

- [ ] **Maintenance Containers View**
  ```tsx
  <ContainerCard status="maintenance">
    <Header>
      <Badge variant="orange">Bảo Trì</Badge>
      <h3>Container #CONT-010</h3>
    </Header>
    
    <Section>
      <p>🔧 Lý do: Sửa chữa cửa container</p>
      <p>📅 Bắt đầu: 10/11/2025</p>
      <p>⏰ Dự kiến xong: 15/11/2025</p>
      <ProgressBar value={60} label="Còn 2 ngày" />
      <p>💰 Chi phí ước tính: 50 USD</p>
    </Section>
    
    <Actions>
      <Button variant="success">
        ✅ Hoàn thành bảo trì
      </Button>
      <Button variant="outline">
        📝 Cập nhật tiến độ
      </Button>
    </Actions>
  </ContainerCard>
  ```

- [ ] **Bulk Actions**
  - Select multiple containers
  - Move to maintenance (batch)
  - Export selected

**Deliverables Phase 2:**
- ✅ Dashboard với stats, charts, alerts
- ✅ Container list với 3 tabs (Rented/Available/Maintenance)
- ✅ Container cards với full info
- ✅ Action buttons functional

---

### Phase 3: Contract Management (Week 5-6)

**Sprint 3.1: Contracts List Page**

**Route:** `/sell/rental-management/contracts/page.tsx`

- [ ] **Filters & Search**
  ```tsx
  <FiltersBar>
    <SearchInput 
      placeholder="Tìm theo tên khách hàng, container ID..."
    />
    <Select label="Trạng thái">
      <option value="all">Tất cả</option>
      <option value="active">Đang chạy</option>
      <option value="expiring">Sắp hết hạn</option>
      <option value="completed">Đã kết thúc</option>
      <option value="terminated">Đã hủy</option>
    </Select>
    <DateRangePicker label="Khoảng thời gian" />
  </FiltersBar>
  ```

- [ ] **Contracts Table**
  ```tsx
  <Table>
    <thead>
      <tr>
        <th>Hợp đồng</th>
        <th>Container</th>
        <th>Người thuê</th>
        <th>Thời gian</th>
        <th>Giá thuê</th>
        <th>Trạng thái</th>
        <th>Hành động</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>#RC-2024-001</strong>
          <small>Tạo: 01/11/2025</small>
        </td>
        <td>
          <Badge>#CONT-001</Badge>
          <small>20ft Standard</small>
        </td>
        <td>
          <Avatar />
          <div>
            <strong>Nguyễn Văn A</strong>
            <small>Công ty ABC</small>
          </div>
        </td>
        <td>
          <div>01/11 - 01/12/2025</div>
          <CountdownBadge variant="info">
            Còn 18 ngày
          </CountdownBadge>
        </td>
        <td>
          <strong>100 USD</strong>
          <small>/tháng</small>
        </td>
        <td>
          <StatusBadge status="active">
            Đang chạy
          </StatusBadge>
        </td>
        <td>
          <ActionMenu>
            <Item href="/contracts/RC-2024-001">
              Xem chi tiết
            </Item>
            <Item onClick={handleExtend}>Gia hạn</Item>
            <Item onClick={handleTerminate}>Kết thúc</Item>
          </ActionMenu>
        </td>
      </tr>
    </tbody>
  </Table>
  ```

- [ ] **Quick Stats**
  ```tsx
  <QuickStats>
    <Stat label="Tổng hợp đồng" value={25} />
    <Stat label="Đang chạy" value={15} color="green" />
    <Stat label="Sắp hết hạn" value={5} color="orange" />
    <Stat label="Quá hạn" value={2} color="red" />
  </QuickStats>
  ```

**Sprint 3.2: Contract Detail Page**

**Route:** `/sell/rental-management/contracts/[id]/page.tsx`

- [ ] **Contract Header**
  ```tsx
  <PageHeader>
    <Breadcrumbs>
      Quản lý cho thuê / Hợp đồng / #RC-2024-001
    </Breadcrumbs>
    <Title>Hợp Đồng #RC-2024-001</Title>
    <StatusBadge status="active">Đang chạy</StatusBadge>
    <Actions>
      <Button onClick={downloadPDF}>📥 Tải PDF</Button>
      <Button onClick={sendEmail}>📧 Gửi email</Button>
      <DropdownMenu>
        <Item>Gia hạn</Item>
        <Item>Kết thúc sớm</Item>
        <Item className="danger">Hủy hợp đồng</Item>
      </DropdownMenu>
    </Actions>
  </PageHeader>
  ```

- [ ] **Contract Details Tabs**
  ```tsx
  <Tabs defaultValue="overview">
    <TabsList>
      <TabsTrigger value="overview">Tổng quan</TabsTrigger>
      <TabsTrigger value="payments">Thanh toán</TabsTrigger>
      <TabsTrigger value="timeline">Lịch sử</TabsTrigger>
      <TabsTrigger value="documents">Tài liệu</TabsTrigger>
    </TabsList>
    
    <TabContent value="overview">
      <Grid cols={2}>
        {/* Left column */}
        <Card title="Thông Tin Hợp Đồng">
          <InfoRow label="Mã hợp đồng" value="#RC-2024-001" />
          <InfoRow label="Ngày tạo" value="01/11/2025" />
          <InfoRow label="Ngày bắt đầu" value="01/11/2025" />
          <InfoRow label="Ngày kết thúc" value="01/12/2025" />
          <InfoRow label="Thời hạn" value="30 ngày" />
          <InfoRow 
            label="Tự động gia hạn" 
            value={autoRenewal ? "Có" : "Không"} 
          />
        </Card>
        
        <Card title="Container">
          <ContainerPreview container={contract.container} />
          <Link href={`/sell/my-listings/${listing.id}`}>
            Xem listing
          </Link>
        </Card>
        
        {/* Right column */}
        <Card title="Người Thuê">
          <Avatar size="lg" />
          <h3>{buyer.name}</h3>
          <p>{buyer.company}</p>
          <InfoRow label="Email" value={buyer.email} />
          <InfoRow label="SĐT" value={buyer.phone} />
          <InfoRow label="Địa chỉ" value={buyer.address} />
          <Button variant="outline">📞 Liên hệ</Button>
        </Card>
        
        <Card title="Chi Phí">
          <InfoRow 
            label="Giá thuê" 
            value="100 USD/tháng" 
            className="text-lg font-bold"
          />
          <InfoRow label="Tiền cọc" value="200 USD" />
          <InfoRow label="Đã thanh toán" value="100 USD" />
          <InfoRow label="Phí trễ hạn" value="0 USD" />
          <Divider />
          <InfoRow 
            label="Tổng cộng" 
            value="300 USD" 
            className="text-xl font-bold"
          />
        </Card>
      </Grid>
    </TabContent>
    
    <TabContent value="payments">
      <PaymentsTimeline payments={contract.payments} />
    </TabContent>
    
    <TabContent value="timeline">
      <ActivityTimeline>
        <TimelineItem date="01/11/2025 10:30">
          ✅ Hợp đồng được tạo
        </TimelineItem>
        <TimelineItem date="01/11/2025 11:00">
          💰 Thanh toán tiền cọc: 200 USD
        </TimelineItem>
        <TimelineItem date="01/11/2025 14:00">
          🚚 Container được giao
        </TimelineItem>
        <TimelineItem date="05/11/2025 09:00">
          💵 Thanh toán tháng đầu: 100 USD
        </TimelineItem>
      </ActivityTimeline>
    </TabContent>
    
    <TabContent value="documents">
      <DocumentList>
        <DocumentItem 
          name="Hợp đồng thuê container.pdf"
          size="2.3 MB"
          date="01/11/2025"
          url="/documents/contract.pdf"
        />
        <DocumentItem 
          name="Biên bản giao nhận.pdf"
          size="1.1 MB"
          date="01/11/2025"
          url="/documents/handover.pdf"
        />
      </DocumentList>
      <Button onClick={uploadDocument}>
        📤 Tải tài liệu lên
      </Button>
    </TabContent>
  </Tabs>
  ```

**Sprint 3.3: Contract Actions (Modals)**

- [ ] **Extend Contract Modal**
  ```tsx
  <Modal title="Gia Hạn Hợp Đồng">
    <Form>
      <DatePicker 
        label="Ngày kết thúc mới"
        defaultValue={currentEndDate}
      />
      <Input 
        label="Giá thuê (có thể điều chỉnh)"
        type="number"
        defaultValue={currentPrice}
      />
      <Checkbox 
        label="Áp dụng điều chỉnh giá gia hạn"
        hint={`+${renewalPriceAdjustment}%`}
      />
      <Textarea 
        label="Ghi chú"
        placeholder="Lý do gia hạn, điều khoản mới..."
      />
      <Actions>
        <Button variant="outline" onClick={close}>Hủy</Button>
        <Button onClick={handleExtend}>Xác nhận gia hạn</Button>
      </Actions>
    </Form>
  </Modal>
  ```

- [ ] **Terminate Contract Modal**
  ```tsx
  <Modal title="Kết Thúc Hợp Đồng Sớm">
    <Alert variant="warning">
      ⚠️ Hợp đồng sẽ kết thúc trước hạn. 
      Vui lòng xác nhận các thông tin sau:
    </Alert>
    <Form>
      <DatePicker 
        label="Ngày kết thúc thực tế"
        max={contractEndDate}
      />
      <Select label="Lý do kết thúc">
        <option>Khách hàng yêu cầu</option>
        <option>Vi phạm hợp đồng</option>
        <option>Container cần bảo trì</option>
        <option>Khác</option>
      </Select>
      <Checkbox 
        label="Hoàn lại tiền cọc"
        defaultChecked
      />
      <Input 
        label="Số tiền hoàn lại"
        type="number"
        hint="Tiền cọc gốc: 200 USD"
      />
      <Textarea 
        label="Ghi chú"
        required
      />
      <Actions>
        <Button variant="outline" onClick={close}>Hủy</Button>
        <Button variant="danger" onClick={handleTerminate}>
          Kết thúc hợp đồng
        </Button>
      </Actions>
    </Form>
  </Modal>
  ```

**Deliverables Phase 3:**
- ✅ Contracts list với filters & search
- ✅ Contract detail page với full info
- ✅ Extend/Terminate contract modals
- ✅ Payment timeline
- ✅ Document management

---

### Phase 4: Maintenance Management (Week 7)
- [ ] Create route `/sell/my-listings/[id]/manage-rental/page.tsx`
- [ ] RentalOverview component (summary cards)
- [ ] OccupancyBar visualization
- [ ] Container tabs (Available/Rented/Maintenance)

**Sprint 4.1: Maintenance List Page**

**Route:** `/sell/rental-management/maintenance/page.tsx`

- [ ] **Status Tabs**
  ```tsx
  <Tabs defaultValue="in-progress">
    <TabsTrigger value="in-progress">
      Đang bảo trì ({stats.inProgress})
    </TabsTrigger>
    <TabsTrigger value="scheduled">
      Đã lên lịch ({stats.scheduled})
    </TabsTrigger>
    <TabsTrigger value="completed">
      Đã hoàn thành ({stats.completed})
    </TabsTrigger>
  </Tabs>
  ```

- [ ] **Maintenance Cards**
  ```tsx
  <MaintenanceCard>
    <Header>
      <Badge variant="orange">Đang bảo trì</Badge>
      <h3>Container #CONT-010</h3>
      <small>Listing: 20ft Standard</small>
    </Header>
    
    <Section title="Chi tiết bảo trì">
      <InfoRow label="Lý do" value="Sửa chữa cửa container" />
      <InfoRow label="Mô tả" value="Cửa bị kẹt, cần thay bản lề" />
      <InfoRow label="Bắt đầu" value="10/11/2025" />
      <InfoRow label="Dự kiến xong" value="15/11/2025" />
      <ProgressBar value={60} label="60% hoàn thành" />
      <CountdownBadge>⏰ Còn 2 ngày</CountdownBadge>
    </Section>
    
    <Section title="Chi phí">
      <InfoRow label="Ước tính" value="50 USD" />
      <InfoRow label="Thực tế" value="45 USD" />
    </Section>
    
    <Section title="Thực hiện bởi">
      <p>🏢 Công ty Sửa Chữa Container XYZ</p>
      <p>👷 Kỹ thuật viên: Trần Văn B</p>
    </Section>
    
    <Actions>
      <Button onClick={openUpdateModal}>
        📝 Cập nhật tiến độ
      </Button>
      <Button variant="success" onClick={openCompleteModal}>
        ✅ Hoàn thành
      </Button>
      <Button variant="ghost" onClick={viewPhotos}>
        🖼️ Xem ảnh
      </Button>
    </Actions>
  </MaintenanceCard>
  ```

- [ ] **Create Maintenance Button**
  ```tsx
  <FloatingActionButton onClick={openCreateMaintenanceModal}>
    + Tạo Bảo Trì Mới
  </FloatingActionButton>
  ```

**Sprint 4.2: Maintenance Modals**

- [ ] **Create Maintenance Modal**
  ```tsx
  <Modal title="Tạo Bảo Trì Mới">
    <Form>
      <Select label="Chọn Container" required>
        {availableContainers.map(c => (
          <option value={c.id}>
            {c.containerNumber} - {c.listingTitle}
          </option>
        ))}
      </Select>
      
      <Input 
        label="Lý do bảo trì"
        placeholder="VD: Sửa chữa cửa, sơn lại..."
        required
      />
      
      <Textarea 
        label="Mô tả chi tiết"
        placeholder="Mô tả vấn đề và công việc cần làm..."
      />
      
      <DatePicker 
        label="Ngày bắt đầu"
        defaultValue={today}
      />
      
      <DatePicker 
        label="Dự kiến hoàn thành"
        min={startDate}
      />
      
      <Input 
        label="Chi phí ước tính"
        type="number"
        suffix="USD"
      />
      
      <Input 
        label="Thực hiện bởi"
        placeholder="Tên công ty/kỹ thuật viên"
      />
      
      <FileUpload 
        label="Ảnh trước bảo trì"
        accept="image/*"
        multiple
      />
      
      <Textarea 
        label="Ghi chú kỹ thuật"
      />
      
      <Actions>
        <Button variant="outline" onClick={close}>Hủy</Button>
        <Button onClick={handleCreate}>Tạo bảo trì</Button>
      </Actions>
    </Form>
  </Modal>
  ```

- [ ] **Update Progress Modal**
  ```tsx
  <Modal title="Cập Nhật Tiến Độ">
    <Form>
      <Slider 
        label="Tiến độ hoàn thành"
        min={0}
        max={100}
        step={5}
        value={progress}
        suffix="%"
      />
      
      <Textarea 
        label="Cập nhật công việc"
        placeholder="Mô tả công việc đã hoàn thành..."
      />
      
      <FileUpload 
        label="Ảnh cập nhật"
        accept="image/*"
        multiple
      />
      
      <DatePicker 
        label="Dự kiến hoàn thành mới"
        hint="Nếu cần thay đổi thời gian"
      />
      
      <Input 
        label="Chi phí phát sinh"
        type="number"
        suffix="USD"
      />
      
      <Actions>
        <Button variant="outline" onClick={close}>Hủy</Button>
        <Button onClick={handleUpdate}>Lưu cập nhật</Button>
      </Actions>
    </Form>
  </Modal>
  ```

- [ ] **Complete Maintenance Modal**
  ```tsx
  <Modal title="Hoàn Thành Bảo Trì">
    <Alert variant="success">
      ✅ Xác nhận container đã được bảo trì xong và 
      sẵn sàng cho thuê lại?
    </Alert>
    
    <Form>
      <DatePicker 
        label="Ngày hoàn thành thực tế"
        max={today}
      />
      
      <Input 
        label="Chi phí thực tế"
        type="number"
        suffix="USD"
        defaultValue={estimatedCost}
      />
      
      <FileUpload 
        label="Ảnh sau bảo trì"
        accept="image/*"
        multiple
        required
      />
      
      <Textarea 
        label="Báo cáo kỹ thuật"
        placeholder="Tóm tắt công việc đã làm, vấn đề đã khắc phục..."
        required
      />
      
      <Textarea 
        label="Ghi chú của kỹ thuật viên"
      />
      
      <Checkbox 
        label="Container đã được kiểm tra và sẵn sàng cho thuê"
        required
      />
      
      <Actions>
        <Button variant="outline" onClick={close}>Hủy</Button>
        <Button variant="success" onClick={handleComplete}>
          Hoàn thành bảo trì
        </Button>
      </Actions>
    </Form>
  </Modal>
  ```

**Sprint 4.3: Maintenance Detail Page**

**Route:** `/sell/rental-management/maintenance/[id]/page.tsx`

- [ ] **Detail View**
  ```tsx
  <PageLayout>
    <Header>
      <Breadcrumbs />
      <Title>Bảo Trì #{maintenanceLog.id}</Title>
      <StatusBadge status={maintenanceLog.status} />
    </Header>
    
    <Grid cols={2}>
      <Card title="Thông Tin Bảo Trì">
        <InfoRow label="Container" value={container.number} />
        <InfoRow label="Lý do" value={maintenanceLog.reason} />
        <InfoRow label="Mô tả" value={maintenanceLog.description} />
        <InfoRow label="Bắt đầu" value={maintenanceLog.startDate} />
        <InfoRow label="Dự kiến xong" value={maintenanceLog.estimatedDate} />
        <InfoRow label="Hoàn thành" value={maintenanceLog.actualDate} />
        <ProgressBar value={maintenanceLog.progress} />
      </Card>
      
      <Card title="Chi Phí">
        <InfoRow label="Ước tính" value={`${estimatedCost} USD`} />
        <InfoRow label="Thực tế" value={`${actualCost} USD`} />
        <InfoRow 
          label="Chênh lệch" 
          value={`${diff} USD`}
          className={diff > 0 ? 'text-red' : 'text-green'}
        />
      </Card>
      
      <Card title="Thực Hiện Bởi">
        <InfoRow label="Công ty" value={performedBy} />
        <InfoRow label="Kỹ thuật viên" value={technician} />
        <InfoRow label="Ghi chú KTV" value={technicianNotes} />
      </Card>
      
      <Card title="Ảnh & Tài Liệu">
        <Tabs>
          <TabsTrigger value="before">Trước bảo trì</TabsTrigger>
          <TabsTrigger value="during">Trong quá trình</TabsTrigger>
          <TabsTrigger value="after">Sau bảo trì</TabsTrigger>
        </Tabs>
        <PhotoGallery photos={photos} />
      </Card>
    </Grid>
    
    <Card title="Lịch Sử Cập Nhật">
      <Timeline updates={maintenanceLog.updates} />
    </Card>
  </PageLayout>
  ```

**Deliverables Phase 4:**
- ✅ Maintenance list với tabs (In Progress/Scheduled/Completed)
- ✅ Create/Update/Complete maintenance modals
- ✅ Maintenance detail page
- ✅ Photo gallery & document upload
- ✅ Cost tracking

---

### Phase 5: Analytics & Reporting (Week 8)
- [ ] RentedContainerCard
  - Hiển thị thông tin người thuê
  - Countdown timer (còn X ngày)
  - Action buttons (Contact, View Contract, etc.)
- [ ] AvailableContainerCard
  - Status indicator
  - Action buttons (Move to Maintenance, etc.)
- [ ] MaintenanceContainerCard
  - Progress indicator
  - Cost tracking
  - Complete button

**Sprint 2.3: Modals & Interactions**
- [ ] ContractDetailsModal (xem chi tiết hợp đồng)
- [ ] MaintenanceModal (tạo/cập nhật bảo trì)
- [ ] ExtendContractModal (gia hạn)
- [ ] TerminateContractModal (kết thúc sớm)

**Sprint 5.1: Finance Overview Page**

**Route:** `/sell/rental-management/finance/page.tsx`

- [ ] **Revenue Summary Cards**
  ```tsx
  <Grid cols={4}>
    <StatCard 
      title="Doanh Thu Tháng Này"
      value="3,500 USD"
      trend="+15%"
      chart={<MiniLineChart data={thisMonthDaily} />}
    />
    <StatCard 
      title="Tiền Cọc Đang Giữ"
      value="6,000 USD"
      subtitle="30 hợp đồng"
    />
    <StatCard 
      title="Thanh Toán Chờ"
      value="500 USD"
      variant="warning"
      subtitle="5 hóa đơn"
    />
    <StatCard 
      title="Phí Trễ Hạn"
      value="150 USD"
      variant="danger"
      subtitle="3 khách hàng"
    />
  </Grid>
  ```

- [ ] **Revenue Trend Chart**
  ```tsx
  <Card title="Xu Hướng Doanh Thu">
    <ChartControls>
      <Select defaultValue="6months">
        <option value="1month">1 tháng</option>
        <option value="3months">3 tháng</option>
        <option value="6months">6 tháng</option>
        <option value="1year">1 năm</option>
      </Select>
      <ToggleGroup>
        <Toggle value="revenue">Doanh thu</Toggle>
        <Toggle value="contracts">Hợp đồng</Toggle>
        <Toggle value="occupancy">Tỷ lệ lấp đầy</Toggle>
      </ToggleGroup>
    </ChartControls>
    <LineChart 
      data={revenueData}
      xAxis="month"
      yAxis="amount"
      height={400}
    />
  </Card>
  ```

- [ ] **Payment Status Breakdown**
  ```tsx
  <Card title="Tình Trạng Thanh Toán">
    <DonutChart 
      data={[
        { label: 'Đã thanh toán', value: 80, color: 'green' },
        { label: 'Chờ thanh toán', value: 15, color: 'orange' },
        { label: 'Quá hạn', value: 5, color: 'red' },
      ]}
    />
    <Legend />
  </Card>
  ```

- [ ] **Upcoming Payments Table**
  ```tsx
  <Card title="Thanh Toán Sắp Tới">
    <Table>
      <thead>
        <tr>
          <th>Ngày đến hạn</th>
          <th>Hợp đồng</th>
          <th>Khách hàng</th>
          <th>Số tiền</th>
          <th>Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        {upcomingPayments.map(p => (
          <tr>
            <td>{p.dueDate}</td>
            <td>#{p.contractId}</td>
            <td>{p.customerName}</td>
            <td>{p.amount} USD</td>
            <td>
              <Badge variant={p.isOverdue ? 'danger' : 'info'}>
                {p.isOverdue ? 'Quá hạn' : 'Đến hạn'}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  </Card>
  ```

**Sprint 5.2: Reports Page**

**Route:** `/sell/rental-management/reports/page.tsx`

- [ ] **Report Builder**
  ```tsx
  <Card title="Tạo Báo Cáo">
    <Form>
      <Select label="Loại báo cáo">
        <option>Doanh thu theo tháng</option>
        <option>Tỷ lệ lấp đầy</option>
        <option>Chi phí bảo trì</option>
        <option>Phân tích khách hàng</option>
        <option>ROI theo listing</option>
      </Select>
      
      <DateRangePicker 
        label="Khoảng thời gian"
        defaultValue="last3months"
      />
      
      <MultiSelect label="Listings">
        {listings.map(l => (
          <option value={l.id}>{l.title}</option>
        ))}
      </MultiSelect>
      
      <Select label="Định dạng">
        <option value="pdf">PDF</option>
        <option value="excel">Excel</option>
        <option value="csv">CSV</option>
      </Select>
      
      <Button onClick={generateReport}>
        📊 Tạo báo cáo
      </Button>
    </Form>
  </Card>
  ```

- [ ] **Key Metrics Dashboard**
  ```tsx
  <Grid cols={3}>
    <MetricCard title="Occupancy Rate">
      <BigNumber value="70%" />
      <Trend value="+5%" period="vs tháng trước" />
      <SparklineChart data={occupancyTrend} />
    </MetricCard>
    
    <MetricCard title="Average Rental Duration">
      <BigNumber value="45 ngày" />
      <Trend value="+3 ngày" period="vs tháng trước" />
    </MetricCard>
    
    <MetricCard title="Contract Renewal Rate">
      <BigNumber value="65%" />
      <Trend value="+10%" period="vs tháng trước" />
    </MetricCard>
    
    <MetricCard title="Monthly Recurring Revenue">
      <BigNumber value="3,500 USD" />
      <Trend value="+15%" period="vs tháng trước" />
    </MetricCard>
    
    <MetricCard title="Customer Lifetime Value">
      <BigNumber value="450 USD" />
      <Trend value="+20 USD" period="vs tháng trước" />
    </MetricCard>
    
    <MetricCard title="Maintenance Cost Ratio">
      <BigNumber value="12%" />
      <Trend value="-2%" period="vs tháng trước" isPositive />
    </MetricCard>
  </Grid>
  ```

- [ ] **Top Performing Listings**
  ```tsx
  <Card title="Listings Hiệu Quả Nhất">
    <Table>
      <thead>
        <tr>
          <th>Listing</th>
          <th>Occupancy Rate</th>
          <th>Revenue (3 tháng)</th>
          <th>Renewal Rate</th>
          <th>ROI</th>
        </tr>
      </thead>
      <tbody>
        {topListings.map(l => (
          <tr>
            <td>
              <Link href={`/sell/my-listings/${l.id}`}>
                {l.title}
              </Link>
            </td>
            <td>
              <ProgressBar value={l.occupancyRate} />
              {l.occupancyRate}%
            </td>
            <td>{l.revenue} USD</td>
            <td>{l.renewalRate}%</td>
            <td className="text-green">{l.roi}%</td>
          </tr>
        ))}
      </tbody>
    </Table>
  </Card>
  ```

- [ ] **Customer Insights**
  ```tsx
  <Card title="Phân Tích Khách Hàng">
    <Tabs>
      <TabsTrigger value="top">Top Khách Hàng</TabsTrigger>
      <TabsTrigger value="retention">Retention</TabsTrigger>
      <TabsTrigger value="churn">Churn</TabsTrigger>
    </Tabs>
    
    <TabContent value="top">
      <RankingList>
        {topCustomers.map((c, i) => (
          <RankingItem rank={i+1}>
            <Avatar src={c.avatar} />
            <div>
              <strong>{c.name}</strong>
              <small>{c.company}</small>
            </div>
            <div>
              <Badge>{c.contractCount} hợp đồng</Badge>
              <span>{c.totalRevenue} USD</span>
            </div>
          </RankingItem>
        ))}
      </RankingList>
    </TabContent>
    
    <TabContent value="retention">
      <RetentionMatrix data={retentionData} />
    </TabContent>
    
    <TabContent value="churn">
      <ChurnAnalysis data={churnData} />
    </TabContent>
  </Card>
  ```

**Sprint 5.3: Export Functionality**

- [ ] **PDF Report Generator**
  ```tsx
  // Using react-pdf or similar
  const PDFReport = ({ data }) => (
    <Document>
      <Page>
        <View style={styles.header}>
          <Text>BÁO CÁO QUẢN LÝ CHO THUÊ CONTAINER</Text>
          <Text>Kỳ báo cáo: {data.period}</Text>
        </View>
        
        <View style={styles.summary}>
          <Text>TỔNG QUAN</Text>
          <Row>
            <Text>Tổng doanh thu:</Text>
            <Text>{data.totalRevenue} USD</Text>
          </Row>
          <Row>
            <Text>Occupancy Rate:</Text>
            <Text>{data.occupancyRate}%</Text>
          </Row>
        </View>
        
        <View style={styles.charts}>
          <Image src={revenueChartImage} />
        </View>
        
        <View style={styles.table}>
          <Text>CHI TIẾT HỢP ĐỒNG</Text>
          <DataTable data={data.contracts} />
        </View>
      </Page>
    </Document>
  );
  ```

- [ ] **Excel Export**
  ```tsx
  import * as XLSX from 'xlsx';
  
  const exportToExcel = (data) => {
    const workbook = XLSX.utils.book_new();
    
    // Sheet 1: Summary
    const summaryData = [
      ['Báo Cáo Quản Lý Cho Thuê Container'],
      ['Kỳ báo cáo', data.period],
      [],
      ['Tổng doanh thu', data.totalRevenue + ' USD'],
      ['Occupancy Rate', data.occupancyRate + '%'],
      ['Số hợp đồng đang chạy', data.activeContracts],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng Quan');
    
    // Sheet 2: Contracts
    const contractsSheet = XLSX.utils.json_to_sheet(data.contracts);
    XLSX.utils.book_append_sheet(workbook, contractsSheet, 'Hợp Đồng');
    
    // Sheet 3: Revenue
    const revenueSheet = XLSX.utils.json_to_sheet(data.revenueByMonth);
    XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Doanh Thu');
    
    // Download
    XLSX.writeFile(workbook, `rental-report-${Date.now()}.xlsx`);
  };
  ```

**Deliverables Phase 5:**
- ✅ Finance overview page với revenue tracking
- ✅ Reports page với custom report builder
- ✅ Key metrics dashboard (Occupancy, MRR, CLV, etc.)
- ✅ Top performing listings analysis
- ✅ Customer insights & retention analysis
- ✅ PDF & Excel export functionality

---

### Phase 6: Testing & Polish (Week 9-10)

**Sprint 3.1: Revenue Statistics**
- [ ] RentalStats component
- [ ] Revenue chart (by month)
- [ ] Occupancy rate chart
- [ ] Export to Excel feature

**Sprint 3.2: Rental History**
- [ ] RentalHistoryTable component
- [ ] Filter by date range, status
- [ ] Pagination
- [ ] Search by tenant name

**Sprint 6.1: Unit & Integration Testing**

- [ ] **API Tests**
  ```typescript
  describe('Rental Contracts API', () => {
    test('GET /api/v1/listings/:id/rental-contracts', async () => {
      // Test fetch contracts for listing
    });
    
    test('PATCH /api/v1/rental-contracts/:id - Extend', async () => {
      // Test contract extension
    });
    
    test('PATCH /api/v1/rental-contracts/:id - Terminate', async () => {
      // Test early termination
    });
  });
  
  describe('Maintenance API', () => {
    test('POST /api/v1/maintenance-logs', async () => {
      // Test create maintenance
    });
    
    test('PATCH /api/v1/maintenance-logs/:id/complete', async () => {
      // Test complete maintenance
    });
  });
  ```

- [ ] **Component Tests**
  ```typescript
  describe('ContainerCard', () => {
    test('renders rented status correctly', () => {});
    test('shows countdown timer', () => {});
    test('displays buyer info', () => {});
  });
  
  describe('ContractDetailsModal', () => {
    test('loads contract data', () => {});
    test('handles extend action', () => {});
    test('handles terminate action', () => {});
  });
  ```

**Sprint 6.2: E2E Testing**

- [ ] **User Flows**
  ```typescript
  // Using Playwright or Cypress
  
  test('Seller views rental dashboard', async ({ page }) => {
    await page.goto('/sell/rental-management');
    await expect(page.getByText('Tổng Container')).toBeVisible();
    await expect(page.getByText('Đang Cho Thuê')).toBeVisible();
  });
  
  test('Seller creates maintenance', async ({ page }) => {
    await page.goto('/sell/rental-management/containers');
    await page.click('[data-testid="container-actions"]');
    await page.click('text=Chuyển sang Bảo Trì');
    await page.fill('[name="reason"]', 'Sửa cửa');
    await page.click('text=Tạo bảo trì');
    await expect(page.getByText('Bảo trì đã được tạo')).toBeVisible();
  });
  
  test('Seller extends contract', async ({ page }) => {
    await page.goto('/sell/rental-management/contracts');
    await page.click('[data-testid="contract-row-1"]');
    await page.click('text=Gia hạn');
    await page.fill('[name="newEndDate"]', '2026-01-01');
    await page.click('text=Xác nhận gia hạn');
    await expect(page.getByText('Hợp đồng đã được gia hạn')).toBeVisible();
  });
  ```

**Sprint 6.3: Performance Optimization**

- [ ] **Database Optimization**
  - Index optimization cho queries thường dùng
  - Query performance analysis
  - Implement caching (Redis) cho stats

- [ ] **Frontend Optimization**
  - Lazy load components
  - Image optimization
  - Bundle size reduction
  - React.memo cho expensive components

- [ ] **API Optimization**
  - Pagination cho large datasets
  - GraphQL/DataLoader pattern
  - Rate limiting

**Sprint 6.4: UI/UX Polish**

- [ ] **Responsive Design**
  - Test trên mobile, tablet, desktop
  - Fix layout issues
  - Touch-friendly controls

- [ ] **Accessibility (a11y)**
  - Keyboard navigation
  - Screen reader support
  - ARIA labels
  - Color contrast compliance

- [ ] **Loading States**
  - Skeleton loaders
  - Spinner animations
  - Error states
  - Empty states

- [ ] **Micro-interactions**
  - Button hover effects
  - Smooth transitions
  - Toast notifications
  - Confirmation dialogs

**Sprint 6.5: Documentation**

- [ ] **Technical Docs**
  ```markdown
  # Rental Management System - Technical Documentation
  
  ## Architecture
  - Database schema
  - API endpoints
  - Frontend components tree
  - State management flow
  
  ## Installation
  - Prerequisites
  - Setup steps
  - Environment variables
  
  ## Usage
  - User guides for each feature
  - API documentation
  - Code examples
  ```

- [ ] **User Guide**
  ```markdown
  # Hướng Dẫn Sử Dụng Quản Lý Cho Thuê Container
  
  ## Tổng quan Dashboard
  ## Quản lý Container
  ## Quản lý Hợp đồng
  ## Quản lý Bảo trì
  ## Xem báo cáo
  ## FAQ
  ```

**Sprint 6.6: UAT & Deployment**

- [ ] **UAT Checklist**
  - [ ] Seller có thể xem dashboard
  - [ ] Seller có thể xem danh sách container theo status
  - [ ] Seller có thể xem thông tin người thuê
  - [ ] Seller có thể gia hạn hợp đồng
  - [ ] Seller có thể kết thúc hợp đồng
  - [ ] Seller có thể tạo bảo trì
  - [ ] Seller có thể hoàn thành bảo trì
  - [ ] Seller có thể xem thống kê doanh thu
  - [ ] Seller có thể xuất báo cáo Excel/PDF
  - [ ] All notifications work correctly
  - [ ] Email templates render correctly
  - [ ] Mobile responsive works

- [ ] **Deploy to Staging**
  - Run migration scripts
  - Seed test data
  - Smoke testing
  - Performance testing

- [ ] **Production Deployment**
  - Database backup
  - Run migrations
  - Deploy backend
  - Deploy frontend
  - Monitor logs & errors
  - Rollback plan ready

**Deliverables Phase 6:**
- ✅ All features tested (unit + integration + E2E)
- ✅ Performance optimized
- ✅ UI/UX polished & responsive
- ✅ Documentation complete
- ✅ UAT passed
- ✅ Production deployment successful

---

## � METRICS ĐỂ ĐÁNH GIÁ THÀNH CÔNG

### 📈 Usage Metrics

**Mục tiêu theo dõi sau khi deploy:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Menu Access Rate** | >60% sellers có rental listings | % sellers click vào "Quản lý cho thuê" menu |
| **Dashboard DAU** | >50% sellers active monthly | Daily Active Users trên dashboard |
| **Feature Adoption** | >70% trong 1 tháng | % sellers sử dụng ít nhất 1 feature (extend contract, maintenance, etc.) |
| **Time on Page** | >3 minutes average | Average session duration trên rental management pages |
| **Return Rate** | >80% trong tuần | % sellers quay lại sử dụng menu trong 7 ngày |

### 💼 Business Metrics

| Metric | Target | Impact |
|--------|--------|--------|
| **Occupancy Rate** | >65% average | % container đang được thuê / tổng container |
| **Contract Renewal Rate** | >60% | % hợp đồng được gia hạn / tổng hợp đồng hết hạn |
| **Average Rental Duration** | >45 days | Thời gian thuê trung bình |
| **Revenue from Rentals** | 30% of total | % doanh thu từ cho thuê / tổng doanh thu |
| **Customer Lifetime Value** | >500 USD | Revenue trung bình từ 1 khách hàng thuê |
| **Maintenance Cost Ratio** | <15% | Chi phí bảo trì / doanh thu cho thuê |

### 👥 UX Metrics

| Metric | Target | Tool |
|--------|--------|------|
| **Task Completion Rate** | >90% | % users hoàn thành task (extend contract, create maintenance, etc.) |
| **Time to Complete Task** | <2 minutes | Average time để hoàn thành 1 action |
| **Error Rate** | <5% | % failed actions / total actions |
| **User Satisfaction Score** | >4/5 | Survey after using features |
| **Support Tickets** | <10/month | Số ticket liên quan đến rental management |

### 🎯 KPIs By Phase

**Phase 0-2 (Week 1-4):**
- ✅ Menu accessible by all sellers with rental listings
- ✅ Dashboard loads in <2s
- ✅ Container list displays correctly

**Phase 3-4 (Week 5-7):**
- ✅ >50% sellers view contract details
- ✅ >30% sellers create at least 1 maintenance log
- ✅ Contract extend/terminate success rate >95%

**Phase 5-6 (Week 8-10):**
- ✅ >40% sellers view reports
- ✅ >20% sellers export data (Excel/PDF)
- ✅ Average occupancy rate visible and >60%

---

## �📝 NOTES & CONSIDERATIONS

### 🔐 Security & Privacy

**1. Authorization:**
- ✅ Chỉ seller owner mới xem được rental contracts của listings mình
- ✅ Không cho phép seller A xem contracts của seller B
- ✅ JWT token validation trên mọi API calls
- ✅ Rate limiting để prevent abuse

**2. Data Privacy (GDPR Compliance):**
- ✅ Thông tin buyer (email, phone) chỉ hiển thị cho seller của contract đó
- ✅ Buyer có quyền request xóa dữ liệu cá nhân
- ✅ Audit logs cho mọi thao tác nhạy cảm (view buyer info, export data)
- ✅ Encryption cho dữ liệu nhạy cảm trong database

**3. Payment Security:**
- ✅ Tiền cọc phải được xử lý qua payment gateway (VNPay/Stripe)
- ✅ Không lưu thông tin thẻ tín dụng trực tiếp
- ✅ Escrow system cho tiền cọc
- ✅ Refund workflow khi kết thúc hợp đồng

### ⚙️ Business Logic

**1. Auto Status Updates:**

```typescript
// Cron job chạy mỗi ngày lúc 00:00
async function updateExpiredContracts() {
  const expiredContracts = await prisma.rental_contracts.findMany({
    where: {
      end_date: { lte: new Date() },
      status: 'ACTIVE'
    }
  });
  
  for (const contract of expiredContracts) {
    // Update contract status
    await prisma.rental_contracts.update({
      where: { id: contract.id },
      data: { status: 'COMPLETED', completed_at: new Date() }
    });
    
    // Update container status: RENTED → AVAILABLE
    await prisma.listings.update({
      where: { id: contract.listing_id },
      data: {
        rented_quantity: { decrement: 1 },
        available_quantity: { increment: 1 }
      }
    });
    
    // Send notification to seller
    await sendNotification({
      userId: contract.seller_id,
      type: 'CONTRACT_COMPLETED',
      message: `Hợp đồng ${contract.id} đã hết hạn. Container đã trở về trạng thái Available.`
    });
    
    // Send notification to buyer
    await sendNotification({
      userId: contract.buyer_id,
      type: 'CONTRACT_COMPLETED',
      message: `Hợp đồng thuê của bạn đã hết hạn. Vui lòng trả container.`
    });
  }
}
```

**2. Auto Renewal Logic:**

```typescript
async function processAutoRenewals() {
  const contractsNearExpiry = await prisma.rental_contracts.findMany({
    where: {
      end_date: {
        gte: new Date(),
        lte: addDays(new Date(), 7) // 7 days before expiry
      },
      auto_renewal: true,
      status: 'ACTIVE'
    }
  });
  
  for (const contract of contractsNearExpiry) {
    // Send renewal notice to buyer
    const daysBeforeExpiry = differenceInDays(contract.end_date, new Date());
    
    if (daysBeforeExpiry === contract.renewal_notice_days) {
      await sendEmail({
        to: contract.buyer.email,
        subject: 'Hợp đồng thuê sắp hết hạn - Gia hạn tự động',
        template: 'renewal-notice',
        data: {
          contractId: contract.id,
          endDate: contract.end_date,
          newPrice: calculateRenewalPrice(contract),
          optOutLink: generateOptOutLink(contract.id)
        }
      });
    }
    
    // If buyer didn't opt-out, auto-renew
    if (daysBeforeExpiry === 0 && !contract.renewal_opt_out) {
      await extendContract({
        contractId: contract.id,
        newEndDate: addMonths(contract.end_date, 1),
        priceAdjustment: contract.renewal_price_adjustment
      });
    }
  }
}
```

**3. Late Fee Calculation:**

```typescript
async function calculateLateFees() {
  const overduePayments = await prisma.payments.findMany({
    where: {
      due_date: { lt: new Date() },
      status: 'PENDING'
    }
  });
  
  for (const payment of overduePayments) {
    const contract = await prisma.rental_contracts.findUnique({
      where: { id: payment.contract_id }
    });
    
    const daysOverdue = differenceInDays(new Date(), payment.due_date);
    
    let lateFee = 0;
    if (contract.late_return_fee_unit === 'PER_DAY') {
      lateFee = daysOverdue * contract.late_return_fee_amount;
    } else if (contract.late_return_fee_unit === 'PER_WEEK') {
      lateFee = Math.floor(daysOverdue / 7) * contract.late_return_fee_amount;
    }
    
    await prisma.rental_contracts.update({
      where: { id: contract.id },
      data: {
        late_fees: { increment: lateFee },
        days_overdue: daysOverdue
      }
    });
    
    // Send notification
    await sendNotification({
      userId: contract.buyer_id,
      type: 'LATE_FEE_APPLIED',
      message: `Phí trễ hạn ${lateFee} USD đã được áp dụng cho hợp đồng ${contract.id}`
    });
  }
}
```

### 🔔 Notifications & Alerts

**1. Real-time Notifications:**

| Event | Recipient | Channel | Priority |
|-------|-----------|---------|----------|
| Hợp đồng mới được tạo | Seller | In-app + Email | Medium |
| Thanh toán thành công | Seller + Buyer | In-app + Email | High |
| Hợp đồng sắp hết hạn (7 ngày) | Seller + Buyer | In-app + Email + SMS | High |
| Thanh toán quá hạn | Seller + Buyer | In-app + Email + SMS | Critical |
| Bảo trì hoàn thành | Seller | In-app | Medium |
| Container trở về Available | Seller | In-app | Low |
| Gia hạn tự động thành công | Seller + Buyer | In-app + Email | Medium |

**2. Email Templates:**

```html
<!-- Contract Expiring Soon -->
<EmailTemplate>
  <Header>Hợp đồng thuê sắp hết hạn</Header>
  <Body>
    <p>Xin chào {buyer_name},</p>
    <p>Hợp đồng thuê container của bạn sẽ hết hạn vào <strong>{end_date}</strong>.</p>
    
    <ContractDetails>
      <Row>Container: {container_number}</Row>
      <Row>Giá thuê: {price} USD/tháng</Row>
      <Row>Còn lại: {days_remaining} ngày</Row>
    </ContractDetails>
    
    <CTA>
      <Button href="{extend_link}">Gia hạn ngay</Button>
      <Button href="{contact_seller_link}">Liên hệ người cho thuê</Button>
    </CTA>
  </Body>
</EmailTemplate>
```

### 🔗 Integration Points

**1. Payment Gateway:**
- VNPay cho VND
- Stripe cho USD/international
- Escrow account cho tiền cọc
- Auto-refund khi kết thúc hợp đồng

**2. Email Service:**
- SendGrid / AWS SES
- Transactional emails (contracts, receipts)
- Marketing emails (renewal reminders)

**3. SMS Gateway:**
- Twilio / Nexmo
- Critical alerts only (payment overdue, contract expiring)

**4. Accounting Software:**
- QuickBooks / Xero integration (future)
- Auto-sync revenue data
- Generate invoices

**5. CRM:**
- Salesforce / HubSpot (future)
- Track customer interactions
- Sales pipeline for renewals

### 📱 Mobile Considerations

**Responsive breakpoints:**
- Mobile: <640px
- Tablet: 640px - 1024px
- Desktop: >1024px

**Mobile-specific features:**
- Swipe gestures cho navigation
- Bottom sheet modals instead of center modals
- Simplified dashboard (key metrics only)
- Click-to-call buttons
- Native date/time pickers

### 🌐 Internationalization (i18n)

**Languages to support:**
- ✅ Tiếng Việt (primary)
- ✅ English (secondary)
- 🔜 中文 (future - for Chinese market)

**Currency support:**
- ✅ VND
- ✅ USD
- 🔜 EUR, CNY (future)

**Date/Time formats:**
- VN: DD/MM/YYYY
- EN: MM/DD/YYYY
- Auto-detect based on locale

---

## ✅ CHECKLIST HOÀN CHỈNH (UPDATED)

### Phase 0: Menu & Navigation
- [ ] Navigation component updated with "Quản lý cho thuê" menu
- [ ] Collapsible submenu với 6 items
- [ ] Route structure created (6 placeholder pages)
- [ ] Authorization middleware implemented
- [ ] Breadcrumbs navigation

### Phase 1: Backend
- [x] Database schema cho listings (rental fields) ✅
- [x] API tạo listing cho thuê ✅
- [x] Validation cho rental fields ✅
- [x] Master data (md_rental_units) ✅
- [ ] Table `rental_contracts`
- [ ] Table `container_maintenance_logs`
- [ ] API quản lý rental contracts (CRUD)
- [ ] API quản lý maintenance logs (CRUD)
- [ ] API statistics cho seller
- [ ] Cron jobs (auto-renewal, late fees, status updates)

### Phase 2: Frontend - Dashboard & Containers
- [ ] Dashboard page với quick stats
- [ ] Revenue overview cards
- [ ] Upcoming actions/alerts section
- [ ] Recent activity feed
- [ ] Container list page với tabs (Rented/Available/Maintenance)
- [ ] Rented container cards (with buyer info, countdown)
- [ ] Available container cards
- [ ] Maintenance container cards
- [ ] Bulk actions for containers

### Phase 3: Contracts
- [ ] Contracts list page với filters & search
- [ ] Contracts table với pagination
- [ ] Contract detail page (overview, payments, timeline, documents)
- [ ] Extend contract modal
- [ ] Terminate contract modal
- [ ] Contract PDF generation
- [ ] Email contract to buyer

### Phase 4: Maintenance
- [ ] Maintenance list page với tabs
- [ ] Create maintenance modal
- [ ] Update progress modal
- [ ] Complete maintenance modal
- [ ] Maintenance detail page
- [ ] Photo gallery & upload
- [ ] Cost tracking & comparison

### Phase 5: Analytics & Reporting
- [ ] Finance overview page (revenue, deposits, late fees)
- [ ] Revenue trend chart
- [ ] Payment status breakdown
- [ ] Reports page với report builder
- [ ] Key metrics dashboard (Occupancy, MRR, CLV, Renewal Rate)
- [ ] Top performing listings analysis
- [ ] Customer insights (top customers, retention, churn)
- [ ] PDF report export
- [ ] Excel report export

### Phase 6: Testing & Polish
- [ ] Unit tests (APIs, components)
- [ ] Integration tests
- [ ] E2E tests (user flows)
- [ ] Performance optimization (DB, API, Frontend)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Accessibility (a11y) compliance
- [ ] Loading/Error/Empty states
- [ ] Micro-interactions & animations
- [ ] Technical documentation
- [ ] User guide
- [ ] UAT checklist completed
- [ ] Staging deployment
- [ ] Production deployment

---

## 🎯 KẾT LUẬN

### 📊 Tổng Quan Tình Hình

**✅ Nền Tảng Vững Chắc (Đã Có):**
- Cơ sở hạ tầng database hoàn chỉnh cho listings cho thuê
- API tạo & validate listings RENTAL/LEASE hoạt động tốt
- UI form đăng tin với đầy đủ rental fields
- Master data (rental units, currencies) đã seed
- Validation logic chặt chẽ (quantity balance, deposit, duration)

**❌ Thiếu Hoàn Toàn (Cần Làm Ngay):**
- **KHÔNG CÓ** menu quản lý container cho thuê
- **KHÔNG CÓ** trang xem chi tiết containers đang được thuê
- **KHÔNG CÓ** thông tin người thuê (buyer info)
- **KHÔNG CÓ** quản lý hợp đồng (contracts)
- **KHÔNG CÓ** quản lý bảo trì (maintenance)
- **KHÔNG CÓ** thống kê doanh thu & analytics
- **KHÔNG CÓ** báo cáo & export data

### 🎯 **QUYẾT ĐỊNH QUAN TRỌNG: NÊN TẠO MENU RIÊNG**

#### **TẠI SAO?**

1. **Khối lượng công việc lớn:**
   - 6 pages chính (Dashboard, Containers, Contracts, Maintenance, Finance, Reports)
   - 10+ modals & components
   - 15+ API endpoints mới
   - 2 database tables mới
   - Nhiều business logic phức tạp (auto-renewal, late fees, status updates)

2. **User flow hoàn toàn khác:**
   - BÁN = One-time transaction, focus on VOLUME
   - CHO THUÊ = Continuous management, focus on UTILIZATION
   - Cần dashboard, analytics, monitoring tools riêng

3. **Scalability & Professional:**
   - Dễ thêm features mới (auto-pricing, demand forecasting, CRM)
   - Phù hợp cho enterprise customers
   - Clear separation of concerns

#### **CÁCH TRIỂN KHAI?**

**✅ RECOMMENDED: Option 1 - Submenu trong "Bán Hàng"**

```
📦 Bán Hàng
├─ 📝 Đăng tin
├─ 📊 Đơn hàng
└─ 🔑 Quản lý cho thuê ⭐ MỚI
    ├─ 📊 Dashboard
    ├─ 📦 Container
    ├─ 📄 Hợp đồng
    ├─ 🔧 Bảo trì
    ├─ 💰 Tài chính
    └─ 📈 Báo cáo
```

**Lý do:**
- Balance giữa organization & simplicity
- Không phá vỡ navigation hiện tại
- Dễ implement (chỉ cần thêm routes + components)
- Scalable cho future features

---

### 🚀 Ưu Tiên Phát Triển

#### **🔴 CRITICAL - PHẢI LÀM NGAY (Week 1-4)**

**Phase 0: Menu & Navigation (Week 1)**
1. ✅ Tạo menu structure "Quản lý cho thuê"
2. ✅ Tạo 6 placeholder pages với routing
3. ✅ Authorization middleware
4. ✅ Breadcrumbs navigation

**Phase 1: Database & Core APIs (Week 2-3)**
1. ✅ Tạo bảng `rental_contracts`
2. ✅ Tạo bảng `container_maintenance_logs`
3. ✅ API lấy danh sách contracts
4. ✅ API lấy containers by status
5. ✅ API create/update maintenance

**Phase 2: Dashboard & Container Management (Week 4)**
1. ✅ Dashboard với quick stats
2. ✅ Container list với tabs (Rented/Available/Maintenance)
3. ✅ Container cards hiển thị đầy đủ info

#### **🟡 HIGH PRIORITY - LÀM TIẾP (Week 5-7)**

**Phase 3: Contract Management (Week 5-6)**
1. ✅ Contracts list & detail page
2. ✅ Extend/Terminate contract modals
3. ✅ Payment timeline

**Phase 4: Maintenance Management (Week 7)**
1. ✅ Maintenance list & modals
2. ✅ Photo upload & progress tracking
3. ✅ Complete maintenance workflow

#### **🟢 MEDIUM PRIORITY - TỐT NẾU CÓ (Week 8-10)**

**Phase 5: Analytics & Reporting (Week 8)**
1. ✅ Finance overview
2. ✅ Revenue charts & trends
3. ✅ Key metrics (Occupancy, MRR, CLV)
4. ✅ Export Excel/PDF

**Phase 6: Testing & Polish (Week 9-10)**
1. ✅ Unit + Integration + E2E tests
2. ✅ Performance optimization
3. ✅ UI/UX polish & responsive
4. ✅ Documentation & UAT

---

### 📈 Dự Kiến Tác Động

**Business Impact:**
- ✅ Tăng occupancy rate lên 70%+ (hiện tại sellers không biết container nào available)
- ✅ Tăng contract renewal rate lên 60%+ (có reminder & easy extend)
- ✅ Giảm support tickets 40% (sellers tự quản lý được)
- ✅ Tăng revenue from rentals 30% (better management → more listings)

**User Experience:**
- ✅ Sellers có visibility đầy đủ vào rental portfolio
- ✅ Quản lý tập trung tất cả trong 1 menu
- ✅ Analytics giúp optimize pricing & inventory
- ✅ Professional appearance → attract enterprise customers

**Technical Benefits:**
- ✅ Codebase organized & scalable
- ✅ Dễ maintain & extend features
- ✅ Clear separation of concerns
- ✅ Reusable components (charts, tables, modals)

---

### 🎬 Next Steps

**IMMEDIATE (This Week):**
1. ✅ **APPROVE** việc tạo menu "Quản lý cho thuê" riêng
2. ✅ **START** Phase 0: Tạo menu structure & routing
3. ✅ **DESIGN** mockups cho Dashboard & Container list pages
4. ✅ **REVIEW** database schema cho `rental_contracts` & `maintenance_logs`

**Short-term (Next 2 Weeks):**
1. ✅ Complete Phase 1: Database & APIs
2. ✅ Complete Phase 2: Dashboard & Containers
3. ✅ Start Phase 3: Contracts management

**Medium-term (Next 2 Months):**
1. ✅ Complete all 6 phases
2. ✅ UAT with real sellers
3. ✅ Production deployment
4. ✅ Monitor metrics & iterate

---

### 💡 Khuyến Nghị Cuối Cùng

**✅ CÓ, CHẮC CHẮN NÊN TẠO MENU QUẢN LÝ CONTAINER CHO THUÊ RIÊNG!**

**Đây không phải là "nice to have" mà là "MUST HAVE" để:**
1. Hoàn thiện tính năng cho thuê container
2. Cạnh tranh với các platform lớn (Alibaba, Tradex)
3. Phục vụ enterprise customers (họ cần analytics & reporting)
4. Tăng revenue từ phân khúc rental (hiện tại đang bỏ ngỏ)

**Investment:**
- Development time: ~10 weeks (2.5 tháng)
- Team size: 2-3 developers + 1 designer + 1 QA
- Estimated cost: Medium (nhưng ROI cao)

**ROI:**
- Tăng 30% revenue from rentals trong 6 tháng
- Giảm 40% support costs
- Tăng 50% seller satisfaction
- Attract 20% more enterprise sellers

---

## 📞 LIÊN HỆ & HỖ TRỢ

Nếu cần thảo luận thêm về implementation plan hoặc có câu hỏi, vui lòng liên hệ team development.

**Tài liệu liên quan:**
- [PHAN-TICH-CHI-TIET-3-PHUONG-THUC-THANH-TOAN.md](./PHAN-TICH-CHI-TIET-3-PHUONG-THUC-THANH-TOAN.md)
- [HOAN-THANH-QUAN-LY-CONTAINER-CHO-THUE.md](./HOAN-THANH-QUAN-LY-CONTAINER-CHO-THUE.md)
- [LISTING-VARIANTS-PROPOSAL.md](./docs/reports/LISTING-VARIANTS-PROPOSAL.md)

**Timeline summary:**
```
Week 1:   Phase 0 - Menu & Navigation ✅
Week 2-3: Phase 1 - Database & APIs
Week 4:   Phase 2 - Dashboard & Containers
Week 5-6: Phase 3 - Contracts
Week 7:   Phase 4 - Maintenance
Week 8:   Phase 5 - Analytics & Reports
Week 9-10: Phase 6 - Testing & Polish
```

**Go/No-Go Decision:**
- ✅ **GO** - Tạo menu riêng cho quản lý container cho thuê
- ✅ **START** với Phase 0 ngay lập tức
- ✅ **FOLLOW** roadmap 10 weeks như đã outline

---

**📅 Cập nhật lần cuối:** 13/11/2025  
**👤 Người phân tích:** GitHub Copilot  
**📊 Version:** 2.0 (Đã bổ sung phân tích menu quản lý cho thuê)  
**✅ Trạng thái:** Hoàn chỉnh - Sẵn sàng triển khai

