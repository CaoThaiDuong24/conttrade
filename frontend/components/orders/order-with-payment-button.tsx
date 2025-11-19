import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Package, 
  Shield, 
  Truck, 
  XCircle, 
  AlertCircle,
  AlertTriangle,
  Eye,
  Calendar,
  FileText,
  User
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-context';
import ShipOrderModal from './ship-order-modal';

interface OrderWithPaymentButtonProps {
  order: any;
  onPayNow?: (orderId: string) => void;
  onViewDetails?: (orderId: string) => void;
  onConfirmReceipt?: (orderId: string) => void;
  onRefresh?: () => void;
}

export function OrderWithPaymentButton({ 
  order, 
  onPayNow = () => {}, 
  onViewDetails = () => {},
  onConfirmReceipt = () => {},
  onRefresh = () => {}
}: OrderWithPaymentButtonProps) {
  const { user } = useAuth();
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  
  // Determine if current user is buyer or seller for this order
  const orderBuyerId = order.buyer_id;
  const orderSellerId = order.seller_id;
  
  const isBuyer = user?.id && orderBuyerId && (user.id === orderBuyerId || user.id.toString() === orderBuyerId.toString());
  const isSeller = user?.id && orderSellerId && (user.id === orderSellerId || user.id.toString() === orderSellerId.toString());
  
  // Fallback: If we can't determine from order data, use user roles
  const isBuyerByRole = user?.roles?.includes('buyer') || user?.roles?.includes('Buyer');
  const isSellerByRole = user?.roles?.includes('seller') || user?.roles?.includes('Seller');
  
  // Final determination: prefer order data, fallback to roles
  const finalIsBuyer = isBuyer || (isBuyerByRole && !isSeller);
  const finalIsSeller = isSeller || isSellerByRole;
  
  const getDealTypeBadge = (dealType?: string) => {
    if (!dealType) return null;
    
    switch (dealType.toUpperCase()) {
      case 'SALE':
        return (
          <Badge variant="default" className="bg-blue-600">
            Mua bán
          </Badge>
        );
      case 'RENTAL':
        return (
          <Badge variant="default" className="bg-purple-600">
            Cho thuê
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'created':
      case 'CREATED':
        return (
          <Badge variant="secondary">
            <Package className="mr-1 h-3 w-3" />
            Đã tạo
          </Badge>
        );
      case 'pending_payment':
      case 'PENDING_PAYMENT':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <DollarSign className="mr-1 h-3 w-3" />
            Chờ thanh toán
          </Badge>
        );
      case 'payment_pending_verification':
      case 'PAYMENT_PENDING_VERIFICATION':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            <AlertCircle className="mr-1 h-3 w-3" />
            Chờ xác nhận thanh toán
          </Badge>
        );
      case 'awaiting_funds':
      case 'AWAITING_FUNDS':
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
            <Clock className="mr-1 h-3 w-3" />
            Chờ thanh toán
          </Badge>
        );
      case 'escrow_funded':
      case 'ESCROW_FUNDED':
        return (
          <Badge variant="default" className="bg-green-600">
            <Shield className="mr-1 h-3 w-3" />
            Đã ký quỹ
          </Badge>
        );
      case 'preparing_delivery':
      case 'PREPARING_DELIVERY':
        return (
          <Badge variant="default" className="bg-blue-600">
            <Package className="mr-1 h-3 w-3" />
            Chuẩn bị giao hàng
          </Badge>
        );
      case 'ready_for_pickup':
      case 'READY_FOR_PICKUP':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Sẵn sàng lấy hàng
          </Badge>
        );
      case 'documents_ready':
      case 'DOCUMENTS_READY':
        return (
          <Badge variant="default" className="bg-purple-600">
            <FileText className="mr-1 h-3 w-3" />
            Chứng từ sẵn sàng
          </Badge>
        );
      case 'transportation_booked':
      case 'TRANSPORTATION_BOOKED':
        return (
          <Badge variant="default" className="bg-indigo-600">
            <Truck className="mr-1 h-3 w-3" />
            Đã đặt vận chuyển
          </Badge>
        );
      case 'delivering':
      case 'DELIVERING':
        return (
          <Badge variant="default" className="bg-orange-600">
            <Truck className="mr-1 h-3 w-3" />
            Đang giao hàng
          </Badge>
        );
      case 'in_transit':
      case 'IN_TRANSIT':
        return (
          <Badge variant="default" className="bg-orange-600">
            <Truck className="mr-1 h-3 w-3" />
            Đang vận chuyển
          </Badge>
        );
      case 'paid':
      case 'PAID':
        return (
          <Badge variant="default" className="bg-blue-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Đã thanh toán
          </Badge>
        );
      case 'delivered':
      case 'DELIVERED':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Đã giao
          </Badge>
        );
      case 'completed':
      case 'COMPLETED':
        return (
          <Badge variant="default" className="bg-green-700">
            <CheckCircle className="mr-1 h-3 w-3" />
            Hoàn thành
          </Badge>
        );
      case 'payment_released':
      case 'PAYMENT_RELEASED':
        return (
          <Badge variant="default" className="bg-green-800">
            <DollarSign className="mr-1 h-3 w-3" />
            Đã giải ngân
          </Badge>
        );
      case 'cancelled':
      case 'CANCELLED':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Đã hủy
          </Badge>
        );
      case 'disputed':
      case 'DISPUTED':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Tranh chấp
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'VND') {
      return `${amount.toLocaleString('vi-VN')}₫`;
    }
    if (currency === 'USD') {
      return `$${amount.toLocaleString('en-US')}`;
    }
    return `${amount.toLocaleString()} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition-all duration-200 bg-white hover:border-primary/20">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold text-lg text-gray-900">Đơn hàng #{order.id.slice(-8)}</h3>
            {getStatusBadge(order.status)}
            {/* Ưu tiên deal_type từ orders, nếu không có thì lấy từ listings */}
            {getDealTypeBadge(order.deal_type || order?.listings?.deal_type)}
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(order.created_at)}</span>
            </div>
            {order.quote_id && (
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>Từ báo giá: #{order.quote_id.slice(-8)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(parseInt(order.total), order.currency)}
          </div>
          {(order.status === 'pending_payment' || order.status === 'PENDING_PAYMENT') && (
            <div className="text-sm text-red-600 font-medium flex items-center space-x-1">
              <AlertCircle className="h-4 w-4" />
              <span>Cần thanh toán</span>
            </div>
          )}
        </div>
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Đối tác:</span>
          <span className="font-medium text-gray-900">
            {finalIsBuyer 
              ? order?.users_orders_seller_idTousers?.display_name || 'N/A'
              : order?.users_orders_buyer_idTousers?.display_name || 'N/A'
            }
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Sản phẩm:</span>
          <span className="font-medium text-gray-900">
            {order?.listings?.title || 'Không có tiêu đề'}
          </span>
        </div>
      </div>

      {/* Payment Status Message */}
      {(order.status === 'pending_payment' || order.status === 'PENDING_PAYMENT') && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <DollarSign className="h-6 w-6 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800 mb-1">💳 Thanh toán cần thiết</h4>
              <p className="text-sm text-yellow-700 leading-relaxed">
                Đơn hàng này cần được thanh toán để tiếp tục quy trình. 
                Tiền sẽ được giữ trong ký quỹ an toàn cho đến khi hoàn thành giao dịch.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDetails(order.id)}
            className="hover:bg-gray-50"
          >
            <Eye className="mr-2 h-4 w-4" />
            Xem chi tiết
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Payment button for pending payment orders */}
          {(order.status === 'pending_payment' || order.status === 'PENDING_PAYMENT') && (
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
              onClick={() => onPayNow(order.id)}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Thanh toán ngay
            </Button>
          )}
          
          {/* Confirm receipt button for buyers */}
          {finalIsBuyer && (order.status === 'paid' || order.status === 'PAID' || order.status === 'escrow_funded' || order.status === 'ESCROW_FUNDED' || order.status === 'delivering' || order.status === 'DELIVERING' || order.status === 'delivered' || order.status === 'DELIVERED') && (
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
              onClick={() => onConfirmReceipt(order.id)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Xác nhận nhận hàng
            </Button>
          )}
          
          {/* Seller actions */}
          {finalIsSeller && (order.status === 'paid' || order.status === 'PAID' || order.status === 'escrow_funded' || order.status === 'ESCROW_FUNDED') && (
            <Button 
              size="sm" 
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all"
              onClick={() => setIsShipModalOpen(true)}
            >
              <Truck className="mr-2 h-4 w-4" />
              Chuẩn bị giao hàng
            </Button>
          )}
          
        </div>
      </div>
      
      {/* Ship Order Modal */}
      <ShipOrderModal
        isOpen={isShipModalOpen}
        onClose={() => setIsShipModalOpen(false)}
        orderId={order.id}
        onSuccess={() => {
          onRefresh?.();
          setIsShipModalOpen(false);
        }}
      />
    </div>
  );
}