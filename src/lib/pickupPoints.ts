// ============================================
// CABY VAN — Pickup/Dropoff Points v2
// Logique Blacklane + Uber Pool adaptée
// ============================================

export interface PickupPoint {
  label: string;
  address: string;
  description?: string;      // Info pratique pour le passager
  walkingMinutes?: number;   // Temps de marche estimé depuis le centre
  isPremium?: boolean;       // Option premium +CHF 8
  isCustom?: boolean;        // Adresse libre
  isAirport?: boolean;       // Détection vol automatique
  isOfficialStop?: boolean;  // Point Caby officiel (prioritaire)
  landmark?: string;         // Repère visuel ("Sortie C, colonne orange")
}

export const PICKUP_POINTS: Record<string, PickupPoint[]> = {
  "Genève": [
    {
      label: "✈️ Aéroport GVA — Hall Arrivées T1",
      address: "Route de l'Aéroport, 1215 Genève",
      description: "Colonne de pickup Caby — Zone jaune, sortie douane",
      landmark: "Panneau CABY orange après les portes automatiques",
      walkingMinutes: 0,
      isAirport: true,
      isOfficialStop: true,
    },
    {
      label: "🚉 Gare Cornavin — Sortie C",
      address: "Place Cornavin 1, 1201 Genève",
      description: "Point Caby officiel — Sortie C, trottoir côté taxi",
      landmark: "Panneau CABY jaune entre les taxis et les trams",
      walkingMinutes: 2,
      isOfficialStop: true,
    },
    {
      label: "🏛️ Place du Rhône",
      address: "Place du Rhône, 1204 Genève",
      description: "Centre-ville — Parking Rhône, entrée côté Molard",
      landmark: "Devant la Banque Cantonale, côté fontaine",
      walkingMinutes: 3,
      isOfficialStop: true,
    },
    {
      label: "🏨 Hôtel Beau-Rivage",
      address: "Quai du Mont-Blanc 13, 1201 Genève",
      description: "Portier Beau-Rivage prévenu — arrivée voiture cochère",
      landmark: "Entrée principale côté lac",
      walkingMinutes: 0,
    },
    {
      label: "🏨 Four Seasons des Bergues",
      address: "Quai des Bergues 33, 1201 Genève",
      description: "Portier prévu — entrée porte cochère",
      landmark: "Entrée principale Quai des Bergues",
      walkingMinutes: 0,
    },
    {
      label: "🏘️ Pickup à votre adresse",
      address: "",
      description: "Le van vient directement chez vous · +CHF 8",
      isPremium: true,
      isCustom: true,
    },
  ],
  "Zurich": [
    {
      label: "✈️ Aéroport ZRH — Terminal 1 Arrivées",
      address: "Flughafen Zürich, 8058 Zürich",
      description: "Zone pickup officielle — Sortie douane niveau -1",
      landmark: "Colonne CABY orange, côté Train+Bus",
      walkingMinutes: 0,
      isAirport: true,
      isOfficialStop: true,
    },
    {
      label: "🚉 Gare Centrale HB — Bahnhofplatz",
      address: "Bahnhofplatz 15, 8001 Zürich",
      description: "Entrée principale gare, côté tramway",
      landmark: "Devant la fontaine, entre les lignes 4 et 11",
      walkingMinutes: 2,
      isOfficialStop: true,
    },
    {
      label: "🏨 Baur au Lac",
      address: "Talstrasse 1, 8001 Zürich",
      description: "Portier Baur au Lac — voiture cochère",
      landmark: "Entrée Talstrasse",
      walkingMinutes: 0,
    },
    {
      label: "🏘️ Pickup à votre adresse",
      address: "",
      description: "Le van vient directement chez vous · +CHF 8",
      isPremium: true,
      isCustom: true,
    },
  ],
  "Lausanne": [
    {
      label: "🚉 Gare de Lausanne — Place de la Gare",
      address: "Place de la Gare, 1003 Lausanne",
      description: "Point Caby officiel — Sortie centrale, côté taxis",
      landmark: "Colonne CABY jaune entre les taxis et le M2",
      walkingMinutes: 2,
      isOfficialStop: true,
    },
    {
      label: "🏛️ Lausanne-Flon",
      address: "Place de l'Europe, 1003 Lausanne",
      description: "Centre commercial Flon, entrée parking",
      landmark: "Devant l'entrée principale Place de l'Europe",
      walkingMinutes: 3,
    },
    {
      label: "🏨 Beau-Rivage Palace",
      address: "Chemin de Beau-Rivage 17, 1006 Lausanne",
      description: "Portier prévu — porte cochère principale",
      walkingMinutes: 0,
    },
    {
      label: "🏘️ Pickup à votre adresse",
      address: "",
      description: "Le van vient directement chez vous · +CHF 8",
      isPremium: true,
      isCustom: true,
    },
  ],
  "Annecy": [
    {
      label: "🚉 Gare d'Annecy — Parvis principal",
      address: "Place de la Gare, 74000 Annecy",
      description: "Point Caby officiel — Côté taxis, parvis gare",
      landmark: "Panneau CABY jaune côté dépose-minute",
      walkingMinutes: 2,
      isOfficialStop: true,
    },
    {
      label: "🏛️ Centre Bonlieu",
      address: "Rue Carnot, 74000 Annecy",
      description: "Centre-ville, face au lac",
      landmark: "Devant l'Office de Tourisme",
      walkingMinutes: 5,
    },
    {
      label: "🏘️ Pickup à votre adresse",
      address: "",
      description: "Le van vient directement chez vous · +CHF 8",
      isPremium: true,
      isCustom: true,
    },
  ],
  "Lyon": [
    {
      label: "✈️ Aéroport Lyon Saint-Exupéry — Hall 1",
      address: "Aéroport Lyon Saint-Exupéry, 69125 Colombier-Saugnieu",
      description: "Zone arrivées Hall 1 — Point Caby orange",
      landmark: "Après les portes automatiques, côté navettes",
      walkingMinutes: 0,
      isAirport: true,
      isOfficialStop: true,
    },
    {
      label: "🚉 Gare Part-Dieu — Sortie Vivier-Merle",
      address: "Place Charles Béraudier, 69003 Lyon",
      description: "Sortie côté tours, zone dépose taxis",
      landmark: "Devant la tour Oxygène, côté taxis",
      walkingMinutes: 3,
      isOfficialStop: true,
    },
    {
      label: "🚉 Gare Perrache — Parvis Nord",
      address: "Cours de Verdun, 69002 Lyon",
      description: "Parvis Nord, côté métro A",
      walkingMinutes: 3,
    },
    {
      label: "🏘️ Pickup à votre adresse",
      address: "",
      description: "Le van vient directement chez vous · +CHF 8",
      isPremium: true,
      isCustom: true,
    },
  ],
  "Verbier": [
    {
      label: "🚡 Télécabine Médran — Base",
      address: "Place de Médran, 1936 Verbier",
      description: "Point Caby officiel — Parking Médran, niveau 0",
      landmark: "Devant le départ télécabine, côté casiers à skis",
      walkingMinutes: 0,
      isOfficialStop: true,
    },
    {
      label: "🏔️ Place Centrale Verbier",
      address: "Place Centrale, 1936 Verbier",
      description: "Centre du village, côté Fer à Cheval",
      landmark: "Devant le Fer à Cheval",
      walkingMinutes: 2,
    },
    {
      label: "🏨 W Verbier",
      address: "Rue de Médran 70, 1936 Verbier",
      description: "Portier W Verbier — voiture cochère",
      walkingMinutes: 0,
    },
    {
      label: "🏘️ Pickup à votre chalet",
      address: "",
      description: "Le van vient directement à votre chalet · +CHF 8",
      isPremium: true,
      isCustom: true,
    },
  ],
  "Chamonix": [
    {
      label: "🚉 Gare de Chamonix",
      address: "Place de la Gare, 74400 Chamonix",
      description: "Point Caby officiel — Parvis gare Mont-Blanc Express",
      landmark: "Côté dépose-minute, face à l'Office de Tourisme",
      walkingMinutes: 2,
      isOfficialStop: true,
    },
    {
      label: "🏔️ Centre-ville Chamonix",
      address: "Rue du Docteur Paccard, 74400 Chamonix",
      description: "Rue piétonne, côté Casino",
      walkingMinutes: 4,
    },
    {
      label: "🏘️ Pickup à votre adresse",
      address: "",
      description: "Le van vient directement chez vous · +CHF 8",
      isPremium: true,
      isCustom: true,
    },
  ],
  "Berne": [
    {
      label: "🚉 Gare de Berne — Bahnhofplatz",
      address: "Bahnhofplatz 10a, 3011 Bern",
      description: "Sortie principale, côté taxis et tramway",
      landmark: "Devant l'entrée principale, côté Bubenbergplatz",
      walkingMinutes: 2,
      isOfficialStop: true,
    },
    {
      label: "🏛️ Place Fédérale",
      address: "Bundesplatz, 3003 Bern",
      description: "Devant le Palais Fédéral",
      walkingMinutes: 8,
    },
    {
      label: "🏘️ Pickup à votre adresse",
      address: "",
      description: "Le van vient directement chez vous · +CHF 8",
      isPremium: true,
      isCustom: true,
    },
  ],
  "Bâle": [
    {
      label: "✈️ EuroAirport BSL — Hall Arrivées",
      address: "Flughafen Basel-Mulhouse, 4030 Basel",
      description: "Sortie douane, zone pickup officielle",
      landmark: "Colonne CABY orange après les portes automatiques",
      walkingMinutes: 0,
      isAirport: true,
      isOfficialStop: true,
    },
    {
      label: "🚉 Gare CFF Basel — Centralbahnplatz",
      address: "Centralbahnplatz, 4051 Basel",
      description: "Place de la gare, côté taxis",
      walkingMinutes: 2,
      isOfficialStop: true,
    },
    {
      label: "🏘️ Pickup à votre adresse",
      address: "",
      description: "Le van vient directement chez vous · +CHF 8",
      isPremium: true,
      isCustom: true,
    },
  ],
  "Milan": [
    {
      label: "✈️ Aéroport Malpensa MXP — Terminal 1",
      address: "Aeroporto di Milano-Malpensa, 21010 Ferno",
      description: "Sortie arrivées Terminal 1, niveau 0",
      landmark: "Zone pickup officielle, panneau CABY",
      walkingMinutes: 0,
      isAirport: true,
      isOfficialStop: true,
    },
    {
      label: "🚉 Milano Centrale — Piazza Duca d'Aosta",
      address: "Piazza Duca d'Aosta 1, 20124 Milano",
      description: "Entrée principale gare, côté taxis",
      walkingMinutes: 3,
      isOfficialStop: true,
    },
    {
      label: "🏘️ Pickup à votre adresse",
      address: "",
      description: "Le van vient directement chez vous · +CHF 8",
      isPremium: true,
      isCustom: true,
    },
  ],
  "Montreux": [
    {
      label: "🚉 Gare de Montreux",
      address: "Avenue des Alpes 45, 1820 Montreux",
      description: "Parvis gare, côté lac",
      walkingMinutes: 2,
      isOfficialStop: true,
    },
    {
      label: "🏨 Fairmont Le Montreux Palace",
      address: "Avenue Claude Nobs 2, 1820 Montreux",
      description: "Porte cochère principale",
      walkingMinutes: 0,
    },
    {
      label: "🏘️ Pickup à votre adresse",
      address: "",
      description: "Le van vient directement chez vous · +CHF 8",
      isPremium: true,
      isCustom: true,
    },
  ],
  "Sion": [
    {
      label: "🚉 Gare de Sion — Place de la Gare",
      address: "Place de la Gare, 1950 Sion",
      description: "Parvis gare, côté taxis",
      walkingMinutes: 2,
      isOfficialStop: true,
    },
    {
      label: "🏘️ Pickup à votre adresse",
      address: "",
      description: "Le van vient directement chez vous · +CHF 8",
      isPremium: true,
      isCustom: true,
    },
  ],
};

