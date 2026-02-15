import React from 'react';
import { Shield, Star, Trophy, TrendingUp, XCircle, Clock, Eye, Zap, Crown, Car, Percent, ChevronRight, Award, Sparkles } from 'lucide-react';
import DriverBottomNav from '@/components/tatfleet/DriverBottomNav';

// ── Super Driver Criteria ──
interface Criterion {
  label: string;
  description: string;
  icon: React.ElementType;
  current: number;
  target: number;
  unit: string;
  isInverse?: boolean; // true = lower is better (e.g. cancellation rate)
  format?: (v: number) => string;
}

const criteria: Criterion[] = [
  {
    label: 'Expérience',
    description: '100 courses sur les 12 derniers mois',
    icon: Car,
    current: 127,
    target: 100,
    unit: 'courses',
    format: (v) => `${v}`,
  },
  {
    label: 'Réactivité',
    description: 'Taux d\'acceptation ≥ 90%',
    icon: Zap,
    current: 92,
    target: 90,
    unit: '%',
    format: (v) => `${v}%`,
  },
  {
    label: 'Fiabilité',
    description: 'Taux d\'annulation < 1%',
    icon: XCircle,
    current: 0.5,
    target: 1,
    unit: '%',
    isInverse: true,
    format: (v) => `${v}%`,
  },
  {
    label: 'Excellence',
    description: 'Note globale ≥ 4.8/5',
    icon: Star,
    current: 4.9,
    target: 4.8,
    unit: '/5',
    format: (v) => `${v.toFixed(1)}`,
  },
];

// ── Rewards ──
const rewards = [
  { icon: Eye, title: 'Visibilité accrue', description: 'Votre profil apparaît en priorité sur le réseau Caby.' },
  { icon: Crown, title: 'Accès prioritaire', description: 'Priorité sur les courses privées et aéroport.' },
  { icon: Percent, title: 'Réduction TATFleet', description: 'Bonus sur les frais de portage salarial.' },
  { icon: Sparkles, title: 'Badge Super Driver', description: 'Badge doré visible par tous les clients.' },
];

// ── Helpers ──
const getStatus = (c: Criterion): 'eligible' | 'progress' | 'ineligible' => {
  if (c.isInverse) {
    if (c.current < c.target) return 'eligible';
    if (c.current <= c.target * 1.5) return 'progress';
    return 'ineligible';
  }
  if (c.current >= c.target) return 'eligible';
  if (c.current >= c.target * 0.75) return 'progress';
  return 'ineligible';
};

const statusConfig = {
  eligible: { color: 'text-[hsl(var(--caby-green))]', bg: 'bg-[hsl(var(--caby-green))]/15', border: 'border-[hsl(var(--caby-green))]/30', label: 'Éligible', barColor: 'bg-[hsl(var(--caby-green))]' },
  progress: { color: 'text-[hsl(var(--caby-gold))]', bg: 'bg-[hsl(var(--caby-gold))]/15', border: 'border-[hsl(var(--caby-gold))]/30', label: 'En progression', barColor: 'bg-[hsl(var(--caby-gold))]' },
  ineligible: { color: 'text-[hsl(var(--caby-red))]', bg: 'bg-[hsl(var(--caby-red))]/15', border: 'border-[hsl(var(--caby-red))]/30', label: 'Non éligible', barColor: 'bg-[hsl(var(--caby-red))]' },
};

const getProgressPercent = (c: Criterion) => {
  if (c.isInverse) {
    // For inverse: 0% cancellation = 100% progress, target% = threshold
    return Math.min(((c.target - c.current) / c.target) * 100 + 50, 100);
  }
  return Math.min((c.current / c.target) * 100, 100);
};

