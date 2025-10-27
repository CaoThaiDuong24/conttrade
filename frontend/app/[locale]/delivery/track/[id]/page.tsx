"use client";

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Phone, 
  Navigation,
  ArrowLeft,
  RefreshCw,
  Package,
  CheckCircle,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { useNotificationContext } from '@/components/providers/notification-provider';

interface DeliveryTracking {
  id: string;
  orderId: string;
  status: string;
  pickupDepotId: string;
  dropoffAddress: string;
  scheduleAt: string;
  carrierId: string;
  gpsTrackingId: string;
  createdAt: string;
  updatedAt: string;
  carrier: {
    id: string;
    name: string;
    phone: string;
    license: string;
  };
  events: Array<{
    id: string;
    eventType: string;
    payload: any;
    occurredAt: string;
    location?: {
      lat: number;
      lng: number;
      address: string;
    };
  }>;
  estimatedArrival?: string;
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
    lastUpdated: string;
  };
}

export default function DeliveryTrackingPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const { showSuccess, showError } = useNotificationContext();
  
  const [tracking, setTracking] = useState<DeliveryTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const trackingId = params.id as string;

  useEffect(() => {
    fetchTrackingData();
  }, [trackingId]);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

      const response = await fetch(`${API_URL}/api/v1/deliveries/${trackingId}/track`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tracking data');
      }

      const result = await response.json();
      
      if (result.success && result.data && result.data.tracking) {
        const data = result.data.tracking;
        
        // Transform API data to component format - using real data from API
        setTracking({
          id: data.deliveryId,
          orderId: trackingId,
          status: data.status,
          pickupDepotId: '',
          dropoffAddress: data.notes || 'Đang cập nhật địa chỉ giao hàng',
          scheduleAt: data.createdAt,
          carrierId: data.driverName || '',
          gpsTrackingId: data.deliveryId || 'N/A',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          carrier: {
            id: '',
            name: data.driverName || 'Chưa phân công tài xế',
            phone: data.driverPhone || 'Chưa có thông tin',
            license: data.vehicleNumber || 'Chưa có thông tin'
          },
          events: [], // API doesn't provide events history yet
          estimatedArrival: data.estimatedDelivery || undefined,
          currentLocation: data.currentLocation ? {
            lat: 0,
            lng: 0,
            address: data.currentLocation,
            lastUpdated: data.updatedAt
          } : undefined
        });
      } else {
        throw new Error(result.message || 'Failed to load tracking data');
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      showError('Không thể tải thông tin theo dõi');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTrackingData();
    setRefreshing(false);
    showSuccess('Đã cập nhật thông tin');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      // Match with database status values
      pending: { label: 'Chờ xử lý', variant: 'secondary' as const, color: 'bg-gray-500' },
      requested: { label: 'Đã yêu cầu', variant: 'secondary' as const, color: 'bg-gray-500' },
      scheduled: { label: 'Đã lên lịch', variant: 'default' as const, color: 'bg-blue-500' },
      ready_for_pickup: { label: 'Sẵn sàng lấy hàng', variant: 'default' as const, color: 'bg-cyan-500' },
      picked_up: { label: 'Đã lấy hàng', variant: 'default' as const, color: 'bg-orange-500' },
      in_transit: { label: 'Đang vận chuyển', variant: 'default' as const, color: 'bg-blue-500' },
      delivering: { label: 'Đang giao hàng', variant: 'default' as const, color: 'bg-indigo-500' },
      delivered: { label: 'Đã giao hàng', variant: 'default' as const, color: 'bg-green-500' },
      completed: { label: 'Hoàn thành', variant: 'default' as const, color: 'bg-green-600' },
      failed: { label: 'Giao thất bại', variant: 'destructive' as const, color: 'bg-red-500' },
      cancelled: { label: 'Đã hủy', variant: 'destructive' as const, color: 'bg-red-500' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>
    );
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'picked_up':
        return <Package className="h-4 w-4 text-orange-500" />;
      case 'in_transit':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventTitle = (eventType: string) => {
    switch (eventType) {
      case 'picked_up':
        return 'Đã lấy hàng';
      case 'in_transit':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã giao hàng';
      case 'failed':
        return 'Giao thất bại';
      default:
        return 'Cập nhật trạng thái';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy thông tin vận chuyển</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
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
            onClick={() => router.push('/delivery')}
          >
            Vận chuyển
          </span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Chi tiết theo dõi</span>
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
                <Truck className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Theo dõi vận chuyển</h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Navigation className="h-4 w-4" />
                  Mã theo dõi: <span className="font-mono text-gray-700">{tracking.gpsTrackingId}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(tracking.updatedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(tracking.status)}
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="shadow-sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Status */}
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="space-y-5 p-6">
              {/* Status Title Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-blue-900">Trạng thái hiện tại</h3>
                    <p className="text-sm text-blue-600">Cập nhật theo thời gian thực</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-xl text-gray-900">
                      {tracking.status === 'in_transit' ? 'Đang vận chuyển' :
                       tracking.status === 'delivering' ? 'Đang giao hàng' :
                       tracking.status === 'delivered' ? 'Đã giao hàng' :
                       tracking.status === 'completed' ? 'Hoàn thành' :
                       tracking.status === 'ready_for_pickup' ? 'Sẵn sàng lấy hàng' :
                       tracking.status === 'picked_up' ? 'Đã lấy hàng' :
                       tracking.status === 'scheduled' ? 'Đã lên lịch' :
                       tracking.status === 'pending' ? 'Chờ xử lý' : 'Đang cập nhật'}
                    </h4>
                    {getStatusBadge(tracking.status)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Cập nhật lần cuối: {new Date(tracking.updatedAt).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Status Details */}
              <div className="grid gap-3 md:grid-cols-2 text-sm">
                {tracking.estimatedArrival && (
                  <div className="flex items-start gap-3 text-gray-600 bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-500 text-xs block mb-1">Thời gian giao hàng dự kiến</span>
                      <span className="text-gray-900 font-medium text-sm">
                        {new Date(tracking.estimatedArrival).toLocaleString('vi-VN', {
                          weekday: 'short',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {tracking.currentLocation && (
                  <div className="flex items-start gap-3 text-gray-600 bg-white border border-gray-200 rounded-lg p-3 hover:border-green-300 hover:shadow-sm transition-all">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-500 text-xs block mb-1">Vị trí hiện tại</span>
                      <span className="text-gray-900 font-medium text-sm">{tracking.currentLocation.address}</span>
                      <p className="text-xs text-gray-500 mt-1">
                        Cập nhật: {new Date(tracking.currentLocation.lastUpdated).toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {!tracking.currentLocation && !tracking.estimatedArrival && (
                  <div className="col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                    <p className="text-muted-foreground">Thông tin vận chuyển đang được cập nhật</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Timeline */}
          {tracking.events && tracking.events.length > 0 && (
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-5">
                  {/* Timeline Title */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-100">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-purple-900">Lịch sử vận chuyển</h3>
                    </div>
                  </div>

                  {/* Timeline Events */}
                  <div className="space-y-6">
                    {tracking.events.map((event, index) => (
                      <div key={event.id} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-2 border-blue-200 shadow-sm">
                            {getEventIcon(event.eventType)}
                          </div>
                          {index < tracking.events.length - 1 && (
                            <div className="w-0.5 h-12 bg-gradient-to-b from-blue-200 to-gray-200 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 space-y-1 pb-4">
                          <div className="flex items-start justify-between gap-4">
                            <h4 className="font-semibold text-gray-900">{getEventTitle(event.eventType)}</h4>
                            <span className="text-sm text-gray-600 whitespace-nowrap">
                              {new Date(event.occurredAt).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {event.location && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location.address}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Carrier Information */}
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-5">
                {/* Carrier Title */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-5 border border-orange-100">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
                      <Truck className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-orange-900">Thông tin vận chuyển</h3>
                  </div>
                </div>

                {/* Carrier Details */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-gray-600 bg-white border border-gray-200 rounded-lg p-3 hover:border-orange-300 hover:shadow-sm transition-all">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Truck className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-500 text-xs block mb-1">Đơn vị vận chuyển</span>
                      <span className="text-gray-900 font-semibold">{tracking.carrier.name}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-gray-600 bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-500 text-xs block mb-1">Biển số xe</span>
                      <span className="text-gray-900 font-semibold">{tracking.carrier.license}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-gray-600 bg-white border border-gray-200 rounded-lg p-3 hover:border-green-300 hover:shadow-sm transition-all">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-500 text-xs block mb-1">Số điện thoại</span>
                      <span className="text-gray-900 font-semibold">{tracking.carrier.phone}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all">
                  <Phone className="mr-2 h-4 w-4" />
                  Liên hệ tài xế
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Details */}
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-5">
                {/* Delivery Title */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border border-green-100">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-green-900">Chi tiết giao hàng</h3>
                  </div>
                </div>

                {/* Delivery Details Grid */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-gray-600 bg-white border border-gray-200 rounded-lg p-3 hover:border-green-300 hover:shadow-sm transition-all">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-500 text-xs block mb-1">Địa chỉ giao hàng</span>
                      <span className="text-gray-900 font-medium text-sm leading-relaxed">{tracking.dropoffAddress}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-gray-600 bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-sm transition-all">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-500 text-xs block mb-1">Thời gian tạo đơn</span>
                      <span className="text-gray-900 font-medium text-sm">
                        {new Date(tracking.scheduleAt).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-gray-600 bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Navigation className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-500 text-xs block mb-1">Mã đơn vận chuyển</span>
                      <span className="text-gray-900 font-mono font-medium text-xs break-all">{tracking.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
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
                
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left hover:bg-blue-50 hover:border-blue-300 transition-all"
                    onClick={() => {
                      if (tracking.carrier.phone && tracking.carrier.phone !== 'Chưa có thông tin') {
                        window.location.href = `tel:${tracking.carrier.phone}`;
                      } else {
                        showError('Chưa có thông tin số điện thoại tài xế');
                      }
                    }}
                  >
                    <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Liên hệ tài xế</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left hover:bg-green-50 hover:border-green-300 transition-all" 
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 flex-shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Cập nhật thông tin</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left hover:bg-purple-50 hover:border-purple-300 transition-all"
                    onClick={() => {
                      showError('Tính năng xem trên bản đồ đang được phát triển');
                    }}
                  >
                    <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Xem trên bản đồ</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left hover:bg-orange-50 hover:border-orange-300 transition-all"
                    onClick={() => router.push('/delivery')}
                  >
                    <Truck className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Quay lại danh sách</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
