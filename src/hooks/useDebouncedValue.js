import { useEffect, useState } from 'react';

/**
 * Returns `value`, but only updated after `delay` ms without further changes.
 * Keeps rapid keystroke sequences from re-running expensive list filters on
 * every keypress — the input stays instant, derived work runs once typing
 * pauses.
 *
 *   const [search, setSearch] = useState('');
 *   const debouncedSearch = useDebouncedValue(search, 250);
 */
export default function useDebouncedValue(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}