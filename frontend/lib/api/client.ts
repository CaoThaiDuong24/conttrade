export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

import { API_BASE_URL } from '../config';

export interface ApiClientConfig {
  baseUrl?: string;
  getToken?: () => Promise<string | null> | string | null;
}

export interface ApiRequestOptions<TBody = unknown> {
  method?: HttpMethod;
  path: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: TBody;
  headers?: Record<string, string>;
  locale?: string;
  idempotencyKey?: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ApiClient {
  private baseUrl: string;
  private getToken?: ApiClientConfig["getToken"];

  constructor(config?: ApiClientConfig) {
    // Use API_BASE_URL from config (which uses NEXT_PUBLIC_API_URL)
    // This ensures the env var is properly injected at build time
    this.baseUrl = config?.baseUrl ?? API_BASE_URL ?? (typeof window !== 'undefined' ? window.location.origin : '');
    this.getToken = config?.getToken;
    console.log('[API Client] Initialized with baseUrl:', this.baseUrl, 'API_BASE_URL:', API_BASE_URL);
  }

  async request<TResponse = unknown, TBody = unknown>(options: ApiRequestOptions<TBody>): Promise<TResponse> {
    const { method = "GET", path, query, body, headers, locale, idempotencyKey } = options;

    // Construct URL properly - handle both absolute and relative paths
    let url: URL;
    
    // Ensure we always have a valid base URL
    let effectiveBaseUrl = this.baseUrl;
    
    // If baseUrl is empty or invalid, use fallback based on environment
    if (!effectiveBaseUrl || effectiveBaseUrl.trim() === '') {
      if (typeof window !== 'undefined') {
        // Client-side: use window.location.origin
        effectiveBaseUrl = window.location.origin;
        console.log('[API Client] Client-side: using window.location.origin:', effectiveBaseUrl);
      } else {
        // Server-side: use relative URLs (Next.js rewrites will handle this)
        // For SSR, we need a dummy base URL just to construct the URL object
        effectiveBaseUrl = 'http://localhost:3000';
        console.log('[API Client] Server-side: using dummy base for URL construction');
      }
    }
    
    try {
      // Check if path is absolute URL
      if (path.startsWith('http://') || path.startsWith('https://')) {
        url = new URL(path);
      } else {
        // Ensure base URL is valid for URL constructor
        // If it's a relative path, prepend with effective base
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        
        // Try to create URL with base
        try {
          url = new URL(normalizedPath, effectiveBaseUrl);
        } catch (e) {
          // If still fails, it means effectiveBaseUrl might be invalid
          // Use window.location or fallback
          const fallbackBase = typeof window !== 'undefined' 
            ? window.location.origin 
            : 'http://localhost:3000';
          console.warn('[API Client] Falling back to:', fallbackBase);
          url = new URL(normalizedPath, fallbackBase);
        }
      }
      console.log('[API Client] Constructed URL:', url.toString(), 'from path:', path, 'base:', effectiveBaseUrl);
    } catch (error) {
      console.error('[API Client] URL construction failed:', error, 'path:', path, 'base:', effectiveBaseUrl);
      throw new ApiError('Invalid URL construction', 0, 'URL_CONSTRUCTION_ERROR', { path, baseUrl: effectiveBaseUrl });
    }
    if (query) {
      console.log('[API Client] Query object:', query);  // DEBUG
      Object.entries(query).forEach(([key, value]) => {
        // ✅ FIX: Allow boolean true, skip only undefined/null/false
        if (value !== undefined && value !== null && value !== false) {
          console.log(`[API Client] Adding ${key}=${value}`);  // DEBUG
          url.searchParams.set(key, String(value));
        } else {
          console.log(`[API Client] Skipping ${key} (value: ${value})`);  // DEBUG
        }
      });
      console.log('[API Client] Final URL:', url.toString());  // DEBUG
    }

    const token = this.getToken ? await this.getToken() : null;

    const fetchHeaders: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(locale ? { "Accept-Language": locale } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      ...headers,
    };

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        method,
        headers: fetchHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        cache: "no-store",
      });
    } catch (e: any) {
      throw new ApiError(e?.message || "Network error", 0);
    }

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await res.json().catch(() => undefined) : await res.text();

    if (!res.ok) {
      const message = (isJson && (data as any)?.message) || res.statusText || "Request failed";
      const code = isJson ? (data as any)?.code : undefined;
      console.error('[API Client] Request failed:', {
        url: url.toString(),
        status: res.status,
        message,
        data
      });
      throw new ApiError(message, res.status, code, data);
    }

    console.log('[API Client] Success response:', {
      url: url.toString(), 
      status: res.status,
      dataType: typeof data,
      dataKeys: isJson ? Object.keys(data || {}) : 'text'
    });

    return data as TResponse;
  }
}

export function generateIdempotencyKey(): string {
  // Simple RFC4122-ish key for client-side idempotency
  return ([1e7] as unknown as string + -1e3 + -4e3 + -8e3 + -1e11)
    .replace(/[018]/g, (c: string) => (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16));
}

export const apiClient = new ApiClient({
  getToken: () => {
    if (typeof window !== 'undefined') {
      // Try localStorage first
      const localToken = localStorage.getItem('accessToken');
      if (localToken) {
        console.log('[API Client] Using localStorage token');
        return localToken;
      }
      
      // Fallback to cookies
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
      if (tokenCookie) {
        const token = tokenCookie.split('=')[1];
        console.log('[API Client] Using cookie token');
        return token;
      }
      
      console.log('[API Client] No token found in localStorage or cookies');
    }
    return null;
  }
});


