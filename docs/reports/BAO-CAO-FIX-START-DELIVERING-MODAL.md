# 📦 BÁO CÁO: FIX START DELIVERING MODAL (Bước 6.1)

**Ngày:** 22/10/2025  
**Người thực hiện:** GitHub Copilot  
**Vấn đề:** Modal "Bắt đầu vận chuyển" chưa đầy đủ theo tài liệu

---

## 🎯 YÊU CẦU THEO TÀI LIỆU (Bước 6.1)

### Modal "Start Delivery" cần có:
```
├── Logistics info:
│   ├── Company name           ✅
│   ├── Driver name            ✅
│   ├── Vehicle number         ✅
│   ├── Driver phone           ✅
│   └── Tracking number        ✅
├── Estimated delivery date/time  ⚠️ (thiếu time picker)
├── Route (optional)           ❌ THIẾU
└── Upload: Bill of lading, loading photos  ❌ THIẾU
```

---

## 🔍 TÌNH TRẠNG TRƯỚC KHI FIX

### Frontend (`StartDeliveringForm.tsx`):
- ✅ Tên công ty vận chuyển (carrierName)
- ✅ Mã vận đơn (trackingNumber)
- ✅ Ngày giao dự kiến (estimatedDeliveryDate)
- ✅ Tên tài xế (driverName)
- ✅ Số điện thoại tài xế (driverPhone)
- ✅ Biển số xe (vehicleNumber)
- ✅ Phương thức vận chuyển (transportMethod)
- ✅ Ghi chú (notes)

### Thiếu:
1. ❌ **Time picker** cho giờ giao dự kiến
2. ❌ **Route field** (lộ trình tùy chọn)
3. ❌ **File upload** cho Bill of lading
4. ❌ **File upload** cho loading photos

### Backend:
- ❌ Không nhận `route` field
- ❌ Không xử lý file uploads

---

## ✅ NHỮNG GÌ ĐÃ FIX

### 1. **Frontend Form - Thêm Fields Mới**

#### a) Thêm Time Picker:
```tsx
// Thêm vào formData state
estimatedDeliveryTime: '',

// UI: Chia thành 2 inputs
<Input type="date" />  // Ngày
<Input type="time" />  // Giờ

// Submit: Combine date + time
let estimatedDelivery = formData.estimatedDeliveryDate;
if (formData.estimatedDeliveryTime) {
  estimatedDelivery += `T${formData.estimatedDeliveryTime}`;
}
```

#### b) Thêm Route Field:
```tsx
// Thêm vào formData
route: '',

// UI: Textarea
<Textarea 
  placeholder="VD: Depot Cát Lái → Quốc lộ 1A → Bình Dương"
  rows={2}
/>
```

#### c) Thêm File Upload Fields:
```tsx
// Thêm vào formData
billOfLading: null as File | null,
loadingPhotos: [] as File[]

// UI: File inputs
<Input type="file" accept=".pdf,.jpg,.jpeg,.png" />
<Input type="file" accept="image/*" multiple />
```

**Note:** File upload hiện tại chỉ là UI, backend chưa hỗ trợ multipart/form-data. Đã thêm TODO comment để implement sau.

### 2. **Backend API - Nhận Route Field**

#### File: `backend/src/routes/orders.ts`

**a) Thêm route vào Body type:**
```typescript
Body: {
  carrierName?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  driverInfo?: any;
  transportMethod?: string;
  route?: string;           // ← NEW
  notes?: string;
}
```

**b) Destructure route từ request.body:**
```typescript
const { 
  carrierName, 
  trackingNumber, 
  estimatedDeliveryDate,
  driverInfo,
  transportMethod,
  route,              // ← NEW
  notes
} = request.body;
```

**c) Lưu route vào database (route_json):**
```typescript
// Update delivery
data: {
  status: 'in_transit',
  carrier_name: carrierName,
  tracking_number: trackingNumber,
  estimated_delivery: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : null,
  driver_info_json: driverInfo ? JSON.stringify(driverInfo) : null,
  transport_method: transportMethod,
  route_json: route ? JSON.stringify({ route: route }) : null,  // ← NEW
  notes: notes,
  in_transit_at: new Date(),
  updated_at: new Date()
}
```

