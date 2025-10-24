# 🚢 i-ContExchange - Container Exchange Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-4.0-green?style=flat-square&logo=fastify)](https://fastify.io/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=flat-square&logo=prisma)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.0-blue?style=flat-square&logo=postgresql)](https://postgresql.org/)

Nền tảng trao đổi container thông minh với hệ thống phân quyền dựa trên vai trò (RBAC) hoàn chỉnh.

## 🌟 Tính Năng Chính

### 🔐 Hệ Thống RBAC Hoàn Chỉnh
- **6 vai trò người dùng:** Admin, Buyer, Seller, Depot Staff, Inspector, Operator
- **45+ quyền chi tiết:** Phân quyền cụ thể cho từng tính năng
- **Dynamic Navigation:** Menu thay đổi theo vai trò
- **Permission Guards:** Bảo vệ component và route
- **Session Management:** JWT với refresh token

### 🛒 Marketplace & Trading
- **Container Listings:** Tạo, quản lý và duyệt listings
- **Advanced Search:** Filter theo size, condition, location, price
- **Quote System:** Request và manage quotes
- **Order Management:** Theo dõi đơn hàng end-to-end
- **Multi-language:** Vietnamese và English

### 🏭 Depot Management
- **Inventory Tracking:** Real-time container location
- **Receiving/Delivery:** Xử lý hàng nhập/xuất
- **Position Management:** Yard layout và stacking
- **Condition Monitoring:** Theo dõi tình trạng container

### 🔍 Quality Inspection
- **Inspection Reports:** Báo cáo kiểm định chi tiết
- **Photo Documentation:** Upload và quản lý hình ảnh
- **Condition Grading:** Hệ thống đánh giá A/B/C/D
- **Certification:** Digital certificates

### 💰 Financial Management
- **Billing System:** Hóa đơn và thanh toán
- **Invoice Generation:** Tự động tạo invoice
- **Payment Tracking:** Theo dõi thanh toán
- **Financial Reports:** Báo cáo tài chính

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm hoặc pnpm

### Installation

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Setup database
# Update DATABASE_URL trong backend/environment.env

# Generate Prisma client & Run migrations
cd backend
npx prisma generate
npx prisma migrate dev --name "init-rbac"

# Seed demo data
npx tsx prisma/seed-rbac.ts

# Start backend
npm run dev