export const PREMIUM_PICKUP_FEE = 8; // CHF

/** Get pickup points for a city, with fallback */
export function getPickupPoints(city: string): PickupPoint[] {
  return PICKUP_POINTS[city] || [
    {
      label: `🚉 Gare de ${city}`,
      address: `Gare de ${city}`,
      description: "Point de rendez-vous chauffeur",
      isOfficialStop: true,
    },
    {
      label: "🏘️ Pickup à votre adresse",
      address: "",
      description: "Le van vient directement chez vous · +CHF 8",
      isPremium: true,
      isCustom: true,
    },
  ];
}

/** Get only official Caby stops (non-premium) */
export function getOfficialStops(city: string): PickupPoint[] {
  return getPickupPoints(city).filter(p => !p.isPremium);
}

/** Check if any selected point is an airport */
export function hasAirportSelected(
  pickupLabel: string,
  dropoffLabel: string
): boolean {
  return pickupLabel.includes("✈️") || dropoffLabel.includes("✈️");
}

/** Check if a point requires premium fee */
export function isPremiumPickup(label: string): boolean {
  const all = Object.values(PICKUP_POINTS).flat();
  const point = all.find(p => p.label === label);
  return point?.isPremium === true;
}

/** Get premium fee for a pickup selection */
export function getPremiumPickupFee(
  pickupLabel: string,
  dropoffLabel: string
): number {
  const pickupPremium = isPremiumPickup(pickupLabel) ? PREMIUM_PICKUP_FEE : 0;
  const dropoffPremium = isPremiumPickup(dropoffLabel) ? PREMIUM_PICKUP_FEE : 0;
  return pickupPremium + dropoffPremium;
}
