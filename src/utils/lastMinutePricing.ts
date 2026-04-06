export function calculateLastMinuteDiscount(
  departureTime: Date,
  seatsAvailable: number,
  totalSeats: number,
  now: Date = new Date()
): { discount: number; isLastMinute: boolean; urgencyLabel: string } {
  const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const fillRate = (totalSeats - seatsAvailable) / totalSeats;

  if (fillRate > 0.7) return { discount: 0, isLastMinute: false, urgencyLabel: "" };
  if (hoursUntilDeparture > 48) return { discount: 0, isLastMinute: false, urgencyLabel: "" };
  if (hoursUntilDeparture <= 0.5) return { discount: 0, isLastMinute: false, urgencyLabel: "" };

  let discount = 0;
  let urgencyLabel = "";

  if (hoursUntilDeparture <= 2) {
    discount = 50;
    urgencyLabel = "🔴 Départ imminent";
  } else if (hoursUntilDeparture <= 6) {
    discount = 40;
    urgencyLabel = "🔴 Dernières heures";
  } else if (hoursUntilDeparture <= 12) {
    discount = 30;
    urgencyLabel = "🟠 Ce soir";
  } else if (hoursUntilDeparture <= 24) {
    discount = 20;
    urgencyLabel = "🟡 Demain";
  } else {
    discount = 10;
    urgencyLabel = "🟢 Cette semaine";
  }

  if (seatsAvailable >= totalSeats * 0.8) discount = Math.min(discount + 10, 60);

  return { discount, isLastMinute: true, urgencyLabel };
}

export function applyLastMinutePrice(basePrice: number, discount: number): number {
  return Math.round(basePrice * (1 - discount / 100));
}

export function formatCountdown(departureTime: Date, now: Date = new Date()): string | null {
  const diffMs = departureTime.getTime() - now.getTime();
  if (diffMs <= 0) return null;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours >= 6) return null;
  return `Départ dans ${hours}h ${minutes.toString().padStart(2, '0')}min`;
}

export interface LastMinuteDeal {
  id: string;
  from: string;
  to: string;
  departureTime: Date;
  basePrice: number;
  seatsAvailable: number;
  totalSeats: number;
  flag: string;
}

export function generateSimulatedDeals(now: Date = new Date()): LastMinuteDeal[] {
  const h = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000);
  return [
    { id: 'lm-1', from: 'Annecy', to: 'Genève', departureTime: h(2), basePrice: 25, seatsAvailable: 5, totalSeats: 7, flag: '🇫🇷' },
    { id: 'lm-2', from: 'Genève', to: 'Lausanne', departureTime: h(8), basePrice: 29, seatsAvailable: 4, totalSeats: 7, flag: '🇨🇭' },
    { id: 'lm-3', from: 'Chamonix', to: 'Genève', departureTime: h(20), basePrice: 35, seatsAvailable: 6, totalSeats: 7, flag: '🇫🇷' },
    { id: 'lm-4', from: 'Genève', to: 'Zurich', departureTime: h(36), basePrice: 77, seatsAvailable: 5, totalSeats: 7, flag: '🇨🇭' },
  ];
}
