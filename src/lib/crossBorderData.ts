// Cross-Border vehicle types & pricing
export type CrossBorderVehicle = 'berline' | 'suv' | 'monospace' | 'van';

export interface CrossBorderRoute {
  id: number;
  from: string;
  to: string;
  duration: number; // minutes
  suggestedPrice: Record<CrossBorderVehicle, number>;
  category: 'frontalier' | 'regional' | 'longue_distance' | 'italie';
}

export interface CrossBorderVehicleType {
  key: CrossBorderVehicle;
  label: string;
  seats: number; // sellable seats
  examples: string;
  icon: string;
}

export const VEHICLE_TYPES: CrossBorderVehicleType[] = [
  { key: 'berline', label: 'Berline', seats: 3, examples: 'Tesla Model 3, BMW Série 3', icon: '🚗' },
  { key: 'suv', label: 'SUV', seats: 4, examples: 'Tesla Model Y, BMW X5', icon: '🚙' },
  { key: 'monospace', label: 'Monospace', seats: 5, examples: 'Citroën C4 Picasso', icon: '🚕' },
  { key: 'van', label: 'VAN', seats: 6, examples: 'Mercedes Vito, VW Transporter', icon: '🚐' },
];

export const PRICING_RULES: Record<CrossBorderVehicle, { min: number; max: number }> = {
  berline: { min: 12, max: 45 },
  suv: { min: 15, max: 55 },
  monospace: { min: 18, max: 65 },
  van: { min: 22, max: 85 },
};

export const EUR_RATE = 0.97; // CHF → EUR
export const CROSS_BORDER_COMMISSION = 0.15; // 15%

export const crossBorderRoutes: CrossBorderRoute[] = [
  // FRONTALIERS QUOTIDIENS
  { id: 1, from: "Ferney-Voltaire", to: "Genève", duration: 15, suggestedPrice: { berline: 12, suv: 14, monospace: 16, van: 18 }, category: 'frontalier' },
  { id: 2, from: "Annemasse", to: "Genève", duration: 20, suggestedPrice: { berline: 14, suv: 16, monospace: 18, van: 20 }, category: 'frontalier' },
  { id: 3, from: "Saint-Julien-en-Genevois", to: "Genève", duration: 20, suggestedPrice: { berline: 14, suv: 16, monospace: 18, van: 20 }, category: 'frontalier' },
  { id: 4, from: "Gex", to: "Genève", duration: 25, suggestedPrice: { berline: 15, suv: 18, monospace: 20, van: 22 }, category: 'frontalier' },
  { id: 5, from: "Divonne-les-Bains", to: "Genève", duration: 25, suggestedPrice: { berline: 15, suv: 18, monospace: 20, van: 22 }, category: 'frontalier' },
  { id: 6, from: "Thonon-les-Bains", to: "Genève", duration: 40, suggestedPrice: { berline: 20, suv: 24, monospace: 27, van: 30 }, category: 'frontalier' },
  { id: 7, from: "Bellegarde", to: "Genève", duration: 40, suggestedPrice: { berline: 20, suv: 24, monospace: 27, van: 30 }, category: 'frontalier' },
  // RÉGIONAUX
  { id: 8, from: "Annecy", to: "Genève", duration: 45, suggestedPrice: { berline: 25, suv: 29, monospace: 33, van: 38 }, category: 'regional' },
  { id: 9, from: "Bonneville", to: "Genève", duration: 45, suggestedPrice: { berline: 25, suv: 29, monospace: 33, van: 38 }, category: 'regional' },
  { id: 10, from: "Cluses", to: "Genève", duration: 55, suggestedPrice: { berline: 28, suv: 32, monospace: 36, van: 42 }, category: 'regional' },
  { id: 11, from: "Chambéry", to: "Genève", duration: 75, suggestedPrice: { berline: 32, suv: 37, monospace: 42, van: 48 }, category: 'regional' },
  { id: 12, from: "Bourg-en-Bresse", to: "Genève", duration: 90, suggestedPrice: { berline: 38, suv: 44, monospace: 50, van: 58 }, category: 'regional' },
  { id: 13, from: "Grenoble", to: "Genève", duration: 105, suggestedPrice: { berline: 42, suv: 48, monospace: 55, van: 63 }, category: 'regional' },
  // LONGUE DISTANCE
  { id: 14, from: "Lyon", to: "Genève", duration: 105, suggestedPrice: { berline: 42, suv: 48, monospace: 55, van: 63 }, category: 'longue_distance' },
  { id: 15, from: "Mâcon", to: "Genève", duration: 120, suggestedPrice: { berline: 45, suv: 52, monospace: 59, van: 68 }, category: 'longue_distance' },
  { id: 16, from: "Dijon", to: "Genève", duration: 150, suggestedPrice: { berline: 52, suv: 60, monospace: 68, van: 78 }, category: 'longue_distance' },
  { id: 17, from: "Marseille", to: "Genève", duration: 270, suggestedPrice: { berline: 75, suv: 85, monospace: 95, van: 110 }, category: 'longue_distance' },
  { id: 18, from: "Paris", to: "Genève", duration: 270, suggestedPrice: { berline: 75, suv: 85, monospace: 95, van: 110 }, category: 'longue_distance' },
  // ITALIE VIA SIMPLON
  { id: 19, from: "Domodossola", to: "Genève", duration: 120, suggestedPrice: { berline: 45, suv: 52, monospace: 59, van: 68 }, category: 'italie' },
  { id: 20, from: "Milan", to: "Genève", duration: 240, suggestedPrice: { berline: 70, suv: 80, monospace: 90, van: 105 }, category: 'italie' },
];

