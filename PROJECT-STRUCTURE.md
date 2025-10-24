# Cấu Trúc Dự Án i-ContExchange

## 📁 Tổng Quan Cấu Trúc

```
Web/
├── app/                      # Next.js App Router
│   ├── [locale]/            # Internationalization routes
│   ├── api/                 # API routes
│   └── components/          # App-specific components
│
├── backend/                  # Backend API Server
│   ├── src/                 # Source code
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utility functions
│   │   └── server.ts        # Main server file
│   ├── prisma/              # Database schema & migrations
│   ├── uploads/             # File uploads
│   └── dist/                # Compiled output (gitignored)
│
├── components/               # Reusable React components
│   ├── ui/                  # UI components (shadcn/ui)
│   ├── layout/              # Layout components
│   ├── listings/            # Listing-related components
│   ├── orders/              # Order management components
│   ├── quotes/              # Quote components
│   ├── rfq/                 # RFQ components
│   ├── notifications/       # Notification components
│   └── admin/               # Admin panel components
│
├── lib/                      # Utility libraries
│   ├── api/                 # API client functions
│   ├── auth/                # Authentication utilities
│   ├── utils/               # Helper functions
│   └── constants/           # App constants
│
├── hooks/                    # Custom React hooks
│
├── types/                    # TypeScript type definitions
│
├── styles/                   # Global styles
│
├── public/                   # Static assets
│
├── messages/                 # i18n translation files
│   ├── en.json              # English translations
│   └── vi.json              # Vietnamese translations
│
├── scripts/                  # Utility scripts
│   ├── setup/               # Setup and initialization scripts
│   ├── test/                # Test scripts
│   └── database/            # Database migration scripts
│
├── docs/                     # Documentation
│   ├── reports/             # Báo cáo tiến độ
│   ├── fixes/               # Tài liệu sửa lỗi
│   ├── phases/              # Tài liệu theo giai đoạn
│   └── guides/              # Hướng dẫn sử dụng
│
├── prisma/                   # Prisma schema (frontend)
│
└── config files              # Configuration
    ├── package.json
    ├── tsconfig.json
    ├── next.config.mjs
    ├── tailwind.config.js
    └── middleware.ts
```

## 📋 Chi Tiết Từng Thư Mục

### `/app` - Next.js Application
- **Mục đích**: Chứa toàn bộ UI và routing của ứng dụng Next.js 14
- **Cấu trúc**:
  - `[locale]/`: Đa ngôn ngữ (vi, en)
  - `api/`: API routes cho frontend
  - `components/`: Components dùng riêng cho app router

### `/backend` - Backend Server
- **Mục đích**: Node.js/Express API server với Prisma ORM
- **Cổng**: 3001
- **Cơ sở dữ liệu**: PostgreSQL
- **Chức năng chính**:
  - Authentication & Authorization (JWT)
  - RBAC (Role-Based Access Control)
  - RESTful API endpoints
  - File upload handling
  - Real-time notifications

### `/components` - UI Components
- **Quy ước**:
  - Sử dụng React functional components
  - TypeScript cho type safety
  - Tailwind CSS cho styling
  - shadcn/ui component library
- **Phân loại**:
  - `ui/`: Base UI components (buttons, inputs, modals)
  - Domain-specific folders (listings, orders, quotes, rfq)

### `/lib` - Utilities
- **api/**: Axios-based API client với interceptors
- **auth/**: JWT handling, session management
- **utils/**: Helper functions (formatters, validators)
- **constants/**: Enums, configs, constants

### `/scripts` - Scripts
- **setup/**: Database seeding, initialization scripts
- **test/**: Integration tests, API tests
- **database/**: SQL migrations, schema updates

### `/docs` - Documentation
- **reports/**: Báo cáo tiến độ dự án (BAO-CAO-*.md)
- **fixes/**: Tài liệu fix bugs (FIX-*.md, ADMIN-*.md)
- **phases/**: Tài liệu theo giai đoạn (PHASE-*.md)
- **guides/**: Hướng dẫn sử dụng và testing

## 🔧 Quy Ước Đặt Tên

### Files
- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatCurrency.ts`)
- **Types**: PascalCase (`User.types.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

### Folders
- **kebab-case** cho thư mục có nhiều từ
- **camelCase** cho code folders
- Tên rõ ràng, mô tả chức năng

## 🚀 Scripts Quan Trọng

### Frontend
```bash
npm run dev          # Development server (port 3000)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
```

### Backend
```bash
cd backend
npm run dev          # Development với nodemon
npm run build        # Build TypeScript
npm run start        # Production server
npx prisma migrate   # Run migrations
npx prisma studio    # Database GUI
```

## 📦 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Library**: shadcn/ui (Radix UI)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **i18n**: next-intl

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT (jose)
- **Validation**: Zod

## 🔐 Environment Variables

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=3001
NODE_ENV=development
```

## 📝 Best Practices

1. **Code Organization**
   - Nhóm theo feature/domain thay vì type
   - Tái sử dụng components và utilities
   - Tách biệt business logic khỏi UI

2. **TypeScript**
   - Luôn định nghĩa types/interfaces
   - Tránh `any` type
   - Sử dụng type inference khi có thể

3. **Git Workflow**
   - Commit messages rõ ràng
   - Branch naming: `feature/`, `fix/`, `docs/`
   - Pull request reviews

4. **Documentation**
   - Cập nhật docs khi thay đổi architecture
   - Comment cho logic phức tạp
   - README cho mỗi module lớn

## 🔄 Luồng Dữ Liệu

```
User → Frontend (Next.js) → API Route → Backend API → Database
                                           ↓
                                    Middleware (Auth, RBAC)
                                           ↓
                                    Route Handler
                                           ↓
                                    Prisma ORM → PostgreSQL
```

## 📚 Tài Liệu Liên Quan

- [README.md](./README.md) - Hướng dẫn cài đặt và chạy dự án
- [docs/guides/](./docs/guides/) - Hướng dẫn sử dụng chi tiết
- [docs/phases/](./docs/phases/) - Tài liệu theo giai đoạn phát triển
- [backend/prisma/README.md](./backend/prisma/README.md) - Database schema

## 🤝 Đóng Góp

Khi thêm tính năng mới:
1. Tạo components trong `/components/[domain]`
2. Thêm API routes trong `/backend/src/routes`
3. Cập nhật types trong `/types`
4. Viết documentation trong `/docs`
5. Update PROJECT-STRUCTURE.md nếu thay đổi architecture

---

**Cập nhật lần cuối**: 24/10/2025
**Phiên bản**: 2.0
