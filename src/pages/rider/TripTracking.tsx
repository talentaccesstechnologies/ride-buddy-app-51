import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, X, Star, Shield, ChevronUp, ChevronDown, Award, Download } from 'lucide-react';
import { useRide } from '@/contexts/RideContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  GoogleMap,
  TrafficLayer,
  Marker,
  Polyline,
  OverlayView,
} from '@react-google-maps/api';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type TripPhase = 'driver_arriving' | 'driver_arrived' | 'in_progress' | 'completed';

// ─── Map styles (standard light for readability) ───
const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  gestureHandling: 'greedy',
};

function getCarIcon(heading: number, zoom: number): google.maps.Symbol {
  const size = zoom >= 18 ? 1.6 : zoom >= 15 ? 1.3 : zoom >= 12 ? 1 : 0.8;
  return {
    path: 'M -8,-16 C -8,-18 -6,-20 -4,-20 L 4,-20 C 6,-20 8,-18 8,-16 L 10,-4 L 10,8 C 10,10 8,16 6,18 L 6,20 C 6,21 5,22 4,22 L 2,22 C 1,22 0,21 0,20 L 0,18 L 0,18 L 0,20 C 0,21 -1,22 -2,22 L -4,22 C -5,22 -6,21 -6,20 L -6,18 C -8,16 -10,10 -10,8 L -10,-4 Z',
    fillColor: '#C9A84C',
    fillOpacity: 1,
    strokeColor: '#8B7536',
    strokeWeight: 1,
    scale: size,
    rotation: heading,
    anchor: new google.maps.Point(0, 0),
  };
}

// ─── Pulsing blue dot for rider ───
const PulsingClientDot: React.FC<{ position: google.maps.LatLngLiteral }> = ({ position }) => (
  <OverlayView position={position} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
    <div className="relative flex items-center justify-center" style={{ transform: 'translate(-50%, -50%)' }}>
      <div className="absolute w-14 h-14 rounded-full animate-ping" style={{ backgroundColor: 'rgba(0,122,255,0.25)' }} />
      <div className="absolute w-8 h-8 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(0,122,255,0.15)' }} />
      <div className="relative w-4 h-4 rounded-full border-[2.5px] border-white shadow-lg" style={{ backgroundColor: '#007AFF' }} />
    </div>
  </OverlayView>
);

// ─── Interpolate between two points ───
function interpolate(from: google.maps.LatLngLiteral, to: google.maps.LatLngLiteral, t: number): google.maps.LatLngLiteral {
  return {
    lat: from.lat + (to.lat - from.lat) * t,
    lng: from.lng + (to.lng - from.lng) * t,
  };
}

function headingBetween(a: google.maps.LatLngLiteral, b: google.maps.LatLngLiteral): number {
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// Generate a curved route between two points with intermediate waypoints
function generateRoute(from: google.maps.LatLngLiteral, to: google.maps.LatLngLiteral): google.maps.LatLngLiteral[] {
  const steps = 40;
  const points: google.maps.LatLngLiteral[] = [];
  // Add slight curve via offset
  const midLat = (from.lat + to.lat) / 2 + (Math.random() - 0.5) * 0.003;
  const midLng = (from.lng + to.lng) / 2 + (Math.random() - 0.5) * 0.003;
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Quadratic bezier
    const lat = (1 - t) * (1 - t) * from.lat + 2 * (1 - t) * t * midLat + t * t * to.lat;
    const lng = (1 - t) * (1 - t) * from.lng + 2 * (1 - t) * t * midLng + t * t * to.lng;
    points.push({ lat, lng });
  }
  return points;
}

