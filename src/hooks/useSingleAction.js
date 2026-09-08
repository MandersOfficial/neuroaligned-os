import { useCallback, useRef } from 'react';

/**
 * Wraps an async handler so accidental double-clicks/double-taps can't fire
 * it twice — the second call is ignored while the first is still in flight.
 *
 *   const handleCreate = useSingleAction(async () => { await createThing(); });
 */
export default function useSingleAction(fn) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const inFlight = useRef(false);

  return useCallback(async (...args) => {
    if (inFlight.current) return undefined;
    inFlight.current = true;
    try {
      return await fnRef.current(...args);
    } finally {
      inFlight.current = false;
    }
  }, []);
}