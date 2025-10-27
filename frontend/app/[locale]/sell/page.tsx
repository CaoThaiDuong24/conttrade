'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Sell Index Page - Redirects to /sell/my-listings
 * This page handles the parent route /sell and redirects to the default sub-page
 */
export default function SellPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to my listings page as default
    router.replace('/sell/my-listings');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}

