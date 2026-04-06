// ============================================
// CABY INCIDENT PROTOCOL ENGINE
// ============================================

export type IncidentType =
  | "driver_sick"
  | "vehicle_breakdown"
  | "client_noshow"
  | "accident"
  | "border_delay"
  | "driver_late"
  | "client_behaviour";

export interface IncidentProtocol {
  type: IncidentType;
  label: string;
  emoji: string;
  driverPenalty: number; // SuperDriver points
  maxWaitMinutes: number;
  autoCompensation: number; // CHF per passenger
  autoRefundPercent: number;
  voucherAmount: number;
  description: string;
}

export const INCIDENT_PROTOCOLS: Record<IncidentType, IncidentProtocol> = {
  driver_sick: {
    type: "driver_sick",
    label: "Chauffeur malade / indisponible",
    emoji: "🤒",
    driverPenalty: -10,
    maxWaitMinutes: 30,
    autoCompensation: 0,
    autoRefundPercent: 100,
    voucherAmount: 15,
    description:
      "Recherche automatique d'un remplaçant dans un rayon de 20km. Si pas trouvé en 30min → annulation + remboursement 100% + bon CHF 15.",
  },
  vehicle_breakdown: {
    type: "vehicle_breakdown",
    label: "Panne véhicule",
    emoji: "🔧",
    driverPenalty: 0,
    maxWaitMinutes: 30,
    autoCompensation: 10,
    autoRefundPercent: 100,
    voucherAmount: 0,
    description:
      "SMS automatique aux passagers. Si résolution < 30min → attente + CHF 10/passager. Sinon → taxi de remplacement Caby.",
  },
  client_noshow: {
    type: "client_noshow",
    label: "Client absent",
    emoji: "👻",
    driverPenalty: 0,
    maxWaitMinutes: 8,
    autoCompensation: 0,
    autoRefundPercent: 0,
    voucherAmount: 0,
    description:
      "Chauffeur attend max 8min. Après → 0% remboursement sans annulation flexible, 80% avec. 3 no-shows = suspension 30j.",
  },
  accident: {
    type: "accident",
    label: "Accident",
    emoji: "🚨",
    driverPenalty: 0,
    maxWaitMinutes: 0,
    autoCompensation: 0,
    autoRefundPercent: 100,
    voucherAmount: 50,
    description:
      "Caby Operations alerté immédiatement. Remboursement 100% + bon CHF 50. Assistance et assurance activées.",
  },
  border_delay: {
    type: "border_delay",
    label: "Retard frontière",
    emoji: "🛂",
    driverPenalty: 0,
    maxWaitMinutes: 45,
    autoCompensation: 0,
    autoRefundPercent: 0,
    voucherAmount: 10,
    description:
      "Notification passagers avec nouvelle heure. Si retard > 45min → bon CHF 10. Aucune pénalité chauffeur.",
  },
  driver_late: {
    type: "driver_late",
    label: "Chauffeur en retard",
    emoji: "⏰",
    driverPenalty: -5,
    maxWaitMinutes: 15,
    autoCompensation: 5,
    autoRefundPercent: 0,
    voucherAmount: 0,
    description:
      "Si retard > 15min → compensation CHF 5/passager. Chauffeur pénalisé -5 points SuperDriver.",
  },
  client_behaviour: {
    type: "client_behaviour",
    label: "Comportement client",
    emoji: "⚠️",
    driverPenalty: 0,
    maxWaitMinutes: 0,
    autoCompensation: 0,
    autoRefundPercent: 0,
    voucherAmount: 0,
    description:
      "Catégories : Impolitesse / Saleté / Retard / Bagages excessifs. 2 signalements → avertissement, 3 → suspension 60j.",
  },
};

export const BEHAVIOUR_CATEGORIES = [
  { id: "rude", label: "Impolitesse", emoji: "😤" },
  { id: "dirty", label: "Saleté / dégradation", emoji: "🗑️" },
  { id: "late_pickup", label: "Retard au point de ramassage", emoji: "⏰" },
  { id: "excess_luggage", label: "Bagages excessifs non déclarés", emoji: "🧳" },
  { id: "other", label: "Autre", emoji: "📝" },
];

export const BLOCKING_RULES = {
  client: {
    warningThreshold: 3.5,
    suspensionThreshold: 3.0,
    noShowCount: 3,
    incidentCount: 3,
    suspensionDays: 30,
  },
  driver: {
    warningThreshold: 4.3,
    probationThreshold: 4.0,
    suspensionThreshold: 3.5,
  },
};

