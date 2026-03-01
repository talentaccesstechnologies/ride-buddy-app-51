import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart } from 'lucide-react';
import { useRide } from '@/contexts/RideContext';
import { generateSimulatedDriver } from '@/lib/simulatedDrivers';
import { getVehicleOption } from '@/lib/vehicleOptions';
import { Button } from '@/components/ui/button';
import { useAffiliations } from '@/hooks/useAffiliations';

const searchingMessages = [
  'Recherche en cours...',
  'Connexion avec les chauffeurs à proximité...',
  'Un chauffeur arrive bientôt...',
  'Presque trouvé...',
];

const SearchingDriver: React.FC = () => {
  const navigate = useNavigate();
  const { pickup, selectedVehicle, estimatedPrice, setCurrentDriver } = useRide();
  const [messageIndex, setMessageIndex] = useState(0);
  const [showCancel, setShowCancel] = useState(false);
  const [searchPhase, setSearchPhase] = useState<'priority' | 'club' | 'general'>('priority');
  const { clientAffiliations } = useAffiliations();
  const hasFavorite = clientAffiliations.length > 0;
  const favDriverName = clientAffiliations[0]?.driver_name;

  useEffect(() => {
    // Rotate messages
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % searchingMessages.length);
    }, 3000);

    // Priority dispatch cascade
    if (hasFavorite) {
      // Phase 1: Priority search (0-6s simulated as 30s)
      const clubTimer = setTimeout(() => setSearchPhase('club'), 6000);
      // Phase 2: Club dispatch (6-12s simulated as 60s)
      const generalTimer = setTimeout(() => setSearchPhase('general'), 12000);
      // Phase 3: General pool finds driver
      const driverTimer = setTimeout(() => {
        if (pickup) {
          const driver = generateSimulatedDriver(pickup.lat, pickup.lng);
          setCurrentDriver(driver);
          navigate('/rider/trip');
        }
      }, 15000);

      return () => {
        clearInterval(messageTimer);
        clearTimeout(clubTimer);
        clearTimeout(generalTimer);
        clearTimeout(driverTimer);
      };
    }

    // No favorite: standard search
    const driverTimer = setTimeout(() => {
      if (pickup) {
        const driver = generateSimulatedDriver(pickup.lat, pickup.lng);
        setCurrentDriver(driver);
        navigate('/rider/trip');
      }
    }, 5000 + Math.random() * 3000);

    return () => {
      clearInterval(messageTimer);
      clearTimeout(driverTimer);
    };
  }, [pickup, setCurrentDriver, navigate]);

  const handleCancel = () => {
    setShowCancel(true);
  };

  const confirmCancel = () => {
    navigate('/rider');
  };

  const vehicleOption = getVehicleOption(selectedVehicle);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Map with searching animation */}
      <div className="flex-1 relative bg-gradient-to-br from-secondary to-muted">
        {/* Radar animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Pulse rings */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute inset-0 border-2 border-accent/50 rounded-full radar-pulse"
                style={{ animationDelay: `${i * 0.6}s` }}
              />
            ))}
            {/* Center dot */}
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg">
              <div className="text-2xl">{vehicleOption.icon}</div>
            </div>
          </div>
        </div>

        {/* Simulated moving cars */}
        <div className="absolute inset-0 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="absolute text-xl animate-pulse"
              style={{
                left: `${20 + (i * 15) % 60}%`,
                top: `${15 + (i * 18) % 50}%`,
                transform: `rotate(${45 + i * 30}deg)`,
                animationDelay: `${i * 0.3}s`,
              }}
            >
              🚗
            </div>
          ))}
        </div>
      </div>

      {/* Bottom panel */}
      <div className="bg-background rounded-t-3xl shadow-sheet -mt-6 relative z-10">
        <div className="p-6 text-center">
          {/* Loading indicator */}
          <div className="w-full h-1 bg-secondary rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
          </div>

          <h2 className="text-xl font-semibold mb-2">
            {hasFavorite && searchPhase === 'priority'
              ? `Votre chauffeur préféré ${favDriverName} est recherché en priorité...`
              : hasFavorite && searchPhase === 'club'
                ? `Recherche dans le club de ${favDriverName}...`
                : searchingMessages[messageIndex]
            }
          </h2>

          {hasFavorite && searchPhase !== 'general' && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-[hsl(var(--caby-gold))] fill-[hsl(var(--caby-gold))]" />
              <span className="text-xs text-muted-foreground">
                {searchPhase === 'priority' ? 'Recherche prioritaire' : 'Club privé • Commission 10%'}
              </span>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mt-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{vehicleOption.icon}</span>
              <span>{vehicleOption.name}</span>
            </div>
            <span>•</span>
            <span className="font-semibold text-foreground">
              {estimatedPrice?.toFixed(2)}€
            </span>
          </div>

          <Button
            variant="ghost"
            onClick={handleCancel}
            className="mt-6 text-muted-foreground"
          >
            Annuler
          </Button>
        </div>
      </div>

      {/* Cancel confirmation modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-background rounded-t-3xl p-6 safe-area-bottom animate-slide-up">
            <h3 className="text-xl font-semibold mb-2">Annuler la course ?</h3>
            <p className="text-muted-foreground mb-6">
              Êtes-vous sûr de vouloir annuler cette course ?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCancel(false)}
              >
                Non, continuer
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={confirmCancel}
              >
                Oui, annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchingDriver;
