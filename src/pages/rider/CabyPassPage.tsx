import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Star, Zap, Crown, Gift, TrendingUp, Plane, Mountain, Award } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const plans = [
  {
    id: 'free',
    name: 'Pass Découverte',
    price: 0,
    icon: Star,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    borderColor: 'border-border',
    features: [
      'Prix standard sur tous les trajets',
      'Accès Flash Deals 24h après les abonnés',
      'Aucun avantage supplémentaire',
    ],
    discount: 0,
    badge: null,
  },
  {
    id: 'voyageur',
    name: 'Pass Voyageur',
    price: 29,
    icon: Zap,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    popular: true,
    features: [
      '-10% sur tous les trajets Van et Cross-Border',
      'Accès Flash Deals en priorité',
      'Annulation flexible incluse',
      '1 bagage gratuit par trajet',
      'Badge "Voyageur Premium" sur le profil',
    ],
    discount: 10,
    badge: '✨ Voyageur Premium',
  },
  {
    id: 'business',
    name: 'Pass Business',
    price: 79,
    icon: Crown,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    features: [
      '-20% sur tous les trajets',
      'Facturation mensuelle groupée',
      'Chauffeur préféré assigné si disponible',
      'Flash Deals en exclusivité 2h avant tous',
      'Support prioritaire',
      'Badge "Business Class" sur le profil',
    ],
    discount: 20,
    badge: '👔 Business Class',
  },
];

const milesRewards = [
  { miles: 100, reward: 'CHF 5 de crédit', icon: '🎁' },
  { miles: 300, reward: '1 trajet Genève–Lausanne offert', icon: '🚐' },
  { miles: 500, reward: '1 trajet Genève–Zurich offert', icon: '🏔️' },
  { miles: 1000, reward: 'Week-end ski offert (aller-retour)', icon: '🎿' },
  { miles: 2000, reward: 'Pass Voyageur 1 mois offert', icon: '⭐' },
];

const CabyPassPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [activated, setActivated] = useState(false);

  // Simulated user miles
  const userMiles = 342;
  const nextReward = milesRewards.find(r => r.miles > userMiles) || milesRewards[milesRewards.length - 1];
  const prevMilestone = milesRewards.filter(r => r.miles <= userMiles).pop();
  const progressBase = prevMilestone ? prevMilestone.miles : 0;
  const progressPercent = ((userMiles - progressBase) / (nextReward.miles - progressBase)) * 100;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-14 pb-8">
        <button onClick={() => navigate('/caby/offers')} className="flex items-center gap-1 text-muted-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Offres
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">⭐</span>
            <h1 className="text-2xl font-bold tracking-tight">Caby Pass</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Économisez sur chaque trajet avec l'abonnement qui vous correspond</p>

          {/* Plans */}
          <div className="space-y-4">
            {plans.map((plan) => {
              const isSelected = selectedTier === plan.id;
              const Icon = plan.icon;
              return (
                <motion.button
                  key={plan.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTier(plan.id)}
                  className={`w-full text-left rounded-2xl border p-5 transition-all relative ${
                    isSelected ? `${plan.borderColor} ${plan.bgColor} shadow-lg` : 'border-border bg-card'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider">
                      Populaire
                    </span>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? plan.bgColor : 'bg-muted'}`}>
                        <Icon className={`w-5 h-5 ${isSelected ? plan.color : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <p className="font-bold">{plan.name}</p>
                        {plan.badge && <p className="text-[11px] font-medium mt-0.5" style={{ color: 'hsl(var(--primary))' }}>{plan.badge}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black">{plan.price === 0 ? 'Gratuit' : `CHF ${plan.price}`}</p>
                      {plan.price > 0 && <p className="text-[10px] text-muted-foreground">/mois</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isSelected ? plan.color : 'text-muted-foreground/50'}`} />
                        <p className="text-xs text-muted-foreground">{f}</p>
                      </div>
                    ))}
                  </div>

                  {plan.discount > 0 && (
                    <div className={`mt-4 p-2.5 rounded-xl text-center ${isSelected ? plan.bgColor : 'bg-muted/50'}`}>
                      <p className={`text-sm font-bold ${isSelected ? plan.color : 'text-muted-foreground'}`}>
                        -{plan.discount}% sur tous les trajets
                      </p>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* CTA */}
          <AnimatePresence mode="wait">
            {activated ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-5 text-center"
              >
                <Check className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-lg">{plans.find(p => p.id === selectedTier)?.name} activé !</p>
                <p className="text-xs text-muted-foreground mt-1">Vos réductions s'appliquent automatiquement sur chaque réservation</p>
              </motion.div>
            ) : (
              <Button
                onClick={() => { if (selectedTier && selectedTier !== 'free') setActivated(true); }}
                disabled={!selectedTier || selectedTier === 'free'}
                className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-12"
              >
                {!selectedTier
                  ? 'Sélectionnez un pass'
                  : selectedTier === 'free'
                  ? 'Gratuit — déjà inclus'
                  : `Activer pour CHF ${plans.find(p => p.id === selectedTier)?.price}/mois`}
              </Button>
            )}
          </AnimatePresence>

          {/* Caby Miles */}
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🎯</span>
              <h2 className="text-lg font-bold">Caby Miles</h2>
            </div>

            {/* User progress */}
            <div className="rounded-2xl bg-card border border-border p-5 mb-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold">Vos Miles</p>
                <p className="text-2xl font-black text-primary">{userMiles}</p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Plus que <span className="font-bold text-foreground">{nextReward.miles - userMiles} Miles</span> pour : {nextReward.reward}
              </p>
              <Progress value={progressPercent} className="h-2 mb-2" />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{progressBase} Miles</span>
                <span>{nextReward.miles} Miles</span>
              </div>
            </div>

            {/* Rewards ladder */}
            <div className="rounded-2xl bg-card border border-border p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                1 CHF dépensé = 1 Caby Mile
              </p>
              <div className="space-y-3">
                {milesRewards.map((r) => {
                  const unlocked = userMiles >= r.miles;
                  return (
                    <div key={r.miles} className={`flex items-center justify-between text-sm rounded-xl p-3 ${unlocked ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{r.icon}</span>
                        <span className={unlocked ? 'font-medium' : 'text-muted-foreground'}>{r.reward}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${unlocked ? 'text-primary' : 'text-muted-foreground'}`}>{r.miles}</span>
                        {unlocked && <Check className="w-4 h-4 text-primary" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Miles history */}
            <div className="mt-4 rounded-2xl bg-card border border-border p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Derniers Miles gagnés</p>
              <div className="space-y-2">
                {[
                  { date: '5 avr.', route: 'Genève → Lausanne', miles: 35 },
                  { date: '2 avr.', route: 'Annemasse → Genève', miles: 18 },
                  { date: '28 mars', route: 'Genève → Zurich', miles: 89 },
                ].map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-12">{h.date}</span>
                      <span>{h.route}</span>
                    </div>
                    <span className="font-bold text-primary">+{h.miles}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
};

export default CabyPassPage;
