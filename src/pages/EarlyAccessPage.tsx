import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Gift, Share2, Copy, Check, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const EarlyAccessPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [route, setRoute] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [referralCode] = useState('CABY-' + Math.random().toString(36).substring(2, 8).toUpperCase());
  const [copied, setCopied] = useState(false);

  const waitlistCount = 1247;
  const referralCount = 3;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsRegistered(true);
    toast.success('Bienvenue dans la communauté Caby !', {
      description: 'Vous êtes parmi les premiers inscrits',
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Code copié !');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative px-5 pt-20 pb-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <span className="text-5xl">🚐</span>
          <h1 className="text-3xl font-black tracking-tight mt-4">Caby Van arrive bientôt.</h1>
          <p className="text-lg text-muted-foreground mt-2">Soyez parmi les premiers.</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">{waitlistCount.toLocaleString('fr-CH')} personnes déjà inscrites</span>
          </div>
        </motion.div>
      </div>

      <div className="px-5 pb-20 max-w-md mx-auto space-y-8">
        {!isRegistered ? (
          /* Registration form */
          <motion.form onSubmit={handleRegister} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="w-full mt-1 h-11 rounded-xl bg-card border border-border px-4 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Ville de départ habituelle</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="ex: Genève"
                className="w-full mt-1 h-11 rounded-xl bg-card border border-border px-4 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Route principale</label>
              <input
                type="text"
                value={route}
                onChange={e => setRoute(e.target.value)}
                placeholder="ex: Genève → Zurich"
                className="w-full mt-1 h-11 rounded-xl bg-card border border-border px-4 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground font-bold h-12 rounded-xl">
              <Rocket className="w-4 h-4 mr-2" /> Réserver ma place
            </Button>
          </motion.form>
        ) : (
          /* Post-registration */
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            {/* Confirmation */}
            <div className="text-center p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <Check className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-lg">Vous êtes inscrit !</p>
              <p className="text-sm text-muted-foreground mt-1">Nous vous notifierons au lancement</p>
            </div>

            {/* Referral */}
            <div className="rounded-2xl bg-card border border-border p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Parrainage viral</h3>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>🎁 Parrainez 3 amis → <strong className="text-foreground">votre premier trajet offert</strong></p>
                <p>🚐 Parrainez 10 amis → <strong className="text-foreground">1 mois de trajets illimités</strong></p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-10 rounded-lg bg-background border border-border flex items-center px-3">
                  <span className="text-sm font-mono font-bold">{referralCode}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleCopyCode} className="h-10">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" className="h-10" onClick={() => toast.info('Partage lancé')}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-center">
                <p className="text-xs text-primary font-medium">
                  Vous avez parrainé <strong>{referralCount} amis</strong> · Plus que {Math.max(0, 3 - referralCount)} pour votre trajet offert !
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Early adopters */}
        <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <h3 className="font-bold text-sm">Offre Early Adopters — 500 premiers</h3>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>🏅 Badge permanent <strong className="text-primary">"Fondateur Caby"</strong> sur votre profil</p>
            <p>💰 <strong className="text-foreground">-20%</strong> sur tous vos trajets pendant 6 mois</p>
            <p>⚡ Accès prioritaire aux Flash Deals</p>
            <p>💬 Invitation au groupe Telegram VIP Caby</p>
          </div>
        </div>

        {/* Driver offer */}
        <div className="rounded-2xl bg-card border border-primary/20 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚗</span>
            <h3 className="font-bold text-sm">Offre Chauffeurs — 50 premiers</h3>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>💵 Bonus <strong className="text-primary">CHF 500</strong> après 20 trajets</p>
            <p>📉 Commission réduite à <strong className="text-foreground">8%</strong> pendant 3 mois</p>
            <p>🏅 Badge <strong className="text-primary">"Chauffeur Fondateur"</strong></p>
            <p>🎯 Priorité absolue dans le dispatch</p>
          </div>
        </div>

        {/* Community counters */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🚗', label: 'Trajets effectués', value: '12\'847' },
            { icon: '👥', label: 'Voyageurs satisfaits', value: '8\'234' },
            { icon: '🌿', label: 'kg CO₂ économisés', value: '45\'120' },
            { icon: '💰', label: 'CHF économisés vs taxi', value: '234\'500' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-card border border-border p-3 text-center">
              <span className="text-lg">{stat.icon}</span>
              <p className="text-lg font-black mt-1">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EarlyAccessPage;
