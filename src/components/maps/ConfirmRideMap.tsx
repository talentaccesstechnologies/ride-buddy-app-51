import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { LatLng, decodePolyline } from '@/services/googleMaps.service';

interface ConfirmRideMapProps {
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  polyline?: string;
}

const containerStyle = { width: '100%', height: '100%' };

const ConfirmRideMap: React.FC<ConfirmRideMapProps> = ({
  pickupLat, pickupLng, dropoffLat, dropoffLng, polyline,
}) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const mapRef = useRef<google.maps.Map | null>(null);

  const pickupPos = useMemo(() => ({ lat: pickupLat, lng: pickupLng }), [pickupLat, pickupLng]);
  const dropoffPos = useMemo(() => ({ lat: dropoffLat, lng: dropoffLng }), [dropoffLat, dropoffLng]);

  const routePath = useMemo<LatLng[]>(() => {
    if (polyline) return decodePolyline(polyline);
    return [pickupPos, dropoffPos];
  }, [polyline, pickupPos, dropoffPos]);

  const onLoad = useCallback((map: google.maps.Map) => { mapRef.current = map; }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(pickupPos);
    bounds.extend(dropoffPos);
    mapRef.current.fitBounds(bounds, { top: 60, bottom: 80, left: 40, right: 40 });
  }, [pickupPos, dropoffPos]);

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

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={pickupPos}
      zoom={13}
      options={{
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      }}
      onLoad={onLoad}
    >
      <Marker
        position={pickupPos}
        icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#22C55E', fillOpacity: 1, strokeColor: '#FFFFFF', strokeWeight: 3 }}
        title="Départ"
      />
      <Marker
        position={dropoffPos}
        icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#EF4444', fillOpacity: 1, strokeColor: '#FFFFFF', strokeWeight: 3 }}
        title="Destination"
      />
      <Polyline
        path={routePath}
        options={{ strokeColor: '#3B82F6', strokeOpacity: 0.9, strokeWeight: 5, geodesic: true }}
      />
    </GoogleMap>
  );
};

export default ConfirmRideMap;
