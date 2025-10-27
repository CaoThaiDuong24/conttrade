import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  console.log('GET listing by ID:', id);

  // Mock listing data based on the ID from the error image
  const mockListing = {
    id: id,
    title: 'Container 20ft Standard - Tình trạng tốt',
    description: 'Container 20ft chuẩn ISO, phù hợp cho vận chuyển hàng hóa và lưu trữ. Tình trạng tốt, đã qua kiểm tra chất lượng.',
    priceAmount: '50000000',
    priceCurrency: 'VND',
    status: 'approved',
    locationDepot: {
      name: 'Depot Hà Nội'
    },
    seller: {
      displayName: 'Công ty TNHH Container Việt Nam'
    }
  };

  return NextResponse.json({
    success: true,
    data: mockListing
  });
}