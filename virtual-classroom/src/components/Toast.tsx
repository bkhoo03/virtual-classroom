import React, { useEffect } from 'react';
import type { Toast as ToastType } from '../types/toast.types';

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

/**
 * Toast component displays notification messages with different variants
 * Slides in from top-right with animations
 */
export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const getVariantStyles = () => {
    switch (toast.variant) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          textColor: 'text-green-900',
          closeColor: 'text-green-600 hover:text-green-800 hover:bg-green-100',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          textColor: 'text-red-900',
          closeColor: 'text-red-600 hover:text-red-800 hover:bg-red-100',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
        };
      case 'warning':
        return {
          bg: 'bg-orange-50 border-orange-200',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          textColor: 'text-orange-900',
          closeColor: 'text-orange-600 hover:text-orange-800 hover:bg-orange-100',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
        };
      case 'info':
        return {
          bg: 'bg-purple-50 border-purple-200',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          textColor: 'text-purple-900',
          closeColor: 'text-purple-600 hover:text-purple-800 hover:bg-purple-100',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
    }
  };

  const { bg, iconBg, iconColor, textColor, closeColor, icon } = getVariantStyles();

  return (
    <div
      className={`${bg} border rounded-xl shadow-lg p-4 min-w-[300px] max-w-md flex items-start gap-3 animate-slide-in ${
        toast.variant === 'success' ? 'animate-success-glow' : ''
      } ${toast.variant === 'error' ? 'animate-error-shake' : ''}`}
      role="alert"
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${textColor}`}>{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center ${closeColor} transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-purple-500`}
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastType[];
  onClose: (id: string) => void;
}

/**
 * ToastContainer manages the display of multiple toast notifications
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};
