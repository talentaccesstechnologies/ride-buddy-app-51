// ============================================
// CABY VAN PRICING ENGINE — MODÈLE RYANAIR
// ============================================

export interface PricingResult {
  currentPrice: number;
  nextPrice: number;
  originalPrice: number;
  discount: number;
  isLastMinute: boolean;
  isEarlyBird: boolean;
  isFlash: boolean;
  seatTier: "earlybird" | "standard" | "peak" | "lastseat";
  urgencyLabel: string;
  urgencyColor: "green" | "orange" | "red";
  hoursUntilDeparture: number;
  fillRate: number;
}

export interface AncillaryOptions {
  seatChoice: boolean;
  largeLuggage: boolean;
  skisBike: boolean;
  priorityPickup: boolean;
  wifi: boolean;
  flexCancellation: boolean;
  drinkIncluded: boolean;
}

export const ANCILLARY_PRICES: Record<keyof AncillaryOptions, number> = {
  seatChoice: 5,
  largeLuggage: 8,
  skisBike: 15,
  priorityPickup: 6,
  wifi: 4,
  flexCancellation: 9,
  drinkIncluded: 5,
};

export const ANCILLARY_META: Record<keyof AncillaryOptions, { label: string; icon: string; popular?: boolean }> = {
  seatChoice: { label: 'Choisir mon siège', icon: '💺' },
  largeLuggage: { label: 'Grande valise', icon: '🧳', popular: true },
  skisBike: { label: 'Skis ou vélo', icon: '🎿' },
  priorityPickup: { label: 'Embarquement prioritaire', icon: '⭐' },
  wifi: { label: 'WiFi dans le VAN', icon: '📶' },
  flexCancellation: { label: 'Annulation flexible', icon: '🔄', popular: true },
  drinkIncluded: { label: 'Boisson offerte', icon: '🥤' },
};

// PILIER 1 — Prix par palier de remplissage
function getSeatTierPrice(basePrice: number, seatsSold: number, totalSeats: number): {
  price: number;
  tier: "earlybird" | "standard" | "peak" | "lastseat";
  nextPrice: number;
} {
  const fillRate = seatsSold / totalSeats;

  if (fillRate < 0.29) {
    return { price: Math.round(basePrice * 0.72), tier: "earlybird", nextPrice: Math.round(basePrice * 0.90) };
  } else if (fillRate < 0.57) {
    return { price: Math.round(basePrice * 0.90), tier: "standard", nextPrice: Math.round(basePrice * 1.05) };
  } else if (fillRate < 0.86) {
    return { price: Math.round(basePrice * 1.05), tier: "peak", nextPrice: Math.round(basePrice * 1.23) };
  } else {
    return { price: Math.round(basePrice * 1.23), tier: "lastseat", nextPrice: Math.round(basePrice * 1.23) };
  }
}

// PILIER 2 — Multiplicateur fenêtre de réservation
function getBookingWindowMultiplier(daysUntilDeparture: number): number {
  if (daysUntilDeparture >= 15) return 0.70;
  if (daysUntilDeparture >= 7) return 0.90;
  if (daysUntilDeparture >= 2) return 1.20;
  if (daysUntilDeparture >= 1) return 1.00;
  return 0.60;
}

// PILIER 3 — Last Minute dynamique
function getLastMinuteDiscount(hoursUntilDeparture: number, seatsAvailable: number, totalSeats: number): number {
  const fillRate = (totalSeats - seatsAvailable) / totalSeats;
  if (fillRate > 0.70) return 0;
  if (hoursUntilDeparture > 48) return 0;

  let discount = 0;
  if (hoursUntilDeparture <= 2) discount = 50;
  else if (hoursUntilDeparture <= 6) discount = 40;
  else if (hoursUntilDeparture <= 12) discount = 30;
  else if (hoursUntilDeparture <= 24) discount = 20;
  else discount = 10;

  if (seatsAvailable >= totalSeats * 0.80) discount = Math.min(discount + 10, 60);
  return discount;
}

// PILIER 4 — Rush hours + jour
function getRushMultiplier(departureDate: Date): number {
  const hour = departureDate.getHours();
  const day = departureDate.getDay();
  let multiplier = 1.0;

  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) multiplier *= 1.15;
  else if (hour >= 9 && hour < 16) multiplier *= 0.95;
  else multiplier *= 1.05;

  if (day === 1 && hour <= 10) multiplier *= 1.20;
  else if (day === 5 && hour >= 15) multiplier *= 1.20;
  else if (day === 0 || day === 6) multiplier *= 1.10;

  return multiplier;
}

