'use client'

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: any;
}

export function SimpleNotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('⚠️ No token found');
        return;
      }

      console.log('🔄 Fetching notifications...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Notifications received:', data);
        
        if (data.success && Array.isArray(data.data)) {
          setNotifications(data.data);
          const unread = data.data.filter((n: Notification) => !n.read).length;
          setUnreadCount(unread);
          console.log('📊 Total:', data.data.length, 'Unread:', unread);
        }
      } else {
        console.error('❌ Response not OK:', response.status);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    console.log('🔔 Bell clicked! Current isOpen:', isOpen);
    setIsOpen(!isOpen);
  };

  const handleClose = (e?: React.MouseEvent) => {
    console.log('❌ Overlay clicked - Closing dropdown');
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen(false);
  };

  const formatDate = (dateString: string) => {
    try {
      // Parse date string as UTC (database stores in UTC)
      const date = new Date(dateString);
      const now = new Date();
      
      // Calculate difference in milliseconds
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      // Return relative time
      if (diffInMinutes < 1) return 'Vừa xong';
      if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
      if (diffInHours < 24) return `${diffInHours} giờ trước`;
      if (diffInDays < 7) return `${diffInDays} ngày trước`;
      
      // For older notifications, show the actual date
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Không xác định';
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/${notificationId}/read`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        console.log('✅ Marked notification as read:', notificationId);
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('❌ Error marking as read:', error);
    }
  };

  const getNavigationPath = (notification: Notification): string | null => {
    const data = notification.data || {};
    
    switch (notification.type) {
      case 'rfq_received':
        // Seller nhận RFQ → đi tới RFQ detail page
        return data.rfqId ? `/vi/rfq/${data.rfqId}` : '/vi/rfq/received';
      
      case 'quote_received':
        // Buyer nhận Quote → đi tới RFQ detail để xem quote
        return data.rfqId ? `/vi/rfq/${data.rfqId}` : '/vi/rfq/sent';
      
      case 'quote_accepted':
        // Seller: Quote được accept → đi tới Order detail
        return data.orderId ? `/vi/orders/${data.orderId}` : '/vi/orders';
      
      case 'quote_rejected':
        // Seller: Quote bị reject → đi tới Quotes page
        return data.quoteId ? `/vi/quotes/${data.quoteId}` : '/vi/quotes';
      
      case 'order_created':
        // Order mới → đi tới Order detail
        return data.orderId ? `/vi/orders/${data.orderId}` : '/vi/orders';
      
      case 'payment_received':
        // Payment nhận được → đi tới Order detail
        return data.orderId ? `/vi/orders/${data.orderId}` : '/vi/orders';
      
      default:
        console.warn('Unknown notification type:', notification.type);
        return null;
    }
  };

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'rfq_received': return '📋';
      case 'quote_received': return '💰';
      case 'quote_accepted': return '✅';
      case 'quote_rejected': return '❌';
      case 'order_created': return '📦';
      case 'payment_received': return '💵';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type: string): string => {
    switch (type) {
      case 'rfq_received': return 'text-blue-600';
      case 'quote_received': return 'text-green-600';
      case 'quote_accepted': return 'text-emerald-600';
      case 'quote_rejected': return 'text-red-600';
      case 'order_created': return 'text-purple-600';
      case 'payment_received': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    console.log('📬 Notification clicked:', notification);
    
    // Close dropdown
    setIsOpen(false);
    
    // Mark as read if not already
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate
    const path = getNavigationPath(notification);
    if (path) {
      console.log('🔗 Navigating to:', path);
      router.push(path);
    } else {
      console.log('⚠️ No navigation path for this notification');
    }
  };

  // Overlay component using Portal
  const overlayElement = isOpen && mounted ? createPortal(
    <div
      className="fixed inset-0"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9998,
        backgroundColor: 'transparent',
        cursor: 'default'
      }}
      onClick={handleClose}
      onMouseDown={(e) => {
        console.log('🖱️ Overlay mousedown');
        e.preventDefault();
      }}
    />,
    document.body
  ) : null;

  return (
    <>
      {overlayElement}

      <div className="relative">
        {/* Bell Button */}
        <button
          onClick={handleToggle}
          className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          style={{ position: 'relative', zIndex: 9999 }}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div 
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200"
            style={{ position: 'absolute', zIndex: 9999 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Không có thông báo nào</p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        {/* Icon */}
                        <div className={`text-2xl flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium line-clamp-2 ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                        
                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="h-2 w-2 bg-blue-600 rounded-full mt-1 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-gray-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetchNotifications();
                  console.log('🔄 Refreshing notifications...');
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-2 rounded transition-colors"
              >
                Làm mới thông báo
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
