# 🎯 KẾ HOẠCH THỰC HIỆN WORKFLOW DELIVERY - CÁC BƯỚC TIẾP THEO

**Date:** 17/10/2025 02:20 AM  
**Status:** 📋 PLANNING

---

## ✅ ĐÃ HOÀN THÀNH

### **BƯỚC 1: PREPARING_DELIVERY** ✅
- [x] API endpoint: `POST /orders/:id/prepare-delivery`
- [x] Database: `order_preparations` table
- [x] Frontend: `ship-order-modal.tsx` component
- [x] Status: `PREPARING_DELIVERY`
- [x] Notifications: Toast success/error
- [x] Tab filter: Included in "Chuẩn bị & Giao hàng"
- [x] Backend validation: Enum case matching
- [x] UI refresh: Auto-reload after success

**Tài liệu:**
- ✅ FIX-ENUM-MISMATCH-COMPLETE.md
- ✅ FIX-UI-NOTIFICATION-TAB-FILTER.md
- ✅ DELIVERY-WORKFLOW-COMPLETE-SUMMARY.md

---

## 🚀 CÁC BƯỚC TIẾP THEO

Theo tài liệu **CHI-TIET-LUONG-SELLER-CHUAN-BI-GIAO-HANG.md**, các bước tiếp theo là:

### **BƯỚC 2: READY_FOR_PICKUP** 📦
**Mục đích:** Seller xác nhận container sẵn sàng để lấy hàng/vận chuyển

**Backend Tasks:**
- [ ] API: `POST /orders/:id/mark-ready`
- [ ] Validate: Order status = PREPARING_DELIVERY
- [ ] Update: order.status → READY_FOR_PICKUP
- [ ] Update: order_preparations.status → READY
- [ ] Notifications: Send to buyer

**Frontend Tasks:**
- [ ] Component: `MarkReadyForm.tsx` (ĐÃ CÓ - cần integrate)
- [ ] Button: Show when status = PREPARING_DELIVERY
- [ ] Form fields:
  - Ready date
  - Pickup location (depot/address)
  - Pickup instructions
  - Access hours
  - Contact person
  - Final photos
- [ ] Toast notifications

**Database:**
Already exists in `order_preparations` table:
```sql
- pickup_location_json
- pickup_contact_name
- pickup_contact_phone
- pickup_instructions
- pickup_available_from
- pickup_available_to
- status = 'READY'
```

**Status Badge:**
Already exists in `order-with-payment-button.tsx`:
```typescript
case 'READY_FOR_PICKUP':
  return <Badge className="bg-purple-600">Sẵn sàng lấy hàng</Badge>
```

---

### **BƯỚC 3: TRANSPORTATION_BOOKED** 🚚
**Mục đích:** Seller đặt vận chuyển và cung cấp tracking info

**Backend Tasks:**
- [ ] API: `POST /orders/:id/ship`
- [ ] Validate: Order status = READY_FOR_PICKUP or PREPARING_DELIVERY
- [ ] Create: `deliveries` record
- [ ] Update: order.status → DELIVERING (or IN_TRANSIT)
- [ ] Store:
  - Tracking number
  - Carrier info
  - Estimated delivery date
  - Route info
  - Driver details
- [ ] Notifications: Send tracking to buyer

**Frontend Tasks:**
- [ ] Component: `TransportationBookingModal.tsx` (ĐÃ CÓ - cần integrate)
- [ ] Form fields:
  - Carrier name
  - Tracking number
  - Transport method (truck/ship)
  - Route (pickup → delivery)
  - Driver info (name, phone, plate)
  - Estimated delivery date
  - Shipping cost (optional)
- [ ] Show tracking link after booking

**Database:**
Already exists in `deliveries` table:
```sql
- tracking_number
- carrier_name
- carrier_contact_json
- transport_method
- route_json
- driver_info_json
- estimated_delivery
- status = 'SHIPPED'
```

---

### **BƯỚC 4: IN_TRANSIT** 📍
**Mục đích:** Cập nhật vị trí container trong quá trình vận chuyển

**Backend Tasks:**
- [ ] API: `PATCH /orders/:id/delivery-status`
- [ ] Update: Current location (GPS coordinates)
- [ ] Update: Progress percentage
- [ ] Update: Milestone reached
- [ ] Notifications: Periodic updates to buyer (optional)

