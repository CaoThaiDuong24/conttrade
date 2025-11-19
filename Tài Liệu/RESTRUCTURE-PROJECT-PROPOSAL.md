# 🏗️ ĐỀ XUẤT TÁI CẤU TRÚC DỰ ÁN i-ContExchange

**Ngày tạo:** 02/10/2025  
**Phiên bản:** v1.0  
**Mục đích:** Tái cấu trúc dự án theo Clean Architecture & Best Practices

---

## 📊 PHÂN TÍCH CẤU TRÚC HIỆN TẠI

### ⚠️ **Vấn đề hiện tại:**

1. **🔴 Duplicate & Redundancy**
   - ❌ `app/auth` và `app/[locale]/auth` trùng lặp
   - ❌ Nhiều schema Prisma: `schema.prisma`, `schema-backup.prisma`, `schema-complete.prisma`, etc.
   - ❌ Test folders rải rác: `nav-test/`, `test-nav/`, `test-navigation/`
   - ❌ Multiple start scripts: `start.bat`, `start_backend.bat`, `start_backend_fixed.*`

2. **🟡 Cấu trúc không nhất quán**
   - ❌ Backend và frontend cùng workspace (monorepo không được quản lý)
   - ❌ Components không nhóm theo feature/domain
   - ❌ Lib/API không có tổ chức rõ ràng
   - ❌ Thiếu services layer cho business logic
   - ❌ Documentation files rải rác ở root

3. **🟢 Thiếu tổ chức theo domain**
   - ❌ Không có feature modules rõ ràng
   - ❌ Shared components không tách biệt với feature components
   - ❌ Utils và helpers lẫn lộn
   - ❌ Types không được centralized

4. **⚪ Vấn đề khác**
   - ❌ CSS files ở nhiều nơi: `app/globals.css`, `styles/globals.css`, `styles/navigation.css`
   - ❌ Hooks trùng lặp: `hooks/use-toast.ts` và `components/ui/use-toast.ts`
   - ❌ Thiếu environment config rõ ràng
   - ❌ Thiếu testing structure

---

## 🎯 CẤU TRÚC MỚI ĐỀ XUẤT

### **Nguyên tắc thiết kế:**

