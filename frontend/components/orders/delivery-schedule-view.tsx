import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Truck, Package, CheckCircle2, Clock, AlertCircle, MapPin, Phone, User, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-context';

interface Container {
  id: string;
  isoCode: string;
  shippingLine?: string;
  manufacturedYear?: number;
  deliveryStatus?: string;
  deliveryDate?: string;
  batchNumber?: number;
  pickedUpAt?: string;
  deliveredAt?: string;
}

interface DeliveryBatch {
  id: string;
  batchNumber: number;
  totalBatches: number;
  status: string;
  deliveryDate: string;
  deliveryTime?: string;
  containersCount: number;
  transportationFee?: number;
  carrierName?: string;
  trackingNumber?: string;
  deliveryAddress?: string;
  deliveryContact?: string;
  deliveryPhone?: string;
  containers: Container[];
}

interface DeliveryScheduleData {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  totalContainers: number;
  isReadyForDelivery: boolean; // ✅ Thêm flag
  summary: {
    delivered: number;
    inTransit: number;
    scheduled: number;
    pendingSchedule: number;
  };
  containers: {
    delivered: Container[];
    inTransit: Container[];
    scheduled: Container[];
    pendingSchedule: Container[];
  };
  deliveryBatches: DeliveryBatch[];
}

interface DeliveryScheduleViewProps {
  orderId: string;
  onScheduleBatch?: () => void;
}

