"use client";

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  User, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Eye,
  Star,
  ShoppingCart
} from 'lucide-react';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { apiClient } from '@/lib/api';
import { formatVND, formatPrice } from '@/lib/currency';
import { getDealTypeDisplayName } from '@/lib/utils/dealType';

// Helper function to format currency with dot as thousand separator
const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Helper function to convert number to Vietnamese words
const numberToVietnameseWords = (num: number): string => {
  if (num === 0) return 'không';
  
  const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const tens = ['', '', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
  const hundreds = ['', 'một trăm', 'hai trăm', 'ba trăm', 'bốn trăm', 'năm trăm', 'sáu trăm', 'bảy trăm', 'tám trăm', 'chín trăm'];
  const scales = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ'];

  const convertGroup = (n: number): string => {
    let result = '';
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;

    if (h > 0) result += hundreds[h];
    
    if (t > 1) {
      if (result) result += ' ';
      result += tens[t];
    } else if (t === 1) {
      if (result) result += ' ';
      result += 'mười';
    }

    if (o > 0) {
      if (result) result += ' ';
      if (t > 1 && o === 1) {
        result += 'mốt';
      } else if (t > 0 && o === 5) {
        result += 'lăm';
      } else {
        result += ones[o];
      }
    }

    return result;
  };

  if (num < 0) return 'âm ' + numberToVietnameseWords(-num);
  
  const groups = [];
  let tempNum = num;
  
  while (tempNum > 0) {
    groups.push(tempNum % 1000);
    tempNum = Math.floor(tempNum / 1000);
  }

  let result = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] > 0) {
      if (result) result += ' ';
      result += convertGroup(groups[i]);
      if (i > 0) result += ' ' + scales[i];
    }
  }

  return result || 'không';
};

interface RFQ {
  id: string;
  listing_id: string;
  buyer_id: string;
  purpose: string;
  quantity: number;
  need_by: string;
  rental_duration_months?: number; // ✅ User's requested rental duration
  services_json: {
    inspection?: boolean;
    certification?: boolean;
    repair_estimate?: boolean;
    delivery_estimate?: boolean;
  };
  selected_container_ids?: string[]; // Danh sách container ISO codes đã chọn
  selected_containers_details?: Array<{
    id: string;
    container_iso_code: string;
    shipping_line: string | null;
    manufactured_year: number | null;
    status: string;
  }>; // Chi tiết containers đã chọn
  status: string;
  submitted_at: string;
  expired_at: string;
  title?: string;
  description?: string;
  delivery_location?: string;
  budget?: number;
  currency?: string;
  current_user_id?: string; // Add this to store current user
  listings: {
    id: string;
    title: string;
    description?: string;
    price_amount: string;
    price_currency: string;
    deal_type: string;
    status: string;
    location_depot_id: string;
    min_rental_duration?: number; // Listing's minimum requirement
    max_rental_duration?: number; // Listing's maximum requirement
    rental_unit?: string;
    users: {
      id: string;
      display_name: string;
      email: string;
    };
  };
  users: {
    id: string;
    display_name: string;
    email: string;
  };
  quotes: Array<{
    id: string;
    seller_id: string;
    price_subtotal?: number;
    fees_json?: any;
    total?: number;
    currency: string;
    valid_until?: string;
    status: string;
    created_at: string;
    users: {
      display_name: string;
      email: string;
    };
    quote_items?: Array<{
      id: string;
      item_type: string;
      description: string;
      qty: number;
      unit_price: number;
    }>;
  }>;
}

// Helper function to convert rental_duration_months back to original unit
const convertMonthsToRentalUnit = (months: number, rentalUnit: string): number => {
  switch (rentalUnit) {
    case 'YEAR':
      return months / 12;
    case 'QUARTER':
      return months / 3;
    case 'MONTH':
      return months;
    case 'WEEK':
      return Math.round(months * 4.33);
    case 'DAY':
      return Math.round(months * 30);
    default:
      return months;
  }
};

