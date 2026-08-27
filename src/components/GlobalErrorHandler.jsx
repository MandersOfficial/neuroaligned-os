import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';

/**
 * Surfaces runtime 403 responses with clear user feedback instead of letting
 * them fail silently. Boot-time 403 handling (auth_required / user_not_registered)
 * lives in AuthContext; this covers mid-session errors that bubble up as
 * unhandled promise rejections from SDK calls.
 *
 *  - auth_required  → session is invalid/expired → redirect to login.
 *  - user_not_registered → AuthContext already renders the dedicated screen.
 *  - any other 403  → permission denial (e.g. RLS) → destructive toast.
 */
export default function GlobalErrorHandler() {
  const { navigateToLogin } = useAuth();

  useEffect(() => {
    const onUnhandled = (event) => {
      const err = event?.reason;
      const status = err?.status ?? err?.response?.status;
      if (status !== 403) return;

      const reason = err?.data?.extra_data?.reason ?? err?.extra_data?.reason;
      if (reason === 'auth_required') {
        event.preventDefault?.();
        navigateToLogin();
        return;
      }
      if (reason === 'user_not_registered') {
        // Handled by AuthContext's boot flow — don't double-report.
        return;
      }
      event.preventDefault?.();
      toast({
        title: 'Permission required',
        description: "You don't have access to do that. If this seems wrong, try signing out and back in.",
        variant: 'destructive',
      });
    };
    window.addEventListener('unhandledrejection', onUnhandled);
    return () => window.removeEventListener('unhandledrejection', onUnhandled);
  }, [navigateToLogin]);

  return null;
}