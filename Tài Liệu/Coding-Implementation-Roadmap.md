# ROADMAP CODING IMPLEMENTATION - i-ContExchange

**Ngày tạo**: 2025-09-30  
**Mục tiêu**: Implement business logic để dự án chạy đúng workflow theo tài liệu  
**Timeline**: 8 tuần (MVP hoàn chỉnh)

---

## 🎯 **OVERVIEW IMPLEMENTATION STRATEGY**

### **Current Status:**
- ✅ **UI/UX**: 102 màn hình hoàn chỉnh (95%)
- ✅ **Database**: Schema đầy đủ với 50+ tables (95%)  
- ✅ **Authentication**: Login/Register/eKYC working (100%)
- 🚧 **Business Logic**: Core workflows (35%)
- ❌ **Integrations**: External services (25%)
- ❌ **Production Ready**: Deployment & monitoring (10%)

### **Target MVP:**
- ✅ **Functional Core Workflows**: WF-005, WF-007, WF-008, WF-010
- ✅ **Payment Integration**: VNPay basic
- ✅ **File Management**: Production-ready upload
- ✅ **Content Validation**: Pricing rules & redaction
- ✅ **Notification System**: Email notifications

---

## 📅 **PHASE 1: CORE BUSINESS LOGIC (Week 1-2)**

### **🔥 Priority 1.1: Container Listing Management (WF-005)**

#### **Backend Implementation**

**Step 1: Pricing Rules Engine**
```typescript
// File: backend/src/lib/pricing/pricing-rules.ts - CREATE
interface PricingRule {
  id: string;
  region: string;
  sizeFt: number;
  qualityStandard: string;
  minPrice: number;
  maxPrice: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

class PricingRulesEngine {
  async validatePrice(listing: {
    sizeFt: number;
    qualityStandard: string;
    region: string;
    price: number;
  }): Promise<{
    isValid: boolean;
    reason?: string;
    suggestedRange?: { min: number; max: number };
  }>;

  async getPriceBand(criteria: PricingCriteria): Promise<PriceBand>;
}

// Implementation:
1. Tạo service class PricingRulesEngine
2. Implement price validation logic  
3. Connect với bảng pricing_rules
4. Add middleware validation vào listing APIs
```

**Step 2: Content Redaction System**
```typescript
// File: backend/src/lib/moderation/content-redaction.ts - CREATE
class ContentRedactionService {
  private phoneRegex = /(\+84|0)[3-9]\d{8}/g;
  private emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  private zaloRegex = /(zalo|viber|telegram|whatsapp)/gi;

  async redactContent(text: string): Promise<{
    cleanText: string;
    violations: Array<{type: string; content: string}>;
    riskScore: number;
  }>;

  async validateMedia(fileUrl: string): Promise<boolean>;
}

// Implementation steps:
1. Tạo regex patterns cho phone/email/social
2. Implement OCR cho ảnh (basic)
3. Add validation middleware cho listings/RFQ/messages
4. Ghi violation logs vào database
```

**Step 3: Enhanced Listing APIs**
```typescript
// File: backend/src/routes/listings.ts - ENHANCE
// Add business logic to existing endpoints:

POST /api/v1/listings {
  // Current: Basic CRUD
  // Add: 
  1. Price validation với PricingRulesEngine
  2. Content redaction check
  3. Auto-generate listing status workflow
  4. Media validation
  5. Depot availability check
}

PUT /api/v1/listings/:id/status {
  // NEW ENDPOINT
  // Admin approve/reject với reason
  // Update listing.status: pending_review -> active/rejected
  // Send notifications
}

GET /api/v1/listings/search {
  // ENHANCE existing
  // Add advanced filters
  // Elasticsearch integration (basic)
  // Faceted search results
}
```

#### **Frontend Enhancements**

**Step 4: Listing Creation Flow**
```typescript
// File: app/[locale]/sell/new/page.tsx - ENHANCE
// Add real validation and submission:

1. Integrate price validation API calls
2. Real-time price suggestions
3. Content warning system
4. Progress stepper for complex forms
5. Draft save functionality
6. Media upload with preview
```

**Time Estimate: 4-5 days**

---

### **🔥 Priority 1.2: RFQ/Quote System (WF-007)**

#### **Backend Implementation**