**Frontend Tasks:**
- [ ] Page: Tracking page với map (optional)
- [ ] Component: Progress bar
- [ ] Show: Current location, ETA, progress %
- [ ] Real-time updates (WebSocket - future)

**Database:**
Already exists in `deliveries` table:
```sql
- current_location_json
- progress
- in_transit_at
- status = 'IN_TRANSIT'
```

---

### **BƯỚC 5: DELIVERED** ✅
**Mục đích:** Driver/Seller xác nhận đã giao hàng

**Backend Tasks:**
- [ ] API: `POST /orders/:id/mark-delivered`
- [ ] Validate: Order status = IN_TRANSIT or DELIVERING
- [ ] Update: order.status → DELIVERED
- [ ] Update: deliveries.status → DELIVERED
- [ ] Store:
  - Delivery proof (photos, signature)
  - EIR data (Equipment Interchange Receipt)
  - Received by (name, signature)
  - Delivery location
- [ ] Notifications: Send to buyer (ACTION REQUIRED)

**Frontend Tasks:**
- [ ] Component: `MarkDeliveredForm.tsx` (CẦN TẠO MỚI)
- [ ] Form fields:
  - Delivered date/time
  - Delivery location
  - Proof photos (upload)
  - EIR data:
    * Container number
    * Seal number
    * Condition assessment
    * Damages (if any)
  - Receiver name
  - Receiver signature (canvas/upload)
  - Driver notes

**Database:**
Already exists in `deliveries` table:
```sql
- delivered_at
- delivery_location_json
- delivery_proof_json
- eir_data_json
- received_by_name
- received_by_signature
- driver_notes
```

---

### **BƯỚC 6A: BUYER CONFIRM RECEIPT** ✅
**Mục đích:** Buyer xác nhận đã nhận hàng và hài lòng

**Backend Tasks:**
- [ ] API: `POST /orders/:id/confirm-receipt`
- [ ] Validate: Buyer ownership
- [ ] Validate: Order status = DELIVERED
- [ ] Calculate: Platform fee (5-10%)
- [ ] Release: Escrow payment to seller
- [ ] Update: order.status → COMPLETED
- [ ] Update: payment.status → RELEASED
- [ ] Transfer: Money to seller bank account
- [ ] Notifications: Payment released to seller

**Frontend Tasks:**
- [ ] Component: `ConfirmReceiptForm.tsx` (CẦN TẠO MỚI)
- [ ] Form fields:
  - Satisfied (yes/no)
  - Condition rating (1-5 stars)
  - Inspection date
  - Final inspection photos
  - Condition assessment (exterior, interior, doors, floor)
  - Feedback text
- [ ] Show: Order summary, payment amount
- [ ] Warning: "This action will release payment to seller"

**Payment Flow:**
```typescript
const platformFeeRate = 0.05; // 5%
const sellerAmount = order.total * (1 - platformFeeRate);
const platformFee = order.total * platformFeeRate;

await transferToSellerBankAccount(seller.id, sellerAmount);
```

---

### **BƯỚC 6B: BUYER RAISE DISPUTE** ⚠️
**Mục đích:** Buyer báo cáo vấn đề với container

**Backend Tasks:**
- [ ] API: `POST /orders/:id/raise-dispute`
- [ ] Validate: Buyer ownership
- [ ] Validate: Order status = DELIVERED
- [ ] Create: `disputes` record
- [ ] Hold: Escrow payment (no release)
- [ ] Update: order.status → DISPUTED
- [ ] Update: payment.status → ON_HOLD
- [ ] Notifications: Alert admin + seller

**Frontend Tasks:**
- [ ] Component: `RaiseDisputeForm.tsx` (ĐÃ CÓ - cần integrate)
- [ ] Form fields:
  - Dispute reason (select):
    * Condition not as described
    * Missing documents
    * Wrong container
    * Delivery damage
    * Other
  - Description (required)
  - Evidence photos/videos
  - Requested resolution:
    * Full refund
    * Partial refund
    * Replacement
  - Requested amount (for partial refund)
  - Additional notes

