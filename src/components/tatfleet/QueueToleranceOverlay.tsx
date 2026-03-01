import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, XCircle } from 'lucide-react';
import type { ToleranceState, QueuedMission } from '@/hooks/useDriverMode';

interface Props {
  state: ToleranceState;
  mission: QueuedMission | null;
  onConfirm: () => void;
  onDismiss: () => void;
}

const QueueToleranceOverlay: React.FC<Props> = ({ state, mission, onConfirm, onDismiss }) => {
  if (state === 'expired') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-4 right-4 z-50"
      >
        <div className="bg-destructive/95 backdrop-blur-xl border border-destructive rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-destructive-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-destructive-foreground">Mission réattribuée</p>
            <p className="text-xs text-destructive-foreground/80">Nouvelle proposition dans 30 secondes</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (state === 'warn' && mission) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-4 right-4 z-50"
      >
        <div className="bg-[hsl(var(--caby-gold))]/95 backdrop-blur-xl border border-[hsl(var(--caby-gold))] rounded-2xl shadow-2xl px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-black flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-black">Confirmez-vous toujours cette mission ?</p>
              <p className="text-xs text-black/70 truncate">{mission.label} · {mission.price} CHF</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onDismiss}
              className="flex-1 py-2 rounded-xl border border-black/20 text-sm font-semibold text-black/80 active:scale-[0.97] transition-transform"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2 rounded-xl bg-black text-white text-sm font-bold active:scale-[0.97] transition-transform"
            >
              Confirmer
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (state === 'ok' && mission) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-4 right-4 z-50 pointer-events-none"
      >
        <div className="bg-[hsl(var(--caby-green))]/90 backdrop-blur-xl rounded-2xl shadow-lg px-4 py-2.5 flex items-center gap-2">
          <Clock className="w-4 h-4 text-white flex-shrink-0" />
          <p className="text-xs font-semibold text-white truncate">
            Prochaine : {mission.label} · {mission.price} CHF
          </p>
        </div>
      </motion.div>
    );
  }

  return null;
};

export default QueueToleranceOverlay;
