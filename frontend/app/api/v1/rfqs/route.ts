import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('=== RFQ API DEBUG ===');
    console.log('Received payload:', body);
    console.log('Required fields check:');
    console.log('- listing_id:', body.listing_id ? '✅' : '❌');
    console.log('- purpose:', body.purpose ? '✅' : '❌');
    console.log('- quantity:', body.quantity ? '✅' : '❌');
    console.log('========================');

    // Validate required fields
    if (!body.listing_id) {
      return NextResponse.json(
        { success: false, message: 'listing_id is required' },
        { status: 400 }
      );
    }

    if (!body.purpose) {
      return NextResponse.json(
        { success: false, message: 'purpose is required' },
        { status: 400 }
      );
    }

    if (!body.quantity || body.quantity < 1) {
      return NextResponse.json(
        { success: false, message: 'quantity must be at least 1' },
        { status: 400 }
      );
    }

    // Simulate creating RFQ (replace with actual database logic)
    const mockRfq = {
      id: 'rfq-' + Date.now(),
      listing_id: body.listing_id,
      buyer_id: 'mock-buyer-id',
      purpose: body.purpose,
      quantity: body.quantity,
      need_by: body.need_by || null,
      services_json: body.services || {},
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      expired_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('RFQ created successfully:', mockRfq);

    return NextResponse.json({
      success: true,
      message: 'RFQ created successfully',
      data: mockRfq
    });

  } catch (error: any) {
    console.error('RFQ API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create RFQ', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'sent';
    const showAll = searchParams.get('show_all');

    console.log('GET RFQs, view:', view, 'show_all:', showAll);

    // Get token from header or cookie
    const authHeader = request.headers.get('authorization');
    const cookieStore = cookies();
    const cookieToken = cookieStore.get('accessToken')?.value;

    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { status: 401 }
      );
    }

    // Use internal Docker network URL for server-side API calls
    const API_URL = process.env.API_URL_INTERNAL || process.env.BACKEND_URL || 'http://localhost:3006';

    // Build query string
    const queryParams = new URLSearchParams({ view });
    if (showAll === 'true') {
      queryParams.append('show_all', 'true');
    }

    // Backend route is registered with prefix /api/v1/rfqs
    const backendUrl = `${API_URL}/api/v1/rfqs?${queryParams.toString()}`;

    console.log('🔧 Forwarding RFQ request to backend:', backendUrl);

    // Forward request to backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    const data = await response.json();

    console.log('✅ Backend response status:', response.status);
    console.log('✅ Backend data count:', Array.isArray(data.data) ? data.data.length : 'not an array');

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in RFQ GET API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}