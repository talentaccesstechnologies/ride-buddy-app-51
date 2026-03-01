import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, Circle, Marker, InfoWindow } from '@react-google-maps/api';
import { Wifi, WifiOff, Package, Locate, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { APP_CONFIG } from '@/config/app.config';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import DriverBottomNav from '@/components/tatfleet/DriverBottomNav';
import DriverDashboardSheet from '@/components/tatfleet/DriverDashboardSheet';

const RADAR_RADIUS_M = 5000;
const containerStyle: React.CSSProperties = { width: '100%', height: '100%' };

/* ── Partner points ── */
interface PartnerPoint {
  id: string; name: string; address: string; lat: number; lng: number;
  type: 'express' | 'laundry' | 'health'; emoji: string;
}

const PARTNER_POINTS: PartnerPoint[] = [
  { id: 'ex1', name: 'Caby Express — Cornavin', address: 'Pl. de Cornavin 7', lat: 46.2101, lng: 6.1427, type: 'express', emoji: '📦' },
  { id: 'ex2', name: 'Caby Express — Plainpalais', address: 'Bd Georges-Favon 24', lat: 46.2003, lng: 6.1420, type: 'express', emoji: '📦' },
  { id: 'ex3', name: 'Caby Express — Eaux-Vives', address: 'Rue de la Terrassière 12', lat: 46.2023, lng: 6.1610, type: 'express', emoji: '📦' },
  { id: 'la1', name: 'Caby Laundry — Carouge', address: 'Rue St-Joseph 10', lat: 46.1850, lng: 6.1396, type: 'laundry', emoji: '👕' },
  { id: 'la2', name: 'Caby Laundry — Servette', address: 'Rue de la Servette 45', lat: 46.2130, lng: 6.1310, type: 'laundry', emoji: '👕' },
  { id: 'he1', name: 'Caby Health — HUG', address: 'Rue Gabrielle-Perret-Gentil 4', lat: 46.1935, lng: 6.1490, type: 'health', emoji: '🏥' },
  { id: 'he2', name: 'Caby Health — Champel', address: 'Av. de Champel 25', lat: 46.1920, lng: 6.1560, type: 'health', emoji: '🏥' },
];

const MARKER_COLORS: Record<PartnerPoint['type'], string> = { express: '#F97316', laundry: '#3B82F6', health: '#EF4444' };

const createPartnerIcon = (type: PartnerPoint['type'], emoji: string): string => {
  const c = MARKER_COLORS[type];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50"><path d="M20 48 C20 48 2 30 2 18 C2 8 10 0 20 0 S38 8 38 18 C38 30 20 48 20 48Z" fill="${c}" stroke="white" stroke-width="2"/><text x="20" y="22" text-anchor="middle" font-size="16">${emoji}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const DRIVER_ICON_URL = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="rgba(59,130,246,0.2)" stroke="rgba(59,130,246,0.4)" stroke-width="1"/><circle cx="14" cy="14" r="8" fill="#3B82F6" stroke="white" stroke-width="3"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
})();

