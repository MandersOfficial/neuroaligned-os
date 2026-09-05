import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Resolves the logged-in user once for a page. Used by AppShell so every
 * core-workspace page gets the user via outlet context instead of
 * re-implementing auth-me + redirect + loading on each page.
 */
export default function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const redirectToLogin = () => {
      const { pathname, search } = window.location;
      base44.auth.redirectToLogin(pathname + search);
    };
    base44.auth.me().then(u => {
      if (cancelled) return;
      if (!u) { redirectToLogin(); return; }
      setUser(u);
      setLoading(false);
    }).catch(() => { if (!cancelled) redirectToLogin(); });
    return () => { cancelled = true; };
  }, []);

  return { user, loading };
}