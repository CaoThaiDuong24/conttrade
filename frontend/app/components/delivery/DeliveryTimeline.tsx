'use client';

import React from 'react';
import { CheckCircle, Circle, Clock, AlertCircle, Package, Truck, Home } from 'lucide-react';

interface TimelineEntry {
  id: string;
  status: string;
  notes?: string;
  timestamp: string;
  actor?: {
    displayName: string;
    role: string;
  };
  location?: {
    city: string;
    country: string;
  };
}

interface DeliveryTimelineProps {
  entries: TimelineEntry[];
  currentStatus: string;
  locale: string;
}

const STATUS_CONFIG = {
  PAYMENT_PENDING: {
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    label: { vi: 'Chờ thanh toán', en: 'Awaiting Payment' }
  },
  PAID: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    label: { vi: 'Đã thanh toán', en: 'Payment Confirmed' }
  },
  READY_FOR_PICKUP: {
    icon: Package,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    label: { vi: 'Sẵn sàng lấy hàng', en: 'Ready for Pickup' }
  },
  IN_TRANSIT: {
    icon: Truck,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    label: { vi: 'Đang vận chuyển', en: 'In Transit' }
  },
  DELIVERED: {
    icon: Home,
    color: 'text-teal-500',
    bgColor: 'bg-teal-100',
    label: { vi: 'Đã giao hàng', en: 'Delivered' }
  },
  COMPLETED: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-200',
    label: { vi: 'Hoàn tất', en: 'Completed' }
  },
  DISPUTED: {
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    label: { vi: 'Tranh chấp', en: 'Disputed' }
  },
  CANCELLED: {
    icon: AlertCircle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    label: { vi: 'Đã hủy', en: 'Cancelled' }
  }
};

export default function DeliveryTimeline({ entries, currentStatus, locale }: DeliveryTimelineProps) {
  const t = (vi: string, en: string) => (locale === 'vi' ? vi : en);

  // Sort entries by timestamp (newest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit'
    };

    return {
      date: date.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', dateOptions),
      time: date.toLocaleTimeString(locale === 'vi' ? 'vi-VN' : 'en-US', timeOptions)
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {t('Lịch sử vận chuyển', 'Delivery Timeline')}
      </h2>

      {sortedEntries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Circle className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p>{t('Chưa có thông tin vận chuyển', 'No delivery updates yet')}</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {sortedEntries.map((entry, index) => {
            const config = STATUS_CONFIG[entry.status as keyof typeof STATUS_CONFIG] || {
              icon: Circle,
              color: 'text-gray-500',
              bgColor: 'bg-gray-100',
              label: { vi: entry.status, en: entry.status }
            };

            const Icon = config.icon;
            const { date, time } = formatDate(entry.timestamp);
            const isLatest = index === 0;

            return (
              <div key={entry.id} className="relative mb-8 pl-14">
                {/* Icon */}
                <div
                  className={`absolute left-0 top-0 flex items-center justify-center w-12 h-12 rounded-full ${config.bgColor} ${
                    isLatest ? 'ring-4 ring-blue-100' : ''
                  }`}
                >
                  <Icon className={`h-6 w-6 ${config.color}`} />
                </div>

                {/* Content */}
                <div className={`bg-gray-50 rounded-lg p-4 ${isLatest ? 'border-2 border-blue-200' : ''}`}>
                  {/* Status & Timestamp */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-semibold text-lg ${config.color}`}>
                      {config.label[locale as 'vi' | 'en']}
                    </h3>
                    {isLatest && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                        {t('Mới nhất', 'Latest')}
                      </span>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="text-sm text-gray-600 mb-2">
                    <p className="font-medium">{date}</p>
                    <p className="text-gray-500">{time}</p>
                  </div>

                  {/* Notes */}
                  {entry.notes && (
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">{entry.notes}</p>
                  )}

                  {/* Actor */}
                  {entry.actor && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <span className="font-medium mr-2">{t('Người thực hiện:', 'Updated by:')}</span>
                      <span>{entry.actor.displayName}</span>
                      <span className="mx-2">•</span>
                      <span className="text-gray-500">
                        {entry.actor.role === 'seller'
                          ? t('Người bán', 'Seller')
                          : entry.actor.role === 'buyer'
                          ? t('Người mua', 'Buyer')
                          : t('Quản trị viên', 'Admin')}
                      </span>
                    </div>
                  )}

                  {/* Location */}
                  {entry.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">{t('Vị trí:', 'Location:')}</span>
                      <span>
                        {entry.location.city}, {entry.location.country}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {t('Tổng số cập nhật:', 'Total updates:')} <strong>{sortedEntries.length}</strong>
          </span>
          <span className="text-gray-600">
            {t('Trạng thái hiện tại:', 'Current status:')}{' '}
            <strong className={STATUS_CONFIG[currentStatus as keyof typeof STATUS_CONFIG]?.color || 'text-gray-600'}>
              {STATUS_CONFIG[currentStatus as keyof typeof STATUS_CONFIG]?.label[locale as 'vi' | 'en'] || currentStatus}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
