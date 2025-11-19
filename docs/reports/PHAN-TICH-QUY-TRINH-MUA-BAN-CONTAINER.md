# PHÂN TÍCH QUY TRÌNH MUA VÀ BÁN CONTAINER

## 📋 TÓM TẮT QUY TRÌNH THEO TÀI LIỆU

### **LUỒNG CHÍNH (Main Flow)**

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUY TRÌNH GIAO DỊCH CONTAINER                │
└─────────────────────────────────────────────────────────────────┘

SELLER SIDE                     PLATFORM                    BUYER SIDE
═══════════════════════════════════════════════════════════════════════

1. ĐĂNG TIN
─────────────────────────────────────────────────────────────────
┌──────────────┐
│ Seller login │
│ Tạo listing  │──────────►  ┌─────────────────┐
│ Upload ảnh   │             │ Admin kiểm duyệt│
│ Nhập giá     │             │ - Hợp lệ: Duyệt │
└──────────────┘             │ - Không: Từ chối│
                             └─────────────────┘
                                      │
                                      ▼
                             ┌─────────────────┐
                             │ Listing APPROVED│
                             │ Hiện công khai  │
                             └─────────────────┘


2. TÌM KIẾM & XEM LISTING
─────────────────────────────────────────────────────────────────
                                                        ┌──────────────┐
                                                        │ Buyer login  │
                             ┌─────────────────┐       │ Tìm kiếm     │
                             │ Public Listings │◄──────│ Xem chi tiết │
                             │                 │       │ Lưu yêu thích│
                             └─────────────────┘       └──────────────┘


3. THƯƠNG LƯỢNG (VIA MESSAGING)
─────────────────────────────────────────────────────────────────
┌──────────────┐             ┌─────────────────┐       ┌──────────────┐
│ Seller       │◄────────────│  HỆ THỐNG       │──────►│ Buyer        │
│              │             │  NHẮN TIN       │       │              │
│ Trả lời      │◄────────────│  NỘI BỘ         │──────►│ Hỏi thông tin│
│ Thương lượng │             │                 │       │ Thương lượng │
│ giá          │             │ (Real-time chat)│       │ giá          │
└──────────────┘             └─────────────────┘       └──────────────┘
                                      │
                                      ▼
                             ┌─────────────────┐
                             │ Thỏa thuận:     │
                             │ - Giá cuối cùng │
                             │ - Điều kiện giao│
                             │ - Dịch vụ đi kèm│
                             └─────────────────┘


4. GIÁM ĐỊNH TẠI DEPOT (TÙY CHỌN - PHYGITAL)
─────────────────────────────────────────────────────────────────
                                                        ┌──────────────┐
                                                        │ Buyer yêu cầu│
                             ┌─────────────────┐       │ giám định    │
                             │ Depot Staff     │◄──────│ qua nền tảng │
                             │                 │       └──────────────┘
                             │ 1. Kiểm tra theo│
                             │    tiêu chuẩn   │
                             │    (IICL-6...)  │
                             │                 │
                             │ 2. Tạo báo cáo  │
                             │    + ảnh/video  │
                             │                 │
                             │ 3. Upload lên   │
                             │    nền tảng     │
                             └─────────────────┘
                                      │
                                      ▼
                             ┌─────────────────┐       ┌──────────────┐
                             │ Báo cáo giám    │──────►│ Buyer xem    │
                             │ định gắn vào    │       │ báo cáo      │
                             │ listing         │       │              │
                             └─────────────────┘       │ Quyết định:  │
                                                        │ - Tiếp tục   │
                                                        │ - Yêu cầu sửa│
                                                        │ - Hủy        │
                                                        └──────────────┘


5. TẠO ĐơN HÀNG & THANH TOÁN ESCROW
─────────────────────────────────────────────────────────────────
                                                        ┌──────────────┐
                                                        │ Buyer chọn   │
                             ┌─────────────────┐       │ "Tiến hành   │
                             │ Tạo ORDER từ    │◄──────│  thanh toán" │
                             │ LISTING         │       └──────────────┘
                             │                 │              │
                             │ Status:         │              ▼
                             │ pending_payment │       ┌──────────────┐
                             └─────────────────┘       │ Chuyển tiền  │
                                      │                │ vào ESCROW   │
                                      │                │ (tài khoản   │
                                      │                │  ký quỹ)     │
                                      ▼                └──────────────┘
                             ┌─────────────────┐              │
                             │ Xác nhận nhận   │◄─────────────┘
                             │ tiền ESCROW     │
                             │                 │
                             │ Status:         │
                             │ escrow_funded   │
                             └─────────────────┘
                                      │
                                      ▼
