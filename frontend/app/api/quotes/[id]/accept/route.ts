import { NextRequest, NextResponse } from 'next/server';

export async function POST(
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

    // Forward request to backend (no body needed for accept quote)
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/quotes/${id}/accept`, {
      method: 'POST',
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
    console.error('Error in accept quote API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}