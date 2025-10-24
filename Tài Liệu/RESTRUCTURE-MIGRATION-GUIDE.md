# 🔄 HƯỚNG DẪN MIGRATION CHI TIẾT - Tái cấu trúc dự án

**Ngày tạo:** 02/10/2025  
**Mục đích:** Hướng dẫn từng bước để restructure dự án

---

## 📋 CHUẨN BỊ

### **1. Backup dự án:**

```bash
# Backup toàn bộ dự án
cd "D:\DiskE\SUKIENLTA\LTA PROJECT NEW"
tar -czf "Web-backup-$(date +%Y%m%d).tar.gz" Web/

# Hoặc copy folder
cp -r Web/ Web-backup-20251002/
```

### **2. Create branch mới:**

```bash
cd Web/
git checkout -b feature/restructure
git add .
git commit -m "Backup: Before restructure"
```

### **3. Install dependencies cần thiết:**

```bash
# Nếu dùng PNPM workspace
pnpm add -D @types/node
```

---

## 🎯 PHASE 1: TẠO CẤU TRÚC MỚI

### **Step 1.1: Tạo thư mục apps/**

```bash
# Tạo cấu trúc monorepo
mkdir -p apps/web/src/{features,shared}
mkdir -p apps/backend/src
mkdir -p packages/shared-types
mkdir -p docs
mkdir -p scripts
```

### **Step 1.2: Tạo workspace config**

**File: `pnpm-workspace.yaml`**
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**File: `package.json` (root)**
```json
{
  "name": "i-contexchange-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^1.10.0"
  }
}
```

---

## 🎯 PHASE 2: DI CHUYỂN APP ROUTER

### **Step 2.1: Xóa duplicate auth routes**

```bash
# Xóa app/auth (fallback không cần thiết)
rm -rf app/auth/

# Giữ lại app/[locale]/auth
# (này là route chính với i18n)
```

### **Step 2.2: Tạo Route Groups**

```bash
cd app/[locale]/

# Tạo route groups
mkdir -p "(public)"
mkdir -p "(auth)"
mkdir -p "(dashboard)"
mkdir -p "(buyer)"
mkdir -p "(seller)"
mkdir -p "(depot)"
mkdir -p "(admin)"
```

### **Step 2.3: Di chuyển routes vào groups**

**Public routes:**
```bash
# Di chuyển vào (public)
mv help/ "(public)/"
mv legal/ "(public)/"
mv listings/ "(public)/"  # Browse listings (public)
mv page.tsx "(public)/"    # Home page
```

**Auth routes:**
```bash
# Di chuyển vào (auth)
mv auth/ "(auth)/"
```

**Dashboard routes (authenticated):**
```bash
# Di chuyển vào (dashboard)
mv dashboard/ "(dashboard)/"
mv account/ "(dashboard)/"
mv orders/ "(dashboard)/"
mv payments/ "(dashboard)/"
mv reviews/ "(dashboard)/"
mv disputes/ "(dashboard)/"
mv billing/ "(dashboard)/"
mv subscriptions/ "(dashboard)/"
mv finance/ "(dashboard)/"
```

**Buyer-specific routes:**
```bash
# Di chuyển vào (buyer)
mv rfq/ "(buyer)/"
mv quotes/ "(buyer)/"
mv inspection/ "(buyer)/"
```

**Seller-specific routes:**
```bash
# Di chuyển vào (seller)
mv sell/ "(seller)/"
```

**Depot routes:**
```bash
# Di chuyển vào (depot)
mv depot/ "(depot)/"
mv delivery/ "(depot)/"  # hoặc shared
```

**Admin routes:**
```bash
# Di chuyển vào (admin)
mv admin/ "(admin)/"
```

### **Step 2.4: Tạo layouts cho route groups**

**File: `app/[locale]/(auth)/layout.tsx`**
```tsx
import { AuthLayout } from '@/components/layout/AuthLayout';

export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
```

**File: `app/[locale]/(dashboard)/layout.tsx`**
```tsx
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
```

**File: `app/[locale]/(admin)/layout.tsx`**
```tsx
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
```

---

## 🎯 PHASE 3: TỔ CHỨC SHARED CODE

### **Step 3.1: Di chuyển Components**

```bash
# Tạo cấu trúc shared components
mkdir -p src/shared/components/{ui,layout,data-display,forms,feedback}

# Di chuyển UI components
mv components/ui/* src/shared/components/ui/

# Di chuyển Layout components
mv components/layout/* src/shared/components/layout/

# Phân loại components khác
# - DataTable, StatusBadge → data-display/
# - Forms → forms/
# - Toast, Loading → feedback/
```

### **Step 3.2: Di chuyển Hooks**

```bash
# Tạo shared hooks
mkdir -p src/shared/hooks

# Di chuyển hooks
mv hooks/* src/shared/hooks/

# Xóa duplicate
rm src/shared/components/ui/use-toast.ts  # Đã có trong hooks
```

### **Step 3.3: Di chuyển Utils & Lib**

