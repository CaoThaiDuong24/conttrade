# 📋 PHÂN TÍCH: XÁC NHẬN GIAO HÀNG CHO ĐỢN NHIỀU CONTAINER

**Ngày phân tích:** 10/11/2025  
**Vấn đề:** Xác nhận giao hàng và nhận hàng cho đơn có nhiều container

---

## 🎯 TÓM TẮT VẤN ĐỀ

### Hiện trạng (1 Container)
✅ **Hoạt động tốt với đơn hàng 1 container:**
1. Seller xác nhận giao hàng: `POST /orders/:id/mark-delivered` 
   - Đánh dấu toàn bộ order → status `DELIVERED`
   - Tạo notification cho buyer
2. Buyer xác nhận nhận hàng: `POST /orders/:id/confirm-receipt`
   - Kiểm tra tình trạng container (GOOD/MINOR_DAMAGE/MAJOR_DAMAGE)
   - Hoàn tất đơn hàng → status `COMPLETED` hoặc `DISPUTED`

### Vấn đề (Nhiều Container)
❌ **KHÔNG hoạt động với đơn hàng nhiều container:**

**Ví dụ thực tế:**
```
Order #12345: 10 containers
├── Batch 1 (3 containers) - Giao ngày 15/11
├── Batch 2 (3 containers) - Giao ngày 18/11  
├── Batch 3 (2 containers) - Giao ngày 20/11
└── Batch 4 (2 containers) - Giao ngày 22/11
```

**❓ Câu hỏi:**
1. Seller xác nhận giao hàng **MỖI BATCH** như thế nào?
   - Hiện tại API `mark-delivered` chỉ xác nhận cả order → không phù hợp
   - Cần xác nhận TỪNG BATCH riêng lẻ

2. Buyer xác nhận nhận hàng **MỖI BATCH** như thế nào?
   - Hiện tại API `confirm-receipt` yêu cầu order status = `DELIVERED` (toàn bộ)
   - Nếu chỉ giao 3/10 containers → không thể xác nhận được

3. Khi nào order status chuyển thành `DELIVERED`?
   - Sau khi giao Batch 1? Batch 2? Hay toàn bộ 4 batches?

4. Buyer có thể xác nhận từng phần không?
   - Batch 1 giao → buyer xác nhận 3 containers đầu
   - Batch 2 giao → buyer xác nhận tiếp 3 containers
   - ...

---

## 📊 PHÂN TÍCH HIỆN TRẠNG

### 1. API: `POST /orders/:id/mark-delivered` (Seller xác nhận giao)

**Code hiện tại:**
```typescript
// File: backend/src/routes/orders.ts (line 2230-2390)
fastify.post('/:id/mark-delivered', async (request, reply) => {
  const { id } = request.params;  // ← ORDER ID (không phải delivery ID)
  
  // ❌ VẤN ĐỀ 1: Chỉ check order status, không care batch nào
  const validStatuses = ['IN_TRANSIT', 'TRANSPORTATION_BOOKED', 'DELIVERING'];
  if (!validStatuses.includes(order.status)) {
    return reply.status(400).send({ message: 'Invalid status' });
  }

  // ❌ VẤN ĐỀ 2: Lấy delivery[0] - chỉ delivery đầu tiên!
  const delivery = order.deliveries[0];
  if (delivery) {
    await prisma.deliveries.update({
      where: { id: delivery.id },
      data: {
        status: 'DELIVERED',  // ← Mark TOÀN BỘ delivery
        delivered_at: new Date()
      }
    });
  }

  // ❌ VẤN ĐỀ 3: Update TOÀN BỘ ORDER thành DELIVERED
  await prisma.orders.update({
    where: { id },
    data: {
      status: 'DELIVERED',  // ← Toàn bộ order = delivered
      delivered_at: new Date()
    }
  });
});
```

**Vấn đề:**
- ❌ **Không chỉ định batch:** API nhận `orderId` chứ không phải `deliveryId`
- ❌ **Chỉ xử lý 1 delivery:** `order.deliveries[0]` - nếu có nhiều batches thì sao?
- ❌ **Mark toàn bộ order:** Giao xong Batch 1 → toàn bộ order = DELIVERED → SAI!

---

### 2. API: `POST /orders/:id/confirm-receipt` (Buyer xác nhận nhận)

