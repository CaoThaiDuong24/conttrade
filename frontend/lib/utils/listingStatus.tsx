/**
 * Utility functions for listing status display
 */

import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Pause,
  Package,
} from 'lucide-react';

// Status mapping - Vietnamese labels
export const LISTING_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Bản nháp',
  PENDING_REVIEW: 'Chờ duyệt',
  ACTIVE: 'Đang hoạt động',
  SOLD: 'Đã bán',
  REJECTED: 'Bị từ chối',
  PAUSED: 'Tạm dừng',
  EXPIRED: 'Hết hạn',
  // Lowercase versions (for compatibility)
  draft: 'Bản nháp',
  pending_review: 'Chờ duyệt',
  active: 'Đang hoạt động',
  sold: 'Đã bán',
  rejected: 'Bị từ chối',
  paused: 'Tạm dừng',
  expired: 'Hết hạn',
};

// Badge variants mapping
export const LISTING_STATUS_VARIANTS: Record<string, any> = {
  DRAFT: 'secondary',
  PENDING_REVIEW: 'outline',
  ACTIVE: 'default',
  SOLD: 'default',
  REJECTED: 'destructive',
  PAUSED: 'secondary',
  EXPIRED: 'secondary',
  // Lowercase versions
  draft: 'secondary',
  pending_review: 'outline',
  active: 'default',
  sold: 'default',
  rejected: 'destructive',
  paused: 'secondary',
  expired: 'secondary',
};

// Icons mapping
export const LISTING_STATUS_ICONS: Record<string, any> = {
  DRAFT: Package,
  PENDING_REVIEW: Clock,
  ACTIVE: CheckCircle,
  SOLD: CheckCircle,
  REJECTED: XCircle,
  PAUSED: Pause,
  EXPIRED: AlertTriangle,
  // Lowercase versions
  draft: Package,
  pending_review: Clock,
  active: CheckCircle,
  sold: CheckCircle,
  rejected: XCircle,
  paused: Pause,
  expired: AlertTriangle,
};

/**
 * Get Vietnamese label for listing status
 */
export function getListingStatusLabel(status: string): string {
  return LISTING_STATUS_LABELS[status] || status;
}

/**
 * Get badge variant for listing status
 */
export function getListingStatusVariant(status: string): any {
  return LISTING_STATUS_VARIANTS[status] || 'secondary';
}

/**
 * Get icon component for listing status
 */
export function getListingStatusIcon(status: string) {
  return LISTING_STATUS_ICONS[status] || Package;
}

/**
 * Render status badge with icon and label
 */
export function renderListingStatusBadge(status: string, showIcon = true) {
  const Icon = getListingStatusIcon(status);
  const label = getListingStatusLabel(status);
  const variant = getListingStatusVariant(status);

  return (
    <Badge variant={variant} className={showIcon ? 'flex items-center gap-1' : ''}>
      {showIcon && <Icon className="h-3 w-3" />}
      {label}
    </Badge>
  );
}

/**
 * Deal type mapping - Vietnamese labels
 */
export const DEAL_TYPE_LABELS: Record<string, string> = {
  SALE: 'Bán',
  RENTAL: 'Thuê ngắn hạn',
  LEASE: 'Thuê dài hạn',
  SWAP: 'Trao đổi',
  RENTAL_DAILY: 'Cho thuê theo ngày',
  RENTAL_MONTHLY: 'Cho thuê theo tháng',
  // Lowercase versions
  sale: 'Bán',
  rental: 'Thuê ngắn hạn',
  lease: 'Thuê dài hạn',
  swap: 'Trao đổi',
  rental_daily: 'Cho thuê theo ngày',
  rental_monthly: 'Cho thuê theo tháng',
};

/**
 * Get Vietnamese label for deal type
 */
export function getDealTypeLabel(dealType: string): string {
  return DEAL_TYPE_LABELS[dealType] || DEAL_TYPE_LABELS[dealType?.toUpperCase()] || dealType;
}
