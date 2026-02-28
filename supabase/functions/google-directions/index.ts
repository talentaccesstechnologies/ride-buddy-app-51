/**
 * CABY — Edge Function : google-directions
 * Proxy sécurisé vers Google Directions API
 * Calcule les itinéraires avec trafic temps réel
 *
 * POST /functions/v1/google-directions
 * Body: { origin: {lat, lng}, destination: {lat, lng}, mode?: 'driving' }
 *
 * Returns: { routes, eta_minutes, distance_km, traffic_condition, polyline }
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

interface DirectionsRequest {
  origin: LatLng;
  destination: LatLng;
  waypoints?: LatLng[];
  mode?: "driving" | "walking";
  avoid?: string[];
}

// Évalue la condition de trafic basée sur le ratio durée_trafic / durée_normale
function getTrafficCondition(
  durationInTraffic: number,
  durationNormal: number
): "fluide" | "ralenti" | "bloque" {
  const ratio = durationInTraffic / durationNormal;
  if (ratio < 1.2) return "fluide";
  if (ratio < 1.6) return "ralenti";
  return "bloque";
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Récupérer la clé API depuis les secrets
  const googleApiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!googleApiKey) {
    console.error("GOOGLE_MAPS_API_KEY not set in secrets");
    return new Response(
      JSON.stringify({ error: "Maps service not configured" }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let body: DirectionsRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Validation
  if (!body.origin || !body.destination) {
    return new Response(
      JSON.stringify({ error: "origin and destination are required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const originStr = `${body.origin.lat},${body.origin.lng}`;
    const destinationStr = `${body.destination.lat},${body.destination.lng}`;
    const mode = body.mode || "driving";

    // Construire les waypoints si présents
    const waypointsStr = body.waypoints
      ? `&waypoints=${body.waypoints.map((w) => `${w.lat},${w.lng}`).join("|")}`
      : "";

    // Construire les contraintes d'évitement
    const avoidStr =
      body.avoid && body.avoid.length > 0
        ? `&avoid=${body.avoid.join("|")}`
        : "";

    // departure_time=now active le calcul avec trafic temps réel
    // traffic_model=best_guess = meilleure estimation basée sur données historiques + temps réel
    const url =
      `https://maps.googleapis.com/maps/api/directions/json` +
      `?origin=${encodeURIComponent(originStr)}` +
      `&destination=${encodeURIComponent(destinationStr)}` +
      `&mode=${mode}` +
      `&departure_time=now` +
      `&traffic_model=best_guess` +
      `&language=fr` +
      `&region=ch` +
      `&units=metric` +
      waypointsStr +
      avoidStr +
      `&key=${googleApiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      console.error("Google Directions API error:", data.status, data.error_message);
      return new Response(
        JSON.stringify({
          error: "Route calculation failed",
          status: data.status,
          message: data.error_message || "No route found",
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    // Durée sans trafic (secondes)
    const durationNormal = leg.duration?.value || 0;
    // Durée avec trafic temps réel (secondes) — disponible uniquement avec departure_time
    const durationInTraffic = leg.duration_in_traffic?.value || durationNormal;

    const etaMinutes = Math.ceil(durationInTraffic / 60);
    const distanceKm = parseFloat((leg.distance.value / 1000).toFixed(1));
    const trafficCondition = getTrafficCondition(durationInTraffic, durationNormal);

    // Résumé des étapes pour affichage dans l'app
    const steps = leg.steps.map((step: any) => ({
      instruction: step.html_instructions.replace(/<[^>]*>/g, ""), // strip HTML
      distance: step.distance.text,
      duration: step.duration.text,
      maneuver: step.maneuver || null,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        eta_minutes: etaMinutes,
        eta_with_traffic_seconds: durationInTraffic,
        eta_without_traffic_seconds: durationNormal,
        distance_km: distanceKm,
        distance_text: leg.distance.text,
        traffic_condition: trafficCondition,
        polyline: route.overview_polyline.points,
        bounds: route.bounds,
        start_address: leg.start_address,
        end_address: leg.end_address,
        steps,
        raw_legs: route.legs,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Unexpected error in google-directions:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});