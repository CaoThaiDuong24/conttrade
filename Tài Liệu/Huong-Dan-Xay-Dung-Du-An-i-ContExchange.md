# HƯỚNG DẪN XÂY DỰNG DỰ ÁN i-ContExchange

Mã tài liệu: BUILD-GUIDE-v1.0  
Ngày: 2025-09-30  
Ngôn ngữ: Tiếng Việt  

---

## **1. TỔNG QUAN DỰ ÁN**

### **1.1. Giới thiệu**
**i-ContExchange** là nền tảng giao dịch container "Phygital" (Physical + Digital) độc đáo tại Việt Nam, kết hợp:
- **Sàn giao dịch trực tuyến**: Website và ứng dụng di động hiện đại
- **Mạng lưới Depot vật lý**: Trung tâm đảm bảo niềm tin với dịch vụ giám định, sửa chữa

### **1.2. Mô hình "Kiềng ba chân" Tin cậy**
1. **Xác thực người dùng**: eKYC/eKYB bắt buộc
2. **Đảm bảo chất lượng**: Giám định theo tiêu chuẩn IICL tại Depot
3. **An toàn giao dịch**: Thanh toán ký quỹ Escrow

### **1.3. Lợi thế cạnh tranh**
- Mô hình "Phygital" độc nhất thị trường Việt Nam
- Kiểm soát chất lượng container theo tiêu chuẩn quốc tế
- Hệ sinh thái dịch vụ tích hợp (bảo hiểm, vận chuyển, lưu kho)
- An toàn giao dịch tuyệt đối với Escrow

---

## **2. KIẾN TRÚC CÔNG NGHỆ**

### **2.1. Stack công nghệ**
```
Frontend: Next.js 14+ + React + TypeScript + Tailwind CSS
Backend: Node.js + Express + TypeScript
Database: PostgreSQL 14+ + Redis
Storage: AWS S3 hoặc MinIO
Auth: JWT + RBAC
Deployment: Docker + Kubernetes hoặc AWS ECS
```

### **2.2. Kiến trúc Microservices**
```
api-gateway/          # API Gateway và load balancing
auth-service/         # Xác thực và phân quyền
user-service/         # Quản lý người dùng
listing-service/      # Quản lý tin đăng container
rfq-service/          # RFQ/Quote system
order-service/        # Đơn hàng và giao dịch
payment-service/      # Thanh toán và Escrow
depot-service/        # Quản lý Depot và giám định
notification-service/ # Thông báo đa kênh
config-service/       # Cấu hình quản trị (no-code)
```

### **2.3. Database Schema**
- **50+ bảng chính**: users, orgs, containers, listings, orders, payments, inspections
- **30+ bảng Master Data**: md_countries, md_container_types, md_quality_standards
- **Row Level Security (RLS)** cho bảng nhạy cảm
- **Partitioning** cho bảng log lớn

---

## **3. LỘ TRÌNH TRIỂN KHAI CHI TIẾT**

### **3.1. Giai đoạn 1: MVP (6-9 tháng)**

#### **3.1.1. Mục tiêu**
Xác thực mô hình kinh doanh với tính năng cốt lõi

#### **3.1.2. Công việc cần làm**

**Tuần 1-4: Setup dự án**
```bash
# Tạo workspace và cấu trúc
mkdir i-contexchange && cd i-contexchange
git init

# Frontend setup
npx create-next-app@latest frontend --typescript --tailwind --eslint --app
cd frontend
npm install @radix-ui/react-* shadcn/ui lucide-react

# Backend setup
mkdir backend && cd backend
npm init -y
npm install express typescript @types/node @types/express
npm install jsonwebtoken bcryptjs uuid
npm install pg redis @types/pg @types/redis

# Database setup
docker-compose up -d postgres redis
npm install drizzle-orm drizzle-kit
```

