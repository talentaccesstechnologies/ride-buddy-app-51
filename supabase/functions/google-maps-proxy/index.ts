import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (!GOOGLE_MAPS_API_KEY) {
    return new Response(JSON.stringify({ error: 'GOOGLE_MAPS_API_KEY not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { action, params } = await req.json();

    if (action === 'directions') {
      const { origin, destination, mode = 'driving', avoidTolls = false } = params;
      const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
      url.searchParams.set('origin', `${origin.lat},${origin.lng}`);
      url.searchParams.set('destination', `${destination.lat},${destination.lng}`);
      url.searchParams.set('mode', mode);
      url.searchParams.set('departure_time', 'now');
      url.searchParams.set('traffic_model', 'best_guess');
      url.searchParams.set('alternatives', 'false');
      url.searchParams.set('avoid', avoidTolls ? 'tolls|ferries' : 'ferries');
      url.searchParams.set('key', GOOGLE_MAPS_API_KEY);

      const resp = await fetch(url.toString());
      const data = await resp.json();

      if (data.status !== 'OK') {
        return new Response(JSON.stringify({ error: `Directions API: ${data.status}`, details: data.error_message }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const route = data.routes[0];
      const leg = route.legs[0];

      // Extract traffic speed info per step for polyline coloring
      const steps = leg.steps.map((step: any) => ({
        polyline: step.polyline.points,
        duration: step.duration.value,
        durationInTraffic: step.duration_in_traffic?.value || step.duration.value,
        distance: step.distance.value,
      }));

      return new Response(JSON.stringify({
        polyline: route.overview_polyline.points,
        distance: leg.distance,
        duration: leg.duration,
        durationInTraffic: leg.duration_in_traffic || leg.duration,
        steps,
        startAddress: leg.start_address,
        endAddress: leg.end_address,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'snapToRoad') {
      const { positions } = params; // Array of { lat, lng }
      const path = positions.map((p: any) => `${p.lat},${p.lng}`).join('|');
      const url = `https://roads.googleapis.com/v1/snapToRoads?path=${path}&interpolate=false&key=${GOOGLE_MAPS_API_KEY}`;

      const resp = await fetch(url);
      const data = await resp.json();

      if (data.error) {
        return new Response(JSON.stringify({ error: `Roads API: ${data.error.message}` }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const snapped = (data.snappedPoints || []).map((p: any) => ({
        lat: p.location.latitude,
        lng: p.location.longitude,
        placeId: p.placeId,
        originalIndex: p.originalIndex,
      }));

      return new Response(JSON.stringify({ snappedPositions: snapped }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'nearestRoad') {
      const { position } = params;
      const url = `https://roads.googleapis.com/v1/nearestRoads?points=${position.lat},${position.lng}&key=${GOOGLE_MAPS_API_KEY}`;

      const resp = await fetch(url);
      const data = await resp.json();

      if (data.error) {
        return new Response(JSON.stringify({ error: `Roads API: ${data.error.message}` }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const nearest = data.snappedPoints?.[0];
      return new Response(JSON.stringify({
        snappedPosition: nearest ? {
          lat: nearest.location.latitude,
          lng: nearest.location.longitude,
          placeId: nearest.placeId,
        } : null,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
