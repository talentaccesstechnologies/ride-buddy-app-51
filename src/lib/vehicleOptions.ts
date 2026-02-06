import { VehicleOption } from '@/types';

export const vehicleOptions: VehicleOption[] = [
  {
    type: 'standard',
    name: 'Standard',
    description: 'Économique, pour 1-4 personnes',
    icon: '🚗',
    multiplier: 1,
    capacity: 4,
    eta: 3,
  },
  {
    type: 'premium',
    name: 'Confort',
    description: 'Voitures récentes et spacieuses',
    icon: '🚘',
    multiplier: 1.5,
    capacity: 4,
    eta: 5,
  },
  {
    type: 'xl',
    name: 'XL',
    description: 'Pour les groupes jusqu\'à 6',
    icon: '🚐',
    multiplier: 1.8,
    capacity: 6,
    eta: 7,
  },
  {
    type: 'moto',
    name: 'Moto',
    description: 'Rapide, pour 1 personne',
    icon: '🏍️',
    multiplier: 0.7,
    capacity: 1,
    eta: 2,
  },
];

// Pricing calculation
export const calculatePrice = (
  distanceKm: number,
  durationMin: number,
  vehicleType: VehicleOption,
  surgeMultiplier: number = 1
): number => {
  const basePrice = 2;
  const pricePerKm = 1.2;
  const pricePerMin = 0.3;

  const rawPrice =
    (basePrice + pricePerKm * distanceKm + pricePerMin * durationMin) *
    vehicleType.multiplier *
    surgeMultiplier;

  return Math.round(rawPrice * 100) / 100;
};

export const getVehicleOption = (type: string): VehicleOption => {
  return vehicleOptions.find((v) => v.type === type) || vehicleOptions[0];
};
