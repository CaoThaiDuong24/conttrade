"use client";

import { useAuth } from '@/components/providers/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Buyer Layout - Protected routes for authenticated buyers
 * Uses DashboardLayout to show sidebar and full authenticated UI
 * Middleware handles authentication, this layout provides additional client-side checks
 */
export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is not loading and not authenticated, redirect to login
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/cart');
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // If not authenticated after loading, show nothing (redirect happens in useEffect)
  if (!user) {
    return null;
  }

  // Render children for authenticated users - children already wrapped in DashboardLayout by AuthWrapper
  return <>{children}</>;
}
