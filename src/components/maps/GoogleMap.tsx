import React, { useCallback, useMemo } from 'react';
import { GoogleMap as GoogleMapComponent, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Navigation } from 'lucide-react';
import { SimulatedDriver } from '@/types';
import { APP_CONFIG } from '@/config/app.config';

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  nearbyDrivers?: SimulatedDriver[];
  showRoute?: boolean;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
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
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: APP_CONFIG.GOOGLE_MAPS_API_KEY,
  });

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
      mapRef.current.setZoom(APP_CONFIG.DEFAULT_ZOOM);
    }
  }, [center]);

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
        zoom={APP_CONFIG.DEFAULT_ZOOM}
        options={mapOptions}
        onLoad={onLoad}
      >
        {/* Current location marker */}
        <Marker
          position={center}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3,
          }}
        />

        {/* Nearby drivers */}
        {nearbyDrivers.map((driver) => (
          <Marker
            key={driver.id}
            position={{ lat: driver.position.lat, lng: driver.position.lng }}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="24">🚗</text></svg>'
              ),
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 16),
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

      {/* Recenter button */}
      <button
        onClick={handleRecenter}
        className="absolute bottom-4 right-4 w-12 h-12 bg-background rounded-full shadow-lg flex items-center justify-center hover:bg-secondary transition-colors"
      >
        <Navigation className="w-5 h-5 text-accent" />
      </button>
    </div>
  );
};

export default GoogleMapView;
