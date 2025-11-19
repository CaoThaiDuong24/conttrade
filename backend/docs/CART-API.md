# Cart API Documentation

**Version:** 1.0  
**Base URL:** `/api/v1/cart`  
**Authentication:** Required (JWT Token)

---

## Overview

Shopping Cart API cho phép người dùng:
- Xem giỏ hàng hiện tại
- Thêm/xóa/cập nhật items trong giỏ
- Tính tổng giỏ hàng
- Checkout thành RFQ hoặc Order

---

## Endpoints

### 1. GET `/api/v1/cart`

**Mô tả:** Lấy giỏ hàng hiện tại của user

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "cart-uuid",
    "user_id": "user-uuid",
    "status": "ACTIVE",
    "expires_at": "2025-12-05T...",
    "created_at": "2025-11-05T...",
    "updated_at": "2025-11-05T...",
    "cart_items": [
      {
        "id": "item-uuid",
        "listing_id": "listing-uuid",
        "quantity": 2,
        "deal_type": "SALE",
        "rental_duration_months": 0,
        "price_snapshot": "5000000.00",
        "currency": "VND",
        "notes": null,
        "added_at": "2025-11-05T...",
        "listing": {
          "id": "listing-uuid",
          "title": "Container 40ft HC",
          "price_amount": "5000000.00",
          "price_currency": "VND",
          "available_quantity": 10,
          "seller": {
            "id": "seller-uuid",
            "display_name": "Seller Name",
            "email": "seller@example.com"
          },
          "locationDepot": {
            "id": "depot-uuid",
            "name": "Depot Name",
            "code": "DP001",
            "province": "Ho Chi Minh"
          }
        }
      }
    ]
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### 2. POST `/api/v1/cart/items`

**Mô tả:** Thêm item vào giỏ hàng

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "listing_id": "listing-uuid",
  "quantity": 2,
  "deal_type": "SALE",           // Optional: "SALE" | "RENTAL"
  "rental_duration_months": 0,    // Required if deal_type = "RENTAL"
  "notes": "Optional notes"       // Optional
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Đã thêm vào giỏ hàng",
  "data": {
    "id": "item-uuid",
    "cart_id": "cart-uuid",
    "listing_id": "listing-uuid",
    "quantity": 2,
    "deal_type": "SALE",
    "price_snapshot": "5000000.00",
    "currency": "VND",
    "listing": {
      "id": "listing-uuid",
      "title": "Container 40ft HC",
      "price_amount": "5000000.00",
      "available_quantity": 8
    }
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "error": "Chỉ còn 5 container khả dụng"
}
```

---

### 3. PUT `/api/v1/cart/items/:itemId`

**Mô tả:** Cập nhật số lượng item trong giỏ

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**URL Parameters:**
- `itemId` (string, required): ID của cart item

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đã cập nhật số lượng",
  "data": {
    "id": "item-uuid",
    "quantity": 3,
    "updated_at": "2025-11-05T...",
    "listing": {
      "id": "listing-uuid",
      "title": "Container 40ft HC",
      "price_amount": "5000000.00"
    }
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "error": "Cart item not found"
}
```

**Response Error (403):**
```json
{
  "success": false,
  "error": "Forbidden"
}
```

---

### 4. DELETE `/api/v1/cart/items/:itemId`

**Mô tả:** Xóa item khỏi giỏ hàng

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters:**
- `itemId` (string, required): ID của cart item

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đã xóa khỏi giỏ hàng"
}
```

**Response Error (404):**
```json
{
  "success": false,
  "error": "Cart item not found"
}
```

---

### 5. DELETE `/api/v1/cart`

**Mô tả:** Xóa toàn bộ giỏ hàng (clear cart)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đã xóa toàn bộ giỏ hàng"
}
```

---

### 6. GET `/api/v1/cart/summary`

**Mô tả:** Tính tổng giỏ hàng theo currency

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "total_items": 5,              // Tổng số container
    "items_count": 2,               // Số loại container khác nhau
    "totals_by_currency": [
      {
        "currency": "VND",
        "amount": 15000000
      },
      {
        "currency": "USD",
        "amount": 2500
      }
    ]
  }
}
```

**Response Success (Empty Cart):**
```json
{
  "success": true,
  "data": {
    "total_items": 0,
    "items_count": 0,
    "totals_by_currency": []
  }
}
```

---

### 7. POST `/api/v1/cart/checkout`

**Mô tả:** Convert giỏ hàng thành RFQ hoặc Order

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "checkout_type": "rfq",            // Required: "rfq" | "order"
  "delivery_address_id": "addr-uuid" // Optional: ID địa chỉ giao hàng
}
```

**Response Success (200) - RFQ:**
```json
{
  "success": true,
  "message": "Đã tạo thành công 2 RFQ",
  "data": {
    "ids": ["rfq-uuid-1", "rfq-uuid-2"],
    "type": "rfq"
  }
}
```

**Response Success (200) - Order:**
```json
{
  "success": true,
  "message": "Đã tạo thành công 2 đơn hàng",
  "data": {
    "ids": ["order-uuid-1", "order-uuid-2"],
    "type": "order"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "error": "Giỏ hàng trống"
}
```

```json
{
  "success": false,
  "error": "Sản phẩm \"Container 40ft\" không còn đủ số lượng"
}
```

---

## Business Logic

### Automatic Cart Creation
- Cart tự động được tạo khi user lần đầu add item
- Cart expires sau 30 ngày
- Một user chỉ có 1 active cart

### Adding Items
- Nếu item đã có trong cart (cùng listing_id, deal_type, rental_duration), quantity sẽ được cộng dồn
- Price snapshot được lưu tại thời điểm add to cart
- Validate stock availability

### Checkout Logic
- Tạo nhiều RFQ/Order nếu có nhiều seller
- Với Order: tự động giảm available_quantity
- Cart được mark là "CONVERTED" sau checkout
- Không thể checkout lại cart đã converted

### Rental Items
- Nếu deal_type = "RENTAL", bắt buộc phải có rental_duration_months >= 1
- Total price = unit_price × quantity × rental_duration_months

---

## Testing với cURL

### 1. Login để lấy token
```bash
curl -X POST http://localhost:3006/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"buyer123"}'
```

### 2. Get cart
```bash
curl http://localhost:3006/api/v1/cart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Add to cart
```bash
curl -X POST http://localhost:3006/api/v1/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "listing_id": "YOUR_LISTING_ID",
    "quantity": 2,
    "deal_type": "SALE"
  }'
```

### 4. Update quantity
```bash
curl -X PUT http://localhost:3006/api/v1/cart/items/ITEM_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'
```

### 5. Remove item
```bash
curl -X DELETE http://localhost:3006/api/v1/cart/items/ITEM_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Get summary
```bash
curl http://localhost:3006/api/v1/cart/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Checkout
```bash
curl -X POST http://localhost:3006/api/v1/cart/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"checkout_type": "rfq"}'
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (not owner) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Notes

- Tất cả endpoints đều require authentication
- Cart tự động expire sau 30 ngày không active
- Price được snapshot tại thời điểm add to cart
- Hỗ trợ cả SALE và RENTAL deal types
- Multi-seller checkout được hỗ trợ

---

**Last Updated:** 2025-11-05  
**Author:** LTA Development Team
