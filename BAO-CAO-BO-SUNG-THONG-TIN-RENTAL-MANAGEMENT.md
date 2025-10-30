# 📋 BÁO CÁO: Bổ Sung Thông Tin Quản Lý Container Cho Thuê

**Ngày tạo:** 30/10/2025  
**Tài liệu liên quan:** `HUONG-DAN-TOUR-SELL-NEW.md`  
**Trang ảnh hưởng:** `/sell/new` (Đăng tin mới)

---

## 🎯 MỤC ĐÍCH

Phân tích và đề xuất bổ sung các trường thông tin cần thiết cho việc **quản lý chặt chẽ số lượng Container cho thuê** khi người bán chọn loại giao dịch **Cho Thuê (RENTAL/LEASE)**.

---

## 📊 PHÂN TÍCH HIỆN TRẠNG

### 1. Cấu Trúc Database Hiện Tại

#### **Table: `listings`** (schema.prisma line 340-373)
```prisma
model listings {
  id                String           @id
  container_id      String?
  seller_user_id    String
  org_id            String?
  deal_type         DealType         // SALE, RENTAL, LEASE, AUCTION
  price_currency    String           @default("VND")
  price_amount      Decimal
  rental_unit       String?          // ✅ Đã có: DAY, WEEK, MONTH
  location_depot_id String?
  status            ListingStatus    @default(DRAFT)
  title             String
  description       String?
  features          Json?
  specifications    Json?
  view_count        Int              @default(0)
  favorite_count    Int              @default(0)
  published_at      DateTime?
  expires_at        DateTime?
  created_at        DateTime         @default(now())
  updated_at        DateTime
  deleted_at        DateTime?
  // Relations...
}
```

#### **Thiếu các trường quan trọng:**
- ❌ **Số lượng container có sẵn** (available_quantity)
- ❌ **Số lượng đã được thuê** (rented_quantity)
- ❌ **Số lượng đang bảo trì** (maintenance_quantity)
- ❌ **Thời gian thuê tối thiểu** (min_rental_duration)
- ❌ **Thời gian thuê tối đa** (max_rental_duration)
- ❌ **Chính sách đặt cọc** (deposit_policy)
- ❌ **Tiền đặt cọc** (deposit_amount)
- ❌ **Ngày có thể giao hàng sớm nhất** (earliest_available_date)
- ❌ **Chính sách gia hạn** (renewal_policy)
- ❌ **Phí phạt trả muộn** (late_return_fee)

---

## 🎯 ĐỀ XUẤT BỔ SUNG

### 1. Bổ Sung Database Schema

#### A. Thêm trường vào `listings` table

```sql
-- Migration: Add rental management fields to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS available_quantity INT DEFAULT 1;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS rented_quantity INT DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS reserved_quantity INT DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS maintenance_quantity INT DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS total_quantity INT DEFAULT 1;

-- Rental duration constraints
ALTER TABLE listings ADD COLUMN IF NOT EXISTS min_rental_duration INT; -- Số lượng đơn vị (day/week/month)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS max_rental_duration INT; -- Số lượng đơn vị (day/week/month)

-- Deposit and fee policies
ALTER TABLE listings ADD COLUMN IF NOT EXISTS deposit_required BOOLEAN DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(15,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS deposit_currency VARCHAR(3);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS late_return_fee_amount DECIMAL(15,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS late_return_fee_unit VARCHAR(20); -- 'PER_DAY', 'PER_WEEK', 'PERCENTAGE'

-- Availability
ALTER TABLE listings ADD COLUMN IF NOT EXISTS earliest_available_date DATE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS latest_return_date DATE;

-- Renewal policy
ALTER TABLE listings ADD COLUMN IF NOT EXISTS auto_renewal_enabled BOOLEAN DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS renewal_notice_days INT DEFAULT 7;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS renewal_price_adjustment DECIMAL(5,2); -- % increase/decrease

-- Tracking
ALTER TABLE listings ADD COLUMN IF NOT EXISTS last_rented_at TIMESTAMP;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS total_rental_count INT DEFAULT 0;

-- Check constraint: available + rented + reserved + maintenance = total
ALTER TABLE listings ADD CONSTRAINT check_quantity_balance 
  CHECK (available_quantity + rented_quantity + reserved_quantity + maintenance_quantity = total_quantity);
```