1. ✅ **Clean Architecture:** Tách biệt layers (UI, Business Logic, Data)
2. ✅ **Feature-based:** Tổ chức theo domain/feature
3. ✅ **DRY (Don't Repeat Yourself):** Loại bỏ duplicate
4. ✅ **Separation of Concerns:** Mỗi thư mục có trách nhiệm rõ ràng
5. ✅ **Scalability:** Dễ mở rộng khi thêm features
6. ✅ **Testability:** Dễ test từng phần

---

## 📁 CẤU TRÚC MỚI CHI TIẾT

```
i-ContExchange/
├── 📱 apps/                              # Monorepo - Applications
│   ├── web/                              # Frontend Next.js App
│   │   ├── app/                          # Next.js App Router
│   │   │   ├── [locale]/                # i18n routes
│   │   │   │   ├── (public)/            # Public route group (no auth)
│   │   │   │   │   ├── page.tsx         # Home
│   │   │   │   │   ├── help/
│   │   │   │   │   ├── legal/
│   │   │   │   │   └── listings/        # Public browsing
│   │   │   │   │
│   │   │   │   ├── (auth)/              # Auth route group
│   │   │   │   │   ├── layout.tsx       # Auth layout
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── register/
│   │   │   │   │   ├── forgot/
│   │   │   │   │   └── reset/
│   │   │   │   │
│   │   │   │   ├── (dashboard)/         # Dashboard route group (authenticated)
│   │   │   │   │   ├── layout.tsx       # Dashboard layout with sidebar
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── account/
│   │   │   │   │   ├── orders/
│   │   │   │   │   ├── payments/
│   │   │   │   │   └── ... [other features]
│   │   │   │   │
│   │   │   │   ├── (buyer)/             # Buyer-specific routes
│   │   │   │   │   ├── rfq/
│   │   │   │   │   ├── quotes/
│   │   │   │   │   └── inspection/
│   │   │   │   │
│   │   │   │   ├── (seller)/            # Seller-specific routes
│   │   │   │   │   ├── sell/
│   │   │   │   │   ├── quotes/
│   │   │   │   │   └── analytics/
│   │   │   │   │
│   │   │   │   ├── (depot)/             # Depot-specific routes
│   │   │   │   │   ├── depot/
│   │   │   │   │   ├── stock/
│   │   │   │   │   └── inspections/
│   │   │   │   │
│   │   │   │   └── (admin)/             # Admin routes
│   │   │   │       ├── layout.tsx       # Admin layout
│   │   │   │       └── admin/
│   │   │   │           ├── users/
│   │   │   │           ├── listings/
│   │   │   │           ├── disputes/
│   │   │   │           ├── config/
│   │   │   │           ├── analytics/
│   │   │   │           └── settings/   # SCR-905
│   │   │   │
│   │   │   ├── api/                     # API Routes
│   │   │   │   ├── auth/
│   │   │   │   ├── listings/
│   │   │   │   ├── orders/
│   │   │   │   ├── payments/
│   │   │   │   └── webhooks/
│   │   │   │
│   │   │   ├── layout.tsx               # Root layout
│   │   │   ├── globals.css              # Global styles
│   │   │   └── error.tsx                # Global error handler
│   │   │
│   │   ├── src/                         # Source code
│   │   │   ├── features/                # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   │   ├── components/      # Feature-specific components
│   │   │   │   │   │   ├── LoginForm.tsx
│   │   │   │   │   │   ├── RegisterForm.tsx
│   │   │   │   │   │   └── ForgotPasswordForm.tsx
│   │   │   │   │   ├── hooks/           # Feature-specific hooks
│   │   │   │   │   │   ├── useAuth.ts
│   │   │   │   │   │   └── useSession.ts
│   │   │   │   │   ├── services/        # Business logic
│   │   │   │   │   │   ├── authService.ts
│   │   │   │   │   │   └── sessionService.ts
│   │   │   │   │   ├── types/           # Feature types
│   │   │   │   │   │   └── auth.types.ts
│   │   │   │   │   ├── utils/           # Feature utilities
│   │   │   │   │   └── constants.ts     # Feature constants
│   │   │   │   │
│   │   │   │   ├── listings/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── ListingCard.tsx
│   │   │   │   │   │   ├── ListingDetail.tsx
│   │   │   │   │   │   ├── ListingForm.tsx
│   │   │   │   │   │   └── ListingFilters.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   ├── services/
│   │   │   │   │   └── types/
│   │   │   │   │
│   │   │   │   ├── rfq/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── hooks/
│   │   │   │   │   ├── services/
│   │   │   │   │   └── types/
│   │   │   │   │
│   │   │   │   ├── quotes/
│   │   │   │   ├── orders/
│   │   │   │   ├── payments/
│   │   │   │   ├── inspection/
│   │   │   │   ├── delivery/
│   │   │   │   ├── depot/
│   │   │   │   ├── reviews/
│   │   │   │   ├── disputes/
│   │   │   │   └── admin/
│   │   │   │       ├── components/
│   │   │   │       │   ├── UserManagement/
│   │   │   │       │   ├── KYCApproval/
│   │   │   │       │   ├── ListingModeration/
│   │   │   │       │   ├── DisputeResolution/
│   │   │   │       │   ├── Analytics/
│   │   │   │       │   └── Settings/    # SCR-905 components
│   │   │   │       ├── services/
│   │   │   │       └── types/
│   │   │   │
│   │   │   ├── shared/                  # Shared/Common code
│   │   │   │   ├── components/          # Shared components
│   │   │   │   │   ├── ui/              # Shadcn UI components
│   │   │   │   │   │   ├── button.tsx
│   │   │   │   │   │   ├── card.tsx
│   │   │   │   │   │   ├── dialog.tsx
│   │   │   │   │   │   └── ... [all shadcn components]
│   │   │   │   │   │
│   │   │   │   │   ├── layout/          # Layout components
│   │   │   │   │   │   ├── AppHeader.tsx
│   │   │   │   │   │   ├── AppFooter.tsx
│   │   │   │   │   │   ├── DashboardSidebar.tsx
│   │   │   │   │   │   └── AdminSidebar.tsx
│   │   │   │   │   │
│   │   │   │   │   ├── data-display/    # Data display components
│   │   │   │   │   │   ├── DataTable.tsx
│   │   │   │   │   │   ├── StatusBadge.tsx
│   │   │   │   │   │   ├── Timeline.tsx
│   │   │   │   │   │   └── EmptyState.tsx
│   │   │   │   │   │
│   │   │   │   │   ├── forms/           # Form components
│   │   │   │   │   │   ├── FormField.tsx
│   │   │   │   │   │   ├── FormSelect.tsx
│   │   │   │   │   │   ├── FormDatePicker.tsx
│   │   │   │   │   │   └── MultiStepForm.tsx
│   │   │   │   │   │
│   │   │   │   │   └── feedback/        # Feedback components
│   │   │   │   │       ├── Toast.tsx
│   │   │   │   │       ├── Loading.tsx
│   │   │   │   │       ├── ErrorBoundary.tsx
│   │   │   │   │       └── Notification.tsx
│   │   │   │   │
│   │   │   │   ├── hooks/               # Shared hooks
│   │   │   │   │   ├── useDebounce.ts
│   │   │   │   │   ├── useLocalStorage.ts
│   │   │   │   │   ├── useMediaQuery.ts
│   │   │   │   │   ├── usePagination.ts
│   │   │   │   │   └── useToast.ts
│   │   │   │   │
│   │   │   │   ├── utils/               # Utility functions
│   │   │   │   │   ├── cn.ts            # Class name utility
│   │   │   │   │   ├── format.ts        # Formatters
│   │   │   │   │   ├── validation.ts    # Validators
│   │   │   │   │   ├── date.ts          # Date utilities
│   │   │   │   │   └── currency.ts      # Currency utilities
│   │   │   │   │
│   │   │   │   ├── lib/                 # Libraries & configs
│   │   │   │   │   ├── api/             # API client
│   │   │   │   │   │   ├── client.ts
│   │   │   │   │   │   ├── interceptors.ts
│   │   │   │   │   │   └── endpoints.ts
│   │   │   │   │   │
│   │   │   │   │   ├── auth/            # Auth utilities
│   │   │   │   │   │   ├── rbac.ts
│   │   │   │   │   │   ├── permissions.ts
│   │   │   │   │   │   └── session.ts
│   │   │   │   │   │
│   │   │   │   │   ├── i18n/            # Internationalization
│   │   │   │   │   │   ├── config.ts
│   │   │   │   │   │   ├── routing.ts
│   │   │   │   │   │   └── request.ts
│   │   │   │   │   │
│   │   │   │   │   └── validations/     # Validation schemas
│   │   │   │   │       ├── auth.schema.ts
│   │   │   │   │       ├── listing.schema.ts
│   │   │   │   │       └── order.schema.ts
│   │   │   │   │
│   │   │   │   ├── types/               # Shared types
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── user.types.ts
│   │   │   │   │   ├── common.types.ts
│   │   │   │   │   └── api.types.ts
│   │   │   │   │
│   │   │   │   ├── constants/           # Constants
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── roles.ts
│   │   │   │   │   ├── permissions.ts
│   │   │   │   │   ├── routes.ts
│   │   │   │   │   └── config.ts
│   │   │   │   │
│   │   │   │   ├── contexts/            # React contexts
│   │   │   │   │   ├── AuthContext.tsx
│   │   │   │   │   ├── ThemeContext.tsx
│   │   │   │   │   └── NotificationContext.tsx
│   │   │   │   │
│   │   │   │   └── providers/           # React providers
│   │   │   │       ├── AppProviders.tsx
│   │   │   │       ├── AuthProvider.tsx
│   │   │   │       └── ThemeProvider.tsx
│   │   │   │
│   │   │   └── styles/                  # Centralized styles
│   │   │       ├── globals.css
│   │   │       ├── themes/
│   │   │       │   ├── light.css
│   │   │       │   └── dark.css
│   │   │       └── utilities.css
│   │   │
│   │   ├── public/                      # Static assets
│   │   │   ├── images/
│   │   │   │   ├── logo.svg
│   │   │   │   ├── placeholder.jpg
│   │   │   │   └── icons/
│   │   │   ├── fonts/
│   │   │   └── locales/
│   │   │       ├── en/
│   │   │       │   └── common.json
│   │   │       └── vi/
│   │   │           └── common.json
│   │   │
│   │   ├── tests/                       # Test files
│   │   │   ├── unit/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── utils/
│   │   │   ├── integration/
│   │   │   │   ├── api/
│   │   │   │   └── features/
│   │   │   ├── e2e/
│   │   │   │   ├── auth.spec.ts
│   │   │   │   ├── listings.spec.ts
│   │   │   │   └── orders.spec.ts
│   │   │   ├── setup.ts
│   │   │   └── helpers/
│   │   │
│   │   ├── .env.local                   # Environment variables
│   │   ├── .env.development
│   │   ├── .env.production
│   │   ├── next.config.mjs
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.mjs
│   │   ├── components.json
│   │   └── README.md
│   │
│   └── backend/                         # Backend API (separate app)
│       ├── src/
│       │   ├── modules/                 # Feature modules
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── listings/
│       │   │   ├── orders/
│       │   │   └── payments/
│       │   │
│       │   ├── shared/                  # Shared backend code
│       │   │   ├── middleware/
│       │   │   ├── guards/
│       │   │   ├── decorators/
│       │   │   └── filters/
│       │   │
│       │   ├── database/                # Database
│       │   │   ├── prisma/
│       │   │   │   ├── schema.prisma
│       │   │   │   ├── seed.ts
│       │   │   │   └── migrations/
│       │   │   └── seeders/
│       │   │
│       │   └── config/                  # Configuration
│       │       ├── app.config.ts
│       │       ├── database.config.ts
│       │       └── auth.config.ts
│       │
│       ├── tests/
│       ├── .env
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── 📦 packages/                         # Shared packages (optional)
│   ├── shared-types/                    # Shared TypeScript types
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui-components/                   # Shared UI components (if needed)
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── utils/                           # Shared utilities
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
│
├── 📚 docs/                             # Documentation
│   ├── api/                             # API documentation
│   ├── architecture/                    # Architecture docs
│   ├── development/                     # Development guides
│   │   ├── setup.md
│   │   ├── coding-standards.md
│   │   └── workflows.md
│   ├── deployment/                      # Deployment guides
│   └── screens/                         # Screen specifications
│       └── ... [all current MD files]
│
├── 📜 scripts/                          # Build & deployment scripts
│   ├── build.sh
│   ├── deploy.sh
│   ├── test.sh
│   ├── seed-database.ts
│   └── migration.ts
│
├── 🔧 .github/                          # GitHub configs
│   ├── workflows/                       # CI/CD workflows
│   │   ├── ci.yml
│   │   ├── deploy.yml
│   │   └── test.yml
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── package.json                         # Root package.json (workspace)
├── pnpm-workspace.yaml                  # PNPM workspace config
├── turbo.json                           # Turborepo config (optional)
└── README.md                            # Main README
```

---

## 📋 SO SÁNH CẤU TRÚC

### **Trước (Current):**

```
❌ Vấn đề:
- Duplicate: app/auth và app/[locale]/auth
- Mixed concerns: Backend + Frontend cùng folder
- No feature organization
- Components scattered
- Multiple schema files
- Test folders not organized
- Docs at root level
```

### **Sau (Proposed):**

```
✅ Cải thiện:
- Monorepo structure với apps/ và packages/
- Route groups: (public), (auth), (dashboard), (admin)
- Feature-based organization trong src/features/
- Shared code rõ ràng trong src/shared/
- Single source of truth cho schema
- Organized test structure
- Centralized documentation
```

---

## 🔄 MIGRATION PLAN

### **Phase 1: Preparation (1 ngày)**

1. ✅ Backup toàn bộ dự án
2. ✅ Create new branch: `feature/restructure`
3. ✅ Tạo cấu trúc thư mục mới
4. ✅ Setup workspace configuration

### **Phase 2: Move Core Files (2-3 ngày)**

1. **App Router:**
   - Di chuyển `app/` sang cấu trúc mới với route groups
   - Xóa duplicate `app/auth` (giữ `app/[locale]/auth`)
   - Tạo route groups: `(public)`, `(auth)`, `(dashboard)`, `(admin)`

2. **Components:**
   - Di chuyển UI components sang `src/shared/components/ui/`
   - Di chuyển layout components sang `src/shared/components/layout/`
   - Tạo feature components trong `src/features/[feature]/components/`

3. **Lib & Utils:**
   - Tổ chức lại `lib/` thành `src/shared/lib/`
   - Tách API clients theo feature
   - Centralize types, constants, utils

### **Phase 3: Feature Modules (3-4 ngày)**

Tạo feature modules cho từng domain:

1. **Auth Module:**
   ```
   src/features/auth/
   ├── components/
   ├── hooks/
   ├── services/
   ├── types/
   └── utils/
   ```

2. **Listings Module:**
   ```
   src/features/listings/
   ├── components/
   │   ├── ListingCard.tsx
   │   ├── ListingDetail.tsx
   │   ├── ListingForm.tsx
   │   └── ListingFilters.tsx
   ├── hooks/
   ├── services/
   └── types/
   ```

3. **Repeat for:** RFQ, Quotes, Orders, Payments, Inspection, Delivery, Depot, Reviews, Disputes, Admin

### **Phase 4: Backend Separation (2 ngày)**

1. Move `backend/` to `apps/backend/`
2. Cleanup duplicate schema files
3. Organize backend modules
4. Update import paths

### **Phase 5: Testing & Documentation (2 ngày)**

1. Setup test structure
2. Update documentation
3. Move docs to `docs/`
4. Update README files

### **Phase 6: Configuration & Scripts (1 ngày)**

1. Setup workspace configuration (pnpm/yarn workspaces)
2. Update build scripts
3. Update deployment scripts
4. Configure path aliases

### **Phase 7: Testing & Validation (2-3 ngày)**

1. Test all features
2. Fix import paths
3. Run linters
4. Fix any issues
5. Performance testing

---

## 📝 IMPLEMENTATION CHECKLIST

### **Preparation:**
- [ ] Backup dự án
- [ ] Create restructure branch
- [ ] Document current import paths
- [ ] Setup new folder structure

### **Core Migration:**
- [ ] Move app/ to new route groups structure
- [ ] Remove duplicate auth routes
- [ ] Move components to src/shared/components/
- [ ] Move lib to src/shared/lib/
- [ ] Move hooks to src/shared/hooks/
- [ ] Move utils to src/shared/utils/

### **Feature Modules:**
- [ ] Create auth feature module
- [ ] Create listings feature module
- [ ] Create rfq feature module
- [ ] Create quotes feature module
- [ ] Create orders feature module
- [ ] Create payments feature module
- [ ] Create inspection feature module
- [ ] Create delivery feature module
- [ ] Create depot feature module
- [ ] Create reviews feature module
- [ ] Create disputes feature module
- [ ] Create admin feature module

### **Backend:**
- [ ] Move backend to apps/backend/
- [ ] Cleanup duplicate schemas
- [ ] Organize backend modules
- [ ] Update database config

### **Configuration:**
- [ ] Setup path aliases in tsconfig.json
- [ ] Update next.config.mjs
- [ ] Setup workspace (pnpm-workspace.yaml)
- [ ] Update package.json scripts
- [ ] Configure ESLint
- [ ] Configure Prettier

### **Testing:**
- [ ] Setup test structure
- [ ] Create test helpers
- [ ] Write example tests
- [ ] Test all routes
- [ ] Test all features

### **Documentation:**
- [ ] Move docs to docs/
- [ ] Update README.md
- [ ] Create ARCHITECTURE.md
- [ ] Create DEVELOPMENT.md
- [ ] Update API docs

### **Final Steps:**
- [ ] Run full test suite
- [ ] Fix all linting errors
- [ ] Performance audit
- [ ] Code review
- [ ] Merge to main

---

## 🎯 PATH ALIASES CONFIGURATION

### **tsconfig.json:**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/components/*": ["./src/shared/components/*"],
      "@/ui/*": ["./src/shared/components/ui/*"],
      "@/hooks/*": ["./src/shared/hooks/*"],
      "@/utils/*": ["./src/shared/utils/*"],
      "@/lib/*": ["./src/shared/lib/*"],
      "@/types/*": ["./src/shared/types/*"],
      "@/constants/*": ["./src/shared/constants/*"],
      "@/api/*": ["./src/shared/lib/api/*"],
      "@/styles/*": ["./src/styles/*"]
    }
  }
}
```

### **Import Examples:**

```typescript
// Before
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/client-rbac-service';
import { formatCurrency } from '@/lib/utils';