**Code hiện tại:**
```typescript
// File: backend/src/routes/orders.ts (line 2400-2670)
fastify.post('/:id/confirm-receipt', async (request, reply) => {
  const { id } = request.params;  // ← ORDER ID
  
  // ❌ VẤN ĐỀ 1: Yêu cầu toàn bộ order phải DELIVERED
  if (order.status !== 'DELIVERED') {
    return reply.status(400).send({
      message: `Cannot confirm. Order must be DELIVERED. Current: ${order.status}`
    });
  }

  // ❌ VẤN ĐỀ 2: Xác nhận TOÀN BỘ đơn hàng 1 lần
  await prisma.orders.update({
    where: { id },
    data: {
      status: 'COMPLETED',  // ← Hoàn tất toàn bộ order
      receipt_confirmed_at: new Date()
    }
  });
});
```

**Vấn đề:**
- ❌ **Không xác nhận từng batch:** Phải đợi toàn bộ order delivered mới confirm được
- ❌ **Không track container nào:** Không biết buyer đã nhận container nào, chưa nhận container nào
- ❌ **Không linh hoạt:** Batch 1 giao xong → không thể confirm riêng được

---

## 🔍 SO SÁNH TRỰC QUAN

### Luồng Hiện Tại (1 Container)
```
┌─────────────────────────────────────────────────────────────┐
│ Order: 1 container                                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Seller: mark-delivered (orderId)                        │
│    ├── Update order.status = DELIVERED                     │
│    └── Update delivery.status = DELIVERED                  │
│                                                             │
│ 2. Buyer: confirm-receipt (orderId)                        │
│    ├── Check: order.status == DELIVERED ✅                 │
│    ├── Update order.status = COMPLETED                     │
│    └── Release payment                                     │
│                                                             │
│ ✅ Hoạt động tốt với 1 container                           │
└─────────────────────────────────────────────────────────────┘
```

### Vấn đề với Nhiều Container
```
┌─────────────────────────────────────────────────────────────┐
│ Order: 10 containers, 4 batches                            │
├─────────────────────────────────────────────────────────────┤
│ Batch 1: 3 containers - Giao 15/11                        │
│   1. Seller: mark-delivered (orderId)                     │
│      ├── Update order.status = DELIVERED ❌ SAI!          │
│      │   (Mới giao 3/10, nhưng mark cả order = delivered) │
│      └── Update deliveries[0] = DELIVERED                 │
│          (Chỉ delivery đầu tiên)                          │
│                                                            │
│   2. Buyer muốn confirm 3 containers đầu:                 │
│      ├── Check: order.status == DELIVERED ✅              │
│      ├── Nhưng confirm-receipt sẽ mark TOÀN BỘ order     │
│      │   = COMPLETED ❌ SAI!                              │
│      └── Còn 7 containers chưa giao mà đã COMPLETED!     │
│                                                            │
│ Batch 2, 3, 4: Không thể xác nhận riêng được ❌          │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 GIẢI PHÁP ĐỀ XUẤT

### Solution 1: Xác Nhận Giao Hàng THEO DELIVERY (không phải order)

#### 1.1. API Mới: Mark Delivery Delivered

**Endpoint:** `POST /api/v1/deliveries/:deliveryId/mark-delivered`

**Thay vì:**
```typescript
POST /orders/:orderId/mark-delivered  // ❌ Mark cả order
```

**Dùng:**
```typescript
POST /deliveries/:deliveryId/mark-delivered  // ✅ Mark từng delivery
```

**Implementation:**
```typescript
// File: backend/src/routes/deliveries.ts (NEW FILE)

