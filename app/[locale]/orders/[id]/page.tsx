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
import { formatVND, formatPrice } from '@/lib/currency';
import { 
  Package, 
  User, 
  Calendar, 
  DollarSign, 
  Truck, 
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Download,
  Star,
  MessageSquare,
  Box,
  Building2,
  CreditCard,
  ShoppingCart,
  Shield,
  Info,
  Receipt
} from 'lucide-react';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { apiClient } from '@/lib/api';
import TransportationBookingModal from '@/components/orders/transportation-booking-modal';
import { 
  DeliveryWorkflowStatus, 
  PrepareDeliveryForm, 
  MarkReadyForm,
  StartDeliveringForm,
  UpdateDeliveryStatusForm,
  MarkDeliveredForm,
  ConfirmReceiptForm,
  RaiseDisputeForm 
} from '@/components/orders';
import { PaymentVerificationAlert } from '@/components/orders/PaymentVerificationAlert';
import { useAuth } from '@/components/providers/auth-context';

interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  quote_id?: string;
  status: string;
  subtotal: number;
  tax: number;
  fees: number;
  total: number;
  currency: string;
  created_at: string;
  updated_at: string;
  delivered_at?: string;
  receipt_confirmed_at?: string;
  receipt_confirmed_by?: string;
  receipt_data_json?: {
    received_at?: string;
    received_by?: string;
    condition?: 'GOOD' | 'MINOR_DAMAGE' | 'MAJOR_DAMAGE';
    notes?: string;
    photos?: string[];
    confirmed_at?: string;
  };
  listings?: {
    id: string;
    title: string;
    description: string;
    containers?: {
      size_ft: number;
      type: string;
      condition: string;
      serial_no: string;
    };
    depots?: {
      name: string;
      address: string;
    };
  };
  users_orders_buyer_idTousers?: {
    id: string;
    display_name: string;
    email: string;
  };
  users_orders_seller_idTousers?: {
    id: string;
    display_name: string;
    email: string;
  };
  order_items?: Array<{
    id: string;
    item_type: string;
    description: string;
    qty: number;
    unit_price: number;
    total_price: number;
  }>;
  payments?: Array<{
    id: string;
    method: string;
    status: string;
    provider: string;
    amount: number;
    currency: string;
    transaction_id?: string;
    escrow_account_ref?: string;
    paid_at?: string;
    released_at?: string;
    escrow_hold_until?: string;
    created_at: string;
  }>;
  deliveries?: Array<{
    id: string;
    status: string;
    created_at: string;
    delivery_method?: string;
    tracking_number?: string;
    estimated_arrival?: string;
    actual_arrival?: string;
    pickup_location?: string;
    delivery_location?: string;
    delivery_address?: string;
    carrier_name?: string;
    carrier_contact?: string;
    notes?: string;
  }>;  documents?: Array<{
    id: string;
    docType: string;
    number: string;
    fileUrl: string;
    issuedAt: string;
  }>;
  order_number?: string;
}

