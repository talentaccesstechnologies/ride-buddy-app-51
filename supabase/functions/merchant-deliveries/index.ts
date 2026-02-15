import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Authenticate merchant via x-api-key header
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing x-api-key header" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { data: merchant, error: merchantError } = await supabase
    .from("merchants")
    .select("id, name, is_active")
    .eq("api_key", apiKey)
    .single();

  if (merchantError || !merchant || !merchant.is_active) {
    return new Response(
      JSON.stringify({ error: "Invalid or inactive API key" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    if (req.method === "POST") {
      const body = await req.json();

      // Validate required fields
      const required = [
        "pickup_address", "pickup_lat", "pickup_lng",
        "dropoff_address", "dropoff_lat", "dropoff_lng",
        "rider_id",
      ];
      for (const field of required) {
        if (body[field] === undefined || body[field] === null) {
          return new Response(
            JSON.stringify({ error: `Missing required field: ${field}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Generate a 4-digit PIN
      const pin = String(Math.floor(1000 + Math.random() * 9000));

      const { data: delivery, error: insertError } = await supabase
        .from("deliveries")
        .insert({
          rider_id: body.rider_id,
          pickup_address: body.pickup_address,
          pickup_lat: body.pickup_lat,
          pickup_lng: body.pickup_lng,
          dropoff_address: body.dropoff_address,
          dropoff_lat: body.dropoff_lat,
          dropoff_lng: body.dropoff_lng,
          package_description: body.package_description || null,
          package_size: body.package_size || "medium",
          pin_code: pin,
          is_scheduled: !!body.scheduled_slot_start,
          scheduled_slot_start: body.scheduled_slot_start || null,
          scheduled_slot_end: body.scheduled_slot_end || null,
          allow_door_drop: body.allow_door_drop || false,
          merchant_id: merchant.id,
          merchant_order_ref: body.order_ref || null,
          estimated_price: body.estimated_price || null,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to create delivery", details: insertError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, delivery }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "GET") {
      const url = new URL(req.url);
      const status = url.searchParams.get("status");
      const limit = parseInt(url.searchParams.get("limit") || "50");

      let query = supabase
        .from("deliveries")
        .select("*")
        .eq("merchant_id", merchant.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch deliveries", details: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ deliveries: data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