┌──────────────┐             ┌─────────────────┐
│ Seller nhận  │◄────────────│ Thông báo cho   │
│ thông báo    │             │ Seller bắt đầu  │
│ chuẩn bị giao│             │ giao hàng       │
└──────────────┘             └─────────────────┘


6. GIAO NHẬN CONTAINER
─────────────────────────────────────────────────────────────────
┌──────────────┐             ┌─────────────────┐       ┌──────────────┐
│ Seller       │             │                 │       │ Buyer        │
│              │             │                 │       │              │
│ Sắp xếp giao │             │                 │       │ Nhận container│
│ container đến│─────────────┼────────────────►│       │ tại địa chỉ  │
│ địa chỉ      │             │                 │       │ hoặc Depot   │
│              │             │                 │       │              │
│              │             │                 │       │ Kiểm tra     │
│              │             │                 │       │ thực tế      │
└──────────────┘             │                 │       └──────────────┘
                             │                 │              │
                             │                 │              ▼
                             │                 │       ┌──────────────┐
                             │                 │       │ Buyer xác    │
                             │  ORDER          │◄──────│ nhận "Đã nhận│
                             │  Status:        │       │ hàng"        │
                             │  completed      │       └──────────────┘
                             │                 │
                             └─────────────────┘
                                      │
                                      ▼

7. GIẢI NGÂN TỪ ESCROW
─────────────────────────────────────────────────────────────────
┌──────────────┐             ┌─────────────────┐
│ Seller nhận  │◄────────────│ Tự động giải    │
│ tiền vào     │             │ ngân từ ESCROW  │
│ tài khoản    │             │ - Trừ phí sàn   │
│              │             │ - Chuyển cho    │
└──────────────┘             │   Seller        │
                             │                 │
                             │ PAYMENT         │
                             │ Status: released│
                             └─────────────────┘


8. ĐÁNH GIÁ SAU GIAO DỊCH
─────────────────────────────────────────────────────────────────
┌──────────────┐             ┌─────────────────┐       ┌──────────────┐
│ Seller       │             │ Hệ thống mời    │       │ Buyer        │
│              │             │ đánh giá        │       │              │
│ Đánh giá    │◄────────────┤                 ├──────►│ Đánh giá     │
│ Buyer        │             │                 │       │ Seller       │
│ (⭐ + review)│             │ Lưu vào profile │       │ (⭐ + review) │
└──────────────┘             └─────────────────┘       └──────────────┘

═══════════════════════════════════════════════════════════════════════
```

---

## 🎯 **CÁC API CẦN THIẾT (ĐÚNG THEO QUY TRÌNH)**

### **1. LISTINGS APIs** ✅ (Đã có)
```
POST   /api/v1/listings          - Seller tạo listing
GET    /api/v1/listings          - Public search/browse
GET    /api/v1/listings/:id      - Xem chi tiết
PATCH  /api/v1/listings/:id      - Seller chỉnh sửa
DELETE /api/v1/listings/:id      - Seller xóa
GET    /api/v1/my-listings       - Seller quản lý listings của mình
```

### **2. MESSAGING APIs** ❌ (CHƯA CÓ - CẦN TẠO)
```
POST   /api/v1/messages                    - Gửi tin nhắn
GET    /api/v1/messages/conversations      - Danh sách cuộc hội thoại
GET    /api/v1/messages/conversations/:id  - Chi tiết cuộc hội thoại
PATCH  /api/v1/messages/:id/read           - Đánh dấu đã đọc
```

**Purpose:** Buyer và Seller thương lượng trực tiếp về giá và điều kiện

### **3. DEPOT INSPECTION APIs** ❌ (CHƯA CÓ - CẦN TẠO)
```
POST   /api/v1/inspections                 - Buyer yêu cầu giám định
GET    /api/v1/inspections/:id             - Xem báo cáo giám định
PATCH  /api/v1/inspections/:id             - Depot staff cập nhật báo cáo
GET    /api/v1/listings/:id/inspections    - Lấy các báo cáo giám định của listing
```

**Purpose:** Tích hợp dịch vụ Phygital - giám định chất lượng tại Depot

### **4. ORDERS APIs (DIRECT FROM LISTING)** ⚠️ (CẦN SỬA)
```
POST   /api/v1/orders                      - Tạo order TRỰC TIẾP từ listing
GET    /api/v1/orders                      - Danh sách orders
GET    /api/v1/orders/:id                  - Chi tiết order
PATCH  /api/v1/orders/:id/status           - Cập nhật trạng thái
```

**Input khi tạo order:**
```json
{
  "listingId": "listing-id",
  "agreedPrice": 225000000,  // Giá đã thương lượng qua chat
  "deliveryAddress": {
    "street": "...",
    "city": "...",
    "province": "..."
  },
  "notes": "Ghi chú giao hàng"
}
```

**KHÔNG CẦN RFQ/QUOTE** - Tạo order trực tiếp sau khi thỏa thuận qua chat

### **5. ESCROW PAYMENT APIs** ✅ (Đã có trong orders.ts)
```
POST   /api/v1/orders/:id/pay              - Thanh toán vào Escrow
POST   /api/v1/orders/:id/confirm-receipt  - Buyer xác nhận đã nhận hàng
                                             → Tự động giải ngân