// All routes bidirectional
export const ALL_CB_ROUTES: CrossBorderRoute[] = [
  ...crossBorderRoutes,
  ...crossBorderRoutes.map(r => ({ ...r, id: r.id + 100, from: r.to, to: r.from })),
];

export const ALL_CB_CITIES = [...new Set(ALL_CB_ROUTES.flatMap(r => [r.from, r.to]))].sort();

// Swiss cities in canton de Genève — blocked for both origin+dest
const GENEVA_CANTON_CITIES = ['Genève', 'Carouge', 'Lancy', 'Meyrin', 'Vernier', 'Onex', 'Thônex', 'Chêne-Bourg', 'Plan-les-Ouates'];

// International cities (non-Swiss)
const FOREIGN_CITIES = [
  'Ferney-Voltaire', 'Annemasse', 'Saint-Julien-en-Genevois', 'Gex', 'Divonne-les-Bains',
  'Thonon-les-Bains', 'Bellegarde', 'Annecy', 'Bonneville', 'Cluses', 'Chambéry',
  'Bourg-en-Bresse', 'Grenoble', 'Lyon', 'Mâcon', 'Dijon', 'Marseille', 'Paris',
  'Domodossola', 'Milan', 'Chamonix', 'Morzine', 'Courchevel', "Val d'Isère", 'Les Arcs',
  'Strasbourg', 'Munich',
];

export const isForeignCity = (city: string) => FOREIGN_CITIES.includes(city);
export const isGenevaCanton = (city: string) => GENEVA_CANTON_CITIES.includes(city);

/** Returns true if the trip is valid cross-border (at least one point outside CH) */
export const isValidCrossBorder = (from: string, to: string): boolean => {
  if (!from || !to || from === to) return false;
  // At least one point must be foreign
  return isForeignCity(from) || isForeignCity(to);
};

export const findCBRoute = (from: string, to: string) =>
  ALL_CB_ROUTES.find(r => r.from === from && r.to === to);

export const getCBDestinations = (from: string, category?: string) => {
  let routes = ALL_CB_ROUTES.filter(r => r.from === from);
  if (category && category !== 'all') routes = routes.filter(r => r.category === category);
  return routes.map(r => r.to);
};

export const formatDurationCB = (min: number): string => {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
};

// Generate simulated slots for cross-border route
export interface CBSlot {
  id: string;
  departure: string;
  arrival: string;
  vehicle: CrossBorderVehicle;
  driverName: string;
  driverRating: number;
  driverPhoto: string;
  seatsTotal: number;
  seatsTaken: number;
  pricePerSeat: number;
  isElectric: boolean;
}

const DRIVER_NAMES = ['Pierre D.', 'Marie L.', 'Ahmed K.', 'Sophie B.', 'Lucas M.', 'Julie R.', 'Thomas G.', 'Léa V.'];
const DRIVER_PHOTOS = ['👨‍✈️', '👩‍✈️', '🧑‍✈️', '👩‍💼', '👨‍💼', '👩‍🔧', '🧑‍💼', '👩‍⚕️'];

export const generateCBSlots = (route: CrossBorderRoute, vehicleFilter?: CrossBorderVehicle | 'all'): CBSlot[] => {
  const addTime = (hh: number, mm: number, addMin: number) => {
    const total = hh * 60 + mm + addMin;
    return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };

  const hours = route.category === 'frontalier'
    ? [6, 6.5, 7, 7.5, 8, 17, 17.5, 18, 18.5, 19]
    : route.duration > 180
      ? [7, 12, 17]
      : [7, 9, 12, 17, 19];

  const vehicles: CrossBorderVehicle[] = vehicleFilter && vehicleFilter !== 'all'
    ? [vehicleFilter]
    : ['berline', 'suv', 'van'];

  const slots: CBSlot[] = [];
  let idx = 0;

  for (const h of hours) {
    const hh = Math.floor(h);
    const mm = (h % 1) * 60;
    for (const v of vehicles) {
      const vt = VEHICLE_TYPES.find(vv => vv.key === v)!;
      const taken = Math.floor(Math.random() * vt.seats);
      const isElec = Math.random() > 0.75;
      const price = route.suggestedPrice[v] * (isElec ? 1.1 : 1);

      slots.push({
        id: `cb-${route.id}-${hh}${mm}-${v}-${idx}`,
        departure: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
        arrival: addTime(hh, mm, route.duration),
        vehicle: v,
        driverName: DRIVER_NAMES[idx % DRIVER_NAMES.length],
        driverRating: 4.5 + Math.round(Math.random() * 5) / 10,
        driverPhoto: DRIVER_PHOTOS[idx % DRIVER_PHOTOS.length],
        seatsTotal: vt.seats,
        seatsTaken: taken,
        pricePerSeat: Math.round(price),
        isElectric: isElec,
      });
      idx++;
    }
  }

  return slots;
};
