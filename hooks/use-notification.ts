import { useState } from 'react';

export interface NotificationState {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  show: boolean;
}

export function useNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    type: 'info',
    message: '',
    show: false,
  });

  const showNotification = (
    type: 'success' | 'error' | 'info' | 'warning',
    message: string,
    duration: number = 5000
  ) => {
    setNotification({ type, message, show: true });
    
    if (duration > 0) {
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, duration);
    }
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const showSuccess = (message: string, duration?: number) => {
    showNotification('success', message, duration);
  };

  const showError = (message: string, duration?: number) => {
    showNotification('error', message, duration);
  };

  const showInfo = (message: string, duration?: number) => {
    showNotification('info', message, duration);
  };

  const showWarning = (message: string, duration?: number) => {
    showNotification('warning', message, duration);
  };

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
}
