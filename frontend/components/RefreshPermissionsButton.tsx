'use client';

import { usePermissionRefresh } from '@/hooks/usePermissionRefresh';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function RefreshPermissionsButton() {
  const { refreshPermissions, isRefreshing, error } = usePermissionRefresh();

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={refreshPermissions}
        disabled={isRefreshing}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Đang cập nhật...' : 'Làm mới quyền'}
      </Button>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
