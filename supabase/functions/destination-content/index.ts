import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { city, country } = await req.json();
    if (!city) {
      return new Response(JSON.stringify({ error: "city is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Tu es un rédacteur de contenu touristique pour Caby Van, un service de transport en van partagé au départ de Genève (Suisse).

Génère du contenu pour la destination "${city}" (${country || ""}). Réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas de backticks).

Le JSON doit avoir cette structure exacte:
{
  "heroTitle": "Titre accrocheur court pour ${city} (max 6 mots)",
  "heroSubtitle": "Sous-titre court (max 10 mots)",
  "whyGo": {
    "title": "Pourquoi aller à ${city}",
    "paragraphs": ["paragraphe 1 (3-4 phrases max)", "paragraphe 2 (3-4 phrases max)"]
  },
  "thingsToDo": [
    {"emoji": "🏛️", "title": "Nom activité", "description": "Description courte 1 phrase"},
    {"emoji": "🍽️", "title": "Nom activité", "description": "Description courte 1 phrase"},
    {"emoji": "🎭", "title": "Nom activité", "description": "Description courte 1 phrase"},
    {"emoji": "🌳", "title": "Nom activité", "description": "Description courte 1 phrase"},
    {"emoji": "📸", "title": "Nom activité", "description": "Description courte 1 phrase"},
    {"emoji": "🛍️", "title": "Nom activité", "description": "Description courte 1 phrase"}
  ],
  "bestSeason": "Meilleure saison pour visiter (1 phrase)",
  "travelTip": "Un conseil pratique pour les voyageurs (1 phrase)"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Tu es un expert tourisme suisse. Réponds UNIQUEMENT en JSON valide, sans markdown." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans un moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Clean up markdown if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("destination-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