// After
import { Button } from '@/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatCurrency } from '@/utils/format';
```

---

## 💡 BENEFITS (Lợi ích)

### **1. Clean Architecture ✅**
- Tách biệt rõ ràng giữa UI, Business Logic, và Data
- Dễ test từng layer độc lập
- Giảm coupling giữa các modules

### **2. Maintainability ✅**
- Dễ tìm code theo feature
- Dễ onboard developers mới
- Rõ ràng trách nhiệm từng thư mục

### **3. Scalability ✅**
- Dễ thêm features mới
- Có thể extract features thành packages
- Support monorepo architecture

### **4. Developer Experience ✅**
- Autocomplete tốt hơn với path aliases
- Import paths ngắn gọn hơn
- Hot reload nhanh hơn (less files to watch)

### **5. Performance ✅**
- Code splitting tốt hơn
- Lazy loading dễ dàng hơn
- Build time optimization

### **6. Collaboration ✅**
- Ít conflict khi nhiều dev cùng làm
- Dễ code review
- Clear ownership per feature

---

## ⚠️ RISKS & MITIGATION

### **Risk 1: Breaking Changes**
**Mitigation:**
- Làm trên branch riêng
- Test kỹ trước khi merge
- Có rollback plan

### **Risk 2: Time Consuming**
**Mitigation:**
- Chia nhỏ tasks
- Làm từng feature một
- Có thể làm dần, không cần 1 lần

### **Risk 3: Import Path Errors**
**Mitigation:**
- Setup path aliases trước
- Use ESLint auto-fix
- Search & replace tool

### **Risk 4: Team Learning Curve**
**Mitigation:**
- Documentation đầy đủ
- Training session
- Pair programming

---

## 📊 ESTIMATED TIMELINE

| Phase | Tasks | Duration | Dependencies |
|-------|-------|----------|--------------|
| Phase 1 | Preparation | 1 day | None |
| Phase 2 | Move Core Files | 2-3 days | Phase 1 |
| Phase 3 | Feature Modules | 3-4 days | Phase 2 |
| Phase 4 | Backend Separation | 2 days | Phase 2 |
| Phase 5 | Testing & Docs | 2 days | Phase 3, 4 |
| Phase 6 | Config & Scripts | 1 day | Phase 5 |
| Phase 7 | Testing & Validation | 2-3 days | All phases |
| **TOTAL** | | **13-16 days** | |

**Timeline cho 1 developer full-time:**
- **Optimistic:** 2 tuần
- **Realistic:** 3 tuần
- **Pessimistic:** 4 tuần

**Timeline cho team 2-3 developers:**
- **Optimistic:** 1 tuần
- **Realistic:** 1.5 tuần
- **Pessimistic:** 2 tuần

---

## 🚀 QUICK START (After Restructure)

### **Development:**

```bash
# Install dependencies
pnpm install

