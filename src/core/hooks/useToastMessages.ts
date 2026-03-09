import { App } from 'antd';
import { useEffect, useRef } from 'react';

/**
 * Watches successMsg / errorMsg from a Redux slice and shows Ant Design toasts.
 * Uses App.useApp() — requires <App> wrapper in the component tree (see App.tsx).
 * Should be used ONLY in always-mounted components (ListPages), NOT inside modals.
 */
export function useToastMessages(
  successMsg: string | null,
  errorMsg: string | null,
  clearSuccess?: () => void,
  clearError?: () => void,
) {
  const { message } = App.useApp();
  const shownSuccess = useRef<string | null>(null);
  const shownError = useRef<string | null>(null);

  useEffect(() => {
    if (successMsg && successMsg !== shownSuccess.current) {
      shownSuccess.current = successMsg;
      void message.success(successMsg);
      const timer = setTimeout(() => {
        shownSuccess.current = null;
        clearSuccess?.();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg && errorMsg !== shownError.current) {
      shownError.current = errorMsg;
      void message.error(errorMsg);
      const timer = setTimeout(() => {
        shownError.current = null;
        clearError?.();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);
}
