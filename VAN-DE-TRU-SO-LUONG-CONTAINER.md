# ⚠️ VẤN ĐỀ: SỐ LƯỢNG CONTAINER LISTING KHÔNG BỊ TRỪ SAU KHI ĐẶT HÀNG VÀ THANH TOÁN

## 📊 Kết Quả Phân Tích

### 🔍 Phát Hiện Vấn Đề
Sau khi người mua đặt hàng và thanh toán, **số lượng container trong listing của người bán KHÔNG bị trừ đi**, dẫn đến:
- Listing vẫn hiển thị số lượng đầy đủ như chưa bán
- Người mua khác có thể đặt hàng số lượng đã bán
- Rủi ro overselling (bán vượt số lượng thực tế)

### 📋 Test Case Thực Tế
```
Listing: Container sàn phẳng 40 feet
- Total Quantity: 10 containers
- Đã có đơn hàng: 5 containers (Status: PAID)
- Available Quantity hiện tại: 10 (❌ SAI - phải là 5)
- Discrepancy: +5 containers (quá nhiều)
```

## 🔎 Nguyên Nhân Gốc Rễ

### 1. ✅ API Tạo Đơn Hàng (`POST /orders/from-listing`) - ĐÚNG
**File:** `backend/src/routes/orders.ts` (dòng 623-850)

Code **ĐÃ CÓ** logic trừ số lượng khi tạo đơn:

```typescript
// ============ 🆕 CREATE ORDER WITH TRANSACTION ============
const order = await prisma.$transaction(async (tx) => {
  // Create order
  const newOrder = await tx.orders.create({...});

  // ============ 🆕 UPDATE CONTAINER STATUS IF SELECTED ============
  if (selected_container_ids && selected_container_ids.length > 0) {
    await tx.listing_containers.updateMany({
      where: {
        listing_id: listingId,
        container_iso_code: { in: selected_container_ids }
      },
      data: {
        status: 'SOLD',
        sold_to_order_id: newOrder.id,
        updated_at: new Date()
      }
    });
  }

  // ============ 🆕 DECREMENT AVAILABLE QUANTITY ============
  await tx.listings.update({
    where: { id: listingId },
    data: {
      available_quantity: {
        decrement: effectiveQuantity  // ✅ TRỪ SỐ LƯỢNG
      }
    }
  });

  return newOrder;
});
```

**Kết luận:** API tạo đơn **ĐÚNG** - đã có logic trừ số lượng trong transaction.

---

### 2. ❓ Vấn Đề: Tại Sao Số Lượng Không Bị Trừ?

Có 3 khả năng:

#### A. ❌ **Đơn Hàng Được Tạo Bằng Cách Khác (Không Qua API Chuẩn)**
Nếu đơn hàng được tạo bằng:
- API cũ không có logic trừ số lượng
- Script test/import dữ liệu
- Thao tác trực tiếp database

→ **Số lượng không bị trừ**

#### B. ❌ **Transaction Bị Rollback Một Phần**
Nếu:
- Transaction tạo order thành công
- Nhưng update listing thất bại
- Hoặc có lỗi database constraint

→ **Số lượng không bị trừ nhưng order vẫn tạo**

#### C. ❌ **Đơn Hàng Bị Hủy Nhưng Không Hoàn Trả Số Lượng**
**File:** `backend/src/routes/orders.ts` (dòng 1667-1770)

Code hủy đơn **KHÔNG CÓ** logic hoàn trả số lượng:

```typescript
// POST /orders/:id/cancel - Hủy order
fastify.post<{ 
  Params: { id: string },
  Body: { reason?: string }
}>('/:id/cancel', {
  // ... auth ...
}, async (request, reply) => {
  // ... validation ...

  // ❌ Chỉ refund payment, KHÔNG hoàn trả số lượng về listing
  if (order.payments && order.payments.length > 0) {
    const latestPayment = order.payments[0];
    if (latestPayment.status === 'escrow_funded') {
      paymentResult = await paymentService.refundEscrowPayment(id, reason);
    }
  }

  // Update order to cancelled
  const updatedOrder = await prisma.orders.update({
    where: { id },
    data: { 
      status: 'cancelled',
      updatedAt: new Date()
    }
  });
  
  // ❌ THIẾU: Hoàn trả available_quantity về listing
  // ❌ THIẾU: Update listing_containers status về AVAILABLE

  return reply.send({...});
});
```

**Kết luận:** Logic hủy đơn **THIẾU** - không hoàn trả số lượng.

---

### 3. ⚠️ **Payment Verification Không Liên Quan**
**File:** `backend/src/routes/orders.ts` (dòng 968-1162)