/* ── Page ── */
const DriverDashboardPage: React.FC = () => {
  const { isLoaded, loadError } = useGoogleMaps();
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(false);
  const [isColisMode, setIsColisMode] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [hasMoved, setHasMoved] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<PartnerPoint | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [todayEarnings] = useState(145);
  const [missionsCount] = useState(3);

  const mapRef = useRef<google.maps.Map | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Initial position
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => setPosition({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setPosition(APP_CONFIG.DEFAULT_CENTER),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // GPS tracking when online
  useEffect(() => {
    if (!isOnline) {
      if (watchIdRef.current !== null) { clearInterval(watchIdRef.current); watchIdRef.current = null; }
      return;
    }
    const update = () => {
      navigator.geolocation.getCurrentPosition(
        (p) => setPosition({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => {}, { enableHighAccuracy: true, timeout: 8000 }
      );
    };
    const id = window.setInterval(update, APP_CONFIG.GPS_UPDATE_INTERVAL_MS);
    watchIdRef.current = id;
    return () => { clearInterval(id); watchIdRef.current = null; };
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

  const toggleOnline = () => {
    const next = !isOnline;
    setIsOnline(next);
    toast[next ? 'success' : 'info'](next ? 'Radar activé' : 'Radar désactivé', {
      description: next ? 'Vous recevrez les courses à proximité' : undefined,
    });
  };

  const toggleColisMode = () => {
    const next = !isColisMode;
    setIsColisMode(next);
    toast.info(next ? 'Mode Colis activé 📦' : 'Mode Passagers activé 🚗');
  };

  /* ── Error / Loading ── */
  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-20 px-6 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-lg font-bold text-foreground mb-2">Erreur Google Maps</h2>
        <p className="text-sm text-muted-foreground">{loadError.message}</p>
        <DriverBottomNav />
      </div>
    );
  }

  if (!isLoaded || !position) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="text-2xl mb-3 animate-pulse">🗺️</div>
          <div className="text-muted-foreground text-sm">
            {!isLoaded ? 'Chargement de Google Maps…' : 'Localisation en cours…'}
          </div>
        </div>
        <DriverBottomNav />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col">
      <div className="flex-1 relative">
        {/* Full-screen map */}
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={position}
          zoom={14}
          onLoad={onMapLoad}
          onDragEnd={() => setHasMoved(true)}
          options={{
            disableDefaultUI: true,
            zoomControl: false,
            gestureHandling: 'greedy',
            styles: [
              { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a9a' }] },
              { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a3e' }] },
              { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#333348' }] },
              { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0e1a' }] },
              { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
              { featureType: 'transit', stylers: [{ visibility: 'off' }] },
            ],
          }}
        >
          {/* Driver dot */}
          <Marker
            position={position}
            icon={{ url: DRIVER_ICON_URL, scaledSize: new google.maps.Size(28, 28), anchor: new google.maps.Point(14, 14) }}
            zIndex={999}
          />

          {/* Radar circle */}
          {isOnline && (
            <Circle
              center={position}
              radius={RADAR_RADIUS_M}
              options={{
                fillColor: '#22C55E', fillOpacity: 0.06,
                strokeColor: '#22C55E', strokeOpacity: 0.3, strokeWeight: 2,
              }}
            />
          )}

          {/* Partner markers (visible in colis mode) */}
          {isColisMode && PARTNER_POINTS.map((pt) => (
            <Marker
              key={pt.id}
              position={{ lat: pt.lat, lng: pt.lng }}
              icon={{ url: createPartnerIcon(pt.type, pt.emoji), scaledSize: new google.maps.Size(36, 45), anchor: new google.maps.Point(18, 45) }}
              onClick={() => setSelectedPoint(pt)}
              zIndex={10}
            />
          ))}

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
                <div style={{ marginTop: 6, fontSize: 10, fontWeight: 600, color: MARKER_COLORS[selectedPoint.type], textTransform: 'uppercase' }}>
                  {selectedPoint.type === 'express' && 'Caby Express · Colis'}
                  {selectedPoint.type === 'laundry' && 'Caby Laundry · Pressing'}
                  {selectedPoint.type === 'health' && 'Health Logistix · Labo'}
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* ── Overlay: Online toggle ── */}
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20">
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

        {/* Zone badge */}
        {isOnline && (
          <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20">
            <span className="text-[10px] font-semibold text-[hsl(var(--caby-green))] bg-card/80 backdrop-blur-sm px-3 py-1 rounded-full border border-[hsl(var(--caby-green))]/30 shadow-sm">
              🟢 Zone active · 5 km
            </span>
          </div>
        )}

        {/* ── Overlay: Colis mode toggle ── */}
        <div className="absolute top-14 right-4 z-20">
          <button
            onClick={toggleColisMode}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full shadow-lg backdrop-blur-md border transition-all active:scale-95 ${
              isColisMode
                ? 'bg-primary/90 border-primary/50 text-primary-foreground'
                : 'bg-card/90 border-border text-muted-foreground'
            }`}
          >
            <Package className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">Colis</span>
          </button>
        </div>

        {/* Legend (colis mode) */}
        {isColisMode && (
          <div className="absolute top-28 right-4 z-20 bg-card/90 backdrop-blur-md rounded-2xl shadow-lg p-3 space-y-1.5 border border-border">
            <div className="flex items-center gap-2 text-[11px] font-medium text-foreground"><span className="w-3 h-3 rounded-full bg-orange-500" /> Express</div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-foreground"><span className="w-3 h-3 rounded-full bg-blue-500" /> Laundry</div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-foreground"><span className="w-3 h-3 rounded-full bg-red-500" /> Health</div>
          </div>
        )}

        {/* Recenter button */}
        {hasMoved && (
          <button
            onClick={handleRecenter}
            className="absolute bottom-[300px] right-4 z-20 w-12 h-12 rounded-full bg-card/90 backdrop-blur-md border border-border shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          >
            <Locate className="w-5 h-5 text-foreground" />
          </button>
        )}

        {/* ── Bottom Sheet ── */}
        <DriverDashboardSheet
          isOnline={isOnline}
          isColisMode={isColisMode}
          missionsCount={isOnline ? missionsCount : 0}
          todayEarnings={todayEarnings}
          dailyGoal={400}
          expanded={sheetExpanded}
          onToggleExpand={() => setSheetExpanded((v) => !v)}
          onViewMissions={() => navigate('/tatfleet/logistics')}
        />
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default DriverDashboardPage;
