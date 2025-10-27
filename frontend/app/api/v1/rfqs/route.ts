import { NextRequest, NextResponse } from 'next/server';

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
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view') || 'sent';

  console.log('GET RFQs, view:', view);

  // Mock RFQ data
  const mockRfqs = [
    {
      id: 'rfq-1',
      listing_id: 'listing-1',
      buyer_id: 'buyer-1',
      purpose: 'sale',
      quantity: 2,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      listings: {
        title: 'Container 20ft - Test',
        priceAmount: 50000000,
        priceCurrency: 'VND'
      }
    }
  ];

  return NextResponse.json({
    success: true,
    data: mockRfqs
  });
}