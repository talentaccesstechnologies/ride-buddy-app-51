import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, MapPin, Clock, Truck, RefreshCw, CheckCircle2, 
  ScanBarcode, Camera, Navigation, Phone, ArrowRight, 
  Banknote, X, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import DriverBottomNav from '@/components/cabyDriver/DriverBottomNav';

/* ── Types ── */
type MissionStatus = 'pending' | 'navigating_pickup' | 'at_pickup' | 'scanned' | 'collected' | 'navigating_delivery' | 'at_delivery' | 'delivered';
type FlowPhase = 'proposal' | 'active' | 'completed';

interface Mission {
  id: string;
  pickupName: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  serviceType: 'health' | 'express' | 'laundry';
  barcode: string;
  price: number;
  status: MissionStatus;
  photoTaken: boolean;
}

/* ── Demo data ── */
const DEMO_MISSIONS: Mission[] = [
  {
    id: 'm1', pickupName: 'Laboratoire Unilabs', pickupAddress: 'Rue du Rhône 48, Genève',
    pickupLat: 46.2020, pickupLng: 6.1480,
    recipientName: 'Sophie M.', recipientPhone: '+41 78 *** ** 47',
    deliveryAddress: 'Av. de Champel 31, Genève', deliveryLat: 46.1930, deliveryLng: 6.1450,
    serviceType: 'health', barcode: 'CABY-HLX-001', price: 26, status: 'pending', photoTaken: false,
  },
  {
    id: 'm2', pickupName: 'Digitec Galaxus', pickupAddress: 'Route de Chêne 12, Genève',
    pickupLat: 46.1980, pickupLng: 6.1620,
    recipientName: 'Marc D.', recipientPhone: '+41 79 *** ** 52',
    deliveryAddress: 'Quai du Mont-Blanc 7, Genève', deliveryLat: 46.2100, deliveryLng: 6.1500,
    serviceType: 'express', barcode: 'CABY-EXP-002', price: 22, status: 'pending', photoTaken: false,
  },
  {
    id: 'm3', pickupName: 'Blanchisserie Prestige', pickupAddress: 'Rue de la Servette 45, Genève',
    pickupLat: 46.2130, pickupLng: 6.1310,
    recipientName: 'Laura K.', recipientPhone: '+41 76 *** ** 91',
    deliveryAddress: 'Rue de Lausanne 80, Genève', deliveryLat: 46.2150, deliveryLng: 6.1420,
    serviceType: 'laundry', barcode: 'CABY-LND-003', price: 24, status: 'pending', photoTaken: false,
  },
];

const TOTAL_PRICE = DEMO_MISSIONS.reduce((s, m) => s + m.price, 0);

const SVC_STYLE: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  health: { label: 'Health Logistix', icon: '🏥', color: 'text-red-500', bg: 'bg-red-500/15' },
  express: { label: 'Caby Express', icon: '📦', color: 'text-orange-500', bg: 'bg-orange-500/15' },
  laundry: { label: 'Caby Laundry', icon: '👕', color: 'text-blue-500', bg: 'bg-blue-500/15' },
};

const mapContainerStyle: React.CSSProperties = { width: '100%', height: '100%', colorScheme: 'light' };

const MARKER_COLORS: Record<string, string> = { health: '#EF4444', express: '#F97316', laundry: '#3B82F6' };

