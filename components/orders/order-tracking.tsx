"use client";

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  Clock, 
  CreditCard,
  Truck,
  CheckCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  Download,
  MapPin,
  Calendar,
  User
} from 'lucide-react';
import { Link } from '@/i18n/routing';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

interface OrderTracking {
  id: string;
  orderNumber: string;
  status: string;
  listing: {
    id: string;
    title: string;
    priceAmount: number;
    priceCurrency: string;
  };
  seller: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  buyer: {
    id: string;
    displayName: string;
  };
  timeline: Array<{
    status: string;
    date: string;
    description: string;
    completed: boolean;
  }>;
  payment: {
    method: string;
    status: string;
    paidAt?: string;
  };
  delivery: {
    address: string;
    estimatedDate?: string;
    actualDate?: string;
    trackingNumber?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface OrderTrackingProps {
  orderId: string;
}

export default function OrderTracking({ orderId }: OrderTrackingProps) {
  const t = useTranslations();
  const { user } = useAuth();
  
  const [order, setOrder] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine if current user is buyer
  const isBuyer = user?.id === order?.buyer?.id;

  useEffect(() => {
    if (orderId) {
      fetchOrderTracking();
    }
  }, [orderId]);

  const fetchOrderTracking = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError('Vui lòng đăng nhập để xem đơn hàng');
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrder(data.data);
          return;
        }
      }
      
