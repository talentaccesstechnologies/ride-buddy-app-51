import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Leaf, Users, Clock, MapPin, Luggage, Bike, QrCode, Check, X,
  CreditCard, Star, ChevronLeft, ChevronRight, Search, Percent, Zap, Shield, Car, SlidersHorizontal, Timer,
  Info, ChevronDown, ChevronUp, Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import zermattImg from '@/assets/zermatt.webp';
import zurichImg from '@/assets/zurich.webp';
import verbierImg from '@/assets/verbier.webp';
import lausanneImg from '@/assets/lausanne.webp';
import annecyImg from '@/assets/annecy.webp';
import lyonImg from '@/assets/lyon.webp';
import milanImg from '@/assets/milan.webp';
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
import { Home as HomeIcon, LayoutGrid, Clock as ClockIcon, Tag, User as UserIcon, Menu as MenuIcon } from 'lucide-react';
import heroImg from '@/assets/van-hero-alps.webp';
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
import CityPickerPopover from '@/components/van/CityPickerPopover';
import PassengerPickerPopover from '@/components/van/PassengerPickerPopover';
import PriceCalendar from '@/components/van/PriceCalendar';

type Step = 'hero' | 'search' | 'results' | 'seat' | 'extras' | 'passenger' | 'payment' | 'confirm' | 'abonnement';
type SortMode = 'price' | 'urgent' | 'earlybird';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const destinationParam = searchParams.get('destination') || '';
  const [step, setStep] = useState<Step>(destinationParam ? 'search' : 'hero');
  const [filter, setFilter] = useState<SegmentFilter>('all');
  const carouselRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarSearchRef = useRef<HTMLDivElement>(null);
  const [infoMenuOpen, setInfoMenuOpen] = useState(false);
  const infoMenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openInfoMenu = () => {
    if (infoMenuTimerRef.current) clearTimeout(infoMenuTimerRef.current);
    setInfoMenuOpen(true);
    setDestMenuOpen(false);
  };
  const closeInfoMenuDelayed = () => {
    if (infoMenuTimerRef.current) clearTimeout(infoMenuTimerRef.current);
    infoMenuTimerRef.current = setTimeout(() => setInfoMenuOpen(false), 250);
  };

  const [destMenuOpen, setDestMenuOpen] = useState(false);
  const destMenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openDestMenu = () => {
    if (destMenuTimerRef.current) clearTimeout(destMenuTimerRef.current);
    setDestMenuOpen(true);
    setInfoMenuOpen(false);
  };
  const closeDestMenuDelayed = () => {
    if (destMenuTimerRef.current) clearTimeout(destMenuTimerRef.current);
    destMenuTimerRef.current = setTimeout(() => setDestMenuOpen(false), 250);
  };

  const [activeService, setActiveService] = useState<'trajets' | 'ski' | 'crossborder'>('trajets');
  const [from, setFrom] = useState('Genève');
  const [to, setTo] = useState(destinationParam);

  const serviceCities: Record<string, string[]> = {
    trajets: ['Genève', 'Genève Aéroport (GVA)', 'Lausanne', 'Zurich', 'Zurich Aéroport (ZRH)', 'Berne', 'Bâle', 'Sion', 'Martigny', 'Montreux', 'Vevey', 'Neuchâtel', 'Fribourg', 'Nyon', 'Yverdon-les-Bains', 'La Chaux-de-Fonds', 'Brigue', 'Lugano'],
    ski: ['Genève', 'Lausanne', 'Verbier', 'Zermatt', 'Davos', 'Gstaad', 'Engelberg', 'Arosa', 'Chamonix', 'Morzine', 'Courchevel', "Val d'Isère", 'Sion', 'Martigny'],
    crossborder: ['Genève', 'Annecy', 'Lyon', 'Lyon Aéroport (LYS)', 'Annemasse', 'Ferney-Voltaire', 'Gex', 'Chambéry', 'Grenoble', 'Thonon-les-Bains', 'Évian-les-Bains', 'Milan', 'Munich', 'Paris', 'Strasbourg'],
  };

  const handleServiceChange = (service: 'trajets' | 'ski' | 'crossborder') => {
    setActiveService(service);
    setTo('');
    setDepartureDateObj(null);
    setReturnDateObj(null);
  };

  const [dateAller, setDateAller] = useState('');
  const [timeAller, setTimeAller] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [paxDetail, setPaxDetail] = useState<{ adults: number; children: number; babies: number }>({ adults: 1, children: 0, babies: 0 });
  const [roundTrip, setRoundTrip] = useState(false);
  const [dateRetour, setDateRetour] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarOpenSearch, setCalendarOpenSearch] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calendarOpen && calendarRef.current && !calendarRef.current.contains(e.target as Node)) setCalendarOpen(false);
      if (calendarOpenSearch && calendarSearchRef.current && !calendarSearchRef.current.contains(e.target as Node)) setCalendarOpenSearch(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [calendarOpen, calendarOpenSearch]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { setCalendarOpen(false); setCalendarOpenSearch(false); } };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

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
  const [passengerFirstName, setPassengerFirstName] = useState('');
  const [passengerLastName, setPassengerLastName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [passengerFlightNo, setPassengerFlightNo] = useState('');
  const [passengerBagCount, setPassengerBagCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'twint' | 'applepay'>('card');
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

  const isWeekendAller = useMemo(() => { if (!dateAller) return false; const d = new Date(dateAller); return d.getDay() === 0 || d.getDay() === 6; }, [dateAller]);
  const isWeekendRetour = useMemo(() => { if (!dateRetour) return false; const d = new Date(dateRetour); return d.getDay() === 0 || d.getDay() === 6; }, [dateRetour]);

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

  const sortedSlots = useMemo(() => {
    const copy = [...slotPricings];
    if (sortMode === 'price') copy.sort((a, b) => a.pricing.currentPrice - b.pricing.currentPrice);
    else if (sortMode === 'urgent') copy.sort((a, b) => a.pricing.hoursUntilDeparture - b.pricing.hoursUntilDeparture);
    else copy.sort((a, b) => (a.pricing.isEarlyBird ? 0 : 1) - (b.pricing.isEarlyBird ? 0 : 1) || a.pricing.currentPrice - b.pricing.currentPrice);
    return copy;
  }, [slotPricings, sortMode]);

  const ancillaryTotal = calculateAncillaryTotal(ancillaries);
  const slotPrice = selectedSlot ? (slotPricings.find(s => s.slot.id === selectedSlot.id)?.pricing.currentPrice || selectedSlot.basePrice) : 0;

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
    if (!from || !to || from === to) {
      // Pas assez d'info → bascule vers le formulaire détaillé
      setStep('search');
      return;
    }
    const params = new URLSearchParams({ from, to, passengers: String(passengers) });
    if (dateAller) params.set('date', dateAller);
    if (roundTrip && dateRetour) params.set('returnDate', dateRetour);
    navigate(`/caby/van/select?${params.toString()}`);
  };

  const formatDateForInput = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

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

  const flashDeals = useMemo(() => generateFlashDeals(), []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(interval);
  }, []);

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
                      <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" /><span>{f}</span>
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
      </div>
    );
  }

  // ── HERO — EasyJet-inspired Landing ──
  if (step === 'hero') {
    return (
      <div className="min-h-screen bg-white">

        {/* ═══ HEADER GOLD STICKY ═══ */}
        <header
          style={{
            background: GOLD,
            padding: '0 5%',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 200,
          }}
        >
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-1px' }}>
            caby
          </div>
          <nav style={{ display: 'flex', gap: 2, position: 'relative' }}>
            {/* ═══ LIEN INFORMATIONS AVEC MEGA-MENU ═══ */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={openInfoMenu}
              onMouseLeave={closeInfoMenuDelayed}
            >
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'rgba(0,0,0,0.75)',
                  padding: '6px 14px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: infoMenuOpen ? 'rgba(0,0,0,0.1)' : 'transparent',
                }}
              >
                Informations
                <ChevronDown size={14} style={{ transform: infoMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </a>

              {/* Mega-menu panel */}
              {infoMenuOpen && (
                <div
                  onMouseEnter={openInfoMenu}
                  onMouseLeave={closeInfoMenuDelayed}
                  style={{
                    position: 'fixed',
                    top: 56,
                    left: 0,
                    right: 0,
                    background: '#fff',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    borderTop: '1px solid #E0DDD5',
                    zIndex: 199,
                  }}
                >
                  <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '280px 1fr 1fr 320px', gap: 32, padding: '32px 5%' }}>
                    {/* Col 1 — Catégories */}
                    <div style={{ background: '#F8F7F2', borderRadius: 8, padding: 20, borderLeft: `3px solid ${GOLD}` }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0A0A0A', marginBottom: 6 }}>
                        Réservez votre prochain trajet
                      </div>
                      <p style={{ fontSize: 12, color: '#888780', lineHeight: 1.5, margin: 0 }}>
                        Inspirations, tarifs et services Caby pour tous vos déplacements en Suisse et au-delà.
                      </p>
                    </div>

                    {/* Col 2 — Mobilité Caby */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 14 }}>
                        Mobilité Caby
                      </div>
                      {[
                        { icon: '🚐', label: 'Réserver un trajet', desc: 'Caby Van, Ride, Cross-Border', to: '/caby/van' },
                        { icon: '💰', label: 'Trajets pas chers', desc: 'Dès CHF 18 en réservant tôt', to: '/caby/van/inspire?budget=under30' },
                        { icon: '📅', label: 'Calendrier des trajets', desc: 'Tous les départs disponibles', to: '/caby/van/inspire' },
                        { icon: '🌍', label: 'Où puis-je voyager ?', desc: 'Découvrez nos destinations', to: '/caby/van/inspire' },
                        { icon: '✨', label: 'Inspirez-moi', desc: 'Trouvez votre prochaine escapade', to: '/caby/van/inspire' },
                      ].map(item => (
                        <a
                          key={item.label}
                          href="#"
                          onClick={(e) => { e.preventDefault(); setInfoMenuOpen(false); navigate(item.to); }}
                          style={{ display: 'flex', gap: 12, padding: '10px 8px', borderRadius: 6, textDecoration: 'none', alignItems: 'flex-start' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#F8F7F2')}
                          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'transparent')}
                        >
                          <span style={{ fontSize: 18, lineHeight: 1, marginTop: 2 }}>{item.icon}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0A0A0A', marginBottom: 2 }}>{item.label}</div>
                            <div style={{ fontSize: 11, color: '#888780', lineHeight: 1.4 }}>{item.desc}</div>
                          </div>
                        </a>
                      ))}
                    </div>

                    {/* Col 3 — Préparation & Assistance */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 14 }}>
                        Préparer son voyage
                      </div>
                      {[
                        { icon: '🛂', label: 'Documents requis', desc: 'CNI / Passeport CH ↔ UE', to: '/caby/van/documents' },
                        { icon: '🧳', label: 'Bagages & options', desc: 'Cabine, soute, skis, vélos', to: '/caby/van/bagages' },
                        { icon: '🔄', label: 'Annulation flexible', desc: 'Modifiez jusqu\'à 2h avant', to: '/caby/van/flex-pass' },
                        { icon: '♿', label: 'Assistance spéciale', desc: 'PMR, mineurs, animaux', to: '/caby/van/assistance' },
                        { icon: '🆘', label: 'Aide & contact', desc: 'Centre d\'aide Caby 24/7', to: '/caby/account/help' },
                      ].map(item => (
                        <a
                          key={item.label}
                          href="#"
                          onClick={(e) => { e.preventDefault(); setInfoMenuOpen(false); navigate(item.to); }}
                          style={{ display: 'flex', gap: 12, padding: '10px 8px', borderRadius: 6, textDecoration: 'none', alignItems: 'flex-start' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#F8F7F2')}
                          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'transparent')}
                        >
                          <span style={{ fontSize: 18, lineHeight: 1, marginTop: 2 }}>{item.icon}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0A0A0A', marginBottom: 2 }}>{item.label}</div>
                            <div style={{ fontSize: 11, color: '#888780', lineHeight: 1.4 }}>{item.desc}</div>
                          </div>
                        </a>
                      ))}
                    </div>

                    {/* Col 4 — Tracking trajet */}
                    <div style={{ background: '#0A0A0A', borderRadius: 8, padding: 20, color: '#fff' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Trajet Tracker</div>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '0 0 14px', lineHeight: 1.5 }}>
                        Suivez le statut de votre trajet en temps réel
                      </p>
                      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 6, padding: 3, marginBottom: 12 }}>
                        <div style={{ flex: 1, padding: '7px', textAlign: 'center', background: '#fff', color: '#0A0A0A', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>Trajet</div>
                        <div style={{ flex: 1, padding: '7px', textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Itinéraire</div>
                      </div>
                      <input
                        type="text"
                        placeholder="N° de réservation"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: '#fff', fontSize: 12, marginBottom: 10, fontFamily: 'inherit' }}
                      />
                      <button
                        onClick={() => { setInfoMenuOpen(false); navigate('/caby/activity'); }}
                        style={{ width: '100%', padding: '10px', background: GOLD, color: '#0A0A0A', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        Consulter le statut
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ═══ DESTINATIONS — MEGA-MENU ═══ */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={openDestMenu}
              onMouseLeave={closeDestMenuDelayed}
            >
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.75)',
                  padding: '6px 14px', borderRadius: 6, textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: destMenuOpen ? 'rgba(0,0,0,0.1)' : 'transparent',
                }}
              >
                Destinations
                <ChevronDown size={14} style={{ transform: destMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </a>

              {destMenuOpen && (
                <div
                  onMouseEnter={openDestMenu}
                  onMouseLeave={closeDestMenuDelayed}
                  style={{
                    position: 'fixed', top: 56, left: 0, right: 0,
                    background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    borderTop: '1px solid #E0DDD5', zIndex: 199,
                  }}
                >
                  <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '280px 1fr 1fr 1fr', gap: 32, padding: '32px 5%' }}>
                    {/* Col 1 — Intro */}
                    <div style={{ background: '#F8F7F2', borderRadius: 8, padding: 20, borderLeft: `3px solid ${GOLD}` }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0A0A0A', marginBottom: 6 }}>
                        Toutes les destinations Caby
                      </div>
                      <p style={{ fontSize: 12, color: '#888780', lineHeight: 1.5, margin: '0 0 12px' }}>
                        De Genève vers la Suisse, la France et au-delà. Choisissez par catégorie.
                      </p>
                      <button
                        onClick={() => { setDestMenuOpen(false); navigate('/caby/van/inspire'); }}
                        style={{ background: '#0A0A0A', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        Voir toutes les destinations →
                      </button>
                    </div>

                    {/* Col 2 — Frontalier */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 14 }}>
                        Frontalier · Quotidien
                      </div>
                      {[
                        { icon: '🇫🇷', label: 'Annemasse', desc: '25 min · dès 8 CHF', city: 'Annemasse' },
                        { icon: '🇫🇷', label: 'Annecy', desc: '50 min · dès 14 CHF', city: 'Annecy' },
                        { icon: '🇫🇷', label: 'Saint-Julien', desc: '20 min · dès 7 CHF', city: 'Saint-Julien' },
                        { icon: '🇫🇷', label: 'Thonon · Évian', desc: '40 min · dès 12 CHF', city: 'Thonon-les-Bains' },
                        { icon: '🇫🇷', label: 'Pays de Gex', desc: '30 min · dès 9 CHF', city: 'Gex' },
                      ].map(item => (
                        <a
                          key={item.label}
                          href="#"
                          onClick={(e) => { e.preventDefault(); setDestMenuOpen(false); navigate(`/caby/van?destination=${encodeURIComponent(item.city)}`); }}
                          style={{ display: 'flex', gap: 12, padding: '10px 8px', borderRadius: 6, textDecoration: 'none', alignItems: 'flex-start' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#F8F7F2')}
                          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'transparent')}
                        >
                          <span style={{ fontSize: 18, lineHeight: 1, marginTop: 2 }}>{item.icon}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0A0A0A', marginBottom: 2 }}>{item.label}</div>
                            <div style={{ fontSize: 11, color: '#888780', lineHeight: 1.4 }}>{item.desc}</div>
                          </div>
                        </a>
                      ))}
                    </div>

                    {/* Col 3 — Suisse */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 14 }}>
                        Villes suisses
                      </div>
                      {[
                        { icon: '🏙️', label: 'Lausanne', desc: '40 min · Riviera lémanique', city: 'Lausanne' },
                        { icon: '🏙️', label: 'Zurich', desc: '2h45 · Centre + Aéroport', city: 'Zurich' },
                        { icon: '🏛️', label: 'Berne', desc: '2h00 · Capitale fédérale', city: 'Berne' },
                        { icon: '🌉', label: 'Bâle', desc: '2h30 · Trifrontière', city: 'Bâle' },
                        { icon: '🍇', label: 'Sion · Martigny', desc: '1h30 · Valais central', city: 'Sion' },
                      ].map(item => (
                        <a
                          key={item.label}
                          href="#"
                          onClick={(e) => { e.preventDefault(); setDestMenuOpen(false); navigate(`/caby/van?destination=${encodeURIComponent(item.city)}`); }}
                          style={{ display: 'flex', gap: 12, padding: '10px 8px', borderRadius: 6, textDecoration: 'none', alignItems: 'flex-start' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#F8F7F2')}
                          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'transparent')}
                        >
                          <span style={{ fontSize: 18, lineHeight: 1, marginTop: 2 }}>{item.icon}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0A0A0A', marginBottom: 2 }}>{item.label}</div>
                            <div style={{ fontSize: 11, color: '#888780', lineHeight: 1.4 }}>{item.desc}</div>
                          </div>
                        </a>
                      ))}
                    </div>

                    {/* Col 4 — Ski & Premium */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 14 }}>
                        Ski & Évasion
                      </div>
                      {[
                        { icon: '🎿', label: 'Verbier', desc: '2h · Premium · dès 65 CHF', city: 'Verbier' },
                        { icon: '⛷️', label: 'Chamonix', desc: '1h15 · dès 45 CHF', city: 'Chamonix' },
                        { icon: '🏂', label: 'Megève', desc: '1h30 · dès 55 CHF', city: 'Megève' },
                        { icon: '❄️', label: 'Zermatt', desc: '3h30 · Premium · dès 95 CHF', city: 'Zermatt' },
                        { icon: '✈️', label: 'GVA Aéroport', desc: '15 min · navettes 24/7', city: 'Genève Aéroport (GVA)' },
                      ].map(item => (
                        <a
                          key={item.label}
                          href="#"
                          onClick={(e) => { e.preventDefault(); setDestMenuOpen(false); navigate(`/caby/van?destination=${encodeURIComponent(item.city)}`); }}
                          style={{ display: 'flex', gap: 12, padding: '10px 8px', borderRadius: 6, textDecoration: 'none', alignItems: 'flex-start' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#F8F7F2')}
                          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'transparent')}
                        >
                          <span style={{ fontSize: 18, lineHeight: 1, marginTop: 2 }}>{item.icon}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0A0A0A', marginBottom: 2 }}>{item.label}</div>
                            <div style={{ fontSize: 11, color: '#888780', lineHeight: 1.4 }}>{item.desc}</div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Liens directs Pass / Cross-Border / Ski */}
            {[
              { label: 'Caby Pass', to: '/caby/van/pass' },
              { label: 'Cross-Border', to: '/caby/van/crossborder' },
              { label: 'Ski', to: '/caby/van/ski' },
            ].map(link => (
              <a
                key={link.label}
                href="#"
                onClick={(e) => { e.preventDefault(); navigate(link.to); }}
                style={{ fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.75)', padding: '6px 14px', borderRadius: 6, textDecoration: 'none' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(0,0,0,0.1)')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'transparent')}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <button
            onClick={() => navigate('/auth/login')}
            style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A', background: 'rgba(0,0,0,0.12)', border: 'none', borderRadius: 6, padding: '7px 16px', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Se connecter
          </button>
        </header>

        {/* ═══ BANDEAU PROMO CABY PASS ═══ */}
        <div
          style={{
            background: '#fff',
            borderBottom: '1px solid #E0DDD5',
            padding: '9px 5%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: 13,
          }}
        >
          <strong style={{ color: '#A07830' }}>Caby Pass</strong>
          <span style={{ color: '#1A1A1A' }}>· −10% sur tous vos trajets dès CHF 29/mois ·</span>
          <a href="#" style={{ color: '#A07830', fontWeight: 700, textDecoration: 'none' }}>
            <strong>Inscrivez-vous</strong>
          </a>
        </div>

        {/* ═══ HERO PLEIN ÉCRAN (TRAITEMENT SOMBRE EASYJET) ═══ */}
        <div style={{ position: 'relative', background: '#071020', overflow: 'hidden', minHeight: 620 }}>
          <img
            src={heroImg}
            alt="Lac Léman et Alpes suisses"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%', opacity: 0.5 }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '65%',
              background: 'linear-gradient(to bottom, transparent 0%, rgba(7,16,32,0.72) 55%, rgba(7,16,32,0.88) 100%)',
              pointerEvents: 'none',
            }}
          />

          <div className="relative z-10 flex flex-col items-center" style={{ paddingTop: 40, paddingBottom: 60, paddingLeft: '5%', paddingRight: '5%' }}>

            {/* ══ MOTEUR DE RECHERCHE — 1200px pixel-perfect EasyJet ══ */}
            <div className="bg-white rounded-xl shadow-2xl" style={{ width: '100%', maxWidth: 1200, padding: '20px 22px 28px', margin: '30px 0 20px' }}>

              {/* Onglets + toggle */}
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #E0DDD5', marginBottom: 18 }}>
                {(['trajets', 'ski', 'crossborder'] as const).map(tab => {
                  const labels = { trajets: { label: 'Trajets', icon: '🚐' }, ski: { label: 'Ski', icon: '🎿' }, crossborder: { label: 'Cross-Border', icon: '🌍' } };
                  return (
                    <button key={tab} onClick={() => handleServiceChange(tab)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 16px', marginBottom: -2, borderBottom: `3px solid ${activeService === tab ? GOLD : 'transparent'}`, color: activeService === tab ? '#A07830' : '#888780', background: 'none', border: 'none', borderBottomWidth: 3, borderBottomStyle: 'solid' as const, borderBottomColor: activeService === tab ? GOLD : 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'inherit' }}>
                      <span style={{ fontSize: 14 }}>{labels[tab].icon}</span>{labels[tab].label}
                    </button>
                  );
                })}
                <div style={{ marginLeft: 'auto', display: 'flex' }}>
                  <button onClick={() => setRoundTrip(false)} style={{ fontSize: 12, fontWeight: 500, padding: '6px 12px', border: '1px solid #E0DDD5', cursor: 'pointer', borderRadius: '6px 0 0 6px', background: !roundTrip ? GOLD : '#fff', color: !roundTrip ? '#0A0A0A' : '#888780', fontFamily: 'inherit' }}>Aller simple</button>
                  <button onClick={() => setRoundTrip(true)} style={{ fontSize: 12, fontWeight: 500, padding: '6px 12px', border: '1px solid #E0DDD5', borderLeft: 'none', cursor: 'pointer', borderRadius: '0 6px 6px 0', background: roundTrip ? GOLD : '#fff', color: roundTrip ? '#0A0A0A' : '#888780', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Aller-retour
                    <span style={{ background: '#E8F5E9', color: '#2E7D32', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 100, marginLeft: 3 }}>-5%</span>
                  </button>
                </div>
              </div>

              {/* Champs — grille pixel-perfect */}
              <div style={{ display: 'grid', gridTemplateColumns: '224px 228px 228px 228px 208px', gap: 10, alignItems: 'center' }}>
                {/* De */}
                <CityPickerPopover
                  fieldLabel="De"
                  placeholder="Choisir une ville"
                  value={from}
                  cities={serviceCities[activeService]}
                  onSelect={(city) => { setFrom(city); setTo(''); setPickupLabel(''); setPickupAddress(''); setPickupCustom(''); }}
                />
                {/* À */}
                <CityPickerPopover
                  fieldLabel="À"
                  placeholder={activeService === 'ski' ? 'Verbier, Zermatt...' : activeService === 'crossborder' ? 'Annecy, Lyon, Milan...' : 'Pays, ville, gare...'}
                  value={to}
                  cities={serviceCities[activeService].filter(c => c !== from)}
                  onSelect={(city) => { setTo(city); setDropoffLabel(''); setDropoffAddress(''); setDropoffCustom(''); }}
                />

                {/* Dates */}
                <div ref={calendarRef} style={{ position: 'relative' as const }}>
                  <button onClick={() => setCalendarOpen(!calendarOpen)} style={{ display: 'flex', flexDirection: 'column', gap: 2, border: '1.5px solid #E0DDD5', borderRadius: 8, padding: '0 14px', height: 48, cursor: 'pointer', justifyContent: 'center', background: '#fff', boxSizing: 'border-box' as const, width: '100%', textAlign: 'left', fontFamily: 'inherit' }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' as const, color: '#888780', lineHeight: 1, marginBottom: 3 }}>Dates de voyage</div>
                    <div style={{ fontSize: 14, color: calendarDateLabel ? '#1A1A1A' : '#B8B5AD', fontWeight: calendarDateLabel ? 500 : 400, lineHeight: 1, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{calendarDateLabel || 'Choisir une date'}</div>
                  </button>
                  {calendarOpen && (
                    <div onClick={() => setCalendarOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 18, 25, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                      <div ref={calendarRef} onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 980, maxHeight: '92vh', overflow: 'auto' }}>
                        <PriceCalendar basePrice={calendarBasePrice} roundTrip={roundTrip} onToggleRoundTrip={setRoundTrip} selectedDeparture={departureDateObj} selectedReturn={returnDateObj} onSelectDeparture={setDepartureDateObj} onSelectReturn={setReturnDateObj} onApply={() => handleCalendarApply(setCalendarOpen)} onClear={handleCalendarClear} />
                      </div>
                    </div>
                  )}
                </div>
                {/* Qui */}
                <PassengerPickerPopover
                  fieldLabel="Qui"
                  value={paxDetail}
                  onChange={(v) => { setPaxDetail(v); setPassengers(Math.max(1, v.adults + v.children)); }}
                  maxTotal={7}
                />

                {/* CTA Bouton */}
                <button
                  onClick={() => { if (from && to) handleSearch(); else setStep('search'); }}
                  style={{ width: 208, height: 48, margin: 0, padding: 0, background: GOLD, color: '#0A0A0A', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' as const, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as const, lineHeight: 1.3, transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#E8C96A'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = GOLD; }}
                >
                  Afficher<br/>les trajets
                </button>
              </div>
            </div>

            {/* ══ TAGLINE ══ */}
            <div style={{ textAlign: 'center', padding: '32px 0 48px', color: '#fff', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4.5vw, 52px)', fontWeight: 900, lineHeight: 1.05, textShadow: '0 2px 16px rgba(0,0,0,0.5)', margin: 0, letterSpacing: '-0.5px' }}>
                Voyagez malin.<br />Genève ↔ Suisse &amp; Europe.
              </h1>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 8px rgba(0,0,0,0.4)', margin: 0 }}>
                Siège partagé · Chauffeur certifié · Dès CHF 9
              </p>
            </div>

            {/* ══ 2 CARDS PROMO — 440x248px ══ */}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' as const }}>
              <div style={{ background: 'rgba(255,255,255,0.96)', borderRadius: 12, width: 440, height: 248, padding: 15, margin: '0 14px 28px 14px', boxSizing: 'border-box' as const, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 10, lineHeight: 1.3, textTransform: 'uppercase' as const, letterSpacing: '-0.2px' }}>Des sièges à moins de CHF 19*</h2>
                  <p style={{ fontSize: 13, color: '#888780', lineHeight: 1.6, margin: 0 }}>Genève–Annecy, Genève–Lausanne, Genève–Zurich... Et la ligne Genève–Lyon à partir de CHF 42 ! Réservez tôt et économisez jusqu'à 30%.</p>
                </div>
                <button onClick={() => navigate('/caby/van/inspire?budget=under30')} style={{ display: 'block', width: 215, height: 48, background: GOLD, color: '#0A0A0A', border: 'none', borderRadius: 8, padding: '11px 16px', boxSizing: 'border-box' as const, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'center', margin: '0 auto', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#E8C96A'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = GOLD; }}
                >Voir les destinations</button>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.96)', borderRadius: 12, width: 440, height: 248, padding: 15, margin: '0 14px 28px 14px', boxSizing: 'border-box' as const, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 10, lineHeight: 1.3, textTransform: 'uppercase' as const, letterSpacing: '-0.2px' }}>Et pourquoi pas une station de ski ?</h2>
                  <p style={{ fontSize: 13, color: '#888780', lineHeight: 1.6, margin: 0 }}>Verbier, Zermatt, Chamonix, Davos — votre station favorite en van partagé. Chauffeur certifié, skis pris en charge dès CHF 35.</p>
                </div>
                <button onClick={() => navigate('/caby/van/inspire?category=ski')} style={{ display: 'block', width: 215, height: 48, background: GOLD, color: '#0A0A0A', border: 'none', borderRadius: 8, padding: '11px 16px', boxSizing: 'border-box' as const, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'center', margin: '0 auto', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#E8C96A'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = GOLD; }}
                >Je réserve mon van ski</button>
              </div>
            </div>

          </div>
        </div>

        {/* ═══ SECTIONS SOUS LE HERO ═══ */}
        <div className="bg-white">

          {/* ═══ DESTINATIONS GRID — 6 colonnes 179.906px (référence HTML) ═══ */}
          <section style={{ background: '#fff' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px' }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <h2 style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 700, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '-0.3px', margin: 0 }}>
                  Nos meilleures destinations au meilleur prix
                </h2>
                <p style={{ fontSize: 14, color: '#888780', marginTop: 4 }}>
                  Réservez tôt et économisez jusqu'à 30%
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 179.906px)', gap: 24, justifyContent: 'center', isolation: 'isolate' }}>
                {[
                  { city: 'Annecy',   img: annecyImg,   price: 15, month: 'avr. 2026' },
                  { city: 'Lausanne', img: lausanneImg, price: 18, month: 'avr. 2026' },
                  { city: 'Zurich',   img: zurichImg,   price: 54, month: 'avr. 2026' },
                  { city: 'Verbier',  img: verbierImg,  price: 35, month: 'avr. 2026' },
                  { city: 'Lyon',     img: lyonImg,     price: 42, month: 'avr. 2026' },
                  { city: 'Zermatt',  img: zermattImg,  price: 55, month: 'mai 2026' },
                ].map(d => (
                  <div
                    key={d.city}
                    onClick={() => { setTo(d.city); setStep('search'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="group relative overflow-hidden cursor-pointer bg-white transition-all duration-200"
                    style={{ width: 179.906, minHeight: 303.13, borderRadius: 10, border: '1px solid #E0DDD5' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                      (e.currentTarget as HTMLDivElement).style.borderColor = GOLD;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                      (e.currentTarget as HTMLDivElement).style.borderColor = '#E0DDD5';
                    }}
                  >
                    {/* Image wrap — image zoom + brightness on hover */}
                    <div style={{ overflow: 'hidden', height: 132, flexShrink: 0 }}>
                      <img
                        src={d.img}
                        alt={d.city}
                        className="w-full h-full object-cover block transition-all duration-200 group-hover:scale-105 group-hover:brightness-75"
                      />
                    </div>

                    {/* Info block — slides up 48px on hover, warm off-white bg */}
                    <div
                      className="flex flex-col justify-between bg-white transition-all duration-200 group-hover:-translate-y-12 group-hover:bg-[#FDFAF4]"
                      style={{ padding: '12px 14px', height: 171.13, boxSizing: 'border-box' }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 3 }}>{d.city}</div>
                        <div style={{ fontSize: 11, color: '#888780', marginBottom: 8 }}>De Genève</div>
                        <div
                          className="transition-colors duration-200 group-hover:bg-[rgba(201,168,76,0.3)]"
                          style={{ height: 1, background: '#E0DDD5', marginBottom: 8 }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div style={{ fontSize: 12, color: '#888780', lineHeight: 1.3 }}>
                          à partir de
                          <strong style={{ fontSize: 16, fontWeight: 700, color: '#A07830', display: 'block', marginTop: 1 }}>
                            CHF {d.price}
                          </strong>
                        </div>
                        <div
                          className="transition-opacity duration-150 group-hover:opacity-0"
                          style={{ fontSize: 11, color: '#888780' }}
                        >
                          {d.month}
                        </div>
                      </div>
                    </div>

                    {/* Reveal button — slides up from bottom on hover */}
                    <div
                      className="absolute left-0 right-0 bottom-0 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-200"
                      style={{ height: 48, background: '#FDFAF4', padding: '8px 14px', zIndex: 3 }}
                    >
                      <button
                        onClick={e => { e.stopPropagation(); setTo(d.city); setStep('search'); }}
                        style={{ display: 'block', width: '100%', padding: '10px 0', background: GOLD, color: '#0A0A0A', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, textAlign: 'center', cursor: 'pointer', letterSpacing: '0.3px', transition: 'background 0.15s' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#E8C96A')}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = GOLD)}
                      >
                        En savoir plus
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 11, color: '#888780', marginTop: 14, textAlign: 'center' }}>
                * Prix valable pour 1 siège aller simple, toutes taxes incluses, à disponibilité limitée.
              </div>
            </div>
          </section>

          {/* ═══ NOS DESTINATIONS PHARES — 3 cards hover reveal ═══ */}
          <section style={{ background: '#F2F0E8', padding: '60px 5%' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <h2 style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 700, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '-0.3px', margin: 0 }}>
                  Nos destinations phares
                </h2>
                <p style={{ fontSize: 14, color: '#888780', marginTop: 4 }}>
                  Elles n'attendent plus que vous&nbsp;!
                </p>
              </div>
              <div className="caby-pgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 28, overflow: 'hidden' }}>
                {[
                  {
                    tag: 'Ski & Montagne',
                    title: 'Traversez les Alpes en van dès CHF 35',
                    desc: "Des pistes à perte de vue, l'air pur des sommets. Votre van vous attend au pied des Alpes.",
                    img: 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=600&q=80&fit=crop',
                    cta: 'Voir les destinations ski',
                    action: () => navigate('/caby/van/inspire?category=ski'),
                  },
                  {
                    tag: 'Cross-Border',
                    title: 'Séjour Annecy — le lac de Haute-Savoie',
                    desc: 'Ses canaux, son lac turquoise, ses ruelles médiévales. Annecy, à 45 minutes de Genève.',
                    img: annecyImg,
                    cta: 'Voir les destinations France',
                    action: () => navigate('/caby/van/inspire?region=france'),
                  },
                  {
                    tag: 'Suisse romande',
                    title: 'Dès CHF 54 : Zurich, Berne, Bâle',
                    desc: "Vivante, créative, surprenante. La Suisse comme vous ne l'avez jamais vue.",
                    img: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=600&q=80&fit=crop',
                    cta: 'Voir les destinations Suisse',
                    action: () => navigate('/caby/van/inspire?region=suisse'),
                  },
                ].map(p => (
                  <div
                    key={p.tag}
                    className="group relative overflow-hidden cursor-pointer bg-white transition-all duration-200"
                    style={{ border: '1px solid #E0DDD5', borderRadius: 12, height: 556 }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.14)';
                      (e.currentTarget as HTMLDivElement).style.borderColor = GOLD;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                      (e.currentTarget as HTMLDivElement).style.borderColor = '#E0DDD5';
                    }}
                  >
                    <div style={{ overflow: 'hidden', height: 312, flexShrink: 0 }}>
                      <img
                        src={p.img}
                        alt={p.title}
                        className="w-full h-full object-cover block transition-all duration-200 group-hover:scale-105 group-hover:brightness-75"
                      />
                    </div>
                    <div
                      className="flex flex-col bg-white transition-all duration-200 group-hover:-translate-y-[70px] group-hover:bg-[#FDFAF4]"
                      style={{ padding: 24, height: 244, boxSizing: 'border-box', gap: 10 }}
                    >
                      <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#A07830', background: 'rgba(201,168,76,0.12)', padding: '3px 10px', borderRadius: 100, alignSelf: 'flex-start' }}>
                        {p.tag}
                      </span>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '-0.2px', lineHeight: 1.3 }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 300, color: '#888780', lineHeight: 1.55, fontStyle: 'italic' }}>
                        {p.desc}
                      </div>
                    </div>
                    <div
                      className="absolute left-0 right-0 bottom-0 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-200"
                      style={{ height: 70, background: '#FDFAF4', padding: '11px 0', boxSizing: 'border-box', zIndex: 3 }}
                    >
                      <button
                        onClick={e => { e.stopPropagation(); p.action(); }}
                        style={{ width: 215, height: 48, background: GOLD, color: '#0A0A0A', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.3px', transition: 'background 0.15s', padding: '11px 16px', boxSizing: 'border-box', textAlign: 'center' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#E8C96A')}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = GOLD)}
                      >
                        {p.cta}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══ NOTRE TRAJET COUP DE CŒUR — Lac Léman 2-col card ═══ */}
          <section style={{ background: '#fff' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px' }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <h2 style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 700, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '-0.3px', margin: 0 }}>
                  Notre trajet coup de cœur
                </h2>
                <p style={{ fontSize: 14, color: '#888780', marginTop: 4 }}>
                  Faites vos valises et réservez ce voyage dont vous rêvez tant&nbsp;!
                </p>
              </div>
              <div className="caby-cccard" style={{ border: '1px solid #E0DDD5', borderRadius: 12, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: 28 }}>
                <div style={{ padding: '40px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: GOLD, marginBottom: 12 }}>
                    Coup de cœur Caby
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, marginBottom: 12 }}>
                    Le Lac Léman,<br />plein de vie.
                  </div>
                  <div style={{ fontSize: 14, color: '#888780', lineHeight: 1.7, marginBottom: 22 }}>
                    Lausanne, Montreux, Évian — le Lac Léman est simple à vivre, proche, accueillant. Les choses ne sont pas artificielles. On les ressent.
                  </div>
                  <button
                    onClick={() => navigate('/caby/van/leman')}
                    style={{ alignSelf: 'flex-start', background: GOLD, color: '#0A0A0A', border: 'none', borderRadius: 8, padding: '12px 24px', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#E8C96A')}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = GOLD)}
                  >
                    Découvrir le Lac Léman
                  </button>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&fit=crop"
                  alt="Lac Léman"
                  style={{ width: '100%', height: 340, objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          </section>

          {/* ═══ VOUS ÊTES À UN TRAJET DU BONHEUR — image grid + Caby Pass signup ═══ */}
          <section style={{ background: '#F8F7F2', padding: '60px 5%' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <h2 style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 700, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '-0.3px', margin: 0 }}>
                  Vous êtes à un trajet du bonheur...
                </h2>
                <p style={{ fontSize: 14, color: '#888780', marginTop: 4 }}>
                  Découvrez la Suisse et ses voisins autrement
                </p>
              </div>
              <div className="caby-pgridp" style={{ display: 'grid', gridTemplateColumns: '718.35px 394.64px', gap: 18.35, alignItems: 'start', marginTop: 28, justifyContent: 'center' }}>
                <div style={{ width: 718.35, height: 431, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', columnGap: 18.35, rowGap: 38.55 }}>
                  <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80&fit=crop" alt="Paris" style={{ width: 350, height: 253.97, objectFit: 'cover', display: 'block', borderRadius: 8 }} />
                  <img src={lausanneImg} alt="Lausanne" style={{ width: 350, height: 253.97, objectFit: 'cover', display: 'block', borderRadius: 8 }} />
                  <img src={milanImg} alt="Milan" style={{ width: 350, height: 253.97, objectFit: 'cover', display: 'block', borderRadius: 8 }} />
                  <div style={{ width: 350, height: 253.97, borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                    <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80&fit=crop" alt="Caby" style={{ width: 350, height: 253.97, objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(201,168,76,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-1px' }}>caby</span>
                    </div>
                  </div>
                </div>
                <div style={{ width: 394.64, height: 546.49, background: '#0A0A0A', borderRadius: 12, padding: '20px 32px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                  <div style={{ height: 70, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: GOLD, marginBottom: 6 }}>
                      Voyageur régulier
                    </div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                      Caby Pass : Vivez une expérience VIP
                    </div>
                  </div>
                  <div style={{ height: 286, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 15 }}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                      Voyagez régulièrement sur les lignes Genève–Zurich ou Annecy–Genève&nbsp;? Rentabilisé dès 3 trajets par mois.
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, color: GOLD, lineHeight: 1 }}>
                        CHF 29
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                        par mois · résiliable à tout moment
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {['−10% sur tous vos trajets', 'Réservation prioritaire', 'Annulation flexible'].map(benefit => (
                        <div key={benefit} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: GOLD, fontWeight: 700 }}>✓</span> {benefit}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setStep('abonnement')}
                    style={{ width: 215, height: 48, background: GOLD, color: '#0A0A0A', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: '11px 16px', boxSizing: 'border-box', textAlign: 'center', transition: 'background 0.15s', letterSpacing: '0.3px' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#E8C96A')}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = GOLD)}
                  >
                    Je m'abonne
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ═══ RESPONSIVE HELPERS pour les nouvelles sections ═══ */}
          <style>{`
            @media (max-width: 900px) {
              .caby-pgrid { grid-template-columns: 1fr !important; }
              .caby-cccard { grid-template-columns: 1fr !important; }
              .caby-pgridp { grid-template-columns: 1fr !important; justify-content: stretch !important; }
              .caby-pgridp > div:first-child { width: 100% !important; height: auto !important; }
              .caby-pgridp > div:last-child { width: 100% !important; height: auto !important; }
            }
          `}</style>

          <div className="h-24" />
        </div>
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
          {filter === 'grand_geneve' && (<div className="rounded-xl bg-orange-50 border border-orange-200 p-3 mb-4 flex items-start gap-2"><span className="text-sm mt-0.5">🚗</span><div><p className="text-xs font-bold text-orange-800">Navettes frontalières quotidiennes</p><p className="text-[10px] text-orange-600">Créneaux fixes matin (6h-8h30) et soir (17h-19h30)</p></div></div>)}
          {filter === 'valais' && (<div className="rounded-xl bg-purple-50 border border-purple-200 p-3 mb-4 flex items-start gap-2"><span className="text-sm mt-0.5">🍷</span><div><p className="text-xs font-bold text-purple-800">Valais & Riviera — Pays du Vin & des Alpes</p><p className="text-[10px] text-purple-600">Vignobles du Lavaux UNESCO · Montreux Jazz · Vallée du Rhône</p></div></div>)}
          {filter === 'horlogerie' && (<div className="rounded-xl bg-amber-50 border border-amber-200 p-3 mb-4 flex items-start gap-2"><span className="text-sm mt-0.5">⌚</span><div><p className="text-xs font-bold text-amber-800">Jura & Route Horlogère</p><p className="text-[10px] text-amber-600">Service premium pour l'industrie horlogère — Rolex, Patek Philippe</p></div></div>)}
          {filter === 'international' && (<div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3 mb-4 flex items-start gap-2"><span className="text-sm mt-0.5">🌍</span><div><p className="text-xs font-bold text-indigo-800">Routes internationales — Via Simplon</p><p className="text-[10px] text-indigo-600">Passeport ou carte d'identité requis · Prix en CHF et EUR</p></div></div>)}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">Ville de départ</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <select value={from} onChange={(e) => { setFrom(e.target.value); setTo(''); setPickupLabel(''); setPickupAddress(''); setPickupCustom(''); }} className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 pl-9 pr-4 text-sm text-gray-900 font-medium">
                  {ALL_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-center -my-1">
              <button onClick={() => { const t = from; setFrom(to || from); setTo(t); }} className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-amber-400 transition-colors">
                <ArrowRight className="w-3.5 h-3.5 text-gray-500 rotate-90" />
              </button>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">Ville d'arrivée</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-red-500" />
                <select value={to} onChange={(e) => { setTo(e.target.value); setDropoffLabel(''); setDropoffAddress(''); setDropoffCustom(''); }} className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 pl-9 pr-4 text-sm text-gray-900 font-medium">
                  <option value="">Choisir une destination</option>
                  {destinations.map(c => { const r = findRoute(from, c); return <option key={c} value={c}>{c}{r?.seasonal ? ' ❄️' : ''}{r?.daily ? ' 🚗' : ''} — {r ? formatDuration(r.duration) : ''} · CHF {r?.basePrice}</option>; })}
                </select>
              </div>
            </div>
            {from && (<div><label className="text-xs text-gray-500 mb-1 block font-medium">📍 Adresse de prise en charge</label><select value={pickupLabel} onChange={(e) => { const pt = pickupPoints.find(p => p.label === e.target.value); setPickupLabel(e.target.value); setPickupAddress(pt?.address || ''); setPickupCustom(''); }} className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm text-gray-900 font-medium"><option value="">Choisir un point de pickup</option>{pickupPoints.map(p => (<option key={p.label} value={p.label}>{p.label}</option>))}</select>{selectedPickupIsCustom && (<div className="mt-2"><PlacesAutocomplete value={pickupCustom} onChange={setPickupCustom} onPlaceSelect={(place) => setPickupCustom(place.address)} placeholder="Tapez votre adresse, hôtel, gare..." /></div>)}{pickupAddress && !selectedPickupIsCustom && (<p className="text-[10px] text-gray-400 mt-1 px-1">{pickupAddress}</p>)}</div>)}
            {to && (<div><label className="text-xs text-gray-500 mb-1 block font-medium">📍 Adresse de dépose</label><select value={dropoffLabel} onChange={(e) => { const pt = dropoffPoints.find(p => p.label === e.target.value); setDropoffLabel(e.target.value); setDropoffAddress(pt?.address || ''); setDropoffCustom(''); }} className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm text-gray-900 font-medium"><option value="">Choisir un point de dépose</option>{dropoffPoints.map(p => (<option key={p.label} value={p.label}>{p.label}</option>))}</select>{selectedDropoffIsCustom && (<div className="mt-2"><PlacesAutocomplete value={dropoffCustom} onChange={setDropoffCustom} onPlaceSelect={(place) => setDropoffCustom(place.address)} placeholder="Tapez votre adresse, hôtel, bureau..." /></div>)}{dropoffAddress && !selectedDropoffIsCustom && (<p className="text-[10px] text-gray-400 mt-1 px-1">{dropoffAddress}</p>)}</div>)}
            {isAirport && (<div className="rounded-xl bg-blue-50 border border-blue-200 p-4"><div className="flex items-center gap-2 mb-3"><Plane className="w-4 h-4 text-blue-600" /><p className="text-xs font-bold text-blue-800">✈️ Vol détecté — Comment calculer l'heure ?</p></div><div className="flex gap-2 mb-3"><button onClick={() => setAirportMode('arrival')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors border ${airportMode === 'arrival' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>Heure d'arrivée vol</button><button onClick={() => setAirportMode('pickup')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors border ${airportMode === 'pickup' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>Heure de pickup</button></div>{airportMode === 'arrival' && (<div><input type="time" value={flightArrivalTime} onChange={(e) => setFlightArrivalTime(e.target.value)} className="w-full h-10 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-900" /><p className="text-[10px] text-blue-600 mt-1.5">🛬 Votre chauffeur vous attendra à votre arrivée avec une pancarte à votre nom</p></div>)}</div>)}
            {selectedRoute && (<div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center justify-between"><div className="flex items-center gap-2"><Clock className="w-4 h-4" style={{ color: GOLD }} /><span className="text-sm text-gray-900 font-medium">{formatDuration(selectedRoute.duration)}</span><span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${SEGMENT_META[selectedRoute.segment]?.color}`}>{SEGMENT_META[selectedRoute.segment]?.label}</span></div><span className="text-sm font-bold" style={{ color: GOLD }}>dès CHF {selectedRoute.basePrice}/siège</span></div>)}
            <div className="relative">
              <label className="text-xs text-gray-500 mb-1 block font-medium">📅 Date du trajet</label>
              <button onClick={() => setCalendarOpenSearch(!calendarOpenSearch)} className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm text-left font-medium text-gray-900 hover:bg-gray-100 transition-colors">{calendarDateLabel || 'Choisir une date — voir les prix'}</button>
              {calendarOpenSearch && (<div onClick={() => setCalendarOpenSearch(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 18, 25, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}><div ref={calendarSearchRef} onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 980, maxHeight: '92vh', overflow: 'auto' }}><PriceCalendar basePrice={calendarBasePrice} roundTrip={roundTrip} onToggleRoundTrip={setRoundTrip} selectedDeparture={departureDateObj} selectedReturn={returnDateObj} onSelectDeparture={setDepartureDateObj} onSelectReturn={setReturnDateObj} onApply={() => handleCalendarApply(setCalendarOpenSearch)} onClear={handleCalendarClear} /></div></div>)}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">🕐 Heure de départ</label>
              <select value={timeAller} onChange={(e) => setTimeAller(e.target.value)} className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm text-gray-900 font-medium">
                <option value="">Heure de départ</option>
                {availableTimeSlotsAller.map(s => (<option key={s.time} value={s.time}>{s.time === 'custom' ? '🕐 Heure personnalisée' : `${s.time} ${s.rushLevel === 'rush' ? '🔴 Rush' : s.rushLevel === 'creux' ? '🟢 Creux' : '🟡 Soirée'}`}</option>))}
              </select>
            </div>
            {roundTrip && (<div><label className="text-xs text-gray-500 mb-1 block font-medium">🕐 Heure de retour</label><select value={timeRetour} onChange={(e) => setTimeRetour(e.target.value)} className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm text-gray-900 font-medium"><option value="">Heure retour</option>{availableTimeSlotsRetour.map(s => (<option key={s.time} value={s.time}>{s.time === 'custom' ? '🕐 Heure personnalisée' : `${s.time} ${s.rushLevel === 'rush' ? '🔴 Rush' : s.rushLevel === 'creux' ? '🟢 Creux' : '🟡 Soirée'}`}</option>))}</select></div>)}
            {timeAller === 'custom' && (<div><label className="text-xs text-gray-500 mb-1 block font-medium">Heure personnalisée aller</label><input type="time" value={customTimeAller} onChange={(e) => setCustomTimeAller(e.target.value)} className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm text-gray-900" /></div>)}
            {effectiveTimeAller && selectedRoute && (<div className="rounded-xl bg-blue-50 border border-blue-200 p-3 flex items-center gap-2"><Timer className="w-4 h-4 text-blue-500 flex-shrink-0" /><div className="flex-1"><p className="text-sm text-gray-900 font-medium">Arrivée estimée : <span className="font-bold">{estimatedArrivalAller}</span></p><p className="text-[10px] text-gray-500">{formatDuration(selectedRoute.duration)} de trajet</p></div>{selectedAllerRush && RUSH_BADGE[selectedAllerRush] && (<span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${RUSH_BADGE[selectedAllerRush].color}`}>{RUSH_BADGE[selectedAllerRush].label}</span>)}</div>)}
            {effectiveTimeAller && selectedAllerRush === 'creux' && (<div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 flex items-center gap-2"><span className="text-sm">💰</span><p className="text-[11px] text-emerald-700 font-medium">Créneau creux — prix réduit −5%</p></div>)}
            {roundTrip && timeRetour === 'custom' && (<div><label className="text-xs text-gray-500 mb-1 block font-medium">Heure personnalisée retour</label><input type="time" value={customTimeRetour} onChange={(e) => setCustomTimeRetour(e.target.value)} className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm text-gray-900" /></div>)}
            {roundTrip && effectiveTimeRetour && selectedRoute && (<div className="rounded-xl bg-blue-50 border border-blue-200 p-3 flex items-center gap-2"><Timer className="w-4 h-4 text-blue-500 flex-shrink-0" /><div className="flex-1"><p className="text-sm text-gray-900 font-medium">Retour arrivée : <span className="font-bold">{estimatedArrivalRetour}</span></p><p className="text-[10px] text-gray-500">Retour le même soir · -5% aller-retour</p></div>{selectedRetourRush && RUSH_BADGE[selectedRetourRush] && (<span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${RUSH_BADGE[selectedRetourRush].color}`}>{RUSH_BADGE[selectedRetourRush].label}</span>)}</div>)}
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">Passagers</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">−</button>
                <span className="text-lg font-bold text-gray-900 w-8 text-center">{passengers}</span>
                <button onClick={() => setPassengers(Math.min(7, passengers + 1))} className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">+</button>
                <Users className="w-4 h-4 text-gray-400 ml-1" />
              </div>
            </div>
            <Button onClick={handleSearch} disabled={!from || !to || from === to} className="w-full mt-4 text-white font-bold rounded-xl h-12 disabled:opacity-40 shadow-lg" style={{ backgroundColor: GOLD }}>
              <Search className="w-4 h-4 mr-2" />Rechercher
            </Button>
            {filter === 'grand_geneve' && (<button onClick={() => setStep('abonnement')} className="w-full mt-2 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 p-3 text-center"><p className="text-xs font-bold text-orange-700">💳 Abonnement Frontalier dès CHF 299/mois</p><p className="text-[10px] text-orange-500">Trajets illimités · Réservation prioritaire</p></button>)}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  if (step === 'results' && selectedRoute) {
    const sharedVehicles = VEHICLES.filter(v => v.type === 'shared');
    const privateVehicles = VEHICLES.filter(v => v.type === 'private');
    const currentStep = 2;
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {STEPPER_STEPS.map((s, i) => (<React.Fragment key={s.num}><div className="flex items-center gap-1.5"><div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${s.num < currentStep ? 'bg-emerald-500 text-white' : s.num === currentStep ? 'text-white' : 'bg-gray-200 text-gray-500'}`} style={s.num === currentStep ? { backgroundColor: GOLD } : {}}>{s.num < currentStep ? <Check className="w-3.5 h-3.5" /> : s.num}</div><span className={`text-xs font-medium hidden md:inline ${s.num === currentStep ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span></div>{i < STEPPER_STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${s.num < currentStep ? 'bg-emerald-500' : 'bg-gray-200'}`} />}</React.Fragment>))}
          </div>
        </div>
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><div><p className="text-sm font-bold text-gray-900">{from} → {to}</p><p className="text-[11px] text-gray-500">{dateAller || "Aujourd'hui"} {effectiveTimeAller ? `· ${effectiveTimeAller}` : ''} · {passengers} adulte{passengers > 1 ? 's' : ''}</p></div></div>
              {roundTrip && (<div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><div><p className="text-sm font-bold text-gray-900">{to} → {from}</p><p className="text-[11px] text-gray-500">{dateRetour || "Retour"} {effectiveTimeRetour ? `· ${effectiveTimeRetour}` : ''} · {passengers} adulte{passengers > 1 ? 's' : ''}</p></div></div>)}
            </div>
            <button onClick={() => setStep('search')} className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"><Edit2 className="w-3 h-3" /> Modifier le trajet</button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 lg:max-w-[70%] space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Users className="w-5 h-5 text-gray-500" />Sièges partagés<span className="text-xs font-normal text-gray-400 ml-1">— Voyagez à petit prix</span></h3>
              {sharedVehicles.map(vehicle => {
                const price = getVehiclePrice(vehicle, routeBasePrice);
                const isSelected = selectedVehicle === vehicle.id;
                const isExpanded = expandedDetails === vehicle.id;
                return (
                  <motion.div key={vehicle.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border-2 overflow-hidden transition-all hover:shadow-md ${isSelected ? 'border-amber-400 shadow-md' : 'border-amber-300'}`} style={{ backgroundColor: '#FDFAF4' }}>
                    <div className="flex flex-col md:flex-row relative">
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-md" style={{ backgroundColor: GOLD }}><Star className="w-3 h-3 fill-white" /> Recommandé</div>
                      <div className="w-full md:w-[200px] md:min-w-[200px] h-[160px] md:h-[130px] flex-shrink-0 flex items-center justify-center overflow-hidden rounded-lg m-2 p-3" style={{ backgroundColor: '#F5F5F5' }}><img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-contain" loading="lazy" /></div>
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between mb-3"><div><div className="flex items-center gap-2 mb-1"><h4 className="text-base font-bold text-gray-900">{vehicle.name}</h4><span className="flex items-center gap-0.5 text-[10px] font-medium text-gray-400 cursor-help" title="Siège partagé dans un VAN avec d'autres passagers">Siège Partagé <Info className="w-3 h-3" /></span></div><p className="text-xs text-gray-500">Jusqu'à {vehicle.capacity} passagers</p><div className="flex items-center gap-2 mt-1.5"><span className="flex items-center gap-1 text-[11px] text-blue-600 font-medium"><Users className="w-3.5 h-3.5 text-blue-500" /> Siège partagé</span><span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full"><Leaf className="w-3 h-3" /> Écologique</span></div></div></div>
                        <div className="flex flex-wrap gap-2 mb-4">{vehicle.features.map(f => (<span key={f} className="text-[11px] text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">{f}</span>))}</div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <label className="flex items-center gap-3 flex-1 p-3 rounded-xl border border-gray-200 hover:border-amber-300 cursor-pointer transition-colors" onClick={() => setSelectedVehicle(vehicle.id)}><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-amber-500' : 'border-gray-300'}`}>{isSelected && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GOLD }} />}</div><div className="flex-1"><p className="text-xs text-gray-500">Trajet aller</p><p className="text-sm text-gray-400">Prix demandé</p><p className="text-lg font-black text-gray-900">CHF {price}.00</p></div></label>
                          {roundTrip && (<label className="flex items-center gap-3 flex-1 p-3 rounded-xl border border-gray-200 hover:border-amber-300 cursor-pointer transition-colors" onClick={() => { setSelectedVehicle(vehicle.id); setSameVehicleReturn(true); setSelectedVehicleReturn(vehicle.id); }}><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected && sameVehicleReturn ? 'border-amber-500' : 'border-gray-300'}`}>{isSelected && sameVehicleReturn && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GOLD }} />}</div><div className="flex-1"><p className="text-xs text-gray-500">Trajet retour</p><p className="text-sm text-gray-400">Prix demandé</p><p className="text-lg font-black text-gray-900">CHF {price}.00</p></div></label>)}
                        </div>
                        {roundTrip && isSelected && (<button onClick={() => { setSameVehicleReturn(true); setSelectedVehicleReturn(vehicle.id); }} className="text-[11px] font-medium mt-2 px-3 py-1 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">Choisir même véhicule aller-retour</button>)}
                        <button onClick={() => setExpandedDetails(isExpanded ? null : vehicle.id)} className="flex items-center gap-1 mt-3 text-xs font-medium text-blue-600 hover:text-blue-700">{isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}{isExpanded ? 'Masquer les détails' : '+ Détails'}</button>
                        <AnimatePresence>{isExpanded && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100"><div><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1.5">✓ Inclus dans le prix</p>{vehicle.details.included.map(i => (<p key={i} className="text-[11px] text-gray-600 flex items-center gap-1.5 mb-1"><Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />{i}</p>))}</div><div><p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1.5">Options payantes</p>{vehicle.details.options.map(o => (<p key={o} className="text-[11px] text-gray-600 mb-1">+ {o}</p>))}</div><div><p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">🧳 Bagages</p><p className="text-[11px] text-gray-600">{vehicle.details.luggage}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Annulation</p><p className="text-[11px] text-gray-600">{vehicle.details.cancellation}</p></div></div></motion.div>)}</AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 p-4 text-center my-6"><p className="text-white text-sm font-bold">Découvrez aussi nos transferts privés</p><p className="text-white/60 text-xs mt-0.5">Véhicule privatisé pour votre groupe</p></div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Car className="w-5 h-5 text-gray-500" />Transferts Privés<span className="text-xs font-normal text-gray-400 ml-1">— Véhicule dédié</span></h3>
              {privateVehicles.map(vehicle => {
                const price = getVehiclePrice(vehicle, routeBasePrice);
                const isSelected = selectedVehicle === vehicle.id;
                const isExpanded = expandedDetails === vehicle.id;
                return (
                  <motion.div key={vehicle.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`bg-white rounded-2xl border-2 overflow-hidden transition-all shadow-sm hover:shadow-md ${isSelected ? 'border-amber-400 shadow-md' : 'border-gray-200'}`}>
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-[200px] md:min-w-[200px] h-[160px] md:h-[130px] flex-shrink-0 flex items-center justify-center overflow-hidden rounded-lg m-2 p-3" style={{ backgroundColor: '#F5F5F5' }}><img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-contain" loading="lazy" /></div>
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between mb-3"><div><div className="flex items-center gap-2 mb-1"><h4 className="text-base font-bold text-gray-900">{vehicle.name}</h4><span className="flex items-center gap-0.5 text-[10px] font-medium text-gray-400 cursor-help">Transfert Privé <Info className="w-3 h-3" /></span></div><p className="text-xs text-gray-500">Jusqu'à {vehicle.capacity} passagers</p><div className="flex items-center gap-1 mt-1"><Car className="w-3.5 h-3.5 text-amber-600" /><span className="text-[11px] font-medium" style={{ color: GOLD }}>Transfert privé</span></div></div></div>
                        <div className="flex flex-wrap gap-2 mb-4">{vehicle.features.map(f => (<span key={f} className="text-[11px] text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">{f}</span>))}</div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3"><label className="flex items-center gap-3 flex-1 p-3 rounded-xl border border-gray-200 hover:border-amber-300 cursor-pointer transition-colors" onClick={() => setSelectedVehicle(vehicle.id)}><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-amber-500' : 'border-gray-300'}`}>{isSelected && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GOLD }} />}</div><div className="flex-1"><p className="text-xs text-gray-500">{roundTrip ? 'Aller-retour' : 'Trajet aller'}</p><p className="text-lg font-black text-gray-900">CHF {roundTrip ? price * 2 - Math.round(price * 2 * 0.05) : price}.00</p></div></label></div>
                        {roundTrip && isSelected && (<button onClick={() => { setSameVehicleReturn(false); }} className="text-[11px] font-medium mt-2 px-3 py-1 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">Choisir autre véhicule retour</button>)}
                        <button onClick={() => setExpandedDetails(isExpanded ? null : vehicle.id)} className="flex items-center gap-1 mt-3 text-xs font-medium text-blue-600 hover:text-blue-700">{isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}{isExpanded ? 'Masquer les détails' : '+ Détails'}</button>
                        <AnimatePresence>{isExpanded && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100"><div><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1.5">✓ Inclus</p>{vehicle.details.included.map(i => (<p key={i} className="text-[11px] text-gray-600 flex items-center gap-1.5 mb-1"><Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />{i}</p>))}</div><div><p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1.5">Options</p>{vehicle.details.options.map(o => <p key={o} className="text-[11px] text-gray-600 mb-1">+ {o}</p>)}</div><div><p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">🧳 Bagages</p><p className="text-[11px] text-gray-600">{vehicle.details.luggage}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Annulation</p><p className="text-[11px] text-gray-600">{vehicle.details.cancellation}</p></div></div></motion.div>)}</AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="hidden lg:block lg:w-[30%]">
              <div className="sticky top-[76px] space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-900 mb-4">Récapitulatif</h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm"><span className="text-gray-600">Trajet aller ({activeVehicle.type === 'shared' ? 'Partagé' : 'Privé'})</span><span className="font-bold text-gray-900">CHF {outboundPrice}</span></div>
                    {roundTrip && (<div className="flex items-center justify-between text-sm"><span className="text-gray-600">Trajet retour ({(sameVehicleReturn ? activeVehicle : activeVehicleReturn).type === 'shared' ? 'Partagé' : 'Privé'})</span><span className="font-bold text-gray-900">CHF {returnPrice}</span></div>)}
                    {roundTrip && roundTripDiscount > 0 && (<div className="flex items-center justify-between text-sm"><span className="text-emerald-600">Remise aller-retour -5%</span><span className="font-bold text-emerald-600">-CHF {roundTripDiscount.toFixed(2)}</span></div>)}
                    <div className="flex items-center justify-between text-sm"><span className="text-gray-600">Assurance trajet</span><span className="font-bold text-gray-900">CHF {resultsInsuranceFee.toFixed(2)}</span></div>
                    <div className="border-t border-gray-200 pt-3 mt-3 flex items-center justify-between"><span className="text-sm font-bold text-gray-900">Total à payer</span><span className="text-xl font-black text-gray-900">CHF {resultsTotalPrice.toFixed(2)}</span></div>
                  </div>
                  <Button onClick={handleVehicleContinue} className="w-full mt-4 h-12 rounded-xl text-white font-bold text-sm shadow-lg" style={{ backgroundColor: GOLD }}>Continuer</Button>
                  <div className="mt-4 space-y-2">{['✓ Annulation gratuite jusqu\'à 24h avant', '✓ Chauffeur certifié Caby', '✓ Assurance trajet incluse'].map(t => (<p key={t} className="text-[11px] text-gray-500 flex items-center gap-1.5"><Shield className="w-3 h-3 text-emerald-500 flex-shrink-0" />{t}</p>))}</div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col items-center"><div className="w-20 h-20 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center"><QrCode className="w-14 h-14 text-gray-400" /></div><p className="text-[10px] text-gray-400 mt-1.5">📱 QR Code app Caby</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between"><div><p className="text-lg font-black text-gray-900">CHF {resultsTotalPrice.toFixed(2)}</p><p className="text-[10px] text-gray-500">{activeVehicle.name}{roundTrip ? ' · Aller-retour' : ''}</p></div><Button onClick={handleVehicleContinue} className="h-11 px-8 rounded-xl text-white font-bold text-sm" style={{ backgroundColor: GOLD }}>Continuer</Button></div>
        </div>
        <div className="h-20 lg:h-0" />
      </div>
    );
  }

  // ── STEP 3: SEAT ──
  if (step === 'seat' && selectedSlot && selectedRoute) {
    const currentStep = 3;

    // Prix supplémentaire par rang (cohérent avec l'UX "Rang 1/2/3")
    const getRowSurcharge = (seat: number): number => {
      if (seat === 1 || seat === 2) return 8;  // Rang 1 - Avant (à côté du chauffeur)
      if (seat === 3 || seat === 4 || seat === 5) return 5;  // Rang 2 - Intermédiaire
      return 0;  // Rang 3 - Arrière (gratuit)
    };
    const seatSurcharge = selectedSeat ? getRowSurcharge(selectedSeat) : 0;
    const seatRowLabel = !selectedSeat ? '' : (selectedSeat <= 2 ? 'Rang 1 · Avant' : selectedSeat <= 5 ? 'Rang 2 · Intermédiaire' : 'Rang 3 · Arrière');
    const cartTotal = slotPrice + seatSurcharge;

    const handleSkipSeats = () => {
      // Attribue aléatoirement un siège gratuit (Rang 3) parmi les disponibles
      const freeSeats = [6, 7].filter(s => !takenSeats.includes(s));
      const anyFreeSeats = [3, 4, 5, 6, 7].filter(s => !takenSeats.includes(s));
      const pool = freeSeats.length > 0 ? freeSeats : anyFreeSeats;
      const pick = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : 1;
      setSelectedSeat(pick);
      setStep('extras');
    };

    // Helper pour rendre un siège schématique avec couleur par rang
    const renderSchemSeat = (seat: number) => {
      const taken = takenSeats.includes(seat);
      const selected = selectedSeat === seat;
      const surcharge = getRowSurcharge(seat);
      let bgColor = '#F5F5F0';     // Rang 3 (gratuit)
      let borderColor = '#E0DDD5';
      let textColor = '#6B7280';
      if (surcharge === 5) { bgColor = '#DCFCE7'; borderColor = '#86EFAC'; textColor = '#166534'; }  // vert menthe Rang 2
      if (surcharge === 8) { bgColor = '#FEF3C7'; borderColor = '#FDE68A'; textColor = '#92400E'; }  // jaune doux Rang 1
      if (taken) { bgColor = '#E5E7EB'; borderColor = '#D1D5DB'; textColor = '#9CA3AF'; }
      if (selected) { bgColor = GOLD; borderColor = '#A07830'; textColor = '#0A0A0A'; }

      return (
        <button
          key={seat}
          disabled={taken}
          onClick={() => setSelectedSeat(seat)}
          style={{
            width: 72,
            height: 72,
            borderRadius: 10,
            background: bgColor,
            border: `2px solid ${borderColor}`,
            color: textColor,
            fontFamily: 'inherit',
            cursor: taken ? 'not-allowed' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            transition: 'all 0.15s',
            boxShadow: selected ? '0 4px 12px rgba(201,168,76,0.4)' : 'none',
            transform: selected ? 'scale(1.05)' : 'scale(1)',
          }}
          aria-label={`Siège ${seat}${taken ? ' occupé' : surcharge ? ` +CHF ${surcharge}` : ' gratuit'}`}
        >
          {taken ? (
            <X style={{ width: 16, height: 16 }} />
          ) : (
            <>
              <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>{seat}</span>
              <span style={{ fontSize: 10, fontWeight: 500, lineHeight: 1 }}>
                {surcharge > 0 ? `+CHF ${surcharge}` : 'Gratuit'}
              </span>
            </>
          )}
        </button>
      );
    };

    return (
      <div className="min-h-screen" style={{ background: '#F8F7F2' }}>
        {/* ═══ STEPPER ═══ (conservé identique aux autres steps) */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {STEPPER_STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${s.num < currentStep ? 'bg-emerald-500 text-white' : s.num === currentStep ? 'text-white' : 'bg-gray-200 text-gray-500'}`} style={s.num === currentStep ? { backgroundColor: GOLD } : {}}>
                    {s.num < currentStep ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span className={`text-xs font-medium hidden md:inline ${s.num === currentStep ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
                </div>
                {i < STEPPER_STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${s.num < currentStep ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ═══ HEADER LIGNE (titre + retour + passer sièges) ═══ */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 0' }}>
          <button onClick={() => setStep('results')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B7280', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', padding: 0, marginBottom: 16 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Retour
          </button>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 4 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Où souhaitez-vous être assis ?</h2>
              <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                {from} → {to}, {dateAller || "aujourd'hui"}
              </p>
            </div>
            <button
              onClick={handleSkipSeats}
              style={{ background: 'none', border: 'none', color: GOLD, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', padding: 0, textDecoration: 'underline', textUnderlineOffset: 3 }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#A07830')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = GOLD)}
            >
              Passer les sièges →
            </button>
          </div>
        </div>

        {/* ═══ LAYOUT 2 COLONNES (plan à gauche, panier sticky à droite) ═══ */}
        <div className="caby-seat-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 20px 40px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>

          {/* ─── COLONNE GAUCHE : PLAN DU VAN + ZONES TARIFAIRES ─── */}
          <div>
            <p style={{ fontSize: 13, color: '#4B5563', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Chaque zone offre un niveau de confort différent. Choisissez la place qui vous convient.
            </p>

            {/* ── RANG 1 : AVANT (+CHF 8) ── */}
            <div style={{ background: '#fff', border: '1px solid #FDE68A', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#92400E', marginBottom: 4 }}>
                    Rang 1 · Avant
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>
                    Place à côté du chauffeur
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#92400E', whiteSpace: 'nowrap' }}>
                  +CHF 8
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['Meilleure visibilité sur la route', 'Espace pour les jambes maximal', 'Premier à descendre à l\'arrivée'].map(bullet => (
                  <li key={bullet} style={{ fontSize: 12, color: '#4B5563', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <Check style={{ width: 14, height: 14, color: '#16A34A', flexShrink: 0, marginTop: 2 }} />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              {/* Plan schématique Rang 1 : chauffeur + 2 sièges */}
              <div style={{ background: '#0F172A', borderRadius: 10, padding: '14px 20px', display: 'flex', justifyContent: 'center', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: 10, background: '#1E293B', border: '2px dashed #475569', color: '#94A3B8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, gap: 2 }}>
                  <span style={{ fontSize: 18 }}>🧑‍✈️</span>
                  <span>Chauffeur</span>
                </div>
                {renderSchemSeat(1)}
                {renderSchemSeat(2)}
              </div>
            </div>

            {/* ── RANG 2 : INTERMÉDIAIRE (+CHF 5) ── */}
            <div style={{ background: '#fff', border: '1px solid #86EFAC', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#166534', marginBottom: 4 }}>
                    Rang 2 · Intermédiaire
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>
                    Confort équilibré
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#166534', whiteSpace: 'nowrap' }}>
                  +CHF 5
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['Choix entre fenêtre ou couloir', 'Accès rapide à l\'entrée du van', 'Idéal pour voyager à plusieurs'].map(bullet => (
                  <li key={bullet} style={{ fontSize: 12, color: '#4B5563', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <Check style={{ width: 14, height: 14, color: '#16A34A', flexShrink: 0, marginTop: 2 }} />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              {/* Plan schématique Rang 2 : 3 sièges */}
              <div style={{ background: '#0F172A', borderRadius: 10, padding: '14px 20px', display: 'flex', justifyContent: 'center', gap: 14 }}>
                {renderSchemSeat(3)}
                {renderSchemSeat(4)}
                {renderSchemSeat(5)}
              </div>
            </div>

            {/* ── RANG 3 : ARRIÈRE (GRATUIT) ── */}
            <div style={{ background: '#fff', border: '1px solid #E0DDD5', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#6B7280', marginBottom: 4 }}>
                    Rang 3 · Arrière
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>
                    Inclus dans votre tarif
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#4B5563', whiteSpace: 'nowrap' }}>
                  Gratuit
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['Place avec fenêtre garantie', 'Intimité maximale à l\'arrière', 'Même niveau de sécurité & confort'].map(bullet => (
                  <li key={bullet} style={{ fontSize: 12, color: '#4B5563', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <Check style={{ width: 14, height: 14, color: '#16A34A', flexShrink: 0, marginTop: 2 }} />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              {/* Plan schématique Rang 3 : 2 sièges */}
              <div style={{ background: '#0F172A', borderRadius: 10, padding: '14px 20px', display: 'flex', justifyContent: 'center', gap: 14 }}>
                {renderSchemSeat(6)}
                {renderSchemSeat(7)}
              </div>
            </div>

            {/* Légende */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', padding: '16px 0 0', fontSize: 11, color: '#6B7280' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 4, background: '#FEF3C7', border: '1px solid #FDE68A' }} />
                Avant (+CHF 8)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 4, background: '#DCFCE7', border: '1px solid #86EFAC' }} />
                Intermédiaire (+CHF 5)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 4, background: '#F5F5F0', border: '1px solid #E0DDD5' }} />
                Arrière (Gratuit)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 4, background: GOLD }} />
                Votre siège
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 4, background: '#E5E7EB' }} />
                Occupé
              </span>
            </div>
          </div>

          {/* ─── COLONNE DROITE : PANIER STICKY ─── */}
          <aside style={{ position: 'sticky', top: 24, background: '#fff', border: '1px solid #E0DDD5', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px 0' }}>Panier</h3>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 20px 0' }}>
              {from} → {to}
            </p>

            <div style={{ borderTop: '1px solid #F1F0EB', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontSize: 13, color: '#4B5563' }}>
                  Trajet {from} → {to}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', whiteSpace: 'nowrap' }}>
                  CHF {slotPrice.toFixed(2)}
                </span>
              </div>

              {selectedSeat ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ fontSize: 13, color: '#4B5563' }}>
                    Siège N°{selectedSeat}
                    <span style={{ display: 'block', fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{seatRowLabel}</span>
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', whiteSpace: 'nowrap' }}>
                    {seatSurcharge > 0 ? `+CHF ${seatSurcharge.toFixed(2)}` : 'Gratuit'}
                  </span>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>
                  Aucun siège sélectionné
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #F1F0EB', marginTop: 16, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>TOTAL</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#1A1A1A' }}>CHF {cartTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={() => setStep('extras')}
              disabled={!selectedSeat}
              style={{
                width: '100%',
                marginTop: 16,
                height: 48,
                background: selectedSeat ? GOLD : '#E5E7EB',
                color: selectedSeat ? '#0A0A0A' : '#9CA3AF',
                border: 'none',
                borderRadius: 10,
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: 700,
                cursor: selectedSeat ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (selectedSeat) (e.currentTarget as HTMLButtonElement).style.background = '#E8C96A'; }}
              onMouseLeave={e => { if (selectedSeat) (e.currentTarget as HTMLButtonElement).style.background = GOLD; }}
            >
              Continuer →
            </button>

            {/* Garanties */}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#4B5563' }}>
                <Check style={{ width: 14, height: 14, color: '#16A34A', flexShrink: 0 }} />
                Annulation gratuite 24h avant
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#4B5563' }}>
                <Shield style={{ width: 14, height: 14, color: '#16A34A', flexShrink: 0 }} />
                Assurance trajet disponible
              </div>
            </div>
          </aside>
        </div>

        {/* ═══ RESPONSIVE ═══ */}
        <style>{`
          @media (max-width: 900px) {
            .caby-seat-grid { grid-template-columns: 1fr !important; }
            .caby-seat-grid > aside { position: static !important; }
          }
        `}</style>
      </div>
    );
  }

  // ── STEP 4: EXTRAS ──
  if (step === 'extras' && selectedSlot && selectedRoute) {
    const currentStep = 4;
    const extrasTotal = slotPrice + ancillaryTotal + INSURANCE_FEE;
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3"><div className="max-w-6xl mx-auto flex items-center justify-between">{STEPPER_STEPS.map((s, i) => (<React.Fragment key={s.num}><div className="flex items-center gap-1.5"><div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${s.num < currentStep ? 'bg-emerald-500 text-white' : s.num === currentStep ? 'text-white' : 'bg-gray-200 text-gray-500'}`} style={s.num === currentStep ? { backgroundColor: GOLD } : {}}>{s.num < currentStep ? <Check className="w-3.5 h-3.5" /> : s.num}</div><span className={`text-xs font-medium hidden md:inline ${s.num === currentStep ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span></div>{i < STEPPER_STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${s.num < currentStep ? 'bg-emerald-500' : 'bg-gray-200'}`} />}</React.Fragment>))}</div></div>
        <div className="max-w-3xl mx-auto px-5 py-8">
          <button onClick={() => setStep('seat')} className="flex items-center gap-1 text-gray-500 mb-6"><ArrowLeft className="w-4 h-4" /> Retour au siège</button>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Personnalisez votre trajet</h2>
          <p className="text-sm text-gray-500 mb-6">Ajoutez des extras pour un voyage encore plus confortable.</p>
          <div className="mb-6"><AncillarySelector selected={ancillaries} onChange={setAncillaries} basePrice={slotPrice} /></div>
          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 mb-6 flex items-start gap-3"><Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" /><div className="flex-1"><p className="text-sm font-bold text-blue-900">🛡️ Assurance trajet Caby</p><p className="text-xs text-blue-700 mt-0.5">Protection passager incluse sur tous les trajets</p></div><p className="text-sm font-bold text-blue-900">CHF {INSURANCE_FEE.toFixed(2)}</p></div>
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 mb-6"><div className="space-y-2"><div className="flex justify-between text-sm"><span className="text-gray-600">Siège N°{selectedSeat}</span><span className="font-bold text-gray-900">CHF {slotPrice}</span></div>{ancillaryTotal > 0 && (<div className="flex justify-between text-sm"><span className="text-gray-600">Options</span><span className="font-bold text-gray-900">+CHF {ancillaryTotal}</span></div>)}<div className="flex justify-between text-sm"><span className="text-gray-600">Assurance trajet</span><span className="font-bold text-gray-900">CHF {INSURANCE_FEE.toFixed(2)}</span></div><div className="border-t border-amber-300 pt-2 mt-2 flex justify-between"><span className="text-sm font-bold text-gray-900">Total</span><span className="text-xl font-black text-gray-900">CHF {extrasTotal.toFixed(2)}</span></div></div></div>
          <Button onClick={() => setStep('passenger')} className="w-full text-white font-bold rounded-xl h-12 shadow-lg" style={{ backgroundColor: GOLD }}>Continuer</Button>
        </div>
      </div>
    );
  }

  // ── STEP 5: PASSENGER ──
  if (step === 'passenger' && selectedSlot && selectedRoute) {
    const currentStep = 5;
    const canContinue = passengerFirstName.trim() && passengerLastName.trim() && passengerEmail.trim() && passengerPhone.trim();
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3"><div className="max-w-6xl mx-auto flex items-center justify-between">{STEPPER_STEPS.map((s, i) => (<React.Fragment key={s.num}><div className="flex items-center gap-1.5"><div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${s.num < currentStep ? 'bg-emerald-500 text-white' : s.num === currentStep ? 'text-white' : 'bg-gray-200 text-gray-500'}`} style={s.num === currentStep ? { backgroundColor: GOLD } : {}}>{s.num < currentStep ? <Check className="w-3.5 h-3.5" /> : s.num}</div><span className={`text-xs font-medium hidden md:inline ${s.num === currentStep ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span></div>{i < STEPPER_STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${s.num < currentStep ? 'bg-emerald-500' : 'bg-gray-200'}`} />}</React.Fragment>))}</div></div>
        <div className="max-w-3xl mx-auto px-5 py-8">
          <button onClick={() => setStep('extras')} className="flex items-center gap-1 text-gray-500 mb-6"><ArrowLeft className="w-4 h-4" /> Retour aux extras</button>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Vos informations</h2>
          <p className="text-sm text-gray-500 mb-6">Nous avons besoin de vos coordonnées pour votre e-ticket et le chauffeur.</p>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">Prénom *</label><input type="text" value={passengerFirstName} onChange={(e) => setPassengerFirstName(e.target.value)} className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm text-gray-900" placeholder="Jean" /></div>
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">Nom *</label><input type="text" value={passengerLastName} onChange={(e) => setPassengerLastName(e.target.value)} className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm text-gray-900" placeholder="Dupont" /></div>
            </div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Email *</label><input type="email" value={passengerEmail} onChange={(e) => setPassengerEmail(e.target.value)} className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm text-gray-900" placeholder="jean.dupont@email.com" /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Téléphone *</label><input type="tel" value={passengerPhone} onChange={(e) => setPassengerPhone(e.target.value)} className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm text-gray-900" placeholder="+41 79 123 45 67" /></div>
            {isAirport && (<div><label className="text-xs font-medium text-gray-600 mb-1 block">✈️ Numéro de vol (optionnel)</label><input type="text" value={passengerFlightNo} onChange={(e) => setPassengerFlightNo(e.target.value)} className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm text-gray-900" placeholder="LX 1234" /><p className="text-[10px] text-gray-400 mt-1">Le chauffeur suivra votre vol en temps réel</p></div>)}
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">🧳 Nombre de bagages</label><div className="flex items-center gap-3"><button onClick={() => setPassengerBagCount(Math.max(0, passengerBagCount - 1))} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200">−</button><span className="text-lg font-bold text-gray-900 w-8 text-center">{passengerBagCount}</span><button onClick={() => setPassengerBagCount(Math.min(5, passengerBagCount + 1))} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200">+</button><span className="text-xs text-gray-500 ml-2">1 inclus, +CHF 10/bagage sup.</span></div></div>
          </div>
          <div className="mt-6 rounded-xl bg-gray-50 border border-gray-200 p-3 flex items-start gap-2"><Shield className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" /><p className="text-[11px] text-gray-500">Vos données sont protégées et ne sont partagées qu'avec votre chauffeur pour ce trajet.</p></div>
          <Button onClick={() => setStep('payment')} disabled={!canContinue} className="w-full mt-6 text-white font-bold rounded-xl h-12 disabled:opacity-40 shadow-lg" style={{ backgroundColor: GOLD }}>Continuer vers le paiement</Button>
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
        <div className="bg-white border-b border-gray-200 px-4 py-3"><div className="max-w-6xl mx-auto flex items-center justify-between">{STEPPER_STEPS.map((s, i) => (<React.Fragment key={s.num}><div className="flex items-center gap-1.5"><div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${s.num < currentStep ? 'bg-emerald-500 text-white' : s.num === currentStep ? 'text-white' : 'bg-gray-200 text-gray-500'}`} style={s.num === currentStep ? { backgroundColor: GOLD } : {}}>{s.num < currentStep ? <Check className="w-3.5 h-3.5" /> : s.num}</div><span className={`text-xs font-medium hidden md:inline ${s.num === currentStep ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span></div>{i < STEPPER_STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${s.num < currentStep ? 'bg-emerald-500' : 'bg-gray-200'}`} />}</React.Fragment>))}</div></div>
        <div className="max-w-3xl mx-auto px-5 py-8">
          <button onClick={() => setStep('passenger')} className="flex items-center gap-1 text-gray-500 mb-6"><ArrowLeft className="w-4 h-4" /> Retour</button>
          <h2 className="text-lg font-bold text-gray-900 mb-6">Paiement</h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4">Récapitulatif de la commande</h4>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm"><span className="text-gray-600">{from} → {to} · Siège N°{selectedSeat}</span><span className="font-bold text-gray-900">CHF {slotPrice}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">{selectedSlot.departure} → {selectedSlot.arrivalEstimate} · {dateAller || "Aujourd'hui"}</span><span className="text-xs text-gray-400">{formatDuration(selectedRoute.duration)}</span></div>
              {ancillaryTotal > 0 && (<div className="flex justify-between text-sm"><span className="text-gray-600">Options extras</span><span className="font-bold text-gray-900">+CHF {ancillaryTotal}</span></div>)}
              {extraBagFee > 0 && (<div className="flex justify-between text-sm"><span className="text-gray-600">Bagages supplémentaires (×{passengerBagCount - 1})</span><span className="font-bold text-gray-900">+CHF {extraBagFee}</span></div>)}
              <div className="flex justify-between text-sm"><span className="text-gray-600">Assurance trajet Caby</span><span className="font-bold text-gray-900">CHF {INSURANCE_FEE.toFixed(2)}</span></div>
              <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between"><span className="text-base font-bold text-gray-900">Total à payer</span><span className="text-2xl font-black text-gray-900">CHF {grandTotal.toFixed(2)}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-6">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Passager</h4>
            <p className="text-sm text-gray-700">{passengerFirstName} {passengerLastName}</p>
            <p className="text-xs text-gray-500">{passengerEmail} · {passengerPhone}</p>
            {passengerFlightNo && <p className="text-xs text-blue-600 mt-1">✈️ Vol {passengerFlightNo}</p>}
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4">Moyen de paiement</h4>
            <div className="space-y-3">
              {([{ key: 'card' as const, label: '💳 Carte bancaire', desc: 'Visa, Mastercard, AMEX' }, { key: 'twint' as const, label: '🟣 TWINT', desc: 'Paiement mobile suisse' }, { key: 'applepay' as const, label: '🍎 Apple Pay', desc: 'Paiement rapide' }]).map(pm => (
                <label key={pm.key} onClick={() => setPaymentMethod(pm.key)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${paymentMethod === pm.key ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === pm.key ? 'border-amber-500' : 'border-gray-300'}`}>{paymentMethod === pm.key && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GOLD }} />}</div>
                  <div className="flex-1"><p className="text-sm font-medium text-gray-900">{pm.label}</p><p className="text-[11px] text-gray-500">{pm.desc}</p></div>
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 mb-6 flex items-start gap-2"><Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" /><p className="text-[10px] text-gray-500">En confirmant, vous acceptez les CGU de Caby. Ce trajet est organisé dans le cadre du covoiturage. Remboursement garanti en cas d'annulation par Caby.</p></div>
          <Button onClick={() => setStep('confirm')} className="w-full text-white font-bold rounded-xl h-12 shadow-lg" style={{ backgroundColor: GOLD }}><CreditCard className="w-4 h-4 mr-2" />Payer CHF {grandTotal.toFixed(2)}</Button>
          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-gray-400"><span>🔒 Paiement sécurisé</span><span>🛡️ Garanti Caby</span></div>
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
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-emerald-600" /></motion.div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Réservation confirmée !</h2>
          <p className="text-sm text-gray-500 mb-6">Votre e-ticket a été envoyé à {passengerEmail || 'votre email'}</p>
          {(effectivePickupAddress || effectiveDropoffAddress) && (
            <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden text-left shadow-lg mb-4">
              {effectivePickupAddress && (<div className="p-4 border-b border-gray-100"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">📍 Point de prise en charge</p><p className="text-sm font-bold text-gray-900">{pickupLabel}</p><p className="text-xs text-gray-500">{effectivePickupAddress}</p>{effectiveTimeAller && (<p className="text-xs text-gray-600 mt-1">🕐 {effectiveTimeAller} — Le chauffeur vous attend avec une pancarte à votre nom</p>)}</div>)}
              {effectiveDropoffAddress && (<div className="p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-1">🏁 Point de dépose</p><p className="text-sm font-bold text-gray-900">{dropoffLabel}</p><p className="text-xs text-gray-500">{effectiveDropoffAddress}</p></div>)}
            </div>
          )}
          <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden text-left shadow-lg">
            <div className="px-5 py-3 border-b border-gray-100" style={{ backgroundColor: `${GOLD}15` }}><p className="text-xs font-bold uppercase tracking-wider" style={{ color: GOLD }}>E-Ticket Caby Van</p></div>
            <div className="p-5 space-y-3">
              {[['Passager', `${passengerFirstName} ${passengerLastName}`], ['Trajet', `${from} → ${to}`], ['Date', dateAller || "Aujourd'hui"], ['Départ', selectedSlot.departure], ['Arrivée estimée', selectedSlot.arrivalEstimate], ['Durée', formatDuration(selectedRoute.duration)], ['Siège', `N°${selectedSeat}`], ['Chauffeur', 'David M. · GE 482 317'], ['Pickup', effectivePickupAddress || (from === 'Genève' ? 'Gare Cornavin, Sortie C' : `Gare de ${from}`)], ['Dépose', effectiveDropoffAddress || `Gare de ${to}`]].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm"><span className="text-gray-500">{label}</span><span className="font-bold text-gray-900 text-right max-w-[60%]">{value}</span></div>
              ))}
              {ancillaryTotal > 0 && (<div className="flex justify-between text-sm"><span className="text-gray-500">Options</span><span className="font-bold text-gray-900">+CHF {ancillaryTotal}</span></div>)}
              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between text-sm"><span className="text-gray-500">Total payé</span><span className="text-xl font-black text-gray-900">CHF {grandTotal.toFixed(2)}</span></div>
            </div>
            <div className="border-t border-dashed border-gray-200 p-5 flex flex-col items-center bg-gray-50"><div className="w-32 h-32 rounded-xl bg-white flex items-center justify-center border border-gray-200"><QrCode className="w-20 h-20 text-gray-800" /></div><p className="text-[10px] text-gray-400 mt-2">Présentez ce QR code au chauffeur</p></div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3"><Button variant="outline" className="rounded-xl h-11 border-gray-300 text-gray-700 text-sm">📅 Ajouter au calendrier</Button><Button variant="outline" className="rounded-xl h-11 border-gray-300 text-gray-700 text-sm">📄 Télécharger PDF</Button></div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3"><Leaf className="w-5 h-5 text-emerald-600 flex-shrink-0" /><p className="text-xs text-emerald-700 text-left">🌿 Trajet partagé — vous économisez <span className="font-bold">{Math.round(selectedRoute.duration * 0.12)} kg de CO₂</span> vs voiture solo</p></div>
          <Button onClick={() => navigate('/caby/services')} variant="outline" className="w-full mt-4 rounded-xl h-12 border-gray-300 text-gray-700">Retour aux services</Button>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-white" />;
};

export default CabyVanPage;