**Tuần 5-8: Authentication System**
- User registration/login với email/phone
- JWT token management
- Password reset với OTP
- Basic role management (User, Seller, Depot Manager, Admin)

**Tuần 9-12: Core Database Schema**
```sql
-- Users và Organizations
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  kyc_status TEXT DEFAULT 'unverified',
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Depots
CREATE TABLE depots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  address TEXT,
  province TEXT,
  capacity_teu INT,
  contact JSONB
);

-- Containers
CREATE TABLE containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iso_code TEXT,
  size_ft INT CHECK (size_ft IN (10,20,40,45)),
  type TEXT,
  serial_no TEXT UNIQUE,
  owner_org_id UUID,
  current_depot_id UUID REFERENCES depots(id),
  condition TEXT,
  quality_standard TEXT
);

-- Listings
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID REFERENCES containers(id),
  seller_user_id UUID REFERENCES users(id),
  deal_type TEXT NOT NULL, -- 'sale' | 'rental'
  price_currency TEXT DEFAULT 'VND',
  price_amount NUMERIC(18,2) CHECK (price_amount >= 0),
  location_depot_id UUID REFERENCES depots(id),
  status TEXT DEFAULT 'draft',
  title TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tuần 13-16: Core Features**
- Container listing CRUD
- Basic search và filters (theo kích cỡ, loại, giá, vị trí)
- Image upload với S3/MinIO
- Basic messaging system

**Tuần 17-20: UI/UX MVP**
- Responsive design với Tailwind CSS
- Dark/Light theme toggle
- Vietnamese localization (i18n)
- Mobile-first approach
- Basic dashboard cho người bán

**Tuần 21-24: Integration & Testing**
- API integration testing
- User acceptance testing
- Performance optimization
- Security audit
- Deployment setup

#### **3.1.3. Deliverables MVP**
- [ ] Website responsive hoạt động đầy đủ
- [ ] Mobile app (PWA hoặc React Native)
- [ ] Admin dashboard cơ bản
- [ ] Database với 20+ bảng core
- [ ] 30+ API endpoints
- [ ] Authentication system
- [ ] Basic container listing/search
- [ ] File upload system
- [ ] Messaging system

### **3.2. Giai đoạn 2: Mở rộng (9-12 tháng)**

#### **3.2.1. Tính năng nâng cao**

**eKYC/eKYB Integration**
```typescript
// Tích hợp với FPT.AI hoặc VNPT eKYC
interface KYCSubmission {
  userId: string;
  documentType: 'cccd' | 'passport';
  frontImage: File;
  backImage: File;
  selfieImage: File;
  livenessVideo?: File;
}

// eKYB cho doanh nghiệp
interface KYBSubmission {
  orgId: string;
  businessLicense: File;
  taxCode: string;
  representativeKYC: KYCSubmission;
}
```

**RFQ/Quote System có kiểm soát**
```typescript
interface RFQ {
  id: string;
  listingId: string;
  buyerId: string;
  purpose: 'purchase' | 'rental';
  quantity: number;
  needBy: Date;
  services: {
    inspection: boolean;
    repair: boolean;
    storage: boolean;
    delivery: boolean;
    insurance: boolean;
  };
  status: 'draft' | 'submitted' | 'quoted' | 'expired';
}

interface Quote {
  id: string;
  rfqId: string;
  sellerId: string;
  priceBreakdown: {
    basePrice: number;
    inspectionFee?: number;
    repairFee?: number;
    storageFee?: number;
    deliveryFee?: number;
    insuranceFee?: number;
    total: number;
  };
  validUntil: Date;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
}
```

**Escrow Payment System**
```typescript
interface EscrowPayment {
  id: string;
  orderId: string;
  amount: number;
  currency: 'VND' | 'USD';
  status: 'pending' | 'funded' | 'released' | 'refunded';
  escrowAccount: string;
  fundedAt?: Date;
  releasedAt?: Date;
  milestones: {
    orderConfirmed: boolean;
    containerDelivered: boolean;
    buyerAccepted: boolean;
  };
}
```

**Số hóa quy trình giám định**
```typescript
interface Inspection {
  id: string;
  listingId: string;
  depotId: string;
  requestedBy: string;
  inspectorId: string;
  scheduledAt: Date;
  completedAt?: Date;
  standard: 'IICL' | 'CW' | 'WWT';
  summary: string;
  items: InspectionItem[];
  photos: string[];
  videos: string[];
  certificate?: string; // URL to PDF certificate
}

