import React, { useMemo } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { generateNearbyDrivers } from '@/lib/simulatedDrivers';
import { useMapAlerts } from '@/hooks/useMapAlerts';
import MapPlaceholder from '@/components/maps/MapPlaceholder';
import BottomSheet from '@/components/rider/BottomSheet';
import BottomNav from '@/components/rider/BottomNav';

const RiderHome: React.FC = () => {
  const { latitude, longitude, loading } = useGeolocation();
  const { alerts, reportAlert } = useMapAlerts();

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
          <p className="text-muted-foreground text-sm">Localisation en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden bg-background">
      {/* Map */}
      <div className="absolute inset-0">
        <MapPlaceholder
          latitude={latitude || 46.2044}
          longitude={longitude || 6.1432}
          nearbyDrivers={nearbyDrivers}
          alerts={alerts}
          onReportAlert={reportAlert}
          showAlertFAB={true}
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
