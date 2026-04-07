import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Leaf, Users, Clock, MapPin, Luggage, Bike, QrCode, Check, X,
  CreditCard, Star, ChevronLeft, ChevronRight, Search, Percent, Zap, Shield, Car, SlidersHorizontal, Timer,
  Info, ChevronDown, ChevronUp, Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
// Unsplash vehicle images — 3/4 view, neutral backgrounds
const vehicleImages = {
  van_shared: 'https://images.unsplash.com/photo-1612838320302-4b3b3b3b3b3b?w=600&q=80&fit=crop&crop=center',
  berline_standard: 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=600&q=80',
  suv_premium: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=600&q=80',
  van_private_standard: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  van_private_premium: 'https://images.unsplash.com/photo-1609520505218-7421df82e44e?w=600&q=80',
};
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
import PlacesAutocomplete from '@/components/shared/PlacesAutocomplete';
import CityAutocomplete from '@/components/van/CityAutocomplete';
import PriceCalendar from '@/components/van/PriceCalendar';

type Step = 'hero' | 'search' | 'results' | 'seat' | 'extras' | 'passenger' | 'payment' | 'confirm' | 'abonnement';
type SortMode = 'price' | 'urgent' | 'earlybird';

// ── VEHICLE DATA ──
interface VehicleOption {
  id: string;
  type: 'shared' | 'private';
  name: string;
  capacity: number;
  image: string;
  pricePerSeat?: number;
  priceTotal?: number;
  features: string[];
  details: { included: string[]; options: string[]; luggage: string; cancellation: string };
}

const VEHICLES: VehicleOption[] = [
  {
    id: 'van-shared', type: 'shared', name: 'VAN Standard', capacity: 7,
    image: vehicleImages.van_shared, pricePerSeat: 65,
    features: ['🧳 1 bagage inclus', '🎿 Skis +CHF 15', '✓ Chauffeur certifié'],
    details: {
      included: ['1 bagage cabine', 'Wi-Fi à bord', 'Prise USB', 'Chauffeur professionnel certifié'],
      options: ['Bagage supplémentaire +CHF 10', 'Équipement ski +CHF 15', 'Siège premium (avant) +CHF 8'],
      luggage: '1 bagage standard (23kg max) inclus. Bagages volumineux sur demande.',
      cancellation: 'Annulation gratuite jusqu\'à 24h avant le départ. 50% remboursé entre 24h et 6h. Non remboursable après.',
    },
  },
  {
    id: 'berline', type: 'private', name: 'Berline Standard', capacity: 3,
    image: vehicleImages.berline_standard, priceTotal: 210,
    features: ['🧳 2 bagages inclus', '✓ Véhicule privatisé', '✓ Chauffeur certifié'],
    details: {
      included: ['2 bagages', 'Véhicule privatisé', 'Eau minérale', 'Chauffeur professionnel'],
      options: ['Siège enfant +CHF 10', 'Arrêt intermédiaire +CHF 25'],
      luggage: '2 bagages standards inclus (23kg max chacun).',
      cancellation: 'Annulation gratuite jusqu\'à 48h avant. 50% entre 48h et 24h.',
    },
  },
  {
    id: 'suv', type: 'private', name: 'SUV Premium', capacity: 4,
    image: vehicleImages.suv_premium, priceTotal: 280,
    features: ['🧳 3 bagages inclus', '✓ Véhicule privatisé', '⭐ Confort premium'],
    details: {
      included: ['3 bagages', 'Véhicule premium privatisé', 'Eau & snacks', 'Sièges cuir', 'Chauffeur premium'],
      options: ['Siège enfant +CHF 10', 'Arrêt intermédiaire +CHF 25'],
      luggage: '3 bagages standards inclus (23kg max chacun). Skis compatibles.',
      cancellation: 'Annulation gratuite jusqu\'à 48h avant. 50% entre 48h et 24h.',
    },
  },
  {
    id: 'van-private', type: 'private', name: 'VAN Privé Standard', capacity: 7,
    image: vehicleImages.van_private_standard, priceTotal: 420,
    features: ['🧳 7 bagages inclus', '🎿 Skis compatibles', '✓ Groupe privatisé'],
    details: {
      included: ['7 bagages', 'VAN privatisé pour votre groupe', 'Wi-Fi', 'Prises USB', 'Chauffeur professionnel'],
      options: ['Équipement ski +CHF 0 (inclus)', 'Arrêt intermédiaire +CHF 30'],
      luggage: '7 bagages standards inclus. Skis et snowboards acceptés.',
      cancellation: 'Annulation gratuite jusqu\'à 48h avant. 50% entre 48h et 24h.',
    },
  },
  {
    id: 'van-premium', type: 'private', name: 'VAN Privé Premium', capacity: 7,
    image: vehicleImages.van_private_premium, priceTotal: 520,
    features: ['🧳 7 bagages inclus', '🎿 Skis compatibles', '⭐ Mercedes V-Class'],
    details: {
      included: ['7 bagages', 'Mercedes V-Class privatisé', 'Wi-Fi haut débit', 'Sièges cuir', 'Eau & snacks', 'Chauffeur premium'],
      options: ['Équipement ski +CHF 0 (inclus)', 'Arrêt intermédiaire +CHF 30', 'Champagne +CHF 45'],
      luggage: '7 bagages standards inclus. Tout équipement sport accepté.',
      cancellation: 'Annulation gratuite jusqu\'à 72h avant. 50% entre 72h et 24h.',
    },
  },
];

const STEPPER_STEPS = [
  { num: 1, label: 'Détails du trajet' },
  { num: 2, label: 'Choisir le transfert' },
  { num: 3, label: 'Choix du siège' },
  { num: 4, label: 'Extras & options' },
  { num: 5, label: 'Vos informations' },
  { num: 6, label: 'Paiement' },
  { num: 7, label: 'Confirmation' },
];

const INSURANCE_FEE = 2.50;
// SortMode declared above

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

