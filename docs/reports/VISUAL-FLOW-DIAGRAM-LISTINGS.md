# 🎨 SƠ ĐỒ TRỰC QUAN - LUỒNG LISTINGS HOÀN CHỈNH

**Ngày tạo:** 16/10/2025  
**Mục đích:** Visual diagrams cho toàn bộ luồng listings

---

## 📊 1. OVERVIEW FLOW (High-Level)

```mermaid
graph TD
    A[Seller Tạo Listing] --> B[Admin Duyệt]
    B -->|Approved| C[Listing Public]
    B -->|Rejected| Z[End]
    
    C --> D[Buyer Browse & Tạo RFQ]
    D --> E[Seller Tạo Quote]
    E --> F{Buyer Decision}
    
    F -->|Accept| G[Auto Create Order]
    F -->|Decline| D
    
    G --> H[Buyer Thanh Toán Escrow]
    H --> I[Seller Giao Hàng]
    I --> J[Buyer Xác Nhận Nhận Hàng]
    J --> K[Release Escrow]
    K --> L[Mutual Reviews]
    L --> M[Transaction Complete ✅]
```

---

## 🔄 2. DETAILED SEQUENCE DIAGRAM

```mermaid
sequenceDiagram
    participant S as Seller
    participant P as Platform
    participant A as Admin
    participant B as Buyer
    
    Note over S,B: PHASE 1: Listing Creation
    S->>P: POST /api/v1/listings
    P->>P: Create listing (PENDING_REVIEW)
    P-->>S: Listing ID, status
    
    A->>P: GET /api/v1/admin/listings?status=PENDING_REVIEW
    P-->>A: Pending listings
    A->>P: PATCH /api/v1/admin/listings/:id/approve
    P->>P: Update status to APPROVED
    P-->>S: Email: Listing approved
    
    Note over S,B: PHASE 2: RFQ & Quotation
    B->>P: GET /api/v1/listings (browse)
    P-->>B: APPROVED listings
    B->>P: POST /api/v1/rfqs
    P->>P: Create RFQ (PENDING)
    P-->>S: Notification: New RFQ
    
    S->>P: POST /api/v1/quotes
    P->>P: Create quote (SENT)<br/>Update RFQ (AWAITING_RESPONSE)
    P-->>B: Notification: Quote received
    
    Note over S,B: PHASE 3: Quote Acceptance & Order
    B->>P: POST /api/v1/quotes/:id/accept
    
    rect rgb(200, 220, 255)
        Note over P: TRANSACTION BEGIN
        P->>P: 1. Update quote (ACCEPTED)
        P->>P: 2. Update RFQ (COMPLETED)
        P->>P: 3. Decline other quotes
        P->>P: 4. AUTO CREATE ORDER (PENDING_PAYMENT)
        P->>P: 5. Create order items
        Note over P: TRANSACTION COMMIT
    end
    
    P-->>B: Response: Order created
    
    Note over S,B: PHASE 4: Payment
    B->>P: POST /api/v1/orders/:id/pay
    P->>P: Create payment (ESCROW_FUNDED)
    P->>P: Update order (PAID)
    P-->>B: Payment success
    P-->>S: Notification: Payment received
    
    Note over S,B: PHASE 5: Delivery
    S->>P: PATCH /api/v1/orders/:id/status {SHIPPED}
    P-->>B: Notification: Shipped
    
    Note over S,B: PHASE 6: Confirmation & Release
    B->>P: POST /api/v1/orders/:id/confirm-receipt
    
    rect rgb(200, 255, 200)
        Note over P: ESCROW RELEASE
        P->>P: 1. Update payment (RELEASED)
        P->>P: 2. Calculate platform fee
        P->>P: 3. Transfer to seller
        P->>P: 4. Update order (COMPLETED)
    end
    
    P-->>S: Payment released
    P-->>B: Order completed
    
    Note over S,B: PHASE 7: Reviews
    B->>P: POST /api/v1/reviews
    P-->>P: Save buyer review
    S->>P: POST /api/v1/reviews
    P-->>P: Save seller review
```

---

## 🎯 3. STATUS STATE MACHINE

