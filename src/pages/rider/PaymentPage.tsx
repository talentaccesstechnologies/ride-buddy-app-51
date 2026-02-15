import React from 'react';
import { CreditCard, Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight, Plus, Tag, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';
import RiderHeader from '@/components/rider/RiderHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PaymentPage: React.FC = () => {
  const transactions = [
    { id: '1', label: 'Course – Gare Cornavin', amount: -18.50, date: '15 Jan', type: 'debit' },
    { id: '2', label: 'Recharge portefeuille', amount: 50.00, date: '14 Jan', type: 'credit' },
    { id: '3', label: 'Course – Aéroport GVA', amount: -35.00, date: '12 Jan', type: 'debit' },
  ];

  const paymentMethods = [
    { id: '1', brand: 'Visa', lastFour: '4242', isDefault: true },
    { id: '2', brand: 'Mastercard', lastFour: '8888', isDefault: false },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <RiderHeader title="Portefeuille" />

      <div className="pt-16 px-4 space-y-5">
        {/* Balance card */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Solde</span>
          </div>
          <p className="text-3xl font-bold">31.50 <span className="text-lg font-medium text-muted-foreground">CHF</span></p>
          <div className="flex gap-2 mt-4">
            <Button size="sm" className="flex-1 bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-1" />
              Recharger
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              Détails
            </Button>
          </div>
        </div>

        {/* Recent transactions */}
        <section>
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Transactions récentes</h2>
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 bg-card border border-border rounded-xl p-3"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  tx.type === 'credit' 
                    ? 'bg-[hsl(var(--caby-green))]/15' 
                    : 'bg-card border border-border'
                }`}>
                  {tx.type === 'credit' 
                    ? <ArrowDownLeft className="w-4 h-4 text-[hsl(var(--caby-green))]" />
                    : <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{tx.label}</p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
                <span className={`text-sm font-bold ${
                  tx.type === 'credit' ? 'text-[hsl(var(--caby-green))]' : ''
                }`}>
                  {tx.type === 'credit' ? '+' : ''}{tx.amount.toFixed(2)} CHF
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Payment methods */}
        <section>
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Moyens de paiement</h2>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl"
              >
                <div className="w-9 h-9 bg-card border border-border rounded-xl flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{method.brand}</span>
                    {method.isDefault && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Par défaut</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">•••• {method.lastFour}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}

            <Button variant="outline" size="sm" className="w-full mt-1">
              <Plus className="w-4 h-4 mr-1" />
              Ajouter une carte
            </Button>
          </div>
        </section>

        {/* Promo */}
        <section>
          <button className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
            <div className="w-9 h-9 bg-primary/15 rounded-xl flex items-center justify-center">
              <Tag className="w-4 h-4 text-primary" />
            </div>
            <span className="flex-1 text-left text-sm font-medium">Codes promo</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </section>
      </div>

      <BottomNav />
    </div>
  );
};

export default PaymentPage;
