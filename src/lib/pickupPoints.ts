// ============================================
// CABY VAN — Predefined Pickup/Dropoff Points
// ============================================

export interface PickupPoint {
  label: string;
  address: string;
  isCustom?: boolean;
  isAirport?: boolean;
}

export const PICKUP_POINTS: Record<string, PickupPoint[]> = {
  "Genève": [
    { label: "✈️ Aéroport GVA — Hall Arrivées", address: "Route de l'Aéroport, 1215 Genève", isAirport: true },
    { label: "🚉 Gare Cornavin", address: "Place Cornavin 1, 1201 Genève" },
    { label: "🏨 Hôtel Beau-Rivage", address: "Quai du Mont-Blanc 13, 1201 Genève" },
    { label: "🏨 Four Seasons des Bergues", address: "Quai des Bergues 33, 1201 Genève" },
    { label: "🏛️ Place du Rhône (centre)", address: "Place du Rhône, 1204 Genève" },
    { label: "📍 Adresse personnalisée", address: "", isCustom: true },
  ],
  "Zurich": [
    { label: "✈️ Aéroport ZRH — Terminal 1", address: "Flughafen Zürich, 8058 Zürich", isAirport: true },
    { label: "🚉 Gare Centrale HB", address: "Bahnhofplatz 15, 8001 Zürich" },
    { label: "🏨 Baur au Lac", address: "Talstrasse 1, 8001 Zürich" },
    { label: "📍 Adresse personnalisée", address: "", isCustom: true },
  ],
  "Lausanne": [
    { label: "🚉 Gare de Lausanne", address: "Place de la Gare, 1003 Lausanne" },
    { label: "🏛️ Lausanne-Flon", address: "Place de l'Europe, 1003 Lausanne" },
    { label: "🏨 Beau-Rivage Palace", address: "Chemin de Beau-Rivage 17, 1006 Lausanne" },
    { label: "📍 Adresse personnalisée", address: "", isCustom: true },
  ],
  "Annecy": [
    { label: "🚉 Gare d'Annecy", address: "Place de la Gare, 74000 Annecy" },
    { label: "🏛️ Centre-ville Annecy", address: "Rue Carnot, 74000 Annecy" },
    { label: "📍 Adresse personnalisée", address: "", isCustom: true },
  ],
  "Lyon": [
    { label: "✈️ Aéroport Lyon Saint-Exupéry", address: "Aéroport Lyon Saint-Exupéry, 69125 Colombier-Saugnieu", isAirport: true },
    { label: "🚉 Gare Part-Dieu", address: "Place Charles Béraudier, 69003 Lyon" },
    { label: "🚉 Gare Perrache", address: "Cours de Verdun, 69002 Lyon" },
    { label: "📍 Adresse personnalisée", address: "", isCustom: true },
  ],
  "Berne": [
    { label: "🚉 Gare de Berne", address: "Bahnhofplatz 10a, 3011 Bern" },
    { label: "🏛️ Place Fédérale", address: "Bundesplatz, 3003 Bern" },
    { label: "📍 Adresse personnalisée", address: "", isCustom: true },
  ],
  "Bâle": [
    { label: "✈️ EuroAirport BSL", address: "Flughafen Basel-Mulhouse, 4030 Basel", isAirport: true },
    { label: "🚉 Gare CFF Basel", address: "Centralbahnplatz, 4051 Basel" },
    { label: "📍 Adresse personnalisée", address: "", isCustom: true },
  ],
  "Montreux": [
    { label: "🚉 Gare de Montreux", address: "Avenue des Alpes 45, 1820 Montreux" },
    { label: "🏨 Fairmont Le Montreux Palace", address: "Avenue Claude Nobs 2, 1820 Montreux" },
    { label: "📍 Adresse personnalisée", address: "", isCustom: true },
  ],
  "Sion": [
    { label: "🚉 Gare de Sion", address: "Place de la Gare, 1950 Sion" },
    { label: "📍 Adresse personnalisée", address: "", isCustom: true },
  ],
  "Verbier": [
    { label: "🚡 Télécabine Médran", address: "Place de Médran, 1936 Verbier" },
    { label: "🏨 W Verbier", address: "Rue de Médran 70, 1936 Verbier" },
    { label: "📍 Adresse personnalisée", address: "", isCustom: true },
  ],
  "Chamonix": [
    { label: "🚉 Gare de Chamonix", address: "Place de la Gare, 74400 Chamonix" },
    { label: "🚡 Aiguille du Midi", address: "100 Place de l'Aiguille du Midi, 74400 Chamonix" },
    { label: "📍 Adresse personnalisée", address: "", isCustom: true },
  ],
  "Milan": [
    { label: "✈️ Aéroport Malpensa MXP", address: "Aeroporto di Milano-Malpensa, 21010 Ferno", isAirport: true },
    { label: "🚉 Milano Centrale", address: "Piazza Duca d'Aosta 1, 20124 Milano" },
    { label: "📍 Adresse personnalisée", address: "", isCustom: true },
  ],
};

/** Get pickup points for a city, with fallback */
export function getPickupPoints(city: string): PickupPoint[] {
  return PICKUP_POINTS[city] || [
    { label: `🚉 Gare de ${city}`, address: `Gare de ${city}` },
    { label: "📍 Adresse personnalisée", address: "", isCustom: true },
  ];
}

/** Check if any selected point is an airport */
export function hasAirportSelected(pickupLabel: string, dropoffLabel: string): boolean {
  return pickupLabel.includes("✈️") || dropoffLabel.includes("✈️");
}
