import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, MapPin, Banknote, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TourProposal } from './colisData';

interface Props {
  tour: TourProposal;
  onFinish: () => void;
}

const TourCompletedView: React.FC<Props> = ({ tour, onFinish }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="mb-6"
      >
        <CheckCircle2 className="w-20 h-20 text-green-500" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold mb-2"
      >
        Tournée complétée 🎉
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full bg-card border border-border rounded-2xl p-5 mt-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Total gagné</span>
          <span className="text-2xl font-bold text-primary">+{tour.totalPrice} CHF</span>
        </div>
        <div className="h-px bg-border" />
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" /> Temps total
          </span>
          <span className="font-semibold">{tour.estimatedDuration}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" /> Distance
          </span>
          <span className="font-semibold">{tour.totalDistance} km</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Banknote className="w-4 h-4" /> Livraisons
          </span>
          <span className="font-semibold">{tour.items.length}/{tour.items.length}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="w-full mt-8"
      >
        <Button onClick={onFinish} className="w-full h-13 btn-gold font-bold text-base">
          Retour au Mode Ride <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Rush du soir détecté · 6 courses passagers en attente
        </p>
      </motion.div>
    </div>
  );
};

export default TourCompletedView;