interface InspectionItem {
  code: string; // 'door', 'floor', 'roof', etc.
  severity: 'good' | 'fair' | 'poor' | 'critical';
  note: string;
  photoUrl?: string;
}
```

#### **3.2.2. Config Center (No-code)**
```typescript
// Cấu hình động không cần deploy lại code
interface ConfigEntry {
  namespace: string; // 'pricing', 'ui', 'notifications'
  key: string;
  value: any;
  version: number;
  status: 'draft' | 'published' | 'archived';
  publishedBy?: string;
  publishedAt?: Date;
}

// Feature Flags
interface FeatureFlag {
  code: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetRoles?: string[];
  targetRegions?: string[];
}

// Pricing Rules Engine
interface PricingRule {
  region: string;
  sizeFt: number;
  qualityStandard: string;
  minPrice: number;
  maxPrice: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
}
```

### **3.3. Giai đoạn 3: Dẫn đầu (Liên tục)**

#### **3.3.1. AI/ML Features**
- **Gợi ý cá nhân hóa**: ML model dự đoán container phù hợp
- **Pricing Intelligence**: Phân tích giá thị trường real-time
- **Fraud Detection**: Phát hiện giao dịch bất thường
- **Quality Prediction**: AI đánh giá chất lượng từ ảnh

#### **3.3.2. Advanced Analytics**
```typescript
interface MarketAnalytics {
  region: string;
  timeframe: 'daily' | 'weekly' | 'monthly';
  metrics: {
    avgPrice: number;
    transactionVolume: number;
    supplyDemandRatio: number;
    qualityDistribution: Record<string, number>;
    topDepots: Array<{depotId: string; volume: number}>;
  };
}
```

#### **3.3.3. API Marketplace**
- Open API cho đối tác logistics
- Webhook system cho real-time updates
- SDK cho integration dễ dàng

---

## **4. DATABASE DESIGN CHI TIẾT**

### **4.1. Core Tables**
```sql
-- Bảng cấu hình động (Config Center)
CREATE TABLE config_namespaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE config_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace_id UUID REFERENCES config_namespaces(id),
  key TEXT NOT NULL,
  version INT DEFAULT 1,
  status TEXT DEFAULT 'draft',
  value_json JSONB NOT NULL,
  created_by UUID REFERENCES users(id),
  published_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Giám định và sửa chữa
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id),
  depot_id UUID REFERENCES depots(id),
  requested_by UUID REFERENCES users(id),
  inspector_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'requested',
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  standard TEXT, -- 'IICL', 'CW', 'WWT'
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inspection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES inspections(id),
  code TEXT NOT NULL, -- 'door', 'floor', 'roof'
  severity TEXT, -- 'good', 'fair', 'poor', 'critical'
  note TEXT,
  photo_url TEXT
);

-- RFQ/Quote system
CREATE TABLE rfqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id),
  buyer_id UUID REFERENCES users(id),
  purpose TEXT, -- 'purchase', 'rental'
  quantity INT DEFAULT 1,
  need_by TIMESTAMPTZ,
  services_json JSONB, -- {inspection: true, repair: false, ...}
  status TEXT DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ
);

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID REFERENCES rfqs(id),
  seller_id UUID REFERENCES users(id),
  price_subtotal NUMERIC(18,2),
  fees_json JSONB,
  total NUMERIC(18,2),
  currency TEXT DEFAULT 'VND',
  valid_until TIMESTAMPTZ,
  status TEXT DEFAULT 'draft'
);

