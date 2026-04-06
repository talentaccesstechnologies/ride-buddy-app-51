import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INCIDENT_PROTOCOLS, BEHAVIOUR_CATEGORIES, type IncidentType } from '@/utils/incidentProtocol';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SOSButtonProps {
  onIncidentCreated?: (type: IncidentType, description: string) => void;
}

const SOSButton: React.FC<SOSButtonProps> = ({ onIncidentCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [behaviourCategory, setBehaviourCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) return;
    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vous devez être connecté');
        setIsSubmitting(false);
        return;
      }

      // Capture geolocation
      let lat: number | null = null;
      let lng: number | null = null;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {
        // Geolocation unavailable — continue without
      }

      const descText = selectedType === 'client_behaviour' && behaviourCategory
        ? `${BEHAVIOUR_CATEGORIES.find(c => c.id === behaviourCategory)?.label}: ${description}`
        : description || INCIDENT_PROTOCOLS[selectedType].label;

      // Insert into database
      const { error } = await supabase.from('incidents').insert({
        incident_type: selectedType,
        reported_by: user.id,
        driver_id: user.id,
        description: descText,
        lat,
        lng,
        status: 'open',
      });

      if (error) throw error;

      const protocol = INCIDENT_PROTOCOLS[selectedType];

      // Auto-compensation for applicable incident types
      if (protocol.autoCompensation > 0 || protocol.voucherAmount > 0) {
        const compAmount = protocol.voucherAmount || protocol.autoCompensation;
        // Insert compensation for the reporting user (will be dispatched to affected passengers by backend)
        await supabase.from('incident_compensations').insert({
          user_id: user.id,
          amount: compAmount,
          compensation_type: protocol.voucherAmount > 0 ? 'voucher' : 'credit',
          description: `Compensation ${protocol.label}`,
        });
      }

      toast.success(`${protocol.emoji} Incident signalé`, {
        description: `Type: ${protocol.label} — Caby Operations notifié`,
      });

      onIncidentCreated?.(selectedType, descText);
      setIsOpen(false);
      setSelectedType(null);
      setBehaviourCategory(null);
      setDescription('');
    } catch (err: unknown) {
      console.error('Error creating incident:', err);
      toast.error('Erreur lors du signalement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* SOS FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-destructive flex items-center justify-center shadow-lg shadow-destructive/30"
      >
        <AlertTriangle className="w-6 h-6 text-white" />
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end justify-center"
            onClick={() => !selectedType && setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-[390px] bg-card rounded-t-3xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <h2 className="text-lg font-bold">Signaler un incident</h2>
                </div>
                <button onClick={() => { setIsOpen(false); setSelectedType(null); }}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {!selectedType ? (
                /* Type selection */
                <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                  <p className="text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    Votre position sera capturée automatiquement
                  </p>
                  {(Object.values(INCIDENT_PROTOCOLS) as typeof INCIDENT_PROTOCOLS[IncidentType][]).map((protocol) => (
                    <button
                      key={protocol.type}
                      onClick={() => setSelectedType(protocol.type)}
                      className="w-full flex items-start gap-3 p-3 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors text-left"
                    >
                      <span className="text-xl mt-0.5">{protocol.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{protocol.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{protocol.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                /* Detail form */
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-background border border-border">
                    <span className="text-xl">{INCIDENT_PROTOCOLS[selectedType].emoji}</span>
                    <div>
                      <p className="font-semibold text-sm">{INCIDENT_PROTOCOLS[selectedType].label}</p>
                      <p className="text-xs text-muted-foreground">{INCIDENT_PROTOCOLS[selectedType].description}</p>
                    </div>
                  </div>

                  {/* Behaviour subcategories */}
                  {selectedType === 'client_behaviour' && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Catégorie</p>
                      <div className="grid grid-cols-2 gap-2">
                        {BEHAVIOUR_CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setBehaviourCategory(cat.id)}
                            className={`p-2 rounded-lg border text-xs text-left transition-colors ${
                              behaviourCategory === cat.id
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-background'
                            }`}
                          >
                            <span className="mr-1">{cat.emoji}</span> {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Description (optionnel)</p>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Décrivez la situation..."
                      className="w-full h-20 rounded-lg bg-background border border-border p-3 text-sm resize-none focus:outline-none focus:border-primary/50"
                      maxLength={500}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedType(null)}
                    >
                      Retour
                    </Button>
                    <Button
                      className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
                      onClick={handleSubmit}
                      disabled={isSubmitting || (selectedType === 'client_behaviour' && !behaviourCategory)}
                    >
                      {isSubmitting ? (
                        <span className="animate-spin mr-2">⏳</span>
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Envoyer
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SOSButton;
