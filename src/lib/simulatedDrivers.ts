import { SimulatedDriver } from '@/types';

const driverNames = [
  'Mohamed B.',
  'Karim L.',
  'Jean-Pierre D.',
  'Amadou S.',
  'Youssef M.',
  'Pierre C.',
  'Ibrahim K.',
  'Olivier R.',
];

const vehicleModels = [
  { make: 'Toyota', model: 'Camry', colors: ['noire', 'blanche', 'grise'] },
  { make: 'Peugeot', model: '508', colors: ['noire', 'bleue', 'grise'] },
  { make: 'Mercedes', model: 'Classe E', colors: ['noire', 'argentée'] },
  { make: 'Volkswagen', model: 'Passat', colors: ['noire', 'blanche', 'grise'] },
  { make: 'BMW', model: 'Série 5', colors: ['noire', 'blanche', 'bleue'] },
];

const generatePlate = (): string => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numbers = '0123456789';
  const randomLetters = (n: number) =>
    Array.from({ length: n }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const randomNumbers = (n: number) =>
    Array.from({ length: n }, () => numbers[Math.floor(Math.random() * numbers.length)]).join('');
  
  return `${randomLetters(2)}-${randomNumbers(3)}-${randomLetters(2)}`;
};

export const generateSimulatedDriver = (centerLat: number, centerLng: number): SimulatedDriver => {
  const name = driverNames[Math.floor(Math.random() * driverNames.length)];
  const vehicleInfo = vehicleModels[Math.floor(Math.random() * vehicleModels.length)];
  const color = vehicleInfo.colors[Math.floor(Math.random() * vehicleInfo.colors.length)];
  
  // Generate position within ~500m of center
  const latOffset = (Math.random() - 0.5) * 0.01;
  const lngOffset = (Math.random() - 0.5) * 0.01;

  return {
    id: `driver-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    rating: Math.round((4.5 + Math.random() * 0.5) * 10) / 10,
    vehicle: {
      make: vehicleInfo.make,
      model: vehicleInfo.model,
      color,
      plate: generatePlate(),
    },
    position: {
      lat: centerLat + latOffset,
      lng: centerLng + lngOffset,
    },
    eta: Math.floor(Math.random() * 5) + 2,
  };
};

export const generateNearbyDrivers = (
  centerLat: number,
  centerLng: number,
  count: number = 5
): SimulatedDriver[] => {
  return Array.from({ length: count }, () =>
    generateSimulatedDriver(centerLat, centerLng)
  );
};