POST   /api/v1/orders/:id/cancel           - Hủy order, hoàn tiền Escrow
```

### **6. FAVORITES APIs** ❌ (CHƯA CÓ - CẦN TẠO)
```
POST   /api/v1/favorites                   - Lưu listing yêu thích
GET    /api/v1/favorites                   - Danh sách yêu thích
DELETE /api/v1/favorites/:listingId        - Bỏ yêu thích
```

### **7. REVIEWS APIs** ❌ (CHƯA CÓ - CẦN TẠO)
```
POST   /api/v1/reviews                     - Tạo đánh giá sau giao dịch
GET    /api/v1/reviews/user/:userId        - Xem đánh giá của user
GET    /api/v1/reviews/order/:orderId      - Đánh giá của order cụ thể
```

### **8. DISPUTES APIs** ❌ (CHƯA CÓ - CẦN TẠO)
```
POST   /api/v1/disputes                    - Tạo tranh chấp
GET    /api/v1/disputes/:id                - Chi tiết tranh chấp
PATCH  /api/v1/disputes/:id/resolve        - Admin giải quyết
```

### **9. DELIVERY/LOGISTICS APIs** ❌ (CHƯA CÓ - TƯƠNG LAI)
```
POST   /api/v1/deliveries                  - Yêu cầu vận chuyển
GET    /api/v1/deliveries/:id/tracking     - Theo dõi GPS
PATCH  /api/v1/deliveries/:id/status       - Cập nhật trạng thái giao hàng
```

---

## 🚨 **VẤN ĐỀ VỚI IMPLEMENTATION HIỆN TẠI**

### ❌ **SAI: RFQ/Quote Flow**
Tôi đã implement:
```
Buyer → Create RFQ → Seller Create Quote → Buyer Accept Quote → Create Order
```

### ✅ **ĐÚNG: Direct Purchase Flow**
Theo tài liệu:
```
Buyer → Browse Listings → Chat với Seller → Thỏa thuận giá 
      → Create Order trực tiếp → Pay Escrow → Delivery → Complete
```

---

## 📊 **DATABASE SCHEMA CẦN BỔ SUNG**

### **1. Message Model**
```prisma
model Conversation {
  id              String    @id @default(cuid())
  listingId       String
  listing         Listing   @relation(fields: [listingId], references: [id])
  buyerId         String
  buyer           User      @relation("BuyerConversations", fields: [buyerId], references: [id])
  sellerId        String
  seller          User      @relation("SellerConversations", fields: [sellerId], references: [id])
  messages        Message[]
  lastMessageAt   DateTime  @default(now())
  createdAt       DateTime  @default(now())
  
  @@unique([listingId, buyerId, sellerId])
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  senderId       String
  sender         User         @relation(fields: [senderId], references: [id])
  content        String       @db.Text
  isRead         Boolean      @default(false)
  createdAt      DateTime     @default(now())
}
```

### **2. Inspection Model**
```prisma
model Inspection {
  id              String   @id @default(cuid())
  listingId       String
  listing         Listing  @relation(fields: [listingId], references: [id])
  requestedById   String
  requestedBy     User     @relation("InspectionRequests", fields: [requestedById], references: [id])
  depotStaffId    String?
  depotStaff      User?    @relation("InspectionAssignments", fields: [depotStaffId], references: [id])
  status          InspectionStatus @default(requested)
  standard        String   // "IICL-6", "CW", "WWT"
  findings        Json?    // Chi tiết phát hiện
  report          Json?    // Báo cáo đầy đủ
  photos          String[] // URLs ảnh
  videos          String[] // URLs video
  requestedAt     DateTime @default(now())
  completedAt     DateTime?
}

