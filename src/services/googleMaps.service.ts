/**
 * CABY — Google Maps Service
 * Appelle les Edge Functions Supabase (jamais l'API Google directement)
 * La clé API Google ne quitte jamais le serveur.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteResult {
  eta_minutes: number;
  distance_km: number;
  distance_text: string;
  traffic_condition: "fluide" | "ralenti" | "bloque";
  polyline: string;
  bounds: {
    northeast: LatLng;
    southwest: LatLng;
  };
  steps: {
    instruction: string;
    distance: string;
    duration: string;
    maneuver: string | null;
  }[];
}

export interface SnappedPosition {
  lat: number;
  lng: number;
  heading: number;
  original_index: number | null;
}

export interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
  types: string[];
  distance_meters: number | null;
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  types: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function generateSessionToken(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function getTrafficColor(condition: "fluide" | "ralenti" | "bloque"): string {
  switch (condition) {
    case "fluide":  return "#34C759";
    case "ralenti": return "#FF9500";
    case "bloque":  return "#FF3B30";
  }
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export async function calculateRoute(
  origin: LatLng,
  destination: LatLng,
  options?: {
    waypoints?: LatLng[];
    avoid?: ("tolls" | "highways" | "ferries")[];
  }
): Promise<RouteResult> {
  const { data, error } = await supabase.functions.invoke("google-directions", {
    body: {
      origin,
      destination,
      waypoints: options?.waypoints,
      avoid: options?.avoid,
      mode: "driving",
    },
  });

  if (error) throw new Error(`Route calculation failed: ${error.message}`);
  if (!data.success) throw new Error(data.message || "No route found");

  return data as RouteResult;
}

export async function snapPositionToRoad(
  positions: LatLng[],
  interpolate = false
): Promise<SnappedPosition> {
  const { data, error } = await supabase.functions.invoke("google-snap-to-road", {
    body: { positions, interpolate },
  });

  if (error) throw new Error(`Snap to road failed: ${error.message}`);

  if (data.current_position) return data.current_position as SnappedPosition;

  const points = data.snapped_points as SnappedPosition[];
  if (points && points.length > 0) return points[points.length - 1];

  throw new Error("No snapped position returned");
}

export async function searchPlaces(
  query: string,
  sessionToken?: string
): Promise<PlacePrediction[]> {
  if (query.length < 2) return [];

  const { data, error } = await supabase.functions.invoke("google-places", {
    body: { type: "autocomplete", q: query, session: sessionToken },
  });

  if (error) throw new Error(`Places search failed: ${error.message}`);

  return data.predictions as PlacePrediction[];
}

export async function getPlaceDetails(
  placeId: string,
  sessionToken?: string
): Promise<PlaceDetails> {
  const { data, error } = await supabase.functions.invoke("google-places", {
    body: { type: "details", place_id: placeId, session: sessionToken },
  });

  if (error) throw new Error(`Place details failed: ${error.message}`);
  if (!data.place) throw new Error("Place not found");

  return data.place as PlaceDetails;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ lat: lat * 1e-5, lng: lng * 1e-5 });
  }

  return points;
}