API xác nhận thanh toán (`POST /orders/:id/payment-verify`):
- Chỉ update payment status
- Chỉ update order status từ `PAYMENT_PENDING_VERIFICATION` → `PAID`
- **KHÔNG liên quan đến việc trừ số lượng**

Logic trừ số lượng **phải xảy ra khi TẠO đơn**, không phải khi thanh toán.

---

## 🐛 Các Bug Cần Fix

### Bug #1: ❌ Logic Hủy Đơn Không Hoàn Trả Số Lượng
**Mức độ:** 🔴 Critical

**Vấn đề:**
- Khi hủy đơn, `available_quantity` không được tăng lại
- `listing_containers` status không được reset về `AVAILABLE`
- Dẫn đến mất số lượng vĩnh viễn

**Impact:**
- Seller mất hàng khi buyer hủy đơn
- Không thể bán lại container đã hủy
- Dữ liệu không nhất quán

---

### Bug #2: ⚠️ Thiếu Xử Lý Khi Payment Bị Reject
**Mức độ:** 🟠 High

**Vấn đề:**
Trong API `payment-verify`, khi seller reject payment:
```typescript
if (!verified) {
  // Seller rejected the payment verification
  await prisma.payments.update({
    where: { id: payment.id },
    data: {
      status: 'FAILED',
      notes: notes || 'Payment verification rejected by seller',
      updated_at: new Date()
    }
  });

  await prisma.orders.update({
    where: { id },
    data: {
      status: 'PENDING_PAYMENT',  // ❌ Đơn quay về pending
      updated_at: new Date()
    }
  });
  
  // ❌ THIẾU: Hoàn trả số lượng về listing
  // ❌ THIẾU: Reset listing_containers status
}
```

**Impact:**
- Khi payment bị reject, số lượng vẫn bị trừ
- Buyer có thể abandon order → mất số lượng vĩnh viễn

---

### Bug #3: ⚠️ Thiếu Xử Lý Các Trạng Thái Order Khác
**Mức độ:** 🟡 Medium

Các trạng thái cần xử lý hoàn trả số lượng:
- `CANCELLED` ✅ Cần fix
- `REFUNDED` ⚠️ Chưa có logic
- `DISPUTED` → `CANCELLED` ⚠️ Chưa có logic
- Order timeout/expired ⚠️ Chưa có logic

---

## 🔧 Giải Pháp Đề Xuất

### Solution 1: Fix Logic Hủy Đơn (Critical)

**File:** `backend/src/routes/orders.ts`

```typescript
// POST /orders/:id/cancel - Hủy order
fastify.post<{ 
  Params: { id: string },
  Body: { reason?: string }
}>('/:id/cancel', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ success: false, message: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  const userId = (request.user as any).userId;
  const { id } = request.params;
  const { reason } = request.body;

  try {
    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        payments: true,
        listing: true,  // 🆕 Cần listing info
        order_items: true  // 🆕 Cần quantity info
      }
    });

    if (!order) {
      return reply.status(404).send({
        success: false,
        message: 'Order not found'
      });
    }

    // ... validation ...

    // ============ 🆕 USE TRANSACTION ============
    const result = await prisma.$transaction(async (tx) => {
      // 1. Refund payment if needed
      let paymentResult = null;
      if (order.payments && order.payments.length > 0) {
        const latestPayment = order.payments[0];
        if (latestPayment.status === 'escrow_funded') {
          const { paymentService } = await import('../lib/payments/payment-service-simple');
          paymentResult = await paymentService.refundEscrowPayment(id, reason);
          
          if (!paymentResult.success) {
            throw new Error(paymentResult.message);
          }
        }
      }

      // 2. Update order to cancelled
      const updatedOrder = await tx.orders.update({
        where: { id },
        data: { 
          status: 'cancelled',
          updatedAt: new Date()
        }
      });

      // 3. 🆕 RESTORE AVAILABLE QUANTITY
      if (order.listing_id) {
        const orderQty = order.order_items[0]?.qty || 0;
        
        await tx.listings.update({
          where: { id: order.listing_id },
          data: {
            available_quantity: {
              increment: Number(orderQty)  // 🆕 HOÀN TRẢ SỐ LƯỢNG
            }
          }
        });

        console.log(`✅ Restored ${orderQty} containers to listing ${order.listing_id}`);
      }

      // 4. 🆕 RESET CONTAINER STATUS
      await tx.listing_containers.updateMany({
        where: {
          sold_to_order_id: id
        },
        data: {
          status: 'AVAILABLE',  // 🆕 Reset về AVAILABLE
          sold_to_order_id: null,
          sold_at: null,
          updated_at: new Date()
        }
      });

      console.log(`✅ Reset containers for order ${id}`);

      return { 
        order: updatedOrder, 
        payment: paymentResult ? { 
          id: paymentResult.paymentId, 
          status: paymentResult.status 
        } : null 
      };
    });

    return reply.send({
      success: true,
      message: 'Order cancelled successfully and inventory restored',
      data: result
    });
  } catch (error: any) {
    fastify.log.error('Error cancelling order:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
});
```

