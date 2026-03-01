import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, Circle, Marker, InfoWindow } from '@react-google-maps/api';
import { Wifi, WifiOff, Package, Locate, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { APP_CONFIG } from '@/config/app.config';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { useDriverMode } from '@/hooks/useDriverMode';
import DriverBottomNav from '@/components/tatfleet/DriverBottomNav';
import DriverDashboardSheet from '@/components/tatfleet/DriverDashboardSheet';
import IncomingRideOverlay, { type IncomingRide } from '@/components/tatfleet/IncomingRideOverlay';
import ActiveRidePanel from '@/components/tatfleet/ActiveRidePanel';
import ModeSwitchSuggestion from '@/components/tatfleet/ModeSwitchSuggestion';
import QueueToleranceOverlay from '@/components/tatfleet/QueueToleranceOverlay';

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

const createDriverCarIcon = (heading: number = 0): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000" flood-opacity="0.35"/>
      </filter>
      <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#D4B45C"/>
        <stop offset="50%" stop-color="#C9A84C"/>
        <stop offset="100%" stop-color="#A8893A"/>
      </linearGradient>
      <linearGradient id="windshield" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a1a2e"/>
        <stop offset="100%" stop-color="#2d2d44"/>
      </linearGradient>
    </defs>
    <g transform="rotate(${heading}, 24, 24)" filter="url(#shadow)">
      <!-- Body -->
      <rect x="14" y="6" width="20" height="36" rx="8" ry="8" fill="url(#carBody)" stroke="#B8993F" stroke-width="0.8"/>
      <!-- Roof / cabin -->
      <rect x="16.5" y="16" width="15" height="14" rx="4" ry="4" fill="url(#windshield)" opacity="0.9"/>
      <!-- Front windshield -->
      <rect x="17.5" y="12" width="13" height="6" rx="3" ry="2" fill="url(#windshield)" opacity="0.85"/>
      <!-- Rear window -->
      <rect x="17.5" y="30" width="13" height="5" rx="3" ry="2" fill="url(#windshield)" opacity="0.75"/>
      <!-- Headlights -->
      <rect x="16" y="7" width="5" height="2.5" rx="1" fill="#FFF8DC" opacity="0.95"/>
      <rect x="27" y="7" width="5" height="2.5" rx="1" fill="#FFF8DC" opacity="0.95"/>
      <!-- Tail lights -->
      <rect x="16" y="38.5" width="5" height="2" rx="1" fill="#E74C3C" opacity="0.85"/>
      <rect x="27" y="38.5" width="5" height="2" rx="1" fill="#E74C3C" opacity="0.85"/>
      <!-- Side mirrors -->
      <ellipse cx="12.5" cy="18" rx="2" ry="1.2" fill="#C9A84C" stroke="#B8993F" stroke-width="0.4"/>
      <ellipse cx="35.5" cy="18" rx="2" ry="1.2" fill="#C9A84C" stroke="#B8993F" stroke-width="0.4"/>
      <!-- Center line accent -->
      <line x1="24" y1="8" x2="24" y2="11" stroke="#B8993F" stroke-width="0.6" opacity="0.5"/>
    </g>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

/* ── Demo incoming ride — Gare des Eaux-Vives → Dardagny ── */
const DEMO_RIDE: IncomingRide = {
  id: 'sim-1',
  clientName: 'Sophie Müller',
  clientPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  pickupAddress: 'Gare des Eaux-Vives, Genève',
  pickupLat: 46.1985,
  pickupLng: 6.1615,
  dropoffAddress: 'Chemin du Rail 5, La Plaine, Dardagny',
  dropoffLat: 46.1780,
  dropoffLng: 6.0053,
  distanceFromDriver: 0.8,
  estimatedPrice: 52,
  serviceType: 'standard',
  estimatedDuration: 25,
  estimatedDistance: 18.6,
};

/* ── Page ── */
const DriverDashboardPage: React.FC = () => {
  const { isLoaded, loadError } = useGoogleMaps();
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(false);
  const driverMode = useDriverMode(isOnline);
  const isColisMode = driverMode.mode === 'colis';
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [driverHeading, setDriverHeading] = useState(0);
  const [mapZoom, setMapZoom] = useState(14);
  const prevPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const [hasMoved, setHasMoved] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<PartnerPoint | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [todayEarnings, setTodayEarnings] = useState(145);
  const [missionsCount] = useState(3);
  const [incomingRide, setIncomingRide] = useState<IncomingRide | null>(null);
  const [activeRide, setActiveRide] = useState<IncomingRide | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const simTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        (p) => {
          const newPos = { lat: p.coords.latitude, lng: p.coords.longitude };
          if (prevPositionRef.current) {
            const dLat = newPos.lat - prevPositionRef.current.lat;
            const dLng = newPos.lng - prevPositionRef.current.lng;
            if (Math.abs(dLat) > 0.00001 || Math.abs(dLng) > 0.00001) {
              const angle = (Math.atan2(dLng, dLat) * 180) / Math.PI;
              setDriverHeading(angle < 0 ? angle + 360 : angle);
            }
          }
          prevPositionRef.current = newPos;
          setPosition(newPos);
        },
        () => {}, { enableHighAccuracy: true, timeout: 8000 }
      );
    };
    const id = window.setInterval(update, APP_CONFIG.GPS_UPDATE_INTERVAL_MS);
    watchIdRef.current = id;
    return () => { clearInterval(id); watchIdRef.current = null; };
  }, [isOnline]);

  // Simulate incoming ride 5s after going online (only in ride mode, no active ride)
  useEffect(() => {
    if (isOnline && !incomingRide && !activeRide && driverMode.mode === 'ride') {
      simTimerRef.current = setTimeout(() => {
        setIncomingRide(DEMO_RIDE);
      }, 5000);
    }
    return () => { if (simTimerRef.current) clearTimeout(simTimerRef.current); };
  }, [isOnline, incomingRide, activeRide, driverMode.mode]);

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
    if (!next) setIncomingRide(null);
    toast[next ? 'success' : 'info'](next ? 'Radar activé' : 'Radar désactivé', {
      description: next ? 'Vous recevrez les courses à proximité' : undefined,
    });
  };

  const toggleColisMode = () => {
    driverMode.toggleMode();
    if (driverMode.mode === 'colis') setSelectedPoint(null); // will become ride after toggle
  };

  const handleAcceptRide = useCallback((id: string) => {
    if (incomingRide) setActiveRide(incomingRide);
    setIncomingRide(null);
    toast.success('Course acceptée !', { description: 'Navigation vers le client…' });
  }, [incomingRide]);

  const handleRideArrived = useCallback(() => {
    toast.success('Client notifié de votre arrivée');
  }, []);

  const handleRideComplete = useCallback((price: number) => {
    setActiveRide(null);
    setTodayEarnings((prev) => prev + price);
    toast.success('Gains mis à jour !');
    // Check for mode switch suggestion after completing a ride
    setTimeout(() => driverMode.checkModeSuggestion(), 3000);
  }, [driverMode]);

  const triggerSimulation = useCallback(() => {
    if (!isOnline) {
      setIsOnline(true);
      toast.success('Radar activé');
    }
    setIncomingRide(DEMO_RIDE);
  }, [isOnline]);

  const handleRefuseRide = useCallback((id: string) => {
    setIncomingRide(null);
    toast.info('Course refusée');
  }, []);

  const handleExpireRide = useCallback((id: string) => {
    setIncomingRide(null);
    toast.info('Temps écoulé — course transmise au chauffeur suivant');
  }, []);

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
        {/* Full-screen map — standard light style */}
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={position}
          zoom={14}
          onLoad={onMapLoad}
          onDragEnd={() => setHasMoved(true)}
          onZoomChanged={() => { if (mapRef.current) setMapZoom(mapRef.current.getZoom() || 14); }}
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
          {/* Driver car icon — size adapts to zoom */}
          {(() => {
            const size = mapZoom >= 18 ? 64 : mapZoom >= 16 ? 56 : mapZoom >= 14 ? 48 : mapZoom >= 12 ? 40 : 32;
            return (
              <Marker
                position={position}
                icon={{ url: createDriverCarIcon(driverHeading), scaledSize: new google.maps.Size(size, size), anchor: new google.maps.Point(size / 2, size / 2) }}
                zIndex={999}
              />
            );
          })()}

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

          {/* Partner markers — only in colis mode */}
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

        {/* Zone badge */}
        {isOnline && (
          <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20">
            <span className="text-[10px] font-semibold text-green-700 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-green-300 shadow-sm">
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
                ? 'bg-[hsl(var(--caby-gold))] border-[hsl(var(--caby-gold))]/50 text-black'
                : 'bg-card/90 border-border text-muted-foreground'
            }`}
          >
            {isColisMode ? <Package className="w-4 h-4" /> : <Car className="w-4 h-4" />}
            <span className="text-xs font-bold">{isColisMode ? 'Colis' : 'Ride'}</span>
          </button>
        </div>

        {/* Legend — only in colis mode */}
        {isColisMode && (
          <div className="absolute top-28 right-4 z-20 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-3 space-y-1.5 border border-gray-200">
            <div className="flex items-center gap-2 text-[11px] font-medium text-gray-700"><span className="w-3 h-3 rounded-full bg-orange-500" /> Express</div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-gray-700"><span className="w-3 h-3 rounded-full bg-blue-500" /> Laundry</div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-gray-700"><span className="w-3 h-3 rounded-full bg-red-500" /> Health</div>
          </div>
        )}

        {/* Recenter button */}
        {hasMoved && (
          <button
            onClick={handleRecenter}
            className="absolute bottom-[300px] right-4 z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          >
            <Locate className="w-5 h-5 text-gray-700" />
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

        {/* Hidden simulation button — triple tap bottom-left corner */}
        {!activeRide && !incomingRide && (
          <button
            onClick={triggerSimulation}
            className="absolute bottom-20 left-4 z-30 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border text-[10px] font-mono text-muted-foreground active:scale-95 transition-transform"
          >
            🧪 Simuler course
          </button>
        )}
      </div>

      <DriverBottomNav />

      {/* ── Incoming ride overlay ── */}
      <AnimatePresence>
        {incomingRide && (
          <IncomingRideOverlay
            ride={incomingRide}
            onAccept={handleAcceptRide}
            onRefuse={handleRefuseRide}
            onExpire={handleExpireRide}
          />
        )}
      </AnimatePresence>

      {/* ── Active ride panel ── */}
      {activeRide && position && (
        <ActiveRidePanel
          ride={activeRide}
          driverPosition={position}
          driverMode={driverMode.mode}
          simulate
          onArrived={handleRideArrived}
          onComplete={handleRideComplete}
          onCancel={() => { setActiveRide(null); toast.info('Course annulée'); }}
          onSimulatedPositionChange={(pos) => setPosition(pos)}
          onAcceptNextMission={(mission) => {
            driverMode.acceptQueuedMission(mission);
            toast.success('Mission suivante réservée !');
          }}
        />
      )}

      {/* ── Queue tolerance overlay ── */}
      <AnimatePresence>
        {driverMode.toleranceState && (
          <QueueToleranceOverlay
            state={driverMode.toleranceState}
            mission={driverMode.queuedMission}
            onConfirm={driverMode.confirmQueuedMission}
            onDismiss={driverMode.clearQueuedMission}
          />
        )}
      </AnimatePresence>

      {/* ── Mode switch suggestion ── */}
      <AnimatePresence>
        {driverMode.modeSuggestion && !activeRide && !incomingRide && (
          <ModeSwitchSuggestion
            targetMode={driverMode.modeSuggestion.targetMode}
            message={driverMode.modeSuggestion.message}
            detail={driverMode.modeSuggestion.detail}
            onAccept={driverMode.acceptSuggestion}
            onDismiss={driverMode.dismissSuggestion}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DriverDashboardPage;
