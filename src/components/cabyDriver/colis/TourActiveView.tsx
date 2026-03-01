import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Navigation, Phone, ScanBarcode, Camera, CheckCircle2, 
  Package, ChevronUp, ChevronDown, AlertTriangle, Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ColisItem, serviceLabel, statusLabel } from './colisData';
import ColisScanner from './ColisScanner';
import PhotoCapture from './PhotoCapture';
import SignaturePad from './SignaturePad';
import { toast } from 'sonner';

type PointPhase = 'navigating' | 'arrived_pickup' | 'arrived_delivery';

interface Props {
  items: ColisItem[];
  onUpdateItem: (id: string, updates: Partial<ColisItem>) => void;
  onTourComplete: () => void;
}

const TourActiveView: React.FC<Props> = ({ items, onUpdateItem, onTourComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pointPhase, setPointPhase] = useState<PointPhase>('navigating');
  const [isPickupDone, setIsPickupDone] = useState(false);
  const [showScanner, setShowScanner] = useState<'pickup' | 'delivery' | null>(null);
  const [showPhoto, setShowPhoto] = useState<'pickup' | 'delivery' | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [showAbsentMenu, setShowAbsentMenu] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(true);

  const current = items[currentIndex];
  const completed = items.filter(i => i.status === 'delivered' || i.status === 'failed' || i.status === 'returned').length;
  const progress = (completed / items.length) * 100;
  const svc = serviceLabel(current.serviceType);

  const handleArrived = () => {
    if (!isPickupDone) {
      setPointPhase('arrived_pickup');
    } else {
      setPointPhase('arrived_delivery');
    }
  };

  const handleScanSuccess = useCallback((mode: 'pickup' | 'delivery') => {
    setShowScanner(null);
    if (mode === 'pickup') {
      onUpdateItem(current.id, { scannedPickup: true, status: 'collected', collectedAt: Date.now() });
      toast.success(`Colis ${current.barcode} scanné ✓`, { description: 'Collecte confirmée' });
    } else {
      onUpdateItem(current.id, { scannedDelivery: true });
      toast.success(`Colis scanné à la livraison ✓`);
    }
  }, [current, onUpdateItem]);

  const handlePhotoCapture = (mode: 'pickup' | 'delivery') => {
    setShowPhoto(null);
    if (mode === 'pickup') {
      onUpdateItem(current.id, { photoPickup: true });
      toast.success('Photo de collecte enregistrée ✓');
    } else {
      onUpdateItem(current.id, { photoDelivery: true });
      toast.success('Photo de livraison enregistrée ✓');
    }
  };

  const handlePickupDone = () => {
    if (!current.scannedPickup) {
      toast.error('Scannez le colis avant de continuer');
      return;
    }
    if (!current.photoPickup) {
      toast.error('Prenez une photo du colis avant de partir');
      return;
    }
    onUpdateItem(current.id, { status: 'in_transit' });
    setIsPickupDone(true);
    setPointPhase('navigating');
    toast.info(`En route vers ${current.recipientName}`);
  };

  const finalizeDelivery = () => {
    if (!current.scannedDelivery) {
      toast.error('Scannez le colis à la livraison');
      return;
    }
    if (!current.photoDelivery) {
      toast.error('Photo de confirmation obligatoire');
      return;
    }
    onUpdateItem(current.id, { status: 'delivered', deliveredAt: Date.now() });
    toast.success(`Mission ${currentIndex + 1}/${items.length} complétée · +${current.price} CHF`, {
      description: currentIndex < items.length - 1 ? `Prochaine : Point ${currentIndex + 2}` : 'Dernière livraison !',
    });
    goNext();
  };

  const handleAbsent = (action: 'drop' | 'return') => {
    setShowAbsentMenu(false);
    if (action === 'drop') {
      setShowPhoto('delivery');
    } else {
      onUpdateItem(current.id, { status: 'returned' });
      toast.info('Colis marqué comme retourné au dépôt');
      goNext();
    }
  };

  const goNext = () => {
    if (currentIndex + 1 >= items.length) {
      onTourComplete();
    } else {
      setCurrentIndex(prev => prev + 1);
      setPointPhase('navigating');
      setIsPickupDone(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 inset-x-0 z-40 bg-background/95 backdrop-blur px-5 pt-14 pb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground font-medium">{completed}/{items.length} livrés</span>
          <span className="font-bold text-primary">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Map placeholder */}
      <div className="flex-1 bg-muted mt-24 mb-0 flex items-center justify-center relative">
        <div className="text-center text-muted-foreground">
          <MapPin className="w-10 h-10 mx-auto mb-2 text-primary" />
          <p className="text-sm font-medium">Navigation active</p>
          <p className="text-xs">Point {currentIndex + 1}/{items.length}</p>
        </div>
        {/* Mini indicators */}
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          {items.map((item, i) => (
            <div key={item.id} className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${
              i === currentIndex ? 'bg-primary text-primary-foreground' :
              item.status === 'delivered' ? 'bg-green-500 text-white' :
              item.status === 'failed' || item.status === 'returned' ? 'bg-red-500 text-white' :
              'bg-muted-foreground/20 text-muted-foreground'
            }`}>{i + 1}</div>
          ))}
        </div>
      </div>

      {/* Bottom sheet */}
      <motion.div
        layout
        className="bg-card border-t border-border rounded-t-3xl p-5 pb-8"
      >
        <button
          onClick={() => setSheetExpanded(!sheetExpanded)}
          className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4 block"
        />

        {/* Current point info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
            {currentIndex + 1}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                {isPickupDone ? current.recipientName : current.partnerName}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${svc.bg} ${svc.color}`}>
                {svc.icon} {svc.label}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">{current.address}</p>
          </div>
          <span className="text-xs font-bold text-primary">+{current.price} CHF</span>
        </div>

        <AnimatePresence mode="wait">
          {/* NAVIGATING */}
          {pointPhase === 'navigating' && (
            <motion.div key="nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {isPickupDone
                  ? `Livraison · ${current.recipientName} · ${current.recipientPhone}`
                  : `Collecte · ${current.partnerName} · ${current.partnerContact}`}
              </p>
              <div className="flex gap-2">
                <Button className="flex-1 h-11 btn-gold font-bold" onClick={handleArrived}>
                  <Navigation className="w-4 h-4 mr-2" /> Je suis arrivé
                </Button>
                {isPickupDone && (
                  <Button variant="outline" size="icon" className="h-11 w-11">
                    <Phone className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* AT PICKUP */}
          {pointPhase === 'arrived_pickup' && sheetExpanded && (
            <motion.div key="pickup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-xs font-semibold mb-1">Instructions de collecte</p>
                <p className="text-[11px] text-muted-foreground">{current.partnerName} · {current.partnerContact}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Colis : {current.barcode} · {current.packageSize}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={current.scannedPickup ? 'secondary' : 'outline'}
                  className="flex-1 h-10 text-xs"
                  onClick={() => setShowScanner('pickup')}
                  disabled={current.scannedPickup}
                >
                  <ScanBarcode className="w-4 h-4 mr-1" />
                  {current.scannedPickup ? 'Scanné ✓' : 'Scanner'}
                </Button>
                <Button
                  variant={current.photoPickup ? 'secondary' : 'outline'}
                  className="flex-1 h-10 text-xs"
                  onClick={() => setShowPhoto('pickup')}
                  disabled={current.photoPickup}
                >
                  <Camera className="w-4 h-4 mr-1" />
                  {current.photoPickup ? 'Photo ✓' : 'Photo colis'}
                </Button>
              </div>

              <Button
                className="w-full h-11 btn-gold font-bold"
                onClick={handlePickupDone}
                disabled={!current.scannedPickup || !current.photoPickup}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Colis récupéré · Partir
              </Button>
            </motion.div>
          )}

          {/* AT DELIVERY */}
          {pointPhase === 'arrived_delivery' && sheetExpanded && (
            <motion.div key="delivery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-xs font-semibold mb-1">Livraison à {current.recipientName}</p>
                <p className="text-[11px] text-muted-foreground">{current.recipientPhone}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={current.scannedDelivery ? 'secondary' : 'outline'}
                  className="flex-1 h-10 text-xs"
                  onClick={() => setShowScanner('delivery')}
                  disabled={current.scannedDelivery}
                >
                  <ScanBarcode className="w-4 h-4 mr-1" />
                  {current.scannedDelivery ? 'Scanné ✓' : 'Scanner'}
                </Button>
                <Button
                  variant={current.photoDelivery ? 'secondary' : 'outline'}
                  className="flex-1 h-10 text-xs"
                  onClick={() => setShowPhoto('delivery')}
                  disabled={current.photoDelivery}
                >
                  <Camera className="w-4 h-4 mr-1" />
                  {current.photoDelivery ? 'Photo ✓' : 'Photo PoD'}
                </Button>
              </div>

              {!showAbsentMenu ? (
                <div className="flex gap-2">
                  <Button
                    className="flex-1 h-11 btn-gold font-bold"
                    onClick={() => setShowSignature(true)}
                    disabled={!current.scannedDelivery || !current.photoDelivery}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Livraison effectuée ✓
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                    onClick={() => setShowAbsentMenu(true)}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-semibold">Personne à domicile ?</p>
                  <Button variant="outline" className="w-full h-10 text-xs justify-start" onClick={() => handleAbsent('drop')}>
                    <Home className="w-4 h-4 mr-2" /> Déposer en lieu sûr (photo requise)
                  </Button>
                  <Button variant="outline" className="w-full h-10 text-xs justify-start text-destructive" onClick={() => handleAbsent('return')}>
                    <Package className="w-4 h-4 mr-2" /> Retourner au dépôt
                  </Button>
                  <Button variant="ghost" className="w-full text-xs" onClick={() => setShowAbsentMenu(false)}>Annuler</Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Scanner overlay */}
      {showScanner && (
        <ColisScanner
          mode={showScanner}
          expectedBarcode={current.barcode}
          onSuccess={() => handleScanSuccess(showScanner)}
          onClose={() => setShowScanner(null)}
        />
      )}

      {/* Photo overlay */}
      {showPhoto && (
        <PhotoCapture
          title={showPhoto === 'pickup' ? 'Photo du colis' : 'Photo de livraison'}
          description={showPhoto === 'pickup' ? 'Photographiez le colis avant de partir.' : 'Photographiez le colis déposé comme preuve de livraison.'}
          onCapture={() => handlePhotoCapture(showPhoto)}
          onClose={() => setShowPhoto(null)}
        />
      )}

      {/* Signature overlay */}
      {showSignature && (
        <SignaturePad
          onSign={() => {
            setShowSignature(false);
            onUpdateItem(current.id, { signature: true });
            finalizeDelivery();
          }}
          onSkip={() => {
            setShowSignature(false);
            finalizeDelivery();
          }}
          onClose={() => setShowSignature(false)}
        />
      )}
    </div>
  );
};

export default TourActiveView;
