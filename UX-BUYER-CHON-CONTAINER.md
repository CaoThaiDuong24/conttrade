# 📦 UX FLOW: BUYER CHỌN CONTAINER CỤ THỂ

> **Vấn đề:** Buyer có 3 cách mua nhưng CHƯA CÓ UI để chọn container cụ thể theo mã ISO  
> **Giải pháp:** Tạo component chọn containers cho cả 3 luồng mua hàng

---

## 🎯 TÓM TẮT VẤN ĐỀ

### Hiện trạng:

**Backend:** ✅ Đã có
- API trả về danh sách containers: `GET /listings/:id/containers`
- Response có `container_iso_code`, `status`, `summary`

**Frontend:** ❌ CHƯA có
- Listing detail page KHÔNG hiển thị danh sách containers
- Buyer KHÔNG thể xem danh sách containers
- Buyer KHÔNG thể chọn containers cụ thể
- Chỉ có thể nhập số lượng (không biết đang mua con nào)

### 3 Luồng mua hàng cần hỗ trợ:

1. **Mua trực tiếp** (Direct Order) - Click "Mua ngay"
2. **Mua qua giỏ hàng** (Cart) - Click "Thêm vào giỏ"
3. **Mua qua báo giá** (RFQ) - Click "Yêu cầu báo giá"

---

## 📍 PHƯƠNG ÁN THIẾT KẾ UX

### Phương án 1: Hiển thị danh sách + Chọn số lượng (Đơn giản) ⭐ **KHUYẾN NGHỊ**

**Khi nào dùng:** Listing có containers NHƯNG buyer chỉ cần mua theo SỐ LƯỢNG

**UI Flow:**

```
┌──────────────────────────────────────────────────────────┐
│  Container 40HC - Grade A                                │
│  Giá: 2,500 USD/unit                                     │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  📦 Thông tin số lượng                                   │
│  ┌──────────┬──────────┬──────────┐                     │
│  │ Tổng: 50 │ Có sẵn: 48 │ Đã bán: 2 │                  │
│  └──────────┴──────────┴──────────┘                     │
│                                                          │
│  📋 Danh sách Container (Xem thêm ▼)                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │ ABCU1234560 - CMA CGM - 2020 - ✅ Khả dụng      │    │
│  │ MSCU9876540 - MSC - 2019 - ✅ Khả dụng          │    │
│  │ MAEU1111110 - Maersk - 2021 - ✅ Khả dụng       │    │
│  │ ... (45 containers nữa)                          │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Số lượng cần mua: [  5  ] [−] [+]                      │
│  (Hệ thống sẽ tự động chọn 5 containers khả dụng)       │
│                                                          │
│  [Thêm vào giỏ]  [Mua ngay]  [Yêu cầu báo giá]         │
└──────────────────────────────────────────────────────────┘
```

**Ưu điểm:**
- ✅ Đơn giản, dễ hiểu
- ✅ Buyer thấy được danh sách containers (minh bạch)
- ✅ Nhưng không cần chọn từng con (giảm phức tạp)
- ✅ Hệ thống tự động chọn containers AVAILABLE

**Nhược điểm:**
- ❌ Buyer không kiểm soát chính xác mua container nào
- ❌ Không phù hợp nếu buyer muốn chọn hãng tàu cụ thể

---

### Phương án 2: Chọn từng container (Chi tiết)

**Khi nào dùng:** Buyer MUỐN chọn CHÍNH XÁC từng container theo mã ISO

**UI Flow:**

```
┌──────────────────────────────────────────────────────────┐
│  Container 40HC - Grade A                                │
│  Giá: 2,500 USD/unit                                     │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  📦 Chọn Container Cụ Thể                                │
│  Còn lại: 48/50 containers | Đã chọn: 3 containers      │
│                                                          │
│  🔍 Lọc: Hãng tàu [All ▼]  Năm SX [All ▼]               │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │ ☑ ABCU1234560  │ CMA CGM  │ 2020 │ 2,500 USD   │    │
│  │ ☑ MSCU9876540  │ MSC      │ 2019 │ 2,500 USD   │    │
│  │ ☑ MAEU1111110  │ Maersk   │ 2021 │ 2,500 USD   │    │
│  │ ☐ CMAU2222220  │ CMA CGM  │ 2020 │ 2,500 USD   │    │
│  │ ☐ HLCU3333330  │ Hapag    │ 2022 │ 2,500 USD   │    │
│  │ ... (43 containers nữa)                          │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Tổng tiền: 7,500 USD (3 containers)                    │
│                                                          │
│  [Thêm vào giỏ]  [Mua ngay]  [Yêu cầu báo giá]         │
└──────────────────────────────────────────────────────────┘
```

