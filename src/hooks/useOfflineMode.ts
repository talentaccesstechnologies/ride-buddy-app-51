import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const wasOffline = useRef(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline.current) {
        toast.success('Connexion rétablie', { description: 'Synchronisation en cours...' });
        wasOffline.current = false;
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      wasOffline.current = true;
      toast.error('Pas de connexion', { description: 'Certaines fonctionnalités sont limitées' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}

// Retry wrapper for API calls
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}

// Local cache for confirmed bookings
const BOOKINGS_CACHE_KEY = 'caby_confirmed_bookings';

export function cacheBookingLocally(booking: Record<string, unknown>): void {
  try {
    const existing = JSON.parse(localStorage.getItem(BOOKINGS_CACHE_KEY) || '[]');
    existing.push({ ...booking, cachedAt: Date.now() });
    // Keep only last 20
    const trimmed = existing.slice(-20);
    localStorage.setItem(BOOKINGS_CACHE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full or unavailable
  }
}

export function getCachedBookings(): Record<string, unknown>[] {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_CACHE_KEY) || '[]');
  } catch {
    return [];
  }
}
