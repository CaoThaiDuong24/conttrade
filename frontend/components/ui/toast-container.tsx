"use client";

import { PremiumNotification } from './premium-notification';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="animate-in slide-in-from-right-5 duration-300"
          style={{
            animationDelay: `${index * 100}ms`,
            transform: `translateY(${index * 8}px)`,
          }}
        >
          <PremiumNotification
            type={toast.type}
            message={toast.message}
            show={true}
            onClose={() => onRemove(toast.id)}
            duration={toast.duration}
          />
        </div>
      ))}
    </div>
  );
}