**Step 5: RFQ/Quote Business Logic**
```typescript
// File: backend/src/lib/rfq/rfq-service.ts - CREATE
class RFQService {
  async createRFQ(data: CreateRFQRequest): Promise<RFQ> {
    // 1. Validate buyer permissions
    // 2. Check listing availability
    // 3. Apply content redaction
    // 4. Create RFQ with status 'submitted'
    // 5. Notify seller
    // 6. Start expiration timer
  }

  async validateQuote(quote: CreateQuoteRequest): Promise<ValidationResult> {
    // 1. Check price against pricing rules
    // 2. Validate quote expiration
    // 3. Check seller permissions
    // 4. Validate quote items structure
  }

  async processQuoteAcceptance(quoteId: string, buyerId: string): Promise<Order> {
    // 1. Validate quote still active
    // 2. Create order from quote
    // 3. Lock pricing
    // 4. Update RFQ/Quote status
    // 5. Trigger order workflow
  }
}

// File: backend/src/routes/rfq.ts - CREATE
POST /api/v1/rfqs                    // Create RFQ
GET /api/v1/rfqs/my-rfqs            // Buyer's RFQs  
GET /api/v1/rfqs/received           // Seller's received RFQs
PUT /api/v1/rfqs/:id/status         // Update RFQ status

POST /api/v1/rfqs/:rfqId/quotes     // Create quote for RFQ
GET /api/v1/quotes/:id              // Quote details
PUT /api/v1/quotes/:id/accept       // Accept quote
PUT /api/v1/quotes/:id/reject       // Reject quote

POST /api/v1/rfqs/:rfqId/qa         // Q&A questions
GET /api/v1/rfqs/:rfqId/qa          // Get Q&A thread
```

#### **Frontend Integration**

**Step 6: RFQ/Quote Workflow**
```typescript
// File: app/[locale]/rfq/create/page.tsx - ENHANCE
// Connect to real APIs and add business logic:

1. Real-time form validation
2. Service selection with pricing preview  
3. Auto-save draft functionality
4. Content violation warnings
5. Submit with proper error handling

// File: app/[locale]/rfq/[id]/page.tsx - ENHANCE  
// Add quote management:

1. Real quote response forms
2. Price validation indicators
3. Quote comparison tools
4. Accept/reject workflow
5. Q&A messaging system
```

**Time Estimate: 5-6 days**

---

### **🔥 Priority 1.3: Order Processing (WF-010)**

#### **Backend Implementation**

**Step 7: Order Management System**
```typescript
// File: backend/src/lib/orders/order-service.ts - CREATE
class OrderService {
  async createOrderFromQuote(quoteId: string, buyerId: string): Promise<Order> {
    // 1. Validate quote acceptance
    // 2. Lock pricing and terms
    // 3. Calculate total with fees/taxes
    // 4. Create order with status 'created'
    // 5. Initialize payment intent
    // 6. Send notifications
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, metadata?: any): Promise<void> {
    // 1. Validate status transition
    // 2. Update order.status
    // 3. Create audit log
    // 4. Trigger workflow events
    // 5. Send notifications
  }

  async calculateOrderTotal(order: Order): Promise<OrderTotal> {
    // 1. Apply pricing rules
    // 2. Calculate taxes from tax_rates table
    // 3. Add platform fees from fee_schedules
    // 4. Apply discounts if any
    // 5. Return detailed breakdown
  }
}

// File: backend/src/routes/orders.ts - ENHANCE
POST /api/v1/orders/from-quote/:quoteId  // Create order from quote
GET /api/v1/orders/:id                   // Order details  
PUT /api/v1/orders/:id/status            // Update order status
GET /api/v1/orders/:id/timeline          // Order history
POST /api/v1/orders/:id/items            // Add/modify order items
```

