export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

export interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, variant: ToastVariant, duration?: number) => void;
  removeToast: (id: string) => void;
}
