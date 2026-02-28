import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
  TrafficLayer,
} from '@react-google-maps/api';
import { Navigation } from 'lucide-react';
import { APP_CONFIG } from '@/config/app.config';
import { useRideTracking } from '@/hooks/useRideTracking';
import type { LatLng } from '@/services/googleMaps.service';

interface LiveTrackingMapProps {
  rideId: string;
  pickupPosition: LatLng;
  dropoffPosition: LatLng;
  /** Fallback ETA from RideContext when realtime not yet connected */
  fallbackEta?: number | null;
}

const containerStyle = { width: '100%', height: '100%' };

const mapStyles: google.maps.MapTypeStyle[] = [
  { featureType: 'landscape', elementType: 'geometry.fill', stylers: [{ color: '#f0ede6' }] },
  { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#a3d4f7' }] },
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#ffd54f' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#c6a030' }, { weight: 2 }] },
  { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ color: '#ffe082' }] },
  { featureType: 'road.local', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

const CABY_GOLD = '#D4AF37';

function createCarSvg(heading: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <g transform="rotate(${heading}, 24, 24)">
      <circle cx="24" cy="24" r="20" fill="${CABY_GOLD}" opacity="0.2"/>
      <circle cx="24" cy="24" r="14" fill="${CABY_GOLD}" stroke="white" stroke-width="2"/>
      <path d="M24 12 L30 28 L24 24 L18 28 Z" fill="white"/>
    </g>
  </svg>`;
}

function createPulseDotSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="#007AFF" opacity="0.2">
      <animate attributeName="r" from="8" to="14" dur="1.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" from="0.4" to="0.1" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="16" cy="16" r="7" fill="#007AFF" stroke="white" stroke-width="2.5"/>
  </svg>`;
}

const trafficColors = {
  smooth: '#22C55E',
  moderate: '#F59E0B',
  heavy: '#EF4444',
};

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  rideId,
  pickupPosition,
  dropoffPosition,
  fallbackEta,
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: APP_CONFIG.GOOGLE_MAPS_API_KEY,
  });

  const {
    driverPosition,
    driverHeading,
    etaMinutes,
    routePolyline,
    trafficCondition,
    isConnected,
  } = useRideTracking(rideId, dropoffPosition);

  const mapRef = useRef<google.maps.Map | null>(null);
  const displayEta = etaMinutes ?? fallbackEta ?? null;

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Fit bounds when driver position or route changes
  useEffect(() => {
    if (!mapRef.current) return;
    const bounds = new google.maps.LatLngBounds();
    if (driverPosition) bounds.extend(driverPosition);
    bounds.extend(pickupPosition);
    bounds.extend(dropoffPosition);
    if (bounds.getNorthEast().equals(bounds.getSouthWest())) return;
    mapRef.current.fitBounds(bounds, { top: 60, bottom: 200, left: 40, right: 40 });
  }, [driverPosition, pickupPosition, dropoffPosition]);

  const handleRecenter = useCallback(() => {
    if (!mapRef.current) return;
    const bounds = new google.maps.LatLngBounds();
    if (driverPosition) bounds.extend(driverPosition);
    bounds.extend(pickupPosition);
    bounds.extend(dropoffPosition);
    mapRef.current.fitBounds(bounds, { top: 60, bottom: 200, left: 40, right: 40 });
  }, [driverPosition, pickupPosition, dropoffPosition]);

  if (loadError) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Erreur de chargement de la carte</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const routeColor = trafficColors[trafficCondition];

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={driverPosition || pickupPosition}
        zoom={15}
        options={{
          disableDefaultUI: true,
          styles: mapStyles,
        }}
        onLoad={onLoad}
      >
        <TrafficLayer />

        {/* Route polyline */}
        {routePolyline.length > 0 && (
          <Polyline
            path={routePolyline}
            options={{
              strokeColor: routeColor,
              strokeWeight: 5,
              strokeOpacity: 0.85,
            }}
          />
        )}

        {/* Driver marker - animated car */}
        {driverPosition && (
          <Marker
            position={driverPosition}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(createCarSvg(driverHeading)),
              scaledSize: new google.maps.Size(48, 48),
              anchor: new google.maps.Point(24, 24),
            }}
            zIndex={10}
          />
        )}

        {/* Pickup marker - pulsing blue dot */}
        <Marker
          position={pickupPosition}
          icon={{
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(createPulseDotSvg()),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16),
          }}
          zIndex={5}
        />

        {/* Destination marker */}
        <Marker
          position={dropoffPosition}
          zIndex={5}
        />
      </GoogleMap>

      {/* ETA bubble */}
      {displayEta !== null && (
        <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
          <p className="text-xs text-muted-foreground">
            {isConnected ? 'Arrivée dans' : 'ETA estimé'}
          </p>
          <p className="text-2xl font-bold">{displayEta} <span className="text-sm font-normal text-muted-foreground">min</span></p>
          {isConnected && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: routeColor }} />
              <span className="text-[10px] text-muted-foreground">
                {trafficCondition === 'smooth' && 'Trafic fluide'}
                {trafficCondition === 'moderate' && 'Trafic modéré'}
                {trafficCondition === 'heavy' && 'Trafic dense'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Connection indicator */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-orange-400 animate-pulse'}`} />
          <span className="text-[10px] text-muted-foreground">
            {isConnected ? 'GPS temps réel' : 'Connexion...'}
          </span>
        </div>
      </div>

      {/* Recenter */}
      <button
        onClick={handleRecenter}
        className="absolute bottom-4 right-4 w-12 h-12 bg-background rounded-full shadow-lg flex items-center justify-center hover:bg-secondary transition-colors"
      >
        <Navigation className="w-5 h-5 text-accent" />
      </button>
    </div>
  );
};

export default LiveTrackingMap;
