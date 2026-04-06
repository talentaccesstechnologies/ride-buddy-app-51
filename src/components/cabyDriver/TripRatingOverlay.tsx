import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DRIVER_RATING_CRITERIA,
  CLIENT_RATING_CRITERIA,
  RATING_BADGES,
} from '@/utils/incidentProtocol';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TripRatingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  raterRole: 'client' | 'driver';
  rateeName: string;
  rateeAvatar?: string;
  rateeId: string;
  tripId: string;
  tripType?: string;
  tripSummary: string;
  onSubmit?: (data: {
    overallScore: number;
    criteria: Record<string, number>;
    comment: string;
    badges: string[];
  }) => void;
}

const TripRatingOverlay: React.FC<TripRatingOverlayProps> = ({
  isOpen, onClose, raterRole, rateeName, rateeAvatar, rateeId, tripId, tripType = 'ride', tripSummary, onSubmit,
}) => {
  const [overallScore, setOverallScore] = useState(0);
  const [criteria, setCriteria] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revealed, setRevealed] = useState<{ myScore: number; theirScore: number } | null>(null);

  const criteriaList = raterRole === 'client' ? DRIVER_RATING_CRITERIA : CLIENT_RATING_CRITERIA;

  const toggleBadge = (id: string) => {
    setSelectedBadges(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (overallScore === 0) {
      toast.error('Veuillez donner une note globale');
      return;
    }
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Non connecté'); setIsSubmitting(false); return; }

      // Insert rating
      const { error } = await supabase.from('trip_ratings').insert({
        trip_id: tripId,
        trip_type: tripType,
        rater_id: user.id,
        ratee_id: rateeId,
        rater_role: raterRole,
        overall_score: overallScore,
        criteria_scores: criteria,
        comment: comment || null,
        badges: selectedBadges,
        is_revealed: false,
      });

      if (error) throw error;

      // Check if the other party already rated → reveal both
      const otherRole = raterRole === 'client' ? 'driver' : 'client';
      const { data: otherRating } = await supabase
        .from('trip_ratings')
        .select('overall_score')
        .eq('trip_id', tripId)
        .eq('rater_role', otherRole)
        .maybeSingle();

      if (otherRating) {
        // Both parties rated → reveal
        await supabase
          .from('trip_ratings')
          .update({ is_revealed: true })
          .eq('trip_id', tripId);

        setRevealed({ myScore: overallScore, theirScore: otherRating.overall_score });

        toast.success('Notes révélées ! 🎉', {
          description: `Vous : ${overallScore}⭐ · ${rateeName} : ${otherRating.overall_score}⭐`,
        });
      } else {
        toast.success('Merci pour votre évaluation !', {
          description: 'Les notes seront révélées quand les deux parties auront noté.',
        });
      }

      // If low rating from driver → auto-flag
      if (raterRole === 'driver' && overallScore < 3) {
        await supabase.from('incidents').insert({
          incident_type: 'client_behaviour',
          reported_by: user.id,
          client_id: rateeId,
          description: `Note faible automatique (${overallScore}/5) — ${comment || 'Pas de commentaire'}`,
          status: 'open',
          trip_id: tripId,
        });
      }

      onSubmit?.({ overallScore, criteria, comment, badges: selectedBadges });

      if (!otherRating) {
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      console.error('Rating error:', err);
      toast.error("Erreur lors de l'envoi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRow = ({ value, onChange, size = 'lg' }: { value: number; onChange: (v: number) => void; size?: 'sm' | 'lg' }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} onClick={() => onChange(s)}>
          <Star
            className={`${size === 'lg' ? 'w-8 h-8' : 'w-5 h-5'} transition-colors ${
              s <= value ? 'fill-primary text-primary' : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end justify-center"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-full max-w-[390px] bg-card rounded-t-3xl max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-bold">Évaluer {raterRole === 'client' ? 'le chauffeur' : 'le client'}</h2>
              <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            {/* Reveal screen */}
            {revealed ? (
              <div className="p-6 text-center space-y-6">
                <div className="text-4xl">🎉</div>
                <h3 className="text-lg font-bold">Notes révélées !</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">Votre note</p>
                    <p className="text-3xl font-bold">{revealed.myScore}<span className="text-lg">⭐</span></p>
                  </div>
                  <div className="p-4 rounded-2xl bg-background border border-border">
                    <p className="text-xs text-muted-foreground mb-1">{rateeName}</p>
                    <p className="text-3xl font-bold">{revealed.theirScore}<span className="text-lg">⭐</span></p>
                  </div>
                </div>
                <Button className="w-full" onClick={onClose}>Fermer</Button>
              </div>
            ) : (
              <div className="p-4 space-y-5">
                {/* Profile */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
                    {rateeAvatar && <img src={rateeAvatar} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <p className="font-bold">{rateeName}</p>
                    <p className="text-xs text-muted-foreground">{tripSummary}</p>
                  </div>
                </div>

                {/* Overall score */}
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">Note globale</p>
                  <StarRow value={overallScore} onChange={setOverallScore} size="lg" />
                  {overallScore > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {overallScore <= 2 ? '😞 Décevant' : overallScore <= 3 ? '😐 Correct' : overallScore <= 4 ? '😊 Bien' : '🤩 Excellent !'}
                    </p>
                  )}
                </div>

                {/* Criteria */}
                <div className="space-y-3">
                  <p className="text-sm font-medium">Détails</p>
                  {criteriaList.map(c => (
                    <div key={c.key} className="flex items-center justify-between">
                      <span className="text-sm">
                        <span className="mr-1.5">{c.emoji}</span>{c.label}
                      </span>
                      <StarRow
                        value={criteria[c.key] || 0}
                        onChange={v => setCriteria(prev => ({ ...prev, [c.key]: v }))}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>

                {/* Badges */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Badge rapide</p>
                  <div className="flex flex-wrap gap-2">
                    {RATING_BADGES.positive.map(b => (
                      <button
                        key={b.id}
                        onClick={() => toggleBadge(b.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          selectedBadges.includes(b.id)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground'
                        }`}
                      >
                        {b.emoji} {b.label}
                      </button>
                    ))}
                    {RATING_BADGES.negative.map(b => (
                      <button
                        key={b.id}
                        onClick={() => toggleBadge(b.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          selectedBadges.includes(b.id)
                            ? 'border-destructive bg-destructive/10 text-destructive'
                            : 'border-border bg-background text-muted-foreground'
                        }`}
                      >
                        {b.emoji} {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <p className="text-sm font-medium mb-1">Commentaire (optionnel)</p>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Partagez votre expérience..."
                    maxLength={200}
                    className="w-full h-16 rounded-lg bg-background border border-border p-3 text-sm resize-none focus:outline-none focus:border-primary/50"
                  />
                  <p className="text-xs text-muted-foreground text-right">{comment.length}/200</p>
                </div>

                {/* Low rating warning */}
                {overallScore > 0 && overallScore < 3 && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30">
                    <p className="text-xs text-destructive font-medium">
                      ⚠️ Note inférieure à 3 — {raterRole === 'driver' ? 'un signalement sera créé automatiquement' : 'un formulaire d\'incident sera ouvert automatiquement'}
                    </p>
                  </div>
                )}

                {/* Submit */}
                <Button
                  className="w-full bg-primary text-primary-foreground font-bold h-12 rounded-xl"
                  onClick={handleSubmit}
                  disabled={isSubmitting || overallScore === 0}
                >
                  {isSubmitting ? (
                    <span className="animate-spin mr-2">⏳</span>
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Soumettre mon évaluation
                </Button>

                <p className="text-xs text-center text-muted-foreground pb-2">
                  🔒 Les notes sont révélées simultanément · Délai max : 48h
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TripRatingOverlay;
