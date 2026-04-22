import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Check, Users, Luggage, CreditCard,
  Edit2, AlertTriangle, Bus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  findRoute, formatDuration, generateSlotsForRoute,
  type VanRoute, type VanSlot,
} from '@/lib/cabyVanPricing';
import BookingStepper from '@/components/van/BookingStepper';
import BottomNav from '@/components/rider/BottomNav';

const GOLD = '#C9A84C';
const DAYS_FR_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

interface TimeSlotData {
  id: string;
  departure: string;
  arrival: string;
  price: number;
  seatsLeft: number;
  seatsTotal: number;
  isLowest: boolean;
}

function generateDaySlots(route: VanRoute, date: Date): TimeSlotData[] {
  const baseSlots = generateSlotsForRoute(route);
  const dayOfWeek = date.getDay();
  const daysUntil = Math.max(0, Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  // Vary seats/prices by day for realism
  const seed = date.getDate() + dayOfWeek * 7;
  const slots: TimeSlotData[] = baseSlots.map((slot, i) => {
    const seatVariation = ((seed + i) % 4);
    const seatsLeft = Math.max(0, 7 - slot.seatsTaken - seatVariation + 2);
    const priceMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.10 : dayOfWeek === 5 ? 1.15 : 0.95;
    const earlyBird = daysUntil >= 14 ? 0.85 : 1;
    const price = Math.round(slot.basePrice * priceMultiplier * earlyBird);
    return {
      id: `${slot.id}-${date.toISOString().slice(0, 10)}`,
      departure: slot.departure,
      arrival: slot.arrivalEstimate,
      price,
      seatsLeft: Math.min(7, Math.max(0, seatsLeft)),
      seatsTotal: 7,
      isLowest: false,
    };
  });

  // Mark lowest price
  const availableSlots = slots.filter(s => s.seatsLeft > 0);
  if (availableSlots.length > 0) {
    const minPrice = Math.min(...availableSlots.map(s => s.price));
    availableSlots.filter(s => s.price === minPrice).forEach(s => { s.isLowest = true; });
  }

  return slots;
}

function getBadge(price: number, minPriceOfDay: number, seatsLeft: number) {
  if (seatsLeft === 0) return { label: 'COMPLET', color: 'bg-gray-200 text-gray-500' };
  if (price === minPriceOfDay) return { label: 'PRIX LE PLUS BAS', color: 'bg-orange-100 text-orange-700' };
  if (seatsLeft <= 1) return { label: '⚠️ Dernier siège', color: 'bg-red-100 text-red-700' };
  if (seatsLeft <= 3) return { label: `${seatsLeft} sièges disponibles`, color: 'bg-amber-100 text-amber-700' };
  return null;
}

function formatDateLabel(d: Date) {
  return `${DAYS_FR_SHORT[d.getDay()]}. ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
}

// (DayNavigator removed — day columns are now rendered inline in renderColumn)

// ── SLOT CARD (EasyJet-style, compact) ──
const SlotCard: React.FC<{
  slot: TimeSlotData;
  minPrice: number;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ slot, minPrice, isSelected, onSelect }) => {
  const isSoldOut = slot.seatsLeft === 0;
  const isLowest = !isSoldOut && slot.price === minPrice;

  return (
    <div
      className={`rounded-md overflow-hidden border transition-all ${
        isSelected
          ? 'border-transparent shadow-lg'
          : isSoldOut
          ? 'border-gray-200 opacity-70 bg-white'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      style={isSelected ? { boxShadow: `0 0 0 2px ${GOLD}` } : {}}
    >
      {/* Dark header: Départ / Arrivée (always dark, even when selected — like EasyJet) */}
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

      {/* Lowest price ribbon (hidden when selected to keep the gold body clean) */}
      {isLowest && !isSelected && (
        <div
          className="text-white text-[10px] font-bold text-center py-1 tracking-wider"
          style={{ backgroundColor: GOLD }}
        >
          PRIX LE PLUS BAS
        </div>
      )}

      {/* Body — turns GOLD when selected (EasyJet style) */}
      <div
        className="px-3 py-3 min-h-[80px] flex flex-col items-center justify-center text-center transition-colors"
        style={isSelected ? { backgroundColor: GOLD } : {}}
      >
        {isSoldOut ? (
          <p className="text-sm font-bold text-gray-500 py-3">Complet</p>
        ) : (
          <button
            onClick={onSelect}
            className="w-full flex items-center justify-center gap-2"
          >
            <span
              className={`text-base font-black ${
                isSelected ? 'text-white' : 'text-gray-900'
              }`}
            >
              CHF {slot.price}.00
            </span>
            {isSelected ? (
              <Check
                className="w-5 h-5 text-white"
                strokeWidth={3}
              />
            ) : (
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-base font-bold"
                style={{ backgroundColor: GOLD }}
              >
                +
              </span>
            )}
          </button>
        )}
      </div>

      {/* Footer: seats availability */}
      <div
        className={`px-3 py-1.5 text-center ${
          isSelected ? 'bg-gray-200' : 'bg-gray-100'
        }`}
      >
        <span className="text-[10px] font-medium text-gray-600">
          {isSoldOut
            ? '—'
            : `${slot.seatsLeft} siège${slot.seatsLeft > 1 ? 's' : ''} disponible${slot.seatsLeft > 1 ? 's' : ''}`}
        </span>
      </div>
    </div>
  );
};

// ── MAIN PAGE ──
const VanSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const from = searchParams.get('from') || 'Genève';
  const to = searchParams.get('to') || 'Zurich';
  const dateStr = searchParams.get('date') || '';
  const returnDateStr = searchParams.get('returnDate') || '';
  const passengers = parseInt(searchParams.get('passengers') || '1');
  const isRoundTrip = !!returnDateStr;

  // Fallback synthétique si la paire n'existe pas dans la base prédéfinie
  const buildSyntheticRoute = (f: string, t: string): VanRoute => ({
    id: 0,
    from: f,
    to: t,
    duration: 90,
    basePrice: 49,
    segment: 'business',
    flag: '🇨🇭',
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

  // Simulated "people viewing" counter
  useEffect(() => {
    const interval = setInterval(() => {
      setViewingCount(Math.floor(Math.random() * 18) + 8);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const outboundDate = useMemo(() => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + outboundOffset);
    return d;
  }, [baseDate, outboundOffset]);

  const returnDate = useMemo(() => {
    const d = new Date(returnBaseDate);
    d.setDate(d.getDate() + returnOffset);
    return d;
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

  // Cart calculation
  const outPrice = selectedOutbound?.price || 0;
  const retPrice = selectedReturn?.price || 0;
  const subtotal = outPrice + retPrice;
  const roundTripDiscount = isRoundTrip && selectedOutbound && selectedReturn ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal - roundTripDiscount;

  const canContinue = isRoundTrip ? !!(selectedOutbound && selectedReturn) : !!selectedOutbound;

  // (Plus de garde "Route non trouvée" : on génère toujours une route synthétique de fallback)


  // ── COLUMN CONTENT (EasyJet-style 3-day grid) ──
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
    // Build 3 visible days (previous/current/next)
    const visibleDays = [-1, 0, 1].map(i => {
      const d = new Date(date);
      d.setDate(d.getDate() + i);
      return d;
    });

    // For each day, generate its slots and min price
    const dayData = visibleDays.map(d => {
      const slots = generateDaySlots(routeData, d);
      const available = slots.filter(s => s.seatsLeft > 0);
      const minPrice = available.length > 0 ? Math.min(...available.map(s => s.price)) : 0;
      return { date: d, slots, minPrice };
    });

    // Max number of slots across the 3 days, to align rows
    const maxRows = Math.max(...dayData.map(dd => dd.slots.length), 1);

    return (
      <div className="flex-1 min-w-0">
        {/* Dark header (route + viewers) */}
        <div className="bg-slate-800 rounded-t-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-0.5">
            <Bus className="w-4 h-4 text-white/70" />
            <p className="text-sm font-bold text-white">{fromCity} → {toCity}</p>
          </div>
          <p className="text-[11px] text-white/50">
            👁 {viewingCount} personnes consultent ce trajet
          </p>
          <div className="mt-2 h-px bg-white/10" />
        </div>

        {/* Day-grid with arrows on the sides */}
        <div className="bg-white border-x border-b border-gray-200 rounded-b-xl overflow-hidden">
          <div className="flex items-stretch">
            {/* Left arrow */}
            <button
              onClick={() => setOffset(offset - 1)}
              className="px-1.5 flex items-center justify-center hover:bg-gray-50 transition-colors border-r border-gray-200"
              aria-label="Jour précédent"
              style={{ color: GOLD }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* 3 day columns */}
            <div className="flex-1 grid grid-cols-3 divide-x divide-gray-200">
              {dayData.map((dd, dayIdx) => {
                const isCurrent = dayIdx === 1;
                return (
                  <div key={dd.date.toISOString()} className="flex flex-col">
                    {/* Day header */}
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
                      {isCurrent && (
                        <div
                          className="mx-auto mt-1 w-6 h-0.5 rounded-full"
                          style={{ backgroundColor: GOLD }}
                        />
                      )}
                    </button>

                    {/* Slots stacked for this day */}
                    <div className="p-2 space-y-2 flex-1 bg-white">
                      {Array.from({ length: maxRows }).map((_, rowIdx) => {
                        const slot = dd.slots[rowIdx];
                        if (!slot) {
                          return (
                            <div
                              key={`empty-${rowIdx}`}
                              className="rounded-md border border-dashed border-gray-200 min-h-[150px]"
                            />
                          );
                        }
                        return (
                          <SlotCard
                            key={slot.id}
                            slot={slot}
                            minPrice={dd.minPrice}
                            isSelected={selected?.id === slot.id && isCurrent}
                            onSelect={() => {
                              if (slot.seatsLeft === 0) return;
                              if (!isCurrent) setOffset(offset + dayIdx - 1);
                              onSelect(slot);
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right arrow */}
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

  // ── SIDEBAR CART ──
  const renderCart = (sticky?: boolean) => (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden ${sticky ? 'sticky top-4' : ''}`}>
      <div className="px-5 py-4 border-b border-gray-100" style={{ backgroundColor: `${GOLD}10` }}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Panier</h3>
          <span className="text-lg font-black text-gray-900">CHF {total.toFixed(2)}</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Outbound */}
        <div>
          <p className="text-xs font-bold text-gray-500 mb-1">{from} → {to}</p>
          {selectedOutbound ? (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <p className="text-xs font-bold text-emerald-800">
                  {formatDateLabel(outboundDate)} · {selectedOutbound.departure}→{selectedOutbound.arrival}
                </p>
              </div>
              <p className="text-sm font-black text-gray-900">CHF {selectedOutbound.price}.00</p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">→ Aucun trajet sélectionné</p>
          )}
        </div>

        {/* Return */}
        {isRoundTrip && (
          <div>
            <p className="text-xs font-bold text-gray-500 mb-1">{to} → {from}</p>
            {selectedReturn ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <p className="text-xs font-bold text-emerald-800">
                    {formatDateLabel(returnDate)} · {selectedReturn.departure}→{selectedReturn.arrival}
                  </p>
                </div>
                <p className="text-sm font-black text-gray-900">CHF {selectedReturn.price}.00</p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">→ Aucun trajet sélectionné</p>
            )}
          </div>
        )}

        {/* Discount */}
        {roundTripDiscount > 0 && (
          <div className="flex justify-between text-xs text-emerald-600 font-medium border-t border-gray-100 pt-3">
            <span>Remise aller-retour -5%</span>
            <span>-CHF {roundTripDiscount.toFixed(2)}</span>
          </div>
        )}

        {/* Total */}
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

        {/* What's included */}
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

      {/* MODIFY LINK */}
      <div className="max-w-6xl mx-auto px-4 pt-4 flex justify-end">
        <button onClick={() => navigate('/caby/van')}
          className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
          <Edit2 className="w-3 h-3" /> Modifier la recherche
        </button>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-4">
          {/* Outbound block */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 mb-2 px-1">Aller</h2>
            {renderColumn('outbound', route, outboundSlots, outboundMinPrice, selectedOutbound, setSelectedOutbound, baseDate, outboundOffset, setOutboundOffset, from, to)}
          </div>

          {/* Return block (if round trip) */}
          {isRoundTrip && returnRoute && (
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-gray-900 mb-2 px-1">Retour</h2>
              {renderColumn('return', returnRoute, returnSlots, returnMinPrice, selectedReturn, setSelectedReturn, returnBaseDate, returnOffset, setReturnOffset, to, from)}
            </div>
          )}

          {/* Sidebar — Cart */}
          <div className="w-[280px] flex-shrink-0">
            <div className="h-7 mb-2" />
            {renderCart(true)}
          </div>
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="md:hidden px-4 py-4">
        {/* Tabs */}
        {isRoundTrip && (
          <div className="flex gap-2 mb-4">
            <button onClick={() => setMobileTab('outbound')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${mobileTab === 'outbound' ? 'text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
              style={mobileTab === 'outbound' ? { backgroundColor: GOLD } : {}}>
              {from} → {to}
              {selectedOutbound && <Check className="w-3 h-3 inline ml-1" />}
            </button>
            <button onClick={() => setMobileTab('return')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${mobileTab === 'return' ? 'text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
              style={mobileTab === 'return' ? { backgroundColor: GOLD } : {}}>
              {to} → {from}
              {selectedReturn && <Check className="w-3 h-3 inline ml-1" />}
            </button>
          </div>
        )}

        {/* Content */}
        {(!isRoundTrip || mobileTab === 'outbound') && route && (
          renderColumn('outbound', route, outboundSlots, outboundMinPrice, selectedOutbound, setSelectedOutbound, baseDate, outboundOffset, setOutboundOffset, from, to)
        )}
        {isRoundTrip && mobileTab === 'return' && returnRoute && (
          renderColumn('return', returnRoute, returnSlots, returnMinPrice, selectedReturn, setSelectedReturn, returnBaseDate, returnOffset, setReturnOffset, to, from)
        )}
      </div>

      {/* MOBILE STICKY FOOTER */}
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