export default function DeliveryScheduleView({ orderId, onScheduleBatch }: DeliveryScheduleViewProps) {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<DeliveryScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchSchedule();
    }
  }, [orderId]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Vui lòng đăng nhập lại');
        return;
      }

      const response = await fetch(`/api/v1/orders/${orderId}/delivery-schedule`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.message || 'Không thể tải thông tin giao hàng');
        return;
      }

      setSchedule(result.data);
    } catch (err) {
      console.error('Error fetching delivery schedule:', err);
      setError('Có lỗi xảy ra khi tải thông tin giao hàng');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchSchedule} variant="outline" className="mt-4">
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!schedule) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            Không có thông tin giao hàng
          </div>
        </CardContent>
      </Card>
    );
  }

  // ✅ Kiểm tra nếu order chưa sẵn sàng cho delivery
  if (!schedule.isReadyForDelivery) {
    const getOrderStatusMessage = (status: string) => {
      const statusUpper = status?.toUpperCase();
      
      if (statusUpper === 'PENDING_PAYMENT' || statusUpper === 'PAYMENT_PENDING_VERIFICATION') {
        return {
          title: 'Chưa thanh toán',
          message: 'Vui lòng hoàn tất thanh toán để seller bắt đầu chuẩn bị hàng.',
          icon: AlertCircle,
          color: 'text-yellow-600'
        };
      }
      
      if (statusUpper === 'PAID') {
        return {
          title: 'Seller đang chuẩn bị hàng',
          message: 'Seller sẽ chuẩn bị container và đánh dấu sẵn sàng. Sau đó bạn mới có thể lên lịch giao hàng.',
          icon: Package,
          color: 'text-blue-600'
        };
      }
      
      if (statusUpper === 'PREPARING_DELIVERY') {
        return {
          title: 'Seller đang chuẩn bị hàng',
          message: 'Seller đang kiểm tra và chuẩn bị container. Chờ seller đánh dấu sẵn sàng để lên lịch giao hàng.',
          icon: Clock,
          color: 'text-blue-600'
        };
      }
      
      return {
        title: 'Chưa sẵn sàng lên lịch',
        message: 'Đơn hàng chưa ở trạng thái cho phép lên lịch giao hàng.',
        icon: AlertCircle,
        color: 'text-gray-600'
      };
    };

    const statusInfo = getOrderStatusMessage(schedule.orderStatus);
    const StatusIcon = statusInfo.icon;

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <StatusIcon className={`h-16 w-16 ${statusInfo.color} mx-auto mb-4`} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {statusInfo.title}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {statusInfo.message}
            </p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
              <div className="flex items-start gap-3 text-sm text-left">
                <Package className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 mb-1">Quy trình giao hàng:</p>
                  <ol className="space-y-1 text-blue-700">
                    <li>1. Thanh toán đơn hàng ✓</li>
                    <li>2. Seller chuẩn bị container {schedule.orderStatus === 'PAID' || schedule.orderStatus === 'PREPARING_DELIVERY' ? '⏳' : ''}</li>
                    <li>3. Seller đánh dấu sẵn sàng pickup</li>
                    <li>4. Lên lịch giao hàng</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = schedule.totalContainers > 0 
    ? ((schedule.summary.delivered + schedule.summary.inTransit) / schedule.totalContainers) * 100 
    : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge className="bg-green-500 hover:bg-green-600">Đã giao</Badge>;
      case 'IN_TRANSIT':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Đang vận chuyển</Badge>;
      case 'SCHEDULED':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Đã lên lịch</Badge>;
      case 'PENDING_PICKUP':
        return <Badge variant="outline">Chờ lên lịch</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Tiến độ giao hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tổng tiến độ</span>
              <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{schedule.summary.delivered}</div>
              <div className="text-xs text-green-700">Đã giao</div>
            </div>

            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{schedule.summary.inTransit}</div>
              <div className="text-xs text-blue-700">Đang vận chuyển</div>
            </div>

            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{schedule.summary.scheduled}</div>
              <div className="text-xs text-yellow-700">Đã lên lịch</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Package className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-gray-600">{schedule.summary.pendingSchedule}</div>
              <div className="text-xs text-gray-700">Chờ lên lịch</div>
            </div>
          </div>

          {schedule.summary.pendingSchedule > 0 && onScheduleBatch && (
            <div className="pt-4">
              <Button onClick={onScheduleBatch} className="w-full bg-blue-600 hover:bg-blue-700">
                <Clock className="mr-2 h-4 w-4" />
                Lên lịch giao hàng cho {schedule.summary.pendingSchedule} containers còn lại
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Batches */}
      {schedule.deliveryBatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Các đợt giao hàng ({schedule.deliveryBatches.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {schedule.deliveryBatches.map((batch, index) => (
              <div key={batch.id}>
                {index > 0 && <Separator className="my-4" />}
                
                <div className="space-y-3">
                  {/* Batch Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold">
                        {batch.batchNumber}
                      </div>
                      <div>
                        <div className="font-medium">
                          Batch {batch.batchNumber}/{batch.totalBatches}
                        </div>
                        <div className="text-sm text-gray-500">
                          {batch.containersCount} containers
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(batch.status)}
                  </div>

                  {/* Batch Details */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <div className="text-gray-600">Ngày giao hàng</div>
                          <div className="font-medium">
                            {new Date(batch.deliveryDate).toLocaleDateString('vi-VN')}
                            {batch.deliveryTime && ` • ${batch.deliveryTime}`}
                          </div>
                        </div>
                      </div>

                      {batch.deliveryAddress && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <div className="text-gray-600">Địa chỉ giao hàng</div>
                            <div className="font-medium">{batch.deliveryAddress}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {batch.deliveryContact && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Người nhận:</span>
                        <span className="font-medium">{batch.deliveryContact}</span>
                        {batch.deliveryPhone && (
                          <>
                            <Phone className="h-4 w-4 text-gray-500 ml-2" />
                            <span className="font-medium">{batch.deliveryPhone}</span>
                          </>
                        )}
                      </div>
                    )}

                    {batch.carrierName && (
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Tài xế:</span>
                        <span className="font-medium">{batch.carrierName}</span>
                      </div>
                    )}

                    {batch.trackingNumber && (
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Mã tracking:</span>
                        <span className="font-mono text-blue-600">{batch.trackingNumber}</span>
                      </div>
                    )}

                    {batch.transportationFee && batch.transportationFee > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Phí vận chuyển:</span>
                        <span className="font-medium text-green-600">
                          {batch.transportationFee.toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Containers in this batch */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      Containers trong đợt này:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {batch.containers.map(container => (
                        <div
                          key={container.id}
                          className="flex items-center justify-between p-2 border rounded bg-white"
                        >
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-mono text-sm">{container.isoCode}</div>
                              {container.shippingLine && (
                                <div className="text-xs text-gray-500">{container.shippingLine}</div>
                              )}
                            </div>
                          </div>
                          {container.deliveredAt ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : container.pickedUpAt ? (
                            <Truck className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pending Containers */}
      {schedule.containers.pendingSchedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Containers chưa lên lịch ({schedule.containers.pendingSchedule.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {schedule.containers.pendingSchedule.map(container => (
                <div
                  key={container.id}
                  className="flex items-center gap-2 p-3 border rounded-lg bg-yellow-50 border-yellow-200"
                >
                  <Package className="h-4 w-4 text-yellow-600" />
                  <div>
                    <div className="font-mono text-sm font-medium">{container.isoCode}</div>
                    {container.shippingLine && (
                      <div className="text-xs text-gray-600">{container.shippingLine}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {onScheduleBatch && (
              <Button onClick={onScheduleBatch} variant="outline" className="w-full mt-4">
                <Clock className="mr-2 h-4 w-4" />
                Lên lịch giao hàng cho các containers này
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {schedule.deliveryBatches.length === 0 && schedule.containers.pendingSchedule.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Chưa có lịch giao hàng nào</p>
              {onScheduleBatch && (
                <Button onClick={onScheduleBatch} className="bg-blue-600 hover:bg-blue-700">
                  <Clock className="mr-2 h-4 w-4" />
                  Lên lịch giao hàng đợt đầu tiên
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