**Database:**
Need `disputes` table:
```sql
CREATE TABLE disputes (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL REFERENCES orders(id),
  raised_by VARCHAR(255) NOT NULL REFERENCES users(id),
  reason VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  evidence_json JSONB,
  requested_resolution VARCHAR(50),
  requested_amount DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'OPEN',
  admin_id VARCHAR(255) REFERENCES users(id),
  resolution TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📊 PRIORITY & TIMELINE

### **Phase 1: Core Delivery Flow** (Priority 1 - 2-3 days)
1. ✅ PREPARING_DELIVERY (DONE)
2. **READY_FOR_PICKUP** (NEXT - 4 hours)
   - Integrate MarkReadyForm component
   - Add button logic
   - Test workflow
3. **TRANSPORTATION_BOOKED** (6 hours)
   - Integrate TransportationBookingModal
   - Test shipping flow
4. **DELIVERED** (8 hours)
   - Create MarkDeliveredForm
   - EIR data capture
   - Upload delivery proof

### **Phase 2: Buyer Confirmation** (Priority 2 - 1-2 days)
5. **CONFIRM RECEIPT** (6 hours)
   - Create ConfirmReceiptForm
   - Payment release logic
   - Bank transfer integration
6. **RAISE DISPUTE** (8 hours)
   - Integrate RaiseDisputeForm
   - Create disputes table
   - Admin notification system

### **Phase 3: Advanced Features** (Priority 3 - 1 week)
7. **IN_TRANSIT Updates** (Optional)
   - GPS tracking integration
   - Progress updates
   - Real-time notifications
8. **Dispute Resolution Dashboard** (Admin)
   - View all disputes
   - Investigation tools
   - Resolution workflow

---

## 🎯 RECOMMENDED NEXT STEP

**Bước 2: READY_FOR_PICKUP** (4 giờ)

### Lý do:
- Component `MarkReadyForm.tsx` đã có
- Database schema đã sẵn sàng
- Tiếp tục flow logic từ PREPARING_DELIVERY
- Critical cho workflow (seller cần báo container sẵn sàng)

### Tasks:
1. ✅ Check existing MarkReadyForm component
2. ⬜ Add backend endpoint validation
3. ⬜ Add button in OrderWithPaymentButton component
4. ⬜ Test workflow end-to-end
5. ⬜ Add toast notifications
6. ⬜ Update tab filter if needed

### Expected Output:
```
Seller flow:
1. Complete preparation
2. Click "Đánh dấu sẵn sàng lấy hàng"
3. Fill form: location, contact, photos
4. Submit → Toast success
5. Order status → READY_FOR_PICKUP
6. Buyer receives notification
7. Order appears in "Chuẩn bị & Giao hàng" tab with purple badge
```

---

## 📖 TÀI LIỆU THAM KHẢO

1. **CHI-TIET-LUONG-SELLER-CHUAN-BI-GIAO-HANG.md** - Complete workflow spec
2. **DELIVERY-WORKFLOW-COMPLETE-SUMMARY.md** - Summary of all changes
3. **FIX-ENUM-MISMATCH-COMPLETE.md** - Enum handling guide
4. **FIX-UI-NOTIFICATION-TAB-FILTER.md** - UI patterns established

---

## ❓ QUESTIONS TO DECIDE

1. **Auto-transition from PREPARING_DELIVERY to READY_FOR_PICKUP?**
   - Currently: Manual (seller must click)
   - Alternative: Auto after X days or when photos uploaded
   - **Recommendation:** Manual (gives seller control)

2. **Required fields for mark-ready?**
   - Minimum: pickup location + contact
   - Optional: photos, instructions
   - **Recommendation:** Make pickup location + contact required

3. **Notification frequency for IN_TRANSIT?**
   - Every hour? Every 6 hours? Only major milestones?
   - **Recommendation:** Major milestones only (avoid spam)

4. **Auto-confirm after 7 days?**
   - If buyer doesn't confirm, auto-release payment?
   - **Recommendation:** Yes, with daily reminders

5. **Dispute handling?**
   - Admin only? Or automated for simple cases?
   - **Recommendation:** Admin review required (protect both parties)

---

**Bạn có muốn tôi implement BƯỚC 2: READY_FOR_PICKUP không?** 🚀

---

**Created:** 17/10/2025 02:20 AM  
**Status:** 📋 PLANNING  
**Next:** BƯỚC 2 - READY_FOR_PICKUP