**Step 8: Basic Escrow Logic (Without Full Integration)**
```typescript
// File: backend/src/lib/escrow/escrow-service.ts - CREATE
class EscrowService {
  async createEscrowAccount(orderId: string): Promise<EscrowAccount> {
    // 1. Generate unique escrow account reference
    // 2. Create payment_intent record
    // 3. Set initial status 'pending_funds'
    // 4. Generate payment instructions
    // 5. Set expiration timer
  }

  async simulateEscrowFunding(escrowId: string, amount: number): Promise<void> {
    // SIMULATION for MVP - replace with real integration later
    // 1. Validate amount matches order total
    // 2. Update payment status 'escrow_funded'
    // 3. Notify seller to prepare goods
    // 4. Start delivery workflow
  }

  async releaseEscrow(escrowId: string, milestone: string): Promise<void> {
    // 1. Validate release conditions
    // 2. Calculate platform commission
    // 3. Update payment status 'released'
    // 4. Create payout record
    // 5. Generate invoice
  }
}

// APIs for escrow simulation:
POST /api/v1/escrow/create              // Create escrow
POST /api/v1/escrow/:id/simulate-fund   // TEMP: Simulate funding
POST /api/v1/escrow/:id/release         // Release funds
GET /api/v1/escrow/:id/status           // Check status
```

#### **Frontend Order Flow**

**Step 9: Order Processing UI**
```typescript
// File: app/[locale]/orders/checkout/page.tsx - ENHANCE
// Add real checkout process:

1. Order summary with real calculations
2. Tax and fee breakdowns
3. Terms acceptance
4. Payment method selection  
5. Escrow explanation and flow
6. Order confirmation

// File: app/[locale]/orders/[id]/page.tsx - ENHANCE
// Add order tracking:

1. Real-time order status
2. Timeline with actual events
3. Document attachments
4. Action buttons (confirm delivery, dispute, etc.)
5. Escrow status indicator
```

**Time Estimate: 4-5 days**

---

## 📅 **PHASE 2: FILE MANAGEMENT & VALIDATION (Week 3)**

### **🔥 Priority 2.1: Production File Upload System**

#### **Backend Implementation**

**Step 10: File Storage Service**
```typescript
// File: backend/src/lib/storage/file-storage.ts - CREATE
import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';

class FileStorageService {
  async uploadFile(
    file: Express.Multer.File, 
    path: string, 
    metadata?: any
  ): Promise<UploadResult> {
    // 1. Validate file type and size
    // 2. Generate unique filename
    // 3. Upload to S3/MinIO
    // 4. Create database record
    // 5. Return signed URL
  }

  async validateFileType(file: Express.Multer.File): Promise<boolean> {
    // 1. Check MIME type
    // 2. Verify file headers
    // 3. Scan for malware (basic)
    // 4. Check file size limits
  }

  async generateThumbnail(imageUrl: string): Promise<string> {
    // 1. Download image
    // 2. Resize using Sharp
    // 3. Upload thumbnail
    // 4. Return thumbnail URL
  }
}

// File: backend/src/routes/upload.ts - CREATE  
const upload = multer({
  dest: 'temp/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Validate file types
  }
});

POST /api/v1/upload/single          // Single file
POST /api/v1/upload/multiple        // Multiple files  
POST /api/v1/upload/avatar          // Avatar with crop
POST /api/v1/upload/documents       // Documents (PDF, images)
GET /api/v1/upload/:id/signed-url   // Get download URL
DELETE /api/v1/upload/:id           // Delete file
```

#### **Frontend File Components**

**Step 11: File Upload Components**
```typescript
// File: components/upload/file-upload.tsx - CREATE
interface FileUploadProps {
  accept: string;
  maxFiles?: number;
  maxSize?: number;
  onUpload: (files: UploadedFile[]) => void;
  children: React.ReactNode;
}

// Features:
1. Drag & drop interface
2. Progress indicators  
3. File validation
4. Preview thumbnails
5. Error handling
6. Multiple file support

// File: components/media/image-gallery.tsx - CREATE
// Gallery component for listing media:
1. Image viewer with zoom
2. Video player
3. Document preview
4. Reorder functionality
5. Delete capabilities
```

**Time Estimate: 3-4 days**

---

### **🔥 Priority 2.2: Inspection System (WF-008)**

#### **Backend Implementation**

