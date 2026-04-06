import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Star, Zap, Crown, Shield } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';
import { Button } from '@/components/ui/button';
import { CABY_PASS_TIERS } from '@/utils/refundPolicy';

const CabyPassPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [activated, setActivated] = useState(false);

  const tierIcons: Record<string, React.ReactNode> = {
    free: <Star className="w-5 h-5" />,
    voyageur: <Zap className="w-5 h-5" />,
    business: <Crown className="w-5 h-5" />,
  };

  const handleActivate = () => {
    if (!selectedTier || selectedTier === 'free') return;
    setActivated(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-14 pb-8">
        <button onClick={() => navigate('/caby/offers')} className="flex items-center gap-1 text-muted-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Offres
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⭐</span>
            <h1 className="text-2xl font-bold tracking-tight">Caby Pass</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Choisissez le pass qui correspond à vos besoins</p>

          {/* Tiers */}
          <div className="space-y-4">
            {CABY_PASS_TIERS.map((tier) => {
              const isSelected = selectedTier === tier.id;
              const isBest = tier.id === 'voyageur';
              return (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all relative ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                      : 'border-border bg-card'
                  }`}
                >
                  {isBest && (
                    <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                      POPULAIRE
                    </span>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {tierIcons[tier.id]}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{tier.name}</p>
                        {tier.badge && <p className="text-[10px] text-primary font-medium">{tier.badge}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black">
                        {tier.price === 0 ? 'Gratuit' : `CHF ${tier.price}`}
                      </p>
                      {tier.price > 0 && <p className="text-[10px] text-muted-foreground">/mois</p>}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {tier.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="text-xs text-muted-foreground">{f}</p>
                      </div>
                    ))}
                  </div>
                  {tier.discount > 0 && (
                    <div className="mt-3 p-2 rounded-lg bg-primary/10 text-center">
                      <p className="text-xs font-bold text-primary">-{tier.discount}% sur tous les trajets</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* CTA */}
          {activated ? (
            <div className="mt-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center">
              <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold">
                {CABY_PASS_TIERS.find(t => t.id === selectedTier)?.name} activé !
              </p>
              <p className="text-xs text-muted-foreground mt-1">Vos réductions sont appliquées automatiquement</p>
            </div>
          ) : (
            <Button
              onClick={handleActivate}
              disabled={!selectedTier || selectedTier === 'free'}
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-12"
            >
              {!selectedTier
                ? 'Sélectionnez un pass'
                : selectedTier === 'free'
                ? 'Gratuit — déjà inclus'
                : `Activer ${CABY_PASS_TIERS.find(t => t.id === selectedTier)?.name} — CHF ${CABY_PASS_TIERS.find(t => t.id === selectedTier)?.price}/mois`
              }
            </Button>
          )}

          {/* Caby Miles */}
          <div className="mt-8 rounded-2xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🎯</span>
              <h3 className="font-bold text-sm">Caby Miles</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">1 CHF dépensé = 1 Caby Mile</p>
            <div className="space-y-2">
              {[
                { miles: 100, reward: 'CHF 5 de crédit', icon: '🎁' },
                { miles: 300, reward: 'Trajet Genève-Lausanne offert', icon: '🚐' },
                { miles: 500, reward: 'Trajet Genève-Zurich offert', icon: '🏔️' },
                { miles: 1000, reward: 'Week-end ski offert', icon: '🎿' },
              ].map((r) => (
                <div key={r.miles} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground"><span className="mr-1">{r.icon}</span>{r.reward}</span>
                  <span className="font-bold">{r.miles} Miles</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
};

export default CabyPassPage;
