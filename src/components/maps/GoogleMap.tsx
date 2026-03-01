import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { GoogleMap as GoogleMapComponent, Marker, Circle } from '@react-google-maps/api';
import { Navigation, Plus, ShieldAlert, Construction, X } from 'lucide-react';
import { SimulatedDriver } from '@/types';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { MapAlert } from '@/types/map.types';

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  nearbyDrivers?: SimulatedDriver[];
  showRoute?: boolean;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  alerts?: MapAlert[];
  onReportAlert?: (type: 'police' | 'construction', lat: number, lng: number) => void;
  showAlertFAB?: boolean;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Waze-inspired map style: vivid cartoon-like colors
const wazeMapStyles: google.maps.MapTypeStyle[] = [
  // Background
  { featureType: 'landscape', elementType: 'geometry.fill', stylers: [{ color: '#f0ede6' }] },
  { featureType: 'landscape.natural', elementType: 'geometry.fill', stylers: [{ color: '#e8e4da' }] },
  // Water in light blue
  { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#a3d4f7' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#5b8fb9' }] },
  // Parks in green
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#b8e6a3' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#4a8c34' }] },
  // Main roads in yellow with shadow effect
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#ffd54f' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#c6a030' }, { weight: 2 }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#6b5b10' }] },
  // Arterial roads in lighter yellow
  { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ color: '#ffe082' }] },
  { featureType: 'road.arterial', elementType: 'geometry.stroke', stylers: [{ color: '#d4b84a' }, { weight: 1.5 }] },
  // Secondary roads in white
  { featureType: 'road.local', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.local', elementType: 'geometry.stroke', stylers: [{ color: '#d0ccc0' }, { weight: 1 }] },
  // Hide most POIs for cleaner look
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
  // Transit
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  // Buildings with slight shadow
  { featureType: 'landscape.man_made', elementType: 'geometry.fill', stylers: [{ color: '#e4dfd6' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: '#d0c8b8' }, { weight: 0.5 }] },
  // Administrative borders
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c0b8a8' }, { weight: 1 }] },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#6b6358' }] },
];

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: wazeMapStyles,
};

// Geneva demand hotspots (simulated heatmap data)
const demandHotspots = [
  { lat: 46.2044, lng: 6.1432, intensity: 'high' as const, label: 'Cornavin' },
  { lat: 46.2100, lng: 6.1426, intensity: 'high' as const, label: 'Gare CFF' },
  { lat: 46.2381, lng: 6.1089, intensity: 'high' as const, label: 'Aéroport GVA' },
  { lat: 46.1983, lng: 6.1421, intensity: 'medium' as const, label: 'Plainpalais' },
  { lat: 46.2017, lng: 6.1568, intensity: 'medium' as const, label: 'Eaux-Vives' },
  { lat: 46.2186, lng: 6.1837, intensity: 'medium' as const, label: 'Cologny' },
  { lat: 46.1900, lng: 6.1300, intensity: 'low' as const, label: 'Carouge' },
  { lat: 46.2250, lng: 6.1250, intensity: 'low' as const, label: 'Vernier' },
];

// Geneva POIs
const poiData = [
  { lat: 46.2065, lng: 6.1355, type: 'gas' as const, label: 'Station Migrol' },
  { lat: 46.2150, lng: 6.1200, type: 'gas' as const, label: 'Station Avia' },
  { lat: 46.1920, lng: 6.1450, type: 'charging' as const, label: 'Borne Tesla' },
  { lat: 46.2300, lng: 6.1150, type: 'charging' as const, label: 'Borne Move' },
  { lat: 46.2050, lng: 6.1600, type: 'rest' as const, label: 'Zone repos Quai' },
  { lat: 46.1980, lng: 6.1250, type: 'rest' as const, label: 'Parking Carouge' },
];

const heatmapColors = {
  high: { fill: '#EF4444', opacity: 0.25, stroke: '#DC2626', radius: 600 },
  medium: { fill: '#F97316', opacity: 0.18, stroke: '#EA580C', radius: 450 },
  low: { fill: '#FBBF24', opacity: 0.12, stroke: '#D97706', radius: 350 },
};

const poiIcons: Record<string, string> = {
  gas: '⛽',
  charging: '🔌',
  rest: '☕',
};

const alertIcons: Record<string, string> = {
  police: '👮',
  construction: '🚧',
};

