import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    // Get token from header or cookie
    const authHeader = request.headers.get('authorization');
    const cookieStore = cookies();
    const cookieToken = cookieStore.get('accessToken')?.value;
    
    const token = authHeader?.replace('Bearer ', '') || cookieToken;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      )
    }
    
    // Use internal Docker network URL for server-side API calls
    const API_URL = process.env.API_URL_INTERNAL || 'http://lta-backend:3006';
    
    // Forward to backend
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('/auth/me API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