```mermaid
stateDiagram-v2
    [*] --> ListingCreated: Seller creates
    
    state "Listing Flow" as ListingFlow {
        ListingCreated --> PENDING_REVIEW
        PENDING_REVIEW --> APPROVED: Admin approves
        PENDING_REVIEW --> REJECTED: Admin rejects
        APPROVED --> ARCHIVED: Seller archives
        REJECTED --> [*]
    }
    
    state "RFQ Flow" as RFQFlow {
        [*] --> RFQ_PENDING: Buyer creates RFQ
        RFQ_PENDING --> RFQ_AWAITING: Seller sends quote
        RFQ_AWAITING --> RFQ_COMPLETED: Buyer accepts quote
        RFQ_AWAITING --> RFQ_CANCELLED: Buyer cancels
        RFQ_COMPLETED --> [*]
        RFQ_CANCELLED --> [*]
    }
    
    state "Quote Flow" as QuoteFlow {
        [*] --> QUOTE_SENT: Seller creates quote
        QUOTE_SENT --> QUOTE_ACCEPTED: Buyer accepts
        QUOTE_SENT --> QUOTE_DECLINED: Buyer declines
        QUOTE_SENT --> QUOTE_EXPIRED: Time expires
        QUOTE_ACCEPTED --> OrderCreated
        QUOTE_DECLINED --> [*]
        QUOTE_EXPIRED --> [*]
    }
    
    state "Order Flow" as OrderFlow {
        OrderCreated --> PENDING_PAYMENT
        PENDING_PAYMENT --> PAID: Buyer pays escrow
        PENDING_PAYMENT --> ORDER_CANCELLED: Cancel before payment
        PAID --> SHIPPED: Seller ships
        PAID --> ORDER_CANCELLED: Mutual cancel
        SHIPPED --> COMPLETED: Buyer confirms receipt
        COMPLETED --> ReviewPhase
        ORDER_CANCELLED --> [*]
    }
    
    state "Payment Flow" as PaymentFlow {
        [*] --> PAYMENT_PENDING
        PAYMENT_PENDING --> ESCROW_FUNDED: Payment success
        ESCROW_FUNDED --> RELEASED: Buyer confirms receipt
        ESCROW_FUNDED --> REFUNDED: Order cancelled
        RELEASED --> [*]
        REFUNDED --> [*]
    }
    
    ReviewPhase --> [*]: Transaction complete
```

---

## 💾 4. DATABASE ER DIAGRAM

```mermaid
erDiagram
    USERS ||--o{ LISTINGS : "creates (seller)"
    USERS ||--o{ RFQS : "creates (buyer)"
    USERS ||--o{ QUOTES : "creates (seller)"
    USERS ||--o{ ORDERS : "buys"
    USERS ||--o{ ORDERS : "sells"
    USERS ||--o{ REVIEWS : "gives"
    USERS ||--o{ REVIEWS : "receives"
    
    LISTINGS ||--o{ LISTING_FACETS : "has"
    LISTINGS ||--o{ RFQS : "receives"
    LISTINGS ||--o{ ORDERS : "referenced_in"
    
    RFQS ||--o{ QUOTES : "receives"
    
    QUOTES ||--o{ QUOTE_ITEMS : "contains"
    QUOTES ||--o| ORDERS : "generates"
    
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    ORDERS ||--o{ PAYMENTS : "has"
    ORDERS ||--o| REVIEWS : "has"
    
    USERS {
        string id PK
        string email UK
        string passwordHash
        enum role
        enum kycStatus
        string fullName
        datetime createdAt
    }
    
    LISTINGS {
        string id PK
        string seller_user_id FK
        string deal_type
        string title
        decimal price_amount
        string price_currency
        string location_depot_id
        enum status
        datetime created_at
    }
    
    LISTING_FACETS {
        string id PK
        string listing_id FK
        string key
        string value
    }
    
    RFQS {
        string id PK
        string buyer_id FK
        string listing_id FK
        int requested_qty
        decimal target_price
        json delivery_address
        enum status
        datetime created_at
    }
    
    QUOTES {
        string id PK
        string rfq_id FK
        string seller_id FK
        decimal price_subtotal
        string currency
        enum status
        datetime valid_until
        datetime accepted_at
    }
    
    QUOTE_ITEMS {
        string id PK
        string quote_id FK
        string item_type
        string description
        int qty
        decimal unit_price
    }
    
    ORDERS {
        string id PK
        string order_number UK
        string buyer_id FK
        string seller_id FK
        string listing_id FK
        string quote_id FK
        decimal subtotal
        decimal tax
        decimal total
        enum status
        datetime created_at
        datetime completed_at
    }
    
    ORDER_ITEMS {
        string id PK
        string order_id FK
        string item_type
        string description
        int qty
        decimal unit_price
    }
    
    PAYMENTS {
        string id PK
        string order_id FK
        decimal amount
        string provider
        enum method
        enum status
        datetime paid_at
        datetime released_at
        decimal seller_amount
        decimal platform_fee
    }
    
    REVIEWS {
        string id PK
        string order_id FK
        string reviewer_id FK
        string reviewee_id FK
        int rating
        string comment
        json categories
        boolean recommend
        datetime created_at
    }
```