#### B. Cập nhật Prisma Schema

```prisma
model listings {
  id                String           @id
  container_id      String?
  seller_user_id    String
  org_id            String?
  deal_type         DealType
  price_currency    String           @default("VND")
  price_amount      Decimal
  rental_unit       String?
  
  // ============ 🆕 RENTAL QUANTITY MANAGEMENT ============
  total_quantity            Int      @default(1)      // Tổng số container
  available_quantity        Int      @default(1)      // Số lượng có sẵn cho thuê
  rented_quantity           Int      @default(0)      // Số lượng đang được thuê
  reserved_quantity         Int      @default(0)      // Số lượng đã đặt trước
  maintenance_quantity      Int      @default(0)      // Số lượng đang bảo trì
  
  // ============ 🆕 RENTAL DURATION CONSTRAINTS ============
  min_rental_duration       Int?                      // Thời gian thuê tối thiểu (đơn vị theo rental_unit)
  max_rental_duration       Int?                      // Thời gian thuê tối đa
  
  // ============ 🆕 DEPOSIT & FEE POLICY ============
  deposit_required          Boolean  @default(false)  // Có yêu cầu đặt cọc không
  deposit_amount            Decimal?                  // Số tiền đặt cọc
  deposit_currency          String?                   // Tiền tệ đặt cọc
  late_return_fee_amount    Decimal?                  // Phí trả muộn
  late_return_fee_unit      String?                   // Đơn vị phí: PER_DAY, PER_WEEK, PERCENTAGE
  
  // ============ 🆕 AVAILABILITY DATES ============
  earliest_available_date   DateTime?                 // Ngày sớm nhất có thể thuê
  latest_return_date        DateTime?                 // Ngày phải trả lại muộn nhất
  
  // ============ 🆕 RENEWAL POLICY ============
  auto_renewal_enabled      Boolean  @default(false)  // Cho phép gia hạn tự động
  renewal_notice_days       Int      @default(7)      // Thông báo trước X ngày
  renewal_price_adjustment  Decimal? @default(0.00)   // % điều chỉnh giá khi gia hạn
  
  // ============ 🆕 RENTAL TRACKING ============
  last_rented_at            DateTime?                 // Lần thuê gần nhất
  total_rental_count        Int      @default(0)      // Tổng số lần được thuê
  
  // ... existing fields ...
  location_depot_id String?
  status            ListingStatus    @default(DRAFT)
  title             String
  description       String?
  // ... rest of fields ...
}
```

---

### 2. Bổ Sung UI Form - Trang `/sell/new`

#### **Step 3: Rental Quantity Management** (Mới thêm vào sau Step Pricing)

Khi `deal_type === 'RENTAL' || deal_type === 'LEASE'`, hiển thị thêm section:

