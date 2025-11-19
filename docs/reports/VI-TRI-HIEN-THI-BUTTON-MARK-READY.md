# 📍 VỊ TRÍ HIỂN THỊ: BUTTON "ĐÁNH DẤU SẴN SÀNG PICKUP"

**Ngày:** 21/10/2025  
**Component:** `DeliveryWorkflowStatus.tsx`  
**Trang:** Order Detail Page - Tab "Delivery"

---

## 🗺️ VỊ TRÍ HIỂN THỊ TRÊN GIAO DIỆN

### 1. **Đường dẫn (URL):**
```
http://localhost:3000/orders/[orderId]
```

### 2. **Navigation Path:**
```
Order Detail Page
  ↓
Tab Menu (Overview | Items | Timeline | Delivery | Messages)
  ↓
Click vào tab "Delivery"
  ↓
Component: DeliveryWorkflowStatus
  ↓
Button: "Đánh dấu sẵn sàng"
```

---

## 📱 LAYOUT HIERARCHY

### File Structure:
```
app/[locale]/orders/[id]/page.tsx
  ↓
  TabsContent value="delivery"
    ↓
    Card (border shadow-sm)
      ↓
      CardContent
        ↓
        <DeliveryWorkflowStatus />  ← Component chứa button
```

### Visual Layout:
```
┌─────────────────────────────────────────────────┐
│ Order Detail Page                               │
├─────────────────────────────────────────────────┤
│ [Overview] [Items] [Timeline] [Delivery] [Msg] │ ← Tabs
└─────────────────────────────────────────────────┘
              ↓ Click "Delivery" tab
┌─────────────────────────────────────────────────┐
│ 📦 Trạng thái giao hàng                         │
│ ┌───────────────────────────────────────────┐   │
│ │ ✅ Đã thanh toán                          │   │
│ │ ─────                                     │   │
│ │ 📦 Đang chuẩn bị  ← CURRENT STEP          │   │
│ │    Hoàn thành checklist và đánh dấu sẵn    │   │
│ │    [Đánh dấu sẵn sàng] ← BUTTON HERE!     │   │
│ │ ─────                                     │   │
│ │ ⚪ Sẵn sàng pickup                         │   │
│ │ ─────                                     │   │
│ │ ⚪ Đang giao hàng                          │   │
│ │ ─────                                     │   │
│ │ ⚪ Đã giao hàng                            │   │
│ │ ─────                                     │   │
│ │ ⚪ Hoàn thành                              │   │
│ └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## 🎯 ĐIỀU KIỆN HIỂN THỊ BUTTON

### Workflow Logic:

**File:** `components/orders/DeliveryWorkflowStatus.tsx` (lines ~175-182)

```tsx
{currentStatus === 'preparing_delivery' && userRole === 'seller' && (
  <>
    <p className="text-sm text-gray-600 mb-2">
      Hoàn thành checklist và đánh dấu sẵn sàng
    </p>
    <Button size="sm" onClick={onMarkReady}>
      Đánh dấu sẵn sàng
    </Button>
  </>
)}
```

### 3 Điều kiện BẮT BUỘC:

| Điều kiện | Mô tả | Giá trị |
|-----------|-------|---------|
| 1. **Order Status** | Order phải ở trạng thái "Đang chuẩn bị" | `PREPARING_DELIVERY` |
| 2. **User Role** | User phải là **Seller** của order này | `userRole === 'seller'` |
| 3. **Tab Active** | Phải đang xem tab **"Delivery"** | `TabsContent value="delivery"` |

**Tất cả 3 điều kiện phải TRUE thì button mới hiển thị!**

---

## 📊 WORKFLOW STEPS

### Luồng hoàn chỉnh:

```
Step 1: PAID
  Status: "PAID"
  Button hiển thị: "Bắt đầu chuẩn bị" (Seller)
  Action: Opens PrepareDeliveryForm
  ↓
  
Step 2: PREPARING_DELIVERY  ← CURRENT STEP
  Status: "PREPARING_DELIVERY"
  Button hiển thị: "Đánh dấu sẵn sàng" (Seller) ← WE ARE HERE
  Action: Opens MarkReadyForm
  ↓
  
Step 3: READY_FOR_PICKUP
  Status: "READY_FOR_PICKUP"
  Button hiển thị: None (waiting for carrier)
  Text: "Container sẵn sàng để pickup. Chờ carrier..."
  ↓
  
Step 4: DELIVERING
  Status: "DELIVERING"
  Button hiển thị: "Xác nhận đã giao" (Seller)
  Action: Mark as delivered
  ↓
  
Step 5: DELIVERED
  Status: "DELIVERED"
  Button hiển thị: "Xác nhận nhận hàng" / "Báo cáo vấn đề" (Buyer)
  Action: Complete or dispute
  ↓
  
