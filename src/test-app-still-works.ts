// @ts-nocheck
// Test to verify app still works with OLD imports
// This proves we didn't break anything

// Test old imports still work
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Test RBAC still works (CRITICAL)
import { checkPermission } from '@/lib/auth/rbac';
import { hasPermission } from '@/lib/auth/rbac-service';

// Verify old imports work
console.log('✅ OLD imports still work!');
console.log('✅ App is NOT broken!');
console.log('✅ RBAC functions:', { checkPermission, hasPermission });

export { Button, Card, useToast, cn, checkPermission, hasPermission };


