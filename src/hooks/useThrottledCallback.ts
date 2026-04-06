import { useRef, useCallback } from 'react';

/**
 * Throttles a callback to execute at most once per `delayMs` milliseconds.
 * Used for Google Maps API call limiting (1 per 3 seconds).
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delayMs = 3000
): T {
  const lastCall = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  return useCallback(
    ((...args: unknown[]) => {
      const now = Date.now();
      const elapsed = now - lastCall.current;

      if (elapsed >= delayMs) {
        lastCall.current = now;
        return callback(...args);
      }

      // Schedule for later
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        lastCall.current = Date.now();
        callback(...args);
      }, delayMs - elapsed);
    }) as T,
    [callback, delayMs]
  );
}
