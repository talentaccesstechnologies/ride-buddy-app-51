import React, { useState } from 'react';
import { Tag, Gift, Users, ChevronRight, Copy, Check, Percent } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';
import { Button } from '@/components/ui/button';

const activePromos = [
  { id: '1', code: 'BIENVENUE10', discount: '10% de réduction', desc: 'Sur votre prochaine course', expires: '28 Fév 2026' },
  { id: '2', code: 'AEROPORT5', discount: 'CHF 5 offerts', desc: 'Sur les courses vers l\'aéroport', expires: '15 Mar 2026' },
];

const OffersPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [promoInput, setPromoInput] = useState('');

  const handleCopyCode = () => {
    navigator.clipboard.writeText('CABY-2026');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-14 pb-6 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Offres</h1>

        {/* Promo code input */}
        <section>
          <h2 className="text-lg font-bold mb-3">Ajouter un code promo</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Entrer un code"
              className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
            <Button className="bg-primary text-primary-foreground rounded-xl px-5">
              <Tag className="w-4 h-4" />
            </Button>
          </div>
        </section>

        {/* Active promos */}
        <section>
          <h2 className="text-lg font-bold mb-3">Promotions actives</h2>
          <div className="space-y-3">
            {activePromos.map((promo) => (
              <div
                key={promo.id}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/15 rounded-lg flex items-center justify-center">
                    <Percent className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{promo.discount}</p>
                    <p className="text-xs text-muted-foreground">{promo.desc}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2 mt-2">
                  <span className="text-xs font-mono font-bold">{promo.code}</span>
                  <span className="text-xs text-muted-foreground">Expire le {promo.expires}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Referral */}
        <section>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Inviter des amis</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Gagnez <span className="text-foreground font-bold">CHF 10</span> pour chaque ami qui prend sa première course.
            </p>
            <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-3">
              <span className="flex-1 text-sm font-mono font-bold tracking-wider">CABY-2026</span>
              <button onClick={handleCopyCode} className="p-1">
                {copied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
            <Button className="w-full mt-3 bg-primary text-primary-foreground">
              <Gift className="w-4 h-4 mr-2" />
              Partager mon code
            </Button>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
};

export default OffersPage;