```tsx
{/* Step: Rental Management - Chỉ hiển thị khi chọn RENTAL/LEASE */}
{step === 'rental-management' && isRentalType(dealType) && (
  <div className="space-y-6">
    {/* A. Inventory Management */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Package className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Quản lý số lượng container</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Total Quantity */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            Tổng số container có sẵn *
          </Label>
          <Input
            type="number"
            min="1"
            value={totalQuantity}
            onChange={(e) => setTotalQuantity(Number(e.target.value))}
            placeholder="VD: 10"
            className="h-10"
            required
          />
          <p className="text-xs text-gray-500">
            Tổng số container bạn có thể cho thuê đồng thời
          </p>
        </div>

        {/* Available Quantity */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            Số lượng hiện có sẵn *
          </Label>
          <Input
            type="number"
            min="0"
            max={totalQuantity}
            value={availableQuantity}
            onChange={(e) => setAvailableQuantity(Number(e.target.value))}
            placeholder="VD: 8"
            className="h-10"
            required
          />
          <p className="text-xs text-gray-500">
            Số container đang sẵn sàng cho thuê ngay
          </p>
        </div>

        {/* In Maintenance */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            Đang bảo trì
          </Label>
          <Input
            type="number"
            min="0"
            value={maintenanceQuantity}
            onChange={(e) => setMaintenanceQuantity(Number(e.target.value))}
            placeholder="VD: 2"
            className="h-10"
          />
          <p className="text-xs text-gray-500">
            Số container đang trong quá trình bảo trì/sửa chữa
          </p>
        </div>

        {/* Summary Display */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-3">Tổng quan</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng số:</span>
              <span className="font-semibold">{totalQuantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Có sẵn:</span>
              <span className="font-semibold text-green-600">{availableQuantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Đang thuê:</span>
              <span className="font-semibold">{rentedQuantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bảo trì:</span>
              <span className="font-semibold text-yellow-600">{maintenanceQuantity}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* B. Rental Duration Constraints */}
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Thời gian thuê</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Min Duration */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            Thời gian thuê tối thiểu
          </Label>
          <div className="flex space-x-2">
            <Input
              type="number"
              min="1"
              value={minRentalDuration}
              onChange={(e) => setMinRentalDuration(Number(e.target.value))}
              placeholder="VD: 3"
              className="h-10 flex-1"
            />
            <Select value={rentalUnit} onValueChange={setRentalUnit} disabled>
              <SelectTrigger className="h-10 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rentalUnits.data?.map((ru: any) => (
                  <SelectItem key={ru.code} value={ru.code}>
                    {ru.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-gray-500">
            VD: Tối thiểu 3 tháng
          </p>
        </div>

        {/* Max Duration */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            Thời gian thuê tối đa
          </Label>
          <div className="flex space-x-2">
            <Input
              type="number"
              min={minRentalDuration || 1}
              value={maxRentalDuration}
              onChange={(e) => setMaxRentalDuration(Number(e.target.value))}
              placeholder="VD: 12"
              className="h-10 flex-1"
            />
            <div className="h-10 w-32 flex items-center justify-center bg-gray-100 rounded-md text-sm text-gray-600">
              {rentalUnits.data?.find(ru => ru.code === rentalUnit)?.name || rentalUnit}
            </div>
          </div>
          <p className="text-xs text-gray-500">
            VD: Tối đa 12 tháng (để trống = không giới hạn)
          </p>
        </div>
      </div>
    </div>

    {/* C. Deposit & Fee Policy */}
    <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
      <div className="flex items-center space-x-2 mb-4">
        <DollarSign className="w-5 h-5 text-yellow-600" />
        <h3 className="font-semibold text-gray-900">Chính sách đặt cọc & phí</h3>
      </div>
      
      {/* Deposit Required Toggle */}
      <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg">
        <div>
          <Label className="text-sm font-medium text-gray-900">
            Yêu cầu đặt cọc
          </Label>
          <p className="text-xs text-gray-500 mt-1">
            Khách hàng phải đặt cọc trước khi thuê
          </p>
        </div>
        <Switch
          checked={depositRequired}
          onCheckedChange={setDepositRequired}
        />
      </div>

      {depositRequired && (
        <div className="grid grid-cols-2 gap-6 mt-4">
          {/* Deposit Amount */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">
              Số tiền đặt cọc *
            </Label>
            <div className="flex space-x-2">
              <Input
                type="number"
                min="0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                placeholder="VD: 5000000"
                className="h-10 flex-1"
                required={depositRequired}
              />
              <Select 
                value={depositCurrency || priceCurrency} 
                onValueChange={setDepositCurrency}
              >
                <SelectTrigger className="h-10 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.data?.map((cur: any) => (
                    <SelectItem key={cur.code} value={cur.code}>
                      {cur.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-500">
              Thường bằng 20-50% giá thuê 1 kỳ
            </p>
          </div>

          {/* Late Return Fee */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">
              Phí trả muộn (tùy chọn)
            </Label>
            <div className="flex space-x-2">
              <Input
                type="number"
                min="0"
                value={lateReturnFeeAmount}
                onChange={(e) => setLateReturnFeeAmount(Number(e.target.value))}
                placeholder="VD: 100000"
                className="h-10 flex-1"
              />
              <Select 
                value={lateReturnFeeUnit} 
                onValueChange={setLateReturnFeeUnit}
              >
                <SelectTrigger className="h-10 w-32">
                  <SelectValue placeholder="Đơn vị" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PER_DAY">/ Ngày</SelectItem>
                  <SelectItem value="PER_WEEK">/ Tuần</SelectItem>
                  <SelectItem value="PERCENTAGE">% Giá thuê</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-500">
              Phí phạt khi khách hàng trả container muộn hạn
            </p>
          </div>
        </div>
      )}
    </div>

    {/* D. Availability Dates */}
    <div className="bg-green-50 rounded-lg p-6 border border-green-200">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-gray-900">Ngày có thể thuê</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Earliest Available Date */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            Sớm nhất có thể giao (tùy chọn)
          </Label>
          <Input
            type="date"
            value={earliestAvailableDate}
            onChange={(e) => setEarliestAvailableDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="h-10"
          />
          <p className="text-xs text-gray-500">
            Ngày sớm nhất khách có thể nhận container
          </p>
        </div>

        {/* Latest Return Date */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            Muộn nhất phải trả (tùy chọn)
          </Label>
          <Input
            type="date"
            value={latestReturnDate}
            onChange={(e) => setLatestReturnDate(e.target.value)}
            min={earliestAvailableDate || new Date().toISOString().split('T')[0]}
            className="h-10"
          />
          <p className="text-xs text-gray-500">
            Chỉ dùng cho thuê ngắn hạn có thời hạn cố định
          </p>
        </div>
      </div>
    </div>

    {/* E. Renewal Policy */}
    <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
      <div className="flex items-center space-x-2 mb-4">
        <RefreshCw className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">Chính sách gia hạn</h3>
      </div>
      
      {/* Auto Renewal Toggle */}
      <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg">
        <div>
          <Label className="text-sm font-medium text-gray-900">
            Cho phép gia hạn tự động
          </Label>
          <p className="text-xs text-gray-500 mt-1">
            Khách hàng có thể gia hạn hợp đồng thuê
          </p>
        </div>
        <Switch
          checked={autoRenewalEnabled}
          onCheckedChange={setAutoRenewalEnabled}
        />
      </div>

      {autoRenewalEnabled && (
        <div className="grid grid-cols-2 gap-6 mt-4">
          {/* Notice Days */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">
              Thông báo trước (ngày)
            </Label>
            <Input
              type="number"
              min="1"
              max="30"
              value={renewalNoticeDays}
              onChange={(e) => setRenewalNoticeDays(Number(e.target.value))}
              placeholder="VD: 7"
              className="h-10"
            />
            <p className="text-xs text-gray-500">
              Thông báo khách hàng trước X ngày hết hạn
            </p>
          </div>

          {/* Price Adjustment */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">
              Điều chỉnh giá khi gia hạn (%)
            </Label>
            <div className="flex space-x-2">
              <Input
                type="number"
                step="0.1"
                value={renewalPriceAdjustment}
                onChange={(e) => setRenewalPriceAdjustment(Number(e.target.value))}
                placeholder="VD: 5"
                className="h-10 flex-1"
              />
              <div className="h-10 w-16 flex items-center justify-center bg-gray-100 rounded-md text-sm text-gray-600">
                %
              </div>
            </div>
            <p className="text-xs text-gray-500">
              (+) tăng giá, (-) giảm giá, (0) giữ nguyên
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
)}
```

