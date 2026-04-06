// Caby Van dynamic pricing engine
export interface VanSlot {
  id: string;
  departure: string; // HH:MM
  arrivalEstimate: string;
  label: string;
  basePrice: number;
  seatsTotal: number;
  seatsTaken: number;
  rushLevel: 'green' | 'yellow' | 'red';
}

const BASE_PRICE = 77; // CHF per seat Geneva-Zurich
const PRICE_FLOOR = 59;
const PRICE_CEILING = 110;

export const calculateDynamicPrice = (
  seatsAvailable: number,
  seatsTotal: number,
  hour: number,
  dayOfWeek: number, // 0=Sun,1=Mon...6=Sat
  daysUntilDeparture: number,
  isSchoolHoliday: boolean = false
): number => {
  let price = BASE_PRICE;

  // Fill rate multiplier
  const seatsFree = seatsAvailable;
  if (seatsFree >= 7) price *= 0.85;
  else if (seatsFree >= 5) price *= 1.0;
  else if (seatsFree >= 3) price *= 1.1;
  else price *= 1.15;

  // Advance booking multiplier
  if (daysUntilDeparture >= 7) price *= 0.9;
  else if (daysUntilDeparture >= 3) price *= 1.0;
  else if (daysUntilDeparture >= 1) price *= 1.05;
  else price *= 1.15;

  // Rush hour multiplier
  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) price *= 1.15;
  else if (hour >= 9 && hour <= 16) price *= 0.95;
  else price *= 1.05;

  // Day of week multiplier
  if ((dayOfWeek === 1 && hour < 12) || (dayOfWeek === 5 && hour >= 16)) price *= 1.2;
  else if (dayOfWeek >= 2 && dayOfWeek <= 4) price *= 1.0;
  else if (dayOfWeek === 0 || dayOfWeek === 6) price *= 1.1;

  // Seasonality
  if (isSchoolHoliday) price *= 1.2;

  return Math.min(PRICE_CEILING, Math.max(PRICE_FLOOR, Math.round(price)));
};

export const FIXED_SLOTS: VanSlot[] = [
  { id: 'slot-07', departure: '07:00', arrivalEstimate: '10:00', label: 'Rush matin', basePrice: 89, seatsTotal: 7, seatsTaken: 3, rushLevel: 'red' },
  { id: 'slot-09', departure: '09:00', arrivalEstimate: '12:00', label: 'Standard', basePrice: 72, seatsTotal: 7, seatsTaken: 1, rushLevel: 'yellow' },
  { id: 'slot-12', departure: '12:00', arrivalEstimate: '15:00', label: 'Heures creuses', basePrice: 65, seatsTotal: 7, seatsTaken: 0, rushLevel: 'green' },
  { id: 'slot-17', departure: '17:00', arrivalEstimate: '20:00', label: 'Rush soir', basePrice: 92, seatsTotal: 7, seatsTaken: 4, rushLevel: 'red' },
  { id: 'slot-19', departure: '19:00', arrivalEstimate: '22:00', label: 'Soirée', basePrice: 78, seatsTotal: 7, seatsTaken: 2, rushLevel: 'yellow' },
];

export const CITIES = ['Genève', 'Lausanne', 'Berne', 'Bâle', 'Zurich'];

export const ROADMAP = [
  { phase: 1, label: 'Maintenant', routes: ['Genève ↔ Zurich'], active: true },
  { phase: 2, label: 'Bientôt', routes: ['+ Lausanne', '+ Berne', '+ Bâle'], active: false },
  { phase: 3, label: 'Hiver 2026', routes: ['+ Chamonix', '+ Verbier', '+ Zermatt', '+ Davos'], active: false },
];
