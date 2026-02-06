import React, { useState } from 'react';
import { X, ArrowRightLeft, Shield } from 'lucide-react';
import { RadarCourse } from '@/types/radar.types';
import { APP_CONFIG } from '@/config/app.config';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TransferModalProps {
  course: RadarCourse;
  driverName: string;
  onConfirm: (courseId: string, notes: string) => void;
  onClose: () => void;
}

const TransferModal: React.FC<TransferModalProps> = ({
  course,
  driverName,
  onConfirm,
  onClose,
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nettingAmount = course.estimatedPrice * APP_CONFIG.NETTING_RATE;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await onConfirm(course.id, notes);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70">
      <div className="w-full max-w-lg bg-caby-dark rounded-t-3xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-caby-border">
          <h2 className="text-lg font-display font-bold text-white">
            Transférer au Club Privé TATFleet
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-caby-card">
            <X className="w-5 h-5 text-caby-muted" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-caby-gold/20 rounded-full flex items-center justify-center">
              <ArrowRightLeft className="w-8 h-8 text-caby-gold" />
            </div>
          </div>

          <p className="text-center text-caby-muted text-sm">
            Vos collègues en ligne recevront cette course
          </p>

          {/* Course summary */}
          <div className="bg-caby-card rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-caby-muted">De</span>
              <span className="text-sm text-white font-medium truncate max-w-[200px]">
                {course.pickupAddress}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-caby-muted">À</span>
              <span className="text-sm text-white font-medium truncate max-w-[200px]">
                {course.dropoffAddress}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-caby-border pt-3">
              <span className="text-sm text-caby-muted">Prix estimé</span>
              <span className="text-lg font-bold text-white">
                {course.estimatedPrice.toFixed(0)} {APP_CONFIG.DEFAULT_CURRENCY}
              </span>
            </div>
          </div>

          {/* Commission info */}
          <div className="bg-caby-gold/10 border border-caby-gold/30 rounded-2xl p-4">
            <p className="text-sm text-caby-gold font-medium mb-1">
              Commission si un collègue accepte
            </p>
            <p className="text-2xl font-bold text-caby-gold">
              +{nettingAmount.toFixed(0)} {APP_CONFIG.DEFAULT_CURRENCY}
            </p>
            <p className="text-xs text-caby-muted mt-1">
              ({(APP_CONFIG.NETTING_RATE * 100).toFixed(0)}% de la course)
            </p>
          </div>

          {/* Notes field */}
          <div>
            <label className="text-sm text-caby-muted mb-2 block">
              Note pour vos collègues (optionnel)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Client régulier, ponctuel..."
              className="bg-caby-card border-caby-border text-white placeholder:text-caby-muted/50 rounded-xl"
              rows={2}
            />
          </div>

          {/* Firewall warning */}
          <div className="bg-caby-red/10 border border-caby-red/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-caby-purple" />
              <span className="text-sm font-medium text-caby-purple">Protection Client Activée</span>
            </div>
            <p className="text-xs text-caby-muted">
              Le chauffeur qui acceptera ne pourra pas voir les coordonnées de votre client.
              Le nom affiché sera : "<span className="text-white">Client de {driverName}</span>"
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="w-full btn-gold py-4 rounded-2xl font-bold"
            >
              {isSubmitting ? 'Transfert en cours...' : 'Confirmer le transfert'}
            </Button>
            <button
              onClick={onClose}
              className="w-full text-caby-muted text-sm py-2 hover:text-white transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;
