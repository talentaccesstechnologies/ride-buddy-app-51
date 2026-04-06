export interface VanRoute {
  id: number;
  from: string;
  to: string;
  duration: number; // minutes
  basePrice: number;
  segment: 'pendulaire' | 'business' | 'ski' | 'tourisme' | 'premium' | 'frontalier' | 'institutionnel';
  flag: string;
  seasonal?: boolean;
}

export interface VanSlot {
  id: string;
  departure: string;
  arrivalEstimate: string;
  label: string;
  basePrice: number;
  seatsTotal: number;
  seatsTaken: number;
  rushLevel: 'green' | 'yellow' | 'red';
}

export type PriceBadge = 'green' | 'orange' | 'red';

export interface DynamicPriceResult {
  price: number;
  badge: PriceBadge;
  reason: string;
}

export const cabyVanRoutes: VanRoute[] = [
  // AXE ROMAND
  { id: 1, from: "Genève", to: "Lausanne", duration: 45, basePrice: 29, segment: "pendulaire", flag: "🇨🇭" },
  { id: 2, from: "Genève", to: "Neuchâtel", duration: 75, basePrice: 39, segment: "pendulaire", flag: "🇨🇭" },
  { id: 3, from: "Genève", to: "Fribourg", duration: 90, basePrice: 42, segment: "pendulaire", flag: "🇨🇭" },
  { id: 4, from: "Lausanne", to: "Fribourg", duration: 45, basePrice: 29, segment: "pendulaire", flag: "🇨🇭" },
  { id: 5, from: "Lausanne", to: "Neuchâtel", duration: 45, basePrice: 29, segment: "pendulaire", flag: "🇨🇭" },
  // AXE PLATEAU
  { id: 6, from: "Genève", to: "Berne", duration: 105, basePrice: 49, segment: "business", flag: "🇨🇭" },
  { id: 7, from: "Lausanne", to: "Berne", duration: 75, basePrice: 39, segment: "business", flag: "🇨🇭" },
  { id: 8, from: "Berne", to: "Bâle", duration: 60, basePrice: 35, segment: "business", flag: "🇨🇭" },
  { id: 9, from: "Berne", to: "Zurich", duration: 75, basePrice: 42, segment: "business", flag: "🇨🇭" },
  { id: 10, from: "Genève", to: "Bâle", duration: 150, basePrice: 65, segment: "business", flag: "🇨🇭" },
  { id: 11, from: "Genève", to: "Zurich", duration: 180, basePrice: 77, segment: "business", flag: "🇨🇭" },
  { id: 12, from: "Lausanne", to: "Zurich", duration: 135, basePrice: 59, segment: "business", flag: "🇨🇭" },
  // AXE ALÉMANIQUE
  { id: 13, from: "Zurich", to: "Winterthour", duration: 30, basePrice: 22, segment: "pendulaire", flag: "🇨🇭" },
  { id: 14, from: "Zurich", to: "Zoug", duration: 30, basePrice: 25, segment: "business", flag: "🇨🇭" },
  { id: 15, from: "Zurich", to: "Lucerne", duration: 60, basePrice: 35, segment: "tourisme", flag: "🇨🇭" },
  { id: 16, from: "Zurich", to: "Saint-Gall", duration: 60, basePrice: 35, segment: "business", flag: "🇨🇭" },
  { id: 17, from: "Zurich", to: "Bâle", duration: 60, basePrice: 35, segment: "business", flag: "🇨🇭" },
  { id: 18, from: "Bâle", to: "Berne", duration: 60, basePrice: 35, segment: "institutionnel", flag: "🇨🇭" },
  // LONGUE DISTANCE CH
  { id: 19, from: "Genève", to: "Lugano", duration: 240, basePrice: 95, segment: "premium", flag: "🇨🇭" },
  { id: 20, from: "Zurich", to: "Lugano", duration: 165, basePrice: 75, segment: "business", flag: "🇨🇭" },
  { id: 21, from: "Zurich", to: "Coire", duration: 90, basePrice: 45, segment: "ski", flag: "🇨🇭" },
  // SKI SUISSE
  { id: 22, from: "Genève", to: "Verbier", duration: 120, basePrice: 49, segment: "ski", flag: "🎿", seasonal: true },
  { id: 23, from: "Genève", to: "Zermatt", duration: 165, basePrice: 65, segment: "ski", flag: "🎿", seasonal: true },
  { id: 24, from: "Genève", to: "Crans-Montana", duration: 135, basePrice: 55, segment: "ski", flag: "🎿", seasonal: true },
  { id: 25, from: "Genève", to: "Grindelwald", duration: 180, basePrice: 75, segment: "ski", flag: "🎿", seasonal: true },
  { id: 26, from: "Zurich", to: "Davos", duration: 150, basePrice: 65, segment: "ski", flag: "🎿", seasonal: true },
  { id: 27, from: "Zurich", to: "Engelberg", duration: 90, basePrice: 45, segment: "ski", flag: "🎿", seasonal: true },
  { id: 28, from: "Zurich", to: "Arosa", duration: 120, basePrice: 55, segment: "ski", flag: "🎿", seasonal: true },
  // SKI FRANCE
  { id: 29, from: "Genève", to: "Chamonix", duration: 75, basePrice: 35, segment: "ski", flag: "🎿🇫🇷", seasonal: true },
  { id: 30, from: "Genève", to: "Morzine", duration: 90, basePrice: 39, segment: "ski", flag: "🎿🇫🇷", seasonal: true },
  { id: 31, from: "Genève", to: "Courchevel", duration: 150, basePrice: 69, segment: "ski", flag: "🎿🇫🇷", seasonal: true },
  { id: 32, from: "Genève", to: "Val d'Isère", duration: 180, basePrice: 79, segment: "ski", flag: "🎿🇫🇷", seasonal: true },
  { id: 33, from: "Genève", to: "Les Arcs", duration: 165, basePrice: 72, segment: "ski", flag: "🎿🇫🇷", seasonal: true },
  // TRANSFRONTALIER
  { id: 34, from: "Genève", to: "Annecy", duration: 45, basePrice: 25, segment: "frontalier", flag: "🇫🇷" },
  { id: 35, from: "Genève", to: "Lyon", duration: 105, basePrice: 49, segment: "premium", flag: "🇫🇷" },
  { id: 36, from: "Bâle", to: "Strasbourg", duration: 45, basePrice: 25, segment: "frontalier", flag: "🇫🇷" },
  { id: 37, from: "Zurich", to: "Munich", duration: 180, basePrice: 85, segment: "premium", flag: "🇩🇪" },
];

