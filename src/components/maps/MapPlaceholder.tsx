import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { SimulatedDriver } from '@/types';
import { MapAlert } from '@/types/map.types';
import { APP_CONFIG } from '@/config/app.config';
import GoogleMapView from './GoogleMap';

interface MapPlaceholderProps {
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

const MapPlaceholder: React.FC<MapPlaceholderProps> = (props) => {
  // If Google Maps API key is available, use real map
  if (APP_CONFIG.GOOGLE_MAPS_API_KEY) {
    return <GoogleMapView {...props} />;
  }

  // Fallback: simulated map with Waze-like colors
  const { latitude, longitude, nearbyDrivers = [], showRoute = false, alerts = [] } = props;

  return (
    <div className="relative w-full h-full bg-[#f0ede6] overflow-hidden">
      {/* Simulated Waze-style map grid */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d0ccc0" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Simulated streets - Waze colors */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 right-0 h-6 bg-[#ffd54f]/60 transform -rotate-12 shadow-sm" />
        <div className="absolute top-1/2 left-0 right-0 h-8 bg-[#ffd54f]/70 shadow-sm" />
        <div className="absolute top-3/4 left-0 right-0 h-4 bg-white/70 transform rotate-6" />
        <div className="absolute left-1/4 top-0 bottom-0 w-6 bg-[#ffe082]/60 transform rotate-3" />
        <div className="absolute left-1/2 top-0 bottom-0 w-8 bg-[#ffd54f]/70 shadow-sm" />
        <div className="absolute left-3/4 top-0 bottom-0 w-4 bg-white/70 transform -rotate-6" />
      </div>

      {/* Simulated heatmap zones */}
      <div className="absolute top-[20%] left-[30%] w-24 h-24 rounded-full bg-[#EF4444]/20 blur-xl" />
      <div className="absolute top-[40%] right-[20%] w-20 h-20 rounded-full bg-[#F97316]/15 blur-xl" />
      <div className="absolute bottom-[30%] left-[15%] w-16 h-16 rounded-full bg-[#FBBF24]/12 blur-xl" />

      {/* POI icons */}
      <div className="absolute top-[25%] right-[25%] text-lg">⛽</div>
      <div className="absolute bottom-[40%] left-[20%] text-lg">🔌</div>
      <div className="absolute top-[60%] right-[35%] text-lg">☕</div>

      {/* Nearby drivers */}
      {nearbyDrivers.map((driver, index) => (
        <div
          key={driver.id}
          className="absolute"
          style={{
            left: `${30 + (index * 15) % 50}%`,
            top: `${20 + (index * 20) % 40}%`,
          }}
        >
          <div className="text-xl">🚙</div>
        </div>
      ))}

      {/* Alert markers */}
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="absolute"
          style={{
            left: `${40 + Math.random() * 20}%`,
            top: `${30 + Math.random() * 30}%`,
          }}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
            alert.alert_type === 'police' ? 'bg-[#3B82F6]' : 'bg-[#F97316]'
          } shadow-md border-2 border-white`}>
            {alert.alert_type === 'police' ? '👮' : '🚧'}
          </div>
        </div>
      ))}

      {/* Current location marker */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="absolute -inset-4 bg-[#4285F4]/30 rounded-full pulse-ring" />
          <div className="absolute -inset-2 bg-[#4285F4]/50 rounded-full" />
          <div className="w-4 h-4 bg-[#4285F4] rounded-full border-2 border-white shadow-lg" />
        </div>
      </div>

      {/* Route visualization */}
      {showRoute && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d="M 50% 50% Q 60% 30%, 75% 25%"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeDasharray="8 4"
            fill="none"
          />
        </svg>
      )}

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

      {/* Coordinates display */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
        <p className="text-xs text-muted-foreground">
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </p>
      </div>

      {/* Recenter button */}
      <button className="absolute bottom-4 right-4 w-12 h-12 bg-background rounded-full shadow-lg flex items-center justify-center hover:bg-secondary transition-colors">
        <Navigation className="w-5 h-5 text-accent" />
      </button>
    </div>
  );
};

export default MapPlaceholder;
