"use client";

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/components/providers/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  Building2, 
  Smartphone, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Package,
  MapPin,
  User,
  DollarSign,
  Calendar,
  Truck,
  ArrowLeft,
  QrCode,
  Loader2
} from 'lucide-react';
import { QRPaymentModal } from '@/components/payment/QRPaymentModal';
import { CreditCardPaymentModal } from '@/components/payment/CreditCardPaymentModal';

// Use relative path for API calls
const API_URL = '/api/v1';

interface Container {
  id: string;
  container_iso_code: string;
  shipping_line?: string;
  manufactured_year?: number;
  status: string;
  sold_at?: string;
  rented_at?: string;
  rental_return_date?: string;
  notes?: string;
  delivery_containers?: Array<{
    id: string;
    delivery_id: string;
    container_id: string;
    loaded_at?: string;
    delivered_at?: string;
  }>;
}

interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  status: string;
  subtotal: string;
  tax: string;
  fees: string;
  total: string;
  currency: string;
  created_at: string;
  updated_at: string;
  order_number?: string;
  // Backend relations
  listings?: {
    id: string;
    title: string;
    description: string;
    depots?: {
      id: string;
      name: string;
      address: string;
    };
  };
  users_orders_seller_idTousers?: {
    id: string;
    display_name: string;
    email: string;
  };
  users_orders_buyer_idTousers?: {
    id: string;
    display_name: string;
    email: string;
  };
  // Container information
  listing_containers_sold?: Container[];
  listing_containers_rented?: Container[];
  containers?: Array<{
    id: string;
    isoCode: string;
    shippingLine?: string;
    manufacturedYear?: number;
    status: string;
  }>;
}

