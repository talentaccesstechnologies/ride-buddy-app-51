import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, ShieldCheck, Clock, DollarSign } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';
import { Button } from '@/components/ui/button';

const CabyNightPage: React.FC = () => {
  const navigate = useNavigate();
  const now = new Date();
  const hour = now.getHours();
  const isNightTime = hour >= 22 || hour < 6;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-background to-background" />
        <div className="relative px-5 pt-14 pb-8">
          <button onClick={() => navigate('/caby/services')} className="flex items-center gap-1 text-muted-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Services
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌙</span>
              <h1 className="text-2xl font-bold tracking-tight">Caby Night</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {isNightTime ? 'Actif maintenant' : '22h–06h'}
              </span>
            </div>

            <p className="text-xl font-bold mt-4">Votre chauffeur de nuit. Sécurisé. Premium.</p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Service nocturne avec chauffeurs certifiés, véhicules premium et sécurité renforcée. Disponible de 22h00 à 06h00.
            </p>

            {/* Night mode status */}
            <div className={`mt-6 rounded-2xl p-4 border ${isNightTime ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-muted/20 border-border'}`}>
              <div className="flex items-center gap-3">
                <Moon className={`w-6 h-6 ${isNightTime ? 'text-indigo-400' : 'text-muted-foreground'}`} />
                <div>
                  <p className="font-bold text-sm">{isNightTime ? '🌙 Mode Nuit activé' : 'Mode Nuit disponible à 22h00'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Tarif nuit : +30% sur le prix Ride standard</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-6 space-y-3">
              {[
                { icon: ShieldCheck, title: 'Sécurité renforcée', desc: 'Suivi GPS en direct · Partage de trajet · Alerte SOS' },
                { icon: Clock, title: '22h00 — 06h00', desc: 'Chauffeurs certifiés « Contrat Nuit » prioritaires' },
                { icon: DollarSign, title: 'Tarif transparent', desc: '+30% automatiquement appliqué · Affiché avant confirmation' },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-card border border-border p-4">
                  <f.icon className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold">{f.title}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing example */}
            <div className="mt-6 rounded-2xl bg-card border border-border p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Exemple de tarification</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Course standard (jour)</span>
                  <span>CHF 25.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tarif nuit (+30%)</span>
                  <span className="text-indigo-400">+ CHF 7.50</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-sm font-bold">
                  <span>Total nuit</span>
                  <span>CHF 32.50</span>
                </div>
              </div>
            </div>

            <Button onClick={() => navigate('/caby/search')} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-12">
              Commander une course de nuit
            </Button>
          </motion.div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default CabyNightPage;
