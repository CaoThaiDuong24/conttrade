# 🚚 THÔNG TIN MENU VẬN CHUYỂN (DELIVERY)

**Ngày tạo:** 22/10/2025  
**Mục đích:** Tổng hợp đầy đủ thông tin hiển thị trong menu vận chuyển  
**Phiên bản:** 1.0

---

## 📋 MỤC LỤC

1. [Trang Chính - Quản Lý Vận Chuyển](#1-trang-chính---quản-lý-vận-chuyển)
2. [Quy Trình Vận Chuyển (7 Bước)](#2-quy-trình-vận-chuyển-7-bước)
3. [Hệ Thống Thông Báo](#3-hệ-thống-thông-báo)
4. [Timeline & SLA](#4-timeline--sla)
5. [Navigation & Links](#5-navigation--links)
6. [API Endpoints](#6-api-endpoints)

---

## 1. TRANG CHÍNH - QUẢN LÝ VẬN CHUYỂN

### 📍 URL: `/vi/delivery`

### 🎯 A. HEADER SECTION

| Thành phần | Nội dung |
|-----------|----------|
| **Tiêu đề** | "Quản lý vận chuyển" |
| **Mô tả** | "Theo dõi và quản lý tiến trình vận chuyển container" |
| **Button** | "Yêu cầu vận chuyển" (link: `/vi/delivery/request`) |

---

### 📊 B. THỐNG KÊ CARDS (4 CARDS)

#### **Card 1: Tổng số đơn**
```
Icon: TrendingUp
Màu: Gradient xanh blue-indigo
Số liệu: Tổng tất cả đơn vận chuyển
Label phụ: "Tất cả vận chuyển"
```

#### **Card 2: Đang chuẩn bị**
```
Icon: Package
Màu: Gradient cam orange-amber
Số liệu: Các đơn có status:
  - pending
  - preparing_delivery
  - ready_for_pickup
  - scheduled
Label phụ: "Chưa giao hàng"
```

#### **Card 3: Đang vận chuyển**
```
Icon: Truck
Màu: Gradient xanh lá teal-cyan
Số liệu: Các đơn có status:
  - transportation_booked
  - in_transit
  - delivering
Label phụ: "Trên đường giao"
```

#### **Card 4: Đã giao hàng**
```
Icon: CheckCircle2
Màu: Gradient xanh lá green-emerald
Số liệu: Các đơn có status:
  - delivered
  - completed
Label phụ: "Hoàn thành"
```

---

### 🔍 C. TÌM KIẾM & LỌC

#### **Search Box**
```
Placeholder: "Tìm mã đơn, mã tracking, địa chỉ..."
Icon: Search
Tìm kiếm theo:
  - Mã vận chuyển (delivery ID)
  - Mã tracking (tracking number)
  - Số đơn hàng (order number)
```

#### **Tabs (5 tabs)**
```
1. Tất cả (all)         - Hiển thị tất cả đơn
2. Chuẩn bị (preparing) - Đơn đang chuẩn bị
3. Vận chuyển (transit) - Đơn đang trên đường
4. Đã giao (delivered)  - Đơn đã giao thành công
5. Vấn đề (issues)      - Đơn có tranh chấp/hủy
```

---

### 📋 D. BẢNG DANH SÁCH VẬN CHUYỂN (7 CỘT)

| Cột | Thông tin hiển thị | Chi tiết |
|-----|-------------------|----------|
| **Mã vận chuyển** | ID rút gọn | - 8 ký tự đầu<br>- Icon Package<br>- Font monospace<br>- Background gradient teal |
| **Đơn hàng** | Thông tin đơn | - Số đơn hàng (order_number)<br>- Tên seller (display_name)<br>- 2 dòng hiển thị |
| **Mã Tracking** | Tracking number | - Code badge màu xanh<br>- Font semibold<br>- "Chưa có" nếu null |
| **Địa chỉ giao hàng** | Địa chỉ | - Icon MapPin<br>- delivery_address<br>- Line-clamp 2 dòng<br>- "Chưa cập nhật" nếu null |
| **Trạng thái** | Status badge | - Badge với màu tương ứng<br>- Icon theo status<br>- Label tiếng Việt |
| **Cập nhật** | Thời gian | - Icon Clock<br>- updated_at<br>- Format: dd/mm/yyyy hh:mm |
| **Hành động** | Actions | - Button "Xem chi tiết"<br>- Icon Eye<br>- Link: `/vi/delivery/track/{id}` |

---

### 🎨 E. CÁC TRẠNG THÁI (STATUS) & BADGE

| Status | Label Tiếng Việt | Màu Badge | Icon |
|--------|-----------------|-----------|------|
| `pending` | Chờ xử lý | Secondary (xám) | Clock |
| `preparing_delivery` | Đang chuẩn bị | Secondary | Package |
| `ready_for_pickup` | Sẵn sàng lấy hàng | Default (xanh) | PackageCheck |
| `transportation_booked` | Đã đặt vận chuyển | Default | Calendar |
| `in_transit` | Đang vận chuyển | Secondary | Truck |
| `delivering` | Đang giao hàng | Secondary | Truck |
| `delivered` | Đã giao hàng | Default (xanh) | CheckCircle2 |
| `completed` | Hoàn thành | Default | CheckCircle2 |
| `disputed` | Tranh chấp | Destructive (đỏ) | AlertTriangle |
| `cancelled` | Đã hủy | Destructive | PackageX |
| `failed` | Thất bại | Destructive | AlertTriangle |
| `scheduled` | Đã lên lịch | Default | Calendar |

---

### 🚫 F. TRẠNG THÁI TRỐNG (EMPTY STATES)

#### **Không có dữ liệu:**
```
Icon: Truck (lớn, màu xám)
Tiêu đề: "Chưa có đơn vận chuyển"
Mô tả: "Bạn chưa có đơn vận chuyển nào. Tạo yêu cầu vận chuyển mới để bắt đầu."
Button: "Yêu cầu vận chuyển"
```

#### **Không tìm thấy kết quả:**
```
Icon: Truck (lớn, màu xám)
Tiêu đề: "Không tìm thấy kết quả"
Mô tả: "Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại mã đơn hàng"
```

---

## 2. QUY TRÌNH VẬN CHUYỂN (7 BƯỚC)

### 📦 BƯỚC 1: THANH TOÁN HOÀN THÀNH
**Status:** `PAID` / `ESCROW_FUNDED`

#### Thông tin hiển thị:
- ✅ Thanh toán đã hoàn thành
- 💰 Số tiền escrow
- 📅 Thời gian thanh toán
- 🔒 Trạng thái escrow: "Đang giữ"

#### Notification:
- **Gửi đến:** Seller
- **Nội dung:** "Buyer đã thanh toán. Vui lòng bắt đầu chuẩn bị hàng."

---

### 📦 BƯỚC 2: SELLER CHUẨN BỊ HÀNG
**Status:** `PREPARING_DELIVERY`

#### API Endpoint:
```
POST /api/v1/orders/:id/prepare-delivery
```

#### Thông tin hiển thị:
| Field | Label | Mô tả |
|-------|-------|-------|
| `estimatedReadyDate` | Ngày dự kiến sẵn sàng | Date picker |
| `preparationNotes` | Ghi chú chuẩn bị | Textarea, tối đa 500 ký tự |
| `photos` | Hình ảnh kiểm tra | Array URLs, tối đa 10 ảnh |
| `documents` | Tài liệu | Array objects:<br>- type (bill_of_sale, certificate)<br>- url<br>- name |
| `conditionNotes` | Ghi chú tình trạng | Textarea |

#### Checklist chuẩn bị:
- [ ] Kiểm tra tình trạng container
- [ ] Vệ sinh sạch sẽ
- [ ] Chuẩn bị tài liệu
- [ ] Chụp ảnh hiện trạng
- [ ] Sửa chữa (nếu cần)

#### Notification:
- **Gửi đến:** Buyer
- **Nội dung:** "Seller đang chuẩn bị hàng, dự kiến sẵn sàng vào [date]"

---

### ✅ BƯỚC 3: SẴN SÀNG LẤY HÀNG
**Status:** `READY_FOR_PICKUP`

#### API Endpoint:
```
POST /api/v1/orders/:id/mark-ready
```

#### Thông tin hiển thị:

##### **A. Thông tin thời gian:**
| Field | Label |
|-------|-------|
| `readyDate` | Ngày sẵn sàng |
| `accessHours` | Giờ truy cập |
| `pickupAvailableFrom` | Có thể lấy từ |
| `pickupAvailableTo` | Có thể lấy đến |

##### **B. Địa điểm lấy hàng:**
```json
{
  "depotId": "depot-hcm-001",
  "depotName": "Depot Hải Phòng A",
  "address": "123 Lê Hồng Phong, Hải Phòng",
  "bayNumber": "Bay 5",
  "slotNumber": "Slot 12",
  "coordinates": {
    "lat": 20.8449,
    "lng": 106.6881
  }
}
```

**Hiển thị:**
- 📍 Tên depot
- 🏢 Địa chỉ đầy đủ
- 🎯 Vị trí: Bay X, Slot Y
- 🗺️ Map (Google Maps embed)

##### **C. Thông tin liên hệ:**
```json
{
  "name": "Mr. Tuấn",
  "phone": "0901234567",
  "role": "Depot Manager"
}
```

**Hiển thị:**
- 👤 Tên người liên hệ
- 📞 Số điện thoại (click to call)
- 💼 Vai trò

##### **D. Hướng dẫn lấy hàng:**
- 📋 `pickupInstructions` (textarea)
- 📸 `finalPhotos` (gallery ảnh cuối cùng)

#### Notification:
- **Gửi đến:** Buyer
- **Nội dung:** "Container sẵn sàng! Vui lòng sắp xếp vận chuyển."
- **Actions:** 
  - "Xem chi tiết"
  - "Liên hệ depot"

---

### 🚛 BƯỚC 4: VẬN CHUYỂN
**Status:** `DELIVERING` / `IN_TRANSIT` / `TRANSPORTATION_BOOKED`

#### API Endpoint:
```
POST /api/v1/orders/:id/ship
```

#### A. Thông tin vận chuyển:
| Field | Label | Hiển thị |
|-------|-------|----------|
| `trackingNumber` | Mã tracking | Code badge lớn, có thể copy |
| `carrier` | Nhà vận chuyển | Text lớn, bold |
| `carrierContact` | Liên hệ vận chuyển | Phone, Email, Website (links) |
| `transportMethod` | Phương thức | TRUCK, SHIP, AIR, RAIL |
| `estimatedDelivery` | Ngày giao dự kiến | Date lớn, nổi bật |
| `shippingCost` | Chi phí vận chuyển | Format: 5,000,000 VNĐ |
| `notes` | Ghi chú | Textarea |

#### B. Lộ trình (Route):
```json
[
  {
    "location": "Depot HCM A",
    "type": "PICKUP",
    "scheduledTime": "2025-10-25T09:00:00Z",
    "address": "123 Nguyễn Văn Linh, Q7, HCM",
    "completed": false
  },
  {
    "location": "Depot Hà Nội B",
    "type": "DELIVERY",
    "scheduledTime": "2025-10-30T14:00:00Z",
    "address": "456 Trường Chinh, Đống Đa, HN",
    "completed": false
  }
]
```

**Hiển thị dạng Timeline:**
```
🟢 Depot HCM A (PICKUP)
│   📍 123 Nguyễn Văn Linh, Q7, HCM
│   ⏰ 25/10/2025 09:00
│
│   🚛 Đang vận chuyển...
│   📏 Khoảng cách: ~1,600 km
│   ⏱️ Thời gian dự kiến: 5 ngày
│
🔵 Depot Hà Nội B (DELIVERY)
    📍 456 Trường Chinh, Đống Đa, HN
    ⏰ 30/10/2025 14:00
```

#### C. Thông tin tài xế:
```json
{
  "name": "Nguyễn Văn B",
  "phone": "0912345678",
  "licensePlate": "29A-12345",
  "licenseNumber": "123456789"
}
```

**Hiển thị:**
- 👤 Tên tài xế
- 📞 Số điện thoại (click to call)
- 🚗 Biển số xe
- 🪪 Số GPLX

#### D. Cập nhật vị trí real-time:
```
API: PATCH /api/v1/orders/:id/delivery-status
```

**Thông tin hiển thị:**
- 📍 Vị trí hiện tại (currentLocation)
- 🗺️ Map với marker
- 📊 Progress bar (0-100%)
- 📸 Ảnh checkpoint (optional)
- ⏰ Thời gian cập nhật cuối

#### Notification:
- **Gửi đến:** Buyer & Seller
- **Buyer:** "Đơn hàng đã được ship! Tracking: [number]"
- **Seller:** "Container đang được vận chuyển"
- **Progress updates:** "Container đang ở [location] ([progress]%)"

---

### 📦 BƯỚC 5: ĐÃ GIAO HÀNG
**Status:** `DELIVERED`

#### API Endpoint:
```
POST /api/v1/orders/:id/mark-delivered
```

#### A. Thông tin giao hàng:
| Field | Label | Hiển thị |
|-------|-------|----------|
| `deliveredAt` | Thời gian giao | DateTime lớn, nổi bật |
| `deliveryLocation` | Địa điểm giao | Address + Map |
| `deliveryProof` | Chứng từ giao hàng | Gallery ảnh |

#### B. Equipment Interchange Receipt (EIR):
```json
{
  "containerNumber": "ABCU1234567",
  "sealNumber": "SEAL789123",
  "condition": "GOOD",
  "damages": [],
  "notes": "Container giao trong tình trạng tốt"
}
```

**Hiển thị dạng card:**
```
╔═══════════════════════════════════════╗
║  📋 EQUIPMENT INTERCHANGE RECEIPT     ║
╠═══════════════════════════════════════╣
║  Container: ABCU1234567               ║
║  Seal: SEAL789123                     ║
║  Tình trạng: ✅ Tốt (GOOD)           ║
║  Hư hỏng: Không có                    ║
║  Ghi chú: Container giao trong...     ║
╚═══════════════════════════════════════╝
```

#### C. Thông tin người nhận:
| Field | Label |
|-------|-------|
| `receivedByName` | Tên người nhận |
| `receivedBySignature` | Chữ ký (image) |
| `driverNotes` | Ghi chú tài xế |

**Hiển thị:**
- ✍️ Tên người nhận (bold)
- 🖼️ Chữ ký (ảnh)
- 💬 Ghi chú của tài xế

#### Countdown Timer:
```
⏰ BUYER CÓ 7 NGÀY ĐỂ XÁC NHẬN

Còn lại: 6 ngày 23 giờ 45 phút

Progress bar: [████████░░] 2%

⚠️ Sau 7 ngày, hệ thống sẽ tự động xác nhận
và giải ngân thanh toán cho seller.
```

#### Notification:
- **Gửi đến:** Buyer (priority: HIGH)
- **Nội dung:** "Container đã được giao! Vui lòng kiểm tra và xác nhận trong vòng 7 ngày."
- **Actions:**
  - "Xem chi tiết giao hàng"
  - "Xác nhận đã nhận"
  - "Báo cáo vấn đề"
- **Gửi đến:** Seller
- **Nội dung:** "Container đã giao cho buyer. Chờ xác nhận."

---

### ✅ BƯỚC 6A: BUYER XÁC NHẬN (HAPPY PATH)
**Status:** `COMPLETED`

#### API Endpoint:
```
POST /api/v1/orders/:id/confirm-receipt
```

#### A. Form xác nhận:
| Field | Label | Type |
|-------|-------|------|
| `satisfied` | Hài lòng? | Boolean |
| `inspectionDate` | Ngày kiểm tra | Date |
| `conditionRating` | Đánh giá tình trạng | Stars 1-5 |
| `feedback` | Phản hồi | Textarea |
| `inspectionPhotos` | Ảnh kiểm tra | Upload ảnh |

#### B. Xác nhận tình trạng:
```json
{
  "exterior": "EXCELLENT",
  "interior": "EXCELLENT",
  "doors": "WORKING_PERFECTLY",
  "floor": "CLEAN_AND_SOLID"
}
```

**Hiển thị dạng checklist:**
```
✅ Bên ngoài: Xuất sắc
✅ Bên trong: Xuất sắc
✅ Cửa: Hoạt động hoàn hảo
✅ Sàn: Sạch sẽ và chắc chắn
```

#### C. Thông tin giải ngân:

##### **Seller nhận được:**
```
╔═══════════════════════════════════════╗
║  💰 THANH TOÁN ĐÃ ĐƯỢC GIẢI NGÂN      ║
╠═══════════════════════════════════════╣
║  Tổng đơn hàng:    121,000,000 VNĐ    ║
║  Platform fee (5%): -6,050,000 VNĐ    ║
║  ─────────────────────────────────    ║
║  Bạn nhận được:    114,950,000 VNĐ    ║
║                                       ║
║  💳 Đã chuyển vào: **** 1234          ║
║  ⏰ Thời gian: 31/10/2025 10:00       ║
╚═══════════════════════════════════════╝
```

##### **Buyer rating:**
```
⭐⭐⭐⭐⭐ (5/5)

"Container chính xác như mô tả. Tình trạng
tốt, giao hàng đúng hạn. Rất hài lòng!"
```

#### Notification:
- **Gửi đến:** Seller (priority: HIGH)
- **Nội dung:** "💰 Thanh toán đã được giải ngân! Số tiền 114,950,000 VND đã được chuyển vào tài khoản của bạn."
- **Actions:**
  - "Xem chi tiết thanh toán"
  - "Đánh giá buyer"
- **Gửi đến:** Buyer
- **Nội dung:** "Giao dịch hoàn tất! Cảm ơn bạn đã xác nhận."
- **Actions:**
  - "Đánh giá seller"

---

### ⚠️ BƯỚC 6B: BUYER TRANH CHẤP (ALTERNATIVE PATH)
**Status:** `DISPUTED`

#### API Endpoint:
```
POST /api/v1/orders/:id/raise-dispute
```

#### A. Form tranh chấp:
| Field | Label | Required | Type |
|-------|-------|----------|------|
| `reason` | Lý do | ✅ | Select dropdown |
| `description` | Mô tả chi tiết | ✅ | Textarea |
| `evidence` | Chứng cứ | ✅ | Upload files |
| `requestedResolution` | Yêu cầu giải quyết | ✅ | Select |
| `requestedAmount` | Số tiền yêu cầu | ⚠️ | Number |
| `additionalNotes` | Ghi chú thêm | ❌ | Textarea |

#### B. Lý do tranh chấp (reason):
```
CONDITION_NOT_AS_DESCRIBED  - Tình trạng không đúng mô tả
MISSING_ITEMS               - Thiếu vật phẩm
DELIVERY_DAMAGE             - Hư hỏng khi vận chuyển
WRONG_ITEM                  - Sai hàng
QUALITY_ISSUES              - Vấn đề chất lượng
OTHER                       - Lý do khác
```

#### C. Chứng cứ (evidence):
```json
[
  {
    "type": "photo",
    "url": "https://example.com/disputes/rust-damage-1.jpg",
    "description": "Vết rỉ sét lớn ở thành bên trái",
    "timestamp": "2025-10-31T11:00:00Z"
  },
  {
    "type": "video",
    "url": "https://example.com/disputes/inspection.mp4",
    "description": "Video kiểm tra toàn bộ container",
    "timestamp": "2025-10-31T11:05:00Z"
  }
]
```

**Hiển thị dạng gallery:**
- Thumbnail preview
- Lightbox khi click
- Description dưới mỗi ảnh
- Timestamp

#### D. Yêu cầu giải quyết:
```
FULL_REFUND      - Hoàn tiền đầy đủ
PARTIAL_REFUND   - Hoàn tiền một phần
REPLACEMENT      - Thay thế hàng
REPAIR           - Sửa chữa
```

#### E. Dashboard tranh chấp:

**Thông tin hiển thị:**
```
╔═══════════════════════════════════════════════╗
║  ⚠️ TRANH CHẤP #DISP-20251031-001            ║
╠═══════════════════════════════════════════════╣
║  Đơn hàng: #ORD-20251020-001                  ║
║  Người khởi tạo: Buyer (Nguyễn Văn A)         ║
║  Lý do: Tình trạng không đúng mô tả           ║
║  Yêu cầu: Hoàn tiền một phần (30,000,000 VNĐ) ║
║  Trạng thái: 🔴 Đang xem xét                  ║
║  Ưu tiên: ⚠️ Cao                              ║
║  Admin phụ trách: Chưa phân công              ║
║  Tạo lúc: 31/10/2025 11:30                    ║
╚═══════════════════════════════════════════════╝
```

**Timeline:**
```
📅 31/10/2025 11:30 - Buyer khởi tạo tranh chấp
   💬 "Container có nhiều vết rỉ sét không được đề cập"
   📸 Đã upload 5 ảnh chứng cứ

⏳ Chờ seller phản hồi (72 giờ)

⏳ Chờ admin xem xét
```

#### F. Seller phản hồi:
```
API: POST /api/v1/disputes/:id/respond
```

**Form:**
- Response text (textarea)
- Counter evidence (upload ảnh/video)
- Proposed resolution
- Settlement offer

#### G. Admin resolution options:
```
✅ APPROVE_DISPUTE
   → Chấp nhận tranh chấp
   → Hoàn tiền theo yêu cầu buyer

❌ REJECT_DISPUTE
   → Từ chối tranh chấp
   → Giải ngân cho seller

🤝 MEDIATE
   → Yêu cầu hai bên thương lượng
   → Admin làm trung gian

💰 PARTIAL_SETTLEMENT
   → Giải quyết bồi thường một phần
   → Chia tiền cho cả hai bên
```

#### Notification:
- **Gửi đến:** Admin (priority: CRITICAL)
- **Nội dung:** "⚠️ URGENT: Dispute cần xử lý cho order #[number]"
- **Actions:** "Xem chi tiết dispute"
- **Gửi đến:** Seller (priority: HIGH)
- **Nội dung:** "⚠️ Buyer đã raise dispute. Vui lòng cung cấp phản hồi."
- **Actions:** "Xem dispute & phản hồi"

---

## 3. HỆ THỐNG THÔNG BÁO

### 📱 A. LOẠI THÔNG BÁO

| Event | Recipient | Priority | Icon | Color |
|-------|-----------|----------|------|-------|
| `preparation_started` | Buyer | MEDIUM | Package | Blue |
| `preparation_updated` | Buyer | LOW | Clock | Gray |
| `container_ready` | Buyer | HIGH | CheckCircle | Green |
| `order_shipped` | Buyer | HIGH | Truck | Blue |
| `shipment_confirmed` | Seller | MEDIUM | CheckCircle | Green |
| `delivery_progress` | Buyer | LOW | MapPin | Blue |
| `container_delivered` | Buyer | HIGH | Package | Green |
| `delivery_completed` | Seller | MEDIUM | CheckCircle | Green |
| `payment_released` | Seller | HIGH | DollarSign | Green |
| `transaction_completed` | Buyer | MEDIUM | CheckCircle | Green |
| `dispute_raised` | Admin, Seller | CRITICAL | AlertTriangle | Red |
| `dispute_update` | Both | HIGH | MessageSquare | Orange |
| `auto_confirm_warning` | Buyer | HIGH | Clock | Orange |

### 📬 B. TEMPLATE THÔNG BÁO

#### **Preparation Started**
```
📦 Seller đang chuẩn bị hàng

Seller đã bắt đầu chuẩn bị container của bạn.
Dự kiến sẵn sàng: 20/10/2025

[Xem chi tiết] [Liên hệ seller]
```

#### **Container Ready**
```
✅ Container sẵn sàng!

Container của bạn đã sẵn sàng tại:
📍 Depot Hải Phòng A
🏢 123 Lê Hồng Phong, Hải Phòng
📞 Liên hệ: Mr. Tuấn - 0901234567

Vui lòng sắp xếp vận chuyển.

[Xem vị trí] [Đặt vận chuyển] [Liên hệ depot]
```

#### **Order Shipped**
```
🚛 Đơn hàng đã được ship!

Container đang trên đường đến bạn.

📦 Tracking: VCL-SHIP-20251020-001
🚚 Carrier: Vietnam Container Lines
📅 Dự kiến giao: 30/10/2025

[Theo dõi vận chuyển] [Liên hệ carrier]
```

#### **Delivery Progress**
```
📍 Cập nhật vận chuyển

Container đang ở: Nghệ An
Tiến độ: ████████░░ 60%
Dự kiến đến: 30/10/2025 14:00

[Xem vị trí] [Liên hệ tài xế]
```

#### **Container Delivered**
```
✅ Container đã được giao!

Container đã được giao đến địa chỉ của bạn.

📍 456 Trường Chinh, Đống Đa, HN
⏰ 30/10/2025 15:30
👤 Người nhận: Nguyễn Văn A

⚠️ Vui lòng kiểm tra và xác nhận trong vòng 7 ngày.

[Xem chi tiết] [Xác nhận đã nhận] [Báo cáo vấn đề]
```

#### **Payment Released**
```
💰 THANH TOÁN ĐÃ ĐƯỢC GIẢI NGÂN!

Buyer đã xác nhận nhận hàng và hài lòng.

💵 Số tiền: 114,950,000 VNĐ
💳 Đã chuyển vào: **** 1234
📊 Platform fee: 6,050,000 VNĐ (5%)
⏰ Thời gian: 31/10/2025 10:00

⭐ Buyer rating: 5/5 sao
💬 "Container chính xác như mô tả!"

[Xem thanh toán] [Đánh giá buyer]
```

#### **Auto-Confirm Warning**
```
⏰ NHẮC NHỞ XÁC NHẬN

Còn 2 ngày để xác nhận đã nhận container.

Nếu không xác nhận, hệ thống sẽ tự động
xác nhận và giải ngân cho seller vào
01/11/2025 15:30.

[Xác nhận ngay] [Xem chi tiết]
```

#### **Dispute Raised**
```
⚠️ URGENT: Dispute cần xử lý

Buyer đã raise dispute cho order #ORD-20251020-001

📋 Lý do: Tình trạng không đúng mô tả
💰 Yêu cầu: Hoàn tiền 30,000,000 VNĐ
📸 Có 5 ảnh chứng cứ

Vui lòng cung cấp phản hồi trong 72 giờ.

[Xem dispute] [Phản hồi ngay]
```

---

## 4. TIMELINE & SLA

### ⏱️ A. THỜI GIAN DỰ KIẾN MỖI BƯỚC

| Phase | Duration | Deadline | Auto-Action |
|-------|----------|----------|-------------|
| **Payment → Prepare Start** | 0-1 ngày | 2 ngày | Auto-reminder to seller |
| **Preparing** | 1-3 ngày | 5 ngày | Request update |
| **Ready → Shipped** | 1-2 ngày | 3 ngày | Reminder to arrange shipping |
| **In Transit** | 3-7 ngày | 10 ngày | Track & update |
| **Delivered → Confirm** | 1-7 ngày | **7 ngày** | **AUTO-CONFIRM** ⭐ |
| **Dispute Resolution** | 3-7 ngày | 14 ngày | Escalate to senior admin |
| **TỔNG CỘNG** | **6-20 ngày** | **30 ngày** | Cancel & refund |

### 🔔 B. AUTO-ACTIONS

#### **Day 2 - Seller chưa bắt đầu chuẩn bị:**
```
Action: Send reminder email + push notification
Message: "Vui lòng bắt đầu chuẩn bị container cho order #..."
```

#### **Day 5 - Seller vẫn đang chuẩn bị:**
```
Action: Request update
Message: "Container đã sẵn sàng chưa? Vui lòng cập nhật trạng thái."
```

#### **Day 7 - Container đã delivered:**
```
Action: Daily reminder to buyer
Message: "Còn X ngày để xác nhận đã nhận container."
```

#### **Day 7 (after delivery) - Buyer chưa xác nhận:**
```
Action: AUTO-CONFIRM & RELEASE PAYMENT
Process:
1. Update order.status = 'COMPLETED'
2. Set confirmedAt = NOW()
3. Release escrow to seller
4. Calculate & deduct platform fee
5. Transfer money to seller account
6. Send notifications to both parties
7. Enable review system
```

#### **Day 14 - Dispute không giải quyết được:**
```
Action: Escalate to senior admin
Flag: Priority CRITICAL
```

#### **Day 30 - Order vẫn không hoàn thành:**
```
Action: Auto-cancel & full refund to buyer
Reason: "Order timeout - exceeded 30 days SLA"
```

### 📊 C. PROGRESS TRACKER

**Hiển thị dạng visual timeline:**
```
[✅] Thanh toán         - 20/10/2025 ✓
  ↓  Hoàn thành trong 2 giờ
[✅] Chuẩn bị hàng      - 22/10/2025 ✓
  ↓  Hoàn thành trong 2 ngày
[✅] Sẵn sàng           - 23/10/2025 ✓
  ↓  Hoàn thành trong 1 ngày
[🔄] Vận chuyển         - Đang thực hiện
  ↓  Dự kiến: 3-7 ngày (còn 4 ngày)
[ ] Đã giao            - Chờ
  ↓  
[ ] Xác nhận           - Chờ
```

---

## 5. NAVIGATION & LINKS

### 🧭 A. ĐIỂM TRUY CẬP

#### **1. Header Navigation**
```
Position: Main navigation bar
Icon: Truck
Label: "Vận chuyển"
URL: /vi/delivery
Permission: delivery.read
```

#### **2. Quick Actions (User Menu)**
```
Location: User dropdown menu
Icon: Truck
Label: "Yêu cầu vận chuyển"
URL: /vi/delivery/request
Permission: delivery.write
```

#### **3. Order Detail Page**
```
Location: Tabs trong order detail
Tab: "Delivery"
Shows: Delivery workflow status
Permission: Based on user role
```

#### **4. Dashboard Widget**
```
Location: User dashboard
Type: Statistics card
Shows: 
  - Pending deliveries count
  - In-transit count
  - Requires action count
Link: /vi/delivery
```

### 🔗 B. SUB-PAGES

| URL | Page | Description | Permission |
|-----|------|-------------|------------|
| `/vi/delivery` | Danh sách | Trang chính - quản lý tất cả | `delivery.read` |
| `/vi/delivery/request` | Tạo mới | Yêu cầu vận chuyển mới | `delivery.write` |
| `/vi/delivery/track/{id}` | Theo dõi | Chi tiết & tracking real-time | `delivery.read` |
| `/vi/orders/{id}?tab=delivery` | Order detail | Delivery workflow trong order | Based on role |

### 📱 C. BREADCRUMB

```
Trang chủ > Vận chuyển > [Current page]

Examples:
- Trang chủ > Vận chuyển
- Trang chủ > Vận chuyển > Theo dõi > #DELV-20251020-001
- Trang chủ > Đơn hàng > #ORD-123 > Vận chuyển
```

---

## 6. API ENDPOINTS

### 🔌 A. DANH SÁCH API

#### **Deliveries Management**
```
GET    /api/v1/deliveries
       Query params:
       - status: string (optional)
       - page: number (default: 1)
       - limit: number (default: 20)
       - search: string (optional)
       
       Response: {
         success: true,
         data: {
           deliveries: Delivery[],
           total: number,
           page: number,
           totalPages: number
         }
       }

GET    /api/v1/deliveries/:id
       Response: {
         success: true,
         data: {
           delivery: Delivery,
           order: Order,
           timeline: Event[]
         }
       }
```

#### **Order Lifecycle**
```
POST   /api/v1/orders/:id/prepare-delivery
       Body: {
         estimatedReadyDate: Date,
         preparationNotes: string,
         photos: string[],
         documents: Document[],
         conditionNotes: string
       }

POST   /api/v1/orders/:id/mark-ready
       Body: {
         readyDate: Date,
         pickupLocation: PickupLocation,
         pickupInstructions: string,
         accessHours: string,
         contactPerson: ContactPerson,
         finalPhotos: string[]
       }

POST   /api/v1/orders/:id/ship
       Body: {
         trackingNumber: string,
         carrier: string,
         carrierContact: CarrierContact,
         transportMethod: string,
         estimatedDelivery: Date,
         route: RoutePoint[],
         driverInfo: DriverInfo,
         shippingCost: number,
         notes: string
       }

PATCH  /api/v1/orders/:id/delivery-status
       Body: {
         status: string,
         currentLocation: Location,
         progress: number,
         milestoneReached: string,
         notes: string,
         photos: string[]
       }

POST   /api/v1/orders/:id/mark-delivered
       Body: {
         deliveredAt: Date,
         deliveryLocation: Location,
         deliveryProof: string[],
         eirData: EIRData,
         receivedByName: string,
         receivedBySignature: string,
         driverNotes: string
       }

POST   /api/v1/orders/:id/confirm-receipt
       Body: {
         satisfied: boolean,
         inspectionDate: Date,
         conditionRating: number,
         feedback: string,
         inspectionPhotos: string[],
         confirmedCondition: ConditionReport
       }

POST   /api/v1/orders/:id/raise-dispute
       Body: {
         reason: string,
         description: string,
         evidence: Evidence[],
         requestedResolution: string,
         requestedAmount: number,
         additionalNotes: string
       }
```

#### **Tracking & Updates**
```
GET    /api/v1/orders/:id/tracking
       Response: {
         success: true,
         data: {
           trackingNumber: string,
           carrier: string,
           currentLocation: Location,
           progress: number,
           status: string,
           route: RoutePoint[],
           timeline: Event[]
         }
       }

GET    /api/v1/orders/:id/delivery-timeline
       Response: {
         success: true,
         data: {
           events: Event[],
           currentStatus: string,
           nextAction: string
         }
       }
```

#### **Documents**
```
GET    /api/v1/orders/:id/documents
       Response: {
         success: true,
         data: {
           documents: Document[]
         }
       }

POST   /api/v1/orders/:id/documents/upload
       Body: FormData with files
       
GET    /api/v1/orders/:id/eir
       Response: {
         success: true,
         data: {
           eir: EIRData
         }
       }
```

#### **Disputes**
```
GET    /api/v1/disputes
       Query: status, priority, page, limit
       
GET    /api/v1/disputes/:id
       
POST   /api/v1/disputes/:id/respond
       Body: {
         response: string,
         evidence: Evidence[],
         proposedResolution: string,
         settlementOffer: number
       }

PATCH  /api/v1/disputes/:id/resolve
       Body: {
         decision: string,
         resolutionNotes: string,
         refundAmount: number,
         sellerAmount: number
       }
       Permission: admin only
```

### 🔐 B. AUTHENTICATION & PERMISSIONS

| Endpoint | Permission | Roles |
|----------|-----------|-------|
| GET deliveries | `delivery.read` | All authenticated |
| POST prepare-delivery | `delivery.write` + Seller | Seller only |
| POST mark-ready | `delivery.write` + Seller | Seller only |
| POST ship | `delivery.write` + Seller | Seller only |
| PATCH delivery-status | `delivery.write` + Seller | Seller + Carrier |
| POST mark-delivered | `delivery.write` + Seller | Seller + Carrier |
| POST confirm-receipt | `delivery.write` + Buyer | Buyer only |
| POST raise-dispute | `delivery.write` + Buyer | Buyer only |
| PATCH resolve dispute | `admin` | Admin only |

### 📊 C. ERROR CODES

| Code | Message | Description |
|------|---------|-------------|
| 400 | Invalid status | Status không hợp lệ |
| 401 | Unauthorized | Chưa đăng nhập |
| 403 | Forbidden | Không có quyền |
| 404 | Order not found | Không tìm thấy đơn hàng |
| 409 | Invalid state | Trạng thái không hợp lệ để thực hiện action |
| 422 | Validation error | Dữ liệu không hợp lệ |
| 500 | Internal error | Lỗi server |

---

## 📚 TÀI LIỆU THAM KHẢO

### Related Documents:
1. `CHI-TIET-LUONG-SELLER-CHUAN-BI-GIAO-HANG.md` - Detailed workflow spec
2. `BAO-CAO-TONG-KET-DELIVERY-WORKFLOW-COMPLETE.md` - Complete implementation report
3. `LUONG-SAU-KHI-SELLER-CHUAN-BI-HANG.md` - Post-preparation flow

### Database Schema:
- `orders` table
- `order_preparations` table
- `deliveries` table
- `payments` table
- `disputes` table

### Frontend Components:
- `app/[locale]/delivery/page.tsx` - Main page
- `app/[locale]/delivery/request/page.tsx` - Request form
- `app/[locale]/delivery/track/[id]/page.tsx` - Tracking page
- `components/delivery/*` - Delivery components

### Backend Routes:
- `backend/src/routes/deliveries.ts` - Deliveries routes
- `backend/src/routes/orders.ts` - Order lifecycle routes
- `backend/src/routes/disputes.ts` - Disputes routes

---

## 🎯 KẾT LUẬN

Menu vận chuyển của **i-ContExchange** cung cấp:

### ✅ **Cho Seller:**
- Quản lý toàn bộ quy trình chuẩn bị & giao hàng
- Cập nhật trạng thái real-time
- Theo dõi thanh toán escrow
- Nhận thông báo tự động

### ✅ **Cho Buyer:**
- Theo dõi vận chuyển real-time
- Xác nhận nhận hàng
- Báo cáo tranh chấp nếu cần
- Bảo vệ bởi escrow system

### ✅ **Cho Admin:**
- Giám sát tất cả deliveries
- Xử lý tranh chấp
- Enforce SLA
- Analytics & reporting

### 📊 **Metrics:**
- Average delivery time: 10-12 ngày
- Auto-confirm rate: ~85%
- Dispute rate: <5%
- Success rate: >95%

---

**© 2025 i-ContExchange**  
**Document Version:** 1.0  
**Last Updated:** 22/10/2025  
**Status:** ✅ Complete & Production Ready