---

### Solution 2: Fix Logic Payment Rejection

**File:** `backend/src/routes/orders.ts`

```typescript
// POST /orders/:id/payment-verify - Seller xác nhận đã nhận tiền
fastify.post<{ 
  Params: { id: string },
  Body: { 
    verified: boolean,
    notes?: string,
    paymentProofUrls?: string[]
  }
}>('/:id/payment-verify', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ success: false, message: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  const userId = (request.user as any).userId;
  const { id } = request.params;
  const { verified, notes, paymentProofUrls } = request.body;

  try {
    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        users_orders_buyer_idTousers: {
          select: { id: true, email: true, display_name: true }
        },
        payments: {
          orderBy: { created_at: 'desc' },
          take: 1
        },
        listing: true,  // 🆕
        order_items: true  // 🆕
      }
    });

    // ... validation ...

    if (!verified) {
      // ============ 🆕 RESTORE INVENTORY WHEN PAYMENT REJECTED ============
      await prisma.$transaction(async (tx) => {
        // Update payment status to FAILED
        await tx.payments.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            notes: notes || 'Payment verification rejected by seller',
            updated_at: new Date()
          }
        });

        // Update order back to PENDING_PAYMENT
        await tx.orders.update({
          where: { id },
          data: {
            status: 'PENDING_PAYMENT',
            updated_at: new Date()
          }
        });

        // 🆕 RESTORE AVAILABLE QUANTITY
        if (order.listing_id) {
          const orderQty = order.order_items[0]?.qty || 0;
          
          await tx.listings.update({
            where: { id: order.listing_id },
            data: {
              available_quantity: {
                increment: Number(orderQty)
              }
            }
          });
        }

        // 🆕 RESET CONTAINER STATUS
        await tx.listing_containers.updateMany({
          where: {
            sold_to_order_id: id
          },
          data: {
            status: 'AVAILABLE',
            sold_to_order_id: null,
            sold_at: null,
            updated_at: new Date()
          }
        });
      });

      // ... send notification ...

      return reply.send({
        success: true,
        message: 'Payment verification rejected and inventory restored',
        data: {
          orderId: order.id,
          status: 'PENDING_PAYMENT',
          paymentStatus: 'FAILED'
        }
      });
    }

    // ... verified = true logic unchanged ...
  } catch (error: any) {
    fastify.log.error('Error verifying payment:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});
```

---

### Solution 3: Tạo Helper Function Để Tái Sử Dụng

**File:** `backend/src/lib/inventory/inventory-service.ts` (NEW)

```typescript
import { PrismaClient } from '@prisma/client';

export class InventoryService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Reserve inventory when order is created
   */
  async reserveInventory(orderId: string, listingId: string, quantity: number, containerIds?: string[]) {
    return await this.prisma.$transaction(async (tx) => {
      // Decrement available quantity
      await tx.listings.update({
        where: { id: listingId },
        data: {
          available_quantity: {
            decrement: quantity
          }
        }
      });

      // Update container status if specific containers selected
      if (containerIds && containerIds.length > 0) {
        await tx.listing_containers.updateMany({
          where: {
            listing_id: listingId,
            container_iso_code: { in: containerIds }
          },
          data: {
            status: 'SOLD',
            sold_to_order_id: orderId,
            sold_at: new Date(),
            updated_at: new Date()
          }
        });
      }

      console.log(`✅ Reserved ${quantity} units for order ${orderId}`);
      return true;
    });
  }

  /**
   * Release inventory when order is cancelled/rejected
   */
  async releaseInventory(orderId: string, listingId: string, quantity: number) {
    return await this.prisma.$transaction(async (tx) => {
      // Increment available quantity
      await tx.listings.update({
        where: { id: listingId },
        data: {
          available_quantity: {
            increment: quantity
          }
        }
      });

      // Reset container status
      await tx.listing_containers.updateMany({
        where: {
          sold_to_order_id: orderId
        },
        data: {
          status: 'AVAILABLE',
          sold_to_order_id: null,
          sold_at: null,
          updated_at: new Date()
        }
      });

      console.log(`✅ Released ${quantity} units from order ${orderId}`);
      return true;
    });
  }

  /**
   * Confirm sale (mark containers as permanently sold)
   */
  async confirmSale(orderId: string) {
    return await this.prisma.$transaction(async (tx) => {
      // Update container status to final SOLD
      const updated = await tx.listing_containers.updateMany({
        where: {
          sold_to_order_id: orderId
        },
        data: {
          status: 'SOLD',
          sold_at: new Date(),
          updated_at: new Date()
        }
      });

      console.log(`✅ Confirmed sale for ${updated.count} containers`);
      return updated.count;
    });
  }
}
```

