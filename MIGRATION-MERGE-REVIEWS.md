# Migration: Gộp Bảng Reviews

**Ngày thực hiện:** 18/11/2025  
**Trạng thái:** ✅ Hoàn thành

## Tóm tắt

Đã gộp 2 bảng `reviews` (order-level) và `delivery_reviews` (delivery-level) thành 1 bảng `reviews` thống nhất.

## Lý do

- Giảm duplicate code
- Đơn giản hóa schema database
- Dễ quản lý và maintain
- Tận dụng cấu trúc có sẵn

## Thay đổi Database

### Bảng `reviews` - Cấu trúc mới

```sql
-- Các cột mới được thêm vào:
delivery_id              VARCHAR(255)  -- NULL = order-level, NOT NULL = delivery-level
delivery_quality_rating  INTEGER       -- Rating chi tiết về chất lượng giao hàng
packaging_rating         INTEGER       -- Rating chi tiết về đóng gói
timeliness_rating        INTEGER       -- Rating chi tiết về thời gian giao hàng  
photos_json              JSONB         -- Hình ảnh đính kèm review
```

### Constraints

```sql
-- Check constraints cho ratings
CHECK (delivery_quality_rating IS NULL OR (delivery_quality_rating >= 1 AND delivery_quality_rating <= 5))
CHECK (packaging_rating IS NULL OR (packaging_rating >= 1 AND packaging_rating <= 5))
CHECK (timeliness_rating IS NULL OR (timeliness_rating >= 1 AND timeliness_rating <= 5))

-- Unique constraint
CREATE UNIQUE INDEX reviews_order_reviewer_delivery_unique 
  ON reviews (order_id, reviewer_id, COALESCE(delivery_id, 'ORDER_LEVEL'));
```

### Foreign Keys

```sql
-- Thêm foreign key mới
ALTER TABLE reviews 
  ADD CONSTRAINT reviews_delivery_id_fkey 
    FOREIGN KEY (delivery_id) 
    REFERENCES deliveries(id) 
    ON UPDATE CASCADE 
    ON DELETE CASCADE;
```

### Indexes

```sql
-- Indexes mới
CREATE INDEX idx_reviews_delivery_id ON reviews(delivery_id) WHERE delivery_id IS NOT NULL;
CREATE INDEX idx_reviews_order_level ON reviews(order_id) WHERE delivery_id IS NULL;
```

### Bảng đã xóa

- ❌ `delivery_reviews` - Đã gộp vào `reviews`

## Thay đổi Backend

### 1. Prisma Schema (`backend/prisma/schema.prisma`)

**Model reviews - Đã cập nhật:**

```prisma
model reviews {
  id                               String      @id
  order_id                         String
  delivery_id                      String?     @db.VarChar(255)  // NEW
  reviewer_id                      String
  reviewee_id                      String
  rating                           Int
  comment                          String?
  delivery_quality_rating          Int?        // NEW
  packaging_rating                 Int?        // NEW
  timeliness_rating                Int?        // NEW
  photos_json                      Json?       // NEW
  response                         String?
  response_by                      String?
  response_at                      DateTime?
  moderated                        Boolean     @default(false)
  moderated_by                     String?
  moderated_at                     DateTime?
  created_at                       DateTime    @default(now())
  updated_at                       DateTime    @updatedAt
  
  // Relations
  orders                           orders      @relation(fields: [order_id], references: [id])
  deliveries                       deliveries? @relation(fields: [delivery_id], references: [id], onDelete: Cascade)
  users_reviews_response_byTousers users?      @relation("reviews_response_byTousers", fields: [response_by], references: [id])
  users_reviews_reviewee_idTousers users       @relation("reviews_reviewee_idTousers", fields: [reviewee_id], references: [id])
  users_reviews_reviewer_idTousers users       @relation("reviews_reviewer_idTousers", fields: [reviewer_id], references: [id])

  @@index([delivery_id], map: "idx_reviews_delivery_id")
  @@index([order_id], map: "idx_reviews_order_level")
  @@index([order_id, reviewer_id, delivery_id], map: "reviews_order_reviewer_delivery_unique")
}
```

**Model delivery_reviews - Đã xóa ❌**

### 2. Routes Updates