// Rating criteria
export const DRIVER_RATING_CRITERIA = [
  { key: "punctuality", label: "Ponctualité", emoji: "⏰" },
  { key: "comfort", label: "Confort", emoji: "🛋️" },
  { key: "driving", label: "Conduite", emoji: "🚗" },
  { key: "friendliness", label: "Amabilité", emoji: "😊" },
  { key: "cleanliness", label: "Propreté", emoji: "✨" },
];

export const CLIENT_RATING_CRITERIA = [
  { key: "punctuality", label: "Ponctualité au pickup", emoji: "⏰" },
  { key: "behaviour", label: "Comportement", emoji: "🤝" },
  { key: "luggage", label: "Bagages conformes", emoji: "🧳" },
  { key: "van_respect", label: "Respect du véhicule", emoji: "🚐" },
];

export const RATING_BADGES = {
  positive: [
    { id: "recommend", label: "Je recommande", emoji: "👍" },
    { id: "punctual", label: "Ponctuel", emoji: "⏰" },
    { id: "clean", label: "Voyageur propre", emoji: "🌿" },
    { id: "friendly", label: "Sympathique", emoji: "😊" },
    { id: "regular", label: "Client régulier", emoji: "🔄" },
  ],
  negative: [
    { id: "problem", label: "Problème à signaler", emoji: "👎" },
  ],
};

// Resolve incident with compensation
export function resolveIncident(
  type: IncidentType,
  passengersAffected: number,
  ticketPrice: number,
  hasFlexCancellation: boolean
): {
  refundAmount: number;
  voucherAmount: number;
  compensationPerPassenger: number;
  totalCompensation: number;
  resolution: string;
} {
  const protocol = INCIDENT_PROTOCOLS[type];
  const compensationPerPassenger = protocol.autoCompensation;
  const totalCompensation = compensationPerPassenger * passengersAffected;
  const refundAmount = ticketPrice * (protocol.autoRefundPercent / 100);

  let voucherAmount = protocol.voucherAmount;
  if (type === "client_noshow" && hasFlexCancellation) {
    return {
      refundAmount: ticketPrice * 0.8,
      voucherAmount: 0,
      compensationPerPassenger: 0,
      totalCompensation: 0,
      resolution: "Client absent avec annulation flexible → remboursement 80%",
    };
  }

  return {
    refundAmount,
    voucherAmount,
    compensationPerPassenger,
    totalCompensation,
    resolution: protocol.description,
  };
}

// Calculate average rating from last N trips
export function calculateAverageRating(
  scores: number[],
  maxTrips: number = 20
): number {
  const recent = scores.slice(-maxTrips);
  if (recent.length === 0) return 0;
  return recent.reduce((a, b) => a + b, 0) / recent.length;
}

// Check blocking status
export function checkBlockingStatus(
  role: "client" | "driver",
  averageRating: number,
  noShowCount: number = 0,
  incidentCount: number = 0
): { status: "ok" | "warning" | "probation" | "suspended"; message: string } {
  const rules = BLOCKING_RULES[role];

  if (role === "client") {
    const clientRules = rules as typeof BLOCKING_RULES.client;
    if (noShowCount >= clientRules.noShowCount) {
      return { status: "suspended", message: `Compte suspendu — ${noShowCount} absences non justifiées` };
    }
    if (incidentCount >= clientRules.incidentCount) {
      return { status: "suspended", message: `Compte suspendu — ${incidentCount} incidents signalés` };
    }
    if (averageRating < clientRules.suspensionThreshold) {
      return { status: "suspended", message: `Compte suspendu — note moyenne ${averageRating.toFixed(1)}/5` };
    }
    if (averageRating < clientRules.warningThreshold) {
      return { status: "warning", message: `Attention — votre note est basse (${averageRating.toFixed(1)}/5)` };
    }
  } else {
    const driverRules = rules as typeof BLOCKING_RULES.driver;
    if (averageRating < driverRules.suspensionThreshold) {
      return { status: "suspended", message: `Suspension immédiate — note ${averageRating.toFixed(1)}/5` };
    }
    if (averageRating < driverRules.probationThreshold) {
      return { status: "probation", message: `Probation SuperDriver — note ${averageRating.toFixed(1)}/5` };
    }
    if (averageRating < driverRules.warningThreshold) {
      return { status: "warning", message: `Avertissement — note en baisse (${averageRating.toFixed(1)}/5)` };
    }
  }

  return { status: "ok", message: "Tout va bien" };
}
