# Migration: Add listing_containers Table

## 📋 Mục đích

Tạo bảng mới `listing_containers` để lưu danh sách container IDs cho mỗi listing, hỗ trợ:
- Quản lý từng container riêng lẻ trong listing
- Track trạng thái từng container (AVAILABLE, RESERVED, SOLD, RENTED...)
- Lưu thông tin shipping line
- Link container với order khi được bán/thuê

## 🔧 Cách chạy Migration

### 1. **Stop Backend Server** (nếu đang chạy)
```powershell
# Nhấn Ctrl+C trong terminal đang chạy server
```

### 2. **Chạy Migration**
```powershell
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Conttrade\conttrade-server2.1\backend"

# Cách 1: Chạy trực tiếp file SQL
psql -U postgres -d i_contexchange -f "prisma\migrations\20251106_add_listing_containers\migration.sql"

# Hoặc Cách 2: Dùng Prisma
npx prisma migrate deploy
```

### 3. **Generate Prisma Client mới**
```powershell
npx prisma generate
```

### 4. **Restart Backend Server**
```powershell
npm run dev
# hoặc
node src/server.js
```

## ✅ Verify Migration

### Kiểm tra bảng đã được tạo:
```sql
-- Connect to database
psql -U postgres -d i_contexchange

-- Check table exists
\dt listing_containers

-- Check table structure
\d listing_containers

-- Check indexes
\di listing_containers*

-- Check enum
SELECT unnest(enum_range(NULL::containerinventorystatus));
```

## 📊 Cấu trúc Bảng Mới

### `listing_containers`
- **id** (TEXT, PK) - UUID
- **listing_id** (TEXT, FK → listings) - Listing owner
- **container_iso_code** (TEXT, UNIQUE) - Mã ISO 6346 (VD: ABCU1234560)
- **shipping_line** (TEXT, nullable) - Hãng tàu (VD: Maersk, CMA CGM)
- **status** (TEXT) - AVAILABLE, RESERVED, SOLD, RENTED, IN_MAINTENANCE, DELETED
- **reserved_by** (TEXT, FK → users) - User đang reserve
- **reserved_until** (TIMESTAMP) - Hết hạn reservation
- **sold_to_order_id** (TEXT, FK → orders) - Order đã mua
- **sold_at** (TIMESTAMP) - Thời gian bán
- **rented_to_order_id** (TEXT, FK → orders) - Order đang thuê
- **rented_at** (TIMESTAMP) - Thời gian bắt đầu thuê
- **rental_return_date** (TIMESTAMP) - Ngày phải trả
- **notes** (TEXT) - Ghi chú
- **created_at** (TIMESTAMP)
- **updated_at** (TIMESTAMP)

### Indexes:
- idx_listing_containers_listing_id
- idx_listing_containers_status
- idx_listing_containers_reserved_by
- idx_listing_containers_sold_to_order_id
- idx_listing_containers_iso_code_unique (UNIQUE WHERE status != 'SOLD' AND status != 'DELETED')

## 🔗 Schema Changes

### Prisma Schema Updates:
1. ✅ Model `listing_containers` mới
2. ✅ Enum `ContainerInventoryStatus` mới
3. ✅ Relation `listings.listing_containers` (one-to-many)
4. ✅ Relation `orders.listing_containers_sold` (one-to-many)
5. ✅ Relation `orders.listing_containers_rented` (one-to-many)
6. ✅ Relation `users.listing_containers_reserved` (one-to-many)

### Backend API Updates:
- ✅ POST /listings - Nhận và lưu `containerIds[]` từ frontend
- ✅ Validation ISO 6346 format
- ✅ Auto-create records trong `listing_containers`

## 🚀 Rollback (nếu cần)

```sql
-- Drop bảng mới (cẩn thận - mất data!)
DROP TABLE IF EXISTS listing_containers CASCADE;

-- Drop enum mới
DROP TYPE IF EXISTS containerinventorystatus;
```

Sau đó phải revert lại Prisma schema và generate lại client.

## 📝 Notes

- ⚠️ **KHÔNG sửa** bảng `listings` hiện tại
- ⚠️ **KHÔNG xóa** field `container_id` trong `listings` (backward compatibility)
- ✅ Bảng mới **KHÔNG affect** logic hiện tại
- ✅ Feature containerIds là **optional** - nếu không gửi thì không tạo records
- ✅ Unique constraint cho `container_iso_code` chỉ apply khi status != SOLD/DELETED

## 🔍 Testing

### Test Case 1: Tạo listing với containerIds
```typescript
POST /listings
{
  "dealType": "SALE",
  "title": "Container 40ft HC",
  "priceAmount": 5000,
  "priceCurrency": "USD",
  "locationDepotId": "depot-123",
  "totalQuantity": 3,
  "containerIds": [
    { "id": "ABCU1234560", "shippingLine": "Maersk" },
    { "id": "MSCU9876543", "shippingLine": "MSC" },
    { "id": "CMAU5555550", "shippingLine": "CMA CGM" }
  ],
  "facets": {
    "size": "40",
    "type": "HC",
    "condition": "new"
  }
}
```

### Expected Result:
- ✅ Listing created
- ✅ 3 records trong `listing_containers` với status = AVAILABLE
- ✅ Container ISO codes được normalize (uppercase, trim)

### Test Case 2: Tạo listing KHÔNG có containerIds
```typescript
POST /listings
{
  "dealType": "SALE",
  "title": "Container 20ft",
  "priceAmount": 3000,
  "totalQuantity": 5,
  // ... other fields, NO containerIds
}
```

### Expected Result:
- ✅ Listing created normally
- ✅ KHÔNG có records trong `listing_containers`
- ✅ Works như cũ (backward compatible)

---

**Created**: 2025-11-06  
**Author**: GitHub Copilot  
**Status**: Ready to deploy
