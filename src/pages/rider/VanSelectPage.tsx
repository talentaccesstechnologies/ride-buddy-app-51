import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Check, Users, Luggage, CreditCard,
  Edit2, AlertTriangle, Bus, Zap, TrendingUp, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  findRoute, formatDuration, generateSlotsForRoute,
  type VanRoute, type VanSlot,
} from '@/lib/cabyVanPricing';
import {
  calculateFullPrice, calculateVanViability,
  type RouteSegment,
} from '@/utils/cabyVanPricing';
import BookingStepper from '@/components/van/BookingStepper';
import BottomNav from '@/components/rider/BottomNav';

const GOLD = '#C9A84C';
const DAYS_FR_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

// ── TYPES ──────────────────────────────────────────────────
interface TimeSlotData {
  id: string;
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
}

// ── B+C : generateDaySlots connecté au vrai moteur yield ──
function generateDaySlots(route: VanRoute, date: Date): TimeSlotData[] {
  const baseSlots = generateSlotsForRoute(route);
  const isoDate = date.toISOString().slice(0, 10);

  const slots: TimeSlotData[] = baseSlots.map((slot) => {
    const [h, m] = slot.departure.split(':').map(Number);
    const departureTime = new Date(date);
    departureTime.setHours(h, m, 0, 0);

    const pricing = calculateFullPrice(
      route.basePrice,
      slot.seatsTaken,
      slot.seatsTotal,
      departureTime,
      new Date()
    );

    return {
      id: `${slot.id}-${isoDate}`,
      departure: slot.departure,
      arrival: slot.arrivalEstimate,
      price: pricing.currentPrice,
      originalPrice: pricing.originalPrice,
      seatsLeft: Math.max(0, slot.seatsTotal - slot.seatsTaken),
      seatsTotal: slot.seatsTotal,
      isLowest: false,
      isLastMinute: pricing.isLastMinute,
      lastMinuteDiscount: pricing.discount,
      urgencyLabel: pricing.urgencyLabel,
      urgencyColor: pricing.urgencyColor,
      fillRate: pricing.fillRate,
      date: isoDate,
    };
  });

  const available = slots.filter(s => s.seatsLeft > 0);
  if (available.length > 0) {
    const minPrice = Math.min(...available.map(s => s.price));
    available.filter(s => s.price === minPrice).forEach(s => { s.isLowest = true; });
  }

  return slots;
}

function formatDateLabel(d: Date) {
  return `${DAYS_FR_SHORT[d.getDay()]}. ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
}

// ── C : Barre de remplissage inline ────────────────────────
const FillRateBar: React.FC<{ fillRate: number; seatsLeft: number }> = ({ fillRate, seatsLeft }) => {
  const color = fillRate >= 0.86 ? '#EF4444' : fillRate >= 0.57 ? GOLD : '#22C55E';
  const pct = Math.round(fillRate * 100);
  return (
    <div style={{ padding: '4px 8px 6px', background: '#F9F9F9', borderTop: '1px solid #E5E7EB' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <span style={{ fontSize: 10, color: '#6B7280', fontWeight: 500 }}>
          {seatsLeft === 0 ? '—' : `${seatsLeft} siège${seatsLeft > 1 ? 's' : ''}`}
        </span>
        {fillRate >= 0.57 && seatsLeft > 0 && (
          <span style={{ fontSize: 9, fontWeight: 700, color }}>
            {fillRate >= 0.86 ? '🔥 Presque plein' : '📈 Se remplit'}
          </span>
        )}
      </div>
      {seatsLeft > 0 && (
        <div style={{ height: 3, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.3s ease' }} />
        </div>
      )}
    </div>
  );
};

// ── B : Badge last-minute ───────────────────────────────────
const LastMinuteBadge: React.FC<{ discount: number; urgencyColor: 'green' | 'orange' | 'red' }> = ({ discount, urgencyColor }) => {
  const bg = urgencyColor === 'red' ? '#EF4444' : urgencyColor === 'orange' ? '#F97316' : GOLD;
  return (
    <div style={{
      position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
      background: bg, color: '#fff',
      fontSize: 9, fontWeight: 800,
      padding: '2px 8px', borderRadius: 10,
      boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
    }}>
      -{discount}%
    </div>
  );
};

// ── SLOT CARD ───────────────────────────────────────────────
const SlotCard: React.FC<{
  slot: TimeSlotData;
  minPrice: number;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ slot, minPrice, isSelected, onSelect }) => {
  const isSoldOut = slot.seatsLeft === 0;
  const isLowest = !isSoldOut && slot.price === minPrice;
  const showLastMinute = slot.isLastMinute && !isSoldOut && !isSelected;
  const showScarcity = slot.fillRate >= 0.86 && !isSoldOut;

  return (
    <div
      role={isSoldOut ? undefined : 'button'}
      tabIndex={isSoldOut ? -1 : 0}
      onClick={() => { if (!isSoldOut) onSelect(); }}
      onKeyDown={(e) => {
        if (isSoldOut) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); }
      }}
      className={`rounded-md overflow-hidden border transition-all ${
        isSoldOut ? 'cursor-not-allowed' : 'cursor-pointer'
      } ${
        isSelected ? 'border-transparent shadow-lg'
        : isSoldOut ? 'border-gray-200 opacity-70 bg-white'
        : showScarcity ? 'border-orange-300 bg-white hover:border-orange-400'
        : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      style={isSelected ? { boxShadow: `0 0 0 2px ${GOLD}`, position: 'relative' } : { position: 'relative' }}
    >
      {/* B : Badge last-minute */}
      {showLastMinute && (
        <LastMinuteBadge discount={slot.lastMinuteDiscount} urgencyColor={slot.urgencyColor} />
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
        aria-hidden={!(isLowest && !isSelected)}
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
            {/* B : Prix barré si last-minute */}
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
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-base font-bold"
                  style={{ backgroundColor: GOLD }}
                >+</span>
              )}
            </div>
            {/* B : Label urgence */}
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

      {/* C : Barre de remplissage */}
      <FillRateBar fillRate={slot.fillRate} seatsLeft={slot.seatsLeft} />
    </div>
  );
};

