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
  badge: PriceBadge;
  reason: string;
}

export type RouteFilter = 'all' | 'villes' | 'ski_ch' | 'ski_fr' | 'transfrontalier';

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

export function calculateDynamicPrice(
  basePrice: number,
  seatsAvailable: number,
  departureDate: Date,
  departureHour: number,
  bookingDate: Date = new Date()
): DynamicPriceResult {
  let multiplier = 1.0;

  // F1 — Remplissage (7 sièges total)
  if (seatsAvailable === 7) multiplier *= 0.85;
  else if (seatsAvailable >= 5) multiplier *= 1.00;
  else if (seatsAvailable >= 3) multiplier *= 1.10;
  else multiplier *= 1.15;

  // F2 — Délai de réservation
  const daysUntilDeparture = Math.floor((departureDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilDeparture >= 7) multiplier *= 0.90;
  else if (daysUntilDeparture >= 3) multiplier *= 1.00;
  else if (daysUntilDeparture >= 1) multiplier *= 1.05;
  else multiplier *= 1.15;

  // F3 — Heure de départ
  if ((departureHour >= 7 && departureHour <= 9) || (departureHour >= 16 && departureHour <= 19)) multiplier *= 1.15;
  else if (departureHour >= 9 && departureHour < 16) multiplier *= 0.95;
  else multiplier *= 1.05;

  // F4 — Jour de semaine
  const dayOfWeek = departureDate.getDay();
  if ((dayOfWeek === 1 && departureHour <= 10) || (dayOfWeek === 5 && departureHour >= 15)) multiplier *= 1.20;
  else if (dayOfWeek === 0 || dayOfWeek === 6) multiplier *= 1.10;
  else multiplier *= 1.00;

  // F5 — Saisonnalité
  const month = departureDate.getMonth() + 1;
  if (month === 1) multiplier *= 1.30; // WEF Davos
  else if ([12, 2, 3].includes(month)) multiplier *= 1.15; // Ski
  else if ([7, 8].includes(month)) multiplier *= 0.90; // Basse saison

  // Prix final avec garde-fous
  const rawPrice = basePrice * multiplier;
  const price = Math.max(basePrice * 0.77, Math.min(rawPrice, 110));
  const finalPrice = Math.round(price);

  // Badge couleur
  const ratio = finalPrice / basePrice;
  const badge: PriceBadge = ratio <= 0.90 ? 'green' : ratio <= 1.05 ? 'orange' : 'red';

  // Raison affichée
  const reason = seatsAvailable <= 2 ? 'Derniers sièges' :
    daysUntilDeparture >= 7 ? 'Prix early bird' :
    (departureHour >= 7 && departureHour <= 9) || (departureHour >= 16 && departureHour <= 19) ? 'Heure de pointe' :
    'Prix standard';

  return { price: finalPrice, badge, reason };
}

export const generateSlotsForRoute = (route: VanRoute, departureDate?: Date): VanSlot[] => {
  const addTime = (hh: number, mm: number, addMin: number) => {
    const total = hh * 60 + mm + addMin;
    return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };
  const rid = String(route.id);
  const depDate = departureDate || new Date(Date.now() + 3 * 86400000); // default 3 days out

  const makeSlot = (hour: number, seats: number, seatsTaken: number, label: string): VanSlot => {
    const result = calculateDynamicPrice(route.basePrice, seats - seatsTaken, depDate, hour);
    return {
      id: `${rid}-${String(hour).padStart(2, '0')}`,
      departure: `${String(hour).padStart(2, '0')}:00`,
      arrivalEstimate: addTime(hour, 0, route.duration),
      label,
      basePrice: result.price,
      seatsTotal: seats,
      seatsTaken,
      rushLevel: result.badge === 'green' ? 'green' : result.badge === 'orange' ? 'yellow' : 'red',
    };
  };

  return [
    makeSlot(7, 7, 3, 'Rush matin'),
    makeSlot(9, 7, 1, 'Standard'),
    makeSlot(12, 7, 0, 'Heures creuses'),
    makeSlot(17, 7, 4, 'Rush soir'),
    makeSlot(19, 7, 2, 'Soirée'),
  ];
};