---

### 3. Cập Nhật Tour Guide Steps

Thêm vào `frontend/lib/tour/driver-config.ts`:

```typescript
export const sellNewTourSteps: DriveStep[] = [
  // ... existing 15 steps ...
  
  // ✅ NEW STEP 16: Rental Management (only for RENTAL/LEASE)
  {
    element: '#rental-management-section',
    popover: {
      title: '📦 Quản Lý Container Cho Thuê',
      description: 'Thiết lập số lượng container, thời gian thuê, đặt cọc và chính sách gia hạn.',
      side: 'bottom',
      align: 'center',
    },
  },
  
  // ✅ NEW STEP 17: Quantity Management
  {
    element: '#quantity-inventory-section',
    popover: {
      title: '🔢 Số Lượng Container',
      description: 'Nhập tổng số container và số lượng hiện có sẵn. Hệ thống sẽ tự động theo dõi số lượng đã thuê và đang bảo trì.',
      side: 'right',
      align: 'start',
    },
  },
  
  // ✅ NEW STEP 18: Duration Constraints
  {
    element: '#rental-duration-section',
    popover: {
      title: '⏰ Thời Gian Thuê',
      description: 'Đặt thời gian thuê tối thiểu và tối đa để kiểm soát chu kỳ cho thuê container.',
      side: 'left',
      align: 'start',
    },
  },
  
  // ✅ NEW STEP 19: Deposit Policy
  {
    element: '#deposit-policy-section',
    popover: {
      title: '💰 Chính Sách Đặt Cọc',
      description: 'Bật tùy chọn yêu cầu đặt cọc và thiết lập phí trả muộn để bảo vệ tài sản.',
      side: 'bottom',
      align: 'center',
    },
  },
  
  // ✅ NEW STEP 20: Renewal Policy
  {
    element: '#renewal-policy-section',
    popover: {
      title: '🔄 Chính Sách Gia Hạn',
      description: 'Cho phép khách hàng gia hạn hợp đồng thuê tự động và điều chỉnh giá nếu cần.',
      side: 'top',
      align: 'center',
    },
  },
];
```

