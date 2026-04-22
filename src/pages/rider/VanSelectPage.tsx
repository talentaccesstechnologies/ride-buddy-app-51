import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Check, Edit2, AlertTriangle, Bus, Zap, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  findRoute, formatDuration,
  type VanRoute,
} from '@/lib/cabyVanPricing';
import {
  calculateFullPrice,
  type RouteSegment,
} from '@/utils/cabyVanPricing';
import {
  getVanSlots, subscribeToRouteSlots,
  type VanSlotDB,
} from '@/lib/vanSupabase';
import BookingStepper from '@/components/van/BookingStepper';
import BottomNav from '@/components/rider/BottomNav';
import { useAbandonedCart } from '@/hooks/useAbandonedCart';
import {
  AbandonedCartBanner,
  PriceGuaranteeBanner,
  UrgencyMessage,
} from '@/components/van/AbandonedCartBanner';

const GOLD = '#C9A84C';
const DAYS_FR_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

// ── TYPES ────────────────────────────────────────────────────
interface TimeSlotData {
  id: string;
  slotDbId: string;          // UUID Supabase pour la réservation
  departure: string;
  arrival: string;
  price: number;
  originalPrice: number;
  seatsLeft: number;
  seatsTotal: number;
  isLowest: boolean;
  isLastMinute: boolean;
  lastMinuteDiscount: number;
  urgencyLabel: string;
  urgencyColor: 'green' | 'orange' | 'red';
  fillRate: number;
  date: string;
  fromSupabase: boolean;     // true = données réelles, false = fallback
}

// ── CONVERTIR UN SLOT SUPABASE EN TimeSlotData ───────────────
function slotDbToTimeSlot(slot: VanSlotDB, isoDate: string): TimeSlotData {
  const departureTime = new Date(slot.departure_time);
  const pricing = calculateFullPrice(
    slot.base_price,
    slot.seats_sold,
    slot.seats_total,
    departureTime,
    new Date()
  );

  const dep = `${String(departureTime.getHours()).padStart(2,'0')}:${String(departureTime.getMinutes()).padStart(2,'0')}`;
  const arr = new Date(slot.arrival_time);
  const arrStr = `${String(arr.getHours()).padStart(2,'0')}:${String(arr.getMinutes()).padStart(2,'0')}`;

  return {
    id: `${slot.id}-${isoDate}`,
    slotDbId: slot.id,
    departure: dep,
    arrival: arrStr,
    price: pricing.currentPrice,
    originalPrice: pricing.originalPrice,
    seatsLeft: Math.max(0, slot.seats_total - slot.seats_sold),
    seatsTotal: slot.seats_total,
    isLowest: false,
    isLastMinute: pricing.isLastMinute,
    lastMinuteDiscount: pricing.discount,
    urgencyLabel: pricing.urgencyLabel,
    urgencyColor: pricing.urgencyColor,
    fillRate: pricing.fillRate,
    date: isoDate,
    fromSupabase: true,
  };
}

// ── FALLBACK : générer des slots locaux si Supabase vide ─────
function generateFallbackSlots(route: VanRoute, date: Date): TimeSlotData[] {
  const isoDate = date.toISOString().slice(0, 10);
  const dayOfWeek = date.getDay();
  const daysUntil = Math.max(0, Math.floor((date.getTime() - Date.now()) / 86400000));
  const seed = date.getDate() + dayOfWeek * 7;

  const times = [
    { h: 7, m: 0, taken: 3 },
    { h: 9, m: 0, taken: 1 },
    { h: 12, m: 0, taken: 0 },
    { h: 17, m: 0, taken: 4 },
    { h: 19, m: 0, taken: 2 },
  ];

  return times.map((t, i) => {
    const depTime = new Date(date);
    depTime.setHours(t.h, t.m, 0, 0);
    const seatVariation = ((seed + i) % 3);
    const seatsTaken = Math.min(6, t.taken + seatVariation);

    const pricing = calculateFullPrice(
      route.basePrice, seatsTaken, 7, depTime, new Date()
    );

    const arrTime = new Date(depTime.getTime() + route.duration * 60000);
    const dep = `${String(t.h).padStart(2,'0')}:${String(t.m).padStart(2,'0')}`;
    const arr = `${String(arrTime.getHours()).padStart(2,'0')}:${String(arrTime.getMinutes()).padStart(2,'0')}`;

    return {
      id: `fallback-${route.id}-${dep}-${isoDate}`,
      slotDbId: '',
      departure: dep,
      arrival: arr,
      price: pricing.currentPrice,
      originalPrice: pricing.originalPrice,
      seatsLeft: Math.max(0, 7 - seatsTaken),
      seatsTotal: 7,
      isLowest: false,
      isLastMinute: pricing.isLastMinute,
      lastMinuteDiscount: pricing.discount,
      urgencyLabel: pricing.urgencyLabel,
      urgencyColor: pricing.urgencyColor,
      fillRate: pricing.fillRate,
      date: isoDate,
      fromSupabase: false,
    };
  });
}

