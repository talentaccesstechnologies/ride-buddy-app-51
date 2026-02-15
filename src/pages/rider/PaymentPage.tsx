import React, { useState } from 'react';
import { CreditCard, Wallet, Plus, Tag, ChevronRight, Users, Smartphone, Gift, Briefcase, User, Copy, Check } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PaymentPage: React.FC = () => {
  const [activeProfile, setActiveProfile] = useState<'personal' | 'business'>('personal');
  const [copied, setCopied] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  const paymentMethods = [
    { id: '1', brand: 'Visa', lastFour: '4242', isDefault: true },
    { id: '2', brand: 'Mastercard', lastFour: '8888', isDefault: false },
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText('CABY-2026');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-14 pb-6 space-y-6">
        {/* Title */}
        <h1 className="text-3xl font-bold tracking-tight">Portefeuille</h1>

        {/* Profile toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveProfile('personal')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeProfile === 'personal'
                ? 'bg-foreground text-background'
                : 'bg-card border border-border text-muted-foreground'
            }`}
          >
            <User className="w-4 h-4" />
            Personnel
          </button>
          <button
            onClick={() => setActiveProfile('business')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeProfile === 'business'
                ? 'bg-foreground text-background'
                : 'bg-card border border-border text-muted-foreground'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Business
          </button>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Caby Cash</span>
            </div>
            <p className="text-2xl font-bold">31.50 <span className="text-sm font-medium text-muted-foreground">CHF</span></p>
            <Button size="sm" className="w-full mt-3 bg-primary text-primary-foreground text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Recharger
            </Button>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Vouchers</span>
            </div>
            <p className="text-2xl font-bold">2 <span className="text-sm font-medium text-muted-foreground">actifs</span></p>
            <Button size="sm" variant="outline" className="w-full mt-3 text-xs">
              Voir les bons
            </Button>
          </div>
        </div>

        {/* Payment methods */}
        <section>
          <h2 className="text-lg font-bold mb-3">Moyens de paiement</h2>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl"
              >
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{method.brand}</span>
                    {method.isDefault && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Par défaut</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">•••• {method.lastFour}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}

            {/* Mobile payments */}
            <button className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl text-left hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-lg">🍎</span>
              </div>
              <span className="flex-1 text-sm font-bold">Apple Pay</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl text-left hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-lg">🔵</span>
              </div>
              <span className="flex-1 text-sm font-bold">Google Pay</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center gap-3 p-4 bg-[hsl(160,60%,15%)] border border-[hsl(160,60%,25%)] rounded-xl text-left hover:border-[hsl(160,60%,35%)] transition-colors">
              <div className="w-10 h-10 bg-[hsl(160,60%,25%)] rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-[hsl(160,60%,60%)]" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-[hsl(160,60%,80%)]">Twint</span>
                <p className="text-xs text-[hsl(160,60%,50%)]">Recharger via Twint Cash</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[hsl(160,60%,50%)]" />
            </button>

            <Button variant="outline" className="w-full mt-1">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un mode de paiement
            </Button>
          </div>
        </section>

        {/* Promo code */}
        <section>
          <h2 className="text-lg font-bold mb-3">Code promo</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Entrer un code promo"
              className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
            <Button className="bg-primary text-primary-foreground rounded-xl px-5">
              <Tag className="w-4 h-4" />
            </Button>
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
              Gagnez <span className="text-foreground font-bold">CHF 10</span> pour chaque ami qui prend sa première course avec Caby.
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
              Partager mon code
            </Button>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
};

export default PaymentPage;
