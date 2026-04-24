// ============================================
// CABY VAN PRICING ENGINE — MODÈLE RYANAIR
// v2.1 — Corrections sécurité + robustesse
// PATCH : risques #2, #3, #5 (audit sécurité)
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
  // NOUVEAU v2.1
  isPastDeparture: boolean;
  priceError: string | null;
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
// [v2.1] VALIDATION DES ENTRÉES
// Appliquée en entrée de calculateFullPrice()
// Retourne null si valide, string d'erreur sinon
// ============================================

export interface PricingInputError {
  field: 'basePrice' | 'seatsSold' | 'totalSeats' | 'departureTime';
  message: string;
}

export function validatePricingInputs(
  basePrice: number,
  seatsSold: number,
  totalSeats: number,
  departureTime: Date,
  bookingTime: Date = new Date()
): PricingInputError | null {

  // CORRECTIF RISQUE #2 — base_price = 0 → vente à 0 CHF possible
  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    return { field: 'basePrice', message: `basePrice invalide: ${basePrice} — doit être > 0` };
  }

  // Plafond de cohérence (CHF 999 max par siège)
  if (basePrice > 999) {
    return { field: 'basePrice', message: `basePrice suspect: ${basePrice} — max CHF 999` };
  }

  if (!Number.isInteger(totalSeats) || totalSeats < 1 || totalSeats > 9) {
    return { field: 'totalSeats', message: `totalSeats invalide: ${totalSeats} — doit être entre 1 et 9` };
  }

  if (!Number.isInteger(seatsSold) || seatsSold < 0) {
    return { field: 'seatsSold', message: `seatsSold invalide: ${seatsSold} — doit être >= 0` };
  }

  // CORRECTIF RISQUE #3 race condition — seatsSold > totalSeats
  if (seatsSold > totalSeats) {
    return { field: 'seatsSold', message: `seatsSold (${seatsSold}) > totalSeats (${totalSeats}) — incohérence base de données` };
  }

  if (!(departureTime instanceof Date) || isNaN(departureTime.getTime())) {
    return { field: 'departureTime', message: `departureTime invalide: ${departureTime}` };
  }

  return null;
}

// ============================================
// PILIER 1 — Prix par palier de remplissage
// ============================================

