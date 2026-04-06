// ============================================
// CROSS-BORDER VALIDATION — Vérification légale
// ============================================

const FRENCH_CITIES = [
  'Annecy', 'Lyon', 'Annemasse', 'Ferney-Voltaire', 'Gex',
  'Saint-Julien-en-Genevois', 'Thonon-les-Bains', 'Évian-les-Bains',
  'Bonneville', 'Cluses', 'Sallanches', 'Chambéry', 'Grenoble',
  'Bourg-en-Bresse', 'Mâcon', 'Dijon', 'Paris', 'Marseille',
  'Divonne-les-Bains', 'Bellegarde', 'Rumilly', 'La Roche-sur-Foron',
  'Oyonnax', 'Chamonix', 'Morzine', 'Courchevel', "Val d'Isère",
  'Les Arcs', 'Megève', 'Albertville', 'Strasbourg',
];

const ITALIAN_CITIES = ['Domodossola', 'Milan'];
const GERMAN_CITIES = ['Munich'];

const SWISS_CITIES = [
  'Genève', 'Lausanne', 'Zurich', 'Berne', 'Bâle', 'Sion',
  'Martigny', 'Montreux', 'Vevey', 'Nyon', 'Verbier', 'Zermatt',
  'Neuchâtel', 'Fribourg', 'Sierre', 'Brigue', 'Yverdon',
  'La Chaux-de-Fonds', 'Delémont', 'Porrentruy',
];

const FOREIGN_CITIES = [...FRENCH_CITIES, ...ITALIAN_CITIES, ...GERMAN_CITIES];

function isForeign(city: string) {
  return FOREIGN_CITIES.some(c => city.includes(c));
}

function isSwiss(city: string) {
  return SWISS_CITIES.some(c => city.includes(c));
}

export function validateCrossBorderTrip(
  fromCity: string,
  toCity: string
): { valid: boolean; error?: string } {
  if (!fromCity || !toCity || fromCity === toCity) {
    return { valid: false, error: 'Veuillez sélectionner deux villes différentes.' };
  }

  const fromForeign = isForeign(fromCity);
  const toForeign = isForeign(toCity);
  const fromSwiss = isSwiss(fromCity);
  const toSwiss = isSwiss(toCity);

  if (fromSwiss && toSwiss) {
    return {
      valid: false,
      error: 'Les trajets Cross-Border doivent traverser la frontière franco-suisse. Pour les trajets 100% suisses, utilisez Caby Van.',
    };
  }

  if (fromForeign && toForeign) {
    return {
      valid: false,
      error: 'Les trajets Cross-Border doivent traverser la frontière franco-suisse.',
    };
  }

  if ((fromForeign && toSwiss) || (fromSwiss && toForeign)) {
    return { valid: true };
  }

  return {
    valid: false,
    error: 'Destination non reconnue. Vérifiez les villes de départ et d\'arrivée.',
  };
}

export const LEGAL_DISCLAIMER = '🤝 Covoiturage — partage de frais entre particuliers · 🛡️ Couvert par assurance trajet Caby';
