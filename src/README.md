# Source Code Structure

Cấu trúc code mới theo Clean Architecture & Feature-based organization.

## 📁 Cấu trúc

```
src/
├── features/           # Feature modules (domain-specific)
│   ├── auth/          # Authentication & Authorization
│   ├── listings/      # Container listings
│   ├── rfq/           # Request for Quote
│   ├── admin/         # Admin features
│   └── ...
│
└── shared/            # Shared/reusable code
    ├── components/    # Shared components
    │   ├── ui/        # UI primitives (Button, Card, etc.)
    │   ├── layout/    # Layout components (Header, Sidebar)
    │   ├── data-display/  # Data display (Table, Badge)
    │   ├── forms/     # Form components
    │   └── feedback/  # Feedback (Toast, Loading)
    │
    ├── hooks/         # Shared hooks
    ├── utils/         # Utility functions
    ├── lib/           # Libraries & configurations
    │   ├── api/       # API client
    │   ├── auth/      # Auth utilities (RBAC, permissions)
    │   ├── i18n/      # Internationalization
    │   └── validations/  # Validation schemas
    │
    ├── types/         # Shared TypeScript types
    ├── constants/     # Constants (roles, permissions, routes)
    ├── contexts/      # React contexts
    └── providers/     # React providers
```

## 🎯 Import Paths

Với path aliases đã setup trong `tsconfig.json`:

```typescript
// UI Components
import { Button, Card } from '@/ui';

// Layout Components
import { DashboardSidebar } from '@/layout/DashboardSidebar';

// Hooks
import { useToast, useMobile } from '@/hooks';

// Utils
import { cn, formatCurrency } from '@/utils';

// API
import { apiClient } from '@/api';

// Auth & RBAC (CRITICAL)
import { checkPermission, ROLES, PERMISSIONS } from '@/auth';
import { hasPermission } from '@/auth/rbac';

// Constants
import { ROUTES, ROLES, PERMISSIONS } from '@/constants';

// Feature-specific
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useAuth } from '@/features/auth/hooks/useAuth';
```

## 📦 Feature Module Structure

Mỗi feature có cấu trúc tương tự:

```
features/[feature-name]/
├── components/        # Feature-specific components
├── hooks/            # Feature-specific hooks
├── services/         # Business logic
├── types/            # Feature types
├── utils/            # Feature utilities
├── constants.ts      # Feature constants
└── index.ts          # Barrel export
```

## 🔒 RBAC & Menu Navigation

**QUAN TRỌNG:** Hệ thống RBAC và menu navigation được giữ nguyên 100%

- **Roles:** Defined in `src/shared/constants/roles.ts`
- **Permissions:** Defined in `src/shared/constants/permissions.ts`
- **Role-Permission Mapping:** In `permissions.ts` → `ROLE_PERMISSIONS`
- **Navigation Service:** `src/shared/lib/auth/navigation-service.ts`
- **RBAC Service:** `src/shared/lib/auth/rbac-service.ts`

### Menu vẫn hoạt động theo roles:

```typescript
// Admin sees all menu items
// Buyer sees buyer-specific menu
// Seller sees seller-specific menu
// etc.
```

## 🚀 Usage Examples

### Creating a new feature:

```bash
mkdir -p src/features/new-feature/{components,hooks,services,types}
```

### Creating a new shared component:

```typescript
// src/shared/components/data-display/StatusBadge.tsx
export function StatusBadge({ status }: { status: string }) {
  return <Badge variant="default">{status}</Badge>;
}
```

### Using the new structure:

```typescript
// In any page or component
import { Button } from '@/ui';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { ROUTES } from '@/constants';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function MyComponent() {
  const { user, hasPermission } = useAuth();
  
  return (
    <div>
      {hasPermission('admin.access') && (
        <Button>Admin Only</Button>
      )}
      <StatusBadge status="active" />
    </div>
  );
}
```

## ✅ Benefits

1. **Clear Organization:** Easy to find code
2. **Scalability:** Easy to add features
3. **Reusability:** Shared code is centralized
4. **Maintainability:** Clear boundaries
5. **Type Safety:** Better TypeScript support
6. **Import Paths:** Shorter, semantic imports
7. **RBAC Intact:** Menu và permissions vẫn hoạt động 100%

## 🔗 Related Files

- `tsconfig.json` - Path aliases configuration
- `next.config.mjs` - Next.js configuration
- `middleware.ts` - Route protection (uses constants from here)

## 📝 Notes

- **Không xóa code cũ** - Code cũ vẫn ở `components/`, `lib/`, `hooks/`
- **Cấu trúc song song** - Có thể import từ cả 2 nơi
- **Migration dần dần** - Update imports khi sửa files
- **RBAC giữ nguyên** - Menu navigation hoạt động như cũ