function getSeatTierPrice(
  basePrice: number,
  seatsSold: number,
  totalSeats: number
): { price: number; tier: "earlybird" | "standard" | "peak" | "lastseat"; nextPrice: number } {
  // [v2.1] seatsSold normalisé — ne peut pas dépasser totalSeats
  const safeSeatsSold = Math.min(seatsSold, totalSeats);
  const fillRate = safeSeatsSold / totalSeats;

  if (fillRate < 0.29) {
    return { price: Math.round(basePrice * 0.72), tier: "earlybird", nextPrice: Math.round(basePrice * 0.90) };
  } else if (fillRate < 0.57) {
    return { price: Math.round(basePrice * 0.90), tier: "standard",  nextPrice: Math.round(basePrice * 1.05) };
  } else if (safeSeatsSold < totalSeats - 1) {
    return { price: Math.round(basePrice * 1.05), tier: "peak",      nextPrice: Math.round(basePrice * 1.23) };
  } else {
    return { price: Math.round(basePrice * 1.23), tier: "lastseat",  nextPrice: Math.round(basePrice * 1.23) };
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
  // [v2.1] seatsAvailable normalisé
  const safeSeatsAvailable = Math.max(0, seatsAvailable);
  const fillRate = (totalSeats - safeSeatsAvailable) / totalSeats;

  if (fillRate > 0.70) return 0;
  if (hoursUntilDeparture > 48) return 0;

  let discount = 0;
  if (hoursUntilDeparture <= 2)       discount = 50;
  else if (hoursUntilDeparture <= 6)  discount = 40;
  else if (hoursUntilDeparture <= 12) discount = 30;
  else if (hoursUntilDeparture <= 24) discount = 20;
  else                                discount = 10;

  if (safeSeatsAvailable >= totalSeats * 0.80) discount = Math.min(discount + 10, 60);
  return discount;
}

// ============================================
// PILIER 4 — Rush hours
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
// RÉSULTAT D'ERREUR — prix refusé
// Retourné quand les inputs sont invalides
// ============================================

function errorPricingResult(
  basePrice: number,
  errorMessage: string,
  isPastDeparture: boolean = false
): PricingResult {
  return {
    currentPrice: 0,
    nextPrice: 0,
    originalPrice: basePrice,
    discount: 0,
    isLastMinute: false,
    isEarlyBird: false,
    isFlash: false,
    seatTier: "standard",
    urgencyLabel: isPastDeparture ? "⛔ Départ passé" : "⛔ Prix indisponible",
    urgencyColor: "red",
    hoursUntilDeparture: 0,
    fillRate: 0,
    isPastDeparture,
    priceError: errorMessage,
  };
}

// ============================================
// MOTEUR PRINCIPAL — calculateFullPrice v2.1
// Compatibilité ascendante : même signature
// Nouvelles propriétés : isPastDeparture, priceError
// ============================================

export function calculateFullPrice(
  basePrice: number,
  seatsSold: number,
  totalSeats: number,
  departureTime: Date,
  bookingTime: Date = new Date()
): PricingResult {

  // ── [v2.1] VALIDATION ENTRÉES ──────────────────
  const validationError = validatePricingInputs(
    basePrice, seatsSold, totalSeats, departureTime, bookingTime
  );
  if (validationError) {
    console.error(`[CabyPricing] ${validationError.field}: ${validationError.message}`);
    return errorPricingResult(basePrice, validationError.message, false);
  }

  // ── [v2.1] CORRECTIF RISQUE #3 — départ dans le passé ──
  const hoursUntilDeparture = (departureTime.getTime() - bookingTime.getTime()) / (1000 * 60 * 60);
  if (hoursUntilDeparture < -0.5) {
    // Tolérance de 30 min pour les retards de saisie
    return errorPricingResult(
      basePrice,
      `Départ le ${departureTime.toISOString()} est dans le passé — réservation impossible`,
      true
    );
  }

  const daysUntilDeparture = hoursUntilDeparture / 24;

  // ── [v2.1] Normalisation sécurisée ─────────────
  const safeSeatsSold  = Math.min(Math.max(0, seatsSold), totalSeats);
  const seatsAvailable = totalSeats - safeSeatsSold;
  const fillRate       = safeSeatsSold / totalSeats;

  const isEarlyBird        = daysUntilDeparture >= 15;
  const lastMinuteDiscount = getLastMinuteDiscountInternal(hoursUntilDeparture, seatsAvailable, totalSeats);
  const isLastMinute       = lastMinuteDiscount > 0;

  const { price: tierPrice, tier, nextPrice: tierNextPrice } =
    getSeatTierPrice(basePrice, safeSeatsSold, totalSeats);

  let finalPrice = tierPrice;
  finalPrice *= getBookingWindowMultiplier(daysUntilDeparture);
  finalPrice *= getRushMultiplier(departureTime);
  const seasonalMult = getSeasonalMultiplier(departureTime);
  finalPrice *= seasonalMult;
  if (isLastMinute) finalPrice = finalPrice * (1 - lastMinuteDiscount / 100);

  const minPrice = basePrice * 0.60 * seasonalMult;
  const maxPrice = basePrice * 1.40 * seasonalMult;
  finalPrice = Math.max(minPrice, Math.min(finalPrice, maxPrice));
  finalPrice = Math.round(finalPrice);

  const nextPrice = Math.min(
    Math.round(tierNextPrice * getRushMultiplier(departureTime) * seasonalMult),
    Math.round(maxPrice)
  );

  let urgencyLabel = "";
  let urgencyColor: "green" | "orange" | "red" = "green";
  if (hoursUntilDeparture <= 2)       { urgencyLabel = "🔴 Départ imminent";  urgencyColor = "red";    }
  else if (hoursUntilDeparture <= 6)  { urgencyLabel = "🔴 Dernières heures"; urgencyColor = "red";    }
  else if (hoursUntilDeparture <= 24) { urgencyLabel = "🟠 Aujourd'hui";      urgencyColor = "orange"; }
  else if (seatsAvailable <= 2)       { urgencyLabel = "🔴 Derniers sièges";  urgencyColor = "red";    }
  else if (isEarlyBird)               { urgencyLabel = "🟢 Early Bird";       urgencyColor = "green";  }
  else                                { urgencyLabel = "Prix standard";       urgencyColor = "green";  }

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
    isPastDeparture: false,
    priceError: null,
  };
}

// ============================================
// [v2.1] HELPER — vérification avant réservation
// À appeler dans createVanBooking() avant INSERT
// ============================================

export interface BookingPriceCheck {
  isValid: boolean;
  serverPrice: number;
  clientPrice: number;
  discrepancy: number;
  reason: string | null;
}

