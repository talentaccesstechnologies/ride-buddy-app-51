// SuperDriver level definitions and helpers

export type DriverLevel = 'super_gold' | 'super' | 'certified' | 'probation' | 'suspended';

export interface LevelConfig {
  key: DriverLevel;
  label: string;
  shortLabel: string;
  stars: number;
  color: string;
  bgColor: string;
  borderColor: string;
  commission: number;
  requirements: {
    minRating: number;
    minAcceptance: number;
    maxCancellation: number;
  };
  gradient: string;
}

export const LEVEL_CONFIGS: Record<DriverLevel, LevelConfig> = {
  super_gold: {
    key: 'super_gold',
    label: 'SuperDriver Gold',
    shortLabel: 'Gold',
    stars: 5,
    color: 'text-[hsl(var(--caby-gold))]',
    bgColor: 'bg-[hsl(var(--caby-gold))]/15',
    borderColor: 'border-[hsl(var(--caby-gold))]/30',
    commission: 0.08,
    requirements: { minRating: 4.9, minAcceptance: 95, maxCancellation: 0.5 },
    gradient: 'from-[hsl(var(--caby-gold))] via-[hsl(var(--caby-gold-light))] to-[hsl(var(--caby-gold))]',
  },
  super: {
    key: 'super',
    label: 'SuperDriver',
    shortLabel: 'Super',
    stars: 4,
    color: 'text-[hsl(var(--caby-blue))]',
    bgColor: 'bg-[hsl(var(--caby-blue))]/15',
    borderColor: 'border-[hsl(var(--caby-blue))]/30',
    commission: 0.10,
    requirements: { minRating: 4.8, minAcceptance: 90, maxCancellation: 1.0 },
    gradient: 'from-[hsl(var(--caby-blue))] to-[hsl(var(--caby-blue))]/70',
  },
  certified: {
    key: 'certified',
    label: 'Driver Certifié',
    shortLabel: 'Certifié',
    stars: 3,
    color: 'text-[hsl(var(--caby-green))]',
    bgColor: 'bg-[hsl(var(--caby-green))]/15',
    borderColor: 'border-[hsl(var(--caby-green))]/30',
    commission: 0.12,
    requirements: { minRating: 4.5, minAcceptance: 80, maxCancellation: 5.0 },
    gradient: 'from-[hsl(var(--caby-green))] to-[hsl(var(--caby-green))]/70',
  },
  probation: {
    key: 'probation',
    label: 'En progression',
    shortLabel: 'Progression',
    stars: 2,
    color: 'text-[hsl(var(--caby-red))]/70',
    bgColor: 'bg-[hsl(var(--caby-red))]/10',
    borderColor: 'border-[hsl(var(--caby-red))]/20',
    commission: 0.15,
    requirements: { minRating: 0, minAcceptance: 0, maxCancellation: 100 },
    gradient: 'from-muted to-muted/70',
  },
  suspended: {
    key: 'suspended',
    label: 'Suspendu',
    shortLabel: 'Suspendu',
    stars: 1,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20',
    commission: 0,
    requirements: { minRating: 0, minAcceptance: 0, maxCancellation: 100 },
    gradient: 'from-destructive/30 to-destructive/10',
  },
};

export const LEVEL_ORDER: DriverLevel[] = ['suspended', 'probation', 'certified', 'super', 'super_gold'];

export function calculateLevel(rating: number, acceptance: number, cancellation: number): DriverLevel {
  if (rating >= 4.9 && acceptance >= 95 && cancellation <= 0.5) return 'super_gold';
  if (rating >= 4.8 && acceptance >= 90 && cancellation <= 1.0) return 'super';
  if (rating >= 4.5 && acceptance >= 80) return 'certified';
  return 'probation';
}

export function getNextLevel(current: DriverLevel): DriverLevel | null {
  const idx = LEVEL_ORDER.indexOf(current);
  if (idx >= LEVEL_ORDER.length - 1) return null;
  return LEVEL_ORDER[idx + 1];
}

export function getProgressToNext(
  current: DriverLevel,
  rating: number,
  acceptance: number,
  cancellation: number
): number {
  const next = getNextLevel(current);
  if (!next) return 100;
  const config = LEVEL_CONFIGS[next];
  const req = config.requirements;

  const ratingProgress = Math.min((rating / req.minRating) * 100, 100);
  const acceptProgress = Math.min((acceptance / req.minAcceptance) * 100, 100);
  const cancelProgress = req.maxCancellation > 0
    ? Math.min(((req.maxCancellation - cancellation + req.maxCancellation) / (req.maxCancellation * 2)) * 100, 100)
    : 100;

  return Math.round((ratingProgress * 0.4 + acceptProgress * 0.3 + cancelProgress * 0.3));
}

export function computeMonthlyScore(
  rating: number,
  rides: number,
  acceptance: number,
  punctuality: number
): number {
  return Math.round(
    (rating / 5) * 40 +
    Math.min(rides / 200, 1) * 25 +
    (acceptance / 100) * 20 +
    (punctuality / 100) * 15
  );
}
