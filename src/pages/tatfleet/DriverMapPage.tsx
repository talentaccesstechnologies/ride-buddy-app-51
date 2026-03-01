import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Circle } from '@react-google-maps/api';
import { Locate, Wifi, WifiOff } from 'lucide-react';
import { APP_CONFIG } from '@/config/app.config';
import DriverBottomNav from '@/components/tatfleet/DriverBottomNav';

const LIBRARIES: ('places')[] = ['places'];
const RADAR_RADIUS_M = 5000;

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
};

const DriverMapPage: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [hasMoved, setHasMoved] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const pulseElRef = useRef<HTMLDivElement | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: APP_CONFIG.GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  // Get initial position
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setPosition(APP_CONFIG.DEFAULT_CENTER),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // GPS tracking when online
  useEffect(() => {
    if (!isOnline || !position) {
      if (watchIdRef.current !== null) {
        clearInterval(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    const updatePosition = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(newPos);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      );
    };

    const id = window.setInterval(updatePosition, APP_CONFIG.GPS_UPDATE_INTERVAL_MS);
    watchIdRef.current = id;

    return () => {
      clearInterval(id);
      watchIdRef.current = null;
    };
  }, [isOnline]);

  // Update marker position
  useEffect(() => {
    if (!mapRef.current || !position || !isLoaded) return;

    if (!markerRef.current) {
      // Create pulsing dot element
      const el = document.createElement('div');
      el.className = 'driver-pulse-marker';
      el.innerHTML = `
        <div style="position:relative;width:24px;height:24px;">
          <div style="position:absolute;inset:0;border-radius:50%;background:hsl(211,100%,50%);opacity:0.3;animation:driverPulse 2s ease-out infinite;"></div>
          <div style="position:absolute;inset:4px;border-radius:50%;background:hsl(211,100%,50%);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
        </div>
      `;
      pulseElRef.current = el;

      try {
        markerRef.current = new google.maps.marker.AdvancedMarkerElement({
          map: mapRef.current,
          position,
          content: el,
          zIndex: 999,
        });
      } catch {
        // Fallback if AdvancedMarkerElement not available
      }
    } else {
      markerRef.current.position = position;
    }
  }, [position, isLoaded]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (position) {
      map.panTo(position);
    }
  }, [position]);

  const handleRecenter = useCallback(() => {
    if (mapRef.current && position) {
      mapRef.current.panTo(position);
      mapRef.current.setZoom(15);
      setHasMoved(false);
    }
  }, [position]);

  const handleDragEnd = useCallback(() => {
    setHasMoved(true);
  }, []);

  const toggleOnline = () => setIsOnline((v) => !v);

  if (!isLoaded || !position) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <div className="text-muted-foreground text-sm">Chargement de la carte…</div>
        <DriverBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Map fills screen */}
      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={position}
          zoom={15}
          onLoad={onMapLoad}
          onDragEnd={handleDragEnd}
          options={{
            disableDefaultUI: true,
            zoomControl: false,
            mapId: 'driver_map',
            gestureHandling: 'greedy',
          }}
        >
          {/* Radar zone circle when online */}
          {isOnline && (
            <Circle
              center={position}
              radius={RADAR_RADIUS_M}
              options={{
                fillColor: 'hsl(211,100%,50%)',
                fillOpacity: 0.06,
                strokeColor: 'hsl(211,100%,50%)',
                strokeOpacity: 0.25,
                strokeWeight: 2,
              }}
            />
          )}
        </GoogleMap>

        {/* Status badge - top center */}
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={toggleOnline}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg backdrop-blur-md border transition-all active:scale-95 ${
              isOnline
                ? 'bg-[hsl(var(--caby-green))]/90 border-[hsl(var(--caby-green))]/50 text-white'
                : 'bg-card/90 border-border text-muted-foreground'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-bold">EN LIGNE</span>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-bold">HORS LIGNE</span>
              </>
            )}
          </button>
        </div>

        {/* Radar zone label */}
        {isOnline && (
          <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10">
            <span className="text-[10px] font-semibold text-[hsl(var(--caby-blue))] bg-card/80 backdrop-blur-sm px-3 py-1 rounded-full border border-[hsl(var(--caby-blue))]/20">
              Zone de captation · 5 km
            </span>
          </div>
        )}

        {/* Recenter button */}
        {hasMoved && (
          <button
            onClick={handleRecenter}
            className="absolute bottom-24 right-4 z-10 w-12 h-12 rounded-full bg-card/90 backdrop-blur-md border border-border shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          >
            <Locate className="w-5 h-5 text-foreground" />
          </button>
        )}
      </div>

      <DriverBottomNav />

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes driverPulse {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default DriverMapPage;
