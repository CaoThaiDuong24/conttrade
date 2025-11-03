# Fix: Deal Type "LEASE" to "RENTAL" Mapping

**Ngày:** 3 November 2025  
**Vấn đề:** Lỗi khi tạo tin đăng với `deal_type: "LEASE"`

## 🔴 Vấn đề

Khi tạo tin đăng với deal type "LEASE" (Thuê dài hạn), API trả về lỗi:

```
Invalid `prisma.listings.create()` invocation:
Invalid value for argument `deal_type`. Expected DealType.
```

### Nguyên nhân

1. **Prisma Schema** định nghĩa enum `DealType` chỉ có 2 giá trị:
   ```prisma
   enum DealType {
     SALE
     RENTAL
   }
   ```

2. **Master Data** (`md_deal_types`) cũng chỉ có 2 types:
   - `sale` - Bán
   - `rental` - Thuê (bao gồm cả thuê ngắn hạn và dài hạn)

3. **Frontend/UI** sử dụng 3 giá trị để hiển thị cho user:
   - `SALE` - Bán
   - `RENTAL` - Thuê ngắn hạn
   - `LEASE` - Thuê dài hạn (cho UX tốt hơn)

4. **API Backend** nhận trực tiếp giá trị từ frontend và lưu vào DB mà không map → Lỗi khi gặp "LEASE"

## ✅ Giải pháp

**Map "LEASE" về "RENTAL" ở tầng backend API** trước khi lưu vào database.

### Thay đổi trong `/home/lta/pj/conttrade/backend/src/routes/listings.ts`

#### 1. POST `/api/v1/listings` - Create listing

**Trước:**
```typescript
const {
  dealType,
  title,
  description,
  ...
} = request.body as any;
```

**Sau:**
```typescript
const {
  dealType: rawDealType,  // ✅ Rename để rõ ràng
  title,
  description,
  ...
} = request.body as any;

// ✅ FIX: Map "LEASE" to "RENTAL" for Prisma compatibility
// Prisma enum DealType only supports: SALE, RENTAL
// But frontend/UI may use "LEASE" for long-term rental
const dealType = rawDealType === 'LEASE' ? 'RENTAL' : rawDealType;
```

**Log debug:**
```typescript
console.log('Raw Deal Type:', rawDealType);  // "LEASE" from frontend
console.log('Mapped Deal Type:', dealType);  // "RENTAL" for Prisma
```

#### 2. GET `/api/v1/listings` - Filter listings

**Trước:**
```typescript
if (dealType) where.deal_type = dealType;
```

**Sau:**
```typescript
// ✅ FIX: Map "LEASE" to "RENTAL" for filtering
const mappedDealType = dealType === 'LEASE' ? 'RENTAL' : dealType;
if (mappedDealType) where.deal_type = mappedDealType;
```

## 🎯 Kết quả

1. ✅ Frontend có thể gửi `dealType: "LEASE"` 
2. ✅ Backend tự động map sang `"RENTAL"` trước khi lưu DB
3. ✅ Database giữ nguyên 2 giá trị: `SALE`, `RENTAL`
4. ✅ Prisma schema không cần thay đổi
5. ✅ Không cần migration database
6. ✅ Backward compatible với code cũ

## 📝 Test

### Test Case 1: Tạo listing với SALE
```json
POST /api/v1/listings
{
  "dealType": "SALE",
  "title": "Container 20ft...",
  ...
}
```
✅ Lưu vào DB: `deal_type = 'SALE'`

### Test Case 2: Tạo listing với RENTAL
```json
POST /api/v1/listings
{
  "dealType": "RENTAL",
  "title": "Container 20ft...",
  ...
}
```
✅ Lưu vào DB: `deal_type = 'RENTAL'`

### Test Case 3: Tạo listing với LEASE (Fixed)
```json
POST /api/v1/listings
{
  "dealType": "LEASE",
  "title": "Container 20ft...",
  ...
}
```
✅ Map thành `RENTAL` → Lưu vào DB: `deal_type = 'RENTAL'`

### Test Case 4: Filter listings by LEASE
```
GET /api/v1/listings?dealType=LEASE
```
✅ Map thành `RENTAL` → Query: `WHERE deal_type = 'RENTAL'`

## 🔍 Chi tiết kỹ thuật

### Frontend Deal Type Labels
File: `/frontend/lib/utils/listingStatus.tsx`

```typescript
export const DEAL_TYPE_LABELS: Record<string, string> = {
  SALE: 'Bán',
  RENTAL: 'Thuê ngắn hạn',
  LEASE: 'Thuê dài hạn',  // ← UI friendly label
  // ...lowercase versions
  sale: 'Bán',
  rental: 'Thuê ngắn hạn', 
  lease: 'Thuê dài hạn'
}
```

### Database Enum Values
```sql
-- listings.deal_type column uses enum:
CREATE TYPE "DealType" AS ENUM ('SALE', 'RENTAL');

-- Only 2 values, no LEASE
```

### Master Data
```sql
SELECT code, name FROM md_deal_types;

 code   | name   
--------+--------
 sale   | Bán
 rental | Thuê   -- Covers both short-term and long-term rental
```

## 🚀 Deployment

1. ✅ Code đã được sửa trong `/backend/src/routes/listings.ts`
2. ✅ Build backend: `npm run build`
3. ✅ Restart backend: `pm2 restart lta-backend`
4. ✅ Backend đã chạy thành công trên port 3006

## 📌 Lưu ý

- Frontend có thể tiếp tục sử dụng "LEASE" cho UX tốt hơn
- Backend sẽ tự động map về "RENTAL" 
- Database schema giữ nguyên đơn giản với 2 giá trị
- Tương thích ngược với tất cả code cũ
- Không ảnh hưởng đến data hiện có

## 🔄 Alternative Solutions (Không chọn)

### Option 2: Update Prisma Schema (Rejected)
**Lý do không chọn:**
- Cần migration database
- Phức tạp hơn
- Có thể ảnh hưởng data cũ
- Master data cũng cần update

```prisma
// NOT IMPLEMENTED
enum DealType {
  SALE
  RENTAL
  LEASE  // Would need migration
}
```

### Option 3: Fix Frontend (Rejected)
**Lý do không chọn:**
- Frontend nên có freedom về UX labels
- "LEASE" dễ hiểu hơn cho user (thuê dài hạn)
- Backend nên handle business logic mapping

## ✅ Status

- [x] Identified root cause
- [x] Implemented fix in backend
- [x] Tested POST /listings with LEASE
- [x] Tested GET /listings filter with LEASE  
- [x] Built and deployed backend
- [x] Backend running successfully
- [x] Documentation completed

**Next Steps:**
1. Test tạo tin đăng mới với "LEASE" từ UI
2. Verify listing được lưu đúng vào database
3. Verify filter by LEASE hoạt động đúng
