'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Check, 
  MoreHorizontal,
  Package,
  CreditCard,
  FileText,
  MessageSquare,
  Settings,
  CheckCheck,
  Trash2,
  Clock,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'payment_received' | 'order_completed' | 'order_created' | 'rfq_received' | 'quote_received' | 'quote_accepted' | 'quote_rejected' | 'container_ready' | 'system' | 'reminder';
  title: string;
  message: string;
  data: any;
  read: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  action_url?: string;
}

type FilterType = 'all' | 'unread' | 'important';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  // Fetch notifications with error handling
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          const sortedNotifications = data.data.sort((a: Notification, b: Notification) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          setNotifications(sortedNotifications);
          const unread = sortedNotifications.filter((n: Notification) => !n.read).length;
          setUnreadCount(unread);
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      } else if (response.status === 401) {
        localStorage.removeItem('accessToken');
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter notifications based on selected filter
  useEffect(() => {
    let filtered = notifications;
    
    switch (filter) {
      case 'unread':
        filtered = notifications.filter(n => !n.read);
        break;
      case 'important':
        filtered = notifications.filter(n => n.priority === 'high' || n.priority === 'urgent');
        break;
      default:
        filtered = notifications;
    }
    
    setFilteredNotifications(filtered);
  }, [notifications, filter]);

  // Mark single notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      setIsMarkingAllRead(true);
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadCount(prev => {
          const notification = notifications.find(n => n.id === notificationId);
          return notification && !notification.read ? Math.max(0, prev - 1) : prev;
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
    } else if (notification.data?.orderId) {
      window.location.href = `/orders/${notification.data.orderId}`;
    } else if (notification.data?.rfqId) {
      window.location.href = `/rfq/${notification.data.rfqId}`;
    }
  };

  // Get icon and colors based on notification type
  const getNotificationIcon = (notification: Notification) => {
    const baseClasses = "h-5 w-5";
    
    switch (notification.type) {
      case 'payment_received':
        return <CreditCard className={cn(baseClasses, "text-green-600")} />;
      case 'order_completed':
        return <CheckCircle className={cn(baseClasses, "text-blue-600")} />;
      case 'order_created':
        return <Package className={cn(baseClasses, "text-purple-600")} />;
      case 'rfq_received':
        return <FileText className={cn(baseClasses, "text-orange-600")} />;
      case 'quote_received':
        return <MessageSquare className={cn(baseClasses, "text-indigo-600")} />;
      case 'quote_accepted':
        return <CheckCircle className={cn(baseClasses, "text-green-600")} />;
      case 'quote_rejected':
        return <XCircle className={cn(baseClasses, "text-red-600")} />;
      case 'container_ready':
        return <Package className={cn(baseClasses, "text-blue-600")} />;
      case 'system':
        return <Settings className={cn(baseClasses, "text-gray-600")} />;
      case 'reminder':
        return <Clock className={cn(baseClasses, "text-yellow-600")} />;
      default:
        return <Bell className={cn(baseClasses, "text-gray-600")} />;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs h-5">Khẩn cấp</Badge>;
      case 'high':
        return <Badge variant="destructive" className="text-xs h-5 bg-orange-500">Quan trọng</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs h-5">Vừa</Badge>;
      default:
        return null;
    }
  };

  // Format timestamp
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Vừa xong';
      if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
      return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    } catch {
      return 'Không xác định';
    }
  };

  // Initialize and auto-refresh
  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(() => {
      if (!open) {
        fetchNotifications();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications, open]);

  // Fetch when popover opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const FilterButton = ({ value, label, count }: { value: FilterType; label: string; count: number }) => (
    <button
      onClick={() => setFilter(value)}
      className={cn(
        "px-3 py-1.5 text-xs font-medium rounded transition-colors",
        filter === value
          ? "bg-primary text-primary-foreground"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      )}
    >
      {label} ({count})
    </button>
  );

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative hover:bg-gray-100 transition-all duration-200 hover:scale-105"
        aria-label="Thông báo"
        onClick={() => {
          console.log('Bell clicked, current open state:', open);
          setOpen(!open);
        }}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 pointer-events-none animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
      
      {/* Dropdown Content */}
      {open && (
        <div 
          className="absolute right-0 mt-2 w-[420px] bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]"
          style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
        >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  {unreadCount} mới
                </Badge>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0 || isMarkingAllRead}
                    className="flex items-center gap-2"
                  >
                    {isMarkingAllRead ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCheck className="h-4 w-4" />
                    )}
                    Đánh dấu tất cả đã đọc
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={fetchNotifications}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Làm mới
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="px-4 pb-3">
            <div className="flex gap-2">
              <FilterButton 
                value="all" 
                label="Tất cả" 
                count={notifications.length} 
              />
              <FilterButton 
                value="unread" 
                label="Chưa đọc" 
                count={notifications.filter(n => !n.read).length} 
              />
              <FilterButton 
                value="important" 
                label="Quan trọng" 
                count={notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length} 
              />
            </div>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div 
          className="overflow-y-auto overflow-x-hidden max-h-[500px] bg-gray-50"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#CBD5E0 #F7FAFC',
          }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Đang tải thông báo...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="rounded-full bg-gray-100 p-6 mb-4">
                <Bell className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-sm text-gray-700 font-medium mb-1">
                {filter === 'all' ? 'Không có thông báo nào' : 
                 filter === 'unread' ? 'Không có thông báo chưa đọc' : 
                 'Không có thông báo quan trọng'}
              </p>
              <p className="text-xs text-gray-500">
                {filter === 'all' ? 'Bạn sẽ thấy thông báo ở đây' : 'Thử chuyển sang tab khác'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "relative group transition-all duration-200",
                    !notification.read && "bg-gradient-to-r from-blue-50 to-transparent border-l-4 border-l-blue-500"
                  )}
                >
                  <button
                    type="button"
                    className="w-full text-left p-4 hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 p-2 rounded-full mt-0.5 bg-white border">
                        {getNotificationIcon(notification)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Header with priority */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <p className={cn(
                              "text-sm font-semibold leading-tight",
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            )}>
                              {notification.title}
                            </p>
                            {getPriorityBadge(notification.priority)}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <div className="h-2.5 w-2.5 bg-blue-600 rounded-full flex-shrink-0" />
                            )}
                            
                            {/* Quick action menu */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                {!notification.read && (
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <Check className="h-3 w-3" />
                                    Đánh dấu đã đọc
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="flex items-center gap-2 text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        {/* Message */}
                        <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(notification.created_at)}</span>
                          </div>
                          
                          {notification.action_url && (
                            <span className="text-xs text-primary font-medium">
                              Xem chi tiết →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div className="border-t bg-white sticky bottom-0 rounded-b-lg">
            <div className="grid grid-cols-2 divide-x">
              <button
                type="button"
                className="px-4 py-3 text-center text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                onClick={(e) => {
                  e.stopPropagation();
                  fetchNotifications();
                }}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tải...
                  </div>
                ) : (
                  'Làm mới'
                )}
              </button>
              
              <button
                type="button"
                className="px-4 py-3 text-center text-sm font-medium text-primary hover:text-primary/80 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                onClick={() => {
                  setOpen(false);
                  window.location.href = '/notifications';
                }}
              >
                Xem tất cả
              </button>
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  );
}