export default function RFQDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const { showSuccess, showError } = useNotificationContext();
  
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const rfqId = params.id as string;

  // ⚡ Fetch user FIRST in separate useEffect
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const getToken = () => {
          if (typeof window === 'undefined') return null;
          const cookies = document.cookie.split(';');
          const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
          return tokenCookie ? tokenCookie.split('=')[1] : null;
        };
        
        const token = getToken();
        if (!token) {
          setUserLoading(false);
          return;
        }
        
        const userResponse = await fetch('/api/v1/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const userId = userData.data?.id || null;
          setCurrentUserId(userId);
          console.log('✅ User fetched - Current User ID:', userId);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch RFQ after user is loaded
  useEffect(() => {
    if (!userLoading && currentUserId !== null) {
      console.log('🔄 Fetching RFQ with user ID:', currentUserId);
      fetchRFQDetail();
    }
  }, [rfqId, userLoading, currentUserId]);

  const fetchRFQDetail = async () => {
    try {
      setLoading(true);
      
      // Get access token from cookies
      const getToken = () => {
        if (typeof window === 'undefined') return null;
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
        return tokenCookie ? tokenCookie.split('=')[1] : null;
      };
      
      const token = getToken();
      if (!token) {
        showError('Chưa đăng nhập');
        router.push('/auth/login');
        return;
      }
      
      // Call real API
      const response = await fetch(`/api/v1/rfqs/${rfqId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          showError('Không tìm thấy RFQ');
        } else if (response.status === 403) {
          showError('Bạn không có quyền xem RFQ này');
        } else {
          showError('Không thể tải thông tin RFQ');
        }
        return;
      }
      
      const data = await response.json();
      console.log('RFQ Detail API Response:', data); // Debug log
      
      if (data.success && data.data) {
        // ⚡ ADD current_user_id to RFQ data
        const rfqWithUser = {
          ...data.data,
          current_user_id: currentUserId
        };
        setRfq(rfqWithUser);
        
        // Debug button visibility conditions - USE STATE currentUserId
        console.log('🔍 DEBUG - Button Visibility Check:');
        console.log('  - Current User ID (state):', currentUserId);
        console.log('  - Buyer ID (RFQ creator):', data.data.buyer_id);
        console.log('  - Seller ID (listing owner):', data.data.listings?.users?.id);
        console.log('  - RFQ Status:', data.data.status);
        console.log('  - Existing quotes:', data.data.quotes?.length || 0);
        console.log('  - User is BUYER? (Should NOT see quote button):', currentUserId === data.data.buyer_id);
        console.log('  - User is SELLER? (CAN see quote button):', currentUserId === data.data.listings?.users?.id);
        console.log('  - Status is SUBMITTED?', data.data.status === 'SUBMITTED');
        console.log('  - Already has quote from this user?', 
          data.data.quotes?.some((q: any) => q.seller_id === currentUserId));
        console.log('  ✅ SHOULD SHOW "Gửi báo giá" button?', 
          currentUserId !== data.data.buyer_id && 
          data.data.status === 'SUBMITTED' && 
          !data.data.quotes?.some((q: any) => q.seller_id === currentUserId));
      } else {
        showError('Dữ liệu RFQ không hợp lệ');
      }
    } catch (error) {
      console.error('Error fetching RFQ:', error);
      showError('Không thể tải thông tin RFQ');
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteAction = async (quoteId: string, action: 'accept' | 'reject') => {
    try {
      setActionLoading(quoteId);
      
      // Get token from cookies
      const getToken = () => {
        if (typeof window === 'undefined') return null;
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
        return tokenCookie ? tokenCookie.split('=')[1] : null;
      };
      
      const token = getToken();
      
      if (!token) {
        showError('Chưa đăng nhập. Vui lòng đăng nhập lại.');
        router.push('/auth/login');
        return;
      }
      
      // Call API to accept/reject quote
      const response = await fetch(`/api/v1/quotes/${quoteId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          showError('Bạn không có quyền thực hiện hành động này');
        } else if (response.status === 404) {
          showError('Không tìm thấy báo giá');
        } else if (response.status === 400) {
          const errorData = await response.json();
          showError(errorData.message || 'Không thể xử lý báo giá này');
        } else {
          showError('Có lỗi xảy ra khi xử lý báo giá');
        }
        return;
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'API call failed');
      }

      if (action === 'accept') {
        // ✅ CHẤP NHẬN BÁO GIÁ
        // Redirect to order detail if order was created
        if (result.data?.order) {
          const orderId = result.data.order.id;
          showSuccess(`✅ Đơn hàng ${orderId} đã được tạo. Đang chuyển hướng...`);
          setTimeout(() => {
            router.push(`/orders/${orderId}`);
          }, 1500);
          return;
        } else {
          // Nếu không tạo đơn hàng, chỉ hiển thị thông báo chấp nhận
          showSuccess('🎉 Đã chấp nhận báo giá thành công!');
        }
      } else {
        // ❌ TỪ CHỐI BÁO GIÁ  
        showSuccess('❌ Đã từ chối báo giá');
      }
      
      // Refresh RFQ data to show updated status
      await fetchRFQDetail();
      
    } catch (error) {
      console.error('Error updating quote:', error);
      showError(`Không thể ${action === 'accept' ? 'chấp nhận' : 'từ chối'} báo giá: ${(error as Error).message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Nháp', variant: 'secondary' as const },
      SUBMITTED: { label: 'Đã gửi', variant: 'default' as const },
      QUOTED: { label: 'Có báo giá', variant: 'secondary' as const },
      EXPIRED: { label: 'Hết hạn', variant: 'destructive' as const },
      ACCEPTED: { label: 'Đã chấp nhận', variant: 'default' as const },
      REJECTED: { label: 'Đã từ chối', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getQuoteStatusBadge = (status: string) => {
    const statusConfig = {
      // Backend trả về lowercase
      draft: { label: 'Nháp', variant: 'secondary' as const },
      sent: { label: 'Đã gửi', variant: 'default' as const },
      pending: { label: 'Đang chờ', variant: 'default' as const },
      accepted: { label: 'Đã chấp nhận', variant: 'default' as const },
      rejected: { label: 'Đã từ chối', variant: 'destructive' as const },
      declined: { label: 'Đã từ chối', variant: 'destructive' as const },
      expired: { label: 'Hết hạn', variant: 'destructive' as const },
      // Uppercase compatibility (nếu có)
      DRAFT: { label: 'Nháp', variant: 'secondary' as const },
      SENT: { label: 'Đã gửi', variant: 'default' as const },
      PENDING: { label: 'Đang chờ', variant: 'default' as const },
      ACCEPTED: { label: 'Đã chấp nhận', variant: 'default' as const },
      DECLINED: { label: 'Đã từ chối', variant: 'destructive' as const },
      REJECTED: { label: 'Đã từ chối', variant: 'destructive' as const },
      EXPIRED: { label: 'Hết hạn', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="animate-pulse space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded w-64"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-64 bg-gray-200 rounded-xl"></div>
                  <div className="h-48 bg-gray-200 rounded-xl"></div>
                  <div className="h-32 bg-gray-200 rounded-xl"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-32 bg-gray-200 rounded-xl"></div>
                  <div className="h-40 bg-gray-200 rounded-xl"></div>
                  <div className="h-48 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy RFQ</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Simple header */}
      <div className="bg-white border-b shadow-sm">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chi tiết RFQ</h1>
                <p className="text-gray-600">
                  Mã: {rfq.id.slice(0, 8)}...
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Button Báo giá for Seller - Prominent placement in header */}
              {rfq.current_user_id && 
               rfq.current_user_id === rfq.listings?.users?.id && 
               rfq.status === 'SUBMITTED' && 
               !rfq.quotes?.some(q => q.seller_id === rfq.current_user_id) && (
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold shadow-lg hover:shadow-xl"
                  onClick={() => router.push(`/quotes/create?rfqId=${rfq.id}`)}
                >
                  <DollarSign className="mr-2 h-5 w-5" />
                  💰 Gửi báo giá ngay
                </Button>
              )}
              {/* DEV MODE: Show button anyway for testing */}
              {process.env.NODE_ENV === 'development' && !rfq.current_user_id && (
                <Button 
                  size="sm"
                  variant="outline"
                  className="border-yellow-400 text-yellow-700"
                  onClick={() => router.push(`/quotes/create?rfqId=${rfq.id}`)}
                >
                  🐛 TEST: Gửi báo giá
                </Button>
              )}
              {getStatusBadge(rfq.status)}
            </div>
          </div>
        </div>
      </div>

      {/* Full width content */}
      <div className="w-full px-6 py-6">
        {/* Status Alerts with improved design */}
        {rfq.quotes.length > 0 && (rfq.status === 'SUBMITTED' || rfq.status === 'submitted' || rfq.status === 'awaiting_response') && (
            <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-blue-50 border border-emerald-200 rounded-2xl p-6 mb-8 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-3 rounded-full shadow-lg">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-emerald-800 mb-3 flex items-center gap-2">
                    🎉 Tuyệt vời! Bạn đã nhận được {rfq.quotes.length} báo giá
                  </h3>
                  <p className="text-emerald-700 mb-6 text-lg">
                    Hãy xem xét kỹ các báo giá bên dưới và chọn phương án phù hợp nhất
                  </p>
                  
                  <div className="bg-white rounded-xl p-6 border border-emerald-200 mb-6 shadow-sm">
                    <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2 text-lg">
                      <ArrowLeft className="h-5 w-5 rotate-180" />
                      Hướng dẫn thao tác:
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-emerald-700 font-semibold">
                          <CheckCircle className="h-5 w-5" />
                          <span>Chấp nhận báo giá:</span>
                        </div>
                        <ul className="ml-8 space-y-2 text-emerald-600">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            Tự động tạo đơn hàng
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            Chuyển đến trang thanh toán
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            Các báo giá khác sẽ bị từ chối
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-red-700 font-semibold">
                          <XCircle className="h-5 w-5" />
                          <span>Từ chối báo giá:</span>
                        </div>
                        <ul className="ml-8 space-y-2 text-red-600">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            Báo giá sẽ bị đánh dấu từ chối
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            Có thể liên hệ thương lượng lại
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            Không ảnh hưởng báo giá khác
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-emerald-700 bg-white p-4 rounded-xl border border-emerald-200">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">💡 Cuộn xuống để xem chi tiết từng báo giá và thực hiện lựa chọn</span>
                  </div>
                </div>
              </div>
            </div>
        )}

        {rfq.status === 'accepted' && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 mb-8 shadow-lg">
              <div className="flex items-center gap-4">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
                <div>
                  <h3 className="text-xl font-bold text-emerald-800">✅ RFQ đã hoàn thành</h3>
                  <p className="text-emerald-700 mt-1">
                    Bạn đã chấp nhận một báo giá và đơn hàng đã được tạo thành công.
                  </p>
                </div>
            </div>
          </div>
        )}

        {/* Modern Grid Layout with Full Width */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content - Takes 3 columns on xl screens */}
          <div className="xl:col-span-3 space-y-8">
            {/* RFQ Information with enhanced design */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    Thông tin RFQ
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Mục đích sử dụng */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">Mục đích</p>
                          <p className="text-sm font-bold text-gray-900">
                            {rfq.purpose === 'PURCHASE' ? 'Mua container' : 
                             rfq.purpose === 'RENTAL' ? 'Thuê container' : 
                             rfq.purpose === 'INQUIRY' ? 'Hỏi thông tin' :
                             rfq.purpose || 'Không rõ'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Số lượng */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">Số lượng</p>
                          <p className="text-sm font-bold text-gray-900">{rfq.quantity} container</p>
                        </div>
                      </div>
                    </div>

                    {/* Thời gian thuê - chỉ hiển thị khi LISTING là RENTAL */}
                    {rfq.listings?.deal_type === 'RENTAL' && rfq.rental_duration_months && (
                      <div className="bg-white border-2 border-blue-300 p-4 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-blue-600 font-medium">Thời gian thuê</p>
                            <p className="text-sm font-bold text-blue-900">
                              {convertMonthsToRentalUnit(rfq.rental_duration_months, rfq.listings?.rental_unit || 'MONTH')} {rfq.listings?.rental_unit === 'YEAR' ? 'năm' : rfq.listings?.rental_unit === 'QUARTER' ? 'quý' : 'tháng'}
                            </p>
                          </div>
                        </div>
                        {rfq.listings?.min_rental_duration && rfq.listings?.max_rental_duration && (
                          <p className="text-xs text-blue-600 mt-2">
                            Range: {rfq.listings.min_rental_duration}-{rfq.listings.max_rental_duration} {rfq.listings?.rental_unit === 'YEAR' ? 'năm' : rfq.listings?.rental_unit === 'QUARTER' ? 'quý' : 'tháng'}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Cần trước ngày */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">Cần trước</p>
                          <p className="text-sm font-bold text-gray-900">
                            {new Date(rfq.need_by).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Hết hạn báo giá */}
                    <div className="bg-white border-2 border-red-300 p-4 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <Clock className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-red-600 font-medium">Hạn cuối báo giá</p>
                          <p className="text-sm font-bold text-red-900">
                            {new Date(rfq.expired_at).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        {(() => {
                          const daysLeft = Math.ceil((new Date(rfq.expired_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          if (daysLeft > 0) {
                            return (
                              <div className="flex items-center gap-1 text-xs text-red-600">
                                <Clock className="h-3 w-3" />
                                <span className="font-semibold">Còn {daysLeft} ngày</span>
                              </div>
                            );
                          } else {
                            return <span className="text-xs text-red-700 font-semibold">❌ Đã hết hạn</span>;
                          }
                        })()}
                      </div>
                    </div>

                    {/* ⭐ TỔNG SỐ TIỀN DỰ KIẾN - Compact version */}
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-400 p-4 rounded-lg hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-3">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-orange-700 font-bold">💰 TỔNG SỐ TIỀN DỰ KIẾN (Giá niêm yết)</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-orange-200">
                        <div className="flex items-baseline justify-between flex-wrap gap-2">
                          <div className="text-sm text-gray-600">
                            {formatCurrency(parseInt(rfq.listings.price_amount))} {rfq.listings.price_currency}
                            {rfq.listings.deal_type === 'RENTAL' && rfq.listings.rental_unit && (
                              <span>/{rfq.listings.rental_unit === 'YEAR' ? 'năm' : rfq.listings.rental_unit === 'QUARTER' ? 'quý' : 'tháng'}</span>
                            )}
                            {rfq.listings.deal_type === 'RENTAL' && rfq.rental_duration_months && (
                              <> × {convertMonthsToRentalUnit(rfq.rental_duration_months, rfq.listings.rental_unit || 'MONTH')} {rfq.listings.rental_unit === 'YEAR' ? 'năm' : rfq.listings.rental_unit === 'QUARTER' ? 'quý' : 'tháng'}</>
                            )}
                            {' × '}{rfq.quantity} container
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-black text-orange-600">
                              {rfq.listings.deal_type === 'RENTAL' && rfq.rental_duration_months
                                ? formatCurrency(parseInt(rfq.listings.price_amount) * convertMonthsToRentalUnit(rfq.rental_duration_months, rfq.listings.rental_unit || 'MONTH') * rfq.quantity)
                                : formatCurrency(parseInt(rfq.listings.price_amount) * rfq.quantity)
                              } {rfq.listings.price_currency}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-orange-600 italic mt-1">
                          {rfq.listings.deal_type === 'RENTAL' && rfq.rental_duration_months
                            ? numberToVietnameseWords(parseInt(rfq.listings.price_amount) * convertMonthsToRentalUnit(rfq.rental_duration_months, rfq.listings.rental_unit || 'MONTH') * rfq.quantity)
                            : numberToVietnameseWords(parseInt(rfq.listings.price_amount) * rfq.quantity)
                          } đồng
                        </p>
                      </div>
                      <p className="text-xs text-orange-700 mt-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Giá tham khảo - Người bán có thể báo giá khác
                      </p>
                    </div>

                    {/* Ngân sách - hiển thị có điều kiện */}
                    {rfq.budget && (
                      <div className="bg-white border-2 border-emerald-300 p-4 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-emerald-600 font-medium">Ngân sách dự kiến</p>
                            <p className="text-sm font-bold text-emerald-900">
                              {formatCurrency(rfq.budget)} {rfq.currency || 'VND'}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-emerald-600 mt-2 italic">
                          {numberToVietnameseWords(rfq.budget)} đồng
                        </p>
                      </div>
                    )}

                    {/* Địa điểm giao hàng - full width nếu có */}
                    {rfq.delivery_location && (
                      <div className="bg-white border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow md:col-span-2 lg:col-span-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium">Địa điểm giao hàng</p>
                            <p className="text-sm font-semibold text-gray-900">{rfq.delivery_location}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dịch vụ kèm theo - full width */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow md:col-span-2 lg:col-span-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Star className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium mb-2">Dịch vụ kèm theo</p>
                          <div className="flex flex-wrap gap-2">
                            {rfq.services_json?.inspection && (
                              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Giám định
                              </Badge>
                            )}
                            {rfq.services_json?.certification && (
                              <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Chứng nhận
                              </Badge>
                            )}
                            {rfq.services_json?.repair_estimate && (
                              <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ước tính sửa chữa
                              </Badge>
                            )}
                            {rfq.services_json?.delivery_estimate && (
                              <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ước tính vận chuyển
                              </Badge>
                            )}
                            {(!rfq.services_json || Object.values(rfq.services_json).every(v => !v)) && (
                              <span className="text-xs text-gray-400">Không có dịch vụ kèm theo</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Containers Section - NEW */}
              {rfq.selected_container_ids && rfq.selected_container_ids.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="p-2 bg-cyan-600 rounded-lg">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      Containers đã chọn ({rfq.selected_container_ids.length})
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-200">
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">
                          Người mua đã chọn {rfq.selected_container_ids.length} container cụ thể cho RFQ này
                        </span>
                      </div>
                    </div>
                    
                    <div className="overflow-hidden border border-gray-200 rounded-xl">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                          <tr>
                            <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">#</th>
                            <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Container ISO Code</th>
                            <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Hãng tàu</th>
                            <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Năm SX</th>
                            <th className="text-center py-3 px-4 font-bold text-gray-700 text-sm">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {rfq.selected_containers_details && rfq.selected_containers_details.length > 0 ? (
                            // Hiển thị thông tin chi tiết nếu có
                            rfq.selected_containers_details.map((container, index) => (
                              <tr 
                                key={container.id} 
                                className={`hover:bg-blue-50 transition-colors ${
                                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                }`}
                              >
                                <td className="py-3 px-4 text-gray-600 font-medium text-sm">
                                  {index + 1}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="font-mono font-bold text-blue-700 text-base">
                                      {container.container_iso_code}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  {container.shipping_line ? (
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-semibold">
                                      {container.shipping_line}
                                    </Badge>
                                  ) : (
                                    <span className="text-gray-400 text-sm">N/A</span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  {container.manufactured_year ? (
                                    <span className="text-gray-900 font-semibold">
                                      {container.manufactured_year}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-sm">N/A</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <Badge 
                                    variant="default"
                                    className={
                                      container.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 border-green-200 text-xs font-semibold' :
                                      container.status === 'RESERVED' ? 'bg-purple-100 text-purple-700 border-purple-200 text-xs font-semibold' :
                                      container.status === 'SOLD' ? 'bg-gray-100 text-gray-700 border-gray-200 text-xs font-semibold' :
                                      container.status === 'RENTED' ? 'bg-blue-100 text-blue-700 border-blue-200 text-xs font-semibold' :
                                      container.status === 'IN_MAINTENANCE' ? 'bg-orange-100 text-orange-700 border-orange-200 text-xs font-semibold' :
                                      'bg-green-100 text-green-700 border-green-200 text-xs font-semibold'
                                    }
                                  >
                                    ✓ {
                                      container.status === 'AVAILABLE' ? 'Có sẵn' :
                                      container.status === 'RESERVED' ? 'Đã đặt trước' :
                                      container.status === 'SOLD' ? 'Đã bán' :
                                      container.status === 'RENTED' ? 'Đang cho thuê' :
                                      container.status === 'IN_MAINTENANCE' ? 'Bảo trì' :
                                      'Có sẵn'
                                    }
                                  </Badge>
                                </td>
                              </tr>
                            ))
                          ) : (
                            // Hiển thị chỉ ISO code nếu không có thông tin chi tiết
                            rfq.selected_container_ids.map((isoCode, index) => (
                              <tr 
                                key={isoCode} 
                                className={`hover:bg-blue-50 transition-colors ${
                                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                }`}
                              >
                                <td className="py-3 px-4 text-gray-600 font-medium text-sm">
                                  {index + 1}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="font-mono font-bold text-blue-700 text-base">
                                      {isoCode}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-gray-400 text-sm">N/A</td>
                                <td className="py-3 px-4 text-gray-400 text-sm">N/A</td>
                                <td className="py-3 px-4 text-center">
                                  <Badge 
                                    variant="default"
                                    className="bg-green-100 text-green-700 border-green-200 text-xs font-semibold"
                                  >
                                    ✓ Đã chọn
                                  </Badge>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
                          <p>Báo giá của bạn cần bao gồm chính xác {rfq.selected_container_ids.length} container đã được khách hàng chọn ở trên.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Listing Information with enhanced design */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 rounded-lg">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    Thông tin Container
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{rfq.listings.title}</h3>
                      {rfq.listings.description && (
                        <p className="text-gray-600 text-sm leading-relaxed">{rfq.listings.description}</p>
                      )}
                    </div>

                    {/* Main Info Grid */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Deal Type */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-blue-700 font-medium">Loại giao dịch</p>
                            <p className="text-lg font-bold text-blue-900">
                              {getDealTypeDisplayName(rfq.listings.deal_type)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-emerald-700 font-medium">Giá niêm yết</p>
                            <p className="text-lg font-bold text-emerald-900">
                              {formatCurrency(parseInt(rfq.listings.price_amount))} {rfq.listings.price_currency}
                              {rfq.listings.deal_type === 'RENTAL' && rfq.listings.rental_unit && (
                                <span className="text-sm font-normal">/{rfq.listings.rental_unit === 'YEAR' ? 'năm' : rfq.listings.rental_unit === 'QUARTER' ? 'quý' : 'tháng'}</span>
                              )}
                            </p>
                            <p className="text-xs text-emerald-600 italic mt-1">
                              {numberToVietnameseWords(parseInt(rfq.listings.price_amount))} đồng
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Rental Duration - only for RENTAL listing */}
                      {rfq.listings?.deal_type === 'RENTAL' && rfq.rental_duration_months && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-400 p-4 rounded-lg md:col-span-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                              <Clock className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-blue-700 font-medium">Thời gian thuê yêu cầu</p>
                              <p className="text-2xl font-bold text-blue-900">
                                {convertMonthsToRentalUnit(rfq.rental_duration_months, rfq.listings.rental_unit || 'MONTH')} {rfq.listings.rental_unit === 'YEAR' ? 'năm' : rfq.listings.rental_unit === 'QUARTER' ? 'quý' : 'tháng'}
                              </p>
                              {rfq.listings.min_rental_duration && rfq.listings.max_rental_duration && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Seller cho phép từ {rfq.listings.min_rental_duration} đến {rfq.listings.max_rental_duration} {rfq.listings.rental_unit === 'YEAR' ? 'năm' : rfq.listings.rental_unit === 'QUARTER' ? 'quý' : 'tháng'}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Seller & Status Info */}
                    <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Người bán</p>
                          <p className="text-sm font-bold text-gray-900">{rfq.listings.users.display_name}</p>
                          <p className="text-xs text-gray-500">{rfq.listings.users.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Trạng thái listing</p>
                          <Badge 
                            variant={rfq.listings.status === 'ACTIVE' ? 'default' : 'secondary'} 
                            className="mt-1"
                          >
                            {rfq.listings.status === 'ACTIVE' ? '✓ Đang hoạt động' : rfq.listings.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quotes with enhanced design */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-amber-600 rounded-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    Báo giá ({rfq.quotes.length})
                  </h2>
                </div>
                <div className="p-6">
                  {/* Alert for seller to send quote - Enhanced with more info */}
                  {rfq.current_user_id && 
                   rfq.current_user_id === rfq.listings?.users?.id && 
                   rfq.status === 'SUBMITTED' && 
                   !rfq.quotes?.some(q => q.seller_id === rfq.current_user_id) && (
                    <div className="mb-6 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-300 rounded-xl p-6 shadow-2xl animate-pulse-slow">
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-full shadow-lg animate-bounce-slow">
                          <DollarSign className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
                            🎯 Cơ hội kinh doanh mới!
                          </h3>
                          <div className="bg-white rounded-lg p-4 mb-4 border border-purple-200">
                            <p className="text-purple-800 font-medium mb-3">
                              Khách hàng <strong className="text-purple-900 text-lg">{rfq.users.display_name}</strong> đã gửi yêu cầu báo giá cho container của bạn:
                            </p>
                            <div className="grid md:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 bg-purple-50 p-2 rounded">
                                <Package className="h-4 w-4 text-purple-600" />
                                <span className="text-purple-700">
                                  <strong>Container:</strong> {rfq.listings.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 bg-indigo-50 p-2 rounded">
                                <DollarSign className="h-4 w-4 text-indigo-600" />
                                <span className="text-indigo-700">
                                  <strong>Số lượng:</strong> {rfq.quantity} container
                                </span>
                              </div>
                              <div className="flex items-center gap-2 bg-blue-50 p-2 rounded">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span className="text-blue-700">
                                  <strong>Cần trước:</strong> {new Date(rfq.need_by).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 bg-purple-50 p-2 rounded">
                                <User className="h-4 w-4 text-purple-600" />
                                <span className="text-purple-700">
                                  <strong>Mục đích:</strong> {rfq.purpose === 'PURCHASE' ? 'Mua' : rfq.purpose === 'RENTAL' ? 'Thuê' : 'Hỏi thông tin'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-4">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                              <div className="text-sm text-yellow-800">
                                <p className="font-semibold mb-1">⏰ Hành động nhanh để không bỏ lỡ cơ hội!</p>
                                <p>Gửi báo giá càng sớm càng tốt để tăng khả năng được khách hàng chọn.</p>
                              </div>
                            </div>
                          </div>
                          
                          <Button 
                            size="lg"
                            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-2xl h-14 text-lg"
                            onClick={() => router.push(`/quotes/create?rfqId=${rfq.id}`)}
                          >
                            <DollarSign className="mr-2 h-6 w-6" />
                            💰 Gửi báo giá ngay - Tăng doanh thu!
                          </Button>
                          
                          <p className="text-xs text-purple-600 text-center mt-3 italic">
                            ✨ Khách hàng đang chờ phản hồi từ bạn
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {rfq.quotes.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-10 w-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-lg">Chưa có báo giá nào</p>
                      <p className="text-gray-400 text-sm mt-2">Báo giá sẽ hiển thị ở đây khi có người bán gửi</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                  {rfq.quotes.map((quote) => (
                    <div key={quote.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                      {/* Header với gradient nhẹ nhàng */}
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-5 border-b border-blue-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white border-2 border-purple-200 rounded-full flex items-center justify-center shadow-md">
                              <User className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="text-gray-900">
                              <h4 className="font-bold text-lg">
                                {quote.users.display_name}
                              </h4>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Báo giá ngày {new Date(quote.created_at).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            {getQuoteStatusBadge(quote.status)}
                            {quote.valid_until && (
                              <Badge variant="outline" className="bg-white text-blue-700 border-blue-300">
                                <Clock className="h-3 w-3 mr-1" />
                                Hết hạn: {new Date(quote.valid_until).toLocaleDateString('vi-VN')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-5">
                        {/* Thông tin loại giao dịch và thời gian thuê */}
                        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                                <Package className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-indigo-600 font-medium">Loại giao dịch</p>
                                <p className="text-sm font-bold text-indigo-800">
                                  {rfq.purpose === 'RENTAL' ? '🏠 CHO THUÊ' : rfq.purpose === 'PURCHASE' ? '💰 BÁN' : 'Hỏi thông tin'}
                                </p>
                              </div>
                            </div>
                            
                            {rfq.purpose === 'RENTAL' && rfq.rental_duration_months && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                  <Clock className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-blue-600 font-medium">Thời gian thuê</p>
                                  <p className="text-sm font-bold text-blue-800">
                                    {convertMonthsToRentalUnit(rfq.rental_duration_months, rfq.listings.rental_unit || 'MONTH')} {rfq.listings.rental_unit === 'YEAR' ? 'năm' : rfq.listings.rental_unit === 'QUARTER' ? 'quý' : 'tháng'}
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                <Package className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-purple-600 font-medium">Số lượng</p>
                                <p className="text-sm font-bold text-purple-800">
                                  {rfq.quantity} container
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Chi tiết báo giá */}
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h5 className="font-bold mb-2 text-sm text-blue-900 flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              Chi tiết báo giá
                            </h5>
                            <div className="space-y-2 text-sm">
                              {quote.quote_items && quote.quote_items.length > 0 ? (
                                quote.quote_items.map((item, index) => (
                                  <div key={index} className="bg-white p-2 rounded border border-blue-100">
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="font-medium text-xs text-gray-700">{item.description}</span>
                                      <span className="font-bold text-xs text-blue-900">{formatCurrency(item.unit_price)} {quote.currency}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 text-[10px] text-gray-600">
                                      <span className="bg-blue-100 px-1.5 py-0.5 rounded">Số lượng: {item.qty}</span>
                                      {rfq.purpose === 'RENTAL' && rfq.rental_duration_months && (
                                        <>
                                          <span className="bg-indigo-100 px-1.5 py-0.5 rounded">
                                            Thời gian: {convertMonthsToRentalUnit(rfq.rental_duration_months, rfq.listings.rental_unit || 'MONTH')} {rfq.listings.rental_unit === 'YEAR' ? 'năm' : rfq.listings.rental_unit === 'QUARTER' ? 'quý' : 'tháng'}
                                          </span>
                                          <span className="bg-purple-100 px-1.5 py-0.5 rounded">
                                            {formatCurrency(item.unit_price)}/{rfq.listings.rental_unit === 'YEAR' ? 'năm' : rfq.listings.rental_unit === 'QUARTER' ? 'quý' : 'tháng'}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    <div className="mt-1.5 pt-1.5 border-t border-blue-100 flex justify-between">
                                      <span className="text-[10px] font-medium text-gray-600">Thành tiền:</span>
                                      <span className="text-xs font-bold text-blue-900">
                                        {formatCurrency(item.unit_price * item.qty * (rfq.purpose === 'RENTAL' && rfq.rental_duration_months ? convertMonthsToRentalUnit(rfq.rental_duration_months, rfq.listings.rental_unit || 'MONTH') : 1))} {quote.currency}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500 italic text-xs">Chưa có chi tiết báo giá</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <h5 className="font-bold mb-2 text-sm text-green-900 flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              Phân tích chi phí
                            </h5>
                            <div className="space-y-1.5 text-sm">
                              {quote.price_subtotal && (
                                <div className="flex justify-between items-center bg-white p-2 rounded border border-green-100">
                                  <span className="text-xs text-gray-600">Tạm tính:</span>
                                  <span className="font-bold text-xs text-green-900">{formatCurrency(quote.price_subtotal)} {quote.currency}</span>
                                </div>
                              )}
                              {quote.fees_json?.platform && (
                                <div className="flex justify-between items-center bg-white p-2 rounded border border-green-100">
                                  <span className="text-xs text-gray-600">Phí nền tảng:</span>
                                  <span className="font-bold text-xs text-green-900">{formatCurrency(quote.fees_json.platform)} {quote.currency}</span>
                                </div>
                              )}
                              {quote.fees_json?.inspection && (
                                <div className="flex justify-between items-center bg-white p-2 rounded border border-green-100">
                                  <span className="text-xs text-gray-600">Phí giám định:</span>
                                  <span className="font-bold text-xs text-green-900">{formatCurrency(quote.fees_json.inspection)} {quote.currency}</span>
                                </div>
                              )}
                              {quote.total && (
                                <>
                                  <Separator className="my-1.5 bg-green-300" />
                                  <div className="flex justify-between items-center bg-white p-2 rounded border-2 border-green-600">
                                    <span className="text-green-900 font-bold text-sm">Tổng cộng:</span>
                                    <span className="text-green-600 font-black text-base">{formatPrice(quote.total)}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="p-4 pt-0">
                        {(quote.status === 'sent' || quote.status === 'SENT' || quote.status === 'pending') && (
                          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-lg p-4 shadow-md">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center animate-pulse">
                                <AlertTriangle className="h-4 w-4 text-white" />
                              </div>
                              <p className="text-sm font-bold text-indigo-900">
                                ⏰ Báo giá đang chờ phản hồi của bạn
                              </p>
                            </div>
                            
                            <div className="flex flex-col gap-3 mb-3">
                              <Button 
                                onClick={() => handleQuoteAction(quote.id, 'accept')}
                                disabled={actionLoading === quote.id}
                                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all duration-300 h-14 font-bold text-base rounded-lg border border-teal-700"
                                size="lg"
                              >
                                <CheckCircle className="mr-2 h-6 w-6" />
                                {actionLoading === quote.id && actionLoading === quote.id 
                                  ? '⏳ Đang xử lý...' 
                                  : '✓ Chấp nhận & Tạo Order'}
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => handleQuoteAction(quote.id, 'reject')}
                                disabled={actionLoading === quote.id}
                                className="w-full border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md transition-all h-10 font-semibold text-sm rounded-lg"
                                size="default"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                {actionLoading === quote.id ? 'Đang xử lý...' : 'Từ chối'}
                              </Button>
                            </div>
                            
                            <div className="bg-white border-l-4 border-blue-500 p-2 rounded shadow-sm">
                              <p className="text-xs text-gray-700 flex items-start gap-1.5">
                                <span className="text-base">💡</span>
                                <span>
                                  <strong className="text-blue-900">Lưu ý:</strong> Khi chấp nhận báo giá, hệ thống sẽ tự động tạo đơn hàng.
                                </span>
                              </p>
                            </div>
                          </div>
                        )}

                        {(quote.status === 'accepted' || quote.status === 'ACCEPTED') && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-5 shadow-md">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-7 w-7 text-white" />
                              </div>
                              <div>
                                <p className="font-bold text-green-900 text-lg">✅ Báo giá đã được chấp nhận</p>
                                <p className="text-sm text-green-700 mt-1">
                                  Đơn hàng đã được tạo. Vui lòng kiểm tra trong mục "Đơn hàng" để tiến hành thanh toán.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {(quote.status === 'rejected' || quote.status === 'REJECTED' || 
                          quote.status === 'declined' || quote.status === 'DECLINED') && (
                          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-400 rounded-xl p-5 shadow-md">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                                <XCircle className="h-7 w-7 text-white" />
                              </div>
                              <div>
                                <p className="font-bold text-red-900 text-lg">❌ Báo giá đã bị từ chối</p>
                                <p className="text-sm text-red-700 mt-1">
                                  Bạn có thể liên hệ với người bán để thương lượng lại hoặc tạo RFQ mới.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Fallback: Always show buttons if no accepted/rejected status */}
                        {!(quote.status === 'accepted' || quote.status === 'ACCEPTED' || 
                           quote.status === 'rejected' || quote.status === 'REJECTED' ||
                           quote.status === 'declined' || quote.status === 'DECLINED') && 
                         !(quote.status === 'sent' || quote.status === 'SENT' || quote.status === 'pending' || 
                           quote.status === 'draft' || quote.status === 'DRAFT') && (
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            {/* <p className="text-sm text-muted-foreground">Status: {quote.status}</p> */}
                            <div className="flex gap-3">
                              <Button 
                                onClick={() => handleQuoteAction(quote.id, 'accept')}
                                disabled={actionLoading === quote.id}
                                className="flex-1"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {actionLoading === quote.id ? 'Đang xử lý...' : 'Chấp nhận & Tạo Order'}
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => handleQuoteAction(quote.id, 'reject')}
                                disabled={actionLoading === quote.id}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Từ chối
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Sidebar - Takes 1 column on xl screens */}
            <div className="xl:col-span-1 space-y-6">
              {/* Buyer Information with enhanced design */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    Người mua
                  </h2>
                </div>
                <div className="p-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-900">{rfq.users.display_name}</p>
                      <p className="text-gray-600">{rfq.users.email}</p>
                      <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg">
                        Gửi RFQ ngày {new Date(rfq.submitted_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline with enhanced design */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    Timeline
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mt-1 shadow-sm"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">RFQ được gửi</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(rfq.submitted_at).toLocaleString('vi-VN')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Bởi {rfq.users.display_name}
                        </p>
                      </div>
                    </div>
                    
                    {rfq.quotes.length > 0 && (
                      <div className="flex items-start gap-4">
                        <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mt-1 shadow-sm"></div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Nhận được báo giá</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {rfq.quotes.length} báo giá đã nhận
                          </p>
                          {rfq.quotes[0] && (
                            <p className="text-xs text-gray-500 mt-1">
                              Mới nhất: {new Date(rfq.quotes[0].created_at).toLocaleString('vi-VN')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {rfq.status === 'SUBMITTED' && (
                      <div className="flex items-start gap-4">
                        <div className={`w-4 h-4 rounded-full mt-1 shadow-sm ${
                          new Date(rfq.expired_at) > new Date() 
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse' 
                            : 'bg-gradient-to-r from-red-500 to-red-600'
                        }`}></div>
                        <div className="flex-1">
                          <p className={`font-semibold ${
                            new Date(rfq.expired_at) > new Date() ? 'text-yellow-700' : 'text-red-700'
                          }`}>
                            {new Date(rfq.expired_at) > new Date() ? 'Đang chờ phản hồi' : 'Đã hết hạn'}
                          </p>
                          <p className={`text-sm mt-1 ${
                            new Date(rfq.expired_at) > new Date() ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            Hạn cuối: {new Date(rfq.expired_at).toLocaleString('vi-VN')}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(() => {
                              const daysLeft = Math.ceil((new Date(rfq.expired_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                              if (daysLeft > 0) {
                                return `⏰ Còn ${daysLeft} ngày để gửi báo giá`;
                              } else if (daysLeft === 0) {
                                return '⚠️ Hết hạn hôm nay';
                              } else {
                                return `❌ Đã quá hạn ${Math.abs(daysLeft)} ngày`;
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {rfq.status === 'ACCEPTED' && (
                      <div className="flex items-start gap-4">
                        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full mt-1 shadow-sm"></div>
                        <div className="flex-1">
                          <p className="font-semibold text-green-700">✅ RFQ đã hoàn thành</p>
                          <p className="text-sm text-green-600 mt-1">
                            Báo giá đã được chấp nhận
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions with Bold Button Design */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                      <ShoppingCart className="h-3 w-3 text-white" />
                    </div>
                    Hành động nhanh
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {/* Action 1: Gửi báo giá (Seller only) - Show ONLY if:
                      1. Current user is NOT the buyer (người mua không được tự báo giá)
                      2. RFQ status is SUBMITTED
                      3. Current user hasn't sent a quote yet */}
                  {rfq.current_user_id && 
                   rfq.current_user_id !== rfq.buyer_id && 
                   rfq.status === 'SUBMITTED' && 
                   !rfq.quotes?.some(q => q.seller_id === rfq.current_user_id) && (
                    <Button 
                      className="w-full h-14 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.03] transition-all duration-200 border-0 text-lg relative overflow-hidden"
                      onClick={() => router.push(`/quotes/create?rfqId=${rfq.id}`)}
                    >
                      {/* Animated background effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 animate-pulse"></div>
                      <div className="relative flex items-center justify-center w-full">
                        <DollarSign className="mr-3 h-6 w-6" />
                        <div className="flex flex-col">
                          <span className="text-lg">💰 Gửi báo giá ngay</span>
                          <span className="text-xs opacity-90 font-normal">
                            Phản hồi yêu cầu của khách hàng
                          </span>
                        </div>
                      </div>
                    </Button>
                  )}
                  
                  {/* Action 2: Xem chi tiết container */}
                  <Button 
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 border-0"
                    onClick={() => router.push(`/listings/${rfq.listing_id}`)}
                  >
                    <Eye className="mr-3 h-5 w-5" />
                    <span>Xem chi tiết container</span>
                  </Button>
                  
                  {/* Action 3: Q&A với người bán */}
                  <Button 
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 border-0"
                    onClick={() => {
                      router.push(`/messages?sellerId=${rfq.listings.users.id}&listingId=${rfq.listing_id}`);
                    }}
                  >
                    <MessageSquare className="mr-3 h-5 w-5" />
                    <span>Q&A với người bán</span>
                  </Button>
                  
                  {/* Action 3: Tạo đơn hàng ngay (Primary action) */}
                  {rfq.quotes.length > 0 && (
                    <div className="relative">
                      <Button 
                        className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.03] transition-all duration-200 border-0 text-lg relative overflow-hidden"
                        onClick={() => {
                          const bestQuote = rfq.quotes[0];
                          const price = bestQuote.total || bestQuote.price_subtotal || 0;
                          router.push(`/orders/create?listingId=${rfq.listing_id}&rfqId=${rfq.id}&price=${price}`);
                        }}
                      >
                        {/* Animated background effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 animate-pulse"></div>
                        <div className="relative flex items-center justify-center w-full">
                          <Package className="mr-3 h-6 w-6" />
                          <div className="flex flex-col">
                            <span className="text-lg">🚀 Tạo đơn hàng ngay</span>
                            <span className="text-xs opacity-90 font-normal">
                              Giá từ {rfq.quotes.length > 0 ? 
                                formatPrice(rfq.quotes[0]?.total || rfq.quotes[0]?.price_subtotal || 0)
                                : 'Chưa có báo giá'}
                            </span>
                            {rfq.quotes.length > 0 && (
                              <span className="text-xs opacity-75 font-normal italic">
                                ({numberToVietnameseWords(rfq.quotes[0]?.total || rfq.quotes[0]?.price_subtotal || 0)} đồng)
                              </span>
                            )}
                          </div>
                        </div>
                      </Button>
                    </div>
                  )}
                  
                  {/* Security note */}
                  <div className="pt-3 mt-4 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <div className="w-3 h-3 bg-green-100 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                      </div>
                      Thanh toán an toàn qua hệ thống Escrow
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}