-- Đơn hàng và thanh toán
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  listing_id UUID REFERENCES listings(id),
  quote_id UUID REFERENCES quotes(id),
  status TEXT DEFAULT 'created',
  subtotal NUMERIC(18,2),
  tax NUMERIC(18,2),
  fees NUMERIC(18,2),
  total NUMERIC(18,2),
  currency TEXT DEFAULT 'VND',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  provider TEXT, -- 'vnpay', 'momo', 'bank'
  method TEXT, -- 'card', 'bank_transfer', 'ewallet'
  status TEXT DEFAULT 'pending',
  escrow_account_ref TEXT,
  amount NUMERIC(18,2),
  paid_at TIMESTAMPTZ
);
```

### **4.2. Master Data Tables**
```sql
-- Danh mục container
CREATE TABLE md_container_sizes (
  size_ft INT PRIMARY KEY CHECK (size_ft IN (10,20,40,45))
);

CREATE TABLE md_container_types (
  code TEXT PRIMARY KEY, -- 'DRY', 'HC', 'RF', 'OT'
  name TEXT NOT NULL,
  iso_group TEXT
);

CREATE TABLE md_quality_standards (
  code TEXT PRIMARY KEY, -- 'WWT', 'CW', 'IICL'
  name TEXT NOT NULL
);

-- Địa lý
CREATE TABLE md_countries (
  code CHAR(2) PRIMARY KEY, -- ISO-3166
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true
);

CREATE TABLE md_provinces (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country_code CHAR(2) REFERENCES md_countries(code),
  active BOOLEAN DEFAULT true
);
```

---

## **5. API SPECIFICATION**

### **5.1. Authentication APIs**
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/forgot
POST /api/v1/auth/reset
GET  /api/v1/me
PUT  /api/v1/me
POST /api/v1/kyc/submit
POST /api/v1/kyb/submit
```

### **5.2. Listing APIs**
```
GET    /api/v1/listings              # Search với filters
POST   /api/v1/listings              # Tạo tin đăng
GET    /api/v1/listings/:id          # Chi tiết tin đăng
PUT    /api/v1/listings/:id          # Cập nhật tin đăng
DELETE /api/v1/listings/:id          # Xóa tin đăng
POST   /api/v1/listings/:id/media    # Upload ảnh/video
GET    /api/v1/listings/:id/rfqs     # RFQs cho tin đăng
```

### **5.3. RFQ/Quote APIs**
```
POST /api/v1/rfqs                    # Tạo RFQ
GET  /api/v1/rfqs/:id                # Chi tiết RFQ
PUT  /api/v1/rfqs/:id                # Cập nhật RFQ
POST /api/v1/rfqs/:id/quotes         # Tạo quote cho RFQ
GET  /api/v1/quotes/:id              # Chi tiết quote
PUT  /api/v1/quotes/:id/accept       # Chấp nhận quote
```

### **5.4. Order & Payment APIs**
```
POST /api/v1/orders                  # Tạo đơn hàng từ quote
GET  /api/v1/orders/:id              # Chi tiết đơn hàng
PUT  /api/v1/orders/:id/status       # Cập nhật trạng thái
POST /api/v1/orders/:id/payment      # Thanh toán
POST /api/v1/orders/:id/escrow/fund  # Nạp tiền vào escrow
POST /api/v1/orders/:id/escrow/release # Giải ngân escrow
```

### **5.5. Depot & Inspection APIs**
```
GET  /api/v1/depots                  # Danh sách depot
GET  /api/v1/depots/:id              # Chi tiết depot
POST /api/v1/inspections             # Đặt lịch giám định
GET  /api/v1/inspections/:id         # Chi tiết giám định
PUT  /api/v1/inspections/:id/complete # Hoàn thành giám định
GET  /api/v1/inspections/:id/report  # Báo cáo giám định
```

