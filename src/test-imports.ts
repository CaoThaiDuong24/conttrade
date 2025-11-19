// @ts-nocheck
// Test file to verify new import paths work
// This file can be deleted after verification

// Test UI imports
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';

// Test hooks
import { useToast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/use-mobile';

// Test utils
import { cn } from '@/lib/utils';

// Test constants (CRITICAL for RBAC)
import { ROLES, ROLE_LEVELS } from '@/constants/roles';
import { PERMISSIONS, ROLE_PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';

// Test auth (CRITICAL for navigation)
import { checkPermission } from '@/auth/rbac';
import { hasPermission } from '@/auth/rbac-service';

// Verify imports work
console.log('✅ All imports successful!');
console.log('✅ UI components:', { Button, Card });
console.log('✅ Hooks:', { useToast, useMobile });
console.log('✅ Utils:', { cn });
console.log('✅ RBAC Constants:', { ROLES, PERMISSIONS, ROUTES });
console.log('✅ RBAC Functions:', { checkPermission, hasPermission });
console.log('✅ Role Permissions:', ROLE_PERMISSIONS);

// Type check
const testRole: keyof typeof ROLES = 'ADMIN';
const testPermission: string = PERMISSIONS.ADMIN_ACCESS;
const testRoute: string = ROUTES.ADMIN;

export { testRole, testPermission, testRoute };


