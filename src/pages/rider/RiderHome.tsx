import React, { useMemo } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { generateNearbyDrivers } from '@/lib/simulatedDrivers';
import MapPlaceholder from '@/components/maps/MapPlaceholder';
import BottomSheet from '@/components/rider/BottomSheet';
import RiderHeader from '@/components/rider/RiderHeader';
import BottomNav from '@/components/rider/BottomNav';

const RiderHome: React.FC = () => {
  const { latitude, longitude, loading } = useGeolocation();

  // Generate simulated nearby drivers
  const nearbyDrivers = useMemo(() => {
    if (latitude && longitude) {
      return generateNearbyDrivers(latitude, longitude, 5);
    }
    return [];
  }, [latitude, longitude]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Localisation en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Transparent header */}
      <RiderHeader transparent notificationCount={2} />

      {/* Map */}
      <div className="absolute inset-0">
        <MapPlaceholder
          latitude={latitude || 48.8566}
          longitude={longitude || 2.3522}
          nearbyDrivers={nearbyDrivers}
        />
      </div>

      {/* Bottom Sheet */}
      <BottomSheet />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default RiderHome;
