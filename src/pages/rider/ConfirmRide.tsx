import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, ChevronRight, Tag } from 'lucide-react';
import { useRide } from '@/contexts/RideContext';
import { vehicleOptions, calculatePrice, getVehicleOption } from '@/lib/vehicleOptions';
import { Button } from '@/components/ui/button';
import { VehicleType } from '@/types';

const ConfirmRide: React.FC = () => {
  const navigate = useNavigate();
  const {
    pickup,
    dropoff,
    selectedVehicle,
    setSelectedVehicle,
    setEstimatedPrice,
    setEstimatedDistance,
    setEstimatedDuration,
  } = useRide();

  // Simulated distance and duration
  const tripDetails = useMemo(() => {
    // Simulated: ~8km, ~15 min
    const distance = 5 + Math.random() * 10;
    const duration = 10 + Math.random() * 20;
    return { distance: Math.round(distance * 10) / 10, duration: Math.round(duration) };
  }, [pickup, dropoff]);

  const prices = useMemo(() => {
    return vehicleOptions.reduce((acc, option) => {
      acc[option.type] = calculatePrice(tripDetails.distance, tripDetails.duration, option);
      return acc;
    }, {} as Record<VehicleType, number>);
  }, [tripDetails]);

  const handleConfirm = () => {
    const option = getVehicleOption(selectedVehicle);
    const price = prices[selectedVehicle];
    setEstimatedPrice(price);
    setEstimatedDistance(tripDetails.distance);
    setEstimatedDuration(tripDetails.duration);
    navigate('/rider/searching');
  };

  if (!pickup || !dropoff) {
    navigate('/rider/search');
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Map preview (top 40%) */}
      <div className="h-[40vh] bg-gradient-to-br from-secondary to-muted relative">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-background rounded-full shadow-lg flex items-center justify-center safe-area-top"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Simulated route */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-3/4 h-1/2">
            {/* Pickup marker */}
            <div className="absolute top-0 left-0">
              <div className="w-4 h-4 bg-success rounded-full border-2 border-white shadow-lg" />
            </div>
            {/* Route line */}
            <svg className="absolute inset-0 w-full h-full">
              <path
                d="M 10 10 Q 100 50, 200 80 T 350 120"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeDasharray="8 4"
              />
            </svg>
            {/* Dropoff marker */}
            <div className="absolute bottom-0 right-0">
              <div className="w-4 h-4 bg-destructive rounded-full border-2 border-white shadow-lg" />
            </div>
          </div>
        </div>

        {/* Trip summary overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Départ</p>
              <p className="font-medium truncate">{pickup.address.split(',')[0]}</p>
            </div>
            <ChevronRight className="w-5 h-5 mx-2 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0 text-right">
              <p className="text-sm text-muted-foreground">Destination</p>
              <p className="font-medium truncate">{dropoff.address.split(',')[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>{tripDetails.distance} km</span>
            <span>•</span>
            <span>{tripDetails.duration} min</span>
          </div>
        </div>
      </div>

      {/* Vehicle selection */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Choisissez un véhicule</h2>

          {/* Vehicle options */}
          <div className="space-y-3">
            {vehicleOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => setSelectedVehicle(option.type)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  selectedVehicle === option.type
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className="text-3xl">{option.icon}</div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{option.name}</span>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      {option.eta} min
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">{prices[option.type].toFixed(2)}€</span>
                </div>
              </button>
            ))}
          </div>

          {/* Payment method */}
          <button className="w-full flex items-center gap-3 p-4 mt-4 border border-border rounded-xl hover:bg-secondary/50 transition-colors">
            <CreditCard className="w-5 h-5" />
            <div className="flex-1 text-left">
              <p className="font-medium">Paiement</p>
              <p className="text-sm text-muted-foreground">•••• 4242</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Promo code */}
          <button className="w-full flex items-center gap-3 p-4 mt-2 border border-border rounded-xl hover:bg-secondary/50 transition-colors">
            <Tag className="w-5 h-5" />
            <span className="flex-1 text-left font-medium">Ajouter un code promo</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Confirm button */}
      <div className="p-4 border-t border-border safe-area-bottom">
        <Button onClick={handleConfirm} className="w-full h-14 text-lg font-semibold">
          Commander {getVehicleOption(selectedVehicle).name} — {prices[selectedVehicle].toFixed(2)}€
        </Button>
      </div>
    </div>
  );
};

export default ConfirmRide;