**Step 12: Inspection Workflow**
```typescript
// File: backend/src/lib/inspection/inspection-service.ts - CREATE
class InspectionService {
  async scheduleInspection(data: ScheduleInspectionRequest): Promise<Inspection> {
    // 1. Check depot availability
    // 2. Validate container location
    // 3. Calculate inspection fees
    // 4. Create inspection record
    // 5. Send depot notification
    // 6. Create calendar entry
  }

  async updateInspectionStatus(
    inspectionId: string, 
    status: InspectionStatus,
    data?: any
  ): Promise<void> {
    // 1. Validate status transition
    // 2. Update inspection record
    // 3. Handle photos/documents
    // 4. Notify stakeholders
    // 5. Update container condition
  }

  async generateInspectionReport(inspectionId: string): Promise<InspectionReport> {
    // 1. Compile inspection items
    // 2. Generate IICL-compliant report
    // 3. Create PDF document
    // 4. Store report file
    // 5. Update inspection status
  }
}

// File: backend/src/routes/inspections.ts - CREATE
POST /api/v1/inspections/schedule   // Schedule inspection
GET /api/v1/inspections             // List inspections
GET /api/v1/inspections/:id         // Inspection details
PUT /api/v1/inspections/:id/items   // Update inspection items
POST /api/v1/inspections/:id/photos // Upload photos
PUT /api/v1/inspections/:id/complete // Complete inspection
GET /api/v1/inspections/:id/report  // Download report
```

#### **Frontend Inspection Flow**

**Step 13: Inspection Management**
```typescript
// File: app/[locale]/inspection/schedule/page.tsx - ENHANCE
// Real scheduling functionality:

1. Depot calendar integration
2. Fee calculation and display
3. Time slot selection
4. Service selection (standard types)
5. Booking confirmation

// File: app/[locale]/inspection/[id]/form/page.tsx - CREATE
// Inspection execution form (for depot staff):

1. Digital inspection checklist
2. Photo capture integration
3. Condition scoring system
4. Defect marking interface
5. Report generation
```

**Time Estimate: 4-5 days**

---

## 📅 **PHASE 3: PAYMENT INTEGRATION (Week 4)**

### **🔥 Priority 3.1: VNPay Integration**

#### **Backend Payment Processing**

**Step 14: VNPay Service Integration**
```typescript
// File: backend/src/lib/payment/vnpay-service.ts - CREATE
import crypto from 'crypto';

class VNPayService {
  private tmnCode = process.env.VNPAY_TMN_CODE;
  private secretKey = process.env.VNPAY_SECRET_KEY;
  private baseUrl = process.env.VNPAY_BASE_URL;

  async createPayment(order: Order): Promise<VNPayPaymentResponse> {
    // 1. Generate transaction reference
    // 2. Calculate secure hash
    // 3. Create payment URL
    // 4. Store payment intent
    // 5. Return payment URL
  }

  async verifyCallback(params: VNPayCallbackParams): Promise<PaymentResult> {
    // 1. Verify secure hash
    // 2. Check transaction status
    // 3. Update payment record
    // 4. Trigger order status update
    // 5. Return verification result
  }

  async queryTransaction(transactionId: string): Promise<TransactionStatus> {
    // 1. Call VNPay query API
    // 2. Parse response
    // 3. Update local records
    // 4. Return status
  }
}

// File: backend/src/routes/payments.ts - CREATE
POST /api/v1/payments/vnpay/create     // Create VNPay payment
POST /api/v1/payments/vnpay/callback   // VNPay IPN handler
GET /api/v1/payments/:id/status        // Check payment status
POST /api/v1/payments/:id/refund       // Process refund
GET /api/v1/payments/history           // Payment history
```

#### **Frontend Payment Flow**

**Step 15: Payment Integration UI**
```typescript
// File: app/[locale]/payments/checkout/page.tsx - CREATE
// Payment processing interface:

1. Payment method selection
2. VNPay integration
3. Payment status monitoring
4. Error handling and retry
5. Success/failure redirects

// File: components/payments/payment-methods.tsx - CREATE
// Payment methods component:
1. VNPay button integration
2. Bank transfer instructions
3. Payment status indicators
4. Security information display
```

**Time Estimate: 4-5 days**

---

### **🔥 Priority 3.2: Email Notification System**

#### **Backend Notifications**