export default function OrderDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const { showSuccess, showError } = useNotificationContext();
  const { user } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isTransportationModalOpen, setIsTransportationModalOpen] = useState(false);
  const [showPrepareForm, setShowPrepareForm] = useState(false);
  const [showMarkReadyForm, setShowMarkReadyForm] = useState(false);
  const [showStartDeliveringForm, setShowStartDeliveringForm] = useState(false);
  const [showUpdateDeliveryForm, setShowUpdateDeliveryForm] = useState(false);
  const [showMarkDeliveredForm, setShowMarkDeliveredForm] = useState(false);
  const [showConfirmReceiptForm, setShowConfirmReceiptForm] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  const orderId = params.id as string;
  
  // Determine user role for this order
  const isSeller = user?.id && order?.seller_id && (user.id === order.seller_id || user.id.toString() === order.seller_id.toString());
  const isBuyer = user?.id && order?.buyer_id && (user.id === order.buyer_id || user.id.toString() === order.buyer_id.toString());

  useEffect(() => {
    fetchOrderDetail();
    fetchOrderReviews();
  }, [orderId]);

  const fetchOrderReviews = async () => {
    try {
      setLoadingReviews(true);
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006'}/api/v1/reviews/order/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setReviews(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      
      // Call API to get order detail from database
      const token = localStorage.getItem('accessToken');
      if (!token) {
        showError('Vui lòng đăng nhập để xem đơn hàng');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006'}/api/v1/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data) {
          setOrder(result.data);
          return;
        }
      }
      
      // If API fails, show error
      showError('Không thể tải thông tin đơn hàng từ server. Vui lòng thử lại sau.');
      setOrder(null);
      
    } catch (error) {
      showError('Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (verified: boolean, notes?: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        showError('Vui lòng đăng nhập');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006'}/api/v1/orders/${orderId}/payment-verify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ verified, notes })
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        showSuccess(
          verified 
            ? 'Đã xác nhận thanh toán thành công' 
            : 'Đã từ chối thanh toán'
        );
        // Reload order data
        await fetchOrderDetail();
      } else {
        showError(result.message || 'Không thể xử lý yêu cầu');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      showError('Lỗi kết nối. Vui lòng thử lại sau.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      created: { label: 'Đã tạo', variant: 'secondary' as const },
      CREATED: { label: 'Đã tạo', variant: 'secondary' as const },
      pending_payment: { label: 'Chờ thanh toán', variant: 'destructive' as const },
      PENDING_PAYMENT: { label: 'Chờ thanh toán', variant: 'destructive' as const },
      payment_pending_verification: { label: 'Chờ xác nhận thanh toán', variant: 'default' as const },
      PAYMENT_PENDING_VERIFICATION: { label: 'Chờ xác nhận thanh toán', variant: 'default' as const },
      awaiting_funds: { label: 'Chờ thanh toán', variant: 'destructive' as const },
      AWAITING_FUNDS: { label: 'Chờ thanh toán', variant: 'destructive' as const },
      escrow_funded: { label: 'Đã ký quỹ', variant: 'default' as const },
      ESCROW_FUNDED: { label: 'Đã ký quỹ', variant: 'default' as const },
      preparing_delivery: { label: 'Chuẩn bị giao hàng', variant: 'default' as const },
      PREPARING_DELIVERY: { label: 'Chuẩn bị giao hàng', variant: 'default' as const },
      ready_for_pickup: { label: 'Sẵn sàng lấy hàng', variant: 'default' as const },
      READY_FOR_PICKUP: { label: 'Sẵn sàng lấy hàng', variant: 'default' as const },
      documents_ready: { label: 'Chứng từ sẵn sàng', variant: 'default' as const },
      DOCUMENTS_READY: { label: 'Chứng từ sẵn sàng', variant: 'default' as const },
      transportation_booked: { label: 'Đã đặt vận chuyển', variant: 'default' as const },
      TRANSPORTATION_BOOKED: { label: 'Đã đặt vận chuyển', variant: 'default' as const },
      delivering: { label: 'Đang vận chuyển', variant: 'default' as const },
      DELIVERING: { label: 'Đang vận chuyển', variant: 'default' as const },
      in_transit: { label: 'Đang vận chuyển', variant: 'default' as const },
      IN_TRANSIT: { label: 'Đang vận chuyển', variant: 'default' as const },
      processing: { label: 'Đang xử lý', variant: 'default' as const },
      PROCESSING: { label: 'Đang xử lý', variant: 'default' as const },
      paid: { label: 'Đã thanh toán', variant: 'default' as const },
      PAID: { label: 'Đã thanh toán', variant: 'default' as const },
      shipped: { label: 'Đang giao', variant: 'default' as const },
      SHIPPED: { label: 'Đang giao', variant: 'default' as const },
      delivered: { label: 'Đã giao', variant: 'default' as const },
      DELIVERED: { label: 'Đã giao', variant: 'default' as const },
      completed: { label: 'Hoàn thành', variant: 'default' as const },
      COMPLETED: { label: 'Hoàn thành', variant: 'default' as const },
      payment_released: { label: 'Đã giải ngân', variant: 'default' as const },
      PAYMENT_RELEASED: { label: 'Đã giải ngân', variant: 'default' as const },
      cancelled: { label: 'Đã hủy', variant: 'destructive' as const },
      CANCELLED: { label: 'Đã hủy', variant: 'destructive' as const },
      disputed: { label: 'Tranh chấp', variant: 'destructive' as const },
      DISPUTED: { label: 'Tranh chấp', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.created;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDeliveryStatusBadge = (status: string) => {
    const statusConfig = {
      requested: { label: 'Đã yêu cầu', variant: 'secondary' as const },
      scheduled: { label: 'Đã lên lịch', variant: 'default' as const },
      picked_up: { label: 'Đã lấy hàng', variant: 'default' as const },
      in_transit: { label: 'Đang giao', variant: 'default' as const },
      delivered: { label: 'Đã giao', variant: 'default' as const },
      failed: { label: 'Giao thất bại', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.requested;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        {/* Breadcrumb skeleton */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        
        {/* Header skeleton */}
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
            <div className="space-y-2 flex-1">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-white border rounded-lg shadow-sm"></div>
            <div className="h-48 bg-white border rounded-lg shadow-sm"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-white border rounded-lg shadow-sm"></div>
            <div className="h-32 bg-white border rounded-lg shadow-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="max-w-md mx-4 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h1>
            <p className="text-gray-600 text-center mb-6">
              Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => router.back()}
                variant="outline"
                className="hover:bg-gray-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
              <Button 
                onClick={() => router.push('/orders')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Danh sách đơn hàng
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="bg-white border-b rounded-lg p-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span 
            className="hover:text-blue-600 cursor-pointer transition-colors"
            onClick={() => router.push('/')}
          >
            Trang chủ
          </span>
          <span>/</span>
          <span 
            className="hover:text-blue-600 cursor-pointer transition-colors"
            onClick={() => router.push('/orders')}
          >
            Đơn hàng
          </span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Chi tiết</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mt-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Mã đơn: <span className="font-mono text-gray-700">{order.order_number || order.id.slice(0, 8)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(order.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(order.status)}
            
            {/* Escrow Status Badge */}
            {(order.status === 'PAID' || order.status === 'paid' || order.status === 'ESCROW_FUNDED' || order.status === 'escrow_funded') && 
             order.payments?.[0]?.escrow_account_ref && !order.payments?.[0]?.released_at && (
              <Badge className="bg-amber-100 text-amber-800 border-2 border-amber-300 hover:bg-amber-200 px-3 py-1">
                <Shield className="h-3 w-3 mr-1" />
                Escrow đang giữ
              </Badge>
            )}
            
            {(order.status === 'COMPLETED' || order.status === 'completed') && 
             order.payments?.[0]?.released_at && (
              <Badge className="bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200 px-3 py-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                Đã giải ngân
              </Badge>
            )}
            
            {(order.status === 'pending_payment' || order.status === 'PENDING_PAYMENT' || order.status === 'awaiting_funds' || order.status === 'AWAITING_FUNDS' || order.status === 'created' || order.status === 'CREATED') && (
              <Button 
                onClick={() => router.push(`/orders/${order.id}/pay`)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md transition-all"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Thanh toán ngay
              </Button>
            )}
          </div>
        </div>
      </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <Package className="h-4 w-4 mr-2" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <Clock className="h-4 w-4 mr-2" />
              Lịch sử
            </TabsTrigger>
            <TabsTrigger value="delivery" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <Truck className="h-4 w-4 mr-2" />
              Vận chuyển
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <FileText className="h-4 w-4 mr-2" />
              Tài liệu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Items */}
                <Card className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="space-y-5 p-6">
                    {/* Product Title Section with "Sản phẩm đặt mua" */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                          <Box className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-blue-900">Sản phẩm đặt mua</h3>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="font-bold text-xl text-gray-900 mb-2 leading-tight">
                          {order.listings?.title || 'N/A'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Mã sản phẩm: <span className="font-mono font-medium text-gray-900">{order.listings?.id?.slice(0, 8) || 'N/A'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Product Details Grid */}
                    <div className="grid gap-3 md:grid-cols-2 text-sm">
                      <div className="flex items-start gap-3 text-gray-600 bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-500 text-xs block mb-1">Mô tả</span>
                          <span className="text-gray-900 font-medium">{order.order_items?.[0]?.description || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 text-gray-600 bg-white border border-gray-200 rounded-lg p-3 hover:border-green-300 hover:shadow-sm transition-all">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-500 text-xs block mb-1">Số lượng</span>
                          <span className="text-gray-900 font-bold text-lg">{order.order_items?.[0]?.qty || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 text-gray-600 bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-sm transition-all">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-500 text-xs block mb-1">Loại sản phẩm</span>
                          <span className="text-gray-900 font-medium">{order.order_items?.[0]?.item_type || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 text-gray-600 bg-white border border-gray-200 rounded-lg p-3 hover:border-red-300 hover:shadow-sm transition-all">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-500 text-xs block mb-1">Vị trí</span>
                          <span className="text-gray-900 font-medium">{order.listings?.depots?.name || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-5" />

                    {/* Order Items Details */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="font-bold text-lg text-gray-900">Chi tiết đơn hàng</h4>
                      </div>
                      
                      <div className="space-y-3">
                        {order.order_items?.map((item, index) => (
                          <div 
                            key={index} 
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                                <span className="text-white text-lg font-bold">{item.qty}</span>
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 mb-1">{item.description}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                    {item.item_type}
                                  </span>
                                  <span>•</span>
                                  <span>{formatPrice(item.unit_price)}/đơn vị</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3 sm:flex-col sm:items-end">
                              <span className="text-sm text-gray-500 sm:hidden">Tổng:</span>
                              <span className="font-bold text-xl text-blue-600">{formatPrice(item.total_price)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-5">
                      {/* Payment Title */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border border-green-100">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                            <CreditCard className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="font-bold text-lg text-green-900">Thông tin thanh toán</h3>
                        </div>
                      </div>
                      
                      {/* Payment Verification Alert - Seller only when PAYMENT_PENDING_VERIFICATION */}
                      {isSeller && order.status === 'PAYMENT_PENDING_VERIFICATION' && (
                        <PaymentVerificationAlert
                          order={order}
                          onVerify={verifyPayment}
                        />
                      )}
                      
                      <div className="space-y-4">
                      {order.payments && order.payments.length > 0 ? (
                        order.payments.map((payment) => (
                          <div key={payment.id} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gradient-to-r from-gray-50 to-white">
                            
                            {/* Payment Status & Amount */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-green-600" />
                                <p className="font-semibold text-gray-900">Trạng thái thanh toán</p>
                              </div>
                              <Badge 
                                variant={payment.status === 'COMPLETED' || payment.status === 'completed' ? 'default' : 'secondary'}
                                className={payment.status === 'COMPLETED' || payment.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                              >
                                {payment.status === 'COMPLETED' || payment.status === 'completed' ? 'Hoàn thành' : 
                                 payment.status === 'PENDING' || payment.status === 'pending' ? 'Đang xử lý' :
                                 payment.status === 'FAILED' || payment.status === 'failed' ? 'Thất bại' : payment.status}
                              </Badge>
                            </div>
                            
                            {/* Amount - HIGHLIGHTED */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-5 w-5 text-green-600" />
                                  <span className="text-sm font-medium text-gray-600">Số tiền đã thanh toán:</span>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-green-600">
                                    {formatPrice(payment.amount)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Payment Details Grid */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="bg-white rounded-md p-3 border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">Phương thức</p>
                                <p className="font-semibold text-gray-900">
                                  {payment.method === 'BANK_TRANSFER' || payment.method === 'bank_transfer' ? 'Chuyển khoản ngân hàng' :
                                   payment.method === 'CARD' || payment.method === 'card' ? 'Thẻ tín dụng/ghi nợ' :
                                   payment.method === 'EWALLET' || payment.method === 'ewallet' ? 'Ví điện tử' :
                                   payment.method === 'CASH' || payment.method === 'cash' ? 'Tiền mặt' : 
                                   payment.method}
                                </p>
                              </div>
                              
                              <div className="bg-white rounded-md p-3 border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">Nhà cung cấp</p>
                                <p className="font-semibold text-gray-900">
                                  {payment.provider === 'VNPAY' ? 'VNPay' :
                                   payment.provider === 'MOMO' ? 'MoMo' :
                                   payment.provider === 'BANK_TRANSFER' ? 'Ngân hàng' :
                                   payment.provider === 'CASH' ? 'Tiền mặt' :
                                   payment.provider || 'N/A'}
                                </p>
                              </div>
                              
                              {payment.transaction_id && (
                                <div className="col-span-2 bg-white rounded-md p-3 border border-gray-200">
                                  <p className="text-xs text-gray-500 mb-1">Mã giao dịch</p>
                                  <p className="font-mono text-sm text-gray-900">{payment.transaction_id}</p>
                                </div>
                              )}
                              
                              {payment.escrow_account_ref && (
                                <div className="col-span-2 bg-amber-50 rounded-md p-3 border-2 border-amber-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Shield className="h-4 w-4 text-amber-600" />
                                    <p className="text-xs text-amber-700 font-semibold">Tài khoản Escrow</p>
                                  </div>
                                  <p className="font-mono text-sm text-amber-900 mb-2">{payment.escrow_account_ref}</p>
                                  <div className="flex items-start gap-2 bg-amber-100 rounded p-2">
                                    <Info className="h-4 w-4 text-amber-700 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-700">
                                      💰 Tiền đang được giữ an toàn và sẽ chuyển cho seller khi giao dịch hoàn tất
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Timestamps */}
                            <div className="space-y-2 text-xs border-t pt-3">
                              {payment.paid_at && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  <span>Thanh toán lúc: <span className="font-medium">{new Date(payment.paid_at).toLocaleString('vi-VN')}</span></span>
                                </div>
                              )}
                              {payment.escrow_hold_until && (
                                <div className="flex items-center gap-2 text-amber-600">
                                  <Clock className="h-3 w-3" />
                                  <span>Escrow giữ đến: <span className="font-medium">{new Date(payment.escrow_hold_until).toLocaleString('vi-VN')}</span></span>
                                </div>
                              )}
                              {payment.released_at && (
                                <div className="flex items-center gap-2 text-green-600">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Đã giải ngân: <span className="font-medium">{new Date(payment.released_at).toLocaleString('vi-VN')}</span></span>
                                </div>
                              )}
                              {!payment.paid_at && !payment.released_at && (
                                <div className="flex items-center gap-2 text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  <span>Tạo lúc: <span className="font-medium">{new Date(payment.created_at).toLocaleString('vi-VN')}</span></span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 text-sm">Chưa có thông tin thanh toán</p>
                        </div>
                      )}
                    </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Receipt Confirmation Information - Show when receipt confirmed */}
                {order.receipt_confirmed_at && order.receipt_data_json && (
                  <Card className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-5">
                        {/* Receipt Title */}
                        <div className={`bg-gradient-to-r rounded-lg p-5 border ${
                          order.receipt_data_json.condition === 'MAJOR_DAMAGE'
                            ? 'from-red-50 to-rose-50 border-red-100'
                            : 'from-green-50 to-emerald-50 border-green-100'
                        }`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-md ${
                              order.receipt_data_json.condition === 'MAJOR_DAMAGE'
                                ? 'from-red-500 to-rose-600'
                                : 'from-green-500 to-emerald-600'
                            }`}>
                              {order.receipt_data_json.condition === 'MAJOR_DAMAGE' ? (
                                <AlertTriangle className="h-5 w-5 text-white" />
                              ) : (
                                <Receipt className="h-5 w-5 text-white" />
                              )}
                            </div>
                            <h3 className={`font-bold text-lg ${
                              order.receipt_data_json.condition === 'MAJOR_DAMAGE'
                                ? 'text-red-900'
                                : 'text-green-900'
                            }`}>
                              {order.receipt_data_json.condition === 'MAJOR_DAMAGE'
                                ? 'Báo cáo vấn đề'
                                : 'Xác nhận nhận hàng'}
                            </h3>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Receipt Details */}
                          <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gradient-to-r from-gray-50 to-white">
                            
                            {/* Receiver Info */}
                            <div className="flex items-start gap-3">
                              <User className={`h-5 w-5 mt-0.5 ${
                                order.receipt_data_json.condition === 'MAJOR_DAMAGE' ? 'text-red-600' : 'text-green-600'
                              }`} />
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">Người nhận hàng</p>
                                <p className="font-semibold text-gray-900">{order.receipt_data_json.received_by || 'N/A'}</p>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            {/* Condition */}
                            <div className="flex items-start gap-3">
                              {order.receipt_data_json.condition === 'GOOD' && <CheckCircle className="h-5 w-5 mt-0.5 text-green-600" />}
                              {order.receipt_data_json.condition === 'MINOR_DAMAGE' && <AlertTriangle className="h-5 w-5 mt-0.5 text-yellow-600" />}
                              {order.receipt_data_json.condition === 'MAJOR_DAMAGE' && <AlertTriangle className="h-5 w-5 mt-0.5 text-red-600" />}
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">Tình trạng hàng hóa</p>
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold ${
                                  order.receipt_data_json.condition === 'GOOD' 
                                    ? 'bg-green-100 text-green-800'
                                    : order.receipt_data_json.condition === 'MINOR_DAMAGE'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {order.receipt_data_json.condition === 'GOOD' && '✅ Tốt - Không có vấn đề'}
                                  {order.receipt_data_json.condition === 'MINOR_DAMAGE' && '⚠️ Hư hỏng nhỏ'}
                                  {order.receipt_data_json.condition === 'MAJOR_DAMAGE' && '❌ Hư hỏng nghiêm trọng'}
                                </div>
                              </div>
                            </div>
                            
                            {/* Notes if available */}
                            {order.receipt_data_json.notes && (
                              <>
                                <Separator />
                                <div className="flex items-start gap-3">
                                  <Info className={`h-5 w-5 mt-0.5 ${
                                    order.receipt_data_json.condition === 'MAJOR_DAMAGE' ? 'text-red-600' : 'text-blue-600'
                                  }`} />
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-1">Ghi chú</p>
                                    <p className="text-sm text-gray-700">{order.receipt_data_json.notes}</p>
                                  </div>
                                </div>
                              </>
                            )}
                            
                            {/* Timestamp */}
                            <Separator />
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>Xác nhận lúc: <span className="font-medium text-gray-700">
                                {new Date(order.receipt_confirmed_at).toLocaleString('vi-VN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span></span>
                            </div>
                          </div>
                          
                          {/* Warning for MAJOR_DAMAGE */}
                          {order.receipt_data_json.condition === 'MAJOR_DAMAGE' && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-red-900 mb-1">Tranh chấp đã được tạo</p>
                                  <p className="text-sm text-red-700">
                                    Admin sẽ xem xét và liên hệ trong vòng 24 giờ để giải quyết vấn đề.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Order Summary */}
                <Card className="border shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-5">
                      {/* Summary Title */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                            <ShoppingCart className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="font-bold text-lg text-blue-900">Tóm tắt đơn hàng</h3>
                        </div>
                      </div>
                      
                      <div className="space-y-2.5 text-sm">
                        {/* Subtotal */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Tạm tính:</span>
                          <span className="font-semibold text-gray-900">{formatPrice(order.subtotal)}</span>
                        </div>
                        
                        {/* Tax */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Thuế VAT:</span>
                          <span className="font-semibold text-gray-900">{formatPrice(order.tax)}</span>
                        </div>
                        
                        {/* Fees - chỉ hiển thị nếu > 0 */}
                        {Number(order.fees) > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Phí dịch vụ:</span>
                            <span className="font-semibold text-gray-900">{formatPrice(order.fees)}</span>
                          </div>
                        )}
                        
                        <Separator className="my-2 bg-gray-300" />
                        
                        {/* Total Order */}
                        <div className="flex justify-between items-center py-2 bg-blue-50 rounded-lg px-3">
                          <span className="font-bold text-blue-900">Tổng cộng:</span>
                          <span className="font-bold text-blue-900 text-lg">{formatPrice(order.total)}</span>
                        </div>
                        
                        {/* Payment Info - gộp tất cả vào 1 box */}
                        {order.payments && order.payments.length > 0 && (() => {
                          const paymentAmount = Number(order.payments[0].amount);
                          const orderTotal = Number(order.total);
                          const processingFee = paymentAmount - orderTotal;
                          const hasProcessingFee = processingFee > 0;
                          
                          return (
                            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3 mt-3">
                              {/* Processing Fee - nếu có */}
                              {hasProcessingFee && (
                                <div className="flex justify-between items-center text-sm mb-2">
                                  <span className="text-gray-600">
                                    Phí thanh toán: 
                                    <span className="text-xs text-gray-500 ml-1">
                                      ({order.payments[0].provider === 'VNPAY' ? 'VNPay 2.9% + 2,000₫' : 
                                        order.payments[0].provider === 'MOMO' ? 'MoMo 1.5%' : ''})
                                    </span>
                                  </span>
                                  <span className="font-semibold text-orange-600">{formatPrice(processingFee)}</span>
                                </div>
                              )}
                              
                              {/* Total Payment */}
                              <div className="flex justify-between items-center pt-2 border-t border-green-300">
                                <span className="font-bold text-green-800">Tổng thanh toán:</span>
                                <span className="font-bold text-green-600 text-xl">{formatPrice(order.payments[0].amount)}</span>
                              </div>
                              
                              {/* Payment Method */}
                              <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-green-200">
                                <span className="text-gray-600">Phương thức:</span>
                                <span className="text-gray-900 font-semibold">
                                  {order.payments[0].provider === 'VNPAY' ? 'Thẻ tín dụng - VNPay' :
                                   order.payments[0].provider === 'MOMO' ? 'Ví điện tử - MoMo' :
                                   order.payments[0].method === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' :
                                   `${order.payments[0].method} - ${order.payments[0].provider}`}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      
                      {/* Order Code */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-gray-600">Mã đơn:</span>
                          <span className="font-mono font-semibold text-gray-900">{order.order_number || order.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Seller/Buyer Information - Show counterparty */}
                <Card className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-5">
                      {/* Title - Dynamic based on user role */}
                      <div className={`bg-gradient-to-r rounded-lg p-4 border ${
                        isSeller 
                          ? 'from-blue-50 to-indigo-50 border-blue-100' 
                          : 'from-orange-50 to-yellow-50 border-orange-100'
                      }`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-md ${
                            isSeller 
                              ? 'from-blue-500 to-indigo-600' 
                              : 'from-orange-500 to-yellow-600'
                          }`}>
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          <h3 className={`font-bold text-lg ${
                            isSeller ? 'text-blue-900' : 'text-orange-900'
                          }`}>
                            {isSeller ? 'Người mua' : 'Người bán'}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className={`flex items-center gap-2 text-sm bg-white rounded-lg p-3 border ${
                          isSeller ? 'border-blue-100' : 'border-orange-100'
                        }`}>
                          <Building2 className={`h-5 w-5 flex-shrink-0 ${
                            isSeller ? 'text-blue-600' : 'text-orange-600'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 mb-0.5">Tên hiển thị</p>
                            <p className="font-semibold text-gray-900 truncate">
                              {isSeller 
                                ? (order.users_orders_buyer_idTousers?.display_name || 'N/A')
                                : (order.users_orders_seller_idTousers?.display_name || 'N/A')
                              }
                            </p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-2 text-sm bg-white rounded-lg p-3 border ${
                          isSeller ? 'border-blue-100' : 'border-orange-100'
                        }`}>
                          <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 mb-0.5">Email</p>
                            <p className="text-gray-900 truncate">
                              {isSeller 
                                ? (order.users_orders_buyer_idTousers?.email || 'N/A')
                                : (order.users_orders_seller_idTousers?.email || 'N/A')
                              }
                            </p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-2 text-sm bg-white rounded-lg p-3 border ${
                          isSeller ? 'border-blue-100' : 'border-orange-100'
                        }`}>
                          <User className={`h-5 w-5 flex-shrink-0 ${
                            isSeller ? 'text-blue-600' : 'text-orange-600'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 mb-0.5">User ID</p>
                            <p className="text-gray-900 text-xs font-mono truncate">
                              {isSeller 
                                ? (order.users_orders_buyer_idTousers?.id || 'N/A')
                                : (order.users_orders_seller_idTousers?.id || 'N/A')
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-5">
                      {/* Actions Title */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center shadow-md">
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="font-bold text-lg text-gray-900">Hành động</h3>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Priority Actions - Full Width */}
                        {(order.status === 'pending_payment' || order.status === 'PENDING_PAYMENT' || order.status === 'awaiting_funds' || order.status === 'AWAITING_FUNDS' || order.status === 'created' || order.status === 'CREATED') && (
                          <Button 
                            onClick={() => router.push(`/orders/${order.id}/pay`)}
                            className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all font-semibold text-base"
                          >
                            <CreditCard className="mr-2 h-5 w-5" />
                            Thanh toán ngay
                          </Button>
                        )}

                        {(order.status === 'documents_ready' || order.status === 'DOCUMENTS_READY') && (
                          <Button 
                            onClick={() => setIsTransportationModalOpen(true)}
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all font-semibold text-base"
                          >
                            <Truck className="mr-2 h-5 w-5" />
                            Sắp xếp vận chuyển
                          </Button>
                        )}

                        {/* Bước 5.3: Arrange pickup/delivery - CHỈ BUYER khi status READY_FOR_PICKUP */}
                        {isBuyer && (order.status === 'ready_for_pickup' || order.status === 'READY_FOR_PICKUP') && (
                          <Button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('=== Buyer đặt vận chuyển ===');
                              console.log('Order ID:', orderId);
                              console.log('Order Status:', order.status);
                              setIsTransportationModalOpen(true);
                            }}
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition-all font-semibold text-base relative z-10 cursor-pointer"
                            type="button"
                          >
                            <Truck className="mr-2 h-5 w-5" />
                            📦 Đặt vận chuyển (Bước 5.3)
                          </Button>
                        )}
                        
                        {/* SELLER: Mark Ready button when PREPARING_DELIVERY */}
                        {isSeller && (order.status === 'preparing_delivery' || order.status === 'PREPARING_DELIVERY') && (
                          <Button 
                            onClick={() => setShowMarkReadyForm(true)}
                            className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-md hover:shadow-lg transition-all font-semibold text-base"
                          >
                            <CheckCircle className="mr-2 h-5 w-5" />
                            ✅ Đánh dấu sẵn sàng giao hàng
                          </Button>
                        )}
                        
                        {/* SELLER: Message khi Buyer chọn self_pickup */}
                        {isSeller && (
                          order.status === 'transportation_booked' ||
                          order.status === 'TRANSPORTATION_BOOKED'
                        ) && (() => {
                          const deliveryMethod = order.deliveries?.[0]?.delivery_method;
                          const isSelfPickup = deliveryMethod === 'self_pickup';
                          
                          // Hiển thị message cho seller khi buyer chọn tự đến lấy
                          if (isSelfPickup) {
                            return (
                              <div className="w-full bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Clock className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-blue-900 mb-1">
                                      📅 Buyer sẽ tự đến lấy hàng
                                    </h4>
                                    <p className="text-sm text-blue-700 mb-2">
                                      Buyer đã đặt lịch đến lấy hàng. Vui lòng chuẩn bị container sẵn sàng tại depot.
                                    </p>
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
                                      <p className="text-xs text-amber-800 font-medium">
                                        💡 Khi buyer đã đến và lấy hàng, vui lòng click "Xác nhận đã giao hàng" bên dưới
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          
                          return null;
                        })()}
                        
                        {/* SELLER: Start Delivery button - CHỈ khi KHÔNG phải self_pickup */}
                        {isSeller && (
                          order.status === 'transportation_booked' ||
                          order.status === 'TRANSPORTATION_BOOKED'
                        ) && (() => {
                          const deliveryMethod = order.deliveries?.[0]?.delivery_method;
                          const isSelfPickup = deliveryMethod === 'self_pickup';
                          
                          // CHỈ hiển thị button nếu KHÔNG phải self_pickup
                          if (isSelfPickup) {
                            return null;
                          }
                          
                          return (
                            <Button 
                              onClick={() => setShowStartDeliveringForm(true)}
                              className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all font-semibold text-base"
                            >
                              <Truck className="mr-2 h-5 w-5" />
                              🚚 Bắt đầu vận chuyển (Bước 6.1)
                            </Button>
                          );
                        })()}
                        
                        {/* SELLER: Update Delivery Status button when IN_TRANSIT (Bước 6.2) */}
                        {isSeller && (order.status === 'in_transit' || order.status === 'IN_TRANSIT') && (
                          <Button 
                            onClick={() => setShowUpdateDeliveryForm(true)}
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all font-semibold text-base"
                          >
                            <MapPin className="mr-2 h-5 w-5" />
                            📍 Cập nhật vị trí vận chuyển (Bước 6.2)
                          </Button>
                        )}
                        
                        {/* SELLER: Mark Delivered button when IN_TRANSIT or (TRANSPORTATION_BOOKED + self_pickup) */}
                        {isSeller && (
                          (order.status === 'in_transit' || order.status === 'IN_TRANSIT' || order.status === 'delivering' || order.status === 'DELIVERING') ||
                          ((order.status === 'transportation_booked' || order.status === 'TRANSPORTATION_BOOKED') && order.deliveries?.[0]?.delivery_method === 'self_pickup')
                        ) && (
                          <Button 
                            onClick={() => setShowMarkDeliveredForm(true)}
                            className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition-all font-semibold text-base"
                          >
                            <CheckCircle className="mr-2 h-5 w-5" />
                            ✅ Xác nhận đã giao hàng (Bước 7.1)
                          </Button>
                        )}
                        
                        {/* BUYER: Confirm Receipt button when DELIVERED */}
                        {isBuyer && (order.status === 'delivered' || order.status === 'DELIVERED') && (
                          <Button 
                            onClick={() => setShowConfirmReceiptForm(true)}
                            className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-md hover:shadow-lg transition-all font-semibold text-base"
                          >
                            <CheckCircle className="mr-2 h-5 w-5" />
                            ✅ Xác nhận nhận hàng (Bước 7.2)
                          </Button>
                        )}
                        
                        {/* BUYER: Tracking button when IN_TRANSIT (Bước 6.3) */}
                        {isBuyer && (order.status === 'in_transit' || order.status === 'IN_TRANSIT' || order.status === 'delivering' || order.status === 'DELIVERING') && order.deliveries && order.deliveries.length > 0 && (
                          <>
                            <div className="relative py-2">
                              <div className="absolute inset-0 flex items-center">
                                <Separator />
                              </div>
                              <div className="relative flex justify-center">
                                <span className="bg-white px-3 text-xs text-gray-500 font-medium">Theo dõi vận chuyển</span>
                              </div>
                            </div>
                            <Button 
                              onClick={() => router.push(`/delivery/track/${order.deliveries?.[0]?.id}`)}
                              className="w-full h-12 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all font-semibold text-base"
                            >
                              <Truck className="mr-2 h-5 w-5" />
                              🚚 Theo dõi vận chuyển (Bước 6.3)
                            </Button>
                          </>
                        )}
                        
                        {/* Download Invoice Button */}
                        {(order.status === 'completed' || order.status === 'COMPLETED') && (
                          <>
                            <Separator className="my-2" />
                            <Button 
                              variant="outline" 
                              className="w-full h-11 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-700 transition-all"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Tải hóa đơn (PDF)
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-5">
                  {/* Timeline Title */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-blue-900">Lịch sử đơn hàng</h3>
                        <p className="text-sm text-gray-600">Theo dõi các sự kiện và cập nhật của đơn hàng</p>
                      </div>
                    </div>
                  </div>
                  
                <div className="space-y-6 relative before:absolute before:left-4 before:top-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-green-500 before:to-gray-300">
                  <div className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md z-10">
                      <ShoppingCart className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="font-semibold text-blue-900">Đơn hàng được tạo</p>
                      <p className="text-sm text-blue-700 mt-1">
                        {new Date(order.created_at).toLocaleString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {order.payments?.map((payment) => (
                    <div key={payment.id} className="flex items-start gap-4 relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md z-10">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 bg-green-50 rounded-lg p-4 border border-green-200">
                        <p className="font-semibold text-green-900">Thanh toán hoàn thành</p>
                        <p className="text-sm text-green-700 mt-1">
                          Phương thức: {payment.method}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {new Date(payment.created_at).toLocaleString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {order.deliveries?.map((delivery) => (
                    <div key={delivery.id} className="flex items-start gap-4 relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md z-10">
                        <Truck className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <p className="font-semibold text-orange-900">Vận chuyển được lên lịch</p>
                        <p className="text-sm text-orange-700 mt-1">
                          Trạng thái: {delivery.status}
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                          {new Date(delivery.created_at).toLocaleString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Bước 7.1: Seller đã giao hàng */}
                  {order.delivered_at && (
                    <div className="flex items-start gap-4 relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md z-10">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <p className="font-semibold text-purple-900">✅ Seller đã giao hàng (Bước 7.1)</p>
                        <p className="text-sm text-purple-700 mt-1">
                          Hàng đã được giao đến địa điểm nhận
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          {new Date(order.delivered_at).toLocaleString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bước 7.2: Buyer xác nhận nhận hàng */}
                  {order.receipt_confirmed_at && order.receipt_data_json && (
                    <div className="flex items-start gap-4 relative">
                      <div className={`w-8 h-8 bg-gradient-to-br rounded-full flex items-center justify-center shadow-md z-10 ${
                        order.receipt_data_json.condition === 'MAJOR_DAMAGE' 
                          ? 'from-red-500 to-rose-600' 
                          : 'from-green-500 to-emerald-600'
                      }`}>
                        {order.receipt_data_json.condition === 'MAJOR_DAMAGE' ? (
                          <AlertTriangle className="h-4 w-4 text-white" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className={`flex-1 rounded-lg p-4 border ${
                        order.receipt_data_json.condition === 'MAJOR_DAMAGE' 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-green-50 border-green-200'
                      }`}>
                        <p className={`font-semibold ${
                          order.receipt_data_json.condition === 'MAJOR_DAMAGE' 
                            ? 'text-red-900' 
                            : 'text-green-900'
                        }`}>
                          {order.receipt_data_json.condition === 'MAJOR_DAMAGE' 
                            ? '⚠️ Buyer báo cáo vấn đề (Bước 7.2)' 
                            : '✅ Buyer đã xác nhận nhận hàng (Bước 7.2)'}
                        </p>
                        <div className="mt-2 space-y-1 text-sm">
                          <p className={order.receipt_data_json.condition === 'MAJOR_DAMAGE' ? 'text-red-700' : 'text-green-700'}>
                            <span className="font-medium">Người nhận:</span> {order.receipt_data_json.received_by || 'N/A'}
                          </p>
                          <p className={order.receipt_data_json.condition === 'MAJOR_DAMAGE' ? 'text-red-700' : 'text-green-700'}>
                            <span className="font-medium">Tình trạng:</span>{' '}
                            {order.receipt_data_json.condition === 'GOOD' && '✅ Tốt - Không có vấn đề'}
                            {order.receipt_data_json.condition === 'MINOR_DAMAGE' && '⚠️ Hư hỏng nhỏ'}
                            {order.receipt_data_json.condition === 'MAJOR_DAMAGE' && '❌ Hư hỏng nghiêm trọng'}
                          </p>
                          {order.receipt_data_json.notes && (
                            <p className={order.receipt_data_json.condition === 'MAJOR_DAMAGE' ? 'text-red-700' : 'text-green-700'}>
                              <span className="font-medium">Ghi chú:</span> {order.receipt_data_json.notes}
                            </p>
                          )}
                        </div>
                        <p className={`text-xs mt-2 ${
                          order.receipt_data_json.condition === 'MAJOR_DAMAGE' 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {new Date(order.receipt_confirmed_at).toLocaleString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center shadow z-10">
                      <Clock className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 font-medium">
                        {(order.status === 'COMPLETED' || order.status === 'completed') 
                          ? 'Đơn hàng đã hoàn tất ✅' 
                          : order.status === 'DELIVERY_ISSUE' 
                          ? 'Đang chờ admin xử lý tranh chấp ⚠️'
                          : 'Đang chờ cập nhật tiếp theo...'}
                      </p>
                    </div>
                  </div>
                </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery" className="space-y-6">
            {/* Delivery Workflow Status - Shows for both buyer and seller */}
            {(isSeller || isBuyer) && (
              <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <DeliveryWorkflowStatus
                    order={order}
                    userRole={isSeller ? 'seller' : 'buyer'}
                    onPrepareDelivery={() => setShowPrepareForm(true)}
                    onMarkReady={() => setShowMarkReadyForm(true)}
                    onStartDelivering={() => setShowStartDeliveringForm(true)}
                    onBookTransportation={() => setIsTransportationModalOpen(true)}
                    onMarkDelivered={() => {
                      // TODO: Implement mark delivered modal
                      showError('Chức năng đang phát triển');
                    }}
                    onRaiseDispute={() => setShowDisputeForm(true)}
                  />
                </CardContent>
              </Card>
            )}

            {order.deliveries && order.deliveries.length > 0 ? (
              order.deliveries.map((delivery) => (
                <Card key={delivery.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-0">
                    {/* Header với gradient đẹp */}
                    <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-yellow-500 p-6 rounded-t-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                          <Truck className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-white">Thông tin vận chuyển</h3>
                          <p className="text-sm text-orange-50">Chi tiết về quá trình giao hàng</p>
                        </div>
                        {getDeliveryStatusBadge(delivery.status)}
                      </div>
                    </div>

                    {/* Body content */}
                    <div className="p-6 space-y-6">
                      {/* Thông tin chính - 2 cột */}
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Ngày tạo */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 hover:border-blue-300 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                              <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-blue-600 mb-1">Ngày tạo đơn</p>
                              <p className="text-sm font-semibold text-gray-900 leading-tight">
                                {new Date(delivery.created_at).toLocaleDateString('vi-VN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </p>
                              <p className="text-xs text-gray-600 mt-0.5">
                                {new Date(delivery.created_at).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Mã vận đơn */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100 hover:border-purple-300 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                              <Package className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-purple-600 mb-1">Mã vận đơn</p>
                              <p className="text-sm font-mono font-semibold text-gray-900 truncate">
                                {delivery.id.slice(0, 20)}...
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tracking number nếu có */}
                      {delivery.tracking_number && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                              <MapPin className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-green-600 mb-1">Mã tracking vận chuyển</p>
                              <p className="text-base font-mono font-bold text-gray-900">
                                {delivery.tracking_number}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Địa chỉ giao hàng nếu có */}
                      {delivery.delivery_address && (
                        <>
                          <Separator />
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center shadow-md flex-shrink-0 mt-1">
                                <MapPin className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Địa chỉ giao hàng</p>
                                <p className="text-sm text-gray-900 leading-relaxed">
                                  {delivery.delivery_address}
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                    <Truck className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có thông tin vận chuyển</h3>
                  <p className="text-gray-600 text-center max-w-md">
                    Thông tin vận chuyển sẽ được cập nhật ngay sau khi đơn hàng được xử lý và sắp xếp giao hàng.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-5">
                  {/* Documents Title */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-purple-900">Tài liệu đơn hàng</h3>
                        <p className="text-sm text-gray-600">Các tài liệu và chứng từ liên quan đến đơn hàng</p>
                      </div>
                    </div>
                  </div>
                  
                <div className="space-y-4">
                  {order.documents && order.documents.length > 0 ? (
                    order.documents.map((doc: any) => (
                      <div key={doc.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center shadow-md">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {doc.docType === 'invoice' && 'Hóa đơn'}
                                {doc.docType === 'receipt' && 'Biên lai'}
                                {doc.docType === 'contract' && 'Hợp đồng'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Số: <span className="font-mono font-medium">{doc.number}</span>
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-600 transition-all"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Tải xuống
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 rounded-md p-2">
                          <Calendar className="h-3 w-3" />
                          Phát hành: {new Date(doc.issuedAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có tài liệu</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Tài liệu sẽ được cập nhật khi đơn hàng được xử lý và các chứng từ được phát hành.
                      </p>
                    </div>
                  )}
                </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions Footer */}
        {order.status === 'COMPLETED' && (
          <>
            {/* Check if current user has reviewed */}
            {(() => {
              const hasReviewed = reviews.some(r => r.reviewer_id === user?.id);
              
              return (
                <Card className="border shadow-md bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardHeader className="border-b bg-white/50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-green-900">🎉 Hoàn thành giao dịch</CardTitle>
                        <CardDescription>
                          {hasReviewed 
                            ? 'Cảm ơn bạn đã đánh giá giao dịch!' 
                            : 'Giao dịch đã hoàn thành. Hãy chia sẻ trải nghiệm của bạn!'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                      {!hasReviewed && (
                        <Button 
                          onClick={() => router.push(`/orders/${order.id}/review`)}
                          className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all"
                        >
                          <Star className="mr-2 h-4 w-4" />
                          ⭐ Đánh giá giao dịch
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className={`${hasReviewed ? 'flex-1' : 'flex-1'} hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600 transition-all`}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Liên hệ hỗ trợ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <Card className="border shadow-md">
                <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-yellow-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center shadow-md">
                      <Star className="h-6 w-6 text-white fill-white" />
                    </div>
                    <div>
                      <CardTitle className="text-amber-900">⭐ Đánh giá giao dịch</CardTitle>
                      <CardDescription>
                        {reviews.length} đánh giá từ {reviews.length === 1 ? 'đối tác' : 'các đối tác'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-md flex-shrink-0">
                          {(review.users_reviews_reviewer_idTousers?.display_name || review.reviewer?.display_name)?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        
                        {/* Review Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {review.users_reviews_reviewer_idTousers?.display_name || review.reviewer?.display_name || 'Người dùng'}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString('vi-VN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            
                            {/* Rating Stars */}
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-5 w-5 ${
                                    star <= review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          
                          {/* Comment */}
                          {review.comment && (
                            <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                              {review.comment}
                            </p>
                          )}
                          
                          {/* Badge */}
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className="bg-white"
                            >
                              {review.reviewer_id === order.buyer_id ? '👤 Người mua' : '🏢 Người bán'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              đánh giá cho {review.reviewee_id === order.buyer_id ? 'người mua' : 'người bán'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Loading Reviews */}
            {loadingReviews && (
              <Card className="border shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                    <span>Đang tải đánh giá...</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

      {/* Transportation Booking Modal */}
      <TransportationBookingModal
        isOpen={isTransportationModalOpen}
        onClose={() => setIsTransportationModalOpen(false)}
        orderId={orderId}
        onSuccess={() => {
          showSuccess('Đặt vận chuyển thành công!');
          fetchOrderDetail(); // Refresh order data
        }}
      />

      {/* Prepare Delivery Form Modal */}
      {showPrepareForm && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto pointer-events-none"
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8 relative pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <PrepareDeliveryForm
              orderId={orderId}
              onSuccess={() => {
                showSuccess('Chuẩn bị giao hàng thành công!');
                setShowPrepareForm(false);
                fetchOrderDetail(); // Refresh order data
              }}
              onCancel={() => setShowPrepareForm(false)}
            />
          </div>
        </div>
      )}

      {/* Mark Ready Form Modal */}
      {showMarkReadyForm && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto"
          onClick={() => setShowMarkReadyForm(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <MarkReadyForm
              orderId={orderId}
              onSuccess={() => {
                showSuccess('Đã đánh dấu sẵn sàng giao hàng!');
                setShowMarkReadyForm(false);
                fetchOrderDetail(); // Refresh order data
              }}
              onCancel={() => setShowMarkReadyForm(false)}
            />
          </div>
        </div>
      )}

      {/* Start Delivering Form Modal */}
      <StartDeliveringForm
        isOpen={showStartDeliveringForm}
        orderId={orderId}
        onSuccess={() => {
          showSuccess('Đã bắt đầu vận chuyển!');
          setShowStartDeliveringForm(false);
          fetchOrderDetail(); // Refresh order data
        }}
        onClose={() => setShowStartDeliveringForm(false)}
      />

      {/* Update Delivery Status Form Modal - Bước 6.2 */}
      <UpdateDeliveryStatusForm
        isOpen={showUpdateDeliveryForm}
        orderId={orderId}
        onSuccess={() => {
          showSuccess('Đã cập nhật trạng thái vận chuyển!');
          setShowUpdateDeliveryForm(false);
          fetchOrderDetail(); // Refresh order data
        }}
        onClose={() => setShowUpdateDeliveryForm(false)}
      />

      {/* Mark Delivered Form Modal - Bước 7.1 */}
      <MarkDeliveredForm
        isOpen={showMarkDeliveredForm}
        orderId={orderId}
        onSuccess={() => {
          showSuccess('Đã xác nhận giao hàng thành công!');
          setShowMarkDeliveredForm(false);
          fetchOrderDetail(); // Refresh order data
        }}
        onClose={() => setShowMarkDeliveredForm(false)}
      />

      {/* Confirm Receipt Form Modal - Bước 7.2 */}
      <ConfirmReceiptForm
        isOpen={showConfirmReceiptForm}
        orderId={orderId}
        onSuccess={() => {
          showSuccess('Đã xác nhận nhận hàng thành công! Đơn hàng hoàn tất.');
          setShowConfirmReceiptForm(false);
          fetchOrderDetail(); // Refresh order data
        }}
        onClose={() => setShowConfirmReceiptForm(false)}
      />

      {/* Raise Dispute Form Modal */}
      {showDisputeForm && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDisputeForm(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full my-8 relative">
            <RaiseDisputeForm
              orderId={orderId}
              onSuccess={() => {
                showSuccess('Đã gửi khiếu nại thành công!');
                setShowDisputeForm(false);
                fetchOrderDetail(); // Refresh order data
              }}
              onCancel={() => setShowDisputeForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
