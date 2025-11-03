'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
  displayName: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
  orgUsers: any[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('🔧 AuthProvider mounted, initial state:', { user: !!user, loading });

  const hasPermission = (permission: string): boolean => {
    if (!user?.permissions) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    if (!user?.roles) return false;
    return user.roles.includes(role);
  };

  const login = async (email: string, password: string, rememberMe = false): Promise<void> => {
    try {
      console.log('� AUTH CONTEXT LOGIN START:', { 
        email, 
        rememberMe,
        timestamp: new Date().toISOString()
      });
      
      // Use Next.js API route instead of direct backend call
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      console.log('📡 API RESPONSE STATUS:', response.status);
      const data = await response.json();
      console.log('📡 API RESPONSE DATA:', {
        success: data.success,
        hasData: !!data.data,
        timestamp: new Date().toISOString()
      });

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      // Backend returns: {success: true, data: {accessToken, user}}
      const { accessToken, refreshToken: newRefreshToken, user: userData } = data.data;
      console.log('🎯 EXTRACTED AUTH DATA:', { 
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!newRefreshToken,
        hasUser: !!userData,
        userId: userData?.id,
        userEmail: userData?.email,
        timestamp: new Date().toISOString()
      });

      // Store tokens in localStorage for client-side access
      localStorage.setItem('accessToken', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      console.log('💾 TOKENS STORED IN LOCALSTORAGE:', {
        accessTokenStored: !!localStorage.getItem('accessToken'),
        refreshTokenStored: !!localStorage.getItem('refreshToken'),
        timestamp: new Date().toISOString()
      });
      
      // Decode JWT to extract permissions if not in userData
      let enrichedUserData = userData;
      if (!userData.permissions && accessToken) {
        try {
          const payloadBase64 = accessToken.split('.')[1];
          const decodedPayload = JSON.parse(atob(payloadBase64));
          console.log('🔓 Decoded JWT on login:', {
            hasPermissions: !!decodedPayload.permissions,
            permissionsCount: decodedPayload.permissions?.length,
            roles: decodedPayload.roles
          });
          
          enrichedUserData = {
            ...userData,
            permissions: decodedPayload.permissions || [],
            roles: userData.roles || decodedPayload.roles || []
          };
        } catch (decodeError) {
          console.error('Failed to decode JWT on login:', decodeError);
        }
      }
      
      // Set user data immediately without delay
      setUser(enrichedUserData);
      console.log('👤 USER STATE UPDATED:', {
        userId: enrichedUserData?.id,
        userEmail: enrichedUserData?.email,
        userRoles: enrichedUserData?.roles,
        permissionsCount: enrichedUserData?.permissions?.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call logout API to clear httpOnly cookies
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token refresh failed');
      }

      const { accessToken } = data.data;
      localStorage.setItem('accessToken', accessToken);

    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  };

  const fetchUserData = async (): Promise<void> => {
    try {
      // Try localStorage first, then fallback to cookie 'accessToken' if present
      let token = localStorage.getItem('accessToken');
      if (!token && typeof document !== 'undefined') {
        const match = document.cookie.match('(?:^|; )accessToken=([^;]+)');
        if (match) {
          token = decodeURIComponent(match[1]);
          console.log('🔍 Found accessToken in cookie, using it to fetch user data');
        }
      }
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        let userData = data.data.user;
        
        // If user data doesn't have permissions, decode from JWT token
        if (!userData.permissions && token) {
          try {
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));
            console.log('🔓 Decoded JWT payload:', {
              hasPermissions: !!decodedPayload.permissions,
              permissionsCount: decodedPayload.permissions?.length
            });
            
            // Merge JWT permissions into user data
            userData = {
              ...userData,
              permissions: decodedPayload.permissions || [],
              roles: userData.roles || decodedPayload.roles || []
            };
          } catch (decodeError) {
            console.error('Failed to decode JWT:', decodeError);
          }
        }
        
        setUser(userData);
      } else if (response.status === 401) {
        // Try to refresh token
        try {
          await refreshToken();
          // Retry fetching user data with new token
          const retryResponse = await fetch('/api/v1/auth/me', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            setUser(retryData.data.user);
          } else {
            await logout();
          }
        } catch (refreshError) {
          await logout();
        }
      } else {
        await logout();
      }
    } catch (error) {
      console.error('Fetch user data error:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Auto-refresh token every 30 minutes
  useEffect(() => {
    if (user) {
      const interval = setInterval(async () => {
        try {
          await refreshToken();
        } catch (error) {
          console.error('Auto refresh token error:', error);
        }
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearInterval(interval);
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshToken,
    hasPermission,
    hasRole,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  console.log('🔍 useAuth called, context:', { 
    hasContext: !!context, 
    user: context?.user?.id,
    loading: context?.loading 
  });
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Bạn cần đăng nhập</h1>
            <p className="text-muted-foreground mb-4">Vui lòng đăng nhập để truy cập trang này.</p>
            <a href="/vi/auth/login" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Đăng nhập
            </a>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Hook for permission-based access control
export function usePermission(permission: string) {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}

// Hook for role-based access control
export function useRole(role: string) {
  const { hasRole } = useAuth();
  return hasRole(role);
}

// Component for conditional rendering based on permissions
export function PermissionGuard({ 
  permission, 
  children, 
  fallback = null 
}: { 
  permission: string; 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  const hasPermission = usePermission(permission);
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

// Component for conditional rendering based on roles
export function RoleGuard({ 
  role, 
  children, 
  fallback = null 
}: { 
  role: string; 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  const hasRole = useRole(role);
  return hasRole ? <>{children}</> : <>{fallback}</>;
}