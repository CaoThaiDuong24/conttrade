/**
 * Permission Update Notifier
 * Polls /api/v1/auth/check-version to detect when user's permissions have been updated
 * Automatically logs out user and redirects to login page
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const CHECK_INTERVAL = 60000; // Check every 60 seconds

export function PermissionUpdateNotifier() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkPermissionVersion = async () => {
      if (isChecking) return;

      try {
        setIsChecking(true);
        
        const response = await fetch('/api/v1/auth/check-version', {
          credentials: 'include',
        });

        if (!response.ok) {
          // Token invalid or other error - ignore
          return;
        }

        const data = await response.json();

        if (data.success && data.data.requireReauth) {
          // Permissions have been updated - force logout
          console.warn('⚠️  Permissions updated, forcing re-login');
          
          // Clear token
          document.cookie = 'accessToken=; path=/; max-age=0';
          
          // Show toast notification
          toast.warning('Quyền của bạn đã được cập nhật', {
            description: 'Vui lòng đăng nhập lại để áp dụng quyền mới.',
            duration: 10000,
          });

          // Redirect to login after 2 seconds
          setTimeout(() => {
            router.push('/auth/login?reason=permissions_updated');
          }, 2000);

          // Clear interval to stop checking
          if (interval) {
            clearInterval(interval);
          }
        }
      } catch (error) {
        // Network error or other issues - ignore
        console.debug('Permission check failed:', error);
      } finally {
        setIsChecking(false);
      }
    };

    // Start checking
    interval = setInterval(checkPermissionVersion, CHECK_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [router, isChecking]);

  // This component doesn't render anything
  return null;
}