---

## 📊 SO SÁNH TRƯỚC VÀ SAU

### TRƯỚC:
| Field | Frontend | Backend | Database |
|-------|----------|---------|----------|
| Company name | ✅ | ✅ | ✅ |
| Tracking number | ✅ | ✅ | ✅ |
| Delivery date | ✅ | ✅ | ✅ |
| Delivery time | ❌ | ❌ | ❌ |
| Driver name | ✅ | ✅ | ✅ (JSON) |
| Driver phone | ✅ | ✅ | ✅ (JSON) |
| Vehicle number | ✅ | ✅ | ✅ (JSON) |
| Transport method | ✅ | ✅ | ✅ |
| Route | ❌ | ❌ | ❌ |
| Notes | ✅ | ✅ | ✅ |
| Bill of lading | ❌ | ❌ | ❌ |
| Loading photos | ❌ | ❌ | ❌ |

### SAU:
| Field | Frontend | Backend | Database |
|-------|----------|---------|----------|
| Company name | ✅ | ✅ | ✅ |
| Tracking number | ✅ | ✅ | ✅ |
| Delivery date | ✅ | ✅ | ✅ |
| Delivery time | ✅ | ✅ | ✅ |
| Driver name | ✅ | ✅ | ✅ (JSON) |
| Driver phone | ✅ | ✅ | ✅ (JSON) |
| Vehicle number | ✅ | ✅ | ✅ (JSON) |
| Transport method | ✅ | ✅ | ✅ |
| Route | ✅ | ✅ | ✅ (JSON) |
| Notes | ✅ | ✅ | ✅ |
| Bill of lading | 🟡 UI only | ⏳ TODO | ⏳ TODO |
| Loading photos | 🟡 UI only | ⏳ TODO | ⏳ TODO |

**Legend:**
- ✅ Hoàn thành
- 🟡 UI có nhưng chưa submit
- ⏳ Sẽ implement sau

---

## 🐛 VẤN ĐỀ CÒN LẠI

### 1. **Lỗi 400 Bad Request**

**Nguyên nhân:** Order status không đúng

Log cho thấy khi gọi `/start-delivering`, order có status = `SCHEDULED` (sau book transportation), nhưng endpoint yêu cầu status = `READY_FOR_PICKUP`.

**Workflow đúng theo tài liệu:**
```
PAID → mark-ready → READY_FOR_PICKUP → start-delivering → IN_TRANSIT
```

**Workflow hiện tại (SAI):**
```
PAID → book-transportation → SCHEDULED → ??? → start-delivering → 400 ERROR
```

**Cần kiểm tra:**
- Xem order hiện tại có status gì (dùng script `check-order-status.js`)
- Có thể cần gọi `/mark-ready` trước `/start-delivering`
- Hoặc endpoint cần accept cả status `SCHEDULED`

### 2. **File Upload Chưa Implement**

**Hiện tại:**
- ✅ Frontend có UI cho file input
- ❌ Frontend không gửi files (chỉ gửi JSON)
- ❌ Backend không nhận multipart/form-data

**Cần làm:**

#### Backend:
```typescript
// Install multipart plugin
npm install @fastify/multipart

// Register plugin
fastify.register(require('@fastify/multipart'), {
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Handle file upload in endpoint
const data = await request.file();
// Save to storage (S3, CloudFlare R2, local...)
```

#### Frontend:
```typescript
// Change from JSON to FormData
const formData = new FormData();
formData.append('carrierName', carrierName);
formData.append('billOfLading', file);

fetch(url, {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
    // Don't set Content-Type, browser auto-sets with boundary
  }
});
```

---

## 📝 TESTING CHECKLIST