---

## **6. FRONTEND ARCHITECTURE**

### **6.1. Folder Structure**
```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── (dashboard)/       # Protected routes  
│   ├── listings/          # Listing pages
│   ├── orders/            # Order pages
│   └── admin/             # Admin pages
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── shared/           # Shared components
├── lib/                  # Utilities
│   ├── api.ts            # API client
│   ├── auth.ts           # Auth utilities
│   ├── utils.ts          # Common utilities
│   └── validations.ts    # Zod schemas
├── hooks/                # Custom hooks
├── store/                # State management (Zustand)
└── types/                # TypeScript types
```

### **6.2. Key Components**
```typescript
// Container Listing Card
interface ListingCard {
  listing: Listing;
  onFavorite: (id: string) => void;
  onContact: (id: string) => void;
}

// Search Filters
interface SearchFilters {
  dealType: 'sale' | 'rental' | 'all';
  sizeRange: [number, number];
  priceRange: [number, number];
  location: string[];
  qualityStandard: string[];
  depotIds: string[];
}

// RFQ Form
interface RFQForm {
  listingId: string;
  purpose: 'purchase' | 'rental';
  quantity: number;
  needBy: Date;
  services: {
    inspection: boolean;
    repair: boolean;
    storage: boolean;
    delivery: boolean;
    insurance: boolean;
  };
  additionalNotes: string;
}
```

---

## **7. DEPLOYMENT & DEVOPS**

### **7.1. Development Environment**
```dockerfile
# docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: icontexchange_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev123
    ports:
      - "5432:5432"
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
      
  minio:
    image: minio/minio
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    command: server /data --console-address ":9001"
```

### **7.2. Production Architecture**
```yaml
# kubernetes/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: icontexchange-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: icontexchange-api
  template:
    metadata:
      labels:
        app: icontexchange-api
    spec:
      containers:
      - name: api
        image: icontexchange/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: redis-url
```

### **7.3. CI/CD Pipeline**
```yaml
# .github/workflows/deploy.yml
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
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to AWS ECS
        run: |
          aws ecs update-service \
            --cluster icontexchange-prod \
            --service icontexchange-api \
            --force-new-deployment
```

---

## **8. SECURITY & COMPLIANCE**

### **8.1. Authentication & Authorization**
```typescript
// JWT Payload
interface JWTPayload {
  sub: string;           // user_id
  roles: string[];       // ['RL-USER', 'RL-SELLER']
  permissions: string[]; // ['PM-010', 'PM-015']
  orgIds: string[];      // organizations user belongs to
  depotIds?: string[];   // depots user can access
  locale: string;        // 'vi' | 'en'
  iat: number;
  exp: number;
}

// RBAC Check
function hasPermission(
  userPermissions: string[], 
  requiredPermission: string
): boolean {
  return userPermissions.includes(requiredPermission);
}
```

### **8.2. Data Protection (GDPR/PDPA Compliance)**
```typescript
// Data anonymization
interface PersonalDataHandler {
  anonymize(userId: string): Promise<void>;
  export(userId: string): Promise<UserDataExport>;
  delete(userId: string): Promise<void>;
}

// Audit logging
interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  targetTable: string;
  targetId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}
```

### **8.3. Input Validation**
```typescript
// Zod schemas cho API validation
import { z } from 'zod';

const CreateListingSchema = z.object({
  dealType: z.enum(['sale', 'rental']),
  containerSpecs: z.object({
    sizeFt: z.number().int().min(10).max(45),
    type: z.string().min(2).max(10),
    condition: z.enum(['new', 'used']),
    qualityStandard: z.enum(['WWT', 'CW', 'IICL'])
  }),
  price: z.object({
    amount: z.number().positive(),
    currency: z.enum(['VND', 'USD'])
  }),
  locationDepotId: z.string().uuid(),
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(2000)
});
```

---

## **9. TESTING STRATEGY**

