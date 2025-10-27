/**
 * Order Status Constants - Vietnamese Labels
 * Quản lý tập trung tất cả trạng thái đơn hàng
 */

export type OrderStatus = 
  | 'CREATED'
  | 'PENDING_PAYMENT'
  | 'PAYMENT_PENDING_VERIFICATION'
  | 'PAID'
  | 'AWAITING_FUNDS'
  | 'ESCROW_FUNDED'
  | 'PREPARING_DELIVERY'
  | 'DOCUMENTS_READY'
  | 'TRANSPORTATION_BOOKED'
  | 'READY_FOR_PICKUP'
  | 'IN_TRANSIT'
  | 'DELIVERING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'PAYMENT_RELEASED'
  | 'CANCELLED'
  | 'DISPUTED';

export type DeliveryStatus =
  | 'PENDING'
  | 'REQUESTED'
  | 'SCHEDULED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED';

/**
 * Mapping từ status code sang tiếng Việt
 */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  // Order statuses - lowercase
  'created': 'Đã tạo',
  'pending_payment': 'Chờ thanh toán',
  'payment_pending_verification': 'Chờ xác nhận thanh toán',
  'paid': 'Đã thanh toán',
  'awaiting_funds': 'Chờ thanh toán',
  'escrow_funded': 'Đã ký quỹ',
  'preparing_delivery': 'Đang chuẩn bị giao hàng',
  'documents_ready': 'Chứng từ sẵn sàng',
  'transportation_booked': 'Đã đặt vận chuyển',
  'ready_for_pickup': 'Sẵn sàng lấy hàng',
  'in_transit': 'Đang vận chuyển',
  'delivering': 'Đang vận chuyển',
  'processing': 'Đang xử lý',
  'shipped': 'Đang giao hàng',
  'delivered': 'Đã giao hàng',
  'completed': 'Hoàn thành',
  'payment_released': 'Đã giải ngân',
  'cancelled': 'Đã hủy',
  'disputed': 'Tranh chấp',
  
  // Order statuses - UPPERCASE
  'CREATED': 'Đã tạo',
  'PENDING_PAYMENT': 'Chờ thanh toán',
  'PAYMENT_PENDING_VERIFICATION': 'Chờ xác nhận thanh toán',
  'PAID': 'Đã thanh toán',
  'AWAITING_FUNDS': 'Chờ thanh toán',
  'ESCROW_FUNDED': 'Đã ký quỹ',
  'PREPARING_DELIVERY': 'Đang chuẩn bị giao hàng',
  'DOCUMENTS_READY': 'Chứng từ sẵn sàng',
  'TRANSPORTATION_BOOKED': 'Đã đặt vận chuyển',
  'READY_FOR_PICKUP': 'Sẵn sàng lấy hàng',
  'IN_TRANSIT': 'Đang vận chuyển',
  'DELIVERING': 'Đang vận chuyển',
  'PROCESSING': 'Đang xử lý',
  'SHIPPED': 'Đang giao hàng',
  'DELIVERED': 'Đã giao hàng',
  'COMPLETED': 'Hoàn thành',
  'PAYMENT_RELEASED': 'Đã giải ngân',
  'CANCELLED': 'Đã hủy',
  'DISPUTED': 'Tranh chấp',
};

/**
 * Mapping trạng thái giao hàng sang tiếng Việt
 */
export const DELIVERY_STATUS_LABELS: Record<string, string> = {
  // lowercase
  'pending': 'Đang chờ',
  'requested': 'Đã yêu cầu',
  'scheduled': 'Đã lên lịch',
  'picked_up': 'Đã lấy hàng',
  'in_transit': 'Đang vận chuyển',
  'delivered': 'Đã giao hàng',
  'failed': 'Thất bại',
  'cancelled': 'Đã hủy',
  
  // UPPERCASE
  'PENDING': 'Đang chờ',
  'REQUESTED': 'Đã yêu cầu',
  'SCHEDULED': 'Đã lên lịch',
  'PICKED_UP': 'Đã lấy hàng',
  'IN_TRANSIT': 'Đang vận chuyển',
  'DELIVERED': 'Đã giao hàng',
  'FAILED': 'Thất bại',
  'CANCELLED': 'Đã hủy',
};

/**
 * Helper function để lấy label tiếng Việt từ status
 */
export function getOrderStatusLabel(status: string | undefined | null): string {
  if (!status) return 'Không xác định';
  
  // Thử lowercase trước
  const label = ORDER_STATUS_LABELS[status.toLowerCase()];
  if (label) return label;
  
  // Thử uppercase
  const upperLabel = ORDER_STATUS_LABELS[status.toUpperCase()];
  if (upperLabel) return upperLabel;
  
  // Thử chính xác status string
  const exactLabel = ORDER_STATUS_LABELS[status];
  if (exactLabel) return exactLabel;
  
  // Fallback: format status thành readable
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Helper function để lấy label delivery status tiếng Việt
 */
export function getDeliveryStatusLabel(status: string | undefined | null): string {
  if (!status) return 'Không xác định';
  
  const label = DELIVERY_STATUS_LABELS[status.toLowerCase()] || 
                DELIVERY_STATUS_LABELS[status.toUpperCase()] ||
                DELIVERY_STATUS_LABELS[status];
  
  if (label) return label;
  
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Badge variant cho từng status
 */
export const ORDER_STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'created': 'secondary',
  'CREATED': 'secondary',
  'pending_payment': 'destructive',
  'PENDING_PAYMENT': 'destructive',
  'payment_pending_verification': 'default',
  'PAYMENT_PENDING_VERIFICATION': 'default',
  'paid': 'default',
  'PAID': 'default',
  'awaiting_funds': 'destructive',
  'AWAITING_FUNDS': 'destructive',
  'escrow_funded': 'default',
  'ESCROW_FUNDED': 'default',
  'preparing_delivery': 'default',
  'PREPARING_DELIVERY': 'default',
  'documents_ready': 'default',
  'DOCUMENTS_READY': 'default',
  'transportation_booked': 'default',
  'TRANSPORTATION_BOOKED': 'default',
  'ready_for_pickup': 'default',
  'READY_FOR_PICKUP': 'default',
  'in_transit': 'secondary',
  'IN_TRANSIT': 'secondary',
  'delivering': 'secondary',
  'DELIVERING': 'secondary',
  'processing': 'default',
  'PROCESSING': 'default',
  'shipped': 'default',
  'SHIPPED': 'default',
  'delivered': 'default',
  'DELIVERED': 'default',
  'completed': 'default',
  'COMPLETED': 'default',
  'payment_released': 'default',
  'PAYMENT_RELEASED': 'default',
  'cancelled': 'destructive',
  'CANCELLED': 'destructive',
  'disputed': 'destructive',
  'DISPUTED': 'destructive',
};
