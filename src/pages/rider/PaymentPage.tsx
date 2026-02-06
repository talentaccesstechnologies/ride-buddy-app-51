import React from 'react';
import { CreditCard, Wallet, Tag, Plus, FileText, ChevronRight, Trash2 } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';
import RiderHeader from '@/components/rider/RiderHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PaymentPage: React.FC = () => {
  const paymentMethods = [
    { id: '1', type: 'card', brand: 'Visa', lastFour: '4242', isDefault: true },
    { id: '2', type: 'card', brand: 'Mastercard', lastFour: '8888', isDefault: false },
  ];

  const promos = [
    { id: '1', code: 'BIENVENUE10', description: '-10% sur votre première course', expires: '31 Jan 2026' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <RiderHeader title="Paiement" />

      <div className="pt-16 px-4 space-y-6">
        {/* Payment Methods */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Méthodes de paiement</h2>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl"
              >
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{method.brand}</span>
                    {method.isDefault && (
                      <Badge variant="secondary" className="text-xs">Par défaut</Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">•••• {method.lastFour}</span>
                </div>
                <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))}

            {/* Cash option */}
            <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <span className="text-xl">💵</span>
              </div>
              <div className="flex-1">
                <span className="font-medium">Espèces</span>
                <p className="text-sm text-muted-foreground">Payez directement au chauffeur</p>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-2">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une carte
            </Button>
          </div>
        </section>

        {/* Wallet */}
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Portefeuille
          </h2>
          <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-xl p-5">
            <p className="text-sm opacity-80">Solde disponible</p>
            <p className="text-3xl font-bold mt-1">0,00 €</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
            >
              Recharger
            </Button>
          </div>
        </section>

        {/* Promo Codes */}
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Codes promo
          </h2>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Entrer un code promo"
              className="flex-1 h-12 px-4 bg-secondary rounded-xl border-0 focus:ring-2 focus:ring-accent"
            />
            <Button className="h-12">Appliquer</Button>
          </div>

          {promos.length > 0 && (
            <div className="space-y-2">
              {promos.map((promo) => (
                <div
                  key={promo.id}
                  className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl"
                >
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Tag className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{promo.code}</p>
                    <p className="text-sm text-muted-foreground">{promo.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Expire le {promo.expires}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Invoices */}
        <section>
          <button className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
            <FileText className="w-5 h-5" />
            <span className="flex-1 text-left font-medium">Factures</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </section>
      </div>

      <BottomNav />
    </div>
  );
};

export default PaymentPage;