---

## 🔐 5. AUTHENTICATION & AUTHORIZATION FLOW

```mermaid
graph TD
    A[User Request] --> B{Has Token?}
    B -->|No| C[401 Unauthorized]
    B -->|Yes| D[Verify JWT]
    
    D --> E{Valid Token?}
    E -->|No| F[401 Invalid Token]
    E -->|Yes| G[Extract User Info]
    
    G --> H{Check Authorization}
    
    H --> I{Endpoint Type}
    I -->|Listing Create| J{Is Seller?}
    I -->|RFQ Create| K{Is Buyer?}
    I -->|Quote Create| L{Is Seller?}
    I -->|Order Pay| M{Is Buyer & Owner?}
    I -->|Admin Action| N{Is Admin?}
    
    J -->|Yes| O[Allow]
    J -->|No| P[403 Forbidden]
    K -->|Yes| O
    K -->|No| P
    L -->|Yes| O
    L -->|No| P
    M -->|Yes| O
    M -->|No| P
    N -->|Yes| O
    N -->|No| P
    
    O --> Q[Execute Request]
```

---

## 💰 6. PAYMENT & ESCROW FLOW

```mermaid
graph TD
    A[Order Created<br/>PENDING_PAYMENT] --> B[Buyer Clicks Pay]
    B --> C[Select Payment Method]
    
    C --> D{Method Type}
    D -->|Bank Transfer| E[Show Bank Details]
    D -->|VNPay| F[Redirect to VNPay]
    D -->|MoMo| G[Redirect to MoMo]
    
    E --> H[Buyer Transfers Manually]
    F --> I[VNPay Payment Gateway]
    G --> J[MoMo Payment Gateway]
    
    H --> K[Upload Proof]
    I --> L[Payment Callback]
    J --> L
    
    K --> M[Admin Verifies]
    L --> N[Auto Verify]
    
    M --> O{Verified?}
    N --> O
    
    O -->|Yes| P[Create Payment Record<br/>ESCROW_FUNDED]
    O -->|No| Q[Reject & Notify]
    
    P --> R[Update Order<br/>Status: PAID]
    
    R --> S[Notify Seller<br/>Prepare Delivery]
    
    S --> T[Seller Ships]
    T --> U[Buyer Confirms Receipt]
    
    U --> V{Satisfied?}
    V -->|Yes| W[Release Escrow]
    V -->|No| X[Open Dispute]
    
    W --> Y[Calculate Platform Fee<br/>5-10%]
    Y --> Z[Transfer to Seller]
    Z --> AA[Update Payment<br/>Status: RELEASED]
    AA --> AB[Update Order<br/>Status: COMPLETED]
    
    X --> AC[Admin Investigation]
    AC --> AD{Resolution}
    AD -->|Refund Buyer| AE[Status: REFUNDED]
    AD -->|Pay Seller| W
    AD -->|Partial| AF[Split Amount]
```

---

## 📱 7. USER JOURNEY MAP