**Ưu điểm:**
- ✅ Buyer kiểm soát hoàn toàn (chọn chính xác container nào)
- ✅ Có thể lọc theo hãng tàu, năm sản xuất
- ✅ Minh bạch, rõ ràng

**Nhược điểm:**
- ❌ Phức tạp hơn (nhiều bước)
- ❌ Mất thời gian nếu cần chọn nhiều containers

---

### Phương án 3: Kết hợp (Hybrid) ⭐⭐⭐ **TỐT NHẤT**

**Cách hoạt động:** Mặc định là Phương án 1, có toggle để chuyển sang Phương án 2

**UI Flow:**

```
┌──────────────────────────────────────────────────────────┐
│  Container 40HC - Grade A                                │
│  Giá: 2,500 USD/unit                                     │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  📦 Danh sách Container                                  │
│  Còn lại: 48/50 containers                               │
│                                                          │
│  [○ Mua theo số lượng] [● Chọn từng container]          │
│     ^                      ^                             │
│     Phương án 1           Phương án 2                    │
│                                                          │
│  ─────── NẾU CHỌN "Mua theo số lượng" ──────            │
│                                                          │
│  📋 Containers khả dụng (Xem danh sách ▼)                │
│  Số lượng: [  5  ] [−] [+]                               │
│  → Hệ thống tự động chọn 5 containers                    │
│                                                          │
│  [Thêm vào giỏ]  [Mua ngay]  [Yêu cầu báo giá]         │
│                                                          │
│  ─────── NẾU CHỌN "Chọn từng container" ──────          │
│                                                          │
│  🔍 Lọc: Hãng tàu [All ▼]  Năm SX [All ▼]               │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │ ☑ ABCU1234560  │ CMA CGM  │ 2020 │ 2,500 USD   │    │
│  │ ☑ MSCU9876540  │ MSC      │ 2019 │ 2,500 USD   │    │
│  │ ☑ MAEU1111110  │ Maersk   │ 2021 │ 2,500 USD   │    │
│  │ ... (45 containers nữa)                          │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Đã chọn: 3 containers | Tổng: 7,500 USD                │
│                                                          │
│  [Thêm vào giỏ]  [Mua ngay]  [Yêu cầu báo giá]         │
└──────────────────────────────────────────────────────────┘
```

**Ưu điểm:**
- ✅ Linh hoạt (người dùng chọn cách họ muốn)
- ✅ Đơn giản cho người mua thông thường (Phương án 1)
- ✅ Chi tiết cho người mua chuyên nghiệp (Phương án 2)
- ✅ Best of both worlds

---

## 🔧 TRIỂN KHAI CHO 3 LUỒNG MUA HÀNG

### 1. MUA TRỰC TIẾP (Direct Order)

**Button:** "Mua ngay"

**Flow:**

```
Listing Detail Page
    ↓
[Mua ngay] clicked
    ↓
┌──────────────────────────────────────┐
│  Modal: Xác nhận đơn hàng            │
│  ────────────────────────────────    │
│  Container 40HC - Grade A            │
│  Giá: 2,500 USD/unit                 │
│                                      │
│  [○ Số lượng] [● Chọn containers]   │
│                                      │
│  ── Nếu chọn "Số lượng" ──          │
│  Số lượng: [  3  ]                   │
│                                      │
│  ── Nếu chọn "Chọn containers" ──   │
│  ☑ ABCU1234560 - 2,500 USD          │
│  ☑ MSCU9876540 - 2,500 USD          │
│  ☑ MAEU1111110 - 2,500 USD          │
│                                      │
│  Tổng: 7,500 USD                     │
│                                      │
│  [Hủy]  [Xác nhận mua]              │
└──────────────────────────────────────┘
    ↓
POST /api/v1/orders/from-listing
{
  "listingId": "...",
  "quantity": 3,  // Nếu chọn số lượng
  "selectedContainerIds": ["id1", "id2", "id3"]  // Nếu chọn containers
}
    ↓
Order created → Redirect to Orders page
```

---

### 2. MUA QUA GIỎ HÀNG (Cart)

**Button:** "Thêm vào giỏ"

**Flow:**

