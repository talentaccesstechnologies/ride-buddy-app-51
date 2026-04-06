import React, { useState } from 'react';
import { ArrowLeft, MapPin, Clock, X, AlertTriangle, Wallet, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { calculateRefund, formatRefundPreview } from '@/utils/refundPolicy';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/rider/BottomNav';

// Simulated reservations for demo
const MOCK_RESERVATIONS = [
  {
    id: 'res-1',
    from: 'Genève',
    to: 'Zurich',
    date: new Date(Date.now() + 72 * 60 * 60 * 1000), // in 3 days
    price: 77,
    seat: 'A2',
    hasFlexCancellation: true,
    status: 'confirmed' as const,
    service: 'Caby Van',
  },
  {
    id: 'res-2',
    from: 'Genève',
    to: 'Annemasse',
    date: new Date(Date.now() + 4 * 60 * 60 * 1000), // in 4 hours
    price: 15,
    seat: 'B1',
    hasFlexCancellation: false,
    status: 'confirmed' as const,
    service: 'Cross-Border',
  },
  {
    id: 'res-3',
    from: 'Lausanne',
    to: 'Genève',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
    price: 29,
    seat: 'A1',
    hasFlexCancellation: false,
    status: 'completed' as const,
    service: 'Caby Van',
  },
];

const MyReservationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmStep, setConfirmStep] = useState<1 | 2>(1);
  const [cancelled, setCancelled] = useState<Set<string>>(new Set());

  const handleCancelClick = (id: string) => {
    setCancellingId(id);
    setConfirmStep(1);
  };

  const handleConfirmCancel = () => {
    if (confirmStep === 1) {
      setConfirmStep(2);
    } else {
      setCancelled(prev => new Set(prev).add(cancellingId!));
      setCancellingId(null);
      setConfirmStep(1);
    }
  };

  const cancellingReservation = MOCK_RESERVATIONS.find(r => r.id === cancellingId);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Retour</span>
        </button>
        <h1 className="text-2xl font-bold">Mes Réservations</h1>
      </div>

      {/* Reservations List */}
      <div className="px-5 space-y-3">
        {MOCK_RESERVATIONS.map(res => {
          const isCancelled = cancelled.has(res.id);
          const isPast = res.date < new Date();
          const hoursUntil = (res.date.getTime() - Date.now()) / (1000 * 60 * 60);
          const refund = calculateRefund(res.price, res.hasFlexCancellation, hoursUntil, false);

          return (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border p-4 space-y-3 ${
                isCancelled ? 'bg-muted/50 border-border opacity-60' :
                isPast ? 'bg-card border-border' :
                'bg-card border-border'
              }`}
            >
              {/* Service badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {res.service}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  isCancelled ? 'bg-destructive/10 text-destructive' :
                  isPast ? 'bg-muted text-muted-foreground' :
                  'bg-emerald-500/10 text-emerald-600'
                }`}>
                  {isCancelled ? 'Annulé' : isPast ? 'Terminé' : 'Confirmé'}
                </span>
              </div>

              {/* Route */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div className="w-px h-6 bg-border" />
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-semibold">{res.from}</p>
                  <p className="text-sm font-semibold">{res.to}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">CHF {res.price}</p>
                  <p className="text-xs text-muted-foreground">Siège {res.seat}</p>
                </div>
              </div>

              {/* Date & flex */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{res.date.toLocaleDateString('fr-CH', { weekday: 'short', day: 'numeric', month: 'short' })} · {res.date.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {res.hasFlexCancellation && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">✓ Flex</span>
                )}
              </div>

              {/* Cancel button */}
              {!isPast && !isCancelled && (
                <div className="space-y-2">
                  {/* Refund preview */}
                  <p className="text-xs text-muted-foreground">
                    💡 {formatRefundPreview(res.price, res.hasFlexCancellation, res.date)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => handleCancelClick(res.id)}
                  >
                    Annuler cette réservation
                  </Button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {cancellingId && cancellingReservation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setCancellingId(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-[390px] bg-card rounded-t-3xl p-5 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  {confirmStep === 1 ? 'Annuler la réservation ?' : 'Confirmer l\'annulation'}
                </h2>
                <button onClick={() => setCancellingId(null)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Trip summary */}
              <div className="p-3 rounded-xl bg-background border border-border">
                <p className="font-semibold text-sm">{cancellingReservation.from} → {cancellingReservation.to}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {cancellingReservation.date.toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long' })} · {cancellingReservation.date.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Refund calculation */}
              {(() => {
                const hoursUntil = (cancellingReservation.date.getTime() - Date.now()) / (1000 * 60 * 60);
                const refund = calculateRefund(cancellingReservation.price, cancellingReservation.hasFlexCancellation, hoursUntil, false);
                return (
                  <div className={`p-4 rounded-xl border ${
                    refund.refundAmount > 0
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-destructive/5 border-destructive/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="w-4 h-4 text-primary" />
                      <p className="font-semibold text-sm">{refund.refundLabel}</p>
                    </div>
                    {refund.refundAmount > 0 ? (
                      <>
                        <p className="text-2xl font-bold">CHF {refund.refundAmount}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {refund.isWalletCredit
                            ? '→ Crédité sur votre Wallet Caby · Valable 12 mois'
                            : '→ Remboursement sur votre moyen de paiement'}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-destructive">Aucun remboursement possible à ce stade</p>
                    )}
                  </div>
                );
              })()}

              {/* Step indicator */}
              {confirmStep === 2 && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30">
                  <p className="text-xs text-destructive font-medium">
                    ⚠️ Cette action est irréversible. Votre siège sera remis en vente.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCancellingId(null)}
                >
                  Garder
                </Button>
                <Button
                  className={`flex-1 ${confirmStep === 2 ? 'bg-destructive hover:bg-destructive/90 text-white' : ''}`}
                  variant={confirmStep === 1 ? 'default' : 'destructive'}
                  onClick={handleConfirmCancel}
                >
                  {confirmStep === 1 ? 'Oui, annuler' : '⚠️ Confirmer définitivement'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default MyReservationsPage;