export default function OrderPaymentPage({ params }: { params: { id: string } }) {
  const t = useTranslations();
  const { user } = useAuth();
  const router = useRouter();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('bank'); // Match backend enum
  const [walletMethod, setWalletMethod] = useState<'vnpay' | 'momo'>('vnpay');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);
  const [testMode, setTestMode] = useState(true); // Enable test mode for simulation

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  // Calculate payment method fees
  const calculatePaymentFees = () => {
    if (!order) return { paymentFee: 0, total: 0 };
    
    const baseAmount = parseFloat(order.subtotal || '0') + parseFloat(order.tax || '0');
    let paymentFee = 0;
    
    switch (paymentMethod) {
      case 'bank':
        paymentFee = 0; // Free
        break;
      case 'credit_card':
        paymentFee = baseAmount * 0.029 + 2000; // 2.9% + 2,000₫
        break;
      case 'wallet':
        paymentFee = baseAmount * 0.015; // 1.5%
        break;
      default:
        paymentFee = 0;
    }
    
    const total = baseAmount + paymentFee;
    
    return {
      baseAmount,
      paymentFee,
      total
    };
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError('Vui lòng đăng nhập để xem đơn hàng');
        return;
      }

      const response = await fetch(`${API_URL}/orders/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('Order details response:', data);

      if (response.ok && data.success) {
        setOrder(data.data.order || data.data);
      } else {
        setError(data.message || 'Không tìm thấy đơn hàng');
      }
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // No need for calculateFees - use real data from backend

  const handlePayment = async () => {
    if (!order) return;

    try {
      setProcessing(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      const paymentDetails = calculatePaymentFees();
      
      console.log('Processing payment for order:', order.id);
      console.log('Payment method:', paymentMethod);
      console.log('Payment fee:', paymentDetails.paymentFee);
      console.log('Total amount:', paymentDetails.total);

      const response = await fetch(`${API_URL}/orders/${order.id}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: paymentMethod,
          amount: paymentDetails.total,
          currency: order.currency || 'VND'
        }),
      });

      const data = await response.json();
      console.log('Payment response:', data);

      if (response.ok && data.success) {
        // Payment successful - redirect to orders list with success message
        console.log('✅ Payment successful:', data);
        router.push(`/orders?payment=success&orderId=${order.id}`);
      } else {
        setError(data.message || 'Thanh toán thất bại');
        console.error('❌ Payment failed:', data);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setProcessing(false);
    }
  };

  // 🧪 TEST MODE: Simulate payment success
  const handleTestPayment = async () => {
    if (!order) return;

    try {
      setProcessing(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      
      console.log('🧪 TEST MODE: Simulating payment for order:', order.id);
      
      // Simulate payment by calling the escrow fund endpoint
      const response = await fetch(`${API_URL}/payments/escrow/${order.id}/fund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: paymentMethod,
          amount: calculatePaymentFees().total,
          currency: order.currency || 'VND'
        }),
      });

      const data = await response.json();
      console.log('🧪 Test payment response:', data);

      if (response.ok && data.success) {
        // Show success message
        alert('✅ THANH TOÁN THÀNH CÔNG (Test Mode)\n\n' +
              `Đơn hàng: ${order.id}\n` +
              `Số tiền: ${new Intl.NumberFormat('vi-VN').format(calculatePaymentFees().total)} ${order.currency || 'VND'}\n` +
              `Phương thức: ${paymentMethod}\n\n` +
              'Đang chuyển hướng...');
        
        // Redirect to order detail
        setTimeout(() => {
          router.push(`/orders/${order.id}`);
        }, 1000);
      } else {
        setError(data.message || 'Thanh toán test thất bại');
        console.error('❌ Test payment failed:', data);
      }
    } catch (err: any) {
      console.error('Test payment error:', err);
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Đang tải thông tin đơn hàng...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
            <p className="text-red-600 mb-4">{error || 'Không tìm thấy đơn hàng'}</p>
            <Button onClick={() => router.push('/orders')} variant="outline">
              Quay lại danh sách đơn hàng
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.back()}
          className="hover:bg-blue-50 hover:border-blue-600 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Thanh toán đơn hàng
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              Mã đơn: #{order.id.slice(-8).toUpperCase()}
            </Badge>
            <span className="text-sm text-gray-500">•</span>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Shield className="h-3.5 w-3.5 text-green-600" />
              Bảo vệ bởi Escrow
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - Order Details & Containers */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. ORDER SUMMARY - Đơn hàng tổng quan */}
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-blue-900">Thông tin đơn hàng</CardTitle>
                  <CardDescription className="text-xs text-blue-700 mt-0.5">
                    Xem lại chi tiết đơn hàng của bạn
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {/* Listing Info */}
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-1.5">
                  {order?.listings?.title || 'Không có tiêu đề'}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                  {order?.listings?.description || 'Không có mô tả'}
                </p>
              </div>

              <Separator />

              {/* Order Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">
                      Người bán
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {order?.users_orders_seller_idTousers?.display_name || 'N/A'}
                  </p>
                </div>

                <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">
                      Địa điểm
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {order?.listings?.depots?.name || 'N/A'}
                  </p>
                </div>

                <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">
                      Ngày tạo
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">
                      Số lượng
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {((order.listing_containers_sold?.length || 0) + (order.listing_containers_rented?.length || 0))} container
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. CONTAINER LIST - Chi tiết containers */}
          {((order.listing_containers_sold && order.listing_containers_sold.length > 0) || 
            (order.listing_containers_rented && order.listing_containers_rented.length > 0)) && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Danh sách Container</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {((order.listing_containers_sold?.length || 0) + (order.listing_containers_rented?.length || 0))} container trong đơn hàng này
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sold Containers */}
                {order.listing_containers_sold && order.listing_containers_sold.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        Mua ({order.listing_containers_sold.length})
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {order.listing_containers_sold.map((container, index) => (
                        <div 
                          key={container.id}
                          className="bg-green-50/50 border border-green-200 rounded-lg p-3 hover:bg-green-50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-green-700 font-semibold text-sm">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                <h4 className="font-bold text-gray-900 text-sm">
                                  {container.container_iso_code}
                                </h4>
                                <Badge variant="outline" className="text-xs bg-white border-green-300 text-green-700">
                                  {container.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                                {container.shipping_line && (
                                  <div className="flex items-center gap-1">
                                    <Truck className="h-3 w-3 text-gray-400" />
                                    <span>{container.shipping_line}</span>
                                  </div>
                                )}
                                {container.manufactured_year && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-gray-400" />
                                    <span>SX: {container.manufactured_year}</span>
                                  </div>
                                )}
                              </div>
                              {container.notes && (
                                <p className="text-xs text-gray-500 mt-1.5 italic">
                                  {container.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rented Containers */}
                {order.listing_containers_rented && order.listing_containers_rented.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                        Thuê ({order.listing_containers_rented.length})
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {order.listing_containers_rented.map((container, index) => (
                        <div 
                          key={container.id}
                          className="bg-blue-50/50 border border-blue-200 rounded-lg p-3 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-blue-700 font-semibold text-sm">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                <h4 className="font-bold text-gray-900 text-sm">
                                  {container.container_iso_code}
                                </h4>
                                <Badge variant="outline" className="text-xs bg-white border-blue-300 text-blue-700">
                                  {container.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                                {container.shipping_line && (
                                  <div className="flex items-center gap-1">
                                    <Truck className="h-3 w-3 text-gray-400" />
                                    <span>{container.shipping_line}</span>
                                  </div>
                                )}
                                {container.manufactured_year && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-gray-400" />
                                    <span>SX: {container.manufactured_year}</span>
                                  </div>
                                )}
                                {container.rental_return_date && (
                                  <div className="flex items-center gap-1 col-span-2">
                                    <Calendar className="h-3 w-3 text-orange-500" />
                                    <span>Trả: {new Date(container.rental_return_date).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                )}
                              </div>
                              {container.notes && (
                                <p className="text-xs text-gray-500 mt-1.5 italic">
                                  {container.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN - Payment Summary & Methods */}
        <div className="lg:sticky lg:top-6 lg:self-start space-y-6">
          
          {/* 3. PAYMENT SUMMARY - Tổng tiền */}
          <Card className="border-2 border-blue-200 shadow-lg">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-blue-900">Tổng thanh toán</CardTitle>
                  <CardDescription className="text-xs text-blue-700 mt-0.5">
                    Chi tiết giá và phí
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
                {/* Container count */}
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-purple-600" />
                      <span className="text-xs font-medium text-purple-900">Số lượng:</span>
                    </div>
                    <span className="text-sm font-bold text-purple-900">
                      {((order.listing_containers_sold?.length || 0) + (order.listing_containers_rented?.length || 0))} container
                    </span>
                  </div>
                  {order.listing_containers_sold && order.listing_containers_sold.length > 0 && (
                    <div className="flex justify-between text-xs text-purple-700 pl-5">
                      <span>Mua:</span>
                      <span>{order.listing_containers_sold.length}</span>
                    </div>
                  )}
                  {order.listing_containers_rented && order.listing_containers_rented.length > 0 && (
                    <div className="flex justify-between text-xs text-purple-700 pl-5">
                      <span>Thuê:</span>
                      <span>{order.listing_containers_rented.length}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Price breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('vi-VN').format(parseFloat(order.subtotal || '0'))}₫
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thuế</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('vi-VN').format(parseFloat(order.tax || '0'))}₫
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí thanh toán</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('vi-VN').format(calculatePaymentFees().paymentFee)}₫
                    </span>
                  </div>
                  
                  {paymentMethod === 'bank' && (
                    <p className="text-xs text-green-600 pl-4">✓ Miễn phí</p>
                  )}
                  {paymentMethod === 'credit_card' && (
                    <p className="text-xs text-orange-600 pl-4">2.9% + 2,000₫</p>
                  )}
                  {paymentMethod === 'wallet' && (
                    <p className="text-xs text-purple-600 pl-4">1.5%</p>
                  )}
                </div>
                
                <Separator className="bg-gray-300" />
                
                {/* Total */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-4 shadow-md">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Tổng cộng</span>
                    <span className="font-bold text-2xl">
                      {new Intl.NumberFormat('vi-VN').format(calculatePaymentFees().total)}₫
                    </span>
                  </div>
                </div>

                {/* Escrow Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-green-900 mb-1">Bảo vệ Escrow</p>
                      <p className="text-xs text-green-700 leading-relaxed">
                        Tiền sẽ được giữ an toàn và chỉ chuyển cho người bán sau khi bạn xác nhận đã nhận hàng.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          {/* 4. PAYMENT METHODS - Phương thức thanh toán */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Phương thức thanh toán</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Chọn cách thanh toán phù hợp
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-2">
                  {/* Bank Transfer */}
                  <div className={`relative flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'bank' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}>
                    <RadioGroupItem value="bank" id="bank" className="mt-1" />
                    <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900">Chuyển khoản ngân hàng</div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          <span className="text-green-600 font-semibold">Miễn phí</span>
                        </div>
                      </div>
                    </Label>
                  </div>

                  {/* Credit Card */}
                  <div className={`relative flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'credit_card' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                  }`}>
                    <RadioGroupItem value="credit_card" id="credit_card" className="mt-1" />
                    <Label htmlFor="credit_card" className="flex items-center gap-2 cursor-pointer flex-1">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900">Thẻ tín dụng/Ghi nợ</div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          <span className="text-orange-600 font-semibold">Phí 2.9% + 2,000₫</span>
                        </div>
                      </div>
                    </Label>
                  </div>

                  {/* E-Wallet */}
                  <div className={`relative flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'wallet' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                  }`}>
                    <RadioGroupItem value="wallet" id="wallet" className="mt-1" />
                    <Label htmlFor="wallet" className="flex items-center gap-2 cursor-pointer flex-1">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Smartphone className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900">Ví điện tử</div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          MoMo, VNPay • <span className="text-purple-600 font-semibold">Phí 1.5%</span>
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* 5. ACTION BUTTONS - Nút thanh toán */}
          <div className="space-y-3">
            {/* 🧪 TEST MODE BUTTON */}
            {testMode && (
              <Card className="bg-yellow-50 border-2 border-yellow-400">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-lg">🧪</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-yellow-900 text-sm">Test Mode</h4>
                      <p className="text-xs text-yellow-700">Giả lập thanh toán thành công</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleTestPayment}
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold shadow-lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Giả lập thanh toán thành công
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Divider (only show if testMode) */}
            {testMode && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Hoặc dùng thanh toán thật</span>
                </div>
              </div>
            )}

            {/* Payment Buttons - Always show */}
            {/* QR Payment for Bank/Wallet */}
            {(paymentMethod === 'bank' || paymentMethod === 'wallet') && (
              <Button 
                onClick={() => setShowQRModal(true)}
                disabled={processing}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg font-bold"
                size="lg"
              >
                <QrCode className="mr-2 h-5 w-5" />
                Thanh toán bằng QR Code
              </Button>
            )}

            {/* Credit Card Payment */}
            {paymentMethod === 'credit_card' && (
              <Button 
                onClick={() => setShowCreditCardModal(true)}
                disabled={processing}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg font-bold"
                size="lg"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Thanh toán bằng thẻ
              </Button>
            )}

            {/* Security Features */}
            <Card className="border border-gray-200 mt-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-sm text-gray-900">Bảo mật thanh toán</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    <span>Mã hóa SSL 256-bit</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    <span>Bảo vệ gian lận</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    <span>Hoàn tiền 100% nếu có vấn đề</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* QR Payment Modal */}
      {showQRModal && (
        <QRPaymentModal
          open={showQRModal}
          onClose={() => setShowQRModal(false)}
          orderId={order.id}
          amount={calculatePaymentFees().total}
          currency={order.currency || 'VND'}
          method={
            paymentMethod === 'bank' ? 'bank' : 
            paymentMethod === 'wallet' ? walletMethod : 'vnpay'
          }
        />
      )}

      {/* Credit Card Payment Modal */}
      {showCreditCardModal && (
        <CreditCardPaymentModal
          open={showCreditCardModal}
          onClose={() => setShowCreditCardModal(false)}
          orderId={order.id}
          amount={calculatePaymentFees().baseAmount || 0}
          currency={order.currency || 'VND'}
        />
      )}
    </div>
  );
}