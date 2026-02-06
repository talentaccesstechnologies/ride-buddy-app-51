import React, { createContext, useContext, useState } from 'react';
import { Location, VehicleType, SimulatedDriver } from '@/types';

interface RideContextType {
  pickup: Location | null;
  dropoff: Location | null;
  selectedVehicle: VehicleType;
  estimatedPrice: number | null;
  estimatedDuration: number | null;
  estimatedDistance: number | null;
  currentDriver: SimulatedDriver | null;
  setPickup: (location: Location | null) => void;
  setDropoff: (location: Location | null) => void;
  setSelectedVehicle: (type: VehicleType) => void;
  setEstimatedPrice: (price: number | null) => void;
  setEstimatedDuration: (duration: number | null) => void;
  setEstimatedDistance: (distance: number | null) => void;
  setCurrentDriver: (driver: SimulatedDriver | null) => void;
  resetRide: () => void;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export const useRide = () => {
  const context = useContext(RideContext);
  if (!context) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
};

export const RideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('standard');
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);
  const [estimatedDistance, setEstimatedDistance] = useState<number | null>(null);
  const [currentDriver, setCurrentDriver] = useState<SimulatedDriver | null>(null);

  const resetRide = () => {
    setPickup(null);
    setDropoff(null);
    setSelectedVehicle('standard');
    setEstimatedPrice(null);
    setEstimatedDuration(null);
    setEstimatedDistance(null);
    setCurrentDriver(null);
  };

  return (
    <RideContext.Provider
      value={{
        pickup,
        dropoff,
        selectedVehicle,
        estimatedPrice,
        estimatedDuration,
        estimatedDistance,
        currentDriver,
        setPickup,
        setDropoff,
        setSelectedVehicle,
        setEstimatedPrice,
        setEstimatedDuration,
        setEstimatedDistance,
        setCurrentDriver,
        resetRide,
      }}
    >
      {children}
    </RideContext.Provider>
  );
};