```bash
# Tạo cấu trúc
mkdir -p src/shared/{utils,lib,types,constants}

# Di chuyển lib
mv lib/* src/shared/lib/

# Tổ chức lib
mkdir -p src/shared/lib/{api,auth,i18n,validations}
# Sau đó phân loại files vào đúng folders
```

### **Step 3.4: Tổ chức Types**

```bash
# Tạo centralized types
mkdir -p src/shared/types

# Extract types từ các files
# Tạo các files:
# - user.types.ts
# - listing.types.ts
# - order.types.ts
# - common.types.ts
# - api.types.ts
```

### **Step 3.5: Tổ chức Constants**

```bash
# Tạo constants
mkdir -p src/shared/constants

# Tạo files:
# - roles.ts (from RBAC)
# - permissions.ts
# - routes.ts
# - config.ts
```

---

## 🎯 PHASE 4: TẠO FEATURE MODULES

### **Step 4.1: Auth Feature**

```bash
# Tạo cấu trúc
mkdir -p src/features/auth/{components,hooks,services,types,utils}

# Di chuyển auth components từ app/[locale]/(auth)/
# Tạo các files:
# - components/LoginForm.tsx
# - components/RegisterForm.tsx
# - components/ForgotPasswordForm.tsx
# - hooks/useAuth.ts
# - hooks/useSession.ts
# - services/authService.ts
# - types/auth.types.ts
```

**File: `src/features/auth/components/LoginForm.tsx`**
```tsx
'use client';

import { useAuth } from '../hooks/useAuth';
import { Button } from '@/ui/button';
// ... rest of component
```

### **Step 4.2: Listings Feature**

```bash
mkdir -p src/features/listings/{components,hooks,services,types}

# Tạo components:
# - ListingCard.tsx
# - ListingDetail.tsx
# - ListingForm.tsx
# - ListingFilters.tsx
# - ListingGallery.tsx
```

**File: `src/features/listings/components/ListingCard.tsx`**
```tsx
'use client';

import { Card } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Listing } from '../types/listing.types';

export function ListingCard({ listing }: { listing: Listing }) {
  // Component logic
}
```

### **Step 4.3: RFQ Feature**

```bash
mkdir -p src/features/rfq/{components,hooks,services,types}

# Components:
# - RFQList.tsx
# - RFQForm.tsx
# - RFQDetail.tsx
# - RFQFilters.tsx
```

### **Step 4.4: Admin Feature**

```bash
mkdir -p src/features/admin/{components,hooks,services,types}
mkdir -p src/features/admin/components/{UserManagement,KYCApproval,ListingModeration,Analytics,Settings}

# Settings components (SCR-905):
mkdir -p src/features/admin/components/Settings/{PricingRules,FeatureFlags,TaxesFees,Policies,Templates,i18n,Forms,SLA,Integrations,PaymentMethods,Partners,Advanced}
```

**File: `src/features/admin/components/Settings/index.tsx`**
```tsx
import { Tabs } from '@/ui/tabs';
import { PricingRules } from './PricingRules';
import { FeatureFlags } from './FeatureFlags';
// ... other tabs

export function AdminSettings() {
  return (
    <Tabs defaultValue="pricing">
      <Tabs.List>
        <Tabs.Trigger value="pricing">Pricing Rules</Tabs.Trigger>
        <Tabs.Trigger value="flags">Feature Flags</Tabs.Trigger>
        {/* ... 10 more tabs */}
      </Tabs.List>
      {/* Tab contents */}
    </Tabs>
  );
}
```

### **Step 4.5: Repeat for other features**

```bash
# Tạo tương tự cho:
- quotes
- orders
- payments
- inspection
- delivery
- depot
- reviews
- disputes
```

---

## 🎯 PHASE 5: CẬP NHẬT PATH ALIASES

### **Step 5.1: Update tsconfig.json**

**File: `tsconfig.json`**
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
      "@/layout/*": ["./src/shared/components/layout/*"],
      "@/hooks/*": ["./src/shared/hooks/*"],
      "@/utils/*": ["./src/shared/utils/*"],
      "@/lib/*": ["./src/shared/lib/*"],
      "@/types/*": ["./src/shared/types/*"],
      "@/constants/*": ["./src/shared/constants/*"],
      "@/api/*": ["./src/shared/lib/api/*"],
      "@/auth/*": ["./src/shared/lib/auth/*"],
      "@/styles/*": ["./src/styles/*"]
    }
  }
}
```

### **Step 5.2: Update imports**

**Search & Replace in project:**

```bash
# Example replacements:
@/components/ui → @/ui
@/lib/utils → @/utils
@/lib/api → @/api
@/components/layout → @/layout
```

**Use VS Code:**
1. Ctrl+Shift+H (Find & Replace in files)
2. Replace patterns:
   - `from '@/components/ui` → `from '@/ui`
   - `from '@/lib/utils'` → `from '@/utils`
   - etc.

---

## 🎯 PHASE 6: BACKEND SEPARATION

### **Step 6.1: Di chuyển backend**

