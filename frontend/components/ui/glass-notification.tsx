"use client";

import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

interface GlassNotificationProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  show: boolean;
  onClose?: () => void;
  duration?: number;
}

export function GlassNotification({ 
  type, 
  message, 
  show, 
  onClose, 
  duration = 5000 
}: GlassNotificationProps) {
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
        return <CheckCircle className="h-6 w-6 text-emerald-600" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-amber-600" />;
      case 'info':
      default:
        return <Info className="h-6 w-6 text-blue-600" />;
    }
  };

  const getGlassStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/20 ring-emerald-500/10';
      case 'error':
        return 'bg-red-500/10 border-red-500/20 ring-red-500/10';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20 ring-amber-500/10';
      case 'info':
      default:
        return 'bg-blue-500/10 border-blue-500/20 ring-blue-500/10';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`${getGlassStyles()} backdrop-blur-xl border rounded-2xl p-5 shadow-2xl ring-1 animate-in slide-in-from-right-5 duration-500`}>
        <div className="flex items-start gap-4">
          {/* Icon with glass effect */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
            {getIcon()}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 leading-relaxed">
              {message}
            </p>
          </div>
          
          {/* Close button with glass effect */}
          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-200 group shadow-lg"
            >
              <X className="h-4 w-4 text-gray-600 group-hover:text-gray-800" />
            </button>
          )}
        </div>
        
        {/* Glass progress bar */}
        {duration > 0 && (
          <div className="mt-4 w-full bg-white/20 rounded-full h-1 overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-white/40 rounded-full animate-pulse"
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
