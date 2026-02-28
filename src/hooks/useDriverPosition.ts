/**
 * CABY — useDriverPosition Hook
 * Côté CHAUFFEUR uniquement.
 *
 * 1. Capture la position GPS du téléphone (1/sec, haute précision)
 * 2. Recale sur la route via Google Roads API (snap-to-road)
 * 3. Broadcast la position corrigée vers Supabase Realtime
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { snapPositionToRoad, type LatLng } from "@/services/googleMaps.service";

interface DriverPosition {
  lat: number;
  lng: number;
  heading: number;
  speed: number | null;
  accuracy: number;
  timestamp: number;
}

interface UseDriverPositionReturn {
  position: DriverPosition | null;
  isTracking: boolean;
  error: string | null;
  startTracking: () => void;
  stopTracking: () => void;
}

const BROADCAST_CHANNEL_PREFIX = "driver-location";
const HISTORY_SIZE = 4;
const SNAP_INTERVAL_MS = 2000;

export function useDriverPosition(rideId: string | null): UseDriverPositionReturn {
  const [position, setPosition] = useState<DriverPosition | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const positionHistoryRef = useRef<LatLng[]>([]);
  const lastSnapTimeRef = useRef<number>(0);
  const lastRawHeadingRef = useRef<number>(0);

  const broadcastPosition = useCallback(
    (pos: DriverPosition) => {
      if (!channelRef.current || !rideId) return;

      channelRef.current.send({
        type: "broadcast",
        event: "driver_position",
        payload: {
          lat: pos.lat,
          lng: pos.lng,
          heading: pos.heading,
          speed: pos.speed,
          accuracy: pos.accuracy,
          timestamp: pos.timestamp,
          ride_id: rideId,
        },
      });
    },
    [rideId]
  );

  const handleGeoPosition = useCallback(
    async (geoPos: GeolocationPosition) => {
      const rawLat = geoPos.coords.latitude;
      const rawLng = geoPos.coords.longitude;
      const rawSpeed = geoPos.coords.speed
        ? Math.round(geoPos.coords.speed * 3.6)
        : null;
      const accuracy = Math.round(geoPos.coords.accuracy);
      const now = Date.now();

      positionHistoryRef.current.push({ lat: rawLat, lng: rawLng });
      if (positionHistoryRef.current.length > HISTORY_SIZE) {
        positionHistoryRef.current.shift();
      }

      let finalLat = rawLat;
      let finalLng = rawLng;
      let finalHeading = lastRawHeadingRef.current;

      if (geoPos.coords.heading !== null && !isNaN(geoPos.coords.heading)) {
        finalHeading = Math.round(geoPos.coords.heading);
        lastRawHeadingRef.current = finalHeading;
      }

      if (
        now - lastSnapTimeRef.current >= SNAP_INTERVAL_MS &&
        positionHistoryRef.current.length >= 2
      ) {
        lastSnapTimeRef.current = now;

        try {
          const snapped = await snapPositionToRoad(
            positionHistoryRef.current,
            false
          );
          finalLat = snapped.lat;
          finalLng = snapped.lng;
          if (snapped.heading !== undefined) {
            finalHeading = snapped.heading;
            lastRawHeadingRef.current = finalHeading;
          }
        } catch (snapError) {
          console.warn("Snap-to-road failed, using raw GPS:", snapError);
        }
      }

      const newPosition: DriverPosition = {
        lat: finalLat,
        lng: finalLng,
        heading: finalHeading,
        speed: rawSpeed,
        accuracy,
        timestamp: now,
      };

      setPosition(newPosition);
      broadcastPosition(newPosition);
    },
    [broadcastPosition]
  );

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Géolocalisation non supportée sur cet appareil");
      return;
    }

    if (!rideId) {
      setError("rideId requis pour le tracking");
      return;
    }

    setError(null);

    const channelName = `${BROADCAST_CHANNEL_PREFIX}-${rideId}`;
    channelRef.current = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });
    channelRef.current.subscribe();

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleGeoPosition,
      (geoError) => {
        console.error("Geolocation error:", geoError);
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setError("Accès à la localisation refusé. Activez-le dans les paramètres.");
            break;
          case geoError.POSITION_UNAVAILABLE:
            setError("Position GPS indisponible");
            break;
          case geoError.TIMEOUT:
            setError("Timeout GPS — vérifiez votre signal");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );

    setIsTracking(true);
  }, [rideId, handleGeoPosition]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    positionHistoryRef.current = [];
    setIsTracking(false);
    setPosition(null);
  }, []);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  useEffect(() => {
    if (isTracking) {
      stopTracking();
      if (rideId) startTracking();
    }
  }, [rideId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { position, isTracking, error, startTracking, stopTracking };
}