'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck, 
  MapPin, 
  AlertTriangle,
  FileText,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeliveryWorkflowStatusProps {
  order: {
    id: string;
    status: string;
    preparation?: {
      status: string;
      estimatedReadyDate?: string;
      preparationNotes?: string;
    };
    delivery?: {
      status: string;
      trackingNumber?: string;
      estimatedDelivery?: string;
    };
    deliveries?: Array<{
      delivery_method?: string;
      address?: string;
      pickup_address?: string;
    }>;
  };
  onPrepareDelivery?: () => void;
  onMarkReady?: () => void;
  onStartDelivering?: () => void;
  onMarkDelivered?: () => void;
  onRaiseDispute?: () => void;
  onBookTransportation?: () => void;
  userRole: 'buyer' | 'seller';
}

const STATUS_STEPS = [
  { 
    key: 'paid', 
    label: 'Đã thanh toán', 
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  { 
    key: 'preparing_delivery', 
    label: 'Đang chuẩn bị', 
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  { 
    key: 'ready_for_pickup', 
    label: 'Sẵn sàng pickup', 
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  { 
    key: 'transportation_booked', 
    label: 'Đã đặt vận chuyển', 
    icon: Truck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  { 
    key: 'in_transit', 
    label: 'Đang vận chuyển', 
    icon: Truck,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  { 
    key: 'delivered', 
    label: 'Đã giao hàng', 
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  { 
    key: 'completed', 
    label: 'Hoàn thành', 
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
];

export function DeliveryWorkflowStatus({
  order,
  onPrepareDelivery,
  onMarkReady,
  onStartDelivering,
  onMarkDelivered,
  onRaiseDispute,
  onBookTransportation,
  userRole,
}: DeliveryWorkflowStatusProps) {
  // Normalize status to lowercase with underscores
  let normalizedStatus = order.status.toLowerCase().replace(/-/g, '_');
  
  // Handle status aliases - map các tên khác nhau về tên chuẩn
  const statusAliases: Record<string, string> = {
    'delivering': 'in_transit',  // Alias: delivering → in_transit
    'scheduled': 'ready_for_pickup',
    'payment_pending_verification': 'paid',
    'payment_verified': 'paid'
  };
  
  const currentStatus = statusAliases[normalizedStatus] || normalizedStatus;
  const currentStepIndex = STATUS_STEPS.findIndex(step => step.key === currentStatus);

  // Get delivery method from order
  const deliveryMethod = order.deliveries?.[0]?.delivery_method || null;
  
  // Determine if this is self-pickup scenario
  const isSelfPickup = deliveryMethod === 'self_pickup';
  const isLogistics = deliveryMethod === 'logistics';
  const isSellerDelivers = deliveryMethod === 'seller_delivers';

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    const labels: Record<string, string> = {
      paid: 'Đã thanh toán',
      preparing_delivery: 'Đang chuẩn bị',
      ready_for_pickup: 'Sẵn sàng lấy hàng',
      transportation_booked: 'Đã đặt vận chuyển',
      delivering: 'Đang giao hàng',
      in_transit: 'Đang vận chuyển',
      delivered: 'Đã giao hàng',
      completed: 'Hoàn thành',
      disputed: 'Tranh chấp',
    };
    
    const variants: Record<string, any> = {
      paid: 'default',
      preparing_delivery: 'secondary',
      ready_for_pickup: 'default',
      transportation_booked: 'default',
      delivering: 'secondary',
      in_transit: 'secondary',
      delivered: 'default',
      completed: 'default',
      disputed: 'destructive',
    };
    
    return (
      <Badge variant={variants[statusLower] || 'outline'}>
        {labels[statusLower] || status.replace(/_/g, ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Current Status Card - Cải thiện UI */}
      <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
        {/* Header với gradient đẹp */}
        <div className="bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Truck className="h-6 w-6" />
              Trạng thái giao hàng
            </h3>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white font-semibold text-sm">
                {STATUS_STEPS[currentStepIndex]?.label || 'Đang xử lý'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Steps với UI hiện đại */}
        <div className="p-6">
          <div className="relative space-y-1">
            {STATUS_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <div key={step.key} className="relative">
                  {/* Connector Line */}
                  {index < STATUS_STEPS.length - 1 && (
                    <div
                      className={cn(
                        'absolute left-[19px] top-12 w-1 h-12 rounded-full transition-all duration-300',
                        isCompleted && 'bg-gradient-to-b from-green-500 to-green-600',
                        isCurrent && 'bg-gradient-to-b from-teal-400 to-gray-200',
                        isPending && 'bg-gray-200'
                      )}
                    />
                  )}

                  <div className={cn(
                    "flex items-start gap-4 p-4 rounded-xl transition-all duration-300",
                    isCurrent && "bg-gradient-to-r from-teal-50 to-cyan-50 shadow-md scale-105",
                    isCompleted && "bg-green-50/50",
                    isPending && "opacity-60"
                  )}>
                    {/* Icon với animation */}
                    <div
                      className={cn(
                        'relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md',
                        isCompleted && 'bg-gradient-to-br from-green-500 to-green-600 border-2 border-green-400',
                        isCurrent && 'bg-gradient-to-br from-teal-500 to-cyan-600 border-2 border-teal-400 ring-4 ring-teal-100',
                        isPending && 'bg-gray-200 border-2 border-gray-300'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5 transition-all duration-300',
                          (isCompleted || isCurrent) && 'text-white',
                          isPending && 'text-gray-400'
                        )}
                      />
                      {isCurrent && (
                        <div className="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-20" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1">
                      <p
                        className={cn(
                          'font-semibold text-base transition-all duration-300',
                          isCompleted && 'text-green-700',
                          isCurrent && 'text-teal-900',
                          isPending && 'text-gray-500'
                        )}
                      >
                        {step.label}
                      </p>
                      
                      {/* Step Details với padding tốt hơn */}
                      {isCurrent && (
                        <div className="mt-3 space-y-3">
                          {currentStatus === 'paid' && userRole === 'seller' && (
                            <Button size="sm" onClick={onPrepareDelivery} className="bg-teal-600 hover:bg-teal-700">
                              <Package className="h-4 w-4 mr-2" />
                              Bắt đầu chuẩn bị
                            </Button>
                          )}
                          {currentStatus === 'preparing_delivery' && userRole === 'seller' && (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600 bg-white/80 p-3 rounded-lg border border-gray-200">
                                💡 Hoàn thành checklist và đánh dấu sẵn sàng
                              </p>
                              <Button size="sm" onClick={onMarkReady} className="bg-teal-600 hover:bg-teal-700">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Đánh dấu sẵn sàng
                              </Button>
                            </div>
                          )}
                          {currentStatus === 'ready_for_pickup' && (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-700 bg-white/80 p-3 rounded-lg border border-gray-200 leading-relaxed">
                                📦 Container sẵn sàng để pickup. {userRole === 'buyer' ? 'Vui lòng đặt vận chuyển hoặc sắp xếp lịch đến lấy hàng.' : 'Đợi buyer đặt vận chuyển.'}
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                {userRole === 'buyer' && (
                                  <Button size="sm" onClick={onBookTransportation} className="bg-blue-600 hover:bg-blue-700 shadow-md">
                                    <Truck className="h-4 w-4 mr-2" />
                                    Đặt vận chuyển
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                          {currentStatus === 'transportation_booked' && (
                            <div className="space-y-2">
                              {/* Hiển thị khác nhau tùy theo delivery method */}
                              {isSelfPickup ? (
                                // Self Pickup: Buyer sẽ tự đến lấy
                                <>
                                  <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200 leading-relaxed">
                                    {userRole === 'buyer' 
                                      ? '📅 Bạn đã đặt lịch đến lấy hàng. Vui lòng đến đúng thời gian đã chọn.' 
                                      : '📅 Buyer đã đặt lịch đến lấy hàng. Vui lòng chuẩn bị container sẵn sàng.'}
                                  </p>
                                  {userRole === 'seller' && (
                                    <p className="text-xs text-gray-600 bg-amber-50 p-2 rounded border border-amber-200">
                                      💡 Chờ buyer đến lấy hàng, sau đó click "Xác nhận đã giao" khi buyer đã lấy.
                                    </p>
                                  )}
                                  {userRole === 'buyer' && (
                                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                                      <p className="text-xs font-medium text-gray-700 mb-1">📍 Địa điểm lấy hàng:</p>
                                      <p className="text-sm text-gray-900">{order.deliveries?.[0]?.address || 'Xem chi tiết vận chuyển'}</p>
                                    </div>
                                  )}
                                </>
                              ) : isLogistics ? (
                                // Logistics: Có carrier vận chuyển
                                <>
                                  <p className="text-sm text-gray-700 bg-white/80 p-3 rounded-lg border border-gray-200 leading-relaxed">
                                    ✅ {userRole === 'buyer' 
                                      ? 'Đã đặt vận chuyển với đối tác logistics. Đợi seller bắt đầu vận chuyển khi carrier đã lấy hàng.' 
                                      : 'Buyer đã đặt vận chuyển với logistics. Vui lòng bắt đầu vận chuyển khi carrier đã lấy hàng.'}
                                  </p>
                                  {userRole === 'seller' && (
                                    <Button size="sm" onClick={onStartDelivering} className="bg-orange-600 hover:bg-orange-700 shadow-md">
                                      <Truck className="h-4 w-4 mr-2" />
                                      Bắt đầu vận chuyển
                                    </Button>
                                  )}
                                </>
                              ) : (
                                // Seller Delivers: Seller tự giao
                                <>
                                  <p className="text-sm text-gray-700 bg-white/80 p-3 rounded-lg border border-gray-200 leading-relaxed">
                                    {userRole === 'buyer' 
                                      ? '🚚 Seller sẽ tự giao hàng đến địa chỉ của bạn. Đợi seller bắt đầu vận chuyển.' 
                                      : '🚚 Bạn đã cam kết tự giao hàng. Vui lòng bắt đầu vận chuyển khi sẵn sàng.'}
                                  </p>
                                  {userRole === 'seller' && (
                                    <Button size="sm" onClick={onStartDelivering} className="bg-orange-600 hover:bg-orange-700 shadow-md">
                                      <Truck className="h-4 w-4 mr-2" />
                                      Bắt đầu vận chuyển
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                          {currentStatus === 'in_transit' && (
                            <div className="space-y-2">
                              {userRole === 'buyer' && (
                                <>
                                  <p className="text-sm text-gray-700 bg-white/80 p-3 rounded-lg border border-gray-200">
                                    🚚 Đơn hàng đang được vận chuyển đến bạn
                                  </p>
                                  <Button 
                                    size="sm" 
                                    onClick={() => window.location.href = `/delivery/track/${order.id}`}
                                    className="bg-teal-600 hover:bg-teal-700 shadow-md"
                                  >
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Theo dõi vận chuyển
                                  </Button>
                                </>
                              )}
                              {userRole === 'seller' && (
                                <Button size="sm" onClick={onMarkDelivered} className="bg-green-600 hover:bg-green-700 shadow-md">
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Xác nhận đã giao
                                </Button>
                              )}
                            </div>
                          )}
                          {currentStatus === 'delivered' && userRole === 'buyer' && (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                ⏰ Vui lòng kiểm tra container trong vòng 7 ngày
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 shadow-md">
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Xác nhận nhận hàng
                                </Button>
                                <Button size="sm" variant="destructive" onClick={onRaiseDispute} className="shadow-md">
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Báo cáo vấn đề
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Preparation Details */}
      {order.preparation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Chi tiết chuẩn bị
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Trạng thái:</span>
              {getStatusBadge(order.preparation.status)}
            </div>
            {order.preparation.estimatedReadyDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Dự kiến sẵn sàng:</span>
                <span className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(order.preparation.estimatedReadyDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
            {order.preparation.preparationNotes && (
              <div>
                <span className="text-gray-600 block mb-1">Ghi chú:</span>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">
                  {order.preparation.preparationNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delivery Details */}
      {order.delivery && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Chi tiết vận chuyển
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Trạng thái:</span>
              {getStatusBadge(order.delivery.status)}
            </div>
            {order.delivery.trackingNumber && (
              <div className="flex justify-between">
                <span className="text-gray-600">Mã tracking:</span>
                <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {order.delivery.trackingNumber}
                </code>
              </div>
            )}
            {order.delivery.estimatedDelivery && (
              <div className="flex justify-between">
                <span className="text-gray-600">Dự kiến giao:</span>
                <span className="font-medium">
                  {new Date(order.delivery.estimatedDelivery).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Disputed Status */}
      {order.status === 'DISPUTED' && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              Đang có tranh chấp
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-red-700">
            <p>
              Đơn hàng đang được admin xem xét. Số tiền escrow đã được giữ.
              Vui lòng theo dõi tin nhắn từ admin.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