// PILIER 5 — Saisonnalité
function getSeasonalMultiplier(departureDate: Date): number {
  const month = departureDate.getMonth() + 1;
  if (month === 1) return 1.30;
  if ([12, 2, 3].includes(month)) return 1.15;
  if ([7, 8].includes(month)) return 0.90;
  return 1.0;
}

// MOTEUR PRINCIPAL
export function calculateFullPrice(
  basePrice: number,
  seatsSold: number,
  totalSeats: number,
  departureTime: Date,
  bookingTime: Date = new Date()
): PricingResult {
  const hoursUntilDeparture = (departureTime.getTime() - bookingTime.getTime()) / (1000 * 60 * 60);
  const daysUntilDeparture = hoursUntilDeparture / 24;
  const seatsAvailable = totalSeats - seatsSold;
  const fillRate = seatsSold / totalSeats;

  const isEarlyBird = daysUntilDeparture >= 15;
  const lastMinuteDiscount = getLastMinuteDiscount(hoursUntilDeparture, seatsAvailable, totalSeats);
  const isLastMinute = lastMinuteDiscount > 0;

  const { price: tierPrice, tier, nextPrice: tierNextPrice } = getSeatTierPrice(basePrice, seatsSold, totalSeats);

  let finalPrice = tierPrice;
  finalPrice *= getBookingWindowMultiplier(daysUntilDeparture);
  finalPrice *= getRushMultiplier(departureTime);
  finalPrice *= getSeasonalMultiplier(departureTime);

  if (isLastMinute) {
    finalPrice = finalPrice * (1 - lastMinuteDiscount / 100);
  }

  const minPrice = basePrice * 0.60;
  const maxPrice = basePrice * 1.40;
  finalPrice = Math.max(minPrice, Math.min(finalPrice, maxPrice));
  finalPrice = Math.round(finalPrice);

  const nextPrice = Math.min(
    Math.round(tierNextPrice * getRushMultiplier(departureTime) * getSeasonalMultiplier(departureTime)),
    Math.round(maxPrice)
  );

  let urgencyLabel = "";
  let urgencyColor: "green" | "orange" | "red" = "green";

  if (hoursUntilDeparture <= 2) {
    urgencyLabel = "🔴 Départ imminent";
    urgencyColor = "red";
  } else if (hoursUntilDeparture <= 6) {
    urgencyLabel = "🔴 Dernières heures";
    urgencyColor = "red";
  } else if (hoursUntilDeparture <= 24) {
    urgencyLabel = "🟠 Aujourd'hui";
    urgencyColor = "orange";
  } else if (seatsAvailable <= 2) {
    urgencyLabel = "🔴 Derniers sièges";
    urgencyColor = "red";
  } else if (isEarlyBird) {
    urgencyLabel = "🟢 Early Bird";
    urgencyColor = "green";
  } else {
    urgencyLabel = "Prix standard";
    urgencyColor = "green";
  }

  return {
    currentPrice: finalPrice,
    nextPrice,
    originalPrice: basePrice,
    discount: lastMinuteDiscount || (isEarlyBird ? 30 : 0),
    isLastMinute,
    isEarlyBird,
    isFlash: false,
    seatTier: tier,
    urgencyLabel,
    urgencyColor,
    hoursUntilDeparture,
    fillRate,
  };
}

// Calcul ancillaires
export function calculateAncillaryTotal(options: Partial<AncillaryOptions>): number {
  return Object.entries(options).reduce((total, [key, selected]) => {
    if (selected && key in ANCILLARY_PRICES) {
      return total + ANCILLARY_PRICES[key as keyof typeof ANCILLARY_PRICES];
    }
    return total;
  }, 0);
}

// Flash Deals
export interface FlashDeal {
  route: string;
  flashPrice: number;
  originalPrice: number;
  seatsAvailable: number;
  departureTime: Date;
}

export function generateFlashDeals(): FlashDeal[] {
  return [
    { route: "Genève → Zurich", flashPrice: 9, originalPrice: 77, seatsAvailable: 1, departureTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    { route: "Annecy → Genève", flashPrice: 19, originalPrice: 35, seatsAvailable: 1, departureTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
  ];
}

// Conversion CHF → EUR
export function convertToEur(chfPrice: number, rate: number = 0.97): number {
  return Math.round(chfPrice * rate);
}