const TripTracking: React.FC = () => {
  const navigate = useNavigate();
  const { currentDriver, pickup, dropoff, estimatedPrice, estimatedDuration, estimatedDistance, resetRide } = useRide();
  const { isLoaded } = useGoogleMaps();

  const [phase, setPhase] = useState<TripPhase>('driver_arriving');
  const [eta, setEta] = useState(currentDriver?.eta || 4);
  const [driverPos, setDriverPos] = useState<google.maps.LatLngLiteral | null>(null);
  const [driverHeading, setDriverHeading] = useState(0);
  const [routePoints, setRoutePoints] = useState<google.maps.LatLngLiteral[]>([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [zoom, setZoom] = useState(15);

  const mapRef = useRef<google.maps.Map | null>(null);
  const animFrameRef = useRef<number>(0);
  const routeIndexRef = useRef(0);

  const isSuperDriver = currentDriver && currentDriver.rating >= 4.8;

  // Redirect if no driver
  useEffect(() => {
    if (!currentDriver) {
      navigate('/caby');
    }
  }, [currentDriver, navigate]);

  // Initialize route and animation
  useEffect(() => {
    if (!currentDriver || !pickup || !isLoaded) return;

    const driverStart = currentDriver.position;
    const pickupPos = { lat: pickup.lat, lng: pickup.lng };

    // Phase 1: driver → pickup
    const route = generateRoute(driverStart, pickupPos);
    setRoutePoints(route);
    setDriverPos(driverStart);
    routeIndexRef.current = 0;

    // Animate driver along route
    const totalDurationMs = (currentDriver.eta || 4) * 1000; // Speed up for demo
    const stepDuration = totalDurationMs / route.length;
    let lastTime = performance.now();
    let progress = 0;

    const animate = (time: number) => {
      const delta = time - lastTime;
      if (delta >= stepDuration && routeIndexRef.current < route.length - 1) {
        lastTime = time;
        routeIndexRef.current++;
        const idx = routeIndexRef.current;
        const pos = route[idx];
        const prevPos = route[idx - 1];
        setDriverPos(pos);
        setDriverHeading(headingBetween(prevPos, pos));
        setRoutePoints(route.slice(idx));

        // Update ETA
        const remaining = route.length - idx;
        const etaMin = Math.ceil((remaining / route.length) * (currentDriver.eta || 4));
        setEta(Math.max(1, etaMin));

        if (idx >= route.length - 1) {
          // Driver arrived at pickup
          setPhase('driver_arrived');
          setEta(0);

          // After 3s, start trip
          setTimeout(() => {
            if (dropoff) {
              const tripRoute = generateRoute(pickupPos, { lat: dropoff.lat, lng: dropoff.lng });
              setRoutePoints(tripRoute);
              routeIndexRef.current = 0;
              setPhase('in_progress');
              animateTripPhase(tripRoute);
            }
          }, 3000);
          return;
        }
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [currentDriver, pickup, dropoff, isLoaded]);

  const animateTripPhase = useCallback((route: google.maps.LatLngLiteral[]) => {
    const totalMs = 10000; // 10 seconds for trip
    const stepDuration = totalMs / route.length;
    let lastTime = performance.now();
    let idx = 0;

    const animate = (time: number) => {
      const delta = time - lastTime;
      if (delta >= stepDuration && idx < route.length - 1) {
        lastTime = time;
        idx++;
        const pos = route[idx];
        const prevPos = route[idx - 1];
        setDriverPos(pos);
        setDriverHeading(headingBetween(prevPos, pos));
        setRoutePoints(route.slice(idx));

        if (idx >= route.length - 1) {
          setPhase('completed');
          return;
        }
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Fit bounds
  useEffect(() => {
    if (!mapRef.current || !driverPos) return;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(driverPos);

    if (phase === 'driver_arriving' || phase === 'driver_arrived') {
      if (pickup) bounds.extend({ lat: pickup.lat, lng: pickup.lng });
    } else if (phase === 'in_progress' && dropoff) {
      bounds.extend({ lat: dropoff.lat, lng: dropoff.lng });
    }

    mapRef.current.fitBounds(bounds, { top: 80, right: 40, bottom: 320, left: 40 });
  }, [driverPos, phase, pickup, dropoff]);

  const handleCancel = () => {
    resetRide();
    navigate('/caby');
  };

  const handleFinish = () => {
    resetRide();
    navigate('/caby');
  };

  if (!currentDriver || !pickup) return null;

  const pickupPos = { lat: pickup.lat, lng: pickup.lng };
  const dropoffPos = dropoff ? { lat: dropoff.lat, lng: dropoff.lng } : null;
  const distanceKm = driverPos
    ? (
        Math.sqrt(
          Math.pow((driverPos.lat - (phase === 'in_progress' ? (dropoffPos?.lat || 0) : pickupPos.lat)) * 111, 2) +
            Math.pow((driverPos.lng - (phase === 'in_progress' ? (dropoffPos?.lng || 0) : pickupPos.lng)) * 85, 2)
        )
      ).toFixed(1)
    : '—';

  const phaseLabel = {
    driver_arriving: 'Chauffeur en route vers vous',
    driver_arrived: '🎉 Votre chauffeur est arrivé !',
    in_progress: 'Course en cours',
    completed: 'Vous êtes arrivé !',
  }[phase];

  // ─── Rating screen ───
  if (phase === 'completed') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold mb-2">Vous êtes arrivé !</h1>
            <p className="text-muted-foreground">
              Comment s'est passée votre course avec {currentDriver.name} ?
            </p>
          </div>

          <div className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 mb-6">
            <Avatar className="w-14 h-14">
              <AvatarImage src={currentDriver.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {currentDriver.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold">{currentDriver.name}</p>
                {isSuperDriver && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[hsl(43,75%,52%)]/15 text-[hsl(43,75%,52%)]">
                    ⭐ SuperDriver
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {currentDriver.vehicle.make} {currentDriver.vehicle.model} · {currentDriver.vehicle.plate}
              </p>
            </div>
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-3 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileTap={{ scale: 1.3 }}
                onClick={() => setRating(star)}
                className="p-1"
              >
                <Star
                  className={`w-11 h-11 transition-colors ${
                    star <= rating
                      ? 'fill-[hsl(43,75%,52%)] text-[hsl(43,75%,52%)]'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </motion.button>
            ))}
          </div>

          {/* Comment */}
          <textarea
            placeholder="Un commentaire ? (optionnel)"
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            className="w-full bg-card border border-border rounded-2xl p-4 text-sm resize-none h-20 mb-6 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />

          {/* Trip summary */}
          <div className="bg-card border border-border rounded-2xl p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Course</span>
              <span className="font-semibold">{estimatedPrice?.toFixed(2)} CHF</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Distance</span>
              <span>{estimatedDistance} km</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Durée</span>
              <span>{estimatedDuration} min</span>
            </div>
          </div>

          {/* Tips */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">Ajouter un pourboire</p>
            <div className="flex gap-2">
              {['2 CHF', '5 CHF', '10 CHF'].map((tip) => (
                <Button key={tip} variant="outline" className="flex-1 rounded-xl">
                  {tip}
                </Button>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 rounded-2xl text-sm mb-3"
            onClick={() => {
              // Generate a simple text receipt
              const receipt = `CABY — Facture\n\nChauffeur: ${currentDriver.name}\nVéhicule: ${currentDriver.vehicle.make} ${currentDriver.vehicle.model}\nPlaque: ${currentDriver.vehicle.plate}\n\nDistance: ${estimatedDistance} km\nDurée: ${estimatedDuration} min\nMontant: ${estimatedPrice?.toFixed(2)} CHF\n\nMerci d'avoir choisi Caby !`;
              const blob = new Blob([receipt], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `facture-caby-${Date.now()}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger la facture
          </Button>

          <Button onClick={handleFinish} className="w-full h-12 rounded-2xl text-base font-bold">
            Terminé
          </Button>
        </motion.div>
      </div>
    );
  }

  // ─── Main tracking view ───
  return (
    <div className="fixed inset-0 bg-background">
      {/* Full-screen map */}
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%', colorScheme: 'light' as const }}
          center={driverPos || pickupPos}
          zoom={15}
          options={MAP_OPTIONS}
          onLoad={(map) => { mapRef.current = map; }}
          onZoomChanged={() => {
            if (mapRef.current) setZoom(mapRef.current.getZoom() || 15);
          }}
        >
          <TrafficLayer />

          {/* Rider pulsing dot */}
          {(phase === 'driver_arriving' || phase === 'driver_arrived') && (
            <PulsingClientDot position={pickupPos} />
          )}

          {/* Destination marker */}
          {phase === 'in_progress' && dropoffPos && (
            <Marker
              position={dropoffPos}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#EF4444',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 3,
                scale: 10,
              }}
              title="Destination"
            />
          )}

          {/* Driver car */}
          {driverPos && (
            <Marker
              position={driverPos}
              icon={getCarIcon(driverHeading, zoom)}
              zIndex={10}
            />
          )}

          {/* Route polyline */}
          {routePoints.length > 1 && (
            <Polyline
              path={routePoints}
              options={{
                strokeColor: '#007AFF',
                strokeOpacity: 0.9,
                strokeWeight: 5,
                zIndex: 1,
              }}
            />
          )}
        </GoogleMap>
      )}

      {/* Phase status banner */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="pt-14 px-5 pb-3">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl px-4 py-3 backdrop-blur-xl ${
              phase === 'driver_arrived'
                ? 'bg-green-500/90 text-white'
                : 'bg-card/90 border border-border'
            }`}
          >
            <p className={`text-sm font-bold text-center ${phase === 'driver_arrived' ? 'text-white' : 'text-foreground'}`}>
              {phaseLabel}
            </p>
            {phase === 'driver_arriving' && (
              <p className="text-xs text-center text-muted-foreground mt-0.5">
                Arrive dans {eta} min · {distanceKm} km
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom sheet */}
      <AnimatePresence>
        {(phase as TripPhase) !== 'completed' && (
          <motion.div
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            exit={{ y: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-20"
          >
            <div
              className="bg-card border-t border-border rounded-t-3xl"
              style={{ boxShadow: '0 -8px 30px rgba(0,0,0,0.2)' }}
            >
              {/* Handle */}
              <button
                className="w-full flex justify-center pt-3 pb-1"
                onClick={() => setSheetExpanded(!sheetExpanded)}
              >
                <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
              </button>

              <div className="px-5 pb-6">
                {/* Driver info row */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="relative">
                    <Avatar className="w-14 h-14 border-2 border-border">
                      <AvatarImage src={currentDriver.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                        {currentDriver.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    {isSuperDriver && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[hsl(43,75%,52%)] flex items-center justify-center">
                        <Award className="w-3 h-3 text-black" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base truncate">{currentDriver.name}</h3>
                      {isSuperDriver && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[hsl(43,75%,52%)]/15 text-[hsl(43,75%,52%)] whitespace-nowrap">
                          SuperDriver
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-[hsl(43,75%,52%)] text-[hsl(43,75%,52%)]" />
                      <span className="text-xs font-semibold">{currentDriver.rating}</span>
                      <span className="text-xs text-muted-foreground">
                        · {currentDriver.vehicle.color} {currentDriver.vehicle.make} {currentDriver.vehicle.model}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      {currentDriver.vehicle.plate}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {phase === 'driver_arriving' && (
                      <>
                        <p className="text-2xl font-black">{eta}</p>
                        <p className="text-[10px] text-muted-foreground -mt-0.5">min</p>
                      </>
                    )}
                  </div>
                </div>

                {/* ETA info for in_progress */}
                {phase === 'in_progress' && dropoff && (
                  <div className="bg-muted/50 rounded-xl p-3 mb-4">
                    <p className="text-xs text-muted-foreground">En route vers</p>
                    <p className="text-sm font-semibold mt-0.5">{dropoff.address.split(',')[0]}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span>{estimatedDuration} min restants</span>
                      <span>·</span>
                      <span>{distanceKm} km</span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl h-11">
                    <Phone className="w-4 h-4 mr-2" />
                    Contacter
                  </Button>
                  {phase !== 'driver_arrived' && (
                    <Button variant="outline" className="flex-1 rounded-xl h-11">
                      <Shield className="w-4 h-4 mr-2" />
                      Sécurité
                    </Button>
                  )}
                </div>

                {/* Cancel button */}
                {(phase === 'driver_arriving') && (
                  <button
                    onClick={() => setShowCancelDialog(true)}
                    className="w-full mt-4 text-center text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Annuler la course
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="rounded-2xl max-w-[90vw]">
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler la course ?</AlertDialogTitle>
            <AlertDialogDescription>
              Votre chauffeur est déjà en route. Des frais d'annulation peuvent s'appliquer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Non, continuer</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Oui, annuler
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TripTracking;