export function validateBookingPrice(
  basePrice: number,
  seatsSold: number,
  totalSeats: number,
  departureTime: Date,
  clientPrice: number,
  tolerancePct: number = 0.05
): BookingPriceCheck {
  const pricing = calculateFullPrice(basePrice, seatsSold, totalSeats, departureTime);

  if (pricing.priceError) {
    return {
      isValid: false,
      serverPrice: 0,
      clientPrice,
      discrepancy: 100,
      reason: pricing.priceError,
    };
  }

  const serverPrice  = pricing.currentPrice;
  const discrepancy  = Math.abs(clientPrice - serverPrice) / serverPrice;
  const isValid      = discrepancy <= tolerancePct;

  return {
    isValid,
    serverPrice,
    clientPrice,
    discrepancy: Math.round(discrepancy * 100),
    reason: isValid
      ? null
      : `Prix client CHF ${clientPrice} vs prix serveur CHF ${serverPrice} — écart ${Math.round(discrepancy * 100)}% > tolérance ${tolerancePct * 100}%`,
  };
}

// ── Toutes les fonctions suivantes sont identiques à v2.0 ──────

export function calculateVanViability(
  basePrice: number,
  seatsSold: number,
  totalSeats: number,
  segment: RouteSegment,
  departureTime: Date,
  bookingTime: Date = new Date()
): VanViabilityResult {
  const economics = SEGMENT_ECONOMICS[segment];
  const safeSeatsSold = Math.min(Math.max(0, seatsSold), totalSeats);
  const fillRate  = safeSeatsSold / totalSeats;
  const avgPriceResult = calculateFullPrice(basePrice, Math.max(0, safeSeatsSold - 1), totalSeats, departureTime, bookingTime);
  const currentRevenue = avgPriceResult.priceError ? 0 : Math.round(avgPriceResult.currentPrice * safeSeatsSold);
  const driverGuarantee = economics.driverMinGuarantee;
  const isViable        = safeSeatsSold >= economics.breakEvenSeats;
  const driverNetRevenue = Math.round(currentRevenue * (1 - economics.commissionRate));
  const cabySubsidy = isViable ? 0 : Math.max(0, driverGuarantee - driverNetRevenue);

  let driverMessage = "";
  let statusColor: 'green' | 'orange' | 'red' = 'green';
  if (safeSeatsSold === 0) {
    driverMessage = `Aucune réservation — garantie CHF ${driverGuarantee} si le départ est confirmé`;
    statusColor = 'red';
  } else if (!isViable) {
    driverMessage = `${safeSeatsSold}/${totalSeats} sièges — Caby complète à CHF ${driverGuarantee} garanti`;
    statusColor = 'orange';
  } else if (fillRate >= 0.86) {
    driverMessage = `${safeSeatsSold}/${totalSeats} sièges — Van presque plein 🔥 CHF ${driverNetRevenue} estimé`;
    statusColor = 'green';
  } else {
    driverMessage = `${safeSeatsSold}/${totalSeats} sièges — CHF ${driverNetRevenue} estimé`;
    statusColor = 'green';
  }

  return { isViable, seatsSold: safeSeatsSold, breakEvenSeats: economics.breakEvenSeats, currentRevenue, driverGuarantee, cabySubsidy, driverNetRevenue, fillRate, driverMessage, statusColor };
}

export function calculateDriverEarnings(
  basePrice: number, seatsSold: number, totalSeats: number, segment: RouteSegment,
  departureTime: Date, isPunctual: boolean = true, bookingTime: Date = new Date()
): DriverEarnings {
  const economics    = SEGMENT_ECONOMICS[segment];
  const viability    = calculateVanViability(basePrice, seatsSold, totalSeats, segment, departureTime, bookingTime);
  const grossRevenue = viability.currentRevenue;
  const commission   = Math.round(grossRevenue * economics.commissionRate);
  const driverNet    = grossRevenue - commission;
  const bonus        = isPunctual ? economics.punctualityBonus : 0;
  const finalPayout  = Math.max(driverNet + bonus, economics.driverMinGuarantee + bonus);
  return { cabyCommissionRate: economics.commissionRate, grossRevenue, cabyCommission: commission, driverNet, minimumGuarantee: economics.driverMinGuarantee, finalDriverPayout: finalPayout, punctualityBonus: bonus };
}

export function calculateBreakEvenSeats(segment: RouteSegment): number {
  return SEGMENT_ECONOMICS[segment].breakEvenSeats;
}

export function calculateCabySubsidy(
  basePrice: number, seatsSold: number, totalSeats: number,
  segment: RouteSegment, departureTime: Date, bookingTime: Date = new Date()
): number {
  return calculateVanViability(basePrice, seatsSold, totalSeats, segment, departureTime, bookingTime).cabySubsidy;
}

export interface DepartureDecision {
  shouldDepart: boolean;
  reason: string;
  cabyAction: string;
  hoursUntilDeparture: number;
}