**Step 16: Email Service Integration**
```typescript
// File: backend/src/lib/notifications/email-service.ts - CREATE
import nodemailer from 'nodemailer';

class EmailService {
  private transporter = nodemailer.createTransporter({
    // SMTP configuration
  });

  async sendEmail(to: string, template: string, data: any): Promise<void> {
    // 1. Load email template
    // 2. Render with data
    // 3. Send email
    // 4. Log delivery status
    // 5. Handle failures
  }

  async sendWelcomeEmail(user: User): Promise<void>;
  async sendOrderConfirmation(order: Order): Promise<void>;
  async sendPaymentSuccess(payment: Payment): Promise<void>;
  async sendInspectionScheduled(inspection: Inspection): Promise<void>;
}

// File: backend/src/lib/notifications/notification-service.ts - CREATE
class NotificationService {
  async sendNotification(
    userId: string, 
    type: NotificationType, 
    data: any
  ): Promise<void> {
    // 1. Get user preferences
    // 2. Choose delivery channels
    // 3. Create notification record
    // 4. Send via email/SMS/push
    // 5. Track delivery status
  }
}

// File: backend/src/routes/notifications.ts - CREATE
GET /api/v1/notifications              // Get user notifications
POST /api/v1/notifications/read        // Mark as read
DELETE /api/v1/notifications/:id       // Delete notification
GET /api/v1/notifications/unread-count // Unread count
PUT /api/v1/notifications/preferences  // Update preferences
```

#### **Frontend Notifications**

**Step 17: Notification UI**
```typescript
// File: components/notifications/notification-bell.tsx - CREATE
// Real-time notification bell:

1. Unread count indicator
2. Dropdown notification list
3. Mark as read functionality
4. Real-time updates via polling
5. Navigation to relevant pages

// File: app/[locale]/notifications/page.tsx - ENHANCE
// Notification center:
1. Notification history
2. Filter by type/status
3. Bulk actions
4. Notification preferences
```

**Time Estimate: 3-4 days**

---

## 📅 **PHASE 4: ADVANCED FEATURES (Week 5-6)**

### **🔥 Priority 4.1: Admin Dashboard Enhancement**

#### **Backend Admin APIs**

**Step 18: Admin Management APIs**
```typescript
// File: backend/src/routes/admin/users.ts - ENHANCE
GET /api/v1/admin/users               // List users with filters
PUT /api/v1/admin/users/:id/status    // Update user status  
POST /api/v1/admin/users/:id/kyc/approve // Approve KYC
POST /api/v1/admin/users/:id/kyc/reject  // Reject KYC
GET /api/v1/admin/users/analytics     // User analytics

// File: backend/src/routes/admin/listings.ts - CREATE
GET /api/v1/admin/listings/pending    // Pending approval
POST /api/v1/admin/listings/:id/approve // Approve listing
POST /api/v1/admin/listings/:id/reject  // Reject listing
GET /api/v1/admin/listings/analytics  // Listing analytics

// File: backend/src/routes/admin/analytics.ts - CREATE
GET /api/v1/admin/analytics/dashboard // Dashboard KPIs
GET /api/v1/admin/analytics/revenue   // Revenue metrics
GET /api/v1/admin/analytics/users     // User metrics
GET /api/v1/admin/analytics/transactions // Transaction metrics
```

#### **Frontend Admin Interfaces**

**Step 19: Admin Dashboard Implementation**
```typescript
// File: app/[locale]/admin/users/page.tsx - ENHANCE
// Real user management:

1. User listing with search/filters
2. KYC document review interface
3. User status management
4. Bulk operations
5. User analytics charts

// File: app/[locale]/admin/listings/page.tsx - ENHANCE  
// Content moderation:
1. Listing approval queue
2. Content violation detection
3. Pricing validation alerts
4. Bulk approval tools
5. Moderation analytics
```

**Time Estimate: 5-6 days**

---

### **🔥 Priority 4.2: Search & Discovery Enhancement**

#### **Backend Search Optimization**

**Step 20: Advanced Search Implementation**
```typescript
// File: backend/src/lib/search/search-service.ts - CREATE
class SearchService {
  async searchListings(query: SearchQuery): Promise<SearchResults> {
    // 1. Parse search parameters
    // 2. Build database query with filters
    // 3. Apply sorting and pagination
    // 4. Calculate facets
    // 5. Return structured results
  }

  async getSuggestedFilters(query: string): Promise<FilterSuggestions> {
    // 1. Analyze query text
    // 2. Extract location, size, type hints
    // 3. Return suggested filters
    // 4. Include popular searches
  }

  async saveSearch(userId: string, query: SearchQuery): Promise<SavedSearch> {
    // 1. Store search criteria
    // 2. Set up alerts (optional)
    // 3. Return saved search ID
  }
}

// Enhanced search endpoints:
GET /api/v1/listings/search/advanced   // Advanced search
GET /api/v1/listings/search/suggestions // Search suggestions
POST /api/v1/listings/search/save      // Save search
GET /api/v1/listings/search/saved      // User's saved searches
```