---

### 4. Validation Logic Bổ Sung

```typescript
const validateRentalStep = (): boolean => {
  if (!isRentalType(dealType)) return true; // Skip if not rental
  
  const errors: string[] = [];
  
  // Quantity validation
  if (!totalQuantity || totalQuantity < 1) {
    errors.push('Tổng số container phải >= 1');
  }
  
  if (!availableQuantity || availableQuantity < 0) {
    errors.push('Số lượng có sẵn không được âm');
  }
  
  if (availableQuantity > totalQuantity) {
    errors.push('Số lượng có sẵn không được lớn hơn tổng số');
  }
  
  const totalAccounted = availableQuantity + rentedQuantity + maintenanceQuantity;
  if (totalAccounted !== totalQuantity) {
    errors.push(`Tổng số phân bổ (${totalAccounted}) phải bằng tổng số container (${totalQuantity})`);
  }
  
  // Duration validation
  if (minRentalDuration && maxRentalDuration) {
    if (minRentalDuration > maxRentalDuration) {
      errors.push('Thời gian thuê tối thiểu không được lớn hơn tối đa');
    }
  }
  
  // Deposit validation
  if (depositRequired) {
    if (!depositAmount || depositAmount <= 0) {
      errors.push('Số tiền đặt cọc phải > 0 khi bật yêu cầu đặt cọc');
    }
    if (!depositCurrency) {
      errors.push('Vui lòng chọn tiền tệ đặt cọc');
    }
  }
  
  // Date validation
  if (earliestAvailableDate && latestReturnDate) {
    const earliest = new Date(earliestAvailableDate);
    const latest = new Date(latestReturnDate);
    if (earliest >= latest) {
      errors.push('Ngày giao sớm nhất phải trước ngày trả muộn nhất');
    }
  }
  
  if (errors.length > 0) {
    toast({
      title: "Lỗi validation",
      description: errors[0],
      variant: "destructive",
    });
    return false;
  }
  
  return true;
};
```

---

### 5. API Endpoint Cần Cập Nhật

#### **POST `/api/v1/listings`** - Create Listing

**Request Body** (bổ sung):
```json
{
  "dealType": "RENTAL",
  "priceAmount": 5000000,
  "priceCurrency": "VND",
  "rentalUnit": "MONTH",
  
  // ✅ NEW FIELDS
  "totalQuantity": 10,
  "availableQuantity": 8,
  "maintenanceQuantity": 2,
  "minRentalDuration": 3,
  "maxRentalDuration": 12,
  "depositRequired": true,
  "depositAmount": 2500000,
  "depositCurrency": "VND",
  "lateReturnFeeAmount": 100000,
  "lateReturnFeeUnit": "PER_DAY",
  "earliestAvailableDate": "2025-11-01",
  "autoRenewalEnabled": true,
  "renewalNoticeDays": 7,
  "renewalPriceAdjustment": 5.0,
  
  // ... existing fields
}
```

