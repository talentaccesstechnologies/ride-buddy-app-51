// ============================================
// PRICING CACHE — TTL 2 minutes
// Avoids recalculating the same price thousands of times
// ============================================

import { type PricingResult } from '@/utils/cabyVanPricing';

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
const MAX_CACHE_SIZE = 500;

interface CacheEntry {
  result: PricingResult;
  timestamp: number;
}

const pricingCache = new Map<string, CacheEntry>();

function buildCacheKey(
  routeId: number | string,
  seatsSold: number,
  totalSeats: number,
  departureTime: Date
): string {
  // Round departure to nearest 5-minute window to maximize cache hits
  const roundedDep = Math.floor(departureTime.getTime() / (5 * 60 * 1000));
  return `${routeId}-${seatsSold}-${totalSeats}-${roundedDep}`;
}

export function getCachedPrice(
  routeId: number | string,
  seatsSold: number,
  totalSeats: number,
  departureTime: Date
): PricingResult | null {
  const key = buildCacheKey(routeId, seatsSold, totalSeats, departureTime);
  const cached = pricingCache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result;
  }

  // Evict stale entry
  if (cached) pricingCache.delete(key);
  return null;
}

export function setCachedPrice(
  routeId: number | string,
  seatsSold: number,
  totalSeats: number,
  departureTime: Date,
  result: PricingResult
): void {
  const key = buildCacheKey(routeId, seatsSold, totalSeats, departureTime);

  // Evict oldest entries if cache is full
  if (pricingCache.size >= MAX_CACHE_SIZE) {
    const oldest = pricingCache.keys().next().value;
    if (oldest) pricingCache.delete(oldest);
  }

  pricingCache.set(key, { result, timestamp: Date.now() });
}

export function clearPricingCache(): void {
  pricingCache.clear();
}

export function getCacheStats(): { size: number; maxSize: number } {
  return { size: pricingCache.size, maxSize: MAX_CACHE_SIZE };
}
