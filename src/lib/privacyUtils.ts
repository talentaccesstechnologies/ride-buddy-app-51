/**
 * Privacy & Anti-Fuite Utilities
 * Masque les données sensibles des clients pour les chauffeurs
 */

/**
 * Masque un numéro de téléphone pour le chauffeur
 * "+41 79 123 45 67" → "+41 ** *** ** 67"
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 4) return '****';
  const cleaned = phone.replace(/\s/g, '');
  const last2 = cleaned.slice(-2);
  const prefix = cleaned.startsWith('+') ? cleaned.slice(0, 3) : '';
  return prefix ? `${prefix} ** *** ** ${last2}` : `**** ** ${last2}`;
}

/**
 * Masque un email pour affichage restreint
 * "jean.dupont@gmail.com" → "j***t@g***l.com"
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***.***';
  const [local, domain] = email.split('@');
  const maskedLocal = local.length > 2
    ? `${local[0]}${'*'.repeat(Math.min(local.length - 2, 3))}${local[local.length - 1]}`
    : `${local[0]}*`;
  const domParts = domain.split('.');
  const maskedDom = domParts[0].length > 2
    ? `${domParts[0][0]}${'*'.repeat(Math.min(domParts[0].length - 2, 3))}${domParts[0][domParts[0].length - 1]}`
    : domParts[0];
  return `${maskedLocal}@${maskedDom}.${domParts.slice(1).join('.')}`;
}

/**
 * Vérifie si une course est en cours (canal actif)
 * Après la course le canal est coupé définitivement
 */
export function isContactChannelActive(rideStatus: string): boolean {
  return ['accepted', 'driver_arriving', 'in_progress'].includes(rideStatus);
}

/**
 * Empêche l'export de la liste de clients
 * Retourne les données clients sans champs sensibles
 */
export function sanitizeClientForDriver(client: {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}) {
  return {
    id: client.id,
    display_name: client.full_name
      ? `${client.full_name.split(' ')[0]} ${client.full_name.split(' ').slice(1).map(n => `${n[0]}.`).join(' ')}`.trim()
      : 'Client',
    phone: client.phone ? maskPhoneNumber(client.phone) : null,
    email: null, // Never exposed to driver
    avatar_url: client.avatar_url,
    // No raw data exportable
    _exportable: false as const,
  };
}
