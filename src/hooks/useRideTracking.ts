import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  calculateRoute,
  decodePolyline,
  type LatLng,
  type RouteResult,
} from '@/services/googleMaps.service';

interface RideTrackingState {
  driverPosition: LatLng | null;
  driverHeading: number;
  driverSpeed: number;
  etaMinutes: number | null;
  routePolyline: LatLng[];
  trafficCondition: 'smooth' | 'moderate' | 'heavy';
  isConnected: boolean;
  lastUpdate: number | null;
}

const ETA_REFRESH_INTERVAL = 30_000; // 30 seconds

/**
 * Hook for rider-side: subscribes to driver position broadcast and recalculates ETA
 */
export function useRideTracking(rideId: string | null, destination: LatLng | null) {
  const [state, setState] = useState<RideTrackingState>({
    driverPosition: null,
    driverHeading: 0,
    driverSpeed: 0,
    etaMinutes: null,
    routePolyline: [],
    trafficCondition: 'smooth',
    isConnected: false,
    lastUpdate: null,
  });

  const etaTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const driverPosRef = useRef<LatLng | null>(null);

  const refreshETA = useCallback(async () => {
    if (!driverPosRef.current || !destination) return;
    try {
      const route = await calculateRoute(driverPosRef.current, destination);
      const etaSeconds = route.durationInTraffic.value;
      const etaMinutes = Math.ceil(etaSeconds / 60);

      // Determine traffic condition
      const ratio = route.durationInTraffic.value / route.duration.value;
      let trafficCondition: 'smooth' | 'moderate' | 'heavy' = 'smooth';
      if (ratio > 1.5) trafficCondition = 'heavy';
      else if (ratio > 1.15) trafficCondition = 'moderate';

      const polyline = decodePolyline(route.polyline);

      setState((s) => ({
        ...s,
        etaMinutes,
        routePolyline: polyline,
        trafficCondition,
      }));
    } catch (err) {
      console.warn('ETA refresh failed:', err);
    }
  }, [destination]);

  useEffect(() => {
    if (!rideId) return;

    const channel = supabase
      .channel(`driver-location-${rideId}`)
      .on('broadcast', { event: 'position' }, (msg) => {
        const { lat, lng, heading, speed, timestamp } = msg.payload;
        const pos = { lat, lng };
        driverPosRef.current = pos;

        setState((s) => ({
          ...s,
          driverPosition: pos,
          driverHeading: heading,
          driverSpeed: speed,
          isConnected: true,
          lastUpdate: timestamp,
        }));
      })
      .subscribe();

    // Refresh ETA every 30 seconds
    refreshETA();
    etaTimerRef.current = setInterval(refreshETA, ETA_REFRESH_INTERVAL);

    return () => {
      channel.unsubscribe();
      if (etaTimerRef.current) clearInterval(etaTimerRef.current);
    };
  }, [rideId, refreshETA]);

  return state;
}
