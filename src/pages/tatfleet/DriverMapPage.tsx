import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Circle, Marker, InfoWindow } from '@react-google-maps/api';
import { Locate, Wifi, WifiOff } from 'lucide-react';
import { APP_CONFIG } from '@/config/app.config';
import DriverBottomNav from '@/components/tatfleet/DriverBottomNav';

const LIBRARIES: ('places')[] = ['places'];
const RADAR_RADIUS_M = 5000;

const containerStyle: React.CSSProperties = { width: '100%', height: '100%' };

// ── Partner logistics points ──
interface PartnerPoint {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'express' | 'laundry' | 'health';
  emoji: string;
}

const PARTNER_POINTS: PartnerPoint[] = [
  // Caby Express 📦 (orange)
  { id: 'ex1', name: 'Caby Express — Cornavin', address: 'Pl. de Cornavin 7, Genève', lat: 46.2101, lng: 6.1427, type: 'express', emoji: '📦' },
  { id: 'ex2', name: 'Caby Express — Plainpalais', address: 'Bd Georges-Favon 24, Genève', lat: 46.2003, lng: 6.1420, type: 'express', emoji: '📦' },
  { id: 'ex3', name: 'Caby Express — Eaux-Vives', address: 'Rue de la Terrassière 12, Genève', lat: 46.2023, lng: 6.1610, type: 'express', emoji: '📦' },
  // Caby Laundry 👕 (blue)
  { id: 'la1', name: 'Caby Laundry — Carouge', address: 'Rue St-Joseph 10, Carouge', lat: 46.1850, lng: 6.1396, type: 'laundry', emoji: '👕' },
  { id: 'la2', name: 'Caby Laundry — Servette', address: 'Rue de la Servette 45, Genève', lat: 46.2130, lng: 6.1310, type: 'laundry', emoji: '👕' },
  // Caby Health Logistix 🏥 (red)
  { id: 'he1', name: 'Caby Health — HUG', address: 'Rue Gabrielle-Perret-Gentil 4, Genève', lat: 46.1935, lng: 6.1490, type: 'health', emoji: '🏥' },
  { id: 'he2', name: 'Caby Health — Champel', address: 'Av. de Champel 25, Genève', lat: 46.1920, lng: 6.1560, type: 'health', emoji: '🏥' },
];

const MARKER_COLORS: Record<PartnerPoint['type'], string> = {
  express: '#F97316',  // orange
  laundry: '#3B82F6',  // blue
  health: '#EF4444',   // red
};

const createPartnerIcon = (type: PartnerPoint['type'], emoji: string): string => {
  const color = MARKER_COLORS[type];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
      <path d="M20 48 C20 48 2 30 2 18 C2 8 10 0 20 0 S38 8 38 18 C38 30 20 48 20 48Z" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="20" y="22" text-anchor="middle" font-size="16">${emoji}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// Blue pulsing driver marker as SVG data URL
const DRIVER_ICON_URL = (() => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="13" fill="rgba(59,130,246,0.2)" stroke="rgba(59,130,246,0.4)" stroke-width="1"/>
      <circle cx="14" cy="14" r="8" fill="#3B82F6" stroke="white" stroke-width="3"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
})();

const DriverMapPage: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [hasMoved, setHasMoved] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<PartnerPoint | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const watchIdRef = useRef<number | null>(null);

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

  // GPS tracking when online (every 10s)
  useEffect(() => {
    if (!isOnline) {
      if (watchIdRef.current !== null) {
        clearInterval(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    const updatePosition = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
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

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (position) map.panTo(position);
  }, [position]);

  const handleRecenter = useCallback(() => {
    if (mapRef.current && position) {
      mapRef.current.panTo(position);
      mapRef.current.setZoom(14);
      setHasMoved(false);
    }
  }, [position]);

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
      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={position}
          zoom={14}
          onLoad={onMapLoad}
          onDragEnd={() => setHasMoved(true)}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
            gestureHandling: 'greedy',
            styles: [], // Standard Google Maps style
          }}
        >
          {/* Driver position marker */}
          <Marker
            position={position}
            icon={{
              url: DRIVER_ICON_URL,
              scaledSize: new google.maps.Size(28, 28),
              anchor: new google.maps.Point(14, 14),
            }}
            zIndex={999}
          />

          {/* Radar zone circle when online */}
          {isOnline && (
            <Circle
              center={position}
              radius={RADAR_RADIUS_M}
              options={{
                fillColor: '#22C55E',
                fillOpacity: 0.07,
                strokeColor: '#22C55E',
                strokeOpacity: 0.35,
                strokeWeight: 2,
              }}
            />
          )}

          {/* Partner logistics markers */}
          {PARTNER_POINTS.map((point) => (
            <Marker
              key={point.id}
              position={{ lat: point.lat, lng: point.lng }}
              icon={{
                url: createPartnerIcon(point.type, point.emoji),
                scaledSize: new google.maps.Size(36, 45),
                anchor: new google.maps.Point(18, 45),
              }}
              onClick={() => setSelectedPoint(point)}
              zIndex={10}
            />
          ))}

          {/* InfoWindow for selected partner */}
          {selectedPoint && (
            <InfoWindow
              position={{ lat: selectedPoint.lat, lng: selectedPoint.lng }}
              onCloseClick={() => setSelectedPoint(null)}
              options={{ pixelOffset: new google.maps.Size(0, -45) }}
            >
              <div style={{ padding: '4px 2px', minWidth: 180 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                  {selectedPoint.emoji} {selectedPoint.name}
                </div>
                <div style={{ fontSize: 11, color: '#666' }}>{selectedPoint.address}</div>
                <div style={{
                  marginTop: 6,
                  fontSize: 10,
                  fontWeight: 600,
                  color: MARKER_COLORS[selectedPoint.type],
                  textTransform: 'uppercase',
                }}>
                  {selectedPoint.type === 'express' && 'Caby Express · Colis e-commerce'}
                  {selectedPoint.type === 'laundry' && 'Caby Laundry · Pressing'}
                  {selectedPoint.type === 'health' && 'Caby Health Logistix · Analyses labo'}
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* Status badge */}
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={toggleOnline}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg backdrop-blur-md border transition-all active:scale-95 ${
              isOnline
                ? 'bg-[hsl(var(--caby-green))]/90 border-[hsl(var(--caby-green))]/50 text-white'
                : 'bg-white/90 border-gray-200 text-gray-600'
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
            <span className="text-[10px] font-semibold text-green-700 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-green-300 shadow-sm">
              🟢 Zone active · 5 km
            </span>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-24 left-4 z-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-3 space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-700">
            <span className="w-3 h-3 rounded-full bg-orange-500" /> Caby Express
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-700">
            <span className="w-3 h-3 rounded-full bg-blue-500" /> Caby Laundry
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-700">
            <span className="w-3 h-3 rounded-full bg-red-500" /> Health Logistix
          </div>
        </div>

        {/* Recenter button */}
        {hasMoved && (
          <button
            onClick={handleRecenter}
            className="absolute bottom-24 right-4 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          >
            <Locate className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default DriverMapPage;
