"use client";

import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

interface PremiumNotificationProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  show: boolean;
  onClose?: () => void;
  duration?: number;
}

export function PremiumNotification({ 
  type, 
  message, 
  show, 
  onClose, 
  duration = 3000 
}: PremiumNotificationProps) {
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
        return <CheckCircle className="h-6 w-6 text-white" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-white" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-white" />;
      case 'info':
      default:
        return <Info className="h-6 w-6 text-white" />;
    }
  };

  const getGradientStyles = () => {
    switch (type) {
      case 'success':
        return 'from-emerald-500 to-emerald-600';
      case 'error':
        return 'from-red-500 to-red-600';
      case 'warning':
        return 'from-amber-500 to-amber-600';
      case 'info':
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  const getBackgroundStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200';
      case 'error':
        return 'bg-gradient-to-r from-red-50 to-red-100 border-red-200';
      case 'warning':
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      case 'info':
      default:
        return 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`${getBackgroundStyles()} border rounded-xl p-4 shadow-2xl animate-in slide-in-from-right-5 duration-500 backdrop-blur-md`}>
        <div className="flex items-start gap-4">
          {/* Icon with gradient background */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r ${getGradientStyles()} flex items-center justify-center shadow-lg`}>
            {getIcon()}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 leading-relaxed">
              {message}
            </p>
          </div>
          
          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-all duration-200 group"
            >
              <X className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
            </button>
          )}
        </div>
        
        {/* Progress bar */}
        {duration > 0 && (
          <div className="mt-3 w-full bg-white/30 rounded-full h-1 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${getGradientStyles()} rounded-full animate-pulse`}
              style={{
                animation: `shrink ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