// All routes are bidirectional
export const ROUTES: VanRoute[] = [
  ...cabyVanRoutes,
  ...cabyVanRoutes.map(r => ({ ...r, id: r.id + 100, from: r.to, to: r.from })),
];

export const ALL_CITIES = [...new Set(ROUTES.flatMap(r => [r.from, r.to]))].sort();

export type SegmentFilter = 'all' | 'pendulaire' | 'business' | 'ski' | 'tourisme' | 'premium' | 'frontalier' | 'institutionnel';

export const SEGMENT_META: Record<string, { label: string; icon: string; color: string }> = {
  pendulaire: { label: 'Pendulaire', icon: '🏙️', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  business: { label: 'Business', icon: '💼', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  ski: { label: 'Ski alpin', icon: '🎿', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  tourisme: { label: 'Tourisme', icon: '🏔️', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  premium: { label: 'Premium', icon: '⭐', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  frontalier: { label: 'Frontalier', icon: '🚗', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  institutionnel: { label: 'Institutionnel', icon: '🏛️', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
};

export const getRoutesFrom = (city: string, segment?: SegmentFilter) => {
  const routes = ROUTES.filter(r => r.from === city);
  if (segment && segment !== 'all') return routes.filter(r => r.segment === segment);
  return routes;
};

export const findRoute = (from: string, to: string): VanRoute | undefined =>
  ROUTES.find(r => r.from === from && r.to === to);

export const getDestinationsFrom = (city: string, segment?: SegmentFilter): string[] => {
  return getRoutesFrom(city, segment).map(r => r.to);
};

export const formatDuration = (min: number): string => {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
};

export const calculateDynamicPrice = (
  basePrice: number,
  seatsAvailable: number,
  hour: number,
  dayOfWeek: number,
  daysUntilDeparture: number,
  isSchoolHoliday: boolean = false
): number => {
  let price = basePrice;
  if (seatsAvailable >= 7) price *= 0.85;
  else if (seatsAvailable >= 5) price *= 1.0;
  else if (seatsAvailable >= 3) price *= 1.1;
  else price *= 1.15;

  if (daysUntilDeparture >= 7) price *= 0.9;
  else if (daysUntilDeparture >= 3) price *= 1.0;
  else if (daysUntilDeparture >= 1) price *= 1.05;
  else price *= 1.15;

  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) price *= 1.15;
  else if (hour >= 9 && hour <= 16) price *= 0.95;
  else price *= 1.05;

  if ((dayOfWeek === 1 && hour < 12) || (dayOfWeek === 5 && hour >= 16)) price *= 1.2;
  else if (dayOfWeek >= 2 && dayOfWeek <= 4) price *= 1.0;
  else if (dayOfWeek === 0 || dayOfWeek === 6) price *= 1.1;

  if (isSchoolHoliday) price *= 1.2;

  return Math.min(PRICE_CEILING, Math.max(PRICE_FLOOR, Math.round(price)));
};

export const generateSlotsForRoute = (route: VanRoute): VanSlot[] => {
  const addTime = (hh: number, mm: number, addMin: number) => {
    const total = hh * 60 + mm + addMin;
    return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };
  const rid = String(route.id);
  const slots: VanSlot[] = [
    { id: `${rid}-07`, departure: '07:00', arrivalEstimate: addTime(7, 0, route.duration), label: 'Rush matin', basePrice: calculateDynamicPrice(route.basePrice, 4, 7, 3, 3), seatsTotal: 7, seatsTaken: 3, rushLevel: 'red' },
    { id: `${rid}-09`, departure: '09:00', arrivalEstimate: addTime(9, 0, route.duration), label: 'Standard', basePrice: calculateDynamicPrice(route.basePrice, 6, 9, 3, 3), seatsTotal: 7, seatsTaken: 1, rushLevel: 'yellow' },
    { id: `${rid}-12`, departure: '12:00', arrivalEstimate: addTime(12, 0, route.duration), label: 'Heures creuses', basePrice: calculateDynamicPrice(route.basePrice, 7, 12, 3, 3), seatsTotal: 7, seatsTaken: 0, rushLevel: 'green' },
    { id: `${rid}-17`, departure: '17:00', arrivalEstimate: addTime(17, 0, route.duration), label: 'Rush soir', basePrice: calculateDynamicPrice(route.basePrice, 3, 17, 3, 3), seatsTotal: 7, seatsTaken: 4, rushLevel: 'red' },
    { id: `${rid}-19`, departure: '19:00', arrivalEstimate: addTime(19, 0, route.duration), label: 'Soirée', basePrice: calculateDynamicPrice(route.basePrice, 5, 19, 3, 3), seatsTotal: 7, seatsTaken: 2, rushLevel: 'yellow' },
  ];
  return slots;
};