### Frontend:
- [ ] Mở modal "Bắt đầu vận chuyển"
- [ ] Kiểm tra tất cả fields hiển thị đúng
- [ ] Test date picker (min = hôm nay)
- [ ] Test time picker
- [ ] Test route textarea
- [ ] Test file inputs (1 file, nhiều files)
- [ ] Test validation (required fields)
- [ ] Test submit với data đầy đủ
- [ ] Test error handling

### Backend:
- [ ] Kiểm tra endpoint nhận `route` field
- [ ] Kiểm tra route được lưu vào `route_json`
- [ ] Kiểm tra estimated_delivery nhận date+time ISO format
- [ ] Kiểm tra notification được gửi đến buyer
- [ ] Kiểm tra order status chuyển sang `DELIVERING`
- [ ] Kiểm tra delivery status = `in_transit`

### Integration:
- [ ] Test full flow: PAID → mark-ready → start-delivering
- [ ] Verify data trong database
- [ ] Verify notification hiển thị
- [ ] Test tracking page với thông tin mới

---

## 🚀 CẦN LÀM TIẾP

### Priority 1 (Ngay):
1. **Fix lỗi 400 Bad Request**
   - Check order status
   - Đảm bảo order ở trạng thái `READY_FOR_PICKUP`
   - Có thể cần gọi `/mark-ready` trước

### Priority 2 (Tuần này):
2. **Implement File Upload**
   - Backend: Install @fastify/multipart
   - Backend: Handle file upload
   - Backend: Save to storage (S3 hoặc local)
   - Frontend: Submit FormData thay vì JSON
   - Database: Lưu file URLs

### Priority 3 (Tháng này):
3. **Improve UX**
   - Preview ảnh trước khi upload
   - Progress bar cho upload
   - Validate file size/type trước khi submit
   - Hiển thị uploaded files

---

## 📊 KẾT QUẢ

### ✅ Hoàn thành:
- ✅ Thêm time picker cho estimated delivery
- ✅ Thêm route field (frontend + backend)
- ✅ Thêm UI cho file upload (billOfLading, loadingPhotos)
- ✅ Backend nhận và lưu route vào database
- ✅ Combine date+time thành ISO datetime

### 🟡 Còn lại:
- ⏳ File upload implementation (backend multipart)
- ⏳ Fix 400 error (order status issue)
- ⏳ Test và verify với data thật

### Tiến độ:
- **Theo tài liệu:** 80% hoàn thành
  - ✅ 8/10 fields có đầy đủ
  - 🟡 2/10 fields chỉ có UI
  
- **Production ready:** 70%
  - Cần file upload để đầy đủ
  - Cần fix order status workflow

---

## 🎯 ĐÁNH GIÁ

### So với tài liệu:
```
Modal "Start Delivery":
├── Logistics info:
│   ├── Company name           ✅ DONE
│   ├── Driver name            ✅ DONE
│   ├── Vehicle number         ✅ DONE
│   ├── Driver phone           ✅ DONE
│   └── Tracking number        ✅ DONE
├── Estimated delivery date/time  ✅ DONE (date + time)
├── Route (optional)           ✅ DONE
└── Upload: Bill of lading, loading photos  🟡 UI only, backend TODO
```

**Kết luận:** Modal đã đúng **80-90%** theo tài liệu. Chỉ còn file upload cần implement backend.

---

## 📄 FILES MODIFIED

1. **Frontend:**
   - `components/orders/StartDeliveringForm.tsx`
     - Added: `estimatedDeliveryTime`, `route`, `billOfLading`, `loadingPhotos` fields
     - Updated: Submit logic to combine date+time
     - Added: File input UI

2. **Backend:**
   - `backend/src/routes/orders.ts`
     - Added: `route` field to Body type
     - Added: route destructuring
     - Updated: Save route to `route_json` in database

---

**Báo cáo này được tạo:** 22/10/2025 03:05 AM  
**Status:** ✅ Modal updated, ⏳ File upload pending  
**Next step:** Test với order thật và implement file upload backend
