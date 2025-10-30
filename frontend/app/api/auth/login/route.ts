import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    // Forward to backend
    const response = await fetch('http://localhost:3006/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    // Create response with httpOnly cookie
    const res = NextResponse.json(data)
    
    // Backend returns data.data.token (not accessToken)
    const accessToken = data.data.token || data.data.accessToken;
    
    // Set httpOnly cookie for middleware
    res.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    if (data.data.refreshToken) {
      res.cookies.set('refreshToken', data.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
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