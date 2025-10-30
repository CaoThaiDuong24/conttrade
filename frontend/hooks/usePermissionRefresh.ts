/**
 * Hook to refresh user permissions when admin changes them
 * Call this after admin updates user permissions in the system
 */

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006/api/v1';

interface RefreshPermissionsResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    roles: string[];
    permissions: string[];
  };
}

export function usePermissionRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPermissions = async (): Promise<boolean> => {
    setIsRefreshing(true);
    setError(null);

    try {
      // Get token from cookie
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];
      
      if (!token) {
        setError('Không tìm thấy token');
        return false;
      }

      const response = await fetch(`${API_URL}/auth/refresh-permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result: RefreshPermissionsResponse = await response.json();

      if (!result.success || !result.data) {
        setError(result.message || 'Không thể làm mới quyền');
        return false;
      }

      // Update cookie with new token
      document.cookie = `accessToken=${result.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; ${
        process.env.NODE_ENV === 'production' ? 'secure; ' : ''
      }samesite=strict`;

      console.log('✅ Permissions refreshed:', result.data.permissions);
      
      // Reload page to apply new permissions
      window.location.reload();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(errorMessage);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    refreshPermissions,
    isRefreshing,
    error
  };
}
