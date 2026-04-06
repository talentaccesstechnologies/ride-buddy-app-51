import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Leaf, Users, Clock, MapPin, Luggage, Bike, QrCode, Check, X,
  CreditCard, Star, ChevronLeft, ChevronRight, Search, Percent, Zap, Shield, Car, SlidersHorizontal, Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  cabyVanRoutes, ROUTES, ALL_CITIES, findRoute, getDestinationsFrom, generateSlotsForRoute,
  formatDuration, SEGMENT_META,
  type VanSlot, type VanRoute, type SegmentFilter,
} from '@/lib/cabyVanPricing';
import BottomNav from '@/components/rider/BottomNav';
import heroImg from '@/assets/van-hero-alps.jpg';
import {
  calculateLastMinuteDiscount, applyLastMinutePrice, formatCountdown,
  generateSimulatedDeals, type LastMinuteDeal,
} from '@/utils/lastMinutePricing';
import {
  calculateFullPrice, generateFlashDeals, calculateAncillaryTotal,
  type PricingResult, type AncillaryOptions,
} from '@/utils/cabyVanPricing';
import SeatPricingCard from '@/components/van/SeatPricingCard';
import FlashDealBanner from '@/components/van/FlashDealBanner';
import AncillarySelector from '@/components/van/AncillarySelector';
import { getPickupPoints, hasAirportSelected, type PickupPoint } from '@/lib/pickupPoints';
import { Plane } from 'lucide-react';

type Step = 'hero' | 'search' | 'results' | 'seat' | 'confirm' | 'abonnement';
type SortMode = 'price' | 'urgent' | 'earlybird';

const GOLD = '#C9A84C';

const getTimeSlots = (routeSegment: string, isWeekend: boolean, duration: number): { time: string; label: string; rushLevel: 'rush' | 'creux' | 'soiree' | 'custom' }[] => {
  const classify = (h: number): 'rush' | 'creux' | 'soiree' => {
    if ((h >= 6 && h <= 9) || (h >= 16 && h <= 19)) return 'rush';
    if (h >= 9 && h < 16) return 'creux';
    return 'soiree';
  };
  const make = (t: string) => ({ time: t, label: t, rushLevel: classify(parseInt(t)) as 'rush' | 'creux' | 'soiree' });
  let slots: { time: string; label: string; rushLevel: 'rush' | 'creux' | 'soiree' | 'custom' }[] = [];
  if (routeSegment === 'frontalier' || (routeSegment === 'pendulaire' && duration <= 60)) {
    slots = isWeekend
      ? ['08:00','10:00','12:00','14:00','16:00','18:00'].map(make)
      : ['06:00','06:30','07:00','07:30','08:00','08:30','12:00','13:00','17:00','17:30','18:00','18:30','19:00','19:30'].map(make);
  } else if (routeSegment === 'ski') {
    slots = isWeekend
      ? ['05:30','06:00','06:30','07:00','07:30','08:00','16:00','17:00','18:00','19:00'].map(make)
      : ['07:00','08:00','17:00','18:00'].map(make);
  } else if (duration > 180) {
    slots = ['06:00','07:00','08:00','14:00','15:00'].map(make);
  } else {
    slots = ['07:00','08:00','09:00','12:00','14:00','17:00','19:00'].map(make);
  }
  slots.push({ time: 'custom', label: '🕐 Heure personnalisée', rushLevel: 'custom' });
  return slots;
};

