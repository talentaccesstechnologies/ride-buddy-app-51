import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { MapPin, CheckCircle, Flag, Star, ChevronRight, Navigation, CornerUpRight, CornerUpLeft, ArrowUp, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import type { IncomingRide } from './IncomingRideOverlay';

export type RidePhase = 'pickup' | 'trip' | 'completed';

interface Props {
  ride: IncomingRide;
  driverPosition: { lat: number; lng: number };
  onArrived: () => void;
  onComplete: (price: number) => void;
  onCancel: () => void;
}

const containerStyle: React.CSSProperties = { width: '100%', height: '100%' };

const PICKUP_ICON = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42"><path d="M16 40 C16 40 2 26 2 14 C2 6.3 8.3 0 16 0 S30 6.3 30 14 C30 26 16 40 16 40Z" fill="#22C55E" stroke="white" stroke-width="2"/><circle cx="16" cy="14" r="6" fill="white"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
})();

const DROPOFF_ICON = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42"><path d="M16 40 C16 40 2 26 2 14 C2 6.3 8.3 0 16 0 S30 6.3 30 14 C30 26 16 40 16 40Z" fill="#EF4444" stroke="white" stroke-width="2"/><circle cx="16" cy="14" r="6" fill="white"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
})();

const createDriverArrow = (heading: number): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
    <circle cx="22" cy="22" r="20" fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.3)" stroke-width="1"/>
    <circle cx="22" cy="22" r="12" fill="#3B82F6" stroke="white" stroke-width="3"/>
    <polygon points="22,6 18,16 26,16" fill="#3B82F6" stroke="white" stroke-width="1.5" transform="rotate(${heading},22,22)"/>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

/* ── Turn-by-turn helpers ── */
interface NavStep {
  instruction: string;
  distance: string;
  maneuver?: string;
}

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');

const getManeuverIcon = (maneuver?: string) => {
  if (!maneuver) return <ArrowUp className="w-6 h-6" />;
  if (maneuver.includes('right')) return <CornerUpRight className="w-6 h-6" />;
  if (maneuver.includes('left')) return <CornerUpLeft className="w-6 h-6" />;
  if (maneuver.includes('uturn') || maneuver.includes('u-turn')) return <RotateCw className="w-6 h-6" />;
  return <ArrowUp className="w-6 h-6" />;
};

/* Fake next ride for the "prochaine course" teaser */
const NEXT_RIDE_TEASER = { address: 'Rue de Lausanne 72', price: 28 };

/* ── Haversine distance (m) ── */
const haversineM = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};

