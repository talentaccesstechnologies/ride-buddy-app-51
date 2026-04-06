// ============================================
// CABY REFUND POLICY ENGINE
// ============================================

export function calculateRefund(
  ticketPrice: number,
  hasFlexCancellation: boolean,
  hoursBeforeDeparture: number,
  isIncidentFromCaby: boolean
): { refundAmount: number; refundPercent: number; refundLabel: string } {
  // Incident Caby (panne, chauffeur malade) → remboursement 100% toujours
  if (isIncidentFromCaby) {
    return {
      refundAmount: ticketPrice,
      refundPercent: 100,
      refundLabel: "Remboursement complet — incident opérationnel",
    };
  }

  // Avec annulation flexible (+CHF 9)
  if (hasFlexCancellation) {
    if (hoursBeforeDeparture >= 24)
      return { refundAmount: ticketPrice, refundPercent: 100, refundLabel: "Remboursement complet" };
    if (hoursBeforeDeparture >= 6)
      return { refundAmount: Math.round(ticketPrice * 0.8), refundPercent: 80, refundLabel: "Remboursement 80%" };
    if (hoursBeforeDeparture >= 2)
      return { refundAmount: Math.round(ticketPrice * 0.5), refundPercent: 50, refundLabel: "Remboursement 50%" };
    return { refundAmount: 0, refundPercent: 0, refundLabel: "Non remboursable — départ imminent" };
  }

  // Sans annulation flexible — tarif standard
  if (hoursBeforeDeparture >= 48)
    return { refundAmount: Math.round(ticketPrice * 0.8), refundPercent: 80, refundLabel: "Remboursement 80%" };
  if (hoursBeforeDeparture >= 24)
    return { refundAmount: Math.round(ticketPrice * 0.5), refundPercent: 50, refundLabel: "Remboursement 50%" };
  if (hoursBeforeDeparture >= 6)
    return { refundAmount: Math.round(ticketPrice * 0.2), refundPercent: 20, refundLabel: "Remboursement 20%" };
  return { refundAmount: 0, refundPercent: 0, refundLabel: "Non remboursable" };
}

// Caby Miles system
export const MILES_REWARDS = [
  { miles: 100, reward: "CHF 5 de crédit", icon: "🎁" },
  { miles: 300, reward: "1 trajet Genève-Lausanne offert", icon: "🚐" },
  { miles: 500, reward: "1 trajet Genève-Zurich offert", icon: "🏔️" },
  { miles: 1000, reward: "Week-end ski offert (aller-retour)", icon: "🎿" },
  { miles: 2000, reward: "Pass Voyageur 1 mois offert", icon: "⭐" },
];

export function getNextMilesReward(currentMiles: number) {
  const next = MILES_REWARDS.find((r) => r.miles > currentMiles);
  if (!next) return null;
  return { ...next, remaining: next.miles - currentMiles };
}

// Caby Pass tiers
export const CABY_PASS_TIERS = [
  {
    id: "free",
    name: "Pass Découverte",
    price: 0,
    discount: 0,
    features: [
      "Prix standard sur tous les trajets",
      "Accès Flash Deals 24h après les abonnés",
      "0 avantage supplémentaire",
    ],
  },
  {
    id: "voyageur",
    name: "Pass Voyageur",
    price: 29,
    discount: 10,
    badge: "Voyageur Premium",
    features: [
      "-10% sur tous les trajets Van et Cross-Border",
      "Accès Flash Deals en priorité",
      "Annulation flexible incluse",
      "1 bagage gratuit par trajet",
      'Badge "Voyageur Premium" sur le profil',
    ],
  },
  {
    id: "business",
    name: "Pass Business",
    price: 79,
    discount: 20,
    badge: "Business Class",
    features: [
      "-20% sur tous les trajets",
      "Facturation mensuelle groupée",
      "Chauffeur préféré assigné si disponible",
      "Accès Flash Deals en exclusivité 2h avant",
      "Support prioritaire",
      'Badge "Business Class" sur le profil',
    ],
  },
];