// ── MAIN PAGE ───────────────────────────────────────────────
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

  useEffect(() => {
    const interval = setInterval(() => {
      setViewingCount(Math.floor(Math.random() * 18) + 8);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const outboundDate = useMemo(() => {
    const d = new Date(baseDate); d.setDate(d.getDate() + outboundOffset); return d;
  }, [baseDate, outboundOffset]);

  const returnDate = useMemo(() => {
    const d = new Date(returnBaseDate); d.setDate(d.getDate() + returnOffset); return d;
  }, [returnBaseDate, returnOffset]);

  const outboundSlots = useMemo(() => route ? generateDaySlots(route, outboundDate) : [], [route, outboundDate]);
  const returnSlots = useMemo(() => returnRoute ? generateDaySlots(returnRoute, returnDate) : [], [returnRoute, returnDate]);

  const outboundMinPrice = useMemo(() => {
    const available = outboundSlots.filter(s => s.seatsLeft > 0);
    return available.length > 0 ? Math.min(...available.map(s => s.price)) : 0;
  }, [outboundSlots]);

  const returnMinPrice = useMemo(() => {
    const available = returnSlots.filter(s => s.seatsLeft > 0);
    return available.length > 0 ? Math.min(...available.map(s => s.price)) : 0;
  }, [returnSlots]);

  const outPrice = selectedOutbound?.price || 0;
  const retPrice = selectedReturn?.price || 0;
  const subtotal = outPrice + retPrice;
  const roundTripDiscount = isRoundTrip && selectedOutbound && selectedReturn ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal - roundTripDiscount;
  const canContinue = isRoundTrip ? !!(selectedOutbound && selectedReturn) : !!selectedOutbound;

  const renderColumn = (
    direction: 'outbound' | 'return',
    routeData: VanRoute,
    _slots: TimeSlotData[],
    _minPrice: number,
    selected: TimeSlotData | null,
    onSelect: (s: TimeSlotData) => void,
    date: Date,
    offset: number,
    setOffset: (o: number) => void,
    fromCity: string,
    toCity: string,
  ) => {
    const visibleDays = [-1, 0, 1].map(i => {
      const d = new Date(date); d.setDate(d.getDate() + i); return d;
    });

    const dayData = visibleDays.map(d => {
      const slots = generateDaySlots(routeData, d);
      const available = slots.filter(s => s.seatsLeft > 0);
      const minPrice = available.length > 0 ? Math.min(...available.map(s => s.price)) : 0;
      return { date: d, slots, minPrice };
    });

    const maxRows = Math.max(...dayData.map(dd => dd.slots.length), 1);

    // B : Compter les deals last-minute du jour central
    const lastMinuteCount = dayData[1].slots.filter(s => s.isLastMinute && s.seatsLeft > 0).length;

    return (
      <div className="flex-1 min-w-0">
        <div className="bg-slate-800 rounded-t-xl px-4 py-3">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-2">
              <Bus className="w-4 h-4 text-white/70" />
              <p className="text-sm font-bold text-white">{fromCity} → {toCity}</p>
            </div>
            {/* B : Badge last-minute si des deals existent */}
            {lastMinuteCount > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: '#EF4444', borderRadius: 20,
                padding: '2px 8px', fontSize: 10, fontWeight: 700, color: '#fff',
              }}>
                <Zap style={{ width: 10, height: 10 }} />
                {lastMinuteCount} last-minute
              </div>
            )}
          </div>
          <p className="text-[11px] text-white/50">
            👁 {viewingCount} personnes consultent ce trajet
          </p>
          <div className="mt-2 h-px bg-white/10" />
        </div>

        <div className="bg-white border-x border-b border-gray-200 rounded-b-xl overflow-hidden">
          <div className="flex items-stretch">
            <button
              onClick={() => setOffset(offset - 1)}
              className="px-1.5 flex items-center justify-center hover:bg-gray-50 transition-colors border-r border-gray-200"
              aria-label="Jour précédent"
              style={{ color: GOLD }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 grid grid-cols-3 divide-x divide-gray-200">
              {dayData.map((dd, dayIdx) => {
                const isCurrent = dayIdx === 1;
                return (
                  <div key={dd.date.toISOString()} className="flex flex-col">
                    <button
                      onClick={() => setOffset(offset + dayIdx - 1)}
                      className={`py-2.5 px-1 text-center transition-colors ${
                        isCurrent ? 'bg-amber-50' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`text-xs font-medium ${isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                        {DAYS_FR_SHORT[dd.date.getDay()].toLowerCase()}
                      </div>
                      <div className={`text-sm font-bold leading-tight ${isCurrent ? 'text-gray-900' : 'text-gray-700'}`}>
                        {dd.date.getDate()} {MONTHS_FR[dd.date.getMonth()]}
                      </div>
                      <div
                        className="mx-auto mt-1 w-6 h-0.5 rounded-full"
                        style={{ backgroundColor: isCurrent ? GOLD : 'transparent' }}
                        aria-hidden
                      />
                    </button>

                    <div className="p-2 space-y-2 flex-1 bg-white">
                      {Array.from({ length: maxRows }).map((_, rowIdx) => {
                        const slot = dd.slots[rowIdx];
                        if (!slot) {
                          return (
                            <div key={`empty-${rowIdx}`} className="rounded-md border border-dashed border-gray-200 min-h-[150px]" />
                          );
                        }
                        return (
                          <SlotCard
                            key={slot.id}
                            slot={slot}
                            minPrice={dd.minPrice}
                            isSelected={selected?.id === slot.id}
                            onSelect={() => {
                              if (slot.seatsLeft === 0) return;
                              onSelect(slot);
                              if (!isCurrent) setOffset(offset + dayIdx - 1);
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setOffset(offset + 1)}
              className="px-1.5 flex items-center justify-center hover:bg-gray-50 transition-colors border-l border-gray-200"
              aria-label="Jour suivant"
              style={{ color: GOLD }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

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
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black text-gray-900">CHF {selectedReturn.price}.00</p>
                  {selectedReturn.isLastMinute && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', background: '#FEE2E2', padding: '1px 6px', borderRadius: 8 }}>
                      -{selectedReturn.lastMinuteDiscount}% last-min
                    </span>
                  )}
                </div>
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

        <Button
          disabled={!canContinue}
          onClick={() => {
            const p = new URLSearchParams(searchParams);
            if (selectedOutbound) {
              p.set('price', String(selectedOutbound.price));
              p.set('time', selectedOutbound.departure);
              p.set('arrivalTime', selectedOutbound.arrival);
            }
            if (selectedReturn) {
              p.set('returnTime', selectedReturn.departure);
              p.set('returnArrivalTime', selectedReturn.arrival);
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

      <div className="max-w-6xl mx-auto px-4 pt-4 flex justify-end">
        <button onClick={() => navigate('/caby/van')}
          className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
          <Edit2 className="w-3 h-3" /> Modifier la recherche
        </button>
      </div>

      <div className="hidden md:block max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 mb-2 px-1">Aller</h2>
            {renderColumn('outbound', route, outboundSlots, outboundMinPrice, selectedOutbound, setSelectedOutbound, baseDate, outboundOffset, setOutboundOffset, from, to)}
          </div>
          {isRoundTrip && returnRoute && (
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-gray-900 mb-2 px-1">Retour</h2>
              {renderColumn('return', returnRoute, returnSlots, returnMinPrice, selectedReturn, setSelectedReturn, returnBaseDate, returnOffset, setReturnOffset, to, from)}
            </div>
          )}
          <div className="w-[280px] flex-shrink-0">
            <div className="h-7 mb-2" />
            {renderCart(true)}
          </div>
        </div>
      </div>

      <div className="md:hidden px-4 py-4">
        {isRoundTrip && (
          <div className="flex gap-2 mb-4">
            <button onClick={() => setMobileTab('outbound')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${mobileTab === 'outbound' ? 'text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
              style={mobileTab === 'outbound' ? { backgroundColor: GOLD } : {}}>
              {from} → {to}{selectedOutbound && <Check className="w-3 h-3 inline ml-1" />}
            </button>
            <button onClick={() => setMobileTab('return')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${mobileTab === 'return' ? 'text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
              style={mobileTab === 'return' ? { backgroundColor: GOLD } : {}}>
              {to} → {from}{selectedReturn && <Check className="w-3 h-3 inline ml-1" />}
            </button>
          </div>
        )}
        {(!isRoundTrip || mobileTab === 'outbound') && route && (
          renderColumn('outbound', route, outboundSlots, outboundMinPrice, selectedOutbound, setSelectedOutbound, baseDate, outboundOffset, setOutboundOffset, from, to)
        )}
        {isRoundTrip && mobileTab === 'return' && returnRoute && (
          renderColumn('return', returnRoute, returnSlots, returnMinPrice, selectedReturn, setSelectedReturn, returnBaseDate, returnOffset, setReturnOffset, to, from)
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-32 md:pb-12">
        <div className="mt-6 space-y-6 text-[13px] leading-relaxed text-gray-600">
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-2">Documents d'identité et conseils de voyage</h3>
            <p>Il est de votre responsabilité de vérifier la validité de votre pièce d'identité (carte d'identité ou passeport) avant tout trajet transfrontalier. Pour les liaisons France ↔ Suisse, un document d'identité en cours de validité est exigé.</p>
            <p className="mt-2">Si vous voyagez avec un passeport non européen, consultez les conditions d'entrée applicables à l'Espace Schengen avant votre départ.</p>
          </section>
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-2">Renseignements sur nos tarifs</h3>
            <p>Les réservations annulées dans les 24 heures suivant l'achat sont remboursables, après déduction des frais d'annulation. Au-delà de 24 heures, les réservations ne sont pas remboursables, mais peuvent être modifiées sous réserve des frais applicables (voir l'option <strong>Annulation Flex</strong>).</p>
            <p className="mt-2">Toutes les heures de départ et d'arrivée correspondent à l'heure locale du point d'embarquement sélectionné. Sauf indication contraire, les trajets affichés sont opérés par <strong>Talent Access Technologies SA</strong> ou par l'un de ses partenaires agréés VTC à Genève.</p>
          </section>
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-2">Suppléments et frais</h3>
            <p>Les paiements sont traités en CHF. Les détenteurs de cartes bancaires non suisses peuvent se voir appliquer des frais de change ou de paiement à l'étranger par leur banque émettrice. <strong>Twint</strong>, <strong>Apple Pay</strong> et <strong>Google Pay</strong> sont acceptés sans frais supplémentaires.</p>
          </section>
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-2">Informations sur les tarifs standard</h3>
            <p>Tous les prix sont indiqués pour <strong>un adulte et un trajet simple</strong>, taxes et frais inclus. Un petit bagage cabine est compris dans le tarif.</p>
          </section>
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-2">Flex Pass</h3>
            <p>Avec l'option <strong>Annulation Flexible</strong> (+CHF 9), vous pouvez modifier la date, l'heure ou le point de départ de votre trajet sans frais de changement jusqu'à <strong>2 heures avant le départ</strong>, sous réserve de disponibilité.</p>
          </section>
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-2">Bagages et suppléments</h3>
            <p>Quel que soit le tarif choisi, vous pouvez emporter un petit bagage cabine (max. 45 × 36 × 20 cm). Les grandes valises doivent être ajoutées à la réservation moyennant un supplément.</p>
          </section>
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-2">Conseils pour les trajets transfrontaliers</h3>
            <p>Pour les trajets entre la Suisse et la France, prévoyez du temps supplémentaire en cas de contrôle douanier.</p>
          </section>
          <p className="text-[11px] text-gray-400 pt-4 border-t border-gray-200">
            Caby est une marque exploitée par Talent Access Technologies SA, Genève. © {new Date().getFullYear()} — Tous droits réservés.
          </p>
        </div>
      </div>

      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg z-30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-black text-gray-900">CHF {total.toFixed(2)}</p>
            {roundTripDiscount > 0 && <p className="text-[10px] text-emerald-600 font-medium">-5% aller-retour</p>}
          </div>
          <Button disabled={!canContinue}
            onClick={() => {
              const p = new URLSearchParams(searchParams);
              if (selectedOutbound) { p.set('price', String(selectedOutbound.price)); p.set('time', selectedOutbound.departure); p.set('arrivalTime', selectedOutbound.arrival); }
              if (selectedReturn) { p.set('returnTime', selectedReturn.departure); p.set('returnArrivalTime', selectedReturn.arrival); }
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
