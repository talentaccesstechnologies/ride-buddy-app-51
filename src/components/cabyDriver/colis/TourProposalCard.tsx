import React from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, MapPin, ChevronRight, Truck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TourProposal, serviceLabel } from './colisData';

interface Props {
  tour: TourProposal;
  onAccept: () => void;
  onShuffle: () => void;
}

const TourProposalCard: React.FC<Props> = ({ tour, onAccept, onShuffle }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Tournée proposée</h1>
            <p className="text-xs text-muted-foreground">Rayon 5km · Optimisée par Caby</p>
          </div>
        </div>
      </div>

      {/* Summary card */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-5 bg-card border border-border rounded-2xl p-5 mb-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold">{tour.items.length} livraisons</span>
          </div>
          <span className="text-xl font-bold text-primary">+{tour.totalPrice} CHF</span>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{tour.estimatedDuration}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{tour.totalDistance} km</span>
        </div>
      </motion.div>

      {/* Stops list */}
      <div className="flex-1 px-5 overflow-auto pb-40">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Arrêts optimisés
        </h2>
        <div className="space-y-2">
          {tour.items.map((item, i) => {
            const svc = serviceLabel(item.serviceType);
            return (
              <motion.div
                key={item.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 bg-card border border-border rounded-xl p-3"
              >
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">{item.recipientName}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${svc.bg} ${svc.color}`}>
                      {svc.icon} {svc.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{item.address}</p>
                </div>
                <span className="text-xs font-bold text-primary whitespace-nowrap">+{item.price} CHF</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t border-border p-5 pb-8 space-y-3">
        <Button onClick={onAccept} className="w-full h-13 btn-gold font-bold text-base">
          Accepter la tournée
        </Button>
        <Button onClick={onShuffle} variant="ghost" className="w-full text-muted-foreground">
          <RefreshCw className="w-4 h-4 mr-2" />
          Voir une autre tournée
        </Button>
      </div>
    </div>
  );
};

export default TourProposalCard;