Step 6: COMPLETED
  Status: "COMPLETED"
  Button hiển thị: None
  Text: Transaction completed
```

---

## 🔍 CODE LOCATION

### 1. Button Render Logic

**File:** `components/orders/DeliveryWorkflowStatus.tsx`

**Lines:** ~154-190 (trong map loop của STATUS_STEPS)

```tsx
{isCurrent && (
  <div className="mt-2">
    {/* Button cho từng status */}
    
    {currentStatus === 'paid' && userRole === 'seller' && (
      <Button size="sm" onClick={onPrepareDelivery}>
        Bắt đầu chuẩn bị
      </Button>
    )}
    
    {currentStatus === 'preparing_delivery' && userRole === 'seller' && (
      <>
        <p className="text-sm text-gray-600 mb-2">
          Hoàn thành checklist và đánh dấu sẵn sàng
        </p>
        <Button size="sm" onClick={onMarkReady}>
          Đánh dấu sẵn sàng  ← TARGET BUTTON
        </Button>
      </>
    )}
    
    {/* Other status buttons... */}
  </div>
)}
```

### 2. Button Click Handler

**File:** `app/[locale]/orders/[id]/page.tsx`

**Lines:** ~951-955

```tsx
<DeliveryWorkflowStatus
  order={order}
  userRole={isSeller ? 'seller' : 'buyer'}
  onPrepareDelivery={() => setShowPrepareForm(true)}
  onMarkReady={() => setShowMarkReadyForm(true)}  ← Handler
  onMarkDelivered={() => {
    showError('Chức năng đang phát triển');
  }}
  onRaiseDispute={() => setShowDisputeForm(true)}
/>
```

**Handler opens modal:**
```tsx
const [showMarkReadyForm, setShowMarkReadyForm] = useState(false);

// onClick: setShowMarkReadyForm(true)
//   ↓
// Modal renders:
{showMarkReadyForm && (
  <div className="fixed inset-0 ... pointer-events-none">
    <div className="... pointer-events-auto">
      <MarkReadyForm ... />
    </div>
  </div>
)}
```

---

## 🎨 UI DESIGN

### Button Styling:

```tsx
<Button size="sm" onClick={onMarkReady}>
  Đánh dấu sẵn sàng
</Button>
```

**Properties:**
- Size: `sm` (small)
- Variant: `default` (primary blue)
- Text: "Đánh dấu sẵn sàng"
- Action: Opens MarkReadyForm modal

**Visual:**
```
┌───────────────────────────┐
│ 📦 Đang chuẩn bị          │
│                           │
│ Hoàn thành checklist và   │
│ đánh dấu sẵn sàng         │
│                           │
│ ┌───────────────────────┐ │
│ │ Đánh dấu sẵn sàng     │ │ ← Blue button
│ └───────────────────────┘ │
└───────────────────────────┘
```

---

## 📍 CÁC BUTTON KHÁC TRÊN CÙNG TRANG

### Workflow Buttons:

| Status | Button Text | User Role | Action |
|--------|-------------|-----------|--------|
| **PAID** | "Bắt đầu chuẩn bị" | Seller | Open PrepareDeliveryForm |
| **PREPARING_DELIVERY** | **"Đánh dấu sẵn sàng"** | **Seller** | **Open MarkReadyForm** ← HERE |
| **READY_FOR_PICKUP** | *(No button)* | - | *(Waiting for carrier)* |
| **DELIVERING** | "Xác nhận đã giao" | Seller | Mark as delivered |
| **DELIVERED** | "Xác nhận nhận hàng" | Buyer | Complete order |
| **DELIVERED** | "Báo cáo vấn đề" | Buyer | Open dispute form |

---

## 🔄 USER FLOW

### Complete User Journey:

```
1. User (Seller) login
   ↓
2. Navigate to "Orders" page
   ↓
3. Click on specific order
   ↓
4. Order Detail Page loads
   ↓
5. Click tab "Delivery"
   ↓
6. See DeliveryWorkflowStatus component
   ↓
7. Current step highlighted: "Đang chuẩn bị"
   ↓
8. See button: "Đánh dấu sẵn sàng"
   ↓
9. Click button
   ↓
10. Modal opens: MarkReadyForm
    ↓
11. Fill form:
    - ✅ Complete checklist
    - 📍 Enter pickup location
    - 👤 Enter contact info
    - 🕒 Select time window
    - 📝 Add instructions
    ↓
12. Click "Đánh dấu sẵn sàng" (submit)
    ↓
13. Form submits → API call
    ↓
14. Success → Modal closes
    ↓