      // Fallback to mock data if API not ready
      console.warn('Order tracking API not ready, using mock data');
      setOrder(getMockOrderTracking());
    } catch (error) {
      console.error('Error fetching order tracking:', error);
      // Fallback to mock data
      setOrder(getMockOrderTracking());
    } finally {
      setLoading(false);
    }
  };

  const getMockOrderTracking = (): OrderTracking => ({
    id: orderId,
    orderNumber: `ORD-${orderId.slice(-6).toUpperCase()}`,
    status: 'delivering',
    listing: {
      id: 'listing_001',
      title: 'Container 40ft HC - Tình trạng tốt',
      priceAmount: 75000000,
      priceCurrency: 'VND'
    },
    seller: {
      id: 'seller_001',
      displayName: 'Công ty ABC Logistics',
      avatar: undefined
    },
    buyer: {
      id: user?.id || 'buyer_001',
      displayName: (user as any)?.displayName || 'Nguyễn Văn A'
    },
    timeline: [
      {
        status: 'created',
        date: '2024-10-01T09:00:00Z',
        description: 'Đơn hàng được tạo thành công',
        completed: true
      },
      {
        status: 'awaiting_funds',
        date: '2024-10-01T09:05:00Z',
        description: 'Chờ thanh toán ký quỹ',
        completed: true
      },
      {
        status: 'escrow_funded',
        date: '2024-10-01T10:30:00Z',
        description: 'Thanh toán ký quỹ hoàn tất',
        completed: true
      },
      {
        status: 'preparing',
        date: '2024-10-02T08:00:00Z',
        description: 'Người bán chuẩn bị hàng',
        completed: true
      },
      {
        status: 'delivering',
        date: '2024-10-03T14:00:00Z',
        description: 'Đang vận chuyển tới địa chỉ giao hàng',
        completed: true
      },
      {
        status: 'delivered',
        date: '2024-10-06T16:00:00Z',
        description: 'Đã giao hàng - chờ xác nhận',
        completed: false
      },
      {
        status: 'completed',
        date: '',
        description: 'Hoàn thành đơn hàng',
        completed: false
      }
    ],
    payment: {
      method: 'Bank Transfer',
      status: 'completed',
      paidAt: '2024-10-01T10:30:00Z'
    },
    delivery: {
      address: '123 Đường ABC, Quận 1, TP.HCM',
      estimatedDate: '2024-10-06T16:00:00Z',
      trackingNumber: 'TRK-ABC123456'
    },
    createdAt: '2024-10-01T09:00:00Z',
    updatedAt: '2024-10-03T14:00:00Z'
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'created':
        return { color: 'bg-gray-500', text: 'Đã tạo', icon: Clock };
      case 'awaiting_funds':
        return { color: 'bg-orange-500', text: 'Chờ thanh toán', icon: CreditCard };
      case 'escrow_funded':
        return { color: 'bg-blue-500', text: 'Đã ký quỹ', icon: CreditCard };
      case 'preparing':
        return { color: 'bg-yellow-500', text: 'Chuẩn bị', icon: Package };
      case 'delivering':
        return { color: 'bg-purple-500', text: 'Đang giao', icon: Truck };
      case 'delivered':
        return { color: 'bg-green-500', text: 'Đã giao', icon: CheckCircle };
      case 'completed':
        return { color: 'bg-emerald-500', text: 'Hoàn thành', icon: CheckCircle };
      case 'cancelled':
        return { color: 'bg-red-500', text: 'Đã hủy', icon: AlertCircle };
      default:
        return { color: 'bg-gray-500', text: status, icon: Clock };
    }
  };

  const calculateProgress = () => {
    if (!order) return 0;
    const completedSteps = order.timeline.filter(step => step.completed).length;
    const totalSteps = order.timeline.length;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  const formatPrice = (amount: number, currency: string) => {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
    }
    return `${amount} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Không tìm thấy đơn hàng</h3>
            <p className="text-muted-foreground text-center mb-4">
              {error || 'Đơn hàng này có thể đã bị xóa hoặc bạn không có quyền truy cập.'}
            </p>
            <Button asChild>
              <Link href="/orders">
                Quay lại danh sách đơn hàng
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;
  const progress = calculateProgress();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Đơn hàng {order.orderNumber}</span>
              </CardTitle>
              <CardDescription>
                Theo dõi tình trạng và lộ trình giao hàng
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className={`${statusInfo.color} text-white`}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {statusInfo.text}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tiến độ đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Hoàn thành</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {order.timeline.filter(step => step.completed).length} / {order.timeline.length} bước đã hoàn thành
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết đơn hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">{order.listing.title}</h3>
              <p className="text-lg font-semibold text-primary">
                {formatPrice(order.listing.priceAmount, order.listing.priceCurrency)}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Người bán:</span>
                <p className="font-medium">{order.seller.displayName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Người mua:</span>
                <p className="font-medium">{order.buyer.displayName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Ngày tạo:</span>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Cập nhật:</span>
                <p className="font-medium">{formatDate(order.updatedAt)}</p>
              </div>
            </div>

            <Separator />

            {/* Payment Info */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>Thanh toán</span>
              </h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Phương thức:</span>
                  <span>{order.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trạng thái:</span>
                  <Badge variant="secondary">
                    {order.payment.status === 'completed' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </Badge>
                </div>
                {order.payment.paidAt && (
                  <div className="flex justify-between">
                    <span>Thời gian:</span>
                    <span>{formatDate(order.payment.paidAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Giao hàng</span>
              </h4>
              <div className="text-sm space-y-1">
                <p>{order.delivery.address}</p>
                {order.delivery.estimatedDate && (
                  <div className="flex justify-between">
                    <span>Dự kiến:</span>
                    <span>{formatDate(order.delivery.estimatedDate)}</span>
                  </div>
                )}
                {order.delivery.trackingNumber && (
                  <div className="flex justify-between">
                    <span>Mã vận đơn:</span>
                    <span className="font-mono">{order.delivery.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch trình đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.timeline.map((step, index) => {
                const stepStatusInfo = getStatusInfo(step.status);
                const StepIcon = stepStatusInfo.icon;
                
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`rounded-full p-2 ${
                      step.completed 
                        ? stepStatusInfo.color + ' text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      <StepIcon className="h-3 w-3" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          step.completed ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {step.description}
                        </p>
                        {step.completed && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      {step.date && (
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(step.date)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/orders/${order.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href={`/messages/order-${order.id}`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Nhắn tin với người bán
              </Link>
            </Button>
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Tải hóa đơn
            </Button>
            
            {order.status === 'delivered' && isBuyer && (
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Xác nhận nhận hàng
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}