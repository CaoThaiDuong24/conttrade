import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    // Use internal Docker network URL for server-side API calls
    // API_URL_INTERNAL is set in docker-compose.yml for container-to-container communication
    const API_URL = process.env.API_URL_INTERNAL || 'http://lta-backend:3006';
    const targetUrl = `${API_URL}/auth/login`;
    
    console.log('🔧 Login API route - API_URL:', API_URL);
    console.log('🔧 Target URL:', targetUrl);
    console.log('🔧 Environment:', {
      API_URL_INTERNAL: process.env.API_URL_INTERNAL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV
    });
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      // Add timeout and connection settings
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    console.log('✅ Backend response received:', response.status);
    const data = await response.json()
    console.log('✅ Backend data parsed:', { success: data.success });

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    // Create response with httpOnly cookie
    const res = NextResponse.json(data)
    
    // Backend returns data.data.token (not accessToken)
    const accessToken = data.data.token || data.data.accessToken;
    
    // Set httpOnly cookie for middleware
    // Note: secure flag requires HTTPS. For HTTP testing, set to false
    res.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: false, // Set to true only when using HTTPS
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    if (data.data.refreshToken) {
      res.cookies.set('refreshToken', data.data.refreshToken, {
        httpOnly: true,
        secure: false, // Set to true only when using HTTPS
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
    }
    
    // Also normalize the response to include 'accessToken' for client-side code
    data.data.accessToken = accessToken;

    return res
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}