enum InspectionStatus {
  requested
  assigned
  in_progress
  completed
  cancelled
}
```

### **3. Favorite Model**
```prisma
model Favorite {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  listingId  String
  listing    Listing  @relation(fields: [listingId], references: [id])
  createdAt  DateTime @default(now())
  
  @@unique([userId, listingId])
}
```

### **4. Review Model**
```prisma
model Review {
  id          String   @id @default(cuid())
  orderId     String   @unique
  order       Order    @relation(fields: [orderId], references: [id])
  reviewerId  String
  reviewer    User     @relation("ReviewsGiven", fields: [reviewerId], references: [id])
  revieweeId  String
  reviewee    User     @relation("ReviewsReceived", fields: [revieweeId], references: [id])
  rating      Int      // 1-5 stars
  comment     String?  @db.Text
  createdAt   DateTime @default(now())
}
```

### **5. Dispute Model**
```prisma
model Dispute {
  id              String        @id @default(cuid())
  orderId         String        @unique
  order           Order         @relation(fields: [orderId], references: [id])
  raisedById      String
  raisedBy        User          @relation("DisputesRaised", fields: [raisedById], references: [id])
  reason          String        @db.Text
  evidence        Json          // Ảnh, video, mô tả
  status          DisputeStatus @default(open)
  adminId         String?
  admin           User?         @relation("DisputesHandled", fields: [adminId], references: [id])
  resolution      String?       @db.Text
  resolvedAt      DateTime?
  createdAt       DateTime      @default(now())
}

enum DisputeStatus {
  open
  investigating
  resolved
  rejected
}
```

### **6. Sửa Order Model (Bỏ RFQ/Quote)**
```prisma
model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique
  
  // DIRECT FROM LISTING (không cần RFQ/Quote)
  listingId       String
  listing         Listing       @relation(fields: [listingId], references: [id])
  
  buyerId         String
  buyer           User          @relation("BuyerOrders", fields: [buyerId], references: [id])
  sellerId        String
  seller          User          @relation("SellerOrders", fields: [sellerId], references: [id])
  
  // Giá đã thỏa thuận qua chat
  agreedPrice     Decimal       @db.Decimal(15, 2)
  currency        String        @default("VND")
  
  // Thông tin giao hàng
  deliveryAddress Json
  notes           String?       @db.Text
  
  status          OrderStatus   @default(pending_payment)
  
  payments        Payment[]
  review          Review?
  dispute         Dispute?
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}
```

---

## 🔄 **LUỒNG DỮ LIỆU CHÍNH XÁC**

### **Buyer Journey:**
```
1. Browse Listings (GET /api/v1/listings)
2. View Detail (GET /api/v1/listings/:id)
3. Save Favorite (POST /api/v1/favorites) - optional
4. Chat with Seller (POST /api/v1/messages)
5. Request Inspection (POST /api/v1/inspections) - optional
6. Create Order (POST /api/v1/orders) với agreedPrice từ chat
7. Pay Escrow (POST /api/v1/orders/:id/pay)
8. Receive Container
9. Confirm Receipt (POST /api/v1/orders/:id/confirm-receipt)
10. Leave Review (POST /api/v1/reviews)
```

### **Seller Journey:**
```
1. Create Listing (POST /api/v1/listings)
2. Wait for Admin Approval
3. Receive Chat from Buyers (GET /api/v1/messages/conversations)
4. Negotiate Price via Chat (POST /api/v1/messages)
5. Receive Order Notification
6. Arrange Delivery
7. Wait for Buyer Confirmation
8. Receive Payment from Escrow
9. Leave Review (POST /api/v1/reviews)
```

---

## ✅ **KẾ HOẠCH CHỈNH SỬA**

### **Phase 1: Xóa RFQ/Quote (SAI)**
- [ ] Xóa `backend/src/routes/rfqs.ts`
- [ ] Xóa `backend/src/routes/quotes.ts`
- [ ] Xóa test script `test-buyer-apis.mjs`
- [ ] Update documentation

### **Phase 2: Tạo Messaging System (QUAN TRỌNG NHẤT)**
- [ ] Create schema: Conversation, Message
- [ ] Create `backend/src/routes/messages.ts`
- [ ] Implement real-time chat (WebSocket hoặc polling)
- [ ] Frontend: Chat UI component

### **Phase 3: Direct Order Creation**
- [ ] Sửa `backend/src/routes/orders.ts`
  - Bỏ logic tạo từ Quote
  - Tạo trực tiếp từ Listing + agreedPrice
- [ ] Update Order schema (bỏ quoteId, thêm listingId)

### **Phase 4: Inspection System**
- [ ] Create schema: Inspection
- [ ] Create `backend/src/routes/inspections.ts`
- [ ] Depot staff workflow

### **Phase 5: Support Features**
- [ ] Favorites API
- [ ] Reviews API
- [ ] Disputes API

---

## 🎯 **KẾT LUẬN**

**QUY TRÌNH ĐÚNG:**
```
Listing → Chat/Negotiate → Inspection (optional) → Direct Order → Escrow → Delivery → Review
```

**KHÔNG PHẢI:**
```
RFQ → Quote → Order ❌
```

RFQ/Quote flow phù hợp với B2B procurement, KHÔNG PHẢI marketplace C2C/B2C như tài liệu mô tả.