const RUSH_BADGE: Record<string, { label: string; color: string; priceNote?: string }> = {
  rush: { label: '🔴 Rush', color: 'bg-red-100 text-red-700 border-red-200' },
  creux: { label: '🟢 Creux', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', priceNote: 'Prix réduit −5%' },
  soiree: { label: '🟡 Soirée', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  custom: { label: '🕐 Libre', color: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const addMinutesToTime = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const POPULAR_DESTINATIONS = [
  { city: 'Zurich', emoji: '🏙️', price: 77, img: '🇨🇭' },
  { city: 'Verbier', emoji: '🎿', price: 59, img: '⛷️' },
  { city: 'Chamonix', emoji: '🏔️', price: 35, img: '🇫🇷' },
  { city: 'Annecy', emoji: '🏞️', price: 25, img: '🇫🇷' },
  { city: 'Lyon', emoji: '🦁', price: 49, img: '🇫🇷' },
  { city: 'Montreux', emoji: '🎵', price: 38, img: '🇨🇭' },
  { city: 'Sion', emoji: '🍷', price: 59, img: '🇨🇭' },
  { city: 'Milan', emoji: '👗', price: 95, img: '🇮🇹' },
  { city: 'Gstaad', emoji: '⭐', price: 75, img: '🇨🇭' },
  { city: 'La Chaux-de-Fonds', emoji: '⌚', price: 55, img: '🇨🇭' },
  { city: 'Annemasse', emoji: '🚗', price: 15, img: '🇫🇷' },
  { city: 'Lausanne', emoji: '🏛️', price: 29, img: '🇨🇭' },
];

const FILTER_TABS: { key: SegmentFilter; label: string; icon: string; badge?: string }[] = [
  { key: 'all', label: 'Tous', icon: '🗺️' },
  { key: 'grand_geneve', label: 'Grand Genève', icon: '🚗', badge: "112'000 frontaliers" },
  { key: 'valais', label: 'Valais & Riviera', icon: '🏔️' },
  { key: 'horlogerie', label: 'Jura & Horlogerie', icon: '⌚' },
  { key: 'pendulaire', label: 'Villes', icon: '🏙️' },
  { key: 'ski', label: 'Ski', icon: '🎿' },
  { key: 'international', label: 'International', icon: '🌍' },
  { key: 'premium', label: 'Premium', icon: '⭐' },
];

const ABONNEMENT_PLANS = [
  { name: 'Essentiel', price: 299, trips: 'Illimité sur 1 route', features: ['Réservation prioritaire', 'Badge Abonné', 'Siège garanti'] },
  { name: 'Flex', price: 449, trips: 'Illimité toutes routes Grand Genève', features: ['Tout Essentiel', 'Toutes routes frontalières', 'Annulation gratuite'] },
  { name: 'Premium', price: 599, trips: 'Illimité toutes routes', features: ['Tout Flex', 'Siège premium (avant)', 'Bagages illimités', 'Accès ski & longue distance'] },
];

const SeatButton: React.FC<{ seat: number; taken: boolean; selected: boolean; onSelect: (s: number) => void }> = ({ seat, taken, selected, onSelect }) => (
  <button disabled={taken} onClick={() => onSelect(seat)}
    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold transition-all border
      ${taken ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : ''}
      ${!taken && !selected ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : ''}
      ${selected ? 'bg-emerald-500 text-white border-emerald-400 scale-110 shadow-lg' : ''}`}>
    {taken ? <X className="w-3 h-3" /> : seat}
  </button>
);

const CabyVanPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('hero');
  const [filter, setFilter] = useState<SegmentFilter>('all');
  const carouselRef = useRef<HTMLDivElement>(null);

  const [from, setFrom] = useState('Genève');
  const [to, setTo] = useState('');
  const [dateAller, setDateAller] = useState('');
  const [timeAller, setTimeAller] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [roundTrip, setRoundTrip] = useState(false);
  const [dateRetour, setDateRetour] = useState('');
  const [timeRetour, setTimeRetour] = useState('');
  const [customTimeAller, setCustomTimeAller] = useState('');
  const [customTimeRetour, setCustomTimeRetour] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('price');

  const [selectedSlot, setSelectedSlot] = useState<VanSlot | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [ancillaries, setAncillaries] = useState<Partial<AncillaryOptions>>({});

  // Pickup / Dropoff
  const [pickupLabel, setPickupLabel] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupCustom, setPickupCustom] = useState('');
  const [dropoffLabel, setDropoffLabel] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffCustom, setDropoffCustom] = useState('');
  const [airportMode, setAirportMode] = useState<'arrival' | 'pickup'>('pickup');
  const [flightArrivalTime, setFlightArrivalTime] = useState('');

  const pickupPoints = useMemo(() => getPickupPoints(from), [from]);
  const dropoffPoints = useMemo(() => getPickupPoints(to), [to]);
  const isAirport = hasAirportSelected(pickupLabel, dropoffLabel);
  const selectedPickupIsCustom = pickupPoints.find(p => p.label === pickupLabel)?.isCustom;
  const selectedDropoffIsCustom = dropoffPoints.find(p => p.label === dropoffLabel)?.isCustom;
  const effectivePickupAddress = selectedPickupIsCustom ? pickupCustom : pickupAddress;
  const effectiveDropoffAddress = selectedDropoffIsCustom ? dropoffCustom : dropoffAddress;

  const selectedRoute = useMemo(() => (from && to ? findRoute(from, to) : undefined), [from, to]);
  const destinations = useMemo(() => getDestinationsFrom(from, filter), [from, filter]);
  const slots = useMemo(() => selectedRoute ? generateSlotsForRoute(selectedRoute) : [], [selectedRoute]);

  const isWeekendAller = useMemo(() => {
    if (!dateAller) return false;
    const d = new Date(dateAller);
    return d.getDay() === 0 || d.getDay() === 6;
  }, [dateAller]);

  const isWeekendRetour = useMemo(() => {
    if (!dateRetour) return false;
    const d = new Date(dateRetour);
    return d.getDay() === 0 || d.getDay() === 6;
  }, [dateRetour]);

  const availableTimeSlotsAller = useMemo(() => {
    if (!selectedRoute) return getTimeSlots('business', isWeekendAller, 90);
    return getTimeSlots(selectedRoute.segment, isWeekendAller, selectedRoute.duration);
  }, [selectedRoute, isWeekendAller]);

  const availableTimeSlotsRetour = useMemo(() => {
    if (!selectedRoute) return getTimeSlots('business', isWeekendRetour, 90);
    return getTimeSlots(selectedRoute.segment, isWeekendRetour, selectedRoute.duration);
  }, [selectedRoute, isWeekendRetour]);

  const effectiveTimeAller = timeAller === 'custom' ? customTimeAller : timeAller;
  const effectiveTimeRetour = timeRetour === 'custom' ? customTimeRetour : timeRetour;
  const estimatedArrivalAller = effectiveTimeAller && selectedRoute ? addMinutesToTime(effectiveTimeAller, selectedRoute.duration) : '';
  const estimatedArrivalRetour = effectiveTimeRetour && selectedRoute ? addMinutesToTime(effectiveTimeRetour, selectedRoute.duration) : '';
  const selectedAllerRush = availableTimeSlotsAller.find(s => s.time === timeAller)?.rushLevel || '';
  const selectedRetourRush = availableTimeSlotsRetour.find(s => s.time === timeRetour)?.rushLevel || '';

  const takenSeats = useMemo(() => {
    if (!selectedSlot) return [];
    return Array.from({ length: selectedSlot.seatsTaken }, (_, i) => i + 1);
  }, [selectedSlot]);

  // Build pricing for each slot
  const slotPricings = useMemo(() => {
    return slots.map(slot => {
      const depDate = new Date();
      const [h, m] = slot.departure.split(':').map(Number);
      depDate.setHours(h, m, 0, 0);
      if (depDate.getTime() < Date.now()) depDate.setDate(depDate.getDate() + 1);
      const pricing = calculateFullPrice(slot.basePrice, slot.seatsTaken, slot.seatsTotal, depDate);
      return { slot, pricing, depDate };
    });
  }, [slots]);

  // Sort
  const sortedSlots = useMemo(() => {
    const copy = [...slotPricings];
    if (sortMode === 'price') copy.sort((a, b) => a.pricing.currentPrice - b.pricing.currentPrice);
    else if (sortMode === 'urgent') copy.sort((a, b) => a.pricing.hoursUntilDeparture - b.pricing.hoursUntilDeparture);
    else copy.sort((a, b) => (a.pricing.isEarlyBird ? 0 : 1) - (b.pricing.isEarlyBird ? 0 : 1) || a.pricing.currentPrice - b.pricing.currentPrice);
    return copy;
  }, [slotPricings, sortMode]);

  const ancillaryTotal = calculateAncillaryTotal(ancillaries);
  const slotPrice = selectedSlot ? (slotPricings.find(s => s.slot.id === selectedSlot.id)?.pricing.currentPrice || selectedSlot.basePrice) : 0;
  const totalPrice = slotPrice + ancillaryTotal;

  const handleSearch = () => { if (from && to && from !== to && selectedRoute) setStep('results'); };
  const handleSelectSlot = (slot: VanSlot) => { setSelectedSlot(slot); setSelectedSeat(null); setAncillaries({}); setStep('seat'); };

  // Last Minute deals
  const [now, setNow] = useState(() => new Date());
  const deals = useMemo(() => generateSimulatedDeals(now), []);
  const activeDeals = useMemo(() => {
    return deals
      .map(deal => {
        const lm = calculateLastMinuteDiscount(deal.departureTime, deal.seatsAvailable, deal.totalSeats, now);
        if (!lm.isLastMinute) return null;
        return { ...deal, ...lm, finalPrice: applyLastMinutePrice(deal.basePrice, lm.discount), countdown: formatCountdown(deal.departureTime, now) };
      })
      .filter(Boolean) as (LastMinuteDeal & { discount: number; urgencyLabel: string; finalPrice: number; countdown: string | null })[];
  }, [deals, now]);

  // Flash deals
  const flashDeals = useMemo(() => generateFlashDeals(), []);

  // Refresh timers
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollCarousel = (dir: 'left' | 'right') => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === 'left' ? -260 : 260, behavior: 'smooth' });
  };

  // ── ABONNEMENT ──
  if (step === 'abonnement') {
    return (
      <div className="min-h-screen bg-white pb-24">
        <div className="px-5 pt-14">
          <button onClick={() => setStep('hero')} className="flex items-center gap-1 text-gray-500 mb-6">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5" style={{ color: GOLD }} />
            <h2 className="text-xl font-bold text-gray-900">Abonnement Frontalier</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">Trajets illimités · Réservation prioritaire · Sans engagement</p>
          <div className="space-y-4">
            {ABONNEMENT_PLANS.map((plan) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-5 ${plan.name === 'Flex' ? 'border-amber-400 bg-amber-50/50 shadow-md' : 'border-gray-200 bg-white'}`}>
                {plan.name === 'Flex' && (
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full text-white mb-3 inline-block" style={{ backgroundColor: GOLD }}>Populaire</span>
                )}
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-xs text-gray-500">{plan.trips}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-gray-900">CHF {plan.price}</p>
                    <p className="text-[10px] text-gray-400">/mois</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-gray-700">
                      <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <Button className={`w-full mt-4 rounded-xl h-10 text-sm font-bold ${plan.name === 'Flex' ? 'text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                  style={plan.name === 'Flex' ? { backgroundColor: GOLD } : {}}>
                  Choisir {plan.name}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── HERO ──
  if (step === 'hero') {
    return (
      <div className="min-h-screen bg-white pb-24">
        {/* Flash Deal Banner */}
        {flashDeals.length > 0 && (
          <div className="px-4 pt-12 pb-0">
            <FlashDealBanner deal={flashDeals[0]} onBook={() => setStep('search')} />
          </div>
        )}

        <div className={`relative ${flashDeals.length > 0 ? 'h-[360px]' : 'h-[420px]'} overflow-hidden ${flashDeals.length > 0 ? 'mt-3' : ''}`}>
          <img src={heroImg} alt="Lac Léman et Alpes suisses" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

          {!flashDeals.length && (
            <div className="absolute top-12 left-5 z-10">
              <button onClick={() => navigate('/caby/services')} className="flex items-center gap-1 text-white/90 text-sm font-medium bg-black/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                <ArrowLeft className="w-4 h-4" /> Services
              </button>
            </div>
          )}

          <div className="absolute bottom-32 left-0 right-0 px-6 z-10">
            <h1 className="text-3xl font-extrabold text-white leading-tight">Voyagez malin.<br />Écolo. Confortable.</h1>
            <p className="text-white/80 text-sm mt-2">Réservez un siège, pas un taxi. Moins cher que le train.</p>
          </div>

          <div className="absolute -bottom-40 left-4 right-4 z-20">
            <div className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setRoundTrip(false)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${!roundTrip ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                  style={!roundTrip ? { backgroundColor: GOLD } : {}}>Aller simple</button>
                <button onClick={() => setRoundTrip(true)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${roundTrip ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                  style={roundTrip ? { backgroundColor: GOLD } : {}}>
                  Aller-retour
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20">-5%</span>
                </button>
              </div>

              <div className="relative mb-3">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <select value={from} onChange={(e) => { setFrom(e.target.value); setTo(''); }}
                  className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 pl-9 pr-4 text-sm text-gray-900 font-medium">
                  {ALL_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex justify-center -my-1.5 relative z-10">
                <button onClick={() => { const t = from; setFrom(to || from); setTo(t); }}
                  className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm hover:border-amber-400 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 text-gray-500 rotate-90" />
                </button>
              </div>

              <div className="relative mb-3">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-red-500" />
                <select value={to} onChange={(e) => setTo(e.target.value)}
                  className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 pl-9 pr-4 text-sm text-gray-900 font-medium">
                  <option value="">Destination</option>
                  {getDestinationsFrom(from, 'all').map(c => {
                    const r = findRoute(from, c);
                    return <option key={c} value={c}>{c} — dès CHF {r?.basePrice}</option>;
                  })}
                </select>
              </div>

              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <input type="date" value={dateAller} onChange={(e) => setDateAller(e.target.value)}
                    className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm text-gray-900" />
                </div>
                <div className="flex-1">
                  <select value={timeAller} onChange={(e) => setTimeAller(e.target.value)}
                    className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm text-gray-900 font-medium">
                    <option value="">Heure ▼</option>
                    {availableTimeSlotsAller.map(s => (
                      <option key={s.time} value={s.time}>
                        {s.time === 'custom' ? '🕐 Personnalisée' : `${s.time} ${s.rushLevel === 'rush' ? '🔴' : s.rushLevel === 'creux' ? '🟢' : '🟡'}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {timeAller === 'custom' && (
                <div className="mb-3">
                  <input type="time" value={customTimeAller} onChange={(e) => setCustomTimeAller(e.target.value)}
                    className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm text-gray-900" />
                </div>
              )}
              {effectiveTimeAller && selectedRoute && (
                <div className="mb-3 flex items-center gap-2 text-xs text-gray-500 px-1">
                  <Timer className="w-3.5 h-3.5" />
                  <span>Arrivée estimée : <span className="font-bold text-gray-900">{estimatedArrivalAller}</span> ({formatDuration(selectedRoute.duration)})</span>
                  {selectedAllerRush && RUSH_BADGE[selectedAllerRush] && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${RUSH_BADGE[selectedAllerRush].color}`}>{RUSH_BADGE[selectedAllerRush].label}</span>
                  )}
                </div>
              )}
              <div className="flex gap-2 mb-3">
                <div className="w-28 flex items-center gap-1 rounded-xl bg-gray-50 border border-gray-200 px-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-7 h-7 flex items-center justify-center text-gray-500 font-bold">−</button>
                  <span className="text-sm font-bold text-gray-900 w-4 text-center">{passengers}</span>
                  <button onClick={() => setPassengers(Math.min(7, passengers + 1))} className="w-7 h-7 flex items-center justify-center text-gray-500 font-bold">+</button>
                </div>
              </div>

              {roundTrip && (
                <div className="flex gap-2 mb-3">
                  <div className="flex-1">
                    <input type="date" value={dateRetour} onChange={(e) => setDateRetour(e.target.value)}
                      className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm text-gray-900" />
                  </div>
                  <div className="flex-1">
                    <select value={timeRetour} onChange={(e) => setTimeRetour(e.target.value)}
                      className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm text-gray-900 font-medium">
                      <option value="">Heure ▼</option>
                      {availableTimeSlotsRetour.map(s => (
                        <option key={s.time} value={s.time}>
                          {s.time === 'custom' ? '🕐 Personnalisée' : `${s.time} ${s.rushLevel === 'rush' ? '🔴' : s.rushLevel === 'creux' ? '🟢' : '🟡'}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {roundTrip && timeRetour === 'custom' && (
                <div className="mb-3">
                  <input type="time" value={customTimeRetour} onChange={(e) => setCustomTimeRetour(e.target.value)}
                    className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm text-gray-900" />
                </div>
              )}
              {roundTrip && effectiveTimeRetour && selectedRoute && (
                <div className="mb-3 flex items-center gap-2 text-xs text-gray-500 px-1">
                  <Timer className="w-3.5 h-3.5" />
                  <span>Retour arrivée : <span className="font-bold text-gray-900">{estimatedArrivalRetour}</span> · -5% aller-retour</span>
                </div>
              )}

              <Button onClick={() => { if (from && to) handleSearch(); else setStep('search'); }}
                className="w-full h-12 rounded-xl text-white font-bold text-base shadow-lg hover:shadow-xl transition-shadow"
                style={{ backgroundColor: GOLD }}>
                <Search className="w-4 h-4 mr-2" />
                Rechercher un trajet
              </Button>
            </div>
          </div>
        </div>

        <div className="h-44" />

        {/* Info banner */}
        <div className="px-5 mt-6">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
            <span className="text-sm mt-0.5">💡</span>
            <p className="text-xs text-amber-800">Les prix augmentent à chaque réservation. Les early birds économisent jusqu'à <span className="font-bold">30%</span>.</p>
          </div>
        </div>

        {/* Destinations carousel */}
        <section className="mt-6 px-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Destinations populaires</h2>
            <div className="flex gap-1">
              <button onClick={() => scrollCarousel('left')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={() => scrollCarousel('right')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          <div ref={carouselRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
            {POPULAR_DESTINATIONS.map((dest) => (
              <button key={dest.city} onClick={() => { setTo(dest.city); setStep('search'); }}
                className="flex-shrink-0 w-[160px] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow group bg-white border border-gray-100">
                <div className="h-24 bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center text-4xl relative">
                  <span>{dest.emoji}</span>
                  <div className="absolute top-2 right-2"><span className="text-lg">{dest.img}</span></div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-gray-900 truncate">{dest.city}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">dès</span>
                    <span className="text-sm font-bold" style={{ color: GOLD }}>CHF {dest.price}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Filter chips */}
        <section className="mt-8 px-5">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Explorer par catégorie</h2>
          <div className="flex gap-2 flex-wrap">
            {FILTER_TABS.map(f => (
              <button key={f.key} onClick={() => { setFilter(f.key); setStep('search'); }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors border border-gray-200">
                <span>{f.icon}</span>{f.label}
              </button>
            ))}
          </div>
        </section>

        {/* Last minute deals */}
        {activeDeals.length > 0 && (
          <section className="mt-8 px-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-gray-900">Offres Last Minute</h2>
              <span className="text-[10px] text-gray-400 ml-auto">Mise à jour auto</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeDeals.map((deal, i) => (
                <motion.div key={deal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-500 text-white">−{deal.discount}%</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-100 text-gray-700">{deal.urgencyLabel}</span>
                  </div>
                  <div className="mt-8">
                    <div className="flex items-center gap-1">
                      <span>{deal.flag}</span>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Siège partagé</p>
                    </div>
                    <p className="text-base font-bold text-gray-900 mt-0.5">{deal.from} → {deal.to}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-gray-400 line-through">CHF {deal.basePrice}</span>
                      <span className="text-lg font-black" style={{ color: GOLD }}>CHF {deal.finalPrice}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-xs text-gray-500">{deal.seatsAvailable} sièges restants</p>
                      {deal.countdown && <p className="text-[10px] font-bold text-red-500 animate-pulse">{deal.countdown}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Button onClick={() => { setFrom(deal.from); setTo(deal.to); setStep('search'); }}
                      className="flex-1 h-8 rounded-lg text-white text-xs font-bold" style={{ backgroundColor: GOLD }}>
                      Réserver
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Trust stats */}
        <section className="mt-10 px-5 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <Car className="w-6 h-6" />, value: "2'400+", label: 'trajets/mois' },
              { icon: <Star className="w-6 h-6" />, value: '4.9/5', label: 'satisfaction' },
              { icon: <Leaf className="w-6 h-6" />, value: '6×', label: 'moins de CO₂' },
              { icon: <Shield className="w-6 h-6" />, value: '100%', label: 'certifiés' },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                <div className="flex justify-center mb-2 text-gray-600">{stat.icon}</div>
                <p className="text-lg font-extrabold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cross-border CTA */}
        <section className="px-5 mb-8">
          <button onClick={() => navigate('/caby/crossborder')}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-left shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🌍</span>
              <h3 className="text-base font-bold text-white">Caby Cross-Border</h3>
            </div>
            <p className="text-sm text-white/80">Covoiturage premium France ↔ Suisse avec chauffeur certifié</p>
            <div className="flex items-center gap-1 mt-2 text-white/60 text-xs">
              <span>Découvrir</span><ArrowRight className="w-3 h-3" />
            </div>
          </button>
        </section>

        {/* Abonnement CTA */}
        <section className="px-5 mb-10">
          <button onClick={() => setStep('abonnement')}
            className="w-full rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-5 text-left">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-5 h-5" style={{ color: GOLD }} />
              <h3 className="text-base font-bold text-gray-900">Abonnement Frontalier</h3>
            </div>
            <p className="text-sm text-gray-600">Dès CHF 299/mois · Trajets illimités · Réservation prioritaire</p>
          </button>
        </section>

        <BottomNav />
      </div>
    );
  }

  // ── SEARCH ──
  if (step === 'search') {
    return (
      <div className="min-h-screen bg-white pb-24">
        <div className="px-5 pt-14">
          <button onClick={() => setStep('hero')} className="flex items-center gap-1 text-gray-500 mb-6">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Rechercher un trajet</h2>

          <div className="flex gap-1.5 mb-5 flex-wrap">
            {FILTER_TABS.map(f => (
              <button key={f.key} onClick={() => { setFilter(f.key); setTo(''); }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-colors border ${filter === f.key ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                style={filter === f.key ? { backgroundColor: GOLD } : {}}>
                <span>{f.icon}</span>{f.label}
                {f.badge && filter === f.key && <span className="text-[8px] ml-0.5 opacity-80">· {f.badge}</span>}
              </button>
            ))}
          </div>

          {filter === 'grand_geneve' && (
            <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 mb-4 flex items-start gap-2">
              <span className="text-sm mt-0.5">🚗</span>
              <div>
                <p className="text-xs font-bold text-orange-800">Navettes frontalières quotidiennes</p>
                <p className="text-[10px] text-orange-600">Créneaux fixes matin (6h-8h30) et soir (17h-19h30)</p>
              </div>
            </div>
          )}
          {filter === 'valais' && (
            <div className="rounded-xl bg-purple-50 border border-purple-200 p-3 mb-4 flex items-start gap-2">
              <span className="text-sm mt-0.5">🍷</span>
              <div>
                <p className="text-xs font-bold text-purple-800">Valais & Riviera — Pays du Vin & des Alpes</p>
                <p className="text-[10px] text-purple-600">Vignobles du Lavaux UNESCO · Montreux Jazz · Vallée du Rhône</p>
              </div>
            </div>
          )}
          {filter === 'horlogerie' && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 mb-4 flex items-start gap-2">
              <span className="text-sm mt-0.5">⌚</span>
              <div>
                <p className="text-xs font-bold text-amber-800">Jura & Route Horlogère</p>
                <p className="text-[10px] text-amber-600">Service premium pour l'industrie horlogère — Rolex, Patek Philippe</p>
              </div>
            </div>
          )}
          {filter === 'international' && (
            <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3 mb-4 flex items-start gap-2">
              <span className="text-sm mt-0.5">🌍</span>
              <div>
                <p className="text-xs font-bold text-indigo-800">Routes internationales — Via Simplon</p>
                <p className="text-[10px] text-indigo-600">Passeport ou carte d'identité requis · Prix en CHF et EUR</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">Ville de départ</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <select value={from} onChange={(e) => { setFrom(e.target.value); setTo(''); setPickupLabel(''); setPickupAddress(''); setPickupCustom(''); }}
                  className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 pl-9 pr-4 text-sm text-gray-900 font-medium">
                  {ALL_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-center -my-1">
              <button onClick={() => { const t = from; setFrom(to || from); setTo(t); }}
                className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-amber-400 transition-colors">
                <ArrowRight className="w-3.5 h-3.5 text-gray-500 rotate-90" />
              </button>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">Ville d'arrivée</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-red-500" />
                <select value={to} onChange={(e) => { setTo(e.target.value); setDropoffLabel(''); setDropoffAddress(''); setDropoffCustom(''); }}
                  className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 pl-9 pr-4 text-sm text-gray-900 font-medium">
                  <option value="">Choisir une destination</option>
                  {destinations.map(c => {
                    const r = findRoute(from, c);
                    return <option key={c} value={c}>{c}{r?.seasonal ? ' ❄️' : ''}{r?.daily ? ' 🚗' : ''} — {r ? formatDuration(r.duration) : ''} · CHF {r?.basePrice}</option>;
                  })}
                </select>
              </div>
            </div>

            {/* Pickup address */}
            {from && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">📍 Adresse de prise en charge</label>
                <select
                  value={pickupLabel}
                  onChange={(e) => {
                    const pt = pickupPoints.find(p => p.label === e.target.value);
                    setPickupLabel(e.target.value);
                    setPickupAddress(pt?.address || '');
                    setPickupCustom('');
                  }}
                  className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm text-gray-900 font-medium">
                  <option value="">Choisir un point de pickup</option>
                  {pickupPoints.map(p => (
                    <option key={p.label} value={p.label}>{p.label}</option>
                  ))}
                </select>
                {selectedPickupIsCustom && (
                  <input
                    type="text"
                    value={pickupCustom}
                    onChange={(e) => setPickupCustom(e.target.value)}
                    placeholder="Tapez votre adresse, hôtel, gare..."
                    className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm text-gray-900 mt-2"
                  />
                )}
                {pickupAddress && !selectedPickupIsCustom && (
                  <p className="text-[10px] text-gray-400 mt-1 px-1">{pickupAddress}</p>
                )}
              </div>
            )}

            {/* Dropoff address */}
            {to && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">📍 Adresse de dépose</label>
                <select
                  value={dropoffLabel}
                  onChange={(e) => {
                    const pt = dropoffPoints.find(p => p.label === e.target.value);
                    setDropoffLabel(e.target.value);
                    setDropoffAddress(pt?.address || '');
                    setDropoffCustom('');
                  }}
                  className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm text-gray-900 font-medium">
                  <option value="">Choisir un point de dépose</option>
                  {dropoffPoints.map(p => (
                    <option key={p.label} value={p.label}>{p.label}</option>
                  ))}
                </select>
                {selectedDropoffIsCustom && (
                  <input
                    type="text"
                    value={dropoffCustom}
                    onChange={(e) => setDropoffCustom(e.target.value)}
                    placeholder="Tapez votre adresse, hôtel, bureau..."
                    className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm text-gray-900 mt-2"
                  />
                )}
                {dropoffAddress && !selectedDropoffIsCustom && (
                  <p className="text-[10px] text-gray-400 mt-1 px-1">{dropoffAddress}</p>
                )}
              </div>
            )}

            {/* Airport toggle */}
            {isAirport && (
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Plane className="w-4 h-4 text-blue-600" />
                  <p className="text-xs font-bold text-blue-800">✈️ Vol détecté — Comment calculer l'heure ?</p>
                </div>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setAirportMode('arrival')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors border ${airportMode === 'arrival' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                    Heure d'arrivée vol
                  </button>
                  <button
                    onClick={() => setAirportMode('pickup')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors border ${airportMode === 'pickup' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                    Heure de pickup
                  </button>
                </div>
                {airportMode === 'arrival' && (
                  <div>
                    <input
                      type="time"
                      value={flightArrivalTime}
                      onChange={(e) => setFlightArrivalTime(e.target.value)}
                      className="w-full h-10 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-900"
                      placeholder="Heure d'arrivée du vol"
                    />
                    <p className="text-[10px] text-blue-600 mt-1.5">🛬 Votre chauffeur vous attendra à votre arrivée avec une pancarte à votre nom</p>
                  </div>
                )}
              </div>
            )}

            {selectedRoute && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: GOLD }} />
                  <span className="text-sm text-gray-900 font-medium">{formatDuration(selectedRoute.duration)}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${SEGMENT_META[selectedRoute.segment]?.color}`}>{SEGMENT_META[selectedRoute.segment]?.label}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: GOLD }}>dès CHF {selectedRoute.basePrice}/siège</span>
              </div>
            )}

            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">Date aller</label>
              <div className="flex gap-2">
                <input type="date" value={dateAller} onChange={(e) => setDateAller(e.target.value)}
                  className="flex-1 h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm text-gray-900" />
                <select value={timeAller} onChange={(e) => setTimeAller(e.target.value)}
                  className="flex-1 h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm text-gray-900 font-medium">
                  <option value="">Heure de départ</option>
                  {availableTimeSlotsAller.map(s => (
                    <option key={s.time} value={s.time}>
                      {s.time === 'custom' ? '🕐 Heure personnalisée' : `${s.time} ${s.rushLevel === 'rush' ? '🔴 Rush' : s.rushLevel === 'creux' ? '🟢 Creux' : '🟡 Soirée'}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {timeAller === 'custom' && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">Heure personnalisée</label>
                <input type="time" value={customTimeAller} onChange={(e) => setCustomTimeAller(e.target.value)}
                  className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm text-gray-900" />
              </div>
            )}

            {effectiveTimeAller && selectedRoute && (
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 flex items-center gap-2">
                <Timer className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-medium">
                    Arrivée estimée : <span className="font-bold">{estimatedArrivalAller}</span>
                  </p>
                  <p className="text-[10px] text-gray-500">{formatDuration(selectedRoute.duration)} de trajet</p>
                </div>
                {selectedAllerRush && RUSH_BADGE[selectedAllerRush] && (
                  <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${RUSH_BADGE[selectedAllerRush].color}`}>
                    {RUSH_BADGE[selectedAllerRush].label}
                  </span>
                )}
              </div>
            )}
            {effectiveTimeAller && selectedAllerRush === 'creux' && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 flex items-center gap-2">
                <span className="text-sm">💰</span>
                <p className="text-[11px] text-emerald-700 font-medium">Créneau creux — prix réduit −5%</p>
              </div>
            )}

            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <span className="text-sm text-gray-700 font-medium">Aller-retour</span>
              <div className="flex items-center gap-2">
                {roundTrip && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: GOLD }}>-5%</span>}
                <button onClick={() => setRoundTrip(!roundTrip)} className={`w-11 h-6 rounded-full transition-colors ${roundTrip ? '' : 'bg-gray-300'}`}
                  style={roundTrip ? { backgroundColor: GOLD } : {}}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${roundTrip ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>

            {roundTrip && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">Date retour</label>
                <div className="flex gap-2">
                  <input type="date" value={dateRetour} onChange={(e) => setDateRetour(e.target.value)}
                    className="flex-1 h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm text-gray-900" />
                  <select value={timeRetour} onChange={(e) => setTimeRetour(e.target.value)}
                    className="flex-1 h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm text-gray-900 font-medium">
                    <option value="">Heure retour</option>
                    {availableTimeSlotsRetour.map(s => (
                      <option key={s.time} value={s.time}>
                        {s.time === 'custom' ? '🕐 Heure personnalisée' : `${s.time} ${s.rushLevel === 'rush' ? '🔴 Rush' : s.rushLevel === 'creux' ? '🟢 Creux' : '🟡 Soirée'}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {roundTrip && timeRetour === 'custom' && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">Heure personnalisée retour</label>
                <input type="time" value={customTimeRetour} onChange={(e) => setCustomTimeRetour(e.target.value)}
                  className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm text-gray-900" />
              </div>
            )}

            {roundTrip && effectiveTimeRetour && selectedRoute && (
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 flex items-center gap-2">
                <Timer className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-medium">
                    Retour arrivée : <span className="font-bold">{estimatedArrivalRetour}</span>
                  </p>
                  <p className="text-[10px] text-gray-500">Retour le même soir · -5% aller-retour</p>
                </div>
                {selectedRetourRush && RUSH_BADGE[selectedRetourRush] && (
                  <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${RUSH_BADGE[selectedRetourRush].color}`}>
                    {RUSH_BADGE[selectedRetourRush].label}
                  </span>
                )}
              </div>
            )}

            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">Passagers</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">−</button>
                <span className="text-lg font-bold text-gray-900 w-8 text-center">{passengers}</span>
                <button onClick={() => setPassengers(Math.min(7, passengers + 1))} className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">+</button>
                <Users className="w-4 h-4 text-gray-400 ml-1" />
              </div>
            </div>

            <Button onClick={handleSearch} disabled={!selectedRoute}
              className="w-full mt-4 text-white font-bold rounded-xl h-12 disabled:opacity-40 shadow-lg"
              style={{ backgroundColor: GOLD }}>
              <Search className="w-4 h-4 mr-2" />
              Rechercher
            </Button>

            {filter === 'grand_geneve' && (
              <button onClick={() => setStep('abonnement')} className="w-full mt-2 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 p-3 text-center">
                <p className="text-xs font-bold text-orange-700">💳 Abonnement Frontalier dès CHF 299/mois</p>
                <p className="text-[10px] text-orange-500">Trajets illimités · Réservation prioritaire</p>
              </button>
            )}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── RESULTS with Ryanair pricing ──
  if (step === 'results' && selectedRoute) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white px-5 pt-14 pb-4 border-b border-gray-100">
          <button onClick={() => setStep('search')} className="flex items-center gap-1 text-gray-500 mb-4">
            <ArrowLeft className="w-4 h-4" /> Modifier
          </button>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4" style={{ color: GOLD }} />
            <h2 className="text-lg font-bold text-gray-900">{from} → {to}</h2>
            <span className="text-sm">{selectedRoute.flag}</span>
          </div>
          <p className="text-xs text-gray-500">{dateAller || "Aujourd'hui"}{effectiveTimeAller ? ` · ${effectiveTimeAller}` : ''} · {passengers} passager{passengers > 1 ? 's' : ''} · {formatDuration(selectedRoute.duration)}</p>
        </div>

        {/* Sort buttons */}
        <div className="px-5 pt-4 flex gap-2">
          {([
            { key: 'price' as SortMode, label: '💰 Prix croissant' },
            { key: 'urgent' as SortMode, label: '⚡ Départ imminent' },
            { key: 'earlybird' as SortMode, label: '🟢 Early Bird' },
          ]).map(s => (
            <button key={s.key} onClick={() => setSortMode(s.key)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors border ${sortMode === s.key ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'}`}
              style={sortMode === s.key ? { backgroundColor: GOLD } : {}}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Info banner */}
        <div className="px-5 mt-3">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 flex items-center gap-2">
            <span className="text-sm">💡</span>
            <p className="text-[10px] text-amber-800">Les prix augmentent à chaque réservation. Les early birds économisent jusqu'à <span className="font-bold">30%</span>.</p>
          </div>
        </div>

        <div className="px-5 pt-4 space-y-3">
          {sortedSlots.map(({ slot, pricing, depDate }) => (
            <SeatPricingCard
              key={slot.id}
              from={from}
              to={to}
              departure={slot.departure}
              arrivalEstimate={slot.arrivalEstimate}
              pricing={pricing}
              seatsTotal={slot.seatsTotal}
              seatsSold={slot.seatsTaken}
              departureTime={depDate}
              onBook={() => handleSelectSlot(slot)}
            />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── SEAT SELECTION + ANCILLARIES ──
  if (step === 'seat' && selectedSlot && selectedRoute) {
    return (
      <div className="min-h-screen bg-white pb-24">
        <div className="px-5 pt-14">
          <button onClick={() => setStep('results')} className="flex items-center gap-1 text-gray-500 mb-4">
            <ArrowLeft className="w-4 h-4" /> Créneaux
          </button>
          <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">{from} → {to}</p>
                <p className="text-xs text-gray-500">{selectedSlot.departure} → {selectedSlot.arrivalEstimate} · {dateAller || "Aujourd'hui"}</p>
              </div>
              <p className="text-xl font-black" style={{ color: GOLD }}>CHF {slotPrice}</p>
            </div>
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Choisissez votre siège</h3>
          <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 mb-6">
            <div className="relative mx-auto" style={{ width: 200 }}>
              <div className="border-2 border-gray-200 rounded-3xl p-4 pt-10 pb-6 bg-white">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-bold">AVANT ▲</div>
                <div className="flex justify-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400 border border-gray-200">🚐</div>
                </div>
                <div className="flex justify-center gap-3 mb-3">{[1, 2].map(s => <SeatButton key={s} seat={s} taken={takenSeats.includes(s)} selected={selectedSeat === s} onSelect={setSelectedSeat} />)}</div>
                <div className="flex justify-center gap-3 mb-3">{[3, 4, 5].map(s => <SeatButton key={s} seat={s} taken={takenSeats.includes(s)} selected={selectedSeat === s} onSelect={setSelectedSeat} />)}</div>
                <div className="flex justify-center gap-3">{[6, 7].map(s => <SeatButton key={s} seat={s} taken={takenSeats.includes(s)} selected={selectedSeat === s} onSelect={setSelectedSeat} />)}</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-gray-500">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-200" /> Occupé</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ backgroundColor: GOLD }} /> Disponible</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500" /> Votre siège</span>
            </div>
          </div>

          {/* Ancillary options */}
          <div className="mb-6">
            <AncillarySelector selected={ancillaries} onChange={setAncillaries} basePrice={slotPrice} />
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Total</span>
              <span className="text-2xl font-black text-gray-900">CHF {totalPrice}</span>
            </div>
            {ancillaryTotal > 0 && <p className="text-[10px] text-gray-500 mt-1">Siège CHF {slotPrice} + options CHF {ancillaryTotal}</p>}
          </div>

          <Button onClick={() => setStep('confirm')} disabled={!selectedSeat}
            className="w-full text-white font-bold rounded-xl h-12 disabled:opacity-40 shadow-lg"
            style={{ backgroundColor: GOLD }}>
            Confirmer et payer
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── CONFIRMATION ──
  if (step === 'confirm' && selectedSlot && selectedRoute) {
    return (
      <div className="min-h-screen bg-white pb-24">
        <div className="px-5 pt-14 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-600" />
          </motion.div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Réservation confirmée !</h2>
          <p className="text-sm text-gray-500 mb-6">Votre e-ticket a été envoyé par email</p>

          {/* Pickup/Dropoff detail cards */}
          {(effectivePickupAddress || effectiveDropoffAddress) && (
            <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden text-left shadow-lg mb-4">
              {effectivePickupAddress && (
                <div className="p-4 border-b border-gray-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">📍 Point de prise en charge</p>
                  <p className="text-sm font-bold text-gray-900">{pickupLabel}</p>
                  <p className="text-xs text-gray-500">{effectivePickupAddress}</p>
                  {effectiveTimeAller && (
                    <p className="text-xs text-gray-600 mt-1">🕐 {effectiveTimeAller} — Le chauffeur vous attend avec une pancarte à votre nom</p>
                  )}
                </div>
              )}
              {effectiveDropoffAddress && (
                <div className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-1">🏁 Point de dépose</p>
                  <p className="text-sm font-bold text-gray-900">{dropoffLabel}</p>
                  <p className="text-xs text-gray-500">{effectiveDropoffAddress}</p>
                  {estimatedArrivalAller && (
                    <p className="text-xs text-gray-600 mt-1">🕐 Arrivée estimée : {estimatedArrivalAller}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden text-left shadow-lg">
            <div className="px-5 py-3 border-b border-gray-100" style={{ backgroundColor: `${GOLD}15` }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: GOLD }}>E-Ticket Caby Van</p>
            </div>
            <div className="p-5 space-y-3">
              {[
                ['Trajet', `${from} → ${to}`],
                ['Date', dateAller || "Aujourd'hui"],
                ['Départ', selectedSlot.departure],
                ['Arrivée estimée', selectedSlot.arrivalEstimate],
                ['Durée', formatDuration(selectedRoute.duration)],
                ['Siège', `N°${selectedSeat}`],
                ['Chauffeur', 'David M. · GE 482 317'],
                ['Pickup', effectivePickupAddress || (from === 'Genève' ? 'Gare Cornavin, Sortie C' : `Gare de ${from}`)],
                ['Dépose', effectiveDropoffAddress || `Gare de ${to}`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-bold text-gray-900 text-right max-w-[60%]">{value}</span>
                </div>
              ))}
              {ancillaryTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Options</span>
                  <span className="font-bold text-gray-900">+CHF {ancillaryTotal}</span>
                </div>
              )}
              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between text-sm">
                <span className="text-gray-500">Total payé</span>
                <span className="text-xl font-black text-gray-900">CHF {totalPrice}</span>
              </div>
            </div>
            <div className="border-t border-dashed border-gray-200 p-5 flex flex-col items-center bg-gray-50">
              <div className="w-32 h-32 rounded-xl bg-white flex items-center justify-center border border-gray-200">
                <QrCode className="w-20 h-20 text-gray-800" />
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Présentez ce QR code au chauffeur</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3">
            <Leaf className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-xs text-emerald-700 text-left">🌿 Trajet partagé — vous économisez <span className="font-bold">{Math.round(selectedRoute.duration * 0.12)} kg de CO₂</span> vs voiture solo</p>
          </div>

          <Button onClick={() => navigate('/caby/services')} variant="outline" className="w-full mt-4 rounded-xl h-12 border-gray-300 text-gray-700">
            Retour aux services
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return null;
};

export default CabyVanPage;