const createNumberedPin = (n: number, color: string, done: boolean): string => {
  const fill = done ? '#22C55E' : color;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46"><path d="M18 44C18 44 2 28 2 14C2 6.3 8.3 0 18 0S34 6.3 34 14C34 28 18 44 18 44Z" fill="${fill}" stroke="white" stroke-width="2"/><circle cx="18" cy="14" r="8" fill="white"/><text x="18" y="18" text-anchor="middle" font-size="12" font-weight="bold" fill="${fill}">${n}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

/* ══════════════════════════════════════════════════════ */
const DriverColisFlowPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoaded } = useGoogleMaps();

  const [phase, setPhase] = useState<FlowPhase>('proposal');
  const [missions, setMissions] = useState<Mission[]>(DEMO_MISSIONS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showScanner, setShowScanner] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [scanDone, setScanDone] = useState(false);

  const current = missions[currentIdx];
  const completedCount = missions.filter(m => m.status === 'delivered').length;
  const progress = (completedCount / missions.length) * 100;

  const updateMission = useCallback((id: string, updates: Partial<Mission>) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  /* ── Handlers ── */
  const acceptTour = () => {
    updateMission(missions[0].id, { status: 'navigating_pickup' });
    setPhase('active');
    toast.success('Tournée acceptée !', { description: `${missions.length} missions · ${TOTAL_PRICE} CHF` });
  };

  const arrivedAtPickup = () => {
    updateMission(current.id, { status: 'at_pickup' });
    toast.info(`Arrivé chez ${current.pickupName}`);
  };

  const simulateScan = () => {
    setScanDone(true);
    setTimeout(() => {
      setShowScanner(false);
      setScanDone(false);
      updateMission(current.id, { status: 'scanned' });
      toast.success(`Colis ${current.barcode} scanné ✓`);
    }, 1200);
  };

  const confirmPickup = () => {
    updateMission(current.id, { status: 'navigating_delivery' });
    toast.info(`En route vers ${current.recipientName}`);
  };

  const arrivedAtDelivery = () => {
    updateMission(current.id, { status: 'at_delivery' });
    toast.info(`Arrivé à ${current.deliveryAddress}`);
  };

  const simulatePhoto = () => {
    setShowPhoto(false);
    updateMission(current.id, { photoTaken: true });
    toast.success('Photo de livraison enregistrée ✓');
  };

  const confirmDelivery = () => {
    updateMission(current.id, { status: 'delivered' });
    const newCompleted = completedCount + 1;
    
    if (newCompleted >= missions.length) {
      toast.success('Tournée complétée ! 🎉');
      setPhase('completed');
    } else {
      toast.success(`Mission ${newCompleted}/${missions.length} complétée · +${current.price} CHF`, {
        description: `Prochaine : Point ${currentIdx + 2}`,
      });
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      updateMission(missions[nextIdx].id, { status: 'navigating_pickup' });
    }
  };

  const finishTour = () => navigate('/caby/driver/dashboard');

  /* ═══════════════════════════════════════════════════════ */
  /* PHASE 1: PROPOSAL                                       */
  /* ═══════════════════════════════════════════════════════ */
  if (phase === 'proposal') {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-20">
        <div className="px-5 pt-14 pb-3">
          <button onClick={() => navigate('/caby/driver/dashboard')} className="text-muted-foreground text-sm mb-3 flex items-center gap-1">
            ← Dashboard
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Tournée proposée</h1>
              <p className="text-xs text-muted-foreground">Rayon 5km · Optimisée par Caby</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mx-5 bg-card border border-border rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{missions.length} livraisons</span>
            </div>
            <span className="text-xl font-bold text-primary">+{TOTAL_PRICE} CHF</span>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />~1h30</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />8.2 km</span>
          </div>
        </motion.div>

        {/* Stops */}
        <div className="px-5 flex-1">
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Arrêts optimisés</h2>
          <div className="space-y-2">
            {missions.map((m, i) => {
              const svc = SVC_STYLE[m.serviceType];
              return (
                <motion.div key={m.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 bg-card border border-border rounded-xl p-3"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">{m.recipientName}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${svc.bg} ${svc.color}`}>{svc.icon} {svc.label}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{m.pickupAddress} → {m.deliveryAddress}</p>
                  </div>
                  <span className="text-xs font-bold text-primary">+{m.price} CHF</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="fixed bottom-16 inset-x-0 bg-background/95 backdrop-blur border-t border-border p-5 space-y-2">
          <Button onClick={acceptTour} className="w-full h-12 btn-gold font-bold text-base">
            Accepter la tournée
          </Button>
          <Button variant="ghost" className="w-full text-muted-foreground text-sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Voir une autre tournée
          </Button>
        </div>
        <DriverBottomNav />
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════ */
  /* PHASE 3: COMPLETED                                      */
  /* ═══════════════════════════════════════════════════════ */
  if (phase === 'completed') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <CheckCircle2 className="w-20 h-20 text-green-500" />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-2xl font-bold mt-4 mb-2">
          Tournée complétée 🎉
        </motion.h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="w-full bg-card border border-border rounded-2xl p-5 mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Total gagné</span>
            <span className="text-2xl font-bold text-primary">+{TOTAL_PRICE} CHF</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4" /> Temps</span>
            <span className="font-semibold">~1h30</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" /> Distance</span>
            <span className="font-semibold">8.2 km</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground"><Banknote className="w-4 h-4" /> Livraisons</span>
            <span className="font-semibold">{missions.length}/{missions.length}</span>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="w-full mt-6">
          <Button onClick={finishTour} className="w-full h-12 btn-gold font-bold text-base">
            Retour au Mode Ride <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3">Rush du soir détecté · 6 courses passagers en attente</p>
        </motion.div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════ */
  /* PHASE 2: ACTIVE TOUR                                    */
  /* ═══════════════════════════════════════════════════════ */
  const svc = SVC_STYLE[current.serviceType];
  const isPickupPhase = ['navigating_pickup', 'at_pickup', 'scanned'].includes(current.status);
  const targetLat = isPickupPhase ? current.pickupLat : current.deliveryLat;
  const targetLng = isPickupPhase ? current.pickupLng : current.deliveryLng;
  const targetLabel = isPickupPhase ? current.pickupName : current.recipientName;
  const targetAddress = isPickupPhase ? current.pickupAddress : current.deliveryAddress;

  // Build polyline for current mission
  const routePath = [
    { lat: current.pickupLat, lng: current.pickupLng },
    { lat: current.deliveryLat, lng: current.deliveryLng },
  ];

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 inset-x-0 z-40 bg-background/95 backdrop-blur px-5 pt-12 pb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground font-medium">{completedCount}/{missions.length} livrés</span>
          <span className="font-bold text-primary">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Map */}
      <div className="flex-1 mt-20" style={{ colorScheme: 'light' }}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={{ lat: targetLat, lng: targetLng }}
            zoom={14}
            options={{
              disableDefaultUI: true,
              zoomControl: false,
              gestureHandling: 'greedy',
              styles: [
                { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
                { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
              ],
            }}
          >
            {/* All mission markers */}
            {missions.map((m, i) => (
              <React.Fragment key={m.id}>
                <Marker
                  position={{ lat: m.pickupLat, lng: m.pickupLng }}
                  icon={{
                    url: createNumberedPin(i + 1, MARKER_COLORS[m.serviceType], m.status === 'delivered'),
                    scaledSize: new google.maps.Size(36, 46),
                    anchor: new google.maps.Point(18, 46),
                  }}
                  opacity={m.status === 'delivered' ? 0.4 : 1}
                />
                <Marker
                  position={{ lat: m.deliveryLat, lng: m.deliveryLng }}
                  icon={{
                    url: createNumberedPin(i + 1, '#22C55E', m.status === 'delivered'),
                    scaledSize: new google.maps.Size(30, 40),
                    anchor: new google.maps.Point(15, 40),
                  }}
                  opacity={m.status === 'delivered' ? 0.4 : 0.7}
                />
              </React.Fragment>
            ))}

            {/* Route line for current mission */}
            <Polyline
              path={routePath}
              options={{ strokeColor: MARKER_COLORS[current.serviceType], strokeWeight: 4, strokeOpacity: 0.7 }}
            />
          </GoogleMap>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Bottom sheet */}
      <div className="bg-card border-t border-border rounded-t-3xl p-5 pb-20 max-h-[45vh] overflow-auto">
        {/* Current point header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
            {currentIdx + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{targetLabel}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${svc.bg} ${svc.color}`}>
                {svc.icon} {svc.label}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">{targetAddress}</p>
          </div>
          <span className="text-xs font-bold text-primary">+{current.price} CHF</span>
        </div>

        {/* Status-specific content */}
        <AnimatePresence mode="wait">
          {/* NAVIGATING TO PICKUP */}
          {current.status === 'navigating_pickup' && (
            <motion.div key="nav-pickup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Collecte chez {current.pickupName} · {current.barcode}
              </p>
              <Button className="w-full h-11 btn-gold font-bold" onClick={arrivedAtPickup}>
                <Navigation className="w-4 h-4 mr-2" /> Je suis arrivé
              </Button>
            </motion.div>
          )}

          {/* AT PICKUP - Need to scan */}
          {current.status === 'at_pickup' && (
            <motion.div key="at-pickup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-xs font-semibold mb-1">Instructions de collecte</p>
                <p className="text-[11px] text-muted-foreground">{current.pickupName}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Colis : {current.barcode}</p>
              </div>
              <Button className="w-full h-11 btn-gold font-bold" onClick={() => setShowScanner(true)}>
                <ScanBarcode className="w-4 h-4 mr-2" /> Scanner le colis
              </Button>
            </motion.div>
          )}

          {/* SCANNED - Confirm pickup */}
          {current.status === 'scanned' && (
            <motion.div key="scanned" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-semibold">Colis {current.barcode} scanné ✓</span>
              </div>
              <Button className="w-full h-11 btn-gold font-bold" onClick={confirmPickup}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Colis récupéré · Partir
              </Button>
            </motion.div>
          )}

          {/* NAVIGATING TO DELIVERY */}
          {current.status === 'navigating_delivery' && (
            <motion.div key="nav-delivery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Livraison · {current.recipientName} · {current.recipientPhone}
              </p>
              <div className="flex gap-2">
                <Button className="flex-1 h-11 btn-gold font-bold" onClick={arrivedAtDelivery}>
                  <Navigation className="w-4 h-4 mr-2" /> Je suis arrivé
                </Button>
                <Button variant="outline" size="icon" className="h-11 w-11">
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* AT DELIVERY */}
          {current.status === 'at_delivery' && (
            <motion.div key="at-delivery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-xs font-semibold mb-1">Livraison à {current.recipientName}</p>
                <p className="text-[11px] text-muted-foreground">{current.deliveryAddress}</p>
              </div>
              {!current.photoTaken ? (
                <Button className="w-full h-11 btn-gold font-bold" onClick={() => setShowPhoto(true)}>
                  <Camera className="w-4 h-4 mr-2" /> Photo de confirmation
                </Button>
              ) : (
                <Button className="w-full h-11 btn-gold font-bold" onClick={confirmDelivery}>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Livraison effectuée ✓
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mini progress dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {missions.map((m, i) => (
            <div key={m.id} className={`w-2.5 h-2.5 rounded-full transition-all ${
              m.status === 'delivered' ? 'bg-green-500' :
              i === currentIdx ? 'bg-primary w-6' :
              'bg-muted-foreground/20'
            }`} />
          ))}
        </div>
      </div>

      <DriverBottomNav />

      {/* ── Scanner Overlay ── */}
      <AnimatePresence>
        {showScanner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 pt-14">
              <div>
                <h2 className="text-white font-bold text-lg">Scanner collecte</h2>
                <p className="text-white/60 text-xs">{current.barcode}</p>
              </div>
              <button onClick={() => setShowScanner(false)} className="text-white/80"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              {scanDone ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-3">
                  <CheckCircle2 className="w-20 h-20 text-green-500" />
                  <span className="text-white font-bold text-lg">Colis scanné ✓</span>
                </motion.div>
              ) : (
                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}
                  className="w-64 h-64 border-2 border-primary rounded-2xl flex items-center justify-center"
                >
                  <ScanBarcode className="w-12 h-12 text-primary/50" />
                </motion.div>
              )}
            </div>
            {!scanDone && (
              <div className="p-6 pb-10">
                <Button onClick={simulateScan} className="w-full h-12 btn-gold font-bold">
                  <ScanBarcode className="w-5 h-5 mr-2" /> Simuler le scan
                </Button>
                <p className="text-center text-xs text-white/40 mt-2">Pointez la caméra vers le QR code du colis</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Photo Overlay ── */}
      <AnimatePresence>
        {showPhoto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-end">
            <div className="w-full bg-card rounded-t-3xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-lg">Photo de livraison</h2>
                <button onClick={() => setShowPhoto(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Photographiez le colis déposé comme preuve de livraison.</p>
              <div className="w-full h-48 bg-muted rounded-xl flex items-center justify-center mb-4">
                <Camera className="w-12 h-12 text-muted-foreground" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12" onClick={() => setShowPhoto(false)}>Annuler</Button>
                <Button onClick={simulatePhoto} className="flex-1 h-12 btn-gold font-bold">
                  <Camera className="w-5 h-5 mr-2" /> Simuler photo
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DriverColisFlowPage;
