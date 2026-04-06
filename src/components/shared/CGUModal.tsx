import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

const CGU_ACCEPTED_KEY = 'caby_cgu_accepted';

export function hasCGUAccepted(): boolean {
  return localStorage.getItem(CGU_ACCEPTED_KEY) === 'true';
}

interface CGUModalProps {
  isDriver?: boolean;
}

const CGUModal: React.FC<CGUModalProps> = ({ isDriver = false }) => {
  const [show, setShow] = useState(false);
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);

  useEffect(() => {
    if (!hasCGUAccepted()) setShow(true);
  }, []);

  const canAccept = isDriver ? check1 && check2 : check1;

  const handleAccept = () => {
    localStorage.setItem(CGU_ACCEPTED_KEY, 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 max-w-md w-full shadow-2xl border border-border"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[hsl(43,75%,52%)]/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[hsl(43,75%,52%)]" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Avant de commencer</h2>
            </div>

            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Caby est une plateforme de mise en relation entre particuliers pour le covoiturage.
              Les trajets proposés constituent du partage de frais au sens de la loi.
              En continuant, vous acceptez nos conditions générales d'utilisation.
            </p>

            <div className="space-y-4 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={check1}
                  onCheckedChange={(v) => setCheck1(v === true)}
                  className="mt-0.5"
                />
                <span className="text-sm text-foreground leading-snug">
                  Je comprends que Caby est une plateforme de covoiturage entre particuliers
                </span>
              </label>

              {isDriver && (
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={check2}
                    onCheckedChange={(v) => setCheck2(v === true)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-foreground leading-snug">
                    Je certifie que mon véhicule est assuré pour transporter des passagers
                  </span>
                </label>
              )}
            </div>

            <Button
              onClick={handleAccept}
              disabled={!canAccept}
              className="w-full bg-[hsl(43,75%,52%)] hover:bg-[hsl(43,75%,45%)] text-white font-semibold py-3 rounded-xl disabled:opacity-40"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Accepter et continuer
            </Button>

            <p className="text-[10px] text-muted-foreground text-center mt-3">
              En acceptant, vous adhérez aux CGU et à la politique de confidentialité Caby.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CGUModal;