const GoogleMapView: React.FC<GoogleMapProps> = ({
  latitude,
  longitude,
  nearbyDrivers = [],
  showRoute = false,
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  alerts = [],
  onReportAlert,
  showAlertFAB = false,
}) => {
  const { isLoaded, loadError } = useGoogleMaps();

  const [showAlertMenu, setShowAlertMenu] = useState(false);

  const center = useMemo(() => ({
    lat: latitude,
    lng: longitude,
  }), [latitude, longitude]);

  const mapRef = React.useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleRecenter = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.panTo(center);
      mapRef.current.setZoom(14);
    }
  }, [center]);

  const handleReportAlert = useCallback((type: 'police' | 'construction') => {
    if (onReportAlert) {
      onReportAlert(type, latitude, longitude);
    }
    setShowAlertMenu(false);
  }, [onReportAlert, latitude, longitude]);

  if (loadError) {
    return (
      <div className="relative w-full h-full bg-muted flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Erreur de chargement de la carte</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative w-full h-full bg-muted flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMapComponent
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        options={mapOptions}
        onLoad={onLoad}
      >
        {/* Demand heatmap circles */}
        {demandHotspots.map((spot, i) => {
          const config = heatmapColors[spot.intensity];
          return (
            <Circle
              key={`heat-${i}`}
              center={{ lat: spot.lat, lng: spot.lng }}
              radius={config.radius}
              options={{
                fillColor: config.fill,
                fillOpacity: config.opacity,
                strokeColor: config.stroke,
                strokeOpacity: 0.3,
                strokeWeight: 1,
              }}
            />
          );
        })}

        {/* Current location marker */}
        <Marker
          position={center}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3,
          }}
        />

        {/* Nearby drivers as blue car icons */}
        {nearbyDrivers.map((driver) => (
          <Marker
            key={driver.id}
            position={{ lat: driver.position.lat, lng: driver.position.lng }}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="#3B82F6" opacity="0.15"/>
                  <text x="50%" y="52%" dominant-baseline="central" text-anchor="middle" font-size="20">🚙</text>
                </svg>`
              ),
              scaledSize: new google.maps.Size(36, 36),
              anchor: new google.maps.Point(18, 18),
            }}
          />
        ))}

        {/* POI markers */}
        {poiData.map((poi, i) => (
          <Marker
            key={`poi-${i}`}
            position={{ lat: poi.lat, lng: poi.lng }}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
                  <circle cx="14" cy="14" r="12" fill="white" stroke="#d0ccc0" stroke-width="1"/>
                  <text x="50%" y="52%" dominant-baseline="central" text-anchor="middle" font-size="14">${poiIcons[poi.type]}</text>
                </svg>`
              ),
              scaledSize: new google.maps.Size(28, 28),
              anchor: new google.maps.Point(14, 14),
            }}
            title={poi.label}
          />
        ))}

        {/* Alert markers (Waze-style) */}
        {alerts.map((alert) => (
          <Marker
            key={alert.id}
            position={{ lat: alert.lat, lng: alert.lng }}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="18" fill="${alert.alert_type === 'police' ? '#3B82F6' : '#F97316'}" stroke="white" stroke-width="2"/>
                  <text x="50%" y="52%" dominant-baseline="central" text-anchor="middle" font-size="18">${alertIcons[alert.alert_type]}</text>
                </svg>`
              ),
              scaledSize: new google.maps.Size(40, 40),
              anchor: new google.maps.Point(20, 20),
            }}
          />
        ))}

        {/* Pickup marker */}
        {pickupLat && pickupLng && (
          <Marker
            position={{ lat: pickupLat, lng: pickupLng }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#22C55E',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 3,
            }}
          />
        )}

        {/* Dropoff marker */}
        {dropoffLat && dropoffLng && (
          <Marker
            position={{ lat: dropoffLat, lng: dropoffLng }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#EF4444',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 3,
            }}
          />
        )}
      </GoogleMapComponent>

      {/* Alert FAB */}
      {showAlertFAB && (
        <div className="absolute bottom-20 right-4 flex flex-col items-end gap-2">
          {showAlertMenu && (
            <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-3 shadow-xl border border-border animate-scale-in space-y-2 min-w-[180px]">
              <button
                onClick={() => handleReportAlert('police')}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-left"
              >
                <span className="text-xl">👮</span>
                <span className="text-sm font-medium text-foreground">Contrôle Police</span>
              </button>
              <button
                onClick={() => handleReportAlert('construction')}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-left"
              >
                <span className="text-xl">🚧</span>
                <span className="text-sm font-medium text-foreground">Travaux</span>
              </button>
            </div>
          )}
          <button
            onClick={() => setShowAlertMenu(!showAlertMenu)}
            className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
              showAlertMenu 
                ? 'bg-destructive text-destructive-foreground rotate-45' 
                : 'btn-gold'
            }`}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Recenter button */}
      <button
        onClick={handleRecenter}
        className="absolute bottom-4 right-4 w-12 h-12 bg-background rounded-full shadow-lg flex items-center justify-center hover:bg-secondary transition-colors"
      >
        <Navigation className="w-5 h-5 text-accent" />
      </button>

      {/* Demand legend */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md">
        <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Demande</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <span className="text-[10px] text-muted-foreground">Forte</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
            <span className="text-[10px] text-muted-foreground">Moyenne</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
            <span className="text-[10px] text-muted-foreground">Faible</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapView;
