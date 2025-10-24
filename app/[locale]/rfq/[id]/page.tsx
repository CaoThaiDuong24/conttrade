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
import { getDealTypeLabel } from '@/lib/utils/listingStatus';

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
  services_json: {
    inspection?: boolean;
    certification?: boolean;
    repair_estimate?: boolean;
    delivery_estimate?: boolean;
  };
  status: string;
  submitted_at: string;
  expired_at: string;
  title?: string;
  description?: string;
  delivery_location?: string;
  budget?: number;
  currency?: string;
  listings: {
    id: string;
    title: string;
    description?: string;
    price_amount: string;
    price_currency: string;
    deal_type: string;
    status: string;
    location_depot_id: string;
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

export default function RFQDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const { showSuccess, showError } = useNotificationContext();
  
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const rfqId = params.id as string;

  useEffect(() => {
    fetchRFQDetail();
  }, [rfqId]);

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
      
      // Get current user info
      try {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUserId(userData.data?.id);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
      
      // Call real API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/rfqs/${rfqId}`, {
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
        setRfq(data.data);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/quotes/${quoteId}/${action}`, {
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
        showSuccess('🎉 Đã chấp nhận báo giá thành công!');
        
        // Redirect to order detail if order was created
        if (result.data?.order) {
          const orderId = result.data.order.id;
          showSuccess(`✅ Đơn hàng ${orderId} đã được tạo. Đang chuyển hướng...`);
          setTimeout(() => {
            router.push(`/orders/${orderId}`);
          }, 1500);
          return;
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
    <div className="min-h-screen bg-gray-50">
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
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4" />
                        Mục đích sử dụng
                      </label>
                      <p className="text-gray-900 font-medium">
                        {rfq.purpose === 'PURCHASE' ? 'Mua container' : 
                         rfq.purpose === 'RENTAL' ? 'Thuê container' : 
                         rfq.purpose === 'INQUIRY' ? 'Hỏi thông tin' :
                         rfq.purpose || 'Không rõ'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4" />
                        Số lượng
                      </label>
                      <p className="text-gray-900 font-medium">{rfq.quantity} container</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4" />
                        Cần trước ngày
                      </label>
                      <p className="text-gray-900 font-medium">{new Date(rfq.need_by).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4" />
                        Dịch vụ kèm theo
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {rfq.services_json?.inspection && <Badge variant="secondary" className="bg-blue-100 text-blue-800">Giám định</Badge>}
                        {rfq.services_json?.certification && <Badge variant="secondary" className="bg-green-100 text-green-800">Chứng nhận</Badge>}
                        {rfq.services_json?.repair_estimate && <Badge variant="secondary" className="bg-orange-100 text-orange-800">Ước tính sửa chữa</Badge>}
                        {rfq.services_json?.delivery_estimate && <Badge variant="secondary" className="bg-purple-100 text-purple-800">Ước tính vận chuyển</Badge>}
                        {!rfq.services_json || Object.values(rfq.services_json).every(v => !v) && (
                          <span className="text-sm text-gray-500">Không có dịch vụ kèm theo</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">{rfq.listings.title}</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                          <div className="p-2 bg-blue-600 rounded-lg">
                            <Package className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Loại giao dịch</p>
                            <p className="font-semibold text-gray-900">
                              {getDealTypeLabel(rfq.listings.deal_type)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                          <div className="p-2 bg-emerald-600 rounded-lg">
                            <DollarSign className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Giá niêm yết</p>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(parseInt(rfq.listings.price_amount))} {rfq.listings.price_currency}
                            </p>
                            <p className="text-xs text-gray-500 italic mt-1">
                              ({numberToVietnameseWords(parseInt(rfq.listings.price_amount))} đồng)
                            </p>
                          </div>
                        </div>
                      </div>
                      {rfq.listings.description && (
                        <div className="mt-4 p-4 bg-white rounded-lg">
                          <p className="text-gray-700">{rfq.listings.description}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                        <User className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Người bán</p>
                          <p className="font-semibold text-gray-900">{rfq.listings.users.display_name}</p>
                          <p className="text-sm text-gray-500">{rfq.listings.users.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-sm text-gray-600">Trạng thái listing</p>
                          <Badge variant={rfq.listings.status === 'ACTIVE' ? 'default' : 'secondary'} className="mt-1">
                            {rfq.listings.status === 'ACTIVE' ? 'Đang hoạt động' : rfq.listings.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quotes with enhanced design */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-yellow-600 rounded-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    Báo giá ({rfq.quotes.length})
                  </h2>
                </div>
                <div className="p-6">
                  {/* Alert for seller to send quote */}
                  {currentUserId && 
                   currentUserId === rfq.listings.users.id && 
                   rfq.status === 'SUBMITTED' && 
                   !rfq.quotes.some(q => q.seller_id === currentUserId) && (
                    <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-6 shadow-lg">
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-full shadow-lg">
                          <AlertTriangle className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-purple-800 mb-2">
                            🎯 Đây là RFQ cho container của bạn!
                          </h3>
                          <p className="text-purple-700 mb-4">
                            Khách hàng <strong>{rfq.users.display_name}</strong> quan tâm đến container của bạn và muốn nhận báo giá. 
                            Hãy gửi báo giá để tăng cơ hội bán hàng!
                          </p>
                          <Button 
                            size="lg"
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold shadow-lg hover:shadow-xl"
                            onClick={() => router.push(`/quotes/create?rfqId=${rfq.id}`)}
                          >
                            <DollarSign className="mr-2 h-5 w-5" />
                            💰 Gửi báo giá ngay
                          </Button>
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
                    <div key={quote.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">
                            {quote.users.display_name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Báo giá ngày {new Date(quote.created_at).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getQuoteStatusBadge(quote.status)}
                          {quote.valid_until && (
                            <Badge variant="outline">
                              Hết hạn: {new Date(quote.valid_until).toLocaleDateString('vi-VN')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h5 className="font-medium mb-2">Chi tiết báo giá</h5>
                          <div className="space-y-2 text-sm">
                            {quote.quote_items && quote.quote_items.length > 0 ? (
                              quote.quote_items.map((item, index) => (
                                <div key={index} className="flex justify-between">
                                  <span>{item.description} (x{item.qty})</span>
                                  <span>{formatCurrency(item.unit_price)} {quote.currency}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-muted-foreground">Chưa có chi tiết báo giá</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Tổng chi phí</h5>
                          <div className="space-y-2 text-sm">
                            {quote.price_subtotal && (
                              <div className="flex justify-between">
                                <span>Tạm tính:</span>
                                <span>{formatCurrency(quote.price_subtotal)} {quote.currency}</span>
                              </div>
                            )}
                            {quote.fees_json?.platform && (
                              <div className="flex justify-between">
                                <span>Phí nền tảng:</span>
                                <span>{formatCurrency(quote.fees_json.platform)} {quote.currency}</span>
                              </div>
                            )}
                            {quote.fees_json?.inspection && (
                              <div className="flex justify-between">
                                <span>Phí giám định:</span>
                                <span>{formatCurrency(quote.fees_json.inspection)} {quote.currency}</span>
                              </div>
                            )}
                            {quote.total && (
                              <>
                                <Separator />
                                <div className="flex justify-between items-center">
                                  <span>Tổng cộng:</span>
                                  <span>{formatPrice(quote.total)}</span>
                                </div>
                                <div className="mt-2 text-xs text-gray-600 italic">
                                  ({numberToVietnameseWords(quote.total)} đồng)
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {(quote.status === 'sent' || quote.status === 'SENT' || quote.status === 'pending') && (
                        <div className="space-y-3 mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                            <AlertTriangle className="h-4 w-4" />
                            Báo giá đang chờ phản hồi của bạn
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <Button 
                              onClick={() => handleQuoteAction(quote.id, 'accept')}
                              disabled={actionLoading === quote.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              size="lg"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {actionLoading === quote.id && actionLoading === quote.id 
                                ? 'Đang xử lý...' 
                                : 'Chấp nhận báo giá'}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => handleQuoteAction(quote.id, 'reject')}
                              disabled={actionLoading === quote.id}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              size="lg"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              {actionLoading === quote.id ? 'Đang xử lý...' : 'Từ chối báo giá'}
                            </Button>
                          </div>
                          
                          <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                            💡 <strong>Lưu ý:</strong> Khi chấp nhận báo giá, hệ thống sẽ tự động tạo đơn hàng và chuyển bạn đến trang thanh toán.
                          </div>
                        </div>
                      )}

                      {(quote.status === 'accepted' || quote.status === 'ACCEPTED') && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Báo giá đã được chấp nhận</span>
                          </div>
                          <p className="text-sm text-green-600 mt-1">
                            Đơn hàng đã được tạo. Vui lòng kiểm tra trong mục "Đơn hàng" để tiến hành thanh toán.
                          </p>
                        </div>
                      )}

                      {(quote.status === 'rejected' || quote.status === 'REJECTED' || 
                        quote.status === 'declined' || quote.status === 'DECLINED') && (
                        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center gap-2 text-red-700">
                            <XCircle className="h-5 w-5" />
                            <span className="font-medium">Báo giá đã bị từ chối</span>
                          </div>
                          <p className="text-sm text-red-600 mt-1">
                            Bạn có thể liên hệ với người bán để thương lượng lại hoặc tạo RFQ mới.
                          </p>
                        </div>
                      )}

                      {/* Fallback: Always show buttons if no accepted/rejected status */}
                      {!(quote.status === 'accepted' || quote.status === 'ACCEPTED' || 
                         quote.status === 'rejected' || quote.status === 'REJECTED' ||
                         quote.status === 'declined' || quote.status === 'DECLINED') && 
                       !(quote.status === 'sent' || quote.status === 'SENT' || quote.status === 'pending' || 
                         quote.status === 'draft' || quote.status === 'DRAFT') && (
                        <div className="space-y-2 border-t pt-2">
                          <p className="text-sm text-muted-foreground">Status: {quote.status}</p>
                          <div className="flex gap-2">
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
                        <p className="font-semibold text-gray-900">RFQ được tạo</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(rfq.submitted_at).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mt-1 shadow-sm"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Nhận được báo giá</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {rfq.quotes.length} báo giá
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mt-1 shadow-sm animate-pulse"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-yellow-700">Chờ phản hồi của bạn</p>
                        <p className="text-sm text-yellow-600 mt-1">
                          Hãy xem xét và phản hồi báo giá
                        </p>
                      </div>
                    </div>
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
                  {/* Action 1: Gửi báo giá (Seller only) - Show if current user hasn't sent a quote yet */}
                  {currentUserId && rfq.status === 'SUBMITTED' && !rfq.quotes.some(q => q.seller_id === currentUserId) && (
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