#### **Backend Controller** (`backend/controllers/listingController.js`)

```javascript
// ✅ Add rental management fields validation
const validateRentalFields = (data) => {
  const { dealType, totalQuantity, availableQuantity, depositRequired, depositAmount } = data;
  
  if (dealType === 'RENTAL' || dealType === 'LEASE') {
    // Validate quantity
    if (!totalQuantity || totalQuantity < 1) {
      throw new Error('Total quantity must be >= 1 for rental listings');
    }
    
    if (availableQuantity > totalQuantity) {
      throw new Error('Available quantity cannot exceed total quantity');
    }
    
    // Validate deposit
    if (depositRequired && (!depositAmount || depositAmount <= 0)) {
      throw new Error('Deposit amount is required when deposit is enabled');
    }
  }
};

exports.createListing = async (req, res) => {
  try {
    const listingData = req.body;
    
    // Validate rental fields
    validateRentalFields(listingData);
    
    // Create listing with rental management fields
    const listing = await prisma.listings.create({
      data: {
        ...listingData,
        // Map rental management fields
        total_quantity: listingData.totalQuantity || 1,
        available_quantity: listingData.availableQuantity || 1,
        maintenance_quantity: listingData.maintenanceQuantity || 0,
        min_rental_duration: listingData.minRentalDuration,
        max_rental_duration: listingData.maxRentalDuration,
        deposit_required: listingData.depositRequired || false,
        deposit_amount: listingData.depositAmount,
        deposit_currency: listingData.depositCurrency,
        late_return_fee_amount: listingData.lateReturnFeeAmount,
        late_return_fee_unit: listingData.lateReturnFeeUnit,
        earliest_available_date: listingData.earliestAvailableDate,
        auto_renewal_enabled: listingData.autoRenewalEnabled || false,
        renewal_notice_days: listingData.renewalNoticeDays || 7,
        renewal_price_adjustment: listingData.renewalPriceAdjustment,
      },
    });
    
    return res.json({ success: true, data: { listing } });
  } catch (error) {
    console.error('Create listing error:', error);
    return res.status(400).json({ success: false, error: error.message });
  }
};
```

---

## 📋 CHECKLIST TRIỂN KHAI

### Phase 1: Database Migration
- [ ] Tạo migration file để thêm các cột mới vào `listings` table
- [ ] Chạy migration trên development database
- [ ] Kiểm tra constraint `check_quantity_balance` hoạt động
- [ ] Cập nhật Prisma schema
- [ ] Generate Prisma client mới

### Phase 2: Backend API
- [ ] Cập nhật `listingController.js` để xử lý rental management fields
- [ ] Thêm validation logic cho rental fields
- [ ] Cập nhật Swagger/API documentation
- [ ] Viết unit tests cho rental validation
- [ ] Test API với Postman/Thunder Client

### Phase 3: Frontend UI
- [ ] Thêm state variables cho rental management fields
- [ ] Tạo UI components cho Rental Management step
- [ ] Cập nhật step flow (thêm step mới sau Pricing)
- [ ] Implement validation logic
- [ ] Thêm IDs cho tour guide
- [ ] Update form submission logic

### Phase 4: Tour Guide
- [ ] Thêm 5 steps mới vào `driver-config.ts`
- [ ] Test tour guide với rental listing
- [ ] Cập nhật documentation `HUONG-DAN-TOUR-SELL-NEW.md`

### Phase 5: Testing
- [ ] Test tạo listing SALE (không có rental fields)
- [ ] Test tạo listing RENTAL với đầy đủ thông tin
- [ ] Test validation errors
- [ ] Test quantity constraint (available + rented + maintenance = total)
- [ ] Test deposit required/not required
- [ ] Test renewal policy
- [ ] Test responsive UI trên mobile

### Phase 6: Documentation
- [ ] Cập nhật API documentation
- [ ] Cập nhật user guide
- [ ] Tạo admin guide cho quản lý rental listings
- [ ] Screenshot UI mới

---

## 🎯 LỢI ÍCH

