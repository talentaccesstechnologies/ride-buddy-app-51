import { supabase } from '@/integrations/supabase/client';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteResult {
  polyline: string;
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  durationInTraffic: { text: string; value: number };
  steps: RouteStep[];
  startAddress: string;
  endAddress: string;
}

export interface RouteStep {
  polyline: string;
  duration: number;
  durationInTraffic: number;
  distance: number;
}

export interface SnappedPosition {
  lat: number;
  lng: number;
  placeId?: string;
  originalIndex?: number;
}

async function callProxy<T>(action: string, params: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
    body: { action, params },
  });
  if (error) throw new Error(`Google Maps proxy error: ${error.message}`);
  if (data?.error) throw new Error(data.error);
  return data as T;
}

/**
 * Calculate route with real-time traffic ETA
 */
export async function calculateRoute(
  origin: LatLng,
  destination: LatLng,
  avoidTolls = false
): Promise<RouteResult> {
  return callProxy<RouteResult>('directions', { origin, destination, avoidTolls });
}

/**
 * Snap GPS positions to nearest road
 */
export async function snapToRoad(positions: LatLng[]): Promise<SnappedPosition[]> {
  const result = await callProxy<{ snappedPositions: SnappedPosition[] }>('snapToRoad', { positions });
  return result.snappedPositions;
}

/**
 * Snap a single position to nearest road
 */
export async function nearestRoad(position: LatLng): Promise<SnappedPosition | null> {
  const result = await callProxy<{ snappedPosition: SnappedPosition | null }>('nearestRoad', { position });
  return result.snappedPosition;
}

/**
 * Decode Google encoded polyline into coordinates
 */
export function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let shift = 0, result = 0, byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

/**
 * Calculate heading between two points in degrees
 */
export function calculateHeading(from: LatLng, to: LatLng): number {
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const fromLat = (from.lat * Math.PI) / 180;
  const toLat = (to.lat * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(toLat);
  const x = Math.cos(fromLat) * Math.sin(toLat) - Math.sin(fromLat) * Math.cos(toLat) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}
