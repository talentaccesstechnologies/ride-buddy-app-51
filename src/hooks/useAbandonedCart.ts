// ============================================================
// src/hooks/useAbandonedCart.ts
// Panier abandonné + compte à rebours prix garanti
// Stockage : localStorage avec TTL 30 minutes
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { calculateFullPrice } from '@/utils/cabyVanPricing';

// ── TYPES ────────────────────────────────────────────────────

export interface AbandonedCartSlot {
  slotDbId: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  date: string;
  price: number;
  seatsLeft: number;
  segment: string;
}

export interface AbandonedCart {
  outbound: AbandonedCartSlot | null;
  returnSlot: AbandonedCartSlot | null;
  savedAt: number;       // timestamp
  expiresAt: number;     // timestamp (savedAt + 30min)
  searchCount: number;   // nb de fois que la route a été cherchée
  lastRoute: string;     // "Genève→Zurich"
}

export interface PriceGuarantee {
  isActive: boolean;
  expiresAt: number;
  secondsLeft: number;
  minutesLeft: number;
  price: number;
  hasExpired: boolean;
}

const CART_KEY = 'caby_van_cart';
const SEARCH_KEY = 'caby_van_searches';
const CART_TTL_MS = 30 * 60 * 1000;        // 30 minutes
const PRICE_GUARANTEE_MS = 15 * 60 * 1000; // 15 minutes

// ── FONCTIONS UTILITAIRES ────────────────────────────────────

function saveCart(cart: AbandonedCart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {}
}

function loadCart(): AbandonedCart | null {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return null;
    const cart = JSON.parse(raw) as AbandonedCart;
    if (Date.now() > cart.expiresAt) {
      localStorage.removeItem(CART_KEY);
      return null;
    }
    return cart;
  } catch {
    return null;
  }
}

function clearCart() {
  try { localStorage.removeItem(CART_KEY); } catch {}
}

function getSearchCount(route: string): number {
  try {
    const raw = localStorage.getItem(SEARCH_KEY);
    if (!raw) return 0;
    const searches = JSON.parse(raw) as Record<string, number>;
    return searches[route] || 0;
  } catch { return 0; }
}

function incrementSearchCount(route: string): number {
  try {
    const raw = localStorage.getItem(SEARCH_KEY);
    const searches = raw ? JSON.parse(raw) : {};
    searches[route] = (searches[route] || 0) + 1;
    localStorage.setItem(SEARCH_KEY, JSON.stringify(searches));
    return searches[route];
  } catch { return 1; }
}

// ── HOOK PRINCIPAL ───────────────────────────────────────────

export interface UseAbandonedCartReturn {
  // Panier abandonné
  cart: AbandonedCart | null;
  hasAbandonedCart: boolean;
  saveToCart: (outbound: AbandonedCartSlot, returnSlot?: AbandonedCartSlot) => void;
  restoreCart: () => AbandonedCart | null;
  dismissCart: () => void;

  // Compte à rebours prix garanti
  priceGuarantee: PriceGuarantee;
  startPriceGuarantee: (price: number) => void;
  cancelPriceGuarantee: () => void;

  // Compteur de recherches
  searchCount: number;
  trackSearch: (route: string) => number;
  showUrgencyMessage: boolean;  // true si >2 recherches sans réservation
}

export function useAbandonedCart(): UseAbandonedCartReturn {
  const [cart, setCart] = useState<AbandonedCart | null>(null);
  const [priceGuarantee, setPriceGuarantee] = useState<PriceGuarantee>({
    isActive: false, expiresAt: 0, secondsLeft: 0, minutesLeft: 0, price: 0, hasExpired: false,
  });
  const [searchCount, setSearchCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const guaranteeExpiresRef = useRef<number>(0);
  const guaranteePriceRef = useRef<number>(0);

  // Charger le panier au montage
  useEffect(() => {
    const saved = loadCart();
    if (saved) setCart(saved);
  }, []);

  // Tick du compte à rebours
  useEffect(() => {
    if (!priceGuarantee.isActive) return;

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, guaranteeExpiresRef.current - now);
      const secondsLeft = Math.floor(remaining / 1000);
      const minutesLeft = Math.floor(secondsLeft / 60);

      if (remaining <= 0) {
        setPriceGuarantee(prev => ({
          ...prev,
          isActive: false,
          secondsLeft: 0,
          minutesLeft: 0,
          hasExpired: true,
        }));
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setPriceGuarantee(prev => ({
          ...prev,
          secondsLeft,
          minutesLeft,
        }));
      }
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [priceGuarantee.isActive]);

  // Sauvegarder un créneau dans le panier abandonné
  const saveToCart = useCallback((
    outbound: AbandonedCartSlot,
    returnSlot?: AbandonedCartSlot
  ) => {
    const now = Date.now();
    const route = `${outbound.from}→${outbound.to}`;
    const count = getSearchCount(route);

    const newCart: AbandonedCart = {
      outbound,
      returnSlot: returnSlot || null,
      savedAt: now,
      expiresAt: now + CART_TTL_MS,
      searchCount: count,
      lastRoute: route,
    };

    saveCart(newCart);
    setCart(newCart);
  }, []);

  // Restaurer le panier
  const restoreCart = useCallback((): AbandonedCart | null => {
    const saved = loadCart();
    if (saved) {
      setCart(saved);
      return saved;
    }
    return null;
  }, []);

  // Rejeter le panier (ne plus afficher la bannière)
  const dismissCart = useCallback(() => {
    clearCart();
    setCart(null);
  }, []);

  // Démarrer le compte à rebours prix garanti
  const startPriceGuarantee = useCallback((price: number) => {
    const expiresAt = Date.now() + PRICE_GUARANTEE_MS;
    guaranteeExpiresRef.current = expiresAt;
    guaranteePriceRef.current = price;

    const secondsLeft = Math.floor(PRICE_GUARANTEE_MS / 1000);
    setPriceGuarantee({
      isActive: true,
      expiresAt,
      secondsLeft,
      minutesLeft: Math.floor(secondsLeft / 60),
      price,
      hasExpired: false,
    });
  }, []);

  // Annuler le compte à rebours
  const cancelPriceGuarantee = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPriceGuarantee({
      isActive: false, expiresAt: 0, secondsLeft: 0, minutesLeft: 0, price: 0, hasExpired: false,
    });
  }, []);

  // Tracker une recherche
  const trackSearch = useCallback((route: string): number => {
    const count = incrementSearchCount(route);
    setSearchCount(count);
    return count;
  }, []);

  const hasAbandonedCart = !!cart && Date.now() < cart.expiresAt;
  const showUrgencyMessage = searchCount >= 3;

  return {
    cart, hasAbandonedCart, saveToCart, restoreCart, dismissCart,
    priceGuarantee, startPriceGuarantee, cancelPriceGuarantee,
    searchCount, trackSearch, showUrgencyMessage,
  };
}
