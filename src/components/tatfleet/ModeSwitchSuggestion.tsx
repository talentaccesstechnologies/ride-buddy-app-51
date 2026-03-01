import React from 'react';
import { motion } from 'framer-motion';
import { Package, Car, X } from 'lucide-react';
import type { DriverMode } from '@/hooks/useDriverMode';

interface Props {
  targetMode: DriverMode;
  message: string;
  detail: string;
  onAccept: () => void;
  onDismiss: () => void;
}

const ModeSwitchSuggestion: React.FC<Props> = ({ targetMode, message, detail, onAccept, onDismiss }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25 }}
      className="fixed bottom-24 left-4 right-4 z-50"
    >
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-4">
        <button onClick={onDismiss} className="absolute top-3 right-3 p-1 rounded-full hover:bg-secondary">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            targetMode === 'colis'
              ? 'bg-[hsl(var(--caby-gold))]/20 text-[hsl(var(--caby-gold))]'
              : 'bg-[hsl(var(--caby-blue))]/20 text-[hsl(var(--caby-blue))]'
          }`}>
            {targetMode === 'colis' ? <Package className="w-5 h-5" /> : <Car className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-bold text-foreground">{message}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={onDismiss}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground active:scale-[0.97] transition-transform"
          >
            Plus tard
          </button>
          <button
            onClick={onAccept}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold active:scale-[0.97] transition-transform ${
              targetMode === 'colis'
                ? 'bg-[hsl(var(--caby-gold))] text-black'
                : 'bg-primary text-primary-foreground'
            }`}
          >
            {targetMode === 'colis' ? 'Passer en Colis' : 'Passer en Ride'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ModeSwitchSuggestion;