### **9.1. Unit Testing**
```typescript
// Example: Pricing validation test
describe('PricingService', () => {
  it('should validate price within allowed band', () => {
    const pricingRules = {
      region: 'VN-South',
      sizeFt: 20,
      qualityStandard: 'CW',
      minPrice: 50000000,
      maxPrice: 80000000
    };
    
    const result = PricingService.validatePrice(
      60000000, 
      pricingRules
    );
    
    expect(result.isValid).toBe(true);
  });
  
  it('should reject price outside band', () => {
    const result = PricingService.validatePrice(
      100000000, 
      pricingRules
    );
    
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('PRICE_ABOVE_MAX');
  });
});
```

### **9.2. Integration Testing**
```typescript
// Example: RFQ workflow test
describe('RFQ Workflow', () => {
  it('should complete full RFQ to Order flow', async () => {
    // 1. Create RFQ
    const rfq = await api.post('/rfqs', rfqData);
    expect(rfq.status).toBe(201);
    
    // 2. Seller creates quote
    const quote = await api.post(`/rfqs/${rfq.id}/quotes`, quoteData);
    expect(quote.status).toBe(201);
    
    // 3. Buyer accepts quote
    const acceptance = await api.put(`/quotes/${quote.id}/accept`);
    expect(acceptance.status).toBe(200);
    
    // 4. Order is created
    const order = await api.get(`/orders?rfqId=${rfq.id}`);
    expect(order.data.length).toBe(1);
    expect(order.data[0].status).toBe('created');
  });
});
```

### **9.3. E2E Testing**
```typescript
// Playwright E2E test
test('User can create listing and receive RFQ', async ({ page }) => {
  // Login as seller
  await page.goto('/login');
  await page.fill('[data-testid=email]', 'seller@test.com');
  await page.fill('[data-testid=password]', 'password123');
  await page.click('[data-testid=login-button]');
  
  // Create listing
  await page.goto('/listings/create');
  await page.selectOption('[data-testid=deal-type]', 'sale');
  await page.selectOption('[data-testid=size]', '20');
  await page.fill('[data-testid=price]', '60000000');
  await page.fill('[data-testid=title]', 'Container 20ft chất lượng cao');
  await page.click('[data-testid=submit]');
  
  // Verify listing created
  await expect(page.locator('[data-testid=success-message]')).toBeVisible();
});
```

---

## **10. MONITORING & ANALYTICS**

### **10.1. Application Monitoring**
```typescript
// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      redis: 'connected',
      storage: 'connected'
    }
  });
});

// Metrics collection
import prometheus from 'prom-client';

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

const businessMetrics = {
  totalListings: new prometheus.Gauge({
    name: 'total_listings',
    help: 'Total number of active listings'
  }),
  totalTransactions: new prometheus.Counter({
    name: 'total_transactions',
    help: 'Total number of completed transactions'
  }),
  averageTransactionValue: new prometheus.Gauge({
    name: 'average_transaction_value',
    help: 'Average transaction value in VND'
  })
};
```

### **10.2. Business Intelligence Dashboard**
```typescript
interface KPIDashboard {
  // User metrics
  totalUsers: number;
  activeUsers: number;
  newRegistrations: number;
  kycCompletionRate: number;
  
  // Listing metrics
  totalListings: number;
  activeListings: number;
  averageListingPrice: number;
  mostPopularSizes: Array<{size: number; count: number}>;
  
  // Transaction metrics
  totalTransactions: number;
  gmv: number; // Gross Merchandise Value
  averageOrderValue: number;
  escrowFunded: number;
  completedTransactions: number;
  
  // Depot metrics
  totalInspections: number;
  averageInspectionTime: number;
  passRateByStandard: Record<string, number>;
  
  // Revenue metrics
  transactionFees: number;
  depotServiceRevenue: number;
  subscriptionRevenue: number;
  advertisingRevenue: number;
}
```

---

## **11. LAUNCH CHECKLIST**

