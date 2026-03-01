import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { MapPin, CheckCircle, Flag, ExternalLink, Star, ChevronRight } from 'lucide-react';
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

const DRIVER_ICON = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="rgba(59,130,246,0.2)" stroke="rgba(59,130,246,0.4)" stroke-width="1"/><circle cx="14" cy="14" r="8" fill="#3B82F6" stroke="white" stroke-width="3"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
})();

/* Fake next ride for the "prochaine course" teaser */
const NEXT_RIDE_TEASER = {
  address: 'Rue de Lausanne 72',
  price: 28,
};

const ActiveRidePanel: React.FC<Props> = ({ ride, driverPosition, onArrived, onComplete, onCancel }) => {
  const { isLoaded } = useGoogleMaps();
  const [phase, setPhase] = useState<RidePhase>('pickup');
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string; durationValue: number } | null>(null);
  const [showNextTeaser, setShowNextTeaser] = useState(false);
  const [rating, setRating] = useState(0);
  const mapRef = useRef<google.maps.Map | null>(null);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const destination = phase === 'pickup'
    ? { lat: ride.pickupLat, lng: ride.pickupLng }
    : { lat: ride.dropoffLat, lng: ride.dropoffLng };

  const origin = phase === 'pickup'
    ? driverPosition
    : { lat: ride.pickupLat, lng: ride.pickupLng };

  // Compute route
  useEffect(() => {
    if (!isLoaded || phase === 'completed') return;
    const service = new google.maps.DirectionsService();
    service.route(
      { origin, destination, travelMode: google.maps.TravelMode.DRIVING },
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
          }
          if (mapRef.current && result.routes[0]?.bounds) {
            mapRef.current.fitBounds(result.routes[0].bounds, { top: 80, bottom: 300, left: 40, right: 40 });
          }
        }
      }
    );
  }, [isLoaded, phase, origin.lat, origin.lng, destination.lat, destination.lng]);

  // Show "next ride" teaser when ~3 min from destination during trip phase
  useEffect(() => {
    if (phase !== 'trip' || !routeInfo) return;
    // Show teaser if route duration ≤ 3 min (180s) — for demo, show after 3s
    const timer = setTimeout(() => setShowNextTeaser(true), 3000);
    return () => clearTimeout(timer);
  }, [phase, routeInfo]);

  // Auto-return after completion
  useEffect(() => {
    if (phase !== 'completed') return;
    completionTimerRef.current = setTimeout(() => {
      onComplete(ride.estimatedPrice);
    }, 3500);
    return () => { if (completionTimerRef.current) clearTimeout(completionTimerRef.current); };
  }, [phase, onComplete, ride.estimatedPrice]);

  const openGoogleMapsNav = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const handleArrived = () => {
    onArrived();
    setPhase('trip');
    setDirections(null);
    setRouteInfo(null);
    setShowNextTeaser(false);
  };

  const handleFinish = () => {
    setPhase('completed');
    setDirections(null);
  };

  const initials = ride.clientName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

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

          {/* Star rating */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-4"
          >
            <p className="text-sm text-muted-foreground mb-3">Notez le client</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= rating
                        ? 'text-primary fill-primary'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-muted-foreground"
          >
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
          zoom={14}
          center={driverPosition}
          onLoad={(map) => { mapRef.current = map; }}
          options={{
            disableDefaultUI: true,
            zoomControl: false,
            gestureHandling: 'greedy',
            styles: [
              { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
              { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
            ],
          }}
        >
          <Marker
            position={driverPosition}
            icon={{ url: DRIVER_ICON, scaledSize: new google.maps.Size(28, 28), anchor: new google.maps.Point(14, 14) }}
            zIndex={999}
          />
          <Marker
            position={destination}
            icon={{
              url: phase === 'pickup' ? PICKUP_ICON : DROPOFF_ICON,
              scaledSize: new google.maps.Size(32, 42),
              anchor: new google.maps.Point(16, 42),
            }}
            zIndex={100}
          />
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: phase === 'pickup' ? '#22C55E' : '#3B82F6',
                  strokeWeight: 5,
                  strokeOpacity: 0.8,
                },
              }}
            />
          )}
        </GoogleMap>

        {/* Phase badge */}
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10">
          <motion.div
            key={phase}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-md border ${
              phase === 'pickup'
                ? 'bg-[hsl(var(--caby-green))]/90 border-[hsl(var(--caby-green))]/50 text-white'
                : 'bg-[hsl(var(--caby-blue))]/90 border-[hsl(var(--caby-blue))]/50 text-white'
            }`}
          >
            {phase === 'pickup' ? (
              <><MapPin className="w-4 h-4" /><span className="text-sm font-bold">En route vers le client</span></>
            ) : (
              <><Flag className="w-4 h-4" /><span className="text-sm font-bold">Course en cours</span></>
            )}
          </motion.div>
        </div>

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
          <div className="flex items-center gap-3 mb-4">
            {ride.clientPhoto ? (
              <img src={ride.clientPhoto} alt={ride.clientName} className="w-12 h-12 rounded-full object-cover border-2 border-border" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                <span className="text-base font-bold text-primary">{initials}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-foreground truncate">{ride.clientName}</h3>
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
          <div className="flex items-center gap-3 mb-4 px-3 py-2.5 rounded-xl bg-secondary/50 border border-border">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--caby-green))] flex-shrink-0" />
              <span className="text-xs text-foreground truncate">{ride.pickupAddress}</span>
            </div>
            <span className="text-muted-foreground text-xs flex-shrink-0">→</span>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />
              <span className="text-xs text-foreground truncate">{ride.dropoffAddress}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <span className="text-xs font-semibold text-muted-foreground">Prix estimé</span>
            <span className="text-lg font-bold text-primary tabular-nums">{ride.estimatedPrice} CHF</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={openGoogleMapsNav}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-secondary border border-border text-foreground font-bold text-sm active:scale-[0.97] transition-transform"
            >
              <ExternalLink className="w-4 h-4" />
              Navigation
            </button>

            {phase === 'pickup' ? (
              <button
                onClick={handleArrived}
                className="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[hsl(var(--caby-green))] text-white font-bold text-sm active:scale-[0.97] transition-transform shadow-lg"
              >
                <CheckCircle className="w-4 h-4" />
                Je suis arrivé
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm active:scale-[0.97] transition-transform shadow-lg"
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