```
Listing Detail Page
    ↓
[Thêm vào giỏ] clicked
    ↓
┌──────────────────────────────────────┐
│  Modal: Thêm vào giỏ hàng            │
│  ────────────────────────────────    │
│  Container 40HC - Grade A            │
│  Giá: 2,500 USD/unit                 │
│                                      │
│  [○ Số lượng] [● Chọn containers]   │
│                                      │
│  ── Nếu chọn "Số lượng" ──          │
│  Số lượng: [  5  ]                   │
│  Deal type: [SALE ▼]                 │
│                                      │
│  ── Nếu chọn "Chọn containers" ──   │
│  ☑ ABCU1234560 - 2,500 USD          │
│  ☑ MSCU9876540 - 2,500 USD          │
│  ☑ MAEU1111110 - 2,500 USD          │
│  ☑ CMAU2222220 - 2,500 USD          │
│  ☑ HLCU3333330 - 2,500 USD          │
│                                      │
│  Tổng: 12,500 USD (5 containers)     │
│                                      │
│  [Hủy]  [Thêm vào giỏ]             │
└──────────────────────────────────────┘
    ↓
POST /api/v1/cart/items
{
  "listing_id": "...",
  "quantity": 5,  // Nếu chọn số lượng
  "selected_container_ids": ["id1",...,"id5"],  // Nếu chọn containers
  "deal_type": "SALE"
}
    ↓
Added to cart → Toast notification
    ↓
Buyer goes to Cart page
    ↓
┌──────────────────────────────────────┐
│  Giỏ hàng của bạn                    │
│  ────────────────────────────────    │
│  ☑ Container 40HC - Grade A          │
│     • ABCU1234560 (CMA CGM, 2020)   │
│     • MSCU9876540 (MSC, 2019)       │
│     • MAEU1111110 (Maersk, 2021)    │
│     • CMAU2222220 (CMA CGM, 2020)   │
│     • HLCU3333330 (Hapag, 2022)     │
│     Số lượng: 5                      │
│     Đơn giá: 2,500 USD               │
│     Thành tiền: 12,500 USD           │
│     [Sửa] [Xóa]                     │
│                                      │
│  Tổng cộng: 12,500 USD               │
│  [Tạo RFQ] [Đặt hàng ngay]          │
└──────────────────────────────────────┘
```

---

### 3. MUA QUA BÁO GIÁ (RFQ)

**Button:** "Yêu cầu báo giá"

**Flow:**

```
Listing Detail Page
    ↓
[Yêu cầu báo giá] clicked
    ↓
┌──────────────────────────────────────┐
│  Yêu cầu báo giá                     │
│  ────────────────────────────────    │
│  Container 40HC - Grade A            │
│  Người bán: ABC Trading Co.          │
│                                      │
│  [○ Số lượng] [● Chọn containers]   │
│                                      │
│  ── Nếu chọn "Số lượng" ──          │
│  Số lượng: [  10  ]                  │
│  Deal type: [SALE ▼]                 │
│                                      │
│  ── Nếu chọn "Chọn containers" ──   │
│  Đã chọn 10 containers:              │
│  • ABCU1234560 (CMA CGM, 2020)      │
│  • MSCU9876540 (MSC, 2019)          │
│  • ... (8 containers nữa)            │
│  [Sửa lựa chọn]                     │
│                                      │
│  Ghi chú:                            │
│  [________________________________]  │
│  [________________________________]  │
│                                      │
│  [Hủy]  [Gửi yêu cầu báo giá]      │
└──────────────────────────────────────┘
    ↓
POST /api/v1/rfqs
{
  "items": [{
    "listing_id": "...",
    "quantity": 10,
    "selected_container_ids": ["id1",...,"id10"],
    "deal_type": "SALE"
  }],
  "notes": "..."
}
    ↓
RFQ created → Redirect to RFQs page
    ↓
Seller receives notification → Quote giá
```

---

## 📄 COMPONENT ARCHITECTURE

### Component mới cần tạo:

#### 1. `ContainerSelector.tsx`

**Props:**
```typescript
interface ContainerSelectorProps {
  listingId: string;
  mode: 'quantity' | 'selection';  // Phương án 1 hoặc 2
  onSelect: (selection: ContainerSelection) => void;
}

interface ContainerSelection {
  quantity?: number;  // Nếu mode = 'quantity'
  containerIds?: string[];  // Nếu mode = 'selection'
  containers?: Container[];  // Chi tiết containers đã chọn
  totalPrice: number;
}
```