### **11.1. Pre-launch (MVP)**
- [ ] **Legal Compliance**
  - [ ] Đăng ký sàn giao dịch TMĐT với Bộ Công Thương
  - [ ] Xây dựng Quy chế hoạt động
  - [ ] Chính sách bảo vệ dữ liệu cá nhân
  - [ ] Terms of Service và Privacy Policy
  
- [ ] **Technical**
  - [ ] Database schema đầy đủ và tested
  - [ ] API endpoints hoạt động ổn định
  - [ ] Frontend responsive trên mọi thiết bị
  - [ ] Authentication system secure
  - [ ] File upload system với virus scanning
  - [ ] Backup và disaster recovery plan
  
- [ ] **Business**
  - [ ] Partnership với 2-3 Depot thí điểm
  - [ ] Train đội ngũ giám định theo chuẩn IICL
  - [ ] Chuẩn bị inventory 50-100 container mẫu
  - [ ] Marketing materials và website content
  
- [ ] **Testing**
  - [ ] Unit test coverage > 80%
  - [ ] Integration test cho core workflows
  - [ ] Load testing cho 1000 concurrent users
  - [ ] Security penetration testing
  - [ ] User acceptance testing với real users

### **11.2. Go-live Strategy**
1. **Soft Launch** (1 tháng):
   - Mời 50-100 users beta test
   - Thu thập feedback và fix bugs
   - Fine-tune user experience
   
2. **Regional Launch** (2-3 tháng):
   - Launch tại TP.HCM và Hà Nội
   - Partnership với 5-10 Depot
   - Digital marketing campaigns
   
3. **National Rollout** (6 tháng):
   - Mở rộng ra toàn quốc
   - 20+ Depot partners
   - TV/Radio advertising

---

## **12. SUCCESS METRICS**

### **12.1. MVP Success Criteria (6 tháng)**
- **User Adoption**: 1,000 registered users
- **Listings**: 500 active listings
- **Transactions**: 50 completed transactions
- **GMV**: 5 tỷ VND
- **User Satisfaction**: CSAT > 4.0/5.0

### **12.2. Growth Targets (1 năm)**
- **User Adoption**: 10,000 registered users
- **Monthly Active Users**: 2,000
- **Monthly Transactions**: 200
- **GMV**: 50 tỷ VND/tháng
- **Revenue**: 500 triệu VND/tháng

### **12.3. Market Leadership (2 năm)**
- **Market Share**: 30% thị trường container trực tuyến
- **User Base**: 50,000 registered users
- **Monthly GMV**: 200 tỷ VND
- **Monthly Revenue**: 5 tỷ VND
- **Depot Network**: 50+ locations

---

## **KẾT LUẬN**

Dự án i-ContExchange là một hệ thống phức tạp và đầy thách thức, nhưng có tiềm năng rất lớn để trở thành nền tảng giao dịch container hàng đầu tại Việt Nam. 

**Yếu tố thành công quan trọng nhất**:
1. **Mô hình "Phygital"** độc đáo kết hợp công nghệ và cơ sở vật chất
2. **"Kiềng ba chân" tin cậy** giải quyết các nỗi đau của thị trường
3. **Execution tốt** với team có kinh nghiệm và cam kết dài hạn
4. **Partnership mạnh** với các Depot và hãng tàu

**Lộ trình triển khai** cần được thực hiện bài bản theo từng giai đoạn, bắt đầu với MVP để validate thị trường, sau đó mở rộng và hoàn thiện hệ sinh thái.

**Đầu tư ban đầu** ước tính 15-20 tỷ VND cho 2 năm đầu, với kỳ vọng ROI tích cực từ năm thứ 3.

Với sự chuẩn bị kỹ lưỡng và thực hiện đúng kế hoạch, i-ContExchange hoàn toàn có thể trở thành một "Unicorn" trong lĩnh vực Logistics-Tech tại Việt Nam.