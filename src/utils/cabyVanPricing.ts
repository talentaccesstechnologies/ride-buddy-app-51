// ============================================
// CABY VAN PRICING ENGINE — MODÈLE RYANAIR
// v2.0 — Yield Management Réel + Garanties
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

// ============================================
// NOUVEAUX TYPES — YIELD MANAGEMENT RÉEL
// ============================================

export type RouteSegment =
  | 'pendulaire' | 'business' | 'ski' | 'tourisme'
  | 'premium' | 'frontalier' | 'institutionnel'
  | 'horlogerie' | 'international';

export interface VanViabilityResult {
  isViable: boolean;
  seatsSold: number;
  breakEvenSeats: number;
  currentRevenue: number;
  driverGuarantee: number;
  cabySubsidy: number;
  driverNetRevenue: number;
  fillRate: number;
  driverMessage: string;
  statusColor: 'green' | 'orange' | 'red';
}

export interface DriverEarnings {
  cabyCommissionRate: number;
  grossRevenue: number;
  cabyCommission: number;
  driverNet: number;
  minimumGuarantee: number;
  finalDriverPayout: number;
  punctualityBonus: number;
}

// ============================================
// ÉCONOMIE PAR SEGMENT
// ============================================

interface SegmentEconomics {
  commissionRate: number;
  breakEvenSeats: number;
  driverMinGuarantee: number;
  punctualityBonus: number;
}

const SEGMENT_ECONOMICS: Record<RouteSegment, SegmentEconomics> = {
  frontalier:     { commissionRate: 0.15, breakEvenSeats: 3, driverMinGuarantee: 35,  punctualityBonus: 3  },
  pendulaire:     { commissionRate: 0.18, breakEvenSeats: 3, driverMinGuarantee: 45,  punctualityBonus: 3  },
  business:       { commissionRate: 0.20, breakEvenSeats: 3, driverMinGuarantee: 65,  punctualityBonus: 5  },
  ski:            { commissionRate: 0.18, breakEvenSeats: 4, driverMinGuarantee: 90,  punctualityBonus: 5  },
  tourisme:       { commissionRate: 0.20, breakEvenSeats: 3, driverMinGuarantee: 60,  punctualityBonus: 4  },
  premium:        { commissionRate: 0.22, breakEvenSeats: 3, driverMinGuarantee: 120, punctualityBonus: 8  },
  horlogerie:     { commissionRate: 0.20, breakEvenSeats: 3, driverMinGuarantee: 80,  punctualityBonus: 5  },
  institutionnel: { commissionRate: 0.18, breakEvenSeats: 3, driverMinGuarantee: 70,  punctualityBonus: 5  },
  international:  { commissionRate: 0.22, breakEvenSeats: 4, driverMinGuarantee: 150, punctualityBonus: 10 },
};

// ============================================
// PILIER 1 — Prix par palier de remplissage
// ============================================

function getSeatTierPrice(
  basePrice: number,
  seatsSold: number,
  totalSeats: number
): { price: number; tier: "earlybird" | "standard" | "peak" | "lastseat"; nextPrice: number } {
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

// ============================================
// PILIER 2 — Fenêtre de réservation
// ============================================

function getBookingWindowMultiplier(daysUntilDeparture: number): number {
  if (daysUntilDeparture >= 15) return 0.70;
  if (daysUntilDeparture >= 7)  return 0.90;
  if (daysUntilDeparture >= 2)  return 1.20;
  if (daysUntilDeparture >= 1)  return 1.00;
  return 0.60;
}

// ============================================
// PILIER 3 — Last Minute dynamique
// ============================================

function getLastMinuteDiscountInternal(
  hoursUntilDeparture: number,
  seatsAvailable: number,
  totalSeats: number
): number {
  const fillRate = (totalSeats - seatsAvailable) / totalSeats;
  if (fillRate > 0.70) return 0;
  if (hoursUntilDeparture > 48) return 0;
  let discount = 0;
  if (hoursUntilDeparture <= 2)       discount = 50;
  else if (hoursUntilDeparture <= 6)  discount = 40;
  else if (hoursUntilDeparture <= 12) discount = 30;
  else if (hoursUntilDeparture <= 24) discount = 20;
  else                                discount = 10;
  if (seatsAvailable >= totalSeats * 0.80) discount = Math.min(discount + 10, 60);
  return discount;
}

// ============================================
// PILIER 4 — Rush hours + jour de semaine
// ============================================

function getRushMultiplier(departureDate: Date): number {
  const hour = departureDate.getHours();
  const day  = departureDate.getDay();
  let multiplier = 1.0;
  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) multiplier *= 1.15;
  else if (hour >= 9 && hour < 16) multiplier *= 0.95;
  else multiplier *= 1.05;
  if (day === 1 && hour <= 10)      multiplier *= 1.20;
  else if (day === 5 && hour >= 15) multiplier *= 1.20;
  else if (day === 0 || day === 6)  multiplier *= 1.10;
  return multiplier;
}