// ── Marquer le prix le plus bas ──────────────────────────────
function markLowest(slots: TimeSlotData[]): TimeSlotData[] {
  const available = slots.filter(s => s.seatsLeft > 0);
  if (available.length === 0) return slots;
  const minPrice = Math.min(...available.map(s => s.price));
  return slots.map(s => ({ ...s, isLowest: s.seatsLeft > 0 && s.price === minPrice }));
}

function formatDateLabel(d: Date) {
  return `${DAYS_FR_SHORT[d.getDay()]}. ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
}

// ── Barre de remplissage ─────────────────────────────────────
const FillRateBar: React.FC<{ fillRate: number; seatsLeft: number; fromSupabase: boolean }> = ({ fillRate, seatsLeft, fromSupabase }) => {
  const color = fillRate >= 0.86 ? '#EF4444' : fillRate >= 0.57 ? GOLD : '#22C55E';
  return (
    <div style={{ padding: '4px 8px 6px', background: '#F9F9F9', borderTop: '1px solid #E5E7EB' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <span style={{ fontSize: 10, color: '#6B7280', fontWeight: 500 }}>
          {seatsLeft === 0 ? 'Complet' : `${seatsLeft} siège${seatsLeft > 1 ? 's' : ''}`}
        </span>
        <span style={{ fontSize: 9, color: fromSupabase ? '#22C55E' : '#9CA3AF', fontWeight: 600 }}>
          {fromSupabase ? '● Live' : '○ Estimé'}
        </span>
      </div>
      {seatsLeft > 0 && (
        <div style={{ height: 3, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.round(fillRate * 100)}%`, background: color, borderRadius: 2, transition: 'width 0.3s ease' }} />
        </div>
      )}
    </div>
  );
};

