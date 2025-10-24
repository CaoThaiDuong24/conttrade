'use client';

import { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { RBACDashboardSidebar } from './rbac-dashboard-sidebar';
import { DashboardHeader } from './dashboard-header';

interface DashboardLayoutProps {
  children: ReactNode;
  isAuthenticated?: boolean;
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    roles?: string[];
    permissions?: string[];
  };
}

export function DashboardLayout({ 
  children, 
  isAuthenticated = false, 
  userInfo 
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <RBACDashboardSidebar 
        isAuthenticated={isAuthenticated} 
        userInfo={userInfo} 
      />
      <SidebarInset className="flex flex-col min-h-screen">
        <DashboardHeader userInfo={userInfo} />
        
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

