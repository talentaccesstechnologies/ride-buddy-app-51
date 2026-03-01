import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { MapPin, Navigation, Phone, CheckCircle, Flag, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import type { IncomingRide } from './IncomingRideOverlay';

type RidePhase = 'pickup' | 'trip';

interface Props {
  ride: IncomingRide;
  driverPosition: { lat: number; lng: number };
  onArrived: () => void;
  onComplete: () => void;
  onCancel: () => void;
}

const containerStyle: React.CSSProperties = { width: '100%', height: '100%' };

const PICKUP_ICON_URL = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42"><path d="M16 40 C16 40 2 26 2 14 C2 6.3 8.3 0 16 0 S30 6.3 30 14 C30 26 16 40 16 40Z" fill="#22C55E" stroke="white" stroke-width="2"/><circle cx="16" cy="14" r="6" fill="white"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
})();

const DROPOFF_ICON_URL = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42"><path d="M16 40 C16 40 2 26 2 14 C2 6.3 8.3 0 16 0 S30 6.3 30 14 C30 26 16 40 16 40Z" fill="#EF4444" stroke="white" stroke-width="2"/><circle cx="16" cy="14" r="6" fill="white"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
})();

const DRIVER_ICON_URL = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="rgba(59,130,246,0.2)" stroke="rgba(59,130,246,0.4)" stroke-width="1"/><circle cx="14" cy="14" r="8" fill="#3B82F6" stroke="white" stroke-width="3"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
})();

const ActiveRidePanel: React.FC<Props> = ({ ride, driverPosition, onArrived, onComplete, onCancel }) => {
  const { isLoaded } = useGoogleMaps();
  const [phase, setPhase] = useState<RidePhase>('pickup');
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const destination = phase === 'pickup'
    ? { lat: ride.pickupLat, lng: ride.pickupLng }
    : { lat: ride.dropoffLat, lng: ride.dropoffLng };

  // Compute route
  useEffect(() => {
    if (!isLoaded) return;
    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: phase === 'pickup' ? driverPosition : { lat: ride.pickupLat, lng: ride.pickupLng },
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result);
          const leg = result.routes[0]?.legs[0];
          if (leg) {
            setRouteInfo({
              distance: leg.distance?.text || '',
              duration: leg.duration?.text || '',
            });
          }
          // Fit bounds
          if (mapRef.current && result.routes[0]?.bounds) {
            mapRef.current.fitBounds(result.routes[0].bounds, { top: 60, bottom: 280, left: 40, right: 40 });
          }
        }
      }
    );
  }, [isLoaded, phase, driverPosition, destination, ride.pickupLat, ride.pickupLng]);

  const openGoogleMapsNav = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const handleArrived = () => {
    onArrived();
    setPhase('trip');
    setDirections(null);
    setRouteInfo(null);
  };

  const initials = ride.clientName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  if (!isLoaded) return null;

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
          {/* Driver */}
          <Marker
            position={driverPosition}
            icon={{ url: DRIVER_ICON_URL, scaledSize: new google.maps.Size(28, 28), anchor: new google.maps.Point(14, 14) }}
            zIndex={999}
          />

          {/* Destination marker */}
          <Marker
            position={destination}
            icon={{
              url: phase === 'pickup' ? PICKUP_ICON_URL : DROPOFF_ICON_URL,
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
                  strokeWeight: 5,
                  strokeOpacity: 0.8,
                },
              }}
            />
          )}
        </GoogleMap>

        {/* Phase badge */}
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-md border ${
            phase === 'pickup'
              ? 'bg-[hsl(var(--caby-green))]/90 border-[hsl(var(--caby-green))]/50 text-white'
              : 'bg-[hsl(var(--caby-blue))]/90 border-[hsl(var(--caby-blue))]/50 text-white'
          }`}>
            {phase === 'pickup' ? (
              <><MapPin className="w-4 h-4" /><span className="text-sm font-bold">En route vers le client</span></>
            ) : (
              <><Flag className="w-4 h-4" /><span className="text-sm font-bold">Course en cours</span></>
            )}
          </div>
        </div>
      </div>

      {/* Bottom panel */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="bg-card border-t border-border rounded-t-3xl shadow-2xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="px-5 pb-5">
          {/* Client info */}
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
            <div className="flex items-center gap-2 flex-1">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--caby-green))]" />
              <span className="text-xs text-foreground truncate">{ride.pickupAddress}</span>
            </div>
            <span className="text-muted-foreground text-xs">→</span>
            <div className="flex items-center gap-2 flex-1">
              <div className="w-2 h-2 rounded-full bg-destructive" />
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
                onClick={onComplete}
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
