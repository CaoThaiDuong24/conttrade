"use client";

import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  show: boolean;
  onClose?: () => void;
  duration?: number;
}

export function Notification({ 
  type, 
  message, 
  show, 
  onClose, 
  duration = 5000 
}: NotificationProps) {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getNotificationStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-white border-l-4 border-l-emerald-500 shadow-xl ring-1 ring-emerald-100';
      case 'error':
        return 'bg-white border-l-4 border-l-red-500 shadow-xl ring-1 ring-red-100';
      case 'warning':
        return 'bg-white border-l-4 border-l-amber-500 shadow-xl ring-1 ring-amber-100';
      case 'info':
      default:
        return 'bg-white border-l-4 border-l-blue-500 shadow-xl ring-1 ring-blue-100';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-gray-800';
      case 'error':
        return 'text-gray-800';
      case 'warning':
        return 'text-gray-800';
      case 'info':
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`${getNotificationStyles()} rounded-lg p-4 animate-in slide-in-from-right-5 duration-300 backdrop-blur-sm`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${getTextColor()} leading-relaxed`}>
              {message}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
            >
              <X className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