```mermaid
journey
    title Buyer Journey - From Discovery to Review
    section Discovery
      Browse listings: 5: Buyer
      View listing details: 5: Buyer
      Save favorites: 4: Buyer
    section Negotiation
      Create RFQ: 4: Buyer
      Review quote: 5: Buyer
      Accept quote: 5: Buyer
    section Purchase
      View order summary: 5: Buyer
      Process payment: 4: Buyer
      Payment confirmed: 5: Buyer
    section Delivery
      Track shipment: 4: Buyer
      Receive containers: 5: Buyer
      Inspect quality: 5: Buyer
    section Completion
      Confirm receipt: 5: Buyer
      Leave review: 4: Buyer
      Transaction complete: 5: Buyer
```

```mermaid
journey
    title Seller Journey - From Listing to Payment
    section Listing
      Create listing: 4: Seller
      Wait for approval: 3: Seller
      Listing approved: 5: Seller
    section Inquiry
      Receive RFQ: 5: Seller
      Analyze request: 4: Seller
      Create quote: 4: Seller
    section Order
      Quote accepted: 5: Seller
      Payment received: 5: Seller
    section Fulfillment
      Prepare containers: 4: Seller
      Arrange delivery: 4: Seller
      Delivery completed: 5: Seller
    section Completion
      Buyer confirms: 5: Seller
      Receive payment: 5: Seller
      Leave review: 4: Seller
```

---

## ⚠️ 8. ERROR HANDLING FLOW

```mermaid
graph TD
    A[API Request] --> B{Validate Input}
    B -->|Invalid| C[400 Bad Request<br/>Return validation errors]
    B -->|Valid| D{Check Auth}
    
    D -->|No Token| E[401 Unauthorized]
    D -->|Valid Token| F{Check Authorization}
    
    F -->|Forbidden| G[403 Forbidden<br/>User lacks permission]
    F -->|Authorized| H{Business Logic}
    
    H --> I{Check Resource}
    I -->|Not Found| J[404 Not Found]
    I -->|Found| K{Validate Business Rules}
    
    K -->|Rule Violated| L[400 Bad Request<br/>Business rule error]
    K -->|Valid| M{Execute Transaction}
    
    M --> N{Database Operation}
    N -->|Success| O[200/201 Success<br/>Return data]
    N -->|DB Error| P[Rollback Transaction]
    
    P --> Q{Error Type}
    Q -->|Constraint Violation| R[409 Conflict]
    Q -->|Timeout| S[504 Gateway Timeout]
    Q -->|Other| T[500 Internal Server Error<br/>Log error, notify admin]
    
    style C fill:#ffcccc
    style E fill:#ffcccc
    style G fill:#ffcccc
    style J fill:#ffcccc
    style L fill:#ffcccc
    style R fill:#ffcccc
    style S fill:#ffcccc
    style T fill:#ff9999
    style O fill:#ccffcc
```

---

## 🔔 9. NOTIFICATION FLOW

```mermaid
graph TD
    A[Event Trigger] --> B{Event Type}
    
    B -->|Listing Approved| C1[Send to Seller]
    B -->|New RFQ| C2[Send to Seller]
    B -->|Quote Received| C3[Send to Buyer]
    B -->|Order Created| C4[Send to Both]
    B -->|Payment Received| C5[Send to Seller]
    B -->|Shipped| C6[Send to Buyer]
    B -->|Receipt Confirmed| C7[Send to Both]
    
    C1 --> D{Notification Channel}
    C2 --> D
    C3 --> D
    C4 --> D
    C5 --> D
    C6 --> D
    C7 --> D
    
    D -->|Email| E[Queue Email Job]
    D -->|In-App| F[Save to Notifications Table]
    D -->|SMS| G[Queue SMS Job]
    D -->|Push| H[Send Push Notification]
    
    E --> I[Email Service<br/>SendGrid/AWS SES]
    F --> J[User Views in App]
    G --> K[SMS Gateway<br/>Twilio/VNPT]
    H --> L[FCM/APNS]
    
    I --> M[Delivery Status]
    J --> N[Mark as Read]
    K --> M
    L --> M
    
    M --> O{Delivery Failed?}
    O -->|Yes| P[Retry Logic<br/>Max 3 attempts]
    O -->|No| Q[Success]
    
    P --> R{Retry Count}
    R -->|< 3| I
    R -->|>= 3| S[Log Failure<br/>Manual Follow-up]
```

---

