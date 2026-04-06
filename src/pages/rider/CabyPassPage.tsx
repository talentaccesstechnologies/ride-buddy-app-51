import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Star, Zap, X as XIcon, Clock, Shield, Tag } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';
import { Button } from '@/components/ui/button';

const benefits = [
  { icon: Tag, text: '-10% sur toutes les courses Ride, Van, Moto, Tricycle' },
  { icon: Zap, text: 'Priorité dispatch — ton chauffeur arrive plus vite' },
  { icon: XIcon, text: 'Zéro frais d\'annulation (normalement CHF 5)' },
  { icon: Clock, text: 'Accès aux créneaux Caby Van avant tout le monde' },
  { icon: Star, text: 'Badge "Pass Member" visible sur ton profil' },
];

const CabyPassPage: React.FC = () => {
  const navigate = useNavigate();
  const [activated, setActivated] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-14 pb-8">
        <button onClick={() => navigate('/caby/offers')} className="flex items-center gap-1 text-muted-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Offres
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">⭐</span>
            <h1 className="text-2xl font-bold tracking-tight">Caby Pass</h1>
          </div>

          {/* Price hero */}
          <div className="mt-4 rounded-2xl bg-gradient-to-br from-[hsl(43,75%,52%)]/20 to-[hsl(43,75%,52%)]/5 border border-[hsl(43,75%,52%)]/30 p-6 text-center">
            <p className="text-4xl font-black">CHF 29<span className="text-lg font-bold text-muted-foreground">/mois</span></p>
            <p className="text-sm text-muted-foreground mt-2">Économisez sur chaque course</p>
          </div>

          {/* Benefits */}
          <div className="mt-6 space-y-3">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-card border border-border p-3.5">
                <div className="w-8 h-8 rounded-lg bg-[hsl(43,75%,52%)]/15 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-[hsl(43,75%,52%)]" />
                </div>
                <p className="text-sm mt-1">{b.text}</p>
              </div>
            ))}
          </div>

          {/* Comparison */}
          <div className="mt-6 rounded-2xl bg-card border border-border p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Économies par course</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sans Pass</span>
                <span>CHF 78.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avec Pass (-10%)</span>
                <span className="text-[hsl(43,75%,52%)] font-bold">CHF 70.20</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Économie par course</span>
                <span className="text-emerald-400 font-bold">CHF 7.80</span>
              </div>
              <div className="border-t border-border pt-2 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Amorti en <span className="font-bold text-foreground">4 courses</span></span>
              </div>
            </div>
          </div>

          {/* CTA */}
          {activated ? (
            <div className="mt-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center">
              <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold">Caby Pass activé !</p>
              <p className="text-xs text-muted-foreground mt-1">Vos réductions sont appliquées automatiquement</p>
            </div>
          ) : (
            <Button onClick={() => setActivated(true)} className="w-full mt-6 bg-[hsl(43,75%,52%)] hover:bg-[hsl(43,75%,45%)] text-black font-bold rounded-xl h-12">
              Activer mon Caby Pass — CHF 29/mois
            </Button>
          )}
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
};

export default CabyPassPage;
