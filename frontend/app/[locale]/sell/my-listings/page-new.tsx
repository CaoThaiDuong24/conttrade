"use client";

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';

/**
 * DEPRECATED: This page is a duplicate of /seller/listings
 * Redirecting to the main seller listings page
 * 
 * This file should be removed in future versions.
 * All listing management functionality is now in /seller/listings
 */
export default function MyListingsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to seller listings page
    router.push('/seller/listings');
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-muted-foreground">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
