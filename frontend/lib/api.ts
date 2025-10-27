// API client for all endpoints according to specification
// Prefer relative base to use Next.js proxy rewrites in dev
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006') + '/api/v1'

export interface ApiResponse<T> {
  data?: T
  message?: string
  status: number
}

export interface AuthRegisterRequest {
  type: "personal" | "business"
  email?: string
  phone?: string
  password: string
  acceptTos: boolean
}

export interface AuthRegisterResponse {
  user: {
    id: string
    status: string
    kyc_status: string
    email?: string
    phone?: string
    displayName?: string
  }
  accessToken: string
  refreshToken: string
}

export interface AuthLoginRequest {
  email?: string
  phone?: string
  password: string
}

export interface AuthLoginResponse {
  data: {
    accessToken: string
    refreshToken: string
    user: any
  }
}

export interface AuthRefreshRequest {
  refreshToken: string
}

export interface AuthRefreshResponse {
  accessToken: string
}

export interface AuthForgotRequest {
  emailOrPhone: string
}

export interface AuthResetRequest {
  tokenOrOtp: string
  newPassword: string
}

export interface UserProfile {
  id: string
  email?: string
  phone?: string
  fullName?: string
  status: string
  kyc_status: string
  roles: string[]
  permissions: string[]
}

class ApiClient {
  private baseURL: string
  private accessToken: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Always use relative base in the browser to go through Next.js rewrites
    let base =  this.baseURL;
    const url = `${base}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add custom headers if provided
    if (options.headers) {
      Object.assign(headers, options.headers)
    }

    // Only attach Authorization if we have a non-empty token string
    if (this.accessToken && this.accessToken.trim().length > 0) {
      headers.Authorization = `Bearer ${this.accessToken}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      return {
        data: data.success ? data.data : undefined,
        status: response.status,
        message: data.message,
      }
    } catch (error) {
      return {
        status: 500,
        message: 'Lỗi kết nối mạng',
      }
    }
  }

  // Auth endpoints
  async register(data: AuthRegisterRequest): Promise<ApiResponse<AuthRegisterResponse>> {
    // Ensure no Authorization header is sent for public endpoint
    const currentToken = this.accessToken
    this.accessToken = null
    const res = await this.request<AuthRegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    // Store token if register successful
    if (res.data && typeof window !== 'undefined') {
      this.accessToken = res.data.accessToken
      localStorage.setItem('accessToken', res.data.accessToken)
      localStorage.setItem('refreshToken', res.data.refreshToken)
    } else {
      this.accessToken = currentToken
    }
    
    return res
  }

  async login(data: AuthLoginRequest): Promise<ApiResponse<AuthLoginResponse>> {
    // Ensure no Authorization header is sent for public login endpoint
    const currentToken = this.accessToken
    this.accessToken = null;
    const response = await this.request<AuthLoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    // Handle backend response structure: {success: true, data: {accessToken, user}}
    if (response.data && response.data.data && typeof window !== 'undefined') {
      this.accessToken = response.data.data.accessToken
      localStorage.setItem('accessToken', response.data.data.accessToken)
      if (response.data.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.data.refreshToken)
      }
    } else {
      this.accessToken = currentToken
    }
    
    return response
  }

  async refresh(data: AuthRefreshRequest): Promise<ApiResponse<AuthRefreshResponse>> {
    const response = await this.request<AuthRefreshResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (response.data && typeof window !== 'undefined') {
      this.accessToken = response.data.accessToken
      localStorage.setItem('accessToken', response.data.accessToken)
    }

    return response
  }

  async forgotPassword(data: AuthForgotRequest): Promise<ApiResponse<any>> {
    return this.request('/auth/forgot', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async resetPassword(data: AuthResetRequest): Promise<ApiResponse<any>> {
    return this.request('/auth/reset', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/auth/me')
  }

  async updateProfile(data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async logout() {
    if (typeof window !== 'undefined') {
      this.accessToken = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  }

  // Additional API methods according to specification
  async getListings(params?: any): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams(params || {});
    return this.request(`/listings?${queryParams.toString()}`, {
      method: 'GET',
    })
  }

  async createListing(data: any): Promise<ApiResponse<any>> {
    return this.request('/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getRFQs(params?: any): Promise<ApiResponse<any>> {
    return this.request('/rfqs', {
      method: 'GET',
      body: JSON.stringify(params),
    })
  }

  async getOrders(params?: any): Promise<ApiResponse<any>> {
    return this.request('/orders', {
      method: 'GET',
      body: JSON.stringify(params),
    })
  }

  async getDepotStock(depotId: string, params?: any): Promise<ApiResponse<any>> {
    return this.request(`/depots/${depotId}/stock`, {
      method: 'GET',
      body: JSON.stringify(params),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
