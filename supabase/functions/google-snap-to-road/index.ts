/**
 * CABY — Edge Function : google-snap-to-road
 * Proxy sécurisé vers Google Roads API
 * Recale les positions GPS brutes sur la route exacte
 * et retourne le heading (direction) précis
 *
 * POST /functions/v1/google-snap-to-road
 * Body: { positions: [{lat, lng}], interpolate?: boolean }
 *
 * Returns: { snapped_points: [{lat, lng, heading, original_index}] }
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface LatLng {
  lat: number;
  lng: number;
}

interface SnapRequest {
  positions: LatLng[];
  interpolate?: boolean;
}

interface SnappedPoint {
  lat: number;
  lng: number;
  heading: number;
  original_index: number | null;
  place_id: string | null;
}

// Calcule le heading (angle en degrés) entre deux points GPS
function calculateHeading(from: LatLng, to: LatLng): number {
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  const heading = (Math.atan2(y, x) * 180) / Math.PI;
  return (heading + 360) % 360;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const googleApiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!googleApiKey) {
    return new Response(
      JSON.stringify({ error: "Maps service not configured" }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let body: SnapRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!body.positions || body.positions.length === 0) {
    return new Response(
      JSON.stringify({ error: "positions array is required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (body.positions.length > 100) {
    return new Response(
      JSON.stringify({ error: "Maximum 100 positions per request" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const pathStr = body.positions
      .map((p) => `${p.lat},${p.lng}`)
      .join("|");

    const interpolate = body.interpolate === true ? "true" : "false";

    const url =
      `https://roads.googleapis.com/v1/snapToRoads` +
      `?path=${encodeURIComponent(pathStr)}` +
      `&interpolate=${interpolate}` +
      `&key=${googleApiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("Google Roads API error:", data.error);
      
      // Fallback gracieux : retourner les positions originales avec heading calculé
      const fallbackPoints: SnappedPoint[] = body.positions.map((p, i) => ({
        lat: p.lat,
        lng: p.lng,
        heading:
          i < body.positions.length - 1
            ? calculateHeading(p, body.positions[i + 1])
            : i > 0
            ? calculateHeading(body.positions[i - 1], p)
            : 0,
        original_index: i,
        place_id: null,
      }));

      return new Response(
        JSON.stringify({
          success: true,
          snapped_points: fallbackPoints,
          fallback: true,
          warning: "Used raw GPS positions (Roads API unavailable)",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const snappedLocations = data.snappedPoints || [];

    const snappedPoints: SnappedPoint[] = snappedLocations.map(
      (point: any, index: number) => {
        const current: LatLng = {
          lat: point.location.latitude,
          lng: point.location.longitude,
        };

        let heading = 0;
        if (index < snappedLocations.length - 1) {
          const next: LatLng = {
            lat: snappedLocations[index + 1].location.latitude,
            lng: snappedLocations[index + 1].location.longitude,
          };
          heading = calculateHeading(current, next);
        } else if (index > 0) {
          const prev: LatLng = {
            lat: snappedLocations[index - 1].location.latitude,
            lng: snappedLocations[index - 1].location.longitude,
          };
          heading = calculateHeading(prev, current);
        }

        return {
          lat: point.location.latitude,
          lng: point.location.longitude,
          heading: Math.round(heading),
          original_index: point.originalIndex ?? null,
          place_id: point.placeId ?? null,
        };
      }
    );

    const currentPosition =
      snappedPoints.length > 0
        ? snappedPoints[snappedPoints.length - 1]
        : null;

    return new Response(
      JSON.stringify({
        success: true,
        snapped_points: snappedPoints,
        current_position: currentPosition,
        fallback: false,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Unexpected error in google-snap-to-road:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});