fastify.post<{
  Params: { deliveryId: string },
  Body: {
    deliveredAt?: string,
    deliveryLocation?: any,
    deliveryProof?: string[],
    eirData?: any,
    receivedByName?: string,
    receivedBySignature?: string,
    driverNotes?: string,
    containerIds?: string[]  // 🆕 Chỉ định containers nào đã giao (nếu partial)
  }
}>('/:deliveryId/mark-delivered', {
  preHandler: async (request, reply) => {
    await request.jwtVerify();
  }
}, async (request, reply) => {
  const userId = (request.user as any).userId;
  const { deliveryId } = request.params;
  const {
    deliveredAt,
    deliveryLocation,
    deliveryProof,
    eirData,
    receivedByName,
    receivedBySignature,
    driverNotes,
    containerIds
  } = request.body;

  try {
    // 1. Get delivery với containers
    const delivery = await prisma.deliveries.findUnique({
      where: { id: deliveryId },
      include: {
        orders: true,
        delivery_containers: {
          include: {
            listing_container: true
          }
        }
      }
    });

    if (!delivery) {
      return reply.status(404).send({
        success: false,
        message: 'Delivery not found'
      });
    }

    // 2. Verify seller permission
    if (delivery.orders.seller_id !== userId) {
      return reply.status(403).send({
        success: false,
        message: 'Only seller can mark delivery as delivered'
      });
    }

    // 3. Check delivery status
    if (!['SCHEDULED', 'IN_TRANSIT', 'PICKED_UP'].includes(delivery.status)) {
      return reply.status(400).send({
        success: false,
        message: `Cannot mark delivered. Current status: ${delivery.status}`
      });
    }

    // 4. Update trong transaction
    const result = await prisma.$transaction(async (tx) => {
      // 4.1. Update delivery record
      const updatedDelivery = await tx.deliveries.update({
        where: { id: deliveryId },
        data: {
          status: 'DELIVERED',
          delivered_at: deliveredAt ? new Date(deliveredAt) : new Date(),
          delivery_location_json: deliveryLocation || null,
          delivery_proof_json: deliveryProof || null,
          eir_data_json: eirData || null,
          received_by_name: receivedByName || null,
          received_by_signature: receivedBySignature || null,
          driver_notes: driverNotes || delivery.driver_notes,
          updated_at: new Date()
        }
      });

      // 4.2. Update delivery_containers (mark individual containers delivered)
      const containersToDeliver = containerIds || 
        delivery.delivery_containers.map(dc => dc.container_id);

      await tx.delivery_containers.updateMany({
        where: {
          delivery_id: deliveryId,
          container_id: { in: containersToDeliver }
        },
        data: {
          delivered_at: deliveredAt ? new Date(deliveredAt) : new Date(),
          received_by: receivedByName || null,
          signature_url: receivedBySignature || null,
          updated_at: new Date()
        }
      });

      // 4.3. Update listing_containers status
      await tx.listing_containers.updateMany({
        where: {
          id: { in: containersToDeliver }
        },
        data: {
          delivery_status: 'DELIVERED',
          actual_delivery_date: deliveredAt ? new Date(deliveredAt) : new Date(),
          updated_at: new Date()
        }
      });

      // 4.4. Check if ALL deliveries of this order are delivered
      const allDeliveries = await tx.deliveries.findMany({
        where: { order_id: delivery.order_id }
      });

      const allDelivered = allDeliveries.every(d => 
        d.id === deliveryId || d.status === 'DELIVERED'
      );

      // 4.5. Update order status if all deliveries completed
      if (allDelivered) {
        await tx.orders.update({
          where: { id: delivery.order_id },
          data: {
            status: 'DELIVERED',  // ← Chỉ khi TẤT CẢ batches đã giao
            delivered_at: new Date(),
            updated_at: new Date()
          }
        });
      }

      return { updatedDelivery, allDelivered, containersCount: containersToDeliver.length };
    });

    // 5. Send notifications
    try {
      const { NotificationService } = await import('../lib/notifications/notification-service');
      
      const batchInfo = `Batch ${delivery.batch_number}/${delivery.total_batches}`;
      
      // Notify buyer
      await NotificationService.createNotification({
        userId: delivery.orders.buyer_id,
        type: 'delivery_batch_completed',
        title: `${batchInfo} đã được giao!`,
        message: `${result.containersCount} container(s) đã được giao đến địa chỉ của bạn. Vui lòng kiểm tra và xác nhận.`,
        data: {
          orderId: delivery.order_id,
          deliveryId: delivery.id,
          batchNumber: delivery.batch_number,
          totalBatches: delivery.total_batches,
          containersCount: result.containersCount,
          deliveredAt: deliveredAt || new Date().toISOString()
        }
      });

      // Notify seller
      await NotificationService.createNotification({
        userId: delivery.orders.seller_id,
        type: 'delivery_marked_complete',
        title: `Đã xác nhận giao ${batchInfo}`,
        message: result.allDelivered 
          ? 'Tất cả batches đã được giao. Chờ buyer xác nhận.'
          : `${batchInfo} đã giao. Còn ${delivery.total_batches - delivery.batch_number} batch(es) chưa giao.`,
        data: {
          orderId: delivery.order_id,
          deliveryId: delivery.id,
          allDelivered: result.allDelivered
        }
      });
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
    }

    // 6. Return response
    return reply.send({
      success: true,
      message: `Batch ${delivery.batch_number}/${delivery.total_batches} delivered successfully`,
      data: {
        delivery: {
          id: result.updatedDelivery.id,
          status: 'DELIVERED',
          batchNumber: delivery.batch_number,
          totalBatches: delivery.total_batches,
          deliveredAt: result.updatedDelivery.delivered_at,
          containersDelivered: result.containersCount
        },
        order: {
          id: delivery.order_id,
          allDeliveriesCompleted: result.allDelivered,
          orderStatus: result.allDelivered ? 'DELIVERED' : 'PARTIALLY_DELIVERED'
        }
      }
    });

  } catch (error: any) {
    fastify.log.error('Error marking delivery delivered:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to mark delivery delivered',
      error: error.message
    });
  }
});
```

---

#### 1.2. API Mới: Buyer Confirm Receipt Theo Delivery

**Endpoint:** `POST /api/v1/deliveries/:deliveryId/confirm-receipt`

**Thay vì:**
```typescript
POST /orders/:orderId/confirm-receipt  // ❌ Confirm cả order
```

**Dùng:**
```typescript
POST /deliveries/:deliveryId/confirm-receipt  // ✅ Confirm từng delivery
```

**Implementation:**
```typescript
fastify.post<{
  Params: { deliveryId: string },
  Body: {
    receivedAt?: string,
    receivedBy: string,
    conditions: Array<{  // 🆕 Tình trạng TỪNG container
      containerId: string,
      condition: 'GOOD' | 'MINOR_DAMAGE' | 'MAJOR_DAMAGE',
      photos?: string[],
      notes?: string
    }>,
    overallNotes?: string,
    signature?: string
  }
}>('/:deliveryId/confirm-receipt', {
  preHandler: async (request, reply) => {
    await request.jwtVerify();
  }
}, async (request, reply) => {
  const userId = (request.user as any).userId;
  const { deliveryId } = request.params;
  const { receivedAt, receivedBy, conditions, overallNotes, signature } = request.body;

  try {
    // 1. Get delivery
    const delivery = await prisma.deliveries.findUnique({
      where: { id: deliveryId },
      include: {
        orders: true,
        delivery_containers: {
          include: {
            listing_container: true
          }
        }
      }
    });

    if (!delivery) {
      return reply.status(404).send({
        success: false,
        message: 'Delivery not found'
      });
    }

    // 2. Verify buyer permission
    if (delivery.orders.buyer_id !== userId) {
      return reply.status(403).send({
        success: false,
        message: 'Only buyer can confirm receipt'
      });
    }

    // 3. Check delivery status
    if (delivery.status !== 'DELIVERED') {
      return reply.status(400).send({
        success: false,
        message: `Cannot confirm. Delivery must be DELIVERED. Current: ${delivery.status}`
      });
    }

    // 4. Validate conditions
    const containerIds = delivery.delivery_containers.map(dc => dc.container_id);
    const providedContainerIds = conditions.map(c => c.containerId);
    const missingContainers = containerIds.filter(id => !providedContainerIds.includes(id));

    if (missingContainers.length > 0) {
      return reply.status(400).send({
        success: false,
        message: 'Must provide condition for all containers in this delivery',
        data: { missingContainerIds: missingContainers }
      });
    }

    // 5. Check for major damages (tạo dispute nếu có)
    const majorDamages = conditions.filter(c => c.condition === 'MAJOR_DAMAGE');
    const hasMajorDamage = majorDamages.length > 0;

    // 6. Update trong transaction
    const result = await prisma.$transaction(async (tx) => {
      // 6.1. Update delivery_containers với tình trạng từng container
      for (const conditionData of conditions) {
        await tx.delivery_containers.updateMany({
          where: {
            delivery_id: deliveryId,
            container_id: conditionData.containerId
          },
          data: {
            condition_notes: JSON.stringify({
              condition: conditionData.condition,
              photos: conditionData.photos || [],
              notes: conditionData.notes || ''
            }),
            received_by: receivedBy,
            signature_url: signature || null,
            updated_at: new Date()
          }
        });
      }

      // 6.2. Update delivery record
      await tx.deliveries.update({
        where: { id: deliveryId },
        data: {
          receipt_confirmed_at: new Date(),
          receipt_data_json: {
            receivedAt: receivedAt || new Date().toISOString(),
            receivedBy: receivedBy,
            conditions: conditions,
            overallNotes: overallNotes || '',
            signature: signature || '',
            confirmedAt: new Date().toISOString()
          },
          updated_at: new Date()
        }
      });

      // 6.3. Check if ALL deliveries confirmed
      const allDeliveries = await tx.deliveries.findMany({
        where: { order_id: delivery.order_id }
      });

      const allConfirmed = allDeliveries.every(d => 
        d.id === deliveryId || d.receipt_confirmed_at !== null
      );

      // 6.4. Update order status if all confirmed
      let orderStatus = delivery.orders.status;
      if (allConfirmed) {
        orderStatus = hasMajorDamage ? 'DISPUTED' : 'COMPLETED';
        
        await tx.orders.update({
          where: { id: delivery.order_id },
          data: {
            status: orderStatus,
            receipt_confirmed_at: new Date(),
            receipt_confirmed_by: userId,
            updated_at: new Date()
          }
        });
      }

      // 6.5. Create dispute if major damage
      let disputeId = null;
      if (hasMajorDamage) {
        disputeId = `DSP-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        
        await tx.disputes.create({
          data: {
            id: disputeId,
            order_id: delivery.order_id,
            raised_by: userId,
            status: 'OPEN',
            reason: 'Container(s) damaged on delivery',
            description: `Buyer reported MAJOR_DAMAGE for ${majorDamages.length} container(s) in Batch ${delivery.batch_number}`,
            evidence_json: {
              deliveryId: deliveryId,
              damagedContainers: majorDamages,
              allConditions: conditions
            },
            priority: 'HIGH',
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }

      return {
        allConfirmed,
        orderStatus,
        disputeId,
        damagedCount: majorDamages.length
      };
    });

    // 7. Send notifications
    try {
      const { NotificationService } = await import('../lib/notifications/notification-service');
      
      const batchInfo = `Batch ${delivery.batch_number}/${delivery.total_batches}`;

      if (result.disputeId) {
        // Notify seller about dispute
        await NotificationService.createNotification({
          userId: delivery.orders.seller_id,
          type: 'delivery_issue_reported',
          title: `⚠️ Buyer báo cáo vấn đề - ${batchInfo}`,
          message: `${result.damagedCount} container(s) bị hư hỏng nghiêm trọng trong ${batchInfo}. Tranh chấp đã được tạo.`,
          data: {
            orderId: delivery.order_id,
            deliveryId: deliveryId,
            disputeId: result.disputeId,
            damagedCount: result.damagedCount
          }
        });
      } else {
        // Notify seller about successful confirmation
        await NotificationService.createNotification({
          userId: delivery.orders.seller_id,
          type: 'delivery_confirmed',
          title: `✅ Buyer xác nhận ${batchInfo}`,
          message: result.allConfirmed 
            ? 'Tất cả batches đã được xác nhận. Đơn hàng hoàn tất!'
            : `${batchInfo} đã được xác nhận. Còn ${delivery.total_batches - delivery.batch_number} batch(es).`,
          data: {
            orderId: delivery.order_id,
            deliveryId: deliveryId,
            allConfirmed: result.allConfirmed
          }
        });
      }
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
    }

    // 8. Return response
    return reply.send({
      success: true,
      message: result.disputeId 
        ? `Receipt confirmed with ${result.damagedCount} damaged container(s). Dispute created.`
        : `Receipt confirmed for Batch ${delivery.batch_number}/${delivery.total_batches}`,
      data: {
        delivery: {
          id: deliveryId,
          batchNumber: delivery.batch_number,
          totalBatches: delivery.total_batches,
          confirmedAt: new Date()
        },
        order: {
          id: delivery.order_id,
          status: result.orderStatus,
          allConfirmed: result.allConfirmed
        },
        dispute: result.disputeId ? {
          id: result.disputeId,
          damagedContainers: result.damagedCount
        } : null
      }
    });

  } catch (error: any) {
    fastify.log.error('Error confirming receipt:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to confirm receipt',
      error: error.message
    });
  }
});
```

---

### Solution 2: Thêm Order Status Trung Gian

#### 2.1. New Order Status

**Thêm vào enum:**
```typescript
enum OrderStatus {
  // ... existing statuses
  IN_TRANSIT           // Đang vận chuyển (có delivery đang in transit)
  PARTIALLY_DELIVERED  // 🆕 Một số batch đã giao, một số chưa
  DELIVERED           // Tất cả batches đã giao
  PARTIALLY_CONFIRMED // 🆕 Buyer đã confirm một số batch, chưa hết
  COMPLETED           // Buyer confirm tất cả batches
}
```

#### 2.2. Order Status Transition

```
TRANSPORTATION_BOOKED (Đã đặt vận chuyển)
         ↓
    IN_TRANSIT (Batch 1 đang chuyển)
         ↓
 PARTIALLY_DELIVERED (Batch 1 giao xong, còn Batch 2, 3)
         ↓
    DELIVERED (Tất cả batches đã giao)
         ↓
 PARTIALLY_CONFIRMED (Buyer confirm Batch 1, chưa confirm Batch 2)
         ↓
    COMPLETED (Buyer confirm tất cả) hoặc DISPUTED (có vấn đề)
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Database (1 ngày)
- [ ] Add new order statuses: `PARTIALLY_DELIVERED`, `PARTIALLY_CONFIRMED`
- [ ] Add fields to `deliveries`:
  - [ ] `receipt_confirmed_at` (timestamp buyer confirm)
  - [ ] `receipt_data_json` (thông tin xác nhận)
- [ ] Add fields to `delivery_containers`:
  - [ ] `condition_notes` (tình trạng từng container)
  - [ ] `received_by` (người nhận)
  - [ ] `signature_url` (chữ ký xác nhận)
- [ ] Run migration

### Phase 2: Backend APIs (2-3 ngày)
- [ ] Create new route file: `backend/src/routes/deliveries.ts`
- [ ] Implement `POST /deliveries/:deliveryId/mark-delivered`
- [ ] Implement `POST /deliveries/:deliveryId/confirm-receipt`
- [ ] Update order status logic (check all deliveries)
- [ ] Add validation
- [ ] Add notifications
- [ ] Test APIs

### Phase 3: Update Existing APIs (1 ngày)
- [ ] Deprecate `POST /orders/:id/mark-delivered` (keep for backward compat)
- [ ] Deprecate `POST /orders/:id/confirm-receipt` (keep for backward compat)
- [ ] Update `GET /orders/:id` to show delivery-level status
- [ ] Update `GET /orders/:id/delivery-schedule` to show confirmation status

### Phase 4: Frontend (2-3 ngày)
- [ ] Update seller UI: Button "Xác nhận giao" cho từng batch
- [ ] Update buyer UI: Button "Xác nhận nhận" cho từng batch
- [ ] Show confirmation status per batch
- [ ] Form nhập tình trạng từng container
- [ ] Display overall order status

### Phase 5: Testing (1-2 ngày)
- [ ] Test scenario: 1 container order (backward compat)
- [ ] Test scenario: 3 batches, confirm batch by batch
- [ ] Test scenario: Major damage in 1 batch → dispute
- [ ] Test scenario: Partial confirmation
- [ ] Load testing

---

## 🎯 TÓM TẮT

### Vấn Đề Cốt Lõi
❌ Hệ thống hiện tại xác nhận giao/nhận hàng theo **ORDER** (toàn bộ đơn)  
✅ Cần xác nhận theo **DELIVERY** (từng batch)

### Giải Pháp
1. **Tạo APIs mới theo delivery:**
   - `POST /deliveries/:deliveryId/mark-delivered` (Seller xác nhận giao batch)
   - `POST /deliveries/:deliveryId/confirm-receipt` (Buyer xác nhận nhận batch)

2. **Thêm order statuses trung gian:**
   - `PARTIALLY_DELIVERED` (một số batch đã giao)
   - `PARTIALLY_CONFIRMED` (buyer confirm một số batch)

3. **Track từng container:**
   - Tình trạng container (GOOD/MINOR_DAMAGE/MAJOR_DAMAGE)
   - Thời gian delivered/confirmed cho từng container
   - Chữ ký, ảnh, ghi chú cho từng container

### Lợi Ích
✅ **Linh hoạt:** Xác nhận từng batch độc lập  
✅ **Rõ ràng:** Biết batch nào đã giao, batch nào chưa  
✅ **Chính xác:** Track tình trạng từng container  
✅ **Dispute management:** Tạo dispute riêng cho batch có vấn đề  
✅ **Backward compatible:** Giữ APIs cũ cho đơn 1 container

---

**Ngày:** 10/11/2025  
**Phân tích bởi:** GitHub Copilot  
**Trạng thái:** ✅ Ready for Implementation