export function shouldVanDepart(
  seatsSold: number, totalSeats: number, segment: RouteSegment,
  departureTime: Date, now: Date = new Date()
): DepartureDecision {
  const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const economics = SEGMENT_ECONOMICS[segment];
  const safeSeatsSold = Math.min(Math.max(0, seatsSold), totalSeats);
  const isViable  = safeSeatsSold >= economics.breakEvenSeats;
  if (hoursUntilDeparture <= 2) {
    return { shouldDepart: true, reason: `Départ imminent — ${safeSeatsSold} passager(s) confirmé(s)`, cabyAction: safeSeatsSold === 0 ? `Annuler et payer CHF ${economics.driverMinGuarantee} au chauffeur` : `Payer garantie CHF ${economics.driverMinGuarantee} si < ${economics.breakEvenSeats} sièges`, hoursUntilDeparture };
  }
  if (isViable) {
    return { shouldDepart: true, reason: `${safeSeatsSold}/${totalSeats} sièges vendus — seuil atteint`, cabyAction: "Aucune action requise — trajet rentable", hoursUntilDeparture };
  }
  if (hoursUntilDeparture > 24) {
    return { shouldDepart: false, reason: `Seulement ${safeSeatsSold}/${economics.breakEvenSeats} sièges minimum atteints`, cabyAction: `Activer promo last-minute pour remplir le van`, hoursUntilDeparture };
  }
  return { shouldDepart: safeSeatsSold >= 1, reason: safeSeatsSold >= 1 ? `${safeSeatsSold} passager(s) — départ maintenu avec garantie chauffeur` : `Aucun passager — annulation recommandée`, cabyAction: safeSeatsSold >= 1 ? `Subvention à prévoir` : `Annuler et payer indemnité chauffeur CHF ${Math.round(economics.driverMinGuarantee * 0.5)}`, hoursUntilDeparture };
}

export function calculateAncillaryTotal(options: Partial<AncillaryOptions>): number {
  return Object.entries(options).reduce((total, [key, selected]) => {
    if (selected && key in ANCILLARY_PRICES) return total + ANCILLARY_PRICES[key as keyof typeof ANCILLARY_PRICES];
    return total;
  }, 0);
}

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
    { route: "Annecy → Genève",  flashPrice: 19, originalPrice: 35, seatsAvailable: 1, departureTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
  ];
}

export function calculateLastMinuteDiscount(
  departureTime: Date, seatsAvailable: number, totalSeats: number, now: Date = new Date()
): { discount: number; isLastMinute: boolean; urgencyLabel: string } {
  const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const safeSeatsAvailable  = Math.max(0, seatsAvailable);
  const fillRate = (totalSeats - safeSeatsAvailable) / totalSeats;
  if (fillRate > 0.7)           return { discount: 0, isLastMinute: false, urgencyLabel: "" };
  if (hoursUntilDeparture > 48) return { discount: 0, isLastMinute: false, urgencyLabel: "" };
  if (hoursUntilDeparture <= 0.5) return { discount: 0, isLastMinute: false, urgencyLabel: "" };
  let discount = 0;
  let urgencyLabel = "";
  if (hoursUntilDeparture <= 2)       { discount = 50; urgencyLabel = "🔴 Départ imminent"; }
  else if (hoursUntilDeparture <= 6)  { discount = 40; urgencyLabel = "🔴 Dernières heures"; }
  else if (hoursUntilDeparture <= 12) { discount = 30; urgencyLabel = "🟠 Ce soir"; }
  else if (hoursUntilDeparture <= 24) { discount = 20; urgencyLabel = "🟡 Demain"; }
  else                                { discount = 10; urgencyLabel = "🟢 Cette semaine"; }
  if (safeSeatsAvailable >= totalSeats * 0.8) discount = Math.min(discount + 10, 60);
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
  id: string; from: string; to: string; departureTime: Date;
  basePrice: number; seatsAvailable: number; totalSeats: number; flag: string;
}

export function generateSimulatedDeals(now: Date = new Date()): LastMinuteDeal[] {
  const h = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000);
  return [
    { id: 'lm-1', from: 'Annecy',   to: 'Genève',  departureTime: h(2),  basePrice: 25, seatsAvailable: 5, totalSeats: 7, flag: '🇫🇷' },
    { id: 'lm-2', from: 'Genève',   to: 'Lausanne', departureTime: h(8),  basePrice: 29, seatsAvailable: 4, totalSeats: 7, flag: '🇨🇭' },
    { id: 'lm-3', from: 'Chamonix', to: 'Genève',   departureTime: h(20), basePrice: 35, seatsAvailable: 6, totalSeats: 7, flag: '🇫🇷' },
    { id: 'lm-4', from: 'Genève',   to: 'Zurich',   departureTime: h(36), basePrice: 77, seatsAvailable: 5, totalSeats: 7, flag: '🇨🇭' },
  ];
}

export function convertToEur(chfPrice: number, rate: number = 0.97): number {
  return Math.round(chfPrice * rate);
}