#### **Frontend Search Enhancement**

**Step 21: Advanced Search UI**
```typescript
// File: app/[locale]/listings/search/page.tsx - CREATE
// Advanced search interface:

1. Multi-criteria search form
2. Map-based location search
3. Price range sliders  
4. Availability calendar
5. Saved search management

// File: components/search/search-filters.tsx - ENHANCE
// Enhanced filter components:
1. Dynamic filter options
2. Filter count indicators
3. Clear/reset functionality
4. Filter persistence
5. Mobile-optimized UI
```

**Time Estimate: 4-5 days**

---

## 📅 **PHASE 5: PRODUCTION READINESS (Week 7-8)**

### **🔥 Priority 5.1: Security & Performance**

#### **Backend Security Implementation**

**Step 22: Security Hardening**
```typescript
// File: backend/src/middleware/security.ts - CREATE
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Rate limiting
const createRateLimit = (windowMs: number, max: number) => 
  rateLimit({
    windowMs,
    max,
    message: 'Too many requests',
    standardHeaders: true,
    legacyHeaders: false,
  });

// Input validation middleware
export const validateInput = (schema: ZodSchema) => 
  (req: Request, res: Response, next: NextFunction) => {
    // Validate request body/params/query
  };

// File: backend/src/middleware/audit.ts - CREATE  
export const auditMiddleware = (action: string) =>
  (req: Request, res: Response, next: NextFunction) => {
    // Log user actions for audit trail
  };

// Apply security measures:
1. Helmet for security headers
2. Rate limiting per endpoint
3. Input validation with Zod
4. SQL injection prevention
5. XSS protection
6. CSRF protection
7. Audit logging
```

#### **Performance Optimization**

**Step 23: Caching & Optimization**
```typescript
// File: backend/src/lib/cache/redis-cache.ts - CREATE
class CacheService {
  async get<T>(key: string): Promise<T | null>;
  async set(key: string, value: any, ttl?: number): Promise<void>;
  async del(key: string): Promise<void>;
  async invalidatePattern(pattern: string): Promise<void>;
}

// Cache implementations:
1. API response caching
2. Database query caching  
3. Session caching
4. Configuration caching
5. Search result caching

// Database optimization:
1. Add proper indexes
2. Optimize N+1 queries
3. Connection pooling
4. Query analysis
```

**Time Estimate: 3-4 days**

---

### **🔥 Priority 5.2: Testing & Monitoring**

#### **Test Implementation**

**Step 24: Testing Framework**
```typescript
// File: backend/tests/unit/auth.test.ts - CREATE
describe('Authentication Service', () => {
  test('should register user with valid data', async () => {
    // Unit test implementation
  });
  
  test('should reject invalid email format', async () => {
    // Validation test
  });
});

// File: backend/tests/integration/api.test.ts - CREATE
describe('API Integration Tests', () => {
  test('should create listing successfully', async () => {
    // Integration test with database
  });
});

// File: tests/e2e/auth-flow.spec.ts - CREATE  
// Playwright E2E tests:
test('User can complete full auth flow', async ({ page }) => {
  // E2E test implementation
});

// Test coverage setup:
1. Jest configuration
2. Test database setup
3. Mock external services
4. Coverage reporting
5. CI/CD integration
```

#### **Monitoring Setup**

**Step 25: Production Monitoring**
```typescript
// File: backend/src/lib/monitoring/logger.ts - CREATE
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// File: backend/src/lib/monitoring/metrics.ts - CREATE
class MetricsService {
  async recordMetric(name: string, value: number, tags?: any): Promise<void>;
  async incrementCounter(name: string, tags?: any): Promise<void>;
  async recordTiming(name: string, duration: number): Promise<void>;
}

// Monitoring implementation:
1. Application logs
2. Error tracking  
3. Performance metrics
4. Business metrics
5. Health checks
6. Alerting rules
```

**Time Estimate: 4-5 days**

---

### **🔥 Priority 5.3: Deployment & CI/CD**

#### **Deployment Configuration**

