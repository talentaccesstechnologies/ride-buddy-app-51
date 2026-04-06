import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, ShieldCheck, Clock, DollarSign, Car, MapPin, Star } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';
import { Button } from '@/components/ui/button';

const CabyNightPage: React.FC = () => {
  const navigate = useNavigate();
  const now = new Date();
  const hour = now.getHours();
  const isNightTime = hour >= 22 || hour < 6;

  const nightRoutes = [
    { from: 'Aéroport GVA', to: 'Centre Genève', price: 45, time: '04h30' },
    { from: 'Pâquis', to: 'Carouge', price: 22, time: '01h15' },
    { from: 'Lausanne Flon', to: 'Genève Centre', price: 78, time: '23h00' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero with dark overlay */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-indigo-950/20 to-background" />
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 60}%` }}
              animate={{ opacity: [0.1, 0.6, 0.1] }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>
        <div className="relative px-5 pt-14 pb-8">
          <button onClick={() => navigate('/caby/services')} className="flex items-center gap-1 text-muted-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Services
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🌙</span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Caby Night</h1>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isNightTime ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-muted text-muted-foreground'
                }`}>
                  {isNightTime ? '● Actif maintenant' : 'Disponible 22h–06h'}
                </span>
              </div>
            </div>

            <p className="text-lg font-bold mt-4">Plus besoin de taxi à l'aube</p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Chauffeurs certifiés « Contrat Nuit », sécurité renforcée, véhicules premium. Chaque nuit, de 22h à 6h.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* Night status banner */}
        <div className={`rounded-2xl p-4 border ${isNightTime ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-muted/20 border-border'}`}>
          <div className="flex items-center gap-3">
            <Moon className={`w-6 h-6 ${isNightTime ? 'text-indigo-400' : 'text-muted-foreground'}`} />
            <div>
              <p className="font-bold text-sm">{isNightTime ? '🌙 Mode Nuit activé — Tarif nuit en vigueur' : 'Mode Nuit disponible dès 22h00'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Majoration transparente de +30% sur le tarif standard</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          {[
            { icon: ShieldCheck, title: 'Sécurité renforcée', desc: 'Suivi GPS en direct · Partage de trajet automatique · Alerte SOS', color: 'text-indigo-400' },
            { icon: Clock, title: 'Disponible 22h–06h', desc: 'Chauffeurs dédiés avec contrat nuit TATFleet', color: 'text-indigo-400' },
            { icon: DollarSign, title: 'Tarif transparent +30%', desc: 'Affiché clairement avant confirmation — pas de surprise', color: 'text-indigo-400' },
            { icon: Car, title: 'Aéroport early morning', desc: 'Vol à 6h ? Réservez la veille pour un départ à 3h30', color: 'text-indigo-400' },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 rounded-xl bg-card border border-border p-4"
            >
              <f.icon className={`w-5 h-5 ${f.color} mt-0.5 flex-shrink-0`} />
              <div>
                <p className="text-sm font-bold">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pricing example */}
        <div className="rounded-2xl bg-card border border-border p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Exemple de tarification</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Course standard (jour)</span>
              <span>CHF 25.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Majoration nuit (+30%)</span>
              <span className="text-indigo-400">+ CHF 7.50</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between text-sm font-bold">
              <span>Total nuit</span>
              <span>CHF 32.50</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 italic">
            Badge "🌙 Nuit" doré affiché sur toutes les courses nocturnes
          </p>
        </div>

        {/* Popular night routes */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Trajets populaires de nuit</p>
          <div className="space-y-2">
            {nightRoutes.map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-card border border-border p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <div>
                    <p className="text-sm font-medium">{r.from} → {r.to}</p>
                    <p className="text-[10px] text-muted-foreground">Départ typique {r.time}</p>
                  </div>
                </div>
                <p className="font-bold text-sm">CHF {r.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Night driver badge */}
        <div className="rounded-2xl bg-indigo-500/5 border border-indigo-500/20 p-5 text-center">
          <Star className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
          <p className="font-bold text-sm">Chauffeurs badge 🌙 Night Driver</p>
          <p className="text-xs text-muted-foreground mt-1">
            Formés pour les trajets nocturnes · Véhicule inspecté · Contrat nuit TATFleet
          </p>
        </div>

        <Button
          onClick={() => navigate('/caby/search')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-12"
        >
          {isNightTime ? 'Commander maintenant' : 'Réserver un trajet de nuit'}
        </Button>
      </div>
      <BottomNav />
    </div>
  );
};

export default CabyNightPage;
