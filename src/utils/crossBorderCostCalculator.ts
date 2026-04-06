// ============================================
// CROSS-BORDER COST CALCULATOR — FRAIS RÉELS
// Marge sécurité 20% transparente et justifiée
// ============================================

export interface TripCostBreakdown {
  distanceKm: number;
  fuelCost: number;
  tollCost: number;
  vehicleDepreciation: number;
  insuranceProrata: number;
  maintenanceBuffer: number;
  safetyMargin: number;
  totalRealCost: number;
  costPerPassenger: number;
  platformFee: number;
  suggestedPricePerSeat: number;
  maxLegalPrice: number;
}

export type CostVehicleType = 'berline' | 'suv' | 'monospace' | 'van';

const CONSUMPTION: Record<CostVehicleType, number> = {
  berline: 7.0,
  suv: 8.5,
  monospace: 9.0,
  van: 10.5,
};

const FUEL_PRICE_CHF = 1.92;
const TOLL_PER_KM = 0.05;
const DEPRECIATION_PER_KM = 0.18;
const INSURANCE_PER_KM = 0.06;
const MAINTENANCE_PER_KM = 0.04;
const SAFETY_MARGIN_RATE = 0.20;
const PLATFORM_FEE_RATE = 0.15;
const MAX_LEGAL_MULTIPLIER = 1.30;

export function calculateTripCosts(
  distanceKm: number,
  vehicleType: CostVehicleType,
  seats: number,
  hasTolls: boolean = true
): TripCostBreakdown {
  const consumption = CONSUMPTION[vehicleType];

  const fuelCost = (distanceKm / 100) * consumption * FUEL_PRICE_CHF;
  const tollCost = hasTolls ? distanceKm * TOLL_PER_KM : 0;
  const vehicleDepreciation = distanceKm * DEPRECIATION_PER_KM;
  const insuranceProrata = distanceKm * INSURANCE_PER_KM;
  const maintenanceBuffer = distanceKm * MAINTENANCE_PER_KM;

  const directCosts = fuelCost + tollCost + vehicleDepreciation + insuranceProrata + maintenanceBuffer;
  const safetyMargin = directCosts * SAFETY_MARGIN_RATE;
  const totalRealCost = directCosts + safetyMargin;
  const costPerPassenger = totalRealCost / seats;
  const platformFee = costPerPassenger * PLATFORM_FEE_RATE;
  const suggestedPricePerSeat = Math.round(costPerPassenger + platformFee);
  const maxLegalPrice = Math.round(suggestedPricePerSeat * MAX_LEGAL_MULTIPLIER);

  return {
    distanceKm,
    fuelCost: Math.round(fuelCost),
    tollCost: Math.round(tollCost),
    vehicleDepreciation: Math.round(vehicleDepreciation),
    insuranceProrata: Math.round(insuranceProrata),
    maintenanceBuffer: Math.round(maintenanceBuffer),
    safetyMargin: Math.round(safetyMargin),
    totalRealCost: Math.round(totalRealCost),
    costPerPassenger: Math.round(costPerPassenger),
    platformFee: Math.round(platformFee),
    suggestedPricePerSeat,
    maxLegalPrice,
  };
}
