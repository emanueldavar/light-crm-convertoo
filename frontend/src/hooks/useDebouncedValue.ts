import { useEffect, useState } from 'react';

/**
 * Simple debounce hook for values (useful for search input)
 * @param value input value
 * @param delay debounce ms
 */
export default function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}