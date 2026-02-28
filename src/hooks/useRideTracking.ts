/**
 * CABY — useRideTracking Hook
 * Côté CLIENT/PASSAGER uniquement.
 *
 * 1. Subscribe au channel Supabase Realtime du chauffeur
 * 2. Reçoit les positions en temps réel (1/sec)
 * 3. Recalcule l'ETA via Google Directions API toutes les 30 sec
 * 4. Expose tout ce dont LiveTrackingMap a besoin
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  calculateRoute,
  decodePolyline,
  type LatLng,
  type RouteResult,
} from "@/services/googleMaps.service";

interface RideTrackingState {
  driverLat: number | null;
  driverLng: number | null;
  driverHeading: number;
  driverSpeed: number | null;
  etaMinutes: number | null;
  routePoints: LatLng[];
  trafficCondition: "fluide" | "ralenti" | "bloque" | null;
  distanceKm: number | null;
  isConnected: boolean;
  lastUpdateAt: Date | null;
  error: string | null;
}

interface UseRideTrackingOptions {
  rideId: string;
  destination: LatLng;
  onDriverArrived?: () => void;
  onConnectionLost?: () => void;
}

const ETA_REFRESH_INTERVAL_MS = 30_000;
const ARRIVAL_THRESHOLD_METERS = 150;
const BROADCAST_CHANNEL_PREFIX = "driver-location";

function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const c =
    2 *
    Math.atan2(
      Math.sqrt(
        sinLat * sinLat +
          Math.cos((a.lat * Math.PI) / 180) *
            Math.cos((b.lat * Math.PI) / 180) *
            sinLng * sinLng
      ),
      Math.sqrt(
        1 -
          (sinLat * sinLat +
            Math.cos((a.lat * Math.PI) / 180) *
              Math.cos((b.lat * Math.PI) / 180) *
              sinLng * sinLng)
      )
    );
  return R * c;
}

export function useRideTracking({
  rideId,
  destination,
  onDriverArrived,
  onConnectionLost,
}: UseRideTrackingOptions): RideTrackingState {
  const [state, setState] = useState<RideTrackingState>({
    driverLat: null,
    driverLng: null,
    driverHeading: 0,
    driverSpeed: null,
    etaMinutes: null,
    routePoints: [],
    trafficCondition: null,
    distanceKm: null,
    isConnected: false,
    lastUpdateAt: null,
    error: null,
  });

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const etaTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const driverPositionRef = useRef<LatLng | null>(null);
  const arrivedRef = useRef(false);
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshETA = useCallback(async () => {
    const pos = driverPositionRef.current;
    if (!pos) return;

    try {
      const route: RouteResult = await calculateRoute(pos, destination);
      const points = decodePolyline(route.polyline);

      setState((prev) => ({
        ...prev,
        etaMinutes: route.eta_minutes,
        routePoints: points,
        trafficCondition: route.traffic_condition,
        distanceKm: route.distance_km,
      }));
    } catch (err) {
      console.warn("ETA refresh failed:", err);
    }
  }, [destination]);

  const handleDriverPosition = useCallback(
    (payload: any) => {
      const { lat, lng, heading, speed } = payload;

      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      connectionTimeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, isConnected: false }));
        onConnectionLost?.();
      }, 10_000);

      const newPos: LatLng = { lat, lng };
      driverPositionRef.current = newPos;

      setState((prev) => ({
        ...prev,
        driverLat: lat,
        driverLng: lng,
        driverHeading: heading ?? prev.driverHeading,
        driverSpeed: speed ?? null,
        isConnected: true,
        lastUpdateAt: new Date(),
        error: null,
      }));

      if (!arrivedRef.current) {
        const dist = distanceMeters(newPos, destination);
        if (dist < ARRIVAL_THRESHOLD_METERS) {
          arrivedRef.current = true;
          onDriverArrived?.();
        }
      }
    },
    [destination, onDriverArrived, onConnectionLost]
  );

  useEffect(() => {
    if (!rideId) return;

    arrivedRef.current = false;

    const channelName = `${BROADCAST_CHANNEL_PREFIX}-${rideId}`;
    channelRef.current = supabase
      .channel(channelName)
      .on("broadcast", { event: "driver_position" }, ({ payload }) => {
        handleDriverPosition(payload);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setState((prev) => ({ ...prev, isConnected: true, error: null }));
        } else if (status === "CHANNEL_ERROR") {
          setState((prev) => ({
            ...prev,
            isConnected: false,
            error: "Connexion au tracking perdue",
          }));
        }
      });

    etaTimerRef.current = setInterval(refreshETA, ETA_REFRESH_INTERVAL_MS);

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (etaTimerRef.current) {
        clearInterval(etaTimerRef.current);
        etaTimerRef.current = null;
      }
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, [rideId, handleDriverPosition, refreshETA]);

  return state;
}