import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Award, Phone, Check, X } from 'lucide-react';
import { useRide } from '@/contexts/RideContext';
import { generateSimulatedDriver } from '@/lib/simulatedDrivers';
import { getVehicleOption } from '@/lib/vehicleOptions';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { GoogleMap, OverlayView } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAffiliations } from '@/hooks/useAffiliations';

type SearchPhase = 'searching' | 'found';

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  gestureHandling: 'none',
};

const searchMessages = [
  'Recherche d\'un chauffeur à proximité...',
  'Connexion avec les chauffeurs disponibles...',
  'Un chauffeur arrive bientôt...',
  'Analyse des itinéraires optimaux...',
];

// ─── Pulsing radar overlay ───
const RadarPulse: React.FC<{ position: google.maps.LatLngLiteral }> = ({ position }) => (
  <OverlayView position={position} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
    <div className="relative flex items-center justify-center" style={{ transform: 'translate(-50%, -50%)' }}>
      {/* Expanding rings */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${80 + i * 50}px`,
            height: `${80 + i * 50}px`,
            border: '2px solid hsl(43, 65%, 58%)',
            opacity: 0,
            animation: `radarExpand 2.4s ease-out ${i * 0.6}s infinite`,
          }}
        />
      ))}
      {/* Center dot */}
      <div className="relative w-5 h-5 rounded-full border-[3px] border-white shadow-lg" style={{ backgroundColor: '#007AFF' }} />
    </div>
  </OverlayView>
);

// ─── Floating car markers ───
const FloatingCars: React.FC<{ center: google.maps.LatLngLiteral; visible: boolean }> = ({ center, visible }) => {
  const [cars, setCars] = useState<{ lat: number; lng: number; id: number }[]>([]);

  useEffect(() => {
    if (!visible) return;
    const generateCars = () => {
      const newCars = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        lat: center.lat + (Math.random() - 0.5) * 0.012,
        lng: center.lng + (Math.random() - 0.5) * 0.012,
      }));
      setCars(newCars);
    };
    generateCars();
    const interval = setInterval(generateCars, 3000);
    return () => clearInterval(interval);
  }, [center, visible]);

  if (!visible) return null;

  return (
    <>
      {cars.map((car) => (
        <OverlayView key={car.id} position={{ lat: car.lat, lng: car.lng }} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 0.5] }}
            transition={{ duration: 3, ease: 'easeInOut' }}
            className="text-xl"
            style={{ transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)` }}
          >
            🚗
          </motion.div>
        </OverlayView>
      ))}
    </>
  );
};

