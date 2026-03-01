import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, ScanBarcode, Camera, KeyRound, MapPin, CheckCircle2, Clock, Truck, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import DriverBottomNav from '@/components/cabyDriver/DriverBottomNav';
import { toast } from 'sonner';

// Demo batch data
const demoBatch = [
  { id: 'd1', barcode: 'PKG-2026-001', address: 'Rue du Rhône 48, Genève', recipient: 'Sophie M.', size: 'medium', status: 'pending' as const, pin: '3847' },
  { id: 'd2', barcode: 'PKG-2026-002', address: 'Route de Chêne 12, Genève', recipient: 'Marc D.', size: 'small', status: 'pending' as const, pin: '1952' },
  { id: 'd3', barcode: 'PKG-2026-003', address: 'Av. de Champel 31, Genève', recipient: 'Laura K.', size: 'large', status: 'pending' as const, pin: '6721' },
  { id: 'd4', barcode: 'PKG-2026-004', address: 'Quai du Mont-Blanc 7, Genève', recipient: 'Thomas B.', size: 'medium', status: 'pending' as const, pin: '4290' },
  { id: 'd5', barcode: 'PKG-2026-005', address: 'Rue de Lausanne 80, Genève', recipient: 'Amélie F.', size: 'small', status: 'pending' as const, pin: '8135' },
];

type DeliveryStatus = 'pending' | 'picked_up' | 'delivered';

interface DeliveryItem {
  id: string;
  barcode: string;
  address: string;
  recipient: string;
  size: string;
  status: DeliveryStatus;
  pin: string;
}

const DriverLogisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>(demoBatch);
  const [scanMode, setScanMode] = useState<'pickup' | 'delivery' | null>(null);
  const [scanTarget, setScanTarget] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const completed = deliveries.filter(d => d.status === 'delivered').length;
  const pickedUp = deliveries.filter(d => d.status === 'picked_up').length;
  const progress = (completed / deliveries.length) * 100;

  // Camera for barcode scanning
  const startScanner = async (deliveryId: string, mode: 'pickup' | 'delivery') => {
    setScanTarget(deliveryId);
    setScanMode(mode);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      toast.error('Impossible d\'accéder à la caméra');
      closeScan();
    }
  };

  const closeScan = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setScanMode(null);
    setScanTarget(null);
  };

  const simulateScan = () => {
    if (!scanTarget || !scanMode) return;
    const delivery = deliveries.find(d => d.id === scanTarget);
    if (!delivery) return;

    if (scanMode === 'pickup') {
      setDeliveries(prev => prev.map(d =>
        d.id === scanTarget ? { ...d, status: 'picked_up' as DeliveryStatus } : d
      ));
      toast.success(`Colis ${delivery.barcode} scanné ✓`, { description: 'Prise en charge confirmée' });
    } else {
      setDeliveries(prev => prev.map(d =>
        d.id === scanTarget ? { ...d, status: 'delivered' as DeliveryStatus } : d
      ));
      toast.success(`Colis ${delivery.barcode} livré ✓`, { description: `Remis à ${delivery.recipient}` });
    }
    closeScan();
  };

  const handlePinValidation = (deliveryId: string) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) return;

    if (pinInput === delivery.pin) {
      setDeliveries(prev => prev.map(d =>
        d.id === deliveryId ? { ...d, status: 'delivered' as DeliveryStatus } : d
      ));
      toast.success('Code PIN validé ✓', { description: `Livraison confirmée pour ${delivery.recipient}` });
      setShowPinModal(null);
      setPinInput('');
    } else {
      toast.error('Code PIN incorrect');
    }
  };

  const handlePhotoProof = (deliveryId: string) => {
    setDeliveries(prev => prev.map(d =>
      d.id === deliveryId ? { ...d, status: 'delivered' as DeliveryStatus } : d
    ));
    toast.success('Photo enregistrée ✓', { description: 'Preuve de livraison sauvegardée' });
    setShowPhotoModal(null);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const statusIcon = (status: DeliveryStatus) => {
    switch (status) {
      case 'delivered': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'picked_up': return <Truck className="w-5 h-5 text-primary" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const statusLabel = (status: DeliveryStatus) => {
    switch (status) {
      case 'delivered': return 'Livré';
      case 'picked_up': return 'En cours';
      default: return 'En attente';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <button onClick={() => navigate('/caby/driver/radar')} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Radar</span>
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mode Logistique</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
              Tournée · {deliveries.length} colis
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">{completed}/{deliveries.length} livrés</span>
            <span className="font-bold text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Delivery list */}
      <div className="px-5 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Tournée optimisée
        </h2>

        {deliveries.map((d, index) => (
          <div key={d.id} className={`bg-card border rounded-2xl p-4 transition-all ${
            d.status === 'delivered' ? 'border-green-500/30 opacity-60' : 'border-border'
          }`}>
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                {statusIcon(d.status)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm">{d.recipient}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    d.status === 'delivered' ? 'bg-green-500/15 text-green-500' :
                    d.status === 'picked_up' ? 'bg-primary/15 text-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {statusLabel(d.status)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {d.address}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 font-mono">{d.barcode} · {d.size}</p>

                {/* Actions */}
                {d.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs h-8"
                      onClick={() => startScanner(d.id, 'pickup')}
                    >
                      <ScanBarcode className="w-3.5 h-3.5 mr-1" />
                      Scanner prise en charge
                    </Button>
                  </div>
                )}

                {d.status === 'picked_up' && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs h-8"
                      onClick={() => setShowPinModal(d.id)}
                    >
                      <KeyRound className="w-3.5 h-3.5 mr-1" />
                      Code PIN
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs h-8"
                      onClick={() => setShowPhotoModal(d.id)}
                    >
                      <Camera className="w-3.5 h-3.5 mr-1" />
                      Photo PoD
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8"
                      onClick={() => startScanner(d.id, 'delivery')}
                    >
                      <ScanBarcode className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scanner overlay */}
      {scanMode && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-white font-bold">
              {scanMode === 'pickup' ? 'Scanner prise en charge' : 'Scanner livraison'}
            </h2>
            <button onClick={closeScan} className="text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center relative">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-primary rounded-2xl" />
            </div>
          </div>
          <div className="p-6">
            <Button onClick={simulateScan} className="w-full h-12 btn-gold font-bold">
              <ScanBarcode className="w-5 h-5 mr-2" />
              Simuler le scan
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-2">
              Pointez la caméra vers le code-barres du colis
            </p>
          </div>
        </div>
      )}

      {/* PIN modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-card rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Code PIN Client</h2>
              <button onClick={() => { setShowPinModal(null); setPinInput(''); }}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Demandez le code PIN au client pour confirmer la livraison.
            </p>
            <div className="flex gap-3 justify-center mb-6">
              {[0, 1, 2, 3].map(i => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={pinInput[i] || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val) {
                      const newPin = pinInput.split('');
                      newPin[i] = val;
                      setPinInput(newPin.join(''));
                      const next = e.target.nextElementSibling as HTMLInputElement;
                      if (next) next.focus();
                    }
                  }}
                  className="w-14 h-16 text-center text-2xl font-bold bg-muted border border-border rounded-xl focus:border-primary focus:outline-none"
                />
              ))}
            </div>
            <Button
              onClick={() => handlePinValidation(showPinModal)}
              disabled={pinInput.length < 4}
              className="w-full h-12 btn-gold font-bold"
            >
              Valider la livraison
            </Button>
          </div>
        </div>
      )}

      {/* Photo proof modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-card rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Photo de livraison</h2>
              <button onClick={() => setShowPhotoModal(null)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Prenez une photo du colis déposé devant la porte comme preuve de livraison.
            </p>
            <div className="w-full h-48 bg-muted rounded-xl flex items-center justify-center mb-4">
              <Camera className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setShowPhotoModal(null)}>
                Annuler
              </Button>
              <Button onClick={() => handlePhotoProof(showPhotoModal)} className="flex-1 h-12 btn-gold font-bold">
                <Camera className="w-5 h-5 mr-2" />
                Simuler photo
              </Button>
            </div>
          </div>
        </div>
      )}

      <DriverBottomNav />
    </div>
  );
};

export default DriverLogisticsPage;
