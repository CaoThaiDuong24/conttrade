"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  Truck,
  AlertCircle,
  XCircle,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { formatDate } from '@/lib/utils';
import { ConfirmContainerReceiptDialog } from './ConfirmContainerReceiptDialog';
import BookTransportationDialog from './BookTransportationDialog';

interface ContainerDeliveryCardProps {
  container: {
    id: string;
    container_iso_code: string;
    transportation_booked_at?: string;
    transport_method?: string;
    logistics_company?: string;
    transport_notes?: string;
    delivered_at?: string;
    received_by?: string;
    condition_notes?: string;
  };
  deliveryId: string;
  batchNumber: number;
  isSeller: boolean;
  isBuyer: boolean;
  onRefresh: () => void;
}

export default function ContainerDeliveryCard({
  container,
  deliveryId,
  batchNumber,
  isSeller,
  isBuyer,
  onRefresh
}: ContainerDeliveryCardProps) {
  const [loading, setLoading] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [transportDialogOpen, setTransportDialogOpen] = useState(false);
  const { showSuccess, showError } = useNotificationContext();

  // Parse condition notes
  const conditionData = container.condition_notes 
    ? JSON.parse(container.condition_notes)
    : null;

  // Parse transport notes
  const transportData = container.transport_notes
    ? JSON.parse(container.transport_notes)
    : null;

  const isTransportBooked = !!container.transportation_booked_at;
  const isDelivered = !!container.delivered_at;
  const isConfirmed = !!container.received_by;

  const handleMarkDelivered = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `/api/v1/deliveries/${deliveryId}/containers/${container.id}/mark-delivered`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deliveredAt: new Date().toISOString(),
            deliveredBy: 'Seller',
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to mark container delivered');
      }

      const result = await response.json();
      showSuccess(result.message || 'Container marked as delivered');
      onRefresh();
    } catch (error: any) {
      console.error('Error marking container delivered:', error);
      showError(error.message || 'Failed to mark container delivered');
    } finally {
      setLoading(false);
    }
  };

  const getConditionBadge = () => {
    if (!conditionData) return null;

    const { condition } = conditionData;
    
    if (condition === 'GOOD') {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Tốt
        </Badge>
      );
    } else if (condition === 'MINOR_DAMAGE') {
      return (
        <Badge variant="secondary" className="bg-yellow-500 text-white">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Hư nhẹ
        </Badge>
      );
    } else if (condition === 'MAJOR_DAMAGE') {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Hư nặng
        </Badge>
      );
    }
    return null;
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Container Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="font-mono font-semibold text-sm">
                  {container.container_iso_code}
                </span>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mb-2">
                {!isTransportBooked && !isDelivered && (
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Chưa đặt vận chuyển
                  </Badge>
                )}
                {isTransportBooked && !isDelivered && (
                  <Badge variant="default" className="bg-blue-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    Đã đặt vận chuyển
                  </Badge>
                )}
                {isDelivered && !isConfirmed && (
                  <Badge variant="default">
                    <Truck className="h-3 w-3 mr-1" />
                    Đã giao
                  </Badge>
                )}
                {isConfirmed && (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Đã xác nhận
                  </Badge>
                )}
                {getConditionBadge()}
              </div>

              {/* Delivery Info */}
              <div className="text-xs text-gray-600 space-y-1">
                {isTransportBooked && (
                  <>
                    <div>📅 Đặt vận chuyển: {formatDate(container.transportation_booked_at!)}</div>
                    {container.transport_method && (
                      <div>
                        🚚 Phương thức: {
                          container.transport_method === 'logistics' ? 'Logistics' :
                          container.transport_method === 'self_pickup' ? 'Tự đến lấy' :
                          'Seller giao hàng'
                        }
                        {container.logistics_company && ` (${container.logistics_company})`}
                      </div>
                    )}
                    {transportData?.deliveryDate && (
                      <div>📆 Ngày giao dự kiến: {new Date(transportData.deliveryDate).toLocaleDateString('vi-VN')}</div>
                    )}
                  </>
                )}
                {isDelivered && (
                  <div>✅ Giao: {formatDate(container.delivered_at!)}</div>
                )}
                {isConfirmed && (
                  <div>👤 Nhận bởi: {container.received_by}</div>
                )}
                {conditionData?.notes && (
                  <div className="text-yellow-600">
                    📝 {conditionData.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="ml-4">
              {/* Buyer: Book transportation */}
              {isBuyer && !isTransportBooked && !isDelivered && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTransportDialogOpen(true)}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Đặt vận chuyển
                </Button>
              )}

              {/* Seller: Mark as delivered */}
              {isSeller && isTransportBooked && !isDelivered && (
                <Button
                  size="sm"
                  onClick={handleMarkDelivered}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <>
                      <Truck className="h-4 w-4 mr-1" />
                      Đã giao
                    </>
                  )}
                </Button>
              )}

              {/* Buyer: Confirm receipt */}
              {isBuyer && isDelivered && !isConfirmed && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => setReceiptDialogOpen(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Xác nhận
                </Button>
              )}

              {/* Already confirmed */}
              {isConfirmed && (
                <div className="text-xs text-green-600 font-medium">
                  ✓ Hoàn tất
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transportation Dialog */}
      {transportDialogOpen && (
        <BookTransportationDialog
          deliveryId={deliveryId}
          container={container}
          batchNumber={batchNumber}
          isOpen={transportDialogOpen}
          onClose={() => setTransportDialogOpen(false)}
          onSuccess={() => {
            setTransportDialogOpen(false);
            onRefresh();
          }}
        />
      )}

      {/* Receipt Dialog */}
      {receiptDialogOpen && (
        <ConfirmContainerReceiptDialog
          isOpen={receiptDialogOpen}
          deliveryId={deliveryId}
          containerId={container.id}
          containerCode={container.container_iso_code}
          onClose={() => setReceiptDialogOpen(false)}
          onSuccess={() => {
            setReceiptDialogOpen(false);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
