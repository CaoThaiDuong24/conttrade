/**
 * usePermissionWatcher Hook
 * Purpose: Auto-detect permission changes and force logout when admin modifies roles
 * Usage: Add to app/layout.tsx or main dashboard layout
 */

'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const CHECK_INTERVAL = 60000; // Check every 60 seconds (1 minute)

export function usePermissionWatcher() {
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<number>(Date.now());

  useEffect(() => {
    const checkPermissionVersion = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          return; // Not logged in
        }

        const response = await fetch('http://localhost:3006/api/v1/auth/check-version', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired, logout
            handleForceLogout('Token hết hạn. Vui lòng đăng nhập lại.');
          }
          return;
        }

        const result = await response.json();
        
        if (result.success && result.data.requireReauth) {
          // Permission changed! Force logout
          const changedRoles = result.data.changedRoles.join(', ');
          handleForceLogout(
            `Quyền hạn của bạn đã được cập nhật bởi Admin.\n` +
            `Vai trò thay đổi: ${changedRoles}\n` +
            `Vui lòng đăng nhập lại để cập nhật.`
          );
        }
      } catch (error) {
        console.error('❌ Permission check error:', error);
        // Don't logout on network errors
      }
    };

    const handleForceLogout = (message: string) => {
      // Clear all auth data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Show alert
      alert(message);
      
      // Redirect to login
      router.push('/vi/auth/login');
      
      // Reload to clear state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    };

    // Initial check after 5 seconds
    const initialTimeout = setTimeout(() => {
      checkPermissionVersion();
    }, 5000);

    // Start interval checking
    intervalRef.current = setInterval(() => {
      checkPermissionVersion();
      lastCheckRef.current = Date.now();
    }, CHECK_INTERVAL);

    // Cleanup on unmount
    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [router]);

  return {
    lastCheck: lastCheckRef.current
  };
}

/**
 * PermissionWatcher Component
 * Alternative: Use as a component instead of hook
 */
export function PermissionWatcher() {
  usePermissionWatcher();
  return null; // This component doesn't render anything
}
