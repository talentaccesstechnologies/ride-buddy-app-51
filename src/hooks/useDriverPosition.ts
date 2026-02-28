import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { nearestRoad, calculateHeading, type LatLng } from '@/services/googleMaps.service';

interface DriverPositionState {
  position: LatLng | null;
  heading: number;
  speed: number;
  error: string | null;
  isTracking: boolean;
}

/**
 * Hook for driver-side: watches GPS, snaps to road, broadcasts position via Supabase Realtime
 */
export function useDriverPosition(rideId: string | null) {
  const [state, setState] = useState<DriverPositionState>({
    position: null,
    heading: 0,
    speed: 0,
    error: null,
    isTracking: false,
  });

  const lastPositionRef = useRef<LatLng | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const broadcastPosition = useCallback(
    async (lat: number, lng: number, heading: number, speed: number) => {
      if (!rideId || !channelRef.current) return;
      await channelRef.current.send({
        type: 'broadcast',
        event: 'position',
        payload: { lat, lng, heading, speed, timestamp: Date.now() },
      });
    },
    [rideId]
  );

  useEffect(() => {
    if (!rideId) return;

    // Setup channel
    const channel = supabase.channel(`driver-location-${rideId}`);
    channel.subscribe();
    channelRef.current = channel;

    // Start GPS watch
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation not supported' }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const rawPosition: LatLng = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        // Try snap-to-road, fallback to raw
        let snapped = rawPosition;
        try {
          const result = await nearestRoad(rawPosition);
          if (result) snapped = { lat: result.lat, lng: result.lng };
        } catch {
          // Use raw position on error
        }

        // Calculate heading from last position
        let heading = state.heading;
        if (lastPositionRef.current) {
          heading = calculateHeading(lastPositionRef.current, snapped);
        }

        const speed = pos.coords.speed ?? 0;
        lastPositionRef.current = snapped;

        setState({
          position: snapped,
          heading,
          speed,
          error: null,
          isTracking: true,
        });

        broadcastPosition(snapped.lat, snapped.lng, heading, speed);
      },
      (err) => {
        setState((s) => ({ ...s, error: err.message }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000,
      }
    );

    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      channel.unsubscribe();
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rideId]);

  return state;
}