15. Order status updates to "READY_FOR_PICKUP"
    ↓
16. Button disappears
    ↓
17. New text appears: "Container sẵn sàng để pickup..."
```

---

## 🎯 TESTING STEPS

### To see the button:

**Prerequisites:**
1. ✅ User must be logged in as **Seller**
2. ✅ Order must exist in database
3. ✅ Order status must be **"PREPARING_DELIVERY"**
4. ✅ User must be the seller of that order

**Steps:**

```bash
# 1. Create test order in PREPARING_DELIVERY status
# Run in backend folder:
node create-test-order.js

# 2. Start servers
cd backend && npm run dev  # Backend on :3006
cd ..      && npm run dev  # Frontend on :3000

# 3. Open browser
http://localhost:3000

# 4. Login as seller
Email: seller@example.com
Password: seller123

# 5. Navigate to Orders
Click "Orders" in menu

# 6. Click on order
Click on order with status "PREPARING_DELIVERY"

# 7. Switch to Delivery tab
Click "Delivery" tab

# 8. Verify button visible
Look for "Đánh dấu sẵn sàng" button
```

---

## 🐛 TROUBLESHOOTING

### Button không hiển thị?

#### Check 1: Order Status
```javascript
// In browser console:
console.log('Order status:', order.status);
// Expected: "PREPARING_DELIVERY"
```

**If status is different:**
- Order might be in wrong status
- Need to complete "Bắt đầu chuẩn bị" step first

#### Check 2: User Role
```javascript
// In browser console:
const isSeller = user?.id === order?.seller_id;
console.log('Is Seller?', isSeller);
// Expected: true
```

**If false:**
- User is not the seller
- Login with correct seller account

#### Check 3: Tab Active
```javascript
// Check if on Delivery tab
const deliveryTab = document.querySelector('[value="delivery"]');
console.log('Delivery tab active?', deliveryTab?.getAttribute('data-state'));
// Expected: "active"
```

**If not active:**
- Click "Delivery" tab

#### Check 4: Component Rendered
```javascript
// Check if DeliveryWorkflowStatus rendered
const workflow = document.querySelector('.space-y-6');
console.log('Workflow component:', workflow);
// Expected: Element exists
```

---

## 📚 RELATED COMPONENTS

### Component Tree:

```
page.tsx (Order Detail)
  ↓
  Tabs
    ↓
    TabsContent (value="delivery")
      ↓
      Card
        ↓
        DeliveryWorkflowStatus  ← Contains button
          ↓
          STATUS_STEPS.map()
            ↓
            {isCurrent && currentStatus === 'preparing_delivery' && (
              <Button onClick={onMarkReady}>
                Đánh dấu sẵn sàng
              </Button>
            )}
```

### Props Flow:

```
page.tsx:
  onMarkReady={() => setShowMarkReadyForm(true)}
    ↓ passed as prop
  <DeliveryWorkflowStatus onMarkReady={...} />
    ↓ used in
  <Button onClick={onMarkReady}>
    ↓ triggers
  setShowMarkReadyForm(true)
    ↓ shows
  {showMarkReadyForm && <MarkReadyForm />}
```

---

## 📊 SUMMARY

### Location:
- **Page:** Order Detail (`/orders/[id]`)
- **Tab:** "Delivery"
- **Component:** `DeliveryWorkflowStatus`
- **Position:** Under "Đang chuẩn bị" step (when current)

### Visibility:
- ✅ Order status = `PREPARING_DELIVERY`
- ✅ User role = `Seller`
- ✅ Tab = `Delivery`

### Action:
- Click button → Opens MarkReadyForm modal
- Fill form → Submit
- Order status → Updates to `READY_FOR_PICKUP`
- Button → Disappears (no longer in PREPARING_DELIVERY)

### Visual Position:
```
Header
  ↓
Tabs [Overview] [Items] [Timeline] [Delivery ✓] [Messages]
  ↓
Delivery Tab Content:
  ┌─────────────────────────────────────┐
  │ 📦 Trạng thái giao hàng             │
  │                                     │
  │ ✅ Đã thanh toán                    │
  │ ──────────                          │
  │ 📦 Đang chuẩn bị ← YOU ARE HERE     │
  │    [Đánh dấu sẵn sàng] ← BUTTON     │
  │ ──────────                          │
  │ ⚪ Sẵn sàng pickup                   │
  │ ⚪ Đang giao hàng                    │
  │ ⚪ Đã giao hàng                      │
  │ ⚪ Hoàn thành                        │
  └─────────────────────────────────────┘
```

---

**Tài liệu:** VỊ TRÍ HIỂN THỊ BUTTON  
**Ngày:** 21/10/2025  
**Status:** ✅ DOCUMENTED