**Features:**
- Fetch containers từ API
- Toggle giữa 2 modes
- Checkbox cho từng container
- Filter theo shipping_line, năm
- Summary (đã chọn X/Y containers)

---

#### 2. Update `AddToCartButton.tsx`

**Cũ:**
```tsx
<AddToCartButton 
  listingId={listing.id}
  maxQuantity={listing.availableQuantity}
/>
```

**Mới:**
```tsx
<AddToCartButton 
  listingId={listing.id}
  maxQuantity={listing.availableQuantity}
  hasContainers={listing.hasContainers}  // ✅ Thêm flag
  onAddToCart={(selection) => {
    // Handle both quantity and container selection
    if (selection.quantity) {
      // Add by quantity
    } else if (selection.containerIds) {
      // Add specific containers
    }
  }}
/>
```

---

#### 3. Update Listing Detail Page

**Thêm section:**
```tsx
{listing.hasContainers && (
  <ContainerListSection 
    listingId={listing.id}
    isSelectable={true}  // ✅ Cho phép chọn
    onSelectionChange={(selected) => {
      setSelectedContainers(selected);
    }}
  />
)}
```

---

## 🎨 UI/UX GUIDELINES

### Khi nào hiển thị Container Selector:

1. **Listing có `listing_containers`** → Hiển thị
2. **Listing chỉ có `quantity`** → KHÔNG hiển thị (chỉ nhập số lượng)

### Default behavior:

- **Mặc định:** Mode "Số lượng" (Phương án 1)
- **Toggle:** Buyer có thể chuyển sang "Chọn containers" (Phương án 2)
- **Mobile:** Chỉ hiển thị Phương án 1 (đơn giản hơn)

### Validation:

- **Số lượng:** Không được vượt quá `availableQuantity`
- **Chọn containers:** Chỉ chọn được containers có `status = AVAILABLE`
- **API:** Backend validate lại khi add to cart / create order

---

## 🚀 ROADMAP TRIỂN KHAI

### Phase 1: Basic (Phương án 1 - Số lượng) ⚡

- [ ] Update `ContainerListSection` - hiển thị read-only
- [ ] Thêm vào Listing Detail Page
- [ ] Keep existing flow (nhập số lượng)

**Timeline:** 2 giờ  
**Impact:** Buyer thấy được danh sách containers (minh bạch)

---

### Phase 2: Selection (Phương án 2 - Chọn containers) 🎯

- [ ] Tạo `ContainerSelector` component
- [ ] Checkbox cho từng container
- [ ] Filter theo hãng tàu, năm
- [ ] Update Backend API hỗ trợ `selected_container_ids`

**Timeline:** 1 ngày  
**Impact:** Buyer kiểm soát chọn container nào

---

### Phase 3: Hybrid (Phương án 3 - Kết hợp) ⭐

- [ ] Toggle giữa 2 modes
- [ ] Update UI/UX cho cả 3 luồng mua hàng
- [ ] Mobile responsive

**Timeline:** 2 ngày  
**Impact:** Best UX, linh hoạt nhất

---

## 📊 SO SÁNH 3 PHƯƠNG ÁN

| Tiêu chí | PA 1: Số lượng | PA 2: Chọn containers | PA 3: Kết hợp |
|----------|----------------|----------------------|---------------|
| **Độ phức tạp** | ⭐ Đơn giản | ⭐⭐⭐ Phức tạp | ⭐⭐ Vừa phải |
| **UX** | ⭐⭐⭐ Tốt | ⭐⭐⭐⭐ Rất tốt | ⭐⭐⭐⭐⭐ Xuất sắc |
| **Thời gian dev** | 2h | 1 ngày | 2 ngày |
| **Kiểm soát** | ❌ Thấp | ✅ Cao | ✅ Cao |
| **Use case** | Mua số lượng lớn | Chọn cụ thể | Universal |

---

## ✅ KHUYẾN NGHỊ

### Triển khai theo thứ tự:

1. **Ngay lập tức:** Phase 1 (2h)
   - Hiển thị danh sách containers (read-only)
   - Buyer thấy được mình đang mua gì

2. **Tuần tới:** Phase 2 (1 ngày)
   - Cho phép chọn containers
   - Update backend hỗ trợ

3. **Tháng tới:** Phase 3 (2 ngày)
   - Polish UX
   - Mobile optimization

---

**📅 Ngày tạo:** 2024-12-07  
**🎯 Mục đích:** Giải quyết vấn đề buyer chọn containers  
**✅ Phương án đề xuất:** Phương án 3 (Kết hợp)