### 1. **Quản Lý Chặt Chẽ Số Lượng**
- Theo dõi chính xác số container có sẵn vs đang thuê
- Tự động cập nhật khi có booking mới
- Ngăn chặn overbooking (cho thuê quá số lượng)

### 2. **Bảo Vệ Tài Sản**
- Yêu cầu đặt cọc để giảm rủi ro
- Phí trả muộn khuyến khích tuân thủ thời hạn
- Theo dõi lịch sử cho thuê

### 3. **Tự Động Hóa**
- Chính sách gia hạn tự động
- Thông báo trước khi hết hạn
- Điều chỉnh giá linh hoạt

### 4. **Trải Nghiệm Khách Hàng Tốt**
- Thông tin minh bạch về số lượng có sẵn
- Biết rõ thời gian thuê tối thiểu/tối đa
- Chính sách rõ ràng về đặt cọc và phí

### 5. **Báo Cáo & Phân Tích**
- Thống kê số lần được thuê
- Tỷ lệ sử dụng container
- Doanh thu từ rental
- Thời gian trung bình mỗi lần thuê

---

## 🔄 BUSINESS FLOW MỚI

### Khi Tạo Listing Rental:
1. Seller nhập tổng số container: 10
2. Seller nhập số lượng có sẵn: 8
3. Seller nhập số đang bảo trì: 2
4. System tự động tính `rented_quantity = 0` (ban đầu)
5. System check: 8 + 0 + 2 = 10 ✅

### Khi Buyer Book Container:
1. Buyer chọn quantity: 3
2. System kiểm tra: `availableQuantity >= 3` ?
3. Nếu OK:
   - `availableQuantity -= 3` (8 → 5)
   - `rented_quantity += 3` (0 → 3)
   - `reserved_quantity += 3` (tạm thời reserve)
4. Sau khi thanh toán thành công:
   - `reserved_quantity -= 3`
   - Chuyển sang trạng thái RENTED

### Khi Buyer Trả Container:
1. Buyer confirm trả container
2. System kiểm tra ngày trả:
   - Nếu đúng hạn: Hoàn tiền cọc 100%
   - Nếu muộn: Tính phí trả muộn, trừ vào tiền cọc
3. Cập nhật số lượng:
   - `rented_quantity -= 3` (3 → 0)
   - `availableQuantity += 3` (5 → 8)
4. Tăng `total_rental_count += 1`

---

## 📊 MẪU HIỂN THỊ CHO BUYER

### Listing Card
```
┌─────────────────────────────────────────┐
│ Container 40ft Dry - Cho thuê           │
│                                         │
│ 💰 5,000,000 VND / tháng               │
│ 📦 Có sẵn: 8/10 container              │
│ ⏰ Thuê tối thiểu: 3 tháng             │
│ 💵 Đặt cọc: 2,500,000 VND              │
│ 📅 Giao sớm nhất: 01/11/2025           │
│                                         │
│ [Đặt thuê ngay]                        │
└─────────────────────────────────────────┘
```

### Booking Form
```
┌─────────────────────────────────────────┐
│ Số lượng cần thuê: [___] (Tối đa: 8)  │
│ Thời gian thuê: [___] tháng            │
│   (Tối thiểu: 3 tháng, Tối đa: 12)    │
│                                         │
│ Tóm tắt:                               │
│ - Giá thuê: 5,000,000 x 3 = 15,000,000│
│ - Đặt cọc: 2,500,000 VND               │
│ - Tổng thanh toán: 17,500,000 VND      │
│                                         │
│ [Xác nhận đặt thuê]                    │
└─────────────────────────────────────────┘
```

---

## 🎉 KẾT LUẬN

Bổ sung các trường thông tin quản lý container cho thuê sẽ:

✅ **Tăng tính chuyên nghiệp** của platform  
✅ **Bảo vệ lợi ích** người cho thuê và người thuê  
✅ **Tự động hóa** quy trình quản lý  
✅ **Giảm thiểu tranh chấp** nhờ chính sách rõ ràng  
✅ **Cung cấp data** cho báo cáo và phân tích  

---

**Người tạo:** GitHub Copilot  
**Ngày cập nhật cuối:** 30/10/2025  
**Version:** 1.0  