const DEST_CARDS = [
  { from: 'Genève', to: 'Zurich', image: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=600&q=80', fromPrice: 54, month: 'avr. 2026' },
  { from: 'Genève', to: 'Annecy', image: 'https://images.unsplash.com/photo-1507272931001-fc06c17cedc4?w=600&q=80', fromPrice: 15, month: 'avr. 2026' },
  { from: 'Genève', to: 'Lausanne', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600&q=80', fromPrice: 18, month: 'avr. 2026' },
  { from: 'Genève', to: 'Verbier', image: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80', fromPrice: 35, month: 'avr. 2026' },
  { from: 'Genève', to: 'Lyon', image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&q=80', fromPrice: 42, month: 'avr. 2026' },
  { from: 'Genève', to: 'Zermatt', image: 'https://images.unsplash.com/photo-1529983601738-76e7cb012926?w=600&q=80', fromPrice: 55, month: 'mai 2026' },
];

const EDITORIAL_CARDS = [
  { title: 'TRAVERSEZ LES ALPES EN VAN', desc: 'De Genève au Cervin en toute sérénité. Sièges confortables, Wi-Fi, vue panoramique.', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80', cta: 'Explorer', dest: 'Zermatt' },
  { title: 'GENÈVE ↔ LYON EN 1H45', desc: 'La ligne la plus demandée. Départs quotidiens, prix imbattable vs le train.', image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800&q=80', cta: 'Réserver', dest: 'Lyon' },
  { title: 'STATIONS DE SKI — RÉSERVEZ TÔT', desc: 'Verbier, Chamonix, Zermatt. Early Bird -30%. Skis transportés gratuitement.', image: 'https://images.unsplash.com/photo-1565992441121-4367c2967103?w=800&q=80', cta: 'Voir les offres', dest: 'Verbier' },
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
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarOpenSearch, setCalendarOpenSearch] = useState(false);
  const [departureDateObj, setDepartureDateObj] = useState<Date | null>(null);
  const [returnDateObj, setReturnDateObj] = useState<Date | null>(null);
  const [timeRetour, setTimeRetour] = useState('');
  const [customTimeAller, setCustomTimeAller] = useState('');
  const [customTimeRetour, setCustomTimeRetour] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('price');

  const [selectedSlot, setSelectedSlot] = useState<VanSlot | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [ancillaries, setAncillaries] = useState<Partial<AncillaryOptions>>({});
  const [selectedVehicle, setSelectedVehicle] = useState<string>('van-shared');
  const [selectedVehicleReturn, setSelectedVehicleReturn] = useState<string>('van-shared');
  const [expandedDetails, setExpandedDetails] = useState<string | null>(null);
  const [sameVehicleReturn, setSameVehicleReturn] = useState(true);

  // Passenger info (step 5)
  const [passengerFirstName, setPassengerFirstName] = useState('');
  const [passengerLastName, setPassengerLastName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [passengerFlightNo, setPassengerFlightNo] = useState('');
  const [passengerBagCount, setPassengerBagCount] = useState(1);

  // Payment method (step 6)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'twint' | 'applepay'>('card');

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

  // Vehicle pricing
  const getVehiclePrice = (v: VehicleOption, routeBase: number) => {
    if (v.type === 'shared') return Math.round(routeBase * 1.0);
    const multiplier = v.id === 'berline' ? 3.2 : v.id === 'suv' ? 4.3 : v.id === 'van-private' ? 6.5 : 8;
    return Math.round(routeBase * multiplier);
  };

  const activeVehicle = VEHICLES.find(v => v.id === selectedVehicle) || VEHICLES[0];
  const activeVehicleReturn = VEHICLES.find(v => v.id === selectedVehicleReturn) || VEHICLES[0];
  const routeBasePrice = selectedRoute?.basePrice || 65;

  const outboundPrice = getVehiclePrice(activeVehicle, routeBasePrice);
  const returnPrice = roundTrip ? getVehiclePrice(sameVehicleReturn ? activeVehicle : activeVehicleReturn, routeBasePrice) : 0;
  const roundTripDiscount = roundTrip ? Math.round((outboundPrice + returnPrice) * 0.05) : 0;
  const resultsInsuranceFee = roundTrip ? INSURANCE_FEE * 2 : INSURANCE_FEE;
  const resultsTotalPrice = outboundPrice + returnPrice - roundTripDiscount + resultsInsuranceFee;

  const totalPrice = slotPrice + ancillaryTotal;

  const handleSearch = () => {
    if (from && to && from !== to && selectedRoute) {
      const params = new URLSearchParams({ from, to, passengers: String(passengers) });
      if (dateAller) params.set('date', dateAller);
      if (roundTrip && dateRetour) params.set('returnDate', dateRetour);
      navigate(`/caby/van/select?${params.toString()}`);
    }
  };

  const formatDateForInput = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const formatDateDisplay = (d: Date | null) => d ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}` : '';

  const handleCalendarApply = (setter: (v: boolean) => void) => {
    if (departureDateObj) setDateAller(formatDateForInput(departureDateObj));
    if (returnDateObj) { setDateRetour(formatDateForInput(returnDateObj)); setRoundTrip(true); }
    setter(false);
  };
  const handleCalendarClear = () => { setDepartureDateObj(null); setReturnDateObj(null); setDateAller(''); setDateRetour(''); };

  const MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const formatDateShort = (d: Date) => `${String(d.getDate()).padStart(2, '0')} ${MONTHS_SHORT[d.getMonth()]}`;

  const calendarDateLabel = departureDateObj
    ? (returnDateObj
      ? `${formatDateShort(departureDateObj)} → ${formatDateShort(returnDateObj)} ${returnDateObj.getFullYear()} · -5%`
      : `${formatDateShort(departureDateObj)} ${departureDateObj.getFullYear()}`)
    : '';
  const calendarBasePrice = selectedRoute?.basePrice || 65;
  const handleSelectSlot = (slot: VanSlot) => { setSelectedSlot(slot); setSelectedSeat(null); setAncillaries({}); setStep('seat'); };
  const handleVehicleContinue = () => {
    if (!selectedSlot && selectedRoute) {
      const effectiveTime = effectiveTimeAller || '08:00';
      const depDate = new Date();
      depDate.setHours(parseInt(effectiveTime.split(':')[0]), parseInt(effectiveTime.split(':')[1]), 0);
      if (depDate.getTime() < Date.now()) depDate.setDate(depDate.getDate() + 1);
      const syntheticSlot: VanSlot = {
        id: `syn-${Date.now()}`,
        departure: effectiveTime,
        arrivalEstimate: addMinutesToTime(effectiveTime, selectedRoute.duration),
        label: effectiveTime,
        basePrice: selectedRoute.basePrice,
        seatsTotal: 7,
        seatsTaken: 3,
        rushLevel: 'green',
      };
      setSelectedSlot(syntheticSlot);
    }
    setStep('seat');
  };

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

  // ── HERO — EasyJet-inspired Landing ──
  if (step === 'hero') {
    return (
      <div className="min-h-screen bg-white">
        {/* ① HERO SECTION — Full screen photo + text */}
        <div className="relative h-[480px] md:h-[540px] overflow-hidden">
          <img src={heroImg} alt="Lac Léman et Alpes suisses" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70" />

          <div className="absolute top-6 left-6 z-10">
            <button onClick={() => navigate('/caby/services')} className="flex items-center gap-1 text-white/90 text-sm font-medium bg-white/15 backdrop-blur-md rounded-full px-4 py-2 hover:bg-white/25 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Services
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-6 pb-28 md:pb-32 z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
              VOYAGEZ MALIN.
            </h1>
            <p className="text-xl md:text-2xl font-bold text-white/90 mt-2">GENÈVE ↔ TOUTE LA SUISSE.</p>
            <p className="text-white/70 text-sm md:text-base mt-3">Siège partagé · Chauffeur certifié · Dès CHF 9</p>
          </div>
        </div>

        {/* ① SEARCH BAR — Overlapping hero, becomes sticky */}
        <div className="sticky top-0 z-40 -mt-20">
          <div className="max-w-5xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 md:p-5">
              {/* Trip type toggle */}
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setRoundTrip(false)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${!roundTrip ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  style={!roundTrip ? { backgroundColor: GOLD } : {}}>Aller simple</button>
                <button onClick={() => setRoundTrip(true)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${roundTrip ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  style={roundTrip ? { backgroundColor: GOLD } : {}}>
                  Aller-retour
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20">-5%</span>
                </button>
              </div>

              {/* Desktop: horizontal row / Mobile: stacked */}
              <div className="flex flex-col md:flex-row gap-3">
                <CityAutocomplete
                  value={from}
                  onChange={(c) => { setFrom(c); setTo(''); }}
                  placeholder="Ville, gare, aéroport..."
                  iconColor="#10b981"
                />

                <div className="hidden md:flex items-center">
                  <button onClick={() => { const t = from; setFrom(to || from); setTo(t); }}
                    className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-amber-400 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>

                <CityAutocomplete
                  value={to}
                  onChange={setTo}
                  placeholder="Destination"
                  iconColor="#ef4444"
                />

                <div className="flex-1 relative">
                  <button onClick={() => setCalendarOpen(!calendarOpen)}
                    className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm text-left font-medium text-gray-900 hover:bg-gray-100 transition-colors">
                    {calendarDateLabel || '📅 Date'}
                  </button>
                </div>

                <div className="w-full md:w-32">
                  <div className="flex items-center gap-1 h-12 rounded-xl bg-gray-50 border border-gray-200 px-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-7 h-7 flex items-center justify-center text-gray-500 font-bold">−</button>
                    <span className="text-sm font-bold text-gray-900 w-4 text-center">{passengers}</span>
                    <button onClick={() => setPassengers(Math.min(7, passengers + 1))} className="w-7 h-7 flex items-center justify-center text-gray-500 font-bold">+</button>
                  </div>
                </div>

                <Button onClick={() => { if (from && to) handleSearch(); else setStep('search'); }}
                  className="h-12 px-6 md:px-8 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl transition-shadow"
                  style={{ backgroundColor: GOLD }}>
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Button>
              </div>

              {/* Price Calendar Dropdown — Hero */}
              {calendarOpen && (
                <div className="mt-3">
                  <PriceCalendar
                    basePrice={calendarBasePrice}
                    roundTrip={roundTrip}
                    onToggleRoundTrip={setRoundTrip}
                    selectedDeparture={departureDateObj}
                    selectedReturn={returnDateObj}
                    onSelectDeparture={setDepartureDateObj}
                    onSelectReturn={setReturnDateObj}
                    onApply={() => handleCalendarApply(setCalendarOpen)}
                    onClear={handleCalendarClear}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ③ DESTINATIONS POPULAIRES — EasyJet grid */}
        <section className="max-w-5xl mx-auto px-4 mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Nos meilleures destinations au meilleur prix</h2>
            <p className="text-sm text-gray-500 mt-2">Réservez tôt et économisez jusqu'à 30%</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {DEST_CARDS.map((dest) => (
              <button key={dest.to} onClick={() => { setTo(dest.to); setStep('search'); }}
                className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group bg-white border border-gray-100 text-left">
                <div className="h-[140px] md:h-[160px] overflow-hidden">
                  <img src={dest.image} alt={dest.to} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-4">
                  <p className="text-base font-bold text-gray-900">{dest.to}</p>
                  <p className="text-xs text-gray-500">De {dest.from}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-black" style={{ color: GOLD }}>dès CHF {dest.fromPrice}</span>
                    <span className="text-[10px] text-gray-400">{dest.month}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ④ LAST MINUTE BANNER */}
        <section className="max-w-5xl mx-auto px-4 mt-12">
          <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: GOLD }}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-white" />
              <h3 className="text-lg font-black text-white uppercase tracking-wide">Des sièges à moins de CHF 19</h3>
            </div>
            <p className="text-white/80 text-sm">Partez cette semaine ! Places limitées.</p>
          </div>
          {activeDeals.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {activeDeals.slice(0, 4).map((deal, i) => (
                <motion.div key={deal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-500 text-white">−{deal.discount}%</span>
                  </div>
                  <div className="mt-8">
                    <p className="text-sm font-bold text-gray-900">{deal.from} → {deal.to}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400 line-through">CHF {deal.basePrice}</span>
                      <span className="text-lg font-black" style={{ color: GOLD }}>CHF {deal.finalPrice}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-[10px] text-gray-500">{deal.seatsAvailable} places</p>
                      {deal.countdown && <p className="text-[10px] font-bold text-red-500 animate-pulse">{deal.countdown}</p>}
                    </div>
                  </div>
                  <Button onClick={() => { setFrom(deal.from); setTo(deal.to); setStep('search'); }}
                    className="w-full mt-3 h-8 rounded-lg text-white text-xs font-bold" style={{ backgroundColor: GOLD }}>
                    Réserver
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ⑤ POURQUOI CABY VAN */}
        <section className="max-w-5xl mx-auto px-4 mt-16">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-8 uppercase tracking-tight">Pourquoi choisir Caby Van</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Leaf className="w-8 h-8 text-emerald-500" />, title: 'ÉCOLOGIQUE', desc: '6× moins de CO₂ vs voiture solo. Partagez un VAN, réduisez votre empreinte.' },
              { icon: <span className="text-3xl">💰</span>, title: 'ÉCONOMIQUE', desc: 'Moins cher que le train CFF. Prix dynamiques — réservez tôt, payez moins.' },
              { icon: <Shield className="w-8 h-8 text-blue-500" />, title: 'FIABLE', desc: 'Chauffeur certifié Caby. Assurance trajet incluse. Remboursement garanti.' },
            ].map(item => (
              <div key={item.title} className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ⑥ CABY PASS */}
        <section className="mt-16">
          <div className="py-12 px-4" style={{ backgroundColor: '#FDF8EE' }}>
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Star className="w-5 h-5" style={{ color: GOLD }} />
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Caby Pass · Vivez une expérience VIP</h2>
              </div>
              <p className="text-sm text-gray-600 max-w-xl mx-auto mb-6">
                Voyageur régulier sur la ligne Genève-Zurich ou Annecy-Genève ?<br />
                Le Caby Pass est rentabilisé dès 3 trajets par mois.
              </p>
              <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-8 py-5 shadow-lg border border-amber-200">
                <div className="text-left">
                  <p className="text-2xl font-black text-gray-900">CHF 29<span className="text-sm font-normal text-gray-500">/mois</span></p>
                  <p className="text-xs text-gray-500 mt-1">-10% sur tous vos trajets · Annulation flexible incluse</p>
                </div>
                <Button onClick={() => navigate('/caby-pass')}
                  className="h-11 px-6 rounded-xl text-white font-bold text-sm"
                  style={{ backgroundColor: GOLD }}>
                  Je découvre →
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ⑦ DESTINATIONS PHARES — Editorial cards */}
        <section className="max-w-5xl mx-auto px-4 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {EDITORIAL_CARDS.map(card => (
              <button key={card.title} onClick={() => { setTo(card.dest); setStep('search'); }}
                className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group text-left relative h-[280px]">
                <img src={card.image} alt={card.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                  <h3 className="text-base font-black text-white uppercase tracking-wide leading-tight">{card.title}</h3>
                  <p className="text-xs text-white/70 mt-1.5 leading-relaxed">{card.desc}</p>
                  <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-white/90 border border-white/30 rounded-full px-3 py-1.5 hover:bg-white/10 transition-colors">
                    {card.cta} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ⑧ COMPTEUR COMMUNAUTAIRE — Social proof */}
        <section className="mt-16 bg-gray-50 border-y border-gray-100 py-10">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: '🚗', value: "2'847", label: 'trajets ce mois' },
                { icon: '👥', value: "8'234", label: 'voyageurs satisfaits' },
                { icon: '🌿', value: '42 tonnes', label: 'CO₂ économisées' },
                { icon: '⭐', value: '4.9/5', label: 'satisfaction' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <span className="text-2xl">{stat.icon}</span>
                  <p className="text-2xl md:text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cross-border CTA */}
        <section className="max-w-5xl mx-auto px-4 mt-12">
          <button onClick={() => navigate('/caby/crossborder')}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-left shadow-lg hover:shadow-xl transition-shadow">
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

        <div className="h-24" />
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
                  <div className="mt-2">
                    <PlacesAutocomplete
                      value={pickupCustom}
                      onChange={setPickupCustom}
                      onPlaceSelect={(place) => setPickupCustom(place.address)}
                      placeholder="Tapez votre adresse, hôtel, gare..."
                    />
                  </div>
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
                  <div className="mt-2">
                    <PlacesAutocomplete
                      value={dropoffCustom}
                      onChange={setDropoffCustom}
                      onPlaceSelect={(place) => setDropoffCustom(place.address)}
                      placeholder="Tapez votre adresse, hôtel, bureau..."
                    />
                  </div>
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

            {/* Date + Time Selection with Price Calendar */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">📅 Date du trajet</label>
              <button onClick={() => setCalendarOpenSearch(!calendarOpenSearch)}
                className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm text-left font-medium text-gray-900 hover:bg-gray-100 transition-colors">
                {calendarDateLabel || 'Choisir une date — voir les prix'}
              </button>
            </div>

            {calendarOpenSearch && (
              <PriceCalendar
                basePrice={calendarBasePrice}
                roundTrip={roundTrip}
                onToggleRoundTrip={setRoundTrip}
                selectedDeparture={departureDateObj}
                selectedReturn={returnDateObj}
                onSelectDeparture={setDepartureDateObj}
                onSelectReturn={setReturnDateObj}
                onApply={() => handleCalendarApply(setCalendarOpenSearch)}
                onClear={handleCalendarClear}
              />
            )}

            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">🕐 Heure de départ</label>
              <select value={timeAller} onChange={(e) => setTimeAller(e.target.value)}
                className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm text-gray-900 font-medium">
                <option value="">Heure de départ</option>
                {availableTimeSlotsAller.map(s => (
                  <option key={s.time} value={s.time}>
                    {s.time === 'custom' ? '🕐 Heure personnalisée' : `${s.time} ${s.rushLevel === 'rush' ? '🔴 Rush' : s.rushLevel === 'creux' ? '🟢 Creux' : '🟡 Soirée'}`}
                  </option>
                ))}
              </select>
            </div>

            {roundTrip && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">🕐 Heure de retour</label>
                <select value={timeRetour} onChange={(e) => setTimeRetour(e.target.value)}
                  className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm text-gray-900 font-medium">
                  <option value="">Heure retour</option>
                  {availableTimeSlotsRetour.map(s => (
                    <option key={s.time} value={s.time}>
                      {s.time === 'custom' ? '🕐 Heure personnalisée' : `${s.time} ${s.rushLevel === 'rush' ? '🔴 Rush' : s.rushLevel === 'creux' ? '🟢 Creux' : '🟡 Soirée'}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {timeAller === 'custom' && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">Heure personnalisée aller</label>
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

  // ── RESULTS — Alps2Alps Style ──
  if (step === 'results' && selectedRoute) {
    const sharedVehicles = VEHICLES.filter(v => v.type === 'shared');
    const privateVehicles = VEHICLES.filter(v => v.type === 'private');
    const currentStep = 2;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* STEPPER */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {STEPPER_STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    s.num < currentStep ? 'bg-emerald-500 text-white' :
                    s.num === currentStep ? 'text-white' :
                    'bg-gray-200 text-gray-500'
                  }`} style={s.num === currentStep ? { backgroundColor: GOLD } : {}}>
                    {s.num < currentStep ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span className={`text-xs font-medium hidden md:inline ${s.num === currentStep ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
                </div>
                {i < STEPPER_STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${s.num < currentStep ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* TRIP RECAP — sticky */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-sm font-bold text-gray-900">{from} → {to}</p>
                  <p className="text-[11px] text-gray-500">{dateAller || "Aujourd'hui"} {effectiveTimeAller ? `· ${effectiveTimeAller}` : ''} · {passengers} adulte{passengers > 1 ? 's' : ''}</p>
                </div>
              </div>
              {roundTrip && (
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{to} → {from}</p>
                    <p className="text-[11px] text-gray-500">{dateRetour || "Retour"} {effectiveTimeRetour ? `· ${effectiveTimeRetour}` : ''} · {passengers} adulte{passengers > 1 ? 's' : ''}</p>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setStep('search')} className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50">
              <Edit2 className="w-3 h-3" /> Modifier le trajet
            </button>
          </div>
        </div>

        {/* MAIN CONTENT — Two columns */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT — Vehicle cards (70%) */}
            <div className="flex-1 lg:max-w-[70%] space-y-4">
              {/* Shared vehicles section */}
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                Sièges partagés
                <span className="text-xs font-normal text-gray-400 ml-1">— Voyagez à petit prix</span>
              </h3>

              {sharedVehicles.map(vehicle => {
                const price = getVehiclePrice(vehicle, routeBasePrice);
                const isSelected = selectedVehicle === vehicle.id;
                const isExpanded = expandedDetails === vehicle.id;
                return (
                  <motion.div key={vehicle.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border-2 overflow-hidden transition-all hover:shadow-md ${
                      isSelected ? 'border-amber-400 shadow-md' : 'border-amber-300'
                    }`}
                    style={{ backgroundColor: '#FDFAF4' }}>
                    <div className="flex flex-col md:flex-row relative">
                      {/* Recommended badge */}
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-md" style={{ backgroundColor: GOLD }}>
                        <Star className="w-3 h-3 fill-white" /> Recommandé
                      </div>

                      {/* Vehicle image — shared: larger with contain */}
                      <div className="w-full md:w-[200px] md:min-w-[200px] h-[160px] md:h-[130px] flex-shrink-0 flex items-center justify-center overflow-hidden rounded-lg m-2 p-3" style={{ backgroundColor: '#F5F5F5' }}>
                        <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-contain" loading="lazy" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-base font-bold text-gray-900">{vehicle.name}</h4>
                              <span className="flex items-center gap-0.5 text-[10px] font-medium text-gray-400 cursor-help" title="Siège partagé dans un VAN avec d'autres passagers">
                                Siège Partagé <Info className="w-3 h-3" />
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">Jusqu'à {vehicle.capacity} passagers</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                                <Users className="w-3.5 h-3.5 text-blue-500" /> Siège partagé
                              </span>
                              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                                <Leaf className="w-3 h-3" /> Écologique
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {vehicle.features.map(f => (
                            <span key={f} className="text-[11px] text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">{f}</span>
                          ))}
                        </div>

                        {/* Price selection */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <label className="flex items-center gap-3 flex-1 p-3 rounded-xl border border-gray-200 hover:border-amber-300 cursor-pointer transition-colors"
                            onClick={() => setSelectedVehicle(vehicle.id)}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-amber-500' : 'border-gray-300'}`}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GOLD }} />}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500">Trajet aller</p>
                              <p className="text-sm text-gray-400">Prix demandé</p>
                              <p className="text-lg font-black text-gray-900">CHF {price}.00</p>
                            </div>
                          </label>
                          {roundTrip && (
                            <label className="flex items-center gap-3 flex-1 p-3 rounded-xl border border-gray-200 hover:border-amber-300 cursor-pointer transition-colors"
                              onClick={() => { setSelectedVehicle(vehicle.id); setSameVehicleReturn(true); setSelectedVehicleReturn(vehicle.id); }}>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected && sameVehicleReturn ? 'border-amber-500' : 'border-gray-300'}`}>
                                {isSelected && sameVehicleReturn && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GOLD }} />}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-500">Trajet retour</p>
                                <p className="text-sm text-gray-400">Prix demandé</p>
                                <p className="text-lg font-black text-gray-900">CHF {price}.00</p>
                              </div>
                            </label>
                          )}
                        </div>

                        {roundTrip && isSelected && (
                          <button onClick={() => { setSameVehicleReturn(true); setSelectedVehicleReturn(vehicle.id); }}
                            className="text-[11px] font-medium mt-2 px-3 py-1 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">
                            Choisir même véhicule aller-retour
                          </button>
                        )}

                        {/* Expand details */}
                        <button onClick={() => setExpandedDetails(isExpanded ? null : vehicle.id)}
                          className="flex items-center gap-1 mt-3 text-xs font-medium text-blue-600 hover:text-blue-700">
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          {isExpanded ? 'Masquer les détails' : '+ Détails'}
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden">
                              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1.5">✓ Inclus dans le prix</p>
                                  {vehicle.details.included.map(i => (
                                    <p key={i} className="text-[11px] text-gray-600 flex items-center gap-1.5 mb-1">
                                      <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />{i}
                                    </p>
                                  ))}
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1.5">Options payantes</p>
                                  {vehicle.details.options.map(o => (
                                    <p key={o} className="text-[11px] text-gray-600 mb-1">+ {o}</p>
                                  ))}
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">🧳 Bagages</p>
                                  <p className="text-[11px] text-gray-600">{vehicle.details.luggage}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Annulation</p>
                                  <p className="text-[11px] text-gray-600">{vehicle.details.cancellation}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Separator banner */}
              <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 p-4 text-center my-6">
                <p className="text-white text-sm font-bold">Découvrez aussi nos transferts privés</p>
                <p className="text-white/60 text-xs mt-0.5">Véhicule privatisé pour votre groupe</p>
              </div>

              {/* Private vehicles */}
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Car className="w-5 h-5 text-gray-500" />
                Transferts Privés
                <span className="text-xs font-normal text-gray-400 ml-1">— Véhicule dédié</span>
              </h3>

              {privateVehicles.map(vehicle => {
                const price = getVehiclePrice(vehicle, routeBasePrice);
                const isSelected = selectedVehicle === vehicle.id;
                const isExpanded = expandedDetails === vehicle.id;
                return (
                  <motion.div key={vehicle.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-2xl border-2 overflow-hidden transition-all shadow-sm hover:shadow-md ${
                      isSelected ? 'border-amber-400 shadow-md' : 'border-gray-200'
                    }`}>
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-[200px] md:min-w-[200px] h-[160px] md:h-[130px] flex-shrink-0 flex items-center justify-center overflow-hidden rounded-lg m-2 p-3" style={{ backgroundColor: '#F5F5F5' }}>
                        <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-contain" loading="lazy" />
                      </div>
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-base font-bold text-gray-900">{vehicle.name}</h4>
                              <span className="flex items-center gap-0.5 text-[10px] font-medium text-gray-400 cursor-help">
                                Transfert Privé <Info className="w-3 h-3" />
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">Jusqu'à {vehicle.capacity} passagers</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Car className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-[11px] font-medium" style={{ color: GOLD }}>Transfert privé</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {vehicle.features.map(f => (
                            <span key={f} className="text-[11px] text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">{f}</span>
                          ))}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <label className="flex items-center gap-3 flex-1 p-3 rounded-xl border border-gray-200 hover:border-amber-300 cursor-pointer transition-colors"
                            onClick={() => setSelectedVehicle(vehicle.id)}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-amber-500' : 'border-gray-300'}`}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GOLD }} />}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500">{roundTrip ? 'Aller-retour' : 'Trajet aller'}</p>
                              <p className="text-lg font-black text-gray-900">CHF {roundTrip ? price * 2 - Math.round(price * 2 * 0.05) : price}.00</p>
                            </div>
                          </label>
                        </div>

                        {roundTrip && isSelected && (
                          <button onClick={() => { setSameVehicleReturn(false); }}
                            className="text-[11px] font-medium mt-2 px-3 py-1 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">
                            Choisir autre véhicule retour
                          </button>
                        )}

                        <button onClick={() => setExpandedDetails(isExpanded ? null : vehicle.id)}
                          className="flex items-center gap-1 mt-3 text-xs font-medium text-blue-600 hover:text-blue-700">
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          {isExpanded ? 'Masquer les détails' : '+ Détails'}
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden">
                              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1.5">✓ Inclus</p>
                                  {vehicle.details.included.map(i => (
                                    <p key={i} className="text-[11px] text-gray-600 flex items-center gap-1.5 mb-1"><Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />{i}</p>
                                  ))}
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1.5">Options</p>
                                  {vehicle.details.options.map(o => <p key={o} className="text-[11px] text-gray-600 mb-1">+ {o}</p>)}
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">🧳 Bagages</p>
                                  <p className="text-[11px] text-gray-600">{vehicle.details.luggage}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Annulation</p>
                                  <p className="text-[11px] text-gray-600">{vehicle.details.cancellation}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* RIGHT — Sidebar price recap (30%) — desktop sticky */}
            <div className="hidden lg:block lg:w-[30%]">
              <div className="sticky top-[76px] space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-900 mb-4">Récapitulatif</h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Trajet aller ({activeVehicle.type === 'shared' ? 'Partagé' : 'Privé'})</span>
                      <span className="font-bold text-gray-900">CHF {outboundPrice}</span>
                    </div>
                    {roundTrip && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Trajet retour ({(sameVehicleReturn ? activeVehicle : activeVehicleReturn).type === 'shared' ? 'Partagé' : 'Privé'})</span>
                        <span className="font-bold text-gray-900">CHF {returnPrice}</span>
                      </div>
                    )}
                    {roundTrip && roundTripDiscount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-emerald-600">Remise aller-retour -5%</span>
                        <span className="font-bold text-emerald-600">-CHF {roundTripDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Assurance trajet</span>
                      <span className="font-bold text-gray-900">CHF {resultsInsuranceFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">Total à payer</span>
                      <span className="text-xl font-black text-gray-900">CHF {resultsTotalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button onClick={handleVehicleContinue}
                    className="w-full mt-4 h-12 rounded-xl text-white font-bold text-sm shadow-lg"
                    style={{ backgroundColor: GOLD }}>
                    Continuer
                  </Button>

                  <div className="mt-4 space-y-2">
                    {[
                      '✓ Annulation gratuite jusqu\'à 24h avant',
                      '✓ Chauffeur certifié Caby',
                      '✓ Assurance trajet incluse',
                    ].map(t => (
                      <p key={t} className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <Shield className="w-3 h-3 text-emerald-500 flex-shrink-0" />{t}
                      </p>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                      <QrCode className="w-14 h-14 text-gray-400" />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5">📱 QR Code app Caby</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE — Sticky bottom bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-black text-gray-900">CHF {resultsTotalPrice.toFixed(2)}</p>
              <p className="text-[10px] text-gray-500">{activeVehicle.name}{roundTrip ? ' · Aller-retour' : ''}</p>
            </div>
            <Button onClick={handleVehicleContinue}
              className="h-11 px-8 rounded-xl text-white font-bold text-sm"
              style={{ backgroundColor: GOLD }}>
              Continuer
            </Button>
          </div>
        </div>

        <div className="h-20 lg:h-0" /> {/* Mobile spacer */}
      </div>
    );
  }

  // ── STEP 3: SEAT SELECTION ──
  if (step === 'seat' && selectedSlot && selectedRoute) {
    const currentStep = 3;
    return (
      <div className="min-h-screen bg-gray-50">
        {/* STEPPER */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {STEPPER_STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    s.num < currentStep ? 'bg-emerald-500 text-white' :
                    s.num === currentStep ? 'text-white' :
                    'bg-gray-200 text-gray-500'
                  }`} style={s.num === currentStep ? { backgroundColor: GOLD } : {}}>
                    {s.num < currentStep ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span className={`text-xs font-medium hidden md:inline ${s.num === currentStep ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
                </div>
                {i < STEPPER_STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${s.num < currentStep ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-5 py-8">
          <button onClick={() => setStep('results')} className="flex items-center gap-1 text-gray-500 mb-6">
            <ArrowLeft className="w-4 h-4" /> Retour aux véhicules
          </button>

          <div className="rounded-2xl bg-white border border-gray-200 p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">{from} → {to}</p>
                <p className="text-xs text-gray-500">{selectedSlot.departure} → {selectedSlot.arrivalEstimate} · {dateAller || "Aujourd'hui"}</p>
              </div>
              <p className="text-xl font-black" style={{ color: GOLD }}>CHF {slotPrice}</p>
            </div>
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-2">Choisissez votre siège</h2>
          <p className="text-sm text-gray-500 mb-4">Un siège choisi = un engagement. Sélectionnez votre place préférée dans le VAN.</p>

          <div className="rounded-2xl bg-white border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="relative mx-auto" style={{ width: 200 }}>
              <div className="border-2 border-gray-200 rounded-3xl p-4 pt-10 pb-6 bg-gray-50">
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

          {selectedSeat && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 mb-6 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <p className="text-sm text-emerald-700 font-medium">Siège N°{selectedSeat} sélectionné — {[1, 2].includes(selectedSeat) ? 'Rang avant, fenêtre' : [3, 5].includes(selectedSeat) ? 'Fenêtre' : 'Couloir'}</p>
            </div>
          )}

          <Button onClick={() => setStep('extras')} disabled={!selectedSeat}
            className="w-full text-white font-bold rounded-xl h-12 disabled:opacity-40 shadow-lg"
            style={{ backgroundColor: GOLD }}>
            Continuer vers les extras
          </Button>
        </div>
      </div>
    );
  }

  // ── STEP 4: EXTRAS & OPTIONS ──
  if (step === 'extras' && selectedSlot && selectedRoute) {
    const currentStep = 4;
    const extrasTotal = slotPrice + ancillaryTotal + INSURANCE_FEE;
    return (
      <div className="min-h-screen bg-gray-50">
        {/* STEPPER */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {STEPPER_STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    s.num < currentStep ? 'bg-emerald-500 text-white' :
                    s.num === currentStep ? 'text-white' :
                    'bg-gray-200 text-gray-500'
                  }`} style={s.num === currentStep ? { backgroundColor: GOLD } : {}}>
                    {s.num < currentStep ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span className={`text-xs font-medium hidden md:inline ${s.num === currentStep ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
                </div>
                {i < STEPPER_STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${s.num < currentStep ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-5 py-8">
          <button onClick={() => setStep('seat')} className="flex items-center gap-1 text-gray-500 mb-6">
            <ArrowLeft className="w-4 h-4" /> Retour au siège
          </button>

          <h2 className="text-lg font-bold text-gray-900 mb-2">Personnalisez votre trajet</h2>
          <p className="text-sm text-gray-500 mb-6">Ajoutez des extras pour un voyage encore plus confortable. Vous êtes déjà engagé — profitez-en !</p>

          {/* Ancillary options */}
          <div className="mb-6">
            <AncillarySelector selected={ancillaries} onChange={setAncillaries} basePrice={slotPrice} />
          </div>

          {/* Insurance (always included) */}
          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 mb-6 flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-blue-900">🛡️ Assurance trajet Caby</p>
              <p className="text-xs text-blue-700 mt-0.5">Protection passager incluse sur tous les trajets</p>
            </div>
            <p className="text-sm font-bold text-blue-900">CHF {INSURANCE_FEE.toFixed(2)}</p>
          </div>

          {/* Total recap */}
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Siège N°{selectedSeat}</span>
                <span className="font-bold text-gray-900">CHF {slotPrice}</span>
              </div>
              {ancillaryTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Options</span>
                  <span className="font-bold text-gray-900">+CHF {ancillaryTotal}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Assurance trajet</span>
                <span className="font-bold text-gray-900">CHF {INSURANCE_FEE.toFixed(2)}</span>
              </div>
              <div className="border-t border-amber-300 pt-2 mt-2 flex justify-between">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-xl font-black text-gray-900">CHF {extrasTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Button onClick={() => setStep('passenger')}
            className="w-full text-white font-bold rounded-xl h-12 shadow-lg"
            style={{ backgroundColor: GOLD }}>
            Continuer
          </Button>
        </div>
      </div>
    );
  }

  // ── STEP 5: PASSENGER INFO ──
  if (step === 'passenger' && selectedSlot && selectedRoute) {
    const currentStep = 5;
    const canContinue = passengerFirstName.trim() && passengerLastName.trim() && passengerEmail.trim() && passengerPhone.trim();
    return (
      <div className="min-h-screen bg-gray-50">
        {/* STEPPER */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {STEPPER_STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    s.num < currentStep ? 'bg-emerald-500 text-white' :
                    s.num === currentStep ? 'text-white' :
                    'bg-gray-200 text-gray-500'
                  }`} style={s.num === currentStep ? { backgroundColor: GOLD } : {}}>
                    {s.num < currentStep ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span className={`text-xs font-medium hidden md:inline ${s.num === currentStep ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
                </div>
                {i < STEPPER_STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${s.num < currentStep ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-5 py-8">
          <button onClick={() => setStep('extras')} className="flex items-center gap-1 text-gray-500 mb-6">
            <ArrowLeft className="w-4 h-4" /> Retour aux extras
          </button>

          <h2 className="text-lg font-bold text-gray-900 mb-2">Vos informations</h2>
          <p className="text-sm text-gray-500 mb-6">Nous avons besoin de vos coordonnées pour votre e-ticket et le chauffeur.</p>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Prénom *</label>
                <input type="text" value={passengerFirstName} onChange={(e) => setPassengerFirstName(e.target.value)}
                  className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm text-gray-900"
                  placeholder="Jean" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Nom *</label>
                <input type="text" value={passengerLastName} onChange={(e) => setPassengerLastName(e.target.value)}
                  className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm text-gray-900"
                  placeholder="Dupont" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Email *</label>
              <input type="email" value={passengerEmail} onChange={(e) => setPassengerEmail(e.target.value)}
                className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm text-gray-900"
                placeholder="jean.dupont@email.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Téléphone *</label>
              <input type="tel" value={passengerPhone} onChange={(e) => setPassengerPhone(e.target.value)}
                className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm text-gray-900"
                placeholder="+41 79 123 45 67" />
            </div>

            {isAirport && (
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">✈️ Numéro de vol (optionnel)</label>
                <input type="text" value={passengerFlightNo} onChange={(e) => setPassengerFlightNo(e.target.value)}
                  className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm text-gray-900"
                  placeholder="LX 1234" />
                <p className="text-[10px] text-gray-400 mt-1">Le chauffeur suivra votre vol en temps réel</p>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">🧳 Nombre de bagages</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setPassengerBagCount(Math.max(0, passengerBagCount - 1))} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200">−</button>
                <span className="text-lg font-bold text-gray-900 w-8 text-center">{passengerBagCount}</span>
                <button onClick={() => setPassengerBagCount(Math.min(5, passengerBagCount + 1))} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200">+</button>
                <span className="text-xs text-gray-500 ml-2">1 inclus, +CHF 10/bagage sup.</span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-gray-50 border border-gray-200 p-3 flex items-start gap-2">
            <Shield className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-500">Vos données sont protégées et ne sont partagées qu'avec votre chauffeur pour ce trajet. Le numéro de téléphone est masqué pendant la course.</p>
          </div>

          <Button onClick={() => setStep('payment')} disabled={!canContinue}
            className="w-full mt-6 text-white font-bold rounded-xl h-12 disabled:opacity-40 shadow-lg"
            style={{ backgroundColor: GOLD }}>
            Continuer vers le paiement
          </Button>
        </div>
      </div>
    );
  }

  // ── STEP 6: PAYMENT ──
  if (step === 'payment' && selectedSlot && selectedRoute) {
    const currentStep = 6;
    const extraBagFee = Math.max(0, passengerBagCount - 1) * 10;
    const grandTotal = slotPrice + ancillaryTotal + INSURANCE_FEE + extraBagFee;
    return (
      <div className="min-h-screen bg-gray-50">
        {/* STEPPER */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {STEPPER_STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    s.num < currentStep ? 'bg-emerald-500 text-white' :
                    s.num === currentStep ? 'text-white' :
                    'bg-gray-200 text-gray-500'
                  }`} style={s.num === currentStep ? { backgroundColor: GOLD } : {}}>
                    {s.num < currentStep ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span className={`text-xs font-medium hidden md:inline ${s.num === currentStep ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
                </div>
                {i < STEPPER_STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${s.num < currentStep ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-5 py-8">
          <button onClick={() => setStep('passenger')} className="flex items-center gap-1 text-gray-500 mb-6">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>

          <h2 className="text-lg font-bold text-gray-900 mb-6">Paiement</h2>

          {/* Recap */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4">Récapitulatif de la commande</h4>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{from} → {to} · Siège N°{selectedSeat}</span>
                <span className="font-bold text-gray-900">CHF {slotPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{selectedSlot.departure} → {selectedSlot.arrivalEstimate} · {dateAller || "Aujourd'hui"}</span>
                <span className="text-xs text-gray-400">{formatDuration(selectedRoute.duration)}</span>
              </div>
              {ancillaryTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Options extras</span>
                  <span className="font-bold text-gray-900">+CHF {ancillaryTotal}</span>
                </div>
              )}
              {extraBagFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bagages supplémentaires (×{passengerBagCount - 1})</span>
                  <span className="font-bold text-gray-900">+CHF {extraBagFee}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Assurance trajet Caby</span>
                <span className="font-bold text-gray-900">CHF {INSURANCE_FEE.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
                <span className="text-base font-bold text-gray-900">Total à payer</span>
                <span className="text-2xl font-black text-gray-900">CHF {grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Passenger recap */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-6">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Passager</h4>
            <p className="text-sm text-gray-700">{passengerFirstName} {passengerLastName}</p>
            <p className="text-xs text-gray-500">{passengerEmail} · {passengerPhone}</p>
            {passengerFlightNo && <p className="text-xs text-blue-600 mt-1">✈️ Vol {passengerFlightNo}</p>}
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4">Moyen de paiement</h4>
            <div className="space-y-3">
              {([
                { key: 'card' as const, label: '💳 Carte bancaire', desc: 'Visa, Mastercard, AMEX' },
                { key: 'twint' as const, label: '🟣 TWINT', desc: 'Paiement mobile suisse' },
                { key: 'applepay' as const, label: '🍎 Apple Pay', desc: 'Paiement rapide' },
              ]).map(pm => (
                <label key={pm.key} onClick={() => setPaymentMethod(pm.key)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    paymentMethod === pm.key ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === pm.key ? 'border-amber-500' : 'border-gray-300'
                  }`}>
                    {paymentMethod === pm.key && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GOLD }} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{pm.label}</p>
                    <p className="text-[11px] text-gray-500">{pm.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 mb-6 flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-500">
              En confirmant, vous acceptez les CGU de Caby. Ce trajet est organisé dans le cadre du covoiturage au sens de l'article L3132-1 du Code des transports. Le prix couvre uniquement les frais de trajet. Remboursement garanti en cas d'annulation par Caby.
            </p>
          </div>

          <Button onClick={() => setStep('confirm')}
            className="w-full text-white font-bold rounded-xl h-12 shadow-lg"
            style={{ backgroundColor: GOLD }}>
            <CreditCard className="w-4 h-4 mr-2" />
            Payer CHF {grandTotal.toFixed(2)}
          </Button>

          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-gray-400">
            <span>🔒 Paiement sécurisé</span>
            <span>🛡️ Garanti Caby</span>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 7: CONFIRMATION ──
  if (step === 'confirm' && selectedSlot && selectedRoute) {
    const extraBagFee = Math.max(0, passengerBagCount - 1) * 10;
    const grandTotal = slotPrice + ancillaryTotal + INSURANCE_FEE + extraBagFee;
    return (
      <div className="min-h-screen bg-white pb-24">
        <div className="px-5 pt-14 text-center max-w-2xl mx-auto">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-600" />
          </motion.div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Réservation confirmée !</h2>
          <p className="text-sm text-gray-500 mb-6">Votre e-ticket a été envoyé à {passengerEmail || 'votre email'}</p>

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
                ['Passager', `${passengerFirstName} ${passengerLastName}`],
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
                <span className="text-xl font-black text-gray-900">CHF {grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="border-t border-dashed border-gray-200 p-5 flex flex-col items-center bg-gray-50">
              <div className="w-32 h-32 rounded-xl bg-white flex items-center justify-center border border-gray-200">
                <QrCode className="w-20 h-20 text-gray-800" />
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Présentez ce QR code au chauffeur</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="outline" className="rounded-xl h-11 border-gray-300 text-gray-700 text-sm">
              📅 Ajouter au calendrier
            </Button>
            <Button variant="outline" className="rounded-xl h-11 border-gray-300 text-gray-700 text-sm">
              📄 Télécharger PDF
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3">
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

  return <div className="min-h-screen bg-white" />;
};

export default CabyVanPage;
