/**
 * Application configuration
 * NEXT_PUBLIC_ environment variables are automatically replaced at build time
 */

// API Base URL - will be replaced at build time by Next.js
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Frontend URL
export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || '';

// Log config on load (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('[Config] API_BASE_URL:', API_BASE_URL);
  console.log('[Config] FRONTEND_URL:', FRONTEND_URL);
}

// Export config object
export const config = {
  apiBaseUrl: API_BASE_URL,
  frontendUrl: FRONTEND_URL,
} as const;
