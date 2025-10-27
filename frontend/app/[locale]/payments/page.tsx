'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Payments Index Page - Redirects to /payments/escrow
 * This page handles the parent route /payments and redirects to the default sub-page
 */
export default function PaymentsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to escrow page as default
    router.replace('/payments/escrow');
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

