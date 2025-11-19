'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Depot Index Page - Redirects to /depot/stock
 * This page handles the parent route /depot and redirects to the default sub-page
 */
export default function DepotPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to stock page as default
    router.replace('/depot/stock');
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

