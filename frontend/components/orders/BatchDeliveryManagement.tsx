"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Truck, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Star,
  MessageSquare
} from 'lucide-react';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ConfirmReceiptForm } from './ConfirmReceiptForm';
import { MarkDeliveredForm } from './MarkDeliveredForm';
import DeliveryReviewModal from './DeliveryReviewModal';

interface Container {
  id: string;
  container_iso_code: string;
  delivery_status?: string;
  delivered_at?: string;
  receipt_condition?: string;
  receipt_notes?: string;
  receipt_confirmed_at?: string;
  received_by?: string;
  signature_url?: string;
  condition_notes?: string;
  transportation_booked_at?: string;
  transport_method?: string;
}

interface DeliveryReview {
  id: string;
  rating: number;
  comment?: string;
  deliveryQualityRating?: number;
  packagingRating?: number;
  timelinessRating?: number;
  createdAt: string;
  response?: string;
  responseAt?: string;
  reviewer: {
    id: string;
    displayName: string;
    avatar?: string;
  };
}

interface Delivery {
  id: string;
  order_id: string;
  batch_number: number;
  total_batches: number;
  status: string;
  delivery_address: string;
  containers_count: number;
  scheduled_date?: string;
  delivered_at?: string;
  receipt_confirmed_at?: string;
  delivery_containers?: Container[];
  delivery_method?: string;
  logistics_company?: string;
  review?: DeliveryReview;
}

interface Props {
  orderId: string;
  isSeller: boolean;
  isBuyer: boolean;
  onRefresh?: () => void;
  onScheduleDelivery?: () => void; // Callback to open schedule modal
}

