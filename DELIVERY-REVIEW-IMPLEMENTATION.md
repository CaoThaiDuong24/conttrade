# HƯỚNG DẪN TRIỂN KHAI TÍNH NĂNG ĐÁNH GIÁ LÔ GIAO HÀNG

## 📋 Tổng quan

Tính năng này cho phép người mua đánh giá từng lô giao hàng (delivery batch) sau khi xác nhận nhận hàng. Mỗi lô có thể được đánh giá riêng biệt với:
- Đánh giá tổng thể (1-5 sao)
- Đánh giá chi tiết: Chất lượng giao hàng, Đóng gói, Đúng giờ
- Nhận xét văn bản
- Hình ảnh (đang phát triển)

## 🗄️ Database Changes

### 1. Chạy Migration SQL

```bash
# Connect to PostgreSQL
psql -U your_username -d your_database_name

# Run migration
\i backend/prisma/migrations/add_delivery_reviews.sql
```

### 2. Cập nhật Prisma Client

```bash
cd backend
npx prisma generate
```

## 🔧 Backend Changes

### Files Created/Modified:

1. **backend/prisma/schema.prisma**
   - ✅ Added `delivery_reviews` model
   - ✅ Added relations to `users`, `deliveries`, `orders`
   - ✅ Added `review_requested` fields to `deliveries` table

2. **backend/src/routes/delivery-reviews.ts** (NEW)
   - ✅ GET `/api/v1/delivery-reviews/order/:orderId` - Lấy reviews của order
   - ✅ GET `/api/v1/delivery-reviews/user/:userId` - Lấy reviews của seller
   - ✅ GET `/api/v1/delivery-reviews/pending` - Lấy deliveries chưa review
   - ✅ PUT `/api/v1/delivery-reviews/:id/response` - Seller phản hồi review

3. **backend/src/routes/deliveries.ts**
   - ✅ POST `/api/v1/deliveries/:deliveryId/review` - Tạo review
   - ✅ GET `/api/v1/deliveries/:deliveryId/review` - Lấy review của delivery
   - ✅ Updated confirm receipt flow to send review notification

4. **backend/src/server.ts**
   - ✅ Registered `/api/v1/delivery-reviews` routes

## 🎨 Frontend Changes

### Files Created/Modified:

1. **frontend/components/orders/DeliveryReviewModal.tsx** (NEW)
   - Modal cho phép buyer đánh giá delivery batch
   - Rating tổng thể + 3 rating chi tiết
   - Textarea cho nhận xét
   - Placeholder cho upload hình ảnh

2. **frontend/components/orders/BatchDeliveryManagement.tsx**
   - ✅ Added import DeliveryReviewModal
   - ✅ Added review state and fetch logic
   - ✅ Show review button after receipt confirmed
   - ✅ Display existing review if already reviewed
   - ✅ Star rating visualization

3. **frontend/components/orders/index.ts**
   - ✅ Exported DeliveryReviewModal

## 🚀 Testing Guide

### 1. Setup Test Data

Đảm bảo có:
- Order với multiple delivery batches
- Ít nhất 1 batch đã DELIVERED và receipt confirmed
- User logged in as buyer

### 2. Test Flow

```
1. Buyer xác nhận nhận hàng (Confirm Receipt)
   ↓
2. Notification gửi đến buyer: "⭐ Đánh giá lô giao hàng"
   ↓
3. Review button xuất hiện trong BatchDeliveryManagement
   ↓
4. Click "Đánh giá ngay" → Modal mở
   ↓
5. Nhập rating + comment → Submit
   ↓
6. Review hiển thị thay thế button
   ↓
7. Seller nhận notification về review
```

### 3. API Testing

```bash
# Test create review (as buyer)
curl -X POST http://localhost:3006/api/v1/deliveries/{deliveryId}/review \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Giao hàng nhanh, đóng gói tốt",
    "deliveryQualityRating": 5,
    "packagingRating": 5,
    "timelinessRating": 4
  }'

# Test get review
curl http://localhost:3006/api/v1/deliveries/{deliveryId}/review

# Test get user reviews
curl http://localhost:3006/api/v1/delivery-reviews/user/{sellerId}

# Test pending reviews (as buyer)
curl http://localhost:3006/api/v1/delivery-reviews/pending \
  -H "Authorization: Bearer {token}"
```

## 📊 Database Schema

### delivery_reviews table

```sql
id                      VARCHAR(255) PRIMARY KEY
delivery_id             VARCHAR(255) NOT NULL → deliveries.id
order_id                VARCHAR(255) NOT NULL → orders.id
reviewer_id             VARCHAR(255) NOT NULL → users.id (buyer)
reviewee_id             VARCHAR(255) NOT NULL → users.id (seller)
rating                  INT NOT NULL (1-5)
comment                 TEXT
delivery_quality_rating INT (1-5)
packaging_rating        INT (1-5)
timeliness_rating       INT (1-5)
photos_json             JSONB
response                TEXT
response_by             VARCHAR(255) → users.id
response_at             TIMESTAMP
moderated               BOOLEAN DEFAULT FALSE
moderated_by            VARCHAR(255) → users.id
moderated_at            TIMESTAMP
created_at              TIMESTAMP DEFAULT NOW()
updated_at              TIMESTAMP DEFAULT NOW()

UNIQUE(delivery_id, reviewer_id)
```

## 🎯 Features Implemented

- ✅ Review tổng thể (1-5 sao)
- ✅ 3 rating chi tiết: Chất lượng giao hàng, Đóng gói, Đúng giờ
- ✅ Nhận xét văn bản (500 ký tự)
- ✅ Notification tự động sau khi xác nhận nhận hàng
- ✅ Hiển thị review trong BatchDeliveryManagement
- ✅ Seller có thể phản hồi review
- ✅ Statistics: Average rating, distribution, recommendation rate
- ✅ Validation: Chỉ review sau khi receipt confirmed
- ✅ Validation: Không thể review 2 lần
- ✅ Review per batch (không phải per order)

## 🔮 Future Enhancements

- 📸 Upload photos with review
- 🏆 Badge system for high-rated sellers
- 📈 Seller rating dashboard
- 🔔 Review reminder notifications
- ⚖️ Review moderation system
- 🎯 Review incentives (discount codes, etc.)

## 🐛 Known Issues

- Photo upload placeholder only (not functional yet)
- No edit/delete review feature yet
- No review report/flag system yet

## 📝 Notes

- Review chỉ có thể tạo sau khi receipt_confirmed_at != null
- Mỗi delivery chỉ có thể review 1 lần bởi buyer
- Seller có thể response review bất kỳ lúc nào
- Review không thể xóa (chỉ có thể moderate bởi admin)

---

**Created:** 2025-11-18  
**Author:** GitHub Copilot  
**Version:** 1.0