```bash
# Di chuyển toàn bộ backend folder
mv backend/ apps/backend/

# Cleanup duplicate schemas
cd apps/backend/prisma/
# Giữ lại schema.prisma
rm schema-*.prisma  # Xóa backups
```

### **Step 6.2: Update backend imports**

```bash
# Update paths trong backend nếu cần
# Usually backend is independent, minimal changes
```

---

## 🎯 PHASE 7: DOCUMENTATION & CLEANUP

### **Step 7.1: Di chuyển docs**

```bash
# Di chuyển tất cả MD files
mkdir -p docs/{screens,reports,architecture}
mv "Tài Liệu/"*.md docs/screens/
mv *.md docs/  # Di chuyển root MD files
```

### **Step 7.2: Cleanup test folders**

```bash
# Xóa test folders rải rác
rm -rf app/[locale]/nav-test/
rm -rf app/[locale]/test-nav/
rm -rf app/[locale]/test-navigation/

# Tạo test structure mới
mkdir -p tests/{unit,integration,e2e}
```

### **Step 7.3: Cleanup root**

```bash
# Di chuyển scripts
mkdir -p scripts/
mv *.bat scripts/
mv *.sh scripts/
mv *.ps1 scripts/

# Cleanup CSS
rm app/globals.css  # Duplicate
# Giữ src/styles/globals.css
```

---

## 🎯 PHASE 8: UPDATE CONFIGS

### **Step 8.1: Update next.config.mjs**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config
  
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      // ... other aliases
    };
    return config;
  },
};
```

### **Step 8.2: Update middleware.ts**

```typescript
// Update imports
import { ROUTES } from '@/constants/routes';
import { PERMISSIONS } from '@/constants/permissions';
import { checkPermission } from '@/auth/rbac';
```

---

## 🎯 PHASE 9: TESTING

### **Step 9.1: Fix import errors**

```bash
# Run TypeScript check
pnpm tsc --noEmit

# Fix all import errors
# Usually: update import paths to new aliases
```

### **Step 9.2: Run dev server**

```bash
# Test frontend
cd apps/web/
pnpm dev

# Test backend
cd apps/backend/
pnpm dev
```

### **Step 9.3: Test features**

Test từng feature:
- ✅ Authentication works
- ✅ Listings load correctly
- ✅ RFQ system works
- ✅ Admin pages load
- ✅ All routes accessible
- ✅ No console errors

---

## 📋 QUICK COMMANDS

### **Mass file operations:**

```bash
# Find all imports to update
grep -r "from '@/components/ui" src/

# Count files in a directory
find src/features -name "*.tsx" | wc -l

# Find all TODO comments
grep -r "TODO:" src/
```

### **Git operations:**

```bash
# Commit progress
git add .
git commit -m "Phase X: [description]"

# Create checkpoint
git tag checkpoint-phase-X

# Rollback if needed
git reset --hard checkpoint-phase-X
```

---

## ⚠️ COMMON ISSUES & SOLUTIONS

### **Issue 1: Import paths not working**

```
Error: Module not found: Can't resolve '@/ui/button'
```

**Solution:**
- Check tsconfig.json paths
- Restart TypeScript server (VS Code: Ctrl+Shift+P → "Restart TS Server")
- Clear Next.js cache: `rm -rf .next/`

### **Issue 2: Route groups not working**

```
Error: Page not found
```

**Solution:**
- Check layout.tsx exists in route group
- Ensure page.tsx exists
- Check middleware isn't blocking route

### **Issue 3: Circular dependencies**

```
Error: Circular dependency detected
```

**Solution:**
- Move shared types to separate file
- Use dynamic imports
- Restructure imports

---

## ✅ VERIFICATION CHECKLIST

After migration, verify:

- [ ] All pages load without errors
- [ ] Authentication works (login, register, logout)
- [ ] RBAC works (different views for different roles)
- [ ] API calls work
- [ ] Forms submit correctly
- [ ] Images load
- [ ] Styles applied correctly
- [ ] Dark/Light mode works
- [ ] i18n works (switch languages)
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build succeeds (`pnpm build`)
- [ ] Tests pass (if any)

---

## 🎯 ROLLBACK PLAN

If things go wrong:

### **Quick rollback:**
```bash
git reset --hard HEAD~1
```

### **Full rollback:**
```bash
git checkout main
git branch -D feature/restructure
# Restore from backup
```

### **Partial rollback:**
```bash
git revert [commit-hash]
```

---

## 📞 NEED HELP?

**Common questions:**
1. Q: Can I do this incrementally?
   A: Yes! Start with shared components, then features one by one.

2. Q: Will this break existing features?
   A: Not if done correctly with proper testing.

3. Q: How long will this take?
   A: 2-3 weeks for one developer, 1 week for a team.

**Resources:**
- Next.js Route Groups: https://nextjs.org/docs/app/building-your-application/routing/route-groups
- Clean Architecture: https://blog.cleancoder.com/
- Feature-Sliced Design: https://feature-sliced.design/

---

**© 2025 i-ContExchange Vietnam. All rights reserved.**  
**Last Updated:** 02/10/2025

