"use client";

import { useState, useEffect, useCallback } from 'react';
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Truck, 
  Search,
  Package,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  User,
  Phone,
  Navigation,
  RefreshCw,
  AlertTriangle,
  Eye,
  Filter,
  TrendingUp
} from 'lucide-react';
import { useNotificationContext } from '@/components/providers/notification-provider';

interface Order {
  id: string;
  orderNumber: string;
  status: 'processing' | 'in-transit' | 'delivered' | 'cancelled';
  trackingNumber: string;
  items: {
    containerType: string;
    size: string;
    quantity: number;
  }[];
  origin: string;
  destination: string;
  estimatedDelivery: string;
  currentLocation?: string;
  carrier?: string;
  driverName?: string;
  driverPhone?: string;
  timeline: {
    status: string;
    timestamp: string;
    location: string;
    note?: string;
  }[];
}

export default function OrdersTrackingPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { showSuccess, showError } = useNotificationContext();

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/tracking`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data.orders || []);
        if (silent) {
          showSuccess('Đã cập nhật trạng thái vận chuyển');
        }
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (!silent) {
        showError('Không thể tải danh sách đơn hàng');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [showSuccess, showError]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh every 30 seconds for in-transit orders
  useEffect(() => {
    const hasInTransitOrders = orders.some(
      order => order.status === 'in-transit'
    );
    
    if (hasInTransitOrders) {
      const interval = setInterval(() => {
        fetchOrders(true); // Silent refresh
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [orders, fetchOrders]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'preparing') {
      return matchesSearch && order.status === 'processing';
    }
    if (activeTab === 'transit') {
      return matchesSearch && order.status === 'in-transit';
    }
    if (activeTab === 'delivered') {
      return matchesSearch && order.status === 'delivered';
    }
    if (activeTab === 'issues') {
      return matchesSearch && order.status === 'cancelled';
    }
    return matchesSearch;
  });

  const stats = {
    total: orders.length,
    preparing: orders.filter(o => o.status === 'processing').length,
    transit: orders.filter(o => o.status === 'in-transit').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const handleRefresh = () => {
    fetchOrders(true);
  };

  const handleCallDriver = (phone: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      'processing': { variant: 'default' as const, icon: Package, label: 'Đang chuẩn bị', color: 'text-orange-600' },
      'in-transit': { variant: 'default' as const, icon: Truck, label: 'Đang vận chuyển', color: 'text-blue-600' },
      'delivered': { variant: 'default' as const, icon: CheckCircle, label: 'Đã giao', color: 'text-green-600' },
      'cancelled': { variant: 'destructive' as const, icon: AlertTriangle, label: 'Đã hủy', color: 'text-red-600' },
    };

    const { variant, icon: Icon, label } = config[status as keyof typeof config] || config.processing;

    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getStatusProgress = (status: string) => {
    const progress = {
      'processing': 40,
      'in-transit': 70,
      'delivered': 100,
      'cancelled': 0,
    };
    return progress[status as keyof typeof progress] || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Truck className="h-8 w-8 text-primary" />
            Theo dõi đơn hàng
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi trạng thái vận chuyển đơn hàng của bạn
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Đang cập nhật...' : 'Làm mới'}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Tổng số đơn</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{stats.total}</p>
                <p className="text-xs text-blue-600 mt-1">Tất cả vận chuyển</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Đang chuẩn bị</p>
                <p className="text-3xl font-bold text-orange-900 mt-2">{stats.preparing}</p>
                <p className="text-xs text-orange-600 mt-1">Chưa giao hàng</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Đang vận chuyển</p>
                <p className="text-3xl font-bold text-teal-900 mt-2">{stats.transit}</p>
                <p className="text-xs text-teal-600 mt-1">Trên đường giao</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">Đã giao hàng</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{stats.delivered}</p>
                <p className="text-xs text-green-600 mt-1">Hoàn thành</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mã đơn hàng hoặc mã vận đơn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            Tất cả
            {stats.total > 0 && (
              <Badge variant="secondary" className="ml-2">{stats.total}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preparing">
            Chuẩn bị
            {stats.preparing > 0 && (
              <Badge variant="secondary" className="ml-2">{stats.preparing}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="transit">
            Vận chuyển
            {stats.transit > 0 && (
              <Badge variant="secondary" className="ml-2">{stats.transit}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Đã giao
            {stats.delivered > 0 && (
              <Badge variant="secondary" className="ml-2">{stats.delivered}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="issues">
            Vấn đề
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Orders List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Truck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Chưa có đơn hàng nào</h3>
              <p className="text-muted-foreground mb-4">
                Bạn chưa có đơn hàng nào đang vận chuyển
              </p>
              <Button asChild>
                <Link href="/listings">Mua container</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Đơn hàng #{order.orderNumber}</CardTitle>
                    <CardDescription className="mt-1">
                      Mã vận đơn: {order.trackingNumber}
                    </CardDescription>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Tiến trình giao hàng</span>
                    <span className="font-semibold">{getStatusProgress(order.status)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${getStatusProgress(order.status)}%` }}
                    />
                  </div>
                </div>

                {/* Route Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Điểm đi</div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium">{order.origin}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Vị trí hiện tại</div>
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">{order.currentLocation || 'Đang cập nhật...'}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Điểm đến</div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{order.destination}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Dự kiến giao:</span>
                      <span className="font-semibold">
                        {new Date(order.estimatedDelivery).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Hàng hóa:</span>
                      <span className="font-semibold">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} container
                      </span>
                    </div>
                  </div>
                  {order.driverName && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Tài xế:</span>
                        <span className="font-semibold">{order.driverName}</span>
                      </div>
                      {order.driverPhone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">SĐT:</span>
                          <span className="font-semibold">{order.driverPhone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Timeline */}
                {order.timeline && order.timeline.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Lịch sử vận chuyển</h4>
                    <div className="space-y-4">
                      {order.timeline.map((event, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`h-3 w-3 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted'}`} />
                            {index < order.timeline.length - 1 && (
                              <div className="w-0.5 h-full bg-muted mt-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{event.status}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(event.timestamp).toLocaleString('vi-VN')}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {event.location}
                            </div>
                            {event.note && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {event.note}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action */}
                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <Button 
                    asChild 
                    variant="outline"
                    size="sm"
                  >
                    <Link href={`/orders/${order.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Xem chi tiết đơn hàng
                    </Link>
                  </Button>
                  {order.driverPhone && (
                    <Button 
                      onClick={() => handleCallDriver(order.driverPhone!)}
                      variant="default"
                      size="sm"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Gọi tài xế
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

