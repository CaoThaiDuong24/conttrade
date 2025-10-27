'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { DashboardLayout } from './dashboard-layout';
import { AppHeader } from './app-header';
import { useAuth } from '@/components/providers/auth-context';

// Auth utilities for external use
export const authUtils = {
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; SameSite=Lax';
  }
};

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if current path is a public route (no auth required)
  const publicRoutes = ['/demo-auth', '/auth/login', '/auth/register', '/auth/forgot'];
  const isPublicRoute = publicRoutes.some(route => pathname.includes(route));

  // For demo-auth page, always show the old layout
  if (pathname.includes('/demo-auth')) {
    return (
      <div className="min-h-screen">
        <AppHeader isAuthenticated={false} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  // For auth pages (login, register, forgot), render without header
  if (pathname.includes('/auth/')) {
    return <>{children}</>;
  }

  // For home page, let it handle its own layout
  if (pathname === '/vi' || pathname === '/en' || pathname === '/') {
    return <>{children}</>;
  }

  // Define routes that should use sidebar layout when authenticated
  const sidebarRoutes = [
    '/dashboard',
    '/listings',
    '/rfq',
    '/quotes',
    '/orders',
    '/payments', 
    '/delivery',
    '/reviews',
    '/disputes',
    '/sell',
    '/depot',
    '/inspection',
    '/billing',
    '/subscriptions',
    '/admin',
    '/account',
    '/finance'
  ];

  // Check if current route should use sidebar
  const shouldUseSidebar = user && 
    sidebarRoutes.some(route => pathname.includes(route));

  console.log('🚪 AuthWrapper Debug:', {
    user: !!user,
    pathname,
    shouldUseSidebar,
    userEmail: user?.email,
    userRoles: user?.roles,
    userPermissions: user?.permissions?.slice(0, 5) // Show first 5 permissions
  });

  // Show dashboard layout for authenticated users on main app pages
  if (shouldUseSidebar) {
    const safeUserInfo = {
      name: user.fullName || user.email || 'User',
      email: user.email || '',
      avatar: user.avatar || '/placeholder-user.jpg',
      role: user.roles?.[0] || 'buyer',
      roles: user.roles || [],
      permissions: user.permissions || []
    };
    
    return (
      <DashboardLayout isAuthenticated={true} userInfo={safeUserInfo}>
        {children}
      </DashboardLayout>
    );
  }

  // For all other pages (listings, rfq, etc.), show normal header layout
  const userInfo = user ? {
    name: user.fullName || user.email || 'User',
    email: user.email || '',
    avatar: user.avatar || '/placeholder-user.jpg',
    role: user.roles?.[0] || 'buyer',
    roles: user.roles || [],
    permissions: user.permissions || []
  } : undefined;

  return (
    <div className="min-h-screen">
      <AppHeader isAuthenticated={!!user} userInfo={userInfo} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