// ── SLOT CARD ────────────────────────────────────────────────
const SlotCard: React.FC<{
  slot: TimeSlotData;
  minPrice: number;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ slot, minPrice, isSelected, onSelect }) => {
  const isSoldOut = slot.seatsLeft === 0;
  const isLowest = !isSoldOut && slot.price === minPrice;
  const showLastMinute = slot.isLastMinute && !isSoldOut && !isSelected;

  return (
    <div
      role={isSoldOut ? undefined : 'button'}
      tabIndex={isSoldOut ? -1 : 0}
      onClick={() => { if (!isSoldOut) onSelect(); }}
      onKeyDown={e => { if (!isSoldOut && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(); } }}
      className={`rounded-md overflow-hidden border transition-all ${
        isSoldOut ? 'cursor-not-allowed' : 'cursor-pointer'
      } ${
        isSelected ? 'border-transparent shadow-lg'
        : isSoldOut ? 'border-gray-200 opacity-70 bg-white'
        : slot.fillRate >= 0.86 ? 'border-orange-300 bg-white hover:border-orange-400'
        : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      style={isSelected ? { boxShadow: `0 0 0 2px ${GOLD}`, position: 'relative' } : { position: 'relative' }}
    >
      {/* Badge last-minute */}
      {showLastMinute && (
        <div style={{
          position: 'absolute', top: -8, right: -8, zIndex: 10,
          background: slot.urgencyColor === 'red' ? '#EF4444' : slot.urgencyColor === 'orange' ? '#F97316' : GOLD,
          color: '#fff', fontSize: 9, fontWeight: 800,
          padding: '2px 6px', borderRadius: 10,
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}>
          -{slot.lastMinuteDiscount}%
        </div>
      )}

      {/* Header sombre */}
      <div className="bg-slate-800 text-white px-3 py-2 text-[11px] leading-tight">
        <div className="flex items-center justify-between">
          <span className="opacity-80">Départ</span>
          <span className="font-bold">{slot.departure}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="opacity-80">Arrivée</span>
          <span className="font-bold">{slot.arrival}</span>
        </div>
      </div>

      {/* Ribbon prix le plus bas */}
      <div
        className="text-white text-[10px] font-bold text-center py-1 tracking-wider"
        style={{
          backgroundColor: isLowest && !isSelected ? GOLD : 'transparent',
          visibility: isLowest && !isSelected ? 'visible' : 'hidden',
        }}
      >
        PRIX LE PLUS BAS
      </div>

      {/* Corps */}
      <div
        className="px-3 py-3 min-h-[80px] flex flex-col items-center justify-center text-center transition-colors"
        style={isSelected ? { backgroundColor: GOLD } : {}}
      >
        {isSoldOut ? (
          <p className="text-sm font-bold text-gray-500 py-3">Complet</p>
        ) : (
          <div className="w-full flex flex-col items-center gap-1 pointer-events-none">
            {slot.isLastMinute && !isSelected && (
              <span style={{ fontSize: 10, color: '#9CA3AF', textDecoration: 'line-through' }}>
                CHF {slot.originalPrice}
              </span>
            )}
            <div className="flex items-center justify-center gap-2">
              <span className={`text-base font-black ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                CHF {slot.price}.00
              </span>
              {isSelected ? (
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              ) : (
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-base font-bold" style={{ backgroundColor: GOLD }}>+</span>
              )}
            </div>
            {slot.isLastMinute && !isSelected && (
              <span style={{
                fontSize: 9, fontWeight: 700,
                color: slot.urgencyColor === 'red' ? '#EF4444' : slot.urgencyColor === 'orange' ? '#F97316' : GOLD,
              }}>
                {slot.urgencyLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Barre remplissage */}
      <FillRateBar fillRate={slot.fillRate} seatsLeft={slot.seatsLeft} fromSupabase={slot.fromSupabase} />
    </div>
  );
};

// ── HOOK : charger les slots depuis Supabase ─────────────────
function useSupabaseSlots(fromCity: string, toCity: string, date: Date, route: VanRoute | undefined) {
  const [slots, setSlots] = useState<TimeSlotData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSlots = useCallback(async () => {
    if (!route) { setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const dbSlots = await getVanSlots(fromCity, toCity, date);
      const isoDate = date.toISOString().slice(0, 10);

      if (dbSlots.length > 0) {
        const converted = dbSlots.map(s => slotDbToTimeSlot(s, isoDate));
        setSlots(markLowest(converted));
      } else {
        // Fallback avec données locales + yield management
        setSlots(markLowest(generateFallbackSlots(route, date)));
      }
    } catch {
      // Fallback silencieux
      if (route) setSlots(markLowest(generateFallbackSlots(route, date)));
    } finally {
      setIsLoading(false);
    }
  }, [fromCity, toCity, date.toISOString().slice(0, 10), route?.id]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  // Realtime : mettre à jour si un siège est vendu
  useEffect(() => {
    if (!route) return;
    const channel = subscribeToRouteSlots(fromCity, toCity, (updatedSlot) => {
      const isoDate = date.toISOString().slice(0, 10);
      const slotDate = updatedSlot.departure_time.slice(0, 10);
      if (slotDate !== isoDate) return;
      setSlots(prev => {
        const updated = prev.map(s =>
          s.slotDbId === updatedSlot.id ? slotDbToTimeSlot(updatedSlot, isoDate) : s
        );
        return markLowest(updated);
      });
    });
    return () => { if (channel?.unsubscribe) channel.unsubscribe(); };
  }, [fromCity, toCity, date.toISOString().slice(0, 10), route?.id]);

  return { slots, isLoading, reload: loadSlots };
}

// ── PAGE PRINCIPALE ──────────────────────────────────────────
const VanSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const from = searchParams.get('from') || 'Genève';
  const to = searchParams.get('to') || 'Zurich';
  const dateStr = searchParams.get('date') || '';
  const returnDateStr = searchParams.get('returnDate') || '';
  const passengers = parseInt(searchParams.get('passengers') || '1');
  const isRoundTrip = !!returnDateStr;

  const buildSyntheticRoute = (f: string, t: string): VanRoute => ({
    id: 0, from: f, to: t, duration: 90, basePrice: 49, segment: 'business', flag: '🇨🇭',
  });

  const route = useMemo(() => findRoute(from, to) ?? buildSyntheticRoute(from, to), [from, to]);
  const returnRoute = useMemo(
    () => isRoundTrip ? (findRoute(to, from) ?? buildSyntheticRoute(to, from)) : null,
    [from, to, isRoundTrip]
  );

  const baseDate = useMemo(() => dateStr ? new Date(dateStr) : new Date(), [dateStr]);
  const returnBaseDate = useMemo(() => returnDateStr ? new Date(returnDateStr) : new Date(), [returnDateStr]);

  const [outboundOffset, setOutboundOffset] = useState(0);
  const [returnOffset, setReturnOffset] = useState(0);
  const [selectedOutbound, setSelectedOutbound] = useState<TimeSlotData | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<TimeSlotData | null>(null);
  const [viewingCount, setViewingCount] = useState(14);
  const [mobileTab, setMobileTab] = useState<'outbound' | 'return'>('outbound');

  const {
    cart, hasAbandonedCart, saveToCart, restoreCart, dismissCart,
    priceGuarantee, startPriceGuarantee, cancelPriceGuarantee,
    searchCount, trackSearch, showUrgencyMessage,
  } = useAbandonedCart();

  // Tracker la recherche au montage
  useEffect(() => {
    const r = `${from}→${to}`;
    trackSearch(r);
  }, [from, to]);

  // Démarrer la garantie quand un créneau est sélectionné
  useEffect(() => {
    if (selectedOutbound && !priceGuarantee.isActive) {
      startPriceGuarantee(selectedOutbound.price);
    }
  }, [selectedOutbound?.id]);

  // Sauvegarder dans le panier abandonné quand une sélection est faite
  useEffect(() => {
    if (!selectedOutbound) return;
    saveToCart(
      {
        slotDbId: selectedOutbound.slotDbId || '',
        from, to,
        departure: selectedOutbound.departure,
        arrival: selectedOutbound.arrival,
        date: selectedOutbound.date,
        price: selectedOutbound.price,
        seatsLeft: selectedOutbound.seatsLeft,
        segment: route?.segment || 'business',
      },
      selectedReturn ? {
        slotDbId: selectedReturn.slotDbId || '',
        from: to, to: from,
        departure: selectedReturn.departure,
        arrival: selectedReturn.arrival,
        date: selectedReturn.date,
        price: selectedReturn.price,
        seatsLeft: selectedReturn.seatsLeft,
        segment: returnRoute?.segment || 'business',
      } : undefined
    );
  }, [selectedOutbound?.id, selectedReturn?.id]);

  const outboundDate = useMemo(() => {
    const d = new Date(baseDate); d.setDate(d.getDate() + outboundOffset); return d;
  }, [baseDate, outboundOffset]);

  const returnDate = useMemo(() => {
    const d = new Date(returnBaseDate); d.setDate(d.getDate() + returnOffset); return d;
  }, [returnBaseDate, returnOffset]);

  // Hooks Supabase pour chaque direction
  const { slots: outboundSlots, isLoading: loadingOut } = useSupabaseSlots(from, to, outboundDate, route);
  const { slots: returnSlots, isLoading: loadingRet } = useSupabaseSlots(to, from, returnDate, returnRoute ?? undefined);

  useEffect(() => {
    const interval = setInterval(() => setViewingCount(Math.floor(Math.random() * 18) + 8), 30000);
    return () => clearInterval(interval);
  }, []);

  const outboundMinPrice = useMemo(() => {
    const a = outboundSlots.filter(s => s.seatsLeft > 0);
    return a.length > 0 ? Math.min(...a.map(s => s.price)) : 0;
  }, [outboundSlots]);

  const returnMinPrice = useMemo(() => {
    const a = returnSlots.filter(s => s.seatsLeft > 0);
    return a.length > 0 ? Math.min(...a.map(s => s.price)) : 0;
  }, [returnSlots]);

  const outPrice = selectedOutbound?.price || 0;
  const retPrice = selectedReturn?.price || 0;
  const subtotal = outPrice + retPrice;
  const roundTripDiscount = isRoundTrip && selectedOutbound && selectedReturn ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal - roundTripDiscount;
  const canContinue = isRoundTrip ? !!(selectedOutbound && selectedReturn) : !!selectedOutbound;

  // ── Colonne 3 jours ────────────────────────────────────────
  const renderColumn = (
    direction: 'outbound' | 'return',
    routeData: VanRoute,
    currentSlots: TimeSlotData[],
    currentMinPrice: number,
    selected: TimeSlotData | null,
    onSelect: (s: TimeSlotData) => void,
    date: Date,
    offset: number,
    setOffset: (o: number) => void,
    fromCity: string,
    toCity: string,
    isLoading: boolean,
  ) => {
    const visibleDays = [-1, 0, 1].map(i => {
      const d = new Date(date); d.setDate(d.getDate() + i); return d;
    });

    const lastMinuteCount = currentSlots.filter(s => s.isLastMinute && s.seatsLeft > 0).length;
    const hasLiveData = currentSlots.some(s => s.fromSupabase);

    return (
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="bg-slate-800 rounded-t-xl px-4 py-3">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-2">
              <Bus className="w-4 h-4 text-white/70" />
              <p className="text-sm font-bold text-white">{fromCity} → {toCity}</p>
            </div>
            <div className="flex items-center gap-2">
              {hasLiveData && (
                <span style={{ fontSize: 9, fontWeight: 700, color: '#4ADE80', background: 'rgba(74,222,128,0.15)', padding: '2px 6px', borderRadius: 20 }}>
                  ● LIVE
                </span>
              )}
              {lastMinuteCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#EF4444', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                  <Zap style={{ width: 10, height: 10 }} />
                  {lastMinuteCount} last-min
                </div>
              )}
            </div>
          </div>
          <p className="text-[11px] text-white/50">👁 {viewingCount} personnes consultent ce trajet</p>
          <div className="mt-2 h-px bg-white/10" />
        </div>
        {showUrgencyMessage && (
          <div className="px-1 pt-2">
            <UrgencyMessage
              searchCount={searchCount}
              route={`${fromCity} → ${toCity}`}
              seatsLeft={Math.min(...currentSlots.filter(s => s.seatsLeft > 0).map(s => s.seatsLeft).concat([99]))}
            />
          </div>
        )}


        {/* Grille 3 jours */}
        <div className="bg-white border-x border-b border-gray-200 rounded-b-xl overflow-hidden">
          <div className="flex items-stretch">
            <button onClick={() => setOffset(offset - 1)} className="px-1.5 flex items-center justify-center hover:bg-gray-50 transition-colors border-r border-gray-200" style={{ color: GOLD }}>
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 grid grid-cols-3 divide-x divide-gray-200">
              {visibleDays.map((d, dayIdx) => {
                const isoDate = d.toISOString().slice(0, 10);
                const isCurrent = dayIdx === 1;

                // Filtrer les slots pour ce jour
                const daySlots = isCurrent
                  ? currentSlots
                  : markLowest(
                      direction === 'outbound'
                        ? generateFallbackSlots(routeData, d)
                        : generateFallbackSlots(routeData, d)
                    );
                const dayMinPrice = (() => {
                  const a = daySlots.filter(s => s.seatsLeft > 0);
                  return a.length > 0 ? Math.min(...a.map(s => s.price)) : 0;
                })();
                const maxRows = Math.max(daySlots.length, 1);

                return (
                  <div key={d.toISOString()} className="flex flex-col">
                    <button
                      onClick={() => setOffset(offset + dayIdx - 1)}
                      className={`py-2.5 px-1 text-center transition-colors ${isCurrent ? 'bg-amber-50' : 'bg-gray-50 hover:bg-gray-100'}`}
                    >
                      <div className={`text-xs font-medium ${isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                        {DAYS_FR_SHORT[d.getDay()].toLowerCase()}
                      </div>
                      <div className={`text-sm font-bold leading-tight ${isCurrent ? 'text-gray-900' : 'text-gray-700'}`}>
                        {d.getDate()} {MONTHS_FR[d.getMonth()]}
                      </div>
                      <div className="mx-auto mt-1 w-6 h-0.5 rounded-full" style={{ backgroundColor: isCurrent ? GOLD : 'transparent' }} />
                    </button>

                    <div className="p-2 space-y-2 flex-1 bg-white">
                      {isLoading && isCurrent ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="rounded-md border border-gray-100 min-h-[150px] animate-pulse bg-gray-50" />
                        ))
                      ) : daySlots.length === 0 ? (
                        <div className="rounded-md border border-dashed border-gray-200 min-h-[150px] flex items-center justify-center text-xs text-gray-400">
                          Aucun créneau
                        </div>
                      ) : (
                        daySlots.map(slot => (
                          <SlotCard
                            key={slot.id}
                            slot={slot}
                            minPrice={dayMinPrice}
                            isSelected={selected?.id === slot.id}
                            onSelect={() => {
                              if (slot.seatsLeft === 0) return;
                              onSelect(slot);
                              if (!isCurrent) setOffset(offset + dayIdx - 1);
                            }}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={() => setOffset(offset + 1)} className="px-1.5 flex items-center justify-center hover:bg-gray-50 transition-colors border-l border-gray-200" style={{ color: GOLD }}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Panier ────────────────────────────────────────────────
  const renderCart = (sticky?: boolean) => (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden ${sticky ? 'sticky top-4' : ''}`}>
      <div className="px-5 py-4 border-b border-gray-100" style={{ backgroundColor: `${GOLD}10` }}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Panier</h3>
          <span className="text-lg font-black text-gray-900">CHF {total.toFixed(2)}</span>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <p className="text-xs font-bold text-gray-500 mb-1">{from} → {to}</p>
          {selectedOutbound ? (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <p className="text-xs font-bold text-emerald-800">
                  {formatDateLabel(new Date(selectedOutbound.date))} · {selectedOutbound.departure}→{selectedOutbound.arrival}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-gray-900">CHF {selectedOutbound.price}.00</p>
                {selectedOutbound.isLastMinute && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', background: '#FEE2E2', padding: '1px 6px', borderRadius: 8 }}>
                    -{selectedOutbound.lastMinuteDiscount}% last-min
                  </span>
                )}
                {selectedOutbound.fromSupabase && (
                  <span style={{ fontSize: 9, color: '#22C55E', fontWeight: 600 }}>● Live</span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">→ Aucun trajet sélectionné</p>
          )}
        </div>

        {isRoundTrip && (
          <div>
            <p className="text-xs font-bold text-gray-500 mb-1">{to} → {from}</p>
            {selectedReturn ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <p className="text-xs font-bold text-emerald-800">
                    {formatDateLabel(new Date(selectedReturn.date))} · {selectedReturn.departure}→{selectedReturn.arrival}
                  </p>
                </div>
                <p className="text-sm font-black text-gray-900">CHF {selectedReturn.price}.00</p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">→ Aucun trajet sélectionné</p>
            )}
          </div>
        )}

        {roundTripDiscount > 0 && (
          <div className="flex justify-between text-xs text-emerald-600 font-medium border-t border-gray-100 pt-3">
            <span>Remise aller-retour -5%</span>
            <span>-CHF {roundTripDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-900">TOTAL</span>
            <span className="text-xl font-black text-gray-900">CHF {total.toFixed(2)}</span>
          </div>
        </div>

        {selectedOutbound && (
          <PriceGuaranteeBanner guarantee={priceGuarantee} onDismiss={cancelPriceGuarantee} />
        )}

        <Button
          disabled={!canContinue}
          onClick={() => {
            cancelPriceGuarantee();
            dismissCart();
            const p = new URLSearchParams(searchParams);
            if (selectedOutbound) {
              p.set('price', String(selectedOutbound.price));
              p.set('time', selectedOutbound.departure);
              p.set('arrivalTime', selectedOutbound.arrival);
              if (selectedOutbound.slotDbId) p.set('slotId', selectedOutbound.slotDbId);
            }
            if (selectedReturn) {
              p.set('returnTime', selectedReturn.departure);
              p.set('returnArrivalTime', selectedReturn.arrival);
              if (selectedReturn.slotDbId) p.set('returnSlotId', selectedReturn.slotDbId);
            }
            navigate(`/caby/van/pack?${p}`);
          }}
          className="w-full h-11 rounded-xl text-white font-bold text-sm disabled:opacity-40 shadow-lg"
          style={{ backgroundColor: canContinue ? GOLD : undefined }}>
          Continuer →
        </Button>

        <div className="pt-3 border-t border-gray-100">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Que comprend le prix ?</p>
          <div className="space-y-1.5 text-[11px]">
            {[
              { label: 'Prix du siège', included: true },
              { label: '1 bagage cabine', included: true },
              { label: 'Grande valise', included: false },
              { label: 'Choix du siège', included: false },
              { label: 'Annulation flex', included: false },
              { label: 'Assurance trajet', included: false },
            ].map(item => (
              <div key={item.label} className="flex justify-between">
                <span className="text-gray-600">{item.label}</span>
                <span className={item.included ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                  {item.included ? '✓' : 'Supplément'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {canContinue && (
          <div className="space-y-1.5 pt-3 border-t border-gray-100">
            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <Check className="w-3 h-3" /> Annulation gratuite 24h
            </p>
            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <Check className="w-3 h-3" /> Assurance trajet disponible
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <BookingStepper currentStep={0} />

      {hasAbandonedCart && cart && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <AbandonedCartBanner
            cart={cart}
            onRestore={() => {
              const saved = restoreCart();
              if (!saved?.outbound) return;
              const p = new URLSearchParams(searchParams);
              p.set('from', saved.outbound.from);
              p.set('to', saved.outbound.to);
              p.set('date', saved.outbound.date);
              navigate(`/caby/van/select?${p}`);
              dismissCart();
            }}
            onDismiss={dismissCart}
          />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 pt-4 flex justify-end">
        <button onClick={() => navigate('/caby/van')} className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
          <Edit2 className="w-3 h-3" /> Modifier la recherche
        </button>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 mb-2 px-1">Aller</h2>
            {renderColumn('outbound', route, outboundSlots, outboundMinPrice, selectedOutbound, setSelectedOutbound, baseDate, outboundOffset, setOutboundOffset, from, to, loadingOut)}
          </div>
          {isRoundTrip && returnRoute && (
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-gray-900 mb-2 px-1">Retour</h2>
              {renderColumn('return', returnRoute, returnSlots, returnMinPrice, selectedReturn, setSelectedReturn, returnBaseDate, returnOffset, setReturnOffset, to, from, loadingRet)}
            </div>
          )}
          <div className="w-[280px] flex-shrink-0">
            <div className="h-7 mb-2" />
            {renderCart(true)}
          </div>
        </div>
      </div>

      {/* MOBILE */}
      <div className="md:hidden px-4 py-4">
        {isRoundTrip && (
          <div className="flex gap-2 mb-4">
            <button onClick={() => setMobileTab('outbound')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${mobileTab === 'outbound' ? 'text-white shadow-md' : 'bg-gray-100 text-gray-600'}`} style={mobileTab === 'outbound' ? { backgroundColor: GOLD } : {}}>
              {from} → {to}{selectedOutbound && <Check className="w-3 h-3 inline ml-1" />}
            </button>
            <button onClick={() => setMobileTab('return')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${mobileTab === 'return' ? 'text-white shadow-md' : 'bg-gray-100 text-gray-600'}`} style={mobileTab === 'return' ? { backgroundColor: GOLD } : {}}>
              {to} → {from}{selectedReturn && <Check className="w-3 h-3 inline ml-1" />}
            </button>
          </div>
        )}
        {(!isRoundTrip || mobileTab === 'outbound') && (
          renderColumn('outbound', route, outboundSlots, outboundMinPrice, selectedOutbound, setSelectedOutbound, baseDate, outboundOffset, setOutboundOffset, from, to, loadingOut)
        )}
        {isRoundTrip && mobileTab === 'return' && returnRoute && (
          renderColumn('return', returnRoute, returnSlots, returnMinPrice, selectedReturn, setSelectedReturn, returnBaseDate, returnOffset, setReturnOffset, to, from, loadingRet)
        )}
      </div>

      {/* MOBILE FOOTER */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg z-30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-black text-gray-900">CHF {total.toFixed(2)}</p>
            {roundTripDiscount > 0 && <p className="text-[10px] text-emerald-600 font-medium">-5% aller-retour</p>}
          </div>
          <Button disabled={!canContinue}
            onClick={() => {
              cancelPriceGuarantee();
              dismissCart();
              const p = new URLSearchParams(searchParams);
              if (selectedOutbound) { p.set('price', String(selectedOutbound.price)); p.set('time', selectedOutbound.departure); p.set('arrivalTime', selectedOutbound.arrival); if (selectedOutbound.slotDbId) p.set('slotId', selectedOutbound.slotDbId); }
              if (selectedReturn) { p.set('returnTime', selectedReturn.departure); p.set('returnArrivalTime', selectedReturn.arrival); if (selectedReturn.slotDbId) p.set('returnSlotId', selectedReturn.slotDbId); }
              navigate(`/caby/van/pack?${p}`);
            }}
            className="h-10 px-6 rounded-xl text-white font-bold text-sm disabled:opacity-40"
            style={{ backgroundColor: canContinue ? GOLD : undefined }}>
            Continuer →
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default VanSelectPage;