# Start frontend (terminal mới)
cd ..
npm run dev
```

### Demo Accounts

Truy cập: http://localhost:3000/vi/auth/login

| Role | Email | Password | Access |
|------|-------|----------|---------|
| **👑 Admin** | admin@i-contexchange.vn | admin123 | Toàn quyền hệ thống |
| **⚙️ Config Manager** | operator@example.com | operator123 | Cấu hình hệ thống |
| **💰 Finance** | finance@example.com | finance123 | Đối soát tài chính |
| **💲 Price Manager** | price@example.com | price123 | Quản lý giá |
| **🎧 Customer Support** | support@example.com | support123 | Hỗ trợ khách hàng |
| **🏭 Depot Manager** | manager@example.com | depot123 | Quản lý kho bãi |
| **🔍 Inspector** | inspector@example.com | inspector123 | Giám định chất lượng |
| **👷 Depot Staff** | depot@example.com | depot123 | Vận hành kho bãi |
| **🛒 Buyer** | buyer@example.com | buyer123 | Mua container |
| **🏪 Seller** | seller@example.com | seller123 | Bán container |

## � System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (Fastify)     │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ • React 18      │    │ • JWT Auth      │    │ • RBAC Tables   │
│ • TypeScript    │    │ • RBAC Service  │    │ • User Data     │
│ • Tailwind CSS  │    │ • API Routes    │    │ • Business Data │
│ • Shadcn/ui     │    │ • Prisma ORM    │    │ • Audit Logs    │
│ • i18n Support  │    │ • Validation    │    │ • Sessions      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## �️ Project Structure

Xem chi tiết: [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md)

```
i-contexchange/
├── 📁 app/                    # Next.js app directory
│   ├── 📁 [locale]/          # Internationalization
│   │   ├── 📁 admin/         # Admin pages (104 screens)
│   │   ├── 📁 auth/          # Authentication pages
│   │   ├── 📁 dashboard/     # User dashboards
│   │   ├── 📁 marketplace/   # Marketplace pages
│   │   └── 📁 ...           # Other feature pages
├── 📁 backend/               # Express backend (Port 3001)
│   ├── 📁 prisma/           # Database schema & migrations
│   ├── 📁 src/              # Source code
│   │   ├── 📁 routes/       # API endpoints
│   │   ├── 📁 middleware/   # Express middleware
│   │   ├── 📁 utils/        # Utilities
│   │   └── server.ts        # Main server file
│   └── 📁 uploads/          # File uploads
├── 📁 components/            # Reusable React components
│   ├── 📁 layout/           # Dynamic navigation
│   ├── 📁 ui/               # UI components (shadcn)
│   ├── 📁 listings/         # Listing components
│   ├── 📁 orders/           # Order components
│   ├── 📁 quotes/           # Quote components
│   ├── 📁 rfq/              # RFQ components
│   ├── 📁 notifications/    # Notification components
│   └── 📁 admin/            # Admin components
├── 📁 lib/                   # Utilities & helpers
│   ├── 📁 api/              # API client
│   ├── 📁 auth/             # Auth utilities
│   ├── 📁 utils/            # Helper functions
│   └── 📁 constants/        # Constants & enums
├── 📁 docs/                  # 📚 Documentation (Organized)
│   ├── 📁 reports/          # Báo cáo tiến độ
│   ├── 📁 fixes/            # Tài liệu sửa lỗi
│   ├── 📁 phases/           # Tài liệu theo giai đoạn
│   └── 📁 guides/           # Hướng dẫn sử dụng
├── 📁 scripts/               # 🔧 Utility Scripts (Organized)
│   ├── 📁 setup/            # Setup & initialization
│   ├── 📁 test/             # Test scripts
│   └── 📁 database/         # Database migrations
├── 📁 types/                 # TypeScript definitions
├── 📁 hooks/                 # Custom React hooks
├── 📁 styles/                # Global styles
├── 📁 messages/              # i18n translations
└── 📁 Tài Liệu/             # Technical documentation
```

## 🔐 RBAC System Features

### Authentication & Authorization
- **JWT Tokens:** Access + Refresh token strategy
- **Role Hierarchy:** 6 predefined roles with different access levels
- **Permission Matrix:** 45+ granular permissions for fine-grained control
- **Session Management:** Secure session handling with audit trail
- **Route Protection:** Middleware-based protection for all routes

### User Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Admin** | System Administrator | `admin.*` - Full system access |
| **Buyer** | Container Purchaser | `listings.read`, `orders.write` |
| **Seller** | Container Vendor | `listings.write`, `orders.read` |
| **Depot Staff** | Warehouse Operations | `depot.*`, `inventory.*` |
| **Inspector** | Quality Control | `inspection.*` |
| **Operator** | System Operations | Limited admin, monitoring |

## 📈 Statistics

### System Coverage
- **� Total Screens:** 104 pages across all roles
- **🔐 Permission Matrix:** 45+ distinct permissions
- **🗄️ Database Tables:** 8 RBAC tables + business tables  
- **🌐 Languages:** Vietnamese & English
- **📊 User Roles:** 6 comprehensive role definitions

### Screen Distribution by Role
- **Admin:** 45 screens (complete system access)
- **Buyer:** 18 screens (marketplace focused)
- **Seller:** 21 screens (sales management)
- **Depot Staff:** 15 screens (operations focused)
- **Inspector:** 8 screens (quality control)
- **Guest:** 6 screens (public access)

## 📚 Documentation

| Document | Description | Target Audience |
|----------|-------------|-----------------|
| [🚀 Quick Start](./Tài%20Liệu/Quick-Start-RBAC.md) | 5-minute setup guide | Developers |
| [� Complete Deployment](./Tài%20Liệu/Huong-Dan-Trien-Khai-RBAC-Hoan-Chinh.md) | Full system deployment | DevOps, Admins |
| [👥 User Manual](./Tài%20Liệu/User-Manual-Theo-Vai-Tro.md) | Role-based user guides | End Users |
| [📊 Screen Report](./Tài%20Liệu/Bao-Cao-Thong-Ke-Man-Hinh-Theo-Vai-Tro.md) | Comprehensive screen statistics | Project Managers |

## 🧪 Testing

### Quick Test Scenarios

1. **Authentication Flow:**
   ```bash
   # Test login with different roles
   curl -X POST http://localhost:3005/api/v1/auth/login \
     -d '{"email":"admin@i-contexchange.vn","password":"admin123"}'
   ```

2. **Permission Testing:**
   - Login as different roles
   - Verify navigation menu changes
   - Test access to restricted pages
   - Validate API endpoints respect permissions

3. **RBAC Functionality:**
   - Role assignment/removal
   - Permission granting/revoking
   - Session management
   - Audit trail verification

## 🚀 Production Deployment

### Environment Setup
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# JWT Secrets (change in production!)
JWT_SECRET="your-super-secret-256-bit-key"
JWT_REFRESH_SECRET="your-refresh-secret-256-bit-key"

# Application
NODE_ENV="production"
PORT="3005"
CORS_ORIGIN="https://yourdomain.com"
```

### Security Checklist
- [ ] Change all default passwords
- [ ] Use strong JWT secrets (256-bit)
- [ ] Enable HTTPS only
- [ ] Configure proper CORS
- [ ] Set up database SSL
- [ ] Enable audit logging
- [ ] Configure rate limiting

## 📞 Support

### Documentation & Guides
- **Quick Start:** Get running in 5 minutes
- **Complete Guide:** Full deployment instructions  
- **User Manuals:** Role-specific user guides
- **API Documentation:** Backend API reference

### Contact
- **Email:** support@i-contexchange.vn
- **Phone:** +84 28 1234 5678
- **Business Hours:** Mon-Fri 8:00-18:00 ICT

---

<div align="center">
  <p>✨ <strong>Features Complete:</strong> RBAC System, Authentication, Dynamic Navigation, Permission Guards, Demo Accounts</p>
  <p>� <strong>Coverage:</strong> 104 Screens, 6 Roles, 45+ Permissions, Complete Documentation</p>
  <p>🚀 <strong>Ready for:</strong> Development, Testing, Production Deployment</p>
  
  <br/>
  
  <p>Made with ❤️ by the i-ContExchange Team</p>
  <p>© 2024 i-ContExchange. All rights reserved.</p>
</div>