// ============================================
// PILIER 5 — Saisonnalité
// ============================================

function getSeasonalMultiplier(departureDate: Date): number {
  const month = departureDate.getMonth() + 1;
  if (month === 1)                    return 1.30;
  if ([12, 2, 3].includes(month))     return 1.15;
  if ([7, 8].includes(month))         return 0.90;
  return 1.0;
}

// ============================================
// MOTEUR PRINCIPAL — calculateFullPrice
// (interface identique à la v1 — aucun breaking change)
// ============================================

export function calculateFullPrice(
  basePrice: number,
  seatsSold: number,
  totalSeats: number,
  departureTime: Date,
  bookingTime: Date = new Date()
): PricingResult {
  const hoursUntilDeparture = (departureTime.getTime() - bookingTime.getTime()) / (1000 * 60 * 60);
  const daysUntilDeparture  = hoursUntilDeparture / 24;
  const seatsAvailable      = totalSeats - seatsSold;
  const fillRate            = seatsSold / totalSeats;

  const isEarlyBird         = daysUntilDeparture >= 15;
  const lastMinuteDiscount  = getLastMinuteDiscountInternal(hoursUntilDeparture, seatsAvailable, totalSeats);
  const isLastMinute        = lastMinuteDiscount > 0;

  const { price: tierPrice, tier, nextPrice: tierNextPrice } = getSeatTierPrice(basePrice, seatsSold, totalSeats);

  let finalPrice = tierPrice;
  finalPrice *= getBookingWindowMultiplier(daysUntilDeparture);
  finalPrice *= getRushMultiplier(departureTime);
  finalPrice *= getSeasonalMultiplier(departureTime);
  if (isLastMinute) finalPrice = finalPrice * (1 - lastMinuteDiscount / 100);

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
  if (hoursUntilDeparture <= 2)        { urgencyLabel = "🔴 Départ imminent";   urgencyColor = "red";    }
  else if (hoursUntilDeparture <= 6)   { urgencyLabel = "🔴 Dernières heures";  urgencyColor = "red";    }
  else if (hoursUntilDeparture <= 24)  { urgencyLabel = "🟠 Aujourd'hui";       urgencyColor = "orange"; }
  else if (seatsAvailable <= 2)        { urgencyLabel = "🔴 Derniers sièges";   urgencyColor = "red";    }
  else if (isEarlyBird)                { urgencyLabel = "🟢 Early Bird";        urgencyColor = "green";  }
  else                                 { urgencyLabel = "Prix standard";        urgencyColor = "green";  }

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

// ============================================
// NOUVEAU — calculateVanViability
// Détermine si le van est rentable et calcule
// la subvention Caby si sous le seuil
// ============================================

export function calculateVanViability(
  basePrice: number,
  seatsSold: number,
  totalSeats: number,
  segment: RouteSegment,
  departureTime: Date,
  bookingTime: Date = new Date()
): VanViabilityResult {
  const economics = SEGMENT_ECONOMICS[segment];
  const fillRate  = seatsSold / totalSeats;

  // Revenu actuel = somme des prix de chaque siège vendu
  // On approxime avec le prix moyen pondéré selon le palier de remplissage
  const avgPriceResult = calculateFullPrice(basePrice, Math.max(0, seatsSold - 1), totalSeats, departureTime, bookingTime);
  const currentRevenue = Math.round(avgPriceResult.currentPrice * seatsSold);

  const driverGuarantee = economics.driverMinGuarantee;
  const isViable        = seatsSold >= economics.breakEvenSeats;

  // Net chauffeur = revenu - commission Caby
  const driverNetRevenue = Math.round(currentRevenue * (1 - economics.commissionRate));

  // Subvention Caby = différence entre garantie et revenu net si sous le seuil
  const cabySubsidy = isViable
    ? 0
    : Math.max(0, driverGuarantee - driverNetRevenue);

  let driverMessage = "";
  let statusColor: 'green' | 'orange' | 'red' = 'green';

  if (seatsSold === 0) {
    driverMessage = `Aucune réservation — garantie CHF ${driverGuarantee} si le départ est confirmé`;
    statusColor = 'red';
  } else if (!isViable) {
    driverMessage = `${seatsSold}/${totalSeats} sièges — Caby complète à CHF ${driverGuarantee} garanti`;
    statusColor = 'orange';
  } else if (fillRate >= 0.86) {
    driverMessage = `${seatsSold}/${totalSeats} sièges — Van presque plein 🔥 CHF ${driverNetRevenue} estimé`;
    statusColor = 'green';
  } else {
    driverMessage = `${seatsSold}/${totalSeats} sièges — CHF ${driverNetRevenue} estimé`;
    statusColor = 'green';
  }

  return {
    isViable,
    seatsSold,
    breakEvenSeats: economics.breakEvenSeats,
    currentRevenue,
    driverGuarantee,
    cabySubsidy,
    driverNetRevenue,
    fillRate,
    driverMessage,
    statusColor,
  };
}

// ============================================
// NOUVEAU — calculateDriverEarnings
// Calcul complet du revenu chauffeur pour
// un trajet donné avec bonus ponctualité
// ============================================

export function calculateDriverEarnings(
  basePrice: number,
  seatsSold: number,
  totalSeats: number,
  segment: RouteSegment,
  departureTime: Date,
  isPunctual: boolean = true,
  bookingTime: Date = new Date()
): DriverEarnings {
  const economics    = SEGMENT_ECONOMICS[segment];
  const viability    = calculateVanViability(basePrice, seatsSold, totalSeats, segment, departureTime, bookingTime);
  const grossRevenue = viability.currentRevenue;
  const commission   = Math.round(grossRevenue * economics.commissionRate);
  const driverNet    = grossRevenue - commission;
  const bonus        = isPunctual ? economics.punctualityBonus : 0;
  const finalPayout  = Math.max(driverNet + bonus, economics.driverMinGuarantee + bonus);

  return {
    cabyCommissionRate: economics.commissionRate,
    grossRevenue,
    cabyCommission: commission,
    driverNet,
    minimumGuarantee: economics.driverMinGuarantee,
    finalDriverPayout: finalPayout,
    punctualityBonus: bonus,
  };
}

// ============================================
// NOUVEAU — calculateBreakEvenSeats
// Combien de sièges pour couvrir le chauffeur
// ============================================

export function calculateBreakEvenSeats(segment: RouteSegment): number {
  return SEGMENT_ECONOMICS[segment].breakEvenSeats;
}

// ============================================
// NOUVEAU — calculateCabySubsidy
// Montant exact que Caby doit avancer
// si le van part sous le seuil de rentabilité
// ============================================

export function calculateCabySubsidy(
  basePrice: number,
  seatsSold: number,
  totalSeats: number,
  segment: RouteSegment,
  departureTime: Date,
  bookingTime: Date = new Date()
): number {
  const viability = calculateVanViability(basePrice, seatsSold, totalSeats, segment, departureTime, bookingTime);
  return viability.cabySubsidy;
}

// ============================================
// NOUVEAU — shouldVanDepart
// Le van doit-il partir ? (logique opérationnelle)
// ============================================

export interface DepartureDecision {
  shouldDepart: boolean;
  reason: string;
  cabyAction: string;
  hoursUntilDeparture: number;
}

export function shouldVanDepart(
  seatsSold: number,
  totalSeats: number,
  segment: RouteSegment,
  departureTime: Date,
  now: Date = new Date()
): DepartureDecision {
  const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const economics = SEGMENT_ECONOMICS[segment];
  const isViable  = seatsSold >= economics.breakEvenSeats;

  // Moins de 2h avant le départ → le van part toujours (chauffeur en route)
  if (hoursUntilDeparture <= 2) {
    return {
      shouldDepart: true,
      reason: `Départ imminent — ${seatsSold} passager(s) confirmé(s)`,
      cabyAction: seatsSold === 0
        ? `Annuler et payer CHF ${economics.driverMinGuarantee} au chauffeur`
        : `Payer garantie CHF ${economics.driverMinGuarantee} si < ${economics.breakEvenSeats} sièges`,
      hoursUntilDeparture,
    };
  }

  // Plus de 2h → décision selon viabilité
  if (isViable) {
    return {
      shouldDepart: true,
      reason: `${seatsSold}/${totalSeats} sièges vendus — seuil atteint`,
      cabyAction: "Aucune action requise — trajet rentable",
      hoursUntilDeparture,
    };
  }

  // Sous le seuil mais pas encore l'heure critique
  if (hoursUntilDeparture > 24) {
    return {
      shouldDepart: false,
      reason: `Seulement ${seatsSold}/${economics.breakEvenSeats} sièges minimum atteints`,
      cabyAction: `Activer promo last-minute pour remplir le van`,
      hoursUntilDeparture,
    };
  }

  // Entre 2h et 24h : départ si au moins 1 passager
  return {
    shouldDepart: seatsSold >= 1,
    reason: seatsSold >= 1
      ? `${seatsSold} passager(s) — départ maintenu avec garantie chauffeur`
      : `Aucun passager — annulation recommandée`,
    cabyAction: seatsSold >= 1
      ? `Subvention CHF ${economics.driverMinGuarantee - Math.round(seatsSold * 0.82 * (economics.driverMinGuarantee / economics.breakEvenSeats))} à prévoir`
      : `Annuler et payer indemnité chauffeur CHF ${Math.round(economics.driverMinGuarantee * 0.5)}`,
    hoursUntilDeparture,
  };
}

// ============================================
// EXISTANT — calculateAncillaryTotal
// (inchangé)
// ============================================

export function calculateAncillaryTotal(options: Partial<AncillaryOptions>): number {
  return Object.entries(options).reduce((total, [key, selected]) => {
    if (selected && key in ANCILLARY_PRICES) {
      return total + ANCILLARY_PRICES[key as keyof typeof ANCILLARY_PRICES];
    }
    return total;
  }, 0);
}

// ============================================
// EXISTANT — Flash Deals
// (inchangé)
// ============================================

export interface FlashDeal {
  route: string;
  flashPrice: number;
  originalPrice: number;
  seatsAvailable: number;
  departureTime: Date;
}

export function generateFlashDeals(): FlashDeal[] {
  return [
    { route: "Genève → Zurich",  flashPrice: 9,  originalPrice: 77, seatsAvailable: 1, departureTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    { route: "Annecy → Genève", flashPrice: 19, originalPrice: 35, seatsAvailable: 1, departureTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
  ];
}

// ============================================
// EXISTANT — lastMinutePricing
// (fusionné ici pour éviter la duplication)
// ============================================

export function calculateLastMinuteDiscount(
  departureTime: Date,
  seatsAvailable: number,
  totalSeats: number,
  now: Date = new Date()
): { discount: number; isLastMinute: boolean; urgencyLabel: string } {
  const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const fillRate = (totalSeats - seatsAvailable) / totalSeats;

  if (fillRate > 0.7)           return { discount: 0, isLastMinute: false, urgencyLabel: "" };
  if (hoursUntilDeparture > 48) return { discount: 0, isLastMinute: false, urgencyLabel: "" };
  if (hoursUntilDeparture <= 0.5) return { discount: 0, isLastMinute: false, urgencyLabel: "" };

  let discount = 0;
  let urgencyLabel = "";

  if (hoursUntilDeparture <= 2)        { discount = 50; urgencyLabel = "🔴 Départ imminent"; }
  else if (hoursUntilDeparture <= 6)   { discount = 40; urgencyLabel = "🔴 Dernières heures"; }
  else if (hoursUntilDeparture <= 12)  { discount = 30; urgencyLabel = "🟠 Ce soir"; }
  else if (hoursUntilDeparture <= 24)  { discount = 20; urgencyLabel = "🟡 Demain"; }
  else                                 { discount = 10; urgencyLabel = "🟢 Cette semaine"; }

  if (seatsAvailable >= totalSeats * 0.8) discount = Math.min(discount + 10, 60);

  return { discount, isLastMinute: true, urgencyLabel };
}

export function applyLastMinutePrice(basePrice: number, discount: number): number {
  return Math.round(basePrice * (1 - discount / 100));
}

export function formatCountdown(departureTime: Date, now: Date = new Date()): string | null {
  const diffMs = departureTime.getTime() - now.getTime();
  if (diffMs <= 0) return null;
  const hours   = Math.floor(diffMs / (1000 * 60 * 60));
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
    { id: 'lm-1', from: 'Annecy',  to: 'Genève',   departureTime: h(2),  basePrice: 25, seatsAvailable: 5, totalSeats: 7, flag: '🇫🇷' },
    { id: 'lm-2', from: 'Genève',  to: 'Lausanne',  departureTime: h(8),  basePrice: 29, seatsAvailable: 4, totalSeats: 7, flag: '🇨🇭' },
    { id: 'lm-3', from: 'Chamonix',to: 'Genève',    departureTime: h(20), basePrice: 35, seatsAvailable: 6, totalSeats: 7, flag: '🇫🇷' },
    { id: 'lm-4', from: 'Genève',  to: 'Zurich',    departureTime: h(36), basePrice: 77, seatsAvailable: 5, totalSeats: 7, flag: '🇨🇭' },
  ];
}

// ============================================
// UTILITAIRE — Conversion CHF → EUR
// ============================================

export function convertToEur(chfPrice: number, rate: number = 0.97): number {
  return Math.round(chfPrice * rate);
}