const ActiveRidePanel: React.FC<Props> = ({ ride, driverPosition, onArrived, onComplete, onCancel }) => {
  const { isLoaded } = useGoogleMaps();
  const [phase, setPhase] = useState<RidePhase>('pickup');
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string; durationValue: number } | null>(null);
  const [navSteps, setNavSteps] = useState<NavStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [heading, setHeading] = useState(0);
  const [showNextTeaser, setShowNextTeaser] = useState(false);
  const [rating, setRating] = useState(0);
  const [isFollowing, setIsFollowing] = useState(true);
  const mapRef = useRef<google.maps.Map | null>(null);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPosRef = useRef(driverPosition);
  const lastRouteKeyRef = useRef('');

  const destination = phase === 'pickup'
    ? { lat: ride.pickupLat, lng: ride.pickupLng }
    : { lat: ride.dropoffLat, lng: ride.dropoffLng };

  // Compute heading from movement
  useEffect(() => {
    const prev = prevPosRef.current;
    const dx = driverPosition.lng - prev.lng;
    const dy = driverPosition.lat - prev.lat;
    if (Math.abs(dx) > 0.00001 || Math.abs(dy) > 0.00001) {
      const angle = (Math.atan2(dx, dy) * 180) / Math.PI;
      setHeading(angle);
    }
    prevPosRef.current = driverPosition;
  }, [driverPosition]);

  // Follow driver position on map
  useEffect(() => {
    if (!mapRef.current || !isFollowing) return;
    mapRef.current.panTo(driverPosition);
    if (mapRef.current.getZoom()! < 16) mapRef.current.setZoom(16);
    if (mapRef.current.getHeading && heading !== 0) {
      // heading property is only available on vector maps; graceful fallback
      try { (mapRef.current as any).setHeading?.(heading); } catch {}
    }
  }, [driverPosition, isFollowing, heading]);

  // Compute / recompute route
  useEffect(() => {
    if (!isLoaded || phase === 'completed') return;
    const routeKey = `${phase}-${driverPosition.lat.toFixed(4)}-${driverPosition.lng.toFixed(4)}`;
    // Avoid spamming: only recompute if moved significantly or phase changed
    if (routeKey === lastRouteKeyRef.current) return;
    lastRouteKeyRef.current = routeKey;

    const service = new google.maps.DirectionsService();
    service.route(
      { origin: driverPosition, destination, travelMode: google.maps.TravelMode.DRIVING },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result);
          const leg = result.routes[0]?.legs[0];
          if (leg) {
            setRouteInfo({
              distance: leg.distance?.text || '',
              duration: leg.duration?.text || '',
              durationValue: leg.duration?.value || 0,
            });
            // Extract turn-by-turn steps
            const steps: NavStep[] = (leg.steps || []).map((s) => ({
              instruction: stripHtml(s.instructions || ''),
              distance: s.distance?.text || '',
              maneuver: (s as any).maneuver || undefined,
            }));
            setNavSteps(steps);
            setCurrentStepIdx(0);
          }
        }
      }
    );
  }, [isLoaded, phase, driverPosition.lat, driverPosition.lng, destination.lat, destination.lng]);

  // Advance current step based on proximity to step endpoints
  useEffect(() => {
    if (!directions || navSteps.length === 0) return;
    const leg = directions.routes[0]?.legs[0];
    if (!leg?.steps) return;

    for (let i = currentStepIdx; i < leg.steps.length; i++) {
      const stepEnd = leg.steps[i].end_location;
      if (!stepEnd) continue;
      const dist = haversineM(driverPosition, { lat: stepEnd.lat(), lng: stepEnd.lng() });
      if (dist < 50) {
        // Passed this step
        if (i + 1 < leg.steps.length) {
          setCurrentStepIdx(i + 1);
        }
        break;
      } else {
        break;
      }
    }
  }, [driverPosition, directions, navSteps, currentStepIdx]);

  // Show "next ride" teaser after 3s in trip phase
  useEffect(() => {
    if (phase !== 'trip' || !routeInfo) return;
    const timer = setTimeout(() => setShowNextTeaser(true), 3000);
    return () => clearTimeout(timer);
  }, [phase, routeInfo]);

  // Auto-return after completion
  useEffect(() => {
    if (phase !== 'completed') return;
    completionTimerRef.current = setTimeout(() => onComplete(ride.estimatedPrice), 3500);
    return () => { if (completionTimerRef.current) clearTimeout(completionTimerRef.current); };
  }, [phase, onComplete, ride.estimatedPrice]);

  const handleArrived = () => {
    onArrived();
    setPhase('trip');
    setDirections(null);
    setRouteInfo(null);
    setNavSteps([]);
    setCurrentStepIdx(0);
    setShowNextTeaser(false);
    lastRouteKeyRef.current = '';
  };

  const handleFinish = () => {
    setPhase('completed');
    setDirections(null);
  };

  const currentStep = navSteps[currentStepIdx] || null;
  const nextStep = navSteps[currentStepIdx + 1] || null;
  const initials = ride.clientName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const driverIcon = useMemo(() => createDriverArrow(heading), [heading]);

  if (!isLoaded) return null;

  /* ── Completion recap ── */
  if (phase === 'completed') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="text-center px-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 15 }}
            className="w-20 h-20 rounded-full bg-[hsl(var(--caby-green))]/20 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-[hsl(var(--caby-green))]" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Course terminée</h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-primary mb-6 tabular-nums"
          >
            +{ride.estimatedPrice} CHF
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-4"
          >
            <p className="text-sm text-muted-foreground mb-3">Notez le client</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="transition-transform active:scale-90">
                  <Star className={`w-8 h-8 transition-colors ${star <= rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`} />
                </button>
              ))}
            </div>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-xs text-muted-foreground">
            Retour au dashboard…
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col">
      {/* Map */}
      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={containerStyle}
          zoom={16}
          center={driverPosition}
          onLoad={(map) => { mapRef.current = map; }}
          onDragStart={() => setIsFollowing(false)}
          options={{
            disableDefaultUI: true,
            zoomControl: false,
            gestureHandling: 'greedy',
            tilt: 45,
            styles: [
              { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
              { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
            ],
          }}
        >
          {/* Driver arrow marker */}
          <Marker
            position={driverPosition}
            icon={{ url: driverIcon, scaledSize: new google.maps.Size(44, 44), anchor: new google.maps.Point(22, 22) }}
            zIndex={999}
          />
          {/* Destination marker */}
          <Marker
            position={destination}
            icon={{
              url: phase === 'pickup' ? PICKUP_ICON : DROPOFF_ICON,
              scaledSize: new google.maps.Size(32, 42),
              anchor: new google.maps.Point(16, 42),
            }}
            zIndex={100}
          />
          {/* Route */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: phase === 'pickup' ? '#22C55E' : '#3B82F6',
                  strokeWeight: 6,
                  strokeOpacity: 0.85,
                },
              }}
            />
          )}
        </GoogleMap>

        {/* ── Turn-by-turn instruction overlay ── */}
        <AnimatePresence mode="wait">
          {currentStep && (
            <motion.div
              key={`step-${currentStepIdx}`}
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute top-4 left-4 right-4 z-20"
            >
              <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden">
                {/* Main instruction */}
                <div className="flex items-center gap-4 px-4 py-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    phase === 'pickup' ? 'bg-[hsl(var(--caby-green))]/15 text-[hsl(var(--caby-green))]' : 'bg-[hsl(var(--caby-blue))]/15 text-[hsl(var(--caby-blue))]'
                  }`}>
                    {getManeuverIcon(currentStep.maneuver)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary tabular-nums mb-0.5">
                      {currentStep.distance}
                    </p>
                    <p className="text-sm font-bold text-foreground leading-tight line-clamp-2">
                      {currentStep.instruction}
                    </p>
                  </div>
                </div>
                {/* Next step preview */}
                {nextStep && (
                  <div className="flex items-center gap-3 px-4 py-2 border-t border-border/50 bg-secondary/30">
                    <span className="text-muted-foreground">{getManeuverIcon(nextStep.maneuver)}</span>
                    <p className="text-xs text-muted-foreground truncate flex-1">
                      Puis : {nextStep.instruction}
                    </p>
                    <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">{nextStep.distance}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recenter button when user drags */}
        {!isFollowing && (
          <button
            onClick={() => setIsFollowing(true)}
            className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          >
            <Navigation className="w-5 h-5 text-[hsl(var(--caby-blue))]" />
          </button>
        )}

        {/* Next ride teaser — trip phase only */}
        <AnimatePresence>
          {showNextTeaser && phase === 'trip' && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="absolute bottom-[240px] left-4 right-4 z-10"
            >
              <div className="bg-card/95 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <ChevronRight className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Prochaine course</p>
                  <p className="text-sm font-medium text-foreground truncate">{NEXT_RIDE_TEASER.address} · {NEXT_RIDE_TEASER.price} CHF</p>
                </div>
                <button className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold active:scale-95 transition-transform">
                  Accepter
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom panel */}
      <motion.div
        key={phase}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-card border-t border-border rounded-t-3xl shadow-2xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="px-5 pb-5">
          {/* Client info row */}
          <div className="flex items-center gap-3 mb-3">
            {ride.clientPhoto ? (
              <img src={ride.clientPhoto} alt={ride.clientName} className="w-11 h-11 rounded-full object-cover border-2 border-border" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{initials}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">{ride.clientName}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {phase === 'pickup' ? ride.pickupAddress : ride.dropoffAddress}
              </p>
            </div>
            {routeInfo && (
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-foreground">{routeInfo.distance}</p>
                <p className="text-xs text-muted-foreground">{routeInfo.duration}</p>
              </div>
            )}
          </div>

          {/* Route summary */}
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-secondary/50 border border-border">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--caby-green))] flex-shrink-0" />
            <span className="text-[11px] text-foreground truncate flex-1">{ride.pickupAddress}</span>
            <span className="text-muted-foreground text-[11px]">→</span>
            <div className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />
            <span className="text-[11px] text-foreground truncate flex-1">{ride.dropoffAddress}</span>
          </div>

          {/* Price + action */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 flex-shrink-0">
              <span className="text-lg font-bold text-primary tabular-nums">{ride.estimatedPrice}</span>
              <span className="text-xs font-medium text-muted-foreground">CHF</span>
            </div>

            {phase === 'pickup' ? (
              <button
                onClick={handleArrived}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[hsl(var(--caby-green))] text-white font-bold text-sm active:scale-[0.97] transition-transform shadow-lg"
              >
                <CheckCircle className="w-4 h-4" />
                Je suis arrivé
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm active:scale-[0.97] transition-transform shadow-lg"
              >
                <Flag className="w-4 h-4" />
                Terminer la course
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ActiveRidePanel;