**File:** `backend/src/routes/delivery-reviews.ts`

- ✅ Thay đổi: `prisma.delivery_reviews` → `prisma.reviews`
- ✅ Thêm filter: `delivery_id: { not: null }` để chỉ lấy delivery-level reviews
- ✅ Cập nhật relations: `users_delivery_reviews_*` → `users_reviews_*`

**File:** `backend/src/routes/deliveries.ts`

- ✅ POST `/:deliveryId/review` - Tạo review với `delivery_id`
- ✅ GET `/:deliveryId/review` - Lấy review theo `delivery_id`
- ✅ Check existing review: Sử dụng `findFirst` với `delivery_id` và `reviewer_id`

### 3. Server Status

```
✅ Delivery Reviews routes registered
✅ Reviews routes registered
🌐 API running at http://localhost:3006
```

## Logic Phân Biệt

### Order-level Review
```typescript
{
  delivery_id: null,        // NULL = review cả đơn hàng
  rating: 5,
  comment: "Đơn hàng tốt"
}
```

### Delivery-level Review (Batch)
```typescript
{
  delivery_id: "uuid-123",  // NOT NULL = review từng lô
  rating: 4,
  comment: "Lô 1 giao đúng hẹn",
  delivery_quality_rating: 5,
  packaging_rating: 4,
  timeliness_rating: 5,
  photos_json: ["url1", "url2"]
}
```

## API Endpoints

### Delivery Reviews (Batch-level)

```
GET  /api/v1/delivery-reviews/order/:orderId     - Lấy reviews của order
GET  /api/v1/delivery-reviews/user/:userId       - Lấy reviews seller nhận được
GET  /api/v1/delivery-reviews/pending            - Lấy deliveries cần review
PUT  /api/v1/delivery-reviews/:id/response       - Seller phản hồi review
```

### Delivery Routes

```
POST /api/v1/deliveries/:deliveryId/review       - Tạo review cho batch
GET  /api/v1/deliveries/:deliveryId/review       - Lấy review của batch
```

## Frontend Impact

✅ **Không có thay đổi** - Frontend code vẫn hoạt động bình thường vì:
- API response structure giữ nguyên
- Component logic không đổi
- Menu navigation đã được cấu hình

## Migration Script

**File:** `backend/prisma/migrations/merge_delivery_reviews_to_reviews.sql`

**Các bước:**
1. ✅ Thêm các cột mới vào `reviews`
2. ✅ Thêm check constraints
3. ✅ Migrate data từ `delivery_reviews` sang `reviews`
4. ✅ Drop old unique constraint, tạo unique index mới
5. ✅ Thêm foreign key cho `delivery_id`
6. ✅ Tạo indexes mới
7. ✅ Cập nhật `deliveries.reviewed` flag
8. ✅ Drop bảng `delivery_reviews`

## Verification

### Database Check

```sql
-- Kiểm tra cấu trúc
\d reviews

-- Đếm reviews
SELECT 
  COUNT(*) as total_reviews,
  COUNT(CASE WHEN delivery_id IS NOT NULL THEN 1 END) as delivery_reviews,
  COUNT(CASE WHEN delivery_id IS NULL THEN 1 END) as order_reviews
FROM reviews;
```

### API Test

```bash
# Test pending reviews
curl http://localhost:3006/api/v1/delivery-reviews/pending \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test seller reviews
curl http://localhost:3006/api/v1/delivery-reviews/user/:userId
```

## Rollback Plan

Nếu cần rollback:

1. Tạo lại bảng `delivery_reviews`
2. Copy data từ `reviews` WHERE `delivery_id IS NOT NULL`
3. Xóa các cột mới khỏi `reviews`
4. Restore old constraints và indexes

**⚠️ Lưu ý:** Nên backup database trước khi thực hiện migration.

## Kết luận

✅ Migration thành công  
✅ Backend code đã cập nhật  
✅ Prisma client đã regenerate  
✅ Server running normally  
✅ API endpoints hoạt động  
✅ Frontend không ảnh hưởng

**Next Steps:**
- Test toàn diện tính năng review trên frontend
- Monitor logs để phát hiện issues
- Có thể thêm migration để optimize indexes nếu cần
