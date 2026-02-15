import React from 'react';
import { Shield, Star, Zap, Crown, Car, MapPin, Banknote, HandCoins, HeartPulse, Droplets, Coffee, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import DriverBottomNav from '@/components/tatfleet/DriverBottomNav';

type Tier = 'silver' | 'gold' | 'platinum';

interface TierConfig {
  label: string;
  icon: React.ElementType;
  points: number;
  next: string | null;
  nextPoints: number | null;
  gradient: string;
  borderColor: string;
  glowColor: string;
  textColor: string;
}

const TIERS: Record<Tier, TierConfig> = {
  silver: {
    label: 'Membre Silver',
    icon: Shield,
    points: 0,
    next: 'Gold',
    nextPoints: 500,
    gradient: 'bg-gradient-to-br from-[#71717a] via-[#a1a1aa] to-[#71717a]',
    borderColor: 'border-[#a1a1aa]/30',
    glowColor: 'shadow-[0_0_30px_-5px_rgba(161,161,170,0.3)]',
    textColor: 'text-[#d4d4d8]',
  },
  gold: {
    label: 'Membre Gold',
    icon: Star,
    points: 500,
    next: 'Platinum',
    nextPoints: 1200,
    gradient: 'bg-gradient-to-br from-[#b45309] via-[#d4a853] to-[#f59e0b]',
    borderColor: 'border-caby-gold/30',
    glowColor: 'shadow-gold-glow',
    textColor: 'text-caby-gold',
  },
  platinum: {
    label: 'Membre Platinum',
    icon: Crown,
    points: 1200,
    next: null,
    nextPoints: null,
    gradient: 'bg-gradient-to-br from-[#6366f1] via-[#a78bfa] to-[#c4b5fd]',
    borderColor: 'border-[#a78bfa]/30',
    glowColor: 'shadow-[0_0_30px_-5px_rgba(167,139,250,0.4)]',
    textColor: 'text-[#c4b5fd]',
  },
};

interface Perk {
  icon: React.ElementType;
  title: string;
  description: string;
  tier: Tier;
}

const operationalPerks: Perk[] = [
  { icon: Zap, title: 'Accès Prioritaire', description: 'Priorité sur les courses Aéroport et Caby Business.', tier: 'gold' },
  { icon: MapPin, title: 'Destination Préférée', description: 'Choisissez votre zone de fin de service plus souvent.', tier: 'silver' },
  { icon: Car, title: 'Courses Premium', description: 'Accès exclusif aux courses haut de gamme et événements.', tier: 'platinum' },
];

const socialPerks: Perk[] = [
  { icon: Banknote, title: 'Bonus Payroll', description: 'Réduction des frais de gestion de portage salarial.', tier: 'platinum' },
  { icon: HandCoins, title: 'Avance sur Salaire', description: 'Demandez une avance en un clic via l\'app.', tier: 'gold' },
  { icon: HeartPulse, title: 'Prévoyance Plus', description: 'Conseils personnalisés LPP et assurances.', tier: 'gold' },
];

const lifestylePerks: Perk[] = [
  { icon: Droplets, title: 'Lavage Auto', description: 'Réductions chez nos partenaires genevois.', tier: 'silver' },
  { icon: Coffee, title: 'Espace Chauffeur', description: 'Accès gratuit au Hub TATFleet — repos & café.', tier: 'gold' },
];

// Simulated driver data
const CURRENT_TIER: Tier = 'gold';
const CURRENT_POINTS = 780;

const PerkCard: React.FC<{ perk: Perk; currentTier: Tier }> = ({ perk, currentTier }) => {
  const tierOrder: Tier[] = ['silver', 'gold', 'platinum'];
  const isUnlocked = tierOrder.indexOf(currentTier) >= tierOrder.indexOf(perk.tier);
  const Icon = perk.icon;
  const tierConfig = TIERS[perk.tier];

  return (
    <div className={`relative flex items-start gap-3 p-4 rounded-2xl border transition-all ${
      isUnlocked
        ? 'bg-[hsl(var(--caby-card))] border-[hsl(var(--caby-border))]'
        : 'bg-[hsl(var(--caby-card))]/50 border-[hsl(var(--caby-border))]/50 opacity-60'
    }`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
        isUnlocked ? tierConfig.gradient : 'bg-[hsl(var(--caby-border))]'
      }`}>
        <Icon className={`w-5 h-5 ${isUnlocked ? 'text-black' : 'text-[hsl(var(--caby-muted))]'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-[hsl(var(--caby-text))]">{perk.title}</h4>
          {!isUnlocked && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tierConfig.gradient} text-black`}>
              {TIERS[perk.tier].label.split(' ')[1]}
            </span>
          )}
        </div>
        <p className="text-xs text-[hsl(var(--caby-muted))] mt-0.5">{perk.description}</p>
      </div>
      {isUnlocked && <ChevronRight className="w-4 h-4 text-[hsl(var(--caby-muted))] flex-shrink-0 mt-1" />}
    </div>
  );
};

const DriverClubPage: React.FC = () => {
  const tier = TIERS[CURRENT_TIER];
  const TierIcon = tier.icon;

  const progressPercent = tier.nextPoints
    ? Math.min(((CURRENT_POINTS - tier.points) / (tier.nextPoints - tier.points)) * 100, 100)
    : 100;
  const pointsRemaining = tier.nextPoints ? tier.nextPoints - CURRENT_POINTS : 0;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-xl font-display font-bold text-[hsl(var(--caby-text))]">
          Caby Privilège
        </h1>
        <p className="text-xs text-[hsl(var(--caby-muted))] mt-0.5">par TATFleet</p>
      </div>

      {/* Membership Card */}
      <div className="px-5 mb-6">
        <div className={`relative overflow-hidden rounded-3xl p-6 ${tier.gradient} ${tier.glowColor}`}>
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -right-4 -bottom-10 w-24 h-24 rounded-full bg-white/5" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-black/20 flex items-center justify-center backdrop-blur-sm">
                <TierIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-white">{tier.label}</h2>
                <p className="text-xs text-white/70">{CURRENT_POINTS} points accumulés</p>
              </div>
            </div>

            {tier.next && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] text-white/70">Prochain palier : {tier.next}</span>
                  <span className="text-[11px] font-semibold text-white">{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/90 rounded-full transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-white/60 mt-1.5">
                  Encore {pointsRemaining} points pour devenir {tier.next}
                </p>
              </div>
            )}

            {!tier.next && (
              <p className="text-xs text-white/70 mt-2">🎉 Vous avez atteint le rang maximum !</p>
            )}
          </div>
        </div>
      </div>

      {/* Perks Sections */}
      <div className="px-5 space-y-6">
        {/* Operational */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-caby-gold" />
            <h3 className="text-sm font-display font-bold text-[hsl(var(--caby-text))]">
              Avantages Opérationnels
            </h3>
            <span className="text-[10px] text-[hsl(var(--caby-muted))] ml-auto">Caby</span>
          </div>
          <div className="space-y-2">
            {operationalPerks.map((p) => <PerkCard key={p.title} perk={p} currentTier={CURRENT_TIER} />)}
          </div>
        </section>

        {/* Social */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-caby-blue" />
            <h3 className="text-sm font-display font-bold text-[hsl(var(--caby-text))]">
              Avantages Sociaux
            </h3>
            <span className="text-[10px] text-[hsl(var(--caby-muted))] ml-auto">TATFleet</span>
          </div>
          <div className="space-y-2">
            {socialPerks.map((p) => <PerkCard key={p.title} perk={p} currentTier={CURRENT_TIER} />)}
          </div>
        </section>

        {/* Lifestyle */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-caby-green" />
            <h3 className="text-sm font-display font-bold text-[hsl(var(--caby-text))]">
              Avantages Lifestyle
            </h3>
            <span className="text-[10px] text-[hsl(var(--caby-muted))] ml-auto">Genève</span>
          </div>
          <div className="space-y-2">
            {lifestylePerks.map((p) => <PerkCard key={p.title} perk={p} currentTier={CURRENT_TIER} />)}
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="px-5 mt-8 mb-4">
        <p className="text-[10px] text-[hsl(var(--caby-muted))] text-center">
          TATFleet LSE Certified · ENCRYPTED_STREAM_V2_ACTIVE
        </p>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default DriverClubPage;