// ── Next evaluation ──
const getNextEvaluation = () => {
  const now = new Date();
  const nextQuarter = new Date(now.getFullYear(), Math.ceil((now.getMonth() + 1) / 3) * 3, 1);
  const diffDays = Math.ceil((nextQuarter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const formatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  return { date: formatter.format(nextQuarter), days: diffDays };
};

const DriverClubPage: React.FC = () => {
  const allEligible = criteria.every(c => getStatus(c) === 'eligible');
  const eligibleCount = criteria.filter(c => getStatus(c) === 'eligible').length;
  const nextEval = getNextEvaluation();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-2">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Programme</p>
        <h1 className="text-2xl font-display font-bold text-foreground mt-1">Super Driver</h1>
      </div>

      {/* Status Badge Card */}
      <div className="px-5 mt-4 mb-6">
        <div className={`relative overflow-hidden rounded-3xl p-6 ${
          allEligible
            ? 'bg-gradient-to-br from-[hsl(var(--caby-gold))] via-[hsl(var(--caby-gold-light))] to-[hsl(var(--caby-gold))]'
            : 'bg-gradient-to-br from-card via-muted to-card border border-border'
        }`}>
          {/* Shimmer effect */}
          {allEligible && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.2)_0%,transparent_60%)]" />
            </div>
          )}

          <div className="relative z-10 flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              allEligible ? 'bg-black/20 backdrop-blur-sm' : 'bg-muted'
            }`}>
              {allEligible ? (
                <Trophy className="w-8 h-8 text-white" />
              ) : (
                <Award className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <h2 className={`text-lg font-display font-bold ${allEligible ? 'text-black' : 'text-foreground'}`}>
                {allEligible ? 'Super Driver ✨' : 'En cours de qualification'}
              </h2>
              <p className={`text-xs mt-0.5 ${allEligible ? 'text-black/70' : 'text-muted-foreground'}`}>
                {allEligible
                  ? 'Félicitations ! Vous avez le statut Super Driver.'
                  : `${eligibleCount}/4 critères validés`
                }
              </p>
            </div>
          </div>

          {/* Progress dots */}
          <div className="relative z-10 flex gap-2 mt-4">
            {criteria.map((c, i) => {
              const status = getStatus(c);
              return (
                <div key={i} className={`flex-1 h-1.5 rounded-full ${
                  allEligible
                    ? 'bg-black/30'
                    : status === 'eligible'
                      ? 'bg-[hsl(var(--caby-green))]'
                      : status === 'progress'
                        ? 'bg-[hsl(var(--caby-gold))]'
                        : 'bg-[hsl(var(--caby-red))]/50'
                }`} />
              );
            })}
          </div>
        </div>
      </div>

      {/* Evaluation countdown */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--caby-blue))]/15 flex items-center justify-center">
            <Clock className="w-5 h-5 text-[hsl(var(--caby-blue))]" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Prochaine évaluation</p>
            <p className="text-sm font-bold text-foreground">{nextEval.date}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-[hsl(var(--caby-blue))]">{nextEval.days}j</p>
            <p className="text-[10px] text-muted-foreground">restants</p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Performances analysées sur les 12 derniers mois glissants.
        </p>
      </div>

      {/* 4 Criteria Gauges */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full bg-primary" />
          <h3 className="text-sm font-display font-bold text-foreground">Critères de Qualification</h3>
        </div>

        <div className="space-y-3">
          {criteria.map((c) => {
            const status = getStatus(c);
            const config = statusConfig[status];
            const percent = getProgressPercent(c);
            const Icon = c.icon;

            return (
              <div key={c.label} className={`p-4 rounded-2xl border ${config.border} ${config.bg}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center`}>
                    <Icon className={`w-4.5 h-4.5 ${config.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-foreground">{c.label}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{c.description}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${config.barColor}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className={`text-sm font-black ${config.color} min-w-[3rem] text-right`}>
                    {c.format ? c.format(c.current) : c.current}{!c.format && c.unit}
                  </span>
                </div>

                {/* Target indicator */}
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {c.isInverse ? 'Maximum requis' : 'Objectif'} : {c.format ? c.format(c.target) : c.target}{!c.format && c.unit}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exclusive Rewards */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full bg-[hsl(var(--caby-gold))]" />
          <h3 className="text-sm font-display font-bold text-foreground">Avantages Exclusifs</h3>
          <span className="text-[10px] text-muted-foreground ml-auto">Super Driver</span>
        </div>

        <div className="space-y-2">
          {rewards.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.title} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                allEligible
                  ? 'bg-card border-border'
                  : 'bg-card/50 border-border/50 opacity-50'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  allEligible
                    ? 'bg-gradient-to-br from-[hsl(var(--caby-gold))] to-[hsl(var(--caby-gold-light))]'
                    : 'bg-muted'
                }`}>
                  <Icon className={`w-5 h-5 ${allEligible ? 'text-black' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground">{r.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                </div>
                {allEligible && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                {!allEligible && (
                  <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex-shrink-0">
                    🔒
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 mt-4 mb-4">
        <div className="flex items-center justify-center gap-4 opacity-30">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>TATFleet LSE Certified</span>
          </div>
          <span className="text-[8px] font-mono text-muted-foreground">ENCRYPTED_STREAM_V2_ACTIVE</span>
        </div>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default DriverClubPage;
