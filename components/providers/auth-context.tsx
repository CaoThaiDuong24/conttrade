'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClientRBACService, Role } from '@/lib/auth/client-rbac-service'

// Helper function to determine user roles based on email/id
function determineUserRoles(email: string, userId: string): Role[] {
  const emailLower = email.toLowerCase();
  
  // Admin detection - specific demo accounts
  if (emailLower === 'admin@i-contexchange.vn' || 
      emailLower.includes('admin@') || 
      emailLower.startsWith('admin') || 
      userId.includes('admin')) {
    return ['admin'];
  }
  
  // Inspector detection (was moderator in login page)
  if (emailLower === 'inspector@example.com' ||
      emailLower.includes('inspector') || 
      emailLower.includes('mod') || 
      emailLower.includes('moderator') || 
      userId.includes('inspector')) {
    return ['inspector'];
  }
  
  // Depot manager detection
  if (emailLower === 'manager@example.com' ||
      (emailLower.includes('depot') && (emailLower.includes('manager') || emailLower.includes('mgr'))) ||
      userId.includes('manager')) {
    return ['depot_manager'];
  }
  
  // Depot staff detection
  if (emailLower === 'depot@example.com' ||
      emailLower.includes('depot') || 
      userId.includes('depot')) {
    return ['depot_staff'];
  }
  
  // Config manager detection (operator in login page)
  if (emailLower === 'operator@example.com' ||
      emailLower.includes('config') || 
      emailLower.includes('operator') || 
      userId.includes('config')) {
    return ['config_manager'];
  }
  
  // Finance detection
  if (emailLower.includes('finance') || emailLower.includes('accounting') || userId.includes('finance')) {
    return ['finance'];
  }
  
  // Price manager detection
  if (emailLower.includes('price') || userId.includes('price')) {
    return ['price_manager'];
  }
  
  // Customer support detection
  if (emailLower.includes('support') || emailLower.includes('cs') || userId.includes('support')) {
    return ['customer_support'];
  }
  
  // Seller detection
  if (emailLower === 'seller@example.com' ||
      emailLower.includes('seller') || 
      emailLower.includes('vendor') || 
      userId.includes('seller')) {
    return ['seller'];
  }
  
  // Buyer detection (explicit for demo account)
  if (emailLower === 'buyer@example.com' ||
      emailLower.includes('buyer')) {
    return ['buyer'];
  }
  
  // Default to buyer
  return ['buyer'];
}

