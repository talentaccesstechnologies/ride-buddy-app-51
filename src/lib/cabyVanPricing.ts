export interface VanRoute {
  id: string;
  from: string;
  to: string;
  duration: string; // display
  durationMin: number;
  basePrice: number;
  category: 'city' | 'ski';
  seasonal?: boolean; // oct-april
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

const PRICE_FLOOR = 19;
const PRICE_CEILING = 130;

export const ROUTES: VanRoute[] = [
  // Swiss cities
  { id: 'ge-la', from: 'Genève', to: 'Lausanne', duration: '45min', durationMin: 45, basePrice: 29, category: 'city' },
  { id: 'ge-be', from: 'Genève', to: 'Berne', duration: '1h45', durationMin: 105, basePrice: 49, category: 'city' },
  { id: 'ge-ba', from: 'Genève', to: 'Bâle', duration: '2h30', durationMin: 150, basePrice: 65, category: 'city' },
  { id: 'ge-zh', from: 'Genève', to: 'Zurich', duration: '3h', durationMin: 180, basePrice: 77, category: 'city' },
  { id: 'la-zh', from: 'Lausanne', to: 'Zurich', duration: '2h15', durationMin: 135, basePrice: 59, category: 'city' },
  { id: 'la-be', from: 'Lausanne', to: 'Berne', duration: '1h15', durationMin: 75, basePrice: 39, category: 'city' },
  // Ski resorts
  { id: 'ge-cham', from: 'Genève', to: 'Chamonix', duration: '1h15', durationMin: 75, basePrice: 35, category: 'ski', seasonal: true },
  { id: 'ge-verb', from: 'Genève', to: 'Verbier', duration: '2h', durationMin: 120, basePrice: 49, category: 'ski', seasonal: true },
  { id: 'ge-zerm', from: 'Genève', to: 'Zermatt', duration: '2h45', durationMin: 165, basePrice: 65, category: 'ski', seasonal: true },
  { id: 'ge-dav', from: 'Genève', to: 'Davos', duration: '3h30', durationMin: 210, basePrice: 85, category: 'ski', seasonal: true },
  { id: 'ge-crans', from: 'Genève', to: 'Crans-Montana', duration: '2h15', durationMin: 135, basePrice: 55, category: 'ski', seasonal: true },
  { id: 'ge-morz', from: 'Genève', to: 'Morzine', duration: '1h30', durationMin: 90, basePrice: 39, category: 'ski', seasonal: true },
  { id: 'ge-courch', from: 'Genève', to: 'Courchevel', duration: '2h30', durationMin: 150, basePrice: 69, category: 'ski', seasonal: true },
  { id: 'ge-val', from: 'Genève', to: "Val d'Isère", duration: '3h', durationMin: 180, basePrice: 79, category: 'ski', seasonal: true },
];

export const ALL_CITIES = [...new Set(ROUTES.flatMap(r => [r.from, r.to]))].sort();

export const getRoutesFrom = (city: string, category?: 'city' | 'ski') => {
  const routes = ROUTES.filter(r => r.from === city || r.to === city);
  if (category) return routes.filter(r => r.category === category);
  return routes;
};

export const findRoute = (from: string, to: string): VanRoute | undefined =>
  ROUTES.find(r => (r.from === from && r.to === to) || (r.to === from && r.from === to));

export const getDestinationsFrom = (city: string, category?: 'city' | 'ski'): string[] => {
  return getRoutesFrom(city, category).map(r => r.from === city ? r.to : r.from);
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
  const slots: VanSlot[] = [
    { id: `${route.id}-07`, departure: '07:00', arrivalEstimate: addTime(7, 0, route.durationMin), label: 'Rush matin', basePrice: calculateDynamicPrice(route.basePrice, 4, 7, 3, 3), seatsTotal: 7, seatsTaken: 3, rushLevel: 'red' },
    { id: `${route.id}-09`, departure: '09:00', arrivalEstimate: addTime(9, 0, route.durationMin), label: 'Standard', basePrice: calculateDynamicPrice(route.basePrice, 6, 9, 3, 3), seatsTotal: 7, seatsTaken: 1, rushLevel: 'yellow' },
    { id: `${route.id}-12`, departure: '12:00', arrivalEstimate: addTime(12, 0, route.durationMin), label: 'Heures creuses', basePrice: calculateDynamicPrice(route.basePrice, 7, 12, 3, 3), seatsTotal: 7, seatsTaken: 0, rushLevel: 'green' },
    { id: `${route.id}-17`, departure: '17:00', arrivalEstimate: addTime(17, 0, route.durationMin), label: 'Rush soir', basePrice: calculateDynamicPrice(route.basePrice, 3, 17, 3, 3), seatsTotal: 7, seatsTaken: 4, rushLevel: 'red' },
    { id: `${route.id}-19`, departure: '19:00', arrivalEstimate: addTime(19, 0, route.durationMin), label: 'Soirée', basePrice: calculateDynamicPrice(route.basePrice, 5, 19, 3, 3), seatsTotal: 7, seatsTaken: 2, rushLevel: 'yellow' },
  ];
  return slots;
};
