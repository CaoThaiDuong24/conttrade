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
  ArrowLeft
} from 'lucide-react';

// Use relative path for API calls
const API_URL = '/api/v1';

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
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.back()}
          className="hover:bg-blue-50 hover:border-blue-600 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Thanh toán đơn hàng
          </h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            Hoàn tất thanh toán để bảo vệ giao dịch thông qua Escrow
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary */}
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-5">
                {/* Order Title */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-blue-900">Thông tin đơn hàng</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900">{order?.listings?.title || 'Không có tiêu đề'}</h3>
                      <p className="text-sm text-gray-600 mt-2">
                        {order?.listings?.description || 'Không có mô tả'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-base px-3 py-1.5 bg-blue-50 border-blue-200 text-blue-700">
                      #{order.id.slice(-8).toUpperCase()}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm bg-white rounded-lg p-3 border border-gray-200">
                      <MapPin className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Vị trí</p>
                        <p className="font-medium text-gray-900 truncate">
                          {order?.listings?.depots?.name || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm bg-white rounded-lg p-3 border border-gray-200">
                      <User className="h-5 w-5 text-orange-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Người bán</p>
                        <p className="font-medium text-gray-900 truncate">
                          {order?.users_orders_seller_idTousers?.display_name || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm bg-white rounded-lg p-3 border border-gray-200">
                      <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Ngày tạo</p>
                        <p className="font-medium text-gray-900">
                          {new Date(order.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm bg-white rounded-lg p-3 border border-gray-200">
                      <Truck className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Giao hàng</p>
                        <p className="font-medium text-gray-900">Chưa có thông tin</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-5">
                {/* Payment Methods Title */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-green-900">Chọn phương thức thanh toán</h3>
                      <p className="text-xs text-green-700 mt-0.5">
                        Chọn phương thức thanh toán phù hợp với bạn
                      </p>
                    </div>
                  </div>
                </div>

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    {/* Bank Transfer */}
                    <div className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'bank' 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50'
                    }`}>
                      <RadioGroupItem value="bank" id="bank" />
                      <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900">Chuyển khoản ngân hàng</div>
                          <div className="text-sm text-gray-600 mt-0.5">
                            Chuyển khoản trực tiếp qua ngân hàng • <span className="text-green-600 font-semibold">Miễn phí ✓</span>
                          </div>
                        </div>
                      </Label>
                    </div>

                    {/* Credit Card */}
                    <div className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'credit_card' 
                        ? 'border-green-500 bg-green-50 shadow-md' 
                        : 'border-gray-200 bg-white hover:border-green-400 hover:bg-green-50'
                    }`}>
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <Label htmlFor="credit_card" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                          <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900">Thẻ tín dụng/Ghi nợ</div>
                          <div className="text-sm text-gray-600 mt-0.5">
                            Visa, Mastercard, JCB • <span className="text-orange-600 font-semibold">Phí 2.9% + 2,000₫</span>
                          </div>
                        </div>
                      </Label>
                    </div>

                    {/* E-Wallet */}
                    <div className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'wallet' 
                        ? 'border-purple-500 bg-purple-50 shadow-md' 
                        : 'border-gray-200 bg-white hover:border-purple-400 hover:bg-purple-50'
                    }`}>
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label htmlFor="wallet" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                          <Smartphone className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900">Ví điện tử</div>
                          <div className="text-sm text-gray-600 mt-0.5">
                            MoMo, ZaloPay, VNPay • <span className="text-purple-600 font-semibold">Phí 1.5%</span>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary */}
        <div className="space-y-6">
          <Card className="border shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-5">
                {/* Summary Title */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-blue-900">Chi tiết thanh toán</h3>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium text-gray-900">
                      {new Intl.NumberFormat('vi-VN').format(parseFloat(order.subtotal || '0'))} {order.currency || 'VND'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Thuế:</span>
                    <span className="font-medium text-gray-900">
                      {new Intl.NumberFormat('vi-VN').format(parseFloat(order.tax || '0'))} {order.currency || 'VND'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      Phí thanh toán 
                      {paymentMethod === 'bank' && <span className="text-green-600 font-semibold ml-1">(Miễn phí)</span>}
                      {paymentMethod === 'credit_card' && <span className="text-orange-600 ml-1">(2.9% + 2,000₫)</span>}
                      {paymentMethod === 'wallet' && <span className="text-purple-600 ml-1">(1.5%)</span>}
                      :
                    </span>
                    <span className="font-medium text-gray-900">
                      {new Intl.NumberFormat('vi-VN').format(calculatePaymentFees().paymentFee)} {order.currency || 'VND'}
                    </span>
                  </div>
                  
                  <Separator className="my-3 bg-gray-300" />
                  
                  <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-4 shadow-lg">
                    <span className="font-bold text-lg">Tổng thanh toán:</span>
                    <span className="font-bold text-2xl">
                      {new Intl.NumberFormat('vi-VN').format(calculatePaymentFees().total)} {order.currency || 'VND'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <Button 
            onClick={handlePayment}
            disabled={processing}
            className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all font-bold text-base"
            size="lg"
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Đang xử lý thanh toán...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>Thanh toán an toàn qua Escrow</span>
              </div>
            )}
          </Button>

          {/* Escrow Info */}
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-green-900 mb-1">Bảo vệ Escrow</h4>
                  <p className="text-sm text-green-700 leading-relaxed">
                    Tiền sẽ được giữ an toàn trong tài khoản ký quỹ và chỉ được chuyển cho người bán sau khi bạn xác nhận đã nhận hàng.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Features */}
          <Card className="border shadow-sm">
            <CardContent className="p-5">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-gray-900">Tính năng bảo mật</h4>
                </div>
                
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Mã hóa SSL 256-bit</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Bảo vệ gian lận</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Hoàn tiền 100% nếu có vấn đề</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Hỗ trợ 24/7</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}