import { useToast as useToastHook } from '@/components/ui/toast';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface ToastActionElement {
  altText: string;
  onClick: () => void;
  children: React.ReactNode;
}

interface UseToast {
  toast: (props: Toast) => void;
  dismiss: (toastId?: string) => void;
  toasts: Toast[];
}

export const useToast = (): UseToast => {
  return useToastHook();
};