interface User {
  id: string
  email: string
  fullName?: string
  avatar?: string
  roles: string[]
  permissions: string[]
  isVerified?: boolean
  createdAt?: string
  updatedAt?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasRole: (role: string) => boolean
  isLoading: boolean
  setTestUser?: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Try to load user from localStorage first (faster initial render)
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          console.log('📦 AuthContext INIT: Loaded user from localStorage:', parsed.email, 'with', parsed.permissions?.length || 0, 'permissions');
          console.log('📦 User state initialized with:', parsed);
          return parsed;
        } catch (error) {
          console.error('❌ Failed to parse localStorage user:', error);
          localStorage.removeItem('user');
          return null;
        }
      } else {
        console.log('📦 AuthContext INIT: No saved user in localStorage');
      }
    }
    return null;
  })
  const [isLoading, setIsLoading] = useState(false) // Changed to false - no need to load
  const [hasFetched, setHasFetched] = useState(false) // Prevent infinite loop
  const router = useRouter()
  
  // Debug: Log user state changes
  useEffect(() => {
    console.log('👤 AuthContext: User state changed:', user ? `${user.email} (${user.permissions?.length} perms)` : 'null');
  }, [user]);

  // Helper function to get token from localStorage or cookies
  const getToken = () => {
    if (typeof window === 'undefined') return null;
    
    // Try localStorage first
    const localToken = localStorage.getItem('accessToken');
    if (localToken) {
      console.log('🔑 AuthContext: Using localStorage token');
      return localToken;
    }
    
    // Fallback to cookies
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      console.log('🔑 AuthContext: Using cookie token');
      return token;
    }
    
    console.log('⚠️ AuthContext: No token found in localStorage or cookies');
    return null;
  };

  // DISABLED: Middleware handles authentication
  // No need for client-side auth check with localStorage
  // Fetch user on mount if token exists
  useEffect(() => {
    // Skip if on auth pages to prevent redirect loops
    if (typeof window !== 'undefined' && window.location.pathname.includes('/auth/')) {
      console.log('⚠️ AuthContext: On auth page, skipping fetchUser');
      setIsLoading(false);
      return;
    }
    
    const token = getToken();
    if (token && !hasFetched) {
      console.log('🔄 AuthContext: Token found, fetching user from API...');
      setHasFetched(true);
      fetchUser()
    } else {
      console.log('⚠️ AuthContext: No token found or already fetched');
      setIsLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.log('❌ fetchUser: No token found');
        setIsLoading(false)
        return
      }

      console.log('🔄 fetchUser: Making API call to /auth/me...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 fetchUser: API response status:', response.status);

      if (response.ok) {
        const userData = await response.json()
        console.log('🔍 /auth/me response:', userData);
        if (userData.success && userData.data && userData.data.user) {
          const apiUser = userData.data.user;
          
          // Extract permissions from API response
          let userPermissions: string[] = [];
          let userRoles: string[] = [];
          
          if (apiUser.roles && Array.isArray(apiUser.roles)) {
            // API returns roles with permissions
            userRoles = apiUser.roles.map((r: any) => r.code);
            
            // Collect ALL permissions from all roles
            const permissionSet = new Set<string>();
            apiUser.roles.forEach((role: any) => {
              if (role.permissions && Array.isArray(role.permissions)) {
                role.permissions.forEach((perm: any) => {
                  permissionSet.add(perm.code);
                });
              }
            });
            userPermissions = Array.from(permissionSet);
            
            console.log('✅ Permissions from API:', userPermissions.length, 'permissions');
            console.log('📋 Permission codes:', userPermissions);
          } else {
            // Fallback to client-side determination
            userRoles = determineUserRoles(apiUser.email, apiUser.id);
            userPermissions = ClientRBACService.getUserPermissions(userRoles as Role[]);
            console.log('⚠️  Using client-side permissions:', userPermissions.length);
          }
          
          const userObject = {
            id: apiUser.id,
            email: apiUser.email,
            fullName: apiUser.displayName,
            avatar: apiUser.avatar,
            roles: userRoles,
            permissions: userPermissions
          };
          
          // Save to state AND localStorage
          setUser(userObject);
          localStorage.setItem('user', JSON.stringify(userObject));
          console.log('💾 User saved to localStorage with', userPermissions.length, 'permissions');
        } else {
          console.error('❌ Invalid /auth/me response:', userData)
          // Token invalid, remove it
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          setUser(null)
          
          // Only redirect if NOT on auth pages
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/')) {
            console.log('🔄 Redirecting to login due to invalid token...')
            window.location.href = '/vi/auth/login'
          } else {
            console.log('⚠️ On auth page, skipping redirect')
          }
        }
      } else {
        console.error('❌ Failed to fetch user, status:', response.status)
        if (response.status === 401) {
          console.log('🔄 Token expired...')
          // Token invalid, remove it
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          setUser(null)
          
          // Only redirect if NOT on auth pages
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/')) {
            console.log('🔄 Redirecting to login due to expired token...')
            window.location.href = '/vi/auth/login'
          } else {
            console.log('⚠️ On auth page, skipping redirect')
          }
        }
      }
    } catch (error) {
      console.error('❌ Error fetching user:', error)
      // On network error, try to use cached user if exists
      const cachedUser = localStorage.getItem('user')
      if (cachedUser) {
        try {
          const parsedUser = JSON.parse(cachedUser)
          setUser(parsedUser)
          console.log('💾 Using cached user data due to network error')
        } catch (e) {
          console.error('Failed to parse cached user')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }
    function setTokenCookie(name: string, token: string) {
        // Set cookie với nhiều options khác nhau
        const expires = new Date();
        expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
        
        // Set cookie with proper format for middleware
        document.cookie = `${name}=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure=${window.location.protocol === 'https:'}`;
    }
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔑 Starting login process for:', email);
      console.log('🔗 API URL:', process.env.NEXT_PUBLIC_API_URL);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('🔑 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔑 Login response:', data);
        
        // Check if response has success structure
        if (data.success && data.data) {
          // Handle both token formats: "token" or "accessToken"
          const accessToken = data.data.accessToken || data.data.token;
          const refreshToken = data.data.refreshToken;
          
          if (!accessToken) {
            console.error('❌ No access token in response:', data);
            return false;
          }
          
          // Store tokens
          localStorage.setItem('accessToken', accessToken)
          console.log('💾 Access token saved to localStorage');

          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken)
            console.log('💾 Refresh token saved to localStorage');
          }
          
          //Set Cookies
          setTokenCookie('accessToken', accessToken)
          console.log('🍪 Token cookie set for middleware');
          
          // Try to fetch full user data with permissions from /auth/me
          try {
            console.log('🔍 Calling /auth/me with token:', accessToken.substring(0, 20) + '...');
            const meResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            console.log('📡 /auth/me response status:', meResponse.status);
            
            if (meResponse.ok) {
              const meData = await meResponse.json();
              console.log('✅ /auth/me after login:', meData);
              
              if (meData.success && meData.data && meData.data.user) {
                const apiUser = meData.data.user;
                
                // Extract permissions from API
                let userPermissions: string[] = [];
                let userRoles: string[] = [];
                
                if (apiUser.roles && Array.isArray(apiUser.roles)) {
                  userRoles = apiUser.roles.map((r: any) => r.code);
                  
                  // Collect ALL permissions
                  const permissionSet = new Set<string>();
                  apiUser.roles.forEach((role: any) => {
                    if (role.permissions && Array.isArray(role.permissions)) {
                      role.permissions.forEach((perm: any) => {
                        permissionSet.add(perm.code);
                      });
                    }
                  });
                  userPermissions = Array.from(permissionSet);
                  
                  console.log('✅ User has', userPermissions.length, 'permissions from API');
                  console.log('📋 Permission codes:', userPermissions);
                } else {
                  console.warn('⚠️ No roles found in API response, using fallback');
                  // Fallback
                  userRoles = determineUserRoles(apiUser.email, apiUser.id);
                  userPermissions = ClientRBACService.getUserPermissions(userRoles as any);
                }
                
                const userObject = {
                  id: apiUser.id,
                  email: apiUser.email,
                  fullName: apiUser.displayName,
                  avatar: apiUser.avatar,
                  roles: userRoles,
                  permissions: userPermissions
                };
                
                setUser(userObject);
                localStorage.setItem('user', JSON.stringify(userObject));
                console.log('💾 User saved to localStorage after login with', userPermissions.length, 'permissions');
                
                return true;
              } else {
                console.error('❌ Invalid /auth/me response structure:', meData);
              }
            } else {
              const errorText = await meResponse.text();
              console.error('❌ /auth/me failed with status:', meResponse.status, 'Error:', errorText);
            }
          } catch (err) {
            console.error('❌ Exception when calling /auth/me:', err);
            console.warn('⚠️ Failed to fetch /auth/me, using basic data from login response');
          }
          
          // Fallback: Use basic data from login response
          const userRoles = determineUserRoles(data.data.user.email, data.data.user.id);
          const userPermissions = ClientRBACService.getUserPermissions(userRoles);
          
          setUser({
            id: data.data.user.id,
            email: data.data.user.email,
            fullName: data.data.user.displayName,
            avatar: data.data.user.avatar,
            roles: userRoles,
            permissions: userPermissions
          })
          return true
        } else {
          console.error('Invalid response structure:', data)
          return false
        }
      } else {
        const error = await response.json()
        console.error('Login error response:', error)
        return false
      }
    } catch (error) {
      console.error('Login failed with exception:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    
    // Clear cookies
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; SameSite=Lax';
  
    setUser(null)
    router.push('/auth/login')
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return user.permissions.includes(permission)
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false
    return permissions.some(permission => user.permissions.includes(permission))
  }

  const hasRole = (role: string): boolean => {
    if (!user) return false
    return user.roles.includes(role)
  }

  const setTestUser = (testUser: User) => {
    if (process.env.NODE_ENV === 'development') {
      // Determine permissions based on role
      const permissions = ClientRBACService.getUserPermissions(testUser.roles as Role[]);
      setUser({
        ...testUser,
        permissions
      });
    }
  }

  const value: AuthContextType = {
    user,
    token: getToken(),
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    hasRole,
    isLoading,
    setTestUser: process.env.NODE_ENV === 'development' ? setTestUser : undefined,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Permission Guard Component
export function PermissionGuard({ 
  permission, 
  permissions, 
  requireAll = false,
  fallback = null,
  children 
}: {
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}) {
  const { hasPermission, hasAnyPermission, user } = useAuth()

  if (!user) {
    return <>{fallback}</>
  }

  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions) {
    if (requireAll) {
      hasAccess = permissions.every(p => hasPermission(p))
    } else {
      hasAccess = hasAnyPermission(permissions)
    }
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// Role Guard Component
export function RoleGuard({ 
  role, 
  roles, 
  fallback = null,
  children 
}: {
  role?: string
  roles?: string[]
  fallback?: React.ReactNode
  children: React.ReactNode
}) {
  const { hasRole, user } = useAuth()

  if (!user) {
    return <>{fallback}</>
  }

  let hasAccess = false

  if (role) {
    hasAccess = hasRole(role)
  } else if (roles) {
    hasAccess = roles.some(r => hasRole(r))
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}