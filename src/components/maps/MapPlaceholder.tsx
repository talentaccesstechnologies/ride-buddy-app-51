import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { SimulatedDriver } from '@/types';
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
}

const MapPlaceholder: React.FC<MapPlaceholderProps> = (props) => {
  // If Google Maps API key is available, use real map
  if (APP_CONFIG.GOOGLE_MAPS_API_KEY) {
    return <GoogleMapView {...props} />;
  }

  // Fallback: simulated map
  const { latitude, longitude, nearbyDrivers = [], showRoute = false } = props;

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-secondary to-muted overflow-hidden">
      {/* Simulated map grid */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Simulated streets */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 right-0 h-6 bg-muted-foreground/10 transform -rotate-12" />
        <div className="absolute top-1/2 left-0 right-0 h-8 bg-muted-foreground/10" />
        <div className="absolute top-3/4 left-0 right-0 h-4 bg-muted-foreground/10 transform rotate-6" />
        <div className="absolute left-1/4 top-0 bottom-0 w-6 bg-muted-foreground/10 transform rotate-3" />
        <div className="absolute left-1/2 top-0 bottom-0 w-8 bg-muted-foreground/10" />
        <div className="absolute left-3/4 top-0 bottom-0 w-4 bg-muted-foreground/10 transform -rotate-6" />
      </div>

      {/* Nearby drivers */}
      {nearbyDrivers.map((driver, index) => (
        <div
          key={driver.id}
          className="absolute car-marker"
          style={{
            left: `${30 + (index * 15) % 50}%`,
            top: `${20 + (index * 20) % 40}%`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        >
          <div className="text-2xl">🚗</div>
        </div>
      ))}

      {/* Current location marker */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="absolute -inset-4 bg-accent/30 rounded-full pulse-ring" />
          <div className="absolute -inset-2 bg-accent/50 rounded-full" />
          <div className="w-4 h-4 bg-accent rounded-full border-2 border-white shadow-lg" />
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