Sử dụng trong orders.ts:
```typescript
import { InventoryService } from '../lib/inventory/inventory-service';

// In cancel order handler
const inventoryService = new InventoryService(prisma);
await inventoryService.releaseInventory(
  order.id, 
  order.listing_id, 
  Number(order.order_items[0]?.qty || 0)
);
```

---

## 📋 Action Items

### Immediate (Critical)
- [ ] Fix logic hủy đơn hàng - hoàn trả số lượng
- [ ] Fix logic payment rejection - hoàn trả số lượng
- [ ] Test toàn bộ flow: tạo đơn → thanh toán → hủy

### Short Term (High Priority)
- [ ] Tạo InventoryService để centralize logic
- [ ] Thêm logging cho mọi thay đổi inventory
- [ ] Thêm validation kiểm tra available_quantity trước khi tạo đơn

### Long Term (Medium Priority)
- [ ] Implement reserved_quantity cho tạm giữ hàng
- [ ] Thêm timeout auto-cancel cho đơn chưa thanh toán
- [ ] Tạo audit log cho mọi thay đổi inventory
- [ ] Dashboard monitoring inventory discrepancies

---

## 🧪 Test Cases Cần Thực Hiện

### Test 1: Normal Flow
1. Tạo listing với 10 containers
2. Buyer đặt 5 containers
3. Verify: available_quantity = 5 ✅
4. Buyer thanh toán
5. Verify: available_quantity vẫn = 5 ✅
6. Complete order
7. Verify: available_quantity vẫn = 5 ✅

### Test 2: Cancel Before Payment
1. Tạo listing với 10 containers
2. Buyer đặt 5 containers (status: PENDING_PAYMENT)
3. Verify: available_quantity = 5
4. Buyer hủy đơn
5. **Verify: available_quantity = 10** ✅ (PHẢI KHÔI PHỤC)

### Test 3: Payment Rejection
1. Tạo listing với 10 containers
2. Buyer đặt 5 containers
3. Buyer thanh toán (status: PAYMENT_PENDING_VERIFICATION)
4. Seller reject payment
5. **Verify: available_quantity = 10** ✅ (PHẢI KHÔI PHỤC)

### Test 4: Cancel After Payment
1. Tạo listing với 10 containers
2. Buyer đặt 5 containers
3. Buyer thanh toán, seller verify
4. Buyer hủy đơn (với refund)
5. **Verify: available_quantity = 10** ✅ (PHẢI KHÔI PHỤC)

---

## 📊 Database Migration Needed?

**Không cần migration**, chỉ cần:
1. Fix code logic
2. Chạy script fix dữ liệu hiện tại (nếu có đơn bị lỗi)

Script fix dữ liệu:
```sql
-- Find orders that were cancelled but didn't restore inventory
SELECT 
  o.id as order_id,
  o.status,
  o.listing_id,
  l.available_quantity,
  oi.qty as ordered_qty,
  l.title
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN listings l ON l.id = o.listing_id
WHERE o.status IN ('cancelled', 'refunded')
AND o.listing_id IS NOT NULL;

-- Manually restore if needed (run with caution!)
-- UPDATE listings 
-- SET available_quantity = available_quantity + [qty_from_cancelled_order]
-- WHERE id = '[listing_id]';
```

---

## 🎯 Tóm Tắt

**Vấn đề chính:** 
- ✅ Logic tạo đơn đã đúng (có trừ số lượng)
- ❌ Logic hủy đơn THIẾU (không hoàn trả số lượng)
- ❌ Logic payment rejection THIẾU (không hoàn trả số lượng)

**Giải pháp:**
1. Fix cancel order endpoint
2. Fix payment-verify endpoint (rejection case)
3. Tạo InventoryService để tái sử dụng
4. Thêm comprehensive tests

**Priority:** 🔴 Critical - Cần fix ngay lập tức để tránh mất dữ liệu

---

**Ngày phân tích:** 8 Nov 2025
**Phân tích bởi:** GitHub Copilot