## 🧪 10. TESTING FLOW

```mermaid
graph TD
    A[Start Test Suite] --> B[Setup Test Database]
    B --> C[Seed Test Data]
    
    C --> D{Test Categories}
    
    D -->|Unit Tests| E1[Test Individual Functions]
    D -->|Integration Tests| E2[Test API Endpoints]
    D -->|E2E Tests| E3[Test Complete Flows]
    
    E1 --> F1[Listing Creation]
    E1 --> F2[Quote Acceptance Logic]
    E1 --> F3[Payment Calculation]
    
    E2 --> G1[POST /api/v1/listings]
    E2 --> G2[POST /api/v1/quotes/:id/accept]
    E2 --> G3[POST /api/v1/orders/:id/pay]
    
    E3 --> H1[Full RFQ → Quote → Order Flow]
    E3 --> H2[Payment → Delivery → Review Flow]
    
    F1 --> I[Assert Expected Output]
    F2 --> I
    F3 --> I
    G1 --> J[Assert Response Status & Data]
    G2 --> J
    G3 --> J
    H1 --> K[Assert Complete Workflow]
    H2 --> K
    
    I --> L{Pass?}
    J --> L
    K --> L
    
    L -->|Yes| M[Continue]
    L -->|No| N[Report Failure<br/>Stack Trace]
    
    M --> O{More Tests?}
    O -->|Yes| D
    O -->|No| P[Cleanup Test Data]
    
    P --> Q[Generate Coverage Report]
    Q --> R[Test Summary]
    
    R --> S{All Passed?}
    S -->|Yes| T[✅ Success<br/>Deploy Ready]
    S -->|No| U[❌ Failures<br/>Fix & Rerun]
```

---

## 📊 11. METRICS & MONITORING

```mermaid
graph TD
    A[Application Events] --> B{Event Category}
    
    B -->|API Requests| C1[Log Request Details]
    B -->|Database Queries| C2[Log Query Performance]
    B -->|Business Events| C3[Log Transactions]
    B -->|Errors| C4[Log Error Stack]
    
    C1 --> D1[Track Response Time]
    C1 --> D2[Track Status Codes]
    C1 --> D3[Track Endpoint Usage]
    
    C2 --> E1[Track Query Duration]
    C2 --> E2[Track Slow Queries]
    
    C3 --> F1[Track Order Creation Rate]
    C3 --> F2[Track Payment Success Rate]
    C3 --> F3[Track Conversion Funnel]
    
    C4 --> G1[Error Rate by Type]
    C4 --> G2[Alert on Critical Errors]
    
    D1 --> H[Metrics Database<br/>Prometheus/InfluxDB]
    D2 --> H
    D3 --> H
    E1 --> H
    E2 --> H
    F1 --> H
    F2 --> H
    F3 --> H
    G1 --> H
    
    G2 --> I[Alert System<br/>PagerDuty/Slack]
    
    H --> J[Visualization<br/>Grafana Dashboard]
    
    J --> K[Display Metrics]
    K --> L[API Performance]
    K --> M[Business KPIs]
    K --> N[Error Rates]
    K --> O[Database Health]
    
    I --> P[Notify Team]
    P --> Q{Severity}
    Q -->|Critical| R[Immediate Action]
    Q -->|Warning| S[Schedule Fix]
```

---

## 🎯 SUMMARY

### Flow Coverage
- ✅ 11 detailed diagrams
- ✅ All major workflows covered
- ✅ Technical & business perspectives
- ✅ Error handling & monitoring
- ✅ User journey mapping

### Diagram Types
1. **Overview Flow** - High-level process
2. **Sequence Diagram** - Detailed interactions
3. **State Machine** - Status transitions
4. **ER Diagram** - Database structure
5. **Auth Flow** - Security & permissions
6. **Payment Flow** - Escrow mechanism
7. **User Journey** - Experience mapping
8. **Error Handling** - Failure scenarios
9. **Notification Flow** - Communication channels
10. **Testing Flow** - Quality assurance
11. **Monitoring** - Observability

---

**© 2025 i-ContExchange Vietnam**  
**Created:** October 16, 2025  
**Format:** Mermaid Diagrams  
**Status:** ✅ Complete
