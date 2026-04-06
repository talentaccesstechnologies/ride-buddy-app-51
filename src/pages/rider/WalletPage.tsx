import React, { useEffect, useState } from 'react';
import { ArrowLeft, Wallet, Gift, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import BottomNav from '@/components/rider/BottomNav';

interface Compensation {
  id: string;
  amount: number;
  compensation_type: string;
  description: string | null;
  is_used: boolean | null;
  expires_at: string | null;
  created_at: string;
}

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const [compensations, setCompensations] = useState<Compensation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('incident_compensations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setCompensations(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const activeCredits = compensations.filter(c => !c.is_used);
  const totalBalance = activeCredits.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Retour</span>
        </button>
        <h1 className="text-2xl font-bold">Mon Wallet</h1>
      </div>

      {/* Balance Card */}
      <div className="px-5 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Solde disponible</p>
              <p className="text-3xl font-bold">CHF {totalBalance.toFixed(2)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Utilisable sur votre prochain trajet · Valable 12 mois
          </p>
        </motion.div>
      </div>

      {/* Active Credits */}
      <div className="px-5 mb-6">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Gift className="w-4 h-4 text-primary" />
          Crédits actifs ({activeCredits.length})
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : activeCredits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wallet className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Aucun crédit disponible</p>
            <p className="text-xs mt-1">Les compensations seront créditées ici automatiquement</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeCredits.map(c => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                    {c.compensation_type === 'voucher' ? '🎫' : '💰'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">CHF {c.amount}</p>
                    <p className="text-xs text-muted-foreground">{c.description || 'Crédit Caby'}</p>
                  </div>
                </div>
                {c.expires_at && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Exp. {new Date(c.expires_at).toLocaleDateString('fr-CH', { month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      {compensations.filter(c => c.is_used).length > 0 && (
        <div className="px-5">
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground">Historique utilisé</h2>
          <div className="space-y-2">
            {compensations.filter(c => c.is_used).map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border opacity-60">
                <div>
                  <p className="text-sm line-through">CHF {c.amount}</p>
                  <p className="text-xs text-muted-foreground">{c.description}</p>
                </div>
                <span className="text-xs text-muted-foreground">Utilisé</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default WalletPage;