# Run frontend dev server
cd apps/web
pnpm dev

# Run backend dev server
cd apps/backend
pnpm dev

# Run both (from root)
pnpm dev

# Run tests
pnpm test

# Build all apps
pnpm build
```

### **Project Structure Tour:**

```bash
# Want to add a new feature?
→ Create folder in src/features/[feature-name]/

# Need a shared component?
→ Add to src/shared/components/

# Need a utility function?
→ Add to src/shared/utils/

# Need to add API endpoint?
→ Add to app/api/[endpoint]/

# Need to add a new page?
→ Add to app/[locale]/(route-group)/[page]/
```

---

## 📞 SUPPORT & QUESTIONS

If you have questions during restructure:
1. Check this document
2. Check ARCHITECTURE.md (will be created)
3. Ask team lead
4. Create GitHub discussion

---

## ✅ RECOMMENDATION

**Should we do this restructure?**

**✅ YES - Highly Recommended**

**Reasons:**
1. Current structure has serious organization issues
2. Will be harder to refactor later as codebase grows
3. Benefits outweigh the effort (13-16 days investment)
4. Team is still small - easier to align
5. MVP at 70% - good time before production

**When to do it:**
- **Best time:** Now (before completing MVP)
- **Good time:** After MVP, before production
- **Too late:** After production with active users

**Suggested approach:**
1. Do it incrementally (can work on features while restructuring)
2. Prioritize core structure first
3. Can delay some features migration
4. Use feature flags to test new structure

---

**© 2025 i-ContExchange Vietnam. All rights reserved.**  
**Document Version:** v1.0  
**Last Updated:** 02/10/2025

