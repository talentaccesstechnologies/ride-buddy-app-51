/**
 * CABY — Edge Function : google-places
 * Proxy sécurisé vers Google Places API
 * Autocomplete d'adresses biaisé sur Genève (CH)
 *
 * GET  /functions/v1/google-places?q=Rue+du+Rhône&type=autocomplete
 * GET  /functions/v1/google-places?place_id=ChIJ...&type=details
 *
 * Returns autocomplete: { predictions: [{place_id, description, main_text, secondary_text}] }
 * Returns details:      { place: {place_id, name, address, lat, lng} }
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Biais géographique centré sur Genève
const GENEVA_LOCATION = "46.2044,6.1432";
const GENEVA_RADIUS = 50000; // 50km — couvre arc lémanique + aéroport

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
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

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "autocomplete";

  try {
    // ─────────────────────────────────────────────
    // MODE 1 : Autocomplete — suggestions en live
    // ─────────────────────────────────────────────
    if (type === "autocomplete") {
      const query = url.searchParams.get("q");
      if (!query || query.length < 2) {
        return new Response(
          JSON.stringify({ predictions: [] }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const sessionToken = url.searchParams.get("session") || "";

      const placesUrl =
        `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
        `?input=${encodeURIComponent(query)}` +
        `&language=fr` +
        `&region=ch` +
        `&location=${GENEVA_LOCATION}` +
        `&radius=${GENEVA_RADIUS}` +
        `&strictbounds=false` +
        `&types=geocode|establishment` +
        (sessionToken ? `&sessiontoken=${encodeURIComponent(sessionToken)}` : "") +
        `&key=${googleApiKey}`;

      const response = await fetch(placesUrl);
      const data = await response.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.error("Places Autocomplete error:", data.status);
        return new Response(
          JSON.stringify({ predictions: [], error: data.status }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const predictions = (data.predictions || []).map((p: any) => ({
        place_id: p.place_id,
        description: p.description,
        main_text: p.structured_formatting?.main_text || p.description,
        secondary_text: p.structured_formatting?.secondary_text || "",
        types: p.types || [],
        distance_meters: p.distance_meters || null,
      }));

      return new Response(
        JSON.stringify({ predictions }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─────────────────────────────────────────────
    // MODE 2 : Place Details — lat/lng d'un place_id
    // ─────────────────────────────────────────────
    if (type === "details") {
      const placeId = url.searchParams.get("place_id");
      if (!placeId) {
        return new Response(
          JSON.stringify({ error: "place_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const sessionToken = url.searchParams.get("session") || "";

      const detailsUrl =
        `https://maps.googleapis.com/maps/api/place/details/json` +
        `?place_id=${encodeURIComponent(placeId)}` +
        `&fields=place_id,name,formatted_address,geometry,types` +
        `&language=fr` +
        (sessionToken ? `&sessiontoken=${encodeURIComponent(sessionToken)}` : "") +
        `&key=${googleApiKey}`;

      const response = await fetch(detailsUrl);
      const data = await response.json();

      if (data.status !== "OK") {
        console.error("Place Details error:", data.status);
        return new Response(
          JSON.stringify({ error: "Place not found", status: data.status }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = data.result;

      return new Response(
        JSON.stringify({
          place: {
            place_id: result.place_id,
            name: result.name,
            address: result.formatted_address,
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
            types: result.types || [],
            viewport: result.geometry.viewport || null,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─────────────────────────────────────────────
    // MODE 3 : Nearby Search — lieux proches d'un point
    // ─────────────────────────────────────────────
    if (type === "nearby") {
      const lat = url.searchParams.get("lat");
      const lng = url.searchParams.get("lng");
      const placeType = url.searchParams.get("place_type") || "airport";
      const radius = url.searchParams.get("radius") || "5000";

      if (!lat || !lng) {
        return new Response(
          JSON.stringify({ error: "lat and lng are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const nearbyUrl =
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
        `?location=${lat},${lng}` +
        `&radius=${radius}` +
        `&type=${placeType}` +
        `&language=fr` +
        `&key=${googleApiKey}`;

      const response = await fetch(nearbyUrl);
      const data = await response.json();

      const places = (data.results || []).slice(0, 5).map((p: any) => ({
        place_id: p.place_id,
        name: p.name,
        address: p.vicinity,
        lat: p.geometry.location.lat,
        lng: p.geometry.location.lng,
        rating: p.rating || null,
        types: p.types || [],
      }));

      return new Response(
        JSON.stringify({ places }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid type. Use: autocomplete | details | nearby" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error in google-places:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});