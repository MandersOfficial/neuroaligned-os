import { useEffect, useRef } from 'react';

export const APP_REFRESH_EVENT = 'na:app-refresh';

export function triggerAppRefresh() {
  window.dispatchEvent(new CustomEvent(APP_REFRESH_EVENT));
}

/**
 * Re-runs `handler` whenever a global pull-to-refresh completes.
 * Pages pass their data-loading function; local UI state (filters,
 * scroll, expanded cards) is preserved — only data reloads.
 */
export function useAppRefresh(handler) {
  const handlerRef = useRef(handler);
  useEffect(() => { handlerRef.current = handler; });
  useEffect(() => {
    const listener = () => handlerRef.current();
    window.addEventListener(APP_REFRESH_EVENT, listener);
    return () => window.removeEventListener(APP_REFRESH_EVENT, listener);
  }, []);
}