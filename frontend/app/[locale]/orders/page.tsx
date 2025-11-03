"use client";

import { useTranslations } from 'next-intl';
import { Link, useRouter } from "@/i18n/routing";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Calendar, 
  Package, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Truck,
  FileText,
  MessageCircle
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchOrders, Order, OrderFilters } from '@/lib/api/orders';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/components/providers/auth-context';
import { OrderWithPaymentButton } from '@/components/orders/order-with-payment-button';

export default function OrdersPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  // Determine user role for API call
  const getUserRole = () => {
    if (!user?.roles?.length) return 'buyer'; // default
    
    // Priority: seller > buyer > others
    if (user.roles.includes('seller')) return 'seller';
    if (user.roles.includes('buyer')) return 'buyer';
    return 'buyer'; // fallback
  };

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userRole = getUserRole();
      
      // Get token from localStorage
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Vui lòng đăng nhập để xem đơn hàng');
        return;
      }

      // Direct API call to backend
      const response = await fetch(`/api/v1/orders?role=${userRole}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        setOrders(result.data);
      } else {
        setOrders([]);
      }
      
    } catch (err: any) {
      console.error('[Orders] Error in loadOrders:', err);
      setError(err.message || 'Không thể tải danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user?.email, user?.roles]); // Depend on user email and roles

  useEffect(() => {
    // Check for payment success message
    const paymentStatus = searchParams.get('payment');
    const orderId = searchParams.get('orderId');
    
    if (paymentStatus === 'success' && orderId) {
      setSuccessMessage(`✅ Thanh toán thành công cho đơn hàng #${orderId.slice(-8).toUpperCase()}!`);
      
      // Clear URL parameters to prevent showing message on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      url.searchParams.delete('orderId');
      window.history.replaceState({}, '', url.toString());
      
      // Auto clear message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    }
    
    if (user) {
      loadOrders();
    }
  }, [user, loadOrders, searchParams]);


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'created':
      case 'CREATED':
        return <Badge variant="secondary">Đã tạo</Badge>;
      case 'pending_payment':
      case 'PENDING_PAYMENT':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Chờ thanh toán</Badge>;
      case 'payment_pending_verification':
      case 'PAYMENT_PENDING_VERIFICATION':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Chờ xác nhận thanh toán</Badge>;
      case 'awaiting_funds':
      case 'AWAITING_FUNDS':
        return <Badge variant="outline">Chờ thanh toán</Badge>;
      case 'preparing_delivery':
      case 'PREPARING_DELIVERY':
        return <Badge variant="default" className="bg-blue-600">Chuẩn bị giao hàng</Badge>;
      case 'documents_ready':
      case 'DOCUMENTS_READY':
        return <Badge variant="default" className="bg-purple-600">Chứng từ sẵn sàng</Badge>;
      case 'transportation_booked':
      case 'TRANSPORTATION_BOOKED':
        return <Badge variant="default" className="bg-indigo-600">Đã đặt vận chuyển</Badge>;
      case 'in_transit':
      case 'IN_TRANSIT':
        return <Badge variant="default" className="bg-orange-600">Đang vận chuyển</Badge>;
      case 'paid':
      case 'PAID':
        return <Badge variant="default" className="bg-blue-600">Đã thanh toán</Badge>;
      case 'preparing':
      case 'PREPARING':
        return <Badge variant="default" className="bg-blue-600">Chuẩn bị</Badge>;
      case 'delivering':
      case 'DELIVERING':
        return <Badge variant="default" className="bg-orange-600">Đang giao</Badge>;
      case 'delivered':
      case 'DELIVERED':
        return <Badge variant="default" className="bg-green-600">Đã giao</Badge>;
      case 'completed':
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-600">Hoàn thành</Badge>;
      case 'payment_released':
      case 'PAYMENT_RELEASED':
        return <Badge variant="default" className="bg-green-700">Đã giải ngân</Badge>;
      case 'cancelled':
      case 'CANCELLED':
        return <Badge variant="destructive">Đã hủy</Badge>;
      case 'disputed':
      case 'DISPUTED':
        return <Badge variant="destructive">Tranh chấp</Badge>;
      case 'delivery_issue':
      case 'DELIVERY_ISSUE':
        return <Badge variant="destructive" className="bg-red-600">Có vấn đề giao hàng</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created':
      case 'CREATED':
        return <Package className="h-4 w-4 text-muted-foreground" />;
      case 'pending_payment':
      case 'PENDING_PAYMENT':
        return <DollarSign className="h-4 w-4 text-yellow-600" />;
      case 'payment_pending_verification':
      case 'PAYMENT_PENDING_VERIFICATION':
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      case 'awaiting_funds':
      case 'AWAITING_FUNDS':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'preparing_delivery':
      case 'PREPARING_DELIVERY':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'documents_ready':
      case 'DOCUMENTS_READY':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'transportation_booked':
      case 'TRANSPORTATION_BOOKED':
        return <Truck className="h-4 w-4 text-indigo-600" />;
      case 'in_transit':
      case 'IN_TRANSIT':
        return <Truck className="h-4 w-4 text-orange-600" />;
      case 'paid':
      case 'PAID':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'preparing':
      case 'PREPARING':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'delivering':
      case 'DELIVERING':
        return <Truck className="h-4 w-4 text-orange-600" />;
      case 'delivered':
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'completed':
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'payment_released':
      case 'PAYMENT_RELEASED':
        return <DollarSign className="h-4 w-4 text-green-700" />;
      case 'cancelled':
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'disputed':
      case 'DISPUTED':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'delivery_issue':
      case 'DELIVERY_ISSUE':
        return <AlertCircle className="h-4 w-4 text-red-700" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTimelineIcon = (status: string) => {
    switch (status) {
      case 'created':
      case 'CREATED':
        return <Package className="h-4 w-4" />;
      case 'pending_payment':
      case 'PENDING_PAYMENT':
        return <DollarSign className="h-4 w-4" />;
      case 'payment_pending_verification':
      case 'PAYMENT_PENDING_VERIFICATION':
        return <AlertCircle className="h-4 w-4" />;
      case 'paid':
      case 'PAID':
        return <CheckCircle className="h-4 w-4" />;
      case 'preparing':
      case 'PREPARING':
        return <Package className="h-4 w-4" />;
      case 'delivering':
      case 'DELIVERING':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Handle payment action
  const handlePayNow = (orderId: string) => {
    router.push(`/orders/${orderId}/pay`);
  };

  // Handle view details action  
  const handleViewDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  // Handle confirm receipt action
  const handleConfirmReceipt = async (orderId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Vui lòng đăng nhập lại');
        return;
      }

      const response = await fetch(`/api/v1/orders/${orderId}/confirm-receipt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(`✅ Đã xác nhận nhận hàng! Thanh toán đã được chuyển cho người bán.`);
        loadOrders();
      } else {
        setError(data.message || 'Không thể xác nhận nhận hàng');
      }
    } catch (err: any) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    }
  };

  const OrderCard = ({ order }: { order: any }) => (
    <OrderWithPaymentButton 
      order={order}
      onPayNow={handlePayNow}
      onViewDetails={handleViewDetails}
      onConfirmReceipt={handleConfirmReceipt}
      onRefresh={loadOrders}
    />
  );

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    
    // Special case: "delivering" tab includes PREPARING_DELIVERY, READY_FOR_PICKUP, IN_TRANSIT, DELIVERING
    if (activeTab === 'delivering') {
      const deliveryStatuses = [
        'preparing_delivery', 'PREPARING_DELIVERY',
        'ready_for_pickup', 'READY_FOR_PICKUP',
        'in_transit', 'IN_TRANSIT',
        'delivering', 'DELIVERING',
        'documents_ready', 'DOCUMENTS_READY',
        'transportation_booked', 'TRANSPORTATION_BOOKED'
      ];
      return deliveryStatuses.includes(order.status);
    }
    
    // Special case: "disputed" tab includes DELIVERY_ISSUE, DISPUTED
    if (activeTab === 'disputed') {
      const disputedStatuses = [
        'delivery_issue', 'DELIVERY_ISSUE',
        'disputed', 'DISPUTED'
      ];
      return disputedStatuses.includes(order.status);
    }
    
    // Support both uppercase and lowercase status
    return order.status === activeTab || 
           order.status === activeTab.toUpperCase() || 
           order.status === activeTab.toLowerCase();
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when changing tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Count orders by status
  const getOrderCount = (status: string) => {
    if (status === 'all') return orders.length;
    
    // Special case: "delivering" tab includes multiple delivery-related statuses
    if (status === 'delivering') {
      return orders.filter(order => {
        const deliveryStatuses = [
          'preparing_delivery', 'PREPARING_DELIVERY',
          'ready_for_pickup', 'READY_FOR_PICKUP',
          'in_transit', 'IN_TRANSIT',
          'delivering', 'DELIVERING',
          'documents_ready', 'DOCUMENTS_READY',
          'transportation_booked', 'TRANSPORTATION_BOOKED'
        ];
        return deliveryStatuses.includes(order.status);
      }).length;
    }
    
    // Special case: "disputed" tab includes DELIVERY_ISSUE, DISPUTED
    if (status === 'disputed') {
      return orders.filter(order => {
        const disputedStatuses = [
          'delivery_issue', 'DELIVERY_ISSUE',
          'disputed', 'DISPUTED'
        ];
        return disputedStatuses.includes(order.status);
      }).length;
    }
    
    return orders.filter(order => 
      order.status === status || 
      order.status === status.toUpperCase() || 
      order.status === status.toLowerCase()
    ).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('orders.title')}</h1>
          <p className="text-muted-foreground">
            Quản lý đơn hàng và theo dõi tiến trình giao dịch
          </p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">{successMessage}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSuccessMessage(null)}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Verification Alert for Seller */}
      {!loading && getUserRole() === 'seller' && orders.filter(o => o.status === 'PAYMENT_PENDING_VERIFICATION').length > 0 && (
        <Card className="border-l-4 border-amber-500 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-900 mb-2">
                  🔔 Có {orders.filter(o => o.status === 'PAYMENT_PENDING_VERIFICATION').length} đơn hàng cần xác nhận thanh toán
                </h3>
                <p className="text-sm text-amber-800 mb-4">
                  Buyer đã xác nhận thanh toán cho các đơn hàng dưới đây. Vui lòng kiểm tra tài khoản ngân hàng và xác nhận đã nhận tiền.
                </p>
                <div className="space-y-2 mb-4">
                  {orders
                    .filter(o => o.status === 'PAYMENT_PENDING_VERIFICATION')
                    .slice(0, 3)
                    .map(order => (
                      <div 
                        key={order.id} 
                        className="flex items-center justify-between bg-white rounded-lg p-3 border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => handleViewDetails(order.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {order.order_number || order.id.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-600">
                              Buyer: {order.buyer?.display_name || order.buyer?.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: order.currency || 'VND',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            }).format(parseFloat(order.total) || 0)}
                          </p>
                          <Button 
                            size="sm" 
                            className="mt-1 bg-amber-600 hover:bg-amber-700 text-white text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(order.id);
                            }}
                          >
                            Xác nhận ngay →
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
                {orders.filter(o => o.status === 'PAYMENT_PENDING_VERIFICATION').length > 3 && (
                  <p className="text-sm text-amber-700">
                    + {orders.filter(o => o.status === 'PAYMENT_PENDING_VERIFICATION').length - 3} đơn hàng khác cần xác nhận
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivered Alert for Buyer - Need to confirm receipt */}
      {!loading && getUserRole() === 'buyer' && orders.filter(o => o.status === 'DELIVERED').length > 0 && (
        <Card className="border-l-4 border-green-500 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-900 mb-2">
                  📦 Có {orders.filter(o => o.status === 'DELIVERED').length} đơn hàng đã giao - Cần xác nhận nhận hàng
                </h3>
                <p className="text-sm text-green-800 mb-4">
                  Seller đã xác nhận giao hàng thành công. Vui lòng kiểm tra container và xác nhận tình trạng hàng hóa.
                </p>
                <div className="space-y-2 mb-4">
                  {orders
                    .filter(o => o.status === 'DELIVERED')
                    .slice(0, 3)
                    .map(order => (
                      <div 
                        key={order.id} 
                        className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-200 hover:border-green-400 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => handleViewDetails(order.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {order.order_number || order.id.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-600">
                              Seller: {order.seller?.display_name || order.seller?.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: order.currency || 'VND',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            }).format(parseFloat(order.total) || 0)}
                          </p>
                          <Button 
                            size="sm" 
                            className="mt-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(order.id);
                            }}
                          >
                            Xác nhận nhận hàng →
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
                {orders.filter(o => o.status === 'DELIVERED').length > 3 && (
                  <p className="text-sm text-green-700">
                    + {orders.filter(o => o.status === 'DELIVERED').length - 3} đơn hàng khác cần xác nhận
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo ID đơn hàng, tên đối tác..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending_payment">Chờ thanh toán</SelectItem>
                  <SelectItem value="payment_pending_verification">Chờ xác nhận TT</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="delivering">Đang giao hàng</SelectItem>
                  <SelectItem value="delivered">Đã giao</SelectItem>
                  <SelectItem value="disputed">Tranh chấp</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" title="Làm mới danh sách">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Tất cả ({getOrderCount('all')})
            </TabsTrigger>
            <TabsTrigger value="pending_payment" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Chờ thanh toán ({getOrderCount('pending_payment')})
            </TabsTrigger>
            <TabsTrigger value="payment_pending_verification" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Chờ xác nhận TT ({getOrderCount('payment_pending_verification')})
            </TabsTrigger>
            <TabsTrigger value="paid" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Đã thanh toán ({getOrderCount('paid')})
            </TabsTrigger>
            <TabsTrigger value="delivering" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Đang giao hàng ({getOrderCount('delivering')})
            </TabsTrigger>
            <TabsTrigger value="delivered" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Đã giao ({getOrderCount('delivered')})
            </TabsTrigger>
            <TabsTrigger value="disputed" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Tranh chấp ({getOrderCount('disputed')})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Hoàn thành ({getOrderCount('completed')})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground">Đang tải đơn hàng...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <XCircle className="h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Lỗi tải dữ liệu</h3>
                  <p className="text-muted-foreground text-center mb-4">{error}</p>
                  <Button onClick={loadOrders}>
                    Thử lại
                  </Button>
                </CardContent>
              </Card>
            ) : filteredOrders.length > 0 ? (
              <>
                {/* Show pending payment notice */}
                {activeTab === 'all' && getOrderCount('pending_payment') > 0 && (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-6 w-6 text-yellow-600" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-yellow-800">
                            ⚠️ Bạn có {getOrderCount('pending_payment')} đơn hàng cần thanh toán
                          </h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Hãy thanh toán ngay để hoàn tất quy trình đặt hàng và tránh bị hủy đơn.
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          onClick={() => setActiveTab('pending_payment')}
                        >
                          Xem ngay
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <div className="grid gap-4">
                  {paginatedOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Card className="border-primary/10 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                          Hiển thị <span className="font-semibold text-foreground">{startIndex + 1}</span> - <span className="font-semibold text-foreground">{Math.min(endIndex, filteredOrders.length)}</span> trong tổng số <span className="font-semibold text-foreground">{filteredOrders.length}</span> đơn hàng
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            Trước
                          </Button>
                          
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                              const pageNum = i + 1;
                              if (totalPages <= 7) return pageNum;
                              if (pageNum <= 2 || pageNum > totalPages - 2 || Math.abs(pageNum - currentPage) <= 1) return pageNum;
                              if (pageNum === 3 && currentPage > 4) return '...';
                              if (pageNum === totalPages - 2 && currentPage < totalPages - 3) return '...';
                              return null;
                            }).filter(Boolean).map((pageNum, idx) => (
                              pageNum === '...' ? (
                                <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                              ) : (
                                <Button
                                  key={pageNum}
                                  variant={currentPage === pageNum ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(pageNum as number)}
                                  className="min-w-[2.5rem]"
                                >
                                  {pageNum}
                                </Button>
                              )
                            ))}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Sau
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {activeTab === 'all' ? 'Chưa có đơn hàng nào' : `Không có đơn hàng ${activeTab}`}
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {activeTab === 'all' 
                      ? 'Bạn chưa có đơn hàng nào. Hãy bắt đầu giao dịch để tạo đơn hàng đầu tiên.'
                      : `Không có đơn hàng nào với trạng thái này.`
                    }
                  </p>
                  {activeTab === 'all' && (
                    <Button asChild>
                      <Link href="/listings">
                        Khám phá container
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }
