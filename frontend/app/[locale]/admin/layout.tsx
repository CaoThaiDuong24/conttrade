"use client";

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/components/providers/auth-context';

/**
 * Admin Layout - Uses real user data from AuthContext
 * Middleware handles authentication and authorization
 * If user reaches here, they already passed middleware checks
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  console.log('✅ AdminLayout rendering - User from AuthContext:', user?.email, user?.permissions?.length);

  // Show loading state while user is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Just return children - AuthWrapper already handles DashboardLayout
  return <>{children}</>;
}
