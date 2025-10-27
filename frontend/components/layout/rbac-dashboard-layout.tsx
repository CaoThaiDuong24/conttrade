'use client';

import { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { RBACDashboardSidebar } from './rbac-dashboard-sidebar';
import { AppHeader } from './app-header';

interface RBACDashboardLayoutProps {
  children: ReactNode;
  isAuthenticated?: boolean;
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    roles?: string[];
  };
}

export function RBACDashboardLayout({ 
  children, 
  isAuthenticated = false, 
  userInfo 
}: RBACDashboardLayoutProps) {
  return (
    <SidebarProvider>
      <RBACDashboardSidebar 
        isAuthenticated={isAuthenticated} 
        userInfo={userInfo} 
      />
      <SidebarInset>
        <AppHeader 
          isAuthenticated={isAuthenticated} 
          userInfo={userInfo}
          showSidebarTrigger={true}
        />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}