**Step 26: Production Deployment**
```yaml
# File: docker-compose.prod.yml - CREATE
version: '3.8'
services:
  app:
    build: .
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
    ports:
      - "3000:3000"
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: icontexchange_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data

# File: .github/workflows/deploy.yml - CREATE
name: Deploy to Production
on:
  push:
    branches: [main]
    
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run build
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        run: |
          # Deployment script
```

#### **Environment Configuration**

**Step 27: Environment Setup**
```bash
# File: .env.production - CREATE
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/icontexchange_prod"
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="production-secret-key"
JWT_REFRESH_SECRET="production-refresh-secret"

# VNPay
VNPAY_TMN_CODE="your-tmn-code"
VNPAY_SECRET_KEY="your-secret-key"
VNPAY_BASE_URL="https://pay.vnpay.vn"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File Storage
AWS_REGION="ap-southeast-1"
AWS_BUCKET="icontexchange-files"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
```

**Time Estimate: 3-4 days**

---

## 📊 **IMPLEMENTATION SUMMARY**

### **Total Timeline: 8 weeks**

#### **Week 1-2: Core Business Logic (12 days)**
- ✅ Pricing Rules Engine
- ✅ Content Redaction System  
- ✅ RFQ/Quote Workflow
- ✅ Order Processing
- ✅ Basic Escrow Logic

#### **Week 3: File Management & Inspection (6 days)**
- ✅ Production File Upload
- ✅ Inspection Workflow
- ✅ Media Management

#### **Week 4: Payment & Notifications (8 days)**
- ✅ VNPay Integration
- ✅ Email Service
- ✅ Notification System

#### **Week 5-6: Advanced Features (10 days)**
- ✅ Admin Dashboard
- ✅ Advanced Search
- ✅ Analytics System

#### **Week 7-8: Production Ready (8 days)**
- ✅ Security Implementation
- ✅ Testing Framework
- ✅ Monitoring Setup
- ✅ Deployment Pipeline

---

## 🎯 **SUCCESS CRITERIA**

### **MVP Functional Requirements:**
- ✅ User can register, verify identity, login
- ✅ User can create listings with price validation
- ✅ User can send RFQ and receive quotes
- ✅ User can create orders and process payments
- ✅ User can schedule inspections
- ✅ Admin can moderate content and manage users
- ✅ System can send email notifications
- ✅ System is secure and performant

### **Technical Requirements:**
- ✅ >80% test coverage
- ✅ <3 second page load times
- ✅ Security audit passed
- ✅ Production deployment working
- ✅ Monitoring and logging active

### **Business Requirements:**  
- ✅ All core workflows (WF-001 to WF-010) functional
- ✅ Content moderation working
- ✅ Payment processing working
- ✅ User experience smooth and professional

---

## 🚀 **NEXT STEPS TO START**

### **Immediate Actions (This Week):**

1. **Setup Development Environment**
   ```bash
   # Install additional dependencies
   cd backend
   npm install multer @aws-sdk/client-s3 sharp nodemailer
   npm install helmet express-rate-limit winston
   npm install @types/multer @types/nodemailer --save-dev
   
   cd ../frontend  
   npm install react-dropzone @tanstack/react-query
   ```

2. **Create Environment Files**
   ```bash
   # Setup .env files for development and production
   cp backend/environment.env backend/.env.development
   # Configure VNPay, AWS, SMTP settings
   ```

3. **Database Migrations**
   ```bash
   # Ensure all tables are created and seeded
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   npm run seed
   ```

4. **Start with Priority 1.1 (Pricing Rules Engine)**
   - Create `backend/src/lib/pricing/` folder
   - Implement `PricingRulesEngine` class
   - Add price validation to listing endpoints
   - Test with frontend integration

### **Resource Allocation:**
- **1 Senior Full-stack Developer**: Lead implementation
- **1 Frontend Developer**: UI/UX enhancements  
- **1 Backend Developer**: API and business logic
- **1 DevOps Engineer**: Deployment and monitoring

### **Weekly Milestones:**
- **Week 1**: Core business logic 50% complete
- **Week 2**: RFQ/Quote system working
- **Week 3**: File upload and payments integrated
- **Week 4**: Admin dashboard functional
- **Week 6**: Feature complete MVP
- **Week 8**: Production deployment ready

---

**© 2025 i-ContExchange Vietnam. All rights reserved.**

*Roadmap này sẽ được cập nhật hàng tuần theo tiến độ thực tế. Priority có thể điều chỉnh dựa trên feedback và testing results.*