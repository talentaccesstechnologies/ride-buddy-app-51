import React from 'react';
import { Star, Zap, XCircle, Clock, TrendingUp, Check, AlertTriangle } from 'lucide-react';
import { LEVEL_CONFIGS, getNextLevel, type DriverLevel } from '@/lib/driverLevels';

interface ScoreBreakdownProps {
  level: DriverLevel;
  rating: number;
  acceptance: number;
  cancellation: number;
  punctuality: number;
}

interface Metric {
  label: string;
  description: string;
  icon: React.ElementType;
  current: number;
  target: number;
  weight: string;
  unit: string;
  isInverse?: boolean;
  format: (v: number) => string;
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({
  level, rating, acceptance, cancellation, punctuality
}) => {
  const nextLevel = getNextLevel(level);
  const nextConfig = nextLevel ? LEVEL_CONFIGS[nextLevel] : null;
  const req = nextConfig?.requirements || LEVEL_CONFIGS[level].requirements;

  const metrics: Metric[] = [
    {
      label: 'Note clients',
      description: `Objectif ≥ ${req.minRating}/5`,
      icon: Star,
      current: rating,
      target: req.minRating,
      weight: '40%',
      unit: '/5',
      format: (v) => v.toFixed(1),
    },
    {
      label: 'Taux d\'acceptation',
      description: `Objectif ≥ ${req.minAcceptance}%`,
      icon: Zap,
      current: acceptance,
      target: req.minAcceptance,
      weight: '20%',
      unit: '%',
      format: (v) => `${v.toFixed(0)}%`,
    },
    {
      label: 'Taux d\'annulation',
      description: `Objectif ≤ ${req.maxCancellation}%`,
      icon: XCircle,
      current: cancellation,
      target: req.maxCancellation,
      weight: '20%',
      unit: '%',
      isInverse: true,
      format: (v) => `${v.toFixed(1)}%`,
    },
    {
      label: 'Ponctualité',
      description: 'Ponctualité aux prises en charge',
      icon: Clock,
      current: punctuality,
      target: 95,
      weight: '20%',
      unit: '%',
      format: (v) => `${v.toFixed(0)}%`,
    },
  ];

  return (
    <div className="space-y-3">
      {metrics.map((m) => {
        const Icon = m.icon;
        const met = m.isInverse ? m.current <= m.target : m.current >= m.target;
        const percent = m.isInverse
          ? Math.min(((m.target - m.current + m.target) / (m.target * 2)) * 100, 100)
          : Math.min((m.current / m.target) * 100, 100);

        return (
          <div key={m.label} className={`p-4 rounded-2xl border ${
            met
              ? 'bg-[hsl(var(--caby-green))]/5 border-[hsl(var(--caby-green))]/20'
              : 'bg-[hsl(var(--caby-gold))]/5 border-[hsl(var(--caby-gold))]/20'
          }`}>
            <div className="flex items-center gap-3 mb-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                met ? 'bg-[hsl(var(--caby-green))]/15' : 'bg-[hsl(var(--caby-gold))]/15'
              }`}>
                <Icon className={`w-4.5 h-4.5 ${
                  met ? 'text-[hsl(var(--caby-green))]' : 'text-[hsl(var(--caby-gold))]'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">{m.label}</h4>
                    <span className="text-[9px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                      {m.weight}
                    </span>
                  </div>
                  {met ? (
                    <Check className="w-4 h-4 text-[hsl(var(--caby-green))]" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-[hsl(var(--caby-gold))]" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{m.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    met ? 'bg-[hsl(var(--caby-green))]' : 'bg-[hsl(var(--caby-gold))]'
                  }`}
                  style={{ width: `${Math.max(percent, 5)}%` }}
                />
              </div>
              <span className={`text-sm font-black min-w-[3.5rem] text-right ${
                met ? 'text-[hsl(var(--caby-green))]' : 'text-[hsl(var(--caby-gold))]'
              }`}>
                {m.format(m.current)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScoreBreakdown;