const SearchingDriver: React.FC = () => {
  const navigate = useNavigate();
  const { pickup, dropoff, selectedVehicle, estimatedPrice, estimatedDuration, estimatedDistance, setCurrentDriver } = useRide();
  const { isLoaded } = useGoogleMaps();
  const { clientAffiliations } = useAffiliations();

  const [phase, setPhase] = useState<SearchPhase>('searching');
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [foundDriver, setFoundDriver] = useState<ReturnType<typeof generateSimulatedDriver> | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [priorityLabel, setPriorityLabel] = useState<string | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);
  const hasFavorite = clientAffiliations.length > 0;
  const favDriverName = clientAffiliations[0]?.driver_name;

  const vehicleOption = getVehicleOption(selectedVehicle);
  const pickupPos = pickup ? { lat: pickup.lat, lng: pickup.lng } : { lat: 46.2044, lng: 6.1432 };

  // ─── Search simulation ───
  useEffect(() => {
    // Rotate messages
    const msgTimer = setInterval(() => {
      setMessageIndex((p) => (p + 1) % searchMessages.length);
    }, 3000);

    // Progress bar
    const searchDuration = hasFavorite ? 12000 : 8000;
    const progressTimer = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 95));
    }, searchDuration / 50);

    // Priority labels for favorite flow
    if (hasFavorite) {
      setPriorityLabel(`Recherche prioritaire — ${favDriverName}`);
      const clubTimeout = setTimeout(() => setPriorityLabel(`Club de ${favDriverName} — Commission 10%`), 5000);
      const generalTimeout = setTimeout(() => setPriorityLabel(null), 9000);

      const findTimer = setTimeout(() => {
        if (pickup) {
          const driver = generateSimulatedDriver(pickup.lat, pickup.lng);
          setFoundDriver(driver);
          setProgress(100);
          setPhase('found');
        }
      }, searchDuration);

      return () => {
        clearInterval(msgTimer);
        clearInterval(progressTimer);
        clearTimeout(clubTimeout);
        clearTimeout(generalTimeout);
        clearTimeout(findTimer);
      };
    }

    // Standard search
    const findTimer = setTimeout(() => {
      if (pickup) {
        const driver = generateSimulatedDriver(pickup.lat, pickup.lng);
        setFoundDriver(driver);
        setProgress(100);
        setPhase('found');
      }
    }, searchDuration);

    return () => {
      clearInterval(msgTimer);
      clearInterval(progressTimer);
      clearTimeout(findTimer);
    };
  }, [pickup, hasFavorite, favDriverName]);

  const handleConfirm = () => {
    if (foundDriver) {
      setCurrentDriver(foundDriver);
      navigate('/caby/trip');
    }
  };

  const handleCancel = () => {
    navigate('/caby');
  };

  const isSuperDriver = foundDriver && foundDriver.rating >= 4.8;

  return (
    <div className="fixed inset-0 bg-background">
      {/* Google Maps background */}
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={pickupPos}
          zoom={15}
          options={MAP_OPTIONS}
          onLoad={(map) => { mapRef.current = map; }}
        >
          {phase === 'searching' && (
            <>
              <RadarPulse position={pickupPos} />
              <FloatingCars center={pickupPos} visible={phase === 'searching'} />
            </>
          )}

          {phase === 'found' && (
            <OverlayView position={pickupPos} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
              <div className="relative flex items-center justify-center" style={{ transform: 'translate(-50%, -50%)' }}>
                <div className="w-5 h-5 rounded-full border-[3px] border-white shadow-lg" style={{ backgroundColor: '#007AFF' }} />
              </div>
            </OverlayView>
          )}
        </GoogleMap>
      )}

      {/* Fallback if maps not loaded */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
          <div className="relative">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${80 + i * 50}px`,
                  height: `${80 + i * 50}px`,
                  border: '2px solid hsl(43, 65%, 58%)',
                  opacity: 0,
                  animation: `radarExpand 2.4s ease-out ${i * 0.6}s infinite`,
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">{vehicleOption.icon}</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Phase: Searching ─── */}
      <AnimatePresence mode="wait">
        {phase === 'searching' && (
          <motion.div
            key="searching"
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-20"
          >
            <div className="bg-card border-t border-border rounded-t-3xl" style={{ boxShadow: '0 -8px 30px rgba(0,0,0,0.3)' }}>
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
              </div>

              <div className="px-5 pb-6">
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-secondary rounded-full mb-5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: 'hsl(43, 65%, 58%)' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Message */}
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={messageIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="text-lg font-bold text-center mb-1"
                  >
                    {searchMessages[messageIndex]}
                  </motion.h2>
                </AnimatePresence>

                {/* Priority badge */}
                {priorityLabel && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 mt-2"
                  >
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[hsl(43,65%,58%)]/15 text-[hsl(43,65%,58%)]">
                      ⭐ {priorityLabel}
                    </span>
                  </motion.div>
                )}

                {/* Vehicle + price */}
                <div className="flex items-center justify-center gap-4 mt-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{vehicleOption.icon}</span>
                    <span className="text-sm">{vehicleOption.name}</span>
                  </div>
                  <span>•</span>
                  <span className="font-bold text-foreground">{estimatedPrice?.toFixed(2)} CHF</span>
                </div>

                <button onClick={() => setShowCancel(true)} className="w-full mt-5 text-center text-xs text-muted-foreground hover:text-destructive transition-colors">
                  Annuler la recherche
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Phase: Driver Found ─── */}
        {phase === 'found' && foundDriver && (
          <motion.div
            key="found"
            initial={{ y: 400, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 22, stiffness: 250 }}
            className="absolute bottom-0 left-0 right-0 z-20"
          >
            <div className="bg-card border-t border-border rounded-t-3xl" style={{ boxShadow: '0 -8px 30px rgba(0,0,0,0.3)' }}>
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
              </div>

              <div className="px-5 pb-6">
                {/* Success animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: 'hsl(142, 71%, 50%)' }}
                >
                  <Check className="w-7 h-7 text-white" />
                </motion.div>

                <h2 className="text-lg font-bold text-center mb-4">Chauffeur trouvé !</h2>

                {/* Driver card */}
                <div className="bg-background/50 rounded-2xl border border-border p-4 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <Avatar className="w-16 h-16 border-2 border-border">
                        <AvatarImage src={foundDriver.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                          {foundDriver.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      {isSuperDriver && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'hsl(43, 65%, 58%)' }}>
                          <Award className="w-3 h-3 text-black" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base">{foundDriver.name}</h3>
                        {isSuperDriver && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'hsla(43, 65%, 58%, 0.15)', color: 'hsl(43, 65%, 58%)' }}>
                            SuperDriver
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Star className="w-3.5 h-3.5" style={{ fill: 'hsl(43, 65%, 58%)', color: 'hsl(43, 65%, 58%)' }} />
                        <span className="text-xs font-semibold">{foundDriver.rating}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-black">{foundDriver.eta}</p>
                      <p className="text-[10px] text-muted-foreground -mt-0.5">min</p>
                    </div>
                  </div>

                  {/* Vehicle info */}
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {foundDriver.vehicle.color} {foundDriver.vehicle.make} {foundDriver.vehicle.model}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">{foundDriver.vehicle.plate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Distance</p>
                      <p className="text-sm font-semibold">
                        {(Math.sqrt(
                          Math.pow((foundDriver.position.lat - pickupPos.lat) * 111, 2) +
                          Math.pow((foundDriver.position.lng - pickupPos.lng) * 85, 2)
                        )).toFixed(1)} km
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price + trip info */}
                <div className="bg-background/50 rounded-2xl border border-border p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Course</span>
                    <span className="font-bold">{estimatedPrice?.toFixed(2)} CHF</span>
                  </div>
                  {estimatedDistance && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Trajet</span>
                      <span>{estimatedDistance} km · {estimatedDuration} min</span>
                    </div>
                  )}
                </div>

                {/* Confirm button */}
                <Button
                  onClick={handleConfirm}
                  className="w-full h-13 rounded-2xl text-base font-bold"
                  style={{ background: 'linear-gradient(135deg, hsl(43, 65%, 58%), hsl(43, 75%, 48%))' }}
                >
                  Confirmer la course
                </Button>

                <button
                  onClick={handleCancel}
                  className="w-full mt-3 text-center text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel confirmation */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50">
          <motion.div
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            className="w-full bg-card rounded-t-3xl p-6"
          >
            <h3 className="text-xl font-bold mb-2">Annuler la recherche ?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Aucun frais ne sera facturé.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowCancel(false)}>
                Continuer
              </Button>
              <Button variant="destructive" className="flex-1 rounded-xl" onClick={handleCancel}>
                Annuler
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* CSS for radar animation */}
      <style>{`
        @keyframes radarExpand {
          0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SearchingDriver;
