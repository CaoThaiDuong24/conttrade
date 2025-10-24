# Sửa Trang Tạo RFQ - Hiển Thị Đúng Trường Thông Tin

## Ngày: 17/10/2025

## Vấn Đề

Trang tạo RFQ (`/rfq/create`) đang hiển thị nhiều trường thông tin không phù hợp với database schema và backend API:

### Các trường KHÔNG TỒN TẠI trong database:
- ❌ `title` - Tiêu đề RFQ
- ❌ `description` - Mô tả chi tiết
- ❌ `delivery_location` - Địa điểm giao hàng
- ❌ `budget` - Ngân sách dự kiến
- ❌ `currency` - Đơn vị tiền tệ
- ❌ Chi tiết container items (containerType, size, condition, standard)

### Database Schema Thực Tế (`rfqs` table):
```sql
model rfqs {
  id            String         @id
  listing_id    String?
  buyer_id      String
  purpose       RFQPurpose      -- PURCHASE, RENTAL, INQUIRY
  quantity      Int            @default(1)
  need_by       DateTime?
  services_json Json?
  status        RFQStatus      @default(DRAFT)
  submitted_at  DateTime?
  expired_at    DateTime?
  created_at    DateTime       @default(now())
  updated_at    DateTime
}
```

## Giải Pháp

### 1. Cập Nhật Form Data State

**Trước:**
```typescript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  purpose: 'sale' as 'sale' | 'rental',
  deliveryLocation: '',
  expectedDeliveryDate: '',
  budget: '',
  currency: 'VND',
});
```

**Sau:**
```typescript
const [formData, setFormData] = useState({
  purpose: 'sale' as 'sale' | 'rental',
  quantity: 1,
  needBy: '',
  notes: '',
  services: {
    inspection: false,
    repair_estimate: false,
    certification: false,
    delivery_estimate: true,
  }
});
```

### 2. Loại Bỏ Container Items State

Đã xóa state `items` vì thông tin container đã có sẵn trong listing, không cần nhập lại.

### 3. Cập Nhật UI Form

#### Thông tin cơ bản:
- ✅ **Mục đích** (Purpose): Sale/Rental
- ✅ **Số lượng** (Quantity): Số container cần mua/thuê
- ✅ **Ngày cần hàng** (Need By): Thời điểm mong muốn nhận hàng
- ✅ **Ghi chú** (Notes): Ghi chú bổ sung

#### Dịch vụ bổ sung (Services):
- ✅ Kiểm định (Inspection)
- ✅ Báo giá sửa chữa (Repair Estimate)
- ✅ Chứng nhận (Certification)
- ✅ Báo giá vận chuyển (Delivery Estimate)

### 4. Cập Nhật API Payload

**Trước (SAI):**
```typescript
{
  listing_id: listingId,
  title: formData.title,
  description: formData.description,
  purpose: formData.purpose,
  quantity: items.reduce((sum, item) => sum + item.quantity, 0),
  need_by: formData.expectedDeliveryDate,
  delivery_location: formData.deliveryLocation,
  budget: formData.budget,
  currency: formData.currency,
  services: { ... }
}
```

**Sau (ĐÚNG):**
```typescript
{
  listing_id: listingId,
  purpose: formData.purpose,
  quantity: formData.quantity,
  need_by: formData.needBy || undefined,
  services: formData.services
}
```

### 5. Hiển Thị Thông Tin Listing

Form hiển thị thông tin listing để buyer biết đang yêu cầu báo giá cho listing nào:

```typescript
{listingInfo && (
  <Card className="border-primary/20 bg-primary/5">
    <CardHeader>
      <CardTitle>{listingInfo.title}</CardTitle>
      <CardDescription>{listingInfo.description}</CardDescription>
      <Badge>{price} {currency}</Badge>
    </CardHeader>
    <CardContent>
      - Địa điểm: {locationDepot.name}
      - Container: {type} - {size_ft}ft
      - Seller: {seller.displayName}
    </CardContent>
  </Card>
)}
```

## Các Trường Thông Tin Đúng

### Bắt Buộc:
1. **listing_id** - Tự động lấy từ URL params
2. **purpose** - Mục đích: Purchase/Rental
3. **quantity** - Số lượng container

### Không bắt buộc:
4. **need_by** - Ngày cần hàng
5. **services_json** - Các dịch vụ yêu cầu thêm
6. **notes** - Ghi chú (lưu trong services_json)

## Luồng Hoạt Động

1. **Buyer chọn listing** từ trang listings
2. **Click "Yêu cầu báo giá"** → Redirect đến `/rfq/create?listingId=xxx`
3. **Hệ thống load thông tin listing** và hiển thị
4. **Buyer điền thông tin RFQ**:
   - Chọn mục đích (Mua/Thuê)
   - Nhập số lượng
   - Chọn ngày cần hàng (optional)
   - Chọn dịch vụ bổ sung (optional)
   - Thêm ghi chú (optional)
5. **Submit RFQ** → Gửi đến seller của listing
6. **Redirect** đến `/rfq/sent` để xem danh sách RFQ đã gửi

## Validation

```typescript
// Check listing ID
if (!listingId) {
  showError('Không tìm thấy listing ID');
  return;
}

// Check quantity
if (formData.quantity < 1) {
  showError('Số lượng phải lớn hơn 0');
  return;
}

// Các trường khác đều optional
```

## Lưu Ý

1. ✅ RFQ được gửi **trực tiếp đến seller** của listing
2. ✅ RFQ có hiệu lực **7 ngày** kể từ khi gửi
3. ✅ Seller sẽ nhận **notification** khi có RFQ mới
4. ✅ Buyer có thể **theo dõi RFQ** tại trang `/rfq/sent`
5. ✅ Seller có thể **xem RFQ** tại trang `/rfq/received`

## Files Đã Sửa

- ✅ `app/[locale]/rfq/create/page.tsx` - Component tạo RFQ

## Kiểm Tra

- [x] Form hiển thị đúng các trường theo database schema
- [x] Không còn trường thông tin thừa
- [x] Payload gửi API đúng format
- [x] Listing info được hiển thị rõ ràng
- [x] Services checkboxes hoạt động tốt
- [x] Validation đúng logic
- [x] Không có lỗi TypeScript

## Kết Quả

✅ Trang tạo RFQ đã được tối ưu hóa, chỉ hiển thị các trường thông tin cần thiết và phù hợp với database schema.

✅ UI/UX được cải thiện, buyer dễ dàng tạo RFQ hơn với ít trường nhập liệu hơn.

✅ Backend API nhận đúng dữ liệu cần thiết để tạo RFQ.
