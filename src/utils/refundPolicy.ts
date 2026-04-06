// ============================================
// CABY REFUND POLICY ENGINE
// ============================================

export function calculateRefund(
  ticketPrice: number,
  hasFlexCancellation: boolean,
  hoursBeforeDeparture: number,
  isIncidentFromCaby: boolean
): { refundAmount: number; refundPercent: number; refundLabel: string; isWalletCredit: boolean } {
  // Incident Caby (panne, chauffeur malade) → remboursement 100% toujours (cash)
  if (isIncidentFromCaby) {
    return {
      refundAmount: ticketPrice,
      refundPercent: 100,
      refundLabel: "Remboursement complet — incident opérationnel",
      isWalletCredit: false,
    };
  }

  // Avec annulation flexible (+CHF 9)
  if (hasFlexCancellation) {
    if (hoursBeforeDeparture >= 24)
      return { refundAmount: ticketPrice, refundPercent: 100, refundLabel: "Remboursement complet", isWalletCredit: false };
    if (hoursBeforeDeparture >= 6)
      return { refundAmount: Math.round(ticketPrice * 0.8), refundPercent: 80, refundLabel: "Remboursement 80%", isWalletCredit: true };
    if (hoursBeforeDeparture >= 2)
      return { refundAmount: Math.round(ticketPrice * 0.5), refundPercent: 50, refundLabel: "Remboursement 50%", isWalletCredit: true };
    return { refundAmount: 0, refundPercent: 0, refundLabel: "Non remboursable — départ imminent", isWalletCredit: false };
  }

  // Sans annulation flexible — tarif standard
  if (hoursBeforeDeparture >= 48)
    return { refundAmount: Math.round(ticketPrice * 0.8), refundPercent: 80, refundLabel: "Remboursement 80%", isWalletCredit: true };
  if (hoursBeforeDeparture >= 24)
    return { refundAmount: Math.round(ticketPrice * 0.5), refundPercent: 50, refundLabel: "Remboursement 50%", isWalletCredit: true };
  if (hoursBeforeDeparture >= 6)
    return { refundAmount: Math.round(ticketPrice * 0.2), refundPercent: 20, refundLabel: "Remboursement 20%", isWalletCredit: true };
  return { refundAmount: 0, refundPercent: 0, refundLabel: "Non remboursable", isWalletCredit: false };
}

// No-show policy
export function calculateNoShowRefund(
  ticketPrice: number,
  hasFlexCancellation: boolean,
  minutesBeforeDeparture: number
): { refundAmount: number; refundPercent: number; refundLabel: string } {
  // No-show without flex → 0%
  if (!hasFlexCancellation) {
    return { refundAmount: 0, refundPercent: 0, refundLabel: "Non remboursable — absence non signalée" };
  }
  // Flex + signaled > 30min before → 50%
  if (minutesBeforeDeparture >= 30) {
    return { refundAmount: Math.round(ticketPrice * 0.5), refundPercent: 50, refundLabel: "Remboursement 50% — annulation flexible" };
  }
  return { refundAmount: 0, refundPercent: 0, refundLabel: "Non remboursable — signalé trop tard" };
}

// Format refund simulation message
export function formatRefundPreview(
  ticketPrice: number,
  hasFlexCancellation: boolean,
  departureDate: Date,
  now: Date = new Date()
): string {
  const hoursUntil = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const result = calculateRefund(ticketPrice, hasFlexCancellation, hoursUntil, false);
  if (result.refundAmount === 0) return "Aucun remboursement possible";
  const creditNote = result.isWalletCredit ? " sur votre Wallet Caby" : "";
  return `Si vous annulez maintenant : CHF ${result.refundAmount} remboursés${creditNote}`;
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
