import React, { useRef, useState } from 'react';
import { X, ScanBarcode, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  mode: 'pickup' | 'delivery';
  expectedBarcode: string;
  onSuccess: () => void;
  onClose: () => void;
}

const ColisScanner: React.FC<Props> = ({ mode, expectedBarcode, onSuccess, onClose }) => {
  const [scanned, setScanned] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const simulateScan = () => {
    setScanned(true);
    setTimeout(() => {
      onSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 pt-14">
        <div>
          <h2 className="text-white font-bold text-lg">
            {mode === 'pickup' ? 'Scanner collecte' : 'Scanner livraison'}
          </h2>
          <p className="text-white/60 text-xs">{expectedBarcode}</p>
        </div>
        <button onClick={onClose} className="text-white/80">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence>
            {scanned ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <CheckCircle2 className="w-20 h-20 text-green-500" />
                <span className="text-white font-bold text-lg">Colis scanné ✓</span>
              </motion.div>
            ) : (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-64 h-64 border-2 border-primary rounded-2xl flex items-center justify-center"
              >
                <ScanBarcode className="w-12 h-12 text-primary/50" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {!scanned && (
        <div className="p-6 pb-10">
          <Button onClick={simulateScan} className="w-full h-12 btn-gold font-bold">
            <ScanBarcode className="w-5 h-5 mr-2" />
            Simuler le scan
          </Button>
          <p className="text-center text-xs text-white/40 mt-2">
            Pointez la caméra vers le QR code du colis
          </p>
        </div>
      )}
    </div>
  );
};

export default ColisScanner;
