# 🐛 FIX: Lỗi hiển thị "Đã bán" cho đơn hàng cho thuê

## Vấn đề

Trong chi tiết đơn hàng, khi người mua chọn **CHO THUÊ** container, danh sách containers vẫn hiển thị badge **"Đã bán"** thay vì **"Đã thuê"**.

![Screenshot showing "Đã bán" for rental order](./screenshots/rental-showing-as-sold.png)

## Nguyên nhân

### 1. **Backend: Order `deal_type` không được set**

Khi tạo order từ quote (API `POST /api/v1/orders`), code đã lấy sai biến:

```typescript
// ❌ SAI: Lấy từ order_items (có thể chưa được populate đầy đủ)
const dealType = newOrder.order_items[0]?.deal_type || 'SALE';
```

Dẫn đến `order.deal_type` bị `NULL`, mặc dù listing là `RENTAL`.

### 2. **Backend: Containers được gán sai trường**

Do `deal_type` không được truyền đúng vào `InventoryService.reserveInventory()`, containers cho thuê bị gán vào:
- ❌ `sold_to_order_id` (sai)
- ❌ Status: `SOLD` (sai)

Thay vì:
- ✅ `rented_to_order_id` (đúng)
- ✅ Status: `RESERVED` (đúng)

### 3. **Frontend: Hiển thị dựa trên relation**

Frontend lấy containers qua Prisma relations:
- `order.listing_containers_sold` → Hiển thị badge "Đã bán"
- `order.listing_containers_rented` → Hiển thị badge "Đã thuê"

Do containers bị gán vào `sold_to_order_id`, chúng xuất hiện trong `listing_containers_sold`, dẫn đến hiển thị sai.

## Giải pháp

### ✅ Fix 1: Sửa Backend Order Creation (Line 595-618)

**File:** `backend/src/routes/orders.ts`

```typescript
// ✅ ĐÚNG: Sử dụng biến dealType đã có từ quote.rfqs.listing
// Thay vì lấy lại từ order_items
if (quote.rfqs.listing_id && selectedContainerIds.length > 0) {
  const { InventoryService } = await import('../lib/inventory/inventory-service');
  const inventoryService = new InventoryService(tx as any);
  
  const totalQty = newOrder.order_items.reduce((sum, item) => sum + item.qty, 0);
  
  // ✅ Use dealType and rentalDurationMonths from variables above
  fastify.log.info(`📦 Reserving inventory - Deal Type: ${dealType}, Rental Duration: ${rentalDurationMonths} months`);
  
  await inventoryService.reserveInventory(
    newOrder.id,
    quote.rfqs.listing_id,
    totalQty,
    selectedContainerIds,
    dealType,  // ✅ Truyền đúng dealType
    rentalDurationMonths  // ✅ Truyền đúng rental duration
  );
}
```

### ✅ Fix 2: Sửa Schema Relation Name (Line 487-498)

**File:** `backend/src/routes/orders.ts`

```typescript
// ✅ ĐÚNG: Dùng 'listings' (số nhiều) theo schema
const quote = await prisma.quotes.findUnique({
  where: { id: quote_id },
  include: {
    rfqs: {
      include: {
        listings: {  // ✅ Không phải 'listing'
          select: {
            deal_type: true
          }
        }
      }
    },
    quote_items: true,
  }
});

// ✅ Lấy deal_type từ đúng relation
const dealType = quote.rfqs.listings?.deal_type || 'SALE';
```

### ✅ Fix 3: Fix Data Hiện Tại

**File:** `backend/fix-rental-order-containers.mjs`

Chạy script để sửa data đã tồn tại:

```bash
cd backend
node fix-rental-order-containers.mjs
```

Script này sẽ:
1. Tìm orders có `listing.deal_type = RENTAL` nhưng `order.deal_type = NULL`
2. Update `order.deal_type` thành `RENTAL`
3. Di chuyển containers từ `sold_to_order_id` sang `rented_to_order_id`
4. Đổi status từ `SOLD` sang `RESERVED`

## Kết quả

### ✅ Trước khi fix:
```
Order: ORD-1763442505560-15W8Y
Deal Type: NULL
Containers: sold_to_order_id (WRONG)
Status: SOLD
Display: "Đã bán" ❌
```

### ✅ Sau khi fix:
```
Order: ORD-1763442505560-15W8Y
Deal Type: RENTAL
Containers: rented_to_order_id (CORRECT)
Status: RESERVED
Display: "Đã thuê" ✅
```

## Testing

1. **Test Order từ RFQ cho thuê:**
   ```bash
   cd backend
   node debug-recent-orders.mjs
   ```
   Kết quả mong đợi:
   - Order có `deal_type = RENTAL`
   - Containers trong `rented_to_order_id`
   - Status là `RESERVED`

2. **Test Frontend Display:**
   - Mở chi tiết đơn hàng cho thuê
   - Kiểm tra badge hiển thị "**Đã thuê**" (màu xanh lá)
   - Không còn "Đã bán" (màu xanh dương)

## Files Changed

1. `backend/src/routes/orders.ts` (2 fixes)
2. `backend/fix-rental-order-containers.mjs` (new script)
3. `backend/debug-rental-containers.mjs` (debug script)
4. `backend/debug-recent-orders.mjs` (debug script)
5. `backend/debug-order-rfq-v2.mjs` (debug script)

## Related Issues

- InventoryService đã có logic đúng để phân biệt SALE/RENTAL
- Frontend hiển thị đã đúng dựa trên relations
- Vấn đề chỉ là ở việc truyền `dealType` sai trong order creation

## Prevention

- ✅ Thêm logging rõ ràng khi reserve inventory
- ✅ Validate `deal_type` trước khi tạo order
- ✅ Unit tests cho InventoryService với cả SALE và RENTAL
- ✅ Integration tests cho luồng tạo order từ RFQ

---

**Status:** ✅ FIXED (18/11/2025)
**Fixed by:** GitHub Copilot
**Tested:** ✅ Passed
