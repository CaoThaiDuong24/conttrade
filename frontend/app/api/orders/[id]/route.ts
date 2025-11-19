import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering (uses request.headers)
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Forward request to backend
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/orders/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await backendResponse.json();
    
    return NextResponse.json(data, { 
      status: backendResponse.status 
    });

  } catch (error) {
    console.error('Error in get order API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}