export default function BatchDeliveryManagement({ orderId, isSeller, isBuyer, onRefresh, onScheduleDelivery }: Props) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmReceiptDialogOpen, setConfirmReceiptDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showMarkDeliveredForm, setShowMarkDeliveredForm] = useState(false);
  const [selectedDeliveryForMark, setSelectedDeliveryForMark] = useState<{
    deliveryId: string;
    containers: Array<{ id: string; container_iso_code: string; delivered_at?: string | null }>;
    singleContainerId?: string; // ID of specific container to mark (when clicking individual button)
    markAllMode?: boolean; // If true, mark all containers (show list but no checkboxes)
  } | null>(null);
  const [showContainerReceiptDialog, setShowContainerReceiptDialog] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<{
    deliveryId: string;
    containerId: string;
    containerCode: string;
  } | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedDeliveryForReview, setSelectedDeliveryForReview] = useState<Delivery | null>(null);
  const [deliveryReviews, setDeliveryReviews] = useState<Record<string, DeliveryReview>>({});
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [selectedReviewForResponse, setSelectedReviewForResponse] = useState<DeliveryReview | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const { showSuccess, showError } = useNotificationContext();

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/v1/deliveries/order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch deliveries');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // Sort by batch_number
        const sortedDeliveries = (data.data as Delivery[]).sort(
          (a, b) => a.batch_number - b.batch_number
        );
        setDeliveries(sortedDeliveries);

        // Fetch reviews for each delivery
        await fetchDeliveryReviews(sortedDeliveries.map(d => d.id));
      }
    } catch (error: any) {
      console.error('Error fetching deliveries:', error);
      showError(error.message || 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  }, [orderId, showError]);

  const fetchDeliveryReviews = async (deliveryIds: string[]) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const reviewsMap: Record<string, DeliveryReview> = {};

      // Fetch review for each delivery
      for (const deliveryId of deliveryIds) {
        try {
          const response = await fetch(`/api/v1/deliveries/${deliveryId}/review`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              const review = data.data;
              // Map snake_case to camelCase
              reviewsMap[deliveryId] = {
                id: review.id,
                rating: review.rating,
                comment: review.comment,
                deliveryQualityRating: review.delivery_quality_rating,
                packagingRating: review.packaging_rating,
                timelinessRating: review.timeliness_rating,
                createdAt: review.created_at,
                response: review.response,
                responseAt: review.response_at,
                reviewer: {
                  id: review.users_reviews_reviewer_idTousers?.id || '',
                  displayName: review.users_reviews_reviewer_idTousers?.display_name || '',
                  avatar: review.users_reviews_reviewer_idTousers?.avatar_url
                }
              };
            }
          }
        } catch (err) {
          // Ignore errors for individual reviews
          console.error(`Failed to fetch review for delivery ${deliveryId}:`, err);
        }
      }

      setDeliveryReviews(reviewsMap);
    } catch (error) {
      console.error('Error fetching delivery reviews:', error);
    }
  };

  const handleResponseClick = (review: DeliveryReview) => {
    setSelectedReviewForResponse(review);
    setResponseText(review.response || '');
    setShowResponseDialog(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedReviewForResponse || !responseText.trim()) {
      showError('Vui lòng nhập nội dung phản hồi');
      return;
    }

    try {
      setSubmittingResponse(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`/api/v1/delivery-reviews/${selectedReviewForResponse.id}/response`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ response: responseText.trim() })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showSuccess('Đã gửi phản hồi thành công!');
        setShowResponseDialog(false);
        setSelectedReviewForResponse(null);
        setResponseText('');
        // Refresh reviews
        await fetchDeliveryReviews(deliveries.map(d => d.id));
      } else {
        showError(result.message || 'Không thể gửi phản hồi');
      }
    } catch (error: any) {
      showError(error.message || 'Có lỗi xảy ra');
    } finally {
      setSubmittingResponse(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  // Auto-expand first batch with pending actions
  useEffect(() => {
    if (deliveries.length > 0 && !expandedBatch) {
      const batchWithPendingAction = deliveries.find(delivery => {
        if (isSeller) {
          const pendingDelivery = delivery.delivery_containers?.filter(
            c => c.transportation_booked_at && !c.delivered_at
          ).length || 0;
          return pendingDelivery > 0;
        }
        if (isBuyer) {
          const pendingConfirmation = delivery.delivery_containers?.filter(
            c => c.delivered_at && !c.received_by
          ).length || 0;
          return pendingConfirmation > 0;
        }
        return false;
      });
      
      if (batchWithPendingAction) {
        setExpandedBatch(batchWithPendingAction.id);
      }
    }
  }, [deliveries, expandedBatch, isSeller, isBuyer]);

  const handleMarkDelivered = async (deliveryId: string) => {
    try {
      setActionLoading(deliveryId);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/v1/deliveries/${deliveryId}/mark-delivered`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          delivered_by: 'Seller', // This should come from a form
          delivered_at: new Date().toISOString(),
          notes: 'Batch delivered successfully',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to mark delivery');
      }

      const result = await response.json();
      showSuccess(result.message || 'Batch marked as delivered successfully');
      
      // Refresh deliveries
      await fetchDeliveries();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      console.error('Error marking delivered:', error);
      showError(error.message || 'Failed to mark delivery');
    } finally {
      setActionLoading(null);
    }
  };

  // Seller confirms delivery for single container - Open MarkDeliveredForm
  const handleConfirmContainerDelivery = async (deliveryId: string, containerId: string, containerCode: string) => {
    // Get delivery object to find all containers
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery || !delivery.delivery_containers) {
      showError('Không tìm thấy thông tin delivery');
      return;
    }

    // Open MarkDeliveredForm for ONLY this specific container
    setSelectedDeliveryForMark({
      deliveryId: deliveryId,
      containers: delivery.delivery_containers.map(c => ({
        id: c.id,
        container_iso_code: c.container_iso_code,
        delivered_at: c.delivered_at || null
      })),
      singleContainerId: containerId  // Mark only this container
    });
    setShowMarkDeliveredForm(true);
  };

  // Seller confirms delivery for all containers in batch - Open MarkDeliveredForm
  const handleConfirmAllDelivered = async (delivery: Delivery) => {
    if (!delivery.delivery_containers) {
      showError('Không tìm thấy thông tin containers');
      return;
    }

    // Open MarkDeliveredForm in "mark all" mode (show list but no checkboxes)
    setSelectedDeliveryForMark({
      deliveryId: delivery.id,
      containers: delivery.delivery_containers.map(c => ({
        id: c.id,
        container_iso_code: c.container_iso_code,
        delivered_at: c.delivered_at || null
      })),
      markAllMode: true  // Show list of containers without checkboxes
    });
    setShowMarkDeliveredForm(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string; icon: any }> = {
      'PENDING': { variant: 'secondary', label: 'Chờ xử lý', icon: Clock },
      'SCHEDULED': { variant: 'default', label: 'Đã lên lịch', icon: Clock },
      'IN_TRANSIT': { variant: 'default', label: 'Đang vận chuyển', icon: Truck },
      'DELIVERED': { variant: 'default', label: 'Đã giao', icon: CheckCircle },
      'FAILED': { variant: 'destructive', label: 'Thất bại', icon: AlertCircle },
      'CANCELLED': { variant: 'secondary', label: 'Đã hủy', icon: AlertCircle },
    };

    const config = statusConfig[status] || statusConfig['PENDING'];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getProgressPercentage = () => {
    if (deliveries.length === 0) return 0;
    
    const deliveredCount = deliveries.filter(d => d.status === 'DELIVERED').length;
    return Math.round((deliveredCount / deliveries.length) * 100);
  };

  const getConfirmationProgress = () => {
    if (deliveries.length === 0) return 0;
    
    const confirmedCount = deliveries.filter(d => d.receipt_confirmed_at).length;
    return Math.round((confirmedCount / deliveries.length) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quản lý giao hàng theo lô</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ⚠️ DON'T SHOW if no deliveries - parent will handle display based on order status
  if (deliveries.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Quản lý giao hàng theo lô ({deliveries.length} lô)
        </CardTitle>
        <CardDescription>
          {isSeller && 'Xác nhận giao từng lô container'}
          {isBuyer && 'Xác nhận nhận từng lô container'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Tiến độ giao hàng</div>
            <div className="text-2xl font-bold">{getProgressPercentage()}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {deliveries.filter(d => d.status === 'DELIVERED').length}/{deliveries.length} lô đã giao
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Tiến độ xác nhận</div>
            <div className="text-2xl font-bold">{getConfirmationProgress()}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {deliveries.filter(d => d.receipt_confirmed_at).length}/{deliveries.length} lô đã xác nhận
            </div>
          </div>
        </div>

        <Separator />

        {/* Delivery Batches List */}
        <div className="space-y-4">
          {deliveries.map((delivery) => {
            // Calculate pending actions
            const pendingDelivery = isSeller && delivery.delivery_containers?.filter(c => c.transportation_booked_at && !c.delivered_at).length || 0;
            const pendingConfirmation = isBuyer && delivery.delivery_containers?.filter(c => c.delivered_at && !c.received_by).length || 0;
            const hasAction = pendingDelivery > 0 || pendingConfirmation > 0;
            const isExpanded = expandedBatch === delivery.id;
            
            return (
            <div 
              key={delivery.id} 
              className={`
                border-2 rounded-xl overflow-hidden transition-all duration-200
                ${hasAction 
                  ? 'border-orange-400 bg-orange-50/30' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              {/* Batch Header - Simplified & Clean */}
              <button
                onClick={() => setExpandedBatch(isExpanded ? null : delivery.id)}
                className="w-full text-left p-4 hover:bg-gray-50/50 transition-colors"
              >
                {/* Top Row: Title + Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          Lô {delivery.batch_number}/{delivery.total_batches}
                        </div>
                        <div className="text-sm text-gray-500">
                          {delivery.containers_count} container
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(delivery.status)}
                      
                      {/* Compact Action Indicator */}
                      {isSeller && pendingDelivery > 0 && (
                        <Badge variant="outline" className="border-orange-400 text-orange-700 bg-white">
                          {pendingDelivery} cần giao
                        </Badge>
                      )}
                      {isBuyer && pendingConfirmation > 0 && (
                        <Badge variant="outline" className="border-blue-400 text-blue-700 bg-white">
                          {pendingConfirmation} cần nhận
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasAction && (
                      <div className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                    )}
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Bottom Row: Info Grid - Only if NOT expanded */}
                {!isExpanded && (
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    {delivery.scheduled_date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(delivery.scheduled_date)}</span>
                      </div>
                    )}
                    {delivery.delivered_at && (
                      <div className="flex items-center gap-1.5 text-green-600">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Đã giao</span>
                      </div>
                    )}
                    {delivery.receipt_confirmed_at && (
                      <div className="flex items-center gap-1.5 text-green-600 font-medium">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Đã xác nhận</span>
                      </div>
                    )}
                  </div>
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t bg-white">
                  {/* Action Bar - Only ONE button at top */}
                  {hasAction && (
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b">
                      {isSeller && pendingDelivery > 0 && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmAllDelivered(delivery);
                          }}
                          disabled={actionLoading === delivery.id}
                          className="w-full bg-orange-600 hover:bg-orange-700 shadow-sm"
                          size="default"
                        >
                          {actionLoading === delivery.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Xác nhận đã giao tất cả ({pendingDelivery} container)
                            </>
                          )}
                        </Button>
                      )}
                      {isBuyer && pendingConfirmation > 0 && (
                        <div className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4" />
                            <span className="font-medium">Cần xác nhận nhận {pendingConfirmation} container</span>
                          </div>
                          <p className="text-xs text-blue-600">Vui lòng kiểm tra từng container bên dưới và xác nhận</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Container Table */}
                  {delivery.delivery_containers && delivery.delivery_containers.length > 0 && (
                    <div className="p-4">
                      <div className="text-sm font-medium text-gray-700 mb-3 flex items-center justify-between">
                        <span>Danh sách container ({delivery.delivery_containers.length})</span>
                        {delivery.delivery_method && (
                          <Badge variant="outline" className="text-xs font-normal">
                            {delivery.delivery_method === 'logistics' && '🚚 Logistics'}
                            {delivery.delivery_method === 'self_pickup' && '🏪 Tự đến lấy'}
                            {delivery.delivery_method === 'seller_delivery' && '🚛 Seller giao'}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Container List - Compact Cards */}
                      <div className="space-y-2">
                        {delivery.delivery_containers.map((container, idx) => {
                          const isDelivered = !!container.delivered_at;
                          const isConfirmed = !!container.received_by;
                          const transportBooked = !!container.transportation_booked_at;
                          const needsAction = (isSeller && transportBooked && !isDelivered) || (isBuyer && isDelivered && !isConfirmed);
                          
                          // ✅ Check if already confirmed - if container has received_by, it's confirmed
                          const isAlreadyConfirmed = !!container.received_by;
                          
                          return (
                            <div 
                              key={container.id}
                              className={`
                                border rounded-lg p-3 flex items-center justify-between gap-3
                                ${needsAction ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200 bg-white'}
                                hover:shadow-sm transition-all
                              `}
                            >
                              {/* Left: Icon + Container Code + Status */}
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`
                                  p-2 rounded-lg flex-shrink-0
                                  ${isConfirmed ? 'bg-green-100' : isDelivered ? 'bg-orange-100' : transportBooked ? 'bg-blue-100' : 'bg-gray-100'}
                                `}>
                                  <Package className={`
                                    h-4 w-4
                                    ${isConfirmed ? 'text-green-600' : isDelivered ? 'text-orange-600' : transportBooked ? 'text-blue-600' : 'text-gray-400'}
                                  `} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="font-mono text-sm font-semibold text-gray-900 mb-1">
                                    {container.container_iso_code}
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {!transportBooked && (
                                      <Badge variant="secondary" className="text-xs font-normal">
                                        Chưa đặt VT
                                      </Badge>
                                    )}
                                    {transportBooked && !isDelivered && (
                                      <>
                                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs font-normal">
                                          Đã lên lịch
                                        </Badge>
                                        {container.transportation_booked_at && (
                                          <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(container.transportation_booked_at).toLocaleString('vi-VN', {
                                              day: '2-digit',
                                              month: '2-digit',
                                              year: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                        )}
                                      </>
                                    )}
                                    {isDelivered && !isAlreadyConfirmed && (
                                      <>
                                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-xs font-normal">
                                          Đã giao hàng
                                        </Badge>
                                        {container.delivered_at && (
                                          <span className="text-xs text-orange-600 flex items-center gap-1 font-medium">
                                            <Truck className="h-3 w-3" />
                                            {new Date(container.delivered_at).toLocaleString('vi-VN', {
                                              day: '2-digit',
                                              month: '2-digit',
                                              year: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                        )}
                                      </>
                                    )}
                                    {isAlreadyConfirmed && (
                                      <>
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs font-normal">
                                          ✓ Hoàn tất
                                        </Badge>
                                        {container.delivered_at && (
                                          <span className="text-xs text-green-600 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            {new Date(container.delivered_at).toLocaleString('vi-VN', {
                                              day: '2-digit',
                                              month: '2-digit',
                                              year: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Right: Action Button */}
                              <div className="flex-shrink-0">
                                {/* Seller: Confirm delivery */}
                                {isSeller && transportBooked && !isDelivered && (
                                  <Button
                                    size="sm"
                                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleConfirmContainerDelivery(delivery.id, container.id, container.container_iso_code);
                                    }}
                                    disabled={actionLoading === `${delivery.id}-${container.id}`}
                                  >
                                    {actionLoading === `${delivery.id}-${container.id}` ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-1.5" />
                                        Đang xử lý
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-1.5" />
                                        Đã giao hàng
                                      </>
                                    )}
                                  </Button>
                                )}
                                
                                {/* Buyer: Confirm receipt - ONLY show if container is delivered AND not yet confirmed */}
                                {isBuyer && isDelivered && !isAlreadyConfirmed && !container.received_by && (
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Extra validation before opening dialog
                                      if (container.received_by) {
                                        console.warn('⚠️ Container already confirmed, button should not be visible!');
                                        return;
                                      }
                                      setSelectedContainer({
                                        deliveryId: delivery.id,
                                        containerId: container.id,
                                        containerCode: container.container_iso_code
                                      });
                                      setShowContainerReceiptDialog(true);
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1.5" />
                                    Đã nhận hàng
                                  </Button>
                                )}
                                
                                {/* Completed */}
                                {isAlreadyConfirmed && (
                                  <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Hoàn tất</span>
                                  </div>
                                )}
                                
                                {/* Already delivered (seller view) */}
                                {isSeller && isDelivered && !isConfirmed && (
                                  <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Đã giao</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Summary Info Below Table */}
                      {delivery.logistics_company && (
                        <div className="mt-4 text-sm text-gray-600 bg-blue-50/50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Công ty vận chuyển:</span>
                            <span>{delivery.logistics_company}</span>
                          </div>
                        </div>
                      )}

                      {/* Review Section - Show for buyer (can create) and seller (can view) */}
                      {delivery.receipt_confirmed_at && (
                        <div className="mt-4">
                          {isBuyer && (
                            <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                              {deliveryReviews[delivery.id] ? (
                                // Show existing review
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                      <span className="font-semibold text-gray-900">Đánh giá của bạn</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          className={`h-4 w-4 ${
                                            star <= deliveryReviews[delivery.id].rating
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                      <span className="ml-1 text-sm font-medium text-gray-700">
                                        {deliveryReviews[delivery.id].rating}/5
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {deliveryReviews[delivery.id].comment && (
                                    <p className="text-sm text-gray-700 italic">
                                      "{deliveryReviews[delivery.id].comment}"
                                    </p>
                                  )}
                                  
                                  {(deliveryReviews[delivery.id].deliveryQualityRating || 
                                    deliveryReviews[delivery.id].packagingRating || 
                                    deliveryReviews[delivery.id].timelinessRating) && (
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                      {deliveryReviews[delivery.id].deliveryQualityRating && (
                                        <div className="flex items-center gap-1">
                                          <Truck className="h-3 w-3 text-blue-500" />
                                          <span>{deliveryReviews[delivery.id].deliveryQualityRating}/5</span>
                                        </div>
                                      )}
                                      {deliveryReviews[delivery.id].packagingRating && (
                                        <div className="flex items-center gap-1">
                                          <Package className="h-3 w-3 text-green-500" />
                                          <span>{deliveryReviews[delivery.id].packagingRating}/5</span>
                                        </div>
                                      )}
                                      {deliveryReviews[delivery.id].timelinessRating && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3 text-orange-500" />
                                          <span>{deliveryReviews[delivery.id].timelinessRating}/5</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  <p className="text-xs text-gray-500">
                                    Đánh giá ngày {formatDate(deliveryReviews[delivery.id].createdAt)}
                                  </p>

                                  {/* Seller's Response - Visible to Buyer */}
                                  {deliveryReviews[delivery.id].response && (
                                    <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg">
                                      <div className="flex items-start gap-2 mb-2">
                                        <div className="p-1 bg-green-100 rounded-full">
                                          <MessageSquare className="h-3 w-3 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-green-800">Phản hồi từ người bán</span>
                                            {deliveryReviews[delivery.id].responseAt && (
                                              <span className="text-xs text-green-600">
                                                {formatDate(deliveryReviews[delivery.id].responseAt!)}
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-sm text-gray-700 mt-1">{deliveryReviews[delivery.id].response}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                // Show review button
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-500" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        Đánh giá lô giao hàng này
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        Chia sẻ trải nghiệm của bạn về lô {delivery.batch_number}/{delivery.total_batches}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                    onClick={() => {
                                      setSelectedDeliveryForReview(delivery);
                                      setShowReviewModal(true);
                                    }}
                                  >
                                    <Star className="h-4 w-4 mr-1.5" />
                                    Đánh giá ngay
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Seller view - Show buyer's review if exists */}
                          {isSeller && deliveryReviews[delivery.id] && (
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold text-gray-900">Đánh giá từ khách hàng</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${
                                          star <= deliveryReviews[delivery.id].rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                    <span className="ml-1 text-sm font-medium text-gray-700">
                                      {deliveryReviews[delivery.id].rating}/5
                                    </span>
                                  </div>
                                </div>
                                
                                {deliveryReviews[delivery.id].comment && (
                                  <p className="text-sm text-gray-700 italic">
                                    "{deliveryReviews[delivery.id].comment}"
                                  </p>
                                )}
                                
                                {(deliveryReviews[delivery.id].deliveryQualityRating || 
                                  deliveryReviews[delivery.id].packagingRating || 
                                  deliveryReviews[delivery.id].timelinessRating) && (
                                  <div className="grid grid-cols-3 gap-4 p-3 bg-white/50 rounded-lg">
                                    {deliveryReviews[delivery.id].deliveryQualityRating && (
                                      <div className="flex items-center gap-2">
                                        <Truck className="h-4 w-4 text-blue-500" />
                                        <div>
                                          <p className="text-xs text-gray-600">Chất lượng</p>
                                          <p className="text-sm font-medium">{deliveryReviews[delivery.id].deliveryQualityRating}/5</p>
                                        </div>
                                      </div>
                                    )}
                                    {deliveryReviews[delivery.id].packagingRating && (
                                      <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-green-500" />
                                        <div>
                                          <p className="text-xs text-gray-600">Đóng gói</p>
                                          <p className="text-sm font-medium">{deliveryReviews[delivery.id].packagingRating}/5</p>
                                        </div>
                                      </div>
                                    )}
                                    {deliveryReviews[delivery.id].timelinessRating && (
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-orange-500" />
                                        <div>
                                          <p className="text-xs text-gray-600">Đúng giờ</p>
                                          <p className="text-sm font-medium">{deliveryReviews[delivery.id].timelinessRating}/5</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                <p className="text-xs text-gray-500">
                                  Đánh giá ngày {formatDate(deliveryReviews[delivery.id].createdAt)}
                                </p>

                                {/* Response Section */}
                                {deliveryReviews[delivery.id].response ? (
                                  <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className="p-1 bg-green-100 rounded-full">
                                          <MessageSquare className="h-3 w-3 text-green-600" />
                                        </div>
                                        <div>
                                          <span className="text-xs font-semibold text-green-800">Phản hồi của bạn</span>
                                          {deliveryReviews[delivery.id].responseAt && (
                                            <p className="text-xs text-green-600">
                                              {formatDate(deliveryReviews[delivery.id].responseAt!)}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 text-xs text-green-700 hover:text-green-800 hover:bg-green-100"
                                        onClick={() => handleResponseClick(deliveryReviews[delivery.id])}
                                      >
                                        <MessageSquare className="h-3 w-3 mr-1" />
                                        Chỉnh sửa
                                      </Button>
                                    </div>
                                    <p className="text-sm text-gray-700 pl-6">{deliveryReviews[delivery.id].response}</p>
                                  </div>
                                ) : (
                                  <div className="mt-3">
                                    <Button
                                      onClick={() => handleResponseClick(deliveryReviews[delivery.id])}
                                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                      size="sm"
                                    >
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Phản hồi đánh giá này
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground mt-2">
                                      Phản hồi giúp khách hàng biết bạn quan tâm đến ý kiến của họ
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            );
          })}
        </div>

        {/* Receipt Confirmation Dialog - For single container */}
        {selectedContainer && (
          <ConfirmReceiptForm
            isOpen={showContainerReceiptDialog}
            orderId={orderId}
            deliveryId={selectedContainer.deliveryId}
            containerId={selectedContainer.containerId}
            containerCode={selectedContainer.containerCode}
            onClose={() => {
              setShowContainerReceiptDialog(false);
              setSelectedContainer(null);
            }}
            onSuccess={() => {
              showSuccess('Đã xác nhận nhận container thành công!');
              setShowContainerReceiptDialog(false);
              setSelectedContainer(null);
              fetchDeliveries();
              if (onRefresh) onRefresh();
            }}
          />
        )}

        {/* Mark Delivered Form */}
        {selectedDeliveryForMark && (
          <MarkDeliveredForm
            isOpen={showMarkDeliveredForm}
            orderId={orderId}
            deliveryId={selectedDeliveryForMark.deliveryId}
            containers={selectedDeliveryForMark.containers}
            singleContainerId={selectedDeliveryForMark.singleContainerId}
            markAllMode={selectedDeliveryForMark.markAllMode}
            onSuccess={() => {
              showSuccess('Đã xác nhận giao hàng thành công!');
              setShowMarkDeliveredForm(false);
              setSelectedDeliveryForMark(null);
              fetchDeliveries();
              if (onRefresh) onRefresh();
            }}
            onClose={() => {
              setShowMarkDeliveredForm(false);
              setSelectedDeliveryForMark(null);
            }}
          />
        )}

        {/* Delivery Review Modal */}
        {selectedDeliveryForReview && (
          <DeliveryReviewModal
            isOpen={showReviewModal}
            onClose={() => {
              setShowReviewModal(false);
              setSelectedDeliveryForReview(null);
            }}
            deliveryId={selectedDeliveryForReview.id}
            batchNumber={selectedDeliveryForReview.batch_number}
            totalBatches={selectedDeliveryForReview.total_batches}
            orderId={orderId}
            onSuccess={() => {
              fetchDeliveries(); // Refresh to show the new review
              if (onRefresh) onRefresh();
            }}
          />
        )}

        {/* Response Dialog */}
        <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Phản hồi đánh giá</DialogTitle>
              <DialogDescription>
                Gửi phản hồi chân thành và chuyên nghiệp đến khách hàng
              </DialogDescription>
            </DialogHeader>

            {selectedReviewForResponse && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= selectedReviewForResponse.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="font-semibold">{selectedReviewForResponse.rating}/5</span>
                  </div>
                  {selectedReviewForResponse.comment && (
                    <p className="text-sm text-gray-700 italic">"{selectedReviewForResponse.comment}"</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nội dung phản hồi</label>
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Cảm ơn bạn đã đánh giá. Chúng tôi rất vui vì..."
                    rows={6}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {responseText.length}/500 ký tự
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowResponseDialog(false)}
                disabled={submittingResponse}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmitResponse}
                disabled={submittingResponse || !responseText.trim()}
              >
                {submittingResponse ? 'Đang gửi...' : 'Gửi phản hồi'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
